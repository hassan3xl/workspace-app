"use client";

import React from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Building2,
  Inbox,
  Sparkles,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProfilePType } from "@/lib/types/user.types";
import SignoutButton from "../auth/SignoutButton";

interface ProfileHeaderProps {
  profile: ProfilePType | undefined | null;
  workspacesCount: number;
  invitationsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingAvatar?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  workspacesCount,
  invitationsCount,
  setActiveTab,
  onAvatarUpload,
}) => {
  let completedFields = 0;
  const totalFields = 5;
  if (profile?.first_name) completedFields++;
  if (profile?.last_name) completedFields++;
  if (profile?.username) completedFields++;
  if (profile?.bio) completedFields++;
  if (profile?.avatar) completedFields++;
  const completionPercent = Math.round((completedFields / totalFields) * 100);

  const fullName =
    profile?.full_name ||
    (profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : profile?.username || "User");

  return (
    <div className="w-full min-w-0 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="h-24 sm:h-36 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        {/* Verified badge — top right */}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 gap-1 bg-primary/15 text-primary border-primary/25 font-semibold text-[10px] sm:text-xs backdrop-blur-sm shadow-sm"
        >
          <CheckCircle2 className="w-3 h-3" /> Verified Member
        </Badge>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative w-full min-w-0">
        {/* Avatar + Info row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 w-full min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 sm:h-28 sm:w-28 rounded-xl border-4 border-card shadow-lg bg-card">
              <AvatarImage
                src={profile?.avatar}
                alt={fullName}
                className="object-cover rounded-lg"
              />
              <AvatarFallback className="rounded-lg text-lg sm:text-2xl font-bold bg-primary/10 text-primary">
                {fullName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="headerAvatarInput"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-card border border-border shadow-md hover:bg-accent cursor-pointer transition-colors"
              title="Change Avatar"
            >
              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
              <input
                id="headerAvatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
              />
            </label>
          </div>

          {/* Name + Meta + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 w-full min-w-0 text-center sm:text-left">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
                  {fullName}
                </h1>
                {!profile?.first_name && !profile?.last_name && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold"
                  >
                    Name Not Set
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground flex-wrap">
                {profile?.username && (
                  <span className="font-medium text-foreground/70">
                    @{profile.username}
                  </span>
                )}
                {profile?.user?.email && (
                  <span className="flex items-center gap-1 min-w-0">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-none">
                      {profile.user.email}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Sign out */}
            <div className="flex justify-center sm:justify-end w-full sm:w-auto shrink-0">
              <SignoutButton className="flex items-center justify-center gap-2 h-8 px-4 rounded-lg text-xs font-medium text-destructive/80 hover:text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/15 transition-colors" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="gap-2 sm:gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="flex flex-col justify-center p-2 sm:p-3 rounded-lg bg-accent/30 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium">
              <span className="flex items-center gap-1 text-muted-foreground">
                <UserIcon className="w-3 h-3 text-amber-500" /> Profile
              </span>
              <span className="font-bold text-primary">
                {completionPercent}%
              </span>
            </div>
            <Progress
              value={completionPercent}
              className="h-1.5 bg-secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
