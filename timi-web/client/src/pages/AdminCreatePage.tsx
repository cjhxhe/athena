import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileApi, Profile, ProfileMedia } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, PlayCircle, Plus, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface Dictionary {
  id: number;
  dictType: string;
  dictKey: string;
  dictValue: string;
  parentId?: number;
  latitude?: number;
  longitude?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

  // 多媒体资源状态
  const [mediaList, setMediaList] = useState<ProfileMedia[]>([]);

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

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件作为首图');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const response = await profileApi.uploadPhoto(file);
      setFormData((prev) => ({
        ...prev,
        photoPath: response.data.photoPath,
      }));
      toast.success('首图上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('首图上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading('正在上传媒体资源...');
    try {
      const newMedias: ProfileMedia[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        if (!isVideo && !isImage) {
          toast.error(`文件 ${file.name} 类型不支持`, { id: toastId });
          continue;
        }

        const response = await profileApi.uploadPhoto(file);
        newMedias.push({
          url: '',
          path: response.data.photoPath,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          sortOrder: mediaList.length + i
        });
      }
      setMediaList(prev => [...prev, ...newMedias]);
      toast.success('媒体资源上传成功', { id: toastId });
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('媒体资源上传失败', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== index));
  };

  const getMediaUrl = (media: ProfileMedia) => {
    if (media.url) return media.url;
    if (media.path) return `${API_BASE_URL}/${media.path}`;
    return '';
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
        province: provinces.find(p => p.id.toString() === selectedProvince)?.dictValue,
        city: cities.find(c => c.dictKey === selectedCity)?.dictValue,
        services: selectedServices,
        featured: featured,
        media: mediaList
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 flex items-center h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-4 text-xl font-bold text-slate-900">新增用户</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左侧：图片和媒体管理 */}
          <div className="md:col-span-1 space-y-6">
            {/* 首图照片 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                用户首图（头像）
              </h2>

              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      未上传首图
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="text-white flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">点击上传</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <Input
                  name="photoUrl"
                  value={formData.photoUrl || ''}
                  onChange={handleInputChange}
                  placeholder="或输入图片 URL"
                  className="text-xs"
                />
              </div>
            </div>

            {/* 多媒体相册 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-amber-500" />
                多媒体相册 ({mediaList.length})
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {mediaList.map((media, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                    {media.type === 'VIDEO' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <PlayCircle className="w-8 h-8 text-white opacity-70" />
                      </div>
                    ) : (
                      <img src={getMediaUrl(media)} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5">
                      {media.type}
                    </div>
                  </div>
                ))}
                
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium">添加媒体</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                提示：支持批量上传图片和视频。详情页将按顺序展示。
              </p>
            </div>
          </div>

          {/* 右侧：基本信息表单 */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-8">
              {/* 基本信息 */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-amber-500 pl-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 mb-2 block">名字 *</label>
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder="请输入用户显示名称"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">年龄</label>
                    <Input
                      name="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={handleNumberChange}
                      placeholder="年龄"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">尺寸</label>
                    <Input
                      name="size"
                      value={formData.size || ''}
                      onChange={handleInputChange}
                      placeholder="如: 34B / 36C"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">身高 (cm)</label>
                    <Input
                      name="height"
                      type="number"
                      step="0.01"
                      value={formData.height || ''}
                      onChange={handleNumberChange}
                      placeholder="身高"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">体重 (kg)</label>
                    <Input
                      name="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight || ''}
                      onChange={handleNumberChange}
                      placeholder="体重"
                    />
                  </div>
                </div>
              </section>

              {/* 位置信息 */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-amber-500 pl-4">位置信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">省份 *</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">请选择省份</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>{p.dictValue}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">城市 *</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!selectedProvince}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">请选择城市</option>
                      {cities.map((c) => (
                        <option key={c.dictKey} value={c.dictKey}>{c.dictValue}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">经度</label>
                    <Input
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude || ''}
                      onChange={handleNumberChange}
                      placeholder="经度"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">纬度</label>
                    <Input
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude || ''}
                      onChange={handleNumberChange}
                      placeholder="纬度"
                    />
                  </div>
                </div>
              </section>

              {/* 服务标签 */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-amber-500 pl-4">服务标签</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceChange(service.dictValue)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedServices.includes(service.dictValue)
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {service.dictValue}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-amber-900 cursor-pointer">
                    设为精选推荐 (将在首页优先展示)
                  </label>
                </div>
              </section>

              {/* 描述信息 */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-amber-500 pl-4">描述信息</h3>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="请输入详细的个人介绍或服务描述..."
                />
              </section>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 font-bold"
                  onClick={() => setLocation('/admin/dashboard')}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 h-12 font-bold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {saving ? '正在创建...' : '立即创建用户'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
