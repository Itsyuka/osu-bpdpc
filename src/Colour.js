class Colour {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString(type = "osu") {
    if (type === "osu") {
      return `${this.r},${this.g},${this.b}`;
    } else if (type === "hex") {
      return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(
        16
      )}`;
    }
  }

  toJSON() {
    return [this.r, this.g, this.b];
  }
}

module.exports = Colour;
