import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
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

const StatCard = ({ title, value, icon, trend }: StatCardData) => {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md hover:border-ring transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <div className="bg-muted p-3 rounded-lg text-foreground">{icon}</div>
      </div>
      <p className="text-sm font-medium text-primary mb-1">{title}</p>
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
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        {/* Left side - title/subtitle */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="rounded-xl h-10 w-10 shrink-0 hover:bg-accent border-border/60 shadow-xs"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                {/* {subtitle} */}
              </p>
            )}
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div
          className={`grid grid-cols-2 md:grid-cols-2  ${
            stats.length > 2
              ? "lg:grid-cols-2 xl:grid-cols-4"
              : "lg:grid-cols-" + stats.length
          } gap-2 md:gap-4 lg:gap-6`}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;
