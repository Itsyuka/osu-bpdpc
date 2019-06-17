const HitObject = require("./HitObject");

class Spinner extends HitObject {
  toOsu() {
    let arrayBuilder = [];
    arrayBuilder.push(
      this.pos.x,
      this.pos.y,
      this.startTime,
      this.hitType,
      this.hitSound
    );
    arrayBuilder.push(
      `${this.endTime}:${this.extras.sampleSet}:${this.extras.additionSet}:${
        this.extras.customIndex
      }:${this.extras.sampleVolume}:${this.extras.filename}`
    );
    return arrayBuilder.join(",");
  }
}

module.exports = Spinner;
