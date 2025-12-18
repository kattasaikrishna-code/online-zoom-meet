import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MeetingRoom from "./MeetingRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/meeting/text123" />} />
        <Route path="/meeting/:roomId" element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
