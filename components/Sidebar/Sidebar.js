import { mapActions, mapGetters } from 'vuex';

import Checkbox from '@/components/Checkbox';
import Chat from '@/components/Chat';
import Modal from '@/components/Modal';

export default {
  name: 'sidebar',

  data() {
    return {
      chatOpen: false,
    };
  },

  components: {
    Checkbox,
    Chat,
    Modal,
  },

  methods: {
    ...mapActions([
      'toggleBrowserNotifications',
      'toggleTitleLang',
      'toggleAutoplayNext',
      'toggleVideoUi',
      'toggleOversizedPlayer',
      'toggleAutoTracker',
      'toggleAlwaysResume',
      'toggleTrackingNotifications',
      'toggleResumeNotifications',
      'toggleProfanity',
      'signOut',
      'unmuteUser',
    ]),

    toggleMenu() {
      this.$refs.settings.show();
    },

    toggleChat() {
      this.chatOpen = !this.chatOpen;
    },

    toggleAusie(enabled) {
      if (!process.browser) {
        return;
      }

      if (enabled) {
        const styleEl = document.createElement('style');

        styleEl.innerHTML = 'body { transform: rotate(180deg) }';
        styleEl.id = 'upsidedown';
        document.head.appendChild(styleEl);
      } else {
        const styleEl = document.querySelector('#upsidedown');

        if (styleEl) {
          document.head.removeChild(styleEl);
        }
      }
    },
  },

  computed: {
    ...mapGetters([
      'useBrowserNotifications',
      'useAltTitle',
      'autoplayNextVideo',
      'showVideoUI',
      'oversizedPlayer',
      'autoTrackerEnabled',
      'alwaysResumeEpisode',
      'useTrackingNotifications',
      'useResumeNotifications',
      'profanityEnabled',
      'user',
      'mutedUsers',
      'showSidebar',
    ]),

    browserNotificationsSupported() {
      return process.browser && 'Notification' in window;
    },

    greeting() {
      const greetings = [
        'I\'m sorry, do I know you?',
        'Have we met?',
        'Hi there!',
      ];

      if (this.user) {
        const hour = new Date().getHours();
        let time = null;

        if (hour >= 12 && hour < 17) {
          time = 'afternoon';
        } else if (hour > 5 && hour < 12) {
          time = 'morning';
        } else {
          time = 'evening';
        }

        return `Good ${time}, ${this.user.username}`;
      }

      const gLength = greetings.length;
      const gIndex = Math.floor(Math.random() * gLength);

      return greetings[gIndex];
    },
  },
};
