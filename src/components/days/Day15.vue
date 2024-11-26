<template>
  <Day day="15.12.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2020/12/15/14/56/green-tree-frog-5833905_1280.jpg"
        alt=""
      >
      <p>Your presence makes every moment more special.</p>
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
  name: 'Day15',
  components: {
    Day
  }
}
</script>
