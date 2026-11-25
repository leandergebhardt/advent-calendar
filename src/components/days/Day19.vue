<template>
  <Day day="19.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p>Wieder zurück in Praha</p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3353.jpeg'
import preview from '../../assets/fotos/previews/IMG_3353.webp'
import Day from '../Day.vue'

export default {
  name: 'Day19',
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
