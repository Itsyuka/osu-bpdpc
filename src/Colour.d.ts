export default class Colour {
  public constructor(r: number, g: number, b: number);

  /**
   * Returns object to a hex or osu styled string
   */
  public toString(type: ColourType): string;

  public toJSON(): number[];
}

export type ColourType = "osu" | "hex";
