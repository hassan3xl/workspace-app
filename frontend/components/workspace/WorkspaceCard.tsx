import React from "react";
import { Crown, MoreVertical, Settings, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const WorkspaceCard = ({ workspace }: { workspace: any }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 relative flex flex-col justify-between shadow-xs">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative">
          <Avatar className="w-14 h-14 rounded-xl border border-border shadow-xs">
            <AvatarImage src={workspace.logo} alt={workspace.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {workspace.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <h3 className="font-bold text-lg truncate">{workspace.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {workspace.description || "No description provided"}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {workspace.members?.length || 0} members
            </div>
            <span>•</span>
            <span className="capitalize">{workspace.visibility}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          asChild
          className="flex-1 shadow-xs"
          variant="default"
          size="sm"
        >
          <Link href={`/workspace/${workspace.id}`}>Enter Workspace</Link>
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceCard;
