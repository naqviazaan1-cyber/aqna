import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useRef, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";

const queryClient = new QueryClient();

const PLAYLIST_ID = "46wmGTamOub4ZRpROQQ25X";
const SPOTIFY_SRC = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0&autoplay=1`;

function VisualizerBars() {
  const bars = [3, 5, 8, 5, 7, 4, 6, 3, 7, 5];
  return (
    <span className="flex items-end gap-[2px] h-3.5">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-current"
          style={{
            height: `${h}px`,
            animation: `vizBar ${0.6 + i * 0.07}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </span>
  );
}

function SpotifyPlayer({ visible, iframeRef }: { visible: boolean; iframeRef: React.RefObject<HTMLIFrameElement | null> }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-4 right-4 z-50 rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: 320,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transform: visible
            ? collapsed ? "translateY(calc(100% + 1rem))" : "translateY(0)"
            : "translateY(24px)",
          transition: "opacity 0.7s, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <iframe
          ref={iframeRef}
          width="320"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ display: "block" }}
        />
      </div>

      {visible && (
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Show player" : "Hide player"}
          className="fixed z-[60] flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/80 backdrop-blur-md px-3 py-1.5 text-white/60 hover:text-white hover:border-white/30 transition-colors duration-200 shadow-lg"
          style={{
            bottom: collapsed ? "1rem" : "calc(152px + 1.5rem)",
            right: "1rem",
            transition: "bottom 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {collapsed ? (
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3z"/>
            </svg>
          ) : (
            <VisualizerBars />
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // If user already entered (sessionStorage), set the src on mount
  useEffect(() => {
    if (entered && iframeRef.current && !iframeRef.current.src) {
      iframeRef.current.src = SPOTIFY_SRC;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause/resume Spotify when video modal opens/closes
  useEffect(() => {
    const sendCmd = (cmd: string) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ command: cmd }), "*");
    };
    const onPause = () => sendCmd("pause");
    const onResume = () => sendCmd("resume");
    window.addEventListener("spotify-pause", onPause);
    window.addEventListener("spotify-resume", onResume);
    return () => {
      window.removeEventListener("spotify-pause", onPause);
      window.removeEventListener("spotify-resume", onResume);
    };
  }, []);

  const handleEnter = useCallback(() => {
    sessionStorage.setItem("fc_entered", "1");
    setEntered(true);
    if (iframeRef.current && !iframeRef.current.src) {
      iframeRef.current.src = SPOTIFY_SRC;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <style>{`
          @keyframes vizBar {
            from { transform: scaleY(0.3); }
            to   { transform: scaleY(1); }
          }
        `}</style>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router onEnter={handleEnter} entered={entered} />
        </WouterRouter>
        <Toaster />
        <SpotifyPlayer visible={entered} iframeRef={iframeRef} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
