export default class Vector2 {
  public x: number;
  public y: number;

  public constructor(x: number, y: number);

  /**
   * Adds a vector to current and returns a new instance
   */
  public add(vec: Vector2): Vector2;

  /**
   * Adds a vector to current and returns a new instance with single precision
   */
  public fadd(vec: Vector2): Vector2;

  /**
   * Subtracts a vector to current and returns a new instance
   */
  public subtract(vec: Vector2): Vector2;

  /**
   * Subtracts a vector to current and returns a new instance with single precision
   */
  public fsubtract(vec: Vector2): Vector2;

  /**
   * Scales the vector and returns a new instance
   */
  public scale(multiplier: number): Vector2;

  /**
   * Returns a new instance with a dot product of a vector.
   */
  public dot(vec: Vector2): Vector2;

  /**
   * Divides the vector and returns a new instance.
   */
  public divide(divisor: number): Vector2;

  /**
   * Returns the length of the 2 points in the vector
   */
  public length(): number;

  /**
   * Returns the single precision length of the 2 points in the vector
   */
  public flength(): number;

  /**
   * Returns the distance between 2 vectors
   */
  public distance(vec: Vector2): number;

  /**
   * Returns normaliled vector
   */
  public normalize(): Vector2;

  /**
   * Clones the current vector and returns it
   * Kinda useless but ¯\_(ツ)_/¯
   */
  public clone(): Vector2;
}
