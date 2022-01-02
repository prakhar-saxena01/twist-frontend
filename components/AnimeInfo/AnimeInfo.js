import { mapActions, mapGetters } from 'vuex';
import Checkbox from '@/components/Checkbox';

export default {
  name: 'anime-info',

  props: {
    anime: {
      type: Object,
      required: true,
    },

    currentEpisode: {
      type: Object,
      required: true,
    },

    playing: {
      type: Boolean,
      default: false,
    },

    open: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Checkbox,
  },

  computed: {
    ...mapGetters([
      'useAltTitle',
      'isEpisodeCompleted',
      'getLastWatchedLibraryEpisode',
      'getNextEpisodeToWatch',
    ]),

    shouldShowResume() {
      const lastWatched = this.getLastWatchedLibraryEpisode(this.anime);
      const nextToWatch = this.getNextEpisodeToWatch(this.anime);

      if (lastWatched && !lastWatched.completed) {
        return lastWatched.episode_id !== this.currentEpisode.id;
      } else if (nextToWatch) {
        return nextToWatch.number !== this.currentEpisode.number;
      }

      return false;
    },

    showAll() {
      return this.anime.episodes.length <= 20 || this.open;
    },
  },
};
