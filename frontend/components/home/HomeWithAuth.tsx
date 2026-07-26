"use client";

import React from "react";
import Link from "next/link";
import {
  Layout,
  ArrowRight,
  Plus,
  Sparkles,
  Building2,
  Crown,
  Users,
  Sun,
  Moon,
  Compass,
  User,
  ShieldCheck,
} from "lucide-react";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";
import { useGetWorkspaces } from "@/lib/hooks/workspace.hook";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const HomeWithAuth = ({ user }: { user: any }) => {
  const { user: authUser } = useAuth();
  const { data: workspaces = [] } = useGetWorkspaces();

  // Prefer reactive profile from auth context over static session prop
  const activeUser = authUser || user;

  const fullName = [activeUser?.first_name, activeUser?.last_name]
    .filter(Boolean)
    .join(" ");
  const userDisplayName =
    activeUser?.username ||
    fullName ||
    activeUser?.user?.email ||
    activeUser?.email ||
    "User";

  const avatarUrl = activeUser?.avatar;

  const recentWorkspaces = workspaces?.slice(0, 4) || [];
  const ownedCount =
    workspaces?.filter((ws: any) => ws.user_role === "owner").length || 0;

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const GreetingIcon = hour >= 6 && hour < 18 ? Sun : Moon;

  return (
    <div className="h-full w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* --- HERO WELCOME COMMAND BANNER --- */}
      <div className="relative overflow-hidden rounded-2xl sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-primary/30 shadow-md shrink-0">
              <AvatarImage
                src={avatarUrl}
                alt={userDisplayName}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {userDisplayName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <GreetingIcon className="w-5 h-5 text-amber-500 shrink-0" />
                  {timeGreeting}, {userDisplayName}!
                </span>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                Welcome back. Jump straight into your recent projects or launch
                a new workspace for your team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto w-full md:w-auto">
            <Link href="/workspace" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 text-xs sm:text-sm h-10 px-4 bg-background/80 hover:bg-background border-border font-semibold"
              >
                <Compass className="w-4 h-4 text-primary" />
                All Workspaces
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- HIGH-LEVEL STAT CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/80 shadow-xs hover:border-primary/40 transition-all duration-200 group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {workspaces.length}
            </h3>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            Active Workspaces
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/80 shadow-xs hover:border-amber-500/40 transition-all duration-200 group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {ownedCount}
            </h3>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            Owned Workspaces
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-card rounded-2xl p-4 sm:p-5 border border-border/80 shadow-xs hover:border-purple-500/40 transition-all duration-200 group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {workspaces.length - ownedCount}
            </h3>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            Joined as Member
          </p>
        </div>
      </div>

      {/* --- RECENT WORKSPACES SECTION --- */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Recent Workspaces
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {recentWorkspaces.map((ws: any) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}

          {/* Empty State */}
          {recentWorkspaces.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-border/80 rounded-3xl bg-muted/20 space-y-3">
              <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                No workspaces available yet.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create a workspace to start organizing your projects, tasks, and
                team members.
              </p>
              <Link href="/workspace">
                <Button size="sm" className="gap-2 text-xs rounded-xl mt-2">
                  <Plus className="w-4 h-4" /> Go to Workspaces
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeWithAuth;
