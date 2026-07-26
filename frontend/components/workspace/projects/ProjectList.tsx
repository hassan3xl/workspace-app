"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FolderPlus,
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
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoading) return <Loader page="projects" />;

  // Filter Logic (Client side)
  const filteredProjects = projects?.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = projects?.length || 0;
  const completedCount =
    projects?.filter(
      (p) => p.status === "completed" || (p.item_count > 0 && p.completed_count === p.item_count),
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
        actions={
          isAdminOrOwner && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 rounded-xl text-xs px-5"
            >
              <Plus size={20} />{" "}
              <span className="hidden md:block">New Project</span>
            </Button>
          )
        }
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
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center py-2">
            {/* Search */}
            <Input
              placeholder="Search projects..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              containerClassName="w-full sm:w-80"
            />

            {/* Status Filter */}
            <Input
              variant="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "active" },
                { label: "Planning", value: "planning" },
                { label: "On Hold", value: "on_hold" },
                { label: "Completed", value: "completed" },
              ]}
              containerClassName="w-full sm:w-44"
            />
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
              No projects found matching your search and filter criteria.
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
