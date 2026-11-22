<template>
  <div class="fullscreen-image">
    <button
      type="button"
      class="image-button"
      :aria-label="alt || 'Bild im Vollbild öffnen'"
      @click="open"
    >
      <img :src="src" :alt="alt" />
    </button>

    <div
      v-if="isOpen"
      class="image-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Vollbildansicht"
      @click.self="close"
    >
      <button
        type="button"
        class="close-button"
        aria-label="Vollbild schließen"
        @click="close"
      >
        ×
      </button>
      <img class="overlay-image" :src="src" :alt="alt" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FullscreenImage',
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
  watch: {
    isOpen(open) {
      document.body.style.overflow = open ? 'hidden' : ''
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown)
    document.body.style.overflow = ''
  },
  methods: {
    open() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    onKeydown(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this.close()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.fullscreen-image {
  width: 100%;
}

.image-button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}

.image-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.95);
  touch-action: manipulation;
}

.overlay-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.close-button {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  right: max(12px, env(safe-area-inset-right));
  z-index: 2001;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 38px;
  line-height: 42px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
