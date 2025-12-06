import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
export const dynamic = "force-dynamic";

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "BACKEND_URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/questions`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend /questions error:", res.status, text);
      return NextResponse.json(
        { error: "Backend error", status: res.status },
        { status: 500 }
      );
    }

    const data = await res.json(); // expects the questions array
    return NextResponse.json(data);
  } catch (err) {
    console.error("Questions API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch questions", detail: String(err) },
      { status: 500 }
    );
  }
}
