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
    <div className="min-h-screen bg-[#0F0F23] text-slate-200 font-['Poppins',sans-serif] selection:bg-purple-500/30 overflow-x-hidden relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
            <div className="absolute top-1/4 left-1/4 w-[45vw] h-[45vw] bg-purple-600/30 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-rose-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s] delay-1000"></div>
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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Righteous',sans-serif] tracking-normal mb-8 bg-clip-text text-transparent bg-gradient-to-br from-purple-300 via-rose-400 to-purple-600 drop-shadow-lg">
              {locale === 'ar' ? hero.titleAr : hero.titleEn}
            </h1>
            <p className="text-lg md:text-2xl text-violet-200 max-w-3xl mx-auto leading-relaxed font-light whitespace-pre-wrap">
              {locale === 'ar' ? hero.subtitleAr : hero.subtitleEn}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: E3 STORY & HERITAGE */}
      <section className="relative py-32 border-t border-purple-900/30 bg-[#0B0B1A]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-['Righteous',sans-serif] tracking-wide text-white mb-6">{heritage.title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (heritage.description || "").replace(/(InflataRun track|Doha Balloon Parade)/g, '<strong class="text-rose-400 font-semibold">$1</strong>') }}></p>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl border border-purple-900/50 bg-[#13132B] overflow-hidden group shadow-[0_0_40px_rgba(124,58,237,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#13132B] to-[#202040] opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-purple-400 font-mono text-sm tracking-[0.3em] uppercase opacity-70 group-hover:text-rose-400 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">E3 Archives</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#151530]/60 backdrop-blur-md border border-purple-900/40 rounded-2xl p-8 hover:bg-[#1A1A3A]/80 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group">
              <Target className="w-10 h-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-purple-300" />
              <h3 className="text-xl font-bold text-white mb-4">{heritage.visionTitle || "Vision"}</h3>
              <p className="text-slate-400 whitespace-pre-wrap group-hover:text-slate-300 transition-colors">{heritage.vision}</p>
            </div>
            <div className="bg-[#151530]/60 backdrop-blur-md border border-purple-900/40 rounded-2xl p-8 hover:bg-[#1A1A3A]/80 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all duration-300 group">
              <Building className="w-10 h-10 text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-rose-400" />
              <h3 className="text-xl font-bold text-white mb-4">{heritage.missionTitle || "Mission"}</h3>
              <p className="text-slate-400 whitespace-pre-wrap group-hover:text-slate-300 transition-colors">{heritage.mission}</p>
            </div>
            <div className="bg-[#151530]/60 backdrop-blur-md border border-purple-900/40 rounded-2xl p-8 hover:bg-[#1A1A3A]/80 hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] transition-all duration-300 group">
              <Heart className="w-10 h-10 text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-violet-300" />
              <h3 className="text-xl font-bold text-white mb-4">{heritage.valuesTitle || "Core Values"}</h3>
              <p className="text-slate-400 whitespace-pre-wrap group-hover:text-slate-300 transition-colors">{heritage.values}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE CORPORATE TEAM */}
      <section className="relative py-32 bg-[#0F0F23]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-['Righteous',sans-serif] text-white tracking-wide mb-4">{initialSettings?.corporateRosterTitle || "Corporate Roster"}</h2>
            <p className="text-purple-400 font-mono text-sm uppercase tracking-[0.2em]">{initialSettings?.corporateRosterSubtitle || "Leadership & Engineering Core"}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member: { name: string; role: string; desc: string }, i: number) => (
              <motion.div 
                key={member.name}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative bg-[#13132B] border border-[#2A2A50] hover:border-rose-500 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] rounded-2xl p-6 overflow-hidden transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 rounded-full bg-[#1A1A3A] mb-6 border border-purple-900/50 flex items-center justify-center text-purple-300 font-bold text-xl shadow-[0_0_15px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] group-hover:border-rose-500/50 transition-all duration-300">
                  {(member.name || "?").charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-rose-100 transition-colors">{member.name}</h4>
                <p className="text-sm font-semibold text-rose-400 mb-4 tracking-wide">{member.role}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: GROUP BOOKINGS CONSOLE */}
      <section className="relative py-32 border-t border-purple-900/30 bg-[#0B0B1A]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-['Righteous',sans-serif] text-white tracking-wide mb-4">{initialSettings?.bookingsTitle || "Group Bookings Console"}</h2>
            <p className="text-violet-300">{initialSettings?.bookingsSubtitle || "Generate high-value inquiries for specialized corporate and VIP celebrations."}</p>
          </div>

          <div className="bg-[#13132B] border border-purple-900/40 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <Tabs defaultValue="corporate" className="w-full">
              <TabsList className="grid grid-cols-2 bg-[#0A0A18] p-2 rounded-2xl mb-8 border border-[#2A2A50]">
                <TabsTrigger value="corporate" className="rounded-xl data-[state=active]:bg-[#1D1D3D] data-[state=active]:text-purple-400 data-[state=active]:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all">Corporate Events</TabsTrigger>
                <TabsTrigger value="vip" className="rounded-xl data-[state=active]:bg-[#1D1D3D] data-[state=active]:text-rose-400 data-[state=active]:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all">VIP Birthdays</TabsTrigger>
              </TabsList>
              
              <div className="p-4 md:p-8">
                <TabsContent value="corporate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Corporate Excellence</h3>
                      <ul className="space-y-4 text-slate-300 mb-8">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Specialized family days</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Professional catering lists</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Venue privatization (InflataPark)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]"/> Custom on-site branding</li>
                      </ul>
                    </div>
                    <BookingForm type="Corporate" accentColor="purple" />
                  </div>
                </TabsContent>

                <TabsContent value="vip" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">VIP Celebrations</h3>
                      <ul className="space-y-4 text-slate-300 mb-8">
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Private sensory celebrations</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Themed Party Halls (Doha Mall)</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Custom cake setups</li>
                        <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"/> Interactive child-safe packages</li>
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
      <section className="relative py-32 bg-[#0F0F23] border-t border-[#2A2A50]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-['Righteous',sans-serif] text-white tracking-wide mb-6">{careers.title}</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (careers.description || "").replace(/(freelance event crew staffing|Lusail corporate office)/g, '<strong class="text-violet-300 font-semibold">$1</strong>') }}></p>
              <div className="bg-[#13132B] border border-purple-900/40 shadow-[0_5px_20px_rgba(0,0,0,0.2)] rounded-xl p-6">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  How we process CVs
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{careers.nlpText}</p>
              </div>
            </div>

            {/* Drag & Drop Panel */}
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-purple-400 bg-purple-900/10 scale-[1.02] shadow-[0_0_30px_rgba(124,58,237,0.15)]' : 'border-[#2A2A50] hover:border-purple-500/50 bg-[#13132B]/60'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadState === "idle" && (
                <div className="pointer-events-none">
                  <div className="w-20 h-20 mx-auto bg-[#1A1A3A] border border-purple-900/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <UploadCloud className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Drop your CV here</h3>
                  <p className="text-sm text-slate-400 mb-8">PDF, DOCX up to 10MB</p>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30 hover:text-white relative z-10 pointer-events-auto rounded-xl px-8 tracking-wide">
                    Browse Files
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      if(e.target.files?.length) simulateUpload();
                    }} />
                  </Button>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="py-8">
                  <div className="w-14 h-14 border-4 border-[#1A1A3A] border-t-purple-500 rounded-full animate-spin mx-auto mb-8 shadow-[0_0_15px_rgba(124,58,237,0.3)]"></div>
                  <p className="text-purple-400 font-mono text-sm tracking-widest animate-pulse">NLP Extracting Skills...</p>
                </div>
              )}

              {uploadState === "success" && (
                <div className="py-8">
                  <div className="w-20 h-20 bg-purple-900/30 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-purple-400 drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2 tracking-wide">Profile Ingested</h3>
                  <p className="text-sm text-slate-400">Added to E3 Talent Database</p>
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
  const focusRing = isRose ? "focus:ring-rose-500 focus:border-rose-500" : "focus:ring-purple-500 focus:border-purple-500";
  const successBg = isRose ? "bg-rose-900/10 border-rose-500/20" : "bg-purple-900/10 border-purple-500/20";
  const successText = isRose ? "text-rose-400" : "text-purple-400";
  const successIcon = isRose ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-purple-500 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]";

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${successBg} border rounded-2xl p-8 text-center shadow-lg`}
      >
        <CheckCircle2 className={`w-14 h-14 ${successIcon} mx-auto mb-6`} />
        <h4 className={`text-2xl font-['Righteous',sans-serif] tracking-wide ${successText} mb-3`}>Inquiry Received</h4>
        <p className="text-slate-300">Our {type.toLowerCase()} concierge will contact you within 24 hours.</p>
        <Button variant="outline" className={`mt-8 border-${accentColor}-500/30 ${successText} hover:bg-${accentColor}-900/20 rounded-xl px-6`} onClick={() => setStatus("idle")}>Submit Another</Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
          <Input required className={`bg-[#0A0A18] border-[#2A2A50] text-white ${focusRing} rounded-xl h-12 shadow-inner`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
          <Input required className={`bg-[#0A0A18] border-[#2A2A50] text-white ${focusRing} rounded-xl h-12 shadow-inner`} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
        <Input type="email" required className={`bg-[#0A0A18] border-[#2A2A50] text-white ${focusRing} rounded-xl h-12 shadow-inner`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Date</label>
        <Input type="date" required className={`bg-[#0A0A18] border-[#2A2A50] text-white ${focusRing} rounded-xl h-12 shadow-inner [color-scheme:dark]`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Guest Count</label>
        <Input type="number" min="10" required className={`bg-[#0A0A18] border-[#2A2A50] text-white ${focusRing} rounded-xl h-12 shadow-inner`} />
      </div>
      <Button type="submit" disabled={status === "submitting"} className={`w-full bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-['Righteous',sans-serif] tracking-wider text-lg h-14 rounded-xl mt-6 shadow-[0_10px_20px_rgba(244,63,94,0.2)] transition-all duration-300 hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)]`}>
        {status === "submitting" ? "Processing..." : "Submit Inquiry"} <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </form>
  );
}
