import HomeWithAuth from "@/components/home/HomeWithAuth";
import HomeWithoutAuth from "@/components/home/HomeWithoutAuth";
import { getSessionUser } from "@/lib/actions/auth.actions";
import MainLayout from "./(main)/layout";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { workspaceApi } from "@/lib/api/workspace.api";

export default async function LandingPage() {
  const user = await getSessionUser();
  const queryClient = new QueryClient();

  if (user) {
    await queryClient.prefetchQuery({
      queryKey: ["workspaces"],
      queryFn: workspaceApi.getWorkspaces,
    });
  }

  return (
    <>
      {user ? (
        <MainLayout>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeWithAuth user={user} />
          </HydrationBoundary>
        </MainLayout>
      ) : (
        <HomeWithoutAuth />
      )}
    </>
  );
}
