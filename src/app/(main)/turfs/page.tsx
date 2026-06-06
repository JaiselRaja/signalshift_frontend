"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listTurfs } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";

export default function TurfsPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTurfs()
      .then((all) => {
        const active = all.find((t) => t.is_active) ?? all[0] ?? null;
        if (!active) {
          setError("No turfs are available right now. Please check back soon.");
          return;
        }
        router.replace(`/turfs/${active.slug}?id=${active.id}`);
      })
      .catch(() => setError("Failed to load turf details. Please try again."));
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-base text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return <PageLoader />;
}
