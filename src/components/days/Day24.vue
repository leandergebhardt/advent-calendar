<template>
  <Day day="24.12.2026">
    <div slot="page-content">
      <h2>⭐🎄⭐</h2>
      <FruitNinja />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import FruitNinja from '../games/fruit_ninja.vue'

export default {
  name: 'Day24',
  components: {
    Day,
    FruitNinja,
  },
}
</script>
