const PathApproximator = require('./PathApproximator');
const Vector2 = require('./Vector2');

class SliderPath
{

  constructor(controlPoints, expectedDistance = null)
  {
    /**
     * The control points of the path.
     */
    this.controlPoints = controlPoints.slice();

    /**
     * The user-set distance of the path. If non-null, <see cref="Distance"/> will match this value,
     * and the path will be shortened/lengthened to match this length.
     */
    this.expectedDistance = expectedDistance;
  }

  /**
   * The distance of the path after lengthening/shortening to account for <see cref="ExpectedDistance"/>.
   */
  get distance()
  {
    this._ensureValid();

    return this.cumulativeLength.length === 0 
      ? 0 : this.cumulativeLength[this.cumulativeLength.length - 1];
  }

  /**
   * The distance of the path prior to lengthening/shortening to account for <see cref="ExpectedDistance"/>.
   */
  get calculatedDistance()
  {
    this._ensureValid();

    return this.calculatedLength;
  }

  /**
   * Computes the slider path until a given progress that ranges from 0 (beginning of the slider)
   * to 1 (end of the slider) and stores the generated path in the given list.
   * @param path The list to be filled with the computed path.
   * @param p0 Start progress. Ranges from 0 (beginning of the slider) to 1 (end of the slider).
   * @param p1 End progress. Ranges from 0 (beginning of the slider) to 1 (end of the slider).
   */
  getPathToProgress(path, p0, p1)
  {
    this._ensureValid();

    let d0 = this._progressToDistance(p0);
    let d1 = this._progressToDistance(p1);

    let i = 0;

    while (i < this.calculatedPath.length && this.cumulativeLength[i++] < d0);

    path = [this._interpolateVertices(i, d0)];

    while (i < this.calculatedPath.length && this.cumulativeLength[i++] <= d1) {
      path.push(this.calculatedPath[i]);
    }

    path.push(this._interpolateVertices(i, d1));
  }

  /**
   * Computes the progress along the curve relative to how much of the hit object has been completed.
   * @param obj the curve.
   * @param progress where 0 is the start time of the hit object and 1 is the end time of the hit object.
   */
  progressAt(obj, progress)
  {
    let p = progress * obj.repeat % 1;

    return Math.trunc(progress * obj.repeat) % 2 ? 1 - p : p;
  }

  /**
   * Computes the position on the slider at a given progress that ranges from 0 (beginning of the path)
   * to 1 (end of the path).
   * @param progress Ranges from 0 (beginning of the path) to 1 (end of the path).
   */
  positionAt(progress)
  {
    this._ensureValid();

    let d = this._progressToDistance(progress);

    return this._interpolateVertices(this._indexOfDistance(d), d);
  }

  _ensureValid()
  {
    if (this._pathCache) {
      return;
    }

    this._calculatePath();
    this._calculateLength();

    this._pathCache = true;
  }

  _calculatePath()
  {
    this.calculatedPath = [];

    let controlPointsLength = this.controlPoints.length;

    if (controlPointsLength === 0) {
      return;
    }

    let vertices = [];

    for (let i = 0; i < controlPointsLength; i++) {
      vertices[i] = this.controlPoints[i].pos;
    }

    let start = 0;

    for (let i = 0; i < controlPointsLength; ++i) {
      if (!this.controlPoints[i].type && i < controlPointsLength - 1) {
        continue;
      }

      // The current vertex ends the segment
      let segmentVertices = vertices.slice(start, i + 1);
      let segmentType = this.controlPoints[start].type || 'L';

      for (let t of this._calculateSubPath(segmentVertices, segmentType)) {
        let last = this.calculatedPath[this.calculatedPath.length - 1];

        if (this.calculatedPath.length === 0 || !last.equals(t)) {
          this.calculatedPath.push(t);
        }
      }

      // Start the new segment at the current vertex
      start = i;
    }
  }

  _calculateSubPath(subControlPoints, type)
  {
    switch (type) {
      case 'L':
        return PathApproximator.approximateLinear(subControlPoints);

      case 'P':
        if (subControlPoints.length !== 3) {
          break;
        }

        const subpath = PathApproximator.approximateCircularArc(subControlPoints);

        // If for some reason a circular arc could not be fit to the 3 given points, 
        // fall back to a numerically stable bezier approximation.
        if (subpath.length === 0) {
          break;
        }

        return subpath;

      case 'C':
        return PathApproximator.approximateCatmull(subControlPoints);
    }

    return PathApproximator.approximateBezier(subControlPoints);
  }

  _calculateLength()
  {
    this.calculatedLength = 0;
    this.cumulativeLength = [0];

    for (let i = 0, len = this.calculatedPath.length - 1; i < len; i++) {
      let diff = this.calculatedPath[i + 1].subtract(this.calculatedPath[i]);

      this.calculatedLength += diff.length();
      this.cumulativeLength.push(this.calculatedLength);
    }

    if (parseFloat(this.expectedDistance) && this.calculatedLength != this.expectedDistance) {
      // The last length is always incorrect
      this.cumulativeLength.pop();

      let pathEndIndex = this.calculatedPath.length - 1;

      if (this.calculatedLength > this.expectedDistance) {
        // The path will be shortened further, in which case we should trim any more unnecessary lengths and their associated path segments
        while (this.cumulativeLength.length > 0 && 
          this.cumulativeLength[this.cumulativeLength.length - 1] >= this.expectedDistance) {
          this.cumulativeLength.pop();
          this.calculatedPath.splice(pathEndIndex--, 1);
        }
      }

      if (pathEndIndex <= 0) {
        // The expected distance is negative or zero
        // TODO: Perhaps negative path lengths should be disallowed altogether
        this.cumulativeLength.push(0);
        return;
      }

      // The direction of the segment to shorten or lengthen
      let dir = this.calculatedPath[pathEndIndex]
        .subtract(this.calculatedPath[pathEndIndex - 1]).normalize();

      this.calculatedPath[pathEndIndex] = this.calculatedPath[pathEndIndex - 1]
        .add(dir.scale(Math.fround(this.expectedDistance - this.cumulativeLength[this.cumulativeLength.length - 1])));

      this.cumulativeLength.push(this.expectedDistance);
    }
  }

  _indexOfDistance(d)
  {
    let i = this._binarySearch(this.cumulativeLength, d);

    if (i < 0) i = ~i;

    return i;
  }

  _binarySearch(arr, x)
  {
    let start = 0, mid, end = arr.length - 1;

    // Iterate while start not meets end 
    while (start <= end) {

      // Find the mid index 
      mid = Math.floor((start + end) / 2);

      if (arr[mid] > x) {
        end = mid - 1;
      }
      else if (arr[mid] <= x) {
        start = mid + 1;
      }
    }

    return Math.floor((start + end) / 2);
  }

  _progressToDistance(progress)
  {
    return Math.min(Math.max(progress, 0), 1) * this.distance;
  }

  _interpolateVertices(i, d)
  {
    if (this.calculatedPath.length === 0)
      return new Vector2(0, 0);

    if (i <= 0) {
      return this.calculatedPath[0];
    }

    if (i >= this.calculatedPath.length) {
      return this.calculatedPath[this.calculatedLength.length - 1];
    }

    let p0 = this.calculatedPath[i - 1];
    let p1 = this.calculatedPath[i];

    let d0 = this.cumulativeLength[i - 1];
    let d1 = this.cumulativeLength[i];

    // Avoid division by and almost-zero number in case two points are extremely close to each other.
    if (Math.abs(d0 - d1) < 0.001) {
      return p0;
    }

    let w = (d - d0) / (d1 - d0);

    return p0.add(p1.subtract(p0).scale(Math.fround(w)));
  }
}

class PathControlPoint
{
  constructor(position, type)
  {
    this.pos = position;
    this.type = type;
  }
}

module.exports = {SliderPath, PathControlPoint};

