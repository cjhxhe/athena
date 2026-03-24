import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RotateCcw, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface InviteCode {
  id: number;
  code: string;
  usageCount: number;
  totalCount: number;
  description?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 邀请码管理 Tab 组件
 */
export default function AdminInviteCodesTab() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    totalCount: 100,
    description: '',
  });

  useEffect(() => {
    fetchInviteCodes();
  }, [page, searchTerm]);

  const fetchInviteCodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/invite-codes?page=${page}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCodes(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('获取邀请码失败:', error);
      toast.error('获取邀请码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code.trim()) {
      toast.error('邀请码不能为空');
      return;
    }
    if (formData.totalCount <= 0) {
      toast.error('使用次数必须大于 0');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_BASE_URL}/api/invite-codes`,
        {
          code: formData.code,
          totalCount: formData.totalCount,
          usageCount: formData.totalCount,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('邀请码创建成功');
      setShowForm(false);
      setFormData({ code: '', totalCount: 100, description: '' });
      fetchInviteCodes();
    } catch (error) {
      console.error('创建邀请码失败:', error);
      toast.error('创建邀请码失败');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.code.trim()) {
      toast.error('邀请码不能为空');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_BASE_URL}/api/invite-codes/${editingId}`,
        {
          totalCount: formData.totalCount,
          usageCount: formData.totalCount,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('邀请码更新成功');
      setEditingId(null);
      setShowForm(false);
      setFormData({ code: '', totalCount: 100, description: '' });
      fetchInviteCodes();
    } catch (error) {
      console.error('更新邀请码失败:', error);
      toast.error('更新邀请码失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个邀请码吗？')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_BASE_URL}/api/invite-codes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('邀请码删除成功');
        fetchInviteCodes();
      } catch (error) {
        console.error('删除邀请码失败:', error);
        toast.error('删除邀请码失败');
      }
    }
  };

  const handleReset = async (id: number) => {
    if (window.confirm('确定要重置这个邀请码的使用次数吗？')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.post(
          `${API_BASE_URL}/api/invite-codes/${id}/reset`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('邀请码重置成功');
        fetchInviteCodes();
      } catch (error) {
        console.error('重置邀请码失败:', error);
        toast.error('重置邀请码失败');
      }
    }
  };

  const handleEdit = (code: InviteCode) => {
    setEditingId(code.id);
    setFormData({
      code: code.code,
      totalCount: code.totalCount,
      description: code.description || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ code: '', totalCount: 100, description: '' });
  };

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索邀请码..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ code: '', totalCount: 100, description: '' });
            setShowForm(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          新增邀请码
        </Button>
      </div>

      {/* 创建/编辑表单 */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? '编辑邀请码' : '新增邀请码'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                邀请码
              </label>
              <Input
                placeholder="输入邀请码"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                使用次数
              </label>
              <Input
                type="number"
                placeholder="输入使用次数"
                value={formData.totalCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                描述
              </label>
              <Input
                placeholder="输入描述（可选）"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {editingId ? '更新' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-slate-500">加载中...</p>
          </div>
        </div>
      ) : codes.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg text-slate-500">暂无邀请码数据</p>
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
                      邀请码
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      总次数
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      剩余次数
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr
                      key={code.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium font-mono">
                        {code.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {code.totalCount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            code.usageCount > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {code.usageCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {code.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {code.createdAt
                          ? new Date(code.createdAt).toLocaleDateString('zh-CN')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(code)}
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReset(code.id)}
                            title="重置使用次数"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(code.id)}
                            title="删除"
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
