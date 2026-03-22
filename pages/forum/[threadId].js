import { useEffect } from "react";
import { useRouter } from "next/router";

// Legacy route — redirect to main forum
export default function ThreadRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/forum"); }, [router]);
  return null;
}
