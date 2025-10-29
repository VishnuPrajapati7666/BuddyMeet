  let getDisplayMediaSuccess=(stream)=>{
    try{
      window.localStream.getTracks.forEach(track=>track.stop())
    }catch(e){
      console.log(e);
    }

    window.localStream=stream;
    localVideoRef.current.srcObject=stream;

    for(let id in connections){
      if(id===socketIdRef.current) continue;

      connections[id].addstream(window.localStream)
      connections[id].createOffer().then((description)=>{
        connections[id].setLocalDescription(description)
        .then(()=>{
          socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
        })
        .catch((e)=>console.log(e));
      })
    }
       stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { console.log(e); }

      // Black + silence stream
      let blackSilence = () => new MediaStream([black(), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      getUserMedia();
    });
  }
  let getDisplayMedia=()=>{
    if(screen){
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
        .then(getDisplayMediaSuccess)
        .then((stream)=>{ })
        .catch((e)=>console.log(e))
      }
    }
  }
  useEffect(()=>{
    if(screen!==undefined){
      getDisplayMedia();
    }
  },[screen])

  let handlescreen=()=>{
    setScreen(!screen);
  }