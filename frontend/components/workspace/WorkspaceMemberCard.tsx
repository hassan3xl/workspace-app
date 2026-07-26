import React from "react";
import { Shield, User, CalendarDays, Mail, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

interface WorkspaceMemberCardProps {
  member: any;
}

const WorkspaceMemberCard = ({ member }: WorkspaceMemberCardProps) => {
  const roleStr = (member.role || "member").toLowerCase();
  const user = member.user || {};

  const getRoleStyle = (role: string) => {
    if (role === "owner" || role === "admin")
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    if (role === "moderator")
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  };

  const roleIcon = (role: string) => {
    if (role === "owner" || role === "admin")
      return <Shield className="w-3 h-3 mr-1 text-purple-500" />;
    return <User className="w-3 h-3 mr-1 text-slate-500" />;
  };

  const fullName =
    user.full_name ||
    (user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : member.full_name || null);

  const hasName = Boolean(fullName);

  const primaryTitle = hasName ? fullName : user.username ? `@${user.username}` : user.email;
  const secondaryTitle = hasName ? (user.username ? `@${user.username}` : user.email) : user.email;

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between">
      {/* Top Action Dropdown */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border">
            <DropdownMenuItem className="text-xs cursor-pointer">
              <Mail className="w-3.5 h-3.5 mr-2" /> Email Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Avatar with Ring */}
        <div className="relative mb-3.5">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border border-border group-hover:border-primary/40 transition-all duration-300">
            <AvatarImage src={user.avatar} className="object-cover" />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {(primaryTitle?.[0] === "@" ? primaryTitle?.[1] : primaryTitle?.[0])?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full"></span>
        </div>

        {/* Identity Info: Name above Username if present, or Username if no name */}
        <div className="space-y-0.5 mb-3 w-full">
          <h3
            className="font-bold text-base text-foreground truncate px-2"
            title={primaryTitle}
          >
            {primaryTitle}
          </h3>
          {secondaryTitle && (
            <p className="text-xs text-muted-foreground font-medium truncate">
              {secondaryTitle}
            </p>
          )}
        </div>

        {/* Role Badge */}
        <Badge
          variant="outline"
          className={`mb-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${getRoleStyle(
            roleStr
          )}`}
        >
          {roleIcon(roleStr)}
          {roleStr}
        </Badge>
      </div>

      {/* Footer Meta Info */}
      <div className="w-full pt-3.5 border-t border-border flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/90">
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[190px]" title={user.email}>
            {user.email}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/75 text-[11px]">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span>Joined {formatDate(member?.joined_at || member?.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMemberCard;
