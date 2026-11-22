<template>
  <Day day="16.12.2025">
    <div slot="page-content">
      <SpaceInvaders />
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
