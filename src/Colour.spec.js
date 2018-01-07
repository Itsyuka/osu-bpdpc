const Colour = require('./Colour')

const colour = [255, 0, 0]
let colourTest

describe ('Colour', () => {
  describe ('new instance', () => {
    it ('should return a new colour instance', () => {
      colourTest = new Colour(...colour)
      return colourTest instanceof Colour
    })
  })

  describe ('#toString()', () => {
    describe ('osu', () => {
      it ('should return 255,0,0', () => {
        return colourTest.toString('osu') === '255,0,0'
      })
    })

    describe ('hex', () => {
      it ('should return #ff0000', () => {
        return colourTest.toString('hex') === '#ff0000'
      })
    })
  })
})