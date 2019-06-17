const Mods = require("../../Enum/Mods");

class PerformanceCalculator {
  constructor({
    starDifficulty,
    aimDifficulty,
    speedDifficulty,
    mods,
    beatmap
  }) {
    this.starDifficulty = starDifficulty;
    this.aimDifficulty = aimDifficulty;
    this.speedDifficulty = speedDifficulty;
    this.mods = mods;
    this.beatmap = beatmap;
    this.aimPerformance = 0;
    this.accuracyPerformance = 0;
    this.speedPerformance = 0;
    this.totalPerformance = 0;
  }

  static use(difficultyCalculator) {
    if (difficultyCalculator.beatmap === null)
      throw new Error("You must have a valid difficulty calculator instance");
    if (difficultyCalculator.starDifficulty === 0) {
      return new PerformanceCalculator(difficultyCalculator.calculate());
    } else {
      return new PerformanceCalculator(difficultyCalculator);
    }
  }

  // TODO: Fix performance accuracy (off by 1-5pp)
  calculate(score) {
    let circles = this.beatmap.countNormal;
    let totalHits =
      score.count300 + score.count100 + score.count50 + score.countMiss;
    let acc = this.accuracyCalc(
      score.count300,
      score.count100,
      score.count50,
      score.countMiss
    );

    let trueAimDifficulty = this.aimDifficulty;

    if (this.mods & Mods.Touch)
      trueAimDifficulty = Math.pow(trueAimDifficulty, 0.8); // This is to reduce PP from touchscreen plays

    this.aimPerformance =
      Math.pow(5 * Math.max(1, trueAimDifficulty / 0.0675) - 4, 3) / 100000;

    let totalHitsOver = totalHits / 2000;
    let lengthBonus =
      0.95 +
      0.4 * Math.min(1, totalHitsOver) +
      (totalHits > 2000 ? Math.log(totalHitsOver) * 0.5 : 0);

    let missPenalty = Math.pow(0.97, score.countMiss);

    let comboBreak = Math.min(
      Math.pow(score.maxcombo, 0.8) / Math.pow(this.beatmap.maxCombo, 0.8),
      1
    );

    this.aimPerformance *= lengthBonus;
    this.aimPerformance *= missPenalty;
    this.aimPerformance *= comboBreak;

    let arBonus = 1;
    if (this.approachRate > 10.33) {
      arBonus += 0.45 * (this.approachRate - 10.33);
    } else if (this.approachRate < 8) {
      if (this.mods & Mods.Hidden) {
        arBonus += 0.02 * (8 - this.approachRate);
      } else {
        arBonus += 0.01 * (8 - this.approachRate);
      }
    }
    this.aimPerformance *= arBonus;

    if (this.mods & Mods.Hidden) this.aimPerformance *= 1.18;
    if (this.mods & Mods.Flashlight) this.aimPerformance *= 1.45 * lengthBonus;

    let accBonus = 0.5 + acc / 2;
    let odBonus = 0.98 + Math.pow(this.overallDifficulty, 2) / 2500;

    this.aimPerformance *= accBonus;
    this.aimPerformance *= odBonus;

    this.speedPerformance =
      Math.pow(5 * Math.max(1, this.speedDifficulty / 0.0675) - 4, 3) / 100000;
    this.speedPerformance *= lengthBonus;
    this.speedPerformance *= missPenalty;
    this.speedPerformance *= comboBreak;
    this.speedPerformance *= accBonus;
    this.speedPerformance *= odBonus;

    let realAcc = 0;

    if (this.mods & Mods.ScoreV2) {
      circles = totalHits;
      realAcc = acc;
    } else {
      if (circles) {
        realAcc =
          ((score.count300 - (totalHits - circles)) * 6 +
            score.count100 * 2 +
            score.count50) /
          (circles * 6);
      }
      realAcc = Math.max(0, realAcc);
    }

    this.accuracyPerformance =
      Math.pow(1.52163, this.overallDifficulty) * Math.pow(realAcc, 24) * 2.83;
    this.accuracyPerformance *= Math.min(1.15, Math.pow(circles / 1000, 0.3));

    if (this.mods & Mods.Hidden) this.accuracyPerformance *= 1.02;
    if (this.mods & Mods.Flashlight) this.accuracyPerformance *= 1.02;

    if (
      this.mods & Mods.Relax ||
      this.mods & Mods.Relax2 ||
      this.mods & Mods.Autoplay
    ) {
      this.totalPerformance = 0;
      return this;
    }

    let finalMultiplier = 1.12;
    if (this.mods & Mods.NoFail) finalMultiplier *= 0.9;
    if (this.mods & Mods.SpunOut) finalMultiplier *= 0.95;

    this.totalPerformance =
      Math.pow(
        Math.pow(this.aimPerformance, 1.1) +
          Math.pow(this.speedPerformance, 1.1) +
          Math.pow(this.accuracyPerformance, 1.1),
        1.0 / 1.1
      ) * finalMultiplier;

    return this;
  }

  accuracyCalc(count300, count100, count50, countMiss) {
    let totalHits = count300 + count100 + count50 + countMiss;
    let acc = 0;
    if (totalHits > 0) {
      acc = Math.max(
        0,
        Math.min(
          1,
          (count50 * 50 + count100 * 100 + count300 * 300) / (totalHits * 300)
        )
      );
    }
    return acc;
  }

  get overallDifficulty() {
    let multiplier = 1;
    if (this.mods & Mods.HardRock) multiplier *= 1.4;
    if (this.mods & Mods.Easy) multiplier *= 0.5;
    let od = this.beatmap.Difficulty.OverallDifficulty * multiplier;
    let odms =
      Math.min(79.5, Math.max(19.5, 79.5 - Math.ceil(6 * od))) / this.timeRate;
    return (79.5 - odms) / 6;
  }

  get approachRate() {
    let multiplier = 1;
    if (this.mods & Mods.HardRock) multiplier *= 1.4;
    if (this.mods & Mods.Easy) multiplier *= 0.5;
    let ar = this.beatmap.Difficulty.ApproachRate * multiplier;
    let arms =
      Math.min(
        1800,
        Math.max(450, ar <= 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5))
      ) / this.timeRate;
    return arms > 1200 ? -(arms - 1800) / 120 : 5 + -(arms - 1200) / 150;
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

module.exports = PerformanceCalculator;
