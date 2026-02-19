export const name = 'ping'
export async function run(sock, msg, args) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong! RIOT MD is alive 💀🔥' })
}
