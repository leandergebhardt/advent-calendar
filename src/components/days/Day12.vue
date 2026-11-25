<template>
  <Day day="12.12.2026">
    <div slot="page-content">
      <Pong />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import Pong from '../games/pong.vue'

export default {
  name: 'Day12',
  components: {
    Day,
    Pong,
  },
}
</script>
