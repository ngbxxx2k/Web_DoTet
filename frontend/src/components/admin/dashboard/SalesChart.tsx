"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { formatVND, formatCompactVND, formatDateVN } from "@/utils/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import { useState } from "react";

export default function SalesChart() {
    // Default to last 30 days
  const [endDate] = useState(new Date().toISOString());
  const [startDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

  const { revenueChart, loading } = useAnalytics(startDate, endDate);


  return (
    <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Thống Kê Doanh Thu
        </h3>
        <h3 className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none">
          30 Ngày Qua
        </h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueChart}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(str) => {
                    const date = new Date(str);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
            />
            <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(val) => formatCompactVND(val)}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                itemStyle={{ color: '#3b82f6' }}
                formatter={(value: number) => [formatVND(value), 'Doanh Thu']}
                labelFormatter={(label) => formatDateVN(label)}
            />
            <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
