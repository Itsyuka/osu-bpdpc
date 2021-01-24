const Vector2 = require('./Vector2');

const bezier_tolerance = Math.fround(0.25);
const circular_arc_tolerance = Math.fround(0.1);

/**
 * The amount of pieces to calculate for each control point quadruplet.
 */
const catmull_detail = 50;

/**
 * Helper methods to approximate a path by interpolating a sequence of control points.
 */
class PathApproximator
{
  /**
   * Creates a piecewise-linear approximation of a bezier curve, by adaptively repeatedly subdividing
   * the control points until their approximation error vanishes below a given threshold.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateBezier(controlPoints)
  {
    let output = [];
    let count = controlPoints.length;

    if (count === 0) {
      return output;
    }

    let subdivisionBuffer1 = [];
    let subdivisionBuffer2 = [];

    let toFlatten = [controlPoints.slice()];
    let freeBuffers = [];

    let leftChild = subdivisionBuffer2;

    while (toFlatten.length > 0) {
      let parent = toFlatten.pop();

      if (PathApproximator._bezierIsFlatEnough(parent)) {
        // If the control points we currently operate on are sufficiently "flat", we use
        // an extension to De Casteljau's algorithm to obtain a piecewise-linear approximation
        // of the bezier curve represented by our control points, consisting of the same amount
        // of points as there are control points.
        PathApproximator._bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, count);

        freeBuffers.push(parent);
        continue;
      }

      // If we do not yet have a sufficiently "flat" (in other words, detailed) approximation we keep
      // subdividing the curve we are currently operating on.
      let rightChild = freeBuffers.length > 0 ? freeBuffers.pop() : [];

      PathApproximator._bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, count);

      // We re-use the buffer of the parent for one of the children, so that we save one allocation per iteration.
      for (let i = 0; i < count; ++i) {
        parent[i] = leftChild[i];
      }

      toFlatten.push(rightChild);
      toFlatten.push(parent);
    }

    output.push(controlPoints[count - 1]);

    return output;
  }

  /**
   * Creates a piecewise-linear approximation of a Catmull-Rom spline.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCatmull(controlPoints)
  {
    let result = [];
    let controlPointsLength = controlPoints.length;

    for (let i = 0; i < controlPointsLength - 1; i++) {
      let v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
      let v2 = controlPoints[i];
      let v3 = i < controlPointsLength - 1 ? controlPoints[i + 1] : v2.add(v2).subtract(v1);
      let v4 = i < controlPointsLength - 2 ? controlPoints[i + 2] : v3.add(v3).subtract(v2);

      for (let c = 0; c < catmull_detail; c++) {
        result.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(c) / catmull_detail));
        result.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(c + 1) / catmull_detail));
      }
    }

    return result;
  }

  /**
   * Creates a piecewise-linear approximation of a circular arc curve.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCircularArc(controlPoints)
  {
    let a = controlPoints[0];
    let b = controlPoints[1];
    let c = controlPoints[2];

    let aSq = b.subtract(c).length() ** 2;
    let bSq = a.subtract(c).length() ** 2;
    let cSq = a.subtract(b).length() ** 2;

    // If we have a degenerate triangle where a side-length is almost zero, then give up and fall
    // back to a more numerically stable method.
    if (Math.abs(aSq - 0) < 0.003 || Math.abs(bSq - 0) < 0.003 || Math.abs(cSq - 0) < 0.003) {
      return [];
    }

    let s = Math.fround(aSq * (bSq + cSq - aSq));
    let t = Math.fround(bSq * (aSq + cSq - bSq));
    let u = Math.fround(cSq * (aSq + bSq - cSq));

    let sum = Math.fround(s + t + u);

    // If we have a degenerate triangle with an almost-zero size, then give up and fall
    // back to a more numerically stable method.
    if (Math.abs(sum - 0) < 0.003) {
      return [];
    }

    let centre = a.scale(s).add(b.scale(t)).add(c.scale(u)).divide(sum);
    let dA = a.subtract(centre);
    let dC = c.subtract(centre);

    let r = dA.length();

    let thetaStart = Math.atan2(dA.y, dA.x);
    let thetaEnd = Math.atan2(dC.y, dC.x);

    while (thetaEnd < thetaStart) {
      thetaEnd += 2 * Math.PI;
    }

    let dir = 1;
    let thetaRange = thetaEnd - thetaStart;

    // Decide in which direction to draw the circle, depending on which side of
    // AC B lies.
    let orthoAtoC = c.subtract(a);

    orthoAtoC = new Vector2(orthoAtoC.y, -orthoAtoC.x);

    if (orthoAtoC.dot(b.subtract(a)) < 0) {
      dir = -dir;
      thetaRange = 2 * Math.PI - thetaRange;
    }

    // We select the amount of points for the approximation by requiring the discrete curvature
    // to be smaller than the provided tolerance. The exact angle required to meet the tolerance
    // is: 2 * Math.Acos(1 - TOLERANCE / r)
    // The special case is required for extremely short sliders where the radius is smaller than
    // the tolerance. This is a pathological rather than a realistic case.
    let amountPoints = 2 * r <= circular_arc_tolerance ? 2
      : Math.max(2, Math.ceil(thetaRange / (2 * Math.acos(1 - circular_arc_tolerance / r))));

    let output = [];
    let fract, theta, o;

    for (let i = 0; i < amountPoints; ++i) {
      fract = i / (amountPoints - 1);
      theta = thetaStart + dir * fract * thetaRange;

      o = new Vector2(Math.fround(Math.cos(theta)), Math.fround(Math.sin(theta))).scale(r);

      output.push(centre.add(o));
    }

    return output;
  }

  /**
   * Creates a piecewise-linear approximation of a linear curve.
   * Basically, returns the input.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLinear(controlPoints)
  {
    return controlPoints;
  }

  /**
   * Creates a piecewise-linear approximation of a lagrange polynomial.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLagrangePolynomial(controlPoints)
  {
    // TODO: add some smarter logic here, chebyshev nodes?
    const num_steps = 51;

    let result = [];

    let weights = PathApproximator._barycentricWeights(controlPoints);

    let minX = controlPoints[0].x;
    let maxX = controlPoints[0].x;

    for (let i = 1, len = controlPoints.length; i < len; i++) {
      minX = Math.min(minX, controlPoints[i].x);
      maxX = Math.max(maxX, controlPoints[i].x);
    }

    let dx = maxX - minX;

    for (let i = 0; i < num_steps; i++) {
      let x = minX + dx / (num_steps - 1) * i;
      let y = Math.fround(PathApproximator._barycentricLagrange(controlPoints, weights, x));

      result.push(new Vector2(x, y));
    }

    return result;
  }

  /**
   * Calculates the Barycentric weights for a Lagrange polynomial for a given set of coordinates. 
   * Can be used as a helper function to compute a Lagrange polynomial repeatedly.
   * @param points An array of coordinates. No two x should be the same.
   */
  static _barycentricWeights(points)
  {
    let n = points.length;
    let w = [];

    for (let i = 0; i < n; i++) {
      w[i] = 1;

      for (let j = 0; j < n; j++) {
        if (i != j) {
          w[i] *= points[i].x - points[j].x;
        }
      }

      w[i] = 1.0 / w[i];
    }

    return w;
  }

  /**
   * Calculates the Lagrange basis polynomial for a given set of x coordinates based on previously computed barycentric weights.
   * @param points An array of coordinates. No two x should be the same.
   * @param weights An array of precomputed barycentric weights.
   * @param time The x coordinate to calculate the basis polynomial for.
   */
  static _barycentricLagrange(points, weights, time)
  {
    if (points === null || points.Length === 0) {
      throw new Error("points must contain at least one point");
    }

    if (points.Length !== weights.Length) {
      throw new Error("points must contain exactly as many items as {nameof(weights)}");
    }

    let numerator = 0;
    let denominator = 0;

    for (let i = 0, len = points.Length; i < len; i++) {
      // while this is not great with branch prediction, it prevents NaN at control point X coordinates
      if (time === points[i].x) {
        return points[i].y;
      }

      let li = weights[i] / (time - points[i].x);

      numerator += li * points[i].y;
      denominator += li;
    }

    return numerator / denominator;
  }

  /**
   * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
   * NOTE: The 2nd order derivative of a 2d curve represents its curvature, so intuitively this function
   *       checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
   *       need to have a denser approximation to be more "flat".
   * @param controlPoints The control points to check for flatness.
   * @returns Whether the control points are flat enough.
   */
  static _bezierIsFlatEnough(controlPoints)
  {
    let sub, sum, scale;

    for (let i = 1, len = controlPoints.length; i < len - 1; i++) {
      scale = controlPoints[i].scale(2);
      sub = controlPoints[i - 1].subtract(scale);
      sum = sub.add(controlPoints[i + 1]);

      if (sum.length() ** 2 > bezier_tolerance ** 2 * 4) {
        return false;
      }
    }

    return true;
  }

  /**
   * Subdivides n control points representing a bezier curve into 2 sets of n control points, each
   * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
   * the original curve into 2 curves which result in the original curve when pieced back together.
   * @param controlPoints The control points to split.
   * @param l Output: The control points corresponding to the left half of the curve.
   * @param r Output: The control points corresponding to the right half of the curve.
   * @param subdivisionBuffer The first buffer containing the current subdivision state.
   * @param count The number of control points in the original list.
   */
  static _bezierSubdivide(controlPoints, l, r, subdivisionBuffer, count)
  {
    let midpoints = subdivisionBuffer;

    for (let i = 0; i < count; ++i) {
      midpoints[i] = controlPoints[i];
    }

    for (let i = 0; i < count; ++i) {
      l[i] = midpoints[0];
      r[count - i - 1] = midpoints[count - i - 1];

      for (let j = 0; j < count - i - 1; j++) {
        midpoints[j] = midpoints[j].add(midpoints[j + 1]).divide(2);
      }
    }
  }

  /**
   * This uses <a href="https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm De Casteljau's algorithm</a> to obtain an optimal
   * piecewise-linear approximation of the bezier curve with the same amount of points as there are control points.
   * @param controlPoints The control points describing the bezier curve to be approximated.
   * @param output The points representing the resulting piecewise-linear approximation.
   * @param count The number of control points in the original list.
   * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
   * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
   */
  static _bezierApproximate(controlPoints, output, subdivisionBuffer1, subdivisionBuffer2, count)
  {
    let l = subdivisionBuffer2;
    let r = subdivisionBuffer1;

    PathApproximator._bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

    for (let i = 0; i < count - 1; ++i) {
      l[count + i] = r[i + 1];
    }

    output.push(controlPoints[0]);

    for (let i = 1; i < count - 1; ++i) {
      let index = 2 * i;
      let p = l[index - 1].add(l[index].scale(2)).add(l[index + 1]).scale(Math.fround(0.25));

      output.push(p);
    }
  }

  /**
   * Finds a point on the spline at the position of a parameter.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @param vec3 The third vector.
   * @param vec4 The fourth vector.
   * @param t The parameter at which to find the point on the spline, in the range [0, 1].
   * @returns The point on the spline at t.
   */
  static _catmullFindPoint(vec1, vec2, vec3, vec4, t)
  {
    let t2 = Math.fround(t * t);
    let t3 = Math.fround(t * t2);

    return new Vector2(
      Math.fround(0.5 * (2 * vec2.x + (-vec1.x + vec3.x) * t + (2 * vec1.x - 5 * vec2.x + 4 * vec3.x - vec4.x) * t2 + (-vec1.x + 3 * vec2.x - 3 * vec3.x + vec4.x) * t3)),
      Math.fround(0.5 * (2 * vec2.y + (-vec1.y + vec3.y) * t + (2 * vec1.y - 5 * vec2.y + 4 * vec3.y - vec4.y) * t2 + (-vec1.y + 3 * vec2.y - 3 * vec3.y + vec4.y) * t3))
    );
  }
}

module.exports = PathApproximator;