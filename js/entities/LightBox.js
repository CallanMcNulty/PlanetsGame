class LightBox extends Entity {
  constructor(width, height) {
    super(width, height);
    this.isMover = true;
    this.isCollider = true;
    this.addSprite(new Sprite(-width/2,-height,null));
    this.weight = 0.5;
    this.inertiaTop = 3;
    this.inertiaBottom = 3;
    this.inertiaLeft = 3;
    this.inertiaRight = 3;
  }
}
