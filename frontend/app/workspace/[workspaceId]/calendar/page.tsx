"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const WorkspaceCalendarPage = () => {
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <Header
        title="Calendar & Roadmap"
        subtitle="Schedule, deadlines, and project milestones across your workspace."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Upcoming Deadlines",
            value: 6,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
          },
          {
            title: "Milestones Reached",
            value: 14,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
        ]}
      />

      <div className="bg-card rounded-2xl border border-border/60 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Interactive Roadmap & Timeline</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          View scheduled tasks, sprint deadlines, and project releases organized on an interactive Gantt timeline.
        </p>
      </div>
    </div>
  );
};

export default WorkspaceCalendarPage;
