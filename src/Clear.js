import { randomColor } from './Util';

export default {
  clearRect: {
    clear: false,
    draw() {
      const { ctx } = this;
      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      ctx.save();
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      ctx.rect(10, 10, 100, 200);
      ctx.stroke();
      ctx.restore();
    },
  },
  canvas_width_with_bug: {
    clear: false,
    draw() {
      const { ctx } = this;
      ctx.canvas.width = ctx.canvas.width;
      ctx.save();
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      ctx.rect(10, 10, 100, 200);
      ctx.stroke();
      ctx.restore();
    },
  },
  canvas_width: {
    clear: false,
    draw() {
      const { ctx } = this;
      ctx.canvas.width = ctx.canvas.width;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.save();
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      ctx.rect(10, 10, 100, 200);
      ctx.stroke();
      ctx.restore();
    },
  },
};
