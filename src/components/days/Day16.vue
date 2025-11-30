<template>
  <Day day="16.12.2024">
    <div slot="page-content">
      <SpaceInvaders />
      <p class="caption-img">
        <img width="300" src="https://placekitten.com/300/300" alt="" />
      </p>
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import SpaceInvaders from '../games/space_invaders.vue'

export default {
  name: 'Day16',
  components: {
    Day,
    SpaceInvaders,
  },
}
</script>
