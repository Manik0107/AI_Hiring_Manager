import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: VoiceRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const animationRef = useRef<number>();

  // Simulate audio level animation when recording
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        setAudioLevel(Math.random() * 100);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Recording visualization */}
      <div className="relative">
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-all",
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-primary text-primary-foreground"
          )}
          style={{
            transform: isRecording ? `scale(${1 + audioLevel / 300})` : "scale(1)",
          }}
        >
          {isRecording ? (
            <Mic className="w-12 h-12" />
          ) : (
            <MicOff className="w-12 h-12" />
          )}
        </div>

        {/* Audio level rings */}
        {isRecording && (
          <>
            <div
              className="absolute inset-0 rounded-full border-4 border-red-300/50 animate-ping"
              style={{ animationDuration: "1.5s" }}
            />
            <div
              className="absolute -inset-4 rounded-full border-2 border-red-200/30 animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </>
        )}
      </div>

      {/* Status text */}
      <div className="text-center">
        <p
          className={cn(
            "text-lg font-medium",
            isRecording ? "text-red-600" : "text-muted-foreground"
          )}
        >
          {isRecording ? "Recording your response..." : "Click to start recording"}
        </p>
        {isRecording && (
          <p className="text-sm text-muted-foreground mt-1">
            Speak clearly into your microphone
          </p>
        )}
      </div>

      {/* Control button */}
      <Button
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={disabled}
        className="px-8"
      >
        {isRecording ? (
          <>
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
}
