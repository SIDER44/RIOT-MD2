export const name = 'broadcast'
export async function run(sock, msg, args) {
  const owner = process.env.OWNER_NUMBER
  if (msg.key.participant !== owner + '@s.whatsapp.net') return
  const text = args.join(' ')
  if (!text) return sock.sendMessage(msg.key.remoteJid, { text: 'Enter a message to broadcast!' })
  await sock.sendMessage(msg.key.remoteJid, { text: `📢 Broadcast: ${text}` })
}
