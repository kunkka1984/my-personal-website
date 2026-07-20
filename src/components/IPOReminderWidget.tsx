"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface IPOItem {
  SECURITY_CODE: string;
  SECURITY_NAME: string;
  APPLY_CODE: string;
  APPLY_DATE: string;
  ISSUE_PRICE: number | null;
  ONLINE_APPLY_PRICE: number | null;
  PREDICT_ISSUE_PRICE: number | null;
  AFTER_ISSUE_PE: number | null;
  PREDICT_ISSUE_PE: number | null;
  ONLINE_APPLY_UPPER: number | null;
  IS_BEIJING: number | string;
}

interface EastmoneyIPOResponse {
  success: boolean;
  result?: { data: IPOItem[] };
}

interface ParsedIPO {
  code: string;
  name: string;
  applyCode: string;
  applyDate: string;
  price: string;
  pe: string;
  upperLimit: string;
  market: string;
}

function getMarketName(code: string) {
  if (code.startsWith('60')) return "沪市主板";
  if (code.startsWith('688') || code.startsWith('689')) return "科创板";
  if (code.startsWith('00')) return "深市主板";
  if (code.startsWith('30')) return "创业板";
  return "未知";
}

function formatPrice(item: IPOItem) {
  const price = item.ISSUE_PRICE ?? item.ONLINE_APPLY_PRICE ?? item.PREDICT_ISSUE_PRICE;
  if (price !== null && price !== undefined && Number(price) > 0) {
    return Number(price).toFixed(2);
  }
  return "未定价";
}

function formatPE(item: IPOItem) {
  const pe = item.AFTER_ISSUE_PE ?? item.PREDICT_ISSUE_PE;
  if (pe !== null && pe !== undefined && Number(pe) > 0) {
    return Number(pe).toFixed(2);
  }
  return "-";
}

export default function IPOReminderWidget() {
  const [ipos, setIpos] = useState<ParsedIPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    const fetchIPOData = async () => {
      try {
        const callbackName = 'jsonpCallback_' + Math.round(100000 * Math.random());
        const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=${callbackName}&sortColumns=APPLY_DATE,SECURITY_CODE&sortTypes=-1,-1&pageSize=50&pageNumber=1&reportName=RPTA_APP_IPOAPPLY&columns=ALL&source=WEB&client=WEB`;
        
        const data = await new Promise<EastmoneyIPOResponse>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          const w = window as unknown as Record<string, ((response: EastmoneyIPOResponse) => void) | undefined>;

          w[callbackName] = (response: EastmoneyIPOResponse) => {
            resolve(response);
            document.body.removeChild(script);
            delete w[callbackName];
          };

          script.onerror = () => {
            reject(new Error("网络请求失败"));
            document.body.removeChild(script);
            delete w[callbackName];
          };

          document.body.appendChild(script);
        });

        if (!isMounted) return;

        if (data.success && data.result?.data) {
          const rawData: IPOItem[] = data.result.data;
          
          // 计算日期范围
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const limitDate = new Date(today);
          limitDate.setDate(limitDate.getDate() + 7);
          limitDate.setHours(23, 59, 59, 999);

          const filtered = rawData.filter(item => {
            const code = item.SECURITY_CODE;
            if (!code) return false;
            
            // 过滤沪深四大板块
            const isTargetMarket = code.startsWith('60') || code.startsWith('688') || code.startsWith('689') || code.startsWith('00') || code.startsWith('30');
            if (!isTargetMarket) return false;
            
            // 剔除北交所
            if (String(item.IS_BEIJING) === '1') return false;
            
            // 剔除债
            if (item.SECURITY_NAME && item.SECURITY_NAME.includes('债')) return false;

            // 日期过滤：今天及未来7天
            if (!item.APPLY_DATE) return false;
            const applyDateObj = new Date(item.APPLY_DATE.split(' ')[0]);
            
            if (applyDateObj < today || applyDateObj > limitDate) return false;
            
            return true;
          });

          // 按申购日期排序，近期的排在前面
          filtered.sort((a, b) => {
            const da = new Date(a.APPLY_DATE.split(' ')[0]).getTime();
            const db = new Date(b.APPLY_DATE.split(' ')[0]).getTime();
            return da - db;
          });

          const parsed = filtered.map(item => ({
            code: item.SECURITY_CODE,
            name: item.SECURITY_NAME,
            applyCode: item.APPLY_CODE,
            applyDate: item.APPLY_DATE.split(' ')[0],
            price: formatPrice(item),
            pe: formatPE(item),
            upperLimit: item.ONLINE_APPLY_UPPER ? item.ONLINE_APPLY_UPPER.toLocaleString() : "-",
            market: getMarketName(item.SECURITY_CODE)
          }));

          setIpos(parsed);
        } else {
          setError("获取数据失败");
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "请求异常");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIPOData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-[-40px] mb-20 px-4 relative z-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">A股 打新提醒</h2>
        <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full font-medium">实时连线交易所 · 未来 7 天</span>
      </div>
      
      {loading ? (
        <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-[#86868b] animate-pulse">正在为您实时拉取最新申购数据...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 text-center text-red-500">
          拉取失败：{error}
        </div>
      ) : ipos.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-[#86868b]">近期 7 天内暂无符合条件的沪深新股申购</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ipos.map((ipo, idx) => {
            const isToday = ipo.applyDate === new Date().toISOString().split('T')[0];
            return (
              <motion.div 
                key={ipo.code}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`bg-white/80 backdrop-blur-xl border ${isToday ? 'border-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.1)]' : 'border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'} p-6 md:p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">{ipo.name}</span>
                    <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2.5 py-1 rounded-md font-medium tracking-wide">{ipo.market}</span>
                    {isToday && <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-md font-bold">今日申购</span>}
                  </div>
                  <div className="text-sm text-[#86868b] flex gap-6">
                    <span>股票代码: <span className="font-medium text-[#1d1d1f]">{ipo.code}</span></span>
                    <span>申购代码: <span className="font-semibold text-[#0071e3]">{ipo.applyCode}</span></span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-lg text-[#1d1d1f]">
                    申购日: <span className={`font-semibold ${isToday ? 'text-red-500' : 'text-[#1d1d1f]'}`}>{ipo.applyDate}</span>
                  </div>
                  <div className="text-sm text-[#86868b] flex flex-wrap md:justify-end gap-x-5 gap-y-1">
                    <span>发行价: <span className="font-medium text-[#1d1d1f]">{ipo.price} {ipo.price !== "未定价" && "元"}</span></span>
                    <span>市盈率: <span className="font-medium text-[#1d1d1f]">{ipo.pe}</span></span>
                    <span>上限: <span className="font-medium text-[#1d1d1f]">{ipo.upperLimit} 股</span></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
