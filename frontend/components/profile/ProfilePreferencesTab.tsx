"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const ProfilePreferencesTab: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [workspaceInvitesAlert, setWorkspaceInvitesAlert] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const savePreferences = () => {
    toast.success("Preferences saved successfully!");
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
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />{" "}
            Notifications & Preferences
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage your email alerts and application preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {toggleItems.map((item, index) => (
            <Input
              key={index}
              variant="switch"
              label={item.label}
              helperText={item.description}
              value={item.checked}
              onChange={item.onChange}
            />
          ))}

          <div className="flex justify-end pt-3 border-t border-border/40">
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
