import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(req) {
  const { to, from, message } = await req.json();
  if (!to || !from || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const card = await prisma.card.create({ data: { to, from, message } });
  return NextResponse.json(card);
}

export async function GET() {
  const cards = await prisma.card.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(cards);
}
