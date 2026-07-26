"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Folder,
  FolderPlus,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Clock,
  Settings,
  Activity,
  CheckSquare,
  Sparkles,
  Plus,
  Crown,
  UserPlus,
  MessageSquare,
  FileText,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WorkspaceHomeMemberCard from "@/components/workspace/WorkspaceHomeMemberCard";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import AddProjectModal from "@/components/workspace/projects/AddProjectModal";
import ProjectCard from "@/components/workspace/projects/ProjectCard";

import { formatDate, timeAgo } from "@/lib/utils";
import { useGetWorkspaceDashboard } from "@/lib/hooks/workspace.hook";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ProjectType } from "@/lib/types/project.types";

const WorkspaceDashboard = () => {
  const { workspaceId, isAdminOrOwner, userRole } = useWorkspace();
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const router = useRouter();

  const { data: dashboard, isLoading: dashboardLoading } =
    useGetWorkspaceDashboard(workspaceId);

  if (dashboardLoading) {
    return <Loader page="dashboard" />;
  }

  if (!dashboard) return null;

  const totalTasks = dashboard.total_tasks || 0;
  const completedTasks = dashboard.completed_tasks || 0;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* --- UNIFIED HEADER WITH STATS CARDS --- */}

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-border shadow-xs shrink-0 overflow-hidden">
            <AvatarImage
              src={dashboard.workspace_logo}
              className="object-cover"
            />
            <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary/10 text-primary">
              {dashboard.workspace_name?.[0]?.toUpperCase() || "WS"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {dashboard.workspace_name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {dashboard.workspace_description ||
                "Welcome to your workspace dashboard. Here is a summary of your team's workload and recent updates."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-auto md:w-auto justify-center md:justify-end border-t md:border-t-0 border-border pt-4 md:pt-0">
          {isAdminOrOwner && (
            <>
              <Button
                size="sm"
                onClick={() => setIsAddProjectModalOpen(true)}
                className="rounded-md gap-2 text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </>
          )}
        </div>
      </div>
      <Header
        stats={[
          {
            title: "Active Projects",
            value: dashboard.total_projects || 0,
            icon: <Folder className="w-5 h-5 text-primary" />,
          },
          {
            title: "Members",
            value: dashboard.total_members || 0,
            icon: <Users className="w-5 h-5 text-purple-500" />,
          },
          {
            title: "Total Tasks",
            value: dashboard.total_tasks || 0,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Completion Rate",
            value: `${taskCompletionRate}%`,
            icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
          },
        ]}
      />

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. MY PRIORITIES */}
          {dashboard?.my_tasks?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  My Priorities
                </h2>
                <Badge variant="outline" className="text-xs font-medium">
                  {dashboard.my_tasks.length} Assigned
                </Badge>
              </div>

              <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden divide-y divide-border">
                {dashboard.my_tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() =>
                      router.push(
                        `/workspace/${workspaceId}/projects/${task.project_id}`,
                      )
                    }
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium truncate">
                            <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {task.project_title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <Badge
                        variant="outline"
                        className="text-[11px] capitalize font-medium px-2 py-0.5"
                      >
                        {task.priority || "normal"} priority
                      </Badge>

                      {task.due_date && (
                        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ACTIVE PROJECTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Active Projects
              </h2>
              <Link
                href={`/workspace/${workspaceId}/projects`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recent projects grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboard?.active_projects?.map((project: ProjectType) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  workspaceId={workspaceId}
                />
              ))}

              {(!dashboard?.active_projects ||
                dashboard.active_projects.length === 0) && (
                <div className="col-span-full p-8 border border-dashed border-border rounded-2xl text-center bg-muted space-y-3">
                  <Folder className="w-10 h-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">
                      No active projects yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create your first project to organize tasks and
                      collaborate with team members.
                    </p>
                  </div>
                  {isAdminOrOwner && (
                    <Button
                      onClick={() => setIsAddProjectModalOpen(true)}
                      size="sm"
                      className="rounded-xl gap-2 text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Create Project
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* RECENT ACTIVITY WIDGET */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </h3>
              <Link
                href={`/workspace/${workspaceId}/activity`}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {dashboard?.activities?.length > 0 ? (
                dashboard.activities.slice(0, 5).map((activity: any) => {
                  const meta = (() => {
                    switch (activity.action_type) {
                      case "create_project":
                        return {
                          label: "created project",
                          icon: (
                            <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
                          ),
                          badgeClass: "bg-blue-500/10 border-blue-500/20",
                        };
                      case "add_project_member":
                        return {
                          label: "added member to project",
                          icon: (
                            <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                          ),
                          badgeClass: "bg-purple-500/10 border-purple-500/20",
                        };
                      case "create_task":
                        return {
                          label: "created task",
                          icon: (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ),
                          badgeClass: "bg-emerald-500/10 border-emerald-500/20",
                        };
                      case "start_task":
                        return {
                          label: "started task",
                          icon: (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          ),
                          badgeClass: "bg-amber-500/10 border-amber-500/20",
                        };
                      case "complete_task":
                        return {
                          label: "completed task",
                          icon: (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ),
                          badgeClass: "bg-emerald-500/10 border-emerald-500/20",
                        };
                      case "comment":
                        return {
                          label: "commented on",
                          icon: (
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                          ),
                          badgeClass: "bg-indigo-500/10 border-indigo-500/20",
                        };
                      case "upload_document":
                        return {
                          label: "uploaded document",
                          icon: (
                            <FileText className="w-3.5 h-3.5 text-sky-500" />
                          ),
                          badgeClass: "bg-sky-500/10 border-sky-500/20",
                        };
                      case "delete_document":
                        return {
                          label: "deleted document",
                          icon: (
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          ),
                          badgeClass: "bg-rose-500/10 border-rose-500/20",
                        };
                      default:
                        return {
                          label: activity.action_type
                            ? activity.action_type.replace(/_/g, " ")
                            : "updated",
                          icon: (
                            <Activity className="w-3.5 h-3.5 text-slate-500" />
                          ),
                          badgeClass: "bg-muted border-border",
                        };
                    }
                  })();

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/40 transition-all duration-200"
                    >
                      <Avatar className="w-8 h-8 rounded-full border border-border shrink-0 mt-0.5">
                        <AvatarImage src={activity.actor_avatar} />
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {(activity.actor_name?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                          <span className="font-bold text-foreground truncate max-w-[120px]">
                            {activity.actor_name ||
                              activity.actor_username ||
                              "User"}
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {meta.label}
                          </span>
                          {activity.target_text && (
                            <span
                              className="font-semibold text-foreground bg-accent/50 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[140px]"
                              title={activity.target_text}
                            >
                              {activity.target_text}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          <span>{timeAgo(activity.created_at)}</span>
                        </div>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg border shrink-0 ${meta.badgeClass}`}
                      >
                        {meta.icon}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No recent activity logged.
                </p>
              )}
            </div>
          </div>

          {/* TEAM MEMBERS WIDGET */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Team Members
              </h3>
              <Link
                href={`/workspace/${workspaceId}/members`}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                See All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {dashboard.recent_members?.length > 0 ? (
                dashboard.recent_members
                  .slice(0, 4)
                  .map((member: any) => (
                    <WorkspaceHomeMemberCard member={member} key={member.id} />
                  ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No workspace members found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD PROJECT MODAL --- */}
      {isAdminOrOwner && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;
