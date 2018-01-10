export = Colour;

declare class Colour {
  constructor(r: number, g: number, b: number)

  /**
   * Returns object to a hex or osu styled string
   */
  toString(type: ColourType): string
  
  toJSON(): number[]
}

declare type ColourType = 'osu' | 'hex';