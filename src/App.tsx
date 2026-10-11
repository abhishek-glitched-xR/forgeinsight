import { useState, useEffect, useRef } from "react";
import { useIntersection } from "./hooks/useIntersection";
import FluidTextureCanvas from "./components/FluidTextureCanvas";
import imgLogo from "../src/imports/ForgeInsightLogo.png";

function LogoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`logo-semicircle ${className}`}>
      <img src={imgLogo} alt="Forge Insight" />
    </span>
  );
}

// ─── LOADING OVERLAY ─────────────────────────────────────────────────────────
function LoadingOverlay({ onDone }: { onDone: () => void }) {
  const [contentVisible, setContentVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // logo + spinner fade in after 80ms
    const t1 = setTimeout(() => setContentVisible(true), 80);
    // overlay begins fading out at 950ms
    const t2 = setTimeout(() => setFading(true), 950);
    // unmount at 1300ms (after 350ms CSS fade)
    const t3 = setTimeout(() => onDone(), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="loading-atmosphere fixed inset-0 z-[999] flex items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.35s ease" : "opacity 0.25s ease",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <div
        className="flex flex-col items-center gap-5"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "scale(1) translateY(0)" : "scale(0.94) translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Existing logo */}
        <LogoBadge className="w-52" />
        {/* Arc spinner */}
        <div
          className="w-9 h-9 rounded-full mt-1"
          style={{
            border: "2px solid rgba(248,69,29,0.14)",
            borderTopColor: "#F8451D",
            animation: "spin-arc 0.85s linear infinite",
          }}
        />
        {/* Caption */}
        <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#5F5752]">
          Loading possibilities…
        </span>
      </div>
    </div>
  );
}

// ─── NAV ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = ["home", "proof", "services", "contact"];
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const fromBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;
      if (fromBottom) { setActiveSection("contact"); return; }
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 160) { setActiveSection(id); return; }
      }
      setActiveSection("home");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setMounted(true), 1050);
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, []);

  const links = ["Home", "Proof", "Services", "Contact"];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(255, 254, 242, 0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #FFE9E2" : "none",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.6s ease, transform 0.6s ease, background 0.5s, backdrop-filter 0.5s",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 h-16 flex items-center justify-between">

        {/* Logo — LEFT */}
        <a href="#" className="flex items-center gap-3 group">
          <LogoBadge className="w-20 sm:w-24" />
        </a>

        {/* Desktop links — RIGHT */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => {
            const active = activeSection === l.toLowerCase();
            return (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="relative font-mono text-xs tracking-widest uppercase transition-colors duration-300 flex flex-col items-center gap-1"
                style={{ color: active ? "#F8451D" : "#5F5752" }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#F8451D"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#5F5752"; }}
              >
                {l}
                {active && <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#F8451D]" />}
              </a>
            );
          })}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#FFE9E2] bg-[#FFFEF2]/95 backdrop-blur-lg">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="block px-6 sm:px-8 py-4 font-mono text-xs tracking-widest uppercase text-[#5F5752] hover:text-[#17120F] hover:bg-[#FFE9E2] transition-all"
            >
              {l}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 1050); }, []);

  return (
    <section
      id="home"
      className="atmosphere-hero relative flex min-h-[92svh] flex-col"
    >
      {/* Centered content */}
      <div className="relative z-[10] flex-1 flex flex-col justify-center items-center text-center max-w-[1400px] mx-auto w-full px-6 sm:px-8 md:px-14 pt-24 pb-16">
        <div className="max-w-[760px]">

          {/* Heading — very large, fills the left column */}
          <div>
            <div
              className="font-display font-bold leading-[1.02] text-[#17120F]"
              style={{ fontSize: "clamp(3.15rem, 13vw, 8.5rem)" }}
            >
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease", transitionDelay: "100ms" }}>Building</div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease", transitionDelay: "230ms" }}>
                <span className="italic text-[#F8451D]">Intelligent</span>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease", transitionDelay: "360ms" }}>Systems</div>
            </div>
          </div>

          {/* Subtitle */}
          <div
            className="mt-8 transition-all duration-700"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "250ms",
            }}
          >
            <p className="text-[#5F5752] text-[15px] leading-[1.8] font-light max-w-[480px] mx-auto">
              We design, build, and deploy AI-powered solutions that transform how businesses operate, decide, and grow.
            </p>
          </div>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 transition-all duration-700"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(14px)",
              transitionDelay: "380ms",
            }}
          >
            <a
              href="#proof"
              className="btn-press group relative inline-flex items-center gap-3 px-6 py-3 text-[11px] font-mono tracking-widest uppercase overflow-hidden flex-shrink-0 transition-all duration-300 hover:shadow-[0_0_28px_rgba(248,69,29,0.18)]"
              style={{ border: "1px solid #F8451D", color: "#F8451D" }}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#FFFEF2]">View Our Work</span>
              <svg className="relative z-10 w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#FFFEF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-[#F8451D] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </a>

            <a
              href="#contact"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[#5F5752] hover:text-[#17120F] transition-colors duration-300"
            >
              Let's Talk
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── VISION ──────────────────────────────────────────────────────────────────
function Vision() {
  const { ref, visible } = useIntersection(0.15);

  return (
    <section id="vision" ref={ref} className="section-boundary atmosphere-vision relative py-20 md:py-24 overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12">

        {/* Top label */}
        <div
          className="mb-10 text-center transition-all duration-700 md:mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">Our Vision</span>
        </div>

        {/* Vision statement */}
        <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-8 lg:gap-16 items-center">

          {/* LEFT — "Our" horizontal + "Vision" rotated vertical going upward */}
          <div
            className="hidden lg:flex items-end gap-0 select-none transition-all duration-1000 delay-100"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              height: "260px",
            }}
          >
            {/* "Vision" — rotated 90° CCW, anchored to the right of the column */}
            <div
              className="font-display font-bold italic text-[#F8451D] flex-shrink-0"
              style={{
                fontSize: "clamp(3.8rem, 6vw, 5.5rem)",
                lineHeight: 1,
                writingMode: "vertical-rl" as const,
                transform: "rotate(180deg)",
                letterSpacing: "-0.02em",
              }}
            >
              Vision
            </div>
            {/* "Our" — horizontal, at the bottom */}
            <div
              className="font-display font-bold text-[#17120F] self-end pb-1 ml-1"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1 }}
            >
              Our
            </div>
          </div>

          {/* CENTER — large body paragraph */}
          <div
            className="transition-all duration-1000 delay-200"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              filter: visible ? "blur(0px)" : "blur(4px)",
            }}
          >
            <p
              className="font-display font-normal text-[#17120F] leading-[1.45]"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }}
            >
              We help businesses move beyond manual, time-consuming processes by designing practical{" "}
              <span className="text-[#F8451D] italic">AI-powered solutions</span>{" "}
              that automate repetitive work, connect fragmented operations, and turn business data into actionable insight.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── PROOF OF CAPABILITY ─────────────────────────────────────────────────────
function Projects() {
  const { ref, visible } = useIntersection(0.05);

  return (
    <section id="proof" ref={ref} className="section-boundary atmosphere-proof py-16 md:py-20 relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12">
        <div
          className="text-center transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">Proof of Capability</span>
          <h2 className="mt-4 font-display text-4xl font-bold text-[#17120F] sm:whitespace-nowrap md:text-5xl">
            What We've <span className="italic">Built</span>
          </h2>
        </div>
      </div>
    </section>
  );
}

// ─── DIGIBOT FLAGSHIP CASE STUDY ────────────────────────────────────────────
const digibotSuggestions = [
  "Focus room · 2:00 PM",
  "Wellness reset · 4:30 PM",
  "Dinner booking · 7:00 PM",
];

function DigibotVisual() {
  return (
    <div
      className="digibot-visual aspect-[16/10]"
      role="img"
      aria-label="Digibot conversational concierge product interface"
    >
      <div className="digibot-window">
        <div className="digibot-window__bar">
          <div className="digibot-window__brand">
            <span className="digibot-window__mark">D</span>
            <span>Digibot</span>
          </div>
          <span className="digibot-window__status">AI concierge · Online</span>
        </div>

        <div className="digibot-window__body">
          <aside className="digibot-window__sidebar" aria-hidden="true">
            <span className="is-active">Conversation</span>
            <span>Discover</span>
            <span>Services</span>
            <span>Activity</span>
            <i />
            <small>Context connected</small>
          </aside>

          <div className="digibot-conversation">
            <div className="digibot-conversation__heading">
              <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-[#F8451D]">
                Digibot Interface
              </span>
              <strong className="font-display text-lg text-[#17120F] sm:text-xl">
                How can I assist?
              </strong>
            </div>

            <div className="digibot-message digibot-message--user">
              <span>You</span>
              <p>Help me plan a productive afternoon.</p>
            </div>
            <div className="digibot-message digibot-message--bot">
              <span>Digibot</span>
              <p>I found three options based on your schedule, location and preferences.</p>
            </div>

            <div className="digibot-suggestions">
              {digibotSuggestions.map((suggestion, index) => (
                <div key={suggestion} style={{ "--suggestion-index": index } as React.CSSProperties}>
                  <span>0{index + 1}</span>
                  <p>{suggestion}</p>
                  <i>→</i>
                </div>
              ))}
            </div>

            <div className="digibot-composer">
              <span>Ask Digibot anything</span>
              <div className="digibot-typing" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DigibotCaseStudy() {
  const { ref, visible } = useIntersection(0.05);

  return (
    <section ref={ref} className="atmosphere-digibot relative overflow-hidden py-20 md:py-24">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12">
        <div
          className="transition-all duration-800"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
        >
          <article className="digibot-case-card">
            <div className="digibot-case-card__intro">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">
                Flagship AI Case Study
              </span>
              <h2 className="mt-5 font-display text-5xl font-bold leading-[0.95] text-[#17120F] sm:text-6xl md:text-7xl">
                Digibot
              </h2>
              <p className="mt-4 font-display text-xl italic text-[#F8451D] sm:text-2xl">
                AI-Powered Digital Concierge
              </p>
              <p className="mt-7 max-w-xl text-sm font-light leading-[1.8] text-[#5F5752]">
                An AI-powered digital concierge that connects users with information, services and intelligent assistance through one conversational experience.
              </p>
            </div>

            <div className="digibot-case-card__visual">
              <DigibotVisual />
            </div>

            <div className="digibot-case-card__details">
              <div className="digibot-case-card__problem-solution">
                <div>
                  <span className="case-index">Problem</span>
                  <p>Fragmented information, support and digital interactions.</p>
                </div>
                <div>
                  <span className="case-index">Solution</span>
                  <p>An intelligent conversational layer that brings information, assistance and services together.</p>
                </div>
              </div>

              <div>
                <span className="case-index">Capabilities</span>
                <p>
                  AI Conversations · Knowledge Retrieval · Personalized Assistance · Smart Recommendations · Service Discovery · Context-Aware Responses · Automated Support · Analytics
                </p>
              </div>

              <div>
                <span className="case-index">Use Cases</span>
                <p>
                  Customer Support · Information Assistance · Service Discovery · Personalized Recommendations · Business Operations
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
const services = [
  {
    title: "AI & Automation",
    desc: "We embed intelligence into business workflows — reducing manual effort, accelerating decisions, and enabling operations to scale without linear headcount growth.",
    items: ["AI Automation", "AI Agents", "Workflow Automation", "Business Process Optimization"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
  {
    title: "Generative AI",
    desc: "We build custom LLM-powered applications — from intelligent assistants and RAG knowledge systems to content generation tools — tailored to your data and domain.",
    items: ["Generative AI Applications", "LLM Solutions", "RAG Systems", "Intelligent Assistants", "Knowledge Retrieval"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Software Development",
    desc: "From web and mobile applications to custom APIs and integrations, we engineer reliable, scalable software that forms the backbone of your AI-powered systems.",
    items: ["Custom Software Development", "Web Applications", "Mobile Applications", "API Development"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Computer Vision & Data Intelligence",
    desc: "We design image-based AI systems and data pipelines that surface patterns, automate visual inspection, and power intelligent dashboards from complex datasets.",
    items: ["Image Classification", "Visual Inspection", "Computer Vision Systems", "Data Analytics", "Intelligent Dashboards", "Data-driven Decision Systems"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

function Services() {
  const { ref, visible } = useIntersection(0.08);
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <section id="services" ref={ref} className="section-boundary atmosphere-services py-20 md:py-24 relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12">
        {/* Header */}
        <div
          className="mx-auto mb-12 max-w-[1240px] transition-all duration-1000 md:mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
        >
          <span className="block text-center font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">
            What We Build
          </span>
          <div className="mt-5 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-12">
            <h2 className="text-center font-display text-[clamp(3rem,12vw,4rem)] font-bold leading-[0.9] text-[#17120F] md:text-[clamp(4rem,7.5vw,5.75rem)] lg:text-[clamp(4.5rem,6.4vw,6.25rem)]">
              Our<br />
              <span className="italic">Capabilities</span>
            </h2>
            <p className="mx-auto max-w-[480px] text-center text-sm font-light leading-relaxed text-[#5F5752] md:justify-self-center">
              We identify where AI and automation create real business leverage — then we build it.
            </p>
          </div>
        </div>

        {/* Value flow */}
        <div
          className="mb-12 md:mb-16 flex flex-wrap items-center gap-2 sm:gap-3 transition-all duration-1000 delay-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {["Your Business Problem", "Our Expertise", "Custom Solution", "Measurable Value"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-3">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase px-1 py-2 text-[#5F5752] opacity-60">{s}</span>
              {i < arr.length - 1 && (
                <svg className="w-4 h-4 text-[#F8451D] opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="relative flex flex-col p-6 sm:p-8 lg:p-10 cursor-default transition-all duration-300"
              style={{
                background: activeService === i ? "rgba(248, 69, 29, 0.1)" : "rgba(255, 255, 255, 0.62)",
                opacity: visible ? 1 : 0,
                transform: visible ? (activeService === i ? "translateY(-2px)" : "translateY(0)") : "translateY(24px)",
                boxShadow: activeService === i ? "0 16px 52px rgba(248,69,29,0.1)" : "none",
                transitionDelay: `${i * 80 + 300}ms`,
              }}
              onMouseEnter={() => setActiveService(i)}
              onMouseLeave={() => setActiveService(null)}
            >
              {/* Icon + title */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-10 h-10 rounded-full bg-[#F8451D]/[0.06] flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    color: activeService === i ? "#F8451D" : "#5F5752",
                    opacity: activeService === i ? 1 : 0.5,
                  }}
                >
                  {svc.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-[#17120F] mt-1.5 leading-tight">{svc.title}</h3>
              </div>

              <p className="text-[#5F5752] text-sm leading-relaxed font-light mb-6">{svc.desc}</p>

              {/* Capabilities list */}
              <div className="flex flex-wrap gap-2 mb-6">
                {svc.items.map(item => (
                  <span
                    key={item}
                    className="font-mono text-[9px] tracking-widest uppercase py-1 text-[#5F5752] transition-all duration-300"
                    style={{ opacity: activeService === i ? 0.78 : 0.42 }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROCESS ─────────────────────────────────────────────────────────────────
const processSteps = [
  {
    num: "01",
    title: "Understand",
    desc: "We immerse ourselves in your business context, data landscape, and strategic objectives. Deep research, stakeholder interviews, and system audits form the foundation of every engagement.",
    detail: "Before any code is written, we know your problem better than anyone in the room.",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1200&h=675&fit=crop&auto=format&q=85",
    alt: "Team gathered around a table for a focused strategy and discovery discussion",
  },
  {
    num: "02",
    title: "Design",
    desc: "Architecture decisions are made deliberately. We design AI systems, data pipelines, and interfaces that are not just functional but scalable, auditable, and aligned with your team's capabilities.",
    detail: "Every system we design can be explained, extended, and owned by your team.",
    img: "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=1200&h=675&fit=crop&auto=format&q=85",
    alt: "Detailed digital product interface and component system being designed",
  },
  {
    num: "03",
    title: "Build & Optimize",
    desc: "We ship production-grade AI systems. Rigorous testing, continuous evaluation, and performance monitoring ensure the systems we build keep improving after launch.",
    detail: "Launch is not the end. It's the beginning of a feedback loop.",
    img: "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=1200&h=675&fit=crop&auto=format&q=85",
    alt: "Software engineers working together with production code on screen",
  },
];

function ProcessStep({ step, index }: { step: typeof processSteps[0]; index: number }) {
  const { ref, visible } = useIntersection(0.04);

  return (
    <div
      ref={ref}
      className="process-step transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0.15,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <div className="process-card grid grid-cols-1 items-start gap-8 p-6 sm:p-8 md:min-h-[400px] md:grid-cols-[0.11fr_0.49fr_0.36fr] md:items-center md:gap-6 lg:h-[440px] lg:gap-10 lg:p-10">
        {/* Number */}
        <div>
          <span
            className="block font-display text-5xl font-bold md:text-6xl"
            style={{ color: "#5F5752", display: "block" }}
          >{step.num}</span>
        </div>

        {/* Content */}
        <div className="max-w-[560px] space-y-4">
          <h3 className="font-display text-4xl font-bold leading-[0.95] text-[#17120F] md:text-[2.5rem] lg:text-5xl">{step.title}</h3>
          <p className="max-w-[560px] text-sm font-light leading-relaxed text-[#5F5752]">{step.desc}</p>
          <p className="text-[#F8451D] text-xs font-mono italic">"— {step.detail}"</p>
        </div>

        {/* Image */}
        <div className="w-full">
          <div
            className={`process-image relative overflow-hidden aspect-video ${visible ? "is-visible" : ""}`}
          >
            <img
              src={step.img}
              alt={step.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="process-image__overlay absolute inset-0" />
            <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-[#F8451D] to-transparent opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Process() {
  const { ref, visible } = useIntersection(0.04);

  return (
    <section ref={ref} className="section-boundary atmosphere-process py-20 md:py-24 relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12">
        <div
          className="mb-8 text-center transition-all duration-1000 md:mb-10"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">How We Work</span>
          <h2 className="mx-auto mt-4 max-w-md text-center font-display text-4xl font-bold text-[#17120F] sm:whitespace-nowrap md:text-5xl">
            Our <span className="italic">Process</span>
          </h2>
        </div>

        <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-12 md:w-[90%] md:gap-14">
          {processSteps.map((step, i) => (
            <ProcessStep key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TECH STACK ───────────────────────────────────────────────────────────────
const techCategories = [
  {
    category: "AI & Machine Learning",
    items: [
      { name: "RAG", desc: "Retrieval-Augmented Generation" },
      { name: "LLMs", desc: "Large Language Models" },
      { name: "AI Agents", desc: "Autonomous reasoning and task execution" },
      { name: "Computer Vision", desc: "Visual recognition and understanding" },
      { name: "Machine Learning", desc: "Predictive intelligence from real data" },
      { name: "LangChain", desc: "Composable AI application orchestration" },
    ],
  },
  {
    category: "Data Infrastructure",
    items: [
      { name: "PostgreSQL", desc: "Reliable relational data foundations" },
      { name: "Apache Kafka", desc: "Real-time event streaming at scale" },
      { name: "Pinecone", desc: "Managed vector search infrastructure" },
      { name: "Weaviate", desc: "Semantic retrieval for intelligent systems" },
      { name: "Data Analytics", desc: "Operational insight from complex datasets" },
      { name: "Data Pipelines", desc: "Automated data movement and transformation" },
    ],
  },
  {
    category: "Cloud & DevOps",
    items: [
      { name: "AWS", desc: "Secure, scalable cloud infrastructure" },
      { name: "GCP", desc: "Cloud-native data and AI services" },
      { name: "Docker", desc: "Portable application environments" },
      { name: "Kubernetes", desc: "Resilient container orchestration" },
      { name: "Terraform", desc: "Repeatable infrastructure as code" },
      { name: "CI/CD", desc: "Fast, dependable delivery pipelines" },
    ],
  },
];

function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const technologies = techCategories.flatMap((category, categoryIndex) =>
    category.items.map((item, itemIndex) => ({ ...item, category: category.category, categoryIndex, itemIndex })),
  );
  const activeTechnology = technologies[activeIndex];
  const activeCategory = techCategories[activeTechnology.categoryIndex];

  useEffect(() => {
    const updateFromScroll = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, -rect.top / distance));
        const nextIndex = Math.min(technologies.length - 1, Math.floor(progress * technologies.length));
        setActiveIndex((current) => current === nextIndex ? current : nextIndex);
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [technologies.length]);

  const moveToTechnology = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    setActiveIndex(index);
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: sectionTop + distance * ((index + 0.35) / technologies.length),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const supportingPositions = [
    { x: "-28vw", y: "-17vh" },
    { x: "28vw", y: "-14vh" },
    { x: "-24vw", y: "19vh" },
    { x: "25vw", y: "21vh" },
    { x: "0px", y: "27vh" },
  ];
  let supportingIndex = 0;

  return (
    <section ref={sectionRef} className="section-boundary atmosphere-tech relative h-[420svh]">
      <div className="sticky top-0 flex min-h-[100svh] overflow-hidden">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col px-6 pb-8 pt-20 sm:px-8 md:px-12 md:pb-10 md:pt-24">
          <div className="relative flex items-end justify-center gap-8">
            <div className="text-center">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">
                Engineering Foundation
              </span>
              <h2 className="mt-3 text-center font-display text-4xl font-bold text-[#17120F] md:text-5xl">
                Tech <span className="italic">Stack</span>
              </h2>
            </div>
            <span className="absolute bottom-0 right-0 hidden font-mono text-[9px] tracking-[0.28em] text-[#5F5752] opacity-45 sm:block">
              {String(activeIndex + 1).padStart(2, "0")} / {technologies.length}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 md:mt-8">
            {techCategories.map((category, categoryIndex) => (
              <button
                key={category.category}
                type="button"
                onClick={() => moveToTechnology(categoryIndex * category.items.length)}
                className={`inline-flex min-h-11 items-center px-1 font-mono text-[9px] tracking-[0.24em] uppercase transition-all duration-300 ${
                  activeTechnology.categoryIndex === categoryIndex
                    ? "text-[#F8451D] opacity-100"
                    : "text-[#5F5752] opacity-35 hover:opacity-70"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="tech-system relative flex-1">
            <div className="tech-system__glow" aria-hidden="true" />
            <div key={`signal-${activeIndex}`} className="tech-system__signal" aria-hidden="true">
              <span />
              <span />
              <span />
              <i />
              <i />
              <i />
            </div>

            <div key={activeIndex} className="tech-system__focus">
              <span className="font-mono text-[9px] tracking-[0.32em] uppercase text-[#F8451D] opacity-55">
                {activeCategory.category}
              </span>
              <h3 className="tech-system__title font-display font-bold text-[#17120F]">{activeTechnology.name}</h3>
              <p className="mt-3 max-w-md text-center text-sm font-light leading-relaxed text-[#5F5752] opacity-70 sm:text-base">
                {activeTechnology.desc}
              </p>
            </div>

            <div className="tech-system__supporting" aria-label={`${activeCategory.category} technologies`}>
              {activeCategory.items.map((technology, itemIndex) => {
                const globalIndex = activeTechnology.categoryIndex * activeCategory.items.length + itemIndex;
                const isActive = globalIndex === activeIndex;
                const position = isActive ? { x: "0%", y: "0%" } : supportingPositions[supportingIndex++];
                return (
                  <button
                    key={technology.name}
                    type="button"
                    onClick={() => moveToTechnology(globalIndex)}
                    className={`tech-system__item ${isActive ? "is-active" : ""}`}
                    style={{
                      "--tech-x": position.x,
                      "--tech-y": position.y,
                    } as React.CSSProperties}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {technology.name}
                  </button>
                );
              })}
            </div>

            <div className="tech-system__progress" aria-hidden="true">
              {technologies.map((technology, index) => (
                <span
                  key={`${technology.category}-${technology.name}`}
                  className={index === activeIndex ? "is-active" : index < activeIndex ? "is-past" : ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT INQUIRY ─────────────────────────────────────────────────────────
function ContactInquiry() {
  const { ref, visible } = useIntersection(0.08);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          message: form.message,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to submit inquiry to server.");
      }

      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to backend server.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border-b border-[#FFE9E2] text-[#17120F] text-[15px] font-light py-4 outline-none placeholder-[#5F5752] focus:border-[#F8451D] transition-colors duration-300";

  return (
    <section
      id="contact"
      ref={ref}
      className="section-boundary atmosphere-contact relative overflow-hidden"
    >
      <div
        className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 py-20 md:py-24 transition-all duration-1000"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)" }}
      >
        {/* Section label */}
        <div className="mb-10 text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F8451D]">Get In Touch</span>
        </div>

        {/* Two-column: left info | right form */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-14 lg:gap-16 xl:gap-20">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-7">

            {/* Hero statement */}
            <div
              className="transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transitionDelay: "100ms" }}
            >
              <p className="font-display font-bold text-[#17120F] leading-[1.2]" style={{ fontSize: "clamp(1.35rem, 2.4vw, 1.9rem)" }}>
                Build the foundation.<br />
                Automate what comes next.<br />
                <span className="italic text-[#F8451D]">Grow with intelligence.</span>
              </p>
            </div>

            {/* Supporting paragraph */}
            <p
              className="text-[#5F5752] text-[13.5px] leading-[1.8] font-light transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transitionDelay: "180ms" }}
            >
              We help businesses build a stronger digital presence and turn it into a system for growth — starting with high-quality websites and evolving into AI automation, intelligent workflows, and custom software.
            </p>

            {/* Compact numbered progression */}
            <div
              className="transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transitionDelay: "260ms" }}
            >
              <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#5F5752] block mb-4">What We Build</span>
              <ol className="flex flex-col gap-3">
                {[
                  { n: "01", title: "Digital Foundation", sub: "Websites & digital experiences" },
                  { n: "02", title: "Business Systems", sub: "Software, APIs & workflows" },
                  { n: "03", title: "AI Automation", sub: "Intelligent process automation" },
                  { n: "04", title: "Data Intelligence", sub: "Dashboards & AI-driven insight" },
                  { n: "05", title: "Scalable Growth", sub: "Efficient, automated operations" },
                ].map(({ n, title, sub }, i) => (
                  <li
                    key={n}
                    className="flex items-center gap-3 transition-all duration-500"
                    style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-8px)", transitionDelay: `${320 + i * 55}ms` }}
                  >
                    <span className="font-mono text-[10px] text-[#F8451D] opacity-70 w-4 flex-shrink-0">{n}</span>
                    <span className="font-mono text-[10px] tracking-widest uppercase text-[#F8451D]">{title}</span>
                    <span className="text-[#5F5752] text-[11px] font-light hidden sm:block">— {sub}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>

          {/* ── RIGHT — Form ── */}
          <div className="flex flex-col lg:pl-10 xl:pl-14">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[480px] text-center gap-7">
                <div
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ border: "1px solid #F8451D", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                >
                  <svg className="w-7 h-7 text-[#F8451D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-[#17120F]">Message Sent</p>
                  <p className="text-[#5F5752] text-[14px] mt-3 font-light leading-relaxed max-w-xs mx-auto">
                    We'll be in touch within one business day.
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                  className="font-mono text-[10px] tracking-widest uppercase text-[#F8451D] hover:text-[#17120F] transition-colors duration-300"
                >
                  Send Another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-10" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s" }}>

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#5F5752]">
                      Name <span className="text-[#F8451D]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#5F5752]">
                      Email <span className="text-[#F8451D]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 2: Phone */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#5F5752]">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClass}
                  />
                </div>

                {/* Row 3: Message */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#5F5752]">
                    Message <span className="text-[#F8451D]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your requirements, project, or question..."
                    className={`${inputClass} resize-none border border-[#FFE9E2] border-b-[#FFE9E2] px-4 pt-4`}
                    style={{ borderRadius: 0 }}
                  />
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="p-3 text-xs font-mono bg-red-50 border border-red-200 text-red-600 rounded">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-press group relative inline-flex items-center gap-4 px-10 py-4 text-[11px] font-mono tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_36px_rgba(248,69,29,0.22)] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "#F8451D", color: "#FFFEF2" }}
                  >
                    <span className="relative z-10 font-semibold transition-colors duration-300 group-hover:text-[#17120F]">
                      {loading ? "Sending..." : "Send Message"}
                    </span>
                    <svg
                      className="relative z-10 w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#17120F]"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="absolute inset-0 bg-[#FFFEF2] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Contact information strip */}
        <div
          className="mt-14 grid grid-cols-1 gap-7 rounded-sm bg-[#FFE9E2]/25 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transitionDelay: "420ms" }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <svg className="w-4 h-4 text-[#F8451D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <div>
              <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#5F5752] block mb-2">Phone</span>
              <a href="tel:+918860068985" className="text-[#17120F] text-[13px] font-light hover:text-[#F8451D] transition-colors duration-300">
                +91 88600 68985
              </a>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <svg className="w-4 h-4 text-[#F8451D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <div>
              <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#5F5752] block mb-2">Email</span>
              <a href="mailto:sales@forgeinsight.co" className="break-all text-[#17120F] text-[13px] font-light hover:text-[#F8451D] transition-colors duration-300">
                sales@forgeinsight.co
              </a>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <svg className="w-4 h-4 text-[#F8451D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#5F5752] block mb-2">Business Hours</span>
              <p className="text-[#17120F] text-[11px] min-[360px]:text-[13px] font-light leading-relaxed lg:text-[11px] xl:text-[13px]">
                <span className="block whitespace-nowrap">Mon – Sat: 10:00 AM – 7:00 PM IST</span>
                <span className="block">Sunday: Closed</span>
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <svg className="w-4 h-4 text-[#F8451D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 4.5v.75m9-5.25a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#5F5752] block mb-2">Response</span>
              <p className="text-[#17120F] text-[13px] font-light leading-relaxed">
                Usually within 1–2 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const { ref, visible } = useIntersection(0.1);
  return (
    <footer ref={ref} className="atmosphere-footer py-10">
      <div
        className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >

        <a href="#" className="flex items-center gap-3 opacity-60 hover:opacity-90 transition-opacity duration-300">
          <LogoBadge className="w-24" />
        </a>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {["Home", "Proof", "Services", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="font-mono text-[10px] tracking-widest uppercase text-[#5F5752] hover:text-[#17120F] transition-colors duration-300">
              {l}
            </a>
          ))}
        </div>

        <span className="font-mono text-[10px] tracking-widest uppercase text-[#5F5752]">
          © {new Date().getFullYear()} Forge Insight
        </span>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [overlayDone, setOverlayDone] = useState(false);

  return (
    <div className="site-shell min-h-screen">
      <FluidTextureCanvas />
      {!overlayDone && <LoadingOverlay onDone={() => setOverlayDone(true)} />}
      <Nav />
      <Hero />
      <Vision />
      <Projects />
      <DigibotCaseStudy />
      <Services />
      <Process />
      <TechStack />
      <ContactInquiry />
      <Footer />
    </div>
  );
}
