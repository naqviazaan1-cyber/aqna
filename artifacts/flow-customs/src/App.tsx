import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useRef, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";

const queryClient = new QueryClient();

const TRACKS = [
  { title: "Shabang",             artist: "Drake",               src: "/audio/shabang.mp4" },
  { title: "National Treasures",  artist: "Drake",               src: "/audio/national-treasures.mp4" },
  { title: "Ran To Atlanta",      artist: "21 Savage & Metro",   src: "/audio/ran-to-atlanta.mp4" },
];

const NUM_BARS = 12;

function AudioPlayer({ visible, onFirstPlay }: { visible: boolean; onFirstPlay?: () => void }) {
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const rafRef        = useRef<number>(0);
  const barEls        = useRef<(HTMLSpanElement | null)[]>(Array(NUM_BARS).fill(null));
  const connectedRef  = useRef(false);
  const pausedByModal = useRef(false);

  const [trackIdx, setTrackIdx]     = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);

  const track = TRACKS[trackIdx];

  // Set up audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.src = TRACKS[0].src;
    audio.preload = "auto";
    audio.loop = false;
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setTrackIdx(i => (i + 1) % TRACKS.length);
    });
    audio.addEventListener("play",  () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("durationchange", () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    });
    audio.addEventListener("loadedmetadata", () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    });

    return () => {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    };
  }, []);

  // When trackIdx changes, swap src and auto-play if already playing
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = !audio.paused;
    setCurrentTime(0);
    setDuration(0);
    audio.src = TRACKS[trackIdx].src;
    if (wasPlaying) audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Connect Web Audio API once on first play
  const connectAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (connectedRef.current || !audio) return;
    connectedRef.current = true;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    startVisualizer(analyser);
  }, []);

  function startVisualizer(analyser: AnalyserNode) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      barEls.current.forEach((el, i) => {
        if (!el) return;
        const bucketSize = Math.floor(data.length / NUM_BARS);
        const start = i * bucketSize;
        let sum = 0;
        for (let j = start; j < start + bucketSize; j++) sum += data[j];
        const avg = sum / bucketSize;
        const h = Math.max(2, (avg / 255) * 22);
        el.style.height = `${h}px`;
      });
    };
    draw();
  }

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    connectAnalyser();
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    await audio.play().catch(() => {});
    onFirstPlay?.();
  }, [connectAnalyser, onFirstPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const prev = useCallback(() => {
    setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  const next = useCallback(() => {
    setTrackIdx(i => (i + 1) % TRACKS.length);
  }, []);

  // Pause/resume when video modals open/close
  useEffect(() => {
    const onPause = () => {
      pausedByModal.current = !audioRef.current?.paused;
      audioRef.current?.pause();
    };
    const onResume = () => {
      if (pausedByModal.current) {
        play();
        pausedByModal.current = false;
      }
    };
    window.addEventListener("spotify-pause",  onPause);
    window.addEventListener("spotify-resume", onResume);
    return () => {
      window.removeEventListener("spotify-pause",  onPause);
      window.removeEventListener("spotify-resume", onResume);
    };
  }, [play]);

  // Auto-play when entering (visible becomes true)
  useEffect(() => {
    if (visible) play();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <>
      {/* Player card */}
      <div
        className="fixed bottom-4 right-4 z-50"
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transform: visible
            ? collapsed ? "translateY(calc(100% + 1rem))" : "translateY(0)"
            : "translateY(24px)",
          transition: "opacity 0.7s, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="w-72 rounded-2xl border border-white/[0.1] bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Visualizer strip */}
          <div className="flex items-end gap-[3px] h-8 px-4 pt-3 pb-0">
            {Array.from({ length: NUM_BARS }).map((_, i) => (
              <span
                key={i}
                ref={el => { barEls.current[i] = el; }}
                className="flex-1 rounded-full"
                style={{
                  height: "2px",
                  background: `hsl(${220 + i * 4}, 15%, 75%)`,
                  transition: "height 0.05s linear",
                  display: "block",
                }}
              />
            ))}
          </div>

          {/* Track info + controls */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Note icon */}
            <div className="shrink-0 w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.08] flex items-center justify-center">
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3z"/>
              </svg>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">{track.title}</p>
              <p className="text-[10px] text-white/35 truncate leading-tight">{track.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={prev} className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                </svg>
              </button>
              <button
                onClick={playing ? pause : play}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/[0.12]"
              >
                {playing ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <button onClick={next} className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar + time */}
          <div className="px-4 pb-3 space-y-1.5">
            {/* Seekable bar */}
            <div
              className="relative h-1 rounded-full bg-white/[0.08] cursor-pointer group"
              onClick={seek}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-white/60 group-hover:bg-white/80 transition-colors"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
            {/* Time + track dots row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tabular-nums text-white/30">
                {fmt(currentTime)} / {duration ? fmt(duration) : "--:--"}
              </span>
              <div className="flex items-center gap-1.5">
                {TRACKS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTrackIdx(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === trackIdx ? "14px" : "4px",
                      height: "4px",
                      background: i === trackIdx ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle pill */}
      {visible && (
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Show player" : "Hide player"}
          className="fixed z-[60] flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/80 backdrop-blur-md px-3 py-1.5 text-white/60 hover:text-white hover:border-white/30 transition-colors duration-200 shadow-lg"
          style={{
            bottom: collapsed ? "1rem" : "calc(128px + 1.5rem)",
            right: "1rem",
            transition: "bottom 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Mini visualizer in pill when not collapsed */}
          {!collapsed && (
            <span className="flex items-end gap-[2px] h-3.5">
              {Array.from({ length: NUM_BARS }).map((_, i) => (
                <span
                  key={i}
                  className="w-[2px] rounded-full bg-current"
                  style={{
                    height: playing ? undefined : "3px",
                    animation: playing
                      ? `vizBar ${0.5 + i * 0.06}s ${i * 0.04}s ease-in-out infinite alternate`
                      : "none",
                  }}
                />
              ))}
            </span>
          )}
          {collapsed && (
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3z"/>
            </svg>
          )}
          <span className="text-[10px] tracking-widest uppercase font-semibold">
            {collapsed ? "Show" : "Hide"}
          </span>
          <svg
            className="w-3 h-3 shrink-0 transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      )}
    </>
  );
}

function Router({ onEnter, entered }: { onEnter: () => void; entered: boolean }) {
  return (
    <Switch>
      <Route path="/" component={() => <Home onEnter={onEnter} entered={entered} />} />
      <Route path="/portfolio" component={Portfolio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [entered, setEntered] = useState(() => sessionStorage.getItem("fc_entered") === "1");

  const handleEnter = useCallback(() => {
    sessionStorage.setItem("fc_entered", "1");
    setEntered(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <style>{`
          @keyframes vizBar {
            from { transform: scaleY(0.25); }
            to   { transform: scaleY(1); }
          }
        `}</style>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router onEnter={handleEnter} entered={entered} />
        </WouterRouter>
        <Toaster />
        <AudioPlayer visible={entered} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
