import { BrowserRouter, Routes, Route } from "react-router-dom";
import MeetingRoom from "./components/MeetingRoom";
import Home from "./Home";
import CountMeter from "./components/CounterMeter";
import { MetronomeProvider } from "./context/MetronomeContext";

export default function App() {
  return (
    <MetronomeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meeting/:roomId" element={<MeetingRoom />} />
          <Route path="/countmeter" element={<CountMeter />} />
        </Routes>
      </BrowserRouter>
    </MetronomeProvider>
  );
}
