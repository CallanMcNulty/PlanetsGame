class Planet {
  constructor(x,y,radius, atmosphereHeight=70) {
    this.game = undefined;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.atmosphereRadius = this.radius+atmosphereHeight;
    this.entities = [];
    this.sprites = [];
    let surface = new Surface(this);
    this.addEntity(surface, 0, -radius/2)
  }
  addSprite(spr, angle, altitude=0) {
    spr.pos.x = this.x;
    spr.pos.y = this.y;
    spr.pos.angle = angle;
    spr.pos.dist = this.radius+altitude;
    this.sprites.push(spr);
  }
  addEntity(entity, angle, altitude=0) {
    if(entity.planet && entity.planet!==this) {
      entity.planet.removeEntity(entity);
    }
    entity.pos.x = this.x;
    entity.pos.y = this.y;
    entity.pos.angle = angle;
    entity.pos.dist = this.radius+altitude;
    entity.planet = this;
    this.entities.push(entity);
    if(entity.sprite) {
      this.sprites.push(entity.sprite);
    }
  }
  removeEntity(entity) {
    this.entities.splice(this.entities.indexOf(entity), 1);
    if(entity.sprite)
      this.sprites.splice(this.sprites.indexOf(entity.sprite), 1);
  }
  update() {
    this.entities.sort(function(a,b) { return a.pos.dist - b.pos.dist; });
    this.entities.forEach(e => { if(e.isMover)e.updateMovement(); });
    this.entities.forEach(e => { if(e.isCollider)e.preCollisionUpdate(); });
    this.entities.forEach(e => { if(e.isCollider)e.updateMounts(); });
    this.entities.forEach(e => { if(e.isCollider)e.updateCollisions(); });
    this.entities.forEach(e => { if(e.isActor)e.updateActions(); });
    this.entities.forEach(e => e.update());
  }
  draw(ctx, camOffsetX, camOffsetY) {
    let gradientX = this.x-camOffsetX;
    let gradientY = this.y-camOffsetY;
    let skyGradient = ctx.createRadialGradient(gradientX, gradientY, this.radius, gradientX, gradientY, this.atmosphereRadius);
    skyGradient.addColorStop(0, "#6080a0");
    skyGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(gradientX-this.atmosphereRadius, gradientY-this.atmosphereRadius, this.atmosphereRadius*2, this.atmosphereRadius*2);
    this.sprites.sort(function(a,b) { return a.z - b.z; });
    this.sprites.forEach(s => s.draw(ctx, camOffsetX, camOffsetY));
  }
}
