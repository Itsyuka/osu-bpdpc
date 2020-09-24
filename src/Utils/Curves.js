'use strict';

function distancePoints(p1, p2)
{
  let x = (p1[0] - p2[0]);
  let y = (p1[1] - p2[1]);

  return Math.sqrt(x * x + y * y);
}

function distanceFromPoints(array)
{
  let distance = 0;

  for (let i = 1, len = array.length - 1; i <= len; ++i) {
    distance += distancePoints(array[i], array[i - 1]);
  }

  return distance;
}

function angleFromPoints(p1, p2)
{
  return Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]));
}

function cartFromPol(r, teta)
{
  let x2 = (r * Math.cos(teta));
  let y2 = (r * Math.sin(teta));

  return [x2, y2];
}

function pointAtDistance(array, distance)
{
  //needs a serious cleanup !
  let current_distance = 0;
  let coord, angle, cart, new_distance;

  if (array.length < 2) return [0, 0, 0, 0];

  if (distance === 0) {
    let angle = angleFromPoints(array[0], array[1]);
    return [array[0][0], array[0][1], angle, 0];
  }

  if (distanceFromPoints(array) <= distance) {
    let angle = angleFromPoints(array[array.length - 2], array[array.length - 1]);
    
    return [
      array[array.length - 1][0],
      array[array.length - 1][1],
      angle,
      array.length - 2
    ];
  }

  for (var i = 0, len = array.length - 2; i <= len; ++i) {
    let x = (array[i][0] - array[i + 1][0]);
    let y = (array[i][1] - array[i + 1][1]);

    new_distance = (Math.sqrt(x * x + y * y));
    current_distance += new_distance;

    if (distance <= current_distance) break;
  }

  current_distance -= new_distance;

  if (distance === current_distance) {
    coord = [array[i][0], array[i][1]];
    angle = angleFromPoints(array[i], array[i + 1]);
  } 
  else {
    angle = angleFromPoints(array[i], array[i + 1]);
    cart = cartFromPol((distance - current_distance), angle);

    if (array[i][0] > array[i + 1][0])
      coord = [(array[i][0] - cart[0]), (array[i][1] - cart[1])];
    else
      coord = [(array[i][0] + cart[0]), (array[i][1] + cart[1])];
  }

  return [coord[0], coord[1], angle, i];
}

function Cpn(p, n)
{
  if (p < 0 || p > n) {
    return 0;
  }
    
  p = Math.min(p, n - p);
  let out = 1;

  for (let i = 1; i < p + 1; i++) {
    out = out * (n - p + i) / i;
  }
    
  return out;
}

function array_values(array)
{
  let out = [];

  for (let i in array) {
    out.push(array[i]);
  }

  return out;
}

function array_calc(op, array1, array2)
{
  let min = Math.min(array1.length, array2.length);
  let retour = [];

  for (let i = 0; i < min; ++i) {
    retour.push(array1[i] + op * array2[i]);
  }
    
  return retour;
}

class Bezier
{
  constructor(points)
  {
    this.points = points;
    this.order = points.length;
  
    this.step = 0.0025 / this.order; // x0.10
    this.pos = {};
    this.calcPoints();
  }

  at(t)
  {
    //B(t) = sum_(i=0)^n (i parmis n) (1-t)^(n-i) * t^i * P_i
    if (typeof this.pos[t] !== "undefined") {
      return this.pos[t];
    }
    
    let x = 0, y = 0;
    let n = this.order - 1;

    for (let i = 0; i <= n; ++i) {
      x += Cpn(i, n) * Math.pow((1 - t), (n - i)) 
        * Math.pow(t, i) * this.points[i].x;

      y += Cpn(i, n) * Math.pow((1 - t), (n - i)) 
        * Math.pow(t, i) * this.points[i].y;
    }

    this.pos[t] = [x, y];

    return [x, y];
  };

  // Changed to approximate length
  calcPoints()
  {
    if (Object.keys(this.pos).length) {
      return;
    }

    this.pxlength = 0;

    let prev = this.at(0);
    let current;

    for (let i = 0; i < 1 + this.step; i += this.step) {
      current = this.at(i);
      this.pxlength += distancePoints(prev, current);
      prev = current;
    }
  };
};

class Catmull
{
  constructor(points)
  {
    this.points = points;
    this.order = points.length;

    this.step = 0.025;
    this.pos = [];
    this.calcPoints();
  }

  at(x, t)
  {
    let v1 = x >= 1 ? this.points[x - 1] : this.points[x];
    let v2 = this.points[x];

    let v3 = x + 1 < this.order 
      ? this.points[x + 1] 
      : array_calc('1', v2, array_calc('-1', v2, v1));

    let v4 = x + 2 < this.order 
      ? this.points[x + 2] 
      : array_calc('1', v3, array_calc('-1', v3, v2));

    let retour = [
      0.5 * ((-v1.x + 3 * v2.x - 3 * v3.x + v4.x) * t ** 3 
        + (2 * v1.x - 5 * v2.x + 4 * v3.x - v4.x) 
        * t * t + (-v1.x + v3.x) * t + 2 * v2.x),
      
      0.5 * ((-v1.y + 3 * v2.y - 3 * v3.y + v4.y) * t ** 3 
        + (2 * v1.y - 5 * v2.y + 4 * v3.y - v4.y) 
        * t * t + (-v1.y + v3.y) * t + 2 * v2.y)
    ]

    return retour;
  };

  calcPoints()
  {
    if (this.pos.length) {
      return;
    }

    for (let i = 0, len1 = this.order - 1; i < len1; ++i)
      for (let t = 0, len2 = 1 + this.step; t < len2; t += this.step)
        this.pos.push(this.at(i, t));
  };
};

Bezier.prototype.pointAtDistance = Catmull.prototype.pointAtDistance = function (dist)
{
  switch (this.order) {
    case 0:
      return false;
    case 1:
      return this.points[0];
    default:
      this.calcPoints();
      return pointAtDistance(array_values(this.pos), dist).slice(0, 2);
  }
};

module.exports = {Bezier, Catmull};