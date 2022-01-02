<script>

export default {
  head() {
    let title = this.viewingAnime.title;

    if (this.viewingAnime.alt_title) {
      title += ` (${this.viewingAnime.alt_title})`;
    }

    let description = `You found a great dungeon where you can stream ${title} in HD, `
      + 'and completely free. Not the anime you\'re looking for? We might still have yours. Just look '
      + 'through our homepage, we have tons of great anime on there.';

    const meta = [];
    let script = [];

    if (this.viewingAnime.slug.slug.match(/boku-no-pico|bokunopico/i)) {
      description = `You found a great dungeon where you can stream ${title} in HD `
        + 'and completely free. Not the anime you\'re looking for? We might still have yours. Just look '
        + 'through our homepage, we have tons of great anime on there.';

      meta.push({ hid: 'robots', name: 'robots', content: 'index, nofollow' });
    } else {
      meta.push({ hid: 'robots', name: 'robots', content: 'noindex, nofollow' });
    }

    meta.push({ hid: 'description', name: 'description', content: description });

    return {
      title: `${title} - Anime Twist`,
      meta,
    }
  },

  async fetch({ store, params, redirect, error }) {
    let viewingAnime = store.getters.viewingAnime;

    if (!viewingAnime || !viewingAnime.slug || viewingAnime.slug.slug !== params.slug) {
      try {
        const [donation, vAnime] = await Promise.all([
          store.dispatch('fetchDonation'),
          store.dispatch('fetchAnime', { id: params.slug }),
        ]);

        viewingAnime = vAnime;
      } catch (err) {
        return error({ statusCode: 404, message: 'Anime not found' });
      }
    }

    if (viewingAnime.episodes.length < 1) {
      return error({ statusCode: 404, message: 'Anime not found' });
    }

    const episodes = viewingAnime.episodes;
    const firstEpisode = episodes[0] ? episodes[0].number : 0;
    const lastEpisode = episodes.length > 0 ? episodes[episodes.length - 1] : 1;

    return redirect(`/a/${params.slug}/${lastEpisode.number}`);
  },
};
</script>
