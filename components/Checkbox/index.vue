export default {
  name: 'checkbox',

  mounted() {
    this.polygon = this.$refs.polygon;

    if (this.reflect) {
      this.check();
    } else {
      this.uncheck();
    }

    if (this.disabled) {
      this.disable();
    }
  },

  props: {
    label: {
      type: String,
      required: true,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    reflect: {
      type: Boolean,
      default: undefined,
    },

    floating: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      checked: false,
      polygon: null,
      checkedPoints: [
        { x: 4, y: 12 },
        { x: 4, y: 12 },
        { x: 2, y: 10 },
        { x: 3, y: 9 },
        { x: 5, y: 11 },
        { x: 13, y: 3 },
        { x: 14, y: 4 },
        { x: 10, y: 8 },
        { x: 10, y: 8 },
        { x: 9, y: 9 },
        { x: 9, y: 9 },
        { x: 5, y: 13 },
      ],

      uncheckedPoints: [
        { x: 3, y: 12 },
        { x: 3, y: 12 },
        { x: 3, y: 12 },
        { x: 4, y: 11 },
        { x: 4, y: 11 },
        { x: 12, y: 3 },
        { x: 13, y: 4 },
        { x: 9, y: 8 },
        { x: 9, y: 8 },
        { x: 8, y: 9 },
        { x: 8, y: 9 },
        { x: 4, y: 13 },
      ],

      disabledPoints: [
        { x: 3, y: 12 },
        { x: 7, y: 8 },
        { x: 3, y: 4 },
        { x: 4, y: 3 },
        { x: 8, y: 7 },
        { x: 12, y: 3 },
        { x: 13, y: 4 },
        { x: 9, y: 8 },
        { x: 13, y: 12 },
        { x: 12, y: 13 },
        { x: 8, y: 9 },
        { x: 4, y: 13 },
      ],
    };
  },

  watch: {
    disabled(disabled) {
      if (disabled) {
        this.disable();
      } else {
        this.enable();
      }
    },

    reflect(enabled) {
      this.changeState(enabled);
    },
  },

  methods: {
    toggleState() {
      if (this.reflect === undefined) {
        this.changeState(!this.checked);
        this.$emit('statechange', this.checked);
      } else {
        this.$emit('statechange');
      }
    },

    changeState(state) {
      this.checked = state;

      if (this.disabled) {
        return;
      }

      if (this.checked) {
        this.check();
      } else {
        this.uncheck();
      }
    },

    check() {
      this.checked = true;

      this.polygon.morph({
        points: this.checkedPoints,
        duration: 100,
      });
    },

    uncheck() {
      this.checked = false;

      this.polygon.morph({
        points: this.uncheckedPoints,
        duration: 100,
      });
    },

    disable() {
      this.polygon.morph({
        points: this.disabledPoints,
        duration: 100,
      });
    },

    enable() {
      if (this.checked) {
        this.check();
      } else {
        this.uncheck();
      }
    },
  },
};
