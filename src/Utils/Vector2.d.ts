export default class Vector2 {
  public x: number;
  public y: number;

  public constructor(x: number, y: number);

  /**
   * Adds a vector to the current and returns a new instance.
   * @param vec vector to add.
   */
  public add(vec: Vector2): Vector2;

  /**
   * Adds a vector to the current and returns a new instance with single precision.
   * @param vec vector to add.
   */
  public fadd(vec: Vector2): Vector2;

  /**
   * Subtracts a vector from the current and returns a new instance.
   * @param vec vector to substract.
   */
  public subtract(vec: Vector2): Vector2;

  /**
   * Subtracts a vector from the current and returns a new instance with single precision.
   * @param vec vector to substract.
   */
  public fsubtract(vec: Vector2): Vector2;

  /**
   * Scales the current vector and returns a new instance.
   * @param multiplier vector multiplier.
   */
  public scale(multiplier: number): Vector2;

  /**
   * Divides the current vector and returns a new instance.
   * @param multiplier vector divisor.
   */
  public divide(divisor: number): Vector2;

  /**
   * Returns a new instance with a dot product of two vectors.
   * @param vec second vector.
   */
  public dot(vec: Vector2): Vector2;

  /**
   * Returns a length of two points in a vector.
   */
  public length(): number;

  /**
   * Returns a single precision length of two points in a vector.
   */
  public flength(): number;

  /**
   * Returns a distance between two vectors.
   * @param vec second vector.
   */
  public distance(vec: Vector2): number;

  /**
   * Returns a normalized vector.
   */
  public normalize(): Vector2;

  /**
   * Checks if two vectors are equal.
   * @param vec second vector.
   */
  public equals(vec: Vector2): boolean;

  /**
   * Clones the current vector and returns it
   * Kinda useless but ¯\_(ツ)_/¯
   */
  public clone(): Vector2;
}
