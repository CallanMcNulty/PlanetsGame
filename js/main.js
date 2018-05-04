// global
var g;

window.onload = function() {
  let canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);

  g = new Game(canvas);
  let p1 = new Planet(0,0,100);
  let player = new Player();
  g.player = player;
  g.addPlanet(p1);
  let p2 = new Planet(300,300,80);
  g.addPlanet(p2);
  let p3 = new Planet(-1000,-1000,900,200);
  g.addPlanet(p3);
  p3.addEntity(player, Math.PI*0.7, 0);
  p3.addEntity(new LightBox(30, 40), Math.PI*.6, 10);
  p3.addEntity(new HeavyBox(20, 70), Math.PI*.8, 10);
  p3.addEntity(new Platform(50, 20, 100, 1), Math.PI*.63, 35);
  p3.addEntity(new LightBox(30, 30), Math.PI*.63, 70);
  g.cameraAngle = -Math.PI*0.7;
  p3.addEntity(new LandedShip(), Math.PI*0.75);
  let p4 = new Planet(-500,500,150);
  g.addPlanet(p4);
  g.start();
};
