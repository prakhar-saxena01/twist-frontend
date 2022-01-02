import api from '@/api';
import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.message = null;
    this.read = [];
  }
}

// getters
const mainGetters = {
  motd: state => state.message,
  readMotd: state => state.read,
};

// actions
const actions = {
  fetchMotd({ commit }) {
    return api.request.motd.getMessage().then((motd) => {
      commit(types.RECEIVE_MOTD, { motd });
      return motd;
    });
  },

  markMotdRead({ commit }, id) {
    commit(types.MARK_MOTD_READ, id);
  },
};

// mutations
const mutations = {
  [types.RECEIVE_MOTD](state, { motd }) {
    state.message = motd;
  },

  [types.MARK_MOTD_READ](state, id) {
    if (state.read.indexOf(id) === -1) {
      state.read.push(id);
    }
  },
};

export default class MotdStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
