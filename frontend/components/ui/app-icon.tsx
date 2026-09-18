import { cn } from "@/lib/utils/cn";
import { iconData, type IconName } from "@/lib/icons/generated";

export type { IconName };

export interface AppIconProps extends React.ComponentProps<"svg"> {
  name: IconName;
  label?: string;
}

export function AppIcon({ name, label, className, ...props }: AppIconProps) {
  const icon = iconData[name];

  return (
    <svg
      viewBox={icon.viewBox}
      className={cn("size-5 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...props}
    />
  );
}

/** Named lookups so pages never hold raw icon strings. */
export const icons = {
  dashboard: "lucide:layout-grid",
  products: "lucide:package",
  orders: "lucide:shopping-cart",
  users: "lucide:users",
  settings: "lucide:settings",
  support: "lucide:life-buoy",
  chat: "lucide:message-circle",
  search: "lucide:search",
  bell: "lucide:bell",
  history: "lucide:history",
  account: "lucide:circle-user-round",
  filter: "lucide:list-filter",
  export: "lucide:download",
  plus: "lucide:plus",
  chevronLeft: "lucide:chevron-left",
  chevronRight: "lucide:chevron-right",
  chevronDown: "lucide:chevron-down",
  menu: "lucide:menu",
  moreVertical: "lucide:more-vertical",
  close: "lucide:x",
  eye: "lucide:eye",
  eyeOff: "lucide:eye-off",
  google: "logos:google-icon",
  alert: "lucide:triangle-alert",
  trendUp: "lucide:trending-up",
  box: "lucide:box",
  receipt: "lucide:receipt-text",
  truck: "lucide:truck",
  wallet: "lucide:wallet",
  panelLeft: "lucide:panel-left",
  compass: "lucide:compass",
  logout: "lucide:log-out",
  loader: "lucide:loader",
} as const satisfies Record<string, IconName>;
