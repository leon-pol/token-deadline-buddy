import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FileUp, Layers, Search, Handshake, CheckCircle2, Menu, X, Mail } from "lucide-react";
import { useStore } from "@/services/store";
import { Pill } from "@/components/bedro/ui";
import { SPRING, EASE } from "@/components/bedro/glass";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Procurement Workspace — BEDRO" },
      { name: "description", content: "Upload requirements, compare shortlisted suppliers, negotiate and decide." },
      { property: "og:title", content: "Procurement Workspace — BEDRO" },
      { property: "og:description", content: "Upload requirements, compare shortlisted suppliers, negotiate and decide." },
    ],
  }),
  component: WorkspaceLayout,
});

const NAV = [
  { to: "/workspace", label: "Overview", icon: LayoutDashboard },
  { to: "/workspace/requirements", label: "Requirements", icon: FileUp },
  { to: "/workspace/pooling", label: "Demand Pooling", icon: Layers },
  { to: "/workspace/sourcing", label: "Sourcing Options", icon: Search },
  { to: "/workspace/negotiations", label: "Negotiations", icon: Handshake },
  { to: "/workspace/decision", label: "Sourcing Decision", icon: CheckCircle2 },
] as const;

function NavList({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/workspace" ? path === "/workspace" || path === "/workspace/" : path.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNav}
            className={`group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium outline-none transition-[color,background-color,transform] duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring ${active ? "font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-foreground"}`}>
            {active && <motion.span layoutId="nav-active" className="glass-segment-active absolute inset-0 rounded-full" transition={SPRING} />}
            <Icon className={`relative size-4 transition-transform duration-200 ${active ? "text-primary" : "group-hover:translate-x-0.5"}`} />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function CommsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const negs = useStore((s) => s.negotiations);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-foreground/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside role="dialog" aria-label="Supplier Communications" className="glass fixed right-0 top-0 z-50 h-full w-full max-w-md p-6"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 300 }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Supplier Communications</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-secondary"><X className="size-4" /></button>
            </div>
            <div className="mt-3"><Pill tone="danger">Email service: Not Connected</Pill></div>
            <p className="mt-4 text-sm text-muted-foreground">Supplier email threads will appear here once the email service is connected by the backend. No messages have been sent or received.</p>
            <ul className="mt-6 space-y-2">
              {negs.map((n) => (
                <li key={n.id} className="surface p-4 text-sm">
                  <div className="font-semibold">{n.supplierName}</div>
                  <div className="text-muted-foreground">Deal {n.id} · No email thread available</div>
                </li>
              ))}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function WorkspaceLayout() {
  const [mobile, setMobile] = useState(false);
  const [comms, setComms] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background bg-gradient-hero">
      <aside className="glass fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-3xl p-4 lg:flex">
        <Link to="/" className="mb-8 px-2 font-display text-xl font-bold tracking-tight">BEDRO<span className="text-primary">.</span></Link>
        <NavList />
        <div className="mt-auto rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">Frontend preview. Backend services are not connected.</div>
      </aside>
      <header className="glass sticky top-0 z-20 flex h-16 items-center gap-3 px-4 lg:ml-[264px] lg:mr-3 lg:mt-3 lg:rounded-2xl">
        <button className="rounded-lg p-2 hover:bg-secondary lg:hidden" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu className="size-5" /></button>
        <span className="font-display font-bold lg:hidden">BEDRO</span>
        <span className="hidden text-sm text-muted-foreground lg:block">Procurement Workspace</span>
        <button onClick={() => setComms(true)} aria-label="Supplier Communications" className="glass-capsule ml-auto grid size-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring outline-none">
          <Mail className="size-5" />
        </button>
      </header>
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-foreground/10 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside className="glass fixed inset-y-0 left-0 z-50 w-72 p-4 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}>
              <div className="mb-6 flex items-center justify-between px-2"><span className="font-display text-xl font-bold">BEDRO</span>
                <button aria-label="Close navigation" onClick={() => setMobile(false)} className="rounded-lg p-2 hover:bg-secondary"><X className="size-4" /></button></div>
              <NavList onNav={() => setMobile(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <main className="px-4 py-8 lg:ml-[264px] lg:px-8">
        <motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mx-auto max-w-6xl">
          <Outlet />
        </motion.div>
      </main>
      <CommsDrawer open={comms} onClose={() => setComms(false)} />
    </div>
  );
}
