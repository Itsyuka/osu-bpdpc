import Beatmap from '../../Beatmap'
import Mods from '../../Enum/Mods'

export = DifficultyCalculator;

declare class DifficultyCalculator {
  beatmap: Beatmap;
  mods: Mods;

  static use(beatmap: Beatmap): DifficultyCalculator

  calculate(): this

  setMods(mods: Mods): this

  circleSize: number

  timeRate: number

}