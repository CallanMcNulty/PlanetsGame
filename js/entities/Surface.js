class Surface extends Entity {
  constructor(planet) {
    super(Math.PI*2*planet.radius, planet.radius/2);
    this.isCollider = true;
    this.addSprite(new Sprite(-this.width/2,-this.height,null));
    this.weight = 0;
    this.inertiaTop = 10;
    this.inertiaBottom = 10;
    this.inertiaLeft = 10;
    this.inertiaRight = 10;
  }
}
function calculateDistance(a,b) {
  return Math.sqrt(Math.pow(b.x-a.x,2) + Math.pow(b.y-a.y,2));
}
