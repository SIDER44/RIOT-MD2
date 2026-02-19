export const name = 'sticker'
export async function run(sock, msg, args) {
  if (!msg.message.imageMessage) return await sock.sendMessage(msg.key.remoteJid, { text: 'Send an image with this command' })
  const buffer = msg.message.imageMessage.imageBuffer || Buffer.from([])
  await sock.sendMessage(msg.key.remoteJid, { sticker: buffer })
}
