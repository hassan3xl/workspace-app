"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Activity, Clock, CheckCircle2, UserPlus, FolderPlus } from "lucide-react";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const WorkspaceActivityPage = () => {
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const activities = [
    {
      id: 1,
      user: "Hassan Saidu",
      action: "created project",
      target: "Workspace UI Modernization",
      time: "10 minutes ago",
      icon: <FolderPlus className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 2,
      user: "Hassan Saidu",
      action: "completed task",
      target: "Implement Realtime Socket Notifications",
      time: "45 minutes ago",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 3,
      user: "System",
      action: "added team member",
      target: "Alex Johnson",
      time: "2 hours ago",
      icon: <UserPlus className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <Header
        title="Activity Log"
        subtitle="Real-time audit log of team actions, project updates, and system events."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Events Today",
            value: 24,
            icon: <Activity className="w-5 h-5 text-primary" />,
          },
          {
            title: "Active Users",
            value: 8,
            icon: <Clock className="w-5 h-5 text-emerald-500" />,
          },
        ]}
      />

      <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-6 space-y-6">
        <h2 className="text-base font-semibold tracking-tight">Recent Activity Stream</h2>
        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {act.user[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    <span className="font-bold">{act.user}</span> {act.action}{" "}
                    <span className="font-semibold text-primary">{act.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">{act.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceActivityPage;
