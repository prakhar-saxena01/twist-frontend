export default () => {
  if (!window.devicePixelRatio) {
    window.devicePixelRatio = window.screen.deviceXDPI && window.screen.logicalXDPI
      ? window.screen.deviceXDPI / window.screen.logicalXDPI
      : 1;
  }
}
