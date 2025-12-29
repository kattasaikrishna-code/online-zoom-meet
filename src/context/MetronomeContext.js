import React, { createContext, useContext } from "react";

const MetronomeContext = createContext(undefined);

export const MetronomeProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [bpm, setBpm] = React.useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = React.useState(4);
  const [count, setCount] = React.useState(0);
  const [stressFirstBeat, setStressFirstBeat] = React.useState(true);

  const audioContextRef = React.useRef(null);
  const nextTickTimeRef = React.useRef(0);
  const timerIDRef = React.useRef(null);

  const bpmRef = React.useRef(bpm);
  const beatsPerMeasureRef = React.useRef(beatsPerMeasure);
  const stressFirstBeatRef = React.useRef(stressFirstBeat);
  const countRef = React.useRef(count);

  React.useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  React.useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  React.useEffect(() => {
    stressFirstBeatRef.current = stressFirstBeat;
  }, [stressFirstBeat]);

  const playClick = (time, accent) => {
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    osc.frequency.value = accent ? 880 : 440;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  const scheduleTick = () => {
    while (
      nextTickTimeRef.current <
      audioContextRef.current.currentTime + 0.1
    ) {
      playClick(
        nextTickTimeRef.current,
        stressFirstBeatRef.current && countRef.current === 0
      );

      setCount(countRef.current);

      const secondsPerBeat = 60.0 / bpmRef.current;
      nextTickTimeRef.current += secondsPerBeat;

      countRef.current = (countRef.current + 1) % beatsPerMeasureRef.current;
    }
  };

  const startStop = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    if (!isPlaying) {
      countRef.current = 0;
      setCount(0);
      nextTickTimeRef.current = audioContextRef.current.currentTime + 0.05;
      timerIDRef.current = setInterval(scheduleTick, 25);
      setIsPlaying(true);
    } else {
      clearInterval(timerIDRef.current);
      setIsPlaying(false);
    }
  };

  const value = {
    isPlaying,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    count,
    stressFirstBeat,
    setStressFirstBeat,
    startStop,
  };

  return (
    <MetronomeContext.Provider value={value}>
      {children}
    </MetronomeContext.Provider>
  );
};

export const useMetronomeContext = () => {
  const context = useContext(MetronomeContext);
  if (context === undefined) {
    throw new Error(
      "useMetronomeContext must be used within a MetronomeProvider"
    );
  }
  return context;
};
