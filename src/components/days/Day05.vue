<template>
  <Day day="05.12.2024">
    <div slot="page-content">
      <SideScroller />
      <img width="300" src="https://placekitten.com/300/300" alt="" />
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
