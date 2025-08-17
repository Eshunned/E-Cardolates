import { prisma } from "../../lib/prisma";
import Page from "@/app/page"; // reuse your client component with props

export const revalidate = 0;

export default async function CardById({ params }) {
  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return <main style={{ color: "#fff", padding: 24 }}>Not found</main>;

  return (
    <Page
      initialTo={card.to}
      initialFrom={card.from}
      initialMessage={card.message}
      readOnly={false}  // set true if you want a non-editable view
      existingId={card.id}
    />
  );
}
