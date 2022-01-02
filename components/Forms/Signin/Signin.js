import {
  mapActions,
  mapGetters
} from 'vuex';

export default {
  name: 'signin-form',

  data() {
    return {
      username: '',
      password: '',
      idle: false,
    }
  },

  methods: {
    ...mapActions([
      'signin',
    ]),

    submitForm() {
      this.idle = true;
      this.signin(this.form);
    },
  },

  computed: {
    ...mapGetters([
      'user',
      'signinErrors',
    ]),

    form() {
      return {
        username: this.username,
        password: this.password,
      };
    },
  },

  watch: {
    signinErrors() {
      this.idle = false;
    },
  },
}
