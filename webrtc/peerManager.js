class PeerManager {
    constructor() {
        var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        this.localPeerConnection = new PeerConnection(null);
        this.localPeerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                sendMessage(
                    'ICE_CANDIDATE',
                    this.clientId,
                    id
                )
            }
        }

        this.remotePeerConnection = new PeerConnection(null);
    }
    ping() {
        console.log('test')
    }
    createLocalPeer() {

    }
    connect(target, dest) {

    }
    createLocalOffer() {

    }
    setLocalDescription() {

    }
}