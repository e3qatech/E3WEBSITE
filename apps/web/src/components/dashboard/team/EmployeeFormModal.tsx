"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

export function EmployeeFormModal({ isOpen, onClose, employee, onSuccess }: { isOpen: boolean; onClose: () => void; employee: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? "Edit Team Member" : "Add Team Member"} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">First Name</label>
            <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Last Name</label>
            <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Slug (URL)</label>
            <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. john-doe" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Department</label>
            <Input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Designation</label>
            <Input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Years of Exp</label>
            <Input type="number" required value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Profile Image URL</label>
          <Input value={formData.profileImage} onChange={e => setFormData({...formData, profileImage: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Tagline</label>
          <Input required value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">About Summary</label>
          <textarea 
            required 
            className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-white min-h-[100px]"
            value={formData.aboutSummary} 
            onChange={e => setFormData({...formData, aboutSummary: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">LinkedIn URL</label>
            <Input value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Contact Email</label>
            <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          </div>
        </div>

        {/* JSON Fields */}
        <div className="border-t border-[var(--border-default)] pt-4 mt-6">
          <h3 className="text-lg font-bold mb-4">Advanced Data (JSON Arrays)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Expertise Tags (e.g. ["Event Design", "Logistics"])</label>
              <Input value={formData.expertiseTags} onChange={e => setFormData({...formData, expertiseTags: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Experience Timeline (JSON Array of objects)</label>
              <textarea className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-white font-mono text-xs min-h-[100px]" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Projects Portfolio (JSON Array of objects)</label>
              <textarea className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-white font-mono text-xs min-h-[100px]" value={formData.projects} onChange={e => setFormData({...formData, projects: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
          <label htmlFor="isActive" className="text-sm font-bold">Active & Visible</label>
        </div>

        <div className="pt-6 border-t border-[var(--border-default)] flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
