<template>
  <Day day="08.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p>Am Schloss</p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3351.jpeg'
import preview from '../../assets/fotos/previews/IMG_3351.webp'
import Day from '../Day.vue'

export default {
  name: 'Day08',
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
