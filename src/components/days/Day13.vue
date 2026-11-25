<template>
  <Day day="13.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p>Sir Langfuß</p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3370.jpeg'
import preview from '../../assets/fotos/previews/IMG_3370.webp'
import Day from '../Day.vue'

export default {
  name: 'Day13',
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
