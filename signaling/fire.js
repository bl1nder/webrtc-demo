const Server = require('signal-fire').Server

// Instantiate a new Server
const server = new Server({
  // These options are passed directly to ws
  port: 8080
})

server.on('add_peer', peer => {
  console.log(`Added peer with peerId ${peer.peerId}`)
})

server.on('remove_peer', peerId => {
  console.log(`Removed peer with peerId ${peerId}`)
})

server.start().then(() => {
  console.log('Server started')
})