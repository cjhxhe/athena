import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <div className="text-8xl font-bold text-primary/20 font-mono mb-4">404</div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">页面不存在</h1>
      <p className="text-muted-foreground mb-6">您访问的页面不存在或已被移除</p>
      <Link href="/dashboard">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Home className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </Link>
    </div>
  );
}
