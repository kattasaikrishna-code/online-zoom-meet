import { CircleX, Minus, Plus, Play, Square } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useMetronomeContext } from "../context/MetronomeContext";

export default function CountMeter({ setShowCountMeter }) {
  const {
    isPlaying,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    count,
    stressFirstBeat,
    setStressFirstBeat,
    startStop,
  } = useMetronomeContext();

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur">
        <h2 className="font-display text-sm tracking-wider text-foreground">
          Count Meter
        </h2>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => {
            setShowCountMeter(false);
          }}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <CircleX className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 gap-8 overflow-y-auto">
        {/* Visual Beats */}
        <div className="flex flex-col mt-[50px] gap-4 p-5 bg-muted/30 rounded-2xl border border-border/50 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Beats per measure
            </span>
            <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border border-border/50">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() =>
                  setBeatsPerMeasure(Math.max(1, beatsPerMeasure - 1))
                }
                className="h-6 w-6 rounded-md"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-5 text-center text-sm font-black tabular-nums">
                {beatsPerMeasure}
              </span>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() =>
                  setBeatsPerMeasure(Math.min(16, beatsPerMeasure + 1))
                }
                className="h-6 w-6 rounded-md"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 min-h-[44px] items-center">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3.5 h-3.5 rounded-full transition-all duration-100",
                  isPlaying && count === i
                    ? i === 0 && stressFirstBeat
                      ? "bg-primary scale-150 shadow-[0_0_15px_hsl(var(--primary))]"
                      : "bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary))]"
                    : "bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Start/Stop Button */}
        <div className="flex flex-col gap-6 mt-auto">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="stress-beat"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
            >
              Accentuate first beat
            </label>
            <div
              onClick={() => setStressFirstBeat(!stressFirstBeat)}
              className={cn(
                "w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                stressFirstBeat
                  ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                  : "bg-muted shadow-inner"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                  stressFirstBeat ? "left-6" : "left-1"
                )}
              />
            </div>
          </div>

          <Button
            variant={isPlaying ? "destructive" : "glow"}
            size="lg"
            onClick={startStop}
            className="w-full font-black tracking-widest text-xl py-10 rounded-2xl shadow-xl transition-all hover:shadow-2xl active:scale-[0.97] border-2 border-transparent"
          >
            {isPlaying ? (
              <div className="flex items-center gap-3">
                <Square className="w-6 h-6 fill-current" />
                STOP
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 fill-current ml-1" />
                START
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
