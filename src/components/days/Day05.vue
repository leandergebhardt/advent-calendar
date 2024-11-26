<template>
  <Day day="05.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2023/07/23/14/13/frog-8145165_1280.jpg"
        alt=""
      >
      <p>Your smile has the power to make any day better.</p>
      <img
        width="300"
        src="https://placekitten.com/300/300"
        alt=""
      >
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day05',
  components: {
    Day
  }
}
</script>
