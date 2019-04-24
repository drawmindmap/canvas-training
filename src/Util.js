import Colors from './Colors';

export function toHighDPI(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { devicePixelRatio = 1 } = window;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

export function toRadians(angle) {
  return angle / 180 * Math.PI;
}

export function drawControlPoint(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.fillRect(x - 2, y - 2, 4, 4);
  ctx.restore();
}

const array = new Uint32Array(1);

// https://stackoverflow.com/questions/13694626/generating-random-numbers-0-to-1-with-crypto-generatevalues
export function random() {
  window.crypto.getRandomValues(array);
  return array[0] * (2 ** -32);
}

export function randomColor() {
  const randomValue = random();
  const index = Math.floor(randomValue * Colors.length);
  return Colors[index];
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
}

// https://developers.google.com/web/ilt/pwa/working-with-the-fetch-api
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export function loadImageBitmap(src) {
  return fetch(src, {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }).then((response) => {
    if (response.ok) {
      return response.blob();
    }
    throw new Error(response.statusText);
  }).then(blob => createImageBitmap(blob));
}

const colorCanvas = document.createElement('canvas');
colorCanvas.width = 1;
colorCanvas.heith = 1;
const colorCtx = colorCanvas.getContext('2d');

export function getColorValue(color) {
  colorCtx.clearRect(0, 0, 1, 1);
  colorCtx.fillStyle = color;
  colorCtx.fillRect(0, 0, 1, 1);
  const { data } = colorCtx.getImageData(0, 0, 1, 1);
  const value = {
    r: data[0],
    g: data[1],
    b: data[2],
    a: data[3],
    toString() {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    },
  };
  return value;
}

export function getColorImage(image, color) {
  const { width, height } = image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pix = imageData.data;
  const colorValue = getColorValue(color);
  for (let i = 0, n = pix.length; i < n; i += 4) {
    const sourceColor = { r: pix[i + 0], g: pix[i + 1], b: pix[i + 2] };
    const brightness = sourceColor.r * 0.30 + sourceColor.g * 0.59 + sourceColor.b * 0.11;
    const result = {
      r: Math.floor(colorValue.r * brightness / 255),
      g: Math.floor(colorValue.g * brightness / 255),
      b: Math.floor(colorValue.b * brightness / 255),
    };
    pix[i + 0] = result.r;
    pix[i + 1] = result.g;
    pix[i + 2] = result.b;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function getClientPoint(e) {
  return {
    x: (e.touches ? e.touches[0] : e).clientX,
    y: (e.touches ? e.touches[0] : e).clientY,
  };
}

export function getPointAt(view, e) {
  const bound = view.getBoundingClientRect();
  const point = getClientPoint(e);
  return {
    x: point.x - bound.left,
    y: point.y - bound.top,
  };
}
