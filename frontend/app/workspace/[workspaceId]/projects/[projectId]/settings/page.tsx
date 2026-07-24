"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Users,
  AlertTriangle,
  Folder,
  Edit3,
  Trash2,
  Archive,
  ArchiveRestore,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  User,
  Sparkles,
  CheckCircle,
  Globe,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput } from "@/components/input/formInput";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import { cn, formatDate } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetProject, useUpdateproject } from "@/lib/hooks/project.hook";
import AddProjectMemberModal from "@/components/workspace/projects/AddProjectMemberModal";
import DeleteProjectModal from "@/components/workspace/projects/DeleteProjectModal";
import EditProjectModal from "@/components/workspace/projects/EditProjectModal";
import DeleteCollaboratorModal from "@/components/workspace/projects/DeleteCollaboratorModal";

interface ProjectFormData {
  title: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed" | "archived";
  visibility: "public" | "private";
}

const ProjectSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { projectId } = params;
  const { workspaceId, userRole } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"general" | "team" | "danger">(
    "general",
  );

  // Modal states
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<{
    isOpen: boolean;
    collabId: string | null;
    userName: string;
  }>({
    isOpen: false,
    collabId: null,
    userName: "",
  });

  const { data: project, isLoading: loading } = useGetProject(
    workspaceId,
    projectId as string,
  );
  const { mutateAsync: updateProject, isPending: updating } =
    useUpdateproject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProjectFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "planning",
      visibility: "private",
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "planning",
        visibility: (project.visibility as "public" | "private") || "private",
      });
    }
  }, [project, reset]);

  if (loading) {
    return <Loader variant="dots" title="Loading Project Settings..." />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The requested project could not be found or you don't have permission
          to access it.
        </p>
        <Link href={`/workspace/${workspaceId}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspace
          </Button>
        </Link>
      </div>
    );
  }

  const handleGeneralSubmit = async (data: ProjectFormData) => {
    try {
      await updateProject({
        workspaceId,
        projectId: project.id,
        projectData: data,
      });
      toast.success("Project settings updated successfully");
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update project settings");
    }
  };

  const handleToggleArchive = async () => {
    const targetStatus = project.status === "archived" ? "active" : "archived";
    try {
      await updateProject({
        workspaceId,
        projectId: project.id,
        projectData: { status: targetStatus },
      });
      toast.success(
        targetStatus === "archived"
          ? "Project archived successfully"
          : "Project restored to active state",
      );
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update project status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* --- UNIFIED HEADER COMPONENT WITH BACK BUTTON --- */}
      <Header
        title="Project Settings"
        subtitle={`Configure project details, collaborators, permissions, and lifecycle status.`}
        showBackButton
        onBack={() =>
          router.push(`/workspace/${workspaceId}/projects/${projectId}`)
        }
        actions={
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border shadow-xs",
              project.status === "active" &&
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
              project.status === "planning" &&
                "bg-blue-500/10 text-blue-500 border-blue-500/30",
              project.status === "on_hold" &&
                "bg-amber-500/10 text-amber-500 border-amber-500/30",
              project.status === "completed" &&
                "bg-purple-500/10 text-purple-500 border-purple-500/30",
              project.status === "archived" &&
                "bg-destructive/10 text-destructive border-destructive/30",
            )}
          >
            ● {project.status.replace("_", " ")}
          </Badge>
        }
      />

      {/* --- NAVIGATION TABS (Mobile Scrollable Segment Control) --- */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl overflow-x-auto scrollbar-none max-w-full border border-border/40 touch-pan-x">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap",
            activeTab === "general"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          )}
        >
          <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          General Details
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={cn(
            "flex-1 min-w-[140px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap",
            activeTab === "team"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          )}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          Collaborators
          <Badge className="ml-1 h-4 sm:h-5 bg-muted text-muted-foreground border-border text-[10px] px-1.5">
            {project.members?.length || 0}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("danger")}
          className={cn(
            "flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap",
            activeTab === "danger"
              ? "bg-destructive/10 text-destructive shadow-xs font-semibold"
              : "text-muted-foreground hover:text-destructive hover:bg-destructive/5",
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          Danger Zone
        </button>
      </div>

      {/* --- TAB CONTENT 1: GENERAL SETTINGS --- */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border/60 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden">
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                General Project Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Update basic details such as title, description, visibility, and
                current project lifecycle status.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleGeneralSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              <FormInput
                register={register}
                name="title"
                label="Project Title"
                placeholder="Enter project title"
                required
                field="input"
              />

              <FormInput
                register={register}
                name="description"
                label="Project Description"
                placeholder="Brief summary of what this project entails..."
                field="textarea"
                rows={4}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Project Status
                  </label>
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

                {/* Visibility Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Visibility
                  </label>
                  <select
                    {...register("visibility")}
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors cursor-pointer"
                  >
                    <option value="private">
                      Private (Workspace Team Only)
                    </option>
                    <option value="public">
                      Public (Open Workspace Access)
                    </option>
                  </select>
                </div>
              </div>

              {/* Created Info */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
                {project.created_by && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Owner: {project.created_by}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border/50">
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reset()}
                    disabled={updating}
                    className="w-full sm:w-auto h-10 sm:h-9"
                  >
                    Discard Changes
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={updating}
                  className="w-full sm:w-auto h-10 sm:h-9"
                >
                  {updating ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: COLLABORATORS & ACCESS --- */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-muted/20">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  Project Collaborators
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage members with explicit access to view, edit, or manage
                  this project.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setShowAddCollaboratorModal(true)}
                className="w-full sm:w-auto h-10 sm:h-9 shadow-xs"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Collaborator
              </Button>
            </div>

            <div className="divide-y divide-border/40">
              {!project.members || project.members.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-muted-foreground space-y-3">
                  <Users className="w-9 h-9 sm:w-10 sm:h-10 mx-auto opacity-40" />
                  <p className="text-sm font-medium">
                    No additional collaborators added yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Project owners and workspace administrators automatically
                    have access.
                  </p>
                </div>
              ) : (
                project.members.map((collab: any) => (
                  <div
                    key={collab.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border shadow-xs shrink-0">
                        <AvatarImage src={collab?.user?.avatar} />
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {collab?.user?.username?.[0]?.toUpperCase() ||
                            collab?.user?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground truncate">
                            {collab?.user?.username || "Workspace Member"}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 uppercase font-mono tracking-wider"
                          >
                            {collab?.permission || "READ"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {collab?.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto h-9 justify-center"
                        title="Remove Collaborator"
                        onClick={() =>
                          setCollaboratorToDelete({
                            isOpen: true,
                            collabId: collab.id,
                            userName:
                              collab?.user?.username ||
                              collab?.user?.email ||
                              "Member",
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-1.5 sm:mr-0" />
                        <span className="sm:hidden text-xs">
                          Remove Collaborator
                        </span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: DANGER ZONE --- */}
      {activeTab === "danger" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-destructive/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-destructive/20 bg-destructive/5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-destructive tracking-tight">
                  Danger Zone
                </h2>
                <p className="text-xs text-muted-foreground">
                  Irreversible and destructive actions for this project.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6 divide-y divide-border/40">
              {/* Archive Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {project.status === "archived" ? (
                      <ArchiveRestore className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <Archive className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    {project.status === "archived"
                      ? "Restore Project"
                      : "Archive Project"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    {project.status === "archived"
                      ? "Restore this project to the active workspace project directory."
                      : "Archiving hides this project from active navigation. Project data and tasks will remain intact."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleArchive}
                  className={cn(
                    "w-full sm:w-auto h-10 sm:h-9 shrink-0 justify-center",
                    project.status === "archived"
                      ? "border-blue-500/40 text-blue-500 hover:bg-blue-500/10"
                      : "border-amber-500/40 text-amber-500 hover:bg-amber-500/10",
                  )}
                >
                  {project.status === "archived" ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 mr-2" /> Restore
                      Project
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" /> Archive Project
                    </>
                  )}
                </Button>
              </div>

              {/* Delete Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-destructive shrink-0" />
                    Delete Project
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Permanently remove this project, its tasks, comments, and
                    member associations. This operation cannot be undone.
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto h-10 sm:h-9 shrink-0 shadow-xs justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}
      <AddProjectMemberModal
        isOpen={showAddCollaboratorModal}
        projectId={projectId as string}
        workspaceId={workspaceId}
        onClose={() => setShowAddCollaboratorModal(false)}
      />

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        projectId={projectId as string}
        workspaceId={workspaceId}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
        workspaceId={workspaceId}
      />

      <DeleteCollaboratorModal
        isOpen={collaboratorToDelete.isOpen}
        onClose={() =>
          setCollaboratorToDelete({
            isOpen: false,
            collabId: null,
            userName: "",
          })
        }
        projectId={projectId as string}
        userId={collaboratorToDelete.collabId || ""}
        userName={collaboratorToDelete.userName}
      />
    </div>
  );
};

export default ProjectSettingsPage;
