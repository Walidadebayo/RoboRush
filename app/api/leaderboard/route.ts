import Score from "@/models/scores";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const leaderboard = await Score.findAll({
      order: "score DESC, time ASC, attempts ASC",
      where: { score: { gt: 0 } },
      limit: 10,
      attributes: ["name", "score", "time", "attempts", "updated_at"],
    });
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
