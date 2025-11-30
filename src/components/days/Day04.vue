<template>
  <Day day="04.12.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2014/03/28/02/05/tree-frog-299883_1280.jpg"
        alt=""
      />
      <p>I love to cuddle with you 🤗</p>
      <img width="300" src="https://placekitten.com/300/300" alt="" />
    </div>
  </Day>
</template>

<script>
import Day from '../Day.vue'

export default {
  name: 'Day04',
  components: {
    Day,
  },
}
</script>
