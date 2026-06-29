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

  const team = (initialSettings?.team && initialSettings.team.length > 0) ? initialSettings.team : [
    { name: "Abdullah Al Kubaisi", role: "Chairman", desc: "National alignment & strategic partnerships." },
    { name: "Adil Ahmed", role: "Managing Director & CEO", desc: "Global resources & operations." },
    { name: "Mohammad Ali Awada", role: "General Manager", desc: "Directing physical landmark properties." },
    { name: "Ebrahim Karolia", role: "Sr. Project Manager", desc: "AV rigging, fabrication, custom builds." }
  ];

  const hero = {
    titleEn: "The \"Wow & How\" Philosophy",
    titleAr: "فلسفة الإبهار والتميز",
    subtitleEn: "Fusing the physical \"Wow\" of immersive entertainment with the transparent operational \"How\" of Qatari execution engineering.",
    subtitleAr: "نجمع بين الإبهار المادي للترفيه الغامر والتميز الهندسي لدولة قطر",
    mediaType: "ORBS",
    mediaUrl: "",
    ...(initialSettings?.hero || {})
  };

  const heritage = {
    title: "Our Heritage",
    description: "Deeply rooted in Qatar, E3 has delivered the nation's most iconic tourist landmarks. From the Guinness-certified 1,055-meter InflataRun track to the Doha Balloon Parade hosting over 760,000 attendees, our legacy is built on monumental execution.",
    vision: "Delivering results-oriented marketing programs and interactive FECs globally.",
    mission: "Inspiring fun and everlasting memories through groundbreaking live events.",
    values: "Honesty, direct relationships, and unyielding commitment to delivering on promises.",
    ...(initialSettings?.heritage || {})
  };

  const careers = {
    title: "Join the Crew",
    description: "E3 is expanding. We are currently actively seeking freelance event crew staffing and scaling our Lusail corporate office.",
    nlpText: "Our automated NLP system extracts structural skills (AV logistics, rigging, etc.) and pushes them directly to our Talent database.",
    ...(initialSettings?.careers || {})
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 overflow-x-hidden relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        
        {/* Background Media */}
        {hero.mediaType === "ORBS" && (
          <>
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]"></div>
          </>
        )}
        {hero.mediaType === "IMAGE" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <img src={hero.mediaUrl} alt="Hero Background" className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "VIDEO" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <video src={hero.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
        )}
        {hero.mediaType === "IFRAME" && hero.mediaUrl && (
          <div className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none">
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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-zinc-100 to-zinc-500">
              {locale === 'ar' ? hero.titleAr : hero.titleEn}
            </h1>
            <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light whitespace-pre-wrap">
              {locale === 'ar' ? hero.subtitleAr : hero.subtitleEn}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: E3 STORY & HERITAGE */}
      <section className="relative py-32 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">{heritage.title}</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (heritage.description || "").replace(/(InflataRun track|Doha Balloon Parade)/g, '<strong class="text-zinc-200 font-medium">$1</strong>') }}></p>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-900 opacity-50 group-hover:opacity-30 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-zinc-700 font-mono text-sm tracking-widest uppercase">E3 Archives</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-900/80 transition-colors">
              <Target className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Vision</h3>
              <p className="text-zinc-400 whitespace-pre-wrap">{heritage.vision}</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-900/80 transition-colors">
              <Building className="w-10 h-10 text-teal-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Mission</h3>
              <p className="text-zinc-400 whitespace-pre-wrap">{heritage.mission}</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-900/80 transition-colors">
              <Heart className="w-10 h-10 text-zinc-300 mb-6" />
              <h3 className="text-xl font-bold mb-4">Core Values</h3>
              <p className="text-zinc-400 whitespace-pre-wrap">{heritage.values}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE CORPORATE TEAM */}
      <section className="relative py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Corporate Roster</h2>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Leadership & Engineering Core</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member: { name: string; role: string; desc: string }, i: number) => (
              <motion.div 
                key={member.name}
                whileHover={{ y: -5, rotate: i % 2 === 0 ? 1 : -1 }}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-full bg-zinc-800 mb-6 border border-zinc-700 flex items-center justify-center text-zinc-600 font-bold">
                  {(member.name || "?").charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-zinc-100">{member.name}</h4>
                <p className="text-sm font-medium text-emerald-400 mb-4">{member.role}</p>
                <p className="text-sm text-zinc-400">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: GROUP BOOKINGS CONSOLE */}
      <section className="relative py-32 border-t border-zinc-900 bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Group Bookings Console</h2>
            <p className="text-zinc-400">Generate high-value inquiries for specialized corporate and VIP celebrations.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-2 shadow-2xl">
            <Tabs defaultValue="corporate" className="w-full">
              <TabsList className="grid grid-cols-2 bg-zinc-950/50 p-2 rounded-2xl mb-8">
                <TabsTrigger value="corporate" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">Corporate Events</TabsTrigger>
                <TabsTrigger value="vip" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-teal-400">VIP Birthdays</TabsTrigger>
              </TabsList>
              
              <div className="p-4 md:p-8">
                <TabsContent value="corporate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Corporate Excellence</h3>
                      <ul className="space-y-3 text-zinc-400 mb-8">
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Specialized family days</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Professional catering lists</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Venue privatization (InflataPark)</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Custom on-site branding</li>
                      </ul>
                    </div>
                    <BookingForm type="Corporate" />
                  </div>
                </TabsContent>

                <TabsContent value="vip" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">VIP Celebrations</h3>
                      <ul className="space-y-3 text-zinc-400 mb-8">
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Private sensory celebrations</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Themed Party Halls (Doha Mall)</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Custom cake setups</li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Interactive child-safe packages</li>
                      </ul>
                    </div>
                    <BookingForm type="VIP" />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* SECTION 5: CAREERS & AI CV UPLOADER */}
      <section className="relative py-32 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">{careers.title}</h2>
              <p className="text-zinc-400 text-lg mb-8 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (careers.description || "").replace(/(freelance event crew staffing|Lusail corporate office)/g, '<strong class="text-zinc-200 font-medium">$1</strong>') }}></p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h4 className="font-bold text-zinc-100 mb-2">How we process CVs</h4>
                <p className="text-sm text-zinc-500 whitespace-pre-wrap">{careers.nlpText}</p>
              </div>
            </div>

            {/* Drag & Drop Panel */}
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-colors ${dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadState === "idle" && (
                <div className="pointer-events-none">
                  <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <UploadCloud className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Drop your CV here</h3>
                  <p className="text-sm text-zinc-500 mb-6">PDF, DOCX up to 10MB</p>
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 relative z-10 pointer-events-auto">
                    Browse Files
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      if(e.target.files?.length) simulateUpload();
                    }} />
                  </Button>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="py-8">
                  <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-emerald-500 font-mono text-sm animate-pulse">NLP Extracting Skills...</p>
                </div>
              )}

              {uploadState === "success" && (
                <div className="py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-500 mb-2">Profile Ingested</h3>
                  <p className="text-sm text-zinc-400">Added to E3 Talent Database</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BookingForm({ type }: { type: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1500);
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-emerald-400 mb-2">Inquiry Received</h4>
        <p className="text-zinc-400">Our {type.toLowerCase()} concierge will contact you within 24 hours.</p>
        <Button variant="outline" className="mt-6 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => setStatus("idle")}>Submit Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
          <Input required className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
          <Input required className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
        <Input type="email" required className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Preferred Date</label>
        <Input type="date" required className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500 [color-scheme:dark]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Guest Count</label>
        <Input type="number" min="10" required className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500" />
      </div>
      <Button type="submit" disabled={status === "submitting"} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-bold mt-4">
        {status === "submitting" ? "Processing..." : "Submit Inquiry"} <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
