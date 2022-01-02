import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

export default async function ({ app: { router, $cookies } }) {
  if (process.env.GA !== 'unset') {
    // const experiment = $cookies.get('experiment', { fromRes: true });
    const set = [];

    // if (experiment) {
    //   set.push({ field: 'dimension1', value: experiment });
    // }

    Vue.use(VueAnalytics, {
      id: process.env.GA,
      router,
      set,
    });
  }
}
