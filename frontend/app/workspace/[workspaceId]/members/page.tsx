"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Shield,
  UserCheck,
  Clock,
  UserPlus,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetWorkspaceMembers } from "@/lib/hooks/workspace.hook";
import WorkspaceMemberCard from "@/components/workspace/WorkspaceMemberCard";
import Loader from "@/components/Loader";

const WorkspaceMembers = () => {
  const router = useRouter();
  const { workspaceId, isAdminOrOwner } = useWorkspace();
  const { data: members, isLoading } = useGetWorkspaceMembers(workspaceId);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  if (isLoading) return <Loader page="members" />;

  // Filtering Logic
  const filteredMembers = members?.filter((member: any) => {
    const fullName = member.full_name || "";
    const username = member.user?.username || "";
    const email = member.user?.email || "";
    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      username.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      member.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const totalMembers = members?.length || 0;
  const adminCount =
    members?.filter(
      (m: any) =>
        m.role?.toLowerCase() === "admin" || m.role?.toLowerCase() === "owner",
    ).length || 0;
  const regularCount = totalMembers - adminCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. UNIFIED HEADER WITH BACK BUTTON */}
      <Header
        title="Workspace Members"
        subtitle="Manage member permissions, view member profiles, and collaborate across teams."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Total Members",
            value: totalMembers,
            icon: <Users className="w-5 h-5 text-primary" />,
          },
          {
            title: "Admins & Owners",
            value: adminCount,
            icon: <Shield className="w-5 h-5 text-purple-500" />,
          },
          {
            title: "Members",
            value: regularCount,
            icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Active Directory",
            value: filteredMembers?.length || 0,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
          },
        ]}
        actions={
          isAdminOrOwner && (
            <Button
              onClick={() => router.push(`/workspace/${workspaceId}/settings`)}
              className="rounded-xl gap-2 text-xs shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> Invite Members
            </Button>
          )
        }
      />

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or email..."
              className="pl-10 bg-card border-border/60 rounded-xl text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role Filter Selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-card border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="member">Members</option>
          </select>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
            Showing {filteredMembers?.length || 0} of {totalMembers}
          </Badge>
        </div>
      </div>

      {/* 3. MEMBERS GRID LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Skeleton Cards
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-card/60 animate-pulse border border-border/50 p-6 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-muted/60" />
              <div className="h-4 w-32 bg-muted/60 rounded-md" />
              <div className="h-3 w-24 bg-muted/40 rounded-md" />
              <div className="h-6 w-20 bg-muted/50 rounded-full mt-2" />
            </div>
          ))
        ) : filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map((member: any) => (
            <WorkspaceMemberCard
              key={member.id || member.user.id}
              member={member}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-card/30 p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50">
              <Users className="w-7 h-7" />
            </div>
            <p className="font-bold text-base">No members found</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {search || roleFilter !== "all"
                ? `No workspace member matched your filters.`
                : "No members available in this workspace."}
            </p>
            {(search || roleFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
                className="rounded-xl text-xs mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceMembers;
