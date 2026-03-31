/**
 * DashboardLayout - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * Fixed left sidebar (260px) + top header + main content area
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  Key,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navGroups = [
  {
    label: '概览',
    items: [
      { label: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: '内容管理',
    items: [
      { label: '信息列表', href: '/profiles', icon: BookOpen },
    ],
  },
  {
    label: '用户管理',
    items: [
      { label: 'C端用户', href: '/users', icon: Users },
      { label: '代理管理', href: '/agents', icon: UserCheck },
    ],
  },
  {
    label: '系统配置',
    items: [
      { label: '邀请码', href: '/invite-codes', icon: Key },
      { label: '字典管理', href: '/dictionaries', icon: Settings },
    ],
  },
  {
    label: '客服中心',
    items: [
      { label: '客服会话', href: '/chat', icon: MessageSquare },
    ],
  },
];

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [location] = useLocation();
  const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));

  return (
    <Link href={item.href}>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer group',
          isActive
            ? 'sidebar-item-active text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        )}
      >
        <item.icon className={cn('shrink-0 w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full font-mono">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { adminInfo, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-sidebar-border',
        sidebarCollapsed && 'justify-center px-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="text-sm font-semibold text-foreground">Timi Admin</div>
            <div className="text-xs text-muted-foreground">管理后台</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className={cn(
        'border-t border-sidebar-border p-3',
        sidebarCollapsed ? 'flex justify-center' : ''
      )}>
        {sidebarCollapsed ? (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground w-8 h-8">
            <LogOut className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {adminInfo?.username?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {adminInfo?.username || '管理员'}
              </div>
              <div className="text-xs text-muted-foreground">超级管理员</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive w-8 h-8 shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground w-8 h-8"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-muted-foreground hover:text-foreground w-8 h-8"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8">
              <Bell className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {adminInfo?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground hidden sm:block">
                    {adminInfo?.username || '管理员'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
