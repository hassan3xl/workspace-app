"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiService, getBackendErrorMessage } from "@/lib/services/apiService";
import { handleLogin } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  text?: string;
  onSuccess?: (response: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton({
  isLoading,
  setIsLoading,
  text = "Continue with Google",
  onSuccess,
  disabled,
}: GoogleSignInButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      try {
        // Keep the script active in document head so navigations don't break Google Auth
      } catch (e) {}
    };
  }, []);

  const handleGoogleLogin = () => {
    if (disabled) return;

    if (typeof window !== "undefined" && !navigator.onLine) {
      toast.error("Offline", {
        description: "Google Login requires an active internet connection.",
      });
      return;
    }

    if (!scriptLoaded || !window.google) {
      toast.error(
        "Google Sign-In is still loading. Please try again in a moment.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "487350813957-eipmp9vb7ossl0pi6648qnu0eivlglun.apps.googleusercontent.com";

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const response = await apiService.postWithoutToken(
                "/auth/google/",
                {
                  access_token: tokenResponse.access_token,
                },
              );

              if (response && response.access) {
                if (onSuccess) {
                  onSuccess(response);
                  return;
                }

                try {
                  await handleLogin(
                    response.user,
                    response.access,
                    response.user?.roles ?? null,
                  );
                } catch (actionErr) {
                  console.warn("Server action handleLogin failed, falling back to client-side cookie assignment:", actionErr);
                }

                if (typeof window !== "undefined") {
                  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                  const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax${isLocal ? "" : "; secure"}`;
                  document.cookie = `session_access_token=${encodeURIComponent(response.access)}; ${cookieOptions}`;
                  document.cookie = `session_user=${encodeURIComponent(JSON.stringify(response.user))}; ${cookieOptions}`;
                  if (response.user?.roles) {
                    document.cookie = `session_roles=${encodeURIComponent(JSON.stringify(response.user.roles))}; ${cookieOptions}`;
                  }
                }

                toast.success("Google login successful!");

                setTimeout(() => {
                  window.location.href = "/profile";
                }, 1000);
              } else {
                toast.error("Google login failed", {
                  description: "Could not retrieve access token from backend.",
                });
                setIsLoading(false);
              }
            } catch (err: any) {
              const msg = getBackendErrorMessage(err);
              toast.error("Google login error", { description: msg });
              setIsLoading(false);
            }
          } else {
            toast.error("Google login cancelled or failed.");
            setIsLoading(false);
          }
        },
        error_callback: (err: any) => {
          console.error("Google Token Client error:", err);
          toast.error("Google Login failed to initialize.");
          setIsLoading(false);
        },
      });

      client.requestAccessToken();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to initiate Google Login.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading || !scriptLoaded || disabled}
      className="w-full flex items-center justify-center gap-2 h-11 border border-border bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all duration-200"
    >
      <svg className="w-5 h-5 min-w-[20px]" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {text}
    </Button>
  );
}
