<template>
  <Day day="09.12.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2023/08/18/11/35/frog-8198313_1280.jpg"
        alt=""
      >
      <p>The wisdom you share helps others find their way.</p>
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
  name: 'Day09',
  components: {
    Day
  }
}
</script>
