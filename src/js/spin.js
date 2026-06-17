const defaults = {
  lines: 12,
  length: 7,
  width: 4,
  radius: 10,
  scale: 1,
  corners: 1,
  color: '#000',
  fadeColor: 'transparent',
  animation: 'spinner-line-fade-default',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 2e9,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
};

export class Spinner {
  constructor(opts = {}) {
    this.opts = Object.assign({}, defaults, opts);
  }
  spin(target) {
    this.stop();
    this.el = document.createElement('div');
    this.el.className = this.opts.className;
    this.el.setAttribute('role', 'progressbar');
    css(this.el, {
      position: this.opts.position,
      width: '0',
      zIndex: this.opts.zIndex,
      left: this.opts.left,
      top: this.opts.top,
      transform: `scale(${this.opts.scale})`,
    });
    if (target) {
      target.insertBefore(this.el, target.firstChild || null);
    }
    drawLines(this.el, this.opts);
    return this;
  }
  stop() {
    if (this.el) {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      this.el = undefined;
    }
    return this;
  }
}

function css(el, props) {
  for (let prop in props) {
    el.style[prop] = props[prop];
  }
  return el;
}

function drawLines(el, opts) {
  let borderRadius = Math.round(opts.corners * opts.width * 50) / 100 + 'px';
  let shadow = opts.shadow;

  if (opts.shadow === true) {
    shadow = '0 2px 4px rgba(0,0,0,0.15)';
  }

  for (let i = 0; i < opts.lines; i++) {
    let degrees = ~~((360 / opts.lines) * i + opts.rotate);
    let line = document.createElement('div');

    css(line, {
      position: 'absolute',
      top: `-${opts.width / 2}px`,
      left: `-${opts.length}px`,
      width: opts.length + opts.radius + 'px',
      height: opts.width + 'px',
      background: opts.color,
      boxShadow: shadow,
      transformOrigin: 'right center',
      transform: `rotate(${degrees}deg) translate(${opts.radius}px, 0px)`,
      borderRadius: borderRadius,
    });

    let innerLine = document.createElement('div');

    css(innerLine, {
      width: '100%',
      height: '100%',
      background: opts.color,
      borderRadius: borderRadius,
      animation: `${opts.animation} ${1 / opts.speed}s linear infinite`,
      animationDelay: `${
        (i * opts.direction) / opts.lines / opts.speed - 1 / opts.speed
      }s`,
    });

    line.appendChild(innerLine);
    el.appendChild(line);
  }
}

// Додаємо CSS-анімацію в документ автоматично, якщо її немає
if (typeof document !== 'undefined') {
  const id = 'spin-js-style';

  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;

    style.textContent = `
            @keyframes spinner-line-fade-default {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
        `;

    document.head.appendChild(style);
  }
}
