const Colour = require('./Colour')

class Beatmap {
  constructor () {
    this.version = 0

    this.general = {
      audioFilename: null,
      audioLeadIn: 0,
      previewTime: 0,
      countdown: false,
      sampleSet: 'None', // None, Normal, Soft, etc
      stackLeniency: 0,
      mode: 0,
      letterboxInBreaks: false,
      widescreenStoryboard: false
    }

    this.difficulty = {
      hpDrainRate: 0,
      circleSize: 0,
      overallDifficulty: 0,
      approachRate: 0,
      sliderMultiplier: 0,
      sliderTickRate: 0
    }

    this.editor = {
      bookmarks: [],
      distanceSpacing: 0,
      beatDivisor: 0,
      gridSize: 0,
      timelineZoom: 0
    }

    this.metadata = {
      title: null,
      titleUnicode: null,
      artist: null,
      artistUnicode: null,
      creator: null,
      version: null,
      source: null,
      tags: [],
      beatmapId: 0,
      beatmapSetId: 0
    }

    this.colours = []

    this.events = {
      background: null,
      breaks: []
    }

    this.hitObjects = []
    this.timingPoints = []
  }

  /**
   * Parses an .osu file and returns a new Beatmap instance
   * @param {string|Buffer} body
   * @returns {Promise<Beatmap>}
   */
  static async fromOsu (body) {
    if (!body) throw new Error('No beatmap found')
    if (body instanceof Buffer) body = body.toString()
    let beatmap = new Beatmap()
    let section = null
    let hitObjectsLines = []
    let lines = body.split('\n').map(v => v.trim()) // Cache this for better performance of the loop
    for (let line of lines) {
      if (line.startsWith('//')) continue // Ignore comments
      if (!line) continue // Empty lines can pewf
      if (!section && line.includes('osu file format v')) { // get the version of the beatmap
        beatmap.version = parseInt(line.split('osu file format v')[1], 10) // Parse only as an int
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
              beatmap.general.audioFilename = value
              break
            case 'AudioLeadIn':
              beatmap.general.audioLeadIn = parseInt(value, 10)
              break
            case 'PreviewTime':
              beatmap.general.previewTime = parseInt(value, 10)
              break
            case 'Countdown':
              beatmap.general.countdown = value === '1'
              break
            case 'SampleSet':
              beatmap.general.sampleSet = value
              break
            case 'StackLeniency':
              beatmap.general.stackLeniency = parseFloat(value)
              break
            case 'Mode':
              beatmap.general.mode = parseInt(value, 10)
              break
            case 'LetterboxInBreaks':
              beatmap.general.letterboxInBreaks = value === '1'
              break
            case 'WidescreenStoryboard':
              beatmap.general.widescreenStoryboard = value === '1'
              break
          }
          break
        }
        case 'Editor': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'Bookmarks':
              beatmap.editor.bookmarks = value.split(',').map(v => parseInt(v, 10))
              break
            case 'DistanceSpacing':
              beatmap.editor.distanceSpacing = parseFloat(value)
              break
            case 'BeatDivisor':
              beatmap.editor.beatDivisor = parseInt(value, 10)
              break
            case 'GridSize':
              beatmap.editor.gridSize = parseInt(value, 10)
              break
            case 'TimelineZoom':
              beatmap.editor.timelineZoom = parseInt(value, 10)
              break
          }
          break
        }
        case 'Metadata': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'Title':
              beatmap.metadata.title = value
              break
            case 'TitleUnicode':
              beatmap.metadata.titleUnicode = value
              break
            case 'Artist':
              beatmap.metadata.artist = value
              break
            case 'ArtistUnicode':
              beatmap.metadata.artistUnicode = value
              break
            case 'Creator':
              beatmap.metadata.creator = value
              break
            case 'Version':
              beatmap.metadata.version = value
              break
            case 'Source':
              beatmap.metadata.source = value
              break
            case 'Tags':
              beatmap.metadata.tags = value.split(' ')
              break
            case 'BeatmapID':
              beatmap.metadata.beatmapId = parseInt(value, 10)
              break
            case 'BeatmapSetID':
              beatmap.metadata.beatmapSetId = parseInt(value, 10)
              break
          }
          break
        }
        case 'Difficulty': {
          let [key, value] = line.split(':').map(v => v.trim())
          switch (key) {
            case 'HPDrainRate':
              beatmap.difficulty.hpDrainRate = parseFloat(value)
              break
            case 'CircleSize':
              beatmap.difficulty.circleSize = parseFloat(value)
              break
            case 'OverallDifficulty':
              beatmap.difficulty.overallDifficulty = parseFloat(value)
              break
            case 'ApproachRate':
              beatmap.difficulty.approachRate = parseFloat(value)
              break
            case 'SliderMultiplier':
              beatmap.difficulty.sliderMultiplier = parseFloat(value)
              break
            case 'SliderTickRate':
              beatmap.difficulty.sliderTickRate = parseFloat(value)
              break
          }
          break
        }
        case 'HitObjects':
          hitObjectsLines.push(line)
          break
        case 'TimingPoints': {
          let args = line.split(',')
          beatmap.timingPoints.push({
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
          beatmap.colours.push(new Colour(...value.split(',')))
          break
        case 'Events':
          let [type, ...params] = line.split(',')
          if (type === '0') {
            beatmap.events.background = params[1].replace(/"/g, '')
          } else if (type === '2') {
            beatmap.events.breaks.push({start: parseInt(params[0], 10), end: parseInt(params[1], 10)})
          }
          break
      }
    }
    return beatmap
  }

  /**
   * Parses a JSON string and returns a new Beatmap Instance
   * @param {string} jsonData
   * @returns {Promise<Beatmap>}
   */
  static async fromJSON (jsonData) {
    let data = JSON.parse(jsonData)
    let beatmap = new Beatmap()
    beatmap.version = data.version || beatmap.version
    beatmap.general = {...beatmap.general, ...data.general}
    beatmap.metadata = {...beatmap.metadata, ...data.metadata}
    beatmap.editor = {...beatmap.editor, ...data.editor}
    beatmap.colours = data.colours ? data.colours.map(c => new Colour(...c)) : []
    beatmap.timingPoints = data.timingPoints || []
    beatmap.events = {...beatmap.events, ...data.events}
    return beatmap
  }
}

module.exports = Beatmap
