import Beatmap = require('../../Beatmap');
import Mods = require('../../Enum/Mods');

export = DifficultyCalculator;

declare class DifficultyCalculator {
  beatmap: Beatmap;
  mods: Mods;

  static use(beatmap: Beatmap): DifficultyCalculator

  calculate(): this

  setMods(mods: Mods): this

  get circleSize(): number

  get timeRate(): number

}