import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerRegistration } from "@/contexts/ServiceWorkerRegistration";
import { QueryProvider } from "@/providers/QueryProviders";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

import { SocketNotificationProvider } from "@/providers/SocketNotificationProvider";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "a collaborative project management platform where teams plan, assign, and complete tasks in real time. Organize projects, manage permissions, and keep your workflow in sync — all in one sleek, dark interface.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icons/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/icons/ios/180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable, robotoHeading.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <SocketNotificationProvider>
                <ServiceWorkerRegistration />
                <SidebarProvider>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      classNames: {
                        error: "text-red-600 border border-border bg-background",
                        success:
                          "text-green-600 border border-border bg-background",
                        warning:
                          "text-yellow-600 border border-border bg-background",
                        info: "text-blue-600 border border-border bg-background",
                      },
                    }}
                  />
                  <>
                    {children}
                    {modal}
                  </>
                </SidebarProvider>
              </SocketNotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
