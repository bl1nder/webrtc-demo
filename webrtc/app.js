class App {
    constructor() {
        const servers = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

        this.localPC = new PeerConnection(servers);
        this.remotePC = new PeerConnection(servers);
        this.localStream = null;
        this.myId = null;
        this.socket = null;
    }
    onSetSessionDescriptionError(error) {
        console.log(`Failed to set session description: ${error.toString()}`);
    }
    onSetLocalSuccess(localPC) {
        console.log(`${localPC} setLocalDescription complete`);
    }
    onCreateAnswerSuccess(desc) {
        console.log(`answer from pc1\n${desc.sdp}`);
        this.remotePC.setLocalDescription(desc)
            .then(() => this.onSetLocalSuccess(this.localPC), (x) => this.onSetSessionDescriptionError(x));

        this.localPC.setRemoteDescription(desc);
        // this.socket.emit('accept', createWebRTCmessage(socket.id, 'accept', desc))


    }
    onCreateOfferSuccess(desc) {
        console.log(`Offer from pc1\n${desc.sdp}`);
        console.log('pc1 setLocalDescription start');
        this.localPC.setLocalDescription(desc)
            .then(() => this.onSetLocalSuccess(this.localPC), (x) => this.onSetSessionDescriptionError(x));
        this.remotePC.setRemoteDescription(desc);
        this.localPC.addStream(this.localStream);
        console.log('remotePC setRemoteDescription start', this.localStream);
        this.socket.emit('offer', this.createWebRTCmessage(this.myId, 'offer', desc));
    }
    createOffer() {
        this.localPC.createOffer()
            .then((x) => { this.onCreateOfferSuccess(x) })
            .catch((x) => console.log('offer bad' + x));
    }
    createAnswer() {
        this.remotePC.setLocalDescription()
        this.remotePC.createAnswer()
            .then((x) => { this.onCreateAnswerSuccess(x) })
            .catch((x) => console.log('offer bad' + x));


    }
    acceptOffer() {
        this.socket.emit('accept')
    }
    createWebRTCmessage(from, type, data) {
        return {
            sdpData: data,
            type: type,
            from: ''
        }
    }
    start() {
        var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
        var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
        navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


        let localStream = null;
        var localPC = this.localPC;
        let remotePC = this.remotePC;
        localPC.onicecandidate = iceCallback1Local;
        remotePC.onicecandidate = iceCallback1Remote;

        remotePC.onaddtrack = gotRemoteTrack;
        remotePC.onaddstream = gotRemoteStream;
        function iceCallback1Local(event) {
            handleCandidate(event.candidate, remotePC, 'pc1: ', 'local');
        }

        function iceCallback1Remote(event) {
            handleCandidate(event.candidate, localPC, 'pc1: ', 'remote');
        }
        function handleCandidate(candidate, dest, prefix, type) {
            dest.addIceCandidate(candidate)
                .then(onAddIceCandidateSuccess, onAddIceCandidateError);
            console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
        }

        function onAddIceCandidateSuccess() {
            console.log('AddIceCandidate success.');
        }

        function onAddIceCandidateError(error) {
            console.log(`Failed to add ICE candidate: ${error.toString()}`);
        }

        navigator.getUserMedia(
            { audio: false, video: true },
            gotStream.bind(this),
            function (error) { console.log(error) }
        );

        function gotStream(stream) {
            localStream = stream;
            this.localStream = stream;
            var videoTrack = stream.getVideoTracks()[0];
            this.localStream.addTrack(stream.getVideoTracks()[0], stream);
            videoTrack = stream.getVideoTracks()[0];
            document.getElementById("callButton").style.display = 'inline-block';
            document.getElementById("localVideo").src = URL.createObjectURL(stream)

        }


        function streamError(error) {
            console.log(error);
        }


        function call() {

            console.log('Created local peer connection object pc1');
            // localPC.addStream(stream);
            localPC.onicecandidate = gotIceCandidate;
            localPC.onaddstream = gotRemoteStream;
            localPC.onnegotiationneeded = (state) => {
                console.log(state)
            }

            this.createOffer();

        }

        function onCreateSessionDescriptionError(error) {
            console.log(`Failed to create session description: ${error.toString()}`);
        }


        function createWebRTCmessage(from, type, data) {

            return {
                sdpData: data,
                type: type,
                from: ''
            }
        }

        function gotIceCandidate(event) {
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            }
        }

        var socket = io.connect(IO_SERVER);
        function sendMessage(m) {
            console.log('local ', m)
        }

        socket.on('connect', function () {
            console.log('a user connected - ', socket.id);
            document.title = socket.id;
            this.myId = socket.id;



        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        // socket.on('messageback', function (message) {

        //     if (message.type === 'offer') {
        //         localPC.setRemoteDescription(new SessionDescription(message));
        //         createAnswer();
        //     }
        //     else if (message.type === 'answer') {
        //         localPC.setRemoteDescription(new SessionDescription(message));
        //     }
        //     else if (message.type === 'candidate') {
        //         var candidate = new IceCandidate({ sdpMLineIndex: message.label, candidate: message.candidate });
        //         localPC.addIceCandidate(candidate);
        //     }
        // });

        function gotRemoteStream(event) {
            document.getElementById("remoteVideo").src = URL.createObjectURL(event.stream);
        }
        socket.on('log', function (message) {
            console.log(message)

            var div = document.createElement('div');
            div.innerText = message[2];
            document.getElementById('chat').appendChild(div);

        });

        socket.on('message', function (message) {
            console.log(message);
            var div = document.createElement('div');
            div.innerText = message;
            document.getElementById('chat').appendChild(div);

        });

        socket.on('joined', function (message) {
            console.log(message);
            const userlist = document.getElementById('userlist');
            userlist.innerHTML = '';
            const addOption = (text) => {
                var option = document.createElement("option");
                option.text = text;
                userlist.add(option);
            }
            message.userList.map(addOption);
        });

        socket.emit('create or join', 111)


        document.getElementById('sendBtn').addEventListener('click', () => {
            let obj = { message: document.getElementById('message').value, to: document.getElementById('userlist').value }
            socket.emit('message', obj)
        });

        socket.on('answer', function (message) {
            console.log('answer')
            function maybeAddLineBreakToEnd(sdp) {
                var endWithLineBreak = new RegExp(/\n$/);
                if (!endWithLineBreak.test(sdp)) {
                    return sdp + '\n';
                }
                return sdp;
            }
            message.sdp = maybeAddLineBreakToEnd(message.sdp);
            localPC.setRemoteDescription(new RTCSessionDescription(message));
            localPC.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
        })
        socket.on('accept_back', (message) => {
            console.log('accept_back')
            this.createAnswer();
        })

        function onCreateAnswerSuccess(desc) {
            console.log(`answer from pc1\n${desc.sdp}`);
            socket.emit('accept', createWebRTCmessage(socket.id, 'accept', desc))
            this.remotePC.setRemoteDescription(desc)
                .then(() => onSetLocalSuccess(localPC), onSetSessionDescriptionError)

        }
        function gotRemoteTrack() {
            console.log('gotRemoteTrack')

        }
        function gotRemoteStream() {
            console.log('gotRemoteStream')

        }
        document.getElementById('acceptButton').addEventListener('click', () => {
            debugger;
            this.acceptOffer();
        });

        document.getElementById('callButton').addEventListener('click', call.bind(this))
        this.socket = socket;
    }
}