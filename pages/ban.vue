<template>
  <main v-if="userBan">
    <h2>We're sorry to inform you that you're banned until the</h2>

    <time class="ban-duration">
      <span>
          {{ new Date(userBan.expires_at).toLocaleString() }}
      </span>
    </time>

    <p>Banned for <span>{{ userBan.reason }}</span></p>
  </main>
</template>

<style scoped>
@media (min-height: 740px) {
  p > span {
    color: rgba(255, 255, 255, .8);
  }
}

main {
  text-align: center;
  align-content: center;
  justify-content: center;
  flex: 1;
}
</style>


<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import api from '@/api';

export default {
  head() {
    return { title: 'You have been banned - Anime Twist' }
  },

  mounted() {
    if (this.RESTORED) {
      this.checkBanStatus();
    }
  },

  watch: {
    RESTORED(nowRestored, prevRestored) {
      if (!prevRestored && nowRestored) {
        this.checkBanStatus();
      }
    },
  },

  methods: {
    ...mapActions(['unbanUser', 'banUser']),

    checkBanStatus() {
      if (this.isUserBanned) {
        this.$api.request.motd.getMessage().then(() => {
          this.unbanUser();
          this.$router.push('/');
        }).catch(() => true);
      } else {
        this.unbanUser();
        this.$router.push('/');
      }
    },
  },

  computed: {
    ...mapGetters(['userBan', 'isUserBanned']),
    ...mapState(['RESTORED']),
  },
};
</script>