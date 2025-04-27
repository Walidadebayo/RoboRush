import Score from "@/models/scores";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  try {
    const player = await Score.findOne({
      where: { name: name },
      attributes: ["attempts", "score", "time"],
    });

    return NextResponse.json(player);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
