const HitObject = require("./HitObject");

class Slider extends HitObject {
  constructor(hitObject) {
    super({ ...hitObject, endTime: hitObject.endTime || hitObject.startTime });
    this.curveType = hitObject.curveType;
    this.curvePoints = hitObject.curvePoints;
    this.repeat = hitObject.repeat;
    this.pixelLength = hitObject.pixelLength;
    if (hitObject.edgeHitSounds) {
      this.edgeHitSounds = hitObject.edgeHitSounds;
      this.edgeAdditions = hitObject.edgeAdditions;
    }
  }

  finalize(timingPoint, parentTimingPoint, beatmap) {
    let velocityMultiplier = 1;
    let difficulty = beatmap.Difficulty;

    if (!timingPoint.inherited && timingPoint.beatLength < 0) {
      velocityMultiplier = -100 / timingPoint.beatLength;
    }
      
    let pixelsPerBeat = difficulty.SliderMultiplier * 100;
    
    if (beatmap.Version >= 8) {
      pixelsPerBeat *= velocityMultiplier;
    }
    
    let beats = (this.pixelLength * this.repeat) / pixelsPerBeat;
    let parentBeatLength = parentTimingPoint ? parentTimingPoint.beatLength : 1;
    let duration = Math.ceil(beats * parentBeatLength);

    this.endTime = this.startTime + duration;
    this.combo =
      Math.ceil((beats - 0.1) / this.repeat * difficulty.SliderTickRate) - 1;
    
    this.combo *= this.repeat;
    this.combo += this.repeat + 1;
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
