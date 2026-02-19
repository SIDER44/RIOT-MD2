export const name = 'owner'
export async function run(sock, msg, args) {
  await sock.sendMessage(msg.key.remoteJid, { text: `Owner: ${process.env.OWNER_NUMBER}` })
}
