import type { Metadata } from "next";
import { CheckoutList } from "@/components/engineering/checkout-list";

export const metadata: Metadata = { title: "Checkouts" };
export default function CheckoutsPage() { return <CheckoutList />; }