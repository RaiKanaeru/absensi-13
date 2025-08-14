import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BookCopy,
  Home,
  LineChart,
  Menu,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white shadow-sm px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-primary hover:bg-primary/10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-white border-r">
          <div className="flex items-center gap-2 py-4 mb-4">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Smart Attend</span>
          </div>
          <nav className="grid gap-2 text-base font-medium">
            {menuItems
              .filter((item) => item.roles.includes(auth.user?.role || ""))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
          </nav>
          <div className="mt-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-lg">Smart Attend Pro</CardTitle>
                <CardDescription>
                  Akses fitur premium dan dukungan prioritas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary hidden md:block" />
        <span className="text-lg font-semibold hidden md:block">Smart Attend</span>
      </div>
      
      <div className="w-full flex-1 flex justify-end items-center gap-4">
        <form className="max-w-sm w-full hidden md:block">
          <div className="relative">
            <Input
              type="search"
              placeholder="Cari..."
              className="w-full appearance-none bg-background pl-8 shadow-none rounded-full border-primary/20 focus-visible:ring-primary"
            />
          </div>
        </form>
        
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifikasi</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <span className="font-medium">AA</span>
              <span className="sr-only">Menu pengguna</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Bantuan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
