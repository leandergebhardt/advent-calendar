<template>
  <Day day="18.12.2026">
    <div slot="page-content">
      <FullscreenImage class="img" :src="image" :preview-src="preview" alt="" />
      <p>Das Uvo und die Martinskirche in Pratislava</p>
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3394.jpeg'
import preview from '../../assets/fotos/previews/IMG_3394.webp'
import Day from '../Day.vue'

export default {
  name: 'Day18',
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
