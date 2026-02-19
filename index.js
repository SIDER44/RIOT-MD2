// index.js - RIOT MD WhatsApp Bot with Auto-Refresh Web QR
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import express from 'express'
import chalk from 'chalk'
import dotenv from 'dotenv'
import qrcode from 'qrcode'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Store last QR globally
let lastQR = null
let qrTimestamp = 0 // timestamp to check if QR expired

// Express routes
app.get('/', (req, res) => {
  res.send(`<h1>💀 RIOT MD ONLINE</h1>
            <p>Status: Running</p>
            <p>Uptime: ${process.uptime().toFixed(0)}s</p>
            <p>Scan <a href="/qr" target="_blank">this link</a> to login WhatsApp</p>`)
})

app.get('/qr', async (req, res) => {
  if (!lastQR) return res.send('No QR available yet, bot is starting...')

  try {
    // If QR older than 30s, ask user to refresh
    const age = (Date.now() - qrTimestamp) / 1000
    if (age > 30) {
      return res.send('<p>QR expired. Restart bot or wait for a new QR.</p>')
    }

    const qrImage = await qrcode.toDataURL(lastQR)
    res.send(`
      <h2>Scan QR with WhatsApp</h2>
      <img src="${qrImage}" />
      <p>QR auto-refreshes every 30 seconds</p>
      <script>
        setTimeout(() => location.reload(), 10000) // reload page every 10s to check for new QR
      </script>
    `)
  } catch (err) {
    res.send('Error generating QR: ' + err)
  }
})

app.listen(PORT, () => console.log(chalk.green(`Web server running on port ${PORT}`)))

// WhatsApp Bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions')

  const sock = makeWASocket({
    auth: state,
    browser: ['RIOT MD', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      lastQR = qr
      qrTimestamp = Date.now() // store timestamp
      console.log(chalk.yellow('QR received! Visit /qr to scan.'))
    }

    if (connection === 'open') {
      console.log(chalk.green('💀 RIOT MD CONNECTED!'))
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(chalk.red('Connection closed, reconnecting...'))
      if (shouldReconnect) startBot()
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const prefix = process.env.PREFIX || '.'
    if (!text.startsWith(prefix)) return

    const command = text.slice(prefix.length).trim().toLowerCase()

    // Test command
    if (command === 'ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong! RIOT MD is working 💀🔥' })
    }
  })
}

startBot()

// Anti-crash
process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)
