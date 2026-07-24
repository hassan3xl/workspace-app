import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { workspaceApi } from "@/lib/api/workspace.api";
import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";

export default async function WorkspaceDetailsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const queryClient = new QueryClient();

  // Prefetch Dashboard Data
  await queryClient.prefetchQuery({
    queryKey: ["workspace-dashboard", workspaceId],
    queryFn: () => workspaceApi.getWorkspaceDashboard(workspaceId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspaceDashboard />
    </HydrationBoundary>
  );
}
