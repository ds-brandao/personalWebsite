export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
] as const;

export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
