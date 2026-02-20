import Sidebar from '@/components/admin/Sidebar';
import MobileHeader from '@/components/admin/MobileHeader';
import { Toaster } from 'react-hot-toast';
import "../css/style.css"; 
import AdminGuard from '@/components/admin/AdminGuard';
import { ReduxProvider } from '@/redux/provider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-[#111318] dark:text-white antialiased">
        <ReduxProvider>
          <AdminGuard>
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark">
                    <MobileHeader />
                    <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                        {children}
                    </main>
                </div>
                <Toaster position="top-right" />
            </div>
          </AdminGuard>
        </ReduxProvider>
      </body>
    </html>
  )
}
