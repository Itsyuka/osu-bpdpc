const Circle = require("./Objects/Circle");
const Slider = require("./Objects/Slider");
const Spinner = require("./Objects/Spinner");

class HitObjectFactory {
  static Circle(hitObject) {
    return new Circle(hitObject);
  }

  static Slider(hitObject) {
    return new Slider(hitObject);
  }

  static Spinner(hitObject) {
    return new Spinner(hitObject);
  }
}

module.exports = HitObjectFactory;
