"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Shield, AlertCircle, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { handleLogin } from "@/lib/actions/auth.actions";
import { FormInput } from "@/components/input/formInput";
import { GoogleIcon } from "../signin/page";
import { useSignup } from "@/lib/hooks/auth.hook";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
// Password Validation Regex
// Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

type SignupForm = {
  email: string;
  password1: string;
  password2: string;
  agreeToTerms: boolean;
};

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SignupForm>();

  const router = useRouter();
  const password1Val = watch("password1");
  const [googleLoading, setGoogleLoading] = useState(false);

  const { mutateAsync: signupHook, isPending: loading } = useSignup();

  const onSubmit = async (data: SignupForm) => {
    if (!data.agreeToTerms) {
      toast.info("Please agree to the Terms of Service.");
      return;
    }

    try {
      const response = await signupHook({
        email: data.email,
        password1: data.password1,
        password2: data.password2,
      });

      if (response.access) {
        await handleLogin(response.user, response.access, response.refresh);
        reset();

        router.push("/profile");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Form Section */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-4 sm:px-12 xl:px-24 py-8 sm:py-12">
        <div className="max-w-[440px] w-full mx-auto border-0 sm:border sm:border-border p-0 sm:p-6 rounded-md bg-transparent sm:bg-card/30 shadow-none space-y-8">
          <div className="space-y-2 items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your details below to create your account
            </p>
          </div>

          {/* Social Auth */}
          <div className="grid gap-4">
            <GoogleSignInButton
              isLoading={googleLoading}
              setIsLoading={setGoogleLoading}
              text="Continue with Google"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background sm:bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              icon={Mail}
              type="email"
              name="email"
              label="Email"
              placeholder="name@example.com"
              disabled={loading}
              className="bg-background"
              register={register}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              }}
            />

            <div className="space-y-1">
              <FormInput
                icon={Lock}
                type="password"
                name="password1"
                label="Password"
                placeholder="Create a password"
                disabled={loading}
                className="bg-background"
                register={register}
                rules={{
                  required: "Password is required",
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: "Must have 8+ chars, uppercase, number, & symbol",
                  },
                }}
              />
              {errors.password1 && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password1.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <FormInput
                icon={Lock}
                type="password"
                name="password2"
                label="Confirm Password"
                placeholder="Confirm password"
                disabled={loading}
                className="bg-background"
                register={register}
                rules={{
                  required: "Confirm password",
                  validate: (val: any) =>
                    val === password1Val || "Passwords do not match",
                }}
              />
              {errors.password2 && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password2.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="terms"
                {...register("agreeToTerms")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-destructive text-xs mt-1">
                You must agree to continue
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-medium"
              size="lg"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Hero/Image Section */}
      <div className="hidden lg:flex lg:w-[45%] bg-muted/20 border-l border-border relative">
        <div className="absolute inset-0 bg-zinc-900 text-white flex flex-col items-center justify-center p-12 text-center">
          <Shield size={60} className="mb-6 text-white/80" />
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-white/70 max-w-md">
            Experience a secure, collaborative workspace designed to help your
            team succeed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
