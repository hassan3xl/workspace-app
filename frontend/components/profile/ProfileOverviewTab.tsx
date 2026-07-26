"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Inbox,
  ArrowRight,
  Check,
  X,
  Bell,
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
import { toast } from "sonner";
import { ProfilePType } from "@/lib/types/user.types";
import {
  useAcceptWorkspaceInvitation,
  useRejectWorkspaceInvitation,
} from "@/lib/hooks/workspace.hook";

interface ProfileOverviewTabProps {
  profile: ProfilePType | undefined | null;
  workspaces?: any[];
  invitations?: any[];
  setActiveTab: (tab: string) => void;
}

export const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  profile,
  invitations = [],
  setActiveTab,
}) => {
  const acceptInvite = useAcceptWorkspaceInvitation();
  const rejectInvite = useRejectWorkspaceInvitation();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [workspaceInvitesAlert, setWorkspaceInvitesAlert] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const savePreferences = () => {
    toast.success("Notification preferences saved successfully!");
  };

  const toggleItems = [
    {
      label: "Workspace Activity & Mentions",
      description: "Get emails when team members tag or mention you.",
      checked: emailAlerts,
      onChange: setEmailAlerts,
    },
    {
      label: "Workspace Invitations",
      description: "Get notified when someone invites you to a workspace.",
      checked: workspaceInvitesAlert,
      onChange: setWorkspaceInvitesAlert,
    },
    {
      label: "Security & Account Alerts",
      description: "Important notifications about logins or password changes.",
      checked: securityAlerts,
      onChange: setSecurityAlerts,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full min-w-0">
      {/* Missing Name Emphasis Banner */}
      {!profile?.first_name && !profile?.last_name && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-foreground">
                  Complete Your Profile: Add Your Name
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your first and last name help your teammates recognize you
                  across workspace projects, tasks, and documents.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab("profile")}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs gap-1.5 shrink-0 self-end sm:self-auto shadow-xs"
            >
              Add Name Now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bio & Personal Info */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" /> About You
            </CardTitle>
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
                <span className="truncate">
                  Pending Invitations ({invitations.length})
                </span>
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

      {/* Notification Preferences */}
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Control what emails and workspace notifications you receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {toggleItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start sm:items-center justify-between p-3 rounded-lg border border-border bg-card gap-3"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium">{item.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={savePreferences}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 sm:h-9"
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
