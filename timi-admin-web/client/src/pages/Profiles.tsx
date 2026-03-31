/**
 * Profiles Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * Manage profile listings (name, age, location, price, images, tags)
 */
import { useEffect, useState } from 'react';
import { profileApi, dictionaryApi, type Profile, type PageResult, type DictionaryItem } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight,
  MapPin, Star, Upload, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [provinces, setProvinces] = useState<DictionaryItem[]>([]);
  const [cities, setCities] = useState<DictionaryItem[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<Profile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfiles = async (p = page) => {
    setLoading(true);
    try {
      const res = await profileApi.getProfiles(p, 10, searchName || undefined, filterProvince || undefined, filterCity || undefined);
      const data = res.data as PageResult<Profile>;
      setProfiles(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('获取信息列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dictionaryApi.getProvinces().then(res => setProvinces(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfiles(0);
    setPage(0);
  }, [searchName, filterProvince, filterCity]);

  useEffect(() => {
    fetchProfiles(page);
  }, [page]);

  const handleProvinceChange = (val: string) => {
    setFilterProvince(val === 'all' ? '' : val);
    setFilterCity('');
    setCities([]);
    if (val && val !== 'all') {
      const prov = provinces.find(p => p.dictValue === val);
      if (prov) {
        dictionaryApi.getCities(prov.id).then(res => setCities(res.data)).catch(() => {});
      }
    }
  };

  const openCreate = () => {
    setEditingProfile({ featured: false });
    setDialogOpen(true);
  };

  const openEdit = (p: Profile) => {
    setEditingProfile({ ...p });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProfile?.name) { toast.error('请填写姓名'); return; }
    setSaving(true);
    try {
      if (editingProfile.id) {
        await profileApi.updateProfile(editingProfile.id, editingProfile);
        toast.success('更新成功');
      } else {
        await profileApi.createProfile(editingProfile);
        toast.success('创建成功');
      }
      setDialogOpen(false);
      fetchProfiles(page);
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该信息？')) return;
    try {
      await profileApi.deleteProfile(id);
      toast.success('删除成功');
      fetchProfiles(page);
    } catch {
      toast.error('删除失败');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await profileApi.uploadPhoto(file);
      const data = res.data as any;
      setEditingProfile(prev => prev ? { ...prev, photoPath: data.photoPath } : prev);
      toast.success('图片上传成功');
    } catch {
      toast.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">信息列表</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {total} 条信息</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          新增信息
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="pl-9 bg-secondary/50 border-border h-9"
          />
        </div>
        <Select value={filterProvince || 'all'} onValueChange={handleProvinceChange}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border h-9">
            <SelectValue placeholder="选择省份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部省份</SelectItem>
            {provinces.map(p => (
              <SelectItem key={p.id} value={p.dictValue}>{p.dictValue}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cities.length > 0 && (
          <Select value={filterCity || 'all'} onValueChange={v => setFilterCity(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-36 bg-secondary/50 border-border h-9">
              <SelectValue placeholder="选择城市" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部城市</SelectItem>
              {cities.map(c => (
                <SelectItem key={c.id} value={c.dictValue}>{c.dictValue}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-16">ID</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">姓名</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">年龄</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">地区</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">图片</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">精选</TableHead>
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
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              profiles.map(profile => (
                <TableRow key={profile.id} className="border-border table-row-hover">
                  <TableCell className="font-mono text-xs text-muted-foreground">{profile.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{profile.name}</TableCell>
                  <TableCell className="text-muted-foreground">{profile.age || '-'}</TableCell>
                  <TableCell>
                    {(profile.province || profile.city) ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {profile.province}{profile.city ? ` · ${profile.city}` : ''}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {profile.photoPath ? (
                      <img
                        src={`${API_BASE}${profile.photoPath}`}
                        alt={profile.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {profile.featured ? (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Star className="w-4 h-4 text-muted-foreground/30" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(profile)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(profile.id)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            第 {page + 1} / {totalPages} 页，共 {total} 条
          </p>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile?.id ? '编辑信息' : '新增信息'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>姓名 *</Label>
              <Input value={editingProfile?.name || ''} onChange={e => setEditingProfile(p => p ? { ...p, name: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>年龄</Label>
              <Input type="number" value={editingProfile?.age || ''} onChange={e => setEditingProfile(p => p ? { ...p, age: Number(e.target.value) } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>身高(cm)</Label>
              <Input type="number" value={editingProfile?.height || ''} onChange={e => setEditingProfile(p => p ? { ...p, height: Number(e.target.value) } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>体重(kg)</Label>
              <Input type="number" value={editingProfile?.weight || ''} onChange={e => setEditingProfile(p => p ? { ...p, weight: Number(e.target.value) } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>省份</Label>
              <Input value={editingProfile?.province || ''} onChange={e => setEditingProfile(p => p ? { ...p, province: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>城市</Label>
              <Input value={editingProfile?.city || ''} onChange={e => setEditingProfile(p => p ? { ...p, city: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>尺码</Label>
              <Input value={editingProfile?.size || ''} onChange={e => setEditingProfile(p => p ? { ...p, size: e.target.value } : p)} className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label>精选</Label>
              <Select value={editingProfile?.featured ? 'true' : 'false'} onValueChange={v => setEditingProfile(p => p ? { ...p, featured: v === 'true' } : p)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">否</SelectItem>
                  <SelectItem value="true">是</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>简介</Label>
              <Textarea value={editingProfile?.description || ''} onChange={e => setEditingProfile(p => p ? { ...p, description: e.target.value } : p)} className="bg-secondary/50 resize-none" rows={3} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>上传图片</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors text-sm text-muted-foreground">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? '上传中...' : '选择图片'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {editingProfile?.photoPath && (
                  <img src={`${API_BASE}${editingProfile.photoPath}`} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingProfile?.id ? '保存修改' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
