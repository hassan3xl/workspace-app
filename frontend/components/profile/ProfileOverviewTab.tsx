"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building2,
  Inbox,
  ArrowRight,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfilePType } from "@/lib/types/user.types";
import {
  useAcceptWorkspaceInvitation,
  useRejectWorkspaceInvitation,
} from "@/lib/hooks/workspace.hook";

interface ProfileOverviewTabProps {
  profile: ProfilePType | undefined | null;
  workspaces: any[] | undefined;
  invitations: any[] | undefined;
  setActiveTab: (tab: string) => void;
}

export const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  profile,
  workspaces = [],
  invitations = [],
  setActiveTab,
}) => {
  const acceptInvite = useAcceptWorkspaceInvitation();
  const rejectInvite = useRejectWorkspaceInvitation();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full min-w-0">
      {/* Bio & Personal Info */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" /> About You
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary h-7 sm:h-8 px-2"
              onClick={() => setActiveTab("profile")}
            >
              Edit
            </Button>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Bio and display information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 min-w-0">
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed break-words">
            {profile?.bio ||
              "No bio added yet. Click edit to tell others about yourself."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-accent/30 border border-border/40 min-w-0">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Email
                </p>
                <p className="font-medium text-xs sm:text-sm truncate">
                  {profile?.user?.email || "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-accent/30 border border-border/40 min-w-0">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Phone
                </p>
                <p className="font-medium text-xs sm:text-sm truncate">
                  {profile?.phone_number || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 w-full min-w-0">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Inbox className="w-4 h-4 shrink-0" />
                <span className="truncate">Pending Invitations ({invitations.length})</span>
              </CardTitle>
              <Badge className="bg-amber-500 text-white text-[10px] sm:text-xs shrink-0">
                Action Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {invitations.map((invite: any) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-background gap-2 sm:gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-xs sm:text-sm truncate">
                    {invite.workspace?.name ||
                      invite.workspace_name ||
                      "Workspace Invitation"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    From{" "}
                    <span className="text-foreground font-medium">
                      {invite.inviter_email || invite.invited_by || "Admin"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] sm:text-xs text-destructive hover:bg-destructive/10 gap-1 px-2"
                    disabled={rejectInvite.isPending}
                    onClick={() => rejectInvite.mutate(invite.id)}
                  >
                    <X className="w-3 h-3" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[10px] sm:text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1 px-2"
                    disabled={acceptInvite.isPending}
                    onClick={() => acceptInvite.mutate(invite.id)}
                  >
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Workspaces */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" /> Your Workspaces
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Workspaces you belong to or manage
              </CardDescription>
            </div>
            <Link href="/workspace" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 text-primary hover:text-primary/80 h-7 sm:h-8 px-2"
              >
                View All ({workspaces.length})
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <div className="text-center py-6 sm:py-8 border border-dashed rounded-lg space-y-2 sm:space-y-3">
              <Building2 className="w-7 h-7 mx-auto text-muted-foreground/50" />
              <p className="text-xs sm:text-sm font-medium">No workspaces yet</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground max-w-xs mx-auto">
                Create a workspace or get invited to collaborate.
              </p>
              <Link href="/workspace/create" className="inline-block pt-1">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs h-8"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Create Workspace
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {workspaces.slice(0, 4).map((ws: any) => (
                <div
                  key={ws.id}
                  className="p-3 sm:p-4 rounded-lg border border-border/80 bg-card hover:border-primary/40 hover:shadow-sm transition-all space-y-2 sm:space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm truncate">
                        {ws.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize shrink-0"
                      >
                        {ws.role || ws.user_role || "Member"}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {ws.description || "No description provided."}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Active
                    </span>
                    <Link href={`/workspace/${ws.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] sm:text-xs gap-1 hover:text-primary p-0"
                      >
                        Open <ExternalLink className="w-3 h-3" />
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
