"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { TaskType } from "@/lib/types/project.types";
import { useUpdateTask } from "@/lib/hooks/project.hook";
import BaseModal from "@/components/modals/BaseModal";
import { FormInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workspaceId: string;
  projectId: string;
  itemId: string;
  initialData: TaskType | null;
}

interface FormData {
  title: string;
  description: string;
  priority: string;
  due_date?: string | null;
}

const EditTaskModal = ({
  isOpen,
  onClose,
  workspaceId,
  projectId,
  itemId,
  initialData,
}: EditTaskModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: null,
    },
  });

  const { mutateAsync: updateTask, isPending: loading } = useUpdateTask();

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        priority: initialData.priority,
        due_date: initialData.due_date
          ? initialData.due_date.split("T")[0]
          : null,
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateTask({
        workspaceId,
        projectId,
        itemId,
        projectData: data,
      });

      toast.success("Task updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update task");
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <FormInput register={register} name="title" label="Title" required />

        {/* Description */}
        <FormInput
          register={register}
          name="description"
          variant="textarea"
          label="Description"
          rows={3}
        />

        {/* Priority */}
        <FormInput
          register={register}
          name="priority"
          variant="select"
          label="Priority"
          placeholder="Select priority"
          options={[
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
          required
        />

        {/* Due Date */}
        <FormInput
          register={register}
          name="due_date"
          variant="date"
          label="Due Date (optional)"
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditTaskModal;
