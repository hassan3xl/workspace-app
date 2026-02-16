import HomeWithAuth from "@/components/home/HomeWithAuth";
import HomeWithoutAuth from "@/components/home/HomeWithoutAuth";
import { getSessionUser } from "@/lib/actions/auth.actions";
import MainLayout from "./(main)/layout";

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <>
      {user ? (
        <MainLayout>
          <HomeWithAuth user={user} />
        </MainLayout>
      ) : (
        <HomeWithoutAuth />
      )}
    </>
  );
}
