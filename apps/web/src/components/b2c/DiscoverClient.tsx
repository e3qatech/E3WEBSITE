"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, ChevronRight, FileText, CheckCircle2, Building, Target, Heart } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { 
  useB2CTheme, 
  B2CCard, 
  B2CButton, 
  B2CInput, 
  B2CBadge 
} from "@/components/ui/B2CThemeComponents";

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
  const { theme } = useB2CTheme();

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

  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)] overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      <style dangerouslySetInnerHTML={{ __html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1A1FD6_1px,transparent_1px)] [background-size:32px_32px] opacity-15"></div>
        
        {/* Background Media */}
        {hero.mediaType === "ORBS" && (
          <>
            <div className="absolute top-1/4 start-1/4 w-[45vw] h-[45vw] bg-[var(--e3-purple)] rounded-full blur-[140px] mix-blend-screen opacity-[0.12] animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-1/4 end-1/4 w-[40vw] h-[40vw] bg-[var(--e3-royal-blue)] rounded-full blur-[120px] mix-blend-screen opacity-[0.12] animate-pulse duration-[10s] delay-1000"></div>
          </>
        )}
        {hero.mediaType === "IMAGE" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-25 dark:opacity-30 mix-blend-screen">
            <img src={hero.mediaUrl} alt="Hero Background" className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "VIDEO" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-25 dark:opacity-30 mix-blend-screen">
            <video src={hero.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "IFRAME" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-40 dark:opacity-50 mix-blend-screen pointer-events-none">
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

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-[var(--bg-level-1)]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8.5xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--e3-royal-blue)] to-[var(--e3-magenta)] font-display uppercase">
              {isAr ? hero.titleAr : hero.titleEn}
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-medium whitespace-pre-wrap">
              {isAr ? hero.subtitleAr : hero.subtitleEn}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: E3 STORY & HERITAGE */}
      <section className="relative py-24 md:py-32 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-6 font-display uppercase">{heritage.title}</h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6 whitespace-pre-wrap font-medium" 
                dangerouslySetInnerHTML={{ 
                  __html: (heritage.description || "").replace(
                    /(InflataRun track|Doha Balloon Parade)/g, 
                    `<strong class="text-[var(--e3-royal-blue)] font-semibold">$1</strong>`
                  ) 
                }}
              />
            </div>
            <div className="relative h-64 md:h-96 rounded-3xl border border-[rgba(75,0,143,0.3)] bg-[rgba(8,10,42,0.6)] overflow-hidden group shadow-[0_4px_30px_rgba(75,0,143,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--e3-midnight)] to-[var(--e3-deep-blue)] opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[var(--e3-royal-blue)] font-display text-xl tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100 group-hover:text-[var(--e3-magenta)] transition-all duration-300 drop-shadow-[0_0_8px_rgba(26,31,214,0.6)]">
                  E3 Archives
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <B2CCard className="p-8 group">
              <Target className="w-10 h-10 text-[var(--e3-royal-blue)] mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 font-display uppercase">{heritage.visionTitle || "Vision"}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed">{heritage.vision}</p>
            </B2CCard>
            <B2CCard className="p-8 group">
              <Building className="w-10 h-10 text-[var(--e3-purple)] mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 font-display uppercase">{heritage.missionTitle || "Mission"}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed">{heritage.mission}</p>
            </B2CCard>
            <B2CCard className="p-8 group">
              <Heart className="w-10 h-10 text-[var(--e3-magenta)] mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 font-display uppercase">{heritage.valuesTitle || "Core Values"}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed">{heritage.values}</p>
            </B2CCard>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE CORPORATE TEAM */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4 font-display uppercase">
              {initialSettings?.corporateRosterTitle || "Corporate Roster"}
            </h2>
            <p className="text-[var(--e3-royal-blue)] font-bold text-xs uppercase tracking-[0.2em] font-poppins">
              {initialSettings?.corporateRosterSubtitle || "Leadership & Engineering Core"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member: { name: string; role: string; desc: string }, i: number) => (
              <B2CCard key={member.name} className="p-6 relative group overflow-hidden border-[rgba(75,0,143,0.3)]">
                <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-magenta)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-16 h-16 rounded-2xl bg-[rgba(26,31,214,0.1)] mb-6 border border-[var(--e3-royal-blue)]/30 flex items-center justify-center text-[var(--e3-royal-blue)] font-black text-xl shadow-[0_0_15px_rgba(26,31,214,0.1)] group-hover:border-[var(--e3-magenta)] group-hover:text-[var(--e3-magenta)] transition-all duration-300">
                  {(member.name || "?").charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-display uppercase group-hover:text-[var(--e3-royal-blue)] transition-colors duration-300">
                  {member.name}
                </h4>
                <p className="text-xs font-black text-[var(--e3-magenta)] mb-4 tracking-wider uppercase">
                  {member.role}
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  {member.desc}
                </p>
              </B2CCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: GROUP BOOKINGS CONSOLE */}
      <section className="relative py-24 md:py-32 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/40">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4 font-display uppercase">
              {initialSettings?.bookingsTitle || "Group Bookings Console"}
            </h2>
            <p className="text-[var(--text-secondary)] font-medium">
              {initialSettings?.bookingsSubtitle || "Generate high-value inquiries for specialized corporate and VIP celebrations."}
            </p>
          </div>

          <B2CCard className="p-3 border-[rgba(75,0,143,0.3)] shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
            <Tabs defaultValue="corporate" className="w-full">
              <TabsList className="grid grid-cols-2 bg-[var(--bg-level-1)] p-1.5 rounded-2xl mb-8 border border-[var(--border-level-2)]">
                <TabsTrigger 
                  value="corporate" 
                  className="rounded-xl font-bold text-sm tracking-wide py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-royal-blue)] data-[state=active]:shadow-lg cursor-pointer transition-all"
                >
                  Corporate Events
                </TabsTrigger>
                <TabsTrigger 
                  value="vip" 
                  className="rounded-xl font-bold text-sm tracking-wide py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-magenta)] data-[state=active]:shadow-lg cursor-pointer transition-all"
                >
                  VIP Birthdays
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4 md:p-8">
                <TabsContent value="corporate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="text-start">
                      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 tracking-tight font-display uppercase">Corporate Excellence</h3>
                      <ul className="space-y-4 text-[var(--text-secondary)] mb-8 font-medium text-sm md:text-base">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-royal-blue)] shrink-0"/> Specialized family days</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-royal-blue)] shrink-0"/> Professional catering lists</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-royal-blue)] shrink-0"/> Venue privatization (InflataPark)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-royal-blue)] shrink-0"/> Custom on-site branding</li>
                      </ul>
                    </div>
                    <BookingForm type="Corporate" accentColor="purple" />
                  </div>
                </TabsContent>

                <TabsContent value="vip" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="text-start">
                      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 tracking-tight font-display uppercase">VIP Celebrations</h3>
                      <ul className="space-y-4 text-[var(--text-secondary)] mb-8 font-medium text-sm md:text-base">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-magenta)] shrink-0"/> Private sensory celebrations</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-magenta)] shrink-0"/> Themed Party Halls (Doha Mall)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-magenta)] shrink-0"/> Custom cake setups</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-[var(--e3-magenta)] shrink-0"/> Interactive child-safe packages</li>
                      </ul>
                    </div>
                    <BookingForm type="VIP" accentColor="rose" />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </B2CCard>
        </div>
      </section>

      {/* SECTION 5: CAREERS & AI CV UPLOADER */}
      <section className="relative py-24 md:py-32 border-t border-[var(--border-level-2)] bg-[var(--surface-default)]/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-start">
              <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-6 font-display uppercase">
                {careers.title}
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed font-medium" 
                dangerouslySetInnerHTML={{ 
                  __html: (careers.description || "").replace(
                    /(freelance event crew staffing|Lusail corporate office)/g, 
                    `<strong class="text-[var(--e3-royal-blue)] font-semibold">$1</strong>`
                  ) 
                }}
              />
              <B2CCard className="p-6 border-[rgba(75,0,143,0.3)]">
                <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--e3-magenta)] animate-pulse" />
                  How we process CVs
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{careers.nlpText}</p>
              </B2CCard>
            </div>

            {/* Drag & Drop Panel */}
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-[var(--e3-royal-blue)] bg-[rgba(26,31,214,0.06)] scale-[1.01] shadow-[0_0_20px_rgba(26,31,214,0.15)]' 
                  : 'border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)]/50 bg-[var(--surface-default)]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadState === "idle" && (
                <div>
                  <div className="w-20 h-20 mx-auto bg-[rgba(26,31,214,0.08)] border border-[var(--e3-royal-blue)]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_4px_15px_rgba(26,31,214,0.06)]">
                    <UploadCloud className="w-10 h-10 text-[var(--e3-royal-blue)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display uppercase">Drop your CV here</h3>
                  <p className="text-xs text-[var(--text-tertiary)] font-bold mb-8 uppercase tracking-wider">PDF, DOCX up to 10MB</p>
                  
                  <B2CButton variant="outline" size="sm" className="relative cursor-pointer">
                    Browse Files
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      if(e.target.files?.length) simulateUpload();
                    }} />
                  </B2CButton>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="py-8">
                  <div className="w-12 h-12 border-4 border-[var(--bg-level-2)] border-t-[var(--e3-royal-blue)] rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-[var(--e3-royal-blue)] font-bold text-xs uppercase tracking-widest animate-pulse">NLP Extracting Skills...</p>
                </div>
              )}

              {uploadState === "success" && (
                <div className="py-8">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_15px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-500 mb-2 font-display uppercase">Profile Ingested</h3>
                  <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Added to E3 Talent Database</p>
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
  const { theme } = useB2CTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1500);
  };

  const isRose = accentColor === "rose";
  const accentHex = isRose ? "var(--e3-magenta)" : "var(--e3-royal-blue)";
  const alertBg = isRose ? "bg-[var(--e3-magenta)]/10 border-[var(--e3-magenta)]/30" : "bg-[var(--e3-royal-blue)]/10 border-[var(--e3-royal-blue)]/30";
  const textClass = isRose ? "text-[var(--e3-magenta)]" : "text-[var(--e3-royal-blue)]";

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${alertBg} border rounded-2xl p-8 text-center flex flex-col items-center justify-center`}
      >
        <CheckCircle2 className={`w-12 h-12 ${textClass} mb-4`} />
        <h4 className={`text-xl font-bold uppercase tracking-wide font-display ${textClass} mb-2`}>Inquiry Received</h4>
        <p className="text-sm text-[var(--text-secondary)] font-medium">Our {type.toLowerCase()} concierge will contact you within 24 hours.</p>
        <B2CButton variant="outline" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
          Submit Another
        </B2CButton>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-start">
      <div className="grid grid-cols-2 gap-5">
        <B2CInput 
          required 
          label="First Name" 
          placeholder="First name"
        />
        <B2CInput 
          required 
          label="Last Name" 
          placeholder="Last name"
        />
      </div>
      <B2CInput 
        type="email" 
        required 
        label="Email Address" 
        placeholder="your@email.com"
      />
      <B2CInput 
        type="date" 
        required 
        label="Preferred Date" 
        style={{ colorScheme: theme }}
      />
      <B2CInput 
        type="number" 
        min="10" 
        required 
        label="Guest Count" 
        placeholder="Minimum 10 guests"
      />
      
      <div className="pt-4">
        <B2CButton 
          type="submit" 
          variant={isRose ? "secondary" : "primary"} 
          className="w-full flex items-center justify-center gap-2 uppercase font-black tracking-wider text-base py-4 h-auto"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Processing..." : "Submit Inquiry"} 
          <ChevronRight className="w-5 h-5 ms-2 rtl:-scale-x-100" />
        </B2CButton>
      </div>
    </form>
  );
}
