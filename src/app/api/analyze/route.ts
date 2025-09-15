// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze answers" }, { status: 500 });
  }
}
