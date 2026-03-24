import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import AdminProfilesTab from './AdminProfilesTab';
import AdminInviteCodesTab from './AdminInviteCodesTab';

/**
 * 管理后台仪表板 - 包含 Tab 切换
 * Tab 1: 用户管理（列表、创建、编辑、删除）
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Timi 管理后台</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'profiles'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('inviteCodes')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'inviteCodes'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              邀请码管理
            </button>
          </div>
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'profiles' && <AdminProfilesTab />}
        {activeTab === 'inviteCodes' && <AdminInviteCodesTab />}
      </div>
    </div>
  );
}
