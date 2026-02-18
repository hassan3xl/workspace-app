"use client";

import React from "react";
import Link from "next/link";
import { Layout, ArrowRight } from "lucide-react";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";
import { useGetWorkspaces } from "@/lib/hooks/workspace.hook";
import Header from "@/components/Header";

const HomeWithAuth = ({ user }: { user: any }) => {
  const { data: workspaces } = useGetWorkspaces();

  const recentWorkspaces = workspaces?.slice(0, 4);

  const userName = user?.username || "User";
  const timeOfDay =
    new Date().getHours() < 12 ? "Good morning" : "Good afternoon";

  return (
    <div className="h-full w-full space-y-8">
      <Header
        title={`${timeOfDay}, ${userName}`}
        subtitle="Here's what's happening across your workspaces today."
        stats={[
          {
            title: "Active Workspaces",
            value: workspaces?.length || 0,
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Main Content (Fluid Width) */}
        <div className="flex-1 w-full min-w-0 space-y-8">
          <div className="border border-border rounded-xl p-4 row-end-4 md:p-6 bg-card/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Recent Workspaces
              </h2>
              <Link
                href="/workspace"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {recentWorkspaces?.map((ws: any) => (
                <WorkspaceCard key={ws.id} workspace={ws} />
              ))}

              {/* Empty State if no workspaces */}
              {(!recentWorkspaces || recentWorkspaces.length === 0) && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No workspaces found. Create one to get started!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeWithAuth;
