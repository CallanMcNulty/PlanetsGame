class Animation {
  constructor(img, x, y, width, height, numFrames, offsetX=0, offsetY=0) {
    this.image = new Image();
    this.image.src = img;
    this.imageX = x;
    this.imageY = y;
    this.width = width;
    this.height = height;
    this.numFrames = numFrames;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.framerate = 7;
  }
  play(ctx,x,y,frame=null) {
    if(!frame===null)this.currentFrame = frame;
    ctx.drawImage(this.image, this.imageX+this.currentFrame*(this.width+1), this.imageY,
                  this.width, this.height, x+this.offsetX, y+this.offsetY, this.width, this.height);
    this.frameCount++;
    if(this.frameCount >= this.framerate) {
      this.frameCount = 0;
      this.currentFrame++;
      if(this.currentFrame >= this.numFrames)this.currentFrame = 0;
    }
  }
}
