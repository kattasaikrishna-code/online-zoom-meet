import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MeetingRoom from "./MeetingRoom";
import { v4 as uuidv4 } from "uuid";

const generateRoomId = () => {
  const ROOM_KEY = "meeting_room_id";
  let roomId = sessionStorage.getItem(ROOM_KEY);
  if (!roomId) {
    roomId = uuidv4();
    sessionStorage.setItem(ROOM_KEY, roomId);
  }
  return roomId;
};

export default function App() {
  const roomId = generateRoomId();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/meeting/${roomId}`} />} />
        <Route path={`/meeting/:roomId`} element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
