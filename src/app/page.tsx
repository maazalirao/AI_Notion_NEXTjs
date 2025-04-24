
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex items-center space-x-2 animate-pulse">
      <ArrowLeftCircle className="h-12 w-12" />
      <h1 className="font-bold">
        Get Started with your first document
      </h1>
      </main>
  );
}
