"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArticleBackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="mb-6 -ml-2 hidden md:inline-flex"
    >
      <ArrowLeft className="mr-1 size-4" />
      Back
    </Button>
  );
}
