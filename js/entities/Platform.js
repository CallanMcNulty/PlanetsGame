class Platform extends Entity {
  constructor(width, height, moveDistance=0, moveSpeed=0) {
    super(width, height);
    this.isMover = true;
    this.isCollider = true;
    this.addSprite(new Sprite(-width/2,-height,null));
    this.weight = 0;
    this.inertiaTop = 9;
    this.inertiaBottom = 9;
    this.inertiaLeft = 7;
    this.inertiaRight = 7;
    this.moveDistance = moveDistance;
    this.moveProgress = 0;
    this.moveSpeed = moveSpeed;
    this.speedCW = this.moveSpeed;
  }
  updateMovement() {
    this.moveProgress += this.speedCW;
    if(this.moveProgress >= this.moveDistance) {
      this.speedCW = -this.moveSpeed;
    }
    if(this.moveProgress <= 0) {
      this.speedCW = this.moveSpeed;
    }
    super.updateMovement();
  }
}
