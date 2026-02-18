import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { projectApi } from "@/lib/api/project.api";
import ProjectDetails from "@/components/workspace/projects/ProjectDetails";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectApi.getProject(workspaceId, projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetails />
    </HydrationBoundary>
  );
}
