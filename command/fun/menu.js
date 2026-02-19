export const name = 'menu'
export async function run(sock, msg, args) {
  const prefix = process.env.PREFIX || '.'

  const menuMessage = `
💀 *RIOT MD Menu* 💀
Prefix: ${prefix}

*Fun Commands*
- ${prefix}ping
- ${prefix}joke
- ${prefix}coinflip

*Media Commands*
- ${prefix}sticker
- ${prefix}toimg

*Owner Commands*
- ${prefix}restart
- ${prefix}shutdown

...and many more commands! ⚡
`

  await sock.sendMessage(msg.key.remoteJid, { text: menuMessage })
}
