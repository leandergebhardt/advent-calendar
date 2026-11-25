<template>
  <div>
    <h1>Bitte gib dein Passwort ein</h1>
    <div class="form">
      <div
        class="error"
        v-if="error"
      >
        Ein Fehler ist aufgetreten. Bitte versuche es erneut!
      </div>
      <input
        type="password"
        @keyup.enter="checkLogin"
        v-model="pw"
      >
      <button
        type="submit"
        @click="checkLogin"
      >
        Anmelden
      </button>
    </div>
  </div>
</template>

<script>
import * as Cookies from 'tiny-cookie'

// Generate credentials with `npm run generate:credentials` (hidden password
// prompt). Locally, set SECRET and PASSWORD_HASH in the root .env file. Set
// them in Netlify's environment variables for deployment. Never use VUE_APP_
// names because those are included in the browser bundle. The hash is
// SHA-512(password + SECRET), UTF-8 input and hex output. Rotate any values
// previously committed or included in a frontend build.
export default {
  name: 'Login',
  data () {
    return {
      pw: '',
      error: false,
      failedAttempts: 0,
      lockoutUntil: null
    }
  },
  methods: {
    checkLogin: async function () {
      if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
        this.error = 'Zu viele Versuche. Bitte warte.'
        return
      }

      try {
        const response = await fetch('/.netlify/functions/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: this.pw })
        })

        if (response.status === 401) {
          this.failedAttempts++
          if (this.failedAttempts >= 3) {
            this.lockoutUntil = Date.now() + (30000 * Math.pow(2, this.failedAttempts - 3))
          }
          this.error = true
          return
        }

        if (!response.ok) {
          throw new Error('Passwortprüfung fehlgeschlagen')
        }

        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + 2)

        Cookies.setCookie('REMEMBERME', true, {expires: expiryDate})
        this.error = false
        this.failedAttempts = 0;
        // redirect to calendar view
        this.$router.replace({path: '/'})
      } catch (error) {
        console.error('Passwort konnte nicht geprüft werden', error)
        this.error = 'Passwort konnte nicht geprüft werden. Bitte versuche es erneut.'
      }
    }
  }
}
</script>

<style lang="scss">
.form {
  width: 50%;
  margin: 0 auto;
  flex-flow: column;
  justify-content: center;
  text-align: center;

  background: rgba(#000, 0.3);
  padding: 25px;

  @media screen and (max-width: 900px) {
    width: 75%;
  }

  @media screen and (max-width: 400px) {
    width: 90%;
  }

  input, button {
    opacity: 0.9;
    padding: 10px;
    background: rgba(#fff, 0.3);
    color: white;
    border: 1px solid black;
  }

  button {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
