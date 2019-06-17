const Mods = require("../../Enum/Mods");
const HitType = require("../../Enum/HitType");

class DifficultyCalculator {
  constructor() {
    this.beatmap = null;
    this.mods = 0;
    this.starDifficulty = 0;
    this.aimDifficulty = 0;
    this.speedDifficulty = 0;
  }

  static use(beatmap) {
    let difficultyCalculator = new DifficultyCalculator();
    difficultyCalculator.beatmap = beatmap;
    return difficultyCalculator;
  }

  setMods(mods) {
    this.mods = mods;
    return this;
  }

  calculate() {
    let hitObjects = this.generateHitObjects();
    this.aimDifficulty = this.calculateStrainDifficulty(hitObjects, 1);
    this.speedDifficulty = this.calculateStrainDifficulty(hitObjects, 0);

    this.starDifficulty =
      this.aimDifficulty +
      this.speedDifficulty +
      Math.abs(this.speedDifficulty - this.aimDifficulty) * 0.5;
    return this;
  }

  generateHitObjects() {
    let radius = (512 / 16) * (1 - (0.7 * (this.circleSize - 5)) / 5);
    let hitObjects = [];

    let previousHitObject = null;
    for (let hitObject of this.beatmap.HitObjects) {
      let difficultyHitObject;
      let scalingFactor = 52 / radius;
      if (radius < 30) scalingFactor *= 1 + Math.min(30 - radius, 5) / 50;
      difficultyHitObject = {
        pos: hitObject.pos.scale(scalingFactor),
        startTime: hitObject.startTime / this.timeRate,
        endTime: hitObject.endTime / this.timeRate,
        hitType: hitObject.hitType,
        strains: [1, 1]
      };
      if (previousHitObject) {
        this.calculateHitObjectStrain(
          difficultyHitObject,
          previousHitObject,
          0
        );
        this.calculateHitObjectStrain(
          difficultyHitObject,
          previousHitObject,
          1
        );
      }
      hitObjects.push(difficultyHitObject);
      previousHitObject = difficultyHitObject;
    }
    return hitObjects;
  }

  calculateStrainDifficulty(hitObjects, difficultyType) {
    let highestStrains = [];
    let intervalEnd = 400;
    let maxStrain = 0;

    let previousHitObject = null;
    for (let hitObject of hitObjects) {
      while (hitObject.startTime > intervalEnd) {
        highestStrains.push(maxStrain);
        if (previousHitObject !== null) {
          maxStrain =
            previousHitObject.strains[difficultyType] *
            Math.pow(
              [0.3, 0.15][difficultyType],
              (intervalEnd - previousHitObject.startTime) / 1000
            );
        }
        intervalEnd += 400;
      }
      maxStrain = Math.max(maxStrain, hitObject.strains[difficultyType]);
      previousHitObject = hitObject;
    }

    let difficulty = 0;
    let weight = 1;
    let sorted = highestStrains.sort((a, b) => b - a);
    for (let strain of sorted) {
      difficulty += weight * strain;
      weight *= 0.9;
    }

    return Math.sqrt(difficulty) * 0.0675;
  }

  calculateHitObjectStrain(hitObject, previousHitObject, difficultyType) {
    let res = 0;
    let timeElapsed = hitObject.startTime - previousHitObject.startTime;
    let decay = Math.pow([0.3, 0.15][difficultyType], timeElapsed / 1000);
    let scaling = [1400, 26.25][difficultyType];

    if (!(hitObject.hitType & HitType.Spinner)) {
      let distance = hitObject.pos.distance(previousHitObject.pos);
      res =
        this.calculateDistanceSpacingWeight(distance, difficultyType) * scaling;
    }

    res /= Math.max(timeElapsed, 50);
    hitObject.strains[difficultyType] =
      previousHitObject.strains[difficultyType] * decay + res;
  }

  calculateDistanceSpacingWeight(distance, difficultyType) {
    if (difficultyType === 0) {
      if (distance > 125) {
        return 2.5;
      } else if (distance > 110) {
        return 1.6 + (0.9 * (distance - 110)) / (125 - 110);
      } else if (distance > 90) {
        return 1.2 + (0.4 * (distance - 90)) / (110 - 90);
      } else if (distance > 90 / 2) {
        return 0.95 + (0.25 * (distance - 90 / 2)) / (90 / 2);
      }
      return 0.95;
    } else if (difficultyType === 1) {
      return Math.pow(distance, 0.99);
    }
    return 0;
  }

  get circleSize() {
    let multiplier = 1;
    if (this.mods & Mods.HardRock) multiplier *= 1.3;
    if (this.mods & Mods.Easy) multiplier *= 0.5;
    return Math.max(
      0,
      Math.min(10, this.beatmap.Difficulty.CircleSize * multiplier)
    );
  }

  get timeRate() {
    let rate = 1;
    if (this.mods & Mods.DoubleTime) rate *= 1.5;
    else if (this.mods & Mods.HalfTime) rate *= 0.75;
    return rate;
  }
}

module.exports = DifficultyCalculator;
