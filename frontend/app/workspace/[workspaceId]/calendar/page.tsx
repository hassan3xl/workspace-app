"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Folder,
  Layers,
  Sparkles,
  ArrowRight,
  ListTodo,
  TrendingUp,
  Filter,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGetProjects } from "@/lib/hooks/project.hook";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectType } from "@/lib/types/project.types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MobileCalendarView from "@/components/workspace/calendar/MobileCalendarView";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WorkspaceCalendarPage = () => {
  const router = useRouter();
  const { workspaceId } = useWorkspace();
  const { data: projects = [], isLoading } = useGetProjects(workspaceId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "roadmap" | "agenda">(
    "calendar",
  );

  // Filter projects by status
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers for month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Extract items mapped to dates
  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  // Aggregate project events
  const projectEvents = useMemo(() => {
    const events: { [key: string]: ProjectType[] } = {};

    filteredProjects.forEach((project) => {
      // Use created_at or due date
      const dateStr = new Date(project.created_at).toDateString();
      if (!events[dateStr]) {
        events[dateStr] = [];
      }
      events[dateStr].push(project);
    });

    return events;
  }, [filteredProjects]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return projectEvents[selectedDate.toDateString()] || [];
  }, [selectedDate, projectEvents]);

  // Stats calculation
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) =>
      p.status === "completed" ||
      (p.item_count > 0 && p.completed_count === p.item_count),
  ).length;
  const activeProjects = totalProjects - completedProjects;

  if (isLoading) {
    return <Loader page="calendar" />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. Header with Stats */}
      <Header
        title="Calendar & Roadmap"
        subtitle="Schedule, deadlines, and project milestones across your workspace."
        showBackButton
        onBack={() => router.push(`/workspace/${workspaceId}`)}
        stats={[
          {
            title: "Active Initiatives",
            value: activeProjects,
            icon: <Folder className="w-5 h-5 text-primary" />,
          },
          {
            title: "Completed",
            value: completedProjects,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            title: "Total Milestones",
            value: totalProjects,
            icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
          },
        ]}
      />

      {/* 2. Control Toolbar: View Tabs & Month Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Navigation View Tabs */}
        <div className="flex p-1 bg-muted/60 rounded-xl w-full lg:w-auto border border-border/40">
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === "calendar"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === "roadmap"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab("agenda")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === "agenda"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ListTodo className="w-4 h-4" />
            Agenda
          </button>
        </div>

        {/* Calendar Month Navigation controls */}
        {activeTab === "calendar" && (
          <div className="flex items-center gap-2 w-full hidden lg:flex sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToToday}
              className="text-xs rounded-xl border-border/60"
            >
              Today
            </Button>
            <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={prevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-xs sm:text-sm font-bold min-w-[120px] text-center">
                {MONTH_NAMES[month]} {year}
              </span>

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
        )}
      </div>

      {/* --- TAB 1: MONTHLY CALENDAR GRID --- */}
      {activeTab === "calendar" && (
        <>
          {/* Mobile & Tablet Optimized View (sm & md screens) */}
          <MobileCalendarView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            resetToToday={resetToToday}
            calendarDays={calendarDays}
            projectEvents={projectEvents}
            workspaceId={workspaceId}
            monthName={MONTH_NAMES[month]}
            year={year}
          />

          {/* Desktop Full 7-Column Grid (lg+ screens) */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {/* Calendar Grid Box */}
            <div className="col-span-2 bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground pb-2 border-b border-border/40">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayItem, index) => {
                  const dateKey = dayItem.date.toDateString();
                  const dayEvents = projectEvents[dateKey] || [];
                  const isToday =
                    dayItem.date.toDateString() === new Date().toDateString();
                  const isSelected =
                    selectedDate?.toDateString() ===
                    dayItem.date.toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dayItem.date)}
                      className={cn(
                        "min-h-[80px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative group",
                        !dayItem.isCurrentMonth &&
                          "opacity-35 bg-muted/20 border-transparent",
                        dayItem.isCurrentMonth &&
                          "bg-card border-border/60 hover:border-primary/50",
                        isToday && "border-primary font-bold bg-primary/5",
                        isSelected &&
                          "ring-2 ring-primary border-primary bg-primary/10 shadow-xs",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-semibold rounded-md h-5 w-5 flex items-center justify-center",
                            isToday && "bg-primary text-primary-foreground",
                          )}
                        >
                          {dayItem.date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 bg-primary/20 text-primary font-bold"
                          >
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>

                      {/* Event indicators */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div
                            key={evt.id}
                            className="text-[10px] font-medium truncate bg-primary/15 text-primary px-1.5 py-0.5 rounded"
                          >
                            {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[9px] text-muted-foreground font-semibold px-1">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Inspector Sidecard */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Select a Date"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedDateEvents.length} milestone
                    {selectedDateEvents.length === 1 ? "" : "s"} scheduled
                  </p>
                </div>
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-3">
                {selectedDateEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:border-primary/40 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground leading-tight">
                        {evt.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize shrink-0"
                      >
                        {evt.status || "active"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {evt.description || "No project description provided."}
                    </p>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5 justify-between mt-1 text-primary hover:text-primary"
                    >
                      <Link
                        href={`/workspace/${workspaceId}/projects/${evt.id}`}
                      >
                        View Project <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}

                {selectedDateEvents.length === 0 && (
                  <div className="py-12 text-center space-y-2 border-2 border-dashed border-border/60 rounded-xl">
                    <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      No milestones or projects scheduled for this date.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- TAB 2: ROADMAP TIMELINE VIEW --- */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Workspace Initiatives Roadmap
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track milestone progress and execution timelines across all
                  active workspace projects.
                </p>
              </div>
            </div>

            {/* Roadmap Project Bars */}
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const total = project.item_count || 0;
                const completed = project.completed_count || 0;
                const progressPct =
                  total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className="bg-muted/20 border border-border/80 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-foreground">
                            {project.title}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold tracking-wider"
                          >
                            {project.status || "In Progress"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {project.description || "No project description"}
                        </p>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs gap-1.5 shrink-0 self-start sm:self-auto"
                      >
                        <Link
                          href={`/workspace/${workspaceId}/projects/${project.id}`}
                        >
                          Project Workspace{" "}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>

                    {/* Progress Bar & Indicators */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">
                          Milestone Progress: {completed} / {total} tasks
                        </span>
                        <span className="text-primary font-bold">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl space-y-2">
                  <Folder className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    No roadmap initiatives found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: AGENDA LIST VIEW --- */}
      {activeTab === "agenda" && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-bold text-lg text-foreground">
              Agenda & Scheduled Milestones
            </h3>
            <p className="text-xs text-muted-foreground">
              schedule of workspace project deliverables.
            </p>
          </div>

          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-xs capitalize hidden sm:inline-flex"
                  >
                    {project.status || "Active"}
                  </Badge>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 text-primary hover:text-primary"
                  >
                    <Link
                      href={`/workspace/${workspaceId}/projects/${project.id}`}
                    >
                      View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-xs text-muted-foreground">
                  No scheduled agenda items found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCalendarPage;
