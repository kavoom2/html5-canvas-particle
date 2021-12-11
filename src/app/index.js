import GUI from "lil-gui";
// * References and Useful examples
// => https://www.youtube.com/watch?v=VNmTubIDZOY
// => https://codepen.io/nicksheffield/pen/GgdNop

// * 0. Debugger UI
const gui = new GUI();

const wave = {
  y: window.innerHeight / 2,
  length: 0.01,
  amplitude: 100,
  frequency: 0.01,
};

const strokeColor = {
  h: 200,
  s: 50,
  l: 50,
};

const backgroundColor = {
  r: 0,
  g: 0,
  b: 0,
  a: 0.01,
};

const waveFolder = gui.addFolder("Wave");
waveFolder.add(wave, "y", 0, window.innerHeight, 1);
waveFolder.add(wave, "length", -0.01, 0.01, 0.001);
waveFolder.add(wave, "amplitude", -300, 300, 1);
waveFolder.add(wave, "frequency", -0.01, 1, 0.001);

const colorFolder = gui.addFolder("Stroke");
colorFolder.add(strokeColor, "h", 0, 255, 1);
colorFolder.add(strokeColor, "s", 0, 100, 1);
colorFolder.add(strokeColor, "l", 0, 100, 1);

const backgroundFolder = gui.addFolder("Background");
backgroundFolder.add(backgroundColor, "r", 0, 255, 1);
backgroundFolder.add(backgroundColor, "g", 0, 255, 1);
backgroundFolder.add(backgroundColor, "b", 0, 255, 1);
backgroundFolder.add(backgroundColor, "a", 0, 1, 0.01);

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

// * 3. Canvas
let increment = wave.frequency;

const animate = () => {
  requestAnimationFrame(animate);
  ctx.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();

  ctx.moveTo(0, canvas.height / 2);

  for (let i = 0; i < canvas.width; i++) {
    ctx.lineTo(
      i,
      wave.y +
        Math.sin(i * wave.length + increment) *
          wave.amplitude *
          Math.sin(increment)
    );
  }

  ctx.strokeStyle = `hsl(${Math.abs(strokeColor.h * Math.sin(increment))}, ${
    strokeColor.s
  }%, ${strokeColor.l}%)`;
  ctx.stroke();

  ctx.closePath();

  increment += wave.frequency;
};

animate();
