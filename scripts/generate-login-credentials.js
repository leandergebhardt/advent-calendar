const crypto = require('crypto')

function generateCredentials (password) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 1024) {
    throw new Error('Password must be between 1 and 1024 characters')
  }

  const secret = crypto.randomBytes(32).toString('hex')
  const passwordHash = crypto.createHash('sha512')
    .update(password, 'utf8')
    .update(secret, 'utf8')
    .digest('hex')

  return { secret, passwordHash }
}

function readPassword () {
  return new Promise((resolve, reject) => {
    const input = process.stdin
    if (!input.isTTY) {
      reject(new Error('Run this command in a terminal to enter the password privately'))
      return
    }

    input.setRawMode(true)
    input.setEncoding('utf8')

    let password = ''
    const finish = (error) => {
      input.setRawMode(false)
      input.pause()
      input.removeListener('data', onData)
      process.stdout.write('\n')
      if (error) reject(error)
      else resolve(password)
    }

    const onData = (keys) => {
      for (const key of keys) {
        if (key === '\u0003' || key === '\u0004') {
          finish(new Error('Password entry cancelled'))
          return
        } else if (key === '\r' || key === '\n') {
          finish()
          return
        } else if (key === '\u007f' || key === '\b') {
          password = Array.from(password).slice(0, -1).join('')
        } else if (!/[\u0000-\u001f\u007f]/.test(key)) {
          password += key
        }
      }
    }

    input.on('data', onData)
    process.stdout.write('Password (input hidden): ')
    input.resume()
  })
}

async function main () {
  const password = await readPassword()
  const { secret, passwordHash } = generateCredentials(password)

  process.stdout.write(
    `SECRET=${secret}\nPASSWORD_HASH=${passwordHash}\n`
  )
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = { generateCredentials }
