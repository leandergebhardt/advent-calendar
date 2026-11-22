<template>
  <Day day="11.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3338.jpeg'
import Day from '../Day.vue'

export default {
  name: 'Day11',
  components: {
    Day,
  },
  data() {
    return {
      image,
    }
  },
}
</script>
