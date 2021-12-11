// * References and Useful examples
// => https://www.youtube.com/watch?v=raXW5J1Te7Y&t=1535s
// => https://codepen.io/nicksheffield/pen/GgdNop

import { randomIntFromRange } from "./utils";

// * 1. Canvas Settings
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const canvasSizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const handleResizeEvent = () => {
  canvasSizes.width = window.innerWidth;
  canvasSizes.height = window.innerHeight;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

handleResizeEvent();
window.addEventListener("resize", handleResizeEvent);

// * Set Objcet and App
class Particle {
  constructor(x, y, radius, color) {
    this.initValues = {
      x,
      y,
      radius,
      color,
    };

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.radians = Math.random() * Math.PI * 2;
    this.velocity = 0.05;
    this.distanceFromCenter = randomIntFromRange(50, 120);
  }

  update() {
    const prevPoint = { x: this.x, y: this.y };

    this.radians += this.velocity;
    this.x =
      canvas.width / 2 + Math.cos(this.radians) * this.distanceFromCenter;
    this.y =
      canvas.height / 2 + Math.cos(this.radians) * this.distanceFromCenter;

    const nextPoint = {
      x: this.x,
      y: this.y,
    };

    this.draw(prevPoint, nextPoint);
  }

  draw(lastPoint, nextPoint) {
    if (!lastPoint || !nextPoint) return;

    ctx.beginPath();
    ctx.lineCap = "square";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.radius;

    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();

    ctx.closePath();
  }
}

let particles;

const initApp = () => {
  particles = [];

  for (let i = 0; i < 1; i++) {
    const radius = Math.random() * 2 + 10;
    particles.push(
      new Particle(canvas.width / 2, canvas.height / 2, radius, "#8300EA")
    );
  }
};

const animate = () => {
  requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(0,0,0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((object) => {
    object.update();
  });
};

initApp();
animate();
