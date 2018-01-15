const HitType = require('../../../Enum/HitType')

class HitObject {
  constructor ({pos, startTime, endTime, hitType, hitSound, extras}) {
    this.pos = pos
    this.startTime = startTime
    this.endTime = endTime
    this.hitType = hitType
    this.hitSound = hitSound
    this.extras = extras
  }

  get newCombo () {
    return this.hitType & HitType.NewCombo
  }
}

module.exports = HitObject
