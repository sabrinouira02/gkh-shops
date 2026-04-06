// import { AppContent } from '@/components/app-content'
// import { AppShell } from '@/components/app-shell'
import { AppSidebar, SidebarProvider } from '@/components/app-sidebar'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import { type BreadcrumbItem } from '@/types'
import { type PropsWithChildren, useState, useEffect } from 'react'
import AppFooter from '../../components/AppFooter'
import AppAside from '../../components/AppAside'
import Loader from '@/components/Loader'
import FlashNotifications from '../../components/FlashNotifications'
import { router } from '@inertiajs/react'

export default function AppSidebarLayout({
  children,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unbindStart = router.on('start', () => setLoading(true));
    const unbindFinish = router.on('finish', () => setLoading(false));
    const unbindError = router.on('error', () => setLoading(false));

    return () => {
      unbindStart();
      unbindFinish();
      unbindError();
    };
  }, []);

  return (
    <SidebarProvider>
      <Loader show={loading} />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <div className="body flex-grow-1">
          <AppSidebarHeader />
          <FlashNotifications />
          {children}
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </SidebarProvider>
  )
}