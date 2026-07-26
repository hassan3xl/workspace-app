"use client";

import React, { useState } from "react";
import { Camera, Loader2, User, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfilePType } from "@/lib/types/user.types";
import { useUpdateProfile, useUploaadAvatar } from "@/lib/hooks/account.hook";

interface ProfileFormTabProps {
  profile: ProfilePType | undefined | null;
}

interface ProfileFormInputs {
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  phone_number: string;
}

export const ProfileFormTab: React.FC<ProfileFormTabProps> = ({ profile }) => {
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploaadAvatar();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProfileFormInputs>({
    values: profile
      ? {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          phone_number: profile.phone_number || "",
        }
      : undefined,
  });

  const onUpdateProfile = async (data: ProfileFormInputs) => {
    try {
      await updateProfile.mutateAsync(data);
    } catch (err) {
      toast.error("Failed to update profile details");
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    uploadAvatar.mutate(formData, {
      onError: () => {
        setAvatarPreview(null);
      },
    });
  };

  const fullName =
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full min-w-0">
      <Card className="border-border w-full min-w-0">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" /> Personal
            Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Update your photo and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 min-w-0">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 sm:p-4 border border-border rounded-lg bg-accent/20">
            <div className="relative group cursor-pointer shrink-0">
              <Avatar className="h-18 w-18 sm:h-24 sm:w-24 border-2 border-border shadow-md">
                <AvatarImage
                  src={avatarPreview || profile?.avatar}
                  alt={fullName || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg sm:text-xl bg-primary/10 text-primary font-bold">
                  {fullName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatarFileInput"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              <input
                id="avatarFileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
                disabled={uploadAvatar.isPending}
              />
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm">Profile Picture</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 5MB.
              </p>
              <label htmlFor="avatarFileInput">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-[10px] sm:text-xs gap-1.5 cursor-pointer pointer-events-none h-7 sm:h-8"
                  disabled={uploadAvatar.isPending}
                >
                  {uploadAvatar.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                  {uploadAvatar.isPending ? "Uploading..." : "Upload Image"}
                </Button>
              </label>
            </div>
          </div>

          {/* Missing Name Banner */}
          {!profile?.first_name && !profile?.last_name && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <User className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-foreground">Action Suggested: Add Your Name</h4>
                <p className="text-xs text-muted-foreground">
                  Please enter your first and last name below so team members can easily identify you across workspaces.
                </p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="first_name" className="text-xs font-medium">
                    First Name
                  </Label>
                  {!profile?.first_name && (
                    <span className="text-[10px] text-amber-600 font-semibold uppercase">Required for display</span>
                  )}
                </div>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="e.g. Hassan"
                  className={`bg-background h-9 text-sm ${
                    !profile?.first_name ? "border-amber-500 ring-1 ring-amber-500/30" : ""
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="last_name" className="text-xs font-medium">
                    Last Name
                  </Label>
                  {!profile?.last_name && (
                    <span className="text-[10px] text-amber-600 font-semibold uppercase">Required for display</span>
                  )}
                </div>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="e.g. Saidu"
                  className={`bg-background h-9 text-sm ${
                    !profile?.last_name ? "border-amber-500 ring-1 ring-amber-500/30" : ""
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium">
                  Username
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="hassan_saidu"
                    className="pl-7 bg-background h-9 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number" className="text-xs font-medium">
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    {...register("phone_number")}
                    placeholder="+234 800 000 0000"
                    className="pl-9 bg-background h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                className="resize-none min-h-[80px] sm:min-h-[100px] bg-background text-sm"
                placeholder="Share a brief summary about yourself..."
              />
            </div>

            {/* Read-Only Email */}
            <div className="pt-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Account Email
              </Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  disabled
                  value={profile?.user?.email || ""}
                  className="pl-9 bg-muted/40 text-muted-foreground border-transparent cursor-not-allowed h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border/50">
              <Button
                type="submit"
                disabled={updateProfile.isPending || !isDirty}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs sm:text-sm h-9"
              >
                {updateProfile.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
