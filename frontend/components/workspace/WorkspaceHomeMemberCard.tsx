import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface WorkspaceHomeMemberCardProps {
  member: any;
}

const WorkspaceHomeMemberCard = ({ member }: WorkspaceHomeMemberCardProps) => {
  const user = member?.user || {};
  const fullName =
    user.full_name ||
    (user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : member.full_name || null);

  const hasName = Boolean(fullName);
  const primaryTitle = hasName ? fullName : `@${user.username || "user"}`;
  const secondaryTitle = hasName
    ? user.username
      ? `@${user.username}`
      : user.email
    : user.email;

  const roleStr = member.role || "Member";

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
      <Avatar className="w-10 h-10 rounded-full border border-border shrink-0">
        <AvatarImage src={user.avatar} className="object-cover" />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
          {(primaryTitle?.[0] === "@"
            ? primaryTitle?.[1]
            : primaryTitle?.[0]
          )?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
          {primaryTitle}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {secondaryTitle}
        </p>
      </div>

      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border shrink-0 capitalize">
        {roleStr}
      </span>
    </div>
  );
};

export default WorkspaceHomeMemberCard;
