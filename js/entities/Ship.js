class LandedShip extends Entity {
  constructor() {
    super(25,53);//33,61);
    this.isCollider = true;
    this.isMover = true;
    this.weight = 0.01;
    this.inertiaTop = 1;
    this.inertiaBottom = 1;
    this.inertiaLeft = 1;
    this.inertiaRight = 1;
    let sprite = new Sprite(-16,-61, 1);
    sprite.animations["vacant"] = new Animation("./img/sprites.png",73,1,47,61,1,-7);
    sprite.animations["occupied"] = new Animation("./img/sprites.png",121,1,47,61,1,-7);
    this.addSprite(sprite);
    this.sprite.setAnimation("vacant");
    this.occupied = false;
  }
  interact() {
    this.occupied = !this.occupied;
    if(this.occupied) {
      this.planet.removeEntity(this.planet.game.player);
      this.sprite.setAnimation("occupied");
      this.planet.game.player.inShip = this;
    } else {
      this.planet.addEntity(this.planet.game.player, this.pos.angle, this.pos.dist-this.planet.radius+this.height);
      this.sprite.setAnimation("vacant");
      this.planet.game.player.inShip = null;
    }
  }
  launch() {
    let absCoords = this.pos.convertToAbsoluteXY();
    this.planet.game.ship = new FlyingShip(this.planet.game, absCoords.x, absCoords.y, this.pos.angle-Math.PI*0.5);
    this.planet.game.player.planet=null;
    this.planet.removeEntity(this);
  }
  update() {
    // if(this.supported) {
    //   this.isMover = false;
    //   this.isCollider = false;
    // } else {
    //   this.isMover = true;
    //   this.isCollider = true;
      if(this.occupied) {
        this.planet.game.player.planet = this.planet;
        this.pos.copy(this.planet.game.player.pos);
      }
    // }
  }
}
class FlyingShip extends Entity {
  constructor(game,x,y,angle) {
    super(33,61);
    this.game = game;
    this.pos.x = x;
    this.pos.y = y;
    this.pos.angle = angle;
    let sprite = new Sprite(-17,-61, 1);
    sprite.offsetRotation = Math.PI*0.5;
    sprite.animations["thrusting"] = new Animation("./img/sprites.png",169,1,47,80,2,-7);
    sprite.animations["noThrust"] = new Animation("./img/sprites.png",121,1,47,61,1,-7);
    this.addSprite(sprite);

    this.thrusting = false;
    this.currentSpeed = 0;
    this.moveSpeed = 4;
    this.maxSpeed = 4;
    this.deceleration = 0.08;
    this.currentRotationSpeed = 0;
    this.rotationSpeed = 0.03;
    this.isActor = true;
    this.sprite.setAnimation("thrusting");
    this.actions = {
      "beginThrust": () => {
        this.currentSpeed+=this.moveSpeed;
        this.currentSpeed=Math.min(this.currentSpeed,this.maxSpeed);
        this.thrusting=true;
      },
      "endThrust": () => this.thrusting = false,
      // "beginCWRotation": () => this.currentRotationSpeed+=this.rotationSpeed,
      // "beginCCWRotation": () => this.currentRotationSpeed-=this.rotationSpeed,
      // "endCWRotation": () => this.currentRotationSpeed-=this.rotationSpeed,
      // "endCCWRotation": () => this.currentRotationSpeed+=this.rotationSpeed
      // "beginCWRotation": () => this.currentRotationSpeed = this.rotationSpeed,
      // "beginCCWRotation": () => this.currentRotationSpeed = -this.rotationSpeed,
      // "endCWRotation": () => this.currentRotationSpeed = 0,
      // "endCCWRotation": () => this.currentRotationSpeed = 0
    }
  }
  updateMovement() {
    this.pos.angle += this.currentRotationSpeed;
    this.pos.x += Math.cos(this.pos.angle)*this.currentSpeed;
    this.pos.y += Math.sin(this.pos.angle)*this.currentSpeed;
    if(!this.thrusting) {
      this.currentSpeed-=this.deceleration;
      this.sprite.setAnimation("noThrust");
    } else {
      this.currentSpeed = this.moveSpeed;
      this.sprite.setAnimation("thrusting");
    }
    this.currentSpeed = Math.max(0,this.currentSpeed);
    this.currentSpeed = Math.min(this.maxSpeed,this.currentSpeed);
  }
  update() {
    let leftDepressed = this.game.hasDepressedKey("left");
    let rightDepressed = this.game.hasDepressedKey("right");
    if(leftDepressed===-1 && rightDepressed===-1) {
      this.currentRotationSpeed = 0;
    } else if(leftDepressed > rightDepressed) {
      this.currentRotationSpeed = -this.rotationSpeed;
    } else {
      this.currentRotationSpeed = this.rotationSpeed;
    }

    let closePlanet = this.game.planets.find(p => calculateDistance(this.pos, p) < p.atmosphereRadius);
    if(closePlanet) {
      if(this.thrusting) {
        // this.currentSpeed = 1;
        this.maxSpeed = 1;
      } else {
        let landingShip = new LandedShip();
        landingShip.occupied = true;
        landingShip.sprite.setAnimation("occupied");
        // landingShip.isMover = true;
        // landingShip.isCollider = true;
        let newPos = new Position(closePlanet.x, closePlanet.y,0,0);
        newPos.convertFromAbsoluteXY(this.pos.x,this.pos.y);
        closePlanet.addEntity(landingShip, newPos.angle*-1-Math.PI*0.5, newPos.dist-closePlanet.radius);
        this.game.ship = null;
        this.game.player.planet = closePlanet;
        this.game.player.inShip = landingShip;
        landingShip.pos.copy(this.game.player.pos);
      }
    } else {
      // this.currentSpeed = this.moveSpeed;
      this.maxSpeed = this.moveSpeed;
    }
  }
}
