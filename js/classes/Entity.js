class Entity {
  constructor(width, height) {
    this.pos = new Position(0,0,0,0);
    this.prevPos = new Position(0,0,0,0);
    this.sprite = null;
    this.width = width;
    this.height = height;
    this.isMover = false;
    this.isCollider = false;
    this.isActor = false;
    this.actions = {};
    this.do = [];
    this.speedCW = 0;
    this.speedUp = 0;
    this.weight = 0;
    this.inertiaTop = 0; //0: no collisions, >0: will push lower value entities
    this.inertiaBottom = 0;
    this.effectiveInertiaTop = 0;
    this.effectiveInertiaBottom = 0;
    this.maxCollisionInertiaTop = 0;
    this.maxCollisionInertiaBottom = 0;
    this.inertiaLeft = 0;
    this.inertiaRight = 0;
    this.effectiveInertiaLeft = 0;
    this.effectiveInertiaRight = 0;
    this.maxCollisionInertiaLeft = 0;
    this.maxCollisionInertiaRight = 0;
    this.mount = undefined;
    this.supported = false;

    this.planet = null;
  }
  // getEffectiveSpeedCW() {
  //   return this.speedCW;// + (this.mount?(this.mount.getEffectiveSpeedCW()/this.mount.pos.dist)*this.pos.dist:0);
  // }
  moveCW(amount) {
    this.pos.angle += amount/this.pos.dist;
    this.pos.angle %= Math.PI*2;
    if(this.pos.angle <= 0) {
      this.pos.angle += Math.PI*2;
    }
    let riders = this.planet.entities.filter(e => e.mount===this);
    riders.forEach(rider => rider.moveCW(amount*rider.pos.dist/this.pos.dist));
  }
  checkCollision(other, includeDistance=false) {
    // returns: 0:different-planet, 1:top-left, 2:top-right, 3:left, 4:right, 5:bottom-left, 6:bottom-right
    // negatives:same-direction-no-collision
    if(this.planet!==other.planet) {
      return 0;
    }
    let lower = (this.pos.dist < other.pos.dist) ? this : other;
    let higher = (other.pos.dist < this.pos.dist) ? this : other;
    let tooHigh = lower.pos.dist + lower.height < higher.pos.dist;
    let bottom = other.prevPos.dist + other.height <= this.prevPos.dist;
    let top = this.prevPos.dist + this.height <= other.prevPos.dist;
    let isOtherGreater = this.pos.angle < other.pos.angle;
    let angleBetween = (isOtherGreater?other:this).pos.angle - (isOtherGreater?this:other).pos.angle;
    let negativeAngle = false;
    if(angleBetween >= Math.PI) {
      angleBetween = Math.PI*2-angleBetween;
      negativeAngle = true;
    }
    let left = (isOtherGreater && negativeAngle) || (!isOtherGreater && !negativeAngle);
    let distanceBetween = angleBetween*higher.pos.dist;
    let result = undefined;
    if(!(this.width/2 + other.width/2 < distanceBetween) && !tooHigh) {
      if(left) {
        result = bottom ? 5 : (top ? 1 : 3);
      } else {
        result = bottom ? 6 : (top ? 2 : 4);
      }
    }
    if(!result) {
      if(left) {
        result = (bottom&&tooHigh) ? -5 : (top ? -1 : -3);
      } else {
        result = (bottom&&tooHigh) ? -6 : (top ? -2 : -4);
      }
    }
    return includeDistance ? { "result":result, "distance":distanceBetween, "negativeAngle":negativeAngle } : result;
  }
  addSprite(spr) {
    spr.pos = this.pos;
    this.sprite = spr;
    spr.entity = this;
  }
  updateMovement() {
    this.prevPos = this.pos.copy();
    this.moveCW(this.speedCW);
    this.pos.dist += this.speedUp;
    this.speedUp -= this.weight;
  }
  preCollisionUpdate() {
    this.supported = false;
    this.mount = undefined;
    this.effectiveInertiaTop = Math.max(this.inertiaTop, this.maxCollisionInertiaTop);
    this.effectiveInertiaBottom = Math.max(this.inertiaBottom, this.maxCollisionInertiaBottom);
    this.maxCollisionInertiaTop = 0;
    this.maxCollisionInertiaBottom = 0;
    this.effectiveInertiaLeft = Math.max(this.inertiaLeft, this.maxCollisionInertiaLeft);
    this.effectiveInertiaRight = Math.max(this.inertiaRight, this.maxCollisionInertiaRight);
    this.maxCollisionInertiaLeft = 0;
    this.maxCollisionInertiaRight = 0;
  }
  updateMounts() {
    for(let i=this.planet.entities.indexOf(this)+1; i<this.planet.entities.length; i++) {
      let e = this.planet.entities[i];
      let collision = this.checkCollision(e, true);
      let coll = collision["result"];
      if(4 < coll && this.weight > 0) {
        this.mount = e;
      } else if(0 < coll&&coll < 3 && e.weight > 0) {
        e.mount = this;
      }
    }
  }
  updateCollisions() {
    for(let i=this.planet.entities.indexOf(this)+1; i<this.planet.entities.length; i++) {
      let e = this.planet.entities[i];
      if(e.isCollider) {
        let collision = this.checkCollision(e, true);
        let distanceBetween = collision["distance"];
        let coll = collision["result"];
        if(4 < coll) {
          if(this.effectiveInertiaBottom <= e.effectiveInertiaTop) {
            this.speedUp = 0;
            this.pos.dist = e.pos.dist + e.height;
            this.maxCollisionInertiaTop = Math.max(this.maxCollisionInertiaTop, e.effectiveInertiaTop);
            this.supported = true;
          } else {
            e.speedUp = 0;
            e.pos.dist = this.pos.dist - e.height - 0.01;
            e.maxCollisionInertiaBottom = Math.max(e.maxCollisionInertiaBottom, this.effectiveInertiaBottom);
            e.supported = true;
          }
        } else if(2 < coll) {
          let lessInertia = coll===3 ? this.effectiveInertiaLeft <= e.effectiveInertiaRight :
                                      (this.effectiveInertiaRight <= e.effectiveInertiaLeft);
          let moved = lessInertia?this:e;
          let inert = lessInertia?e:this;
          moved.moveCW((this.width/2 + e.width/2 - Math.abs(distanceBetween)) *
                        (inert.pos.angle < moved.pos.angle ? 1 : -1) * (collision["negativeAngle"] ? -1 : 1));
          if(coll===3) {
            if(moved===this) {
              moved.maxCollisionInertiaRight = Math.max(moved.maxCollisionInertiaRight, inert.effectiveInertiaRight);
            } else {
              moved.maxCollisionInertiaLeft = Math.max(moved.maxCollisionInertiaLeft, inert.effectiveInertiaLeft);
            }
          } else if(coll===4) {
            if(moved===this) {
              moved.maxCollisionInertiaLeft = Math.max(moved.maxCollisionInertiaLeft, inert.effectiveInertiaLeft);
            } else {
              moved.maxCollisionInertiaRight = Math.max(moved.maxCollisionInertiaRight, inert.effectiveInertiaRight);
            }
          }
        } else if(0 < coll) {
          if(this.effectiveInertiaTop <= e.effectiveInertiaBottom) {
            this.speedUp = 0;
            this.pos.dist = e.pos.dist - this.height - 0.01;
            this.maxCollisionInertiaBottom = Math.max(this.maxCollisionInertiaBottom, e.effectiveInertiaBottom);
            this.supported = true;
          } else {
            e.speedUp = 0;
            e.pos.dist = this.pos.dist + this.height;
            e.maxCollisionInertiaTop = Math.max(e.maxCollisionInertiaTop, this.effectiveInertiaTop);
            e.supported = true;
          }
        }
      }
    }
  }
  updateActions() {
    this.do.forEach((a)=>{
      this.actions[a]();
    });
    this.do = [];
  }
  update() {}
  performInteraction() {
    let collision = this.checkCollision(this.planet.game.player, true);
    if(collision.result > 0 || ((collision.result===-3 || collision.result===-4) && collision.distance < 30)) {
      this.interact();
    }
  }
  interact() {}
}
