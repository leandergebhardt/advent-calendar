<template>
  <Day day="23.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3320.jpeg'
import preview from '../../assets/fotos/previews/IMG_3320.webp'
import Day from '../Day.vue'

export default {
  name: 'Day23',
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
