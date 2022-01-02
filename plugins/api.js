import Vue from 'vue';
import api from '@/api';

export default () => {
  Vue.prototype.$api = api;
}
