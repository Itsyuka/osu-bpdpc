import Vector2 from './Utils/Vector2';
import HitType from './Enum/HitType';
import HitSound from './Enum/HitSound';
import Colour from './Colour';
export = Beatmap;

declare class Beatmap {
  General: {
    AudioFilename: string,
    AudioLeadin: number,
    PreviewTime: number,
    Countdown: boolean,
    SampleSet: string,
    StackLeniency: number,
    Mode: number,
    LetterboxInBreaks: boolean,
    WidescreenStoryboard: boolean
  };

  Difficulty: {
    HPDrainRate: number,
    CircleSize: number,
    OverallDifficulty: number,
    ApproachRate: number,
    SliderMultiplier: number,
    SliderTickRate: number
  };

  Editor: {
    Bookmarks: number[],
    DistanceSpacing: number,
    BeatDivisor: number,
    GridSize: number,
    TimelineZoom: number
  };

  Metadata: {
    Title: string,
    TitleUnicode: string,
    Artist: string,
    ArtistUnicode: string,
    Creator: string,
    Version: string,
    Source: string,
    Tags: string[],
    BeatmapID: number,
    BeatmapSetID: number
  };


  Colours: Colour[];

  Events: {
    Background: string,
    Breaks: Break[]
  };

  HitObjects: HitObject[];

  /**
   * Takes a buffer/string of a .osu file and returns a new Beatmap instance
   */
  static async fromOsu(data: (Buffer|string)): Promise<Beatmap>;

  /**
   * Takes a JSON string and returns a new Beatmap instance
   */
  static async fromJSON(data: string): Promise<Beatmap>;

  /**
   * Returns a string for an .osu file
   */
  toOsu(): string;
}

declare interface Break {
  start: number,
  end: number
}

declare interface HitObject {
  pos: Position,
  startTime: number,
  endTime?: number,
  hitType: HitType,
  hitSound: HitSound,
  curveType?: CurveType,
  curvePoints?: Vector2[],
  repeat?: number,
  pixelLength?: number,
  edgeHitSounds?: number[],
  edgeAdditions?: {
    sampleSet: number,
    additionSet: number
  },
  extras?: {
    sampleSet: number,
    additionSet: number,
    customIndex: number,
    sampleVolume: number,
    filename: string
  }
}