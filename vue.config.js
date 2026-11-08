const { handler } = require('./netlify/functions/login')

module.exports = {
  devServer: {
    before (app) {
      app.post('/.netlify/functions/login', (request, response) => {
        let body = ''

        request.setEncoding('utf8')
        request.on('data', (chunk) => {
          body += chunk
          if (body.length > 4096) {
            response.status(413).json({ error: 'Request too large' })
            request.destroy()
          }
        })

        request.on('end', async () => {
          if (response.headersSent) return

          try {
            const result = await handler({
              httpMethod: request.method,
              body,
              isBase64Encoded: false
            })
            response.status(result.statusCode)
            for (const [name, value] of Object.entries(result.headers || {})) {
              response.set(name, value)
            }
            response.send(result.body)
          } catch (error) {
            console.error('Local login function failed', error)
            response.status(500).json({ error: 'Login function failed' })
          }
        })
      })
    }
  }
}
