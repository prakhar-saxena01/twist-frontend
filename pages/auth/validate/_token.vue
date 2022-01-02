<script>
import { mapActions } from 'vuex';

export default {
  render() {
    return 'Validating your account...';
  },

  data() {
    return {
      validatingNotification: {
        message: 'We\'re validating your account it\'ll only take a few second',
        icon: 'loading',
      },
      successNotification: {
        message: 'You\'re all set to go and can login with your account now',
        timeout: 6000,
        icon: 'success',
      },
      errorNotification: {
        message: 'Oops! Something went wrong. Your link might of expired or already been used',
        timeout: 16000,
        icon: 'error',
      },
    };
  },

  mounted() {
    const token = this.$route.params.token;

    if (token) {
      this.showNotification(this.validatingNotification);

      this.$api.request.auth.validate(token)
        .then(() => {
          this.hideNotification(this.validatingNotification);
          this.showNotification(this.successNotification);
        })
        .catch(() => {
          this.hideNotification(this.validatingNotification);
          this.showNotification(this.errorNotification);
        });
    }

    this.$router.push('/');
  },

  methods: {
    ...mapActions(['showNotification', 'hideNotification']),
  },
};
</script>
