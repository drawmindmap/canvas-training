import { GUI } from 'dat.gui';
import 'canvas-5-polyfill';
import { toHighDPI } from './Util';
import Clear from './Clear';
import Path from './Path';
import Text from './Text';
import Other from './Other';

const modules = {
  Clear,
  Path,
  Text,
  Other,
};
const codes = {};

Object.keys(modules).forEach((moduleName) => {
  const module = modules[moduleName];
  Object.keys(module).forEach((methodName) => {
    const method = module[methodName];
    codes[`${moduleName}_${methodName}`] = method;
  });
});

const canvas = document.getElementById('canvas');
const lessons = document.getElementById('lessons');
const code = document.getElementById('code');
const ctx = canvas.getContext('2d');
window.ctx = ctx;
toHighDPI(canvas);

function addOption(lessonName) {
  const option = document.createElement('option');
  option.value = lessonName;
  option.innerHTML = lessonName;
  lessons.add(option);
}

let lastSelected;
async function run() {
  if (!lessons.value) {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    return;
  }
  if (lastSelected && lastSelected.gui) {
    lastSelected.gui.destroy();
  }
  if (lastSelected && lastSelected.after) {
    lastSelected.after();
  }
  const method = codes[lessons.value];
  lastSelected = method;
  if (method.clear !== false) {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.save();
  }
  if (method.draw) {
    method.ctx = ctx;
    if (method.config) {
      const gui = new GUI();
      method.gui = gui;
      Object.keys(method.config).forEach((key) => {
        let controller;
        const value = method.config[key];
        if (value.min || value.max) {
          controller = gui.add(value, 'value', value.min, value.max, value.step);
        } else if (value.values) {
          controller = gui.add(value, 'value', value.values);
        } else if (value.color) {
          controller = gui.addColor(value, 'color');
        } else {
          controller = gui.add(method.config, key);
        }
        controller.name(key);
        if (!(method.config[key] instanceof Function)) {
          controller.onChange(() => {
            ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
            ctx.save();
            method.draw();
            ctx.restore();
          });
        }
      });
    }
    await method.draw();
  } else {
    method(ctx);
  }
  if (method.clear !== false) {
    ctx.restore();
  }
  if (method.before) {
    method.before();
  }
}

addOption('');
Object.keys(codes).forEach((lessonName) => {
  addOption(lessonName);
});

function setLesson(lesson) {
  lessons.value = lesson;
  if (!lessons.value) {
    code.value = '';
    document.title = 'Canvas lessions';
  } else {
    const method = codes[lessons.value];
    code.value = method.draw || method;
    document.title = `Canvas lessions - ${lessons.value}`;
  }
  run();
}

// https://caniuse.com/#search=URLSearchParams
// https://davidwalsh.name/query-string-javascript
// https://usefulangle.com/post/81/javascript-change-url-parameters
// https://github.com/ungap/url-search-params
const urlParams = new URLSearchParams(window.location.search);
const initLession = urlParams.get('lesson') || '';
if (initLession) {
  setLesson(initLession);
}

lessons.addEventListener('change', () => {
  // https://developer.mozilla.org/en-US/docs/Web/API/History_API
  // https://caniuse.com/#search=history
  // https://css-tricks.com/using-the-html5-history-api/
  urlParams.set('lesson', lessons.value);
  window.history.pushState({ value: lessons.value }, null, `?${urlParams.toString()}`);
  setLesson(lessons.value);
});

window.addEventListener('popstate', (e) => {
  const lesson = (e.state && e.state.value) || initLession;
  setLesson(lesson);
});
