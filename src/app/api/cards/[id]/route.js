import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req, { params }) {
  const { to, from, message } = await req.json();
  const card = await prisma.card.update({
    where: { id: params.id },
    data: { to, from, message },
  });
  return NextResponse.json(card);
}

export async function DELETE(_req, { params }) {
  await prisma.card.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
