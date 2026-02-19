export const name = 'dice'
export async function run(sock, msg, args) {
  const result = Math.floor(Math.random() * 6) + 1
  await sock.sendMessage(msg.key.remoteJid, { text: `🎲 Dice Rolled: ${result}` })
}
