import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.notifications = [];
    this.browserNotifications = false;
  }
}

// getters
const mainGetters = {
  notifications: state => state.notifications,
  useBrowserNotifications: state => state.browserNotifications && Notification.permission === 'granted',
};

// actions
const actions = {
  showNotification({ commit }, notification) {
    commit(types.SHOW_NOTIFICATION, notification);
  },

  hideNotification({ commit, state }, notification) {
    const indx = state.notifications.indexOf(notification);

    if (indx !== -1) {
      commit(types.HIDE_NOTIFICATION, notification);
    }
  },

  clearNotifications({ commit }) {
    commit(types.CLEAR_NOTIFICATIONS);
  },

  toggleBrowserNotifications({ commit, state }, enabled) {
    if (!('Notification' in window)) {
      return;
    }

    if (
      window.Notification.permission !== 'granted'
      && (enabled || !state.useBrowserNotifications)
      && process.env.NODE_ENV !== 'testing'
    ) {
      const onPermission = (permission) => {
        commit(types.TOGGLE_BROWSER_NOTIFICATIONS, permission === 'granted');
      };

      const request = window.Notification.requestPermission();

      if (request && request.then) {
        request.then(onPermission);
      } else {
        window.Notification.requestPermission(onPermission);
      }
    } else {
      commit(types.TOGGLE_BROWSER_NOTIFICATIONS, enabled);
    }
  },
};

// mutations
const mutations = {
  [types.SHOW_NOTIFICATION](state, notification) {
    state.notifications.push(notification);
  },

  [types.HIDE_NOTIFICATION](state, notification) {
    const indx = state.notifications.indexOf(notification);

    if (indx !== -1) {
      state.notifications.splice(indx, 1);
    }
  },

  [types.CLEAR_NOTIFICATIONS](state) {
    state.notifications = [];
  },

  [types.TOGGLE_BROWSER_NOTIFICATIONS](state, enabled) {
    state.browserNotifications = typeof enabled === 'boolean'
      ? enabled
      : !state.browserNotifications;
  },
};

export default class NotificationStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
