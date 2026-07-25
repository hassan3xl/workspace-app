"use client";

import React, { useState } from "react";
import { LayoutDashboard, User, Lock, Bell } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Profile Components
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileOverviewTab } from "@/components/profile/ProfileOverviewTab";
import { ProfileFormTab } from "@/components/profile/ProfileFormTab";
import { ProfileSecurityTab } from "@/components/profile/ProfileSecurityTab";
import { ProfilePreferencesTab } from "@/components/profile/ProfilePreferencesTab";

// Hooks
import { useGetProfile, useUploaadAvatar } from "@/lib/hooks/account.hook";
import {
  useGetWorkspaces,
  useGetWorkspaceInvitations,
} from "@/lib/hooks/workspace.hook";

const sidebarNavItems = [
  { title: "Overview", icon: LayoutDashboard, id: "overview" },
  { title: "Profile", icon: User, id: "profile" },
  { title: "Security", icon: Lock, id: "security" },
  { title: "Preferences", icon: Bell, id: "preferences" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: workspaces = [] } = useGetWorkspaces();
  const { data: invitations = [] } = useGetWorkspaceInvitations();
  const uploadAvatar = useUploaadAvatar();

  const handleHeaderAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    toast.promise(uploadAvatar.mutateAsync(formData), {
      loading: "Uploading avatar...",
      success: "Avatar updated successfully!",
      error: "Failed to upload avatar",
    });
  };

  if (isProfileLoading) {
    return (
      <div className="w-full min-w-0 space-y-5 pb-8 animate-in fade-in duration-300">
        {/* Profile Header Skeleton */}
        <div className="w-full p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 w-full flex flex-col items-center sm:items-start">
              <Skeleton className="h-6 w-40 max-w-full rounded-md" />
              <Skeleton className="h-4 w-56 max-w-full rounded-md" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 w-full min-w-0">
          <div className="w-full lg:w-56 shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none w-full">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 lg:w-full rounded-lg shrink-0" />
              ))}
            </div>
          </div>
          <div className="flex-1 w-full space-y-4">
            <Skeleton className="h-48 sm:h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-8 space-y-5">
      {/* Profile Header Card */}
      <ProfileHeader
        profile={profile}
        workspacesCount={workspaces?.length || 0}
        invitationsCount={invitations?.length || 0}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAvatarUpload={handleHeaderAvatarUpload}
        isUploadingAvatar={uploadAvatar.isPending}
      />

      {/* Tab Navigation — horizontal scroll on mobile, vertical sidebar on lg */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 w-full min-w-0">
        <aside className="w-full lg:w-56 shrink-0 min-w-0">
          <div className="lg:sticky lg:top-20 w-full min-w-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none w-full min-w-0">
              {sidebarNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`flex items-center gap-2 shrink-0 h-9 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                    />
                    <span className="whitespace-nowrap">{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <ProfileOverviewTab
              profile={profile}
              workspaces={workspaces}
              invitations={invitations}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "profile" && <ProfileFormTab profile={profile} />}
          {activeTab === "security" && <ProfileSecurityTab profile={profile} />}
          {activeTab === "preferences" && <ProfilePreferencesTab />}
        </main>
      </div>
    </div>
  );
}
