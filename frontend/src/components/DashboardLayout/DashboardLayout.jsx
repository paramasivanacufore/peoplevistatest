import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export default function DashboardLayout({ children, pageTitle }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuClick = () => {
        if (window.innerWidth < 1024) {
            setIsMobileOpen(!isMobileOpen);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50">
            <Sidebar 
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileOpen}
                onToggle={setIsSidebarCollapsed}
                onMobileToggle={setIsMobileOpen}
            />
            
            {/* Main Wrapper */}
            <div className={`
                flex-1 flex flex-col min-w-0 h-full
                transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
            `}>
                <Topbar pageTitle={pageTitle} onMenuClick={handleMenuClick} />
                
                {/* Dashboard Container */}
                <div style={{background:"#e9eff5"}} className="flex-1 bg-[#e4eaf2] p-3 overflow-y-auto min-h-0 scrollbar-hide">
                    {children}
                </div>
                     <Footer />
            </div>
       
        </div>
    );
}
