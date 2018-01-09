export = Vector2;

declare class Vector2 {
  x: Number;
  y: Number;

  constructor(x: Number, y: Number);

  /**
   * Adds a vector to current and returns a new instance
   */
  add(vec: Vector2): Vector2;

  /**
   * Subtracts a vector to current and returns a new instance
   */
  subtract(vec: Vector2): Vector2;

  /**
   * Scales the vector and returns a new instance
   */
  scale(multiplier: Number): Vector2;

  /**
   * Returns the length of the 2 points in the vector
   */
  length(): Number;

  /**
   * Returns the distance between 2 vectors
   */
  distance(vec: Vector2): Number;

  /**
   * Clones the current vector and returns it
   * Kinda useless but ¯\_(ツ)_/¯
   */
  clone(): Vector2;
}