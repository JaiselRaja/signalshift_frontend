"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setChecked(true);
    }
  }, [router, pathname]);

  if (!checked) return <PageLoader />;
  return <>{children}</>;
}
