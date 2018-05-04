class Player extends Entity {
  constructor() {
    super(16,27);
    this.isMover = true;
    this.isCollider = true;
    this.isActor = true;
    this.weight = 0.35;
    this.inertiaTop = 5;
    this.inertiaBottom = 5;
    this.inertiaLeft = 5;
    this.inertiaRight = 5;

    this.inShip = null;
    this.moveSpeed = 2.5;
    this.jumpStrength = 6;
    this.airJumps = 2;
    this.remainingAirJumps = 2;
    // this.newPlanetTimer = 0;
    let sprite = new Sprite(-8,-27);
    sprite.animations["standLeft"] = new Animation("./img/sprites.png",18,1,16,27,1);
    sprite.animations["standRight"] = new Animation("./img/sprites.png",1,1,16,27,1);
    sprite.animations["walkLeft"] = new Animation("./img/sprites.png",1,30,17,28,4);
    sprite.animations["walkRight"] = new Animation("./img/sprites.png",1,60,17,28,4);
    sprite.animations["jumpLeft"] = new Animation("./img/sprites.png",1,30,17,28,1);
    sprite.animations["jumpRight"] = new Animation("./img/sprites.png",55,60,17,28,1);
    sprite.currentAnimation = sprite.animations["standRight"];
    this.addSprite(sprite);
    this.actions = {
      "jump": () => {
        if(this.supported) {
          this.speedUp = this.jumpStrength;
          this.remainingAirJumps = this.airJumps;
        } else if(this.remainingAirJumps > 0) {
          this.speedUp = this.jumpStrength;
          this.remainingAirJumps--;
        }
      }
    }
  }
  update() {
    let leftDepressed = this.planet.game.hasDepressedKey("left");
    let rightDepressed = this.planet.game.hasDepressedKey("right");
    if(leftDepressed===-1 && rightDepressed===-1) {
      this.speedCW = 0;
      let previousAnim = this.sprite.currentAnimation;
      if(this.supported) {
        if(previousAnim===this.sprite.animations["walkLeft"] || previousAnim===this.sprite.animations["jumpLeft"]) {
          this.sprite.setAnimation("standLeft");
        }
        if(previousAnim===this.sprite.animations["walkRight"] || previousAnim===this.sprite.animations["jumpRight"]) {
          this.sprite.setAnimation("standRight");
        }
      } else {
        if(previousAnim===this.sprite.animations["walkLeft"] || previousAnim===this.sprite.animations["standLeft"]) {
          this.sprite.setAnimation("jumpLeft");
        }
        if(previousAnim===this.sprite.animations["walkRight"] || previousAnim===this.sprite.animations["standRight"]) {
          this.sprite.setAnimation("jumpRight");
        }
      }
    } else if(leftDepressed > rightDepressed) {
      this.speedCW = -this.moveSpeed;
      if(this.supported)this.sprite.setAnimation("walkLeft"); else this.sprite.setAnimation("jumpLeft");
    } else {
      this.speedCW = this.moveSpeed;
      if(this.supported)this.sprite.setAnimation("walkRight"); else this.sprite.setAnimation("jumpRight");
    }
  }
}
