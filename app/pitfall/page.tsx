import { getAllPitfalls } from "@/lib/pitfall";
import { PitfallListClient } from "@/components/pitfall/PitfallListClient";

export default function PitfallPage() {
  const pitfalls = getAllPitfalls();
  return <PitfallListClient pitfalls={pitfalls} />;
}
