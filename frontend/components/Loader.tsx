"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export type PageLoaderType =
  | "dashboard"
  | "projects"
  | "project-details"
  | "members"
  | "settings"
  | "docs"
  | "documents"
  | "activity"
  | "analytics"
  | "calendar"
  | "workspaces"
  | "spinner";

type Variant = "ring" | "dots";
type Color = "black" | "white" | "both";

interface LoaderProps {
  page?: PageLoaderType;
  variant?: Variant;
  color?: Color;
  size?: number;
  title?: string;
  fullscreen?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12 w-full max-w-full overflow-hidden">
      {/* Header & Stats Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-xl shrink-0" />
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card space-y-2.5">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-16 sm:w-20 rounded-md" />
                <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shrink-0" />
              </div>
              <Skeleton className="h-6 sm:h-7 w-12 sm:w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <Skeleton className="h-6 w-36 sm:w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 sm:w-32 max-w-full rounded-md" />
                  <Skeleton className="h-3 w-16 sm:w-20 max-w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 sm:h-8 w-44 sm:w-56 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-full sm:w-72 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card space-y-2">
              <Skeleton className="h-3.5 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-7 w-10 sm:w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-2">
        <Skeleton className="h-9 sm:h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-9 sm:h-10 flex-1 sm:w-24 rounded-xl" />
          <Skeleton className="h-9 sm:h-10 flex-1 sm:w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <div className="flex justify-between items-start gap-2">
              <Skeleton className="h-5 sm:h-6 w-3/4 rounded-md" />
              <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <div className="pt-4 flex justify-between items-center border-t border-border/40">
              <Skeleton className="h-5 sm:h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-60 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-28 rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card space-y-2">
              <Skeleton className="h-3.5 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-7 w-12 sm:w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-3 flex-1 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            <Skeleton className="h-4 w-2/3 max-w-lg rounded-md" />
          </div>
          <div className="w-full lg:w-72 p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3 shrink-0">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="h-4 sm:h-5 w-4 sm:w-5 rounded-full shrink-0" />
              <Skeleton className="h-4 sm:h-5 w-3/4 max-w-md rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 sm:w-20 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembersSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-60 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card space-y-2">
              <Skeleton className="h-3.5 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-7 w-10 sm:w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card flex flex-col items-center justify-center space-y-3.5">
            <Skeleton className="h-14 sm:h-16 w-14 sm:w-16 rounded-full shrink-0" />
            <Skeleton className="h-4 w-28 sm:w-32 rounded-md" />
            <Skeleton className="h-3 w-20 sm:w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <Skeleton className="h-7 sm:h-8 w-48 sm:w-56 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full shrink-0" />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-xl shrink-0" />
        <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-xl shrink-0" />
        <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-xl shrink-0" />
      </div>
      <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-6">
        <Skeleton className="h-5 sm:h-6 w-40 sm:w-48 rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
          <Skeleton className="h-20 sm:h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DocsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-60 max-w-full rounded-xl" />
            <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded-xl shrink-0" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <Skeleton className="h-5 sm:h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
        </div>
      </div>
      <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 border-b border-border/30">
            <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-full max-w-md rounded-md" />
              <Skeleton className="h-3 w-28 sm:w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-7 sm:h-8 w-48 sm:w-60 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-7 sm:h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-8 rounded-2xl border border-border/50 bg-card space-y-4">
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-7 sm:h-8 w-44 sm:w-56 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full sm:w-80 max-w-full rounded-lg" />
        </div>
      </div>
      <div className="p-4 sm:p-8 rounded-2xl border border-border/50 bg-card space-y-4">
        <Skeleton className="h-56 sm:h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function WorkspacesSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full sm:w-72 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-36 rounded-xl shrink-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 rounded-md" />
                <Skeleton className="h-3 w-16 sm:w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const Loader: React.FC<LoaderProps> = ({
  page,
  variant = "dots",
  color = "white",
  size = 40,
  title = "",
  fullscreen = true,
  className = "",
  "aria-label": ariaLabel = "Loading",
}) => {
  // If page is specified, render the page-specific skeleton
  if (page) {
    switch (page) {
      case "dashboard":
        return <DashboardSkeleton />;
      case "projects":
        return <ProjectsSkeleton />;
      case "project-details":
        return <ProjectDetailsSkeleton />;
      case "members":
        return <MembersSkeleton />;
      case "settings":
        return <SettingsSkeleton />;
      case "docs":
      case "documents":
        return <DocsSkeleton />;
      case "activity":
        return <ActivitySkeleton />;
      case "analytics":
        return <AnalyticsSkeleton />;
      case "calendar":
        return <CalendarSkeleton />;
      case "workspaces":
        return <WorkspacesSkeleton />;
      case "spinner":
      default:
        break;
    }
  }

  // Fallback Spinner / Ring Loader
  const sizeStyle = { width: size, height: size };

  const renderRing = (colorClass: string) => (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block ${colorClass} rounded-full animate-spin`}
      style={{
        borderWidth: Math.max(2, Math.floor(size / 10)),
        borderStyle: "solid",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
        ...sizeStyle,
      }}
    />
  );

  const renderDots = (dotColorClass: string) => {
    const dot = (delay: number) => (
      <span
        key={delay}
        className={`inline-block ${dotColorClass} rounded-full animate-pulse`}
        style={{
          width: Math.max(6, Math.floor(size / 6)),
          height: Math.max(6, Math.floor(size / 6)),
          margin: Math.max(2, Math.floor(size / 20)),
          animationDelay: `${delay}ms`,
        }}
      />
    );

    return (
      <div role="status" aria-label={ariaLabel} className="inline-flex items-center">
        {dot(0)}
        {dot(200)}
        {dot(400)}
      </div>
    );
  };

  const loaderIcon =
    variant === "ring" ? (
      color === "both" ? (
        <>
          <div className="mr-3">{renderRing("border-black")}</div>
          <div>{renderRing("border-white")}</div>
        </>
      ) : color === "black" ? (
        renderRing("border-black")
      ) : (
        renderRing("border-white")
      )
    ) : color === "both" ? (
      <div className="flex items-center space-x-2">
        <div>{renderDots("bg-black")}</div>
        <div>{renderDots("bg-white")}</div>
      </div>
    ) : color === "black" ? (
      renderDots("bg-black")
    ) : (
      renderDots("bg-white")
    );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div className={`flex items-center justify-center ${className}`}>
          {loaderIcon}
        </div>
        {title && (
          <p className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">
            {title}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      {loaderIcon}
      {title && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{title}</p>
      )}
    </div>
  );
};

export default Loader;
