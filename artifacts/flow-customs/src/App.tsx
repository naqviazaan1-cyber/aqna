import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";

const queryClient = new QueryClient();

const PLAYLIST_URI = "spotify:playlist:46wmGTamOub4ZRpROQQ25X";

function SpotifyPlayer({ visible }: { visible: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const playlistId = PLAYLIST_URI.replace("spotify:playlist:", "");

  return (
    <>
      {/* The iframe is ALWAYS mounted once visible=true so playback never stops */}
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
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`}
          width="320"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ display: "block" }}
        />
      </div>

      {/* Collapse / expand toggle button — only shown after entering */}
      {visible && (
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Show player" : "Hide player"}
          className="fixed z-[60] flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/80 backdrop-blur-md px-3 py-1.5 text-white/60 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg"
          style={{
            bottom: collapsed ? "1rem" : "calc(152px + 1.5rem)",
            right: "1rem",
            transition: "bottom 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Music note icon */}
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3z"/>
          </svg>
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
  const [entered, setEntered] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router onEnter={() => setEntered(true)} entered={entered} />
        </WouterRouter>
        <Toaster />
        <SpotifyPlayer visible={entered} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
