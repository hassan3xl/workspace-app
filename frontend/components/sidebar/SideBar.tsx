"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import HomeCard from "./cards/HomeCard";
import UserCard from "./cards/UserCard";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import WorkspaceCard from "./cards/WorkspaceCard";
import SidebarWorkspaceCard from "./cards/SidebarWorkspaceCard";

export function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar Panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 mt-13 z-50 h-[94vh] flex flex-col bg-background/95 backdrop-blur border-r border-border transition-all duration-300 ease-in-out shadow-2xl md:shadow-none",
            // Width Logic: Mobile (Full) vs Desktop (Slim)
            isOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full",
            "md:translate-x-0 md:w-[72px]"
          )}
        >
          {/* --- TOP SECTION (Navigation & User Profile) --- */}
          <div className="flex flex-col mt-4 items-center gap-3 py-2 px-2">
            <HomeCard />
            <div className="w-full flex justify-center">
              <UserCard />
            </div>
            <WorkspaceCard />

            <Separator className="h-[2px] w-10 bg-accent rounded-full mx-auto mt-1" />
          </div>

          {/* --- MIDDLE SECTION (Scrollable Workspaces) --- */}
          <div className="flex-1 w-full overflow-hidden hover:overflow-y-auto custom-scrollbar py-2 space-y-2">
            <SidebarWorkspaceCard />
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
}
