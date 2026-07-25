"use client";

import React, { useState } from "react";
import {
  Lock,
  Shield,
  Smartphone,
  Laptop,
  Loader2,
  Eye,
  EyeOff,
  Download,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useChangePassword } from "@/lib/hooks/account.hook";
import { extractApiError } from "@/lib/utils/api-error";
import { ProfilePType } from "@/lib/types/user.types";

interface ProfileSecurityTabProps {
  profile: ProfilePType | undefined | null;
}

export const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = ({
  profile,
}) => {
  const changePasswordMutation = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password1: "",
      new_password2: "",
    },
  });

  const newPasswordVal = watch("new_password1");

  const onSubmitPassword = async (data: any) => {
    try {
      await changePasswordMutation.mutateAsync({
        old_password: data.current_password,
        new_password1: data.new_password1,
        new_password2: data.new_password2,
      });
      reset();
    } catch (error: any) {
      toast.error(extractApiError(error));
    }
  };

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
      {/* Password Card */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />{" "}
            Password
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Use a strong password to protect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmitPassword)}
            className="space-y-3 sm:space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current_password" className="text-xs">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 bg-background h-9 text-sm"
                  {...register("current_password", {
                    required: "Required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-[10px] sm:text-xs text-destructive">
                  {String(errors.current_password.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_password1" className="text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new_password1"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 bg-background h-9 text-sm"
                    {...register("new_password1", {
                      required: "Required",
                      minLength: { value: 8, message: "Min 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.new_password1 && (
                  <p className="text-[10px] sm:text-xs text-destructive">
                    {String(errors.new_password1.message)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_password2" className="text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="new_password2"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background h-9 text-sm"
                  {...register("new_password2", {
                    required: "Required",
                    validate: (val) =>
                      val === newPasswordVal || "Passwords don't match",
                  })}
                />
                {errors.new_password2 && (
                  <p className="text-[10px] sm:text-xs text-destructive">
                    {String(errors.new_password2.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs h-8 sm:h-9"
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2FA Card */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />{" "}
                Two-Factor Auth
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Add an extra security layer.
              </CardDescription>
            </div>
            <Badge
              variant={twoFactorEnabled ? "default" : "outline"}
              className={`shrink-0 text-[10px] sm:text-xs ${
                twoFactorEnabled
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border bg-accent/20 gap-3">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-500 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold">
                  Authenticator App
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Use Google Authenticator or 1Password.
                </p>
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? "destructive" : "outline"}
              size="sm"
              className="text-[10px] sm:text-xs self-end sm:self-auto h-7 sm:h-8 shrink-0"
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                toast.info(
                  twoFactorEnabled ? "2FA disabled." : "2FA enabled!"
                );
              }}
            >
              {twoFactorEnabled ? "Disable" : "Set Up 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />{" "}
            Active Sessions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Devices logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-md bg-primary/20 text-primary shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold">
                    Web Browser
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/15 border-primary/25 text-primary"
                  >
                    Current
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Active now
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separator before danger section */}
      <Separator />

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
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> Are you
              sure?
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
