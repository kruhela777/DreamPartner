import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
export const dynamic = "force-dynamic";

export async function GET() {
  if (!BACKEND_URL) {
    console.error("BACKEND_URL is not defined");
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/questions`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Questions API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
