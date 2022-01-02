function timestamp(number, duration) {
  const h = Math.floor((number / 60 / 60) % 60);
  const m = Math.floor((number / 60) % 60);
  const s = Math.floor(number % 60);

  const pad = (n) => {
    if (n < 10) {
      return `0${n}`;
    }

    return n;
  };

  if (duration >= 3600 && number >= 3600) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }

  return `${pad(m)}:${pad(s)}`;
}

export default {
  name: 'slider',

  props: {
    exponential: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Number,
      default: 0,
    },

    max: {
      type: Number,
      default: 100,
    },

    min: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      default: 'int',
    },

    tooltip: {
      type: Boolean,
      default: false,
    },

    buffered: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  data() {
    return {
      resizeObserver: null,
      bufferContext: null,
      dragging: false,
      tooltipValue: 0,
      tooltipPos: 0,
      completed: 0,
      handlePos: 0,
    };
  },

  mounted() {
    const percentage = (this.value / this.max) * 100;
    this.setCompleted(percentage);

    const slider = this.$el;
    slider.addEventListener('touchstart', this.dragStart);
    slider.addEventListener('mousedown', this.dragStart);

    if (this.tooltip) {
      slider.addEventListener('mouseover', this.mouseOverStart);
    }

    this.bufferContext = this.$refs.bufferCanvas.getContext('2d');

    if ('ResizeObserver' in window) {
      this.resizeObserver = new window.ResizeObserver(() => {
        this.resizeCanvas();
      });

      this.resizeObserver.observe(slider);
    }

    this.resizeCanvas();
  },

  beforeDestroy() {
    const slider = this.$el;
    slider.removeEventListener('touchstart', this.dragStart);
    slider.removeEventListener('mousedown', this.dragStart);

    if (this.tooltip) {
      slider.removeEventListener('mouseover', this.mouseOverStart);
    }

    slider.removeEventListener('touchmove', this.mouseOverMove);
    slider.removeEventListener('mousemove', this.mouseOverMove);

    document.removeEventListener('touchmove', this.dragMove);
    document.removeEventListener('mousemove', this.dragMove);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },

  watch: {
    value(newValue) {
      if (!this.dragging) {
        const percentage = (newValue / this.max) * 100;
        this.setCompleted(percentage);
      }
    },

    buffered(newValue) {
      if (newValue.length > 0) {
        this.updateBuffer();
      }
    },
  },

  methods: {
    setCompleted(percentage) {
      if (percentage === this.completed) {
        return;
      }

      if (this.exponential) {
        this.completed = (percentage ** 2) / 100;
      } else {
        this.completed = percentage;
      }

      this.handlePos = percentage;
    },

    resizeCanvas() {
      const slider = this.$el;
      const bufferCanvas = this.$refs.bufferCanvas;

      bufferCanvas.width = slider.clientWidth * devicePixelRatio;
      bufferCanvas.height = slider.clientHeight * devicePixelRatio;
      this.updateBuffer();
    },

    updateBuffer() {
      const buffered = this.buffered;

      const bufferCanvas = this.$refs.bufferCanvas;
      const bufferContext = this.bufferContext;

      bufferContext.fillStyle = 'rgba(255, 255, 255, .5)';
      bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

      for (let i = 0; i < buffered.length; i += 1) {
        const x1 = bufferCanvas.width * (buffered[i].start / 100);
        const x2 = bufferCanvas.width * (buffered[i].end / 100);

        bufferContext.fillRect(Math.round(x1), 0, Math.round(x2 - x1), bufferCanvas.height);
      }
    },

    updateSlider(e) {
      this.setCompleted(this.getMousePosition(e));
    },

    mouseOverStart() {
      this.$emit('mouseoverstart');

      const slider = this.$el;
      slider.addEventListener('touchmove', this.mouseOverMove);
      slider.addEventListener('mousemove', this.mouseOverMove);

      slider.addEventListener('touchend', this.mouseOverEnd, { once: true });
      slider.addEventListener('mouseup', this.mouseOverEnd, { once: true });
    },

    mouseOverMove(e) {
      const percentage = this.getMousePosition(e);
      this.$emit('mouseover', percentage);
      this.updateTooltip(percentage);
    },

    mouseOverEnd() {
      this.$emit('mouseoverend');

      const slider = this.$el;
      slider.removeEventListener('touchmove', this.mouseOverMove);
      slider.removeEventListener('mousemove', this.mouseOverMove);
    },

    dragStart(e) {
      this.dragging = true;
      this.updateSlider(e);

      this.$emit('dragstart', this.completed);

      document.addEventListener('touchmove', this.dragMove);
      document.addEventListener('mousemove', this.dragMove);

      document.addEventListener('touchend', this.dragEnd, { once: true });
      document.addEventListener('mouseup', this.dragEnd, { once: true });
    },

    dragMove(e) {
      if (!this.dragging) {
        return;
      }
      e.preventDefault();

      this.updateSlider(e);

      if (this.tooltip) {
        this.mouseOverMove(e);
      }

      this.$emit('dragmove', this.completed);
    },

    dragEnd(e) {
      if (!this.dragging) {
        return;
      }

      if (e.type !== 'touchend') {
        this.dragMove(e);
      }

      this.dragging = false;
      this.$emit('dragend', this.completed);

      document.removeEventListener('touchmove', this.dragMove);
      document.removeEventListener('mousemove', this.dragMove);
    },

    updateTooltip(percentage) {
      const tooltip = this.max * (percentage / 100);
      this.tooltipPos = percentage;

      if (this.type === 'time') {
        this.tooltipValue = timestamp(tooltip, this.max);
      } else {
        this.tooltipValue = Math.round(tooltip);
      }
    },

    // TODO: test me somehow
    getMousePosition(e) {
      const slider = this.$el;

      const sliderOffset = slider.getBoundingClientRect().left;
      const pointerPos = (e.touches === undefined)
        ? e.clientX
        : e.touches[0].clientX;

      const position = (pointerPos - sliderOffset) / slider.clientWidth;
      const percentage = Math.min(Math.max(position, 0), 1);

      return percentage * 100;
    },
  },

  computed: {},
};
