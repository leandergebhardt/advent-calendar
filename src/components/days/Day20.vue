<template>
  <Day day="20.12.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2016/05/05/02/12/frog-1373140_1280.jpg"
        alt=""
      >
      <p>The peace you bring to difficult situations is a gift.</p>
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
  name: 'Day20',
  components: {
    Day
  }
}
</script>
