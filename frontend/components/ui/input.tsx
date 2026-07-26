import * as React from "react";
import { cn } from "@/lib/utils";

export type InputOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "time"
  | "search"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "switch";

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  variant?: InputType;
  type?: string; // fallback standard type
  label?: React.ReactNode;
  required?: boolean;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  options?: InputOption[];
  rows?: number;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "horizontal" | "vertical"; // for radio group
  value?: any;
  onChange?: (e: any) => void;
}

export const SwitchComponent = ({
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-primary" : "bg-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
};

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputProps
>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      inputClassName,
      variant = "text",
      type,
      label,
      required,
      helperText,
      error,
      leftIcon,
      rightIcon,
      options = [],
      rows = 3,
      orientation = "vertical",
      disabled,
      value,
      onChange,
      id,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const effectiveType = type || variant;

    // Base input styling
    const baseInputStyles = cn(
      "h-10 w-full min-w-0 rounded-xl border border-input bg-card px-3 py-2 text-sm transition-all duration-200 outline-none",
      "placeholder:text-muted-foreground/60 text-foreground",
      "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50",
      error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
      leftIcon && "pl-9",
      rightIcon && "pr-9",
      inputClassName,
      className,
    );

    // Render Label
    const renderLabel = () => {
      if (!label) return null;
      return (
        <label
          htmlFor={inputId}
          className={cn(
            "text-xs font-semibold text-foreground/90 flex items-center gap-1 mb-1.5",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
      );
    };

    // Render Helper / Error Message
    const renderMessage = () => {
      if (error) {
        return (
          <p className="text-[11px] font-medium text-destructive mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
            {error}
          </p>
        );
      }
      if (helperText) {
        return (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {helperText}
          </p>
        );
      }
      return null;
    };

    // 1. Switch Variant
    if (variant === "switch") {
      const isChecked = Boolean(value);
      return (
        <div className={cn("w-full flex flex-col", containerClassName)}>
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all">
            {label && (
              <div className="space-y-0.5 min-w-0 flex-1">
                <label
                  htmlFor={inputId}
                  className={cn(
                    "text-xs sm:text-sm font-semibold text-foreground/90 cursor-pointer select-none block",
                    labelClassName,
                  )}
                  onClick={() => !disabled && onChange && onChange(!isChecked)}
                >
                  {label}
                  {required && (
                    <span className="text-destructive font-bold ml-1">*</span>
                  )}
                </label>
                {helperText && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    {helperText}
                  </p>
                )}
              </div>
            )}
            <SwitchComponent
              checked={isChecked}
              onCheckedChange={(newVal) => onChange && onChange(newVal)}
              disabled={disabled}
              className={className}
            />
          </div>
          {renderMessage()}
        </div>
      );
    }

    // 2. Textarea Variant
    if (variant === "textarea") {
      return (
        <div className={cn("w-full flex flex-col", containerClassName)}>
          {renderLabel()}
          <div className="relative w-full">
            {leftIcon && (
              <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
                {leftIcon}
              </div>
            )}
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              disabled={disabled}
              value={value ?? ""}
              onChange={onChange}
              placeholder={placeholder}
              className={cn(
                baseInputStyles,
                "h-auto py-2.5 resize-y min-h-[80px]",
              )}
              {...(props as any)}
            />
            {rightIcon && (
              <div className="absolute right-3 top-3 text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
          {renderMessage()}
        </div>
      );
    }

    // 3. Select Dropdown Variant
    if (variant === "select") {
      return (
        <div className={cn("w-full flex flex-col", containerClassName)}>
          {renderLabel()}
          <div className="relative w-full">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {leftIcon}
              </div>
            )}
            <select
              id={inputId}
              ref={ref as React.Ref<HTMLSelectElement>}
              disabled={disabled}
              value={value ?? ""}
              onChange={onChange}
              className={cn(baseInputStyles, "appearance-none cursor-pointer pr-8")}
              {...(props as any)}
            >
              {placeholder && (
                <option value="" disabled hidden>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option
                  key={String(opt.value)}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {typeof opt.label === "string" ? opt.label : String(opt.value)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon || (
                <svg
                  className="w-4 h-4 fill-current opacity-70"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              )}
            </div>
          </div>
          {renderMessage()}
        </div>
      );
    }

    // 4. Radio Group Variant
    if (variant === "radio") {
      return (
        <div className={cn("w-full flex flex-col", containerClassName)}>
          {renderLabel()}
          <div
            className={cn(
              "flex gap-4 pt-1",
              orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
            )}
          >
            {options.map((opt) => {
              const isChecked = value === opt.value;
              return (
                <label
                  key={String(opt.value)}
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none py-1.5 px-3 rounded-xl border transition-all",
                    isChecked
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border hover:bg-muted/50 text-foreground",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <input
                    type="radio"
                    name={inputId}
                    value={opt.value}
                    checked={isChecked}
                    disabled={opt.disabled || disabled}
                    onChange={() => onChange && onChange(opt.value)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          {renderMessage()}
        </div>
      );
    }

    // 5. Checkbox Variant
    if (variant === "checkbox") {
      return (
        <div className={cn("flex flex-col", containerClassName)}>
          <label
            className={cn(
              "flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName,
            )}
          >
            <input
              id={inputId}
              ref={ref as React.Ref<HTMLInputElement>}
              type="checkbox"
              checked={Boolean(value)}
              disabled={disabled}
              onChange={(e) => onChange && onChange(e.target.checked)}
              className="accent-primary w-4 h-4 rounded cursor-pointer border-border"
              {...(props as any)}
            />
            {label}
            {required && <span className="text-destructive font-bold">*</span>}
          </label>
          {renderMessage()}
        </div>
      );
    }

    // 6. Standard Text / Number / Email / Password / Date / Search Input Variant
    return (
      <div className={cn("w-full flex flex-col", containerClassName)}>
        {renderLabel()}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref as React.Ref<HTMLInputElement>}
            type={effectiveType}
            disabled={disabled}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            className={baseInputStyles}
            {...(props as any)}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted-foreground flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {renderMessage()}
      </div>
    );
  },
);

Input.displayName = "Input";

export { FormInput } from "./form-input";
