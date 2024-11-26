<template>
  <Day day="03.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2023/02/07/15/00/horned-frog-7774339_1280.jpg"
        alt=""
      >
      <p>Your strength and resilience inspire everyone around you.</p>
      <img
        width="300"
        src="https://placekitten.com/300/300"
        alt=""
      >
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day03',
  components: {
    Day
  }
}
</script>
