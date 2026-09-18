import type { Metadata } from "next";
import { FieldGallery } from "@/components/engineering/field-gallery";

export const metadata: Metadata = { title: "Field reports" };
export default function FieldReportsPage() { return <FieldGallery />; }