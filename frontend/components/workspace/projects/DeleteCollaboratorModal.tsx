"use client";

import React, { useState } from "react";
import { UserX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/services/apiService";

interface DeleteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  userId: string;
  userName?: string;
}

const DeleteCollaboratorModal = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  userId,
  userName,
}: DeleteCollaboratorModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.delete(`api/projects/${projectId}/users/${userId}/`);
      toast.success("Collaborator removed successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.detail || "Failed to remove collaborator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden border-border/50 shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 space-y-1.5 text-left border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Remove Collaborator
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Revoke project access from this user.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm space-y-2">
            <p className="font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Confirm Removal
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {userName || "this contributor"}
              </span>{" "}
              from the project? They will lose access to project tasks and details.
            </p>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              {loading ? "Removing..." : "Remove User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCollaboratorModal;
