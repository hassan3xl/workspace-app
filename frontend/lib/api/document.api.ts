import { apiService, BASE_URL } from "../services/apiService";
import { getAccessToken } from "../actions/auth.actions";

export const documentApi = {
  getDocuments: async (workspaceId: string) => {
    const res = await apiService.get(
      `/workspaces/${workspaceId}/documents/`
    );
    return res;
  },

  uploadDocument: async (workspaceId: string, formData: FormData) => {
    const res = await apiService.post(
      `/workspaces/${workspaceId}/documents/`,
      formData
    );
    return res;
  },

  deleteDocument: async (workspaceId: string, documentId: string) => {
    const res = await apiService.delete(
      `/workspaces/${workspaceId}/documents/${documentId}/`
    );
    return res;
  },

  /**
   * Download a document by triggering a browser download.
   * Uses fetch with auth token to get the blob, then creates a download link.
   */
  downloadDocument: async (workspaceId: string, documentId: string, fileName: string) => {
    const token = await getAccessToken();
    const response = await fetch(
      `${BASE_URL}/workspaces/${workspaceId}/documents/${documentId}/download/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download document.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
};
