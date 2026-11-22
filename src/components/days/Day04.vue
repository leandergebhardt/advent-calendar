<template>
  <Day day="04.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3288.jpeg'
import preview from '../../assets/fotos/previews/IMG_3288.webp'
import Day from '../Day.vue'

export default {
  name: 'Day04',
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
