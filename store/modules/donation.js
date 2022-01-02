import api from '@/api';
import * as types from '../mutation-types';

// main state
class MainState {
  constructor() {
    this.donation = null;
  }
}

// getters
const mainGetters = {
  donation: state => state.donation,
};

// actions
const actions = {
  fetchDonation({ commit }) {
    return api.request.donation.getReceived().then((donation) => {
      commit(types.RECEIVE_DONATION, { donation });
      return donation;
    });
  },
};

// mutations
const mutations = {
  [types.RECEIVE_DONATION](state, { donation }) {
    state.donation = donation;
  },
};

export default class DonationStore {
  constructor() {
    this.state = new MainState();
    this.getters = mainGetters;
    this.actions = actions;
    this.mutations = mutations;
    this.initialState = new MainState();
  }
};
