import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan } = body;

    if (typeof plan !== "string" || !plan.trim()) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("study_analyzer");

    const result = await db.collection("plans").insertOne({
      plan,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Failed to save plan:", error);

    return NextResponse.json(
      { error: "Failed to save plan" },
      { status: 500 }
    );
  }
}