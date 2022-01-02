import Vuex from 'vuex';

import { RESTORE_MUTATION, RESTORED } from '@/plugins/persistentStore'

import UserStore from './modules/user';
import AnimeStore from './modules/anime';
import VideoPlayerStore from './modules/video-player';
import DonationStore from './modules/donation';
import MotdStore from './modules/motd';
import NotificationStore from './modules/notification';
import ChatStore from './modules/chat';
import FloatingPlayerStore from './modules/floating-player';

const NODE_ENV = process.env.NODE_ENV;
const live = NODE_ENV === 'test' || NODE_ENV === 'production';
const debug = NODE_ENV === 'test' || NODE_ENV === 'development';
const testing = NODE_ENV === 'testing';

let plugins = [];

if (debug && process.browser) {
  plugins = [];
} else if (testing) {
  plugins = [];
} else {
  plugins = [];
}

const createStore = () => {
  return new Vuex.Store({
    modules: {
      user: new UserStore(),
      anime: new AnimeStore(),
      videoPlayer: new VideoPlayerStore(),
      donation: new DonationStore(),
      motd: new MotdStore(),
      notification: new NotificationStore(),
      chat: new ChatStore(),
      floatingPlayer: new FloatingPlayerStore(),
    },
    mutations: { RESTORE_MUTATION },
    state: { RESTORED },
    strict: !testing && !live,
    plugins,
  });
}

export default createStore;
