/*global io*/
/** @type {RTCConfiguration} */
const config = { // eslint-disable-line no-unused-vars
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302']
  }]
};
const IO_SERVER = 'https://10.120.3.11:4431';
var socket = io.connect(IO_SERVER);
// const socket = io.connect(window.location.origin);
const video = document.querySelector('video'); // eslint-disable-line no-unused-vars
const span = document.querySelector('span'); // eslint-disable-line no-unused-vars

window.onunload = window.onbeforeunload = function() {
	socket.close();
};

