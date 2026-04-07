import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { profileApi, Profile, ProfileMedia } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Copy, PlayCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function DetailPage() {
  const [match, params] = useRoute('/detail/:id');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<ProfileMedia | null>(null);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/invite');
      return;
    }

    if (match && params?.id) {
      fetchProfile(parseInt(params.id));
    }
  }, [isAuthenticated, match, params?.id]);

  const fetchProfile = async (id: number) => {
    setLoading(true);
    try {
      const response = await profileApi.getProfile(id);
      const data = response.data;
      setProfile(data);
      
      // 设置默认展示的媒体
      if (data.media && data.media.length > 0) {
        setActiveMedia(data.media[0]);
      } else if (data.photoUrl || data.photoPath) {
        // 如果没有媒体列表，创建一个虚拟的媒体项展示首图
        setActiveMedia({
          url: data.photoUrl || '',
          path: data.photoPath || '',
          type: 'IMAGE'
        });
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      toast.error('获取详情失败');
      setLocation('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDistance = async () => {
    if (!profile) return;

    setCalculating(true);
    try {
      // 获取用户位置
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await profileApi.calculateDistance(
              profile.id,
              latitude,
              longitude
            );
            setDistance(response.data.distance);
            toast.success('距离计算成功');
          } catch (error) {
            console.error('计算距离失败:', error);
            toast.error('计算距离失败');
          } finally {
            setCalculating(false);
          }
        },
        (error) => {
          console.error('获取位置失败:', error);
          toast.error('无法获取您的位置，请检查权限设置');
          setCalculating(false);
        }
      );
    } catch (error) {
      console.error('计算距离失败:', error);
      toast.error('计算距离失败');
      setCalculating(false);
    }
  };

  const handleCopyName = () => {
    if (profile) {
      navigator.clipboard.writeText(profile.name);
      toast.success('名字已复制');
    }
  };

  const getMediaUrl = (media: ProfileMedia) => {
    if (media.url) return media.url;
    if (media.path) return `${API_BASE_URL}/${media.path}`;
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">未找到该信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold text-foreground">详情</h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container py-6 max-w-2xl">
        {/* 媒体播放区域 */}
        <div className="mb-4 rounded-xl overflow-hidden bg-black h-[500px] relative">
          {activeMedia ? (
            activeMedia.type === 'VIDEO' ? (
              <video
                src={getMediaUrl(activeMedia)}
                controls
                className="w-full h-full object-contain"
                autoPlay
              />
            ) : (
              <img
                src={getMediaUrl(activeMedia)}
                alt={profile.name}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              无媒体资源
            </div>
          )}
        </div>

        {/* 媒体缩略图列表 */}
        {profile.media && profile.media.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {profile.media.map((media, idx) => (
              <div
                key={idx}
                onClick={() => setActiveMedia(media)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  activeMedia === media ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="relative w-full h-full bg-muted">
                  {media.type === 'VIDEO' ? (
                    <>
                      <video src={getMediaUrl(media)} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle className="w-8 h-8 text-white opacity-80" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={getMediaUrl(media)}
                      alt={`media-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 信息卡片 */}
        <div className="space-y-4">
          {/* 基本信息卡片 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {profile.name}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyName}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制名字
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {profile.age && (
                <div>
                  <p className="text-sm text-muted-foreground">年龄</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile.age}
                  </p>
                </div>
              )}
              {profile.height && (
                <div>
                  <p className="text-sm text-muted-foreground">身高</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile.height} cm
                  </p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">体重</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile.weight} kg
                  </p>
                </div>
              )}
              {profile.size && (
                <div>
                  <p className="text-sm text-muted-foreground">尺寸</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile.size}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 服务标签卡片 */}
          {profile.services && profile.services.length > 0 && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                支持服务
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 位置信息卡片 */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                位置信息
              </h3>
            </div>

            <div className="space-y-3">
              {profile.city && (
                <div>
                  <p className="text-sm text-muted-foreground">城市</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile.city}
                  </p>
                </div>
              )}

              {distance && (
                <div>
                  <p className="text-sm text-muted-foreground">距离</p>
                  <p className="text-lg font-semibold text-primary">
                    {distance} km
                  </p>
                </div>
              )}

              <Button
                onClick={handleCalculateDistance}
                disabled={calculating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              >
                {calculating ? '计算中...' : '查看距离'}
              </Button>
            </div>
          </div>

          {/* 描述卡片 */}
          {profile.description && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                描述
              </h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setLocation('/')}
          >
            返回列表
          </Button>
          <Button
            onClick={handleCopyName}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制名字
          </Button>
        </div>
      </main>
    </div>
  );
}
