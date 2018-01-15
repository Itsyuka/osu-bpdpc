const HitType = require('../../../Enum/HitType')

class HitObject {
  constructor ({pos, startTime, endTime, hitType, hitSound, extras, combo = 1}) {
    this.pos = pos
    this.startTime = startTime
    this.endTime = endTime
    this.hitType = hitType
    this.hitSound = hitSound
    this.extras = extras
    this.combo = combo
  }

  get newCombo () {
    return this.hitType & HitType.NewCombo
  }
}

module.exports = HitObject
