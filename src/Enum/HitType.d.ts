declare enum HitType {
  Normal = 1 << 0,
  Slider = 1 << 1,
  NewCombo = 1 << 2,
  Spinner = 1 << 3,
  ComboSkip1 = 1 << 4,
  ComboSkip2 = 1 << 5,
  ComboSkip3 = 1 << 6,
  Hold = 1 << 7
}

export default HitType;
