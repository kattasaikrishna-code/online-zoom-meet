import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isHost, setIsHost] = useState(false);
  console.log("isHost", isHost);
  const zpRef = useRef(null);

  const appID = 1791600450;
  const serverSecret = "99aa4a826d1bf6b7b57fe87253a22a07";

  // Generate a consistent userID for the session to help with host identification if needed
  const [userID] = useState("User" + Math.floor(Math.random() * 100));

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomId,
    userID,
    userID
  );

  const loadMeeting = (element) => {
    if (!element || zpRef.current) return;

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: element,
      roomID: roomId, // Explicitly pass roomID
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
        config: {
          role: isHost ? "Host" : "Participant",
        },
      },
      layout: "Sidebar",
      config: {
        showLayoutButton: false,
        showPinButton: true,
        showUserList: true,
        showRoomDetailsButton: true, // Explicitly show room details
      },
      showPreJoinView: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      onJoinRoom: (users) => {
        console.log("Joined room with users:", users);
        if (users && users.length === 1 && users[0].userID === userID) {
          setIsHost(true);
        }
      },      
      onAutoPlayFailed: () => {
        console.log("Autoplay failed, attempting to resume...");
        const resume = () => {
          if (zpRef.current) {
            document.removeEventListener("click", resume);
          }
        };
        document.addEventListener("click", resume);
      },
    });
  };

  // 🔴 START SCREEN RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      recorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      const chunks = [];
      recorderRef.current.ondataavailable = (e) => chunks.push(e.data);

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meeting_recording_${Date.now()}.webm`;
        a.click();
      };

      recorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Permission denied for screen recording");
    }
  };

  // ⏹ STOP RECORDING
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0e17" }}>
      {/* 🔴 CSS Hack to restrict pinning to host ONLY and handle "Middle" requirement 🔴 */}
      <style>
        {`
          /* If not host, hide pin button */
          ${
            !isHost
              ? `
            .zego-uikit-video-nav-pin, 
            .zego_pin_icon,
            [class*="pin"] {
              display: none !important;
            }
          `
              : ""
          }
          
          /* "Middle" requirement: Zego's Sidebar layout pinned user usually goes to the large area.
             We ensure the pinned user container is prominent. */
          .zego-uikit-video-main-view {
            flex: 1 !important;
          }
        `}
      </style>

      {/* 🔵 HEADER with record buttons */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          background: "#1b1f2a",
          color: "white",
          gap: 15,
        }}
      >
        {!isRecording ? (
          <button onClick={startRecording} style={{ padding: "8px 15px" }}>
            ⏺ Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{ padding: "8px 15px" }}>
            ⏹ Stop Recording
          </button>
        )}
        <span style={{ fontWeight: "bold" }}>RoomID: {roomId}</span>
        {isHost && (
          <span style={{ marginLeft: "auto", color: "#4caf50" }}>⭐ Host</span>
        )}
      </div>

      {/* 🔵 VIDEO CALL AREA */}
      <div
        ref={loadMeeting}
        style={{
          width: "90%",
          height: "80vh",
          margin: "20px auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
