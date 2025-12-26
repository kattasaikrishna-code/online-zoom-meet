import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinName, setJoinName] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleNewMeeting = () => {
    const roomId = uuidv4();
    const meetingData = { isHost: true, userName: "Host", roomId };
    sessionStorage.setItem(`meet_${roomId}`, JSON.stringify(meetingData));
    navigate(`/meeting/${roomId}`, { state: meetingData });
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (joinRoomId && joinName) {
      const meetingData = {
        isHost: false,
        userName: joinName,
        roomId: joinRoomId,
      };
      sessionStorage.setItem(`meet_${joinRoomId}`, JSON.stringify(meetingData));
      navigate(`/meeting/${joinRoomId}`, { state: meetingData });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.grid}>
          {/* New Meeting */}
          <div style={styles.actionItem} onClick={handleNewMeeting}>
            <div style={{ ...styles.iconBtn, backgroundColor: "#FF742E" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span style={styles.actionLabel}>New Meeting</span>
          </div>

          {/* Join */}
          <div style={styles.actionItem} onClick={() => setShowJoinModal(true)}>
            <div style={{ ...styles.iconBtn, backgroundColor: "#0E71EB" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span style={styles.actionLabel}>Join</span>
          </div>

          {/* Schedule */}
          <div
            style={styles.actionItem}
            onClick={() => alert("Schedule feature coming soon!")}
          >
            <div style={{ ...styles.iconBtn, backgroundColor: "#0E71EB" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span style={styles.actionLabel}>Schedule</span>
          </div>

          {/* Share Screen */}
          <div
            style={styles.actionItem}
            onClick={() => alert("Join a meeting to share your screen!")}
          >
            <div style={{ ...styles.iconBtn, backgroundColor: "#0E71EB" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 11l7-7 7 7" />
                <path d="M12 4v16" />
              </svg>
            </div>
            <span style={styles.actionLabel}>Share Screen</span>
          </div>
        </div>
      </div>      

      {showJoinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Join Meeting</h2>
            <form onSubmit={handleJoinMeeting}>
              <input
                style={styles.input}
                placeholder="Meeting ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
              />
              <input
                style={styles.input}
                placeholder="Your Name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                required
              />
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.joinBtn}>
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#1C1C1E",
    color: "white",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "60px",
    maxWidth: "500px",
  },
  actionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.2s",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  iconBtn: {
    width: "90px",
    height: "90px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
  },
  actionLabel: {
    fontSize: "15px",
    fontWeight: "600",
    textAlign: "center",
    color: "#E5E5EA",
  },
  sidebar: {
    width: "450px",
    backgroundImage: "linear-gradient(to bottom right, #2C3E50, #000000)",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderLeft: "1px solid #333",
  },
  clockContainer: {
    marginTop: "20px",
  },
  timeText: {
    fontSize: "84px",
    fontWeight: "300",
    margin: 0,
    letterSpacing: "-3px",
  },
  dateText: {
    fontSize: "20px",
    color: "#8E8E93",
    margin: "10px 0 0 0",
  },
  meetingCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "30px",
    height: "220px",
    display: "flex",
    flexItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  noMeetingText: {
    color: "#8E8E93",
    fontSize: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "#2C2C2E",
    padding: "40px",
    borderRadius: "24px",
    width: "380px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "24px",
    fontSize: "24px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#3A3A3C",
    border: "1px solid #48484A",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "transparent",
    color: "#0E71EB",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
  },
  joinBtn: {
    padding: "10px 30px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0E71EB",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
  },
};

export default Home;
