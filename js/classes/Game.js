class Game {
  constructor(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.time = 0;
    this.planets = [];
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraXTarget = 0;
    this.cameraYTarget = 0;
    this.cameraPanSpeed = 5;
    this.cameraAngle = 0;
    this.cameraAngleTarget = 0;
    this.cameraRotationSpeed = 0.05;
    this.maxPlanetRadius = 2000;
    this.player = null;
    this.ship = null;
    this.depressedKeys = [];
    this.keyMap = {
      37: "left",
      39: "right",
      38: "up",
      65: "left",
      68: "right",
      87: "up",
      32: "jump",
      69: "interact"
    };
    this.inputsDown = {
      "left": () => {},
      "right": () => {},
      "jump": () => {
        if(this.player) {
          this.player.do.push("jump");
        }
      },
      "interact": () => {
        if(this.player.planet) {
          this.player.planet.entities.forEach(e => e.performInteraction());
        }
      },
      "up": () => {
        if(this.ship) {
          this.ship.do.push("beginThrust");
        } else if(this.player.inShip) {
          this.player.inShip.launch();
          this.ship.do.push("beginThrust");
        }
      }
    };
    this.inputsUp = {
      "left": () => {},
      "right": () => {},
      "up": () => {
        if(this.ship) {
          this.ship.do.push("endThrust");
        }
      }
    };
  }
  start() {
    window.addEventListener("keydown", () => {
      let code = event.keyCode;
      // console.log(code);
      if(this.depressedKeys.indexOf(code)===-1) {
        this.input("down", code);
        this.depressedKeys.push(code)
      }
    });
    window.addEventListener("keyup", () => {
      let code = event.keyCode;
      this.input("up", code);
      this.depressedKeys.splice(this.depressedKeys.indexOf(code), 1);
    });

    var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000/60); };

    var step = () => {
      this.draw();
      this.update();
      animate(step);
    };
    animate(step);
  }
  hasDepressedKey(name) {
    let result = -1;
    this.depressedKeys.forEach((code,i) => {
      if(this.keyMap[code]===name) {
        result = i;
      }
    });
    return result;
  }
  update() {
    this.time ++;
    // camera code
    if(this.ship) {
      this.cameraAngleTarget = this.ship.pos.angle*-1-Math.PI/2;
      this.cameraXTarget = this.ship.pos.x;
      this.cameraYTarget = this.ship.pos.y;
    } else if(this.player) {
      this.cameraAngleTarget = this.player.pos.angle*-1;
      let surfacePos = this.player.pos.copy();
      let atmosDiameter = this.player.planet.atmosphereRadius*2;
      if(atmosDiameter >= Math.min(this.width,this.height)) {
        surfacePos.dist = this.player.planet.radius+this.height/7;
      } else {
        surfacePos.dist = this.player.planet.radius-Math.max(0,atmosDiameter-this.height/2)/2;
      }
      let surfaceAbsPos = surfacePos.convertToAbsoluteXY();
      this.cameraYTarget = surfaceAbsPos.y;
      this.cameraXTarget = surfaceAbsPos.x;
    }

    if(this.cameraX < this.cameraXTarget) this.cameraX += Math.min(this.cameraPanSpeed, this.cameraXTarget-this.cameraX);
    if(this.cameraX > this.cameraXTarget) this.cameraX -= Math.min(this.cameraPanSpeed, this.cameraX-this.cameraXTarget);
    if(this.cameraY < this.cameraYTarget) this.cameraY += Math.min(this.cameraPanSpeed, this.cameraYTarget-this.cameraY);
    if(this.cameraY > this.cameraYTarget) this.cameraY -= Math.min(this.cameraPanSpeed, this.cameraY-this.cameraYTarget);
    let effectiveCameraAngle = this.cameraAngle;
    while(effectiveCameraAngle<0)effectiveCameraAngle+=Math.PI*2;
    while(effectiveCameraAngle>Math.PI*2)effectiveCameraAngle-=Math.PI*2;
    let effectiveCameraAngleTarget = this.cameraAngleTarget;
    while(effectiveCameraAngleTarget<0)effectiveCameraAngleTarget+=Math.PI*2;
    while(effectiveCameraAngleTarget>Math.PI*2)effectiveCameraAngleTarget-=Math.PI*2;
    let angleBetween = effectiveCameraAngleTarget-effectiveCameraAngle;
    let rotationDirection = angleBetween/Math.abs(angleBetween);
    if(Math.abs(angleBetween)>Math.PI) {
      rotationDirection *= -1;
      angleBetween = (Math.PI*2 - Math.abs(angleBetween))*rotationDirection;
    }
    if(angleBetween!==0) {
      if(Math.abs(angleBetween) <= this.cameraRotationSpeed) {
        this.cameraAngle = this.cameraAngleTarget;
      } else {
        this.cameraAngle += this.cameraRotationSpeed*rotationDirection;
      }
    }
    for(let i=0; i<this.planets.length; i++) {
      let planet = this.planets[i];
      if( Math.abs(planet.x+planet.radius-this.cameraX) < this.width/2+this.maxPlanetRadius &&
          Math.abs(planet.y+planet.radius-this.cameraY) < this.height/2+this.maxPlanetRadius) {
        planet.update();
      }
    }
    if(this.ship) {
      this.ship.updateMovement();
      this.ship.updateActions();
      this.ship.update();
    }
  }
  draw() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.translate(this.width/2, this.height/2);
    this.ctx.rotate(this.cameraAngle);
    this.ctx.translate(this.width/-2, this.height/-2);
    for(let i=0; i<this.planets.length; i++) {
      let planet = this.planets[i];
      if( Math.abs(planet.x+planet.radius-this.cameraX) < this.width/2+this.maxPlanetRadius &&
          Math.abs(planet.y+planet.radius-this.cameraY) < this.height/2+this.maxPlanetRadius) {
        planet.draw(this.ctx, this.cameraX-this.width/2, this.cameraY-this.height/2);
      }
    }
    if(this.ship) {
      this.ship.sprite.draw(this.ctx, this.cameraX-this.width/2, this.cameraY-this.height/2);
    }
    this.ctx.translate(this.width/2, this.height/2);
    this.ctx.rotate(this.cameraAngle*-1);
    this.ctx.translate(this.width/-2, this.height/-2);

    // Mini-map
    if(this.ship) {
      let mapRad = 80;
      let scale = .005;
      let mapX = this.width-mapRad;
      let mapY = this.height-mapRad;
      // map background
      this.ctx.strokeStyle = "#fff";
      this.ctx.fillStyle = "#001707";
      this.ctx.beginPath();
      this.ctx.arc(mapX, mapY, mapRad, 0, Math.PI*.5, true);
      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // map lines
      this.ctx.strokeStyle = "#002e0e";
      this.ctx.beginPath();
      this.ctx.moveTo(mapX, mapY-mapRad);
      this.ctx.lineTo(mapX, mapY+mapRad);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(mapX-mapRad, mapY);
      this.ctx.lineTo(mapX+mapRad, mapY);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(mapX, mapY, mapRad/2, 0, Math.PI*2);
      this.ctx.stroke();

      // map contents
      this.ctx.save();
      this.ctx.translate(this.width-mapRad, this.height-mapRad);
      this.ctx.rotate(this.cameraAngle);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, mapRad, 0, Math.PI*2, false);
      this.ctx.clip();
      this.planets.forEach(p => {
        this.ctx.fillStyle = "#0f0";
        this.ctx.beginPath();
        this.ctx.arc((p.x-this.ship.pos.x)*scale, (p.y-this.ship.pos.y)*scale, p.radius*scale, 0, Math.PI*2);
        this.ctx.fill();
      });
      this.ctx.restore();
      this.ctx.fillStyle = "#fff";
      this.ctx.beginPath();
      this.ctx.arc(mapX, mapY, 1, 0, Math.PI*2);
      this.ctx.fill();
    }

    this.drawTextBox("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sollicitudin cursus risus vel ullamcorper. Nam a urna vel augue lobortis gravida. Nulla pharetra, tellus nec commodo porta, eros nibh commodo velit, vel gravida tortor magna id neque. Nullam nec mollis leo. Ut posuere enim diam, vitae aliquam erat mollis vel. Donec vulputate mi ac interdum venenatis. Proin vitae velit ac ipsum laoreet commodo et eget lectus. Aenean ac porta velit, id commodo enim. Phasellus sit amet libero et felis interdum pretium. Aenean accumsan risus quis nulla tristique dapibus. Nulla ultricies, nibh at porta pharetra, metus risus commodo nunc, id tincidunt diam risus id ligula. Nulla eu tempus ante, at malesuada nunc.", 0, 0, 200, 200);
  }
  drawTextBox(text, x, y, width, height, page=1) {
    let padding = 10;
    let lineSpacing = 20;
    let linesPerPage = height/lineSpacing - 1
    let words = text.split(" ");
    let currentLineLength = 0;
    let lines = [""];
    words.forEach(w => {
      let l = this.ctx.measureText(" "+w).width;
      currentLineLength += l;
      if(currentLineLength >= width-2*padding) {
        currentLineLength = l;
        lines.push(w);
      } else {
        lines[lines.length-1] += " "+w;
      }
    });
    this.ctx.rect(x,y,width,height);
    this.ctx.fillStyle = "#000";
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.stroke();
    this.ctx.fillStyle = "#fff";
    for(let i=0; i<linesPerPage; i++) {
      let l = lines[i+linesPerPage*page];
      if(!l) break;
      this.ctx.fillText(l, x+padding, y+lineSpacing+i*lineSpacing);
    }
  }
  input(state, code) {
    let input = this.keyMap[code];
    let func = undefined;
    if(input) {
      if(state==="down") {
        func = this.inputsDown[input];
      } else {
        func = this.inputsUp[input];
      }
    }
    if(func) {
      func();
    }
  }
  addPlanet(planet) {
    this.planets.push(planet);
    planet.game = this;
  }
}
