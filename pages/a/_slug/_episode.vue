<template>
  <main :class="{ theater: theaterMode }">
    <div
      :style="{ height: `${floatingPlayerHeight}px` }"
      ref="playerContent"
      class="player-content"></div>

    <anime-info
      v-on:togglecomplete="toggleEpisodeComplete"
      v-on:resume="triggerResume"
      v-on:open="toggleDrawerOpen"
      :open="isDrawerOpen"
      :anime="viewingAnime"
      :currentEpisode="viewingEpisode"
      :playing="floatingPlayerPlaying" />

    <donations />
  </main>
</template>

<style scoped>
.player-content {
  width: 100%;
  background: rgba(255, 255, 255, 0.025);
}

@media (min-width: 840px) {
  main.theater {
    margin: 0;
    overflow: hidden;
    height: 100%;
    z-index: 30;
  }
}
</style>

<script>
import { mapActions, mapGetters } from 'vuex';

import VideoPlayer from '@/components/VideoPlayer';
import AnimeInfo from '@/components/AnimeInfo';
import Donations from '@/components/Donations';

const ADS_SCRIPTS = [
  {
    hid: 'ima-sdk',
    src: '//imasdk.googleapis.com/js/sdkloader/ima3.js',
    type: 'text/javascript',
  },
  {
    hid: 'bebi',
    src: '//st.bebi.com/bebi_v3.js',
    type: 'text/javascript',
  },
];

function loadScript (url) {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.async = true;
    script.src = url;
    script.charset = 'utf8';

    head.appendChild(script);

    script.onload = resolve;
    script.onerror = reject;
  })
}

export default {
  mounted() {
    if (!this.episodeSources.length) {
      this.fetchSources({ id: this.viewingAnime.slug.slug })
    }
  },

  head() {
    let title = this.viewingAnime.title;

    if (this.viewingAnime.alt_title) {
      title += ` (${this.viewingAnime.alt_title})`;
    }

    let description = `You found a great dungeon where you can stream ${title} in HD, `
      + 'and completely free. Not the anime you\'re looking for? We might still have yours. Just look '
      + 'through our homepage, we have tons of great anime on there.';

    const meta = [];
    let script = [];

    if (this.viewingAnime.slug.slug.match(/boku-no-pico|bokunopico/i)) {
      description = `You found a great dungeon where you can stream ${title} in HD `
        + 'and completely free. Not the anime you\'re looking for? We might still have yours. Just look '
        + 'through our homepage, we have tons of great anime on there.';

      meta.push({ hid: 'robots', name: 'robots', content: 'index, nofollow' });

      if (process.server) {
        script = ADS_SCRIPTS;
      }
    } else {
      meta.push({ hid: 'robots', name: 'robots', content: 'noindex, nofollow' });
    }

    meta.push({ hid: 'description', name: 'description', content: description });

    return {
      title: `${title} Episode ${this.viewingEpisode.number} - Anime Twist`,
      meta,
      script,
    }
  },

  async fetch({ store, params, redirect, error }) {
    let viewingAnime = store.getters.viewingAnime;

    if (!viewingAnime || !viewingAnime.slug || viewingAnime.slug.slug !== params.slug) {
      try {
        const [donation, vAnime] = await Promise.all([
          store.dispatch('fetchDonation'),
          store.dispatch('fetchAnime', { id: params.slug }),
        ]);

        viewingAnime = vAnime;
      } catch (err) {
        return error({ statusCode: 404, message: 'Anime not found' });
      }
    }

    if (viewingAnime.episodes.length < 1 || viewingAnime.hidden) {
      return error({ statusCode: 404, message: 'Anime not found' });
    }

    if (process.client) {
      const head = document.head || document.getElementsByTagName('head')[0];

      const scriptLoaded = !!head.querySelector(`script[src="${ADS_SCRIPTS[0].src}"]`);
      if (viewingAnime.slug.slug.match(/boku-no-pico|bokunopico/i) && !scriptLoaded) {
        try {
          await Promise.all([
            loadScript(ADS_SCRIPTS[0].src),
            loadScript(ADS_SCRIPTS[1].src),
          ]);
        } catch (err) {
          console.error(err);
        }
      }
    }

    const sources = store.getters.episodeSources;
    if (sources.length && sources[0].anime_id !== viewingAnime.id) {
      store.dispatch('clearSources');
    }

    const episodes = viewingAnime.episodes;
    const episodeNumber = parseInt(params.episode, 10);
    const episode = episodes.find(ep => ep.number === episodeNumber);

    if (!episode) {
      redirect(`/a/${params.slug}/first`);
      return;
    }

    store.dispatch('setViewingEpisode', episode);
  },

  beforeRouteLeave(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      this.toggleResumeEpisode(true);
      this.toggleDrawerOpen(false);
    }

    next();
  },

  components: {
    VideoPlayer,
    AnimeInfo,
    Donations,
  },

  methods: {
    ...mapActions([
      'fetchSources',
      'toggleTitleLang',
      'toggleResumeEpisode',
      'toggleDrawerOpen',
    ]),

    toggleEpisodeComplete() {
      this.floatingPlayer.toggleEpisodeComplete();
    },

    triggerResume() {
      this.floatingPlayer.triggerResume();
    },
  },

  computed: {
    ...mapGetters([
      'showSidebar',
      'viewingAnime',
      'viewingEpisode',
      'episodeSources',
      'isDrawerOpen',
      'theaterMode',
      'floatingPlayerPlaying',
      'floatingPlayerHeight',
    ]),

    floatingPlayer() {
      return this.$parent.$parent.$refs.floatingPlayer;
    },
  },
};
</script>
