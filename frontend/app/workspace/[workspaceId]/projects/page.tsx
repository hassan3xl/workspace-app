import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { projectApi } from "@/lib/api/project.api";
import ProjectList from "@/components/workspace/projects/ProjectList";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => projectApi.getProjects(workspaceId),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectList />
    </HydrationBoundary>
  );
}
