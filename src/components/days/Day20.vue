<template>
  <Day day="20.12.2025">
    <div slot="page-content">
      <Snake />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import Snake from '../games/snake.vue'

export default {
  name: 'Day20',
  components: {
    Day,
    Snake,
  },
}
</script>
