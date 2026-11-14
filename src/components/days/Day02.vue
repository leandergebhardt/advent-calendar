<template>
  <Day day="02.12.2025">
    <div slot="page-content">
      <img
        class="img"
        width="1200"
        :src="image"
        alt=""
      />
      <p>Ruslan mit Regenschirm ☂️</p>
      <img width="300" src="https://placekitten.com/300/300" alt="" />
    </div>
  </Day>
</template>

<script>
import image from '../../assets/fotos/IMG_3295.jpeg'
import Day from '../Day.vue'

export default {
  name: 'Day02',
  components: {
    Day,
  },
  data() {
    return {
      image,
    }
  },
}
</script>
