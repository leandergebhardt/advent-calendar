<template>
  <Day day="12.12.2024">
    <div slot="page-content">
      <Pong />
      <p class="caption-img">
        <img width="300" src="https://placekitten.com/300/300" alt="" />
      </p>
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
