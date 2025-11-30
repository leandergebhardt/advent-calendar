<template>
  <Day day="06.12.2025">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2017/10/04/10/16/red-eye-frog-2815683_1280.png"
        alt=""
      />
      <p>You are my favorite human 🫶🏼</p>
      <img width="300" src="https://placekitten.com/300/300" alt="" />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day06',
  components: {
    Day,
  },
}
</script>
