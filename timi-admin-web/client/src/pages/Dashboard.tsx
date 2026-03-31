/**
 * Dashboard Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard - Stats cards + recent activity
 */
import { useEffect, useState } from 'react';
import { statsApi, type Stats } from '@/lib/api';
import { toast } from 'sonner';
import {
  Users, UserCheck, MessageSquare, Key,
  BookOpen, TrendingUp, Activity, AlertCircle,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className={`stat-card-glow bg-card rounded-xl p-5 border border-border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-1 font-mono ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('获取统计数据失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">系统运营数据总览</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
              <div className="h-4 bg-secondary rounded w-24 mb-3" />
              <div className="h-8 bg-secondary rounded w-16 mb-2" />
              <div className="h-3 bg-secondary rounded w-20" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="信息总数"
              value={stats.totalProfiles}
              subtitle="已发布内容"
              icon={BookOpen}
              color="text-sky-400"
              bgColor="bg-sky-400/10"
            />
            <StatCard
              title="C端用户"
              value={stats.totalAppUsers}
              subtitle={`活跃 ${stats.activeAppUsers}`}
              icon={Users}
              color="text-emerald-400"
              bgColor="bg-emerald-400/10"
            />
            <StatCard
              title="封禁用户"
              value={stats.bannedAppUsers}
              subtitle="需关注"
              icon={AlertCircle}
              color="text-rose-400"
              bgColor="bg-rose-400/10"
            />
            <StatCard
              title="代理总数"
              value={stats.totalAgents}
              subtitle={`活跃 ${stats.activeAgents}`}
              icon={UserCheck}
              color="text-violet-400"
              bgColor="bg-violet-400/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="邀请码"
              value={stats.totalInviteCodes}
              subtitle="已创建"
              icon={Key}
              color="text-amber-400"
              bgColor="bg-amber-400/10"
            />
            <StatCard
              title="开放会话"
              value={stats.openChatSessions}
              subtitle="待处理"
              icon={MessageSquare}
              color="text-sky-400"
              bgColor="bg-sky-400/10"
            />
            <StatCard
              title="总会话数"
              value={stats.totalChatSessions}
              subtitle="历史累计"
              icon={Activity}
              color="text-emerald-400"
              bgColor="bg-emerald-400/10"
            />
            <StatCard
              title="活跃代理"
              value={stats.activeAgents}
              subtitle={`共 ${stats.totalAgents} 个代理`}
              icon={TrendingUp}
              color="text-violet-400"
              bgColor="bg-violet-400/10"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无数据</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '管理信息', href: '/profiles', icon: BookOpen, color: 'text-sky-400', bg: 'bg-sky-400/10' },
            { label: '用户管理', href: '/users', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: '代理管理', href: '/agents', icon: UserCheck, color: 'text-violet-400', bg: 'bg-violet-400/10' },
            { label: '客服中心', href: '/chat', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
