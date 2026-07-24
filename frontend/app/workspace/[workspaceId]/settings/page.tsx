"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Settings,
  Trash2,
  Clock,
  XCircle,
  Mail,
  Crown,
  Upload,
  UserPlus,
  ArrowLeft,
  Search,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/input/formInput";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import InviteWorkspaceMember from "@/components/modals/InviteWorkspaceMember";
import Header from "@/components/Header";

import {
  useGetWorkspace,
  useUpdateWorkspace,
  useUploadWorkspaceImage,
  useUpdateWorkspaceMemberRole,
  useDeleteWorkspace,
  useKickUser,
  useGetWorkspacePendingInvitations,
  useCancelWorkspaceInvitation,
} from "@/lib/hooks/workspace.hook";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditForm = {
  name: string;
  description: string;
  visibility: string;
};

const WorkspaceSettingsPage = () => {
  const router = useRouter();
  const { workspaceId, userRole, isAdminOrOwner } = useWorkspace();

  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspace(workspaceId);
  const { data: pendingInvites, isLoading: invitesLoading } =
    useGetWorkspacePendingInvitations(workspaceId);

  const updateWorkspace = useUpdateWorkspace();
  const { mutateAsync: uploadLogo, isPending: isUploadingLogo } =
    useUploadWorkspaceImage();
  const { mutateAsync: updateRoleAsync } = useUpdateWorkspaceMemberRole();
  const deleteWorkspace = useDeleteWorkspace();
  const kickUser = useKickUser();
  const cancelInviteMutation = useCancelWorkspaceInvitation();

  const [activeTab, setActiveTab] = useState<
    "general" | "members" | "invites" | "danger"
  >("general");

  if (workspaceLoading) {
    return <Loader page="settings" />;
  }
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // Logo Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Members search state
  const [memberSearch, setMemberSearch] = useState("");

  const { register, handleSubmit, reset } = useForm<EditForm>({
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name || "",
        description: workspace.description || "",
        visibility: workspace.visibility || "private",
      });
    }
  }, [workspace, reset]);

  // Clean up object URL memory leak on unmount or file change
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  if (workspaceLoading) {
    return <Loader variant="dots" title="Loading Workspace Settings..." />;
  }

  if (!workspace) {
    return null;
  }

  if (!isAdminOrOwner) {
    router.push(`/workspace/${workspaceId}`);
    return null;
  }

  // File Select Handler with Real-time Preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be under 2MB.");
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleClearPreview = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setSelectedFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("logo", selectedFile);

    try {
      await uploadLogo({ workspaceId, formData });
      toast.success("Workspace logo updated successfully!");
      handleClearPreview();
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update workspace logo");
    }
  };

  const handleGeneralSubmit = async (data: EditForm) => {
    try {
      await updateWorkspace.mutateAsync({ workspaceId, workspaceData: data });
      toast.success("Workspace settings updated successfully");
    } catch (error: any) {
      toast.error(error?.detail || "Failed to update workspace");
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    await toast.promise(
      updateRoleAsync({ workspaceId, userId: memberId, data: { role } }),
      {
        loading: "Updating member role...",
        success: "Role updated successfully",
        error: "Failed to update role",
      },
    );
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await kickUser.mutateAsync({ workspaceId, userId: memberToRemove.id });
      setMemberToRemove(null);
    } catch (error) {}
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteMutation.mutateAsync(inviteId);
    } catch (error) {}
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      router.push("/workspace");
    } catch (error) {}
  };

  // Filtered members list
  const filteredMembers = (workspace.members || []).filter((m: any) => {
    const email = m.user?.email || "";
    const role = m.role || "";
    return (
      email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      role.toLowerCase().includes(memberSearch.toLowerCase())
    );
  });

  const activeInvitesList = Array.isArray(pendingInvites) ? pendingInvites : [];

  return (
    <div className="pb-12">
      {/* --- REUSABLE HEADER WITH BACK BUTTON & VISIBILITY BADGE --- */}
      <Header
        title={workspace.name}
        subtitle="Manage workspace settings, member permissions, and invitations"
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        actions={
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1"
          >
            {workspace.visibility || "Private"}
          </Badge>
        }
      />

      {/* --- WORKSPACE SUMMARY CARD WITH LIVE LOGO PREVIEW --- */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Logo & Real-Time Preview Area */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-border/60 shadow-sm transition-all overflow-hidden">
                <AvatarImage
                  src={logoPreview || workspace.logo}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {workspace.name?.substring(0, 2)?.toUpperCase() || "WS"}
                </AvatarFallback>
              </Avatar>

              {logoPreview && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-in zoom-in-50">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Logo Actions */}
            {!logoPreview ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full text-xs gap-2 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                Change Logo
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveLogo}
                  disabled={isUploadingLogo}
                  className="flex-1 text-xs gap-1.5 rounded-xl"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isUploadingLogo ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearPreview}
                  disabled={isUploadingLogo}
                  className="text-xs p-2 rounded-xl"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {workspace.name}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-muted-foreground mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Created {formatDate(workspace.created_at)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  {workspace.members?.length || 0} Members
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {workspace.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>

      {/* --- RESPONSIVE TOUCH TABS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border/50">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeTab === "general"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          General
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeTab === "members"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          Members
          <Badge
            variant="secondary"
            className="px-1.5 py-0 text-[10px] rounded-full"
          >
            {workspace.members?.length || 0}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("invites")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeTab === "invites"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          Invites
          {activeInvitesList.length > 0 && (
            <Badge
              variant="default"
              className="px-1.5 py-0 text-[10px] rounded-full bg-amber-500 hover:bg-amber-600"
            >
              {activeInvitesList.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("danger")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeTab === "danger"
              ? "bg-destructive/10 text-destructive shadow-xs font-semibold"
              : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          Danger Zone
        </button>
      </div>

      {/* --- TAB CONTENT 1: GENERAL SETTINGS --- */}
      {activeTab === "general" && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              General Workspace Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update the name, description, and visibility of this workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleGeneralSubmit)}
            className="space-y-5"
          >
            <FormInput
              register={register}
              name="name"
              label="Workspace Name"
              placeholder="Enter workspace name"
              type="text"
            />

            <FormInput
              register={register}
              name="description"
              label="Workspace Description"
              placeholder="Brief description of the workspace"
              type="text"
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateWorkspace.isPending}
                className="w-full sm:w-auto rounded-xl px-6"
              >
                {updateWorkspace.isPending
                  ? "Saving Changes..."
                  : "Save Workspace Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB CONTENT 2: MEMBERS MANAGEMENT --- */}
      {activeTab === "members" && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Workspace Members
                <Badge variant="outline" className="text-xs">
                  {filteredMembers.length}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage roles and permissions for workspace users.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                size="sm"
                onClick={() => setOpenInviteModal(true)}
                className="rounded-xl gap-2 text-xs shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite Member
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {filteredMembers.map((member: any) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 rounded-full border border-border/50 shrink-0">
                    <AvatarImage src={member.user?.avatar} />
                    <AvatarFallback className="font-bold bg-primary/10 text-primary">
                      {(member.user?.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {member.user?.full_name || member.user?.email}
                      </span>
                      {member.role === "owner" && (
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <Badge
                    variant="outline"
                    className={`capitalize text-xs font-semibold px-2.5 py-1 ${
                      member.role === "owner"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : member.role === "admin"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-muted text-muted-foreground border-border/60"
                    }`}
                  >
                    {member.role}
                  </Badge>

                  {member.role !== "owner" && isAdminOrOwner && (
                    <div className="flex items-center gap-2">
                      <select
                        className="px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        defaultValue={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.user.id, e.target.value)
                        }
                      >
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                        <option value="admin">Admin</option>
                      </select>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setMemberToRemove({
                            id: member.user.id,
                            email: member.user.email,
                          })
                        }
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: LIVE PENDING INVITATIONS --- */}
      {activeTab === "invites" && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Pending Invitations
                <Badge variant="outline" className="text-xs">
                  {activeInvitesList.length}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active invites awaiting user response.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setOpenInviteModal(true)}
              className="rounded-xl gap-2 text-xs w-full sm:w-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Invitation
            </Button>
          </div>

          <div className="p-4 sm:p-6">
            {invitesLoading ? (
              <Loader variant="dots" title="Loading Pending Invites..." />
            ) : activeInvitesList.length > 0 ? (
              <div className="space-y-3">
                {activeInvitesList.map((invite: any) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {invite.invited_user?.email ||
                            invite.email ||
                            "Pending User"}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium border border-blue-500/20">
                            {invite.role || "Member"}
                          </span>
                          <span>•</span>
                          <span>
                            Sent {formatDate(invite.created_at || Date.now())}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelInvite(invite.id)}
                      disabled={cancelInviteMutation.isPending}
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 w-full sm:w-auto rounded-xl gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Invite
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-40 text-muted-foreground" />
                <p className="font-medium text-sm">No pending invitations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Invitations you send to new members will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: DANGER ZONE --- */}
      {activeTab === "danger" && (
        <div className="bg-card rounded-2xl border border-destructive/30 p-4 sm:p-6 space-y-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-destructive tracking-tight">
                Delete Workspace
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Permanently delete this workspace and all associated projects,
                tasks, and data. This action is irreversible.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex justify-end">
            <Button
              variant="destructive"
              onClick={() => setOpenDeleteDialog(true)}
              className="w-full sm:w-auto rounded-xl px-6 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Workspace
            </Button>
          </div>
        </div>
      )}

      {/* --- MODAL 1: INVITE MEMBER MODAL --- */}
      <InviteWorkspaceMember
        isOpen={openInviteModal}
        onClose={() => setOpenInviteModal(false)}
        workspaceId={workspaceId}
      />

      {/* --- MODAL 2: CONFIRM MEMBER KICK DIALOG --- */}
      <Dialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <DialogContent className="sm:max-w-md border-border/60">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Remove Workspace Member
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {memberToRemove?.email}
              </span>{" "}
              from this workspace?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={kickUser.isPending}
            >
              {kickUser.isPending ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: DELETE WORKSPACE DIALOG --- */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md border-border/60">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">
              Delete Workspace
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {workspace.name}
              </span>
              ? All projects and member access will be permanently lost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceSettingsPage;
