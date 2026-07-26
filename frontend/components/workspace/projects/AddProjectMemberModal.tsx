"use client";

import React, { useState } from "react";
import { Search, Check, Shield, ShieldAlert, UserPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAddProjectCollab } from "@/lib/hooks/project.hook";
import { useGetWorkspaceMembers } from "@/lib/hooks/workspace.hook";

interface AddProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
}

const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  projectId,
}) => {
  const { data: members, isLoading: membersLoading } =
    useGetWorkspaceMembers(workspaceId);
  const { mutateAsync: addCollab } = useAddProjectCollab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [permission, setPermission] = useState<"read" | "write">("read");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter members based on search
  const filteredMembers = members?.filter(
    (member: any) =>
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      toast.error("Please select a member first");
      return;
    }

    setIsSubmitting(true);

    try {
      await addCollab({
        workspaceId,
        projectId,
        collabData: {
          user_id: selectedMemberId,
          permission,
        },
      });

      toast.success("Collaborator added successfully");
      handleClose();
    } catch (err: any) {
      toast.error(err?.detail || "Failed to add collaborator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedMemberId(null);
    setPermission("read");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden border-border/50 shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 space-y-1.5 text-left border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Add Project Collaborator
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Select a workspace member and assign their project permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Search Bar */}
          <Input
            placeholder="Search by email or username..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* 2. Members List (Scrollable) */}
          <div className="overflow-y-auto min-h-[160px] max-h-[220px] border border-border/60 rounded-xl divide-y divide-border/40 bg-muted/20">
            {membersLoading ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                Loading workspace members...
              </div>
            ) : filteredMembers?.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                No matching members found.
              </div>
            ) : (
              filteredMembers?.map((member: any) => {
                const isSelected = selectedMemberId === member.user.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.user.id)}
                    className={cn(
                      "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/10 border-l-4 border-primary pl-2.5"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary uppercase shrink-0">
                        {member.user.email[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium leading-none truncate">
                          {member.user.username || "Workspace Member"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Permission Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-foreground">Permission Level</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPermission("read")}
                className={cn(
                  "border rounded-xl p-3 cursor-pointer flex items-center gap-2.5 hover:border-primary transition-all",
                  permission === "read"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input"
                )}
              >
                <Shield className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Read Only</span>
                  <span className="text-[10px] text-muted-foreground">
                    View project tasks
                  </span>
                </div>
              </div>

              <div
                onClick={() => setPermission("write")}
                className={cn(
                  "border rounded-xl p-3 cursor-pointer flex items-center gap-2.5 hover:border-primary transition-all",
                  permission === "write"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input"
                )}
              >
                <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Write Access</span>
                  <span className="text-[10px] text-muted-foreground">
                    Edit & manage tasks
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border/40 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedMemberId || isSubmitting}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              {isSubmitting ? "Adding..." : "Add Collaborator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectMemberModal;
