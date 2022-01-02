import { mapActions, mapGetters } from 'vuex';

const normalize = (string) => {
  const accents =
    'ÀÁÂÃÄÅĄàáâãäåąßÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏìíîïÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚšśŤťŸÝÿýŽŻŹžżź';

  const accentsOut =
    'AAAAAAAaaaaaaasOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIiiiiUUUUUuuuuuLLLlllNNNnnnRrSSssTtYYyyZZZzzz';

  return string
    .split('')
    .map((letter, index) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    })
    .join('');
}

export default {
  name: 'anime-list',

  data() {
    return {
      search: '',
    };
  },

  methods: {
    ...mapActions([
      'toggleTitleLang',
    ]),
  },

  computed: {
    filteredAnime() {
      const search = normalize(this.search.toLowerCase().trim());
      const searchSplits = search.split(/[^a-z0-9]/i).filter(split => !!split);

      const searchFilter = (anime) => {
        const clonedAnime = { ...anime };

        const title = this.useAltTitle && clonedAnime.alt_title !== null
          ? normalize(clonedAnime.alt_title.toLowerCase())
          : normalize(clonedAnime.title.toLowerCase());

        let match = false;

        if (search.length === 1) {
          match = search.charAt(0) === title.charAt(0);
        } else if (searchSplits.length === 0) {
          match = true;
        } else if (search === 'ongoing') {
          match = !!clonedAnime.ongoing;
        } else {
          match = !searchSplits.find(split => title.indexOf(split) === -1);
        }

        clonedAnime.filteredOut = !match;
        return clonedAnime;
      };

      const sortByTitle = (a, b) => {
        const titleA = this.useAltTitle && a.alt_title !== null ? a.alt_title : a.title;
        const titleB = this.useAltTitle && b.alt_title !== null ? b.alt_title : b.title;

        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      };

      return this.allAnime
        .map(searchFilter)
        .sort(sortByTitle)
        .filter(anime => !anime.hidden);
    },

    visibleAnime() {
      return this.filteredAnime.filter(anime => !anime.filteredOut);
    },

    ...mapGetters([
      'allAnime',
      'useAltTitle',
    ]),
  },
};
