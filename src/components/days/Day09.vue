<template>
  <Day day="09.12.2025">
    <div slot="page-content">
      <Tetris />
      <p class="caption-img">
        <img width="300" src="https://placekitten.com/300/300" alt="" />
      </p>
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
