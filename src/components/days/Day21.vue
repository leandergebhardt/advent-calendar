<template>
  <Day day="21.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3357.jpeg'
import Day from '../Day.vue'

export default {
  name: 'Day21',
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
