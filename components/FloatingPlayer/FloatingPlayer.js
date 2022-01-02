import { mapActions, mapGetters, mapState } from 'vuex';
import Raven from 'raven-js';

import VideoPlayer from '@/components/VideoPlayer';

var _0x49c1=['1245228AfBSKB','4639952PzGHDf','3uhwiJg','884827hKZLCN','546729tIWkHT','370299czMimq','1twIOFF','1584226QKksAM','433915qulOMr'];
var _0x256b=function(_0x420154,_0x263799){_0x420154=_0x420154-0x1cb;var _0x49c10c=_0x49c1[_0x420154];return _0x49c10c;};
(function(_0x4d7342,_0xf4c3a){var _0x35696f=_0x256b;while(!![]){try{var _0x463f5a=-parseInt(_0x35696f(0x1cc))*-parseInt(_0x35696f(0x1ce))+parseInt(_0x35696f(0x1d3))+-parseInt(_0x35696f(0x1cd))+-parseInt(_0x35696f(0x1d2))+-parseInt(_0x35696f(0x1cf))+-parseInt(_0x35696f(0x1cb))*parseInt(_0x35696f(0x1d1))+parseInt(_0x35696f(0x1d0));if(_0x463f5a===_0xf4c3a)break;else _0x4d7342['push'](_0x4d7342['shift']());}catch(_0x23b737){_0x4d7342['push'](_0x4d7342['shift']());}}}(_0x49c1,0xc231a));
function obf(_0x55f1de){return _0x55f1de=_0x55f1de+'',atob(_0x55f1de);}

export default {
  name: 'floating-player',
  k: process.env.ALT_KEY !== 'unset' ? obf(process.env.ALT_KEY) : null,

  mounted() {
    this.episodeResumer();
    if (this.viewingEpisode) {
      this.updateSize();
    }
  },

  data() {
    return {
      lastLibraryUpdate: null,
      trackingNotification: null,
      completePercentage: 0.8,
      startTime: 0,
      resume: false,
      rewatching: false,
    };
  },

  methods: {
    ...mapActions([
      'showNotification',
      'hideNotification',
      'toggleTheaterMode',
      'setViewingEpisode',
      'toggleResumeEpisode',
      'updateLibraryEpisode',
      'completeLibraryEpisode',
      'setFloatingVideoPlayer',
      'toggleFloatingPlayerPlaying',
      'setFloatingPlayerHeight',
    ]),

    episodeResumer() {
      if (this.resumeEpisodeEnabled && this.RESTORED && this.viewingAnime && this.viewingEpisode) {
        this.toggleResumeEpisode(false);

        const lastWatched = this.getLastWatchedLibraryEpisode(this.viewingAnime);
        const nextToWatch = this.getNextEpisodeToWatch(this.viewingAnime);

        if (
          (lastWatched && !lastWatched.completed)
          || (nextToWatch && nextToWatch.number !== this.viewingEpisode.number)
        ) {
          if (this.alwaysResumeEpisode) {
            this.triggerResume();
          } else if (this.useResumeNotifications) {
            this.requestEpisodeResume();
          }
        }
      }
    },

    requestEpisodeResume() {
      const lastWatched = this.getLastWatchedLibraryEpisode(this.viewingAnime);
      let message = 'Resume from where you\'ve left of?';
      let timeout = 4000;

      if (lastWatched && !lastWatched.completed) {
        const lastWatchedEpisode = this.libraryToEpisode({
          library: lastWatched,
          anime: { ...this.viewingAnime },
        });

        message = `You've left episode ${lastWatchedEpisode.number} unfinished\n${message}`;
        timeout *= 2;
      }

      this.resumeNotification = {
        icon: 'info',
        timeout,
        message,
        action: {
          label: 'Resume',
          trigger: () => this.triggerResume(),
          hideOnTrigger: true,
        },
      };

      this.showNotification(this.resumeNotification);
    },

    sourceChange({ video }) {
      this.replaceEpisode(video);

      this.muxMonitor();

      if (!this.resume) {
        this.startTime = 0;
      }

      this.completePercentage = 0.8;
      this.rewatching = false;
    },

    replaceEpisode(episode) {
      if (!this.isAnimePage) {
        this.setViewingEpisode(episode);
      } else if (this.viewingEpisode.id !== episode.id) {
        this.$router.push({
          path: `/a/${this.viewingAnime.slug.slug}/${episode.number}`
        });
      }
    },

    toggleEpisodeComplete() {
      this.changeCompletePercentage();

      this.completeLibraryEpisode({
        library: this.episodeLibraryForm,
        completed: !this.isEpisodeCompleted(this.viewingEpisode),
      });

      this.hideNotification(this.trackingNotification);
    },

    onPlay() {
      this.toggleFloatingPlayerPlaying(true);
    },

    onPause() {
      this.toggleFloatingPlayerPlaying(false);
    },

    // I have to add all of this crap
    timeUpdate() {
      const videoPlayer = this.$refs.videoPlayer;

      if (videoPlayer.played > 20) {
        const episode = { ...this.episodeLibraryForm };
        const reachedUpdateTime = (new Date() - this.lastLibraryUpdate) / 1000 > 6;

        if (this.reachedCompletedTime) {
          this.autoMarkComplete(episode);
        } else if (this.reachedRewatchingTime) {
          this.rewatching = true;
          this.completeLibraryEpisode({ library: episode, completed: false });
        } else if (reachedUpdateTime) {
          const lastWatched = this.getLastWatchedLibraryEpisode(this.viewingAnime);

          if (lastWatched && !lastWatched.completed && lastWatched.progress > 300) {
            const lastWatchedEpisode = this.libraryToEpisode({
              library: { ...lastWatched },
              anime: { ...this.viewingAnime },
            });

            if (lastWatchedEpisode.number === this.viewingEpisode.number - 1) {
              this.autoMarkComplete(lastWatched);
            }
          }

          this.lastLibraryUpdate = new Date();
          this.updateLibraryEpisode(episode);
        }
      }
    },

    autoMarkComplete(library) {
      const librarySnapshot = { ...library };
      this.completeLibraryEpisode({ library: librarySnapshot });

      if (this.useTrackingNotifications) {
        const episode = this.libraryToEpisode({
          anime: this.viewingAnime,
          library: librarySnapshot,
        });

        this.trackingNotification = {
          timeout: 10000,
          icon: 'success',
          message: `Episode ${episode.number} has been marked as complete`,
          action: {
            label: 'Undo',
            trigger: () => {
              if (episode.number === this.viewingEpisode.number) {
                this.changeCompletePercentage();
              }

              this.completeLibraryEpisode({
                library: librarySnapshot,
                completed: false,
              });
            },
            hideOnTrigger: true,
          },
        };

        this.showNotification(this.trackingNotification);
      }
    },

    changeCompletePercentage() {
      if (this.playedPercentage >= this.completePercentage) {
        const percentageSteps = [0.8, 0.925, 0.995, undefined];
        this.completePercentage = percentageSteps.find(step => this.playedPercentage < step);
      }
    },

    metaLoaded() {
      this.updateSize();
      this.resumeEpisode();
    },

    updateSize() {
      this.$nextTick(() => {
        const { height } = this.$refs.videoPlayer.$el.getBoundingClientRect();
        const $next = 'requestAnimationFrame' in window
          ? requestAnimationFrame
          : setTimeout;

        $next(() => {
          this.setFloatingPlayerHeight(height);
        }, 0);
      });
    },

    resumeEpisode() {
      const lastWatched = this.getLastWatchedLibraryEpisode(this.viewingAnime);

      if (this.resume && lastWatched) {
        this.resume = false;
        this.startTime = lastWatched.progress;
        this.$refs.videoPlayer.setTime(this.startTime);
      }
    },

    muxMonitor() {
      const videoPlayer = this.$refs.videoPlayer;

      if (
        process.env.MUX_KEY === 'unset'
        || !this.episodeSources.length
        || this.episodeIndex === -1
      ) {
        return;
      }

      const mux = require('mux-embed');

      const series = this.viewingAnime;
      const episode = this.episodeSources[this.episodeIndex];
      const videoVarientId = videoPlayer.media.source;

      if (videoPlayer.$refs.media.mux) {
        mux.emit('.floating-player > .AT-player > video', 'videochange', {
          video_id: episode.id,
          video_title: `${series.title} - Episode ${episode.number}`,
          video_series: series.title,
          video_content_type: 'episode',
          video_language_code: 'jp',
          video_variant_name: 'English Hard Subs',
          video_variant_id: videoVarientId,
          video_duration: videoPlayer.videoDuration,
          video_stream_type: 'on-demand',
          video_encoding_variant: 'Varient 1',
          video_cdn: 'Single server',
        });
      } else {
        mux.monitor('.floating-player > .AT-player > video', {
          debug: false,
          sampleRate: parseFloat(process.env.MUX_SAMPLE_RATE, 10),
          data: {
            property_key: process.env.MUX_KEY,
            page_type: 'watchpage',
            viewer_user_id: this.user ? this.user.username : null,
            experiment_name: 'mux_lite_1',

            // Player Metadata
            player_name: 'AT player',
            player_version: '1.0.0',
            player_init_time: new Date(),

            // Video Metadata (cleared with 'videochange' event)
            video_id: episode.id,
            video_title: `${series.title} - Episode ${episode.number}`,
            video_series: series.title,
            video_content_type: 'episode',
            video_language_code: 'jp',
            video_variant_name: 'English Hard Subs',
            video_variant_id: videoVarientId,
            video_duration: videoPlayer.videoDuration,
            video_stream_type: 'on-demand',
            video_encoding_variant: 'Varient 1',
            video_cdn: 'Single server',
          },
        });
      }

      const muxData = this.$cookies.get('muxData');
      if (muxData) {
        const muxDataParsed = muxData
          .split('&')
          .map(item => ({
            [item.split('=')[0]]: item.split('=')[1]
          }));

          Raven.setTagsContext({
            'mux.viewer_id': muxDataParsed.mux_viewer_id,
            'mux.sid': muxDataParsed.sid,
          });
      }
    },

    closeFloatingPlayer() {
      const videoPlayer = this.$refs.videoPlayer;

      if (videoPlayer.$refs.media.mux) {
        videoPlayer.$refs.media.mux.destroy();
      }

      if (videoPlayer.played > 20) {
        this.updateLibraryEpisode(this.episodeLibraryForm);
      }

      this.setViewingEpisode(undefined);
    },

    triggerResume() {
      const lastWatched = this.getLastWatchedLibraryEpisode(this.viewingAnime);
      const nextToWatch = this.getNextEpisodeToWatch(this.viewingAnime);
      const videoPlayer = this.$refs.videoPlayer;

      if (lastWatched && !lastWatched.completed) {
        this.resume = true;

        if (this.viewingEpisode.id !== lastWatched.episode_id) {
          const lastWatchedEpisode = this.libraryToEpisode({
            library: lastWatched,
            anime: this.viewingAnime,
          });

          this.replaceEpisode(lastWatchedEpisode);
        } else if (videoPlayer.videoDuration) {
          this.resumeEpisode();
        }
      } else if (nextToWatch) {
        this.replaceEpisode(nextToWatch);
      }
    },
  },

  watch: {
    RESTORED(nowRestored, prevRestored) {
      if (!prevRestored) {
        this.episodeResumer();
      }
    },

    viewingAnime() {
      this.episodeResumer();
    },

    viewingEpisode() {
      if (this.viewingEpisode) {
        this.updateSize();
      }
    },

    $route() {
      if (this.viewingEpisode) {
        this.updateSize();
      }
    },
  },

  computed: {
    ...mapState(['RESTORED']),
    ...mapGetters([
      'getLastWatchedLibraryEpisode',
      'getNextEpisodeToWatch',
      'useTrackingNotifications',
      'autoplayNextVideo',
      'episodeSources',
      'viewingAnime',
      'viewingEpisode',
      'theaterMode',
      'showSidebar',
      'libraryToEpisode',
      'isEpisodeCompleted',
      'autoTrackerEnabled',
      'resumeEpisodeEnabled',
      'alwaysResumeEpisode',
      'useResumeNotifications',
      'useAltTitle',
    ]),

    episodeIndex() {
      if (!this.viewingAnime || !this.viewingEpisode) {
        return -1;
      }

      const episodes = this.viewingAnime.episodes;
      return episodes.findIndex((episode) =>
        episode.number === this.viewingEpisode.number);
    },

    episodeLibraryForm() {
      const episode = Object.assign({}, this.viewingEpisode, {
        progress: this.$refs.videoPlayer.progress,
        watched_at: new Date(),
        episode_id: this.viewingEpisode.id,
        id: undefined,
      });

      return episode;
    },

    reachedCompletedTime() {
      return !this.isEpisodeCompleted(this.viewingEpisode)
        && this.autoTrackerEnabled
        && this.playedPercentage >= this.completePercentage
        && this.lastPlayedPercentage >= 0.01;
    },

    progressPercentage() {
      const videoPlayer = this.$refs.videoPlayer;
      return videoPlayer.progress / videoPlayer.videoDuration;
    },

    reachedRewatchingTime() {
      return this.isEpisodeCompleted(this.viewingEpisode)
        && !this.rewatching
        && this.progressPercentage <= 0.675
        && this.lastPlayedPercentage >= 0.05;
    },

    lastPlayedPercentage() {
      const videoPlayer = this.$refs.videoPlayer;
      const played = videoPlayer.$refs.media.played;
      const forceComputedUpdate = videoPlayer.played - videoPlayer.played;

      const lastPlayed = played.length > 0
        ? played.end(played.length - 1) - played.start(played.length - 1)
        : 0;

      return (lastPlayed / videoPlayer.videoDuration) + forceComputedUpdate;
    },

    playedPercentage() {
      const videoPlayer = this.$refs.videoPlayer;

      return videoPlayer
        ? (videoPlayer.played + this.startTime) / videoPlayer.videoDuration
        : 0;
    },

    isAnimePage() {
      return this.$route.name === 'a-slug-episode';
    },

    useAds() {
      if (this.$cookies.get('developer')) {
        return true;
      }
      
      return this.isBoku;
    },

    cdnDomain() {
      return this.viewingAnime && this.viewingAnime.ongoing
        ? 'https://air-cdn.twist.moe'
        : 'https://cdn.twist.moe'
    },

    isBoku() {
      return this.viewingAnime && this.viewingAnime.slug.slug.match(/boku-no-pico|bokunopico/i)
    },
  },

  components: {
    VideoPlayer,
  },
};
