module.exports = {
  Beatmap: require("./src/Beatmap"),
  Colour: require("./src/Colour"),
  Mods: require("./src/Enum/Mods"),
  HitSound: require("./src/Enum/HitSound"),
  HitType: require("./src/Enum/HitType"),
  Vector2: require("./src/Utils/Vector2"),
  Osu: {
    DifficultyCalculator: require("./src/Rulesets/Osu/DifficultyCalculator"),
    PerformanceCalculator: require("./src/Rulesets/Osu/PerformanceCalculator")
  }
};
