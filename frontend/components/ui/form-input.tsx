"use client";

import * as React from "react";
import {
  useController,
  UseControllerProps,
  Control,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { Input, InputProps } from "./input";

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<InputProps, "name" | "value" | "onChange" | "onBlur"> {
  name: Path<TFieldValues>;
  control?: Control<TFieldValues>;
  register?: UseFormRegister<TFieldValues>;
  rules?: UseControllerProps<TFieldValues>["rules"];
  defaultValue?: any;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  register,
  rules,
  defaultValue,
  error: customError,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  // If control is provided, useController
  if (control) {
    return (
      <FormInputWithController
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        customError={customError}
        inputProps={inputProps}
      />
    );
  }

  // If register is provided
  if (register) {
    const registration = register(name, rules);
    return (
      <Input
        {...inputProps}
        {...registration}
        name={name}
        error={customError}
      />
    );
  }

  // Fallback direct Input
  return <Input {...inputProps} name={name} error={customError} />;
}

function FormInputWithController<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  customError,
  inputProps,
}: {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: UseControllerProps<TFieldValues>["rules"];
  defaultValue?: any;
  customError?: string;
  inputProps: Omit<InputProps, "name" | "value" | "onChange" | "onBlur">;
}) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  const handleChange = (e: any) => {
    if (e && e.target !== undefined) {
      if (inputProps.variant === "checkbox") {
        onChange(e.target.checked);
      } else {
        onChange(e.target.value);
      }
    } else {
      onChange(e);
    }
  };

  return (
    <Input
      {...inputProps}
      ref={ref}
      name={name}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={onBlur}
      error={error?.message || customError}
    />
  );
}
