import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.playing = false;
    this.theater = false;
    this.episode = null;
    this.height = 340;
  }
}

// getters
const mainGetters = {
  viewingEpisode: state => state.episode,
  floatingPlayerPlaying: state => state.floatingPlaying,
  theaterMode: state => state.theater,
  floatingPlayerHeight: state => state.height,
};

// actions
const actions = {
  setViewingEpisode({ commit }, episode) {
    commit(types.SET_VIEWING_EPISODE, episode);
  },

  toggleTheaterMode({ commit }) {
    commit(types.TOGGLE_THEATER);
  },

  toggleFloatingPlayerPlaying({ commit }, playing) {
    commit(types.TOGGLE_FLOATING_PLAYER_PLAYING, playing);
  },

  setFloatingPlayerHeight({ commit }, height) {
    commit(types.SET_FLOATING_PLAYER_HEIGHT, height);
  },
};

// mutations
const mutations = {
  [types.SET_VIEWING_EPISODE](state, episode) {
    state.episode = episode;
  },

  [types.TOGGLE_THEATER](state) {
    state.theater = !state.theater;
  },

  [types.TOGGLE_FLOATING_PLAYER_PLAYING](state, playing) {
    state.floatingPlaying = typeof playing === 'boolean'
      ? playing
      : !state.floatingPlaying;
  },

  [types.SET_FLOATING_PLAYER_HEIGHT](state, height) {
    state.height = height;
  },
};

export default class FloatingPlayerStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
