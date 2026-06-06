import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id: "ai", name: "AI人工智能", emoji: "🤖", hotLevel: 98, description: "大模型+算力+应用" },
    { id: "robot", name: "机器人", emoji: "🦾", hotLevel: 90, description: "人形机器人+工业自动化" },
    { id: "semiconductor", name: "半导体", emoji: "💾", hotLevel: 85, description: "芯片设计+制造+封测" },
    { id: "new_energy", name: "新能源", emoji: "⚡", hotLevel: 78, description: "光伏+风电+储能+锂电" },
    { id: "low_altitude", name: "低空经济", emoji: "🚁", hotLevel: 92, description: "eVTOL+无人机+空管" },
  ]);
}