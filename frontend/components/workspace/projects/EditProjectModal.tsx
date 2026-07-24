"use client";

import React from "react";
import ProjectModal from "./ProjectModal";
import { ProjectType } from "@/lib/types/project.types";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workspaceId: string;
  project: ProjectType;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaceId,
  project,
}) => {
  return (
    <ProjectModal
      isOpen={isOpen}
      onClose={onClose}
      mode="edit"
      workspaceId={workspaceId}
      project={project}
      onSuccess={onSuccess}
    />
  );
};

export default EditProjectModal;
