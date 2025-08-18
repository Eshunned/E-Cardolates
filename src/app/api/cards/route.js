import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { to, from, message } = await req.json();
    const card = await prisma.card.create({
      data: { to: to || "", from: from || "", message: message || "" }
    });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
