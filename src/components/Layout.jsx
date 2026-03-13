import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BellIcon,
  SunIcon, 
  MoonIcon, 
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLeads } from '../context/LeadsContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Layout({ user, onLogout }) {
  const { language, setLanguage, t, languagesList } = useLanguage();
  const { appConfig } = useApp();
  const { isDark, toggle } = useTheme();
  const { notifications = [], setNotifications } = useLeads();
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentLang = languagesList.find(l => l.code === language) || languagesList[0];
  
  const getPageTitle = () => {
    const path = location.pathname.substring(1).split('/')[0];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background transition-colors duration-500">
          <AppSidebar />
          
          <SidebarInset className="flex flex-col flex-1 overflow-hidden">
            {/* ── Global Top Header ───────────────────────────────────────── */}
            <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                 <SidebarTrigger className="h-9 w-9" />
                 <div className="h-5 w-px bg-border mx-2 hidden sm:block"></div>
                 <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground tracking-tight">
                   <span className="opacity-50">CRM</span>
                   <span className="opacity-30">/</span>
                   <span className="text-foreground font-semibold">{getPageTitle()}</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Language Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-4 h-9 border border-border hover:bg-accent font-medium text-xs">
                      {currentLang.code.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-border bg-popover text-popover-foreground shadow-lg">
                    {languagesList.map((lang) => (
                      <DropdownMenuItem 
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`gap-2 cursor-pointer font-medium text-xs ${language === lang.code ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border border-border hover:bg-accent hover:border-primary/20 transition-all">
                      <BellIcon className={`h-5 w-5 ${notifications.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                      {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(227,25,55,0.6)]"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-xl border-border bg-popover shadow-xl p-0">
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                      <h3 className="font-semibold text-xs tracking-tight text-foreground">{t('notifications')}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setNotifications([])} className="h-7 text-xs font-semibold text-primary px-2 hover:bg-transparent">Clear</Button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="p-4 space-y-3">
                          {/* Real notifications would be mapped here */}
                        </div>
                      ) : (
                        <div className="p-10 text-center text-xs text-muted-foreground">
                          Geen nieuwe notificaties
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9 rounded-full border border-border hover:bg-accent text-muted-foreground">
                  {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </Button>

                <div className="h-8 w-px bg-border mx-1"></div>

                {/* Profile Avatar with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-all overflow-hidden">
                      <img src={user?.avatar || 'https://i.pravatar.cc/150'} alt="Profile" className="h-full w-full object-cover" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-xl">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer gap-2 py-2.5">
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
               <div className="container mx-auto px-6 py-8 md:px-10 max-w-7xl">
                  <Outlet />
               </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
