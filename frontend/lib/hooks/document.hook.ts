import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document.api";
import { toast } from "sonner";

// Get all workspace documents
export function useGetDocuments(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-documents", workspaceId],
    queryFn: () => documentApi.getDocuments(workspaceId),
    enabled: !!workspaceId,
  });
}

// Upload a document
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      formData,
    }: {
      workspaceId: string;
      formData: FormData;
    }) => documentApi.uploadDocument(workspaceId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-documents", variables.workspaceId],
      });
      toast.success("Document uploaded successfully!");
    },
  });
};

// Delete a document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      documentId,
    }: {
      workspaceId: string;
      documentId: string;
    }) => documentApi.deleteDocument(workspaceId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-documents", variables.workspaceId],
      });
      toast.success("Document deleted successfully!");
    },
  });
};

// Download a document
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      documentId,
      fileName,
    }: {
      workspaceId: string;
      documentId: string;
      fileName: string;
    }) => documentApi.downloadDocument(workspaceId, documentId, fileName),
    onError: () => {
      toast.error("Failed to download document.");
    },
  });
};
