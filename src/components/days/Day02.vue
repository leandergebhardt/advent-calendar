<template>
  <Day day="02.12.2024">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        src="https://cdn.pixabay.com/photo/2014/03/28/02/02/tree-frog-299881_1280.jpg"
        alt=""
      />
      <p>I love the noises you make.</p>
      <img width="300" src="https://placekitten.com/300/300" alt="" />
    </div>
  </Day>
</template>

<script>
import Day from "../Day.vue";

export default {
  name: "Day02",
  components: {
    Day,
  },
};
</script>
