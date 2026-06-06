"use client";
import { useParams } from "next/navigation";
export default function ThesisDetailPage() {
  const { id } = useParams();
  return <div className="max-w-4xl mx-auto py-20 text-center text-zinc-400">Thesis #{id}</div>;
}
