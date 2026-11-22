<template>
  <Day day="03.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3327.jpeg'
import preview from '../../assets/fotos/previews/IMG_3327.webp'
import Day from '../Day.vue'

export default {
  name: 'Day03',
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
