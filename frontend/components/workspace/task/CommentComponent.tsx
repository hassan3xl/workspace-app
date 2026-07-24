"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Send,
  Trash2,
  X,
  MessageSquare,
  MoreHorizontal,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormInput } from "@/components/input/formInput";
import { formatDate } from "@/lib/utils";
import {
  useCommentTask,
  useUpdateComment,
  useDeleteComment,
} from "@/lib/hooks/project.hook";
import { CommentsType } from "@/lib/types/project.types";
import { useAuth } from "@/contexts/AuthContext";

type FormData = {
  content: string;
};

interface CommentComponentProps {
  comments: CommentsType[];
  isOpen: boolean;
  itemId: string;
  projectId: string;
  workspaceId: string;
}

const CommentComponent = ({
  comments,
  isOpen,
  itemId,
  projectId,
  workspaceId,
}: CommentComponentProps) => {
  // Hook Integration
  const { mutateAsync: postComment, isPending } = useCommentTask();
  const { user } = useAuth();

  // RHF Setup
  const { register, handleSubmit, reset, watch } = useForm<FormData>();

  // Watch content for UI states
  const commentValue = watch("content");

  const onSubmit = async (data: FormData) => {
    try {
      await postComment({
        workspaceId,
        projectId,
        itemId,
        commentData: data,
      });
      reset();
    } catch (error: any) {}
  };

  if (!isOpen) return null;

  return (
    <div className="pt-2">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>Discussion ({comments.length})</span>
      </div>

      <div className="flex gap-4">
        {/* User Avatar (Current User Placeholder) */}
        <Avatar className="w-8 h-8 ">
          <AvatarImage src={user?.avatar || ""} />

          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {user?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Input Form Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="relative group">
            <div className="relative rounded transition-all">
              <FormInput
                name="content"
                register={register}
                field="textarea"
                placeholder="Add to the discussion..."
                rows={2}
                className="border-0 focus-visible:ring-0 resize-none bg-transparent min-h-[60px] p-3 text-sm"
              />

              <div className="flex justify-between items-center p-2">
                <div className="text-xs text-muted-foreground pl-2"></div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending || !commentValue?.trim()}
                    className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  >
                    {isPending ? "Sending..." : "Comment"}{" "}
                    <Send className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Timeline List */}
      <div className="mt-8 space-y-6 relative ml-8 sm:ml-12">
        {/* Vertical connector line */}
        {comments.length > 0 && (
          <div className="absolute left-[-25px] sm:left-[-34px] top-2 bottom-4 w-px bg-border/50" />
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            workspaceId={workspaceId}
            projectId={projectId}
            taskId={itemId}
          />
        ))}
      </div>
    </div>
  );
};

// Extracted for cleaner state management
const CommentItem = ({
  comment,
  workspaceId,
  projectId,
  taskId,
}: {
  comment: CommentsType;
  workspaceId: string;
  projectId: string;
  taskId: string;
}) => {
  const { user } = useAuth(); // Assume we have user context
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);

  const { mutateAsync: updateComment, isPending: isUpdating } =
    useUpdateComment();
  const { mutateAsync: deleteComment, isPending: isDeleting } =
    useDeleteComment();

  // Permissions: Author OR Admin/Owner (we'd need workspace role here strictly,
  // but for now let's allow author. Backend handles security).
  const isAuthor = user?.username === comment.author.username; // Or ID check if available

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment({
        workspaceId,
        projectId,
        itemId: taskId,
        commentId: comment.id,
        commentData: { content: editContent },
      });
      setIsEditing(false);
    } catch (e) {
      // toast handled by hook
    }
  };

  const handleDelete = async () => {
    await deleteComment({
      workspaceId,
      projectId,
      itemId: taskId,
      commentId: comment.id,
    });
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="relative group/comment">
        {/* Avatar Node */}
        <div className="absolute left-[-42px] sm:left-[-50px] top-0 bg-background rounded-full p-1 border border-border">
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
            <AvatarImage src={comment.author.avatar || ""} />
            <AvatarFallback className="text-[10px] sm:text-xs bg-secondary font-bold text-muted-foreground">
              {comment.author.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Comment Bubble */}
        <div className="bg-card hover:bg-card/80 border border-border/60 rounded-lg p-4 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {comment.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-[10px] text-muted-foreground italic">
                  (edited)
                </span>
              )}
            </div>

            {/* Dropdown for Actions */}
            {/* Show if Author (or based on role if we passed it down) */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                className="w-full bg-background border border-input rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommentComponent;
