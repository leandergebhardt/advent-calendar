<template>
  <Day day="22.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3377.jpeg'
import preview from '../../assets/fotos/previews/IMG_3377.webp'
import Day from '../Day.vue'

export default {
  name: 'Day22',
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
