import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function InviteCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('请输入邀请码');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyCode(code);
      if (response.data.success) {
        setToken(response.data.token);
        toast.success('邀请码验证成功！');
        setLocation('/');
      } else {
        toast.error(response.data.message || '邀请码验证失败');
      }
    } catch (error) {
      console.error('验证邀请码失败:', error);
      toast.error('邀请码验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo 区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-2">Timi</h1>
          <p className="text-muted-foreground text-lg">欢迎来到 Timi</p>
        </div>

        {/* 邀请码输入卡片 */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              请输入邀请码
            </h2>
            <p className="text-muted-foreground">
              只有填入正确的邀请码才能进入列表
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="输入邀请码"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
            >
              {loading ? '验证中...' : '进入'}
            </Button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              💡 如果您没有邀请码，请联系管理员
            </p>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Timi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
