// app/api/test/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; // if you don't have @ alias, use ../../lib/prisma

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    return NextResponse.json({ success: true, time: result[0].now });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
