<template>
  <Day day="01.11.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2023/09/08/09/03/frog-8240705_1280.jpg"
        alt=""
      >
      <p>Your kindness lights up every room you enter, making the world a brighter place.</p>
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
  name: 'Day01',
  components: {
    Day
  }
}
</script>
