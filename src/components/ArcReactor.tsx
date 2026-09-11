import React from "react";
import { JarvisState } from "../types";

interface ArcReactorProps {
  state: JarvisState;
  isListening: boolean;
  audioLevel?: number;
  onClick?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  state,
  isListening,
  audioLevel = 0.5,
  onClick,
}) => {
  // Determine state colors and glow
  const isAlert = state === "WAITING_FOR_CONFIRMATION";
  const isSuccess = state === "COMPLETED";
  const isBusy =
    state === "UNDERSTANDING" ||
    state === "PLANNING" ||
    state === "EXECUTING" ||
    state === "OBSERVING" ||
    state === "VERIFYING";

  const primaryColor = isAlert
    ? "#f59e0b" // Amber alert
    : isSuccess
    ? "#10b981" // Emerald verified
    : "#00f0ff"; // Signature JARVIS cyan

  const secondaryColor = isAlert ? "#d97706" : isSuccess ? "#059669" : "#0284c7";

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      title={isListening ? "Listening... click to stop" : "Click to speak with JARVIS"}
    >
      {/* Outer ambient glow halo */}
      <div
        className="absolute w-44 h-44 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          backgroundColor: primaryColor,
          transform: isListening ? `scale(${1 + audioLevel * 0.4})` : isBusy ? "scale(1.1)" : "scale(1)",
        }}
      />

      {/* Main Reactor Body Container */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Ring 1 - Mechanical Notches */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]"
          viewBox="0 0 144 144"
          fill="none"
        >
          <circle
            cx="72"
            cy="72"
            r="68"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="4 8"
            strokeOpacity="0.6"
          />
          {/* Tick marks around perimeter */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <line
              key={i}
              x1="72"
              y1="4"
              x2="72"
              y2="10"
              stroke={primaryColor}
              strokeWidth="2"
              strokeOpacity="0.8"
              transform={`rotate(${angle} 72 72)`}
            />
          ))}
        </svg>

        {/* Outer Ring 2 - Reverse Counter-Rotating Segmented Ring */}
        <svg
          className={`absolute inset-2 w-[128px] h-[128px] ${
            isBusy ? "animate-[spin_4s_linear_infinite_reverse]" : "animate-[spin_18s_linear_infinite_reverse]"
          }`}
          viewBox="0 0 128 128"
          fill="none"
        >
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="18 12 6 12"
            strokeOpacity="0.8"
          />
          <circle
            cx="64"
            cy="64"
            r="50"
            stroke={primaryColor}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </svg>

        {/* 10 Triangular Solenoid Segments (Iron Man Arc Coils) */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isListening ? "animate-pulse" : ""
          }`}
        >
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, index) => (
            <div
              key={index}
              className="absolute w-3 h-7 rounded-xs transition-all duration-300"
              style={{
                backgroundColor: primaryColor,
                opacity: isListening ? 0.9 : 0.65,
                transform: `rotate(${deg}deg) translateY(-38px)`,
                boxShadow: `0 0 10px ${primaryColor}`,
              }}
            />
          ))}
        </div>

        {/* Inner Core Housing */}
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: `radial-gradient(circle, #ffffff 0%, ${primaryColor} 45%, #051429 100%)`,
            boxShadow: `0 0 25px ${primaryColor}, inset 0 0 15px rgba(255,255,255,0.8)`,
            transform: isListening ? `scale(${1 + audioLevel * 0.2})` : "scale(1)",
          }}
        >
          {/* Center core pulse ring */}
          <div
            className="w-7 h-7 rounded-full border-2 border-white/80 flex items-center justify-center"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 0 15px #ffffff`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
          </div>
        </div>
      </div>
    </div>
  );
};
