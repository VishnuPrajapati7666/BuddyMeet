    <div className={styles.meetVideoContainer}>
      <h1>{username}</h1>
      {askForUsername ? (
        <div>
          <TextField
            id="standard-basic"
            label="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            variant="standard"
          />
          <Button variant="contained" onClick={connect}>Connect</Button>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "60%",
              borderRadius: "12px",
              backgroundColor: "black",
            }}
          />
        </div>
      ) : (
        <>
          {/* Remote Videos */}
          <div className={`${styles.conferenceView} ${focusedVideo ? styles.blur : ''}`}>
            {videos.map((video) => (
              <video
                key={video.socketList}
                ref={el => { if (el && video.stream) el.srcObject = video.stream }}
                autoPlay
                playsInline
                onClick={() => setFocusedVideo(video)}
              />
            ))}
          </div>

          {/* Local Video */}
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            onClick={() => setFocusedVideo({ stream: window.localStream, id: "local" })}
          />

          {/* Focused Video Overlay */}
          {focusedVideo && (
            <video
              className={styles.focusedVideo}
              ref={el => { if (el && focusedVideo.stream) el.srcObject = focusedVideo.stream }}
              autoPlay
              playsInline
              onClick={() => setFocusedVideo(null)}
            />
          )}

          {/* Controls */}
          <div className={styles.buttonContainers}>
            <IconButton>{(video ? <Videocam /> : <VideocamOff />)}</IconButton>
            <IconButton><CallEnd /></IconButton>
            <IconButton>{(audio ? <Mic /> : <MicOff />)}</IconButton>
            {screenAvailable &&
              <IconButton>{screen ? <ScreenShare /> : <StopScreenShare />}</IconButton>
            }
            <Badge badgeContent={newMessages} max={999} color='secondary'>
              <IconButton><Chat /></IconButton>
            </Badge>
          </div>
        </>
      )}
    </div>