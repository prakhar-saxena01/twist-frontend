<template>
  <div class="wrapper" :class="{ idle: notification && notification.idle, fullwidth: fullwidth || !showSidebar }">
    <transition name="fly-in">
      <div v-if="notification" class="notification">
        <div v-if="notification.icon" :class="notification.icon"></div>
        <p>{{ notification.message }}</p>
        <button v-if="notification.action" v-on:click="() => {
          notification.action.trigger()

          if (notification.action.hideOnTrigger) {
            hideAndShowNext(notification)
          }
        }">{{ notification.action.label }}</button>
        <button v-if="notification.timeout" v-on:click="hideAndShowNext(notification)" class="dismiss">×</button>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'notification',

  mounted() {
    if (!this.notification) {
      this.showNextNotification();
    }
  },

  props: {
    fullwidth: {
      default: false,
    },
  },

  methods: {
    ...mapActions([
      'hideNotification',
    ]),

    showNextNotification() {
      this.replaceNotification(this.notifications[0]);
    },

    showLastNotification() {
      const notification = this.notifications[this.notifications.length - 1];
      this.replaceNotification(notification);
    },

    replaceNotification(notification) {
      if (this.notification) {
        this.notification = null;
        setTimeout(() => this.showNotification(notification), 150);
      } else {
        this.showNotification(notification);
      }
    },

    showNotification(notification) {
      this.notification = notification;

      if (this.notification && this.notification.timeout) {
        setTimeout(() => {
          if (this.isActiveNotification(notification)) {
            this.hideAndShowNext(notification);
          }
        }, this.notification.timeout);
      }
    },

    hideAndShowNext(notification) {
      this.hideNotification(notification);
      this.showNextNotification();
    },

    isActiveNotification(notification) {
      return this.notification && notification &&
        this.notification.icon === notification.icon &&
        this.notification.message === notification.message &&
        this.notification.idle === notification.idle;
    },
  },

  watch: {
    notifications() {
      const idleNotification = this.notifications.find(noti => noti.idle);

      if (!this.notification || this.notifications.indexOf(this.notification) === -1) {
        if (idleNotification) {
          this.replaceNotification(idleNotification);
        } else {
          this.showNextNotification();
        }
      } else if (idleNotification && !this.notification.idle) {
        this.replaceNotification(idleNotification);
      }
    },
  },

  data() {
    return {
      notification: null,
    };
  },

  computed: {
    ...mapGetters([
      'notifications',
      'showSidebar',
    ]),
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fly-in-enter-active, .fly-in-leave-active {
  transition:
    transform .3s ease,
    opacity .15s ease;
}
.fly-in-enter, .fly-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.wrapper {
  position: fixed;
  width: calc(100% - 360px);
  height: 100%;
  top: 0;
  left: 0;
  right: 360px;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.wrapper.fullwidth {
  right: 0;
  width: 100%;
}

.wrapper.idle {
  pointer-events: all;
  background: rgba(0, 0, 0, 0.4);
}

.notification {
  position: absolute;
  background: #2e3133;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  padding: 12px 24px;
  min-height: 48px;
  min-width: 300px;
  max-width: 740px;
  display: flex;
  align-items: center;
  bottom: 30px;
  right: 50px;
  pointer-events: all;
}

.notification p {
  white-space: pre-line;
  margin-right: 24px;
  font-size: 14px;
  color: #fff;
  min-width: 80px;
}

.notification button {
  flex: none;
  margin-left: auto;
  padding: 0.5em;
  min-height: auto;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  max-width: 140px;
}

.notification button:active {
  transition: none;
  background: rgba(255, 255, 255, .1);
}

.notification > div {
  margin-right: 24px;
  background-size: 24px;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 2px;
  transition: opacity .15s, border-radius .15s, background-size .15s, width .15s, height .15s;
}

.notification .loading {
  background-image: url(../../assets/vectors/load.svg);
  animation: spin 1s linear infinite;
  background-size: 16px;
  width: 16px;
  height: 16px;
  opacity: 1;
}

.notification .send {
  background-image: url(../../assets/vectors/send.svg);
}

.notification .loop {
  background-image: url(../../assets/vectors/loop.svg);
}

.notification .error {
  background-image: url(../../assets/vectors/error.svg);
}

.notification .info {
  background-image: url(../../assets/vectors/info.svg);
}

.notification .warning {
  background-image: url(../../assets/vectors/warning.svg);
}

.notification .success {
  background-image: url(../../assets/vectors/check_circle.svg);
}

.notification button.dismiss {
  background: rgba(0, 0, 0, 0);
  margin-left: 5px;
}

@media (max-width: 839px) {
  .wrapper {
    right: 0;
    width: 100%;
  }
  .notification {
    max-width: 100%;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .fly-in-enter, .fly-in-leave-to {
    transform: translateX(0);
    transform: translateY(100%);
  }
}
</style>
