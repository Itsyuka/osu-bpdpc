class Colour {
  /**
   * @param {Number|String} r
   * @param {Number|String} g
   * @param {Number|String} b
   */
  constructor (r, g, b) {
    this.r = parseInt(r, 10)
    this.g = parseInt(g, 10)
    this.b = parseInt(b, 10)
  }

  /**
   * Returns object to a hex or osu styled string
   * @param {String?} type
   */
  toString (type = 'osu') {
    if (type === 'osu') {
      return `${this.r},${this.g},${this.b}`
    } else if (type === 'hex') {
      return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(16)}`
    }
  }

  toJSON () {
    return [this.r, this.g, this.b]
  }
}

module.exports = Colour
