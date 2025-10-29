  <div >
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
      </div> :
       <div className={styles.meetVideoContainer}>
        <div className={styles.buttonContainers}>
          
          <IconButton onClick={handleVideo} styles={{color:"white"}}>
            {(video===true) ? <Videocam/> : <VideocamOff/>}
          </IconButton>
            <IconButton styles={{color:"white"}}>
           <CallEnd/>
          </IconButton>
          <IconButton onClick={handleAudio} styles={{color:"white"}}>
            {(audio===true) ? <Mic/>:<MicOff/>}
          </IconButton>
         {screenAvailable===true ?
         <IconButton>
          {screen==true  ? <ScreenShare/>:<StopScreenShare/>}
         </IconButton> : <></>}

         <Badge badgeContent={newMessages} max={999} color='secondary'>
           <IconButton>
           <Chat/>
         </IconButton>
         </Badge>
        </div >
        <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay></video>
        <div className={styles.conferenceView}>
        {videos.map((video) => (
          <div  key={video.socketList}>
            <video
              ref={el => {
                if (el && video.stream) el.srcObject = video.stream
              }}
              autoPlay
              playsInline
            />
          </div>
        ))}
</div>
      </div>
      }
    </div>