const crypto = require('crypto')

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const { SECRET, PASSWORD_HASH } = process.env
  if (!SECRET || !PASSWORD_HASH || !/^[a-f0-9]{128}$/i.test(PASSWORD_HASH)) {
    console.error('Login function requires SECRET and a SHA-512 hex PASSWORD_HASH')
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Login is not configured' }) }
  }

  let password
  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body
    password = JSON.parse(body || '').password
  } catch (error) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }
  }

  if (typeof password !== 'string' || password.length === 0 || password.length > 1024) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }
  }

  const actualHash = crypto.createHash('sha512')
    .update(password, 'utf8')
    .update(SECRET, 'utf8')
    .digest()
  const expectedHash = Buffer.from(PASSWORD_HASH, 'hex')

  if (!crypto.timingSafeEqual(actualHash, expectedHash)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Incorrect password' }) }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ authenticated: true }) }
}
