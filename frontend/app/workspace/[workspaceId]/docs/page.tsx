"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Files, FilePlus, Search, Folder, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const WorkspaceDocsPage = () => {
  const router = useRouter();
  const { workspaceId, isAdminOrOwner } = useWorkspace();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Unified Header */}
      <Header
        title="Workspace Documents"
        subtitle="Centralized knowledge base, technical documentation, and team notes."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Total Documents",
            value: 12,
            icon: <Files className="w-5 h-5 text-primary" />,
          },
          {
            title: "Recent Edits",
            value: 5,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
          },
          {
            title: "Categories",
            value: 4,
            icon: <Folder className="w-5 h-5 text-purple-500" />,
          },
        ]}
        actions={
          <Button className="rounded-xl gap-2 text-xs shadow-xs">
            <FilePlus className="w-4 h-4" /> New Document
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents and guides..."
            className="pl-10 bg-card border-border/60 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Docs Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Engineering Onboarding Guide",
            desc: "Setup guidelines, architecture overview, and deployment procedures.",
            author: "Hassan Saidu",
            date: "Updated 2 days ago",
            category: "Guides",
          },
          {
            title: "API Endpoint Specifications",
            desc: "REST & GraphQL API docs including authentication and rate limiting rules.",
            author: "Dev Team",
            date: "Updated yesterday",
            category: "API",
          },
          {
            title: "Product Brand Guidelines",
            desc: "Color palettes, logo usage rules, typography, and UI component design system.",
            author: "Design Team",
            date: "Updated 5 days ago",
            category: "Design",
          },
        ].map((doc, idx) => (
          <div
            key={idx}
            className="group bg-card hover:bg-gradient-to-b hover:from-card hover:to-accent/20 border border-border/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-md space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {doc.category}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {doc.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {doc.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground">
              <span>{doc.author}</span>
              <span>{doc.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceDocsPage;
