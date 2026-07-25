"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProfilePType } from "@/lib/types/user.types";

interface ProfileDangerTabProps {
  profile: ProfilePType | undefined | null;
}

export const ProfileDangerTab: React.FC<ProfileDangerTabProps> = ({
  profile,
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `profile-data-${profile?.username || "user"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Profile data exported!");
  };

  const handleDeleteAccount = () => {
    if (
      confirmUsername !== profile?.username &&
      confirmUsername !== "delete"
    ) {
      toast.error("Confirmation text does not match");
      return;
    }
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      toast.error("Please contact system administrator to delete account.");
      setDeleteOpen(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full min-w-0">
      {/* Export Data */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />{" "}
            Export Data
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Download your profile info as JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs sm:text-sm font-medium">Download Archive</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Export profile, workspace list, and settings.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportData}
              className="gap-1.5 text-[10px] sm:text-xs h-7 sm:h-8 shrink-0"
            >
              <Download className="w-3 h-3" /> Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5 overflow-hidden w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <CardTitle className="text-base sm:text-lg font-semibold">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription className="text-destructive/80 text-xs sm:text-sm">
            Irreversible account actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/30 bg-background p-3 gap-3">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs sm:text-sm font-semibold">Delete Account</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="text-[10px] sm:text-xs gap-1.5 h-7 sm:h-8 shrink-0"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-3 h-3" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> Are you sure?
            </DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs">
              This cannot be undone. Type{" "}
              <span className="font-bold text-foreground">
                {profile?.username || "delete"}
              </span>{" "}
              to confirm:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={`Type "${profile?.username || "delete"}"`}
              className="text-sm h-9"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={
                deleting ||
                (confirmUsername !== profile?.username &&
                  confirmUsername !== "delete")
              }
              onClick={handleDeleteAccount}
              className="gap-1.5 h-8 text-xs"
            >
              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
