import Vector2 from './Utils/Vector2';
export = Beatmap;

declare class Beatmap {
  General: {
    AudioFilename: String,
    AudioLeadin: Number,
    PreviewTime: Number,
    Countdown: Boolean,
    SampleSet: String,
    StackLeniency: Number,
    Mode: Number,
    LetterboxInBreaks: Boolean,
    WidescreenStoryboard: Boolean
  };

  Difficulty: {
    HPDrainRate: Number,
    CircleSize: Number,
    OverallDifficulty: Number,
    ApproachRate: Number,
    SliderMultiplier: Number,
    SliderTickRate: Number
  };

  Editor: {
    Bookmarks: Number[],
    DistanceSpacing: Number,
    BeatDivisor: Number,
    GridSize: Number,
    TimelineZoom: Number
  };

  Metadata: {
    Title: String,
    TitleUnicode: String,
    Artist: String,
    ArtistUnicode: String,
    Creator: String,
    Version: String,
    Source: String,
    Tags: String[],
    BeatmapID: Number,
    BeatmapSetID: Number
  };


  Colours: Colour[];

  Events: {
    Background: String,
    Breaks: Break[]
  };

  HitObjects: HitObject[];

  /**
   * Takes a buffer/string of a .osu file and returns a new Beatmap instance
   */
  static async fromOsu(data: (Buffer|String)): Promise<Beatmap>;

  /**
   * Takes a JSON string and returns a new Beatmap instance
   */
  static async fromJSON(data: String): Promise<Beatmap>;

  /**
   * Returns a string for an .osu file
   */
  toOsu(): String;
}

declare interface Break {
  start: Number,
  end: Number
}

declare interface HitObject {
  pos: Position,
  startTime: Number,
  endTime?: Number,
  hitType: HitType,
  hitSound: HitSound,
  curveType?: CurveType,
  curvePoints?: Vector2[],
  repeat?: Number,
  pixelLength?: Number,
  edgeHitSounds?: Number[],
  edgeAdditions?: {
    sampleSet: Number,
    additionSet: Number
  },
  extras?: {
    sampleSet: Number,
    additionSet: Number,
    customIndex: Number,
    sampleVolume: Number,
    filename: String
  }
}