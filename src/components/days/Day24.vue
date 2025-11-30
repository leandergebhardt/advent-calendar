<template>
  <Day day="24.12.2024">
    <div slot="page-content">
      <h2>⭐🎄⭐</h2>
      <Snake />
      <p class="caption-img">
        <img width="300" src="https://placekitten.com/300/300" alt="" />
      </p>
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import Snake from '../games/snake.vue'

export default {
  name: 'Day24',
  components: {
    Day,
    Snake,
  },
}
</script>
