<template>
  <sidebar class="visible stretch" />
</template>

<script>
import Sidebar from '@/components/Sidebar';

export default {
  layout: 'fullpage',

  head() {
    return {
      title: 'Anime Twist - Community Chat',

      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Chat with a great anime community while watching your '
            + 'favourite show for free. Come join us and talk about '
            + 'anime you weeaboo.'
        },
        { hid: "robots", name: "robots", content: "index, nofollow" },
      ]
    }
  },

  components: {
    Sidebar,
  },
};
</script>

