<template>
  <main>
    <button v-for="(alert, index) in alerts" :key="index" class="alert">{{ alert.message }}</button>

    <form name="registration" v-on:submit.prevent="submitForm">
      <div class="input-group">
        <label for="username-input" class="meta">Username / Email</label>
        <input id="username-input" v-model="username" placeholder="..." type="username" name="username" required>
      </div>

      <div class="row-from-right">
        <button>Submit</button>
      </div>
    </form>

    <donations />
  </main>
</template>

<style>
  .input-group {
    margin-bottom: 10px;
  }
</style>

<script>
import { mapActions, mapGetters } from 'vuex';

import Donations from '@/components/Donations';

export default {
  async fetch({ store }) {
    await store.dispatch('fetchDonation');
  },

  head() {
    return { title: 'Anime Twist - Forgot Password' }
  },

  data() {
    return {
      username: '',
      alerts: [],

      successNotification: {
        message: 'We\'ve send you an email!\n' +
          'You\'re nearly there, just look out for our email and you\'ll be set to go.',
        timeout: 7500,
        icon: 'send',
      },
    };
  },

  beforeDestroy() { },

  methods: {
    ...mapActions([
      'fetchDonation',
      'showNotification',
      'hideNotification',
    ]),

    submitForm() {
      this.$api.request.auth.forgotPassword(this.username)
        .then(() => {
          this.showNotification(this.successNotification);
          this.$router.push('/')
        })
        .catch((error) => {
          if (error.response && error.response.status === 422) {
            this.alerts = error.response.data.errors;
          }
        });
    },
  },

  computed: {
    ...mapGetters(['donation']),
  },

  components: {
    Donations,
  },
};
</script>
