"use client";

import React, { useState } from "react";
import {
  Upload,
  Globe,
  Lock,
  Briefcase,
  Code,
  Megaphone,
  Palette,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import BaseModal from "../modals/BaseModal";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInput } from "../input/formInput";
import { toast } from "sonner";
import {
  useCreateWorkspace,
  useUploadWorkspaceImage,
} from "@/lib/hooks/workspace.hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  description: string;
  visibility: "public" | "private";
  category: string;
  template: string;
}

const CATEGORIES = [
  { id: "software", label: "Software & Tech", icon: Code },
  { id: "marketing", label: "Marketing & Growth", icon: Megaphone },
  { id: "design", label: "Product & Design", icon: Palette },
  { id: "operations", label: "Operations & HR", icon: Briefcase },
  { id: "general", label: "General Business", icon: LayoutGrid },
];

const TEMPLATES = [
  {
    id: "agile",
    title: "Agile Sprint Board",
    desc: "Backlog, Active Sprint, In Review, Done",
  },
  {
    id: "kanban",
    title: "Kanban Task Tracker",
    desc: "To Do, In Progress, Blocked, Completed",
  },
  {
    id: "roadmap",
    title: "Product Roadmap",
    desc: "Q1 Objectives, Key Results, Release Schedule",
  },
];

const CreateWorkspaceModal = ({ isOpen, onClose }: AddServerModalProps) => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("software");
  const [selectedTemplate, setSelectedTemplate] = useState("agile");
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      visibility: "private",
      category: "software",
      template: "agile",
    },
  });

  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();
  const uploadLogo = useUploadWorkspaceImage();

  React.useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedCategory("software");
      setSelectedTemplate("agile");
      setVisibility("private");
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting || isPending) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        category: selectedCategory,
        template: selectedTemplate,
        visibility,
      };

      const newWorkspace = await createWorkspace(payload);

      if (selectedFile && newWorkspace?.id) {
        const formData = new FormData();
        formData.append("logo", selectedFile);
        await uploadLogo.mutateAsync({
          workspaceId: newWorkspace.id,
          formData,
        });
      }

      onClose();
      if (newWorkspace?.id) {
        router.push(`/workspace/${newWorkspace.id}`);
      }
    } catch (error: any) {
      toast.error(error?.detail || "Failed to create workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      size="lg"
    >
      <div className="space-y-6 py-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo & Basic Info Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/20 rounded-2xl border border-border/60">
            {/* Logo Upload & Preview */}
            <div className="flex flex-col items-center space-y-2 shrink-0">
              <label htmlFor="workspace-logo-upload" className="cursor-pointer group relative">
                <Avatar className="w-20 h-20 border-2 border-dashed border-primary/40 group-hover:border-primary transition-all">
                  <AvatarImage src={previewUrl || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] uppercase font-semibold mt-1">Logo</span>
                  </AvatarFallback>
                </Avatar>
              </label>
              <input
                id="workspace-logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-[11px] text-muted-foreground">PNG, JPG up to 5MB</span>
            </div>

            {/* Name & Description Inputs */}
            <div className="flex-1 space-y-3 w-full">
              <FormInput
                register={register}
                name="name"
                label="Workspace Name"
                placeholder="e.g. Acme Engineering"
                required
              />
              <FormInput
                register={register}
                name="description"
                label="Description"
                placeholder="What is this workspace created for?"
              />
            </div>
          </div>

          {/* Industry Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Industry Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary border-primary/40 ring-1 ring-primary/20 font-semibold"
                        : "bg-card hover:bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility & Access Control */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Access & Visibility
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === "private"
                    ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-xs"
                    : "bg-card/50 border-border/60 hover:bg-card text-muted-foreground"
                }`}
              >
                <Lock className={`w-5 h-5 mt-0.5 ${visibility === "private" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">Private Workspace</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Only explicitly invited team members can join.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === "public"
                    ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-xs"
                    : "bg-card/50 border-border/60 hover:bg-card text-muted-foreground"
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${visibility === "public" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">Public Workspace</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Accessible to anyone within your organization.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Preset Starter Template */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Preset Starter Board Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                        : "bg-card border-border/60 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{tmpl.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {tmpl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              className="rounded-xl text-xs px-6 shadow-xs gap-2"
            >
              {isPending || isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default CreateWorkspaceModal;
