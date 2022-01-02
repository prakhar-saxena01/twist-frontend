import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.volume = 0.7;
    this.autoplayNext = true;
    this.showUI = true;
    this.oversized = false;
  }
}

// getters
const mainGetters = {
  videoVolume: state => state.volume,
  autoplayNextVideo: state => state.autoplayNext,
  showVideoUI: state => state.showUI,
  // oversizedPlayer: state => state.oversized,
  // Force oversidePlayed to be false
  // you can now hide the sidebar with a button
  oversizedPlayer: () => false,
};

// actions
const actions = {
  setVideoVolume({ commit }, volume) {
    commit(types.CHANGE_VOLUME, volume);
  },

  toggleAutoplayNext({ commit }) {
    commit(types.TOGGLE_AUTOPLAY_NEXT);
  },

  toggleVideoUi({ commit }) {
    commit(types.TOGGLE_VIDEO_UI);
  },

  toggleOversizedPlayer({ commit }) {
    commit(types.TOGGLE_OVERSIZED_PLAYER);
  },
};

// mutations
const mutations = {
  [types.CHANGE_VOLUME](state, volume) {
    state.volume = volume;
  },

  [types.TOGGLE_AUTOPLAY_NEXT](state) {
    state.autoplayNext = !state.autoplayNext;
  },

  [types.TOGGLE_VIDEO_UI](state) {
    state.showUI = !state.showUI;
  },

  [types.TOGGLE_OVERSIZED_PLAYER](state) {
    state.oversized = !state.oversized;
  },
};


export default class VideoPlayerStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
