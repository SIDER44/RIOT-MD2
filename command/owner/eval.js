export const name = 'eval'
export async function run(sock, msg, args) {
  const owner = process.env.OWNER_NUMBER
  if (msg.key.participant !== owner + '@s.whatsapp.net') return
  try {
    const code = args.join(' ')
    let evaled = eval(code)
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
    await sock.sendMessage(msg.key.remoteJid, { text: evaled })
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Error: ' + err })
  }
}
