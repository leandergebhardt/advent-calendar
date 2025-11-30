<template>
  <Day day="08.12.2025">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2015/08/11/21/41/maranonfrosch-885251_1280.jpg"
        alt=""
      />
      <p>I love how you smell 👃🏼✨</p>
      <p class="caption-img">
        <img width="300" src="https://placekitten.com/300/300" alt="" />
      </p>
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day08',
  components: {
    Day,
  },
}
</script>
