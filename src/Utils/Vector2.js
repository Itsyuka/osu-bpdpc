/**
 * A Basic Vector 2D class
 * @class
 */
class Vector2 {
  /**
   * Creates a new Vector2
   * @param {Number} x
   * @param {Number} y
   */
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  /**
   * Adds a vector to current and returns a new instance
   * @param {Vector2} vec
   * @returns {Vector2}
   */
  add (vec) {
    return new Vector2(this.x + vec.x, this.y + vec.y)
  }

  /**
   * Subtracts a vector to current and returns a new instance
   * @param {Vector2} vec
   * @returns {Vector2}
   */
  subtract (vec) {
    return new Vector2(this.x - vec.x, this.y - vec.y)
  }

  /**
   * Scales the vector and returns a new instance
   * @param {Number} scale
   * @returns {Vector2}
   */
  scale (scale) {
    return new Vector2(this.x * scale, this.y * scale)
  }

  /**
   * Returns the length of the 2 points in the vector
   * @returns {Number}
   */
  length () {
    return Math.sqrt((this.x * this.x) + (this.y + this.y))
  }

  /**
   * Returns the distance between 2 vectors
   * @param {Vector2} vec
   * @returns {Number}
   */
  distance (vec) {
    let x = this.x - vec.x
    let y = this.y - vec.y
    let dist = x * x + y * y
    return Math.sqrt(dist)
  }

  /**
   * Clones the current vector and returns it
   * Kinda useless but ¯\_(ツ)_/¯
   * @returns {Vector2}
   */
  clone () {
    return new Vector2(this.x, this.y)
  }
}

module.exports = Vector2
