"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, User, Image as ImageIcon, Code, LayoutDashboard } from "lucide-react";
import { MediaUploader } from "@/components/shared/MediaUploader";

type Tab = "basic" | "media" | "advanced";

export function EmployeeFormModal({ isOpen, onClose, employee, onSuccess }: { isOpen: boolean; onClose: () => void; employee: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    slug: "",
    designation: "",
    department: "",
    yearsOfExperience: 0,
    tagline: "",
    profileImage: "",
    aboutSummary: "",
    careerJourney: "",
    keyStrengths: "",
    expertiseTags: "[]",
    coreCompetencies: "[]",
    experience: "[]",
    projects: "[]",
    certifications: "[]",
    education: "[]",
    awards: "[]",
    skillsMatrix: "[]",
    mediaGallery: "[]",
    testimonials: "[]",
    contactEmail: "",
    linkedinUrl: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        expertiseTags: JSON.stringify(employee.expertiseTags || []),
        coreCompetencies: JSON.stringify(employee.coreCompetencies || []),
        experience: JSON.stringify(employee.experience || []),
        projects: JSON.stringify(employee.projects || []),
        certifications: JSON.stringify(employee.certifications || []),
        education: JSON.stringify(employee.education || []),
        awards: JSON.stringify(employee.awards || []),
        skillsMatrix: JSON.stringify(employee.skillsMatrix || []),
        mediaGallery: JSON.stringify(employee.mediaGallery || []),
        testimonials: JSON.stringify(employee.testimonials || []),
      });
    } else {
      setFormData({
        firstName: "", lastName: "", slug: "", designation: "", department: "", yearsOfExperience: 0, tagline: "", profileImage: "",
        aboutSummary: "", careerJourney: "", keyStrengths: "", expertiseTags: "[]", coreCompetencies: "[]", experience: "[]",
        projects: "[]", certifications: "[]", education: "[]", awards: "[]", skillsMatrix: "[]", mediaGallery: "[]", testimonials: "[]",
        contactEmail: "", linkedinUrl: "", isActive: true, order: 0,
      });
    }
    setActiveTab("basic");
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      yearsOfExperience: parseInt(formData.yearsOfExperience.toString()),
      order: parseInt(formData.order.toString()),
      expertiseTags: JSON.parse(formData.expertiseTags),
      coreCompetencies: JSON.parse(formData.coreCompetencies),
      experience: JSON.parse(formData.experience),
      projects: JSON.parse(formData.projects),
      certifications: JSON.parse(formData.certifications),
      education: JSON.parse(formData.education),
      awards: JSON.parse(formData.awards),
      skillsMatrix: JSON.parse(formData.skillsMatrix),
      mediaGallery: JSON.parse(formData.mediaGallery),
      testimonials: JSON.parse(formData.testimonials),
    };

    try {
      const res = await fetch(employee ? `/api/employees/${employee.id}` : `/api/employees`, {
        method: employee ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? "Edit Team Member" : "Add Team Member"} size="xl">
      <div className="flex flex-col md:flex-row max-h-[85vh] overflow-hidden bg-zinc-950/50 backdrop-blur-xl">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-e border-zinc-800/50 bg-zinc-900/30 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Sections</div>
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "basic" 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <User className="w-4 h-4" /> Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "media" 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Media & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("advanced")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "advanced" 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <Code className="w-4 h-4" /> Advanced Data
          </button>

          <div className="mt-auto pt-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 accent-amber-500" 
              />
              <label htmlFor="isActive" className="text-sm font-bold text-zinc-300 cursor-pointer">Profile Active</label>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === "basic" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">First Name</label>
                    <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-zinc-900/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Last Name</label>
                    <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-zinc-900/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Slug (URL)</label>
                    <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. john-doe" className="bg-zinc-900/50 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Department</label>
                    <Input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="bg-zinc-900/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Designation</label>
                    <Input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="bg-zinc-900/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Years of Exp</label>
                    <Input type="number" required value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} className="bg-zinc-900/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">LinkedIn URL</label>
                    <Input value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} className="bg-zinc-900/50" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Contact Email</label>
                    <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="bg-zinc-900/50" placeholder="hello@example.com" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-end-4 duration-300">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Profile Portrait / Video</label>
                  <MediaUploader 
                    value={formData.profileImage} 
                    onChange={url => setFormData({...formData, profileImage: url})} 
                    accept="image/*,video/*"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Upload a high-res portrait image or a short looping video (.mp4).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Hero Tagline</label>
                  <Input required value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="bg-zinc-900/50" placeholder="Visionary leader with 20+ years of experience..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">About Summary (Bio)</label>
                  <textarea 
                    required 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 min-h-[150px] focus:outline-none focus:border-amber-500/50 transition-colors"
                    value={formData.aboutSummary} 
                    onChange={e => setFormData({...formData, aboutSummary: e.target.value})}
                    placeholder="Write a detailed professional summary..."
                  />
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-300">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <h4 className="text-amber-500 font-bold text-sm mb-1">JSON Array Formatting</h4>
                  <p className="text-xs text-zinc-400">These fields accept strict JSON arrays. Ensure they are valid or the save will fail.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex justify-between">
                    <span>Expertise Tags</span>
                    <span className="text-zinc-600 normal-case font-mono">e.g. ["Events", "Logistics"]</span>
                  </label>
                  <Input value={formData.expertiseTags} onChange={e => setFormData({...formData, expertiseTags: e.target.value})} className="bg-zinc-900/50 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex justify-between">
                    <span>Experience Timeline</span>
                    <span className="text-zinc-600 normal-case font-mono">[{"{"} "role": "...", "company": "..." {"}"}]</span>
                  </label>
                  <textarea className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 font-mono text-xs min-h-[120px] focus:outline-none focus:border-amber-500/50 transition-colors" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex justify-between">
                    <span>Projects Portfolio</span>
                    <span className="text-zinc-600 normal-case font-mono">[{"{"} "name": "...", "role": "..." {"}"}]</span>
                  </label>
                  <textarea className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 font-mono text-xs min-h-[120px] focus:outline-none focus:border-amber-500/50 transition-colors" value={formData.projects} onChange={e => setFormData({...formData, projects: e.target.value})} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-zinc-800/50 bg-zinc-900/30 flex justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-zinc-800 text-zinc-400">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black tracking-wide px-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
