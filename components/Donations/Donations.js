import { mapActions, mapGetters } from 'vuex';

import Modal from '@/components/Modal';

export default {
  name: 'donations',

  components: {
    Modal,
  },

  data() {
    return {
      idleSignin: false,
      username: '',
      password: '',
    };
  },

  methods: {
    bitcoinClick() {
      this.$refs.btcWalletDialog.show();
      this.$refs.pleaseSignin.hide();
    },

    ethereumClick() {
      this.$refs.ethWalletDialog.show();
      this.$refs.pleaseSignin.hide();
    },

    submitForm() {
      this.idleSignin = true;

      this.signin(this.form).then(() => {
        this.idleSignin = false;
      });
    },

    ...mapActions([
      'signin',
    ]),
  },

  computed: {
    now() {
      return new Date();
    },

    currentMonth() {
      return this.now.toLocaleString('en-us', { month: 'long' });
    },

    donationsNeeded() {
      return Math.ceil(this.donation.remaining / 5);
    },

    donationProgress() {
      return (this.donation.received / this.donation.target) * 100;
    },

    promote() {
      return this.donation.remaining > 0 && this.now.getDate() > 19;
    },

    form() {
      return {
        username: this.username,
        password: this.password,
      };
    },

    ...mapGetters([
      'donation',
      'user',
      'signinErrors',
    ]),
  },
};
