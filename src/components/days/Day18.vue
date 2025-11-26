<template>
  <Day day="18.12.2024">
    <div slot="page-content">
      <SideScroller/>
      <p class="caption-img">
        <img
          width="300"
          src="https://placekitten.com/300/300"
          alt=""
        >
      </p>
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'
import SideScroller from '../games/side_scroller.vue'

export default {
  name: 'Day18',
  components: {
    Day,
    SideScroller,
  }
}
</script>
