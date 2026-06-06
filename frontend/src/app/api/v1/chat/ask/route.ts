import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function POST() {
  return NextResponse.json({ answer: "AI 助手需要 OPENAI_API_KEY 环境变量" });
}