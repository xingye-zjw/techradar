import { getAllIntelCards } from "@/lib/intel";
import { IntelListClient } from "./IntelListClient";

export default function IntelListPage() {
  // Server Component 负责读取数据（可使用 fs）
  const cards = getAllIntelCards();
  return <IntelListClient cards={cards} />;
}
