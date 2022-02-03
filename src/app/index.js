const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const particlesArray = [];
let hue = 0;

const drawCanvas = () => {};

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const mouse = {
  x: null,
  y: null,
};

canvas.addEventListener("click", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;

  // for (let i = 0; i < 10; i++) {
  //   particlesArray.push(new Particle());
  // }
});

canvas.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;

  for (let i = 0; i < 2; i++) {
    particlesArray.push(new Particle());
  }
});

class Particle {
  constructor(x = null, y = null) {
    this.x = x !== null && typeof x === "number" ? x : mouse.x;
    this.y = y !== null && typeof y === "number" ? y : mouse.y;
    this.size = Math.random() * 10 + 1;
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = (Math.random() - 0.5) * 3;
    this.color = `hsl(${hue}, 100%, 50%)`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.size > 0.2) this.size -= 0.01;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const init = () => {
  for (let i = 0; i < 100; i++) {
    particlesArray.push(
      new Particle(canvas.width * Math.random(), canvas.height * Math.random())
    );
  }
};

const handleParticles = () => {
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();

    for (let j = i; j < particlesArray.length; j++) {
      const dx = particlesArray[i].x - particlesArray[j].x;
      const dy = particlesArray[i].y - particlesArray[j].y;

      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance < 100) {
        ctx.beginPath();
        ctx.strokeStyle = particlesArray[i].color;
        ctx.lineWidth = particlesArray[i].size / 10;
        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
        ctx.stroke();
        ctx.closePath();
      }
    }

    if (particlesArray[i].size <= 0.3) {
      particlesArray.splice(i, 1);
      i--;
    }
  }
};

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = " rgba(0, 0, 0, 0.02)";
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  handleParticles();
  hue += 5;

  requestAnimationFrame(animate);
};

init();
animate();
