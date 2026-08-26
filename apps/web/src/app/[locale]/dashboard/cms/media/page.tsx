"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "@/components/dashboard/ui/AdminButton";
import { SlideOver } from "@/components/dashboard/ui/SlideOver";
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Trash2, 
  Upload, 
  UploadCloud, 
  ExternalLink, 
  Box, 
  Grid, 
  List, 
  Copy, 
  Search, 
  Calendar, 
  HardDrive, 
  Link as LinkIcon, 
  CheckCircle2, 
  X, 
  FileCode,
  Layers,
  AlertCircle,
  Check
} from "lucide-react";
import { uploadFile } from "@/lib/upload";

interface Media {
  id: string;
  url: string;
  fileName?: string;
  type: string;
  alt?: any;
  metadata?: any;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface QueuedUploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  url?: string;
}

const TYPE_ICONS: Record<string, any> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  MODEL_3D: Box,
};

function getMediaFileName(media: Media): string {
  if (media.fileName && media.fileName.trim()) return media.fileName;
  if (typeof media.alt === "object" && media.alt) {
    const altName = media.alt.en || media.alt.ar;
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

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<QueuedUploadItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueProgress, setQueueProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/media?limit=250");
      const json = await res.json();
      if (json.data) {
        setMediaList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Handle Quick Upload from Header
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      // If user selected multiple files via quick upload, route to Bulk Upload modal
      addFilesToQueue(Array.from(files));
      setIsBulkModalOpen(true);
      if (e.target) e.target.value = "";
      return;
    }

    const singleFile = files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("files", singleFile);

    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setMediaList((prev) => [...data.data, ...prev]);
      } else if (data.url) {
        setMediaList((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Bulk Upload Queue Management
  const addFilesToQueue = (files: File[]) => {
    const newItems: QueuedUploadItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addFilesToQueue(Array.from(files));
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files));
    }
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompletedOrAll = () => {
    if (isProcessingQueue) return;
    setUploadQueue([]);
    setQueueProgress({ completed: 0, total: 0, percent: 0 });
  };

  const processBulkUpload = async () => {
    const pendingItems = uploadQueue.filter((item) => item.status === "pending" || item.status === "error");
    if (pendingItems.length === 0) return;

    setIsProcessingQueue(true);
    const total = pendingItems.length;
    let completed = 0;
    const newlyCreatedMedia: Media[] = [];

    for (const item of pendingItems) {
      // Mark as uploading
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 20 } : q))
      );

      try {
        // Use smart uploadFile helper (with compression & blob direct handling)
        const uploadResult = await uploadFile(item.file, "cms_media");

        let mediaType = "IMAGE";
        if (item.file.type.startsWith("video/")) mediaType = "VIDEO";
        else if (item.file.type.includes("pdf") || item.file.name.match(/\.(pdf|doc|docx)$/i)) mediaType = "DOCUMENT";
        else if (item.file.name.match(/\.(glb|gltf)$/i)) mediaType = "MODEL_3D";

        // Register media in database
        const registerRes = await fetch("/api/cms/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploadResult.url,
            type: mediaType,
            mimeType: item.file.type || "application/octet-stream",
            size: item.file.size,
            name: uploadResult.fileName || item.file.name,
          }),
        });

        const registeredData = await registerRes.json();
        const finalMediaRecord: Media = {
          id: registeredData.id || uploadResult.url,
          url: uploadResult.url,
          fileName: uploadResult.fileName || item.file.name,
          type: mediaType,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size,
          createdAt: new Date().toISOString(),
        };

        newlyCreatedMedia.push(finalMediaRecord);

        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "success", progress: 100, url: uploadResult.url }
              : q
          )
        );
      } catch (err: any) {
        console.error(`Error uploading ${item.name}:`, err);
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: err?.message || "Upload failed" }
              : q
          )
        );
      }

      completed++;
      setQueueProgress({
        completed,
        total,
        percent: Math.round((completed / total) * 100),
      });
    }

    if (newlyCreatedMedia.length > 0) {
      setMediaList((prev) => [...newlyCreatedMedia, ...prev]);
    }

    setIsProcessingQueue(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media file?")) return;
    try {
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setSelectedMedia(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async (text: string, type: "url" | "name") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      const fileName = getMediaFileName(m);
      const matchesType = filterType === "ALL" || m.type === filterType;
      const matchesSearch =
        fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.mimeType || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [mediaList, filterType, searchQuery]);

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title="Global Media Library"
        description="Centralized asset repository for images, video footage, 3D models, documents, and web posters."
        breadcrumbs={[
          { label: "Global Media", href: "/dashboard/cms/media" },
          { label: "Media Library" },
        ]}
        badge={{ label: `${mediaList.length} Assets`, variant: "purple" }}
        primaryAction={{
          label: isProcessingQueue ? "Uploading Bulk..." : "Bulk Upload",
          onClick: () => setIsBulkModalOpen(true),
          isLoading: isProcessingQueue,
          icon: <UploadCloud className="w-4 h-4" />,
        }}
        secondaryAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => document.getElementById("media-upload-quick")?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Single Upload"}</span>
            </button>

            <div className="flex bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      <input
        type="file"
        id="media-upload-quick"
        multiple
        className="hidden"
        onChange={handleQuickUpload}
        disabled={uploading}
      />

      {/* Filter and Search Bar */}
      <div className="px-8 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-level-1)]">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {["ALL", "IMAGE", "VIDEO", "DOCUMENT", "MODEL_3D"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap cursor-pointer ${
                filterType === type 
                  ? "bg-[var(--text-primary)] text-[var(--bg-base)]" 
                  : "bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {type === "MODEL_3D" ? "3D Models" : type}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search by file name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-full py-2 ps-9 pe-4 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-2xl bg-[var(--surface-default)]/30 p-8 text-center">
            <ImageIcon className="w-12 h-12 mb-3 opacity-30 text-purple-400" />
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">No media files found</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Upload new media or bulk upload files to your library.</p>
            <AdminButton 
              variant="primary" 
              size="sm" 
              onClick={() => setIsBulkModalOpen(true)}
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Open Bulk Upload
            </AdminButton>
          </div>
        ) : (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((media) => {
                const Icon = TYPE_ICONS[media.type] || FileText;
                const fileName = getMediaFileName(media);

                return (
                  <div 
                    key={media.id} 
                    onClick={() => setSelectedMedia(media)}
                    className="group relative aspect-square bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden hover:border-purple-500/80 cursor-pointer transition-all hover:shadow-xl flex flex-col justify-between"
                  >
                    {/* Media Thumbnail */}
                    <div className="w-full h-full relative overflow-hidden bg-neutral-950/40 flex items-center justify-center">
                      {media.type === 'IMAGE' ? (
                        <img 
                          src={media.url} 
                          alt={fileName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : media.type === 'VIDEO' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                          <Video className="w-10 h-10 text-purple-400 opacity-80" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--surface-hover)]">
                          <Icon className="w-10 h-10 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors" />
                        </div>
                      )}

                      {/* Top Type Badge */}
                      <div className="absolute top-2 start-2 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300 backdrop-blur-md">
                          {media.type}
                        </span>
                      </div>
                    </div>

                    {/* Bottom File Name Card Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent p-2.5 pt-6 flex flex-col justify-end transition-all">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate" title={fileName}>
                        <FileCode className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                        <span className="truncate">{fileName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-0.5">
                        <span>{formatBytes(media.size)}</span>
                        <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--surface-hover)] text-xs uppercase text-[var(--text-secondary)] font-mono">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Preview</th>
                    <th className="px-6 py-4 font-bold tracking-wider">File Name</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Type / MIME</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Size</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredMedia.map((media) => {
                    const Icon = TYPE_ICONS[media.type] || FileText;
                    const fileName = getMediaFileName(media);

                    return (
                      <tr 
                        key={media.id} 
                        className="hover:bg-[var(--surface-hover)]/50 transition-colors cursor-pointer" 
                        onClick={() => setSelectedMedia(media)}
                      >
                        <td className="px-6 py-3 w-20">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden border border-[var(--border-default)] flex items-center justify-center">
                            {media.type === 'IMAGE' ? (
                              <img src={media.url} alt={fileName} className="w-full h-full object-cover" />
                            ) : (
                              <Icon className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[var(--text-primary)] flex items-center gap-2 max-w-md truncate" title={fileName}>
                            <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">{fileName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)] truncate block max-w-sm">
                            {media.url}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                            <Icon className="w-3.5 h-3.5 text-purple-400" />
                            {media.mimeType || media.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-[var(--text-secondary)]">{formatBytes(media.size)}</td>
                        <td className="px-6 py-4 text-xs font-mono text-[var(--text-tertiary)]">{new Date(media.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Bulk Upload Drawer / Modal */}
      <SlideOver
        isOpen={isBulkModalOpen}
        onClose={() => {
          if (!isProcessingQueue) setIsBulkModalOpen(false);
        }}
        title="Bulk Media Upload"
      >
        <div className="space-y-6 pb-12">
          <p className="text-xs text-[var(--text-secondary)]">
            Upload multiple images, videos, documents, or 3D models at once. Files will be stored in cloud object storage and added directly to your media library with their original file names preserved.
          </p>

          {/* Drag & Drop Upload Zone */}
          <div
            ref={dropzoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => bulkFileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              isDragging 
                ? "border-purple-500 bg-purple-500/10 scale-[0.99]" 
                : "border-purple-500/40 bg-[var(--surface-default)] hover:border-purple-500 hover:bg-purple-500/5"
            }`}
          >
            <input
              ref={bulkFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleBulkFilesSelect}
              accept="image/*,video/*,application/pdf,.glb,.gltf"
              disabled={isProcessingQueue}
            />
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8 animate-bounce" />
            </div>
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-[var(--text-primary)] block">
                Click to browse or Drag & Drop Multiple Files
              </span>
              <span className="text-xs text-[var(--text-tertiary)] block">
                Supports Images, MP4 Videos, PDFs, Word DOCX, and 3D GLB/GLTF assets
              </span>
            </div>
          </div>

          {/* Upload Queue Table */}
          {uploadQueue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Upload Queue ({uploadQueue.length} files)
                  </span>
                </div>
                {!isProcessingQueue && (
                  <button
                    type="button"
                    onClick={clearCompletedOrAll}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Progress Summary if active */}
              {isProcessingQueue && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>Uploading Batch: {queueProgress.completed} of {queueProgress.total} completed</span>
                    <span>{queueProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${queueProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* List of queued items */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-[var(--border-default)] bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl p-3">
                {uploadQueue.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[var(--text-primary)] truncate block" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {formatBytes(item.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "pending" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300">
                          Pending
                        </span>
                      )}
                      {item.status === "uploading" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900/60 text-purple-300 animate-pulse flex items-center gap-1">
                          Uploading...
                        </span>
                      )}
                      {item.status === "success" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/30 text-red-400 flex items-center gap-1" title={item.error}>
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}

                      {!isProcessingQueue && item.status !== "uploading" && (
                        <button
                          type="button"
                          onClick={() => removeQueueItem(item.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <AdminButton
                  variant="primary"
                  className="flex-1 justify-center shadow-lg shadow-purple-900/30"
                  onClick={processBulkUpload}
                  disabled={isProcessingQueue || uploadQueue.every((q) => q.status === "success")}
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isProcessingQueue 
                    ? `Uploading (${queueProgress.completed}/${queueProgress.total})...` 
                    : `Start Bulk Upload (${uploadQueue.filter((q) => q.status === "pending" || q.status === "error").length} files)`}
                </AdminButton>

                <AdminButton
                  variant="outline"
                  onClick={() => setIsBulkModalOpen(false)}
                  disabled={isProcessingQueue}
                >
                  Close
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </SlideOver>

      {/* Single Media Details SlideOver */}
      <SlideOver 
        isOpen={!!selectedMedia} 
        onClose={() => { 
          setSelectedMedia(null); 
          setCopiedUrl(false); 
          setCopiedName(false);
        }}
        title="Media Asset Details"
      >
        {selectedMedia && (
          <div className="space-y-8 pb-12">
            {/* Preview Box */}
            <div className="w-full bg-neutral-950 border border-[var(--border-default)] rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[220px]">
              {selectedMedia.type === 'IMAGE' ? (
                <img 
                  src={selectedMedia.url} 
                  alt={getMediaFileName(selectedMedia)} 
                  className="max-w-full max-h-[40vh] object-contain rounded-lg shadow-md" 
                />
              ) : selectedMedia.type === 'VIDEO' ? (
                <video src={selectedMedia.url} controls className="max-w-full max-h-[40vh] rounded-lg" />
              ) : (
                <div className="h-[20vh] flex flex-col items-center justify-center gap-2">
                  <FileText className="w-16 h-16 text-purple-400" />
                  <span className="text-xs font-mono text-zinc-400">{getMediaFileName(selectedMedia)}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* File Info Section */}
              <div>
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  File Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  {/* File Name Row */}
                  <div className="col-span-2 p-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl">
                    <dt className="text-xs text-[var(--text-tertiary)] flex items-center justify-between mb-1 font-mono">
                      <span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-purple-400" /> File Name</span>
                      <button 
                        onClick={() => handleCopy(getMediaFileName(selectedMedia), "name")}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedName ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedName ? "Copied!" : "Copy Name"}
                      </button>
                    </dt>
                    <dd className="font-mono font-bold text-sm text-[var(--text-primary)] break-all select-all">
                      {getMediaFileName(selectedMedia)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mb-1"><Box className="w-3.5 h-3.5 text-purple-400" /> Type</dt>
                    <dd className="font-mono font-bold text-[var(--text-primary)]">{selectedMedia.type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mb-1"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> Size</dt>
                    <dd className="font-mono font-bold text-[var(--text-primary)]">{formatBytes(selectedMedia.size)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mb-1"><LinkIcon className="w-3.5 h-3.5 text-purple-400" /> MIME Type</dt>
                    <dd className="font-mono text-xs text-[var(--text-primary)] break-all">{selectedMedia.mimeType || 'application/octet-stream'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Uploaded Date</dt>
                    <dd className="font-mono text-xs text-[var(--text-primary)]">{new Date(selectedMedia.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
                <AdminButton 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleCopy(selectedMedia.url, "url")}
                >
                  <span className="flex items-center gap-2">
                    {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copiedUrl ? "Copied Media URL!" : "Copy Media URL"}
                  </span>
                </AdminButton>
                
                <a href={selectedMedia.url} target="_blank" rel="noreferrer" className="w-full block">
                  <AdminButton variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Open in New Tab</span>
                  </AdminButton>
                </a>
              </div>

              {/* Permanent Delete */}
              <div className="pt-6 border-t border-red-900/30">
                <AdminButton 
                  variant="outline" 
                  className="w-full text-red-400 hover:bg-red-950/40 hover:border-red-500/50 justify-center"
                  onClick={() => handleDelete(selectedMedia.id)}
                >
                  <Trash2 className="w-4 h-4 me-2" /> Delete Permanently
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </DashboardPageShell>
  );
}
