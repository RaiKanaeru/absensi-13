import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-slate-50">
        <DashboardSidebar />
        <div className="flex flex-col sm:pl-14 group-[[data-state=expanded]]/sidebar-wrapper:sm:pl-64 transition-[padding-left] duration-200">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
