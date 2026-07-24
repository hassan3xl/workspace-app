"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  Plus,
  Edit3,
  Trash2,
  Shield,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Settings2,
  Folder,
  Users,
  Search,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/Loader";

// Modals & Components
import CommentComponent from "@/components/workspace/task/CommentComponent";

// Hooks & Context
import {
  useCompleteTask,
  useDeleteTask,
  useGetProject,
  useStartTask,
} from "@/lib/hooks/project.hook";
import { ProjectType } from "@/lib/types/project.types";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import AddTaskModal from "@/components/workspace/task/AddTaskModal";
import EditTaskModal from "@/components/workspace/task/EditTaskModal";
import { canPerformProjectAction } from "@/lib/utils/permissions";

const ProjectDetails = () => {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;
  const { workspaceId, isAdminOrOwner, userRole } = useWorkspace();

  // Local State
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    itemId: string;
    initialData: ProjectType["tasks"][number] | null;
  }>({
    isOpen: false,
    itemId: "",
    initialData: null,
  });

  // API Hooks
  const {
    data: project,
    isLoading: loading,
    isError: error,
  } = useGetProject(workspaceId, projectId as string);

  const { mutateAsync: completeTask, isPending: completingTask } =
    useCompleteTask();
  const { mutateAsync: startTask, isPending: startingTask } = useStartTask();
  const { mutateAsync: deleteItem, isPending: deletingItem } = useDeleteTask();

  // Handlers
  const openEditModal = (itemId: string) => {
    const itemToEdit = project?.tasks.find((item) => item.id === itemId);
    if (itemToEdit)
      setEditModalState({ isOpen: true, itemId, initialData: itemToEdit });
  };

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await startTask({
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        taskId,
      });
      toast.success("Task started");
    } catch (err) {
      toast.error("Failed to start task");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask({
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        taskId,
      });
      toast.success("Task completed");
    } catch (err) {
      toast.error("Failed to complete task");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!workspaceId || !projectId) return;

    try {
      await deleteItem({
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        itemId,
      });
      toast.success("Task deleted");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Helper Functions
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "pending":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "cancelled":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border/60";
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-amber-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-border";
    }
  };

  if (loading) {
    return <Loader variant="dots" title="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="p-12 text-center text-destructive">
        Error loading project details. Please try again.
      </div>
    );
  }

  // Derived Stats
  const total = project.tasks.length;
  const completed = project.tasks.filter(
    (i) => i.status === "completed",
  ).length;
  const inProgress = project.tasks.filter(
    (i) => i.status === "in_progress",
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const canEdit = canPerformProjectAction(
    userRole,
    project.user_permission,
    "write",
  );

  // Filtered Tasks
  const filteredTasks = project.tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* --- UNIFIED HEADER COMPONENT WITH BACK BUTTON --- */}
      <Header
        title={project.title}
        subtitle={
          project.description ||
          "Organize tasks, track milestone progress, and collaborate with project members."
        }
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}/projects`)}
        stats={[
          {
            title: "Project Progress",
            value: `${percentage}%`,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Total Tasks",
            value: total,
            icon: <ListTodo className="w-5 h-5 text-primary" />,
          },
          {
            title: "In Progress",
            value: inProgress,
            icon: <PlayCircle className="w-5 h-5 text-blue-500" />,
          },
          {
            title: "Team Members",
            value: project.members?.length || 0,
            icon: <Users className="w-5 h-5 text-purple-500" />,
          },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {["admin", "owner", "member"].includes(userRole) && (
              <Button
                onClick={() => setProjectModalOpen(true)}
                className="rounded-xl gap-2 text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Task
              </Button>
            )}
            {isAdminOrOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/workspace/${workspaceId}/projects/${project.id}/settings/`,
                  )
                }
                className="rounded-xl gap-2 text-xs border-border/60"
              >
                <Settings2 className="w-4 h-4" /> Settings
              </Button>
            )}
          </div>
        }
      />

      {/* --- PROJECT SUMMARY CARD WITH PROGRESS BAR & TEAM --- */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          {/* Identity & Metadata */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Folder className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {project.title}
              </h2>
              <Badge
                variant="outline"
                className="h-6 gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px] font-medium"
              >
                <Shield className="w-3 h-3" />
                {project?.user_permission?.permission || "Member"}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {project.description || "No project description provided."}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Created {format(new Date(project.created_at), "MMMM d, yyyy")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-purple-500" />
                {project.members?.length || 0} Collaborators
              </span>
            </div>
          </div>

          {/* Team Avatars & Progress Block */}
          <div className="w-full md:w-72 bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3 shrink-0">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="text-foreground">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2 rounded-full" />

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Team
              </span>
              <div className="flex items-center -space-x-2">
                {project.members?.slice(0, 4).map((member: any) => (
                  <Avatar
                    key={member.user.id}
                    className="w-7 h-7 border-2 border-background ring-1 ring-border shrink-0"
                  >
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {member.user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(project.members?.length || 0) > 4 && (
                  <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold border-2 border-background">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TASKS SECTION --- */}
      <div className="space-y-5">
        {/* Section Header & Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Project Tasks
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredTasks.length}
            </Badge>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="pl-9 bg-card border-border/60 rounded-xl text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-card border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Task List / Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border/60 text-center space-y-3 p-6">
            <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50">
              <ListTodo className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-base">No tasks found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {taskSearch || statusFilter !== "all"
                  ? "Try adjusting your search query or status filter."
                  : "Create a task to get your project moving forward."}
              </p>
            </div>
            {["admin", "owner", "member"].includes(userRole) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectModalOpen(true)}
                className="rounded-xl gap-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Create Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map((item) => (
              <div
                key={item.id}
                className={`
                  group bg-card hover:bg-muted/30 transition-all duration-200 
                  rounded-2xl border border-border/60 overflow-hidden shadow-xs
                  ${getPriorityBorder(item.priority)} border-l-4
                `}
              >
                {/* Task Summary Row */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className="mt-0.5 sm:mt-0 shrink-0">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : item.status === "in_progress" ? (
                        <PlayCircle className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm sm:text-base truncate transition-colors ${
                          item.status === "completed"
                            ? "text-muted-foreground line-through"
                            : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize ${getStatusBadge(
                            item.status,
                          )}`}
                        >
                          {item.status.replace("_", " ")}
                        </span>

                        {item.due_date && (
                          <span className="flex items-center gap-1">
                            • Due {format(new Date(item.due_date), "MMM d")}
                          </span>
                        )}

                        {item.assigned_to && (
                          <span className="flex items-center gap-1">
                            • Assigned: {item.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                    {item.priority && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-medium px-2 py-0.5"
                      >
                        {item.priority}
                      </Badge>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.comments?.length || 0}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground rounded-lg"
                    >
                      {expandedTaskId === item.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {expandedTaskId === item.id && (
                  <div className="bg-muted/30 border-t border-border/60 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200 space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Task Description
                          </h4>
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {item.description || "No description provided."}
                          </p>
                        </div>

                        {item.started_by && (
                          <div className="text-xs text-muted-foreground bg-card p-2.5 rounded-xl border border-border/60 inline-block">
                            Started by:{" "}
                            <span className="text-foreground font-medium">
                              {item.started_by}
                            </span>
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Actions
                          </h4>

                          {item.status !== "completed" && (
                            <>
                              {item.status !== "in_progress" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="justify-start border-blue-500/30 text-blue-500 hover:bg-blue-500/10 rounded-xl text-xs"
                                  onClick={() => handleStartTask(item.id)}
                                  disabled={startingTask}
                                >
                                  <PlayCircle className="w-3.5 h-3.5 mr-2" />{" "}
                                  Start Task
                                </Button>
                              )}
                              {item.status === "in_progress" && (
                                <Button
                                  size="sm"
                                  className="justify-start bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                                  onClick={() => handleCompleteTask(item.id)}
                                  disabled={completingTask}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" />{" "}
                                  Mark Complete
                                </Button>
                              )}
                            </>
                          )}

                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1 rounded-xl text-xs"
                              onClick={() => openEditModal(item.id)}
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 rounded-xl text-xs"
                              onClick={() => setDeleteTarget(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />{" "}
                              {deletingItem ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border/60">
                      <CommentComponent
                        itemId={item.id}
                        isOpen={true}
                        workspaceId={workspaceId}
                        projectId={projectId as string}
                        comments={item.comments}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS & DIALOGS --- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              Delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action cannot be undone. All comments associated with this
              task will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteItem(deleteTarget)}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              {deletingItem ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskModal
        initialData={editModalState.initialData}
        isOpen={editModalState.isOpen}
        itemId={editModalState.itemId}
        projectId={projectId as string}
        workspaceId={workspaceId as string}
        onClose={() => setEditModalState({ ...editModalState, isOpen: false })}
      />

      <AddTaskModal
        isOpen={isProjectModalOpen}
        projectId={projectId as string}
        workspaceId={workspaceId as string}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
};

export default ProjectDetails;
