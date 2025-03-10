"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  title: string;
  address: string;
  province: string;
  city?: string;
  district?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LocationAutocomplete({ value, onChange, className }: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async (keyword: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // 构造URL，始终传递关键词
      const url = `/api/location-search?keyword=${encodeURIComponent(keyword || '中国')}`;
      
      const response = await fetch(url);
      
      // 处理非200响应
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData?.message || `请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 检查API响应
      if (data.status === 0) {
        // 成功
        if (data.data && Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          setLocations([]);
        }
      } else {
        // 错误
        let errorMsg = data.message || '位置服务错误';
        
        // 包含特定错误关键词的友好提示
        if (errorMsg.includes('签名')) {
          errorMsg = `${errorMsg}（请检查密钥配置）`;
        } else if (errorMsg.includes('key')) {
          errorMsg = `${errorMsg}（请确认密钥正确且已启用）`;
        }
        
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('获取位置数据失败:', err);
      const errorMessage = err instanceof Error ? err.message : '搜索位置时出错';
      setError(errorMessage);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载时获取默认地点列表
  useEffect(() => {
    if (open && locations.length === 0 && !loading && !error) {
      fetchLocations();
    }
  }, [open, locations.length, loading, error]);

  // 监听输入变化
  useEffect(() => {
    if (!open) return;
    
    const timeoutId = setTimeout(() => {
      // 当输入长度大于等于1个字符时，发起搜索
      if (inputValue.length >= 1) {
        fetchLocations(inputValue);
      } else if (inputValue === '' && locations.length === 0) {
        // 如果清空了输入，获取默认地点列表
        fetchLocations();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            className="pl-8"
            onChange={(e) => {
              const newValue = e.target.value;
              setInputValue(newValue);
              onChange(newValue);
            }}
            onClick={() => setOpen(true)}
            placeholder="搜索地点"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <Command>
          <CommandInput
            placeholder="搜索地点..."
            value={inputValue}
            onValueChange={(value: string) => {
              setInputValue(value);
            }}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
              </div>
            )}
            {!loading && error && (
              <div className="py-6 px-4 text-center">
                <div className="flex justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">{error}</p>
                {error.includes('签名') && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    请检查配置文件中的API密钥是否正确设置
                  </p>
                )}
              </div>
            )}
            {!loading && !error && (
              <>
                {locations.length === 0 ? (
                  <CommandEmpty className="py-6 text-center text-sm">
                    没有找到匹配的地点
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {locations.map(location => (
                      <CommandItem
                        key={location.id}
                        onSelect={() => {
                          // 格式化地址显示
                          let formattedLocation = location.title;
                          
                          // 根据返回的地点信息构建完整地址
                          if (location.address) {
                            formattedLocation = location.title;
                          }
                          
                          onChange(formattedLocation);
                          setInputValue(formattedLocation);
                          setOpen(false);
                        }}
                        className="flex items-center py-2"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{location.title}</span>
                          <span className="ml-1 text-muted-foreground">
                            {location.address}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 