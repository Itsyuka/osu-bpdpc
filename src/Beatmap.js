const Vector2 = require("./Utils/Vector2");
const Colour = require("./Colour");
const Crunch = require("./Utils/OsuCruncher");
const HitType = require("./Enum/HitType");
const OsuHitObjectFactory = require("./Rulesets/Osu/HitObjectFactory");
const {SliderPath, PathControlPoint} = require("./Utils/SliderPath");

class Beatmap {
  constructor() {
    this.Version = 0;

    this.General = {
      AudioFilename: null,
      AudioLeadIn: 0,
      PreviewTime: 0,
      Countdown: false,
      SampleSet: "None", // None, Normal, Soft, etc
      StackLeniency: 0,
      Mode: 0,
      LetterboxInBreaks: false,
      WidescreenStoryboard: false
    };

    this.Difficulty = {
      HPDrainRate: 0,
      CircleSize: 0,
      OverallDifficulty: 0,
      ApproachRate: 0,
      SliderMultiplier: 0,
      SliderTickRate: 0
    };

    this.Editor = {
      Bookmarks: [],
      DistanceSpacing: 0,
      BeatDivisor: 0,
      GridSize: 0,
      TimelineZoom: 0
    };

    this.Metadata = {
      Title: null,
      TitleUnicode: null,
      Artist: null,
      ArtistUnicode: null,
      Creator: null,
      Version: null,
      Source: null,
      Tags: [],
      BeatmapID: 0,
      BeatmapSetID: 0
    };

    this.Colours = [];

    this.Events = {
      Background: null,
      Breaks: []
    };

    this.HitObjects = [];
    this.TimingPoints = [];
  }

  static fromOsu(data) {
    if (!data) throw new Error("No beatmap found");
    let beatmap = new Beatmap();
    let section = null;
    let lines = data.split("\n").map(v => v.trim()); // Cache this for better performance of the loop
    for (let line of lines) {
      if (line.startsWith("//")) continue; // Ignore comments
      if (!line) continue; // Empty lines can pewf
      if (!section && line.includes("osu file format v")) {
        // get the version of the beatmap
        beatmap.Version = parseInt(line.split("osu file format v")[1], 10); // Parse only as an int
        continue;
      }
      if (/^\s*\[(.+?)\]\s*$/.test(line)) {
        section = /^\s*\[(.+?)\]\s*$/.exec(line)[1];
        continue;
      }
      switch (section) {
        case "General": {
          let [key, value] = line.split(":").map(v => v.trim());
          switch (key) {
            case "AudioFilename":
              beatmap[section][key] = value;
              break;
            case "AudioLeadIn":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "PreviewTime":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "Countdown":
              beatmap[section][key] = value === "1";
              break;
            case "SampleSet":
              beatmap[section][key] = value;
              break;
            case "StackLeniency":
              beatmap[section][key] = parseFloat(value);
              break;
            case "Mode":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "LetterboxInBreaks":
              beatmap[section][key] = value === "1";
              break;
            case "WidescreenStoryboard":
              beatmap[section][key] = value === "1";
              break;
          }
          break;
        }
        case "Editor": {
          let [key, value] = line.split(":").map(v => v.trim());
          switch (key) {
            case "Bookmarks":
              beatmap[section][key] = value
                .split(",")
                .map(v => parseInt(v, 10));
              break;
            case "DistanceSpacing":
              beatmap[section][key] = parseFloat(value);
              break;
            case "BeatDivisor":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "GridSize":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "TimelineZoom":
              beatmap[section][key] = parseInt(value, 10);
              break;
          }
          break;
        }
        case "Metadata": {
          let [key, ...value] = line.split(":");

          key = key.trim();
          value = value.join(':').trim();
          
          switch (key) {
            case "Title":
              beatmap[section][key] = value;
              break;
            case "TitleUnicode":
              beatmap[section][key] = value;
              break;
            case "Artist":
              beatmap[section][key] = value;
              break;
            case "ArtistUnicode":
              beatmap[section][key] = value;
              break;
            case "Creator":
              beatmap[section][key] = value;
              break;
            case "Version":
              beatmap[section][key] = value;
              break;
            case "Source":
              beatmap[section][key] = value;
              break;
            case "Tags":
              beatmap[section][key] = value.split(" ");
              break;
            case "BeatmapID":
              beatmap[section][key] = parseInt(value, 10);
              break;
            case "BeatmapSetID":
              beatmap[section][key] = parseInt(value, 10);
              break;
          }
          break;
        }
        case "Difficulty": {
          let [key, value] = line.split(":").map(v => v.trim());
          switch (key) {
            case "HPDrainRate":
              beatmap[section][key] = parseFloat(value);
              break;
            case "CircleSize":
              beatmap[section][key] = parseFloat(value);
              break;
            case "OverallDifficulty":
              beatmap[section][key] = parseFloat(value);
              key = "ApproachRate";
              if (beatmap[section][key]) break;
            case "ApproachRate":
              beatmap[section][key] = parseFloat(value);
              break;
            case "SliderMultiplier":
              beatmap[section][key] = parseFloat(value);
              break;
            case "SliderTickRate":
              beatmap[section][key] = parseFloat(value);
              break;
          }
          break;
        }
        case "HitObjects": {
          // TODO: Optimize and clean
          let [x, y, startTime, hitType, hitSound, ...args] = line.split(",");
          let hitObject = {
            pos: new Vector2(parseInt(x, 10), parseInt(y, 10)),
            startTime: parseInt(startTime, 10),
            hitType: parseInt(hitType, 10),
            hitSound: parseInt(hitSound)
          };
          if (args.length && args[args.length - 1].includes(":")) {
            // some sliders don't use the extras
            if (hitType & HitType.Hold) {
              let [
                endTime,
                sampleSet,
                additionSet,
                customIndex,
                sampleVolume,
                filename
              ] = args.pop().split(":");
              hitObject = {
                ...hitObject,
                endTime: parseInt(endTime, 10),
                extras: {
                  sampleSet: parseInt(sampleSet, 10),
                  additionSet: parseInt(additionSet, 10),
                  customIndex: parseInt(customIndex, 10),
                  sampleVolume: parseInt(sampleVolume, 10),
                  filename
                }
              };
            } else {
              let [
                sampleSet,
                additionSet,
                customIndex,
                sampleVolume,
                filename
              ] = args.pop().split(":");
              hitObject = {
                ...hitObject,
                extras: {
                  sampleSet: parseInt(sampleSet, 10),
                  additionSet: parseInt(additionSet, 10),
                  customIndex: parseInt(customIndex, 10),
                  sampleVolume: parseInt(sampleVolume, 10),
                  filename
                }
              };
            }
          }
          if (hitType & HitType.Slider) {
            let [
              curvyBits,
              repeat,
              pixelLength,
              edgeHitSounds,
              edgeAdditions,
            ] = args;
            let [type, ...curves] = curvyBits.split("|");
            let curvePoints = curves
              .map(v => v.split(":").map(v => parseInt(v, 10)))
              .map(v => new Vector2(v[0], v[1]));
            hitObject = {
              ...hitObject,
              curveType: type,
              curvePoints,
              repeat: parseInt(repeat, 10),
              pixelLength: parseInt(pixelLength, 10),
            };

            hitObject.pathPoints = [new PathControlPoint(
              new Vector2(0, 0), hitObject.curveType
            )];

            hitObject.curvePoints.forEach(x => {
              let point = new PathControlPoint(x.subtract(hitObject.pos));

              hitObject.pathPoints.push(point);
            });

            let path = new SliderPath(
              hitObject.pathPoints, hitObject.pixelLength
            );

            let endPoint = path.positionAt(path.progressAt(hitObject, 1));
            
            hitObject.path = path;

            if (Number.isFinite(endPoint.x) && Number.isFinite(endPoint.y)) {
              hitObject.endPos = hitObject.pos.add(endPoint);
            } else {
              // If endPosition could not be calculated, 
              // approximate it by setting it to the last point
              hitObject.endPos = 
                hitObject.curvePoints[hitObject.curvePoints.length - 1];
            }

            if (edgeHitSounds) {
              hitObject.edgeHitSounds = edgeHitSounds
                .split("|")
                .map(v => parseInt(v, 10));
            }
            
            if (edgeAdditions) {
              hitObject.edgeAdditions = edgeAdditions
                .split("|")
                .map(v => v.split(":"))
                .map(v => ({
                  sampleSet: parseInt(v[0], 10),
                  additionSet: parseInt(v[1], 10)
                }));
            }
          }
          if (hitType & HitType.Spinner) {
            hitObject = {
              ...hitObject,
              endPos: hitObject.pos,
              endTime: parseInt(args[0], 10)
            };
          }
          switch (beatmap.General.Mode) {
            case 0: {
              if (hitObject.hitType & HitType.Normal)
                hitObject = OsuHitObjectFactory.Circle(hitObject);
              else if (hitObject.hitType & HitType.Slider)
                hitObject = OsuHitObjectFactory.Slider(hitObject);
              else if (hitObject.hitType & HitType.Spinner)
                hitObject = OsuHitObjectFactory.Spinner(hitObject);
            }
          }
          beatmap.HitObjects.push(hitObject);
          break;
        }
        case "TimingPoints": {
          let args = line.split(",");
          beatmap.TimingPoints.push({
            time: parseInt(args[0], 10),
            beatLength: parseFloat(args[1]),
            meter: args.length >= 2 ? parseInt(args[2]) : 4,
            sampleSet: args.length >= 3 ? parseInt(args[3]) : 0,
            sampleIndex: args.length >= 4 ? parseInt(args[4]) : 0,
            volume: args.length >= 5 ? parseInt(args[5]) : 100,
            inherited: args.length >= 6 ? args[6] === "1" : false,
            kiai: args.length >= 7 ? args[7] === "1" : false
          });
          break;
        }
        case "Colours":
          let [, value] = line.split(":").map(v => v.trim());
          beatmap.Colours.push(
            new Colour(...value.split(",").map(v => parseInt(v, 10)))
          );
          break;
        case "Events": // TODO: Work on true storyboard support
          let [type, ...params] = line.split(",");
          if (type === "0") {
            beatmap.Events.Background = params[1].replace(/"/g, "");
          } else if (type === "2") {
            beatmap.Events.Breaks.push({
              start: parseInt(params[0], 10),
              end: parseInt(params[1], 10)
            });
          }
          break;
      }
    }

    let tpIndex = -1, nextTime = Number.NEGATIVE_INFINITY;
    let parentPoint, timingPoint, pixelsPerBeat =  0;

    for (const hitObject of beatmap.HitObjects) {
      if (!(hitObject.hitType & HitType.Slider)) {
        continue;
      }

      while (hitObject.startTime >= nextTime) {
        ++tpIndex;

        if (beatmap.TimingPoints.length > tpIndex + 1) {
          nextTime = beatmap.TimingPoints[tpIndex + 1].time;
        }
        else {
          nextTime = Number.POSITIVE_INFINITY;
        }

        timingPoint = beatmap.TimingPoints[tpIndex];

        if (timingPoint.inherited) {
          parentPoint = timingPoint;
        }

        let bpm = Math.round(60000 / timingPoint.beatLength);

        if (bpm > 0) {
          beatmap.General.MinBPM = 
            Math.min(beatmap.General.MinBPM, bpm) || bpm;
          beatmap.General.MaxBPM = 
            Math.max(beatmap.General.MaxBPM, bpm) || bpm;
        }

        let velocityMultiplier = 1;
    
        if (!timingPoint.inherited && timingPoint.beatLength < 0) {
          velocityMultiplier = -100 / timingPoint.beatLength;
        }
          
        pixelsPerBeat = beatmap.Difficulty.SliderMultiplier * 100;
        
        if (beatmap.Version >= 8) {
          pixelsPerBeat *= velocityMultiplier;
        }
      }

      let beats = (hitObject.path.distance * hitObject.repeat) / pixelsPerBeat;
  
      let ticks = Math.ceil((beats - 0.01) / hitObject.repeat 
        * beatmap.Difficulty.SliderTickRate) - 1;
      
      ticks *= hitObject.repeat;
      ticks += hitObject.repeat + 1;

      hitObject.duration = beats * parentPoint.beatLength;
      hitObject.endTime = hitObject.startTime + hitObject.duration;
  
      hitObject.combo = Math.max(0, ticks);
    }

    return beatmap;
  }

  toOsu() {
    let data = [];
    data.push(`osu file format v${this.Version}`);
    data.push("");
    data.push("[General]");
    for (let key in this.General) {
      data.push(Crunch(key, this.General[key]));
    }
    data.push("");
    data.push("[Editor]");
    for (let key in this.Editor) {
      data.push(Crunch(key, this.Editor[key]));
    }
    data.push("");
    data.push("[Metadata]");
    for (let key in this.Metadata) {
      data.push(Crunch(key, this.Metadata[key]));
    }
    data.push("");
    data.push("[Difficulty]");
    for (let key in this.Difficulty) {
      data.push(Crunch(key, this.Difficulty[key]));
    }
    data.push("");
    data.push("[Colours]");
    for (let colour in this.Colours) {
      data.push(
        `Combo${parseInt(colour, 10) + 1}: ${this.Colours[colour].toString()}`
      );
    }
    data.push("");
    data.push("[Events]");
    if (this.Events.Background) {
      data.push(`0,0,"${this.Events.Background}",0,0`);
    }
    for (let b of this.Events.Breaks) {
      data.push(`2,${b.start},${b.end}`);
    }
    data.push("");
    data.push("[TimingPoints]");
    for (let tp of this.TimingPoints) {
      data.push(
        `${tp.time},${tp.beatLength},${tp.meter},${tp.sampleSet},${
          tp.sampleIndex
        },${tp.volume},${+tp.inherited},${+tp.inherited}`
      );
    }
    data.push("");
    data.push("[HitObjects]");
    for (let ho of this.HitObjects) {
      if (ho.toOsu) {
        data.push(ho.toOsu());
      } else {
        let arrayBuilder = [];
        arrayBuilder.push(
          ho.pos.x,
          ho.pos.y,
          ho.startTime,
          ho.hitType,
          ho.hitSound
        );
        if (ho.hitType & HitType.Slider) {
          arrayBuilder.push(
            `${ho.curveType}|${ho.curvePoints
              .map(v => `${v.x}:${v.y}`)
              .join("|")}`,
            ho.repeat,
            ho.pixelLength
          );
          if (ho.edgeHitSounds) {
            arrayBuilder.push(
              ho.edgeHitSounds.join("|"),
              ho.edgeAdditions
                .map(v => `${v.sampleSet}:${v.additionSet}`)
                .join("|")
            );
          }
        }
        if (ho.extras) {
          arrayBuilder.push(
            `${ho.extras.sampleSet}:${ho.extras.additionSet}:${
              ho.extras.customIndex
            }:${ho.extras.sampleVolume}:${ho.extras.filename}`
          );
        }
        data.push(arrayBuilder.join(","));
      }
    }
    return data.filter(v => v !== null).join("\n");
  }

  static fromJSON(data) {
    let d = JSON.parse(data);
    let beatmap = new Beatmap();
    beatmap.Version = d.Version || beatmap.Version;
    beatmap.General = { ...beatmap.General, ...d.General };
    beatmap.Metadata = { ...beatmap.Metadata, ...d.Metadata };
    beatmap.Editor = { ...beatmap.Editor, ...d.Editor };
    beatmap.Colours = d.Colours ? d.Colours.map(c => new Colour(...c)) : [];
    beatmap.TimingPoints = d.TimingPoints || [];
    beatmap.Events = { ...beatmap.Events, ...d.Events };
    beatmap.HitObjects = d.HitObjects.map(hitObject => {
      hitObject.pos = new Vector2(hitObject.pos.x, hitObject.pos.y);
      if (hitObject.curvePoints) {
        hitObject.curvePoints = hitObject.curvePoints.map(
          curvePoint => new Vector2(curvePoint.x, curvePoint.y)
        );
      }
      switch (beatmap.General.Mode) {
        case 0: {
          if (hitObject.hitType & HitType.Normal)
            hitObject = OsuHitObjectFactory.Circle(hitObject);
          else if (hitObject.hitType & HitType.Slider)
            hitObject = OsuHitObjectFactory.Slider(hitObject);
          else if (hitObject.hitType & HitType.Spinner)
            hitObject = OsuHitObjectFactory.Spinner(hitObject);
        }
      }
      return hitObject;
    });
    return beatmap;
  }

  get countNormal() {
    return this.HitObjects.filter(ho => ho.hitType & HitType.Normal).length;
  }

  get countSlider() {
    return this.HitObjects.filter(ho => ho.hitType & HitType.Slider).length;
  }

  get countSpinner() {
    return this.HitObjects.filter(ho => ho.hitType & HitType.Spinner).length;
  }

  get countObjects() {
    return this.HitObjects.length;
  }

  get maxCombo() {
    return this.HitObjects.reduce((a, c) => a + c.combo, 0);
  }

  get length() {
    let startTime = this.HitObjects[0].startTime;
    let endTime = this.HitObjects.reduce((time, ho) => {
      return Math.max(time, ho.endTime || ho.startTime);
    }, 0);

    return endTime - startTime;
  }
}

module.exports = Beatmap;
