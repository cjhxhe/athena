import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileApi, Profile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

interface Dictionary {
  id: number;
  dictType: string;
  dictKey: string;
  dictValue: string;
  parentId?: number;
  latitude?: number;
  longitude?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AdminCreatePage() {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    age: undefined,
    height: undefined,
    weight: undefined,
    size: '',
    photoUrl: '',
    photoPath: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
    services: [],
    description: '',
  });
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();

  // 省份和城市相关状态
  const [provinces, setProvinces] = useState<Dictionary[]>([]);
  const [cities, setCities] = useState<Dictionary[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // 服务和标签相关状态
  const [services, setServices] = useState<Dictionary[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
      return;
    }

    // 加载省份列表
    fetchProvinces();
    // 加载服务类型列表
    fetchServices();
  }, [isAuthenticated]);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dictionaries/province`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dictionaries/service_type`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedCity('');
    setCities([]);

    if (!provinceId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/dictionaries/city/${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const handleCityChange = async (cityKey: string) => {
    setSelectedCity(cityKey);

    // 从城市列表中找到对应的经纬度
    const selectedCityData = cities.find((c) => c.dictKey === cityKey);
    if (selectedCityData) {
      setFormData((prev) => ({
        ...prev,
        city: selectedCityData.dictValue,
        latitude: selectedCityData.latitude,
        longitude: selectedCityData.longitude,
      }));
    }
  };

  const handleServiceChange = (serviceKey: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceKey)
        ? prev.filter((s) => s !== serviceKey)
        : [...prev, serviceKey]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? parseFloat(value) : undefined,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上传图片
    setUploading(true);
    try {
      const response = await profileApi.uploadPhoto(file);
      setFormData((prev) => ({
        ...prev,
        photoPath: response.data.photoPath,
      }));
      toast.success('图片上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('请输入名字');
      return;
    }

    if (!selectedProvince || !selectedCity) {
      toast.error('请选择省份和城市');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        serviceIds: selectedServices,
        featured: featured,
      };

      await profileApi.createProfile(submitData as Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('创建成功');
      setLocation('/admin/dashboard');
    } catch (error) {
      console.error('创建失败:', error);
      toast.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold text-foreground">新增信息</h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 图片上传 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">照片</h2>

            <div className="space-y-4">
              {/* 图片预览 */}
              {photoPreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photoPreview}
                    alt="预览"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 上传按钮 */}
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? '上传中...' : '点击上传图片'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* 或使用 URL */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  或输入图片 URL
                </label>
                <Input
                  name="photoUrl"
                  value={formData.photoUrl || ''}
                  onChange={handleInputChange}
                  placeholder="输入图片 URL"
                />
              </div>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">基本信息</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  名字 *
                </label>
                <Input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="输入名字"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    年龄
                  </label>
                  <Input
                    name="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={handleNumberChange}
                    placeholder="输入年龄"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    身高 (cm)
                  </label>
                  <Input
                    name="height"
                    type="number"
                    step="0.01"
                    value={formData.height || ''}
                    onChange={handleNumberChange}
                    placeholder="输入身高"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    体重 (kg)
                  </label>
                  <Input
                    name="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={handleNumberChange}
                    placeholder="输入体重"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    尺寸
                  </label>
                  <Input
                    name="size"
                    value={formData.size || ''}
                    onChange={handleInputChange}
                    placeholder="输入尺寸"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 位置信息 - 省份城市联动 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">位置信息</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    省份 *
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">选择省份</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.dictValue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    城市 *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!selectedProvince}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">选择城市</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.dictKey}>
                        {c.dictValue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    纬度
                  </label>
                  <Input
                    name="latitude"
                    type="number"
                    step="0.00000001"
                    value={formData.latitude || ''}
                    onChange={handleNumberChange}
                    placeholder="自动填充"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    经度
                  </label>
                  <Input
                    name="longitude"
                    type="number"
                    step="0.00000001"
                    value={formData.longitude || ''}
                    onChange={handleNumberChange}
                    placeholder="自动填充"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 其他信息 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">其他信息</h2>

            <div className="space-y-4">
              {/* 支持服务复选框 */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  支持服务
                </label>
                <div className="space-y-2">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={selectedServices.includes(service.dictKey)}
                          onChange={() => handleServiceChange(service.dictKey)}
                          className="w-4 h-4 rounded border-border cursor-pointer"
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="ml-2 text-sm text-foreground cursor-pointer"
                        >
                          {service.dictValue}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无可选服务</p>
                  )}
                </div>
              </div>

              {/* 精选标签 */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label htmlFor="featured" className="text-sm font-medium text-foreground cursor-pointer">
                  精选
                </label>
              </div>

              {/* 描述 */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  描述
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="输入描述"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setLocation('/admin/dashboard')}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? '创建中...' : '创建'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
