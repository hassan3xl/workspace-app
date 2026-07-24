"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Folder, Edit3, Trash2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/input/formInput";
import { ProjectType } from "@/lib/types/project.types";
import {
  useAddproject,
  useUpdateproject,
  useDeleteProject,
} from "@/lib/hooks/project.hook";

export type ProjectModalMode = "create" | "edit" | "delete";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ProjectModalMode;
  workspaceId: string;
  projectId?: string;
  project?: ProjectType | null;
  onSuccess?: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed" | "archived";
  visibility: "public" | "private";
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  mode,
  workspaceId,
  projectId,
  project,
  onSuccess,
}) => {
  const router = useRouter();

  const targetProjectId = project?.id || projectId || "";

  // Hooks
  const { mutateAsync: addProject, isPending: adding } = useAddproject();
  const { mutateAsync: updateProject, isPending: updating } = useUpdateproject();
  const { mutateAsync: deleteProject, isPending: deleting } = useDeleteProject();

  const isSubmitting = adding || updating || deleting;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "planning",
      visibility: "private",
    },
  });

  // Populate initial values when modal opens in edit mode
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && project) {
        reset({
          title: project.title || "",
          description: project.description || "",
          status: project.status || "planning",
          visibility: (project.visibility as "public" | "private") || "private",
        });
      } else if (mode === "create") {
        reset({
          title: "",
          description: "",
          status: "planning",
          visibility: "private",
        });
      }
    }
  }, [isOpen, mode, project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (mode === "create") {
        await addProject({
          workspaceId,
          projectData: data,
        });
        toast.success("Project created successfully");
      } else if (mode === "edit" && targetProjectId) {
        await updateProject({
          workspaceId,
          projectId: targetProjectId,
          projectData: data,
        });
        toast.success("Project updated successfully");
      } else if (mode === "delete" && targetProjectId) {
        await deleteProject({
          workspaceId,
          projectId: targetProjectId,
        });
        toast.success("Project deleted permanently");
        router.push(`/workspace/${workspaceId}/projects`);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.detail || `Failed to ${mode} project`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden border-border/50 shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 space-y-1.5 text-left border-b border-border/40">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border text-foreground ${
                mode === "delete"
                  ? "bg-destructive/10 border-destructive/20 text-destructive"
                  : mode === "edit"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}
            >
              {mode === "delete" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : mode === "edit" ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <Folder className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {mode === "create" && "Create New Project"}
                {mode === "edit" && "Edit Project Settings"}
                {mode === "delete" && "Delete Project"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {mode === "create" &&
                  "Add a new project to track tasks, collaborators, and progress."}
                {mode === "edit" &&
                  "Modify title, description, visibility, and lifecycle status."}
                {mode === "delete" &&
                  "This action is permanent and will delete all tasks and associations."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === "delete" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-foreground space-y-2">
              <p className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Warning: Permanent Action
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {project?.title || "this project"}
                </span>
                ? All associated tasks, member roles, and project settings will be lost.
              </p>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 sm:h-9"
              >
                {deleting ? "Deleting Project..." : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormInput
              register={register}
              name="title"
              label="Project Title"
              placeholder="e.g. Website Redesign"
              required
              field="input"
            />

            <FormInput
              register={register}
              name="description"
              label="Project Description"
              placeholder="Brief summary of project goals..."
              field="textarea"
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === "edit" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Status</label>
                  <select
                    {...register("status")}
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors cursor-pointer"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Visibility</label>
                <select
                  {...register("visibility")}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="private">Private (Workspace Only)</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 sm:h-9"
              >
                {adding && "Creating..."}
                {updating && "Saving..."}
                {!isSubmitting && (mode === "create" ? "Create Project" : "Save Changes")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
