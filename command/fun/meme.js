export const name = 'meme'
export async function run(sock, msg, args) {
  const memes = [
    'https://i.imgflip.com/1bij.jpg',
    'https://i.imgflip.com/26am.jpg'
  ]
  const random = memes[Math.floor(Math.random() * memes.length)]
  await sock.sendMessage(msg.key.remoteJid, { image: { url: random } })
}
