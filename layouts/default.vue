<template>
  <div class="root-container">
    <div class="app-container">
      <section class="main-column scroll-container">
        <floating-player ref="floatingPlayer" />

        <header class="main-header">
          <router-link to="/" class="logo" aria-label="Home" :role="mobileMode ? 'button' : null">
            <svg viewBox="0 0 16 10">
              <polygon points="0,10 5,0 10,10 9,10 5,2 1,10"></polygon>
              <polygon points="11,10 6,0 16,0 15.5,1 7.5,1 11.5,9"></polygon>
            </svg>
          </router-link>



          <div class="toggles-desktop" :class="{ 'sidebar-visible': showSidebar }">
            <button v-if="!user && !showSidebar" v-on:click="showLogin">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              <span>Sign in</span>
            </button>

            <button class="toggle-settings" v-on:click="toggleMenu">
              <svg viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </button>

            <button v-on:click="toggleSidebar">
              <svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <polygon ref="sidebarPolygon" points="15.410 16.090, 10.830 11.500, 15.41  6.910, 14.00  5.500, 8.000 11.500, 14.000 17.500"></polygon>
              </svg>
              <span v-if="!showSidebar">Show Chat</span>
              <span v-else>Hide Chat</span>
            </button>
          </div>

          <div class="toggles">
            <button v-if="!user && !showSidebar" v-on:click="showLogin">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </button>

            <button v-on:click="toggleChat">
              <svg class="icon">
                <circle cx="8" cy="7" r="7"></circle>
                <path d="M 8,14 L 8,16 C 12,16 15,11 15,7 Z"></path>
              </svg>
            </button>

            <button v-on:click="toggleMenu">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </button>
          </div>
        </header>

        <nuxt ref="nuxt" />
        <page-footer />
      </section>

      <sidebar ref="sidebar" :class="{ visible: showSidebar || mobileMode }"/>

      <modal header="Sign in" ref="signinModal">
        <signin-form />
      </modal>
    </div>

    <notification :fullwidth="false"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import PageFooter from '@/components/PageFooter';
import Notification from '@/components/Notification';
import Sidebar from '@/components/Sidebar';
import FloatingPlayer from "@/components/FloatingPlayer";
import SigninForm from "@/components/Forms/Signin";
import Modal from "@/components/Modal";

export default {
  data() {
    return {
      mobileMode: false,
      mobileQuery: null,
    };
  },

  beforeMount() {
    this.mobileQuery = window.matchMedia('(max-width: 839px)');
    this.mobileQuery.addListener(this.deviceModeChange);
    this.deviceModeChange();
  },

  beforeDestroy() {
    this.mobileQuery.removeListener(this.deviceModeChange);
  },

  components: {
    PageFooter,
    Notification,
    Sidebar,
    FloatingPlayer,
    SigninForm,
    Modal,
  },

  methods: {
    ...mapActions([
      'banUser',
      'unbanUser',
      'showNotification',
      'toggleSidebar',
    ]),

    showLogin() {
      this.$refs.signinModal.show()
    },

    deviceModeChange() {
      this.mobileMode = this.mobileQuery.matches;
    },

    toggleMenu() {
      return this.$refs.sidebar.toggleMenu();
    },

    toggleChat() {
      return this.$refs.sidebar.toggleChat();
    },
  },

  computed: {
    ...mapGetters([
      'isUserBanned',
      'userBan',
      'user',
      'showSidebar',
    ]),
  },

  watch: {
    user() {
      if (this.user) {
        this.$refs.signinModal.hide()
      }
    },

    userBan(ban) {
      if (this.isUserBanned) {
        this.$router.push('/ban');
      }
    },

    $route() {
      this.$refs.signinModal.hide()
    },

    showSidebar() {
      const polygon = this.$refs.sidebarPolygon;

      if (this.showSidebar) {
        polygon.morph({
          points: [
            { x: 8.590, y: 16.340 },
            { x: 13.170, y: 11.750 },
            { x: 8.590, y: 7.160 },
            { x: 10.000, y: 5.750 },
            { x: 16.000, y: 11.750 },
            { x: 10.000, y: 17.750 },
          ],
          duration: 100,
        });
      } else {
        polygon.morph({
          points: [
            { x: 15.410, y: 16.090 },
            { x: 10.830, y: 11.500 },
            { x: 15.410, y: 6.910 },
            { x: 14.000, y: 5.500 },
            { x: 8.000, y: 11.500 },
            { x: 14.000, y: 17.500 },
          ],
          duration: 100,
        });
      }
    },
  },
};
</script>


<style>
.toggles-desktop {
  position: fixed;
  right: calc(2em + 360px);
  transition: right 600ms;
  display: flex;
}

.toggles-desktop:not(.sidebar-visible) {
  right: 2em;
}

.toggles-desktop button {
  margin-right: 0.5em;
}

.toggles-desktop button {
  height: 2.5em;
  padding: 0 0.7em;
}

.toggles-desktop button span {
  margin-right: 0.5em;
}

.toggles-desktop button svg {
  width: 24px;
  height: 24px;
  fill: white;
}

.toggles-desktop button.toggle-settings svg {
  width: 1em;
  height: 1em;
}

.root-container {
  width: 100%;
}

.chat-only-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  padding: 1em;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.chat-only-container > a {
  margin-bottom: 1em;
}

.chat-only-container > a > span {
  font-family: monospace;
}

.main-header .toggles button {
  margin-left: 3px;
}

.main-header .toggles button:first-of-type {
  margin: 0;
}

@media (min-width: 840px) {
  .main-header .toggles {
    display: none;
  }
}

@media (max-width: 839px) {
  .toggles-desktop {
    display: none;
  }
}
</style>
