import Vue from 'vue';
import api from '@/api';
import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.all = [];
    this.altTitle = false;
    this.viewing = null;
    this.sources = [];
    this.autoTrack = true;
    this.resume = true;
    this.drawerOpen = false;
    this.alwaysResume = false;
    this.trackingNotifications = true;
    this.resumeNotifications = true;
    this.library = {};
  }
};

// getters
const mainGetters = {
  allAnime: state => state.all,
  useAltTitle: state => state.altTitle,
  viewingAnime: state => state.viewing,
  episodeSources: state => state.sources,
  resumeEpisodeEnabled: state => state.resume,
  isDrawerOpen: state => state.drawerOpen,

  autoTrackerEnabled: state => state.autoTrack,
  alwaysResumeEpisode: state => state.alwaysResume,
  useTrackingNotifications: state => state.trackingNotifications,
  useResumeNotifications: state => state.resumeNotifications,

  libraryToEpisode: state => ({ library, anime }) =>
    anime.episodes.find(ep => ep.id === library.episode_id),

  getLibrary: state => state.library,

  getLibraryEpisodes: state => id => (state.library[id] || {}),

  getLibraryEpisode: (state, getters) => episode => {
    const episodeId = typeof episode.episode_id === 'number'
      ? episode.episode_id
      : episode.id;

    return getters.getLibraryEpisodes(episode.anime_id)[episodeId];
  },

  getLastWatchedLibraryEpisode: (state, getters) => anime =>
    getters.getLibraryEpisodes(anime.id).lastWatched,

  getLastCompletedLibraryEpisode: (state, getters) => anime =>
    getters.getLibraryEpisodes(anime.id).lastCompleted,

  isEpisodeCompleted: (state, getters) => (episode) => {
    if (episode && getters.getLibraryEpisode(episode)) {
      return !!getters.getLibraryEpisode(episode).completed;
    }

    return false;
  },

  getNextEpisodeToWatch: (state, getters) => (anime) => {
    const lastCompleted = getters.getLastCompletedLibraryEpisode(anime);
    const lastEpisode = anime.episodes[anime.episodes.length - 1];

    let episode = lastEpisode;

    if (!lastCompleted) {
      return undefined;
    }

    for (let i = anime.episodes.length - 1; i >= 0; i -= 1) {
      const epCompleted = getters.isEpisodeCompleted(anime.episodes[i]);
      if (i === 0 && !epCompleted) {
        episode = anime.episodes[i];
        break;
      }

      const prevEpCompleted = getters.isEpisodeCompleted(anime.episodes[i - 1]);
      if (!epCompleted && prevEpCompleted) {
        episode = anime.episodes[i];
        break;
      }
    }

    return episode;
  },
};

// actions
const actions = {
  fetchAllAnime({ commit }) {
    return api.request.anime.getAll().then((anime) => {
      commit(types.RECEIVE_ALL_ANIME, { anime });
      return anime;
    });
  },

  fetchAnime({ commit }, { id }) {
    return api.request.anime.get(id).then((anime) => {
      commit(types.RECEIVE_ANIME, { anime });
      return anime;
    });
  },

  fetchSources({ commit }, { id }) {
    return api.request.anime.getSources(id).then((sources) => {
      commit(types.RECEIVE_SOURCES, { sources });
      return sources;
    });
  },

  clearSources({ commit }) {
    commit(types.CLEAR_SOURCES);
  },

  patchLibrary({ commit, state, rootGetters }) {
    if (rootGetters.user) {
      return api.request.user.patchLibrary({
        library: state.library,
        jwt: rootGetters.user.token,
      })
      .then((library) => {
        commit(types.REPLACE_LIBRARY, library);
      });
    }
  },

  toggleResumeEpisode({ commit }, resume) {
    commit(types.TOGGLE_RESUME_EPISODE, resume);
  },

  toggleDrawerOpen({ commit }, open) {
    commit(types.TOGGLE_DRAWER_OPEN, open);
  },

  clearAnime({ commit }) {
    commit(types.CLEAR_ANIME);
  },

  toggleTitleLang({ commit }) {
    commit(types.TOGGLE_TITLE_LANG);
  },

  createLibraryAnime({ commit, state }, episode) {
    if (!state.library[episode.anime_id]) {
      commit(types.CREATE_LIBRARY_ANIME, {
        id: episode.anime_id,
      });
    }
  },

  createLibraryEpisode({ commit, dispatch, state }, library) {
    dispatch('createLibraryAnime', library);

    if (!state.library[library.anime_id][library.episode_id]) {
      commit(types.CREATE_LIBRARY_EPISODE, library);
    }
  },

  updateLibraryEpisode({ commit, dispatch, rootGetters }, library) {
    dispatch('createLibraryEpisode', library);

    if (rootGetters.user) {
      return api.request.user.patchLibrary({
        episode: library,
        jwt: rootGetters.user.token,
      })
      .then((episode) => {
        commit(types.UPDATE_LIBRARY_EPISODE, episode);
      });
    } else {
      commit(types.UPDATE_LIBRARY_EPISODE, library);
    }
  },

  completeLibraryEpisode({ commit, dispatch, rootGetters }, { library, completed = true }) {
    if (library === undefined) {
      throw new Error('Tried to mark a "undefined" episode as complete');
    }

    const commitedEpisode = {
      ...library,
      completed,
    };

    dispatch('createLibraryEpisode', commitedEpisode);

    commit(types.COMPLETE_LIBRARY_EPISODE, commitedEpisode);

    if (rootGetters.user) {
      return api.request.user.patchLibrary({
        episode: commitedEpisode,
        jwt: rootGetters.user.token,
      })
      .then((episode) => {
        commit(types.COMPLETE_LIBRARY_EPISODE, episode);
      });
    }
  },

  toggleAutoTracker({ commit }) {
    commit(types.TOGGLE_AUTO_TRACKER);
  },

  toggleAlwaysResume({ commit }) {
    commit(types.TOGGLE_ALWAYS_RESUME);
  },

  toggleTrackingNotifications({ commit }) {
    commit(types.TOGGLE_TRACKING_NOTIFICATIONS);
  },

  toggleResumeNotifications({ commit }) {
    commit(types.TOGGLE_RESUME_NOTIFICATIONS);
  },
};

// mutations
const mutations = {
  [types.REPLACE_LIBRARY](state, library) {
    Vue.set(state, 'library', library);
  },

  [types.RECEIVE_ALL_ANIME](state, { anime }) {
    state.all = anime;
  },

  [types.TOGGLE_TITLE_LANG](state) {
    state.altTitle = !state.altTitle;
  },

  [types.CLEAR_ANIME](state) {
    state.viewing = null;
  },

  [types.RECEIVE_ANIME](state, { anime }) {
    state.viewing = anime;
  },

  [types.TOGGLE_RESUME_EPISODE](state, resume) {
    state.resume = resume !== undefined ? resume : !state.resume;
  },

  [types.TOGGLE_DRAWER_OPEN](state, open) {
    state.drawerOpen = open !== undefined ? open : !state.drawerOpen;
  },

  [types.RECEIVE_SOURCES](state, { sources }) {
    Vue.set(state, 'sources', sources);
  },

  [types.CLEAR_SOURCES](state) {
    Vue.set(state, 'sources', []);
  },

  [types.CREATE_LIBRARY_ANIME](state, anime) {
    const library = { ...state.library };
    library[anime.id] = { };

    // eslint-disable-next-line no-underscore-dangle
    Vue.set(state, 'library', library);
  },

  [types.CREATE_LIBRARY_EPISODE](state, entry) {
    const library = { ...state.library };
    const episodes = library[entry.anime_id];
    episodes[entry.episode_id] = entry;

    // eslint-disable-next-line no-underscore-dangle
    Vue.set(state, 'library', library);
  },

  [types.UPDATE_LIBRARY_EPISODE](state, entry) {
    const library = { ...state.library };
    const episodes = library[entry.anime_id];

    episodes[entry.episode_id].progress = entry.progress;
    episodes[entry.episode_id].watched_at = entry.watched_at;
    episodes.lastWatched = episodes[entry.episode_id];

    if (episodes.lastCompleted && episodes.lastCompleted.episode_id === entry.episode_id) {
      episodes.lastCompleted = entry;
    }

    // eslint-disable-next-line no-underscore-dangle
    Vue.set(state, 'library', library);
  },

  [types.COMPLETE_LIBRARY_EPISODE](state, entry) {
    const library = { ...state.library };
    const episodes = library[entry.anime_id];

    episodes[entry.episode_id].watched_at = entry.watched_at;
    episodes[entry.episode_id].completed = entry.completed;

    let lastCompleted = entry;

    if (!entry.completed) {
      const eps = { ...episodes };

      delete eps.lastWatched;
      delete eps.lastCompleted;

      lastCompleted = Object.keys(eps)
        .map(key => eps[key])
        .filter(ep => ep.completed)
        .sort((a, b) => b.watched_at - a.watched_at)[0];
    }

    episodes.lastCompleted = lastCompleted;

    if (episodes.lastWatched && episodes.lastWatched.episode_id === entry.episode_id) {
      episodes.lastWatched = entry;
    }

    // eslint-disable-next-line no-underscore-dangle
    Vue.set(state, 'library', library);
  },

  [types.TOGGLE_AUTO_TRACKER](state) {
    state.autoTrack = !state.autoTrack;
  },

  [types.TOGGLE_ALWAYS_RESUME](state) {
    state.alwaysResume = !state.alwaysResume;
  },

  [types.TOGGLE_TRACKING_NOTIFICATIONS](state) {
    state.trackingNotifications = !state.trackingNotifications;
  },

  [types.TOGGLE_RESUME_NOTIFICATIONS](state) {
    state.resumeNotifications = !state.resumeNotifications;
  },
};

export default class AnimeStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
