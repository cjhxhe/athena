/**
 * Dictionaries Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * 字典管理：省份/城市/标签/服务类型等配置
 */
import { useEffect, useState } from 'react';
import { dictionaryApi, type DictionaryItem } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings, Loader2 } from 'lucide-react';

const DICT_TYPES = [
  { value: 'province', label: '省份' },
  { value: 'city', label: '城市' },
  { value: 'tag', label: '标签' },
  { value: 'service', label: '服务类型' },
];

export default function DictionariesPage() {
  const [selectedType, setSelectedType] = useState('province');
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<DictionaryItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await dictionaryApi.getByType(selectedType);
      setItems(res.data);
    } catch {
      toast.error('获取字典数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [selectedType]);

  const openCreate = () => {
    setEditingItem({ dictType: selectedType, sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: DictionaryItem) => {
    setEditingItem({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem?.dictKey || !editingItem?.dictValue) {
      toast.error('请填写键和值');
      return;
    }
    setSaving(true);
    try {
      if (editingItem.id) {
        await dictionaryApi.update(editingItem.id, editingItem);
        toast.success('更新成功');
      } else {
        await dictionaryApi.create(editingItem);
        toast.success('创建成功');
      }
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该字典项？')) return;
    try {
      await dictionaryApi.delete(id);
      toast.success('删除成功');
      fetchItems();
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">字典管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理省份、城市、标签等基础数据</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          新增字典项
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {DICT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setSelectedType(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === t.value
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">ID</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">键（Key）</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">值（Value）</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">排序</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-secondary rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Settings className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  暂无字典数据
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id} className="border-border table-row-hover">
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="font-mono text-sm text-sky-400">{item.dictKey}</TableCell>
                  <TableCell className="text-sm text-foreground">{item.dictValue}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{item.sortOrder ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? '编辑字典项' : '新增字典项'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select value={editingItem?.dictType || selectedType} onValueChange={v => setEditingItem(p => p ? { ...p, dictType: v } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DICT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>键（Key）*</Label>
              <Input value={editingItem?.dictKey || ''} onChange={e => setEditingItem(p => p ? { ...p, dictKey: e.target.value } : p)} className="bg-secondary/50 font-mono" placeholder="例如：guangdong" />
            </div>
            <div className="space-y-1.5">
              <Label>值（Value）*</Label>
              <Input value={editingItem?.dictValue || ''} onChange={e => setEditingItem(p => p ? { ...p, dictValue: e.target.value } : p)} className="bg-secondary/50" placeholder="例如：广东省" />
            </div>
            <div className="space-y-1.5">
              <Label>排序</Label>
              <Input type="number" value={editingItem?.sortOrder ?? 0} onChange={e => setEditingItem(p => p ? { ...p, sortOrder: Number(e.target.value) } : p)} className="bg-secondary/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem?.id ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
