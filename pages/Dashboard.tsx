
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { MenuKey } from '../types';
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  ShoppingCart, 
  FileText, 
  Zap, 
  Search, 
  Filter, 
  MessageSquare, 
  UserCheck, 
  ClipboardList, 
  History,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Eye,
  X,
  Building2,
  Calendar
} from 'lucide-react';

type ProcurementType = 'normal' | 'emergency';

const Dashboard: React.FC<{ subKey: MenuKey }> = ({ subKey }) => {
  const isVBP = subKey === 'dash-vbp';
  const [procType, setProcType] = useState<ProcurementType>('normal');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 模拟审计数据
  const normalRecords = [
    { id: 'REQ-202405-001', dept: '心内科', applicant: '张医生', time: '2024-05-10', amount: 125000, status: '已通过', reason: '第三季度集采耗材常规补库', drugs: '阿托伐他汀等12项', comments: '符合季度用量波动预期，准予通过。' },
    { id: 'REQ-202405-004', dept: '儿科', applicant: '李护士长', time: '2024-05-12', amount: 48000, status: '已通过', reason: '夏季流行病高峰期预备用药', drugs: '布地奈德等5项', comments: '临床申请依据充分，同意采购。' },
    { id: 'REQ-202405-012', dept: '骨科', applicant: '王主任', time: '2024-05-14', amount: 890000, status: '待审核', reason: '年度人工关节集采配套增补', drugs: '球头/内衬组件', comments: '等待资产处复核库存。' },
  ];

  const emergencyRecords = [
    { id: 'TMP-202405-021', dept: '急诊科', applicant: '陈医生', time: '2024-05-15', amount: 3500, status: '已执行', reason: '车祸危重患者紧急抢救，目录内无替代品', drugs: '重组人利钠肽(1支)', comments: '临床急需，符合临采绿色通道，后续补全备案。' },
    { id: 'TMP-202405-025', dept: '神经内科', applicant: '赵教授', time: '2024-05-16', amount: 12000, status: '已执行', reason: '罕见病患者维持治疗需特需药品', drugs: '依达拉奉片(非集采)', comments: '已经过伦理委员会讨论，同意临时采购。' },
    { id: 'TMP-202405-028', dept: '消化内科', applicant: '吴医生', time: '2024-05-17', amount: 8500, status: '被驳回', reason: '手术临时备品', drugs: '止血胶', comments: '库房已有同类集采替代品，请优先使用集采目录内物资。' },
  ];

  const currentRecords = procType === 'normal' ? normalRecords : emergencyRecords;

  const getTitle = () => {
    switch(subKey) {
      case 'dash-stock': return '实时库存全景看板';
      case 'dash-usage': return '科室使用效能统计';
      case 'dash-equip': return '关键设备效益统计';
      case 'dash-vbp': return '集采情况统计';
      default: return '驾驶舱';
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (!isVBP) {
    // 保持其他子页面的原有逻辑
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white border text-xs rounded hover:bg-gray-50 transition">导出报表</button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">数据更新</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="总SKU数量" value="4,281" trend="+12" icon={<Package className="text-blue-500" />} />
          <StatCard title="本月消耗总计" value="￥1,245w" trend="+5.2%" icon={<TrendingUp className="text-green-500" />} />
          <StatCard title="集采替代率" value="94.2%" trend="+2.1%" icon={<ShoppingCart className="text-purple-500" />} />
          <StatCard title="效期预警项" value="18" trend="-3" icon={<AlertCircle className="text-red-500" />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-500 mb-6">消耗走势分析 (最近30天)</h3>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[{n:'10', v:400}, {n:'20', v:800}, {n:'30', v:600}]}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="n" />
                   <YAxis />
                   <Tooltip />
                   <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#eff6ff" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-500 mb-6">品类占比统计</h3>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={[{n:'A', v:40}, {n:'B', v:30}]} innerRadius={60} outerRadius={80} dataKey="v">
                     <Cell fill="#3b82f6" /><Cell fill="#10b981" />
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // VBP 重新设计页面逻辑
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{getTitle()}</h2>
        </div>
        <div className="flex space-x-1 p-1 bg-gray-200/50 rounded-xl">
          <button 
            onClick={() => setProcType('normal')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center ${procType === 'normal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ClipboardList size={14} className="mr-2" /> 普通申报历史
          </button>
          <button 
            onClick={() => setProcType('emergency')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center ${procType === 'emergency' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Zap size={14} className="mr-2" /> 临时采购审计
          </button>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="集采品种覆盖率" value="98.5%" trend="+0.3%" icon={<ShieldCheck className="text-blue-500" />} color="bg-blue-50" />
        <StatCard title="临采费用占比" value="1.2%" trend="-0.4%" icon={<Zap className="text-purple-500" />} color="bg-purple-50" />
        <StatCard title="审计通过率" value="94.2%" trend="+2.1%" icon={<UserCheck className="text-green-500" />} color="bg-green-50" />
        <StatCard title="待复核单据" value="12" trend="0" icon={<History className="text-orange-500" />} color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 数据表列 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-black text-gray-700">{procType === 'normal' ? '普通申报审计台账' : '紧急临采分析记录'}</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input type="text" placeholder="搜编号、科室..." className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] outline-none w-48 focus:ring-2 focus:ring-blue-500/10" />
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Filter size={16} className="text-gray-400" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">编号</th>
                  <th className="px-6 py-4">科室</th>
                  <th className="px-6 py-4">提报医生</th>
                  <th className="px-6 py-4">提报时间</th>
                  <th className="px-6 py-4 text-right">总金额</th>
                  <th className="px-6 py-4 text-center">状态</th>
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-gray-400">{rec.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800">{rec.dept}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">{rec.applicant}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-mono">{rec.time}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-gray-700">￥{rec.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === '已通过' || rec.status === '已执行' ? 'bg-green-50 text-green-600 border border-green-100' :
                        rec.status === '待审核' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedRecord(rec)}
                        className={`p-2 rounded-lg transition-all ${selectedRecord?.id === rec.id ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 审计详情面板 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full sticky top-6">
          {selectedRecord ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className={`p-6 text-white flex justify-between items-start ${procType === 'normal' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tighter opacity-80">审计明细报告</h4>
                  <p className="text-xl font-black mt-1">{selectedRecord.id}</p>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block flex items-center">
                    <Building2 size={12} className="mr-1" /> 申请基础信息
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">申请科室</p>
                      <p className="text-sm font-bold text-gray-800">{selectedRecord.dept}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">申请人</p>
                      <p className="text-sm font-bold text-gray-800">{selectedRecord.applicant}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block flex items-center">
                    <MessageSquare size={12} className="mr-1" /> 提报事由 (临床原因)
                  </label>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                    “{selectedRecord.reason}”
                  </p>
                </section>

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block flex items-center">
                    <Package size={12} className="mr-1" /> 涉及品目详情
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{selectedRecord.drugs}</span>
                    <span className="text-[10px] font-mono font-black text-blue-600">￥{selectedRecord.amount.toLocaleString()}</span>
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block flex items-center">
                    <ShieldCheck size={12} className="mr-1" /> 审批意见 (审计)
                  </label>
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl relative">
                    <div className="absolute top-4 right-4 text-green-100"><ShieldCheck size={32} /></div>
                    <p className="text-xs text-green-800 font-bold italic leading-relaxed relative z-10">
                      “{selectedRecord.comments}”
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] text-green-600 font-black">审核人：院方审计员 01</span>
                      <span className="text-[9px] text-green-400">{selectedRecord.time}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t bg-gray-50/50">
                <button className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-xl transition-all active:scale-95 flex items-center justify-center ${procType === 'normal' ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-purple-600 shadow-purple-100 hover:bg-purple-700'}`}>
                  导出审计证明文档 (PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <FileText size={40} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-800">未选择单据</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">点击左侧列表中的“查看”按钮，<br/>调取历史审批意见与单据明细进行追溯分析。</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 补充统计图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">采购方式分布统计</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={[
                   { name: '常规申报', value: 850 },
                   { name: '临时应急', value: 45 },
                   { name: '目录补录', value: 120 }
                 ]} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value" stroke="none">
                   <Cell fill="#3b82f6" /><Cell fill="#8b5cf6" /><Cell fill="#10b981" />
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">审计合规趋势 (月度)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[
                 { m: '1月', v: 92 }, { m: '2月', v: 88 }, { m: '3月', v: 94 }, { m: '4月', v: 96 }, { m: '5月', v: 94 }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                 <Tooltip />
                 <Line type="monotone" dataKey="v" name="合规通过率" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, color = "bg-white" }: any) => (
  <div className={`${color} p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-all duration-300 cursor-default group`}>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-gray-800 mt-2 tracking-tighter">{value}</p>
      <div className="flex items-center space-x-1 mt-1">
        <span className="text-[10px] text-green-500 font-black">{trend}</span>
        <span className="text-[10px] text-gray-300 font-medium">较上期</span>
      </div>
    </div>
    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500 border border-gray-50">{icon}</div>
  </div>
);

export default Dashboard;
