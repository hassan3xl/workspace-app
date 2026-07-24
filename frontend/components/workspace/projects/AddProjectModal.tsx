"use client";

import React from "react";
import ProjectModal from "./ProjectModal";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workspaceId: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaceId,
}) => {
  return (
    <ProjectModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      workspaceId={workspaceId}
      onSuccess={onSuccess}
    />
  );
};

export default AddProjectModal;
