<template>
  <Day day="03.12.2024">
    <div slot="page-content">
      <Snake/>
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
import Snake from "../games/snake.vue";

export default {
  name: 'Day03',
  components: {
    Day,
    Snake
  }
}
</script>
