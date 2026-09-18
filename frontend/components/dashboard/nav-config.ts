import { icons, type IconName } from "@/components/ui/app-icon";

export interface NavItem {
  href: "/dashboard" | "/products" | "/orders" | "/inventory" | "/projects" | "/checkouts" | "/field-reports" | "/users";
  label: string;
  icon: IconName;
}

export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/inventory", label: "Inventory", icon: icons.products },
  { href: "/projects", label: "Projects", icon: icons.compass },
  { href: "/checkouts", label: "Checkouts", icon: icons.receipt },
  { href: "/field-reports", label: "Field reports", icon: icons.history },
  { href: "/users", label: "Users", icon: icons.users },
];

export const secondaryNav = [
  { label: "Settings", icon: icons.settings },
  { label: "Logout", icon: icons.logout},

] as const;
