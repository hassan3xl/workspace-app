"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService, getBackendErrorMessage } from "@/lib/services/apiService";
import { toast } from "sonner";
import { User, ArrowRight } from "lucide-react";
import Loader from "@/components/Loader";

export default function ProfileSetupForm() {
  const { user, loading, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = "/login";
      } else if (user.first_name || user.last_name) {
        // Skip profile setup if names are already set
        const hasTenants = (user as any).available_tenants && (user as any).available_tenants.length > 0;
        if (hasTenants || user.permissions?.store_role) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/profile";
        }
      }
    }
  }, [user, loading]);

  if (loading || !user) {
    return <Loader />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Please enter your last name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call endpoint to update profile
      await apiService.patch("/user/profile/me/", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      toast.success("Profile updated successfully!");

      // Refresh auth user context
      await refreshUser();

      // Redirect to profile
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } catch (error: any) {
      console.error("Profile setup error:", error);
      const msg = getBackendErrorMessage(error);
      toast.error("Failed to update profile", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-4 sm:p-8 rounded-lg shadow-none sm:shadow-lg border-0 sm:border sm:border-border bg-transparent sm:bg-card">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
          <User size={28} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Please enter your name to complete your personal profile setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            First Name
          </label>
          <Input
            id="firstName"
            type="text"
            required
            placeholder="e.g. John"
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
            disabled={isSubmitting}
            className="h-12 text-base px-4 border border-input rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Last Name
          </label>
          <Input
            id="lastName"
            type="text"
            required
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
            disabled={isSubmitting}
            className="h-12 text-base px-4 border border-input rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2 group transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Continue to Business Setup
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
