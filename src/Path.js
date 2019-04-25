import {
  toRadians,
  drawControlPoint,
  randomColor,
  delay,
} from './Util';

export default {
  moveTo_lineTo: {
    config: {
      x: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      y: {
        value: 10,
        min: 0,
        max: 500,
        step: 1,
      },
      lineWidth: {
        value: 10,
        min: 0,
        max: 20,
        step: 1,
      },
      lineCap: {
        value: 'butt',
        values: [
          'butt',
          'round',
          'square',
        ],
      },
      lineJoin: {
        value: 'miter',
        values: [
          'round',
          'bevel',
          'miter',
        ],
      },
      miterLimit: {
        value: 10,
        min: 0,
        max: 30,
        step: 1,
      },
      lineDash: '',
      lineDashOffset: {
        value: 0,
        min: -100,
        max: 100,
        step: 1,
      },
      strokeStyle: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.lineWidth = config.lineWidth.value;
      ctx.lineCap = config.lineCap.value;
      ctx.lineJoin = config.lineJoin.value;
      ctx.miterLimit = config.miterLimit.value;
      const lineDash = config.lineDash.split(',');
      if (lineDash.length > 1) {
        ctx.setLineDash(lineDash);
      }
      ctx.lineDashOffset = config.lineDashOffset.value;
      ctx.beginPath();
      ctx.moveTo(config.x.value, config.y.value);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      ctx.lineTo(200, 10);
      ctx.moveTo(100, 100);
      ctx.lineTo(200, 100);
      ctx.stroke();
    },
  },
  closePath: {
    config: {
      lineWidth: {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
      },
      strokeStyle: {
        color: randomColor(),
      },
      closePath: true,
    },
    draw() {
      const { ctx, config } = this;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.lineWidth = config.lineWidth.value;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      if (config.closePath) {
        ctx.closePath();
      }
      ctx.stroke();
    },
  },
  fill: {
    config: {
      fillStyle: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      ctx.fillStyle = config.fillStyle.color;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      ctx.fill();
    },
  },
  fill_stroke: {
    config: {
      lineWidth: {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
      },
      strokeStyle: {
        color: randomColor(),
      },
      fillStyle: {
        color: randomColor(),
      },
      fill: true,
      stroke: true,
    },
    draw() {
      const { ctx, config } = this;
      ctx.fillStyle = config.fillStyle.color;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.lineWidth = config.lineWidth.value;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      if (config.fill) {
        ctx.fill();
      }
      if (config.stroke) {
        ctx.stroke();
      }
    },
  },
  stroke_fill: {
    config: {
      lineWidth: {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
      },
      strokeStyle: {
        color: randomColor(),
      },
      fillStyle: {
        color: randomColor(),
      },
      fill: true,
      stroke: true,
    },
    draw() {
      const { ctx, config } = this;
      ctx.fillStyle = config.fillStyle.color;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.lineWidth = config.lineWidth.value;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      if (config.stroke) {
        ctx.stroke();
      }
      if (config.fill) {
        ctx.fill();
      }
    },
  },
  async without_beginPath(ctx) {
    ctx.strokeStyle = randomColor();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(200, 10);
    ctx.lineTo(300, 210);
    ctx.lineTo(100, 210);
    ctx.stroke();
    await delay(2000);
    if (ctx.canvas._lesson !== 'Path_without_beginPath') {
      return;
    }
    ctx.strokeStyle = randomColor();
    ctx.rect(10, 10, 100, 100);
    ctx.stroke();
  },
  async with_beginPath(ctx) {
    ctx.strokeStyle = randomColor();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(200, 10);
    ctx.lineTo(300, 210);
    ctx.lineTo(100, 210);
    ctx.stroke();
    await delay(2000);
    if (ctx.canvas._lesson !== 'Path_with_beginPath') {
      return;
    }
    ctx.strokeStyle = randomColor();
    ctx.beginPath();
    ctx.rect(10, 10, 100, 100);
    ctx.stroke();
  },
  curve: {
    config: {
      color: {
        color: randomColor(),
      },
      cpx: {
        value: 160,
        min: 0,
        max: 500,
        step: 1,
      },
      cpy: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      cp1x: {
        value: 85,
        min: 0,
        max: 500,
        step: 1,
      },
      cp1y: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      cp2x: {
        value: 235,
        min: 0,
        max: 500,
        step: 1,
      },
      cp2y: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
    },
    draw() {
      const { ctx, config } = this;

      ctx.strokeStyle = config.color.color;
      ctx.beginPath();
      const p1 = { x: 10, y: 100 };
      const p2 = { x: 310, y: 100 };
      const {
        cpx, cpy, cp1x, cp1y, cp2x, cp2y,
      } = config;
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(cpx.value, cpy.value, p2.x, p2.y);
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1x.value, cp1y.value, cp2x.value, cp2y.value, p2.x, p2.y);
      ctx.stroke();
      drawControlPoint(ctx, cpx.value, cpy.value);
      drawControlPoint(ctx, cp1x.value, cp1y.value);
      drawControlPoint(ctx, cp2x.value, cp2y.value);
    },
  },
  arcTo: {
    config: {
      color1: {
        color: randomColor(),
      },
      color2: {
        color: randomColor(),
      },
      x0: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      y0: {
        value: 50,
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
      x2: {
        value: 0,
        min: 0,
        max: 500,
        step: 1,
      },
      y2: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      radius: {
        value: 100,
        min: 0,
        max: 500,
        step: 1,
      },
    },
    draw() {
      const { ctx, config } = this;

      ctx.lineWidth = 3;
      ctx.strokeStyle = config.color1.color;
      ctx.beginPath();
      ctx.arc(100, 100, 100, 0, Math.PI * 2);
      ctx.rect(0, 0, 200, 200);
      ctx.stroke();
      ctx.strokeStyle = config.color2.color;
      ctx.beginPath();
      const {
        x0, y0, x1, y1, x2, y2, radius,
      } = config;
      ctx.moveTo(x0.value, y0.value);
      // x1, y1, x2, y2, radius
      ctx.arcTo(x1.value, y1.value, x2.value, y2.value, radius.value);
      ctx.lineTo(150, 200);
      ctx.stroke();
      drawControlPoint(ctx, x0.value, y0.value);
      drawControlPoint(ctx, x1.value, y1.value);
      drawControlPoint(ctx, x2.value, y2.value);
    },
  },
  arc: {
    config: {
      color: {
        color: randomColor(),
      },
      cx: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      cy: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      radius: {
        value: 80,
        min: 0,
        max: 500,
        step: 1,
      },
      startAngle: {
        value: 0,
        min: -360,
        max: 360,
        step: 1,
      },
      endAngle: {
        value: 90,
        min: -360,
        max: 360,
        step: 1,
      },
      anticlockwise: true,
    },
    draw() {
      const { ctx, config } = this;

      ctx.strokeStyle = config.color.color;
      ctx.beginPath();
      const {
        cx, cy, radius, startAngle, endAngle, anticlockwise,
      } = config;
      ctx.moveTo(cx.value, cy.value);
      // x, y, radius, startAngle, endAngle, anticlockwise
      ctx.arc(cx.value, cy.value, radius.value,
        toRadians(startAngle.value), toRadians(endAngle.value), anticlockwise);
      ctx.stroke();
      drawControlPoint(ctx, cx.value, cy.value);
    },
  },
  arc_without_subpath(ctx) {
    ctx.strokeStyle = randomColor();
    ctx.beginPath();
    ctx.arc(300, 300, 80, 0, Math.PI * 2);
    ctx.moveTo(20, 100);
    // x, y, radius, startAngle, endAngle, anticlockwise
    ctx.arc(100, 100, 80, Math.PI / 2, Math.PI, false);
    ctx.moveTo(300, 180);
    ctx.arc(300, 100, 80, Math.PI / 2, Math.PI, false);
    ctx.arc(100, 300, 80, 0, Math.PI * 2);
    ctx.stroke();
  },
  ellipse: {
    config: {
      color: {
        color: randomColor(),
      },
      cx: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      cy: {
        value: 200,
        min: 0,
        max: 500,
        step: 1,
      },
      radiusX: {
        value: 100,
        min: 0,
        max: 500,
        step: 1,
      },
      radiusY: {
        value: 60,
        min: 0,
        max: 500,
        step: 1,
      },
      rotation: {
        value: 15,
        min: -360,
        max: 360,
        step: 1,
      },
      startAngle: {
        value: 0,
        min: -360,
        max: 360,
        step: 1,
      },
      endAngle: {
        value: 360,
        min: -360,
        max: 360,
        step: 1,
      },
      anticlockwise: false,
    },
    draw() {
      const { ctx, config } = this;

      ctx.strokeStyle = config.color.color;
      ctx.beginPath();
      const {
        cx, cy, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise,
      } = config;
      ctx.moveTo(cx.value, cy.value);
      // x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise
      ctx.ellipse(cx.value, cy.value, radiusX.value, radiusY.value, toRadians(rotation.value),
        toRadians(startAngle.value), toRadians(endAngle.value), anticlockwise);
      ctx.stroke();
      drawControlPoint(ctx, cx.value, cy.value);
    },
  },
  rect(ctx) {
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(200, 20);
    ctx.rect(30, 10, 100, 200);
    ctx.strokeStyle = randomColor();
    ctx.strokeRect(100, 50, 100, 100);
    ctx.lineTo(300, 300);
    ctx.strokeStyle = randomColor();
    ctx.stroke();
  },
  clip: {
    config: {
      clipRect: true,
      clipCircle: true,
      clipTwoShape: false,
      color: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      ctx.save();

      if (config.clipTwoShape) {
        if (config.clipRect || config.clipCircle) {
          ctx.beginPath();
          if (config.clipRect) {
            ctx.rect(20, 20, 60, 60);
          }

          if (config.clipCircle) {
            ctx.arc(70, 70, 50, 0, Math.PI * 2);
          }
          ctx.clip();
        }
      } else {
        if (config.clipRect) {
          ctx.beginPath();
          ctx.rect(20, 20, 60, 60);
          ctx.clip();
        }

        if (config.clipCircle) {
          ctx.beginPath();
          ctx.arc(70, 70, 50, 0, Math.PI * 2);
          ctx.clip();
        }
      }

      ctx.beginPath();
      ctx.fillStyle = config.color.color;
      ctx.rect(0, 0, 100, 100);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(0, 0, 100, 100);
      ctx.restore();
    },
  },
  path2d: {
    config: {
      fillStyle: {
        color: randomColor(),
      },
    },
    draw() {
      const { ctx, config } = this;
      ctx.fillStyle = config.fillStyle.color;
      const path2d = new Path2D();
      path2d.moveTo(200, 10);
      path2d.lineTo(300, 210);
      path2d.lineTo(100, 210);
      ctx.fill(path2d);
    },
  },
  roundRect: {
    config: {
      color: {
        color: randomColor(),
      },
      radius: {
        value: 5,
        min: 0,
        max: 20,
        step: 1,
      },
    },
    draw() {
      function roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.lineTo(x + width - radius, y + height);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.lineTo(x + width, y + radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.lineTo(x + radius, y);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.stroke();
      }
      const { ctx, config } = this;
      ctx.strokeStyle = config.color.color;
      ctx.lineWidth = 2;
      roundedRect(ctx, 50, 50, 250, 150, config.radius.value);
    },
  },
};
