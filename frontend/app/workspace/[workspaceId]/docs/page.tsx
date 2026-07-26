"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Files,
  FilePlus,
  Search,
  Clock,
  FileText,
  Download,
  Trash2,
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Archive,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import BaseModal from "@/components/modals/BaseModal";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  useGetDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDownloadDocument,
} from "@/lib/hooks/document.hook";
import { DocumentType } from "@/lib/types/document.types";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// File type icon mapping
const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  doc: <FileText className="w-5 h-5 text-blue-500" />,
  spreadsheet: <FileSpreadsheet className="w-5 h-5 text-emerald-500" />,
  image: <ImageIcon className="w-5 h-5 text-purple-500" />,
  presentation: <Presentation className="w-5 h-5 text-amber-500" />,
  archive: <Archive className="w-5 h-5 text-slate-500" />,
  other: <File className="w-5 h-5 text-muted-foreground" />,
};

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-500/10 border-red-500/20",
  doc: "bg-blue-500/10 border-blue-500/20",
  spreadsheet: "bg-emerald-500/10 border-emerald-500/20",
  image: "bg-purple-500/10 border-purple-500/20",
  presentation: "bg-amber-500/10 border-amber-500/20",
  archive: "bg-slate-500/10 border-slate-500/20",
  other: "bg-muted border-border",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const WorkspaceDocsPage = () => {
  const router = useRouter();
  const { workspaceId, isAdminOrOwner } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useGetDocuments(workspaceId);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const downloadDocument = useDownloadDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadVisibility, setUploadVisibility] = useState<"public" | "private">("public");
  const [isDragging, setIsDragging] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DocumentType | null>(null);

  if (isLoading) {
    return <Loader page="documents" />;
  }

  const allDocs: DocumentType[] = documents || [];

  // Apply filters
  const filteredDocs = allDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || doc.file_type === filterType;
    const matchesVisibility =
      filterVisibility === "all" || doc.visibility === filterVisibility;

    return matchesSearch && matchesType && matchesVisibility;
  });

  const totalDocs = allDocs.length;
  const publicDocs = allDocs.filter((d) => d.visibility === "public").length;
  const privateDocs = allDocs.filter((d) => d.visibility === "private").length;

  // Upload handlers
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
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle || uploadFile.name);
    formData.append("description", uploadDescription);
    formData.append("visibility", uploadVisibility);

    try {
      await uploadDocument.mutateAsync({ workspaceId, formData });
      resetUploadForm();
    } catch {
      // Error toast handled by hook
    }
  };

  const resetUploadForm = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadVisibility("public");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument.mutateAsync({
        workspaceId,
        documentId: deleteTarget.id,
      });
      setDeleteTarget(null);
    } catch {
      // Error toast handled by hook
    }
  };

  const handleDownload = (doc: DocumentType) => {
    downloadDocument.mutate({
      workspaceId,
      documentId: doc.id,
      fileName: doc.file_name,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Unified Header */}
      <Header
        title="Documents"
        subtitle="Upload, manage, and share workspace files."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Total Documents",
            value: totalDocs,
            icon: <Files className="w-5 h-5 text-primary" />,
          },
          {
            title: "Public Files",
            value: publicDocs,
            icon: <Globe className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Private Files",
            value: privateDocs,
            icon: <Lock className="w-5 h-5 text-amber-500" />,
          },
        ]}
        actions={
          <Button
            className="rounded-xl gap-2 text-xs shadow-xs"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <FilePlus className="w-4 h-4" /> Upload Document
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10 bg-card border-border rounded-xl text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Documents</option>
            <option value="spreadsheet">Spreadsheets</option>
            <option value="image">Images</option>
            <option value="presentation">Presentations</option>
            <option value="archive">Archives</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Access</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-card text-center space-y-3">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground border border-border">
            <Files className="w-7 h-7" />
          </div>
          <p className="font-bold text-base">
            {searchQuery || filterType !== "all" || filterVisibility !== "all"
              ? "No documents match your filters"
              : "No documents uploaded yet"}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchQuery || filterType !== "all" || filterVisibility !== "all"
              ? "Try adjusting your search or filters."
              : "Upload your first document to start building your workspace knowledge base."}
          </p>
          {!searchQuery && filterType === "all" && filterVisibility === "all" && (
            <Button
              size="sm"
              className="rounded-xl gap-2 text-xs mt-2"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="w-4 h-4" /> Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="divide-y divide-border">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* File Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      FILE_TYPE_COLORS[doc.file_type] || FILE_TYPE_COLORS.other
                    }`}
                  >
                    {FILE_TYPE_ICONS[doc.file_type] || FILE_TYPE_ICONS.other}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {doc.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium px-1.5 py-0 ${
                          doc.visibility === "private"
                            ? "text-amber-600 border-amber-300"
                            : "text-emerald-600 border-emerald-300"
                        }`}
                      >
                        {doc.visibility === "private" ? (
                          <><Lock className="w-2.5 h-2.5 mr-0.5" /> Private</>
                        ) : (
                          <><Eye className="w-2.5 h-2.5 mr-0.5" /> Public</>
                        )}
                      </Badge>
                    </div>

                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                      <span>{doc.file_name}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span className="capitalize">{doc.file_type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(doc.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  {doc.uploaded_by && (
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={doc.uploaded_by.avatar} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {doc.uploaded_by.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[80px]">
                        {doc.uploaded_by.username}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadDocument.isPending}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <BaseModal
        isOpen={isUploadModalOpen}
        onClose={resetUploadForm}
        title="Upload Document"
        size="md"
      >
        <div className="space-y-5 py-2">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : uploadFile
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border hover:border-primary/50"
            }`}
          >
            {uploadFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  {FILE_TYPE_ICONS[
                    (() => {
                      const ext = uploadFile.name.split(".").pop()?.toLowerCase() || "";
                      const map: Record<string, string> = {
                        pdf: "pdf", doc: "doc", docx: "doc", txt: "doc",
                        xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
                        png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image",
                        ppt: "presentation", pptx: "presentation",
                        zip: "archive", rar: "archive",
                      };
                      return map[ext] || "other";
                    })()
                  ] || FILE_TYPE_ICONS.other}
                </div>
                <p className="text-sm font-semibold text-foreground truncate max-w-xs mx-auto">
                  {uploadFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadFile.size)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadFile(null);
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  Drag & drop a file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse — PDF, DOCX, images, spreadsheets up to 25MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Title</label>
            <Input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Document title"
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description (optional)</label>
            <Input
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief description of this document"
              className="text-sm"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Access Level</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUploadVisibility("public")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 ${
                  uploadVisibility === "public"
                    ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-xs"
                    : "bg-card border-border"
                }`}
              >
                <Globe className={`w-4 h-4 mt-0.5 shrink-0 ${uploadVisibility === "public" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">Public</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    All workspace members
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUploadVisibility("private")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 ${
                  uploadVisibility === "private"
                    ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-xs"
                    : "bg-card border-border"
                }`}
              >
                <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${uploadVisibility === "private" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">Private</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Only you & admins
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetUploadForm}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploadDocument.isPending}
              className="rounded-xl text-xs px-6 shadow-xs gap-2"
            >
              {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Document</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
              className="text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteDocument.isPending ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceDocsPage;
