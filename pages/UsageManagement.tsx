
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Zap, 
  ArrowRightLeft, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  RefreshCcw,
  ShieldAlert,
  Archive,
  UserCheck,
  Share2,
  Save,
  Trash2,
  X,
  Building2,
  User,
  LayoutGrid,
  Check,
  BadgeCheck,
  Lock,
  UserCheck as UserCheckIcon,
  Info,
  Calculator,
  Send,
  Package,
  MapPin,
  History as HistoryIcon,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  RotateCcw,
  ExternalLink,
  Activity,
  UserRound,
  LayoutList,
  ChevronDown,
  Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { MenuKey } from '../types';

type TabKey = 'his' | 'alert' | 'emergency';
type EmergencyStatus = 'auditing' | 'completed' | 'voided';

const DEPT_MAP: Record<string, string[]> = {
  '临床科室': ['呼吸内科', '消化内科', '心血管外科', '神经内科', '儿科', '急诊科', 'ICU'],
  '医技科室': ['影像科', '检验科', '超声科', '病理科', '药剂科']
};

// 预定义的药品分类
const DRUG_CATEGORIES = [
  '心血管系统',
  '内分泌系统',
  '抗微生物药',
  '神经系统',
  '呼吸系统'
];

// 预定义的药品映射（用于级联）
const DRUG_BY_CATEGORY: Record<string, string[]> = {
  '心血管系统': ['阿托伐他汀钙片', '氨氯地平片', '氯吡格雷', '重组人利钠肽'],
  '内分泌系统': ['二甲双胍', '格列齐特'],
  '抗微生物药': ['头孢克肟', '阿莫西林'],
  '神经系统': ['依达拉奉片'],
  '呼吸系统': ['布地奈德']
};

// 扁平化的所有药品
const ALL_DRUG_OPTIONS = Object.values(DRUG_BY_CATEGORY).flat();

interface EmergencyItem {
  id: string;
  drugName: string;
  spec: string;
  quantity: number;
  price: number;
  reason: string;
}

interface EmergencyRecord {
  id: string;
  applicant: string;
  deptCategory: string;
  dept: string;
  drugName: string; 
  reason: string;
  amount: number;
  status: EmergencyStatus;
  time: string;
  auditChain: string[];
  items: EmergencyItem[];
}

const UsageManagement: React.FC<{ subKey: MenuKey }> = ({ subKey }) => {
  const isDrug = subKey.startsWith('mgt-drug');
  
  // 根据 subKey 计算当前激活的内容块
  const activeTab = useMemo<TabKey>(() => {
    if (subKey.endsWith('alert')) return 'alert';
    if (subKey.endsWith('emergency')) return 'emergency';
    return 'his';
  }, [subKey]);

  // 看板图表特定筛选状态
  const [trendCategoryFilter, setTrendCategoryFilter] = useState('');
  const [trendDrugFilter, setTrendDrugFilter] = useState('');
  const [deptCategoryFilter, setDeptCategoryFilter] = useState('');
  const [deptDrugFilter, setDeptDrugFilter] = useState('');

  // 预警页面的筛选状态
  const [alertFilterDeptCat, setAlertFilterDeptCat] = useState('');
  const [alertFilterDept, setAlertFilterDept] = useState('');
  const [alertSearchQuery, setAlertSearchQuery] = useState('');
  
  // 预警明细弹窗状态
  const [viewingAlertDeptDetail, setViewingAlertDeptDetail] = useState<any>(null);

  const [emergencySubTab, setEmergencySubTab] = useState<'current' | 'history'>('current');
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [viewingDetail, setViewingDetail] = useState<EmergencyRecord | null>(null);
  const [hasAuditPermission] = useState(true); 
  const [auditDecision, setAuditDecision] = useState<'pass' | 'reject'>('pass');
  const [auditComment, setAuditComment] = useState('');

  // 模拟当前用户额度数据
  const userQuota = {
    total: 5,
    used: 3,
    processing: 1,
    remaining: 1
  };

  const [formDeptCategory, setFormDeptCategory] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formUrgency, setFormUrgency] = useState('常规临时申请');
  const [formItems, setFormItems] = useState<EmergencyItem[]>([
    { id: '1', drugName: '', spec: '', quantity: 1, price: 0, reason: '' }
  ]);

  const addFormItem = () => {
    setFormItems([...formItems, { id: Math.random().toString(36).substr(2, 9), drugName: '', spec: '', quantity: 1, price: 0, reason: '' }]);
  };

  const removeFormItem = (id: string) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter(i => i.id !== id));
  };

  const updateFormItem = (id: string, field: keyof EmergencyItem, value: any) => {
    setFormItems(formItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalApplicationAmount = useMemo(() => {
    return formItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [formItems]);

  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyRecord[]>([
    { 
      id: 'TMP-DRUG-09221', 
      applicant: '陈晓明', 
      deptCategory: '临床科室', 
      dept: '神经内科', 
      drugName: '依达拉奉片 (非集采)', 
      reason: '患者合并罕见并发症', 
      amount: 4500, 
      status: 'auditing', 
      time: '2024-05-18 10:30', 
      auditChain: ['科主任', '药剂科', '院长'],
      items: [
        { id: '1', drugName: '依达拉奉片 (非集采)', spec: '20mg*7片', quantity: 50, price: 90, reason: '患者合并罕见并发症' }
      ]
    },
    { 
      id: 'TMP-DRUG-09222', 
      applicant: '张建国', 
      deptCategory: '临床科室', 
      dept: '心内科', 
      drugName: '重组人利钠肽', 
      reason: '急重症抢救急需', 
      amount: 2800, 
      status: 'auditing', 
      time: '2024-05-19 14:20', 
      auditChain: ['科主任', '药剂科'],
      items: [
        { id: '1', drugName: '重组人利钠肽', spec: '0.5mg/支', quantity: 2, price: 1400, reason: '急重症抢救急需' }
      ]
    },
    { 
      id: 'TMP-DRUG-09105', 
      applicant: '李思思', 
      deptCategory: '临床科室', 
      dept: '消化内科', 
      drugName: '特殊生物补片', 
      reason: '手术临时增补', 
      amount: 12000, 
      status: 'completed', 
      time: '2024-04-12 09:00', 
      auditChain: ['科主任', '药剂科', '院长'],
      items: [
        { id: '1', drugName: '特殊生物补片', spec: '10x15cm', quantity: 1, price: 12000, reason: '手术临时增补' }
      ]
    },
    { 
      id: 'TMP-DRUG-08992', 
      applicant: '周杰', 
      deptCategory: '临床科室', 
      dept: '骨科', 
      drugName: '非标固定组件', 
      reason: '特需畸形矫正', 
      amount: 8500, 
      status: 'voided', 
      time: '2024-03-05 16:45', 
      auditChain: ['科主任'],
      items: [
        { id: '1', drugName: '非标固定组件', spec: '定制型', quantity: 1, price: 8500, reason: '特需畸形矫正' }
      ]
    },
  ]);

  const filteredEmergency = useMemo(() => {
    return emergencyRecords.filter(r => 
      emergencySubTab === 'current' ? r.status === 'auditing' : (r.status === 'completed' || r.status === 'voided')
    );
  }, [emergencySubTab, emergencyRecords]);

  const handleAuditAction = () => {
    if (!viewingDetail) return;
    setEmergencyRecords(prev => prev.map(rec => 
      rec.id === viewingDetail.id 
        ? { ...rec, status: auditDecision === 'pass' ? 'completed' : 'voided' } 
        : rec
    ));
    setViewingDetail(null);
    setAuditComment('');
  };

  const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
  
  // 模拟趋势数据生成逻辑
  const usageTrendData = useMemo(() => {
    let base = 120;
    if (trendCategoryFilter) base = 50;
    if (trendDrugFilter) base = 20;

    return [
      { name: '05-10', count: base + Math.random() * 10, trend: base - 5 },
      { name: '05-11', count: base + Math.random() * 20, trend: base },
      { name: '05-12', count: base + Math.random() * 15, trend: base + 10 },
      { name: '05-13', count: base + Math.random() * 30, trend: base + 15 },
      { name: '05-14', count: base + Math.random() * 40, trend: base + 20 },
      { name: '05-15', count: base + Math.random() * 25, trend: base + 25 },
      { name: '05-16', count: base + Math.random() * 35, trend: base + 30 },
    ];
  }, [trendDrugFilter, trendCategoryFilter]);

  // 模拟科室占比数据生成逻辑
  const deptUsageData = useMemo(() => {
    if (deptDrugFilter === '阿托伐他汀钙片' || deptCategoryFilter === '心血管系统') {
      return [
        { name: '心内科', value: 65 },
        { name: '急诊科', value: 15 },
        { name: '内分泌科', value: 10 },
        { name: '其他', value: 10 },
      ];
    }
    return [
      { name: '心内科', value: 35 },
      { name: '骨科', value: 25 },
      { name: '消化科', value: 20 },
      { name: '儿科', value: 15 },
      { name: '其他', value: 5 },
    ];
  }, [deptDrugFilter, deptCategoryFilter]);

  const top10Drugs = [
    { id: 'HIS-00124', name: '阿托伐他汀钙片', dept: '心内科', amount: 8400, percent: 92, stock: 1250 },
    { id: 'HIS-00356', name: '氨氯地平片', dept: '老年病科', amount: 6200, percent: 88, stock: 890 },
    { id: 'HIS-00211', name: '二甲双胍', dept: '内分泌科', amount: 5500, percent: 95, stock: 3200 },
    { id: 'HIS-00562', name: '氯吡格雷', dept: '心内科', amount: 4800, percent: 90, stock: 450 },
    { id: 'HIS-00892', name: '头孢克肟', dept: '急诊科', amount: 3900, percent: 85, stock: 120 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isDrug 
                  ? (activeTab === 'alert' ? '药品阈值预警' : activeTab === 'emergency' ? '药品临采管理' : '药品使用情况') 
                  : (activeTab === 'alert' ? '耗材阈值预警' : activeTab === 'emergency' ? '耗材临采管理' : '耗材使用情况')
                }
              </h3>
              <p className="text-xs text-teal-100 mt-1 flex items-center">
                <RefreshCcw size={12} className="mr-1" /> 最后同步时间: 今天 08:32:15
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center transition-colors">
              <Download size={16} className="mr-2" /> 导出数据报表
            </button>
            <button className="px-4 py-2 bg-white text-teal-600 rounded-lg text-sm font-bold flex items-center shadow-lg transition-transform active:scale-95">
              <ArrowRightLeft size={16} className="mr-2" /> 手动同步
            </button>
          </div>
        </div>

        {activeTab === 'his' && (
          <div className="p-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard label="本月总使用频次" value="48,291" unit="次" trend="+12.5%" />
              <MetricCard label="HIS入账总金额" value="￥245.8" unit="w" trend="+3.2%" />
              <MetricCard label="集采品种占比" value="94.2" unit="%" trend="+0.5%" />
              <MetricCard label="库存周转天数" value="12.5" unit="天" trend="-2d" isDown />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 趋势图卡片 */}
              <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center">
                    <TrendingUp size={16} className="mr-2 text-teal-500" /> 使用频次趋势分析 (按日统计)
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative group">
                      <select 
                        value={trendCategoryFilter}
                        onChange={(e) => { setTrendCategoryFilter(e.target.value); setTrendDrugFilter(''); }}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 pr-8 text-[10px] font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
                      >
                        <option value="">全部类型</option>
                        {DRUG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="relative group">
                      <select 
                        value={trendDrugFilter}
                        onChange={(e) => setTrendDrugFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 pr-8 text-[10px] font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
                      >
                        <option value="">全部药品</option>
                        {(trendCategoryFilter ? DRUG_BY_CATEGORY[trendCategoryFilter] : ALL_DRUG_OPTIONS).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name={trendDrugFilter || trendCategoryFilter || "实际频次"} stroke="#14b8a6" strokeWidth={3} dot={{r: 4, fill: '#14b8a6'}} />
                      <Line type="monotone" dataKey="trend" name="预算基准" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 占比图卡片 */}
              <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center">
                    <TrendingUp size={16} className="mr-2 text-teal-500" /> 科室集采使用占比
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative group">
                      <select 
                        value={deptCategoryFilter}
                        onChange={(e) => { setDeptCategoryFilter(e.target.value); setDeptDrugFilter(''); }}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 pr-8 text-[10px] font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
                      >
                        <option value="">全部类型</option>
                        {DRUG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="relative group">
                      <select 
                        value={deptDrugFilter}
                        onChange={(e) => setDeptDrugFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 pr-8 text-[10px] font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
                      >
                        <option value="">全部药品</option>
                        {(deptCategoryFilter ? DRUG_BY_CATEGORY[deptCategoryFilter] : ALL_DRUG_OPTIONS).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deptUsageData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {deptUsageData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">集采消耗 TOP 10 深度分析</h4>
                <button className="text-xs text-teal-600 font-bold hover:underline">查看完整排行</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 font-bold text-left border-b bg-gray-50/30">
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">编号</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">{isDrug ? '药品' : '耗材'}名称</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">主要使用科室</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-right">剩余库存</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">本期消耗数量</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">{isDrug ? '药品' : '耗材'}消耗进度</th>
                    <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest">进度状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {top10Drugs.map((drug, i) => (
                    <tr key={i} className="hover:bg-teal-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-400">{drug.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{drug.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-bold">{drug.dept}</span></td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-700">{drug.stock.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-black text-teal-600">{drug.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]"><div className="h-full bg-teal-500" style={{width: `${drug.percent}%`}}></div></div>
                          <span className="text-[10px] font-black text-gray-500">{drug.percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {i === 1 ? (
                          <span className="text-[10px] text-red-500 font-black flex items-center bg-red-50 px-2 py-1 rounded-full border border-red-100">
                            <AlertTriangle size={12} className="mr-1" /> 进度超前
                          </span>
                        ) : (
                          <span className="text-[10px] text-green-600 font-black flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-100">
                            <CheckCircle2 size={12} className="mr-1" /> 进度正常
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alert' && (
          <div className="p-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
                <h4 className="text-xl font-bold text-red-800">3 处不达标预警</h4>
                <p className="text-sm text-red-600 mt-2">科室集采任务执行率低于 80%，需人工介入跟进</p>
                <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-100">批量通知责任人</button>
              </div>
              <div className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
                <h4 className="text-xl font-bold text-orange-800">5 处异常增长预警</h4>
                <p className="text-sm text-orange-600 mt-2">部分消耗频次环比增长超过 50%</p>
                <button className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-100">查看诊断报告</button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
                 <h4 className="text-sm font-bold text-gray-700">全院科室集采任务执行情况分析表</h4>
                 <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold italic">
                   <Info size={12} className="mr-1" /> 点击下方科室项可下钻查看具体使用清单
                 </div>
               </div>

               {/* 分析表筛选项 */}
               <div className="p-6 border-b bg-gray-50/30 flex flex-wrap items-end gap-x-4 gap-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">科室类别</label>
                    <select 
                      value={alertFilterDeptCat}
                      onChange={(e) => { setAlertFilterDeptCat(e.target.value); setAlertFilterDept(''); }}
                      className="h-10 min-w-[140px] px-3 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
                    >
                      <option value="">全部类别</option>
                      {Object.keys(DEPT_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">具体科室</label>
                    <select 
                      value={alertFilterDept}
                      disabled={!alertFilterDeptCat}
                      onChange={(e) => setAlertFilterDept(e.target.value)}
                      className="h-10 min-w-[140px] px-3 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/10 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">全部科室</option>
                      {alertFilterDeptCat && DEPT_MAP[alertFilterDeptCat].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-[240px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      {isDrug ? '药品名称/编号' : '耗材名称/编号'}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="text" 
                        placeholder={`输入名称或唯一编码进行检索...`}
                        value={alertSearchQuery}
                        onChange={(e) => setAlertSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-xl bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
                      />
                    </div>
                  </div>
                  <button className="h-10 px-6 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-100 active:scale-95 transition-all">筛选</button>
               </div>

               <div className="p-6">
                 {[
                   { dept: '心内科', task: 1000, actual: 950, rate: 95, status: '达标' },
                   { dept: '骨科', task: 800, actual: 520, rate: 65, status: '不达标' },
                   { dept: '消化科', task: 500, actual: 480, rate: 96, status: '达标' },
                   { dept: '儿科', task: 300, actual: 450, rate: 150, status: '增长过快' },
                 ].map((item, i) => (
                   <div 
                     key={i} 
                     onClick={() => setViewingAlertDeptDetail(item)}
                     className="mb-6 last:mb-0 cursor-pointer p-4 rounded-xl border border-transparent hover:border-teal-100 hover:bg-teal-50/30 transition-all group"
                   >
                     <div className="flex justify-between items-end mb-2">
                       <div className="flex items-center">
                         <span className="text-sm font-bold text-gray-700 group-hover:text-teal-600 transition-colors">{item.dept}</span>
                         <span className="text-[10px] text-gray-400 ml-4 font-medium uppercase tracking-tighter">任务: {item.task} / 实际: {item.actual}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className={`text-xs font-bold ${item.status === '不达标' ? 'text-red-500' : item.status === '增长过快' ? 'text-orange-500' : 'text-teal-500'}`}>执行率: {item.rate}% ({item.status})</span>
                         <ExternalLink size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                       </div>
                     </div>
                     <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                       <div className={`h-full transition-all duration-1000 ${item.status === '不达标' ? 'bg-red-500' : item.status === '增长过快' ? 'bg-orange-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(item.rate, 100)}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="p-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-start justify-between"><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">全院临时采购占比</p><h4 className="text-2xl font-bold text-gray-800">4.2%</h4><p className="text-[10px] text-green-500 font-bold mt-1">低于 5.0% 阈值 (安全)</p></div><div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><CheckCircle2 size={24} /></div></div>
               <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-start justify-between"><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">临时采购限次预警</p><h4 className="text-2xl font-bold text-orange-600">2 位医师</h4><p className="text-[10px] text-gray-400 font-medium mt-1">当年申购次数即将达到 5 次上限</p></div><div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><UserCheck size={24} /></div></div>
               <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-start justify-between"><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">累计审批归档</p><h4 className="text-2xl font-bold text-gray-800">142 笔</h4><p className="text-[10px] text-teal-600 font-bold mt-1 hover:underline cursor-pointer">进入审计中心查询</p></div><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Archive size={24} /></div></div>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
                  <button 
                    onClick={() => setEmergencySubTab('current')} 
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${emergencySubTab === 'current' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    进行中申请
                  </button>
                  <button 
                    onClick={() => setEmergencySubTab('history')} 
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${emergencySubTab === 'history' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    历史申请记录
                  </button>
                </div>
                <button 
                  onClick={() => setShowEmergencyForm(true)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold shadow-lg shadow-teal-100 flex items-center hover:bg-teal-700 transition-colors"
                >
                  <Plus size={18} className="mr-2" /> 申请临时非集采品目
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase border-b text-[11px]">
                    <tr>
                      <th className="px-6 py-4">申请单号</th>
                      <th className="px-6 py-4">提报信息</th>
                      <th className="px-6 py-4">申请品目摘要</th>
                      <th className="px-6 py-4">预估流水</th>
                      <th className="px-6 py-4">审批进度</th>
                      <th className="px-6 py-4 text-center">状态</th>
                      <th className="px-6 py-4 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredEmergency.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-400 text-xs">{item.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700">{item.applicant}</p>
                          <p className="text-[10px] text-teal-600 font-medium">{item.dept}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-bold text-blue-600">{item.drugName}</p>
                          <p className="text-[10px] text-gray-400 italic line-clamp-1">{item.items.length > 1 ? `包含 ${item.items.length} 项品目` : `原因: ${item.reason}`}</p>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-600">￥{item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            {item.auditChain.map((node, idx) => (
                              <React.Fragment key={idx}>
                                <span className={`text-[9px] font-black ${item.status === 'completed' ? 'text-teal-600' : 'text-gray-400'}`}>{node}</span>
                                {idx < item.auditChain.length - 1 && <ArrowRightLeft size={8} className="text-gray-300" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'auditing' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                            item.status === 'completed' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {item.status === 'auditing' ? '待审批' : item.status === 'completed' ? '已核准' : '被驳回'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => { setViewingDetail(item); setAuditDecision('pass'); }}
                            className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded hover:bg-teal-100 transition-colors"
                          >
                            详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- 下钻弹窗: 科室药品使用预警明细 (纯展示看板) --- */}
      {viewingAlertDeptDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingAlertDeptDetail(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[88vh]">
            <div className={`px-8 py-6 bg-teal-600 text-white flex justify-between items-center shrink-0`}>
              <div className="flex items-center space-x-3">
                 <Activity size={24} />
                 <h3 className="text-xl font-black tracking-tight">
                   {viewingAlertDeptDetail.dept} - {alertSearchQuery ? `“${alertSearchQuery}” 相关` : (isDrug ? '药品' : '耗材')}使用预警明细
                 </h3>
              </div>
              <button onClick={() => setViewingAlertDeptDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide pb-16">
               <div className="flex justify-between items-center bg-teal-50/50 p-6 rounded-3xl border border-teal-100">
                  <div className="flex items-center space-x-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">科室任务量</p>
                      <p className="text-2xl font-black text-gray-800">{viewingAlertDeptDetail.task}</p>
                    </div>
                    <div className="w-px h-10 bg-teal-200"></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">科室实际量</p>
                      <p className="text-2xl font-black text-teal-600">{viewingAlertDeptDetail.actual}</p>
                    </div>
                    <div className="w-px h-10 bg-teal-200"></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">当前执行率</p>
                      <p className={`text-2xl font-black ${viewingAlertDeptDetail.rate < 80 ? 'text-red-500' : 'text-teal-600'}`}>{viewingAlertDeptDetail.rate}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">风险等级</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${viewingAlertDeptDetail.status === '不达标' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                      {viewingAlertDeptDetail.status === '不达标' ? '高风险 - 需干预' : '正常执行'}
                    </span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3">具体品目消耗审计清单</h4>
                  <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-black">
                        <tr>
                          <th className="px-6 py-4">品目名称/编号</th>
                          <th className="px-6 py-4 text-center">任务量</th>
                          <th className="px-6 py-4 text-center">实际量</th>
                          <th className="px-6 py-4 text-center">执行率</th>
                          <th className="px-6 py-4">预警原因/建议</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-medium">
                        {[
                          { name: '阿托伐他汀钙片', id: 'HIS-00124', task: 300, actual: 120, rate: 40, reason: '临床偏向选择非集采替代品', color: 'text-red-500' },
                          { name: '氨氯地平片', id: 'HIS-00356', task: 200, actual: 190, rate: 95, reason: '执行进度良好', color: 'text-teal-600' },
                          { name: '氯吡格雷', id: 'HIS-00562', task: 400, actual: 350, rate: 87.5, reason: '库存供应波动，已恢复', color: 'text-orange-500' },
                          { name: '重组人利钠肽', id: 'HIS-09211', task: 100, actual: 10, rate: 10, reason: '急救用药使用频次低于预期', color: 'text-red-500' },
                        ]
                        .filter(drug => 
                          !alertSearchQuery || 
                          drug.name.includes(alertSearchQuery) || 
                          drug.id.toLowerCase().includes(alertSearchQuery.toLowerCase())
                        )
                        .map((drug, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                               <p className="font-bold text-gray-800">{drug.name}</p>
                               <p className="text-[10px] text-gray-400 font-mono uppercase">{drug.id}</p>
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-gray-500">{drug.task}</td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">{drug.actual}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`font-mono font-black ${drug.color}`}>{drug.rate}%</span>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-gray-600 text-[11px] leading-relaxed italic">“{drug.reason}”</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
               
               <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start space-x-3 mt-4">
                 <ShieldAlert size={18} className="text-teal-600 mt-0.5" />
                 <div className="space-y-1">
                   <p className="text-xs font-black text-gray-700">自动化管理诊断结论</p>
                   <p className="text-[11px] text-gray-500 leading-relaxed">该科室核心药品执行率存在显著偏离，系统已关联 2 份待处理的集采督导函，建议资产管理员后续在“通知中心”统一跟进。</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 临时采购申请弹窗 (Form) --- */}
      {showEmergencyForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmergencyForm(false)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-teal-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <Zap size={24} />
                <h3 className="text-xl font-black tracking-tight">发起临时/非集采申请</h3>
              </div>
              <button onClick={() => setShowEmergencyForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {/* 新增：个人临采额度监控卡片 */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex flex-col items-center justify-center shadow-inner border border-amber-200">
                    <span className="text-2xl font-black leading-none">{userQuota.remaining}</span>
                    <span className="text-[8px] font-black uppercase mt-1">剩余次数</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 flex items-center">
                      <UserRound size={16} className="mr-2" /> 当前账号临采限额监控 (2024年度)
                    </h4>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center text-[11px] font-bold text-amber-700 bg-white/50 px-3 py-1 rounded-full border border-amber-100">
                        <BadgeCheck size={12} className="mr-1.5" /> 已完成: {userQuota.used}
                      </div>
                      <div className="flex items-center text-[11px] font-bold text-amber-700 bg-white/50 px-3 py-1 rounded-full border border-amber-100">
                        <Clock size={12} className="mr-1.5" /> 审批中: {userQuota.processing}
                      </div>
                      <div className="flex items-center text-[11px] font-black text-amber-900">
                        年度上限: {userQuota.total} 次
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 max-w-[200px] ml-10">
                  <div className="flex justify-between text-[10px] font-black text-amber-400 uppercase mb-1.5">
                    <span>消耗进度</span>
                    <span>{((userQuota.total - userQuota.remaining) / userQuota.total * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((userQuota.total - userQuota.remaining) / userQuota.total * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 bg-teal-50/30 p-6 rounded-2xl border border-teal-100/50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">申请科室类别</label>
                  <select 
                    value={formDeptCategory}
                    onChange={(e) => { setFormDeptCategory(e.target.value); setFormDept(''); }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">请选择类别...</option>
                    {Object.keys(DEPT_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">具体申请科室</label>
                  <select 
                    value={formDept}
                    disabled={!formDeptCategory}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                  >
                    <option value="">请选择具体科室...</option>
                    {formDeptCategory && DEPT_MAP[formDeptCategory].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">紧急程度</label>
                  <select 
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value)}
                    className="w-full h-12 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option>常规临时申请</option><option>急诊抢救特批</option><option>临床科研特需</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="text-sm font-black text-gray-800 flex items-center">
                    <Package size={18} className="mr-2 text-teal-600" /> 申请品目清单
                  </h4>
                  <button 
                    onClick={addFormItem}
                    className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-black border border-teal-100 flex items-center hover:bg-teal-100 transition-colors"
                  >
                    <Plus size={14} className="mr-1" /> 添加申请项
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formItems.map((item, index) => (
                    <div key={item.id} className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm space-y-5 relative border-l-4 border-l-teal-500 group">
                      {formItems.length > 1 && (
                        <button 
                          onClick={() => removeFormItem(item.id)}
                          className="absolute top-6 right-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">品目名称</label>
                          <input 
                            type="text" 
                            value={item.drugName}
                            onChange={(e) => updateFormItem(item.id, 'drugName', e.target.value)}
                            placeholder="品目全称" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">规格型号</label>
                          <input 
                            type="text" 
                            value={item.spec}
                            onChange={(e) => updateFormItem(item.id, 'spec', e.target.value)}
                            placeholder="规格" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">数量</label>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateFormItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">预计单价 (￥)</label>
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => updateFormItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-500/20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">申请原因</label>
                        <textarea 
                          value={item.reason}
                          onChange={(e) => updateFormItem(item.id, 'reason', e.target.value)}
                          placeholder="请阐述必要性..." 
                          className="w-full h-20 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-8 whitespace-nowrap">
                <div className="flex items-center text-xs text-gray-400 font-bold italic">
                  <Info size={16} className="mr-2 text-teal-500" /> 
                  提示：总金额超过 10 万元将自动触发院长级审批。
                </div>
                <div className="flex items-center space-x-3">
                  <Calculator size={18} className="text-teal-600" />
                  <span className="text-sm font-bold text-gray-600">全单总额预估:</span>
                  <span className="text-2xl font-black text-teal-600 font-mono">￥{totalApplicationAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex space-x-4 whitespace-nowrap">
                 <button onClick={() => setShowEmergencyForm(false)} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center">
                   取消
                 </button>
                 <button 
                    disabled={!formDept || formItems.some(i => !i.drugName) || userQuota.remaining <= 0}
                    onClick={() => setShowEmergencyForm(false)} 
                    className={`px-10 py-3 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center ${userQuota.remaining <= 0 ? 'bg-gray-400 shadow-none' : 'bg-teal-600 shadow-teal-100 hover:bg-teal-700'}`}
                 >
                   <Send size={18} className="mr-2" /> {userQuota.remaining <= 0 ? '额度不足，无法提交' : '提交临采申请'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 临时采购详情/审批弹窗 --- */}
      {viewingDetail && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingDetail(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[88vh]">
            <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${viewingDetail.status === 'completed' ? 'bg-teal-600' : viewingDetail.status === 'auditing' ? 'bg-indigo-600' : 'bg-red-600'}`}>
              <div className="flex items-center space-x-3">
                 {viewingDetail.status === 'auditing' && hasAuditPermission ? <ShieldCheck size={24} /> : <BadgeCheck size={24} />}
                 <h3 className="text-xl font-black tracking-tight">
                   {viewingDetail.status === 'auditing' && hasAuditPermission ? '临时采购审批决策' : '临时采购申请明细'}
                 </h3>
              </div>
              <button onClick={() => setViewingDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
               <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">申请单号</p>
                     <p className="text-sm font-mono font-black text-gray-800">{viewingDetail.id}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">当前状态</p>
                     <p className={`text-sm font-black ${viewingDetail.status === 'completed' ? 'text-teal-600' : viewingDetail.status === 'auditing' ? 'text-orange-500' : 'text-red-600'}`}>
                       {viewingDetail.status === 'completed' ? '核准通过' : viewingDetail.status === 'auditing' ? '等待审批中' : '申请已驳回'}
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-gray-900 pl-3">提报基础信息</h4>
                     <div className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                        <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报科室:</span> <span className="text-gray-800 font-black">{viewingDetail.dept}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报人员:</span> <span className="text-gray-800 font-black">{viewingDetail.applicant}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报时间:</span> <span className="text-gray-800 font-black">{viewingDetail.time}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">全单总额:</span> <span className="text-teal-600 font-black">￥{viewingDetail.amount.toLocaleString()}</span></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3">审批链追踪</h4>
                     <div className="space-y-5 bg-teal-50/30 p-5 rounded-2xl border border-teal-100/50">
                        {viewingDetail.auditChain.map((node, i) => (
                           <div key={i} className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${viewingDetail.status === 'completed' || (viewingDetail.status === 'auditing' && i === 0) ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                 {i + 1}
                              </div>
                              <span className="text-xs font-black text-gray-700">{node}</span>
                              <span className="text-[10px] text-gray-400 font-medium italic">
                                 {viewingDetail.status === 'completed' ? '已核准' : i === 0 ? '初审通过' : '待处理'}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-blue-600 pl-3">申请明细清单 ({viewingDetail.items.length})</h4>
                  <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-black">
                        <tr>
                          <th className="px-6 py-3">品目名称/规格</th>
                          <th className="px-6 py-3 text-center">数量</th>
                          <th className="px-6 py-3 text-right">预计流水</th>
                          <th className="px-6 py-3">原因</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {viewingDetail.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                               <p className="font-bold text-gray-800">{item.drugName}</p>
                               <p className="text-[10px] text-gray-400">{item.spec}</p>
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">{item.quantity}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-teal-600">￥{(item.quantity * item.price).toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-400 max-w-[200px] truncate">{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {viewingDetail.status === 'auditing' && hasAuditPermission && (
                 <div className="pt-6 border-t border-dashed space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="space-y-4">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">审批决策结论</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setAuditDecision('pass')}
                          className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center ${auditDecision === 'pass' ? 'border-green-50 border-green-500 text-green-700 shadow-md scale-[1.02]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                          <CheckCircle2 size={24} className="mb-2" />
                          <span className="text-sm font-black">通过</span>
                        </button>
                        <button 
                          onClick={() => setAuditDecision('reject')}
                          className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center ${auditDecision === 'reject' ? 'border-red-50 border-red-500 text-red-700 shadow-md scale-[1.02]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                          <AlertCircle size={24} className="mb-2" />
                          <span className="text-sm font-black">不通过</span>
                        </button>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center">
                       <MessageSquare size={14} className="mr-1.5" /> 审批处理意见 {auditDecision === 'reject' && <span className="text-red-500 ml-1 font-bold">*</span>}
                     </label>
                     <textarea 
                       value={auditComment}
                       onChange={(e) => setAuditComment(e.target.value)}
                       placeholder={auditDecision === 'pass' ? "选填，可输入建议..." : "必填，请说明理由..."}
                       className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                     />
                   </div>
                 </div>
               )}
            </div>
            <div className="p-8 border-t bg-gray-50/50 flex justify-end space-x-4 shrink-0">
               <button onClick={() => setViewingDetail(null)} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all">
                 关闭
               </button>
               {viewingDetail.status === 'auditing' && hasAuditPermission && (
                 <button 
                  disabled={auditDecision === 'reject' && !auditComment.trim()}
                  onClick={handleAuditAction}
                  className={`px-10 py-3 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 ${auditDecision === 'pass' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}
                 >
                   确认决策
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, unit, trend, isDown }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline space-x-1">
      <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
      <span className="text-xs text-gray-400 font-bold">{unit}</span>
    </div>
    <div className={`mt-2 text-[10px] font-bold flex items-center ${isDown ? 'text-red-500' : 'text-teal-500'}`}>
      {isDown ? '▼' : '▲'} {trend} <span className="text-gray-400 font-normal ml-1">较上期</span>
    </div>
  </div>
);

const WorkflowNode = ({ status, label, user, time, isLast }: any) => {
  const isCompleted = status === 'completed';
  const isProcessing = status === 'processing';
  const isVoided = status === 'voided';
  
  return (
    <div className="flex items-start space-x-4 relative">
       <div className="flex flex-col items-center shrink-0 mt-1">
          <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
            isCompleted ? 'bg-green-500 border-green-200' : 
            isProcessing ? 'bg-orange-500 border-orange-200 animate-pulse' : 
            isVoided ? 'bg-red-500 border-red-200' :
            'bg-gray-100 border-gray-200'
          }`}></div>
          {!isLast && <div className={`w-0.5 h-8 mt-1 transition-colors ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}></div>}
       </div>
       <div className="flex-1">
          <p className={`text-[11px] font-black tracking-tight ${isCompleted ? 'text-gray-800' : isProcessing ? 'text-orange-600' : isVoided ? 'text-red-600' : 'text-gray-400'}`}>
            {label}
          </p>
          <div className="flex justify-between mt-1">
             <span className="text-[10px] text-gray-500 font-bold">{user}</span>
             <span className="text-[10px] text-gray-300 font-mono italic">{time}</span>
          </div>
       </div>
    </div>
  );
}

export default UsageManagement;
