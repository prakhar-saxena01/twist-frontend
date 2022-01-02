import Vue from 'vue';
import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.sidebar = false;
    this.mutes = {};
    this.profanity = false;
  }
};

// getters
const mainGetters = {
  showSidebar: state => state.sidebar,
  mutedUsers: state => state.mutes,
  userMuted: state => user => !!state.mutes[user.id],
  profanityEnabled: state => state.profanity,
};

// actions
const actions = {
  toggleProfanity({ commit }) {
    commit(types.TOGGLE_PROFANITY);
  },

  toggleSidebar({ commit }) {
    commit(types.TOGGLE_SIDEBAR);
  },

  toggleUserMute({ commit, getters }, user) {
    const userMuted = getters.userMuted(user);

    if (userMuted) {
      commit(types.UNMUTE_USER, user);
    } else {
      commit(types.MUTE_USER, user);
    }
  },

  muteUser({ commit, getters }, user) {
    const userMuted = getters.userMuted(user);

    if (!userMuted) {
      commit(types.MUTE_USER, user);
    }
  },

  unmuteUser({ commit, getters }, user) {
    const userMuted = getters.userMuted(user);

    if (userMuted) {
      commit(types.UNMUTE_USER, user);
    }
  },
};

// mutations
const mutations = {
  [types.TOGGLE_PROFANITY](state) {
    state.profanity = !state.profanity;
  },

  [types.TOGGLE_SIDEBAR](state) {
    state.sidebar = !state.sidebar;
  },

  [types.MUTE_USER](state, user) {
    Vue.set(state.mutes, user.id, user);
  },

  [types.UNMUTE_USER](state, user) {
    Vue.delete(state.mutes, user.id);
  },
};

export default class ChatStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
