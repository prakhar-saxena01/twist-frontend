<template>
  <main>
    <button v-for="(alert, index) in alerts" :key="index" class="alert">{{ alert.message }}</button>

    <form name="registration" v-on:submit.prevent="submitForm">
      <div class="input-group">
          <label for="user-input" class="meta">Username</label>
          <input id="user-input" v-model="username" placeholder="4 - 20 letters/dashes/underscores" type="text" name="username" required pattern="^(?=[A-Za-z0-9]*([_-][A-Za-z0-9]*){0,2}$)[A-Za-z0-9_-]{4,20}$">
      </div>

      <div class="input-group">
          <label for="email-input" class="meta">Email</label>
          <input id="email-input" v-model="email" placeholder="Accessible email" type="email" name="email" required>
      </div>

      <div class="input-group">
          <label for="psw-input" class="meta">Password / Repeat password</label>
          <input id="psw-input" v-model="password" placeholder="Minimum 7 characters" type="password" name="password" required pattern=".{7,}">
      </div>

      <input type="password" v-model="password_confirm" placeholder="Repeat password" name="password_confirm" required pattern=".{7,}">

      <section>
          <h2>A note on email</h2>
          <p>We require your email address, so that we know you're a real person, and so we can get in touch with you if we ever need to in a pinch (mostly just for account registration, and if there are any major changes to AT).</p>
          <p>We will never release your address, or use it for any purpose other than contacting you if and when we absoultely must.</p>
      </section>

      <div class="row-from-right">
          <button>Accept &amp; Submit</button>
      </div>
    </form>

    <donations />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Donations from '@/components/Donations';

export default {
  async fetch({ store }) {
    await store.dispatch('fetchDonation');
  },

  head() {
    return { title: 'Anime Twist - Signup' }
  },

  data() {
    return {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      alerts: [],

      signupNotification: {
        message: 'Signing you up...',
        icon: 'loading',
        idle: true,
      },

      signupSuccessNotification: {
        message: 'We\'ve send you an email!\n' +
          'You\'re nearly there, just look out for our email and you\'ll be set to go.',
        timeout: 7500,
        icon: 'send',
      },
    };
  },

  beforeDestroy() {
    this.hideNotification(this.signupNotification);
  },

  methods: {
    ...mapActions([
      'fetchDonation',
      'showNotification',
      'hideNotification',
    ]),

    submitForm() {
      this.showNotification(this.signupNotification);

      this.$api.request.auth.signup(this.form)
        .then(() => {
          this.hideNotification(this.signupNotification);
          this.showNotification(this.signupSuccessNotification);

          this.$router.push('/');
        })
        .catch((error) => {
          this.hideNotification(this.signupNotification);

          if (error.response && error.response.status === 422) {
            this.alerts = error.response.data.errors;
          }
        });
    },
  },

  computed: {
    ...mapGetters(['donation']),

    form() {
      return {
        username: this.username,
        email: this.email,
        password: this.password,
        password_confirm: this.password_confirm,
      };
    },
  },

  components: {
    Donations,
  },
};
</script>
