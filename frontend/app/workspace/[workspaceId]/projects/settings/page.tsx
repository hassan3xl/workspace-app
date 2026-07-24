"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Folder,
  Settings,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetProjects } from "@/lib/hooks/project.hook";
import AddProjectModal from "@/components/workspace/projects/AddProjectModal";
import { formatDate } from "@/lib/utils";

const ProjectsSettingsPage = () => {
  const { workspaceId, isAdminOrOwner } = useWorkspace();
  const { data: projects, isLoading: loading } = useGetProjects(workspaceId);

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");

  if (loading) {
    return <Loader variant="dots" title="Loading Workspace Projects..." />;
  }

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "active") {
      return matchesSearch && project.status !== "archived";
    }
    if (filterStatus === "archived") {
      return matchesSearch && project.status === "archived";
    }
    return matchesSearch;
  });

  const totalCount = projects?.length || 0;
  const activeCount =
    projects?.filter((p) => p.status !== "archived").length || 0;
  const archivedCount =
    projects?.filter((p) => p.status === "archived").length || 0;

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Projects Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Overview and configuration for all projects within this
                workspace.
              </p>
            </div>
          </div>
        </div>

        {isAdminOrOwner && (
          <Button
            onClick={() => setShowAddProjectModal(true)}
            className="w-full sm:w-auto h-10 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Project
          </Button>
        )}
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-xl border border-border/60 p-3.5 sm:p-5 space-y-1">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Projects
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border/60 p-3.5 sm:p-5 space-y-1">
          <p className="text-[11px] sm:text-xs font-medium text-green-500 uppercase tracking-wider">
            Active
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {activeCount}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border/60 p-3.5 sm:p-5 space-y-1">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Archived
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {archivedCount}
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/40 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex-1 sm:flex-initial text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "all"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`flex-1 sm:flex-initial text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "active"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus("archived")}
            className={`flex-1 sm:flex-initial text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "archived"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden">
        <div className="divide-y divide-border/40">
          {!filteredProjects || filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <Folder className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-medium">No projects found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? "Try searching with a different keyword."
                  : "Get started by creating your first project."}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/workspace/${workspaceId}/projects/${project.id}`}
                      className="font-semibold text-base text-foreground hover:text-primary transition-colors truncate"
                    >
                      {project.title}
                    </Link>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 capitalize font-medium border-border"
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 flex-wrap">
                    <span>Tasks: {project.tasks?.length || 0}</span>
                    <span>Members: {project.members?.length || 0}</span>
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <Link
                    href={`/workspace/${workspaceId}/projects/${project.id}/settings`}
                  >
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      <Settings className="w-3.5 h-3.5 mr-1.5" />
                      Settings
                    </Button>
                  </Link>
                  <Link
                    href={`/workspace/${workspaceId}/projects/${project.id}`}
                  >
                    <Button variant="ghost" size="sm" className="h-9 px-3">
                      View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default ProjectsSettingsPage;
