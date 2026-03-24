import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileApi, Profile } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

/**
 * 用户管理 Tab 组件
 */
export default function AdminProfilesTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchProfiles();
  }, [page, searchTerm]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await profileApi.getProfiles(page, 10, searchTerm || undefined, undefined, undefined);
      setProfiles(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('获取列表失败:', error);
      toast.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await profileApi.deleteProfile(id);
        toast.success('删除成功');
        fetchProfiles();
      } catch (error) {
        console.error('删除失败:', error);
        toast.error('删除失败');
      }
    }
  };

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setLocation('/admin/profiles/create')}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          新增用户
        </Button>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-slate-500">加载中...</p>
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg text-slate-500">暂无用户数据</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      名字
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      省份/城市
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      年龄
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      精选
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {profile.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {profile.province && profile.city
                          ? `${profile.province} / ${profile.city}`
                          : profile.city || profile.province || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {profile.age || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {profile.featured ? (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            精选
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setLocation(`/admin/profiles/${profile.id}/edit`)
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(profile.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(Math.max(0, page - 1))}
              >
                上一页
              </Button>
              <span className="text-sm text-slate-600">
                第 {page + 1} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
