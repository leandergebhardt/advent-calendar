<template>
  <Day day="12.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2016/07/25/06/29/frog-1539992_1280.jpg"
        alt=""
      >
      <p>The way you face challenges with grace is admirable.</p>
      <p class="caption-img">
        <img
          width="300"
          src="https://placekitten.com/300/300"
          alt=""
        >
      </p>
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day12',
  components: {
    Day
  }
}
</script>
