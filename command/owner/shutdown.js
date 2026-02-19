export const name = 'shutdown'
export async function run(sock, msg, args) {
  const owner = process.env.OWNER_NUMBER
  if (msg.key.participant !== owner + '@s.whatsapp.net') return
  await sock.sendMessage(msg.key.remoteJid, { text: 'Bot shutting down...' })
  process.exit(0)
}
