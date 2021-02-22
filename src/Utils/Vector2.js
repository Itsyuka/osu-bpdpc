class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(vec) {
    return this.x === vec.x && this.y === vec.y;
  }

  add(vec) {
    return new Vector2(this.x + vec.x, this.y + vec.y);
  }

  fadd(vec) {
    return new Vector2(
      Math.fround(this.x) + Math.fround(vec.x),
      Math.fround(this.y) + Math.fround(vec.y)
    );
  }

  subtract(vec) {
    return new Vector2(this.x - vec.x, this.y - vec.y);
  }

  fsubtract(vec) {
    return new Vector2(
      Math.fround(this.x) - Math.fround(vec.x),
      Math.fround(this.y) - Math.fround(vec.y)
    );
  }

  scale(scale) {
    return new Vector2(this.x * scale, this.y * scale);
  }

  dot(vec) {
    return new Vector2(this.x * vec.x, this.y * vec.y);
  }

  divide(scale) {
    return new Vector2(this.x / scale, this.y / scale);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  flength() {
    return Math.fround(
      Math.sqrt(
        Math.fround(this.x) * Math.fround(this.x) + 
        Math.fround(this.y) * Math.fround(this.y)
      )
    );
  }

  distance(vec) {
    let x = this.x - vec.x;
    let y = this.y - vec.y;

    let dist = x * x + y * y;

    return Math.sqrt(dist);
  }

  normalize() {
    let length = this.length();

    return new Vector2(this.x / length, this.y / length);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}

module.exports = Vector2;
