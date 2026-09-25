import { useEffect, useRef, useState } from "react";

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
  const [cycle, setCycle] = useState(0);
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
  }, [file, reduced, reel.length, cycle]);

  function go(next: number) {
    setIndex((next + reel.length) % reel.length);
    setCycle((value) => value + 1);
  }

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
    <div className="relative mx-auto w-full max-w-[22rem] px-1.5">
      <span aria-hidden="true" className="absolute left-0 top-24 h-8 w-1 rounded-l-sm bg-black" />
      <span aria-hidden="true" className="absolute left-0 top-36 h-14 w-1 rounded-l-sm bg-black" />
      <span aria-hidden="true" className="absolute right-0 top-32 h-16 w-1 rounded-r-sm bg-black" />
      <div className="rounded-[2.7rem] bg-black p-3 shadow-[0_28px_50px_-24px_rgba(0,0,0,0.7)]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2.05rem] bg-black">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
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

      <div className="mt-3 flex items-center justify-around px-8 pb-1">
        <button
          type="button"
          onClick={() => !file && go(index - 1)}
          className="text-cream/85"
          aria-label="Atrás"
        >
          <NavBack />
        </button>
        <button type="button" className="text-cream/40" aria-label="Inicio">
          <NavHome />
        </button>
        <button
          type="button"
          onClick={() => !file && go(index + 1)}
          className="text-cream/65"
          aria-label="Aplicaciones"
        >
          <NavApps />
        </button>
      </div>
      </div>
    </div>
  );
}

function PlayMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M7 4.5v13l11-6.5L7 4.5z" fill="currentColor" />
    </svg>
  );
}

function NavBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.2 6.4 8 12l8.2 5.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function NavHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function NavApps() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
