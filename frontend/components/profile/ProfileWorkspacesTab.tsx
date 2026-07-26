"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Users,
  ExternalLink,
  Inbox,
  Check,
  X,
  Sparkles,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAcceptWorkspaceInvitation,
  useRejectWorkspaceInvitation,
} from "@/lib/hooks/workspace.hook";

interface ProfileWorkspacesTabProps {
  workspaces: any[] | undefined;
  invitations: any[] | undefined;
}

export const ProfileWorkspacesTab: React.FC<ProfileWorkspacesTabProps> = ({
  workspaces = [],
  invitations = [],
}) => {
  const acceptInvite = useAcceptWorkspaceInvitation();
  const rejectInvite = useRejectWorkspaceInvitation();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Inbox className="w-5 h-5" /> Pending Team Invites ({invitations.length})
              </CardTitle>
              <Badge className="bg-amber-500 text-white">Action Required</Badge>
            </div>
            <CardDescription>Review workspace invitations sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invite: any) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-background gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">
                    {invite.workspace?.name || invite.workspace_name || "Workspace Invitation"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Invited by <span className="font-medium text-foreground">{invite.inviter_email || invite.invited_by || "Workspace Admin"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                    disabled={rejectInvite.isPending}
                    onClick={() => rejectInvite.mutate(invite.id)}
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    disabled={acceptInvite.isPending}
                    onClick={() => acceptInvite.mutate(invite.id)}
                  >
                    <Check className="w-3.5 h-3.5" /> Accept & Join
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Workspaces List */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" /> Active Workspaces
              </CardTitle>
              <CardDescription>
                Workspaces you own, manage, or participate in ({workspaces.length})
              </CardDescription>
            </div>
            <Link href="/workspace/create">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                <Plus className="w-4 h-4" /> Create Workspace
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <h3 className="text-base font-semibold">No workspaces found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You haven't created or joined any workspaces yet. Create your first workspace to start collaborating.
              </p>
              <Link href="/workspace/create" className="inline-block pt-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4" /> Create New Workspace
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map((ws: any) => (
                <div
                  key={ws.id}
                  className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                          {ws.name?.[0]?.toUpperCase() || "W"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm leading-tight">{ws.name}</h4>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Shield className="w-3 h-3 text-muted-foreground" /> {ws.role || ws.user_role || "Member"}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-medium">
                        Invite Only
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ws.description || "No description provided for this workspace."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {ws.members_count || ws.member_count || 1} Members
                    </span>

                    <Link href={`/workspace/${ws.id}`}>
                      <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-600">
                        Launch Workspace <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
