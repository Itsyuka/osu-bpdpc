const Vector2 = require('./Utils/Vector2')
const Colour = require('./Colour')
const Crunch = require('./Utils/OsuCruncher')
const HitType = require('./Enum/HitType')

/**
 * Creates a new Beatmap
 * @class
 */
class Beatmap {
  constructor () {
    this.Version = 0

    this.General = {
      AudioFilename: null,
      AudioLeadIn: 0,
      PreviewTime: 0,
      Countdown: false,
      SampleSet: 'None', // None, Normal, Soft, etc
      StackLeniency: 0,
      Mode: 0,
      LetterboxInBreaks: false,
      WidescreenStoryboard: false
    }

    this.Difficulty = {
      HPDrainRate: 0,
      CircleSize: 0,
      OverallDifficulty: 0,
      ApproachRate: 0,
      SliderMultiplier: 0,
      SliderTickRate: 0
    }

    this.Editor = {
      Bookmarks: [],
      DistanceSpacing: 0,
      BeatDivisor: 0,
      GridSize: 0,
      TimelineZoom: 0
    }

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
    }

    this.Colours = []

    this.Events = {
      Background: null,
      Breaks: []
    }

    this.HitObjects = []
    this.TimingPoints = []
  }

  /**
   * Parses an .osu file and returns a new Beatmap instance
   * TODO: Possibly replace the for-loop to a promise map
   * @param {String | Buffer} body
   * @returns {Promise<Beatmap>}
   */
  static async fromOsu (body) {
    if (!body) throw new Error('No beatmap found')
    if (body instanceof Buffer) body = body.toString()
    let beatmap = new Beatmap()
    let section = null
    let lines = body.split('\n').map(v => v.trim()) // Cache this for better performance of the loop
    for (let line of lines) {
      if (line.startsWith('//')) continue // Ignore comments
      if (!line) continue // Empty lines can pewf
      if (!section && line.includes('osu file format v')) { // get the version of the beatmap
        beatmap.Version = parseInt(line.split('osu file format v')[1], 10) // Parse only as an int
        continue
      }
      if (/^\s*\[(.+?)\]\s*$/.test(line)) {
        section = /^\s*\[(.+?)\]\s*$/.exec(line)[1]
        continue
      }
      switch (section) {
        case 'General': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'AudioFilename':
              beatmap[section][key] = value
              break
            case 'AudioLeadIn':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'PreviewTime':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'Countdown':
              beatmap[section][key] = value === '1'
              break
            case 'SampleSet':
              beatmap[section][key] = value
              break
            case 'StackLeniency':
              beatmap[section][key] = parseFloat(value)
              break
            case 'Mode':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'LetterboxInBreaks':
              beatmap[section][key] = value === '1'
              break
            case 'WidescreenStoryboard':
              beatmap[section][key] = value === '1'
              break
          }
          break
        }
        case 'Editor': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'Bookmarks':
              beatmap[section][key] = value.split(',').map(v => parseInt(v, 10))
              break
            case 'DistanceSpacing':
              beatmap[section][key] = parseFloat(value)
              break
            case 'BeatDivisor':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'GridSize':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'TimelineZoom':
              beatmap[section][key] = parseInt(value, 10)
              break
          }
          break
        }
        case 'Metadata': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'Title':
              beatmap[section][key] = value
              break
            case 'TitleUnicode':
              beatmap[section][key] = value
              break
            case 'Artist':
              beatmap[section][key] = value
              break
            case 'ArtistUnicode':
              beatmap[section][key] = value
              break
            case 'Creator':
              beatmap[section][key] = value
              break
            case 'Version':
              beatmap[section][key] = value
              break
            case 'Source':
              beatmap[section][key] = value
              break
            case 'Tags':
              beatmap[section][key] = value.split(' ')
              break
            case 'BeatmapID':
              beatmap[section][key] = parseInt(value, 10)
              break
            case 'BeatmapSetID':
              beatmap[section][key] = parseInt(value, 10)
              break
          }
          break
        }
        case 'Difficulty': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'HPDrainRate':
              beatmap[section][key] = parseFloat(value)
              break
            case 'CircleSize':
              beatmap[section][key] = parseFloat(value)
              break
            case 'OverallDifficulty':
              beatmap[section][key] = parseFloat(value)
              break
            case 'ApproachRate':
              beatmap[section][key] = parseFloat(value)
              break
            case 'SliderMultiplier':
              beatmap[section][key] = parseFloat(value)
              break
            case 'SliderTickRate':
              beatmap[section][key] = parseFloat(value)
              break
          }
          break
        }
        case 'HitObjects': { // TODO: Optimize and clean
          let [x, y, startTime, hitType, hitSound, ...args] = line.split(',')
          let hitObject = {
            pos: new Vector2(parseInt(x, 10), parseInt(y, 10)),
            startTime: parseInt(startTime, 10),
            hitType: parseInt(hitType, 10),
            hitSound: parseInt(hitSound)
          }
          if (args[args.length - 1].includes(':')) { // some sliders don't use the extras
            if (hitType & HitType.Hold) {
              let [endTime, sampleSet, additionSet, customIndex, sampleVolume, filename] = args.pop().split(':')
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
              }
            } else {
              let [sampleSet, additionSet, customIndex, sampleVolume, filename] = args.pop().split(':')
              hitObject = {
                ...hitObject,
                extras: {
                  sampleSet: parseInt(sampleSet, 10),
                  additionSet: parseInt(additionSet, 10),
                  customIndex: parseInt(customIndex, 10),
                  sampleVolume: parseInt(sampleVolume, 10),
                  filename
                }
              }
            }
          }
          if (hitType & HitType.Slider) {
            let [curvyBits, repeat, pixelLength, edgeHitSounds, edgeAdditions] = args
            let [type, ...curves] = curvyBits.split('|')
            let curvePoints = curves.map(v => v.split(':').map(v => parseInt(v, 10))).map(v => new Vector2(v[0], v[1]))
            hitObject = {
              ...hitObject,
              curveType: type,
              curvePoints,
              repeat: parseInt(repeat, 10),
              pixelLength: parseInt(pixelLength, 10)
            }
            if (edgeHitSounds) {
              hitObject.edgeHitSounds = edgeHitSounds.split('|').map(v => parseInt(v, 10))
            }
            if (edgeAdditions) {
              hitObject.edgeAdditions = edgeAdditions.split('|').map(v => v.split(':')).map(v => ({sampleSet: parseInt(v[0], 10), additionSet: parseInt(v[1], 10)}))
            }
          }
          if (hitType & HitType.Spinner) {
            hitObject = {
              ...hitObject,
              endTime: parseInt(args[0], 10)
            }
          }
          beatmap.HitObjects.push(hitObject)
          break
        }
        case 'TimingPoints': {
          let args = line.split(',')
          beatmap.TimingPoints.push({
            time: parseInt(args[0], 10),
            beatLength: parseFloat(args[1]),
            meter: args.length >= 2 ? parseInt(args[2]) : 4,
            sampleSet: args.length >= 3 ? parseInt(args[3]) : 0,
            sampleIndex: args.length >= 4 ? parseInt(args[4]) : 0,
            volume: args.length >= 5 ? parseInt(args[5]) : 100,
            inherited: args.length >= 6 ? args[6] === '1' : false,
            kiai: args.length >= 7 ? args[7] === '1' : false
          })
          break
        }
        case 'Colours':
          let [, value] = line.split(':').map(v => v.trim())
          beatmap.Colours.push(new Colour(...value.split(',')))
          break
        case 'Events':
          let [type, ...params] = line.split(',')
          if (type === '0') {
            beatmap.Events.Background = params[1].replace(/"/g, '')
          } else if (type === '2') {
            beatmap.Events.Breaks.push({start: parseInt(params[0], 10), end: parseInt(params[1], 10)})
          }
          break
      }
    }
    return beatmap
  }

  /**
   * Outputs as an .osu file format
   * TODO: Optimize and implement HitObjects
   * @returns {String}
   */
  toOsu () {
    let data = []
    data.push(`osu file format v${this.Version}`)
    data.push('')
    data.push('[General]')
    for (let key in this.General) {
      data.push(Crunch(key, this.General[key]))
    }
    data.push('')
    data.push('[Editor]')
    for (let key in this.Editor) {
      data.push(Crunch(key, this.Editor[key]))
    }
    data.push('')
    data.push('[Metadata]')
    for (let key in this.Metadata) {
      data.push(Crunch(key, this.Metadata[key]))
    }
    data.push('')
    data.push('[Difficulty]')
    for (let key in this.Difficulty) {
      data.push(Crunch(key, this.Difficulty[key]))
    }
    data.push('')
    data.push('[Colours]')
    for (let colour in this.Colours) {
      data.push(`Combo${parseInt(colour, 10) + 1}: ${this.Colours[colour].toString()}`)
    }
    data.push('')
    data.push('[Events]')
    if (this.Events.Background) {
      data.push(`0,0,"${this.Events.Background}",0,0`)
    }
    for (let b of this.Events.Breaks) {
      data.push(`2,${b.start},${b.end}`)
    }
    data.push('')
    data.push('[TimingPoints]')
    for (let tp of this.TimingPoints) {
      data.push(`${tp.time},${tp.beatLength},${tp.meter},${tp.sampleSet},${tp.sampleIndex},${tp.volume},${+tp.inherited},${+tp.inherited}`)
    }
    return data.filter(v => v !== null).join('\n')
  }

  /**
   * Parses a JSON string and returns a new Beatmap Instance
   * TODO: Implement HitObjects
   * @param {String} jsonData
   * @returns {Promise<Beatmap>}
   */
  static async fromJSON (jsonData) {
    let data = JSON.parse(jsonData)
    let beatmap = new Beatmap()
    beatmap.Version = data.Version || beatmap.Version
    beatmap.General = {...beatmap.General, ...data.General}
    beatmap.Metadata = {...beatmap.Metadata, ...data.Metadata}
    beatmap.Editor = {...beatmap.Editor, ...data.Editor}
    beatmap.Colours = data.Colours ? data.Colours.map(c => new Colour(...c)) : []
    beatmap.TimingPoints = data.TimingPoints || []
    beatmap.Events = {...beatmap.Events, ...data.Events}
    return beatmap
  }
}

module.exports = Beatmap
