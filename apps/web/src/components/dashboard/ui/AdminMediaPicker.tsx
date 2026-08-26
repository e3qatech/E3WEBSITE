"use client"

import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { useLocale } from "@/components/layout/LocaleProvider"
import { usePathname } from "next/navigation"
import { uploadFile } from "@/lib/upload"
import { safeFetchJson } from "@/lib/utils"
import { Check, FileText, Image as ImageIcon, Trash2, UploadCloud, Video, Search, FileCode, Layers } from "lucide-react"
import { useEffect, useRef, useState, useMemo } from 'react'
import { AdminButton } from "./AdminButton"
import { SlideOver } from "./SlideOver"
import { resolveMediaType } from "@/lib/media-resolver"

interface Media {
  id: string
  url: string
  fileName?: string
  type: string
  alt: any
  metadata?: any
  size?: number
  mimeType?: string
}

interface AdminMediaPickerProps {
  value: string | null
  onChange: (url: string) => void
  label?: string
  accept?: string
  onUploadStatusChange?: (uploading: boolean) => void
}

function getMediaFileName(media: Media): string {
  if (media.fileName && media.fileName.trim()) return media.fileName;
  if (typeof media.alt === "object" && media.alt) {
    const altName = (media.alt as any).en || (media.alt as any).ar;
    if (altName && typeof altName === "string" && altName.trim() && !altName.startsWith("http")) {
      return altName;
    }
  }
  if (typeof media.alt === "string" && media.alt.trim() && !media.alt.startsWith("http")) {
    return media.alt;
  }
  if (media.metadata && typeof media.metadata === "object") {
    const metaName = (media.metadata as any).fileName || (media.metadata as any).originalName;
    if (metaName && typeof metaName === "string") return metaName;
  }
  if (media.url) {
    const cleaned = media.url.split("?")[0].split("/").pop();
    if (cleaned) return cleaned;
  }
  return "Media File";
}

export function AdminMediaPicker({ value, onChange, label, accept = "image/*", onUploadStatusChange }: AdminMediaPickerProps) {
  const pathname = usePathname()
  const { locale: contextLocale } = useLocale()
  const locale = pathname?.startsWith("/ar") ? "ar" : contextLocale || "en"
  const isAr = locale === "ar"

  const displayLabel = label !== undefined ? label : (isAr ? "الوسائط" : "Media")

  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [directUrl, setDirectUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bulkFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    // Reset error state on image change
    setImgError(false)
  }, [value])

  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return resolveMediaType({ url, explicitType: undefined }) === 'VIDEO';
  };

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/media?limit=250")
      const parsed = await safeFetchJson(res)
      if (parsed.ok && parsed.data?.data) {
        setMediaList(parsed.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
      setDirectUrl(value || "")
    }
  }, [isOpen, value])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v|mkv)$/i)
    const MAX_MB = isVideo ? 50 : 15

    if (file.size > MAX_MB * 1024 * 1024) {
      toast(
        isAr
          ? `فشل الرفع: الملف "${file.name}" (${fileSizeMB} ميغابايت) يتجاوز الحد الأقصى المسموح به (${MAX_MB} ميغابايت). يرجى ضغط الملف أو استخدام رابط مباشر.`
          : `Upload Failed: File "${file.name}" (${fileSizeMB}MB) exceeds maximum allowed size (${MAX_MB}MB). Please compress file or use a direct URL.`,
        "error"
      )
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    toast(
      isAr
        ? `جاري رفع "${file.name}" (${fileSizeMB} ميغابايت)...`
        : `Uploading "${file.name}" (${fileSizeMB}MB)...`,
      "info"
    )
    setUploading(true)
    onUploadStatusChange?.(true)
    try {
      const { url, fileName } = await uploadFile(file, "cms_media")
      
      let mediaType = "IMAGE"
      if (isVideo) mediaType = "VIDEO"
      else if (file.type.includes("pdf") || file.name.match(/\.(pdf|doc|docx)$/i)) mediaType = "DOCUMENT"
      else if (file.name.match(/\.(glb|gltf)$/i)) mediaType = "MODEL_3D"

      const res = await fetch("/api/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          type: mediaType,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          name: fileName
        })
      })

      const data = await res.json().catch(() => null);
      const finalUrl = data?.url || url;

      if (finalUrl && !finalUrl.startsWith('blob:') && !finalUrl.startsWith('file:')) {
        const newMediaItem: Media = {
          id: data?.id || finalUrl,
          url: finalUrl,
          fileName: fileName || file.name,
          type: mediaType,
          alt: fileName || file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream"
        };

        setMediaList(prev => [newMediaItem, ...prev]);
        onChange(finalUrl);
        
        toast(
          isAr
            ? `تم رفع ونشر الملف "${fileName}" بنجاح!`
            : `Media "${fileName}" uploaded & published successfully!`,
          "success"
        );
        setIsOpen(false);
      } else {
        throw new Error(isAr ? "أرجع مزود التخزين رابطاً مؤقتاً غير صالح." : "Storage provider returned an invalid temporary URL.");
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      const msg = err?.message || (isAr ? "فشل رفع الملف." : "Failed to upload file.")
      toast(isAr ? `خطأ أثناء الرفع: ${msg}` : `Upload Error: ${msg}`, "error")
    } finally {
      setUploading(false)
      onUploadStatusChange?.(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Bulk Upload Handler for Multi-File Upload to Library
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setBulkUploading(true);
    onUploadStatusChange?.(true);

    toast(
      isAr
        ? `جاري رفع مجموعة من ${fileArray.length} ملفات إلى المكتبة...`
        : `Uploading batch of ${fileArray.length} files to library...`,
      "info"
    );

    const newlyUploaded: Media[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const { url, fileName } = await uploadFile(file, "cms_media");

        let mediaType = "IMAGE";
        if (file.type.startsWith("video/")) mediaType = "VIDEO";
        else if (file.type.includes("pdf") || file.name.match(/\.(pdf|doc|docx)$/i)) mediaType = "DOCUMENT";
        else if (file.name.match(/\.(glb|gltf)$/i)) mediaType = "MODEL_3D";

        const res = await fetch("/api/cms/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            type: mediaType,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            name: fileName || file.name,
          }),
        });

        const data = await res.json().catch(() => null);
        const finalUrl = data?.url || url;

        if (finalUrl && !finalUrl.startsWith("blob:") && !finalUrl.startsWith("file:")) {
          const item: Media = {
            id: data?.id || finalUrl,
            url: finalUrl,
            fileName: fileName || file.name,
            type: mediaType,
            alt: fileName || file.name,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
          };
          newlyUploaded.push(item);
        }
      } catch (itemErr) {
        console.error(`Bulk upload failed for ${file.name}:`, itemErr);
      }
    }

    if (newlyUploaded.length > 0) {
      setMediaList((prev) => [...newlyUploaded, ...prev]);
      if (!value && newlyUploaded[0]) {
        onChange(newlyUploaded[0].url);
      }
      toast(
        isAr
          ? `تم رفع ${newlyUploaded.length} ملف بنجاح إلى المكتبة!`
          : `Successfully uploaded ${newlyUploaded.length} files to media library!`,
        "success"
      );
    } else {
      toast(isAr ? "فشل رفع الملفات." : "Failed to upload files.", "error");
    }

    setBulkUploading(false);
    onUploadStatusChange?.(false);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  const handleSelect = (url: string) => {
    onChange(url)
    setIsOpen(false)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const confirmDeleteMsg = isAr
      ? "هل أنت متأكد من رغبتك في حذف هذا الملف من الوسائط؟ لا يمكن التراجع عن هذا الإجراء."
      : "Are you sure you want to delete this media? This cannot be undone."
    if (!confirm(confirmDeleteMsg)) return
    
    try {
      const mediaToDelete = mediaList.find(m => m.id === id)
      setMediaList(prev => prev.filter(m => m.id !== id))
      if (mediaToDelete && mediaToDelete.url === value) {
        onChange("")
      }
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" })
      toast(isAr ? "تم حذف الملف" : "Media deleted", "info")
    } catch (err) {
      console.error(err)
      toast(isAr ? "فشل حذف الملف" : "Failed to delete media", "error")
      fetchMedia()
    }
  }

  const filteredMediaList = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase();
    return mediaList.filter((m) => {
      const name = getMediaFileName(m).toLowerCase();
      const url = (m.url || "").toLowerCase();
      return name.includes(q) || url.includes(q);
    });
  }, [mediaList, searchQuery]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {displayLabel && <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{displayLabel}</span>}
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        accept={accept}
        disabled={uploading}
      />

      {/* Main Media Preview Container */}
      {value ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-default)] group bg-[var(--surface-default)] aspect-video flex items-center justify-center shadow-sm cursor-pointer"
        >
          {isVideoUrl(value) ? (
            <video src={value} className="w-full h-full object-cover" controls autoPlay loop muted playsInline />
          ) : value.match(/\.(pdf|doc)$/i) ? (
            <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
          ) : imgError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 bg-[var(--bg-level-1)] text-[var(--text-secondary)] w-full h-full">
              <ImageIcon className="w-8 h-8 text-sky-400/80 animate-pulse" />
              <span className="text-xs font-mono break-all line-clamp-2 px-2">{value}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                {isAr ? "تم تعيين رابط الوسائط" : "Media Link Set"}
              </span>
            </div>
          ) : (
            <img
              src={value}
              alt="Selected Media"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <AdminButton 
                type="button" 
                variant="primary" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                {isAr ? "رفع ملف جديد" : "Upload New File"}
              </AdminButton>
              <AdminButton 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              >
                {isAr ? "المكتبة / الرابط" : "Library / URL"}
              </AdminButton>
              <AdminButton 
                type="button" 
                variant="danger" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                {isAr ? "إزالة" : "Remove"}
              </AdminButton>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              {isAr ? "انقر على الصورة لرفع ملف جديد من جهازك" : "Click image to upload new file from computer"}
            </span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group bg-[var(--surface-hover)]/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-sm font-bold text-[var(--text-primary)] block">
              {uploading 
                ? (isAr ? "جاري رفع الملف..." : "Uploading file...") 
                : accept.includes("image") && !accept.includes("video") 
                  ? (isAr ? "انقر لرفع ملف صورة" : "Click to Upload Image File") 
                  : accept.includes("video") && !accept.includes("image") 
                    ? (isAr ? "انقر لرفع ملف فيديو" : "Click to Upload Video File") 
                    : (isAr ? "انقر لرفع ملف من جهازك" : "Click to Upload Local File")}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] block">
              {isAr
                ? "اختر ملف صورة أو فيديو من جهازك"
                : "Select image or video from your computer or device"}
            </span>
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع ملف" : "Upload File")}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          {isAr ? "المكتبة / لصق الرابط" : "Library / Paste URL"}
        </button>
      </div>

      <SlideOver isOpen={isOpen} onClose={() => setIsOpen(false)} title={isAr ? "مكتبة الوسائط" : "Media Library"}>
        <div className="flex flex-col gap-6" dir={isAr ? "rtl" : "ltr"}>
          {/* Direct URL Input Bar */}
          <div className="p-4 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isAr ? "إدخال رابط الوسائط المباشر" : "Direct Media URL Input"}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isAr ? "الصق رابط الفيديو أو الصورة (مثال: https://.../video.mp4)" : "Paste video/image URL (e.g. https://.../video.mp4)"}
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                className="flex-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!directUrl.trim()) return
                  onChange(directUrl.trim())
                  toast(isAr ? "تم تطبيق رابط الوسائط المباشر" : "Applied direct media URL", "success")
                  setIsOpen(false)
                }}
              >
                {isAr ? "تطبيق الرابط" : "Apply URL"}
              </AdminButton>
            </div>
          </div>

          {/* Search and Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder={isAr ? "البحث بالاسم أو الرابط..." : "Search by file name or URL..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl py-2 ps-8 pe-3 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                onChange={handleUpload}
                accept={accept}
                disabled={uploading || bulkUploading}
              />
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleBulkUpload}
                accept={accept}
                disabled={uploading || bulkUploading}
              />

              <AdminButton 
                variant="primary" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || bulkUploading}
              >
                {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع ملف جديد" : "Upload New File")}
              </AdminButton>

              <button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={uploading || bulkUploading}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title={isAr ? "رفع عدة ملفات دفعة واحدة" : "Bulk upload multiple files to library"}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{bulkUploading ? (isAr ? "جاري الرفع المتعدد..." : "Bulk Uploading...") : (isAr ? "رفع متعدد" : "Bulk Upload")}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-[var(--text-tertiary)] text-sm font-bold">
              {isAr ? "جاري تحميل المكتبة..." : "Loading library..."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredMediaList.map((media) => {
                const fileName = getMediaFileName(media);
                return (
                  <div 
                    key={media.id}
                    onClick={() => handleSelect(media.url)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col justify-between ${value === media.url ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30' : 'border-[var(--border-default)] hover:border-purple-500/80 shadow-xs hover:shadow-md'}`}
                  >
                    <div className="w-full h-full bg-[var(--surface-default)] flex items-center justify-center p-2">
                      {media.type === 'VIDEO' || isVideoUrl(media.url) ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 rounded-lg overflow-hidden">
                          <Video className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                          <span className="text-xs font-mono text-[var(--text-tertiary)] truncate w-full text-center px-1">
                            {fileName}
                          </span>
                        </div>
                      ) : media.type === 'DOCUMENT' ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          <FileText className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                          <span className="text-xs font-mono text-[var(--text-tertiary)] truncate w-full text-center">{fileName}</span>
                        </div>
                      ) : (
                        <img src={media.url} alt={fileName} className="w-full h-full object-contain" />
                      )}
                    </div>

                    {/* Bottom File Name Bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-neutral-950/90 backdrop-blur-md p-1.5 flex items-center gap-1 text-[10px] font-mono text-zinc-300 truncate" title={fileName}>
                      <FileCode className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">{fileName}</span>
                    </div>

                    {value === media.url && (
                      <div className="absolute top-2 end-2 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-md z-10">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, media.id)}
                      className="absolute top-2 start-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      title={isAr ? "حذف الملف" : "Delete Media"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              
              {filteredMediaList.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-xl">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-bold">{isAr ? "لا توجد وسائط" : "No media found"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SlideOver>
    </div>
  )
}
