class HeavyBox extends Entity {
  constructor(width, height) {
    super(width, height);
    this.isMover = true;
    this.isCollider = true;
    this.addSprite(new Sprite(-width/2,-height,null));
    this.weight = 2;
    this.inertiaTop = 7;
    this.inertiaBottom = 7;
    this.inertiaLeft = 7;
    this.inertiaRight = 7;
  }
}
