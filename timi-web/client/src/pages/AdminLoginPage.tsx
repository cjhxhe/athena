import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.adminLogin(username, password);
      if (response.data.success) {
        setToken(response.data.token);
        toast.success('登录成功！');
        setLocation('/admin/dashboard');
      } else {
        toast.error(response.data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* 返回按钮 */}
      <div className="container pt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* 登录表单 */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo 区域 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-2">Timi</h1>
            <p className="text-muted-foreground text-lg">管理后台</p>
          </div>

          {/* 登录卡片 */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                管理员登录
              </h2>
              <p className="text-muted-foreground">
                请输入管理员账号和密码
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  用户名
                </label>
                <Input
                  type="text"
                  placeholder="输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  密码
                </label>
                <Input
                  type="password"
                  placeholder="输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            {/* 提示信息 */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                💡 默认账号: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
