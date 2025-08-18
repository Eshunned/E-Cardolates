import prisma from "@/lib/prisma";
import Cardolate from "@/components/Cardolate";
import { notFound } from "next/navigation";

export default async function CardViewer({ params }) {
  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return notFound();

  return (
    <Cardolate
      initialTo={card.to}
      initialFrom={card.from}
      initialMessage={card.message}
      readOnly
      existingId={card.id}
      onlyCard
    />
  );
}
