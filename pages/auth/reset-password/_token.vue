<template>
  <main>
    <button v-for="(alert, index) in alerts" :key="index" class="alert">{{ alert.message }}</button>

    <form name="registration" v-on:submit.prevent="submitForm">
      <div class="input-group">
        <label for="password-input" class="meta">New password</label>
        <input id="password-input" v-model="password" placeholder="Minimum 7 characters" type="password" name="password" required pattern=".{7,}">
      </div>

      <div class="input-group">
        <label for="password-repeat-input" class="meta">Repeat password</label>
        <input id="password-repeat-input" v-model="passwordRepeat" placeholder="..." type="password" name="password" required pattern=".{7,}">
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
    return { title: 'Anime Twist - Reset Password' }
  },

  data() {
    return {
      password: '',
      passwordRepeat: '',
      alerts: [],

      successNotification: {
        message: 'Your password has been changed!',
        timeout: 7500,
        icon: 'success',
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
      if (this.password !== this.passwordRepeat) {
        this.alerts = [{message: 'Password and Repeat password do not match'}]
        return
      }

      this.$api.request.auth.resetPassword({
        password: this.password,
        token: this.$route.params.token
      })
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
