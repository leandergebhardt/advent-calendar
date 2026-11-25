<template>
  <Day day="02.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="Ruslan mit Regenschirm" />
      <p>Ruslan mit Regenschirm ☂️</p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3295.jpeg'
import preview from '../../assets/fotos/previews/IMG_3295.webp'
import Day from '../Day.vue'

export default {
  name: 'Day02',
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
