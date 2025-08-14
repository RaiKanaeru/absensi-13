"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookCopy, Home, LineChart, Package, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["admin", "guru", "wali_kelas"],
  },
  {
    href: "/dashboard/classes",
    label: "Kelas",
    icon: BookCopy,
    roles: ["admin", "guru", "wali_kelas"],
  },
  {
    href: "/dashboard/users",
    label: "Pengguna",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/dashboard/attendance",
    label: "Absensi",
    icon: Package,
    roles: ["admin", "guru", "wali_kelas"],
  },
  {
    href: "/dashboard/reports",
    label: "Laporan",
    icon: LineChart,
    roles: ["admin", "guru", "wali_kelas"],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-white shadow-sm md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg">Smart Attend</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-primary hover:bg-primary/10 rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifikasi</span>
          </Button>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {menuItems
              .filter((item) =>
                item.roles.includes(auth.user?.role || ""),
              )
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary ${
                    pathname === item.href ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
