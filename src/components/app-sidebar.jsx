import * as React from "react"
import { NavLink } from "react-router-dom"
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  InboxArrowDownIcon,
  CpuChipIcon,
  Cog8ToothIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useLanguage } from "../context/LanguageContext"
import { useApp } from "../context/AppContext"

const navItems = [
  { name: 'dashboard', href: '/', icon: ChartBarIcon },
  { name: 'leads', href: '/leads', icon: UsersIcon },
  { name: 'agenda', href: '/agenda', icon: CalendarDaysIcon },
  { name: 'mailCampaigns', href: '/campaigns', icon: EnvelopeIcon },
  { name: 'tabEmailNav', href: '/email-settings', icon: InboxArrowDownIcon },
  { name: 'tabAutomationNav', href: '/automation-settings', icon: CpuChipIcon },
  { name: 'settings', href: '/settings', icon: Cog8ToothIcon },
]

export function AppSidebar({ ...props }) {
  const { t } = useLanguage()
  const { appConfig } = useApp()

  return (
    <Sidebar collapsible="icon" className="border-r border-border" {...props}>
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
             <img src="/vite.svg" className="h-4 w-4" alt="Logo" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            <span className="font-semibold text-sm truncate">{appConfig.companyName || 'FleetTrack'}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CRM Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={t(item.name)}
                    className="h-10 transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground group"
                  >
                    <NavLink to={item.href} end={item.href === '/'}>
                      <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{t(item.name)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border group-data-[collapsible=icon]:p-2">
         {/* Profile or other footer info could go here */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
