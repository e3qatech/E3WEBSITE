"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, ChevronRight, FileText, CheckCircle2, Building, Target, Heart } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
      <Stage environment="city" intensity={0.6} castShadow={false}>
        <primitive object={scene} />
      </Stage>
    </PresentationControls>
  );
}

export function DiscoverClient({ locale, initialSettings }: { locale: string; initialSettings: any }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadState("uploading");
    setTimeout(() => {
      setUploadState("success");
      setTimeout(() => setUploadState("idle"), 3000);
    }, 2000);
  };

  const team = initialSettings?.team || [];

  const hero = {
    titleEn: "",
    titleAr: "",
    subtitleEn: "",
    subtitleAr: "",
    mediaType: "ORBS",
    mediaUrl: "",
    ...(initialSettings?.hero || {})
  };

  const heritage = {
    title: "",
    description: "",
    vision: "",
    mission: "",
    values: "",
    ...(initialSettings?.heritage || {})
  };

  const careers = {
    title: "",
    description: "",
    nlpText: "",
    ...(initialSettings?.careers || {})
  };

  return (
    <div className="min-h-screen bg-[var(--surface-default)] text-[var(--text-primary)] font-sans selection:bg-emerald-500/30 overflow-x-hidden relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <style dangerouslySetInnerHTML={{ __html: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Righteous&display=swap');" }} />
      
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#2A2A50_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        
        {/* Background Media */}
        {hero.mediaType === "ORBS" && (
          <>
            <div className="absolute top-1/4 start-1/4 w-[45vw] h-[45vw] bg-emerald-600/30 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-1/4 end-1/4 w-[40vw] h-[40vw] bg-rose-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s] delay-1000"></div>
          </>
        )}
        {hero.mediaType === "IMAGE" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-30 mix-blend-screen">
            <img src={hero.mediaUrl} alt="Hero Background" className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "VIDEO" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-30 mix-blend-screen">
            <video src={hero.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "IFRAME" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-50 mix-blend-screen pointer-events-none">
            {String(hero.mediaUrl).startsWith("<iframe") ? (
              <div dangerouslySetInnerHTML={{ __html: hero.mediaUrl }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none" />
            ) : (
              <iframe src={hero.mediaUrl} className="w-full h-full border-none" />
            )}
          </div>
        )}
        {hero.mediaType === "3D_MODEL" && hero.mediaUrl && (
          <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <ModelViewer url={hero.mediaUrl} />
              </Suspense>
            </Canvas>
          </div>
        )}
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-normal mb-8 bg-clip-text text-transparent bg-gradient-to-br from-emerald-300 via-rose-400 to-emerald-600 drop-shadow-lg">
              {locale === 'ar' ? hero.titleAr : hero.titleEn}
            </h1>
            <p className="text-lg md:text-2xl text-[var(--color-primary)] max-w-3xl mx-auto leading-relaxed font-light whitespace-pre-wrap">
              {locale === 'ar' ? hero.subtitleAr : hero.subtitleEn}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: E3 STORY & HERITAGE */}
      <section className="relative py-32 border-t border-[var(--color-primary)]/50 bg-[var(--surface-default)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-wide text-[var(--text-primary)] mb-6">{heritage.title}</h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (heritage.description || "").replace(/(InflataRun track|Doha Balloon Parade)/g, '<strong class="text-[var(--color-secondary)] font-semibold">$1</strong>') }}></p>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl border border-[var(--color-primary)]/50 bg-[var(--surface-active)] overflow-hidden group shadow-[0_0_40px_rgba(124,58,237,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#13132B] to-[#202040] opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[var(--color-primary)] font-mono text-sm tracking-[0.3em] uppercase opacity-70 group-hover:text-[var(--color-secondary)] transition-colors duration-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">E3 Archives</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--surface-hover)]/60 backdrop-blur-md border border-[var(--color-primary)]/50 rounded-2xl p-8 hover:bg-[var(--surface-active)]/80 hover:border-[var(--color-primary)]/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group">
              <Target className="w-10 h-10 text-[var(--color-primary)] mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-[var(--color-primary)]" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{heritage.visionTitle || "Vision"}</h3>
              <p className="text-[var(--text-tertiary)] whitespace-pre-wrap group-hover:text-[var(--text-secondary)] transition-colors">{heritage.vision}</p>
            </div>
            <div className="bg-[var(--surface-hover)]/60 backdrop-blur-md border border-[var(--color-primary)]/50 rounded-2xl p-8 hover:bg-[var(--surface-active)]/80 hover:border-[var(--color-secondary)]/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all duration-300 group">
              <Building className="w-10 h-10 text-[var(--color-secondary)] mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-[var(--color-secondary)]" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{heritage.missionTitle || "Mission"}</h3>
              <p className="text-[var(--text-tertiary)] whitespace-pre-wrap group-hover:text-[var(--text-secondary)] transition-colors">{heritage.mission}</p>
            </div>
            <div className="bg-[var(--surface-hover)]/60 backdrop-blur-md border border-[var(--color-primary)]/50 rounded-2xl p-8 hover:bg-[var(--surface-active)]/80 hover:border-[var(--color-primary)]/50 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] transition-all duration-300 group">
              <Heart className="w-10 h-10 text-[var(--color-primary)] mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-[var(--color-primary)]" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{heritage.valuesTitle || "Core Values"}</h3>
              <p className="text-[var(--text-tertiary)] whitespace-pre-wrap group-hover:text-[var(--text-secondary)] transition-colors">{heritage.values}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE CORPORATE TEAM */}
      <section className="relative py-32 bg-[var(--surface-default)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-wide mb-4">{initialSettings?.corporateRosterTitle || "Corporate Roster"}</h2>
            <p className="text-[var(--color-primary)] font-mono text-sm uppercase tracking-[0.2em]">{initialSettings?.corporateRosterSubtitle || "Leadership & Engineering Core"}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member: { name: string; role: string; desc: string }, i: number) => (
              <motion.div 
                key={member.name}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative bg-[var(--surface-active)] border border-[var(--border-level-2)] hover:border-[var(--color-secondary)] hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] rounded-2xl p-6 overflow-hidden transition-colors duration-300"
              >
                <div className="absolute top-0 start-0 w-full h-1  from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 rounded-full bg-[var(--surface-active)] mb-6 border border-[var(--color-primary)]/50 flex items-center justify-center text-[var(--color-primary)] font-bold text-xl shadow-[0_0_15px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] group-hover:border-[var(--color-secondary)]/50 transition-all duration-300">
                  {(member.name || "?").charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--color-secondary)] transition-colors">{member.name}</h4>
                <p className="text-sm font-semibold text-[var(--color-secondary)] mb-4 tracking-wide">{member.role}</p>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: GROUP BOOKINGS CONSOLE */}
      <section className="relative py-32 border-t border-[var(--color-primary)]/50 bg-[var(--surface-default)]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-wide mb-4">{initialSettings?.bookingsTitle || "Group Bookings Console"}</h2>
            <p className="text-[var(--color-primary)]">{initialSettings?.bookingsSubtitle || "Generate high-value inquiries for specialized corporate and VIP celebrations."}</p>
          </div>

          <div className="bg-[var(--surface-active)] border border-[var(--color-primary)]/50 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <Tabs defaultValue="corporate" className="w-full">
              <TabsList className="grid grid-cols-2 bg-[var(--bg-level-1)] p-2 rounded-2xl mb-8 border border-[var(--border-level-2)]">
                <TabsTrigger value="corporate" className="rounded-xl data-[state=active]:bg-[var(--surface-hover)] data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all">Corporate Events</TabsTrigger>
                <TabsTrigger value="vip" className="rounded-xl data-[state=active]:bg-[var(--surface-hover)] data-[state=active]:text-[var(--color-secondary)] data-[state=active]:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all">VIP Birthdays</TabsTrigger>
              </TabsList>
              
              <div className="p-4 md:p-8">
                <TabsContent value="corporate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">Corporate Excellence</h3>
                      <ul className="space-y-4 text-[var(--text-secondary)] mb-8">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Specialized family days</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Professional catering lists</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Venue privatization (InflataPark)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Custom on-site branding</li>
                      </ul>
                    </div>
                    <BookingForm type="Corporate" accentColor="purple" />
                  </div>
                </TabsContent>

                <TabsContent value="vip" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">VIP Celebrations</h3>
                      <ul className="space-y-4 text-[var(--text-secondary)] mb-8">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-secondary)] shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Private sensory celebrations</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-secondary)] shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Themed Party Halls (Doha Mall)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-secondary)] shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Custom cake setups</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--color-secondary)] shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Interactive child-safe packages</li>
                      </ul>
                    </div>
                    <BookingForm type="VIP" accentColor="rose" />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* SECTION 5: CAREERS & AI CV UPLOADER */}
      <section className="relative py-32 bg-[var(--surface-default)] border-t border-[var(--border-level-2)]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-wide mb-6">{careers.title}</h2>
              <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (careers.description || "").replace(/(freelance event crew staffing|Lusail corporate office)/g, '<strong class="text-[var(--color-primary)] font-semibold">$1</strong>') }}></p>
              <div className="bg-[var(--surface-active)] border border-[var(--color-primary)]/50 shadow-[0_5px_20px_rgba(0,0,0,0.2)] rounded-xl p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  How we process CVs
                </h4>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap">{careers.nlpText}</p>
              </div>
            </div>

            {/* Drag & Drop Panel */}
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-[var(--color-primary)] bg-emerald-900/10 scale-[1.02] shadow-[0_0_30px_rgba(124,58,237,0.15)]' : 'border-[var(--border-level-2)] hover:border-[var(--color-primary)]/50 bg-[var(--surface-active)]/60'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadState === "idle" && (
                <div className="pointer-events-none">
                  <div className="w-20 h-20 mx-auto bg-[var(--surface-active)] border border-[var(--color-primary)]/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <UploadCloud className="w-10 h-10 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Drop your CV here</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mb-8">PDF, DOCX up to 10MB</p>
                  <Button variant="outline" className="border-[var(--color-primary)]/50 text-[var(--color-primary)] hover:bg-emerald-900/30 hover:text-[var(--text-primary)] relative z-10 pointer-events-auto rounded-xl px-8 tracking-wide">
                    Browse Files
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      if(e.target.files?.length) simulateUpload();
                    }} />
                  </Button>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="py-8">
                  <div className="w-14 h-14 border-4 border-[#1A1A3A] border-t-emerald-500 rounded-full animate-spin mx-auto mb-8 shadow-[0_0_15px_rgba(124,58,237,0.3)]"></div>
                  <p className="text-[var(--color-primary)] font-mono text-sm tracking-widest animate-pulse">NLP Extracting Skills...</p>
                </div>
              )}

              {uploadState === "success" && (
                <div className="py-8">
                  <div className="w-20 h-20 bg-emerald-900/30 border border-[var(--color-primary)]/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2 tracking-wide">Profile Ingested</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">Added to E3 Talent Database</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BookingForm({ type, accentColor = "purple" }: { type: string, accentColor?: "purple" | "rose" }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1500);
  };

  const isRose = accentColor === "rose";
  const focusRing = isRose ? "focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)]" : "focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";
  const successBg = isRose ? "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/50" : "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50";
  const successText = isRose ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]";
  const successIcon = isRose ? "text-[var(--color-secondary)] drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]";
  const hoverBg = isRose ? "hover:bg-[var(--color-secondary)]/20" : "hover:bg-[var(--color-primary)]/20";
  const borderColor = isRose ? "border-[var(--color-secondary)]/30" : "border-[var(--color-primary)]/30";

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${successBg} border rounded-2xl p-8 text-center shadow-lg`}
      >
        <CheckCircle2 className={`w-14 h-14 ${successIcon} mx-auto mb-6`} />
        <h4 className={`text-2xl font-bold tracking-wide ${successText} mb-3`}>Inquiry Received</h4>
        <p className="text-[var(--text-secondary)]">Our {type.toLowerCase()} concierge will contact you within 24 hours.</p>
        <Button variant="outline" className={`mt-8 ${borderColor} ${successText} ${hoverBg} rounded-xl px-6`} onClick={() => setStatus("idle")}>Submit Another</Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">First Name</label>
          <Input required className={`bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-primary)] ${focusRing} rounded-xl h-12 shadow-inner`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Last Name</label>
          <Input required className={`bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-primary)] ${focusRing} rounded-xl h-12 shadow-inner`} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Email Address</label>
        <Input type="email" required className={`bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-primary)] ${focusRing} rounded-xl h-12 shadow-inner`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Preferred Date</label>
        <Input type="date" required className={`bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-primary)] ${focusRing} rounded-xl h-12 shadow-inner [color-scheme:dark]`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Guest Count</label>
        <Input type="number" min="10" required className={`bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-primary)] ${focusRing} rounded-xl h-12 shadow-inner`} />
      </div>
      <Button type="submit" disabled={status === "submitting"} className={`w-full  bg-[var(--color-primary)] hover:brightness-110 text-[var(--text-primary)] font-bold tracking-wider text-lg h-14 rounded-xl mt-6 shadow-[0_10px_20px_rgba(244,63,94,0.2)] transition-all duration-300 hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)]`}>
        {status === "submitting" ? "Processing..." : "Submit Inquiry"} <ChevronRight className="w-5 h-5 ms-2 rtl:-scale-x-100" />
      </Button>
    </form>
  );
}
