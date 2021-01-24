const HitObject = require("./HitObject");

class Slider extends HitObject {
  constructor(hitObject) {
    super({ ...hitObject, endTime: hitObject.endTime || hitObject.startTime });
    this.curveType = hitObject.curveType;
    this.curvePoints = hitObject.curvePoints;
    this.repeat = hitObject.repeat;
    this.path = hitObject.path;
    this.pixelLength = hitObject.pixelLength;
    if (hitObject.edgeHitSounds) {
      this.edgeHitSounds = hitObject.edgeHitSounds;
      this.edgeAdditions = hitObject.edgeAdditions;
    }
  }

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
      `${this.curveType}|${this.curvePoints
        .map(v => `${v.x}:${v.y}`)
        .join("|")}`,
      this.repeat,
      this.pixelLength
    );
    if (this.edgeHitSounds) {
      arrayBuilder.push(
        this.edgeHitSounds.join("|"),
        this.edgeAdditions.map(v => `${v.sampleSet}:${v.additionSet}`).join("|")
      );
    }
    if (this.extras) {
      arrayBuilder.push(
        `${this.extras.sampleSet}:${this.extras.additionSet}:${
          this.extras.customIndex
        }:${this.extras.sampleVolume}:${this.extras.filename}`
      );
    }
    return arrayBuilder.join(",");
  }
}

module.exports = Slider;
