
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, RadialBarChart, RadialBar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Monitor,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Briefcase,
  AlertCircle,
  Wrench,
  Clock,
  CalendarDays,
  AlertTriangle,
  ZapOff,
  Stethoscope,
  Shield,
  ShieldCheck,
  Thermometer,
  Award,
  FileCheck,
  Verified,
  Percent,
  CheckCircle2,
  FileSearch,
  Scale,
  X,
  RefreshCcw,
  ShieldAlert,
  ClipboardList,
  Printer,
  Download,
  FileText,
  BadgeCheck,
  Stamp,
  Zap,
  Droplets,
  ChevronDown // Added import
} from 'lucide-react';

// 定义科室类别映射
const CATEGORIES = {
  clinical: { label: '临床科室', depts: ['icu'] },
  medicalTech: { label: '医技科室', depts: ['imaging', 'laboratory'] }
};

// 定义设备详情及其专属统计维度
const DEPARTMENTS = {
  imaging: {
    label: '影像科',
    equipments: [
      { 
        id: 'EQ-IMG-01', name: 'GE 64排螺旋CT', type: 'CT',
        purchaseDate: '2019-05-15', serviceLife: 10,
        dimensions: [
          { name: '头部', value: 450, prev: 400 },
          { name: '胸部', value: 380, prev: 350 },
          { name: '腹部', value: 290, prev: 310 },
          { name: '四肢关节', value: 120, prev: 100 },
          { name: '脊柱', value: 160, prev: 140 }
        ],
        mtbf: 185, lastRep: '2024-03-12', nextMaint: '2024-06-12',
        failureRate: 2.4,
        severity: [
          { name: '一般故障', value: 12 },
          { name: '严重故障', value: 3 },
          { name: '致命故障', value: 1 }
        ],
        commonFailures: [
          { name: '球管打火异常', value: 8 },
          { name: 'DAS板通讯错误', value: 4 },
          { name: '扫描床升降卡阻', value: 2 }
        ],
        components: [
          { label: '核心球管', percent: 15, status: 'urgent' as const },
          { label: '探测器阵列', percent: 78, status: 'normal' as const },
          { label: '高压发生器', percent: 52, status: 'warning' as const }
        ]
      },
      { 
        id: 'EQ-IMG-02', name: '西门子 3.0T MRI', type: 'MRI',
        purchaseDate: '2020-08-20', serviceLife: 12,
        dimensions: [
          { name: '颅脑', value: 220, prev: 200 },
          { name: '颈椎/腰椎', value: 310, prev: 280 },
          { name: '膝关节', value: 150, prev: 140 },
          { name: '腹部增强', value: 90, prev: 110 },
          { name: '心脏/大血管', value: 45, prev: 40 }
        ],
        mtbf: 210, lastRep: '2024-01-05', nextMaint: '2024-07-05',
        failureRate: 1.8,
        severity: [
          { name: '一般故障', value: 8 },
          { name: '严重故障', value: 1 },
          { name: '致命故障', value: 0 }
        ],
        commonFailures: [
          { name: '射频噪声干扰', value: 5 },
          { name: '梯度功放过热', value: 2 },
          { name: '液氦压力偏移', value: 1 }
        ],
        components: [
          { label: '梯度线圈', percent: 88, status: 'normal' as const },
          { label: '射频放大器', percent: 65, status: 'warning' as const },
          { label: '液氦液位', percent: 92, status: 'normal' as const }
        ]
      },
      { 
        id: 'EQ-IMG-03', name: '飞利浦 DR数字化X射线机', type: 'DR',
        purchaseDate: '2021-11-10', serviceLife: 8,
        dimensions: [
          { name: '胸部正侧位', value: 1200, prev: 1150 },
          { name: '四肢骨骼', value: 850, prev: 900 },
          { name: '腹部平片', value: 300, prev: 280 },
          { name: '脊柱全长', value: 150, prev: 120 }
        ],
        mtbf: 320, lastRep: '2023-11-20', nextMaint: '2024-05-20',
        failureRate: 0.9,
        severity: [
          { name: '一般故障', value: 5 },
          { name: '严重故障', value: 0 },
          { name: '致命故障', value: 0 }
        ],
        commonFailures: [
          { name: '平板探测器同步异常', value: 10 },
          { name: '限束器滤过错误', value: 3 }
        ],
        components: [
          { label: '平板探测器', percent: 94, status: 'normal' as const },
          { label: '射线管组件', percent: 35, status: 'warning' as const },
          { label: '束光器', percent: 72, status: 'normal' as const }
        ]
      }
    ]
  },
  icu: {
    label: '重症医学科(ICU)',
    equipments: [
      { 
        id: 'EQ-ICU-01', name: '德尔格 呼吸机', type: 'Ventilator',
        purchaseDate: '2022-03-01', serviceLife: 8,
        dimensions: [
          { name: '有创AC', value: 45, prev: 40 },
          { name: '有创SIMV', value: 30, prev: 35 },
          { name: '无创CPAP', value: 120, prev: 100 }
        ],
        mtbf: 95, lastRep: '2024-04-01', nextMaint: '2024-05-01',
        failureRate: 5.2,
        severity: [
          { name: '一般故障', value: 22 },
          { name: '严重故障', value: 8 },
          { name: '致命故障', value: 2 }
        ],
        commonFailures: [
          { name: '空氧比例阀漂移', value: 12 },
          { name: '湿化罐感应失效', value: 10 },
          { name: '内部电池老化', value: 6 }
        ],
        components: [
          { label: '氧电池/传感器', percent: 22, status: 'urgent' as const },
          { label: '呼气阀组件', percent: 48, status: 'warning' as const },
          { label: '流量传感器', percent: 85, status: 'normal' as const }
        ]
      }
    ]
  },
  laboratory: {
    label: '检验科',
    equipments: [
      { 
        id: 'EQ-LAB-01', name: '罗氏 全自动生化仪', type: 'Lab',
        purchaseDate: '2023-01-15', serviceLife: 6,
        dimensions: [
          { name: '肝功能', value: 1500, prev: 1420 },
          { name: '肾功能', value: 1300, prev: 1250 },
          { name: '血脂', value: 980, prev: 1000 }
        ],
        mtbf: 120, lastRep: '2024-03-25', nextMaint: '2024-04-25',
        failureRate: 3.8,
        severity: [
          { name: '一般故障', value: 15 },
          { name: '严重故障', value: 4 },
          { name: '致命故障', value: 1 }
        ],
        commonFailures: [
          { name: '加样针消耗', value: 12 },
          { name: '反应盘控温异常', value: 5 }
        ],
        components: [
          { label: '加样针', percent: 32, status: 'warning' as const },
          { label: '反应盘光源', percent: 18, status: 'urgent' as const },
          { label: '温育槽搅拌器', percent: 88, status: 'normal' as const }
        ]
      }
    ]
  }
};

// 动态磨损预估部件接口定义
interface WearComponentItem {
  uniqueId: string;
  label: string;
  percent: number;
  status: 'normal' | 'warning' | 'urgent';
}

const EquipmentBenefit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES>('medicalTech');
  const [selectedDept, setSelectedDept] = useState<keyof typeof DEPARTMENTS>('imaging');
  const [selectedEquipId, setSelectedEquipId] = useState<string>('all');
  const [statDimension, setStatDimension] = useState<'business' | 'patient'>('business');
  const [timeGranularity, setTimeGranularity] = useState<'all' | 'day' | 'week' | 'month' | 'quarter'>('all');
  const [maintCostType, setMaintCostType] = useState<'cumulative' | 'single'>('cumulative');
  const [showUsageDetail, setShowUsageDetail] = useState(false);
  const [showFailureDetail, setShowFailureDetail] = useState(false);
  const [showComplianceDetail, setShowComplianceDetail] = useState(false);
  const [showAuditReport, setShowAuditReport] = useState(false);

  // 联动逻辑：切换科室类别时，重置科室为该类别的第一个
  useEffect(() => {
    const availableDepts = CATEGORIES[selectedCategory].depts;
    if (!availableDepts.includes(selectedDept as string)) {
      setSelectedDept(availableDepts[0] as any);
      setSelectedEquipId('all');
    }
  }, [selectedCategory]);

  const filteredDeptOptions = useMemo(() => {
    return CATEGORIES[selectedCategory].depts.map(key => ({
      key,
      label: DEPARTMENTS[key as keyof typeof DEPARTMENTS].label
    }));
  }, [selectedCategory]);

  // 周期权重
  const periodMultiplier = useMemo(() => {
    switch (timeGranularity) {
      case 'day': return 0.033; 
      case 'week': return 0.23; 
      case 'month': return 1;    
      case 'quarter': return 3;  
      default: return 12; 
    }
  }, [timeGranularity]);

  const currentEquip = useMemo(() => {
    return DEPARTMENTS[selectedDept].equipments.find(e => e.id === selectedEquipId);
  }, [selectedDept, selectedEquipId]);

  // 生命周期时钟本地状态
  const [lifecycleEquipId, setLifecycleEquipId] = useState<string>('');

  // 监听全局筛选，更新或重置本地生命周期设备ID
  useEffect(() => {
    if (selectedEquipId !== 'all') {
      setLifecycleEquipId(selectedEquipId);
    } else {
      // 默认为该科室第一个设备
      const first = DEPARTMENTS[selectedDept]?.equipments[0]?.id;
      if (first) setLifecycleEquipId(first);
    }
  }, [selectedEquipId, selectedDept]);

  // 构建分布图表数据
  const chartData = useMemo(() => {
    const finalMultiplier = periodMultiplier;
    if (statDimension === 'patient') {
      return [
        { name: '门诊', value: Math.round(650 * finalMultiplier), prev: Math.round(610 * finalMultiplier) },
        { name: '急诊', value: Math.round(180 * finalMultiplier), prev: Math.round(195 * finalMultiplier) },
        { name: '住院', value: Math.round(320 * finalMultiplier), prev: Math.round(300 * finalMultiplier) },
        { name: '体检', value: Math.round(240 * finalMultiplier), prev: Math.round(230 * finalMultiplier) },
      ];
    }

    if (selectedEquipId === 'all') {
      return DEPARTMENTS[selectedDept].equipments.map(e => ({
        name: e.name.split(' ')[1] || e.name,
        value: Math.round(e.dimensions.reduce((sum, d) => sum + d.value, 0) * periodMultiplier),
        prev: Math.round(e.dimensions.reduce((sum, d) => sum + d.prev, 0) * 0.95 * periodMultiplier)
      }));
    }

    return currentEquip?.dimensions.map(d => ({
      name: d.name,
      value: Math.round(d.value * periodMultiplier),
      prev: Math.round(d.prev * periodMultiplier)
    })) || [];
  }, [selectedDept, selectedEquipId, statDimension, periodMultiplier, currentEquip]);

  const totalUsage = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // 财务统计模拟逻辑
  const financialMetrics = useMemo(() => {
    const revenue = totalUsage * 420;
    const depreciation = totalUsage * 85;
    const opCost = totalUsage * 60;
    const maintCost = totalUsage * 35; 
    const netProfit = revenue - depreciation - opCost - maintCost;
    
    return {
      usageRevenue: (revenue / 10000).toFixed(2),
      depreciation: (depreciation / 10000).toFixed(2),
      roi: ((netProfit / (revenue || 1)) * 100).toFixed(2),
      netProfit: (netProfit / 10000).toFixed(2),
      revPerUse: 420,
      opCost: (opCost / 10000).toFixed(2),
      maintCost: (maintCost / 10000).toFixed(2)
    };
  }, [totalUsage]);

  // 维保统计数据模拟
  const maintMetrics = useMemo(() => {
    if (selectedEquipId !== 'all' && currentEquip) {
      return {
        mtbf: currentEquip.mtbf,
        lastRep: currentEquip.lastRep,
        nextMaint: currentEquip.nextMaint,
        totalMaintCost: financialMetrics.maintCost
      };
    }
    const deptEquips = DEPARTMENTS[selectedDept].equipments;
    const avgMtbf = Math.round(deptEquips.reduce((acc, e) => acc + e.mtbf, 0) / deptEquips.length);
    return {
      mtbf: avgMtbf,
      lastRep: '2024-04-02',
      nextMaint: '2024-05-01',
      totalMaintCost: financialMetrics.maintCost
    };
  }, [selectedDept, selectedEquipId, currentEquip, financialMetrics]);

  // 故障统计核心数据计算
  const failureMetrics = useMemo(() => {
    if (selectedEquipId !== 'all' && currentEquip) {
      return {
        failureRate: currentEquip.failureRate,
        severityData: currentEquip.severity,
        totalFailures: currentEquip.severity.reduce((sum, s) => sum + s.value, 0),
        failureTypeData: currentEquip.commonFailures,
        mtbf: currentEquip.mtbf
      };
    }
    
    const deptEquips = DEPARTMENTS[selectedDept].equipments;
    const avgRate = (deptEquips.reduce((sum, e) => sum + e.failureRate, 0) / deptEquips.length).toFixed(1);
    const avgMtbf = Math.round(deptEquips.reduce((acc, e) => acc + e.mtbf, 0) / deptEquips.length);
    
    const aggregatedSeverity = [
      { name: '一般故障', value: deptEquips.reduce((sum, e) => sum + e.severity[0].value, 0) },
      { name: '严重故障', value: deptEquips.reduce((sum, e) => sum + e.severity[1].value, 0) },
      { name: '致命故障', value: deptEquips.reduce((sum, e) => sum + e.severity[2].value, 0) }
    ];

    const typeMap: Record<string, number> = {};
    deptEquips.forEach(e => e.commonFailures.forEach(f => {
      typeMap[f.name] = (typeMap[f.name] || 0) + f.value;
    }));
    const sortedTypes = Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return {
      failureRate: parseFloat(avgRate),
      severityData: aggregatedSeverity,
      totalFailures: aggregatedSeverity.reduce((sum, s) => sum + s.value, 0),
      failureTypeData: sortedTypes,
      mtbf: avgMtbf
    };
  }, [selectedDept, selectedEquipId, currentEquip]);

  // 合规性统计数据模拟
  const complianceMetrics = useMemo(() => {
    return {
      qualificationRate: 100,
      storageCompliance: 96.2,
      abuseIndex: 1.2, // 低风险
      maintComplianceRate: 97.4,
      authorizedMaintRatio: 98.4,
      assetRetentionRate: 88.5,
      environmentalStats: [
        { name: '温度', value: 24.2, status: 'normal' },
        { name: '湿度', value: 45.1, status: 'normal' },
      ],
      historyRetention: [
        { month: 'Q1', value: 92 },
        { month: 'Q2', value: 90 },
        { month: 'Q3', value: 89 },
        { month: 'Q4', value: 88.5 },
      ]
    };
  }, [selectedDept, selectedEquipId]);

  const wearComponents = useMemo<WearComponentItem[]>(() => {
    let components: WearComponentItem[] = [];
    if (selectedEquipId !== 'all' && currentEquip) {
      components = currentEquip.components.map(c => ({
        uniqueId: c.label,
        label: c.label,
        percent: c.percent,
        status: c.status as 'normal' | 'warning' | 'urgent'
      }));
    } else {
      const allComponents = DEPARTMENTS[selectedDept].equipments.flatMap(e => 
        e.components.map(c => ({ 
          uniqueId: `${e.id}-${c.label}`,
          label: `${e.name.split(' ')[1] || '设备'}: ${c.label}`,
          percent: c.percent,
          status: c.status as 'normal' | 'warning' | 'urgent'
        }))
      );
      components = allComponents;
    }
    return components.sort((a, b) => a.percent - b.percent).slice(0, 3);
  }, [selectedDept, selectedEquipId, currentEquip]);

  // 维保费用趋势数据
  const maintTrendData = useMemo(() => {
    const baseLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    let runningSum = 0;
    return baseLabels.map((label, idx) => {
      const singleValue = Math.round((Math.random() * 5 + 2) * periodMultiplier * (selectedEquipId === 'all' ? 3 : 1));
      runningSum += singleValue;
      return {
        time: label,
        value: maintCostType === 'cumulative' ? runningSum : singleValue
      };
    });
  }, [maintCostType, periodMultiplier, selectedEquipId]);

  // 能耗数据模拟 (新增)
  const energyData = useMemo(() => {
    return [
      { name: '1月', elec: 2400, water: 300 },
      { name: '2月', elec: 2200, water: 280 },
      { name: '3月', elec: 2600, water: 350 },
      { name: '4月', elec: 2800, water: 400 },
      { name: '5月', elec: 3100, water: 450 },
      { name: '6月', elec: 3000, water: 420 },
    ];
  }, []);

  // 生命周期数据 (新增)
  const lifecycleData = useMemo(() => {
    const equip = DEPARTMENTS[selectedDept].equipments.find(e => e.id === lifecycleEquipId);
    // 默认 fallback
    if (!equip) return { total: 10, used: 0, remaining: 10, percent: 0, name: '未知设备', purchaseDate: '-' };

    const total = equip.serviceLife || 10;
    const purchaseDate = equip.purchaseDate || '2020-01-01';
    
    // 简单计算已使用年限
    const start = new Date(purchaseDate).getTime();
    const now = new Date().getTime();
    const usedYears = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    
    const used = Math.max(0, parseFloat(usedYears.toFixed(1)));
    const remaining = Math.max(0, parseFloat((total - used).toFixed(1)));
    
    // 限制百分比最大 100，避免图表溢出（虽然真实情况可能超期）
    const percent = Math.min(100, (used / total) * 100);

    return { 
        total, 
        used, 
        remaining, 
        percent, 
        name: equip.name,
        purchaseDate 
    };
  }, [lifecycleEquipId, selectedDept]);

  // 趋势图标签生成
  const trendData = useMemo(() => {
    const baseValue = selectedEquipId === 'all' ? 100 : 40;
    const finalMultiplier = periodMultiplier * (selectedEquipId === 'all' ? 8 : 3);
    
    let labels: string[] = [];
    switch(timeGranularity) {
      case 'day': labels = ['04:00', '08:00', '12:00', '16:00', '20:00', '24:00']; break;
      case 'week': labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']; break;
      case 'month': labels = ['第一周', '第二周', '第三周', '第四周']; break;
      case 'quarter': labels = ['第一月', '第二月', '第三月']; break;
      default: labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    }

    return labels.map(label => ({
      time: label,
      value: Math.round((baseValue + Math.random() * 20) * finalMultiplier),
      prev: Math.round((baseValue + Math.random() * 15) * finalMultiplier)
    }));
  }, [selectedEquipId, timeGranularity, periodMultiplier]);

  const getPeriodText = () => {
    switch(timeGranularity) {
      case 'day': return '今日统计';
      case 'week': return '本周统计';
      case 'month': return '本月统计';
      case 'quarter': return '本季度统计';
      default: return '年度统计';
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const SEVERITY_COLORS = ['#3b82f6', '#f59e0b', '#ef4444']; 

  return (
    <div className="p-6 space-y-6 relative pb-20">
      {/* 核心 KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem title={`${getPeriodText()}使用总量`} value={totalUsage.toLocaleString()} unit="次" isUp icon={<Activity className="text-blue-600" />} />
        <KPIItem title="区间综合利用率" value="86.4%" isUp={false} icon={<Monitor className="text-purple-600" />} />
        <KPIItem title="区间设备运营成本" value={`￥${financialMetrics.opCost}w`} isUp={false} icon={<TrendingDown className="text-orange-600" />} />
        <KPIItem title="区间设备收益" value={`￥${financialMetrics.usageRevenue}w`} isUp icon={<ArrowUpRight className="text-green-600" />} />
      </div>

      {/* 筛选栏 - 新增科室类别筛选 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="科室类别" value={selectedCategory} onChange={(v: any) => setSelectedCategory(v)}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </FilterSelect>
            <FilterSelect label="科室" value={selectedDept} onChange={(v: any) => {setSelectedDept(v); setSelectedEquipId('all');}}>
              {filteredDeptOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
            </FilterSelect>
            <FilterSelect label="特定设备" value={selectedEquipId} onChange={setSelectedEquipId}>
              <option value="all">全科室设备汇总分析</option>
              {DEPARTMENTS[selectedDept].equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </FilterSelect>
            <FilterSelect label="统计周期" value={timeGranularity} onChange={(v: any) => setTimeGranularity(v)}>
              <option value="all">年度统计</option>
              <option value="day">今日统计</option>
              <option value="week">本周统计</option>
              <option value="month">本月统计</option>
              <option value="quarter">本季度统计</option>
            </FilterSelect>
          </div>
          <div className="flex items-center p-1 bg-gray-100 rounded-xl w-fit">
            <button onClick={() => setStatDimension('business')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${statDimension === 'business' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>业务类型</button>
            <button onClick={() => setStatDimension('patient')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${statDimension === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>患者类型</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 分布与占比区 - 右上角新增查看明细按钮 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border-b">
          <div className="lg:col-span-2 p-8 border-r">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Monitor className="mr-2 text-blue-600" size={20} />
                {DEPARTMENTS[selectedDept].label} 设备使用分布分析
              </h3>
              <button 
                onClick={() => setShowUsageDetail(true)}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center shadow-sm"
              >
                查看明细 <FileSearch size={14} className="ml-1.5" />
              </button>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="人次" />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    formatter={(value: number) => [`${value} 人次`, '数值']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar name="当前数据" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar name="同期对比" dataKey="prev" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-8 bg-gray-50/20">
            <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">结构组成占比</h4>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} 人次`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-6">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex justify-between text-[11px] font-bold">
                  <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full mr-2" style={{background: COLORS[index % COLORS.length]}}></div>{item.name}</span>
                  <span className="text-gray-400">{((item.value / (chartData.reduce((a,b)=>a+b.value,0)||1))*100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 趋势图 */}
        <div className="p-8 border-b">
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-8">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            运行趋势分析
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="次" />
                <Tooltip formatter={(value: number) => [`${value} 人次`, '数值']} />
                <Area type="monotone" dataKey="value" name="当前趋势" stroke="#3b82f6" strokeWidth={3} fill="url(#colorVal)" />
                <Area type="monotone" dataKey="prev" name="同期趋势" stroke="#cbd5e1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 成本与营收深度分析 */}
        <div className="p-8 bg-white border-b">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <DollarSign className="mr-2 text-orange-500" size={20} />
              成本与营收深度分析
            </h3>
            <div className="flex items-center space-x-4 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Calculator size={14} className="mr-1" />
              周期盈亏平衡点已达到
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <FinanceStat label="使用次数营收" value={`￥${financialMetrics.usageRevenue}w`} desc="周期内检查/治疗费总计" icon={<TrendingUp size={16} className="text-blue-500" />} />
            <FinanceStat label="投资回报率 (ROI)" value={`${financialMetrics.roi}%`} desc="周期内净收益/资产原值" icon={<TrendingUp size={16} className="text-green-500" />} highlight />
            <FinanceStat label="折旧成本分摊" value={`￥${financialMetrics.depreciation}w`} desc="基于资产原值的直线折旧" icon={<TrendingDown size={16} className="text-red-500" />} />
            <FinanceStat label="均次收益" value={`￥${financialMetrics.revPerUse}`} desc="平均单次检查产生的收入" icon={<Calculator size={16} className="text-purple-500" />} />
            <FinanceStat label="区间预计净利" value={`￥${financialMetrics.netProfit}w`} desc="收入 - 折旧 - 运营成本" icon={<Briefcase size={16} className="text-teal-500" />} />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center justify-between">
                <span>收入 vs 支出 结构 (单位: 万元)</span>
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart layout="vertical" data={[
                    { name: '总收入', value: parseFloat(financialMetrics.usageRevenue), fill: '#3b82f6' },
                    { name: '折旧成本', value: parseFloat(financialMetrics.depreciation), fill: '#ef4444' },
                    { name: '维护成本', value: parseFloat(financialMetrics.maintCost), fill: '#f59e0b' },
                    { name: '变动运营', value: parseFloat(financialMetrics.opCost), fill: '#8b5cf6' },
                  ]} margin={{ left: 20, right: 20, bottom: 20, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={true} tickLine={true} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'dataMax + 10']} />
                    <YAxis dataKey="name" type="category" axisLine={true} tickLine={true} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1e293b' }} width={70} />
                    <Tooltip formatter={(value: number) => [`${value} 万元`, '金额']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">效益预警提示</h4>
              <div className="space-y-4">
                <BenefitAlert type="success" title="投资回收进度提前" content="当前设备处于生命周期成熟阶段，ROI 表现优异，建议维持现有维保频次。" />
                <BenefitAlert type="warning" title="运营成本占比评估" content="当前周期运营支出占收入比略高，建议通过提高非高峰时段利用率来摊薄固定成本。" />
              </div>
            </div>
          </div>
        </div>

        {/* 设备维保统计分析 */}
        <div className="p-8 bg-white border-b">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Wrench className="mr-2 text-blue-500" size={20} />
              设备维保统计分析
            </h3>
            <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
              <button onClick={() => setMaintCostType('cumulative')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${maintCostType === 'cumulative' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>累计费用</button>
              <button onClick={() => setMaintCostType('single')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${maintCostType === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>单次费用</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MaintKPI label="平均维修间隔 (MTBF)" value={`${maintMetrics.mtbf}`} unit="天" icon={<Clock className="text-blue-600" size={18} />} desc="设备可靠性核心指标" />
            <MaintKPI label="上次维修时间" value={maintMetrics.lastRep} icon={<HistoryIcon className="text-gray-500" size={18} />} desc="最近一次故障修复日期" />
            <MaintKPI label="下次维保时间" value={maintMetrics.nextMaint} icon={<CalendarDays className="text-orange-500" size={18} />} isUrgent={new Date(maintMetrics.nextMaint) < new Date('2024-06-01')} desc="计划预防性维护日期" />
            <MaintKPI label="区间维保总投入" value={`￥${maintMetrics.totalMaintCost}w`} icon={<Calculator className="text-green-600" size={18} />} desc="含配件更换及第三方维保费" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
               <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">维保费用支出趋势</h4>
               <div className="h-52">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={maintTrendData}>
                     <defs>
                       <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="万元" />
                     <Tooltip formatter={(value: number) => [`${value} 万元`, maintCostType === 'cumulative' ? '累计费用' : '单次费用']} />
                     <Area type="monotone" dataKey="value" name={maintCostType === 'cumulative' ? '累计费用' : '单次费用'} stroke="#3b82f6" strokeWidth={2} fill="url(#colorMaint)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
               <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">关键部件磨损预估</h4>
               <div className="space-y-5">
                 {wearComponents.map((comp, idx) => (
                   <WearItem key={comp.uniqueId} label={comp.label} percent={comp.percent} status={comp.status} />
                 ))}
                 <p className="text-[10px] text-gray-400 italic mt-4">数据基于设备运行小时数及HIS业务载荷模型推算</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center">
                  <Zap size={14} className="mr-1.5 text-yellow-500" /> 设备能耗成本统计 (水电)
                </h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="元" />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="elec" name="电费" stackId="a" fill="#fbbf24" radius={[0, 0, 4, 4]} barSize={24} />
                      <Bar dataKey="water" name="水费" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full flex justify-between items-start mb-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                      <Clock size={14} className="mr-1.5 text-indigo-500" /> 设备全生命周期时钟
                    </h4>
                    {/* 当全局选中“全科室”时，提供局部切换具体设备的下拉框 */}
                    {selectedEquipId === 'all' && (
                        <div className="relative">
                            <select 
                                value={lifecycleEquipId}
                                onChange={(e) => setLifecycleEquipId(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-lg text-[10px] font-bold px-2 py-1 pr-6 outline-none focus:border-indigo-300 text-gray-600 max-w-[120px] truncate cursor-pointer shadow-sm"
                            >
                                {DEPARTMENTS[selectedDept].equipments.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={10} />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="relative w-48 h-48">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadialBarChart innerRadius="80%" outerRadius="100%" barSize={10} data={[{ name: '已使用', value: lifecycleData.used, fill: '#f59e0b' }]} startAngle={180} endAngle={0}>
                       <PolarAngleAxis type="number" domain={[0, lifecycleData.total]} angleAxisId={0} tick={false} />
                       <RadialBar background dataKey="value" cornerRadius={10} />
                     </RadialBarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 text-center">
                      <p className="text-3xl font-black text-gray-800">{lifecycleData.used}<span className="text-sm text-gray-400 font-bold">年</span></p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">已服役时长</p>
                   </div>
                </div>
                <div className="w-full mt-4 flex justify-between items-center text-xs font-bold text-gray-500 px-4">
                   <span>购入: {lifecycleData.purchaseDate}</span>
                   <span className="text-indigo-600">预期寿命: {lifecycleData.total}年</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic text-center w-full px-2 truncate">
                  {lifecycleData.name} - 剩余寿命: {lifecycleData.remaining} 年
                </p>
             </div>
          </div>
        </div>

        {/* 设备故障统计分析 */}
        <div className="p-8 bg-gray-50/10 border-b">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={20} />
              设备故障统计分析
            </h3>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowFailureDetail(true)}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex items-center shadow-sm"
              >
                查看明细 <FileSearch size={14} className="ml-1.5" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                故障率环比上涨 0.2%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FailureKPI label="运行故障率" value={`${failureMetrics.failureRate}%`} icon={<ZapOff className="text-red-500" size={18} />} status={failureMetrics.failureRate > 4 ? 'urgent' : 'normal'} desc="周期内故障工单数 / 总运行小时" />
            <FailureKPI label="故障总次数" value={failureMetrics.totalFailures} unit="次" icon={<AlertCircle className="text-orange-500" size={18} />} desc="各等级故障记录汇总" />
            <FailureKPI label="平均故障间隔 (MTBF)" value={failureMetrics.mtbf} unit="天" icon={<Stethoscope className="text-blue-500" size={18} />} desc="设备可靠性动态评分基础项" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest w-full">故障严重程度分布</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={failureMetrics.severityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {failureMetrics.severityData.map((_, index) => <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex space-x-6 mt-4">
                {failureMetrics.severityData.map((s, i) => (
                  <div key={i} className="flex items-center text-[10px] font-bold">
                    <div className="w-2 h-2 rounded-full mr-1.5" style={{ background: SEVERITY_COLORS[i] }}></div>
                    <span className="text-gray-500">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">多发故障类型排查</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failureMetrics.failureTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1e293b' }} width={120} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 italic mt-4 text-center">统计排名前三的典型故障，用于优化维保策略</p>
            </div>
          </div>
        </div>

        {/* 资产合规情况统计 */}
        <div className="p-8 bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Shield className="mr-2 text-indigo-600" size={20} />
              资产合规情况统计
            </h3>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowComplianceDetail(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center shadow-sm"
              >
                查看明细 <FileSearch size={14} className="ml-1.5" />
              </button>
              <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                综合合规得分: 97.8
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ComplianceKPI label="资质核查覆盖率" value="100" unit="%" icon={<FileCheck className="text-green-500" size={18} />} />
            <ComplianceKPI label="存储环境合规率" value="96.2" unit="%" icon={<Thermometer className="text-blue-500" size={18} />} />
            <ComplianceKPI label="保养计划执行率" value="97.4" unit="%" icon={<CheckCircle2 className="text-indigo-500" size={18} />} />
            <ComplianceKPI label="资产平均保值率" value="88.5" unit="%" icon={<TrendingUp className="text-orange-500" size={18} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                  <Verified size={14} className="mr-2 text-green-500" />
                  资质资质与环境合规监管
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-white rounded-xl border border-gray-100 flex flex-col">
                     <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">国标三证状态</span>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">全部齐全</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                     </div>
                   </div>
                   <div className="p-4 bg-white rounded-xl border border-gray-100 flex flex-col">
                     <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">存储环境流水</span>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">24.2°C / 45%</span>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">耗材滥用/浪费风险预警</span>
                      <p className="text-[9px] text-gray-400 mt-0.5">基于 HIS 计费与实际领用比对偏差</p>
                    </div>
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">低风险</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '12%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>正常消耗偏差 &lt; 2%</span>
                    <span>风险点: 0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                  <Award size={14} className="mr-2 text-orange-500" />
                  维保授权及资产保值分析
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div>
                       <div className="flex justify-between text-[10px] font-bold mb-1.5">
                         <span className="text-gray-500 uppercase">厂商授权维保比例</span>
                         <span className="text-indigo-600">98.4%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500" style={{ width: '98.4%' }}></div>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-bold mb-1.5">
                         <span className="text-gray-500 uppercase">资产当前残值预估</span>
                         <span className="text-blue-600">88.5%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: '88.5%' }}></div>
                       </div>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed italic">
                      * 保值率基于维保投入、运行载荷与零部件原厂率综合计算。
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={complianceMetrics.historyRetention}>
                          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">资产保值趋势曲线</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-600">
              <ShieldCheck size={18} className="text-green-500" />
              <p className="text-[11px] font-medium">全院资产合规核查：<span className="text-green-600 font-bold">已通过</span>。各项指标均优于国家及行业推荐标准。</p>
            </div>
            <button 
              onClick={() => setShowAuditReport(true)}
              className="px-4 py-1.5 border border-gray-200 hover:bg-white text-gray-500 text-[10px] font-bold rounded-lg transition-all shadow-sm"
            >
              生成合规自查报告
            </button>
          </div>
        </div>
      </div>

      {/* 使用明细弹窗 */}
      {showUsageDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUsageDetail(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl mr-4">
                  <FileSearch size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">设备使用详细记录</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedEquipId === 'all' ? DEPARTMENTS[selectedDept].label + ' 全科室汇总' : currentEquip?.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowUsageDetail(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b">
                    <th className="px-4 py-3">流水号</th>
                    <th className="px-4 py-3">使用时间</th>
                    <th className="px-4 py-3">检查项目</th>
                    <th className="px-4 py-3">操作人员</th>
                    <th className="px-4 py-3">患者ID</th>
                    <th className="px-4 py-3 text-right">时长/次数</th>
                    <th className="px-4 py-3 text-right">产生营收</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...Array(10)].map((_, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 font-mono text-[11px] text-gray-400">REC-2024-051{i}</td>
                      <td className="px-4 py-4 font-medium text-gray-600">2024-05-15 10:{i}2</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{chartData[i % chartData.length].name}分析</td>
                      <td className="px-4 py-4 text-gray-500 text-xs">张三(工号:00{i+1})</td>
                      <td className="px-4 py-4 font-mono text-[11px] text-gray-400">P-88220{i}</td>
                      <td className="px-4 py-4 text-right font-bold text-gray-600">1</td>
                      <td className="px-4 py-4 text-right font-bold text-blue-600">￥420.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t bg-gray-50/50 flex justify-between items-center">
              <p className="text-xs text-gray-400 font-medium">展示最近 50 条流水数据，更多数据请前往 HIS 明细查询模块</p>
              <button 
                onClick={() => setShowUsageDetail(false)}
                className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 故障明细弹窗 */}
      {showFailureDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFailureDetail(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center">
                <div className="p-2.5 bg-red-600 text-white rounded-xl mr-4">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">设备故障详细记录</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedEquipId === 'all' ? DEPARTMENTS[selectedDept].label + ' 全科室汇总' : currentEquip?.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowFailureDetail(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b">
                    <th className="px-4 py-3">故障编号</th>
                    <th className="px-4 py-3">发现时间</th>
                    <th className="px-4 py-3">受检设备</th>
                    <th className="px-4 py-3">故障类型</th>
                    <th className="px-4 py-3">严重程度</th>
                    <th className="px-4 py-3">响应状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...Array(8)].map((_, i) => (
                    <tr key={i} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-4 py-4 font-mono text-[11px] text-gray-400">ERR-2024-00{i+1}</td>
                      <td className="px-4 py-4 font-medium text-gray-600 text-xs">2024-05-1{i} 08:30</td>
                      <td className="px-4 py-4 font-bold text-gray-700">
                        {selectedEquipId === 'all' 
                          ? DEPARTMENTS[selectedDept].equipments[i % DEPARTMENTS[selectedDept].equipments.length].name 
                          : currentEquip?.name}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {failureMetrics.failureTypeData[i % failureMetrics.failureTypeData.length]?.name || '其他硬件异常'}
                      </td>
                      <td className="px-4 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                           i % 3 === 2 ? 'bg-red-50 text-red-600 border-red-100' : 
                           i % 3 === 1 ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                           'bg-blue-50 text-blue-600 border-blue-100'
                         }`}>
                           {failureMetrics.severityData[i % 3]?.name || '未知等级'}
                         </span>
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex items-center text-xs font-black text-blue-600">
                           <RefreshCcw size={12} className="mr-1 animate-spin-slow" /> 
                           {i % 2 === 0 ? '维修中' : '待派发'}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t bg-gray-50/50 flex justify-between items-center">
              <p className="text-xs text-gray-400 font-medium">故障详情已同步至工单管理系统，可点击故障编号进入工单流转页面</p>
              <button 
                onClick={() => setShowFailureDetail(false)}
                className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 资产合规明细弹窗 */}
      {showComplianceDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowComplianceDetail(false)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center">
                <div className="p-2.5 bg-white/20 text-white rounded-xl mr-4">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">资产合规及保值明细看板</h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {selectedEquipId === 'all' ? DEPARTMENTS[selectedDept].label + ' 资产群合规审计' : currentEquip?.name + ' 合规档案'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowComplianceDetail(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 scrollbar-hide">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 资质与证书状态 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Verified size={14} className="mr-2 text-green-500" /> 证书与资质状态核查
                  </h4>
                  <div className="space-y-3">
                    <ComplianceRow label="医疗器械注册证 (三证)" status="valid" value="有效" />
                    <ComplianceRow label="辐射安全许可证" status="valid" value="有效 (至2026)" />
                    <ComplianceRow label="计量器检定合格证" status="warning" value="30天内到期" />
                    <ComplianceRow label="特种设备作业证" status="valid" value="持证上岗" />
                  </div>
                </div>
                {/* 环境监测流水 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Thermometer size={14} className="mr-2 text-blue-500" /> 环境监测 24h 波动流水
                  </h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { t: '00:00', v: 23.5 }, { t: '04:00', v: 23.2 }, { t: '08:00', v: 24.1 },
                        { t: '12:00', v: 24.8 }, { t: '16:00', v: 24.5 }, { t: '20:00', v: 23.9 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                    <span>平均温度: 24.1°C</span>
                    <span className="text-green-500">符合标准范围 (22-26°C)</span>
                  </div>
                </div>
              </div>

              {/* 资产明细表 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h4 className="text-sm font-bold text-gray-700 uppercase">资产单机合规及保值明细</h4>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b whitespace-nowrap">
                      <th className="px-6 py-4">资产名称/ID</th>
                      <th className="px-6 py-4">保养计划执行</th>
                      <th className="px-6 py-4">厂商授权率</th>
                      <th className="px-6 py-4">运行小时数</th>
                      <th className="px-6 py-4">当前健康评分</th>
                      <th className="px-6 py-4">资产保值结论</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(selectedEquipId === 'all' ? DEPARTMENTS[selectedDept].equipments : [currentEquip]).map((eq: any, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-800">{eq?.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{eq?.id}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center space-x-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-green-600">100%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">98% 授权</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                          {Math.round(Math.random() * 5000 + 1000)}h
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center space-x-1">
                              <Award size={12} className="text-orange-500" />
                              <span className="font-black text-gray-700">92.4</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-blue-600 border-b border-blue-200 border-dashed">稳健增值型</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-400 font-medium">
                <ShieldAlert size={14} className="mr-1.5 text-indigo-500" /> 
                合规明细数据已通过院内审计系统核验
              </div>
              <button 
                onClick={() => setShowComplianceDetail(false)}
                className="px-8 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                完成审计查看
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 合规自查报告预览弹窗 */}
      {showAuditReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAuditReport(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
             <div className="px-8 py-6 border-b flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center space-x-3">
                 <div className="p-2 bg-indigo-600 text-white rounded-lg"><ClipboardList size={24} /></div>
                 <div>
                   <h3 className="text-lg font-black text-gray-800 tracking-tight">资产合规自查报告预览</h3>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">医院资产合规审计报告</p>
                 </div>
               </div>
               <div className="flex items-center space-x-2">
                 <button className="p-2 text-gray-400 hover:text-indigo-600 transition-all"><Printer size={20}/></button>
                 <button onClick={() => setShowAuditReport(false)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><X size={24}/></button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 scrollbar-hide">
                <div className="max-w-[800px] mx-auto bg-white border border-gray-200 shadow-xl rounded-sm p-12 min-h-[1000px] relative overflow-hidden">
                   {/* 背景水印装饰 */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none">
                      <Shield size={600} />
                   </div>

                   {/* 报告页眉 */}
                   <div className="text-center border-b-4 border-double border-gray-900 pb-8 mb-10">
                      <h1 className="text-2xl font-black tracking-[0.2em] text-gray-900 mb-2">资产管理中心合规性月度自查报告</h1>
                      <div className="flex justify-center items-center space-x-4 text-[10px] font-bold text-gray-500">
                         <span>报告编号：审计-2024-05-182</span>
                         <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                         <span>生成日期：{new Date().toLocaleDateString()}</span>
                      </div>
                   </div>

                   {/* 1. 审计摘要 */}
                   <section className="mb-10">
                      <div className="flex items-center space-x-2 mb-4">
                         <div className="w-1 h-4 bg-gray-900"></div>
                         <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">一、审计概况与综合评分</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                         <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                               <span className="text-xs text-gray-500 font-bold">审计对象：</span>
                               <span className="text-xs text-gray-800 font-black">{DEPARTMENTS[selectedDept].label} 资产群</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                               <span className="text-xs text-gray-500 font-bold">核查资产总数：</span>
                               <span className="text-xs text-gray-800 font-black">{selectedEquipId === 'all' ? DEPARTMENTS[selectedDept].equipments.length : 1} 台/套</span>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-xs text-gray-500 font-bold">合规状态：</span>
                               <span className="text-xs text-green-600 font-black flex items-center"><BadgeCheck size={14} className="mr-1"/> 审核通过</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-center justify-center border-l border-gray-200">
                            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">综合合规指数</span>
                            <span className="text-4xl font-black text-indigo-600">97.8</span>
                            <span className="text-[10px] text-indigo-400 font-bold mt-1 tracking-tighter">高于院内基准线 95.0</span>
                         </div>
                      </div>
                   </section>

                   {/* 2. 维度雷达分析 */}
                   <section className="mb-10">
                      <div className="flex items-center space-x-2 mb-4">
                         <div className="w-1 h-4 bg-gray-900"></div>
                         <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">二、多维度指标分布</h4>
                      </div>
                      <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                               { subject: '资质证照', A: 100, B: 100 },
                               { subject: '存储环境', A: 96, B: 100 },
                               { subject: '计划执行', A: 98, B: 100 },
                               { subject: '保值潜力', A: 88, B: 100 },
                               { subject: '授权维保', A: 94, B: 100 },
                            ]}>
                               <PolarGrid stroke="#e2e8f0" />
                               <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold'}} />
                               <Radar name="当前得分" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                               <Tooltip />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                   </section>

                   {/* 3. 详细审计意见 */}
                   <section className="mb-10">
                      <div className="flex items-center space-x-2 mb-4">
                         <div className="w-1 h-4 bg-gray-900"></div>
                         <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">三、分项审计结论与优化建议</h4>
                      </div>
                      <div className="space-y-4 text-xs">
                         <AuditOpinionItem 
                           idx="1" 
                           title="资质证照合规性" 
                           content="核查范围内所有医疗器械注册证均处于有效期内。发现 1 项计量合格证将于 30 日内到期，系统已自动触发预警，请相关科室及时办理续期。" 
                           status="优"
                         />
                         <AuditOpinionItem 
                           idx="2" 
                           title="环境监控审计" 
                           content="环境监测流水显示温湿度波动处于标准范围内（误差 <±1.2%）。ICU 机房夜间电力环境存在 0.1s 瞬时波峰，建议评估 UPS 电池充放电周期。" 
                           status="良"
                         />
                         <AuditOpinionItem 
                           idx="3" 
                           title="资产保值与预防维护" 
                           content="厂商授权维保比例达到 98.4%，核心资产残值预估符合预期曲线。下月建议重点关注 GE 螺旋CT 球管寿命，建议增加一次非侵入式校准。" 
                           status="优"
                         />
                      </div>
                   </section>

                   {/* 4. 底部签章区 */}
                   <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between">
                      <div className="space-y-4">
                         <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-400">核准人：</span>
                            <div className="w-32 h-8 border-b border-gray-200 flex items-end justify-center font-mono font-bold text-sm italic">系统自动审计</div>
                         </div>
                         <div className="text-[10px] text-gray-400 font-medium">
                            * 本报告由医院资产效益统计系统自动生成，经院内审计协议保护。
                         </div>
                      </div>
                      <div className="relative">
                         {/* 模拟电子章 */}
                         <div className="w-24 h-24 border-4 border-red-600/60 rounded-full flex items-center justify-center rotate-[-15deg] pointer-events-none">
                            <div className="text-center">
                               <p className="text-[10px] font-black text-red-600/60 tracking-tighter uppercase leading-none">设备资产审计</p>
                               <div className="my-1 border-t border-red-600/60"></div>
                               <p className="text-xs font-black text-red-600/60">审计通过</p>
                               <p className="text-[8px] font-bold text-red-600/60 tracking-tighter">{new Date().toISOString().slice(0,10)}</p>
                            </div>
                         </div>
                         <div className="absolute -top-4 -right-4">
                            <Stamp size={48} className="text-red-500/10" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 border-t bg-white flex justify-between items-center shrink-0">
               <div className="flex items-center text-xs text-gray-400 font-bold italic">
                 <ShieldAlert size={14} className="mr-2 text-indigo-500" /> 该报表仅限内部资产审计用途，严禁泄露核心收益数据
               </div>
               <div className="flex space-x-4">
                 <button onClick={() => setShowAuditReport(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">
                    取消
                 </button>
                 <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-100 flex items-center hover:bg-indigo-700 transition-all active:scale-95">
                    <Download size={18} className="mr-2" /> 导出加密报表
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 审计报告辅助组件 ---

const AuditOpinionItem = ({ idx, title, content, status }: any) => (
  <div className="flex space-x-4 p-4 hover:bg-gray-50 transition-colors">
     <div className="shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-[10px]">{idx}</div>
     <div className="flex-1 space-y-1.5">
        <div className="flex justify-between items-center">
           <span className="text-xs font-black text-gray-800">{title}</span>
           <span className={`text-[10px] font-black px-2 py-0.5 rounded ${status === '优' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>评级：{status}</span>
        </div>
        <p className="text-gray-500 leading-relaxed font-medium">{content}</p>
     </div>
  </div>
);

// --- 子组件定义 ---

const ComplianceRow = ({ label, status, value }: { label: string, status: 'valid' | 'warning' | 'invalid', value: string }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
    <span className="text-xs font-bold text-gray-600">{label}</span>
    <div className="flex items-center">
      <span className={`text-[10px] font-black mr-2 ${status === 'valid' ? 'text-green-600' : 'text-orange-600'}`}>{value}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'valid' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
    </div>
  </div>
);

const KPIItem = ({ title, value, unit, isUp, icon }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline space-x-1 mt-2">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {unit && <span className="text-xs text-gray-400 font-bold">{unit}</span>}
      </div>
      <div className={`flex items-center text-[10px] font-bold mt-2 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
        {isUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
        较同期波动
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-2xl">{icon}</div>
  </div>
);

const FinanceStat = ({ label, value, desc, icon, highlight }: any) => (
  <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20' : 'bg-gray-50'}`}>
        {React.cloneElement(icon as any, { className: highlight ? 'text-white' : (icon as any).props.className })}
      </div>
      {highlight && <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded font-bold uppercase tracking-tight">核心指标</span>}
    </div>
    <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-blue-100' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-xl font-bold mt-1.5 ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    <p className={`text-[10px] mt-2 italic leading-tight ${highlight ? 'text-blue-100' : 'text-gray-400'}`}>*{desc}</p>
  </div>
);

const MaintKPI = ({ label, value, unit, icon, desc, isUrgent }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      {isUrgent && <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold animate-pulse border border-red-100">近期需关注</span>}
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
    <div className="flex items-baseline mt-1">
      <h4 className={`text-lg font-bold ${isUrgent ? 'text-orange-600' : 'text-gray-800'}`}>{value}</h4>
      {unit && <span className="text-[10px] text-gray-400 ml-1">{unit}</span>}
    </div>
    <p className="text-[9px] text-gray-400 mt-2 font-medium">*{desc}</p>
  </div>
);

const FailureKPI = ({ label, value, unit, icon, status, desc }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
    <div className="p-2 bg-gray-50 rounded-xl text-gray-600 w-fit mb-3">{icon}</div>
    <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
    <div className="flex items-baseline mt-1">
      <h4 className={`text-xl font-bold ${status === 'urgent' ? 'text-red-600' : 'text-gray-800'}`}>{value}</h4>
      {unit && <span className="text-xs text-gray-400 ml-1 font-bold">{unit}</span>}
    </div>
    <p className="text-[9px] text-gray-400 mt-2 font-medium">*{desc}</p>
    {status === 'urgent' && <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>}
  </div>
);

const ComplianceKPI = ({ label, value, unit, icon }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors">
    <div className="p-2 bg-gray-50 rounded-lg w-fit mb-3">{icon}</div>
    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
    <div className="flex items-baseline">
      <h4 className="text-lg font-black text-gray-800">{value}</h4>
      <span className="text-[10px] font-bold text-gray-400 ml-0.5">{unit}</span>
    </div>
  </div>
);

interface WearItemProps {
  label: string;
  percent: number;
  status: 'normal' | 'warning' | 'urgent';
}

const WearItem: React.FC<WearItemProps> = ({ label, percent, status }) => {
  const colorClass = status === 'urgent' ? 'bg-red-500' : status === 'warning' ? 'bg-orange-500' : 'bg-blue-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-gray-700">{label}</span>
        <span className={status === 'urgent' ? 'text-red-500' : 'text-gray-400'}>{percent}% 可用度</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

const BenefitAlert = ({ type, title, content }: { type: 'success' | 'warning', title: string, content: string }) => (
  <div className={`p-4 rounded-xl border flex items-start space-x-3 ${type === 'success' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
    <div className={`mt-0.5 ${type === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
      <AlertCircle size={16} />
    </div>
    <div>
      <h5 className={`text-xs font-bold ${type === 'success' ? 'text-green-800' : 'text-orange-800'}`}>{title}</h5>
      <p className={`text-[11px] mt-1 leading-relaxed ${type === 'success' ? 'text-green-700' : 'text-orange-700'}`}>{content}</p>
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, children }: any) => (
  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
    <span className="text-[11px] font-bold text-gray-400">{label}:</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm font-bold text-gray-700 bg-transparent outline-none cursor-pointer">
      {children}
    </select>
  </div>
);

const HistoryIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-7.38 3.25L3 7v-5"/>
  </svg>
);

export default EquipmentBenefit;
