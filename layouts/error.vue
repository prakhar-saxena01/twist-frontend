<template>
  <main>
    <video src="/img/404-umaru.mp4" poster="/img/404-umaru.gif" muted autoplay loop>
      <track default kind="subtitles" src="/img/404-umaru.vtt" srclang="en">
    </video>

    <section>
      <h1>Snap,</h1>
      <p>you've encountered an <em>{{ error.statusCode }} {{ error.message }}</em> error.</p>
      <p>Send us an email at <a href="mailto:team@twist.moe">team@twist.moe</a> if you feel this shouldn't happen, or ask our brilliant community over there →</p>
    </section>
  </main>
</template>

<script>
export default {
  props: ['error'],
  layout: 'default',
}
</script>
