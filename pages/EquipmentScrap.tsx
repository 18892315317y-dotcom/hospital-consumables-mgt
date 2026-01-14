
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  AlertTriangle, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Archive, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  X, 
  Send, 
  Download,
  Info,
  History,
  ShieldAlert,
  DollarSign,
  Monitor,
  ShieldCheck,
  Save,
  User,
  Building2,
  Box,
  Coins,
  Calendar,
  Check,
  Printer,
  Stamp,
  BadgeCheck,
  FileSearch,
  Scale,
  Zap,
  TrendingUp,
  // Fix: Added missing import for ChevronRight used in line 248
  ChevronRight
} from 'lucide-react';

type ScrapTab = 'scrap-mgt' | 'to-dispose' | 'archived';

interface ScrapRecord {
  id: string;
  name: string;
  model: string;
  dept: string;
  purchaseDate: string;
  amount: number;
  expectedLife: number;
  actualLife: number;
  status: 'draft' | 'approving' | 'disposing' | 'completed';
  applicant?: string;
  type?: string;
  reason?: string;
  suggestion?: string; // 申请时的处置建议
  scrapDate?: string;
  isDisposed?: boolean; // 是否已录入处置信息
  disposalInfo?: {
    method: string; // 实际处置方式
    residualValue: number;
    date: string;
    operator: string;
    remark: string;
  };
  auditChain?: { node: string; user: string; time: string; comment: string; status: 'done' | 'pending' }[];
}

// 模拟设备资产库数据，用于三级联动
const DEPT_CATEGORIES = ['临床科室', '医技科室'];
const DEPT_MAP: Record<string, string[]> = {
  '临床科室': ['心内科', '骨科', 'ICU', '呼吸内科'],
  '医技科室': ['影像中心', '检验科', '超声室', '内镜中心']
};

const ASSET_DB: Record<string, ScrapRecord[]> = {
  '影像中心': [
    { id: 'EQ-IMG-CT-001', name: 'GE 螺旋CT', model: 'Optima 660', dept: '影像中心', purchaseDate: '2015-05-12', amount: 4500000, expectedLife: 10, actualLife: 9.5, status: 'draft' },
    { id: 'EQ-IMG-CT-002', name: 'GE 螺旋CT', model: 'Optima 660', dept: '影像中心', purchaseDate: '2018-08-20', amount: 4800000, expectedLife: 10, actualLife: 6.2, status: 'draft' },
  ],
  'ICU': [
    { id: 'EQ-ICU-VEN-05', name: '德尔格呼吸机', model: 'Evita V500', dept: 'ICU', purchaseDate: '2016-11-10', amount: 350000, expectedLife: 8, actualLife: 8.1, status: 'draft' },
  ]
};

const EquipmentScrap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScrapTab>('scrap-mgt');
  const [showApplyModal, setShowApplyModal] = useState<ScrapRecord | null>(null);
  const [showDisposalModal, setShowDisposalModal] = useState<ScrapRecord | null>(null);
  const [viewReport, setViewReport] = useState<ScrapRecord | null>(null);
  const [hoverStatusId, setHoverStatusId] = useState<string | null>(null);

  // 联动选择状态
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // 初始模拟数据
  const [mockData, setMockData] = useState<ScrapRecord[]>([
    { id: 'EQ-8820', name: 'GE 螺旋CT', model: 'Optima 660', dept: '影像中心', purchaseDate: '2012-05-12', amount: 4500000, expectedLife: 10, actualLife: 12, status: 'draft', applicant: '王医生', suggestion: '公开拍卖' },
    { id: 'EQ-1002', name: '全自动生化分析仪', model: 'Cobas 8000', dept: '检验科', purchaseDate: '2015-08-20', amount: 1200000, expectedLife: 8, actualLife: 8.5, status: 'approving', type: '技术性报废', applicant: '张技师', suggestion: '厂商回购', auditChain: [
      { node: '科室主任审批', user: '林主任', time: '2024-05-10 09:00', comment: '同意报废。', status: 'done' },
      { node: '资产处复核', user: '张科长', time: '--', comment: '', status: 'pending' }
    ] },
    { id: 'EQ-0922', name: '德尔格呼吸机', model: 'Evita V500', dept: 'ICU', purchaseDate: '2016-10-01', amount: 350000, expectedLife: 8, actualLife: 7.5, status: 'disposing', type: '损坏报废', reason: '主板烧毁，无维修价值', applicant: '李护士', isDisposed: false, suggestion: '拆解留用' },
    { id: 'EQ-0955', name: '迈瑞监护仪', model: 'N22', dept: '心内科', purchaseDate: '2018-03-12', amount: 82000, expectedLife: 5, actualLife: 6.1, status: 'disposing', type: '超期报废', applicant: '张医生', isDisposed: true, suggestion: '公开拍卖', disposalInfo: {
        method: '公开拍卖',
        residualValue: 12500,
        date: '2024-05-18',
        operator: '资产科-周工',
        remark: '经评估残值符合市场预期。'
    }},
    { id: 'EQ-0051', name: '离心机', model: 'Sigma 6-16K', dept: '检验科', purchaseDate: '2013-02-15', amount: 150000, expectedLife: 8, actualLife: 11, status: 'completed', applicant: '赵主任', reason: '老化严重', suggestion: '危废无害化处置', scrapDate: '2024-04-10', isDisposed: true, disposalInfo: {
        method: '危废无害化处置',
        residualValue: 0,
        date: '2024-04-09',
        operator: '资产科',
        remark: '已交由专业资质公司处理'
    }},
  ]);

  const filteredData = useMemo(() => {
    switch (activeTab) {
      case 'scrap-mgt': return mockData.filter(d => d.status === 'draft' || d.status === 'approving');
      case 'to-dispose': return mockData.filter(d => d.status === 'disposing');
      case 'archived': return mockData.filter(d => d.status === 'completed');
      default: return [];
    }
  }, [activeTab, mockData]);

  const handleInitiateNew = () => {
    setSelectedCat('');
    setSelectedDept('');
    setShowApplyModal({
      id: '', name: '', model: '', dept: '', purchaseDate: '', amount: 0, expectedLife: 0, actualLife: 0, status: 'draft', applicant: '超级管理员', suggestion: '公开拍卖'
    });
  };

  const handleSaveModal = (status: 'draft' | 'approving') => {
    if (!showApplyModal || !showApplyModal.id) return;
    setMockData(prev => {
      const exists = prev.find(d => d.id === showApplyModal.id);
      if (exists) return prev.map(d => d.id === showApplyModal.id ? { ...showApplyModal, status } : d);
      return [...prev, { ...showApplyModal, status }];
    });
    setShowApplyModal(null);
  };

  const handleSaveDisposal = (isArchive: boolean) => {
    if (!showDisposalModal) return;
    setMockData(prev => prev.map(d => {
      if (d.id === showDisposalModal.id) {
        return { 
          ...showDisposalModal, 
          status: isArchive ? 'completed' : 'disposing', 
          isDisposed: true,
          scrapDate: isArchive ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return d;
    }));
    setShowDisposalModal(null);
  };

  // 统计数据
  const scrapReasonStats = [
    { name: '技术落后', value: 45 }, { name: '超期服役', value: 35 }, { name: '损毁报废', value: 15 }, { name: '政策淘汰', value: 5 }
  ];
  const deptRankStats = [
    { name: '影像', value: 12 }, { name: '检验', value: 8 }, { name: 'ICU', value: 6 }, { name: '急诊', value: 4 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const currentEquipments = useMemo(() => {
    return (selectedDept && ASSET_DB[selectedDept]) || [];
  }, [selectedDept]);

  return (
    <div className="p-6 space-y-6">
      {/* 第一层：核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <WarningCard title="超期服役预警" value="12" unit="台" desc="建议进入报废评估" icon={<AlertTriangle className="text-orange-500" />} color="bg-orange-50" />
        <WarningCard title="提前报废异常" value="03" unit="例" desc="服役不足50%年限" icon={<ShieldAlert className="text-red-500" />} color="bg-red-50" />
        <WarningCard title="待处理报废单" value="08" unit="份" desc="当前流程中总计" icon={<Clock className="text-blue-500" />} color="bg-blue-50" />
        <WarningCard title="年度资产回收额" value="￥24.5" unit="w" desc="实物残值回收汇总" icon={<DollarSign className="text-green-500" />} color="bg-green-50" />
      </div>

      {/* 第二层：决策支撑面板（整合后的统计内容） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* 报废分布饼图 */}
         <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 w-full flex items-center">
               <TrendingUp size={12} className="mr-1.5 text-blue-500"/> 报废成因构成
            </h4>
            <div className="h-40 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={scrapReasonStats} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value" stroke="none">
                        {scrapReasonStats.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-2">
               {scrapReasonStats.map((item, idx) => (
                  <div key={item.name} className="flex items-center text-[9px] font-bold text-gray-500">
                     <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{background: COLORS[idx]}}></div>
                     {item.name}
                  </div>
               ))}
            </div>
         </div>

         {/* 科室热度柱图 */}
         <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
               <Building2 size={12} className="mr-1.5 text-indigo-500"/> 报废科室热度排行
            </h4>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptRankStats}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                     <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 智能洞察看板 */}
         <div className="lg:col-span-4 bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Zap size={200} className="text-white" />
            </div>
            <div className="relative z-10 space-y-4">
               <div className="flex items-center space-x-2 text-indigo-200">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">管理决策洞察</span>
               </div>
               <h3 className="text-white text-lg font-black leading-tight">“技术落后”占本年度报废首因 (45%)</h3>
               <p className="text-indigo-100 text-xs leading-relaxed font-medium">
                  数据分析显示报废资产主要集中在影像中心早期数字化机型。建议下一年度采购计划向“全软件定义、可平滑升级”的机型倾斜，预计可将平均经济寿命提升 15-20%。
               </p>
               <button className="flex items-center text-[10px] font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all">
                  查看完整年度报告库 <ChevronRight size={12} className="ml-1" />
               </button>
            </div>
         </div>
      </div>

      {/* 第三层：主控制面板 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex border-b overflow-x-auto scrollbar-hide shrink-0 bg-gray-50/50">
          <TabBtn active={activeTab === 'scrap-mgt'} onClick={() => setActiveTab('scrap-mgt')} label="发起报废" icon={<Trash2 size={16} />} count={mockData.filter(d => d.status === 'draft' || d.status === 'approving').length} />
          <TabBtn active={activeTab === 'to-dispose'} onClick={() => setActiveTab('to-dispose')} label="处置作业" icon={<ShieldCheck size={16} />} count={mockData.filter(d => d.status === 'disposing').length} />
          <TabBtn active={activeTab === 'archived'} onClick={() => setActiveTab('archived')} label="历史归档" icon={<Archive size={16} />} count={mockData.filter(d => d.status === 'completed').length}/>
        </div>

        <div className="p-6 bg-white border-b flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="搜索设备、科室、编号..." className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-gray-700" />
            </div>
            <button className="p-2.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-xl transition-all border border-gray-100"><Filter size={18}/></button>
          </div>
          <div className="flex space-x-3">
            {activeTab === 'scrap-mgt' && (
              <button onClick={handleInitiateNew} className="flex items-center px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95">
                <Plus size={18} className="mr-2" /> 发起报废申请
              </button>
            )}
            <button className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                <Download size={14} className="mr-1.5" /> 导出数据
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-visible">
          <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/30 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                <th className="px-6 py-4 w-32">设备编号</th>
                <th className="px-6 py-4">设备信息</th>
                <th className="px-6 py-4">所属科室</th>
                <th className="px-6 py-4">提报人</th>
                <th className="px-6 py-4">原值</th>
                <th className="px-6 py-4 text-center">服役进度</th>
                <th className="px-6 py-4">当前状态</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4"><span className="text-[10px] font-mono font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.id}</span></td>
                  <td className="px-6 py-4"><p className="font-black text-gray-800">{item.name}</p><p className="text-[10px] font-medium text-gray-400 uppercase">{item.model}</p></td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black">{item.dept}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center space-x-1.5"><div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400"><User size={10} /></div><span className="text-xs font-bold text-gray-600">{item.applicant || '--'}</span></div></td>
                  <td className="px-6 py-4 font-mono font-black text-gray-700">￥{item.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black ${item.actualLife > item.expectedLife ? 'text-orange-500' : 'text-gray-700'}`}>{item.actualLife}y</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-xs text-gray-400 font-bold">{item.expectedLife}y</span>
                      </div>
                      <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className={`h-full ${item.actualLife >= item.expectedLife ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (item.actualLife / item.expectedLife) * 100)}%` }}></div></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      item.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                      item.status === 'approving' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      item.status === 'disposing' ? (item.isDisposed ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100') :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {item.status === 'draft' ? '草稿' : item.status === 'approving' ? '审批中' : item.status === 'disposing' ? (item.isDisposed ? '已录入待归档' : '实物处置中') : '已归档'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-4">
                        {activeTab === 'scrap-mgt' && (
                          item.status === 'draft' ? (
                            <button onClick={() => setShowApplyModal(item)} className="text-blue-600 hover:text-blue-800 font-bold text-xs underline underline-offset-4">编辑</button>
                          ) : (
                            <button className="text-orange-600 hover:text-orange-800 font-bold text-xs underline underline-offset-4">查看详情</button>
                          )
                        )}
                        {activeTab === 'to-dispose' && (
                          <button 
                            onClick={() => setShowDisposalModal({ ...item, disposalInfo: item.disposalInfo || { method: item.suggestion || '公开拍卖', residualValue: 0, date: new Date().toISOString().split('T')[0], operator: '管理员', remark: '' } })}
                            className={`${item.isDisposed ? 'bg-orange-600' : 'bg-red-600'} text-white px-5 py-1.5 rounded-lg font-black text-xs shadow-lg transition-all active:scale-95 flex items-center`}
                          >
                            {item.isDisposed ? <><Archive size={12} className="mr-1.5" /> 加入归档</> : <><Coins size={12} className="mr-1.5" /> 录入处置</>}
                          </button>
                        )}
                        {activeTab === 'archived' && (
                          <button onClick={() => setViewReport(item)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center border border-indigo-100 bg-indigo-50/50 px-3 py-1 rounded-lg">
                            <FileSearch size={14} className="mr-1.5"/> 查看报告
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 报废申请 模态框 */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowApplyModal(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            <div className="px-10 py-8 bg-red-600 text-white flex justify-between items-center shrink-0 shadow-xl">
               <div className="flex items-center space-x-4">
                 <div className="p-3 bg-white/20 rounded-2xl"><Trash2 size={32} /></div>
                 <div>
                   <h3 className="text-2xl font-black tracking-tight">{showApplyModal.id ? '编辑报废申请单' : '发起设备报废申请'}</h3>
                   <p className="text-xs text-red-100 mt-1 uppercase font-bold tracking-widest">资产全生命周期管理环节</p>
                 </div>
               </div>
               <button onClick={() => setShowApplyModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-gray-50/20">
              <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-left">
                <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-red-600 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">1. 选择待报废设备资产</h4></div>
                <div className="grid grid-cols-3 gap-4">
                  <SelectGroup label="科室类型" value={selectedCat} onChange={(v) => { setSelectedCat(v); setSelectedDept(''); }}>{DEPT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</SelectGroup>
                  <SelectGroup label="具体科室" value={selectedDept} onChange={setSelectedDept} disabled={!selectedCat}>{selectedCat && DEPT_MAP[selectedCat].map(d => <option key={d} value={d}>{d}</option>)}</SelectGroup>
                  <SelectGroup label="目标设备" value={showApplyModal.id} onChange={(v) => { const a = ASSET_DB[selectedDept].find(x => x.id === v); if(a) setShowApplyModal({...showApplyModal, ...a}); }} disabled={!selectedDept}>{currentEquipments.map(e => <option key={e.id} value={e.id}>{e.name} (编号: {e.id})</option>)}</SelectGroup>
                </div>
                {showApplyModal.id && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-red-50/30 p-6 rounded-3xl border border-red-100 animate-in fade-in slide-in-from-top-4">
                    <InfoItem label="选定设备" value={showApplyModal.name} /><InfoItem label="资产编号" value={showApplyModal.id} /><InfoItem label="原值金额" value={`￥${showApplyModal.amount.toLocaleString()}`} /><InfoItem label="已用年限" value={`${showApplyModal.actualLife}y`} />
                  </div>
                )}
              </section>

              <section className={`bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-left ${!showApplyModal.id && 'opacity-40 pointer-events-none'}`}>
                <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-red-600 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">2. 报废原因及现状评估</h4></div>
                <div className="grid grid-cols-2 gap-8">
                   <SelectGroup label="报废类型" value={showApplyModal.type} onChange={v => setShowApplyModal({...showApplyModal, type: v})}><option>超期损耗报废</option><option>技术性报废</option><option>损毁报废</option><option>政策性淘汰</option></SelectGroup>
                   <SelectGroup label="处置建议 (申请)" value={showApplyModal.suggestion} onChange={v => setShowApplyModal({...showApplyModal, suggestion: v})}><option>公开拍卖</option><option>拆解留用</option><option>厂商回购</option><option>危废无害化处置</option></SelectGroup>
                   <div className="col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">现状描述及技术鉴定摘要 <span className="text-red-500">*</span></label>
                     <textarea placeholder="请录入设备目前的物理状态、核心故障点、无法维修/升级的鉴定结论..." className="w-full h-32 p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-red-500/10 font-medium"></textarea>
                   </div>
                </div>
              </section>
            </div>

            <div className="p-10 border-t bg-gray-50/50 flex justify-end space-x-4 shrink-0">
               <button onClick={() => setShowApplyModal(null)} className="px-10 py-4 bg-white border border-gray-200 text-gray-500 rounded-[20px] font-black transition-all">取消操作</button>
               {showApplyModal.id && (
                 <>
                  <button onClick={() => handleSaveModal('draft')} className="px-10 py-4 bg-white border border-red-200 text-red-600 rounded-[20px] font-black flex items-center hover:bg-red-50 transition-all"><Save size={18} className="mr-2" /> 存为草稿</button>
                  <button onClick={() => handleSaveModal('approving')} className="px-12 py-4 bg-red-600 text-white rounded-[20px] font-black shadow-2xl flex items-center hover:bg-red-700 transition-all"><Send size={18} className="mr-2" /> 提交审核</button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 处置作业 录入弹窗 */}
      {showDisposalModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDisposalModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
            <div className={`px-10 py-8 ${showDisposalModal.isDisposed ? 'bg-orange-600' : 'bg-red-600'} text-white flex justify-between items-center shrink-0 shadow-xl`}>
               <div className="flex items-center space-x-4">
                 <div className="p-3 bg-white/20 rounded-2xl"><Coins size={32} /></div>
                 <div>
                   <h3 className="text-2xl font-black tracking-tight">{showDisposalModal.isDisposed ? '归档前信息复核' : '录入实物处置结果'}</h3>
                   <p className="text-xs text-white/70 mt-1 uppercase font-bold tracking-widest">{showDisposalModal.name} · {showDisposalModal.id}</p>
                 </div>
               </div>
               <button onClick={() => setShowDisposalModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
            </div>

            <div className="p-10 space-y-8 flex-1 overflow-y-auto scrollbar-hide bg-gray-50/20 text-left">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                     <span className="text-[10px] font-black text-gray-400 uppercase flex items-center"><Scale size={14} className="mr-2"/> 处置方案对照</span>
                     {showDisposalModal.suggestion !== showDisposalModal.disposalInfo?.method && showDisposalModal.isDisposed && (
                       <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded">建议偏离已记录</span>
                     )}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-2">申请时处置建议</p>
                       <p className="text-sm font-black text-gray-500 italic">{showDisposalModal.suggestion || '未录入建议'}</p>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                       <p className="text-[10px] font-black text-blue-400 uppercase mb-2">实际实物处置方式 <span className="text-red-500">*</span></p>
                       <select 
                        disabled={showDisposalModal.isDisposed}
                        value={showDisposalModal.disposalInfo?.method}
                        onChange={(e) => setShowDisposalModal({ ...showDisposalModal, disposalInfo: { ...showDisposalModal.disposalInfo!, method: e.target.value } })}
                        className="w-full bg-transparent text-sm font-black text-blue-800 outline-none cursor-pointer"
                       >
                         <option>公开拍卖</option><option>拆解留用</option><option>厂商回购</option><option>危废处置</option>
                       </select>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">处置残值收入 (￥) <span className="text-red-500">*</span></label>
                    <input type="number" disabled={showDisposalModal.isDisposed} value={showDisposalModal.disposalInfo?.residualValue} onChange={(e) => setShowDisposalModal({ ...showDisposalModal, disposalInfo: { ...showDisposalModal.disposalInfo!, residualValue: parseFloat(e.target.value) } })} className="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">实际处置日期 <span className="text-red-500">*</span></label>
                    <input type="date" disabled={showDisposalModal.isDisposed} value={showDisposalModal.disposalInfo?.date} onChange={(e) => setShowDisposalModal({ ...showDisposalModal, disposalInfo: { ...showDisposalModal.disposalInfo!, date: e.target.value } })} className="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-700" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">处置作业备注</label>
                  <textarea disabled={showDisposalModal.isDisposed} value={showDisposalModal.disposalInfo?.remark} onChange={(e) => setShowDisposalModal({ ...showDisposalModal, disposalInfo: { ...showDisposalModal.disposalInfo!, remark: e.target.value } })} className="w-full h-24 p-4 bg-white border border-gray-100 rounded-[24px] text-sm font-medium outline-none" placeholder="补充残值核算、处置过程描述..."></textarea>
               </div>
            </div>

            <div className="p-10 border-t bg-white flex justify-end space-x-4 shrink-0">
               <button onClick={() => setShowDisposalModal(null)} className="px-10 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black transition-all hover:bg-gray-200">取消</button>
               {showDisposalModal.isDisposed ? (
                 <button onClick={() => handleSaveDisposal(true)} className="px-12 py-4 bg-orange-600 text-white rounded-[20px] font-black shadow-2xl active:scale-95 flex items-center hover:bg-orange-700 transition-all"><Check size={18} className="mr-2" /> 确认无误，正式归档</button>
               ) : (
                 <button onClick={() => handleSaveDisposal(false)} className="px-12 py-4 bg-red-600 text-white rounded-[20px] font-black shadow-2xl active:scale-95 flex items-center hover:bg-red-700 transition-all"><Save size={18} className="mr-2" /> 存为处置记录</button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 历史归档报告 弹窗 */}
      {viewReport && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setViewReport(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] border border-white">
             <div className="px-8 py-6 border-b flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center space-x-3">
                 <div className="p-2 bg-gray-900 text-white rounded-lg"><FileText size={24} /></div>
                 <div>
                   <h3 className="text-lg font-black text-gray-800 tracking-tight">报废处置技术鉴定结论报告</h3>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest tracking-tighter">HOSPITAL ASSET RETIREMENT OFFICIAL REPORT</p>
                 </div>
               </div>
               <div className="flex items-center space-x-2">
                 <button className="p-2 text-gray-400 hover:text-indigo-600 transition-all"><Printer size={20}/></button>
                 <button onClick={() => setViewReport(null)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><X size={24}/></button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-12 bg-gray-100/50 scrollbar-hide text-left font-serif">
                <div className="max-w-[800px] mx-auto bg-white border border-gray-200 shadow-xl rounded-sm p-16 min-h-[1000px] relative overflow-hidden">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none text-[200px] font-black">ARCHIVED</div>
                   
                   <div className="text-center border-b-4 border-double border-gray-900 pb-8 mb-10">
                      <h1 className="text-3xl font-black tracking-[0.2em] text-gray-900 mb-2 underline decoration-gray-300 underline-offset-8">医疗设备报废处置鉴定表</h1>
                      <div className="flex justify-center items-center space-x-4 text-[10px] font-bold text-gray-500 font-sans">
                         <span>报告编号：SR-{viewReport.id}-2024</span>
                         <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                         <span>鉴定日期：{viewReport.scrapDate}</span>
                      </div>
                   </div>

                   <section className="mb-10 font-sans">
                      <div className="flex items-center space-x-2 mb-4"><div className="w-1 h-4 bg-gray-900"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">一、设备资产基本概况</h4></div>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-4 bg-gray-50 p-6 border border-gray-100 rounded-lg text-xs">
                         <div className="flex justify-between"><span className="text-gray-500">设备名称：</span><span className="font-black text-gray-800">{viewReport.name}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">规格型号：</span><span className="font-black text-gray-800">{viewReport.model}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">资产原值：</span><span className="font-black text-gray-800">￥{viewReport.amount.toLocaleString()}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">已用年限：</span><span className="font-black text-gray-800">{viewReport.actualLife} 年</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">管理科室：</span><span className="font-black text-gray-800">{viewReport.dept}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">采购日期：</span><span className="font-black text-gray-800">{viewReport.purchaseDate}</span></div>
                      </div>
                   </section>

                   <section className="mb-10 font-sans">
                      <div className="flex items-center space-x-2 mb-4"><div className="w-1 h-4 bg-gray-900"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">二、鉴定意见与处置对照</h4></div>
                      <div className="space-y-4">
                         <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                               <thead className="bg-gray-100 font-black">
                                  <tr>
                                     <th className="px-4 py-3 border-r border-gray-200 w-1/3">核查项目</th>
                                     <th className="px-4 py-3">具体结论/方式</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-200">
                                  <tr><td className="px-4 py-3 border-r border-gray-200 font-bold bg-gray-50">报废主要原因</td><td className="px-4 py-3">{viewReport.reason || '核心板卡老化，不具备升级价值'}</td></tr>
                                  <tr><td className="px-4 py-3 border-r border-gray-200 font-bold bg-gray-50">申请时建议</td><td className="px-4 py-3 font-black text-gray-500 italic">{viewReport.suggestion}</td></tr>
                                  <tr><td className="px-4 py-3 border-r border-gray-200 font-bold bg-blue-50 text-blue-800">实际处置方式</td><td className="px-4 py-3 font-black text-blue-700 bg-blue-50/30">{viewReport.disposalInfo?.method}</td></tr>
                                  <tr><td className="px-4 py-3 border-r border-gray-200 font-bold bg-gray-50">技术鉴定摘要</td><td className="px-4 py-3 text-gray-500 leading-relaxed font-medium">经医学工程处技术小组现场核验，该资产关键零部件损耗已超预警阈值且安全风险无法通过维保手段消除，建议按程序合规移除实物账目。</td></tr>
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </section>

                   <section className="mb-10 font-sans">
                      <div className="flex items-center space-x-2 mb-4"><div className="w-1 h-4 bg-gray-900"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">三、残值回收及财务结果</h4></div>
                      <div className="flex items-center justify-between p-6 bg-green-50 border border-green-100 rounded-xl">
                         <div>
                            <p className="text-[10px] text-green-600 font-black uppercase mb-1">实到残值金额</p>
                            <p className="text-3xl font-black text-green-700 font-mono">￥{viewReport.disposalInfo?.residualValue.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-green-800 tracking-tight">操作经办：{viewReport.disposalInfo?.operator}</p>
                            <p className="text-[10px] text-green-600 mt-1">财务核销日期：{viewReport.disposalInfo?.date}</p>
                         </div>
                      </div>
                   </section>

                   <div className="mt-24 pt-10 border-t border-gray-100 flex justify-between font-sans">
                      <div className="space-y-6">
                         <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-400">处室签批：</span>
                            <div className="w-32 h-8 border-b border-gray-200 flex items-end justify-center font-mono font-bold text-sm italic tracking-tighter">林xx (自动授信)</div>
                         </div>
                         <div className="text-[10px] text-gray-400 font-medium">
                            * 本鉴定结论受院内资产管理条例保护，作为账目核销依据。
                         </div>
                      </div>
                      <div className="relative">
                         <div className="w-24 h-24 border-4 border-red-600/60 rounded-full flex items-center justify-center rotate-[-15deg] pointer-events-none">
                            <div className="text-center">
                               <p className="text-[10px] font-black text-red-600/60 tracking-tighter uppercase leading-none">资产报废专用</p>
                               <div className="my-1 border-t border-red-600/60"></div>
                               <p className="text-xs font-black text-red-600/60">核准归档</p>
                               <p className="text-[8px] font-bold text-red-600/60 tracking-tighter">{viewReport.scrapDate}</p>
                            </div>
                         </div>
                         <div className="absolute -top-4 -right-4 text-red-500/10"><Stamp size={48} /></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 border-t bg-white flex justify-between items-center shrink-0">
               <div className="flex items-center text-xs text-gray-400 font-bold italic"><BadgeCheck size={14} className="mr-2 text-green-500" /> 已通过全流程数字化审计</div>
               <button onClick={() => setViewReport(null)} className="px-12 py-4 bg-gray-900 text-white rounded-[20px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center">
                  <Download size={18} className="mr-2" /> 下载加密报告 (PDF)
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 辅助小组件 ---

const TabBtn = ({ active, onClick, label, icon, count }: any) => (
  <button onClick={onClick} className={`flex items-center space-x-2 px-10 py-5 border-b-2 transition-all font-bold text-sm shrink-0 ${active ? 'border-blue-600 text-blue-600 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
    {icon}<span>{label}</span>
    {count !== undefined && <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-400'}`}>{count}</span>}
  </button>
);

const WarningCard = ({ title, value, unit, desc, icon, color }: any) => (
  <div className={`p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-start justify-between transition-all hover:shadow-md ${color}`}>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-baseline space-x-1 mt-2 font-mono"><span className="text-3xl font-black text-gray-800">{value}</span><span className="text-xs text-gray-400 font-bold">{unit}</span></div>
      <p className="text-[9px] text-gray-400 font-bold mt-1.5 leading-none">*{desc}</p>
    </div>
    <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-50">{icon}</div>
  </div>
);

const InfoItem = ({ label, value }: any) => (
  <div className="text-left">
    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
    <p className="text-sm font-black text-gray-800 break-words">{value || '--'}</p>
  </div>
);

const SelectGroup = ({ label, value, onChange, children, disabled }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">{label}</label>
    <select disabled={disabled} value={value} onChange={e => onChange(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 appearance-none cursor-pointer transition-all">
      <option value="">请选择项目...</option>{children}
    </select>
  </div>
);

export default EquipmentScrap;
