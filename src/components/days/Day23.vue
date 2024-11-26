<template>
  <Day day="23.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2019/07/25/01/43/frog-4361476_960_720.jpg"
        alt=""
      >
      <p>Your authenticity encourages others to be themselves.</p>
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
  name: 'Day23',
  components: {
    Day
  }
}
</script>
