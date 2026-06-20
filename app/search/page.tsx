import { getIntelSearchIndex } from "@/lib/intel";
import { SearchPageClient } from "./SearchPageClient";

export default function SearchPage() {
  const index = getIntelSearchIndex();
  return <SearchPageClient items={index} />;
}
