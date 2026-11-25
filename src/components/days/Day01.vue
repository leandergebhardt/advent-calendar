<template>
  <Day day="01.12.2026">
    <div slot="page-content">
      <Asteriods />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import Asteriods from '../games/asteriods.vue'

export default {
  name: 'Day01',
  components: {
    Day,
    Asteriods,
  },
}
</script>
