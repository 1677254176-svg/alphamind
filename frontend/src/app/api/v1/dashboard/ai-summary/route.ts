import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ recap: "📊 今日A股三大指数走势分化。上证微涨0.36%报3380点，两市成交额约1.2万亿。\n\n🔥 AI概念板块继续活跃，多股涨停。北向资金今日净流入58亿，连续3日净流入。\n\n📌 重点关注：\n• 美联储6月议息会议临近\n• 中报预披露窗口即将开启\n• 科创50表现强势，资金持续流入" });
}