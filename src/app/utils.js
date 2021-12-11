export const randomIntFromRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomColor = (colors) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

export const distance = (x1, y1, x2, y2) => {
  const xDiff = x2 - x2;
  const yDiff = y2 - y1;

  return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
};

export default {
  randomIntFromRange,
  randomColor,
  distance,
};
