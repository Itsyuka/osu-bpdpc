import Vector2 from './Utils/Vector2'
import HitType from './Enum/HitType'
import HitSound from './Enum/HitSound'
import Colour from './Colour'

export default class Beatmap {
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

  TimingPoints: TimingPoint[];

  /**
   * Takes a buffer/string of a .osu file and returns a new Beatmap instance
   */
  static fromOsu(data: (string)): Beatmap

  /**
   * Takes a JSON string and returns a new Beatmap instance
   */
  static fromJSON(data: string): Beatmap

  /**
   * Returns a string for an .osu file
   */
  toOsu(): string;
}

export interface Break {
  start: number,
  end: number
}

export interface HitObject {
  pos: Vector2,
  startTime: number,
  endTime?: number,
  hitType: HitType,
  hitSound: HitSound,
  curveType?: string,
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

export interface TimingPoint {
  time: number,
  beatLength: number,
  meter: number,
  sampleSet: number,
  sampleIndex: number,
  volume: number,
  inherited: boolean,
  kiai: boolean
}
