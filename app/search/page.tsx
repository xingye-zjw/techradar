import { getUnifiedSearchIndex } from "@/lib/search";
import { SearchPageClient } from "./SearchPageClient";

export default function SearchPage() {
  const index = getUnifiedSearchIndex();
  return <SearchPageClient items={index} />;
}
