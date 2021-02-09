import Vector2 from "./Utils/Vector2";
import HitType from "./Enum/HitType";
import HitSound from "./Enum/HitSound";
import Colour from "./Colour";

export default class Beatmap {
  public Version: number;

  public General: {
    AudioFilename: string;
    AudioLeadin: number;
    PreviewTime: number;
    Countdown: boolean;
    SampleSet: string;
    StackLeniency: number;
    Mode: number;
    MinBPM: number;
    MaxBPM: number;
    LetterboxInBreaks: boolean;
    WidescreenStoryboard: boolean;
  };

  public Difficulty: {
    HPDrainRate: number;
    CircleSize: number;
    OverallDifficulty: number;
    ApproachRate: number;
    SliderMultiplier: number;
    SliderTickRate: number;
  };

  public Editor: {
    Bookmarks: number[];
    DistanceSpacing: number;
    BeatDivisor: number;
    GridSize: number;
    TimelineZoom: number;
  };

  public Metadata: {
    Title: string;
    TitleUnicode: string;
    Artist: string;
    ArtistUnicode: string;
    Creator: string;
    Version: string;
    Source: string;
    Tags: string[];
    BeatmapID: number;
    BeatmapSetID: number;
  };

  public Colours: Colour[];

  public Events: {
    Background: string;
    Breaks: Break[];
  };

  public HitObjects: HitObject[];

  public TimingPoints: TimingPoint[];

  /**
   * Takes a buffer/string of a .osu file and returns a new Beatmap instance
   */
  public static fromOsu(data: string): Beatmap;

  /**
   * Returns a string for an .osu file
   */
  public toOsu(): string;

  /**
   * Takes a JSON string and returns a new Beatmap instance
   */
  public static fromJSON(data: string): Beatmap;

  public get countNormal(): number;
  public get countSlider(): number;
  public get countSpinner(): number;
  public get countObjects(): number;
  public get maxCombo(): number;
  public get length(): number;
}

export interface Break {
  start: number;
  end: number;
}

export interface HitObject {
  pos: Vector2;
  startTime: number;
  endTime?: number;
  hitType: HitType;
  hitSound: HitSound;
  curveType?: string;
  curvePoints?: Vector2[];
  repeat?: number;
  pixelLength?: number;
  edgeHitSounds?: number[];
  edgeAdditions?: {
    sampleSet: number;
    additionSet: number;
  };
  extras?: {
    sampleSet: number;
    additionSet: number;
    customIndex: number;
    sampleVolume: number;
    filename: string;
  };
}

export interface TimingPoint {
  time: number;
  beatLength: number;
  meter: number;
  sampleSet: number;
  sampleIndex: number;
  volume: number;
  inherited: boolean;
  kiai: boolean;
}
