export default () => {
  // eslint-disable-next-line func-names
  SVGPolygonElement.prototype.morph = function ({ points, duration = 1000 }) {
    // IE Fix
    if (this.points.length === undefined) {
      this.points.length = this.points.numberOfItems;
    }

    if (this.points[0] === undefined) {
      for (let i = 0; i < this.points.length; i += 1) {
        this.points[i] = this.points.getItem(i);
      }
    }
    // END IE Fix

    // Fix for browsers without "requestAnimationFrame" or "performance" support
    if ('performance' in window === false || 'requestAnimationFrame' in window === false) {
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];

        this.points[index].x = point.x;
        this.points[index].y = point.y;
      }

      return;
    }
    // END Fix

    if (points.length !== this.points.length) {
      throw new Error(`Expected SVGPointList of length ${this.points.length}: length ${points.length} given`);
    }

    const startTime = performance.now();
    const startPoints = Array.from(this.points);

    const morph = (timestamp) => {
      const percentage = duration / (performance.now() - startTime);

      for (let index = 0; index < this.points.length; index += 1) {
        const point = this.points[index];

        const difX = points[index].x - startPoints[index].x;
        const difY = points[index].y - startPoints[index].y;

        point.x += difX / percentage;
        point.y += difY / percentage;
      }

      if (timestamp < startTime + duration) {
        requestAnimationFrame(morph);
      } else {
        for (let index = 0; index < this.points.length; index += 1) {
          const point = this.points[index];

          point.x = points[index].x;
          point.y = points[index].y;
        }
      }
    };

    requestAnimationFrame(morph);
  };
}
