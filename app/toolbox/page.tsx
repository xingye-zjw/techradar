import { getToolCategories, getToolboxDataWithRelated } from "@/lib/toolbox";
import { ToolboxClient } from "./ToolboxClient";

export default function ToolboxPage() {
  const data = getToolboxDataWithRelated();
  const categories = getToolCategories();
  return <ToolboxClient tools={data.tools} scenarios={data.scenarios} categories={categories} />;
}
