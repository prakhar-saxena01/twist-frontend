import CryptoJS from 'crypto-js';
import ResizeObserver from 'resize-observer-polyfill';

import { mapActions, mapGetters } from 'vuex';
import Slider from '@/components/Slider';
// import AdMessage from '@/components/AdMessage';

const IMMERSE_TIMEOUT = 2000;

function fullscreenElement() {
  return document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;
}

function isFullscreen() {
  return !!fullscreenElement();
}

export default {
  name: 'video-player',

  props: {
    useAds: {
      type: Boolean,
      default: false,
    },

    autoplay: {
      type: Boolean,
      default: false,
    },

    autoplayNext: {
      type: Boolean,
      default: false,
    },

    playlist: {
      type: Array,
      default () {
        return [];
      },
    },

    startingIndex: {
      type: Number,
      default: 0,
    },

    source: {
      type: String,
      default: null,
    },

    sourceKey: {
      type: String,
      default: null,
    },

    domain: {
      type: String,
    },

    noControls: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      uid: null,
      dragging: false,
      immersed: false,
      currentTime: '--:--',
      remainingTime: '--:--',
      playlistIndex: this.startingIndex,
      videoDuration: 0,
      progress: 0,
      played: 0,
      buffered: [],
      state: 'loading',
      remaining: 0,
      postponeAutoplay: false,
      message: {},
      mediaResizeObserver: null,

      ads: null,
      adsRequest: null,
      adsCountdown: null,
      adsDuration: 0,
      adsTimeRemaining: 0,
    };
  },

  watch: {
    source(newSource) {
      if (newSource) {
        this.setSource(newSource);
      } else if (!this.playlist.length) {
        this.state = 'loading';
      }
    },

    useAds() {
      if (this.useAds) {
        this.initAdsLoader();
      }
    },

    playlist(newPlaylist) {
      if (newPlaylist.length) {
        this.loadVideo(this.startingIndex);
      } else if (!this.source) {
        this.state = 'loading';
      }
    },

    startingIndex(newIndex, oldIndex) {
      if (this.playlist.length && newIndex !== oldIndex && newIndex !== this.playlistIndex) {
        this.loadVideo(newIndex);
      }
    },

    videoVolume(newVolume, oldVolume) {
      if (newVolume !== oldVolume && this.media.volume !== newVolume) {
        this.media.volume = newVolume;
      }
    },
  },

  mounted() {
    const hash = Math.random().toString(36).substring(7);
    this.uid = hash + '.' + (+new Date());

    const videoContainer = this.$el;
    videoContainer.addEventListener('mousemove', () => this.controlsTimeout());
    videoContainer.addEventListener('mouseout', () => this.controlsTimeout(0));

    this.media.addEventListener('ended', this.videoEnded);
    this.media.addEventListener('timeupdate', this.timeUpdate);
    this.media.addEventListener('progress', this.updateBuffered);
    this.media.addEventListener('canplay', this.readyToPlay, true);
    this.media.addEventListener('play', this.playbackChange, true);
    this.media.addEventListener('playing', this.playbackChange, true);
    this.media.addEventListener('waiting', this.playbackChange, true);
    this.media.addEventListener('pause', this.playbackChange, true);
    this.media.addEventListener('loadedmetadata', this.metaLoaded);
    this.media.addEventListener('volumechange', this.onVolumeChange);
    this.media.addEventListener('error', this.playbackError);

    document.addEventListener('keydown', this.onkeydown);
    document.addEventListener('keyup', this.onkeyup);

    this.media.volume = this.videoVolume;

    if (this.source) {
      this.setSource(this.source);
    } else if (this.playlist.length) {
      this.loadVideo(this.startingIndex);
    } else {
      this.state = 'loading';
    }

    this.mediaResizeObserver = new ResizeObserver(() => {
      this.resizeAds();
      this.$emit('resize');
    });
    this.mediaResizeObserver.observe(this.$el);
    this.$emit('resize');

    if (this.useAds) {
      this.initAdsLoader();
    }
  },

  beforeDestroy() {
    const videoContainer = this.$el;

    videoContainer.removeEventListener('mousemove', () => this.controlsTimeout());
    videoContainer.removeEventListener('mouseout', () => this.controlsTimeout(0));

    this.media.removeEventListener('ended', this.videoEnded);
    this.media.removeEventListener('timeupdate', this.timeUpdate);
    this.media.removeEventListener('progress', this.updateBuffered);
    this.media.removeEventListener('canplay', this.readyToPlay, true);
    this.media.removeEventListener('play', this.playbackChange, true);
    this.media.removeEventListener('playing', this.playbackChange, true);
    this.media.removeEventListener('waiting', this.playbackChange, true);
    this.media.removeEventListener('pause', this.playbackChange, true);
    this.media.removeEventListener('loadedmetadata', this.metaLoaded);
    this.media.removeEventListener('volumechange', this.onVolumeChange);
    this.media.removeEventListener('error', this.playbackError);

    document.removeEventListener('keydown', this.onkeydown);
    document.removeEventListener('keyup', this.onkeyup);

    this.mediaResizeObserver.disconnect();

    if (this.adsManager) {
      this.adsManager.destroy();
      this.$options.adDisplayContainer.destroy();
    }
  },

  methods: {
    ...mapActions(['setVideoVolume']),

    initAdsLoader() {
      if (this.$options.adsLoader || this.adBlocked()) {
        return;
      }

      this.$options.adDisplayContainer = new google.ima.AdDisplayContainer(this.adsContainer, this.media);
      this.$options.adDisplayContainer.initialize();

      this.$options.adsLoader = new google.ima.AdsLoader(this.$options.adDisplayContainer);
      this.$options.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);

      this.$options.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdsManagerLoaded,
        false);

      this.$options.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdsError,
        false);
    },

    getMountedVideos() {
      return Array.from(document.querySelectorAll('.AT-player video'));
    },

    isMounted() {
      return !!this.getMountedVideos().find(video => video.dataset.uid === this.uid);
    },

    isFullscreenSupported() {
      return !process.browser || !!(
        Element.prototype.requestFullscreen ||
        Element.prototype.msRequestFullscreen ||
        Element.prototype.mozRequestFullScreen ||
        Element.prototype.webkitRequestFullscreen ||
        HTMLMediaElement.prototype.webkitEnterFullscreen
      );
    },

    requestAds() {
      this.$nextTick(() => {
        if (!this.$options.adsLoader) {
          return;
        }
  
        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = BB.getVASTUrl(1000172);
  
        adsRequest.linearAdSlotWidth = 1280;
        adsRequest.linearAdSlotHeight = 720;
        adsRequest.nonLinearAdSlotWidth = 1280;
        adsRequest.nonLinearAdSlotHeight = 720 / 3;

        this.adsRequest = adsRequest;
        this.$options.adsLoader.requestAds(adsRequest);
      });
    },

    onAdsError(e) {
      console.error(e.getError());

      if (this.adsManager) {
        this.adsManager.destroy();
      }

      this.adsRequest = null;
      this.stopAdsCountdown();

      if (this.autoplay) {
        this.startVideo();
      }
    },

    switchToAds() {
      this.state = 'play';
      this.media.removeEventListener('ended', this.videoEnded);
      this.media.pause();
    },

    switchToSource(passive = true) {
      if (!passive && !this.readyToSkipAds) {
        return;
      }

      this.ads = null;
      this.adsRequest = null;
      this.stopAdsCountdown();
      this.adsManager.stop();
      this.adsManager.destroy();
      this.$options.adsLoader.contentComplete();

      this.state = this.media.duration ? 'play' : 'loading';
      this.media.addEventListener('ended', this.videoEnded);
      this.adsManager.setVolume(0);
      this.startVideo();
    },

    onAdsStarted(e) {
      this.ads = e.getAd();
      this.startAdsCountdown();
      this.updateSnapshotCanvas();
    },

    startAdsCountdown() {
      if (this.ads.getContentType() !== 'video/mp4') {
        this.adsDuration = 20;
        this.adsTimeRemaining = 20;
        this.resizeAds();
        
        this.adsCountdown = setInterval(() => {
          this.adsTimeRemaining -= 1;

          if (this.adsTimeRemaining === 0) {
            this.switchToSource(true);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          this.adsDuration = this.adsManager.getRemainingTime();
          this.adsTimeRemaining = this.adsDuration;
        }, 100);

        this.adsCountdown = setInterval(() => {
          this.adsTimeRemaining = this.adsManager.getRemainingTime();
        }, 40);
      }
    },

    stopAdsCountdown() {
      if (this.adsCountdown) {
        clearInterval(this.adsCountdown);
        this.adsCountdown = null;
      }

      this.adsTimeRemaining = 0;
      this.adsDuration = 0;
    },

    onAdsManagerLoaded(e) {
      const adsRenderSettings = new google.ima.AdsRenderingSettings();
      adsRenderSettings.uiElements = [];

      this.adsManager = e.getAdsManager(this.media, adsRenderSettings);

      this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdsError);
      this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.onAdsStarted);
      this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.switchToAds);
      this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.switchToSource);

      const playerRect = this.$el.getBoundingClientRect();
      const viewMode = isFullscreen()
        ? google.ima.ViewMode.FULLSCREEN
        : google.ima.ViewMode.NORMAL;

      try {
        this.adsManager.init(playerRect.width, playerRect.height, viewMode);
        this.adsManager.setVolume(0);

        this.media.play().then(() => {
          this.adsManager.setVolume(0.5);
          this.adsManager.start();
        }).catch(() => {
          this.state = null;
          this.immersed = true;
        });
      } catch (adError) {
        this.switchToSource();
      }
    },

    resizeAds() {
      if (this.adsManager) {
        const playerRect = this.$el.getBoundingClientRect();
        const fullscreened = isFullscreen();

        const viewMode = fullscreened
          ? google.ima.ViewMode.FULLSCREEN
          : google.ima.ViewMode.NORMAL;

        const width = fullscreened ? window.innerWidth : playerRect.width;
        const height = fullscreened ? window.innerHeight : playerRect.height;

        this.adsManager.resize(width, height, viewMode);
      }
    },

    updateSnapshotCanvas() {
      const canvas = this.$refs.videoSnapshot;
      const snapshotCtx = canvas.getContext('2d');

      canvas.style.display = 'none'; // TODO: only show canvas if its not too dark or bright
      snapshotCtx.drawImage(this.media, 0, 0, canvas.width, canvas.height);
    },

    async startVideo() {
      if (!this.isMounted()) {
        return this.$destroy();
      }

      try {
        await this.media.play();
        this.controlsTimeout();
      } catch (_) {
        this.state = null;
        this.immersed = true;
      }
    },

    setTime(time) {
      if (this.media.duration) {
        this.media.currentTime = time;
      }
    },

    playbackError(e) {
      const errorMsg = (() => {
        var type = e.target.error.code;
        switch (type) {
          case 1:
            // MEDIA_ERR_ABORTED
            return 'MEDIA_ERR_ABORTED';
            break;

          case 2:
            // MEDIA_ERR_NETWORK
            return `Connection with ${location.hostname} lost`;
            break;

          case 3:
            // MEDIA_ERR_DECODE
            return 'MEDIA_ERR_DECODE';
            break;

          case 4:
            // MEDIA_ERR_SRC_NOT_SUPPORTED
            return 'Could not load video';
            break;
        }
      })();

      this.message = {
        text: errorMsg,
        type: 'error',
      };
    },

    onkeyup(e) {
      if (
        (!document.activeElement || document.activeElement.tagName !== 'INPUT')
        && !e.altKey && !e.ctrlKey
      ) {
        switch (e.keyCode) {
          // Space
          case 32:
            e.preventDefault();
            this.togglePlayState();
            break;

          // Right Arrow
          case 39:
            e.preventDefault();
            this.media.playbackRate = this.media.defaultPlaybackRate;
            break;

          default: break;
        }
      }

      if (!this.isMounted()) {
        return this.$destroy();
      }
    },

    setMessage({ text, type }) {
      this.message = { text, type };
    },

    clearMessage() {
      this.message = {};
    },

    isMessageText(text) {
      return this.message.text === text;
    },

    onkeydown(e) {
      if (!this.isMounted()) {
        return this.$destroy();
      }

      if (
        (!document.activeElement || document.activeElement.tagName !== 'INPUT')
        && !e.altKey && !e.ctrlKey
      ) {
        switch (e.keyCode) {
          // Space
          case 32:
            e.preventDefault();
            break;

          // Right Arrow
          case 39:
            e.preventDefault();
            if (e.shiftKey) {
              this.media.playbackRate = 3;
            } else if (this.media.duration) {
              this.media.currentTime += 15;
            }
            break;

            // Left Arrow
          case 37:
            e.preventDefault();
            if (this.media.duration) {
              this.media.currentTime -= 15;
            }
            break;

            // F key
          case 70:
            e.preventDefault();
            this.toggleFullscreen();
            break;

            // S key
          case 83:
            e.preventDefault();
            const superSpeedMsg = 'Press "S" on your keyboard to play in normal speed';

            if (this.media.playbackRate === this.media.defaultPlaybackRate) {
              this.media.playbackRate = 3;

              if (this.isMessageEmpty) {
                this.setMessage({ text: superSpeedMsg });
              }
            } else {
              this.media.playbackRate = this.media.defaultPlaybackRate;

              if (this.isMessageText(superSpeedMsg)) {
                this.clearMessage();
              }
            }
            break;

          default: break;
        }
      }
    },

    theaterClick() {
      this.$emit('theaterclick');
    },

    nextClick() {
      this.loadVideo();
    },

    loadVideo(i) {
      const nextIndex = this.playlistIndex < this.playlist.length - 1
        ? this.playlistIndex + 1
        : 0;

      const index = typeof i === 'number' ? i : nextIndex;

      if (index === -1) {
        return;
      }

      const video = this.playlist[index];

      if (video) {
        this.playlistIndex = index;
        this.setSource(video.source);

        this.$emit('sourcechange', { index, video });
      } else {
        throw new Error(`Unable to load video with the index ${index} - the playlist has only ${this.playlist.length} items.`);
      }
    },

    setSource(src) {
      let source = this.sourceKey
        ? CryptoJS.AES.decrypt(src, this.sourceKey).toString(CryptoJS.enc.Utf8)
        : src;
      
      if (this.domain && !source.startsWith('http')) {
        source = this.domain + source;
      }

      if (source === this.media.src) {
        return;
      }

      if (this.played > 15 && this.$options.adsLoader) {
        this.requestAds();
      }

      this.postponeAutoplay = false;
      this.progress = 0;
      this.played = 0;
      this.$set(this, 'buffered', []);
      this.remaining = 0;

      this.state = this.state === null ? null : 'loading';

      this.videoDuration = 0;
      this.currentTime = '--:--';
      this.remainingTime = '--:--';
      this.clearMessage();

      this.media.playbackRate = this.media.defaultPlaybackRate;
      this.media.src = source;
    },

    controlsTimeout(duration) {
      this.immersed = false;
      clearTimeout(this.immerseTimer);

      if (!this.media.paused) {
        this.immerseTimer = setTimeout(() => {
          this.immersed = true;
        }, duration || IMMERSE_TIMEOUT);
      }
    },

    metaLoaded(e) {
      this.videoDuration = e.target.duration;

      if (this.useAds) {
        this.updateSnapshotCanvas();
      }

      this.$emit('metaloaded');

      this.state = null;

   /*   const adMessageVisible = this.$refs.adMessage && this.$refs.adMessage.adMessageVisible;
      if (this.autoplay && !this.adsPlaying() && !adMessageVisible) {
        this.startVideo();
      } */
    },

    playbackChange(event) {
      switch (event.type) {
        case 'waiting':
        case 'play':
          this.state = this.state === null ? null : 'loading';
          break;

        case 'playing':
          this.$emit('play');
          this.state = 'play';
          break;

        case 'pause':
          this.$emit('pause');
          this.immersed = false;
          this.state = 'pause';
          break;

        default:
          this.state = 'error';
          break;
      }
    },

    cancelAutoplay() {
      this.postponeAutoplay = true;
    },

    readyToPlay() {
      this.controlsTimeout();
    },

    videoEnded() {
      const autoplay = this.autoplayEnabled;

      if (autoplay) {
        this.loadVideo();
      }

      if (this.$options.adsLoader) {
        this.$options.adsLoader.contentComplete();
      }
    },

    timestamp(number, duration) {
      const h = Math.floor((number / 60 / 60) % 60);
      const m = Math.floor((number / 60) % 60);
      const s = Math.floor(number % 60);

      const pad = (n) => {
        if (n < 10) {
          return `0${n}`;
        }

        return n;
      };

      if (duration && duration > 3600) {
        return `${h}:${pad(m)}:${pad(s)}`;
      }

      return `${pad(m)}:${pad(s)}`;
    },

    timeUpdate(e) {
      const media = e.target;
      const remaining = Number(media.duration - media.currentTime) || 0;

      this.currentTime = this.timestamp(media.currentTime, media.duration);
      this.remainingTime = this.timestamp(remaining, media.duration);
      this.progress = media.currentTime;
      this.remaining = remaining;

      this.updatePlayed(e);
      this.$emit('timeupdate');
    },

    updatePlayed(e) {
      const media = e.target;
      let played = 0;

      for (let i = 0; i < media.played.length; i += 1) {
        if (i >= media.played.length) {
          break;
        }

        played += media.played.end(i) - media.played.start(i);
      }

      this.played = played;
    },

    updateBuffered(e) {
      const media = e.target;
      const buffered = [];

      for (let i = 0; i < media.buffered.length; i += 1) {
        if (i >= media.buffered.length) {
          break;
        }

        buffered[i] = {
          start: (media.buffered.start(i) / media.duration) * 100,
          end: (media.buffered.end(i) / media.duration) * 100,
        };
      }

      this.$set(this, 'buffered', buffered);
    },

    togglePlayState() {
      if (this.adsRequest) {
        if (this.adsTimeRemaining === 0 && this.adsManager.getVolume() === 0) {
          this.adsManager.setVolume(0.5);
          this.adsManager.start();
        }
        return;
      }

      if (this.media.paused) {
        const play = this.media.play();

        if (play && typeof play.catch === 'function') {
          play.then(() => this.controlsTimeout());
          play.catch(() => false);
        } else {
          this.controlsTimeout();
        }

        if (!this.media.duration) {
          this.state = 'loading';
        }
      } else {
        this.media.pause();
      }
    },

    changeTime(percentage) {
      if (this.media.duration) {
        const newTime = this.media.duration * (percentage / 100);
        this.media.currentTime = isFinite(newTime) ? newTime : 0;

        const play = this.media.play();
        if (play && typeof play.catch === 'function') {
          play.catch(() => false);
        }
      }
    },

    changeVolume(percentage) {
      this.media.volume = percentage / 100;
    },

    onVolumeChange() {
      const volume = this.media.muted ? 0 : this.media.volume;
      this.setVideoVolume(volume);
    },

    toggleFullscreen() {
      if (isFullscreen()) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    },

    enterFullscreen() {
      if (!this.isFullscreenSupported()) {
        return;
      }

      const videoContainer = this.$el;

      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else {
        this.media.webkitEnterFullscreen();
      }
    },

    exitFullscreen() {
      if (!this.isFullscreenSupported()) {
        return;
      }

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        screen.mozUnlockOrientation();
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        this.media.webkitExitFullscreen();
      }
    },

    adsPlaying() {
      return this.adsRequest
        && this.adsTimeRemaining > 0;
    },

    adBlocked() {
      return !window.google || !window.google.ima;
    },
  },

  computed: {
    ...mapGetters([
      'videoVolume',
      'showVideoUI',
      'oversizedPlayer',
    ]),

    isMessageEmpty() {
      return !this.message.text;
    },

    autoplayEnabled() {
      return this.autoplayNext
        && !this.postponeAutoplay
        && this.playlist.length > 1
        && this.playlistIndex < this.playlist.length - 1;
    },

    countdownState() {
      if (this.remaining < 180 && this.remaining > 0 && this.autoplayEnabled) {
        return this.remaining < 15 ? 'active' : 'partially-active';
      }

      return null;
    },

    media() {
      return this.$refs.media;
    },

    adsContainer() {
      return this.$refs.adContainer;
    },

    adsProgress() {
      return 100 - ((this.adsTimeRemaining / this.adsDuration) * 100);
    },

    skipAdsIn() {
      let minPlayTime = 10;

      if (this.ads && this.ads.getSkipTimeOffset() !== -1) {
        minPlayTime = this.ads.getSkipTimeOffset();
      } else if (this.ads && this.ads.getContentType() !== 'video/mp4') {
        minPlayTime = 3;
      }

      const playTime = this.adsDuration - this.adsTimeRemaining;
      return playTime >= minPlayTime ? 0 : minPlayTime - playTime;
    },

    skippableAds() {
      return this.adsDuration > 10;
    },

    readyToSkipAds() {
      return this.skipAdsIn == 0;
    },

    episodeNumber() {
      const item = this.playlist[this.playlistIndex];
      return item && typeof item.number === 'number'
        ? this.playlist[this.playlistIndex].number
        : this.playlistIndex + 1;
    },
  },

  components: {
    Slider,
    // AdMessage,
  },
};
