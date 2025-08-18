import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req, { params }) {
  try {
    const card = await prisma.card.findUnique({ where: { id: params.id } });
    if (!card) return NextResponse.json({ error: "not-found" }, { status: 404 });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        to: body.to ?? undefined,
        from: body.from ?? undefined,
        message: body.message ?? undefined
      }
    });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
