export const name = 'coinflip'
export async function run(sock, msg, args) {
  const result = Math.random() > 0.5 ? 'Heads' : 'Tails'
  await sock.sendMessage(msg.key.remoteJid, { text: `🎲 Coin Flip: ${result}` })
}
