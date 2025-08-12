
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  BookCopy,
  ClipboardCheck,
  BarChart,
  Settings,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { Logo } from '@/components/logo';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/classes', label: 'Kelas', icon: BookCopy },
  { href: '/dashboard/users', label: 'Pengguna', icon: Users },
  { href: '/dashboard/attendance', label: 'Absensi', icon: ClipboardCheck },
  { href: '/dashboard/reports', label: 'Laporan', icon: BarChart },
];

function SidebarToggleButton() {
    const { state, toggleSidebar } = useSidebar();
  
    return (
      <SidebarMenuButton onClick={toggleSidebar} tooltip={state === 'expanded' ? 'Ciutkan' : 'Perluas'}>
        {state === 'collapsed' ? <PanelRight /> : <PanelLeft />}
        <span>{state === 'expanded' ? 'Ciutkan' : 'Perluas'}</span>
      </SidebarMenuButton>
    );
  }

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" collapsible="icon" variant="sidebar">
      <SidebarContent className="flex-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton
                asChild
                className="w-full justify-start text-2xl font-bold"
                tooltip="Smart Attend"
              >
                <a>
                  <ClipboardCheck className="size-6 shrink-0" />
                  <span className="sr-only">Smart Attend</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarToggleButton />
            </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Pengaturan">
                <a>
                  <Settings className="size-5" />
                  <span>Pengaturan</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
