import CardolateStyles from "@/components/CardolateStyles";
import Cardolate from "@/components/Cardolate";
import LZString from "lz-string";

export default function SharePage({ params }) {
  const { to, from, msg } = params;
  console.log("SharePage params:", params);
  console.log("SharePage params:", params);
  const decodedMsg = msg ? LZString.decompressFromEncodedURIComponent(msg) : "";

  return (
    <main className="root">
      <CardolateStyles />
      <Cardolate
        initialTo={decodeURIComponent(to)}
        initialFrom={decodeURIComponent(from)}
        initialMessage={decodedMsg}
        onlyCard={true}
        readOnly={true}
      />
    </main>
  );
}
