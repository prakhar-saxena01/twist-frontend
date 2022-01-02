import api from '@/api';
import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.instance = null;
    this.errors = [];
    this.ban = null;
  }
};

// getters
const mainGetters = {
  user: state => state.instance,
  signinErrors: state => state.errors,
  userBan: state => state.ban,
  isUserBanned: state => state.ban && new Date(state.ban.expires_at) > new Date(),
};

// actions
const actions = {
  signin({ commit, state }, form) {
    return api.request.auth.signin(form)
      .then((user) => {
        commit(types.RECEIVE_USER, user);
        return user;
      })

      .catch((error) => {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors;
          commit(types.SIGNIN_ERROR, errors);

          setTimeout(() => {
            const sameErrors = state.errors.filter((err, index) =>
              err.message === errors[index].message);

            if (sameErrors.length === errors.length) {
              commit(types.CLEAR_SIGNIN_ERRORS);
            }
          }, 6000);

          return errors;
        }
      });
  },

  signOut({ commit }) {
    commit(types.SIGNOUT_USER);
  },

  clearSigninErrors({ commit }) {
    commit(types.CLEAR_SIGNIN_ERRORS);
  },

  banUser({ commit }, ban) {
    commit(types.RECEIVE_USER, ban.user);

    delete ban.user;
    ban.expires_at = new Date(ban.expires_at);
    commit(types.BAN_USER, ban);
  },

  unbanUser({ commit }) {
    commit(types.UNBAN_USER);
  },
};

// mutations
const mutations = {
  [types.RECEIVE_USER](state, user) {
    state.instance = user;
  },

  [types.SIGNOUT_USER](state) {
    state.instance = null;
  },

  [types.SIGNIN_ERROR](state, errors) {
    state.errors = errors;
  },

  [types.CLEAR_SIGNIN_ERRORS](state) {
    state.errors = [];
  },

  [types.BAN_USER](state, ban) {
    state.ban = ban;
  },

  [types.UNBAN_USER](state) {
    state.ban = null;
  },
};

export default class UserStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
