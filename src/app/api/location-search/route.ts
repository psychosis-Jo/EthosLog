/**
 * 腾讯位置服务地点搜索接口代理
 * 文档: https://lbs.qq.com/service/webService/webServiceGuide/webServiceSearch
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // 获取API密钥
    const key = process.env.TENCENT_LBS_KEY;
    const sk = process.env.TENCENT_LBS_SK;

    if (!key || !sk) {
      return NextResponse.json(
        { status: 1, message: '请配置腾讯位置服务API密钥' },
        { status: 500 }
      );
    }

    // 从请求中提取关键词
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    // 准备请求参数 - 地点搜索API
    const params: Record<string, string> = {
      key,
      keyword: keyword || '中国', // 默认搜索范围为中国，如果无关键词则显示热门城市
      boundary: 'region(0,0)', // 全国范围
      page_size: '20', // 返回结果数量
      page_index: '1', // 页码
      output: 'json',
    };

    // 生成签名
    const sig = generateSignature(params, sk);
    params.sig = sig;

    // 构建请求URL
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    const url = `https://apis.map.qq.com/ws/place/v1/search?${queryString}`;

    // 发送请求到腾讯位置服务
    const response = await fetch(url);
    
    // 处理响应状态错误
    if (!response.ok) {
      return NextResponse.json(
        { status: 1, message: `腾讯位置服务请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 解析响应数据
    let data;
    try {
      data = await response.json();
    } catch (error) {
      return NextResponse.json(
        { status: 1, message: '解析腾讯位置服务响应失败' },
        { status: 500 }
      );
    }

    // 处理腾讯位置服务的错误响应
    if (data.status !== 0) {
      return NextResponse.json(
        { status: data.status, message: data.message || '腾讯位置服务错误' },
        { status: 400 }
      );
    }

    // 格式化返回数据
    const result = formatLocationResults(data, keyword);
    
    return NextResponse.json({ status: 0, data: result });
  } catch (error) {
    console.error('位置搜索API错误:', error);
    return NextResponse.json(
      { status: 1, message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 生成腾讯位置服务API签名
 * 
 * @param params - 请求参数
 * @param secretKey - 密钥SK
 * @returns 签名字符串
 */
function generateSignature(params: Record<string, string>, secretKey: string): string {
  // 1. 对参数按键排序
  const sortedParams = Object.keys(params).sort().reduce(
    (result, key) => {
      result[key] = params[key];
      return result;
    }, 
    {} as Record<string, string>
  );
  
  // 2. 构造请求路径: 接口请求地址 + ? + 请求参数 + SK
  const requestPath = '/ws/place/v1/search?';
  
  // 3. 拼接参数
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // 4. 拼接完整签名原文
  const signatureRaw = requestPath + queryString + secretKey;
  
  // 5. 计算MD5哈希
  return crypto.createHash('md5').update(signatureRaw).digest('hex');
}

/**
 * 格式化位置搜索结果
 * 
 * @param data - 腾讯位置服务返回的数据
 * @param keyword - 搜索关键词
 * @returns 格式化后的位置列表
 */
function formatLocationResults(data: any, keyword: string) {
  interface LocationItem {
    id: string;
    title: string;
    address: string;
    province: string;
    city?: string;
    district?: string;
  }
  
  const locations: LocationItem[] = [];
  
  // 处理地点搜索API的结果
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((item: any, index: number) => {
      // 从地点信息中提取省市区信息
      // 地址格式通常为：省份市县区详细地址
      const address = item.address || '';
      const addressParts = parseAddress(item);
      
      const locationItem: LocationItem = {
        id: item.id || `place_${index}`,
        title: item.title || '',
        address: address,
        province: addressParts.province || '',
        city: addressParts.city || '',
        district: addressParts.district || ''
      };
      
      locations.push(locationItem);
    });
  }
  
  return locations;
}

/**
 * 从地点信息中解析省市区信息
 * 
 * @param item - 地点信息
 * @returns 解析后的省市区信息
 */
function parseAddress(item: any) {
  const result = {
    province: '',
    city: '',
    district: ''
  };
  
  // 从ad_info中提取省市区信息（如果存在）
  if (item.ad_info) {
    result.province = item.ad_info.province || '';
    result.city = item.ad_info.city || '';
    result.district = item.ad_info.district || '';
    return result;
  }
  
  // 如果没有ad_info，则尝试从address字段解析
  if (item.address) {
    // 这里实现一个简单的解析逻辑，生产环境可能需要更复杂的处理
    const address = item.address;
    
    // 省份通常在地址的开始部分
    const provinceMatch = address.match(/^(.*?)[省市]/);
    if (provinceMatch) {
      result.province = provinceMatch[1] + (address.charAt(provinceMatch[1].length) || '');
    }
    
    // 城市通常在省份之后
    const cityMatch = address.match(/[省自治区]+(.*?)[市地区]/);
    if (cityMatch) {
      result.city = cityMatch[1] + (address.charAt(cityMatch[1].length + (provinceMatch ? provinceMatch[0].length : 0)) || '');
    } else if (!result.province && address.includes('市')) {
      // 直辖市情况
      const directCityMatch = address.match(/^(.*?)市/);
      if (directCityMatch) {
        result.province = directCityMatch[1] + '市';
        result.city = directCityMatch[1] + '市';
      }
    }
    
    // 区县通常在城市之后
    const districtMatch = address.match(/市(.*?)[区县]/);
    if (districtMatch) {
      result.district = districtMatch[1] + (address.charAt(districtMatch[1].length + (cityMatch ? cityMatch[0].length : 0) + (provinceMatch ? provinceMatch[0].length : 0)) || '');
    }
  }
  
  return result;
} 