import Score, { ScoreAttributes } from "@/models/scores";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.name ||
      typeof body.score !== "number" ||
      typeof body.time !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let updatedScore;

    const existingScore = await Score.findOne({
      where: { name: body.name.toString() },
    });

    if (existingScore) {
      if (body.new) {
        updatedScore = existingScore;
      } else {
        (existingScore as unknown as ScoreAttributes).score = body.score;
        (existingScore as unknown as ScoreAttributes).time = body.time;
        (existingScore as unknown as ScoreAttributes).attempts =
          body.attempts || 1;
        updatedScore = await existingScore.update();
      }
    } else {
      const newScore = {
        name: body.name,
        score: body.score,
        time: body.time,
        attempts: body.attempts || 1,
      };
      updatedScore = new Score(newScore);
      await updatedScore.save();
    }

    return NextResponse.json({ success: true, score: updatedScore });
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json(
      { error: "Failed to submit score" },
      { status: 500 }
    );
  }
}
