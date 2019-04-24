import {
  toRadians,
  randomColor,
  loadImage,
  loadImageBitmap,
  getColorValue,
  getColorImage,
  getPointAt,
} from './Util';

export default {
  transformations: {
    config: {
      x: {
        value: 100,
        min: -500,
        max: 500,
        step: 1,
      },
      y: {
        value: 100,
        min: -500,
        max: 500,
        step: 1,
      },
      sx1: {
        value: 1.5,
        min: -5,
        max: 5,
        step: 0.1,
      },
      sy1: {
        value: 1,
        min: -5,
        max: 5,
        step: 0.1,
      },
      sx2: {
        value: 1,
        min: -5,
        max: 5,
        step: 0.1,
      },
      sy2: {
        value: 1,
        min: -5,
        max: 5,
        step: 0.1,
      },
      rotation: {
        value: 25,
        min: -360,
        max: 360,
        step: 1,
      },
      shadowColor: {
        color: randomColor(),
      },
      shadowOffsetX: {
        value: 7,
        min: -30,
        max: 30,
        step: 1,
      },
      shadowOffsetY: {
        value: 15,
        min: -30,
        max: 30,
        step: 1,
      },
      shadowBlur: {
        value: 15,
        min: 0,
        max: 100,
        step: 1,
      },
      lineWidth: {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
      },
      strokeStyle: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      const {
        x, y, sx1, sy1, sx2, sy2, rotation,
      } = config;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.lineWidth = config.lineWidth.value;
      ctx.shadowColor = config.shadowColor.color;
      ctx.shadowOffsetX = config.shadowOffsetX.value;
      ctx.shadowOffsetY = config.shadowOffsetY.value;
      ctx.shadowBlur = config.shadowBlur.value;
      ctx.translate(x.value, y.value);
      ctx.scale(sx1.value, sy1.value);
      ctx.scale(sx2.value, sy2.value);
      ctx.rotate(toRadians(rotation.value));
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, 50);
      ctx.moveTo(0, 20);
      ctx.lineTo(20, 20);
      ctx.stroke();
    },
  },
  linearGradient: {
    config: {
      x0: {
        value: 100,
        min: 0,
        max: 500,
        step: 1,
      },
      y0: {
        value: 100,
        min: 0,
        max: 500,
        step: 1,
      },
      x1: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      y1: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      color1: {
        color: randomColor(),
      },
      color2: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      const {
        x0, y0, x1, y1,
      } = config;
      // x0, y0, x1, y1
      const linearGradient = ctx.createLinearGradient(x0.value, y0.value, x1.value, y1.value);
      linearGradient.addColorStop(0, config.color1.color);
      linearGradient.addColorStop(1, config.color2.color);
      ctx.fillStyle = linearGradient;
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      ctx.fill();
      ctx.strokeRect(x0.value, y0.value, x1.value - x0.value, y1.value - y0.value);
    },
  },
  radialGradient: {
    config: {
      x0: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      y0: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      r0: {
        value: 0,
        min: 0,
        max: 500,
        step: 1,
      },
      x1: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      y1: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      r1: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      color1: {
        color: randomColor(),
      },
      color2: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      const {
        x0, y0, r0, x1, y1, r1,
      } = config;
      // x0, y0, r0, x1, y1, r1
      const radialGradient = ctx.createRadialGradient(x0.value, y0.value, r0.value,
        x1.value, y1.value, r1.value);
      radialGradient.addColorStop(0, config.color1.color);
      radialGradient.addColorStop(1, config.color2.color);
      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      ctx.fill();
      ctx.strokeRect(x1.value - r1.value, y1.value - r1.value, r1.value * 2, r1.value * 2);
    },
  },
  pattern: {
    config: {
      color: {
        color: randomColor(),
      },
      x: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      y: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      w: {
        value: 400,
        min: 0,
        max: 400,
        step: 1,
      },
      h: {
        value: 200,
        min: 0,
        max: 400,
        step: 1,
      },
      repetition: {
        value: 'repeat',
        values: [
          'repeat',
          'repeat-x',
          'repeat-y',
          'no-repeat',
        ],
      },
      useCanvas: false,
      imageBitmap: true,
      toDataURL() {
        const a = document.createElement('a');
        a.href = this.canvas.toDataURL();
        a.download = 'canvas.png';
        a.click();
      },
      toBlob() {
        this.canvas.toBlob((blob) => {
          const a = document.createElement('a');
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = 'canvas.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      },
    },
    before() {
      this.config.canvas = this.ctx.canvas;
    },
    async draw() {
      const { ctx, config } = this;
      const {
        x, y, w, h,
      } = config;
      let image;
      if (config.useCanvas) {
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = 40;
        textureCanvas.height = 40;
        const textureCtx = textureCanvas.getContext('2d');
        textureCtx.save();
        textureCtx.lineWidth = 1;
        textureCtx.strokeStyle = config.color.color;
        textureCtx.beginPath();
        textureCtx.moveTo(30, 10);
        textureCtx.lineTo(10, 30);
        textureCtx.moveTo(10, 10);
        textureCtx.lineTo(30, 30);
        textureCtx.stroke();
        textureCtx.restore();
        image = textureCanvas;
      } else if (config.imageBitmap) {
        image = await loadImageBitmap('./images/Canvas_createpattern.png');
      } else {
        image = await loadImage('./images/Canvas_createpattern.png');
      }
      const pattern = ctx.createPattern(image, config.repetition.value);
      ctx.fillStyle = pattern;
      ctx.beginPath();
      ctx.rect(x.value, y.value, w.value, h.value);
      ctx.fill();
      ctx.strokeRect(x.value, y.value, w.value, h.value);
    },
  },
  drawImage: {
    config: {
      sx: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      sy: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      sw: {
        value: 86,
        min: 0,
        max: 400,
        step: 1,
      },
      sh: {
        value: 117,
        min: 0,
        max: 400,
        step: 1,
      },
      dx: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      dy: {
        value: 0,
        min: 0,
        max: 400,
        step: 1,
      },
      dw: {
        value: 86,
        min: 0,
        max: 400,
        step: 1,
      },
      dh: {
        value: 117,
        min: 0,
        max: 400,
        step: 1,
      },
    },
    async draw() {
      const { ctx, config } = this;
      const {
        sx, sy, sw, sh, dx, dy, dw, dh,
      } = config;
      let { image, color } = this;
      if (!image) {
        image = await loadImageBitmap('./images/Canvas_createpattern.png');
        this.image = image;
      }
      if (!color) {
        color = randomColor();
        this.color = color;
      }
      ctx.fillStyle = color;
      ctx.font = '20px Arial';
      // image, dx, dy
      ctx.drawImage(image, dx.value, dy.value);
      // image, dx, dy, dw, dh
      ctx.drawImage(image, dx.value + 150, dy.value, dw.value, dh.value);
      // image, sx, sy, sw, sh, dx, dy, dw, dh
      ctx.drawImage(image, sx.value, sy.value, sw.value, sh.value,
        dx.value + 300, dy.value, dw.value, dh.value);
      ctx.fillText('(image, dx, dy)', dx.value, dy.value + 130);
      ctx.fillText('(image, dx, dy, dw, dh)', dx.value + 150, dy.value + 150);
      ctx.textAlign = 'right';
      ctx.fillText('(image, sx, sy, sw, sh, dx, dy, dw, dh)', dx.value + 300 + 86, dy.value + 170);
    },
  },
  globalAlpha: {
    config: {
      color: {
        color: randomColor(),
      },
      globalAlpha: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.1,
      },
      alpha: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    async draw() {
      const { ctx, config } = this;
      ctx.globalAlpha = config.globalAlpha.value;
      ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      let { image } = this;
      if (!image) {
        image = await loadImageBitmap('./images/Canvas_createpattern.png');
        this.image = image;
      }
      ctx.drawImage(this.image, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      const color = getColorValue(config.color.color);
      color.a = config.alpha.value;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(100, 100, 50, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  imageData: {
    config: {
      color: {
        color: randomColor(),
      },
    },
    async draw() {
      const { ctx, config } = this;
      let { image } = this;
      if (!image) {
        image = await loadImageBitmap('./images/Canvas_createpattern.png');
        this.image = image;
      }
      image = getColorImage(image, config.color.color);
      ctx.drawImage(image, 50, 50, image.width, image.height);
    },
  },
  svg: {
    config: {
      scale: {
        value: 0.5,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
    },
    async draw() {
      const { ctx, config } = this;
      ctx.translate(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight / 2);
      ctx.scale(config.scale.value, config.scale.value);
      let { image } = this;
      if (!image) {
        image = await loadImage('./images/save-money.svg');
        this.image = image;
      }
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    },
  },
  globalCompositeOperation: {
    config: {
      globalCompositeOperation: {
        value: 'source-over',
        values: [
          'source-over', 'source-in', 'source-out', 'source-atop',
          'destination-over', 'destination-in', 'destination-out', 'destination-atop',
          'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken',
          'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
          'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
        ],
      },
      color: {
        color: randomColor(),
      },
      alpha: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    async draw() {
      const { ctx, config } = this;
      ctx.save();
      ctx.translate(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight / 2);
      ctx.scale(0.5, 0.5);
      let { image } = this;
      if (!image) {
        image = await loadImage('./images/save-money.svg');
        this.image = image;
      }
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = config.globalCompositeOperation.value;
      const color = getColorValue(config.color.color);
      color.a = config.alpha.value;
      ctx.fillStyle = color;
      ctx.fillRect(100, 100, 200, 200);
      ctx.restore();
    },
  },
  animation: {
    clear: false,
    config: {
      radius: {
        value: 5,
        min: 0,
        max: 400,
        step: 1,
      },
      color: {
        color: randomColor(),
      },
    },
    clearCanvas() {
      const { ctx } = this;
      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    },
    before() {
      this.clearCanvas();
      this.handleMouseMove = (e) => {
        this.point = getPointAt(this.ctx.canvas, e);
      };
      this.ctx.canvas.addEventListener('mousemove', this.handleMouseMove);
    },
    after() {
      if (this.animation) {
        cancelAnimationFrame(this.animation);
      }
      this.clearCanvas();
      this.ctx.canvas.removeEventListener('mousemove', this.handleMouseMove);
    },
    draw() {
      const { ctx, config } = this;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = config.color.color;
      if (this.point) {
        ctx.beginPath();
        ctx.arc(this.point.x, this.point.y, config.radius.value, 0, Math.PI * 2);
        ctx.fill();
      }
      this.animation = requestAnimationFrame(() => {
        this.draw();
      });
    },
  },
  test: {
    config: {
      radius: {
        value: 50,
        min: 0,
        max: 400,
        step: 1,
      },
    },
    draw() {
      const { ctx, config } = this;
      ctx.beginPath();
      ctx.arc(100, 100, config.radius.value, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
};
