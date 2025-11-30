<template>
  <Day day="01.12.2025">
    <div slot="page-content">
      <Asteriods />
      <img width="300" src="https://placekitten.com/300/300" alt="" />
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
