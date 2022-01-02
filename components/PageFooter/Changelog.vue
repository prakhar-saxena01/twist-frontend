<template>
  <div>
    <modal ref="changelog" header="What's new" v-on:hidden="active = 0">
      <div class="changelog">
        <nav>
          <ul>
            <li v-for="(version, index) in versions" :key="version.number"><button v-on:click="active = index" :class="{ 'current': index === active }">v{{ version.number }}</button></li>
          </ul>
        </nav>

        <h3>Changes</h3>
        <section>
          <ul class="scroll-container">
            <li v-for="(change, index) in versions[active].changes" :key="index">{{ change }}</li>
          </ul>
        </section>

        <h3 v-if="versions[active].images.length > 0">Images</h3>
        <section v-if="versions[active].images.length > 0" class="scroll-container">
          <img v-for="(image, index) in versions[active].images" :key="index" :src="image" />
        </section>
      </div>
    </modal>

    <button v-on:click="$refs.changelog.show()" class="version">v{{ versions[0].number }}</button>
  </div>
</template>

<script>
import Modal from '@/components/Modal';

export default {
  name: 'changelog',
  components: { Modal },

  data() {
    return {
      active: 0,
      versions: [
        {
          number: '1.3.1',
          changes: [
            'The chat is now hidden by default',
          ],
          images: [],
        },
        {
          number: '1.3.0',
          changes: [
            'We Added a floating video player',
            'The video player stays in fullscreen when changing episodes',
          ],
          images: [],
        },
        {
          number: '1.2.1',
          changes: [
            'Small fixes and patches',
            'Episode drawer stays open when you change episodes',
            'Scroll position gets now reset when changing pages',
          ],
          images: [],
        },

        {
          number: '1.2',
          changes: [
            'Episodes watched get now automatically synced with your Anime Twist account',
            'Changed the Homepage message (MOTD)',
          ],
          images: [],
        },

        {
          number: '1.1.1',
          changes: [
            'Added mute user option when clicking on username',
            'You can now hide the chat',
            'Moved settings into a popup window',
            'Episodes now get automatically marked as complete (you can disable this in settings)',
            'Added notifications for when episodes get automatically marked as complete (see image below)',
            'Added a option for marking episode as complete (see image below)',
            'Added more setting options for the episode tracker (see image below)',
            'Added a resume button to continue from where you left of',
            'Returned the countdown for the next episode',
            'Added a changelog',
            'Added notification messages',
            'Made the pages change faster',
            'Made the homepage load faster',
            'Made the anime search better',
            'Made the secret easter egg better',
            'Added a "Failed to connect" message to the chat with a "Try Again" button',
          ],
          images: [
            'https://i.gyazo.com/3658e7cf98e9ab72dbc469ffdd5e9551.gif',
            'https://i.gyazo.com/e3e1971df4f724a76121f14537091c7a.gif',
            'https://i.gyazo.com/542d44c7265835ecdeabeb98e71a1a09.png',
          ],
        },

        {
          number: '0.4.0',
          changes: [
            'Why 0.4.0',
            'No reason, its just what I used',
            'Okay',
          ],
          images: [],
        },
      ],
    };
  },
};
</script>

<style scoped>
button.version.new::after {
  content: '*';
  color: #e53232;
}

button.version {
  font-size: 12px;
  border-radius: 15px;
  color: rgba(255, 255, 255, .48);
}

.changelog img:not(:first-child) {
  margin-top: 15px;
}

.changelog img {
  max-width: 100%;
}

.changelog {
  background: #1c1f22;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  flex-direction: column;
}

.changelog > h3 {
  font-size: 16px;
  margin-left: 15px;
}

.changelog > nav > ul {
  display: flex;
  min-width: 100%;
  font-size: 20px;
  padding: 5px;
}

.changelog > nav > ul > li {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1c1f22;
  flex: 1;
  min-width: 80px;
}

.changelog > nav > ul > li > button {
  width: 100%;
  color: rgba(255, 255, 255, .34);
}

.changelog > nav > ul > li > button.current {
  background: rgba(255, 255, 255, .1);
  color: rgba(255, 255, 255, .8);
}

.changelog > section {
  padding: 0 15px;
  width: 100%;
  flex: 1;
}

.scroll-container {
  max-height: 200px;
}

.changelog > section.scroll-container {
  padding: 15px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
}

.changelog > section.scroll-container img {
  max-height: 500px;
}

.changelog > section > ul {
  padding: 5px;
}

.changelog > section > ul > li:first-child {
  margin-top: 0;
}

.changelog > section > ul > li {
  margin: 10px;
  font-size: 14px;
}

.changelog > section > ul > li::before {
  content: '\b7';
  color: rgba(255, 255, 255, .5);
  margin-right: 15px;
}

.changelog > nav > ul > li:not(:first-child) {
  margin-left: 5px;
}
</style>
