<template>
  <div class="root-container">
    <div class="chat-only-container">
      <router-link to="/"><span>&lt;- Go home<small>, you're drunk</small></span></router-link>
      <nuxt/>
    </div>

    <notification :fullwidth="true"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Notification from '@/components/Notification';

export default {
  components: {
    Notification,
  },

  computed: {
    ...mapGetters([
      'isUserBanned',
      'userBan',
    ]),
  },

  watch: {
    userBan() {
      if (this.isUserBanned) {
        this.$router.push('/ban');
      }
    },
  },
};
</script>


<style>
.chat-only-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  padding: 1em;
  left: 0;
  top: 0;
  height: 100%;
}

.chat-only-container > a {
  margin-bottom: 1em;
}

.chat-only-container > a > span {
  font-family: monospace;
}
</style>

