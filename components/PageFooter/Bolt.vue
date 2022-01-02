<template>
  <li>
    <transition-group v-on:enter="heartEnter" class="hearts">
      <svg v-for="(heart, index) in hearts" :key="index" :data-index="index" :data-size="heart.size" class="floating-heart" :class="{
          contributor: heart.contributor != null
        }"

        :style="{
          left: `${heart.x - 8}px`,
          top: `${heart.y - 8}px`
        }" viewBox="0 0 16 16">

        <g v-if="heart.contributor != null">
          <defs>
            <mask id="heart">
              <svg>
                <rect x="0" y="0" width="16" height="16" fill="black"></rect>
                <path d="M16,5.5960002C16,6.9450002,15.4180002,8.1590004,14.4919996,9H14.5l-5,5c-0.5,0.5-1,1-1.5,1s-1-0.5-1.5-1L1.5079999,9c-0.926-0.8409996-1.508-2.0539999-1.508-3.4040003c0-2.5380001,2.0580001-4.5960002,4.5960002-4.5960002c1.349,0,2.5630002,0.582,3.4039998,1.5079999c0.8409996-0.926,2.0539999-1.508,3.4040003-1.508C13.9420004,0.9999994,16,3.0579996,16,5.5960002z" fill="white"></path>
              </svg>
            </mask>
          </defs>

          <image mask="url(#heart)" :xlink:href="flags[heart.contributor.flag]" x="-4" y="-4" width="24" height="24"></image>
        </g>

        <g v-else>
          <path d="M16,5.5960002C16,6.9450002,15.4180002,8.1590004,14.4919996,9H14.5l-5,5c-0.5,0.5-1,1-1.5,1s-1-0.5-1.5-1L1.5079999,9c-0.926-0.8409996-1.508-2.0539999-1.508-3.4040003c0-2.5380001,2.0580001-4.5960002,4.5960002-4.5960002c1.349,0,2.5630002,0.582,3.4039998,1.5079999c0.8409996-0.926,2.0539999-1.508,3.4040003-1.508C13.9420004,0.9999994,16,3.0579996,16,5.5960002z"></path>
        </g>
      </svg>
    </transition-group>

    <svg class="icon bolt" viewbox="0 0 16 16" v-on:click="spawnHearts">
      <path d="M 9,0 L 0,9 L 8,10 L 7,16 L 16,7 L 8,6 Z"></path>
    </svg>
  </li>
</template>

<script>
export default {
  name: 'bolt',

  mounted() {

  },

  data() {
    return {
      heartsSpawned: -1,
      hearts: [],
    };
  },

  methods: {
    heartEnter(el) {
      el.animate([
        { transform: 'scale(1)' },
        { transform: `scale(${el.dataset.size})` },
        { transform: 'scale(1)' },
      ], {
        duration: 350,
        iterations: Infinity,
      });

      el.animate([
        { motionOffset: 0 },
        { motionOffset: '100%' },
      ], {
        duration: 3300,
        fill: 'forwards',
        easing: 'ease-in',
      });

      el.animate([
        { opacity: '0' },
        { opacity: '1' },
      ], {
        duration: 300,
        fill: 'forwards',
      });

      el.animate([
        { opacity: '1' },
        { opacity: '0' },
      ], {
        delay: 3000,
        duration: 300,
        fill: 'forwards',
      }).onfinish = () => {
        const index = parseInt(el.dataset.index, 10);
        if (index === this.heartsSpawned + (this.contributors.length - 1)) {
          this.hearts = [];
        }
      };
    },

    spawnHearts() {
      const spawned = this.heartsSpawned;
      if (
        (spawned !== -1 && this.hearts.length !== spawned + this.contributors.length)
        || !HTMLElement.prototype.animate
      ) {
        return;
      }

      this.heartsSpawned = Math.floor((innerWidth * innerHeight) / 10000);
      this.hearts = [];

      for (let i = 0; i < this.heartsSpawned; i += 1) {
        setTimeout(() => {
          this.hearts.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            size: 1.5,
          });
        }, Math.random() * 5000);
      }

      this.contributors.forEach((contributor) => {
        setTimeout(() => {
          this.hearts.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            size: 1.5,
            contributor,
          });
        }, Math.random() * 5000);
      });
    },
  },

  computed: {
    flags() {
      return {
        no: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg',
        au: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Flag_of_Australia_(converted).svg',
        uk: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
        us: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
        dk: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg',
        nl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg',
      };
    },

    contributors() {
      return [
        { name: 'Azertify', flag: 'uk' },
        { name: 'AmusedGryphon', flag: 'uk' },
        { name: 'Venator', flag: 'no' },
        { name: 'Fredrekt', flag: 'dk' },
        { name: 'Nallown', flag: 'nl' },
        { name: 'Bimlolz', flag: 'au' },
        { name: 'Sundar', flag: 'uk' },
        { name: 'Jinnial', flag: 'us' },
        { name: 'Lilaith', flag: 'nl' },
      ];
    },
  },
};
</script>

<style scoped>
  .bolt {
    fill: #e53232;
  }

  svg {
    box-sizing: content-box;
  }

  .floating-heart {
    position: fixed;
    z-index: 50;
    motion-path: path('M0,0 Q32,-32 0,-64 Q-32,-96 0,-128');
    motion-rotation: 0deg;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    fill: white;
  }

  .floating-heart.contributor {
    z-index: 5;
    width: 1.5rem;
    height: 1.5rem;
  }

  .hearts {
    width: 0;
    height: 0;
    padding: 0;
    flex: none;
  }
</style>
