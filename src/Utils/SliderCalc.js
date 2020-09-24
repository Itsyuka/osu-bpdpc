'use strict';

const Vector2 = require("./Vector2");
const {Bezier} = require('./Curves');

/**
 * Get the endpoint of a slider
 * @param  {string} sliderType    slider curve type
 * @param  {number}  sliderLength  slider length
 * @param  {Array}  points        list of slider points
 * @return {object} endPoint      the coordinates of the slider edge
 */
function getEndPoint(sliderType, sliderLength, points)
{
  if (!sliderType || !sliderLength || !points) return;

  switch (sliderType) {
    case 'L':
      return pointOnLine(points[0], points[1], sliderLength);
    case 'C':
      // not supported, anyway it's only used in old beatmaps
      return undefined;
    case 'B':
      if (!points || points.length < 2) { return undefined; }
      if (points.length === 2) { return pointOnLine(points[0], points[1], sliderLength); }

      let pts = points.slice();
      let bezier, previous, point;

      for (let i = 0, l = pts.length; i < l; i++) {
        point = pts[i];

        if (!previous) {
          previous = point;
          continue;
        }

        if (point.x === previous.x && point.y === previous.y) {
          bezier = new Bezier(pts.splice(0, i));
          sliderLength -= bezier.pxlength;
          i = 0;
          l = pts.length;
        }

        previous = point;
      }

      bezier = new Bezier(pts);

      return bezier.pointAtDistance(sliderLength);
    case 'P':
      if (!points || points.length < 2) { return undefined; }
      if (points.length === 2) { return pointOnLine(points[0], points[1], sliderLength); }
      if (points.length > 3) { return getEndPoint('B', sliderLength, points); }

      let p1 = points[0];
      let p2 = points[1];
      let p3 = points[2];

      let circumCicle = getCircumCircle(p1, p2, p3);
      let radians = sliderLength / circumCicle.radius;

      if (isLeft(p1, p2, p3)) radians *= -1;

      return rotate(circumCicle.cx, circumCicle.cy, p1.x, p1.y, radians);
  }
};

function pointOnLine(p1, p2, length)
{
  let fullLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  let n = fullLength - length;

  let x = (n * p1.x + length * p2.x) / fullLength;
  let y = (n * p1.y + length * p2.y) / fullLength;

  return new Vector2(x, y);
}

/**
 * Get coordinates of a point in a circle, given the center, a startpoint and a distance in radians
 * @param {number} cx       center x
 * @param {number} cy       center y
 * @param {number} x        startpoint x
 * @param {number} y        startpoint y
 * @param {number} radians  distance from the startpoint
 * @return {object} the new point coordinates after rotation
 */
function rotate(cx, cy, x, y, radians)
{
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);

  return [
    (cos * (x - cx)) - (sin * (y - cy)) + cx,
    (sin * (x - cx)) + (cos * (y - cy)) + cy
  ];
}

/**
 * Check if C is on left side of [AB]
 * @param {object} a startpoint of the segment
 * @param {object} b endpoint of the segment
 * @param {object} c the point we want to locate
 * @return {boolean} true if on left side
 */
function isLeft(a, b, c)
{
  return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0;
}

/**
 * Get circum circle of 3 points
 * @param  {object} p1 first point
 * @param  {object} p2 second point
 * @param  {object} p3 third point
 * @return {object} circumCircle
 */
function getCircumCircle(p1, p2, p3)
{
  let x1 = p1.x;
  let y1 = p1.y;

  let x2 = p2.x;
  let y2 = p2.y;

  let x3 = p3.x;
  let y3 = p3.y;

  //center of circle
  let D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

  let Ux = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / D;
  let Uy = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / D;

  let px = Ux - x1;
  let py = Uy - y1;
  let r = Math.sqrt(px * px + py * py);

  return {
    cx: Ux,
    cy: Uy,
    radius: r
  };
}

module.exports = {getEndPoint};