import { useEffect, useRef, useState } from "react";
import { PixelFrame } from "@/components/app/PixelFrame";

type Frame = { src: string; alt: string };

export function LandingVideo({
  src,
  poster,
  frames,
}: {
  src?: string;
  poster: string;
  frames: Frame[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const file = src?.trim() ?? "";
  const reel = frames.length > 0 ? frames : [{ src: poster, alt: "Venus App" }];

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (file || reduced || reel.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % reel.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [file, reduced, reel.length]);

  async function toggleVideo() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <PixelFrame>
      <div className="relative h-full w-full bg-black">
        {file ? (
          <video
            ref={videoRef}
            src={file}
            poster={poster}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          reel.map((frame, i) => (
            <img
              key={frame.src}
              src={frame.src}
              alt={i === index ? frame.alt : ""}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        )}

        {file && !playing && (
          <button
            type="button"
            onClick={toggleVideo}
            className="absolute inset-0 z-10 flex items-center justify-center bg-forest/25"
            aria-label="Reproducir vídeo"
          >
            <span className="flex h-16 w-16 items-center justify-center border border-cream/80 text-cream">
              <PlayMark />
            </span>
          </button>
        )}

        {file && playing && (
          <button
            type="button"
            onClick={toggleVideo}
            className="absolute bottom-3 right-3 z-10 border border-cream/50 px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-cream"
            aria-label="Pausar vídeo"
          >
            Pausa
          </button>
        )}
      </div>
    </PixelFrame>
  );
}

function PlayMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M7 4.5v13l11-6.5L7 4.5z" fill="currentColor" />
    </svg>
  );
}
