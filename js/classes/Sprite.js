class Sprite {
  constructor(offsetX,offsetY,z=0,scale=1) {
    this.pos = new Position(0,0,0,0);
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.offsetRotation = 0;
    this.animations = {};
    this.color = "#433";
    this.currentAnimation = null;
    this.scale = scale;
    this.z = z;

    this.entity = null;
  }
  setAnimation(name, frame=0) {
    let anim = this.animations[name];
    if(this.currentAnimation != anim) {
      this.currentAnimation = anim;
      this.currentFrame = frame;
    }
  }
  draw(ctx, camOffsetX, camOffsetY) {
    let drawCollisionInfo = false;
    let drawAbsPos = false;
    ctx.save();
    ctx.fillStyle = "#6af";
    if(this.currentAnimation) {
      ctx.translate(this.pos.x-camOffsetX, this.pos.y-camOffsetY);
      ctx.rotate(this.pos.angle+this.offsetRotation);
      ctx.translate(this.offsetX, this.offsetY-this.pos.dist);
      this.currentAnimation.play(ctx, 0, 0, this.currentFrame);
      if(drawAbsPos) {
        let coords = this.entity.pos.convertToAbsoluteXY();
        ctx.fillText(Math.floor(coords.x)+", "+Math.floor(coords.y),0,0);
      }
      if(drawCollisionInfo) {
        ctx.fillText(this.entity.inertiaTop+"",0,-20);
        ctx.fillText(this.entity.inertiaBottom+"",0,this.entity.height+10);
        ctx.fillText(this.entity.maxCollisionInertiaTop+"",0,-30);
        ctx.fillText(this.entity.maxCollisionInertiaBottom+"",0,this.entity.height+20);
        ctx.fillText(this.entity.inertiaLeft+"",0,0);
        ctx.fillText(this.entity.inertiaRight+"",this.entity.width/2,0);
        ctx.fillText(this.entity.maxCollisionInertiaLeft+"",0,-10);
        ctx.fillText(this.entity.maxCollisionInertiaRight+"",this.entity.width/2,-10);
      }
    } else {
      ctx.translate(-camOffsetX, -camOffsetY);
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = this.color;
      let e = this.entity;
      let halfWidthAngle = (e.width/e.pos.dist)/2;
      let drawAngle = e.pos.angle - Math.PI/2;
      ctx.beginPath();
      if(halfWidthAngle < Math.PI/2) {
        ctx.arc(e.pos.x, e.pos.y, e.pos.dist, drawAngle+halfWidthAngle, drawAngle-halfWidthAngle, true);
        ctx.arc(e.pos.x+Math.cos(drawAngle)*e.height, e.pos.y+Math.sin(drawAngle)*e.height, e.pos.dist,
              drawAngle-halfWidthAngle, drawAngle+halfWidthAngle);
        if(drawCollisionInfo) {
          ctx.fillText(this.entity.inertiaTop+" ",
                e.pos.x+Math.cos(drawAngle)*(this.pos.dist+e.height+5),
                e.pos.y+Math.sin(drawAngle)*(this.pos.dist+e.height+5));
          ctx.fillText(this.entity.inertiaBottom+" ",
                e.pos.x+Math.cos(drawAngle)*(this.pos.dist-10),
                e.pos.y+Math.sin(drawAngle)*(this.pos.dist-10));
          ctx.fillText(this.entity.maxCollisionInertiaTop+" ",
                e.pos.x+Math.cos(drawAngle)*(this.pos.dist+e.height+15),
                e.pos.y+Math.sin(drawAngle)*(this.pos.dist+e.height+15));
          ctx.fillText(this.entity.maxCollisionInertiaBottom+" ",
                e.pos.x+Math.cos(drawAngle)*(this.pos.dist-20),
                e.pos.y+Math.sin(drawAngle)*(this.pos.dist-20));

          ctx.fillText(this.entity.inertiaLeft+" ",
                e.pos.x+Math.cos(drawAngle-e.width/(this.pos.dist+e.height+5)/2)*(this.pos.dist+e.height+5),
                e.pos.y+Math.sin(drawAngle-e.width/(this.pos.dist+e.height+5)/2)*(this.pos.dist+e.height+5));
          ctx.fillText(this.entity.inertiaRight+" ",
                e.pos.x+Math.cos(drawAngle+e.width/(this.pos.dist+e.height+5)/2)*(this.pos.dist+e.height+5),
                e.pos.y+Math.sin(drawAngle+e.width/(this.pos.dist+e.height+5)/2)*(this.pos.dist+e.height+5));
          ctx.fillText(this.entity.maxCollisionInertiaLeft+" ",
                e.pos.x+Math.cos(drawAngle-e.width/(this.pos.dist+e.height+15)/2)*(this.pos.dist+e.height+15),
                e.pos.y+Math.sin(drawAngle-e.width/(this.pos.dist+e.height+15)/2)*(this.pos.dist+e.height+15));
          ctx.fillText(this.entity.maxCollisionInertiaRight+" ",
                e.pos.x+Math.cos(drawAngle+e.width/(this.pos.dist+e.height+15)/2)*(this.pos.dist+e.height+15),
                e.pos.y+Math.sin(drawAngle+e.width/(this.pos.dist+e.height+15)/2)*(this.pos.dist+e.height+15));
        }
      } else {
        ctx.arc(e.pos.x, e.pos.y, e.pos.dist+e.height, drawAngle+halfWidthAngle, drawAngle-halfWidthAngle, true);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}
