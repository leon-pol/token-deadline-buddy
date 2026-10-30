import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import wafer from "@/assets/wafer.jpg";
import { EASE, GlassButton } from "./glass";

const NODES = [[60, 120], [420, 80], [470, 330], [90, 380], [250, 30], [30, 250]] as const;

function WaferScene() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <motion.div onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }}
      initial={{ opacity: 0, scale: 0.9, rotateX: 18 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
      className="relative mx-auto aspect-square w-full max-w-[520px] [perspective:1200px]">
      {/* orbital network */}
      <svg viewBox="0 0 500 420" className="absolute inset-0 size-full" aria-hidden>
        <defs><linearGradient id="ln" x1="0" x2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity="0" /><stop offset=".5" stopColor="var(--primary)" stopOpacity=".55" /><stop offset="1" stopColor="var(--primary-glow)" stopOpacity="0" /></linearGradient></defs>
        <ellipse cx="250" cy="210" rx="235" ry="150" fill="none" stroke="url(#ln)" strokeWidth="1" strokeDasharray="4 8" className="anim-dash" />
        <ellipse cx="250" cy="210" rx="200" ry="195" fill="none" stroke="var(--primary)" strokeOpacity=".12" strokeWidth="1" />
        {NODES.map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2="250" y2="210" stroke="var(--primary)" strokeOpacity=".14" strokeWidth="1" />
            <motion.circle cx={x} cy={y} r="4.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1 + i * 0.08, duration: 0.5, ease: EASE }} />
          </g>
        ))}
      </svg>
      {/* glass platform */}
      <div className="glass-capsule absolute inset-x-[14%] bottom-[8%] h-[16%] rounded-[50%] opacity-80" />
      {/* wafer */}
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="absolute inset-[16%] [transform-style:preserve-3d]">
        <div className="anim-drift relative size-full">
          <div className="bg-iris anim-spin-slow absolute -inset-3 rounded-full opacity-50 blur-2xl" />
          <div className="relative size-full overflow-hidden rounded-full shadow-elegant ring-1 ring-card">
            <img src={wafer} alt="Iridescent 300 mm silicon wafer" width={1408} height={1024} className="size-full scale-[1.35] object-cover" />
            <div className="bg-iris anim-spin-slow absolute inset-0 opacity-25 mix-blend-overlay" />
            <div className="anim-sweep absolute inset-y-[-20%] left-0 w-1/3 bg-gradient-to-r from-transparent via-card/60 to-transparent" />
          </div>
        </div>
      </motion.div>
      {/* floating chips */}
      {[["3 suppliers shortlisted", "left-0 top-[18%]"], ["Pooled demand · 3 items", "right-0 bottom-[22%]"]].map(([t, pos], i) => (
        <motion.div key={t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + i * 0.12, duration: 0.6, ease: EASE }}
          className={`glass-capsule absolute ${pos} rounded-full px-3.5 py-1.5 text-xs font-semibold`}>
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" />{t}
        </motion.div>
      ))}
      <span className="absolute bottom-0 right-2 text-[10px] text-muted-foreground">Illustrative</span>
    </motion.div>
  );
}

const up = (d: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: EASE } });

export function Hero({ go }: { go: (id: string) => void }) {
  const lines = [["BUY", "LIKE", "AN", "ENTERPRISE."], ["COMPETE", "ON", "YOUR", "TERMS."]];
  return (
    <section className="relative overflow-hidden pb-20 pt-32 md:pt-40">
      <div className="anim-drift pointer-events-none absolute -inset-[10%] bg-gradient-hero" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.span {...up(0)} className="glass-capsule inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">Autonomous procurement · Semiconductors</motion.span>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[0.98] sm:text-6xl md:text-7xl">
            {lines.map((ws, li) => (
              <span key={li} className={`block ${li ? "text-gradient" : ""}`}>
                {ws.map((w, wi) => (
                  <span key={w} className="inline-block overflow-hidden pb-1 align-bottom">
                    <motion.span className="inline-block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.12 + li * 0.18 + wi * 0.05, ease: EASE }}>{w}&nbsp;</motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p {...up(0.6)} className="mt-6 max-w-lg text-lg text-muted-foreground">An autonomous procurement platform for semiconductor manufacturers. Pool purchasing power, discover qualified alternatives, and negotiate on your terms.</motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <motion.div {...up(0.75)}><GlassButton size="lg" onClick={() => go("workspace")}>Explore the Procurement Workspace <ArrowRight className="size-4" /></GlassButton></motion.div>
            <motion.div {...up(0.85)}><GlassButton size="lg" variant="glass" onClick={() => go("how")}>How It Works</GlassButton></motion.div>
          </div>
        </div>
        <WaferScene />
      </div>
    </section>
  );
}
