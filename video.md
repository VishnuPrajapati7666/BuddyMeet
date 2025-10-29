import { TextField, Button } from "@mui/material";
import io from "socket.io-client";
import React, { useState, useRef, useEffect } from 'react';

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
}

function VideoMeetComponent() {

  let socketRef = useRef();
  let localVideoRef = useRef();
  let socketIdRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModel, setModal] = useState();

  let [messages, setMessages] = useState([]);

  let [newMessage, setNewMessages] = useState(0);

  let [askForUsername, setAskUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  // ----------------- Permissions -----------------
  const getPermission = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);

      if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  // ----------------- Silence and Black Stream -----------------
  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    let track = dst.stream.getAudioTracks()[0];
    track.enabled = false; // FIXED: previously used comma operator
    return track;
  }

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black'; // FIXED: fillStyle missing
    ctx.fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    let track = stream.getVideoTracks()[0];
    track.enabled = false; // FIXED: previously missing
    return track;
  }

  // ----------------- Get User Media -----------------
  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            // FIXED: JSON.stringify typo and LocalDescription property
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
          })
          .catch(e => console.log(e));
      }).catch(e => console.log(e));
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { console.log(e); }

      // Black + silence stream
      let blackSilence = () => new MediaStream([black(), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
            })
            .catch(e => console.log(e));
        });
      }
    });
  }

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) { // FIXED: parentheses
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch(e => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { }
    }
  }

  useEffect(() => {
    getPermission();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  // ----------------- Socket message -----------------
  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        }).catch(e => console.log(e));
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  }

  // ----------------- Add Message Placeholder -----------------
  const addMessage = (message) => {
    setMessages(prev => [...prev, message]); // FIXED: now stores messages
  }

  // ----------------- Socket Connect -----------------
  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos(videos => videos.filter(v => v.socketList !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          }

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(v => v.socketList === socketListId); // FIXED: find callback

            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketList === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketList: socketListId, // FIXED: consistent key naming
                stream: event.stream,
                autoPlay: true,
                playsInline: true
              }

              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          }

          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = () => new MediaStream([black(), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try { connections[id2].addStream(window.localStream); } catch (e) { }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                })
                .catch(e => console.log(e));
            });
          }
        }
      });
    });
  }

  // ----------------- Connect -----------------
  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  const connect = () => {
    setAskUsername(false);
    getMedia();
  }

  // ----------------- JSX -----------------
  return (
    <div>
      <h1>{username}</h1>
      {askForUsername ? <div>
        <TextField id="standard-basic" label="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          variant="standard" />
        <Button variant="contained" onClick={connect}>connect</Button>
        <div>
          <video ref={localVideoRef} autoPlay muted playsInline style={{
            width: "60%",
            borderRadius: "12px",
            backgroundColor: "black",
          }}></video>
        </div>
      </div> : <>
        <video ref={localVideoRef} autoPlay></video>
        {videos.map((video) => (
          <div key={video.socketList}>
            <video
              ref={el => {
                if (el) el.srcObject = video.stream
              }}
              autoPlay
              playsInline
            />
          </div>
        ))}
      </>
      }
    </div>
  )
}

export default VideoMeetComponent;
