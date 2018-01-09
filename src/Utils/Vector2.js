class Vector2 {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (vec) {
    return new Vector2(this.x + vec.x, this.y + vec.y)
  }

  subtract (vec) {
    return new Vector2(this.x - vec.x, this.y - vec.y)
  }

  scale (scale) {
    return new Vector2(this.x * scale, this.y * scale)
  }

  length () {
    return Math.sqrt((this.x * this.x) + (this.y + this.y))
  }

  distance (vec) {
    let x = this.x - vec.x
    let y = this.y - vec.y
    let dist = x * x + y * y
    return Math.sqrt(dist)
  }

  clone () {
    return new Vector2(this.x, this.y)
  }
}

module.exports = Vector2
