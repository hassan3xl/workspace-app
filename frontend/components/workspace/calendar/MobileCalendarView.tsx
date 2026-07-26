"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProjectType } from "@/lib/types/project.types";

interface MobileCalendarViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  resetToToday: () => void;
  calendarDays: { date: Date; isCurrentMonth: boolean }[];
  projectEvents: { [key: string]: ProjectType[] };
  workspaceId: string;
  monthName: string;
  year: number;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  prevMonth,
  nextMonth,
  resetToToday,
  calendarDays,
  projectEvents,
  workspaceId,
  monthName,
  year,
}) => {
  const [viewMode, setViewMode] = useState<"days" | "list">("days");

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return projectEvents[selectedDate.toDateString()] || [];
  }, [selectedDate, projectEvents]);

  const currentMonthDays = useMemo(() => {
    return calendarDays.filter((d) => d.isCurrentMonth);
  }, [calendarDays]);

  return (
    <div className="space-y-4 lg:hidden">
      {/* 1. Mobile Top Controls */}
      <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground">
              {monthName} {year}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToToday}
              className="text-[11px] h-7 px-2.5 rounded-lg border-border/60"
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={prevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={nextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode("days")}
            className={cn(
              "py-1.5 rounded-lg transition-all text-center",
              viewMode === "days"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground",
            )}
          >
            Day Selector
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "py-1.5 rounded-lg transition-all text-center",
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground",
            )}
          >
            Month Milestones
          </button>
        </div>
      </div>

      {/* 2. Mode A: Compact Date Grid / Strip */}
      {viewMode === "days" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border/60 p-3 shadow-xs space-y-2">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-muted-foreground pb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Compact Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayItem, idx) => {
                const dateKey = dayItem.date.toDateString();
                const dayEvents = projectEvents[dateKey] || [];
                const isToday =
                  dayItem.date.toDateString() === new Date().toDateString();
                const isSelected =
                  selectedDate?.toDateString() === dayItem.date.toDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectDate(dayItem.date)}
                    className={cn(
                      "h-11 sm:h-12 rounded-xl border flex flex-col items-center justify-center relative transition-all",
                      !dayItem.isCurrentMonth && "opacity-30 border-transparent",
                      dayItem.isCurrentMonth &&
                        "bg-card border-border/40 hover:border-primary/40",
                      isToday && "border-primary bg-primary/5 font-bold",
                      isSelected &&
                        "ring-2 ring-primary border-primary bg-primary/10 shadow-xs font-bold",
                    )}
                  >
                    <span className="text-xs">{dayItem.date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events Container */}
          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Select a Date"}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {selectedDateEvents.length} event
                  {selectedDateEvents.length === 1 ? "" : "s"} scheduled
                </p>
              </div>
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
            </div>

            <div className="space-y-2.5">
              {selectedDateEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-xs text-foreground leading-snug">
                      {evt.title}
                    </h5>
                    <Badge
                      variant="outline"
                      className="text-[9px] capitalize shrink-0 h-4 px-1.5"
                    >
                      {evt.status || "active"}
                    </Badge>
                  </div>
                  {evt.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {evt.description}
                    </p>
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-7 gap-1 justify-between text-primary hover:text-primary p-0"
                  >
                    <Link
                      href={`/workspace/${workspaceId}/projects/${evt.id}`}
                    >
                      <span>Open Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}

              {selectedDateEvents.length === 0 && (
                <div className="py-8 text-center space-y-1.5 border border-dashed border-border/60 rounded-xl">
                  <Clock className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    No milestones for this day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mode B: Month Milestones List */}
      {viewMode === "list" && (
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-foreground pb-2 border-b border-border/40">
            {monthName} Milestones ({currentMonthDays.length} Days)
          </h4>

          <div className="space-y-2.5">
            {currentMonthDays.map((dayItem) => {
              const dateKey = dayItem.date.toDateString();
              const dayEvents = projectEvents[dateKey] || [];

              if (dayEvents.length === 0) return null;

              return (
                <div
                  key={dateKey}
                  className="p-3 rounded-xl border border-border/60 bg-muted/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>
                      {dayItem.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {dayEvents.length} event(s)
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    {dayEvents.map((evt) => (
                      <Link
                        key={evt.id}
                        href={`/workspace/${workspaceId}/projects/${evt.id}`}
                        className="block p-2 rounded-lg bg-card border border-border/40 hover:border-primary/50 transition-all text-xs"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold truncate text-foreground">
                            {evt.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(projectEvents).length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                No events recorded this month.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalendarView;
