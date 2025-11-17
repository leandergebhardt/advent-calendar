<template>
  <div>
    <h1>Please enter your password</h1>
    <div class="form">
      <div
        class="error"
        v-if="error"
      >
        An error occured. Please try again!
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
        Login
      </button>
    </div>
  </div>
</template>

<script>
import * as Cookies from 'tiny-cookie'
import jsSHA from 'jssha'

// create your own secret hash (for example here: https://caligatio.github.io/jsSHA/)
const SECRET = '605bf996570672d8e9021d32dd1848cb271a087da9152c4f5e5f352a258ac290';
const PASSWORD_HASH = '0eea4dee35f4e0b8ea73287e68d7f7fed5cdff2b0aa7edcdeca0f76572b177cdb0687b205b6dd471172670557fc7f23153c39a4d448ad8d904d5bfb51e8ef1b9'

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
    checkLogin: function () {
      if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
      this.error = 'Too many attempts. Please wait.';
      return;
    }
      // this is not secure (!) & should be handled in the backend if necessary
      const pw = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
      pw.update(this.pw);
      pw.update(SECRET);

      if (pw.getHash("HEX") === PASSWORD_HASH) {
        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + 2)

        Cookies.setCookie('REMEMBERME', true, {expires: expiryDate})
        this.error = false
        this.failedAttempts = 0;
        // redirect to calendar view
        this.$router.replace({path: '/'})
      } else {
        this.failedAttempts++;
        if (this.failedAttempts >= 3) {
          this.lockoutUntil = Date.now() + (30000 * Math.pow(2, this.failedAttempts - 3));
        }
        this.error = true
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
