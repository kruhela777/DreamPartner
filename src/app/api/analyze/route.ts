import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!BACKEND_URL) {
    console.error("BACKEND_URL is not defined");
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_err) {
    console.error("Analyze API error");
    return NextResponse.json(
      { error: "Failed to analyze" },
      { status: 500 }
    );
  }
}
