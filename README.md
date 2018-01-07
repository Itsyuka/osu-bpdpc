# Osu Beatmap Parser, Difficulty and Performance Calculator

A soon to be full fledged system to allow parsing of beatmaps in .osu (or JSON built in), difficulty and performance calculations.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js 8+

### Installing

In your project add the dependency

```javascript
npm i osu-bpdpc
```

and require inside your javascript file

```javascript
const OsuBPDPC = require('osu-bpdpc');
```

or for specific elements using selective require

```javascript
const {Beatmap} = require('osu-bpdpc');
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details