import { randomColor } from './Util';

export default {
  text: {
    config: {
      x: {
        value: 10,
        min: 0,
        max: 500,
        step: 10,
      },
      y: {
        value: 50,
        min: 0,
        max: 500,
        step: 10,
      },
      font: '50px Arial',
      fillStyle: {
        color: randomColor(),
      },
      strokeStyle: {
        color: randomColor(),
      },
      textAlign: {
        value: 'left',
        values: [
          'start',
          'end',
          'left',
          'right',
          'center',
        ],
      },
      textBaseline: {
        value: 'top',
        values: [
          'top',
          'hanging',
          'middle',
          'alphabetic',
          'ideographic',
          'bottom',
        ],
      },
      text: 'AfghijpqyZ',
    },
    draw() {
      const { ctx, config } = this;
      ctx.font = config.font;
      ctx.fillStyle = config.fillStyle.color;
      ctx.strokeStyle = config.strokeStyle.color;
      ctx.textAlign = config.textAlign.value;
      ctx.textBaseline = config.textBaseline.value;
      const size = ctx.measureText(config.text);
      const height = ctx.measureText('e').width * 2;

      // text, x, y, maxWidth
      ctx.fillText(config.text, config.x.value, config.y.value);
      ctx.strokeRect(config.x.value, config.y.value, size.width, height);

      ctx.strokeText(config.text, config.x.value, config.y.value + 100);
      ctx.strokeRect(config.x.value, config.y.value + 100, size.width, height);

      // text base point
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(config.x.value, config.y.value, 2, 0, Math.PI * 2);
      ctx.fill();
    },
  },
};
