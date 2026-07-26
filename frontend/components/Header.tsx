import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface StatCardData {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  stats?: StatCardData[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

const StatCard = ({ title, value, icon }: StatCardData) => {
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/70 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
          {value}
        </h3>
        <div className="p-2.5 rounded-xl bg-accent/60 text-foreground shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
        {title}
      </p>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  stats,
  actions,
  showBackButton,
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Header Section */}
      {(title || showBackButton || actions) && (
        <div className="flex flex-row justify-between items-center gap-3">
          {/* Left side - title/subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            {showBackButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 shrink-0 border-border shadow-xs"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </Button>
            )}
            {title && (
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block truncate max-w-md">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;
