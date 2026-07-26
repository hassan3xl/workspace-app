"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Shield,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetWorkspaceMembers } from "@/lib/hooks/workspace.hook";
import WorkspaceMemberCard from "@/components/workspace/WorkspaceMemberCard";
import Loader from "@/components/Loader";
import InviteWorkspaceMember from "@/components/modals/InviteWorkspaceMember";
import { MembersType } from "@/lib/types/workspace.types";

const WorkspaceMembers = () => {
  const router = useRouter();
  const { workspaceId, isAdminOrOwner } = useWorkspace();
  const { data: members, isLoading } = useGetWorkspaceMembers(workspaceId);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isLoading) {
    return <Loader page="members" />;
  }

  const totalMembers = members?.length || 0;
  const ownerCount = members?.filter((m: MembersType) => m.role === "owner").length || 0;
  const adminCount = members?.filter((m: MembersType) => m.role === "admin").length || 0;
  const memberCount = members?.filter((m: MembersType) => m.role === "member").length || 0;

  // Filter Logic
  const filteredMembers = members?.filter((m: MembersType) => {
    const user = m.user;
    const name = (user?.full_name || "").toLowerCase();
    const username = (user?.username || "").toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      name.includes(query) || username.includes(query) || email.includes(query);

    const matchesRole = roleFilter === "all" || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. HEADER */}
      <Header
        title="Workspace Members"
        subtitle="Manage member access, invite collaborators, and assign roles."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Total Members",
            value: totalMembers,
            icon: <Users className="w-5 h-5 text-primary" />,
          },
          {
            title: "Owners & Admins",
            value: ownerCount + adminCount,
            icon: <Shield className="w-5 h-5 text-purple-500" />,
          },
          {
            title: "Members",
            value: memberCount,
            icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
          },
        ]}
        actions={
          isAdminOrOwner && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-2 rounded-xl text-xs px-4 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          )
        }
      />

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          {/* Search Input */}
          <Input
            placeholder="Search by name, username, or email..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full sm:w-80"
          />

          {/* Role Filter Selector */}
          <Input
            variant="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { label: "All Roles", value: "all" },
              { label: "Owners", value: "owner" },
              { label: "Admins", value: "admin" },
              { label: "Members", value: "member" },
            ]}
            containerClassName="w-full sm:w-44"
          />
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
            Showing {filteredMembers?.length || 0} of {totalMembers}
          </Badge>
        </div>
      </div>

      {/* 3. MEMBERS GRID */}
      {filteredMembers && filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member: MembersType) => (
            <WorkspaceMemberCard
              key={member.id}
              member={member}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 space-y-3">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="font-semibold text-sm">No members found</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search criteria or role filters.
          </p>
        </div>
      )}

      {/* Invite Modal */}
      <InviteWorkspaceMember
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceMembers;
