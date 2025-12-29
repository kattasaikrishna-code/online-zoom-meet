import { useRef, useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import CountMeter from "./CounterMeter";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const recorderRef = useRef(null);
  const zpRef = useRef(null);
  const isInitializing = useRef(false);
  const isCleaningUp = useRef(false);
  const isMounted = useRef(true);
  const currentRequestId = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [showCountMeter, setShowCountMeter] = useState(false);

  const savedData = useMemo(() => {
    try {
      const fromSession = sessionStorage.getItem(`meet_${roomId}`);
      return fromSession ? JSON.parse(fromSession) : null;
    } catch (e) {
      return null;
    }
  }, [roomId]);

  const [userName, setUserName] = useState(
    location.state?.userName || savedData?.userName || ""
  );
  const [isHost] = useState(
    location.state?.isHost || savedData?.isHost || false
  );
  console.log("isHost", isHost);
  const userID = useMemo(() => {
    const savedID = sessionStorage.getItem("zego_user_id");
    if (savedID) return savedID;
    const newID = "ID_" + Math.floor(Math.random() * 10000);
    sessionStorage.setItem("zego_user_id", newID);
    return newID;
  }, []);

  const appID = 1791600450;
  const serverSecret = "99aa4a826d1bf6b7b57fe87253a22a07";

  const initMeeting = async () => {
    if (
      !userName ||
      !containerRef.current ||
      zpRef.current ||
      isInitializing.current
    )
      return;

    const requestId = ++currentRequestId.current;
    try {
      isInitializing.current = true;
      if (!isMounted.current || requestId !== currentRequestId.current) return;
      setLoading(true);
      setError(null);

      // Add a small delay to ensure DOM is fully settled
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (!isMounted.current || requestId !== currentRequestId.current) return;

      if (!containerRef.current) return;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      if (!isMounted.current || requestId !== currentRequestId.current) {
        try {
          zp.destroy();
        } catch (e) {}
        return;
      }
      zpRef.current = zp;

      try {
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
            config: {
              role: isHost
                ? ZegoUIKitPrebuilt.Host
                : ZegoUIKitPrebuilt.Participant,
            },
          },
          layout: "Sidebar",
          config: {
            showLayoutButton: false,
            showPinButton: isHost,
            showUserList: true,
            showRemoveUserButton: isHost,
            showRoomDetailsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            // Media handling
            lowerLeftNotification: {
              showUserJoinAndLeave: true,
              showTextChat: true,
            },
          },
          showPreJoinView: false,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          // CRITICAL: Handle autoplay failure
          onAutoPlayFailed: (error) => {
            console.warn("Autoplay failed:", error);
            setShowAutoplayPrompt(true);
          },
          onJoinRoom: () => {
            setLoading(false);
          },
          onLeaveRoom: async () => {
            await cleanUpZego();
            if (isMounted.current) {
              navigate("/");
            }
          },
          onError: (err) => {
            console.error("Zego Error:", err);
            setLoading(false);
            if (err === 1104030) {
              setError(
                "Permission denied. Please allow camera and microphone access."
              );
            } else if (err === 1004020) {
              console.warn(
                "Stream interrupted. Zego will retry automatically."
              );
            }
          },
        });
      } catch (joinErr) {
        console.error("Zego joinRoom critical error:", joinErr);
        // If it's the tracer null error, we might just want to ignore it if zp exists
        if (joinErr?.message?.includes("tracer")) {
          console.warn("Dampened tracer error during joinRoom");
        } else {
          throw joinErr;
        }
      }
    } catch (err) {
      console.error("Meeting setup error:", err);
      setError("Failed to initialize meeting room. Please try again.");
      setLoading(false);
    } finally {
      if (requestId === currentRequestId.current) {
        isInitializing.current = false;
      }
    }
  };

  const cleanUpZego = async () => {
    if (isCleaningUp.current) return;
    try {
      isCleaningUp.current = true;
      // Also stop any ongoing initialization attempt
      currentRequestId.current++;
      isInitializing.current = false;

      if (!zpRef.current) return;

      console.log("Safe Zego cleanup initiated...");
      // Wrap in try-catch to ignore Zego DOM removal errors if React beat us to it
      try {
        await zpRef.current.destroy();
      } catch (e) {
        console.warn("Zego destroy warning (usually safe to ignore):", e);
      }
      zpRef.current = null;
    } finally {
      isCleaningUp.current = false;
    }
  };

  useEffect(() => {
    isMounted.current = true;
    initMeeting();
    return () => {
      isMounted.current = false;
      cleanUpZego();
    };
  }, [userName, roomId]);

  const handleResumeMedia = () => {
    if (zpRef.current) {
      // By clicking this, we provide the user interaction needed for autoplay
      setShowAutoplayPrompt(false);
      // Zego usually tries to resume automatically on next frame after interaction
    }
  };

  const copyMeetingLink = () => {
    const link = window.location.origin + "/meeting/" + roomId;
    navigator.clipboard.writeText(link).then(() => {
      alert("Meeting link copied to clipboard!");
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      // Find supported MP4 type, fallback to webm
      const types = [
        "video/mp4;codecs=h264",
        "video/mp4",
        "video/webm;codecs=h264",
        "video/webm",
      ];
      const supportedType = types.find((t) => MediaRecorder.isTypeSupported(t));

      recorderRef.current = new MediaRecorder(stream, {
        mimeType: supportedType,
      });

      const chunks = [];
      recorderRef.current.ondataavailable = (e) => chunks.push(e.data);

      recorderRef.current.onstop = () => {
        const extension = supportedType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: supportedType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meeting_recording_${Date.now()}.${extension}`;
        a.click();
      };

      recorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Permission denied for screen recording");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  if (!userName) {
    return (
      <div style={formStyles.overlay}>
        <div style={formStyles.modal}>
          <h2 style={{ marginBottom: "16px", fontSize: "28px" }}>
            Join Meeting
          </h2>
          <p
            style={{ color: "#8E8E93", marginBottom: "24px", fontSize: "16px" }}
          >
            Identify yourself to join room: <br />
            <b style={{ color: "#0E71EB" }}>{roomId}</b>
          </p>
          <input
            autoFocus
            style={formStyles.input}
            placeholder="Your Name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                const name = e.target.value;
                sessionStorage.setItem(
                  `meet_${roomId}`,
                  JSON.stringify({ userName: name, isHost: false })
                );
                setUserName(name);
              }
            }}
          />
          <button
            style={formStyles.button}
            onClick={(e) => {
              const input = e.target.previousSibling;
              if (input && input.value) {
                const name = input.value;
                sessionStorage.setItem(
                  `meet_${roomId}`,
                  JSON.stringify({ userName: name, isHost: false })
                );
                setUserName(name);
              }
            }}
          >
            Join Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#1b1f2a",
        display: "grid",
        gridTemplateRows: "70px 1fr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#1b1f2a",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            className="spinner"
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid rgba(255,255,255,0.1)",
              borderTop: "5px solid #0E71EB",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ color: "white", marginTop: "20px", fontSize: "18px" }}>
            Connecting to meeting...
          </p>
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#2C2C2E",
              padding: "40px",
              borderRadius: "20px",
              maxWidth: "400px",
            }}
          >
            <p
              style={{
                color: "#FF3B30",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...actionButtonStyle,
                background: "#0E71EB",
                padding: "12px 24px",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {showAutoplayPrompt && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#2C2C2E",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <p
              style={{ color: "white", fontSize: "18px", marginBottom: "20px" }}
            >
              Media playback was blocked by your browser.
            </p>
            <button
              onClick={handleResumeMedia}
              style={{
                ...actionButtonStyle,
                padding: "12px 30px",
                fontSize: "16px",
              }}
            >
              Click to Resume Media
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .zego-uikit-video-main-view { background: #000; }
          .pinned-user-active .zego-uikit-video-main-view { border: 3px solid #0E71EB; }
        `}
      </style>

      {/* 🔵 HEADER */}
      <div
        style={{
          height: 70,
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          background: "#24292e",
          color: "white",
          gap: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#0E71EB",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            Zoom Meeting
          </span>
          <span
            style={{
              background: "#3A3A3C",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              marginLeft: "10px",
              color: "#8E8E93",
            }}
          >
            ID: {roomId}
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isHost && (
            <button onClick={copyMeetingLink} style={actionButtonStyle}>
              🔗 Link
            </button>
          )}

          <button
            onClick={() => setShowCountMeter(!showCountMeter)}
            style={{
              ...actionButtonStyle,
              background: "#29465B",
            }}
          >
            Count Meter
          </button>

          <button
            onClick={!isRecording ? startRecording : stopRecording}
            style={{
              ...actionButtonStyle,
              background: "#3A3A3C",
            }}
          >
            Record
          </button>

          <button
            onClick={async () => {
              if (window.confirm("Leave?")) {
                await cleanUpZego();
                navigate("/");
              }
            }}
            style={{
              ...actionButtonStyle,
              background: "#FF3B30",
              fontWeight: "bold",
            }}
          >
            Leave
          </button>
        </div>

        {isHost && (
          <div
            style={{
              marginLeft: "10px",
              padding: "4px 12px",
              background: "#FF9500",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            HOST
          </div>
        )}
      </div>

      {/* 🔵 MAIN AREA (VIDEO + SIDEBAR) */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 🔵 VIDEO CALL AREA */}
        <div
          style={{
            position: "relative",
            background: "#000",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
        {showCountMeter && <CountMeter setShowCountMeter={setShowCountMeter} />}
      </div>
    </div>
  );
}

const actionButtonStyle = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#0E71EB",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "opacity 0.2s",
};

const formStyles = {
  overlay: {
    height: "100vh",
    width: "100vw",
    background: "#191919",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  modal: {
    background: "#242424",
    padding: "50px",
    borderRadius: "24px",
    width: "450px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  },
  input: {
    width: "100%",
    padding: "18px",
    marginBottom: "24px",
    background: "#333333",
    border: "1px solid #444",
    borderRadius: "12px",
    color: "white",
    fontSize: "18px",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "18px",
    background: "#0E71EB",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
