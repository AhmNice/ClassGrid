import React from 'react'
import { SidebarProvider } from '../context/SidebarContext'
import Sidebar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import { schoolName } from '../utils/general';

interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout = ({children}:MainLayoutProps) => {
  return (
   <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar schoolName={schoolName} />

       <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          <Header />
          <Breadcrumbs />

         <div className="flex-1 overflow-y-auto pb-8">
            {/* Centered, padded content wrapper lives inside the scroll root. */}
            <div className="mx-auto max-w-7xl px-8 py-7">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout