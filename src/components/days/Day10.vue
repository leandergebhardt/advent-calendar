<template>
  <Day day="10.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3364.jpeg'
import preview from '../../assets/fotos/previews/IMG_3364.webp'
import Day from '../Day.vue'

export default {
  name: 'Day10',
  components: {
    Day,
  },
  data() {
    return {
      image,
      preview,
    }
  },
}
</script>
