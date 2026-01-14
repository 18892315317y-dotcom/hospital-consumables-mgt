
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
  LineChart, Line, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  X,
  Stethoscope,
  LayoutGrid,
  ListFilter,
  Monitor,
  Calendar,
  Clock,
  FileText,
  Activity,
  Wrench,
  DollarSign,
  History,
  Eye // Added
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  model: string;
  dept: string;
  purchaseDate: string;
  roi: number; // 投资回报率 %
  utilizationRate: number; // 利用率 %
  revenue: number; // 创收 (万)
  status: 'excellent' | 'normal' | 'warning' | 'critical';
  // Additional fields for detail view
  originalPrice: number;
  residualValue: number;
  serviceLife: number; // Expected life in years
  usedYears: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

const DeptEquipmentBenefit: React.FC = () => {
  // 1. 时间筛选状态
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });

  // 模拟数据：科室维度
  const deptStats = [
    { name: '影像中心', revenue: 1250, roi: 18.5, utilization: 92, equipmentCount: 15 },
    { name: '检验科', revenue: 980, roi: 15.2, utilization: 88, equipmentCount: 22 },
    { name: 'ICU', revenue: 650, roi: 8.5, utilization: 75, equipmentCount: 30 },
    { name: '心内科', revenue: 420, roi: 12.1, utilization: 65, equipmentCount: 12 },
    { name: '急诊科', revenue: 380, roi: 5.4, utilization: 45, equipmentCount: 8 },
    { name: '康复科', revenue: 120, roi: -2.1, utilization: 30, equipmentCount: 10 },
  ];

  // 模拟数据：设备明细 (Fixed utilization property name to utilizationRate)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([
    { 
      id: 'EQ-001', name: 'GE 螺旋CT', model: 'Optima 660', dept: '影像中心', purchaseDate: '2020-05', roi: 22.5, utilizationRate: 95, revenue: 450, status: 'excellent',
      originalPrice: 4500000, residualValue: 2800000, serviceLife: 10, usedYears: 4, lastMaintenance: '2023-12-10', nextMaintenance: '2024-06-10'
    },
    { 
      id: 'EQ-002', name: '西门子 MRI', model: 'Magnetom', dept: '影像中心', purchaseDate: '2019-08', roi: 19.8, utilizationRate: 89, revenue: 380, status: 'excellent',
      originalPrice: 8200000, residualValue: 4100000, serviceLife: 12, usedYears: 5, lastMaintenance: '2024-01-15', nextMaintenance: '2024-07-15'
    },
    { 
      id: 'EQ-003', name: '全自动生化仪', model: 'Beckman', dept: '检验科', purchaseDate: '2021-02', roi: 16.5, utilizationRate: 85, revenue: 220, status: 'normal',
      originalPrice: 1200000, residualValue: 850000, serviceLife: 8, usedYears: 3, lastMaintenance: '2024-02-20', nextMaintenance: '2024-08-20'
    },
    { 
      id: 'EQ-004', name: '便携式彩超', model: 'Mindray M9', dept: '急诊科', purchaseDate: '2022-11', roi: 4.2, utilizationRate: 35, revenue: 15, status: 'warning',
      originalPrice: 350000, residualValue: 280000, serviceLife: 6, usedYears: 1.5, lastMaintenance: '2023-11-05', nextMaintenance: '2024-05-05'
    },
    { 
      id: 'EQ-005', name: '康复理疗仪', model: 'KD-2A', dept: '康复科', purchaseDate: '2023-01', roi: -5.5, utilizationRate: 20, revenue: 2, status: 'critical',
      originalPrice: 50000, residualValue: 42000, serviceLife: 5, usedYears: 1, lastMaintenance: '2024-01-10', nextMaintenance: '2024-07-10'
    },
    { 
      id: 'EQ-006', name: '除颤监护仪', model: 'BeneHeart', dept: '心内科', purchaseDate: '2021-06', roi: 8.5, utilizationRate: 40, revenue: 8, status: 'warning',
      originalPrice: 68000, residualValue: 40000, serviceLife: 6, usedYears: 3, lastMaintenance: '2023-12-01', nextMaintenance: '2024-06-01'
    },
    { 
      id: 'EQ-007', name: '呼吸机', model: 'Evita V500', dept: 'ICU', purchaseDate: '2020-03', roi: 12.0, utilizationRate: 78, revenue: 45, status: 'normal',
      originalPrice: 280000, residualValue: 120000, serviceLife: 8, usedYears: 4, lastMaintenance: '2024-03-15', nextMaintenance: '2024-09-15'
    },
  ]);

  // 利用率分布数据 (模拟)
  const utilizationDistribution = [
    { name: '极低 (<30%)', value: 5, color: '#ef4444' },
    { name: '较低 (30-60%)', value: 12, color: '#f59e0b' },
    { name: '正常 (60-90%)', value: 45, color: '#3b82f6' },
    { name: '饱和 (>90%)', value: 28, color: '#10b981' },
  ];

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_efficiency'>('all');
  const [showReallocateModal, setShowReallocateModal] = useState<Equipment | null>(null);
  const [targetDept, setTargetDept] = useState('');
  
  // 3. 新增使用率明细弹窗状态
  const [viewingUsageDetail, setViewingUsageDetail] = useState<Equipment | null>(null);
  
  // 2. 低效资产详情弹窗状态
  const [inefficientModalDept, setInefficientModalDept] = useState<string | null>(null);

  // New state for asset details
  const [viewingAssetDetail, setViewingAssetDetail] = useState<Equipment | null>(null);

  // 处理“查看低效资产”点击
  const handleViewInefficient = (deptName: string) => {
    setInefficientModalDept(deptName);
  };

  const inefficientAssets = useMemo(() => {
    if (!inefficientModalDept) return [];
    return equipmentList.filter(eq => eq.dept === inefficientModalDept && eq.utilizationRate < 60);
  }, [equipmentList, inefficientModalDept]);

  // 过滤后的设备列表 (主列表)
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchDept = selectedDeptFilter === 'all' ? true : eq.dept === selectedDeptFilter;
      const matchStatus = statusFilter === 'all' ? true : (eq.status === 'warning' || eq.status === 'critical' || eq.utilizationRate < 60);
      return matchDept && matchStatus;
    }).sort((a, b) => a.roi - b.roi); 
  }, [equipmentList, selectedDeptFilter, statusFilter]);

  // 处理调拨保存
  const handleReallocate = () => {
    if (!showReallocateModal || !targetDept) return;
    
    setEquipmentList(prev => prev.map(eq => 
      eq.id === showReallocateModal.id 
        ? { ...eq, dept: targetDept } 
        : eq
    ));
    
    setShowReallocateModal(null);
    setTargetDept('');
    alert(`设备 ${showReallocateModal.name} 已成功重新绑定至 ${targetDept} (流程单号: TR-${Date.now().toString().slice(-6)})`);
  };

  // 生成模拟的使用趋势数据
  const getUsageTrendData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      hours: Math.floor(Math.random() * 12) + 2,
      cases: Math.floor(Math.random() * 20) + 5
    }));
  };

  const handleDateConfirm = () => {
    // 实际逻辑可以是重新获取数据，这里仅做交互演示
    console.log(`Filtering data from ${dateRange.start} to ${dateRange.end}`);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header with Time Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">科室设备效益分析</h3>
            <p className="text-xs text-gray-400 mt-1">基于科室维度的设备效能监控与资源调优中心</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. 时间筛选框 + 确定按钮 */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-1 py-1">
            <div className="flex items-center px-2">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none w-24"
              />
              <span className="text-gray-400 mx-2">-</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none w-24"
              />
            </div>
            <button 
              onClick={handleDateConfirm}
              className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors ml-1"
            >
              确定
            </button>
          </div>
          <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
            <Info size={14} className="mr-1.5"/> 建议调拨设备: <span className="text-red-600 ml-1 font-black">3 台</span>
          </div>
        </div>
      </div>

      {/* Top Charts: Dept Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: ROI & Revenue Comparison */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-gray-700 flex items-center">
              <TrendingUp size={16} className="mr-2 text-indigo-600"/> 科室效益综合对比 (ROI & 创收)
            </h4>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
              <span className="flex items-center"><div className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></div> 创收(万)</span>
              <span className="flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></div> ROI(%)</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} unit="%" />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar yAxisId="left" dataKey="revenue" name="创收金额" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="roi" name="ROI回报率" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inefficient Dept Warning */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-orange-500"/> 低效科室预警 (利用率 &lt; 60%)
          </h4>
          <div className="flex-1 space-y-4">
            {deptStats.filter(d => d.utilization < 60).map(d => (
              <div key={d.name} className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 relative group cursor-default hover:bg-orange-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-gray-800">{d.name}</span>
                  <span className="text-xs font-black text-red-500">{d.utilization}% 利用率</span>
                </div>
                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${d.utilization}%` }}></div>
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500">
                  <span>设备总数: {d.equipmentCount}</span>
                  {/* 2. 点击后弹窗显示低效资产详情 */}
                  <span 
                    className="text-indigo-600 font-bold cursor-pointer hover:underline flex items-center" 
                    onClick={() => handleViewInefficient(d.name)}
                  >
                    查看低效资产 <ArrowDownRight size={10} className="ml-1"/>
                  </span>
                </div>
              </div>
            ))}
            {deptStats.filter(d => d.utilization < 60).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <CheckCircle2 size={40} className="text-green-200 mb-2"/>
                <p className="text-xs font-bold">所有科室运行良好</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 设备使用率维度统计 */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center">
          <Activity size={16} className="mr-2 text-blue-600"/> 全院设备使用率分布统计
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="h-40 col-span-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={utilizationDistribution} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {utilizationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="col-span-3 flex flex-col justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {utilizationDistribution.map((item, i) => (
                   <div key={i} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center mb-2">
                         <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: item.color}}></div>
                         <span className="text-xs font-bold text-gray-500">{item.name}</span>
                      </div>
                      <span className="text-xl font-black text-gray-800">{item.value} <span className="text-[10px] text-gray-400">台</span></span>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center italic">* 数据基于过去 {dateRange.start} 至 {dateRange.end} 期间的平均开机时长与检查人次计算。</p>
           </div>
        </div>
      </div>

      {/* Bottom Section: Equipment List for Reallocation */}
      <div id="equipment-list-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-4">
          <div className="flex items-center space-x-3">
            <Monitor size={18} className="text-gray-500" />
            <h4 className="text-sm font-bold text-gray-700">科室资产明细与调拨</h4>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            
            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <select 
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">全院科室</option>
                {deptStats.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`border text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 ${statusFilter === 'low_efficiency' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200'}`}
              >
                <option value="all">所有状态</option>
                <option value="low_efficiency">仅看低效/预警资产</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
             <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 mr-4">
                <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> 极低效 (ROI &lt; 0)</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div> 预警 (ROI &lt; 10%)</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                <th className="px-6 py-4">设备信息</th>
                <th className="px-6 py-4">当前所属科室</th>
                <th className="px-6 py-4">启用时间</th>
                <th className="px-6 py-4 text-center">综合利用率</th>
                <th className="px-6 py-4 text-right">年创收 (万)</th>
                <th className="px-6 py-4 text-right">ROI 回报率</th>
                <th className="px-6 py-4 text-center">效能评级</th>
                <th className="px-6 py-4 text-center">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEquipment.map(item => (
                <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{item.id} | {item.model}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{item.dept}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">{item.purchaseDate}</td>
                  <td className="px-6 py-4 text-center">
                    <div 
                      className="flex items-center justify-center space-x-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                      onClick={() => setViewingUsageDetail(item)}
                    >
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.utilizationRate < 40 ? 'bg-red-500' : item.utilizationRate < 70 ? 'bg-orange-500' : 'bg-green-500'}`} style={{width: `${item.utilizationRate}%`}}></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 underline">{item.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-gray-700">￥{item.revenue}</td>
                  <td className="px-6 py-4 text-right font-mono font-black">
                    <span className={item.roi < 0 ? 'text-red-500' : item.roi < 10 ? 'text-orange-500' : 'text-green-600'}>{item.roi}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                      item.status === 'excellent' ? 'bg-green-50 text-green-600 border-green-100' :
                      item.status === 'normal' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      item.status === 'warning' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {item.status === 'excellent' ? '优异' : item.status === 'normal' ? '正常' : item.status === 'warning' ? '低效预警' : '极低效'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => setViewingAssetDetail(item)}
                        className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-all shadow-sm"
                        title="设备详情"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => setShowReallocateModal(item)}
                        className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 ${
                          item.status === 'warning' || item.status === 'critical'
                            ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
                            : 'bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200'
                        }`}
                      >
                        <ArrowRightLeft size={12} className="mr-1.5" />
                        {item.status === 'warning' || item.status === 'critical' ? '建议调拨' : '调拨'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Inefficient Assets Detail Modal */}
      {inefficientModalDept && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInefficientModalDept(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-8 py-5 bg-orange-600 text-white flex justify-between items-center shrink-0 shadow-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} />
                <div>
                  <h3 className="text-lg font-black tracking-tight">{inefficientModalDept} - 低效资产深度分析</h3>
                  <p className="text-[10px] text-orange-100 mt-0.5 uppercase font-bold tracking-widest opacity-80">Low Efficiency Asset Diagnostics</p>
                </div>
              </div>
              <button onClick={() => setInefficientModalDept(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0 scrollbar-hide bg-white">
              {inefficientAssets.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-orange-50/50 text-orange-800 font-bold uppercase tracking-wider border-b border-orange-100">
                        <tr>
                          <th className="px-6 py-4">设备名称 / 编号</th>
                          <th className="px-6 py-4">规格型号</th>
                          <th className="px-6 py-4">资产价值</th>
                          <th className="px-6 py-4 text-center">利用率</th>
                          <th className="px-6 py-4 text-center">ROI</th>
                          <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {inefficientAssets.map(asset => (
                          <tr key={asset.id} className="hover:bg-orange-50/20 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-800 text-sm">{asset.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{asset.id}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">{asset.model}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-700">￥{asset.originalPrice.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400">残值: ￥{asset.residualValue.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-lg font-black text-red-500">{asset.utilizationRate}%</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-black ${asset.roi < 0 ? 'text-red-500' : 'text-orange-500'}`}>{asset.roi}%</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => { setInefficientModalDept(null); setShowReallocateModal(asset); }} 
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                              >
                                立即调拨
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium leading-relaxed">
                    <span className="font-black text-gray-700 mr-2">💡 分析建议：</span>
                    该科室低效资产主要集中在老旧型号，建议优先考虑调拨至基层分院或进行报废置换处理，以优化整体资产结构。
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <CheckCircle2 size={48} className="text-green-200 mb-4" />
                  <p className="font-bold text-sm">该科室暂无低效资产</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
               <button onClick={() => setInefficientModalDept(null)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm">关闭窗口</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {viewingAssetDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingAssetDetail(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <div>
                  <h3 className="text-lg font-black tracking-tight">{viewingAssetDetail.name}</h3>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono">{viewingAssetDetail.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingAssetDetail(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 space-y-6 bg-gray-50/20">
              {/* Basic Info */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">基础信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 block text-xs mb-0.5">规格型号</span><span className="font-bold text-gray-800">{viewingAssetDetail.model}</span></div>
                  <div><span className="text-gray-500 block text-xs mb-0.5">所属科室</span><span className="font-bold text-gray-800">{viewingAssetDetail.dept}</span></div>
                  <div><span className="text-gray-500 block text-xs mb-0.5">启用日期</span><span className="font-bold text-gray-800">{viewingAssetDetail.purchaseDate}</span></div>
                  <div>
                    <span className="text-gray-500 block text-xs mb-0.5">当前状态</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      viewingAssetDetail.status === 'excellent' ? 'bg-green-100 text-green-700' :
                      viewingAssetDetail.status === 'normal' ? 'bg-blue-100 text-blue-700' :
                      viewingAssetDetail.status === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {viewingAssetDetail.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Life */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">资产价值与寿命</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 block text-xs mb-0.5">采购原值</span><span className="font-mono font-bold text-gray-800">￥{viewingAssetDetail.originalPrice.toLocaleString()}</span></div>
                  <div><span className="text-gray-500 block text-xs mb-0.5">当前残值</span><span className="font-mono font-bold text-gray-800">￥{viewingAssetDetail.residualValue.toLocaleString()}</span></div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs mb-1">服役年限进度 ({viewingAssetDetail.usedYears} / {viewingAssetDetail.serviceLife} 年)</span>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: `${(viewingAssetDetail.usedYears / viewingAssetDetail.serviceLife) * 100}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">维保记录</h4>
                <div className="flex justify-between items-center text-sm">
                   <div><span className="text-gray-500 block text-xs mb-0.5">上次维保</span><span className="font-bold text-gray-800">{viewingAssetDetail.lastMaintenance}</span></div>
                   <div className="text-right"><span className="text-gray-500 block text-xs mb-0.5">下次计划</span><span className="font-bold text-indigo-600">{viewingAssetDetail.nextMaintenance}</span></div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-white flex justify-end">
               <button onClick={() => setViewingAssetDetail(null)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">关闭详情</button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Detail Modal (New) */}
      {viewingUsageDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingUsageDetail(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <Activity size={24} />
                <div>
                  <h3 className="text-lg font-black tracking-tight">{viewingUsageDetail.name} - 使用效率明细</h3>
                  <p className="text-xs text-blue-200 font-mono mt-0.5">{viewingUsageDetail.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingUsageDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide bg-gray-50/50">
               {/* Trend Chart */}
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <Clock size={16} className="mr-2 text-blue-500"/> 近7日开机运行趋势
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getUsageTrendData()}>
                        <defs>
                          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} unit="h" />
                        <Tooltip />
                        <Area type="monotone" dataKey="hours" name="运行小时" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsage)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Log Table */}
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <FileText size={16} className="mr-2 text-indigo-500"/> 最近使用流水
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                      <tr>
                        <th className="px-4 py-2">日期</th>
                        <th className="px-4 py-2">操作人</th>
                        <th className="px-4 py-2">项目</th>
                        <th className="px-4 py-2 text-right">时长</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[1,2,3,4,5].map(i => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-mono text-gray-500">2024-05-1{i}</td>
                          <td className="px-4 py-3 font-bold text-gray-700">张医生</td>
                          <td className="px-4 py-3">常规扫描 {i}</td>
                          <td className="px-4 py-3 text-right font-mono text-blue-600">2.5h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
            
            <div className="p-6 border-t bg-white flex justify-end">
               <button onClick={() => setViewingUsageDetail(null)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-colors">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Reallocate Modal */}
      {showReallocateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReallocateModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
            <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center shrink-0 shadow-lg">
              <div className="flex items-center space-x-3">
                <ArrowRightLeft size={24} />
                <h3 className="text-lg font-black tracking-tight">设备科室调拨 (重绑定)</h3>
              </div>
              <button onClick={() => setShowReallocateModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6 bg-gray-50/30">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">当前资产信息</p>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-gray-800">{showReallocateModal.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{showReallocateModal.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">当前归属</p>
                    <p className="text-sm font-black text-indigo-600">{showReallocateModal.dept}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">调拨目标科室 <span className="text-red-500">*</span></label>
                  <select 
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  >
                    <option value="">请选择接收科室...</option>
                    {deptStats.filter(d => d.name !== showReallocateModal.dept).map(d => (
                      <option key={d.name} value={d.name}>{d.name} (当前利用率: {d.utilization}%)</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 ml-1 italic">提示：建议优先调拨至利用率较高的科室以提升资产回报率。</p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                  <Info size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                    此操作将在 HIS 系统中生成调拨工单，并在本系统中实时更新资产归属关系。请确保物理搬运与系统操作同步进行。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-white flex justify-end space-x-4 shrink-0">
              <button onClick={() => setShowReallocateModal(null)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">取消</button>
              <button 
                disabled={!targetDept}
                onClick={handleReallocate} 
                className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
              >
                确认手动重绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptEquipmentBenefit;
