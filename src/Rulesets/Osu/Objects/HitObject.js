const HitType = require("../../../Enum/HitType");

class HitObject {
  constructor({
    pos,
    endPos,
    startTime,
    endTime,
    hitType,
    hitSound,
    extras,
    combo = 1
  }) {
    this.pos = pos;
    this.endPos = endPos;
    this.startTime = startTime;
    this.endTime = endTime;
    this.hitType = hitType;
    this.hitSound = hitSound;
    this.extras = extras;
    this.combo = combo;
  }

  get newCombo() {
    return this.hitType & HitType.NewCombo;
  }
}

module.exports = HitObject;
