"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  CheckCircle2,
  UserPlus,
  FolderPlus,
  MessageSquare,
  FileText,
  Trash2,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetWorkspaceDashboard } from "@/lib/hooks/workspace.hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/Loader";
import { timeAgo } from "@/lib/utils";

const WorkspaceActivityPage = () => {
  const router = useRouter();
  const { workspaceId } = useWorkspace();
  const { data: dashboard, isLoading } = useGetWorkspaceDashboard(workspaceId);

  if (isLoading) {
    return <Loader page="activity" />;
  }

  const activities = dashboard?.activities || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
      <Header
        title="Activity Log"
        subtitle="Real-time audit log of team actions, project updates, and system events."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Total Events",
            value: activities.length,
            icon: <Activity className="w-5 h-5 text-primary" />,
          },
          {
            title: "Active Team",
            value: dashboard?.recent_members?.length || 1,
            icon: <Users className="w-5 h-5 text-emerald-500" />,
          },
        ]}
      />

      <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base font-semibold tracking-tight">Recent Activity Stream</h2>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity: any) => {
              const meta = (() => {
                switch (activity.action_type) {
                  case "create_project":
                    return {
                      label: "created project",
                      icon: <FolderPlus className="w-4 h-4 text-blue-500" />,
                      badgeClass: "bg-blue-500/10 border-blue-500/20",
                    };
                  case "add_project_member":
                    return {
                      label: "added member to project",
                      icon: <UserPlus className="w-4 h-4 text-purple-500" />,
                      badgeClass: "bg-purple-500/10 border-purple-500/20",
                    };
                  case "create_task":
                    return {
                      label: "created task",
                      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                      badgeClass: "bg-emerald-500/10 border-emerald-500/20",
                    };
                  case "start_task":
                    return {
                      label: "started task",
                      icon: <Clock className="w-4 h-4 text-amber-500" />,
                      badgeClass: "bg-amber-500/10 border-amber-500/20",
                    };
                  case "complete_task":
                    return {
                      label: "completed task",
                      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                      badgeClass: "bg-emerald-500/10 border-emerald-500/20",
                    };
                  case "comment":
                    return {
                      label: "commented on",
                      icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
                      badgeClass: "bg-indigo-500/10 border-indigo-500/20",
                    };
                  case "upload_document":
                    return {
                      label: "uploaded document",
                      icon: <FileText className="w-4 h-4 text-sky-500" />,
                      badgeClass: "bg-sky-500/10 border-sky-500/20",
                    };
                  case "delete_document":
                    return {
                      label: "deleted document",
                      icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                      badgeClass: "bg-rose-500/10 border-rose-500/20",
                    };
                  default:
                    return {
                      label: activity.action_type
                        ? activity.action_type.replace(/_/g, " ")
                        : "updated",
                      icon: <Activity className="w-4 h-4 text-slate-500" />,
                      badgeClass: "bg-muted border-border",
                    };
                }
              })();

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-all gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-9 w-9 border border-border shrink-0">
                      <AvatarImage src={activity.actor_avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {(activity.actor_name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-xs sm:text-sm">
                      <p className="text-foreground leading-snug">
                        <span className="font-bold text-foreground">
                          {activity.actor_name || activity.actor_username || "User"}
                        </span>{" "}
                        <span className="text-muted-foreground font-medium">
                          {meta.label}
                        </span>{" "}
                        {activity.target_text && (
                          <span className="font-semibold text-foreground bg-accent/50 px-1.5 py-0.5 rounded text-xs">
                            {activity.target_text}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground/70" />
                        {timeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg border shrink-0 ${meta.badgeClass}`}>
                    {meta.icon}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">
            No activity records found for this workspace yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkspaceActivityPage;
