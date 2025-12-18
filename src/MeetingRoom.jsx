import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const containerRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const appID = 1791600450;
  const serverSecret = "99aa4a826d1bf6b7b57fe87253a22a07";

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomId,
    Date.now().toString(),
    "User" + Math.floor(Math.random() * 1000)
  );

  const loadMeeting = (element) => {
    if (!element || containerRef.current) return;
    containerRef.current = element;

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
      showPreJoinView: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
    });
  };

  // 🔴 START SCREEN RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      recorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });

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
    recorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0e17" }}>
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
        <span style={{ fontWeight: "bold" }}>Room: {roomId}</span>
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




