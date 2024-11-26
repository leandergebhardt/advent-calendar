<template>
  <Day day="11.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2017/09/17/20/42/red-eye-frog-2759755_1280.jpg"
        alt=""
      >
      <p>Your laughter is a melody that brings happiness to everyone around you.</p>
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
  name: 'Day11',
  components: {
    Day
  }
}
</script>
