/**
 * Users Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * C端用户管理：查看、封禁、停用、启用
 */
import { useEffect, useState } from 'react';
import { appUserApi, type AppUser, type PageResult } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Search, ChevronLeft, ChevronRight, MoreHorizontal,
  ShieldBan, ShieldOff, ShieldCheck, Eye, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  ACTIVE: { label: '正常', className: 'badge-active' },
  BANNED: { label: '封禁', className: 'badge-banned' },
  DISABLED: { label: '停用', className: 'badge-disabled' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchNickname, setSearchNickname] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailUser, setDetailUser] = useState<AppUser | null>(null);

  const fetchUsers = async (p = 0) => {
    setLoading(true);
    try {
      const res = await appUserApi.getUsers(p, 10, searchNickname || undefined, filterStatus || undefined);
      const data = res.data as PageResult<AppUser>;
      setUsers(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
    setPage(0);
  }, [searchNickname, filterStatus]);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleAction = async (id: number, action: 'ban' | 'disable' | 'enable') => {
    try {
      if (action === 'ban') await appUserApi.banUser(id);
      else if (action === 'disable') await appUserApi.disableUser(id);
      else await appUserApi.enableUser(id);
      toast.success('操作成功');
      fetchUsers(page);
    } catch {
      toast.error('操作失败');
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">C端用户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {total} 位注册用户</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索昵称..."
            value={searchNickname}
            onChange={e => setSearchNickname(e.target.value)}
            className="pl-9 bg-secondary/50 border-border h-9"
          />
        </div>
        <Select value={filterStatus || 'all'} onValueChange={v => setFilterStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border h-9">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="ACTIVE">正常</SelectItem>
            <SelectItem value="BANNED">封禁</SelectItem>
            <SelectItem value="DISABLED">停用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">用户ID</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">昵称</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">邀请代理</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">隐私</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">状态</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">注册时间</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-secondary rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => {
                const sc = statusConfig[user.status] || statusConfig.ACTIVE;
                return (
                  <TableRow key={user.id} className="border-border table-row-hover">
                    <TableCell className="font-mono text-sm text-sky-400">{user.accountId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                          {user.nickname?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-foreground">{user.nickname || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.invitedByAgentName || '-'}</TableCell>
                    <TableCell>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', user.privacyEnabled ? 'badge-active' : 'badge-disabled')}>
                        {user.privacyEnabled ? '开启' : '关闭'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', sc.className)}>
                        {sc.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => setDetailUser(user)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status !== 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'enable')}>
                                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                                启用账号
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'BANNED' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'ban')} className="text-rose-400">
                                <ShieldBan className="w-4 h-4 mr-2" />
                                封禁账号
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'DISABLED' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'disable')}>
                                <ShieldOff className="w-4 h-4 mr-2 text-amber-400" />
                                停用账号
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">第 {page + 1} / {totalPages} 页，共 {total} 条</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0} className="h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="h-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-3 text-sm">
              {[
                { label: '用户ID', value: detailUser.accountId, mono: true },
                { label: '昵称', value: detailUser.nickname || '-' },
                { label: '邀请代理', value: detailUser.invitedByAgentName || '-' },
                { label: '隐私模式', value: detailUser.privacyEnabled ? '已开启' : '已关闭' },
                { label: '账号状态', value: statusConfig[detailUser.status]?.label || detailUser.status },
                { label: '注册时间', value: detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString('zh-CN') : '-', mono: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={cn('text-foreground', row.mono && 'font-mono text-sky-400')}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
