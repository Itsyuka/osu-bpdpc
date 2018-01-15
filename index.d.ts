import Beatmap = require('./src/Beatmap')
import Colour = require('./src/Colour')
import Mods = require('./src/Enum/Mods')
import HitSound = require('./src/Enum/HitSound')
import HitType = require('./src/Enum/HitType')
import Vector2 = require('./src/Utils/Vector2')

declare module "osu-bpdpc" {
    export {Beatmap}
    export {Colour}
    export {Mods}
    export {HitSound}
    export {HitType}
    export {Vector2}
}