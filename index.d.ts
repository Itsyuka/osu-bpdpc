import Beatmap from './src/Beatmap'
import Colour from './src/Colour'
import Mods from './src/Enum/Mods'
import HitSound from './src/Enum/HitSound'
import HitType from './src/Enum/HitType'
import Vector2 from './src/Utils/Vector2'

declare module "osu-bpdpc" {
    export {Beatmap}
    export {Colour}
    export {Mods}
    export {HitSound}
    export {HitType}
    export {Vector2}
}