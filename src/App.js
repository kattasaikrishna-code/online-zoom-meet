import { BrowserRouter, Routes, Route } from "react-router-dom";
import MeetingRoom from "./MeetingRoom";
import Home from "./Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meeting/:roomId" element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
