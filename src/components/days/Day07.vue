<template>
  <Day day="07.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2016/04/17/16/37/frog-1335022_1280.jpg"
        alt=""
      >
      <p>Your creativity and imagination bring magic to everyday moments.</p>
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
  name: 'Day07',
  components: {
    Day
  }
}
</script>
