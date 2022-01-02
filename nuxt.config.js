export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  'vue/multi-word-component-names': [
    'error',
    {
      ignores: [],
    },
  ],
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Anime Twist - HD anime for free',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, user-scalable=no, initial-scale=1',
      },
      { name: 'theme-color', content: '#1c1f22' },
      {
        hid: 'description',
        name: 'description',
        content:
          "Go home, you're drunk. This place is too good to be true. We have all the great anime on here in HD, and completely free. Don't believe us? Then why not give us a try? You don't have to signup for it, just click and go. We add new shows and episodes every day. Your favourite might be here.",
      },
    ],
    link: [
      {
        rel: 'shortcut icon',
        href: '\u002Fpublic\u002Ficons\u002Ffav_x16.png',
        type: 'image\u002Fx-icon',
      },
      {
        rel: 'icon',
        href: '\u002Fpublic\u002Ficons\u002Ffav_x16.png',
        sizes: '16x16',
      },
      {
        rel: 'icon',
        href: '\u002Fpublic\u002Ficons\u002Ffav_x64.png',
        sizes: '64x64',
      },
      { rel: 'manifest', href: '\u002Fpublic\u002Fmanifest.json' },
      {
        rel: 'stylesheet',
        href: '\u002F\u002Ffonts.googleapis.com\u002Fcss?family=Lato:400,700,300',
      },
    ],
    script: [
      {
        hid: 'ad-maven-2',
        src: '\u002F\u002Fd3m4hp4bp4w996.cloudfront.net\u002F?bphmd=902915',
      },
    ],
    style: [],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: './plugins/directives.js' },
    { src: './plugins/disableDataSaver.js' },
    { src: './plugins/polyfillMorph.js', mode: 'client' },
    { src: './plugins/polyfillDevicePixelRatio.js', mode: 'client' },
    { src: './plugins/persistentStore.js', mode: 'client' },
    { src: './plugins/googleAnalytics.js', mode: 'client' },
    { src: './plugins/api.js' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
