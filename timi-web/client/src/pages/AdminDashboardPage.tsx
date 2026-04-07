import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogOut, Users, Ticket } from 'lucide-react';
import AdminProfilesTab from './AdminProfilesTab';
import AdminInviteCodesTab from './AdminInviteCodesTab';

/**
 * 管理后台仪表板 - 包含 Tab 切换
 * Tab 1: 用户管理（列表、创建、编辑、删除） - 原“信息管理”与“C端用户管理”合并
 * Tab 2: 邀请码管理（列表、创建、编辑、删除、重置）
 */
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'inviteCodes'>('profiles');
  const { logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation('/admin/login');
    toast.success('已退出登录');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Timi</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right mr-4">
              <p className="text-sm font-bold text-slate-700">管理员</p>
              <p className="text-[10px] text-slate-400">超级管理员权限</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              退出
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧侧边栏导航 */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profiles'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 translate-x-1'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('inviteCodes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'inviteCodes'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 translate-x-1'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Ticket className="w-5 h-5" />
              邀请码管理
            </button>
            
            <div className="mt-12 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <p className="text-xs text-slate-400 font-medium mb-1">系统状态</p>
                <p className="text-lg font-bold">运行正常</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-slate-300 font-medium">所有服务已连接</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[600px]">
              {activeTab === 'profiles' && <AdminProfilesTab />}
              {activeTab === 'inviteCodes' && <AdminInviteCodesTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
