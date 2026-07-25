"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Archive,
  FolderPlus,
  SlidersHorizontal,
  Folder,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useGetProjects } from "@/lib/hooks/project.hook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import AddProjectModal from "@/components/workspace/projects/AddProjectModal";
import ProjectCard from "@/components/workspace/projects/ProjectCard";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const ProjectList = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { workspaceId, isAdminOrOwner } = useWorkspace();
  const { data: projects, isLoading } = useGetProjects(workspaceId);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <Loader page="projects" />;

  // Filter Logic (Client side)
  const filteredProjects = projects?.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalCount = projects?.length || 0;
  const completedCount =
    projects?.filter(
      (p) => p.item_count > 0 && p.completed_count === p.item_count,
    ).length || 0;
  const activeCount = totalCount - completedCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Dashboard Header with Back Button */}
      <Header
        title="Projects Board"
        subtitle="Oversee, organize, and manage all initiatives within your workspace."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Active Projects",
            value: activeCount,
            icon: <Folder className="w-5 h-5 text-primary" />,
          },
          {
            title: "Completed",
            value: completedCount,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Pending Tasks",
            value:
              projects?.reduce(
                (acc, p) => acc + (p.item_count - p.completed_count),
                0,
              ) || 0,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
          },
          {
            title: "Total Projects",
            value: totalCount,
            icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
          },
        ]}
      />

      {/* 2. Controls & Grid */}
      {!projects || projects.length === 0 ? (
        // --- Empty State ---
        <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-border/60 rounded-2xl bg-card/40 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              No projects yet
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md mt-1">
              Create your first project to start tracking tasks, managing files,
              and collaborating with your team.
            </p>
          </div>
          {isAdminOrOwner && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 rounded-xl text-xs px-5"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </Button>
          )}
        </div>
      ) : (
        // --- Content State ---
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-2">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9 bg-card border-border/60 rounded-xl text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 sm:flex-none rounded-xl text-xs border-border/60"
              >
                <Link href={`/workspace/${workspaceId}/projects/archives/`}>
                  <Archive className="w-3.5 h-3.5 mr-1.5" />
                  Archives
                </Link>
              </Button>
              {isAdminOrOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-none rounded-xl text-xs border-border/60"
                  >
                    <Link href={`/workspace/${workspaceId}/projects/settings/`}>
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                      Settings
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none rounded-xl text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Project
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects?.map((project) => (
              <ProjectCard
                project={project}
                key={project.id}
                workspaceId={workspaceId}
              />
            ))}
          </div>

          {filteredProjects?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No projects found matching "
              <span className="font-medium text-foreground">{searchTerm}</span>"
            </div>
          )}
        </div>
      )}

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default ProjectList;
