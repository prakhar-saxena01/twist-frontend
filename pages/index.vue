<template>
  <main>
    <motd />
    <anime-list />
    <donations />
  </main>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Motd from "@/components/Motd";
import AnimeList from "@/components/AnimeList";
import Donations from "@/components/Donations";

export default {
  head() {
    return {
      title: "Anime Twist - HD anime for free",

      meta: [
        {
          hid: "description",
          name: "description",
          content:
            "Go home, you're drunk. This place is too good to be true. " +
            "We have all the great anime on here in HD, and completely free. " +
            "Don't believe us? Then why not give us a try? You don't have to signup for it, " +
            "just click and go. We add new shows and episodes every day. Your favourite might be here."
        },
        { hid: "robots", name: "robots", content: "index, nofollow" },
      ]
    };
  },

  mounted() {},

  methods: {
    ...mapActions(["fetchAllAnime", "fetchMotd", "fetchDonation"])
  },

  computed: {
    ...mapGetters(["allAnime", "motd", "donation"])
  },

  async fetch({ store }) {
    await Promise.all([
      store.dispatch("fetchAllAnime"),
      store.dispatch("fetchMotd"),
      store.dispatch("fetchDonation")
    ]);
  },

  components: {
    Motd,
    AnimeList,
    Donations,
  }
};
</script>

<style scoped>
@media (min-height: 740px) {
  .donations {
    order: -1;
    margin-top: 0 !important;
    margin-bottom: 2rem !important;
  }
}
</style>
