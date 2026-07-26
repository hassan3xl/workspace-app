"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserCard() {
  const router = useRouter();
  const { isOpen, closeSidebar } = useSidebar();
  const { user } = useAuth();

  const handleProfile = () => {
    router.push(`/account`);
    closeSidebar();
  };

  const displayName =
    user?.full_name ||
    user?.username ||
    "User";

  const content = (
    <button
      onClick={handleProfile}
      className={cn(
        "flex items-center gap-3 w-full transition-all group",
        "md:justify-center md:p-0",
        "p-2 rounded-xl hover:bg-accent bg-accent/30",
      )}
    >
      <div className="relative w-10 h-10 shrink-0">
        <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-primary transition-all">
          <AvatarImage
            src={user?.avatar || ""}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {displayName[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></div>
      </div>

      <div
        className={cn(
          "md:hidden flex flex-col items-start overflow-hidden",
          !isOpen && "hidden",
        )}
      >
        <p className="text-md font-semibold truncate w-32 text-left">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate w-32 text-left">
          {user?.user?.email || ""}
        </p>
      </div>
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">My Account</TooltipContent>
    </Tooltip>
  );
}
