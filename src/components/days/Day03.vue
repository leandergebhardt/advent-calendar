<template>
  <Day day="03.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3327.jpeg'
import Day from '../Day.vue'

export default {
  name: 'Day03',
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
