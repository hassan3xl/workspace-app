"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  CalendarDays,
  Target,
  CheckCircle2,
  Users,
  ArrowUpRight,
  Settings2,
} from "lucide-react";
import { ProjectType } from "@/lib/types/project.types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ProjectCardProps {
  project: ProjectType;
  workspaceId: string;
}

const ProjectCard = ({ project, workspaceId }: ProjectCardProps) => {
  const router = useRouter();
  const { isAdminOrOwner } = useWorkspace();

  const handleOpenProject = () => {
    router.push(`/workspace/${workspaceId}/projects/${project.id}`);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/workspace/${workspaceId}/projects/${project.id}/settings/`);
  };

  const handleRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    // apiService.requestCollaboration(project.id)
  };

  // Calculations
  const totalTasks = project.tasks?.length || 0;
  const completionPercentage =
    totalTasks > 0
      ? Math.round(((project.completed_count || 0) / totalTasks) * 100)
      : 0;

  // Visual Helpers
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "border-red-500/50 hover:border-red-500 shadow-red-900/10";
      case "medium":
        return "border-yellow-500/50 hover:border-yellow-500 shadow-yellow-900/10";
      case "low":
        return "border-green-500/50 hover:border-green-500 shadow-green-900/10";
      default:
        return "border-border hover:border-blue-500 shadow-blue-900/10";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div
      onClick={handleOpenProject}
      className={`
        group relative flex flex-col justify-between
        bg-card rounded-xl border p-5
        cursor-pointer transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${getPriorityColor(project.priority)}
      `}
    >
      {/* --- Header Section --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1 pr-8">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
        </div>
        {isAdminOrOwner && (
          <Settings2
            className="text-muted-foreground hover:text-primary"
            onClick={handleSettings}
          />
        )}
      </div>

      {/* --- Description --- */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
        {project.description || "No description provided."}
      </p>

      {/* --- Progress Section --- */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="font-bold text-primary">
            {completionPercentage}%
          </span>
        </div>
        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${completionPercentage}%` }}
          >
            {/* Shimmer effect on progress bar */}
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%]" />
          </div>
        </div>
      </div>

      {/* --- Footer (Collaborators & Stats) --- */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        {/* Collaborators Stack */}
        <div className="flex items-center -space-x-2">
          {(() => {
            const membersList = project.members?.length
              ? project.members
              : project.collaborators || [];
            
            return (
              <>
                {membersList.slice(0, 3).map((collab: any, i: number) => {
                  const userObj = collab?.user || collab;
                  const name = userObj?.username || userObj?.email || "U";
                  const initial = name[0]?.toUpperCase() || "U";
                  const avatarUrl = userObj?.avatar;

                  return (
                    <Avatar
                      key={collab?.id || i}
                      className="w-7 h-7 border-2 border-card ring-1 ring-border"
                    >
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {membersList.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                    +{membersList.length - 3}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Task Stat */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 bg-secondary/40 px-2 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span>
              {project.completed_count || 0}/{project.tasks?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
