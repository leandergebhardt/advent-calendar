<template>
  <Day day="02.12.2024">
    <div slot="page-content">
      <Tetris />
    </div>
  </Day>
</template>

<script>
import Day from "../Day.vue";
import Tetris from "../games/tetris.vue";

export default {
  name: "Day02",
  components: {
    Day,
    Tetris,
  },
};
</script>
