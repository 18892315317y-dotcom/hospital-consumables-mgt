
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  Scan, 
  Plus, 
  ArrowRightLeft, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  X, 
  Zap, 
  Building2, 
  User, 
  Calendar, 
  ClipboardList, 
  Stethoscope, 
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Save,
  Send,
  Trash2,
  PackageCheck,
  RotateCcw,
  BadgeAlert,
  TrendingUp,
  Check,
  ShieldCheck,
  MapPin,
  Calculator,
  Info,
  ListOrdered,
  MessageSquare,
  AlertCircle,
  Timer
} from 'lucide-react';

type TabKey = 'ledger' | 'return' | 'stats';
type IssueType = 'regular' | 'emergency' | 'cross-dept';
type Condition = 'perfect' | 'faulty';
type StatusFilter = 'all' | 'pending' | 'issued' | 'returned' | 'overdue';

interface IssueRecord {
  id: string;
  equipId: string;
  equipName: string;
  model: string;
  type: IssueType;
  dept: string;
  user: string;
  purpose: string;
  issueDate: string;
  expectedReturn: string;
  actualReturn?: string;
  status: 'pending' | 'issued' | 'returned' | 'overdue';
  condition?: Condition;
  remark?: string;
  auditChain?: { node: string; user: string; time: string; status: 'completed' | 'processing' | 'pending' | 'voided' }[];
}

const EquipmentIssueReturn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ledger');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState<IssueRecord | null>(null);
  const [viewingDetail, setViewingDetail] = useState<IssueRecord | null>(null);
  const [issueType, setIssueType] = useState<IssueType>('regular');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverStatusId, setHoverStatusId] = useState<string | null>(null);
  
  // 归还登记表单状态
  const [returnTime, setReturnTime] = useState(new Date().toISOString().slice(0, 16));

  // 模拟当前用户权限 (演示用)
  const [hasAuditPermission] = useState(true);

  // 模拟台账数据
  const [records, setRecords] = useState<IssueRecord[]>([
    { 
      id: 'ISS-202405-001', equipId: 'EQ-ICU-005', equipName: '迈瑞监护仪 N22', model: 'BeneVision', type: 'emergency', dept: 'ICU', user: '张医生', purpose: '急诊抢救', issueDate: '2024-05-18 10:00', expectedReturn: '2024-05-18 18:00', status: 'issued' 
    },
    { 
      id: 'ISS-202405-002', equipId: 'EQ-SUR-012', equipName: '德尔格麻醉机', model: 'Atlan', type: 'regular', dept: '手术室', user: '李护士', purpose: '常规手术备用', issueDate: '2024-05-10 08:30', expectedReturn: '2024-05-15 08:30', status: 'overdue' 
    },
    { 
      id: 'ISS-202404-088', equipId: 'EQ-IMG-001', equipName: '便携式超声', model: 'GE Vscan', type: 'cross-dept', dept: '呼吸内科', user: '王主任', purpose: '跨科室会诊', issueDate: '2024-04-20', expectedReturn: '2024-04-22 12:00', actualReturn: '2024-04-23 14:00', status: 'returned', condition: 'perfect' 
    },
    { 
      id: 'ISS-202405-010', equipId: 'EQ-SUR-020', equipName: '强生超声刀系统', model: 'Gen11', type: 'regular', dept: '普外科', user: '赵医生', purpose: '腹腔镜手术', issueDate: '2024-05-12 08:00', expectedReturn: '2024-05-12 17:00', actualReturn: '2024-05-12 18:30', status: 'returned', condition: 'faulty', remark: '手术结束后发现探头连接插口处物理性断裂损坏' 
    },
    { 
      id: 'ISS-202405-005', equipId: 'EQ-ICU-009', equipName: '输液泵', model: 'VP50', type: 'regular', dept: '心内科', user: '陈护士', purpose: '病区调拨', issueDate: '2024-05-15', expectedReturn: '2024-05-20', status: 'pending',
      auditChain: [
        { node: '申请人发起', user: '陈护士', time: '2024-05-15 09:00', status: 'completed' },
        { node: '科室主任审批', user: '林主任', time: '审批中...', status: 'processing' },
        { node: '资管中心备案', user: '系统办', time: '--', status: 'pending' }
      ]
    },
  ]);

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // 在领用台账分页中，只显示非“已归还”的数据
      if (activeTab === 'ledger' && rec.status === 'returned') return false;
      // 在设备归还分页中，只显示“已归还”的数据
      if (activeTab === 'return' && rec.status !== 'returned') return false;

      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
      const matchesSearch = rec.equipName.includes(searchQuery) || rec.user.includes(searchQuery) || rec.id.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [records, statusFilter, searchQuery, activeTab]);

  const stats = {
    totalIssued: records.filter(r => r.status === 'issued' || r.status === 'overdue').length,
    overdueCount: records.filter(r => r.status === 'overdue').length,
    faultyCount: records.filter(r => r.condition === 'faulty').length, 
    lowStock: 3
  };

  const chartData = [
    { name: 'ICU', count: 45, usage: 88, overdue: 5 },
    { name: '手术室', count: 32, usage: 92, overdue: 2 },
    { name: '影像科', count: 28, usage: 75, overdue: 8 },
    { name: '急诊', count: 50, usage: 95, overdue: 1 },
    { name: '心内科', count: 22, usage: 70, overdue: 12 },
  ];

  const handleAuditAction = (decision: 'pass' | 'reject') => {
    if (!viewingDetail) return;
    setRecords(prev => prev.map(r => 
      r.id === viewingDetail.id 
        ? { ...r, status: decision === 'pass' ? 'issued' : 'pending' } // 演示逻辑，实际应根据业务流转
        : r
    ));
    setViewingDetail(null);
  };

  const openReturnModal = (rec: IssueRecord) => {
    setReturnTime(new Date().toISOString().slice(0, 16));
    setShowReturnModal(rec);
  };

  return (
    <div className="p-6 h-full space-y-6 animate-in fade-in duration-500 overflow-y-auto">
      {/* 顶部指标与预警 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPIItem title="当前已领用" value={stats.totalIssued} unit="台" icon={<ArrowRightLeft className="text-blue-500" />} color="bg-blue-50" />
        <KPIItem title="超期未还" value={stats.overdueCount} unit="台" icon={<Clock className="text-red-500" />} color="bg-red-50" badge="严重" />
        <KPIItem title="故障归还(待修)" value={stats.faultyCount} unit="件" icon={<AlertTriangle className="text-orange-500" />} color="bg-orange-50" />
        <KPIItem title="低库存预警" value={stats.lowStock} unit="类" icon={<PackageCheck className="text-purple-500" />} color="bg-purple-50" />
      </div>

      {/* 主工作区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* 页签与主操作 */}
        <div className="flex flex-col md:flex-row border-b md:items-center justify-between px-6 bg-gray-50/30">
          <div className="flex">
            <button onClick={() => setActiveTab('ledger')} className={`px-8 py-5 text-sm font-bold transition-all border-b-2 ${activeTab === 'ledger' ? 'border-blue-600 text-blue-600 bg-white shadow-inner' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              领用台账
            </button>
            <button onClick={() => setActiveTab('return')} className={`px-8 py-5 text-sm font-bold transition-all border-b-2 ${activeTab === 'return' ? 'border-blue-600 text-blue-600 bg-white shadow-inner' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              设备归还
            </button>
            <button onClick={() => setActiveTab('stats')} className={`px-8 py-5 text-sm font-bold transition-all border-b-2 ${activeTab === 'stats' ? 'border-blue-600 text-blue-600 bg-white shadow-inner' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              流动分析
            </button>
          </div>
          <div className="py-4 flex space-x-3">
             <button onClick={() => setShowIssueModal(true)} className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                <Plus size={18} className="mr-2" /> 发起领用申请
             </button>
          </div>
        </div>

        {activeTab !== 'stats' ? (
          <>
            {/* 列表工具栏 */}
            <div className="p-6 border-b flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="搜索单号、设备、领用人..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-bold" 
                />
              </div>
              {activeTab === 'ledger' && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">单据状态</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="h-10 px-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">审批中</option>
                    <option value="issued">已领用</option>
                    <option value="overdue">超期未还</option>
                  </select>
                </div>
              )}
            </div>

            {/* 表格容器 */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                    <th className="px-6 py-4">领用单/设备信息</th>
                    <th className="px-6 py-4">领用科室/人</th>
                    <th className="px-6 py-4">领用时间</th>
                    {activeTab === 'ledger' ? (
                      <>
                        <th className="px-6 py-4">预计归还</th>
                        <th className="px-6 py-4">状态</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4">实际归还时间</th>
                        <th className="px-6 py-4">设备状况</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className={`hover:bg-blue-50/20 transition-colors group ${rec.status === 'overdue' ? 'bg-red-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${rec.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <ClipboardList size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-800">{rec.equipName}</p>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">{rec.equipId} | {rec.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-gray-400 uppercase mb-0.5">{rec.dept}</span>
                           <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">{rec.user.charAt(0)}</div>
                              <span className="text-xs font-bold text-gray-700">{rec.user}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">{rec.issueDate}</td>
                      
                      {activeTab === 'ledger' ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className={`font-mono text-[11px] ${rec.status === 'overdue' ? 'text-red-600 font-black' : 'text-gray-500 font-bold'}`}>
                                 {rec.expectedReturn}
                               </span>
                               {rec.status === 'overdue' && <span className="text-[9px] text-red-500 font-black flex items-center mt-0.5"><Clock size={8} className="mr-1"/> 已超期</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div 
                              className="inline-block relative"
                              onMouseEnter={() => setHoverStatusId(rec.id)}
                              onMouseLeave={() => setHoverStatusId(null)}
                            >
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all cursor-help ${
                                  rec.status === 'issued' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  rec.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                                  'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                  {rec.status === 'issued' ? '领用中' : rec.status === 'overdue' ? '超期未还' : '审批中'}
                                </span>

                                {/* 悬停进度气泡 */}
                                {hoverStatusId === rec.id && rec.status === 'pending' && rec.auditChain && (
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-4 z-[50] whitespace-normal">
                                     <div className="flex items-center space-x-2 mb-5 border-b border-gray-50 pb-3">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                        <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">领用审批追踪报告</h5>
                                     </div>
                                     <div className="space-y-5">
                                        {rec.auditChain.map((node, i) => (
                                          <WorkflowNode 
                                            key={i}
                                            status={node.status} 
                                            label={node.node} 
                                            user={node.user} 
                                            time={node.time} 
                                            isLast={i === rec.auditChain!.length - 1} 
                                          />
                                        ))}
                                     </div>
                                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
                                  </div>
                                )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-mono text-[11px] text-green-600 font-black">{rec.actualReturn}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                              rec.condition === 'perfect' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {rec.condition === 'perfect' ? '完好' : '异常损坏'}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-4">
                           {rec.status === 'overdue' && (
                             <button className="text-red-600 hover:text-red-800 font-bold text-xs underline underline-offset-4 transition-colors">
                               催还
                             </button>
                           )}
                           {rec.status !== 'returned' && rec.status !== 'pending' && (
                             <button onClick={() => openReturnModal(rec)} className="text-blue-600 hover:text-blue-800 font-bold text-xs underline underline-offset-4 transition-colors">
                               归还登记
                             </button>
                           )}
                           <button 
                             onClick={() => setViewingDetail(rec)}
                             className="text-gray-400 hover:text-blue-600 font-bold text-xs transition-colors"
                           >
                             详情
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                  <History size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-black italic">暂无匹配的记录项</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 统计看板 */
          <div className="p-8 space-y-8 flex-1 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                    <TrendingUp size={14} className="mr-2 text-blue-500" /> 科室领用热力分布
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="count" name="领用频次" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                    <ShieldAlert size={14} className="mr-2 text-red-500" /> 超期率与完好率关联分析
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="usage" name="使用周转率" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="overdue" name="超期率(%)" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="bg-blue-600 p-8 rounded-[40px] text-white relative overflow-hidden group">
                  <ArrowUpRight className="absolute -right-4 -top-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">当月周转效率王</p>
                  <h5 className="text-2xl font-black mt-2 italic">“急诊医学科”</h5>
                  <p className="text-xs mt-4 opacity-80 leading-relaxed font-medium">
                    平均归还时间领先全院 15%，设备复用间隔缩短至 45 分钟，显著提升了峰值时段的抢救速度。
                  </p>
               </div>
               <div className="lg:col-span-2 bg-gray-50 p-8 rounded-[40px] border border-gray-100 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                     <h5 className="text-sm font-black text-gray-800 uppercase tracking-widest">全院低库存预警提醒</h5>
                     <button className="text-[10px] font-bold text-blue-600 flex items-center">发起调拨 <ChevronRight size={12}/></button>
                  </div>
                  <div className="space-y-3">
                     <StockBar label="监护仪 (心内组)" current={2} total={15} color="bg-red-500" />
                     <StockBar label="便携超声 (手术组)" current={1} total={4} color="bg-orange-500" />
                     <StockBar label="呼吸机 (ICU组)" current={12} total={15} color="bg-green-500" />
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 领用单详情/审批 弹窗 */}
      {viewingDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingDetail(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[88vh]">
            <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${
              viewingDetail.status === 'pending' ? 'bg-orange-600' : 'bg-indigo-600'
            }`}>
              <div className="flex items-center space-x-3">
                 <ShieldCheck size={24} />
                 <h3 className="text-xl font-black tracking-tight">
                   {viewingDetail.status === 'pending' ? '领用申请单据审批' : '领用记录详情'}
                 </h3>
              </div>
              <button onClick={() => setViewingDetail(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
               {/* 设备损坏预警 (仅当记录标记为损坏时显示) */}
               {viewingDetail.condition === 'faulty' && (
                 <div className="bg-red-50 border-2 border-red-500 p-6 rounded-2xl animate-pulse flex items-start space-x-4">
                    <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg"><AlertTriangle size={24}/></div>
                    <div className="flex-1">
                       <h4 className="text-red-700 font-black text-base uppercase tracking-wider mb-1">设备异常损坏预警</h4>
                       <p className="text-red-600 text-sm font-bold">该设备在归还时已被标记为“异常损坏”，系统已自动锁定资产状态，禁止再次领用。</p>
                       <div className="mt-3 p-3 bg-white/50 rounded-lg border border-red-100">
                          <p className="text-[10px] text-red-400 font-black uppercase mb-1">损坏详情描述：</p>
                          <p className="text-xs text-red-900 font-medium">“{viewingDetail.remark}”</p>
                       </div>
                    </div>
                 </div>
               )}

               {/* 基础信息卡片 */}
               <div className="grid grid-cols-2 gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                 <div className="space-y-1.5">
                    <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <MapPin size={10} className="mr-1"/> 领用单号
                    </div>
                    <p className="text-sm font-mono font-black text-indigo-900">{viewingDetail.id}</p>
                 </div>
                 <div className="space-y-1.5 text-right">
                    <div className="flex items-center justify-end text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      领用类型
                    </div>
                    <p className="text-sm font-black text-indigo-900">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        viewingDetail.type === 'emergency' ? 'bg-red-500 text-white shadow-sm' : 
                        viewingDetail.type === 'cross-dept' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {viewingDetail.type === 'emergency' ? '急救先用' : viewingDetail.type === 'cross-dept' ? '跨科领用' : '常规领用'}
                      </span>
                    </p>
                 </div>
                 <div className="space-y-1.5 pt-3 border-t border-indigo-100/30">
                    <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      领用科室/人
                    </div>
                    <p className="text-sm font-black text-indigo-900">{viewingDetail.dept} · {viewingDetail.user}</p>
                 </div>
                 <div className="space-y-1.5 pt-3 border-t border-indigo-100/30 text-right">
                    <div className="flex items-center justify-end text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      领用日期
                    </div>
                    <p className="text-sm font-black text-indigo-900">{viewingDetail.issueDate}</p>
                 </div>
                 <div className="space-y-1.5 pt-3 border-t border-indigo-100/30">
                    <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      预计归还时间
                    </div>
                    <p className="text-sm font-black text-indigo-900">{viewingDetail.expectedReturn}</p>
                 </div>
                 <div className="space-y-1.5 pt-3 border-t border-indigo-100/30 text-right">
                    <div className="flex items-center justify-end text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      当前状态
                    </div>
                    <p className={`text-sm font-black ${viewingDetail.status === 'pending' ? 'text-orange-600' : 'text-indigo-600'}`}>
                      {viewingDetail.status === 'pending' ? '待审批中' : viewingDetail.status === 'issued' ? '领用中' : viewingDetail.status === 'overdue' ? '已超期' : '已归还'}
                    </p>
                 </div>
               </div>

               {/* 归还时效看板 (仅已归还可见) */}
               {viewingDetail.status === 'returned' && (
                 <div className="space-y-3">
                    <div className="flex items-center space-x-2 ml-1">
                      <Timer size={14} className="text-indigo-500" />
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">归还时效追溯</label>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6 relative overflow-hidden">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">预计归还节点</p>
                          <p className="text-sm font-mono font-bold text-gray-600 italic">{viewingDetail.expectedReturn}</p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">实际入账归还</p>
                          <div className="flex items-center justify-end space-x-2">
                             <p className={`text-sm font-mono font-black ${viewingDetail.actualReturn && viewingDetail.actualReturn > viewingDetail.expectedReturn ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                               {viewingDetail.actualReturn || '--'}
                             </p>
                             {viewingDetail.actualReturn && viewingDetail.actualReturn > viewingDetail.expectedReturn && (
                               <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md shadow-sm">超期归还</span>
                             )}
                          </div>
                       </div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                          <RotateCcw size={80} />
                       </div>
                    </div>
                 </div>
               )}

               {/* 设备详情 */}
               <div className="space-y-3">
                  <div className="flex items-center space-x-2 ml-1">
                    <PackageCheck size={14} className="text-gray-400" />
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">申领设备明细</label>
                  </div>
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <Stethoscope size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{viewingDetail.equipName}</p>
                          <p className="text-[10px] font-mono text-gray-400 uppercase">{viewingDetail.equipId} | {viewingDetail.model}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">当前资产状态</p>
                        <p className="text-xs font-bold text-blue-600">
                          {viewingDetail.status === 'returned' ? '已入库/待调配' : '领用部门执管中'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* 审批进度 (如有) */}
               {viewingDetail.auditChain && (
                 <div className="space-y-3 pt-4">
                   <div className="flex items-center space-x-2 ml-1">
                      <History size={14} className="text-gray-400" />
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">审批流转进度</label>
                   </div>
                   <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
                      {viewingDetail.auditChain.map((node, i) => (
                        <WorkflowNode 
                          key={i}
                          status={node.status} 
                          label={node.node} 
                          user={node.user} 
                          time={node.time} 
                          isLast={i === viewingDetail.auditChain!.length - 1} 
                        />
                      ))}
                   </div>
                 </div>
               )}

               {/* 审批意见输入 (仅审批时可见) */}
               {viewingDetail.status === 'pending' && hasAuditPermission && (
                 <div className="space-y-4 pt-4 border-t border-dashed">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">审核结论</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 rounded-2xl border-2 border-green-500 bg-green-50 text-green-700 shadow-sm flex flex-col items-center">
                        <CheckCircle2 size={24} className="mb-2" />
                        <span className="text-sm font-black">核准领用</span>
                      </button>
                      <button className="p-4 rounded-2xl border border-gray-100 text-gray-400 hover:border-red-500 hover:bg-red-50 hover:text-red-700 flex flex-col items-center transition-all">
                        <AlertCircle size={24} className="mb-2" />
                        <span className="text-sm font-black">驳回申请</span>
                      </button>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center">
                       <MessageSquare size={14} className="mr-1.5" /> 审批备注意见
                     </label>
                     <textarea 
                       placeholder="请输入审核处理意见..."
                       className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                     />
                   </div>
                 </div>
               )}
            </div>
            
            <div className="p-8 border-t bg-gray-50/50 flex space-x-4 shrink-0">
               <button onClick={() => setViewingDetail(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors">
                 关闭
               </button>
               {viewingDetail.status === 'pending' && hasAuditPermission && (
                 <button 
                  onClick={() => handleAuditAction('pass')}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                 >
                   提交审核结论
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 领用申请弹窗 */}
      {showIssueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIssueModal(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
             <div className="px-10 py-8 bg-blue-600 text-white flex justify-between items-center shrink-0 shadow-xl">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-white/20 rounded-2xl"><Zap size={32} /></div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">发起设备领用申请</h3>
                      <p className="text-xs text-blue-100 mt-1 uppercase font-bold tracking-widest italic">Equipment Requisition Flow</p>
                   </div>
                </div>
                <button onClick={() => setShowIssueModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-gray-50/20">
                {/* 1. 领用类型选择 */}
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">1. 选择领用模式</h4></div>
                   <div className="grid grid-cols-3 gap-6">
                      <TypeCard 
                        active={issueType === 'emergency'} 
                        onClick={() => setIssueType('emergency')} 
                        icon={<Zap className="text-red-500" />} 
                        label="急救领用" 
                        desc="无需预先审批，事后补录"
                        color="border-red-200 bg-red-50/30"
                      />
                      <TypeCard 
                        active={issueType === 'regular'} 
                        onClick={() => setIssueType('regular')} 
                        icon={<PackageCheck className="text-blue-500" />} 
                        label="常规领用" 
                        desc="科室正常备用及调配"
                      />
                      <TypeCard 
                        active={issueType === 'cross-dept'} 
                        onClick={() => setIssueType('cross-dept')} 
                        icon={<Building2 className="text-purple-500" />} 
                        label="跨科领用" 
                        desc="支持异室异病区临时互通"
                      />
                   </div>
                </section>

                {/* 2. 设备扫码/搜索 */}
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">2. 选定领用设备</h4></div>
                   <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                        <input type="text" placeholder="扫描设备二维码或输入设备序列号/ID" className="w-full h-14 pl-14 pr-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                      </div>
                      <button className="px-8 h-14 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all">检索库存</button>
                   </div>
                   <div className="p-6 bg-blue-50/50 rounded-[28px] border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-white rounded-2xl shadow-sm"><Stethoscope className="text-blue-600" /></div>
                         <div>
                            <p className="text-sm font-black text-gray-800 italic">待选定...</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">请完成扫码动作</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">当前可用库存：12 台</span>
                   </div>
                </section>

                {/* 3. 填报信息 */}
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">3. 详细领用单信息</h4></div>
                   <div className="grid grid-cols-2 gap-8">
                      <FormInput label="领用科室" value="心血管外科" icon={<Building2 size={16}/>} />
                      <FormInput label="领用人" value="张晓明 (工号: 0922)" icon={<User size={16}/>} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">领用用途 <span className="text-red-500">*</span></label>
                        <select className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none">
                           <option>临床诊疗</option><option>急救抢救</option><option>科研实验</option><option>演示示教</option>
                        </select>
                      </div>
                      <FormInput label="预计归还时间" placeholder="YYYY-MM-DD HH:mm" icon={<Calendar size={16}/>} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">附加说明 (选填)</label>
                      <textarea className="w-full h-24 p-5 bg-gray-50 border border-gray-100 rounded-[28px] text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="录入领用特殊事项说明..."></textarea>
                   </div>
                </section>
             </div>

             <div className="p-10 border-t bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center text-xs text-gray-400 font-bold italic">
                   <ShieldAlert size={16} className="mr-2 text-blue-500" /> 领用单据将实时存入电子病历系统溯源库
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setShowIssueModal(false)} className="px-10 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black hover:bg-gray-200 transition-all">取消</button>
                  <button className="px-10 py-4 bg-white border border-blue-200 text-blue-600 rounded-[20px] font-black flex items-center hover:bg-blue-50 transition-all"><Save size={18} className="mr-2" /> 暂存单据</button>
                  <button onClick={() => setShowIssueModal(false)} className={`px-12 py-4 text-white rounded-[20px] font-black shadow-2xl transition-all active:scale-95 flex items-center ${issueType === 'emergency' ? 'bg-red-600 shadow-red-100' : 'bg-blue-600 shadow-blue-100'}`}>
                    <Send size={18} className="mr-2" /> {issueType === 'emergency' ? '急救直领' : '提交审批'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 归还登记弹窗 */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowReturnModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
             <div className="px-10 py-8 bg-gray-900 text-white flex justify-between items-center shrink-0 shadow-xl">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-white/10 rounded-2xl text-blue-400"><RotateCcw size={32} /></div>
                   <div>
                      <h3 className="text-xl font-black tracking-tight">归档登记与状态验收</h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest tracking-tighter">Equipment Return Verification</p>
                   </div>
                </div>
                <button onClick={() => setShowReturnModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
             </div>

             <div className="p-10 space-y-8 bg-gray-50/20 text-left overflow-y-auto max-h-[60vh] scrollbar-hide">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold"><Scan size={24}/></div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{showReturnModal.equipName}</p>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{showReturnModal.equipId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">领用人</p>
                      <p className="text-xs font-bold text-gray-700">{showReturnModal.user}</p>
                   </div>
                </div>

                {/* 归还时间录入 */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center">
                     <Clock size={12} className="mr-1.5 text-blue-600" /> 实际归还时间 <span className="text-red-500 ml-1">*</span>
                   </label>
                   <input 
                     type="datetime-local" 
                     value={returnTime}
                     onChange={(e) => setReturnTime(e.target.value)}
                     className="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                   />
                   <p className="text-[9px] text-gray-400 font-medium ml-1 italic">提示：系统允许追溯录入历史归还时间点。</p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center space-x-3 mb-2"><div className="w-1.5 h-4 bg-gray-900 rounded-full"></div><h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">设备现状评估</h4></div>
                   <div className="grid grid-cols-2 gap-6">
                      <button className="flex flex-col items-center p-6 bg-white border-2 border-green-500 rounded-3xl group shadow-green-50/50 transition-all">
                         <CheckCircle2 size={32} className="text-green-500 mb-3" />
                         <span className="text-sm font-black text-gray-800">外观/功能完好</span>
                         <span className="text-[10px] text-gray-400 font-bold mt-1">可直接回库或调配</span>
                      </button>
                      <button className="flex flex-col items-center p-6 bg-white border-2 border-gray-100 rounded-3xl group hover:border-red-500 transition-all opacity-50 hover:opacity-100">
                         <AlertTriangle size={32} className="text-red-500 mb-3" />
                         <span className="text-sm font-black text-gray-800">发现异常故障</span>
                         <span className="text-[10px] text-red-500 font-black mt-1">系统将自动联动维修单</span>
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">验收备注 (异常点描述)</label>
                   <textarea className="w-full h-24 p-5 bg-white border border-gray-100 rounded-[28px] text-sm font-medium outline-none focus:ring-4 focus:ring-gray-900/5" placeholder="正常归还无需填写..."></textarea>
                </div>
             </div>

             <div className="p-10 border-t bg-white flex justify-end space-x-4 shrink-0">
                <button onClick={() => setShowReturnModal(null)} className="px-10 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black">取消</button>
                <button onClick={() => setShowReturnModal(null)} className="px-12 py-4 bg-gray-900 text-white rounded-[20px] font-black shadow-2xl active:scale-95 flex items-center">
                   <CheckCircle2 size={18} className="mr-2" /> 确认归还入账
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助子组件

const KPIItem = ({ title, value, unit, icon, color, badge }: any) => (
  <div className={`${color} p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-start justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-default`}>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-baseline space-x-1 mt-2">
        <h3 className="text-3xl font-black text-gray-800">{value}</h3>
        <span className="text-xs text-gray-400 font-bold">{unit}</span>
      </div>
      {badge && <span className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse">{badge}</span>}
    </div>
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">{icon}</div>
  </div>
);

const TypeCard = ({ active, onClick, icon, label, desc, color }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[28px] border-2 flex flex-col items-center text-center transition-all relative ${
      active ? 'border-blue-600 bg-white shadow-xl scale-105' : `border-transparent bg-gray-50 opacity-60 hover:opacity-100 ${color || ''}`
    }`}
  >
    <div className={`p-4 rounded-2xl bg-white shadow-sm mb-4 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    <p className="text-sm font-black text-gray-800 tracking-tight">{label}</p>
    <p className="text-[10px] text-gray-400 font-bold mt-1 leading-relaxed">{desc}</p>
    {active && <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white"><Check size={12} strokeWidth={4}/></div>}
  </button>
);

const FormInput = ({ label, value, icon, placeholder }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">{label} <span className="text-red-500">*</span></label>
    <div className="relative">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
       <input type="text" defaultValue={value} placeholder={placeholder} className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
    </div>
  </div>
);

const StockBar = ({ label, current, total, color }: any) => {
  const percent = (current / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-gray-700">{label}</span>
        <span className={`text-[10px] font-black ${percent < 20 ? 'text-red-500' : 'text-gray-400'}`}>{current} / {total} 台</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

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

export default EquipmentIssueReturn;
