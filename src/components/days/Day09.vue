<template>
  <Day day="09.12.2026">
    <div slot="page-content">
      <Tetris />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import Tetris from '../games/tetris.vue'

export default {
  name: 'Day09',
  components: {
    Day,
    Tetris,
  },
}
</script>
