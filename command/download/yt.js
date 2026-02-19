export const name = 'yt'
export async function run(sock, msg, args) {
  const url = args[0]
  if (!url) return await sock.sendMessage(msg.key.remoteJid, { text: 'Send a YouTube link!' })
  await sock.sendMessage(msg.key.remoteJid, { text: `Downloading from YouTube: ${url}` })
}
