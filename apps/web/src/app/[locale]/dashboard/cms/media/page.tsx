"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { AdminButton } from "@/components/dashboard/ui/AdminButton";
import { SlideOver } from "@/components/dashboard/ui/SlideOver";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
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
  CheckCircle2,
  X,
  FileCode,
  Layers,
  AlertCircle,
  Check,
  Folder,
  FolderPlus,
  FolderOpen,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
  MoveRight,
  Filter,
} from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

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
  folder?: string;
}

const TYPE_ICONS: Record<string, any> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  MODEL_3D: Box,
};

const DEFAULT_FOLDERS = [
  { id: "ALL", name: "All Assets", nameAr: "كافة الأصول", icon: Layers },
  { id: "Team Profiles", name: "Team & Leadership", nameAr: "فريق العمل والقيادة", icon: Folder },
  { id: "Brand & Logos", name: "Brand & Logos", nameAr: "الهوية والشعارات", icon: Folder },
  { id: "B2B Projects", name: "B2B Showcase & Cases", nameAr: "مشاريع قطاع الأعمال", icon: Folder },
  { id: "Attractions", name: "Attractions & Events", nameAr: "الوجهات والفعاليات", icon: Folder },
  { id: "Documents", name: "Documents & Legal", nameAr: "المستندات والملفات", icon: Folder },
  { id: "3D Models", name: "3D Assets & CAD", nameAr: "المجسمات ثلاثية الأبعاد", icon: Box },
  { id: "Uncategorized", name: "Uncategorized", nameAr: "غير مصنف", icon: FolderOpen },
];

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

function getMediaFolder(media: Media): string {
  if (media.metadata && typeof media.metadata === "object" && (media.metadata as any).folder) {
    return (media.metadata as any).folder;
  }
  const url = (media.url || "").toLowerCase();
  const name = (getMediaFileName(media) || "").toLowerCase();

  if (url.includes("/team/") || name.includes("person") || name.includes("leader") || name.includes("avatar") || name.includes(".png") && (name.includes("ali") || name.includes("russell") || name.includes("suhail") || name.includes("waqar") || name.includes("ruben") || name.includes("mohasin") || name.includes("nicole"))) {
    return "Team Profiles";
  }
  if (url.includes("/logos/") || name.includes("logo") || name.includes("favicon") || name.includes("brand")) {
    return "Brand & Logos";
  }
  if (url.includes("/cases/") || url.includes("/services/") || name.includes("case") || name.includes("b2b")) {
    return "B2B Projects";
  }
  if (url.includes("/attractions/") || name.includes("attraction") || name.includes("pulse") || name.includes("park")) {
    return "Attractions";
  }
  if (media.type === "DOCUMENT" || url.endsWith(".pdf") || url.endsWith(".docx")) {
    return "Documents";
  }
  if (media.type === "MODEL_3D" || url.endsWith(".glb") || url.endsWith(".gltf")) {
    return "3D Models";
  }
  return "Uncategorized";
}

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [activeFolder, setActiveFolder] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  // Folder Management State
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Multi-Select State
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isBulkMoving, setIsBulkMoving] = useState(false);

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<QueuedUploadItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueProgress, setQueueProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [targetUploadFolder, setTargetUploadFolder] = useState("Uncategorized");
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load custom folders from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("e3_media_custom_folders");
      if (saved) {
        setCustomFolders(JSON.parse(saved));
      }
    } catch (_e) {}
  }, []);

  const saveCustomFolders = (folders: string[]) => {
    setCustomFolders(folders);
    try {
      localStorage.setItem("e3_media_custom_folders", JSON.stringify(folders));
    } catch (_e) {}
  };

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

  // All Folders (Default + Custom + Detected from Media)
  const allFolderNames = useMemo(() => {
    const defaultIds = DEFAULT_FOLDERS.filter((f) => f.id !== "ALL").map((f) => f.id);
    const mediaFolders = mediaList.map((m) => getMediaFolder(m));
    const merged = Array.from(new Set([...defaultIds, ...customFolders, ...mediaFolders]));
    return merged;
  }, [mediaList, customFolders]);

  // Folder item count mapping
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: mediaList.length };
    mediaList.forEach((m) => {
      const folder = getMediaFolder(m);
      counts[folder] = (counts[folder] || 0) + 1;
    });
    return counts;
  }, [mediaList]);

  // 1-Click Link Copy with instant feedback
  const handleQuickCopy = async (e: React.MouseEvent, url: string, mediaId?: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      if (mediaId) {
        setCopiedId(mediaId);
        setTimeout(() => setCopiedId(null), 2000);
      }
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast("Asset URL copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy", err);
      toast("Failed to copy link", "error");
    }
  };

  // Move single item to folder
  const handleMoveMediaToFolder = async (mediaId: string, folderName: string) => {
    try {
      const res = await fetch(`/api/cms/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: folderName }),
      });
      if (!res.ok) throw new Error("Failed to move folder");

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === mediaId
            ? { ...m, metadata: { ...(m.metadata || {}), folder: folderName } }
            : m
        )
      );

      if (selectedMedia?.id === mediaId) {
        setSelectedMedia((prev: any) => ({
          ...prev,
          metadata: { ...(prev?.metadata || {}), folder: folderName },
        }));
      }

      toast(`Moved to folder "${folderName}"`, "success");
    } catch (_err) {
      toast("Failed to move media to folder", "error");
    }
  };

  // Bulk Move selected items to folder
  const handleBulkMoveToFolder = async (folderName: string) => {
    if (selectedMediaIds.length === 0) return;
    setIsBulkMoving(true);
    try {
      const res = await fetch("/api/cms/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaIds: selectedMediaIds,
          folder: folderName,
        }),
      });
      if (!res.ok) throw new Error("Bulk move failed");

      setMediaList((prev) =>
        prev.map((m) =>
          selectedMediaIds.includes(m.id)
            ? { ...m, metadata: { ...(m.metadata || {}), folder: folderName } }
            : m
        )
      );

      toast(`Moved ${selectedMediaIds.length} items to "${folderName}"`, "success");
      setSelectedMediaIds([]);
    } catch (_err) {
      toast("Failed to move selected media", "error");
    } finally {
      setIsBulkMoving(false);
    }
  };

  // Copy all selected URLs at once
  const handleCopySelectedUrls = async () => {
    if (selectedMediaIds.length === 0) return;
    const urls = mediaList
      .filter((m) => selectedMediaIds.includes(m.id))
      .map((m) => m.url)
      .join("\n");

    try {
      await navigator.clipboard.writeText(urls);
      toast(`Copied ${selectedMediaIds.length} URLs to clipboard!`, "success");
    } catch (_err) {
      toast("Failed to copy URLs", "error");
    }
  };

  // Create new folder
  const handleCreateNewFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    if (!allFolderNames.includes(trimmed)) {
      const updated = [...customFolders, trimmed];
      saveCustomFolders(updated);
      toast(`Created folder "${trimmed}"`, "success");
    }
    setActiveFolder(trimmed);
    setNewFolderName("");
    setIsNewFolderModalOpen(false);
  };

  // Toggle single selection
  const toggleSelectMedia = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  // Handle Quick Upload from Header
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
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
      toast("Asset uploaded successfully", "success");
    } catch (err) {
      console.error("Upload error:", err);
      toast("Failed to upload asset", "error");
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
      folder: targetUploadFolder !== "ALL" ? targetUploadFolder : "Uncategorized",
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
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 20 } : q))
      );

      try {
        const uploadResult = await uploadFile(item.file, "cms_media");

        let mediaType = "IMAGE";
        if (item.file.type.startsWith("video/")) mediaType = "VIDEO";
        else if (item.file.type.includes("pdf") || item.file.name.match(/\.(pdf|doc|docx)$/i)) mediaType = "DOCUMENT";
        else if (item.file.name.match(/\.(glb|gltf)$/i)) mediaType = "MODEL_3D";

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
        const finalFolder = item.folder || targetUploadFolder;

        // Update folder in metadata
        if (finalFolder && registeredData.id) {
          try {
            await fetch(`/api/cms/media/${registeredData.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ folder: finalFolder }),
            });
          } catch (_e) {}
        }

        const finalMediaRecord: Media = {
          id: registeredData.id || uploadResult.url,
          url: uploadResult.url,
          fileName: uploadResult.fileName || item.file.name,
          type: mediaType,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size,
          metadata: { folder: finalFolder },
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
      toast(`Successfully uploaded ${newlyCreatedMedia.length} assets`, "success");
    }

    setIsProcessingQueue(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media file?")) return;
    try {
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setSelectedMedia(null);
      toast("Asset deleted successfully", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to delete asset", "error");
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
      const itemFolder = getMediaFolder(m);

      const matchesType = filterType === "ALL" || m.type === filterType;
      const matchesFolder = activeFolder === "ALL" || itemFolder === activeFolder;
      const matchesSearch =
        fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.mimeType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemFolder.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesFolder && matchesSearch;
    });
  }, [mediaList, filterType, activeFolder, searchQuery]);

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title="Global Media Library"
        description="Centralized asset repository with 1-click URL copy, folder grouping, bulk uploads, and instant media previews."
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Single Upload"}</span>
            </button>

            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Create New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>New Folder</span>
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

      {/* 1. Folder Bar / Navigation Pills */}
      <div className="px-6 py-3 border-b border-[var(--border-default)] bg-[var(--surface-default)]/60 backdrop-blur-md flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5 me-1 shrink-0">
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            Folders:
          </span>

          <button
            onClick={() => setActiveFolder("ALL")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
              activeFolder === "ALL"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Assets</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
              activeFolder === "ALL" ? "bg-white/20 text-white" : "bg-[var(--bg-level-1)] text-[var(--text-tertiary)]"
            )}>
              {folderCounts["ALL"] || 0}
            </span>
          </button>

          {allFolderNames.map((folderName) => {
            const count = folderCounts[folderName] || 0;
            const isActive = activeFolder === folderName;

            return (
              <button
                key={folderName}
                onClick={() => setActiveFolder(folderName)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
                )}
              >
                <Folder className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-purple-400")} />
                <span>{folderName}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-[var(--bg-level-1)] text-[var(--text-tertiary)]"
                )}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-purple-500/50 hover:border-purple-400 text-purple-400 text-xs font-bold hover:bg-purple-500/10 transition-all cursor-pointer shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Folder</span>
          </button>
        </div>
      </div>

      {/* 2. Type Filter and Search Bar */}
      <div className="px-6 py-3.5 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-level-1)]">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar items-center">
          {["ALL", "IMAGE", "VIDEO", "DOCUMENT", "MODEL_3D"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap cursor-pointer ${
                filterType === type
                  ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                  : "bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {type === "MODEL_3D" ? "3D Models" : type}
            </button>
          ))}

          {selectedMediaIds.length > 0 && (
            <div className="flex items-center gap-2 ms-3 border-s border-[var(--border-default)] ps-3">
              <button
                onClick={() => setSelectedMediaIds([])}
                className="text-xs text-[var(--text-tertiary)] hover:text-red-400 font-bold transition-colors cursor-pointer"
              >
                Clear selection ({selectedMediaIds.length})
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by name, URL, or folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-full py-2 ps-9 pe-4 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-2xl bg-[var(--surface-default)]/30 p-8 text-center">
            <ImageIcon className="w-12 h-12 mb-3 opacity-30 text-purple-400" />
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">No media files found</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              {activeFolder !== "ALL"
                ? `No assets found in folder "${activeFolder}".`
                : "Upload new media or bulk upload files to your library."}
            </p>
            <AdminButton variant="primary" size="sm" onClick={() => setIsBulkModalOpen(true)}>
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Open Bulk Upload
            </AdminButton>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((media) => {
              const Icon = TYPE_ICONS[media.type] || FileText;
              const fileName = getMediaFileName(media);
              const folderName = getMediaFolder(media);
              const isSelected = selectedMediaIds.includes(media.id);
              const isJustCopied = copiedId === media.id;

              return (
                <div
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className={cn(
                    "group relative aspect-square bg-[var(--surface-default)] border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl flex flex-col justify-between select-none",
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/50"
                      : "border-[var(--border-default)] hover:border-purple-500/80"
                  )}
                >
                  {/* Media Thumbnail */}
                  <div className="w-full h-full relative overflow-hidden bg-neutral-950/40 flex items-center justify-center">
                    {media.type === "IMAGE" ? (
                      <img
                        src={media.url}
                        alt={fileName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : media.type === "VIDEO" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                        <Video className="w-10 h-10 text-purple-400 opacity-80" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--surface-hover)]">
                        <Icon className="w-10 h-10 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors" />
                      </div>
                    )}

                    {/* Top Badges & 1-Click Copy Button */}
                    <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between">
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelectMedia(e, media.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md backdrop-blur-md cursor-pointer",
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-950/80 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-purple-600 hover:text-white"
                        )}
                        title={isSelected ? "Deselect" : "Select asset"}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>

                      {/* 1-Click Link Copy Action */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCopy(e, media.url, media.id)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all backdrop-blur-md shadow-md cursor-pointer",
                          isJustCopied
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-400/50 scale-105"
                            : "bg-neutral-950/85 border border-neutral-800 text-neutral-200 hover:bg-purple-600 hover:text-white hover:border-purple-500"
                        )}
                        title="1-Click Copy Link"
                      >
                        {isJustCopied ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-purple-400 group-hover:text-white" />
                            <span>COPY URL</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Folder Badge Indicator */}
                    <div className="absolute top-10 start-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-[9px] font-bold text-purple-300 backdrop-blur-md flex items-center gap-1">
                        <Folder className="w-2.5 h-2.5 text-purple-400" />
                        <span className="truncate max-w-[80px]">{folderName}</span>
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
                  <th className="px-4 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedMediaIds.length === filteredMedia.length && filteredMedia.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMediaIds(filteredMedia.map((m) => m.id));
                        } else {
                          setSelectedMediaIds([]);
                        }
                      }}
                      className="rounded border-neutral-700 text-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 font-bold tracking-wider">Preview</th>
                  <th className="px-6 py-4 font-bold tracking-wider">File Name & URL</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Folder / Group</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Type / MIME</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Size</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-end">1-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {filteredMedia.map((media) => {
                  const Icon = TYPE_ICONS[media.type] || FileText;
                  const fileName = getMediaFileName(media);
                  const folderName = getMediaFolder(media);
                  const isSelected = selectedMediaIds.includes(media.id);
                  const isJustCopied = copiedId === media.id;

                  return (
                    <tr
                      key={media.id}
                      className={cn(
                        "hover:bg-[var(--surface-hover)]/50 transition-colors cursor-pointer",
                        isSelected && "bg-purple-950/20"
                      )}
                      onClick={() => setSelectedMedia(media)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => toggleSelectMedia(e, media.id)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-neutral-700 text-purple-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 w-16">
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden border border-[var(--border-default)] flex items-center justify-center">
                          {media.type === "IMAGE" ? (
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs font-bold text-purple-300">
                          <Folder className="w-3 h-3 text-purple-400" />
                          {folderName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                          <Icon className="w-3.5 h-3.5 text-purple-400" />
                          {media.mimeType || media.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[var(--text-secondary)]">{formatBytes(media.size)}</td>
                      <td className="px-6 py-4 text-end">
                        <button
                          type="button"
                          onClick={(e) => handleQuickCopy(e, media.url, media.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer",
                            isJustCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-[var(--surface-hover)] border border-[var(--border-default)] hover:bg-purple-600 hover:text-white"
                          )}
                        >
                          {isJustCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isJustCopied ? "Copied!" : "Copy Link"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Multi-Select Toolbar */}
      {selectedMediaIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in slide-in-from-bottom-5">
          <div className="bg-neutral-950/95 border border-purple-500/40 rounded-2xl p-3 px-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono">
                {selectedMediaIds.length} Assets Selected
              </span>
            </div>

            <div className="h-4 w-px bg-neutral-800" />

            {/* Folder Mover Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Move to:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkMoveToFolder(e.target.value);
                }}
                defaultValue=""
                disabled={isBulkMoving}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="" disabled>
                  Select Folder ▾
                </option>
                {allFolderNames.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCopySelectedUrls}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-900/40"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All URLs</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMediaIds([])}
              className="text-xs text-neutral-400 hover:text-neutral-200 font-bold transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      <SlideOver
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        title="Create New Media Folder"
      >
        <div className="space-y-6 pb-12">
          <p className="text-xs text-[var(--text-secondary)]">
            Create a custom organization folder to group marketing assets, team photos, hero graphics, and event media.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. National Day 2026, Hero Banners, VIP Sponsors..."
                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-semibold"
                autoFocus
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <AdminButton
                variant="primary"
                onClick={handleCreateNewFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 justify-center"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </AdminButton>

              <AdminButton variant="outline" onClick={() => setIsNewFolderModalOpen(false)}>
                Cancel
              </AdminButton>
            </div>
          </div>
        </div>
      </SlideOver>

      {/* Bulk Upload Drawer / Modal */}
      <SlideOver
        isOpen={isBulkModalOpen}
        onClose={() => {
          if (!isProcessingQueue) setIsBulkModalOpen(false);
        }}
        title="Bulk Media Upload & Organization"
      >
        <div className="space-y-6 pb-12">
          <p className="text-xs text-[var(--text-secondary)]">
            Upload multiple images, videos, documents, or 3D models at once with automatic folder destination assignment.
          </p>

          {/* Folder Destination Selector for Upload */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
              Target Folder for Uploaded Files
            </label>
            <select
              value={targetUploadFolder}
              onChange={(e) => setTargetUploadFolder(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {allFolderNames.map((f) => (
                <option key={f} value={f}>
                  📁 {f}
                </option>
              ))}
            </select>
          </div>

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

              {isProcessingQueue && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>
                      Uploading Batch: {queueProgress.completed} of {queueProgress.total} completed
                    </span>
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
                          {formatBytes(item.size)} • Folder: {item.folder}
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
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/30 text-red-400 flex items-center gap-1"
                          title={item.error}
                        >
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

                <AdminButton variant="outline" onClick={() => setIsBulkModalOpen(false)} disabled={isProcessingQueue}>
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
          <div className="space-y-6 pb-12">
            {/* Preview Box */}
            <div className="w-full bg-neutral-950 border border-[var(--border-default)] rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[220px]">
              {selectedMedia.type === "IMAGE" ? (
                <img
                  src={selectedMedia.url}
                  alt={getMediaFileName(selectedMedia)}
                  className="max-h-72 max-w-full object-contain rounded-lg"
                />
              ) : selectedMedia.type === "VIDEO" ? (
                <video src={selectedMedia.url} controls className="max-h-72 w-full rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-purple-400 py-8">
                  {React.createElement(TYPE_ICONS[selectedMedia.type] || FileText, { className: "w-16 h-16" })}
                  <span className="text-xs font-mono font-bold uppercase">{selectedMedia.mimeType}</span>
                </div>
              )}
            </div>

            {/* 1-Click Link Copy Card */}
            <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  1-Click Direct URL
                </label>
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedMedia.url}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={(e) => handleQuickCopy(e, selectedMedia.url, selectedMedia.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md",
                    copiedUrl
                      ? "bg-emerald-600 text-white shadow-emerald-900/40"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40"
                  )}
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "COPIED!" : "COPY LINK"}</span>
                </button>
              </div>
            </div>

            {/* Folder Mover & Assignment */}
            <div className="p-4 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-purple-400" />
                Folder / Category Group
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={getMediaFolder(selectedMedia)}
                  onChange={(e) => handleMoveMediaToFolder(selectedMedia.id, e.target.value)}
                  className="flex-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {allFolderNames.map((f) => (
                    <option key={f} value={f}>
                      📁 {f}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="p-2.5 rounded-xl border border-dashed border-purple-500/50 hover:bg-purple-500/10 text-purple-400 text-xs font-bold transition-colors cursor-pointer"
                  title="Create New Folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">File Size</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {formatBytes(selectedMedia.size)}
                </span>
              </div>
              <div className="p-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Uploaded Date</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {new Date(selectedMedia.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delete Action */}
            <div className="pt-4 border-t border-[var(--border-default)]">
              <AdminButton
                variant="danger"
                onClick={() => handleDelete(selectedMedia.id)}
                className="w-full justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Asset Permanently
              </AdminButton>
            </div>
          </div>
        )}
      </SlideOver>
    </DashboardPageShell>
  );
}
