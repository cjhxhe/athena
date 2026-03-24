import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileApi, Profile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, LogOut, Settings, ChevronDown, MapPin } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface Province {
  id: number;
  dictKey: string;
  dictValue: string;
  children?: City[];
}

interface City {
  id: number;
  dictKey: string;
  dictValue: string;
}

export default function ListPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const { logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 请求地理位置权限
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('地理位置获取失败:', error.message);
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  // 加载省份数据
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dictionaries/province`);
        setProvinces(response.data || []);
      } catch (error) {
        console.error('加载省份失败:', error);
      }
    };
    loadProvinces();
  }, []);

  // 当选择省份时，加载对应城市
  useEffect(() => {
    if (provinceFilter) {
      const loadCities = async () => {
        try {
          const selectedProvince = provinces.find((p) => p.dictValue === provinceFilter);
          if (selectedProvince) {
            const response = await axios.get(
              `${API_BASE_URL}/api/dictionaries/city/${selectedProvince.id}`
            );
            setCities(response.data || []);
          }
        } catch (error) {
          console.error('加载城市失败:', error);
        }
      };
      loadCities();
    } else {
      setCities([]);
    }
    setCityFilter(''); // 重置城市选择
  }, [provinceFilter, provinces]);

  const fetchProfiles = async (pageNum?: number) => {
    const currentPage = pageNum !== undefined ? pageNum : page;
    setLoading(true);
    try {
      const response = await profileApi.getProfiles(
        currentPage,
        12,
        searchTerm || undefined,
        provinceFilter || undefined,
        cityFilter || undefined
      );
      setProfiles(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('获取列表失败:', error);
      toast.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 防抖搜索
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(0);
      fetchProfiles(0);
    }, 500) as unknown as NodeJS.Timeout;

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current as unknown as NodeJS.Timeout);
      }
    };
  }, [searchTerm, provinceFilter, cityFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/invite');
      return;
    }
    fetchProfiles(page);
  }, [isAuthenticated, page]);

  const handleLogout = () => {
    logout();
    setLocation('/invite');
    toast.success('已退出登录');
  };

  const handleViewDetail = (id: number) => {
    setLocation(`/detail/${id}`);
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success('名字已复制');
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setProvinceFilter('');
    setCityFilter('');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Timi</h1>
          </div>
          <div className="flex items-center gap-2">
            {locationPermission === 'granted' && (
              <div className="flex items-center gap-1 text-sm text-green-600 px-3 py-1 bg-green-50 rounded-full">
                <MapPin className="w-4 h-4" />
                已获取位置
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/admin/login')}
              title="管理后台"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 搜索和筛选区域 */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          {/* 搜索框 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="搜索名字..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </div>

          {/* 筛选按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <span>筛选</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showAdvancedFilter ? 'rotate-180' : ''
                }`}
              />
            </button>
            {(provinceFilter || cityFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilter}
                className="text-slate-600"
              >
                重置筛选
              </Button>
            )}
          </div>

          {/* 高级筛选面板 */}
          {showAdvancedFilter && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 省份选择 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    省份
                  </label>
                  <select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">选择省份</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.dictValue}>
                        {province.dictValue}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 城市选择 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    城市
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    disabled={!provinceFilter}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">选择城市</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.dictValue}>
                        {city.dictValue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="mt-4 text-slate-600">加载中...</p>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-lg text-slate-600">暂无数据</p>
            </div>
          </div>
        ) : (
          <>
            {/* 列表网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  {/* 图片区域 */}
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    {profile.photoUrl || profile.photoPath ? (
                      <img
                        src={
                          profile.photoUrl ||
                          `${API_BASE_URL}/${profile.photoPath}`
                        }
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        无图片
                      </div>
                    )}
                    {profile.featured && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        精选
                      </div>
                    )}
                  </div>

                  {/* 信息区域 */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {profile.name}
                    </h3>

                    {/* 基本信息 */}
                    <div className="text-sm text-slate-600 mb-3 space-y-1">
                      {profile.age && <p>年龄: {profile.age}</p>}
                      {profile.height && <p>身高: {profile.height} cm</p>}
                      {profile.province && profile.city && (
                        <p>
                          位置: {profile.province} / {profile.city}
                        </p>
                      )}
                    </div>

                    {/* 按钮 */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopyName(profile.name)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                        size="sm"
                      >
                        复制名字
                      </Button>
                      <Button
                        onClick={() => handleViewDetail(profile.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                      >
                        查看距离
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(Math.max(0, page - 1))}
                >
                  上一页
                </Button>
                <span className="text-slate-600">
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
      </main>
    </div>
  );
}
