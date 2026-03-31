/**
 * InviteCodes Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * 邀请码管理：创建、编辑、重置、删除
 */
import { useEffect, useState } from 'react';
import { inviteCodeApi, type InviteCode, type PageResult } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  RefreshCw, Copy, Key, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Partial<InviteCode> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCodes = async (p = 0) => {
    setLoading(true);
    try {
      const res = await inviteCodeApi.getCodes(p, 10);
      const data = res.data as PageResult<InviteCode>;
      setCodes(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('获取邀请码列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(page); }, [page]);

  const openCreate = () => {
    setEditingCode({ totalCount: 100, description: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: InviteCode) => {
    setEditingCode({ ...c });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCode?.code) { toast.error('请填写邀请码'); return; }
    setSaving(true);
    try {
      if (editingCode.id) {
        await inviteCodeApi.updateCode(editingCode.id, editingCode);
        toast.success('更新成功');
      } else {
        await inviteCodeApi.createCode(editingCode);
        toast.success('创建成功');
      }
      setDialogOpen(false);
      fetchCodes(page);
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该邀请码？')) return;
    try {
      await inviteCodeApi.deleteCode(id);
      toast.success('删除成功');
      fetchCodes(page);
    } catch {
      toast.error('删除失败');
    }
  };

  const handleReset = async (id: number) => {
    try {
      await inviteCodeApi.resetCode(id);
      toast.success('使用次数已重置');
      fetchCodes(page);
    } catch {
      toast.error('重置失败');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success('邀请码已复制'));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">邀请码管理</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {total} 个邀请码</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          新增邀请码
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">邀请码</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">描述</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">已用/总量</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">过期时间</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">创建时间</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-secondary rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Key className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  暂无邀请码
                </TableCell>
              </TableRow>
            ) : (
              codes.map(code => {
                const usageRatio = code.totalCount > 0 ? code.usageCount / code.totalCount : 0;
                const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();
                return (
                  <TableRow key={code.id} className="border-border table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-sky-400 font-semibold">{code.code}</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground hover:text-foreground" onClick={() => copyCode(code.code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{code.description || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            <span className={usageRatio >= 1 ? 'text-rose-400' : 'text-emerald-400'}>{code.usageCount}</span>
                            <span className="text-muted-foreground"> / {code.totalCount}</span>
                          </span>
                        </div>
                        <div className="w-24 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', usageRatio >= 1 ? 'bg-rose-400' : usageRatio >= 0.8 ? 'bg-amber-400' : 'bg-emerald-400')}
                            style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {code.expiresAt ? (
                        <span className={cn('text-xs font-mono', isExpired ? 'text-rose-400' : 'text-muted-foreground')}>
                          {new Date(code.expiresAt).toLocaleDateString('zh-CN')}
                          {isExpired && ' (已过期)'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">永不过期</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {code.createdAt ? new Date(code.createdAt).toLocaleDateString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(code)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-amber-400" onClick={() => handleReset(code.id)} title="重置（将已用次数恢复为总量）">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(code.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">第 {page + 1} / {totalPages} 页，共 {total} 条</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0} className="h-8"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="h-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCode?.id ? '编辑邀请码' : '新增邀请码'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>邀请码 *</Label>
              <Input value={editingCode?.code || ''} onChange={e => setEditingCode(p => p ? { ...p, code: e.target.value } : p)} className="bg-secondary/50 font-mono" placeholder="例如：TIMI2024" />
            </div>
            <div className="space-y-1.5">
              <Label>总使用次数</Label>
              <Input type="number" value={editingCode?.totalCount || 100} onChange={e => setEditingCode(p => p ? { ...p, totalCount: Number(e.target.value) } : p)} className="bg-secondary/50" min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>描述</Label>
              <Input value={editingCode?.description || ''} onChange={e => setEditingCode(p => p ? { ...p, description: e.target.value } : p)} className="bg-secondary/50" placeholder="可选备注" />
            </div>
            <div className="space-y-1.5">
              <Label>过期时间（可选）</Label>
              <Input type="datetime-local" value={editingCode?.expiresAt ? editingCode.expiresAt.slice(0, 16) : ''} onChange={e => setEditingCode(p => p ? { ...p, expiresAt: e.target.value } : p)} className="bg-secondary/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCode?.id ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
