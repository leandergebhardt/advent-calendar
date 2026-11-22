<template>
  <Day day="07.12.2025">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p></p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3291.jpeg'
import preview from '../../assets/fotos/previews/IMG_3291.webp'
import Day from '../Day.vue'

export default {
  name: 'Day07',
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
