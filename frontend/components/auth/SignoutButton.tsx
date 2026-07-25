"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { resetAuthCookies } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

interface SignoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SignoutButton: React.FC<SignoutButtonProps> = ({ className, ...props }) => {
  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    await resetAuthCookies();
    window.location.href = "/auth/signin";
  };

  return (
    <button
      {...props}
      onClick={handleSignOut}
      className={cn("flex items-center gap-2", className)}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
};

export default SignoutButton;