import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { SEO } from '@/components/shared/SEO';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'
  
  return {
    title: "B2B Event Services & Engineering | E3 Qatar",
    description: "Enterprise-grade event engineering, immersive XR installations, and structural staging for corporate clients and agencies across the MENA region.",
    alternates: {
      canonical: `${baseUrl}/b2b`,
      languages: {
        'en': `${baseUrl}/en/b2b`,
        'ar': `${baseUrl}/ar/b2b`,
      },
    },
    openGraph: {
      title: "B2B Event Services & Engineering | E3 Qatar",
      description: "Enterprise-grade event engineering and immersive XR installations.",
      url: `${baseUrl}/b2b`,
    }
  }
}

const services = [
  {
    tag: 'LIVE PRODUCTION',
    title: 'Stage & Structural Engineering',
    desc: 'Massive-scale stage builds, rigging systems, and structural solutions engineered for reliability at any venue.',
    stat: '200+',
    statLabel: 'Stages Built',
  },
  {
    tag: 'IMMERSIVE TECH',
    title: 'XR & Spatial Experiences',
    desc: 'AR, VR, and mixed-reality installations that dissolve the line between the physical and the virtual.',
    stat: '50M+',
    statLabel: 'Visitors Reached',
  },
  {
    tag: 'ENTERTAINMENT',
    title: 'B2C Attractions & Venues',
    desc: 'From escape rooms to VR arcades — permanent and pop-up entertainment destinations that keep audiences returning.',
    stat: '30+',
    statLabel: 'Active Venues',
  },
  {
    tag: 'ENTERPRISE',
    title: 'Corporate Events & Activations',
    desc: 'End-to-end event design and execution for brands that demand precision and impact on the world stage.',
    stat: '500+',
    statLabel: 'Events Delivered',
  },
];

const clients = [
  'FIFA', 'Qatar Tourism', 'QNTC', 'Ooredoo', 'QNB', 'Hamad Medical',
];

const numbers = [
  { value: '14+', label: 'Years in Qatar' },
  { value: '500+', label: 'Events Delivered' },
  { value: '50M+', label: 'Experiences Engineered' },
  { value: '200+', label: 'Stages Built' },
];

export default function B2bPortal() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'

  return (
    <div className="min-h-screen bg-[var(--surface-default)] text-[var(--text-primary)]">
      <SEO 
        type="Service"
        data={{
          name: "E3 B2B Event Engineering Services",
          provider: {
            "@type": "Organization",
            name: "Event Engineering Experts (E3)"
          },
          areaServed: ["Qatar", "Middle East"],
          description: "Enterprise-grade event engineering, immersive XR installations, and structural staging.",
          url: `${baseUrl}/b2b`
        }}
      />
      
      {/* ─── NAVIGATION ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.9), transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="font-black text-xl tracking-tighter">
          E3 <span className="text-gradient">QATAR</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-secondary)]">
          <Link href="#services" className="hover:text-white transition-colors">Services</Link>
          <Link href="#work" className="hover:text-white transition-colors">Work</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        </div>
        <Link
          href="#contact"
          className="text-xs uppercase tracking-[0.15em] font-bold px-5 py-2.5 rounded-full border border-[var(--border-level-3)] hover:bg-white hover:text-black transition-all duration-300"
        >
          Start a Project
        </Link>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-end pb-24 px-8 md:px-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="E3 Qatar event production aerial view"
            fill
            priority
            className="object-cover"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #050505 20%, rgba(5,5,5,0.5) 60%, rgba(5,5,5,0.2) 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(5,5,5,0.7) 0%, transparent 60%)' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 grid-pattern opacity-10" />

        {/* Live badge */}
        <div className="absolute top-28 left-8 md:left-16 z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-level-3)] text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-secondary)]"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-glow inline-block" />
            Live Ecosystem · Doha, Qatar
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 max-w-[900px]">
          <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-none mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}>
            WE BUILD<br />
            <span className="text-gradient">EXPERIENCES</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl font-light mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}>
            Qatar's premier event engineering and entertainment agency — from massive live productions to permanent immersive attractions.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="#services"
              className="px-7 py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm tracking-wide hover:scale-105 active:scale-95 transition-transform glow"
            >
              Explore Our Work
            </Link>
            <Link
              href="#contact"
              className="px-7 py-3.5 rounded-full border border-[var(--border-level-3)] text-white font-bold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300"
            >
              Start a Project
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          <span>Scroll</span>
          <div className="w-8 h-px bg-[var(--border-level-3)]" />
        </div>
      </section>

      {/* ─── NUMBERS STRIP ────────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border-level-2)] py-12 px-8 md:px-16"
        style={{ background: 'var(--bg-level-2)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {numbers.map((n) => (
            <div key={n.label} className="text-center md:text-left">
              <div className="text-4xl md:text-5xl font-black tracking-tighter text-gradient">{n.value}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] mt-1">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────────────────── */}
      <section id="services" className="py-28 px-8 md:px-16">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            WHAT WE<br /><span className="text-gradient">ENGINEER</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md">
            End-to-end delivery across every discipline of live experience and permanent attraction design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-level-2)]">
          {services.map((s) => (
            <div
              key={s.title}
              className="group bg-[var(--bg-level-1)] p-10 flex flex-col justify-between min-h-[280px] hover:bg-[var(--bg-level-2)] transition-colors cursor-pointer"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--color-accent)] mb-4">{s.tag}</div>
                <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-gradient transition-all">{s.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[40ch]">{s.desc}</p>
              </div>
              <div className="flex items-end justify-between mt-8">
                <div>
                  <div className="text-3xl font-black tracking-tighter">{s.stat}</div>
                  <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-[0.1em]">{s.statLabel}</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-[var(--border-level-3)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-all">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED WORK ────────────────────────────────────────────────────── */}
      <section id="work" className="py-28 px-8 md:px-16 bg-[var(--bg-level-2)] border-t border-[var(--border-level-2)]">
        <div className="flex items-end justify-between mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            FEATURED<br /><span className="text-gradient">ATTRACTIONS</span>
          </h2>
          <Link href="/b2c/attractions"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[var(--text-secondary)] hover:text-white transition-colors">
            View All <span>→</span>
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory -mx-4 px-4"
          style={{ scrollbarWidth: 'none' }}>
          {[
            { name: 'Riyadh World Cup Arena', tag: 'MEGA EVENT', year: '2024' },
            { name: 'XR Dome Experience', tag: 'IMMERSIVE', year: '2024' },
            { name: 'Doha Gaming Festival', tag: 'LIVE EVENT', year: '2023' },
            { name: 'Lusail Waterfront Activation', tag: 'ACTIVATION', year: '2023' },
          ].map((item, i) => (
            <div
              key={item.name}
              className="snap-start shrink-0 w-[320px] md:w-[400px] h-[480px] rounded-2xl relative overflow-hidden group cursor-pointer border border-[var(--border-level-2)] hover:border-[var(--color-primary)] transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, hsl(${220 + i * 40}, 60%, ${8 + i * 3}%), hsl(${200 + i * 30}, 40%, ${5 + i * 2}%))`,
              }}
            >
              {/* Glow blob */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, hsl(${200 + i * 30}, 100%, 50%) 0%, transparent 70%)`,
                }} />
              {/* Grid */}
              <div className="absolute inset-0 grid-pattern opacity-10" />

              <div className="absolute bottom-0 left-0 right-0 p-8 z-10"
                style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, transparent 100%)' }}>
                <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--color-accent)] mb-2">{item.tag}</div>
                <h3 className="text-2xl font-black tracking-tight mb-1">{item.name}</h3>
                <div className="text-xs text-[var(--text-tertiary)]">{item.year}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CLIENTS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 border-t border-[var(--border-level-2)]">
        <div className="text-xs uppercase tracking-[0.25em] font-bold text-[var(--text-tertiary)] mb-10">
          Trusted by Qatar's leading organisations
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          {clients.map((c) => (
            <div key={c}
              className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-tertiary)] hover:text-white transition-colors cursor-default">
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* ─── ABOUT STRIP ───────────────────────────────────────────────────────── */}
      <section id="about"
        className="py-28 px-8 md:px-16 border-t border-[var(--border-level-2)]"
        style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.05) 0%, transparent 60%)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
              BUILT FOR<br /><span className="text-gradient">THE REGION</span>
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              E3 — Event Engineering Experts — has been shaping Qatar's live entertainment landscape for over a decade. We combine deep local expertise with world-class production capabilities to deliver experiences that define cultural moments.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              From the 2022 FIFA World Cup fanzone operations to Doha's permanent entertainment destinations, our work spans every scale and format.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Headquartered in', value: 'Doha, Qatar' },
              { label: 'Regional reach', value: 'GCC + MENA' },
              { label: 'Team size', value: '120+ crew' },
              { label: 'Languages', value: 'Arabic · English' },
            ].map((f) => (
              <div key={f.label}
                className="p-6 rounded-xl border border-[var(--border-level-2)] bg-[var(--bg-level-2)]">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2">{f.label}</div>
                <div className="font-black text-lg tracking-tight">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section id="contact"
        className="py-32 px-8 md:px-16 text-center border-t border-[var(--border-level-2)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            LET'S BUILD<br /><span className="text-gradient">SOMETHING</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-10">
            Ready to engineer your next experience? Tell us about your project and we'll respond within 24 hours.
          </p>
          <a
            href="mailto:hello@e3.qa"
            className="inline-block px-10 py-4 rounded-full bg-[var(--color-primary)] text-white font-bold tracking-wide text-sm hover:scale-105 active:scale-95 transition-transform glow"
          >
            Start a Project
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-level-2)] px-8 md:px-16 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="font-black text-xl tracking-tighter">
            E3 <span className="text-gradient">QATAR</span>
          </div>
          <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
            <Link href="#services" className="hover:text-white transition-colors">Services</Link>
            <Link href="#work" className="hover:text-white transition-colors">Work</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">
            &copy; 2026 E3 Qatar · Event Engineering Experts
          </div>
        </div>
      </footer>

    </div>
  );
}
