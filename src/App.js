import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MeetingRoom from "./MeetingRoom";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const roomId = uuidv4(); 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/meeting/${roomId}`} />} />
        <Route path={`/meeting/:roomId`} element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
