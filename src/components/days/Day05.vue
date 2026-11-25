<template>
  <Day day="05.12.2026">
    <div slot="page-content">
      <SideScroller />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import SideScroller from '../games/side_scroller.vue'

export default {
  name: 'Day05',
  components: {
    Day,
    SideScroller,
  },
}
</script>
