import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X, FileSearch, Layers, Search, Handshake, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/bedro/ui";
import wafer from "@/assets/wafer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BEDRO — Autonomous Procurement for Semiconductors" },
      { name: "description", content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms." },
      { property: "og:title", content: "BEDRO — Autonomous Procurement for Semiconductors" },
      { property: "og:description", content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms." },
    ],
  }),
  component: Landing,
});

const NAV = [
  ["INTELLIGENCE ENGINES", "engines"], ["PROCUREMENT WORKSPACE", "workspace"], ["HOW IT WORKS", "how"],
  ["PRODUCT", "product"], ["FAQ", "faq"], ["REQUEST ACCESS", "access"],
] as const;
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-2xl px-4">
        <a href="#top" className="font-display text-lg font-bold">BEDRO<span className="text-primary">.</span></a>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map(([l, id]) => id === "access"
            ? <Button key={id} size="sm" className="ml-2 bg-gradient-primary shadow-elegant" onClick={() => go(id)}>{l}</Button>
            : <button key={id} onClick={() => go(id)} className="rounded-lg px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground transition hover:bg-secondary hover:text-foreground">{l}</button>)}
        </nav>
        <button className="ml-auto rounded-lg p-2 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="glass mx-auto mt-2 flex max-w-6xl flex-col rounded-2xl p-2 lg:hidden">
            {NAV.map(([l, id]) => <button key={id} onClick={() => { setOpen(false); go(id); }} className="rounded-lg px-3 py-3 text-left text-xs font-semibold tracking-wider hover:bg-secondary">{l}</button>)}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

const ENGINES = [
  { icon: FileSearch, t: "Specification Intelligence", d: "Parse and validate buyer-uploaded requirements, map column variations to canonical fields, and flag missing or ambiguous values." },
  { icon: Layers, t: "Demand Pooling", d: "Discover compatible purchase demand without merging unrelated component items." },
  { icon: Search, t: "Supplier Discovery & Alternatives", d: "Compare supplier offerings and show possible component substitutes with evidence and gaps." },
  { icon: Handshake, t: "Negotiation & Sourcing Decision Support", d: "Support supplier selection, negotiation outcomes, verification checks, and buyer-controlled acceptance." },
];
const STEPS = [
  "Buyer uploads requirement files.", "BEDRO parses, validates, and normalizes each item.",
  "Supplier data is matched against each item and eligible candidates are ranked.",
  "The strongest three supplier candidates are shortlisted, with their fit and gaps shown.",
  "One selected supplier proceeds to negotiation through the agent and supplier email workflow.",
  "A negotiated offer is checked and presented for the buyer's explicit sourcing decision.",
  "Upon acceptance, the backend initiates supplier notification and reports actual status.",
];
const FEATURES = [
  ["Specification Intelligence", "Column variations like “qty”, “Quantity” and “order_quantity” map to one canonical field. Missing values are flagged per row.", ["part_name → Part", "qty → Quantity", "Row 14: quantity missing"]],
  ["Demand Pooling", "Only items with the same category, part and unit are pooled. Original line-item records are preserved.", ["300 mm P-type wafer", "3 compatible items", "Unrelated items excluded"]],
  ["Supplier Discovery", "Every validated item is matched against supplier offerings and ranked into a top-three shortlist.", ["#1 Fit 92", "#2 Fit 87", "#3 Fit 81"]],
  ["Alternative Qualification", "Same-category offerings are surfaced as possible substitutes, pending engineering qualification.", ["Grade: Prime vs Test", "Spec differences shown", "Qualification required"]],
  ["Negotiation Intelligence", "One selected supplier is negotiated with. The resulting offer is presented — never auto-accepted.", ["Unit price", "Lead time", "Total value"]],
  ["Supplier Qualification & Gaps", "Concrete shortcomings — MOQ, availability, lead time, compliance — are listed beside each candidate.", ["MOQ exceeds quantity", "Lead time 42 d > 30 d", "Compliance: Under Review"]],
] as const;
const FAQ = [
  ["What file formats can buyers upload?", "CSV and XLSX files up to 5 MB. Common column name variations are mapped automatically, and each row is validated independently."],
  ["Where does supplier data come from?", "The workspace currently uses a sample supplier catalogue. Values are illustrative, not live inventory or formal quotes. A supplier service will replace it."],
  ["How does supplier matching work?", "Each validated line item is compared against supplier offerings on category, specification, quantity, lead time, price and compliance, then ranked into a top-three shortlist."],
  ["What is demand pooling?", "BEDRO identifies genuinely compatible requirements — same component, category and unit — that could be sourced together. Unrelated items are never combined."],
  ["How are suppliers negotiated with?", "One selected supplier is negotiated with through the supplier email workflow once connected. Until then, negotiation outcomes are clearly marked as simulated."],
  ["How is data privacy handled?", "Tenant isolation, authentication and supplier-data privacy are enforced by the backend. Uploaded files are parsed in the browser in this preview."],
  ["What integrations are planned?", "Backend API, supplier database service, negotiation agents and supplier email. Integration status is shown on the workspace Overview."],
];

function Landing() {
  const [feat, setFeat] = useState(0);
  const [faq, setFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", org: "", role: "", context: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.org || !form.role) return setErr("Name, organization and role are required.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setErr("Enter a valid business email address.");
    setErr(""); setSent(true);
  };

  return (
    <div id="top" className="bg-background">
      <Nav />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-32 md:pt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <Pill tone="primary">Autonomous procurement · Semiconductors</Pill>
            <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] md:text-7xl">BUY LIKE AN ENTERPRISE.<br /><span className="text-gradient">COMPETE ON YOUR TERMS.</span></h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">An autonomous procurement platform for semiconductor manufacturers. Pool purchasing power, discover qualified alternatives, and negotiate on your terms.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-gradient-primary shadow-elegant" onClick={() => go("workspace")}>Explore the Procurement Workspace <ArrowRight className="size-4" /></Button>
              <Button size="lg" variant="outline" className="glass" onClick={() => go("how")}>How It Works</Button>
            </div>
          </motion.div>
          <motion.img src={wafer} alt="Iridescent semiconductor wafer" width={1408} height={1024}
            initial={{ opacity: 0, scale: 0.92, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -12, 0] }}
            transition={{ duration: 1.2, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }} className="w-full rounded-[2rem] mix-blend-multiply" />
        </div>
      </section>

      {/* Workspace showcase */}
      <section id="workspace" className="px-5 py-24">
        <motion.div {...reveal} className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-xs font-bold tracking-widest text-primary">PROCUREMENT WORKSPACE</p>
              <h2 className="mt-3 max-w-xl text-4xl font-bold">From requirement file to sourcing decision.</h2></div>
            <Button size="lg" asChild className="bg-gradient-primary shadow-elegant"><Link to="/workspace">Open Procurement Workspace <ArrowRight className="size-4" /></Link></Button>
          </div>
          <div className="surface mt-10 grid gap-4 p-4 md:grid-cols-4 md:p-6">
            <div className="col-span-full flex items-center justify-between"><span className="text-sm font-semibold">Workspace preview</span><Pill tone="warning">Illustrative</Pill></div>
            {[["Requirement intake", "Drag & drop CSV / XLSX", "Row-level validation"], ["Shortlisted suppliers", "Top three per item", "Fit and gaps"], ["Negotiation result", "One selected supplier", "Offer terms"], ["Sourcing decision", "Accept or decline", "Notification status"]].map(([t, a, b], i) => (
              <motion.div key={t} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="rounded-2xl bg-secondary p-5">
                <div className="text-xs font-bold text-primary">0{i + 1}</div><div className="mt-2 font-semibold">{t}</div>
                <div className="mt-4 space-y-2">{[a, b].map((x) => <div key={x} className="rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">{x}</div>)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Engines */}
      <section id="engines" className="bg-secondary/60 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal}><p className="text-xs font-bold tracking-widest text-primary">INTELLIGENCE ENGINES</p><h2 className="mt-3 text-4xl font-bold">Four engines. One procurement flow.</h2></motion.div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {ENGINES.map(({ icon: Icon, t, d }, i) => (
              <motion.div key={t} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} whileHover={{ y: -4 }} className="surface p-7">
                <div className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Icon className="size-5" /></div>
                <h3 className="mt-5 text-xl font-semibold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div {...reveal}><p className="text-xs font-bold tracking-widest text-primary">HOW IT WORKS</p><h2 className="mt-3 text-4xl font-bold">Seven steps, buyer in control.</h2></motion.div>
          <ol className="mt-12 space-y-3">
            {STEPS.map((s, i) => (
              <motion.li key={s} {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }} className="surface flex items-center gap-5 p-5">
                <span className="font-display text-2xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span><span>{s}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="bg-secondary/60 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal}><p className="text-xs font-bold tracking-widest text-primary">PRODUCT</p><h2 className="mt-3 text-4xl font-bold">Built for technical procurement.</h2></motion.div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col gap-1" role="tablist">
              {FEATURES.map(([t], i) => (
                <button key={t} role="tab" aria-selected={feat === i} onClick={() => setFeat(i)} className={`flex gap-4 rounded-xl px-4 py-3 text-left font-medium transition ${feat === i ? "bg-card shadow-elegant" : "text-muted-foreground hover:bg-card/60"}`}>
                  <span className="text-primary">{String(i + 1).padStart(2, "0")}</span>{t}
                </button>
              ))}
            </div>
            <div className="surface min-h-80 p-8">
              <AnimatePresence mode="wait">
                <motion.div key={feat} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{FEATURES[feat][0]}</h3><Pill tone="warning">Illustrative</Pill></div>
                  <p className="mt-3 max-w-xl text-muted-foreground">{FEATURES[feat][1]}</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">{FEATURES[feat][2].map((x) => <div key={x} className="rounded-xl bg-secondary p-4 text-sm font-medium">{x}</div>)}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-widest text-primary">FAQ</p><h2 className="mt-3 text-4xl font-bold">Questions, answered.</h2>
          <div className="mt-10 divide-y rounded-2xl border bg-card">
            {FAQ.map(([q, a], i) => (
              <div key={q}>
                <button aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold">
                  {q}<ChevronDown className={`size-4 shrink-0 transition ${faq === i ? "rotate-180" : ""}`} />
                </button>
                <motion.div initial={false} animate={{ height: faq === i ? "auto" : 0, opacity: faq === i ? 1 : 0 }} className="overflow-hidden">
                  <p className="px-6 pb-5 text-muted-foreground">{a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access */}
      <section id="access" className="bg-gradient-hero px-5 py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-primary">REQUEST ACCESS</p><h2 className="mt-3 text-4xl font-bold">Bring BEDRO to your procurement team.</h2>
          {sent ? (
            <div className="surface mt-10 p-8"><Pill tone="warning">Local preview</Pill><p className="mt-3 font-semibold">Request captured locally.</p><p className="text-sm text-muted-foreground">No submission endpoint is connected yet, so this request was not delivered.</p></div>
          ) : (
            <form onSubmit={submit} noValidate className="surface mt-10 grid gap-4 p-8 sm:grid-cols-2">
              {([["name", "Full name"], ["email", "Business email"], ["org", "Organization"], ["role", "Role"]] as const).map(([k, l]) => (
                <label key={k} className="text-sm font-medium">{l}<input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} type={k === "email" ? "email" : "text"} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
              ))}
              <label className="text-sm font-medium sm:col-span-2">Context (optional)<textarea value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} rows={3} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
              {err && <p role="alert" className="text-sm text-destructive sm:col-span-2">{err}</p>}
              <Button type="submit" size="lg" className="bg-gradient-primary shadow-elegant sm:col-span-2">Submit Access Request</Button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div><span className="font-display font-bold text-foreground">BEDRO</span> — Autonomous procurement for semiconductor manufacturers.</div>
          <div className="flex flex-wrap gap-4">{NAV.map(([l, id]) => <button key={id} onClick={() => go(id)} className="hover:text-foreground">{l.charAt(0) + l.slice(1).toLowerCase()}</button>)}</div>
        </div>
      </footer>
    </div>
  );
}
