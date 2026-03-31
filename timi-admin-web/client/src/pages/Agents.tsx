/**
 * Agents Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * 三级代理管理：创建、编辑、查看下级、推广链接、客服开关
 */
import { useEffect, useState } from 'react';
import { agentApi, type Agent, type PageResult } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight,
  MoreHorizontal, Users, Link2, MessageSquare, MessageSquareOff,
  Loader2, UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const levelColors = ['', 'text-sky-400', 'text-violet-400', 'text-amber-400'];
const levelBg = ['', 'bg-sky-400/10', 'bg-violet-400/10', 'bg-amber-400/10'];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Partial<Agent> | null>(null);
  const [saving, setSaving] = useState(false);

  const [subAgentsDialogOpen, setSubAgentsDialogOpen] = useState(false);
  const [subAgents, setSubAgents] = useState<Agent[]>([]);
  const [subAgentsParentName, setSubAgentsParentName] = useState('');

  const [allAgents, setAllAgents] = useState<Agent[]>([]);

  const fetchAgents = async (p = 0) => {
    setLoading(true);
    try {
      const res = await agentApi.getAgents(p, 10, searchName || undefined, filterLevel ? Number(filterLevel) : undefined);
      const data = res.data as PageResult<Agent>;
      setAgents(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('获取代理列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAgents = async () => {
    try {
      const res = await agentApi.getAgents(0, 200);
      setAllAgents((res.data as PageResult<Agent>).content);
    } catch {}
  };

  useEffect(() => {
    fetchAgents(0);
    setPage(0);
  }, [searchName, filterLevel]);

  useEffect(() => {
    fetchAgents(page);
  }, [page]);

  useEffect(() => {
    fetchAllAgents();
  }, []);

  const openCreate = () => {
    setEditingAgent({ level: 1, customerServiceEnabled: true, status: 'ACTIVE' });
    setDialogOpen(true);
  };

  const openEdit = (a: Agent) => {
    setEditingAgent({ ...a });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingAgent?.name) { toast.error('请填写代理名称'); return; }
    setSaving(true);
    try {
      if (editingAgent.id) {
        await agentApi.updateAgent(editingAgent.id, editingAgent);
        toast.success('更新成功');
      } else {
        await agentApi.createAgent(editingAgent);
        toast.success('创建成功，推广码已自动生成');
      }
      setDialogOpen(false);
      fetchAgents(page);
      fetchAllAgents();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该代理？')) return;
    try {
      await agentApi.deleteAgent(id);
      toast.success('删除成功');
      fetchAgents(page);
    } catch {
      toast.error('删除失败');
    }
  };

  const handleToggleCS = async (id: number, enabled: boolean) => {
    try {
      await agentApi.toggleCustomerService(id, !enabled);
      toast.success(`客服已${enabled ? '关闭' : '开启'}`);
      fetchAgents(page);
    } catch {
      toast.error('操作失败');
    }
  };

  const viewSubAgents = async (agent: Agent) => {
    try {
      const res = await agentApi.getSubAgents(agent.id);
      setSubAgents(res.data);
      setSubAgentsParentName(agent.name);
      setSubAgentsDialogOpen(true);
    } catch {
      toast.error('获取下级代理失败');
    }
  };

  const copyPromoLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => toast.success('推广链接已复制'));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">代理管理</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {total} 个代理，三级分销体系</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          新增代理
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索代理名称..." value={searchName} onChange={e => setSearchName(e.target.value)} className="pl-9 bg-secondary/50 border-border h-9" />
        </div>
        <Select value={filterLevel || 'all'} onValueChange={v => setFilterLevel(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border h-9">
            <SelectValue placeholder="代理级别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部级别</SelectItem>
            <SelectItem value="1">一级代理</SelectItem>
            <SelectItem value="2">二级代理</SelectItem>
            <SelectItem value="3">三级代理</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">代理名称</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">级别</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">上级代理</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">推广码</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">下级数</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">用户数</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">客服</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">状态</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-secondary rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  暂无代理数据
                </TableCell>
              </TableRow>
            ) : (
              agents.map(agent => (
                <TableRow key={agent.id} className="border-border table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold', levelBg[agent.level] || 'bg-secondary')}>
                        <span className={levelColors[agent.level] || 'text-muted-foreground'}>{agent.level}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{agent.name}</div>
                        {agent.contact && <div className="text-xs text-muted-foreground">{agent.contact}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', levelBg[agent.level], levelColors[agent.level])}>
                      {agent.level}级代理
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agent.parentAgentName || '无（顶级）'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-sky-400">{agent.promoCode}</span>
                      {agent.promoLink && (
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground hover:text-foreground" onClick={() => copyPromoLink(agent.promoLink)}>
                          <Link2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => viewSubAgents(agent)} className="text-sm text-violet-400 hover:text-violet-300 font-mono">
                      {agent.subAgentCount || 0}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-emerald-400">{agent.userCount || 0}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleCS(agent.id, !!agent.customerServiceEnabled)}
                      className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors', agent.customerServiceEnabled ? 'badge-active' : 'badge-disabled')}
                    >
                      {agent.customerServiceEnabled
                        ? <><MessageSquare className="w-3 h-3" />开启</>
                        : <><MessageSquareOff className="w-3 h-3" />关闭</>
                      }
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', agent.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled')}>
                      {agent.status === 'ACTIVE' ? '正常' : '停用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(agent)}>
                          <Edit className="w-4 h-4 mr-2" />编辑代理
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewSubAgents(agent)}>
                          <Users className="w-4 h-4 mr-2" />查看下级
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(agent.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />删除代理
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAgent?.id ? '编辑代理' : '新增代理'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>代理名称 *</Label>
              <Input value={editingAgent?.name || ''} onChange={e => setEditingAgent(p => p ? { ...p, name: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>联系方式</Label>
              <Input value={editingAgent?.contact || ''} onChange={e => setEditingAgent(p => p ? { ...p, contact: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>代理级别</Label>
              <Select value={String(editingAgent?.level || 1)} onValueChange={v => setEditingAgent(p => p ? { ...p, level: Number(v) } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">一级代理</SelectItem>
                  <SelectItem value="2">二级代理</SelectItem>
                  <SelectItem value="3">三级代理</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>上级代理（可选）</Label>
              <Select value={String(editingAgent?.parentAgentId || 'none')} onValueChange={v => setEditingAgent(p => p ? { ...p, parentAgentId: v === 'none' ? undefined : Number(v) } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="无上级（顶级代理）" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无上级（顶级代理）</SelectItem>
                  {allAgents.filter(a => a.id !== editingAgent?.id).map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}（{a.level}级）</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>客服系统</Label>
              <Select value={editingAgent?.customerServiceEnabled ? 'true' : 'false'} onValueChange={v => setEditingAgent(p => p ? { ...p, customerServiceEnabled: v === 'true' } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">开启</SelectItem>
                  <SelectItem value="false">关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>状态</Label>
              <Select value={editingAgent?.status || 'ACTIVE'} onValueChange={v => setEditingAgent(p => p ? { ...p, status: v as any } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">正常</SelectItem>
                  <SelectItem value="DISABLED">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>备注</Label>
              <Textarea value={editingAgent?.remark || ''} onChange={e => setEditingAgent(p => p ? { ...p, remark: e.target.value } : p)} className="bg-secondary/50 resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAgent?.id ? '保存修改' : '创建代理'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub Agents Dialog */}
      <Dialog open={subAgentsDialogOpen} onOpenChange={setSubAgentsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{subAgentsParentName} 的下级代理</DialogTitle>
          </DialogHeader>
          {subAgents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无下级代理</p>
          ) : (
            <div className="space-y-2">
              {subAgents.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.level}级代理 · {a.contact || '无联系方式'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-sky-400">{a.promoCode}</div>
                    <div className="text-xs text-muted-foreground">{a.userCount || 0} 用户</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
