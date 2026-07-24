"use client";

import React from "react";
import ProjectModal from "./ProjectModal";
import { ProjectType } from "@/lib/types/project.types";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  project?: ProjectType;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  project,
}) => {
  return (
    <ProjectModal
      isOpen={isOpen}
      onClose={onClose}
      mode="delete"
      workspaceId={workspaceId}
      projectId={projectId}
      project={project}
    />
  );
};

export default DeleteProjectModal;
