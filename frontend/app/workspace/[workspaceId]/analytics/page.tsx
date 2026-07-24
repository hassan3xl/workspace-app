"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const WorkspaceAnalyticsPage = () => {
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <Header
        title="Analytics & Insights"
        subtitle="Team velocity, task completion metrics, and workspace health analysis."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Task Completion Rate",
            value: "87%",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Completed This Month",
            value: 48,
            icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          },
          {
            title: "Active Contributors",
            value: 12,
            icon: <Users className="w-5 h-5 text-purple-500" />,
          },
        ]}
      />

      <div className="bg-card rounded-2xl border border-border/60 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Workspace Health & Velocity Insights</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Detailed metrics on sprint progress, open bottleneck resolution, and individual contribution velocity.
        </p>
      </div>
    </div>
  );
};

export default WorkspaceAnalyticsPage;
