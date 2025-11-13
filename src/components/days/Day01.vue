<template>
  <Day day="01.12.2024">
    <div slot="page-content">
      <Pong />
      <img width="300" src="https://placekitten.com/300/300" alt="" />
    </div>
  </Day>
</template>

<script>
import Day from "../Day.vue";
import Pong from "../games/pong.vue";

export default {
  name: "Day01",
  components: {
    Day,
    Pong,
  },
};
</script>
