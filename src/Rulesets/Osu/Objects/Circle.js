const HitObject = require("./HitObject");

class Circle extends HitObject {
  constructor(hitObject) {
    super({ 
      ...hitObject, 
      endPos: hitObject.pos,
      endTime: hitObject.startTime 
    });
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
      `${this.extras.sampleSet}:${this.extras.additionSet}:${
        this.extras.customIndex
      }:${this.extras.sampleVolume}:${this.extras.filename}`
    );
    return arrayBuilder.join(",");
  }
}

module.exports = Circle;
