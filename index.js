// index.js - RIOT MD full ES module update
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import express from 'express'
import chalk from 'chalk'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import qrcode from 'qrcode'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const PREFIX = process.env.PREFIX || '.'

// ---------- Web Server ----------
let lastQR = null
let qrTimestamp = 0

app.get('/', (req, res) => {
  res.send(`<h1>💀 RIOT MD ONLINE</h1>
            <p>Status: Running</p>
            <p>Uptime: ${process.uptime().toFixed(0)}s</p>
            <p>Scan <a href="/qr" target="_blank">this link</a> to login WhatsApp</p>`)
})

app.get('/qr', async (req, res) => {
  if (!lastQR) return res.send('No QR available yet, bot is starting...')
  const age = (Date.now() - qrTimestamp) / 1000
  if (age > 30) return res.send('<p>QR expired. Restart bot or wait for new QR.</p>')
  try {
    const qrImage = await qrcode.toDataURL(lastQR)
    res.send(`<h2>Scan QR with WhatsApp</h2>
              <img src="${qrImage}" />
              <p>Auto-refresh every 10s</p>
              <script>setTimeout(()=>location.reload(),10000)</script>`)
  } catch (err) {
    res.send('Error generating QR: '+err)
  }
})

app.listen(PORT, () => console.log(chalk.green(`Web server running on port ${PORT}`)))

// ---------- Load Commands ----------
function loadCommands() {
  const commandsPath = path.join('./commands')
  const categories = fs.readdirSync(commandsPath)
  const allCommands = {}

  for (const category of categories) {
    const catPath = path.join(commandsPath, category)
    if (!fs.statSync(catPath).isDirectory()) continue

    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'))
    allCommands[category] = files.map(f => {
      const filePath = path.join(catPath, f)
      return filePath
    })
  }

  console.log(chalk.blue('✅ Commands loaded:'))
  for (const cat in allCommands) {
    console.log(cat, allCommands[cat].map(c => path.basename(c, '.js')))
  }

  return allCommands
}

let commands = loadCommands()

// ---------- Start WhatsApp ----------
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
      qrTimestamp = Date.now()
      console.log(chalk.yellow('QR received! Visit /qr to scan.'))
    }

    if (connection === 'open') console.log(chalk.green('💀 RIOT MD CONNECTED!'))

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(chalk.red('Connection closed, reconnecting...'))
      if (shouldReconnect) startBot()
    }
  })

  // ---------- Message Handler ----------
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const sender = msg.key.participant || msg.key.remoteJid

    // ---------- Auto Menu for New Users ----------
    const sessionFile = `./sessions/${sender.replace(/[^0-9]/g,'')}.json`
    if (!fs.existsSync(sessionFile)) {
      try {
        const menuModule = await import(`./commands/fun/menu.js`)
        await menuModule.run(sock, msg, [])
      } catch (err) {
        console.log(chalk.red('Error sending auto menu:'), err)
      }
    }

    // ---------- Command Execution ----------
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/ +/)
    const cmdName = args.shift().toLowerCase()

    for (const cat in commands) {
      const cmdFilePaths = commands[cat]
      for (const filePath of cmdFilePaths) {
        try {
          const cmd = await import(filePath)
          if (cmd.name === cmdName) {
            await cmd.run(sock, msg, args)
          }
        } catch (err) {
          console.log(chalk.red(`Error running command ${cmdName}:`), err)
        }
      }
    }
  })
}

// ---------- Start Bot ----------
startBot()

// ---------- Anti-crash ----------
process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)
