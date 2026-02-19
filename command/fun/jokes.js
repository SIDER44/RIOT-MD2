export const name = 'joke'
export async function run(sock, msg, args) {
  const jokes = [
    'Why do programmers prefer dark mode? Because light attracts bugs!',
    'I would tell you a UDP joke, but you might not get it.',
    'Why did the computer show up late? It had a hard drive!'
  ]
  const random = jokes[Math.floor(Math.random() * jokes.length)]
  await sock.sendMessage(msg.key.remoteJid, { text: random })
}
