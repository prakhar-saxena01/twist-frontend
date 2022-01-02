import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'motd',

  methods: {
    ...mapActions([
      'markMotdRead',
    ]),
  },

  computed: {
    ...mapGetters([
      'motd',
      'readMotd',
    ]),

    visible() {
      return this.motd && this.readMotd.indexOf(this.motd.id) === -1;
    },
  },
};
