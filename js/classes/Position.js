class Position {
  constructor(x,y,angle,dist) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.dist = dist;
  }
  copy(copyTo=null) {
    if(copyTo) {
      copyTo.x = this.x;
      copyTo.y = this.y;
      copyTo.angle = this.angle;
      copyTo.dist = this.dist;
      return copyTo;
    }
    return new Position(this.x, this.y, this.angle, this.dist)
  }
  convertToAbsoluteXY() {
    return {
      x: this.x + Math.sin(this.angle)*this.dist,
      y: this.y - Math.cos(this.angle)*this.dist
    }
  }
  convertFromAbsoluteXY(x, y) {
    let deltaX = x-this.x;
    let deltaY = y-this.y;
    this.angle = Math.atan2(-deltaY, deltaX)+Math.PI; // TODO is this right?
    this.dist = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2));
  }
}
