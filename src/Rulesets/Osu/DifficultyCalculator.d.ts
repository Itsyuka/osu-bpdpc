import Beatmap from "../../Beatmap";
import Mods from "../../Enum/Mods";

export default class DifficultyCalculator {
  public beatmap: Beatmap;
  public mods: Mods;
  public static use(beatmap: Beatmap): DifficultyCalculator;
  public calculate(): this;
  public setMods(mods: Mods): this;
  public circleSize: number;
  public timeRate: number;
}
