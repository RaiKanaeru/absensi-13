'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookCopy,
  ClipboardCheck,
  BarChart,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/classes', label: 'Manajemen Kelas', icon: BookCopy },
  { href: '/dashboard/users', label: 'Manajemen Pengguna', icon: Users },
  { href: '/dashboard/attendance', label: 'Absensi', icon: ClipboardCheck },
  { href: '/dashboard/reports', label: 'Laporan', icon: BarChart },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
           <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <>
                    <item.icon />
                    <span>{item.label}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/login" passHref>
              <SidebarMenuButton asChild tooltip="Keluar">
                <>
                  <LogOut />
                  <span>Keluar</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarImage src="https://placehold.co/100x100" alt="Admin" data-ai-hint="user avatar" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Admin Sekolah</span>
            <span className="text-xs text-muted-foreground">admin@sekolah.id</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
