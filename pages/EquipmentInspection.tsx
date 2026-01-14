
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Settings2, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  FileSearch, 
  Download, 
  Plus,
  RefreshCcw,
  Search,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  Filter,
  X,
  MapPin,
  Check,
  AlertCircle,
  FileText,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldAlert,
  BarChart as BarChartIcon,
  UserPlus,
  Save,
  Trash2,
  Settings,
  Printer,
  FileDown,
  LayoutGrid,
  FileSpreadsheet,
  HardDrive
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

// ========================== 辅助 UI 组件 ==========================

const StatCard = ({ title, value, unit, icon, color }: any) => (
  <div className={`p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between ${color}`}>
    <div className="p-3 bg-white rounded-xl shadow-sm text-gray-600">{icon}</div>
    <div className="text-right">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline justify-end space-x-1">
        <span className="text-2xl font-black text-gray-800">{value}</span>
        <span className="text-xs text-gray-400 font-bold">{unit}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all font-bold text-sm ${
      active ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const TemplateItem = ({ type, items, period }: any) => (
  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors flex justify-between items-center group">
    <div>
      <h5 className="text-sm font-bold text-gray-700">{type} 巡查模板</h5>
      <div className="flex items-center mt-1.5 space-x-2">
        {items.map((it: string) => (
          <span key={it} className="text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">{it}</span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-blue-600 font-bold mb-1">{period}</span>
      <button className="text-[10px] text-gray-300 group-hover:text-blue-600 underline font-medium">修改标准</button>
    </div>
  </div>
);

const AlertItem = ({ title, level, time, status }: any) => (
  <div className="p-4 bg-white border border-red-50 rounded-xl shadow-sm relative group cursor-pointer hover:border-red-200">
    <div className="flex justify-between items-center mb-1">
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
        level === '紧急' ? 'bg-red-600 text-white' : level === '一般' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
      }`}>{level}</span>
      <span className="text-[9px] text-gray-400">{time}</span>
    </div>
    <p className="text-xs font-bold text-gray-700">{title}</p>
    <div className="mt-3 flex items-center justify-between">
      <span className="text-[10px] text-gray-400 font-medium flex items-center">
        <RefreshCcw size={10} className="mr-1 text-orange-500 animate-spin-slow" /> {status}
      </span>
      <div className="flex space-x-1">
        <ImageIcon size={12} className="text-gray-300" />
        <ArrowRight size={12} className="text-gray-300 group-hover:text-red-500" />
      </div>
    </div>
  </div>
);

const ValueRow = ({ label, value, standard, status }: { label: string, value: string, standard: string, status: 'normal' | 'abnormal' }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div>
      <p className="text-xs font-bold text-gray-700">{label}</p>
      <p className="text-[9px] text-gray-400">标准范围: {standard}</p>
    </div>
    <div className="text-right">
      <p className={`text-sm font-black ${status === 'abnormal' ? 'text-red-600' : 'text-blue-600'}`}>{value}</p>
      <span className={`text-[8px] font-bold uppercase ${status === 'abnormal' ? 'text-red-400' : 'text-green-500'}`}>
        {status === 'abnormal' ? '超限' : '正常'}
      </span>
    </div>
  </div>
);

const ConfigRow = ({ label, desc, required }: { label: string, desc: string, required?: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
     <div className="flex items-center space-x-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {required ? <CheckCircle2 size={16} className="text-green-500" /> : <Settings size={16} className="text-gray-400" />}
        </div>
        <div>
          <p className="text-sm font-black text-gray-800">{label} {required && <span className="text-red-500 ml-0.5">*</span>}</p>
          <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
        </div>
     </div>
     <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
  </div>
);

const ReportMiniStat = ({ label, value, unit, color = 'text-gray-800' }: any) => (
  <div className="p-6 bg-white rounded-[28px] border border-gray-100 shadow-sm transition-transform hover:scale-105 text-center">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline justify-center space-x-1">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-400 font-bold">{unit}</span>
    </div>
  </div>
);

const ResultLegendItem = ({ label, value, color, desc }: any) => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center"><div className={`w-2 h-2 rounded-full mr-2 ${color}`}></div><span className="text-xs font-bold text-gray-600">{label}</span></div>
      <span className="text-xs font-black text-gray-800">{value}</span>
    </div>
    <p className="text-[9px] text-gray-400 ml-4 italic">说明: {desc}</p>
  </div>
);

const AdviceRow = ({ level, title, content, isLight }: any) => (
  <div className="flex space-x-4">
    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
      level === 'H' ? 'bg-red-500 text-white' : level === 'M' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
    }`}>{level}</div>
    <div>
      <p className={`text-xs font-black ${isLight ? 'text-gray-800' : 'text-white'}`}>{title}</p>
      <p className={`text-[10px] mt-1 leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{content}</p>
    </div>
  </div>
);

const AdviceBlock = ({ title, content, suggest, level }: any) => (
  <div className="space-y-4 relative pl-8">
     <div className={`absolute left-0 top-0 w-1 h-full rounded-full ${level === 'H' ? 'bg-red-500' : level === 'M' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
     <div className="flex items-center space-x-3">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${
          level === 'H' ? 'bg-red-500' : level === 'M' ? 'bg-orange-500' : 'bg-blue-500'
        }`}>{level === 'H' ? '关键' : level === 'M' ? '重要' : '优化'}</span>
        <h5 className="text-sm font-black text-gray-800 tracking-tight">{title}</h5>
     </div>
     <p className="text-xs text-gray-500 leading-relaxed font-medium">{content}</p>
     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center"><Zap size={10} className="mr-1 text-indigo-600"/> 建议执行动作</p>
        <p className="text-xs font-black text-indigo-600">{suggest}</p>
     </div>
  </div>
);

const HistoryIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-7.38 3.25L3 7v-5"/>
  </svg>
);

// ========================== Sub-Modules ==========================

const PlanModule = ({ onShowTemp, onShowTemplate, onShowManual }: any) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="搜索模板或责任人..." className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none w-64" />
        </div>
        <button className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"><Filter size={18}/></button>
      </div>
      <div className="flex space-x-2">
        <button onClick={onShowTemplate} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-bold flex items-center hover:bg-blue-50">
          <Settings2 size={16} className="mr-2" /> 模板配置
        </button>
        <button onClick={onShowTemp} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center shadow-lg shadow-blue-100">
          <Plus size={16} className="mr-2" /> 发起临时巡查
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
          <Settings2 size={16} className="mr-2 text-blue-500" /> 任务模板配置概览
        </h4>
        <div className="space-y-3 flex-1">
          <TemplateItem type="生命支持类" items={['电源/电池检查', '压力报警测试', '自检记录']} period="每日" />
          <TemplateItem type="影像设备类" items={['控温系统巡视', '线缆连接', '清洁度检查']} period="每周" />
          <TemplateItem type="检验设备类" items={['管路清洗', '光源测试', '校准液位']} period="每日" />
        </div>
        <button onClick={onShowTemplate} className="mt-4 w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">进入模板中心管理</button>
      </div>

      <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-gray-700 flex items-center">
            <Users size={16} className="mr-2 text-blue-500" /> 实时设备责任指派概览
          </h4>
          <button onClick={onShowManual} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center">
            <UserPlus size={12} className="mr-1" /> 分配负责人
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-white shadow-sm bg-white">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold border-b">
              <tr>
                <th className="px-4 py-3 text-left">受检设备名称</th>
                <th className="px-4 py-3 text-left">设备编号</th>
                <th className="px-4 py-3 text-left">责任人</th>
                <th className="px-4 py-3 text-left">运维联动</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-bold text-gray-700">GE 64排螺旋 CT</td>
                <td className="px-4 py-3 font-mono text-gray-400">EQ-IMG-CT01</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">张工</span></td>
                <td className="px-4 py-3 text-blue-600 font-medium">工程部-陈工</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-bold text-gray-700">迈瑞全自动监护仪</td>
                <td className="px-4 py-3 font-mono text-gray-400">EQ-ICU-MON05</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded font-bold">王工</span></td>
                <td className="px-4 py-3 text-blue-600 font-medium">厂商维保员</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-bold text-gray-700">德尔格呼吸机</td>
                <td className="px-4 py-3 font-mono text-gray-400">EQ-ICU-VEN02</td>
                <td className="px-4 py-3"><span className="text-gray-300 italic font-medium">未指派</span></td>
                <td className="px-4 py-3 text-gray-300">--</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[10px] text-gray-400 font-bold italic leading-relaxed text-center">* 系统巡查计划已转为“设备责任制”，每个负责人可承接多台资产。</p>
      </div>
    </div>
  </div>
);

const ExecutionModule = ({ onShowDetail }: { onShowDetail: (task: any) => void }) => {
  const executionData = [
    { id: "TSK-09221", equipment: "GE 螺旋 CT", status: "abnormal" as const, dept: "影像中心", time: "10:30", user: "张工" },
    { id: "TSK-09225", equipment: "德尔格呼吸机", status: "normal" as const, dept: "ICU", time: "09:15", user: "李工" },
    { id: "TSK-09228", equipment: "迈瑞监护仪", status: "pending" as const, dept: "心内科", time: "-", user: "待分配" },
    { id: "TSK-09230", equipment: "西门子 MRI", status: "normal" as const, dept: "影像中心", time: "08:45", user: "王工" },
  ];

  const statusConfig: any = {
    normal: { label: '正常', color: 'bg-green-50 text-green-700 border-green-100' },
    abnormal: { label: '异常', color: 'bg-red-50 text-red-700 border-red-100' },
    pending: { label: '待执行', color: 'bg-gray-50 text-gray-500 border-gray-100' }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700 flex items-center">
              <RefreshCcw size={16} className="mr-2 text-green-500" /> 巡查执行流水
            </h4>
            <span className="text-[10px] text-gray-400 font-medium italic">实时监控已开启，数据每分钟自动刷新</span>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest border-b text-[10px]">
                  <th className="px-6 py-4">任务 ID</th>
                  <th className="px-6 py-4">巡查设备</th>
                  <th className="px-6 py-4">所属科室</th>
                  <th className="px-6 py-4">执行人员</th>
                  <th className="px-6 py-4">时间</th>
                  <th className="px-6 py-4 text-center">状态</th>
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {executionData.map((task) => {
                  const cfg = statusConfig[task.status];
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-gray-400">{task.id}</td>
                      <td className="px-6 py-4 font-black text-gray-700">{task.equipment}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{task.dept}</td>
                      <td className="px-6 py-4 text-gray-600 font-bold">{task.user}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{task.time}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                           <button onClick={() => onShowDetail(task)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                             <FileSearch size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100 flex flex-col h-full">
          <div className="flex flex-col space-y-3 mb-4">
            <h4 className="text-sm font-bold text-red-800 flex items-center">
              <AlertTriangle size={16} className="mr-2" /> 异常预警
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-[9px] font-bold text-red-400 uppercase mb-1 ml-1">工单状态</p>
                <select className="w-full text-[10px] font-bold bg-white/60 border border-red-200 text-red-700 rounded-lg px-2 py-1 outline-none">
                  <option value="all">全部状态</option><option value="draft">待派发</option><option value="processing">处理中</option><option value="closed">已关单</option>
                </select>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-red-400 uppercase mb-1 ml-1">紧急程度</p>
                <select className="w-full text-[10px] font-bold bg-white/60 border border-red-200 text-red-700 rounded-lg px-2 py-1 outline-none">
                  <option value="all">全量程度</option><option value="urgent">紧急</option><option value="normal">一般</option><option value="warning">预警</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <AlertItem title="MRI 水冷机组温度异常" level="紧急" time="10 分钟前" status="已生成工单" />
            <AlertItem title="CT 球管打火异常提示" level="一般" time="1 小时前" status="待派发" />
            <AlertItem title="除颤监护仪电池老化" level="预警" time="今日 09:10" status="已领用配件" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsModule = ({ data, onShowModal }: { data: any[], onShowModal: (type: ModalType) => void }) => {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <Activity className="text-purple-600" size={20} />
          <div><h4 className="text-sm font-black text-gray-800 tracking-tight">效能与风险评估</h4></div>
        </div>
        <button onClick={() => onShowModal('comprehensive')} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
          <FileText size={14} className="mr-2" /> 查看报告明细
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm relative group/card">
          <div className="flex items-center justify-between mb-6">
             <div><span className="text-xs font-black text-gray-400 uppercase tracking-widest">任务执行概况 (月度趋势)</span><div className="mt-1 flex space-x-2"><span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">计划 vs 实际</span></div></div>
             <button onClick={() => onShowModal('taskDetail')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover/card:opacity-100"><ExternalLink size={16} /></button>
          </div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} /><Legend iconType="circle" /><Line type="monotone" dataKey="plan" name="计划任务" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" /><Line type="monotone" dataKey="actual" name="实际执行" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm relative group/card">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center space-x-2"><ShieldCheck className="text-green-500" size={18} /><span className="text-xs font-black text-gray-400 uppercase tracking-widest">设备明细健康分布 (质量评分)</span></div>
             <button onClick={() => onShowModal('healthDetail')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover/card:opacity-100"><ExternalLink size={16} /></button>
          </div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{ subject: '生命支持', A: 98 }, { subject: '影像诊断', A: 85 }, { subject: '手术急救', A: 92 }, { subject: '检验分析', A: 78 }, { subject: '基础护理', A: 95 }]}><PolarGrid stroke="#f1f5f9" /><PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold'}} /><Radar name="合格率指标" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} /><Tooltip /></RadarChart></ResponsiveContainer></div>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm relative group/card">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center space-x-2"><Zap className="text-orange-500" size={18} /><span className="text-xs font-black text-gray-400 uppercase tracking-widest">巡查结果汇总统计 (状态分布)</span></div>
             <button onClick={() => onShowModal('resultsDetail')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover/card:opacity-100"><ExternalLink size={16} /></button>
          </div>
          <div className="h-64 flex items-center">
            <div className="w-1/2 h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: '运行正常', value: 850 }, { name: '一般故障', value: 120 }, { name: '停机维修', value: 30 }]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"><Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            <div className="w-1/2 space-y-4 px-4"><ResultLegendItem label="运行正常" value="85%" color="bg-green-500" /><ResultLegendItem label="一般故障" value="12%" color="bg-orange-500" /><ResultLegendItem label="停机维修" value="3%" color="bg-red-500" /></div>
          </div>
        </div>

        <div className="p-6 bg-white border border-blue-100 rounded-3xl shadow-sm overflow-hidden relative group/card">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:scale-110 transition-transform"><FileText size={120} className="text-blue-600" /></div>
          <div className="flex items-center justify-between mb-6">
             <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center"><AlertCircle size={14} className="mr-2" /> 自动化管理诊断与建议报告</h4>
             <button onClick={() => onShowModal('analysisReport')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover/card:opacity-100"><ExternalLink size={16} /></button>
          </div>
          <div className="space-y-5 relative z-10">
            <AdviceRow level="H" title="ICU 高频呼吸机预警" content="本月 ICU 呼吸机压力传感器故障率环比上升 15%，建议针对德尔格机型进行深度保养。" isLight />
            <AdviceRow level="M" title="影像中心环境波动" content="MRI 水冷机组检测到 3 次瞬时过热，建议检查机房精密空调运行电流，防范停机风险。" isLight />
            <AdviceRow level="L" title="巡查时效性优化" content="外科手术室巡查平均打卡位置偏差 1.5 米，属正常，但建议将每日巡查时间提前至 08:00。" isLight />
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center"><span className="text-[10px] text-gray-400 font-bold italic">报告生成时间：{new Date().toLocaleDateString()}</span><button onClick={() => onShowModal('analysisReport')} className="text-[10px] font-black underline underline-offset-4 text-blue-600 hover:text-blue-700 flex items-center">查看完整分析报表 <ChevronRight size={12} /></button></div>
        </div>
      </div>
    </div>
  );
};

// ========================== Main Component ==========================

type TabKey = 'plan' | 'execution' | 'stats';
type ModalType = 'none' | 'comprehensive' | 'taskDetail' | 'healthDetail' | 'resultsDetail' | 'analysisReport' | 'tempInspection' | 'templateConfig' | 'manualAssign';

const EquipmentInspection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('plan');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType>('none');

  // --- 重构：按设备分配负责人的状态 ---
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedEquipIds, setSelectedEquipIds] = useState<string[]>([]);
  
  // 模拟设备清单
  const [assignableEquipments, setAssignableEquipments] = useState([
    { id: 'EQ-IMG-CT01', name: 'GE 64排螺旋 CT', dept: '影像中心', assignee: '张工' },
    { id: 'EQ-IMG-MRI02', name: '西门子 3.0T MRI', dept: '影像中心', assignee: '王工' },
    { id: 'EQ-ICU-VEN02', name: '德尔格呼吸机 Evita', dept: '重症医学科', assignee: '未指派' },
    { id: 'EQ-ICU-MON05', name: '迈瑞全自动监护仪', dept: '重症医学科', assignee: '未指派' },
    { id: 'EQ-SUR-ANE01', name: '手术室麻醉机', dept: '外科手术室', assignee: '李工' },
    { id: 'EQ-LAB-BIO08', name: '罗氏生化分析仪', dept: '检验科', assignee: '待定' },
  ]);

  const filteredAssignEquipments = useMemo(() => {
    return assignableEquipments.filter(e => 
      e.name.toLowerCase().includes(assignSearch.toLowerCase()) || 
      e.id.toLowerCase().includes(assignSearch.toLowerCase())
    );
  }, [assignableEquipments, assignSearch]);

  const handleAssignToPerson = (personName: string) => {
    if (selectedEquipIds.length === 0) {
      alert('请先在左侧勾选需要分配的设备');
      return;
    }
    setAssignableEquipments(prev => prev.map(e => 
      selectedEquipIds.includes(e.id) ? { ...e, assignee: personName } : e
    ));
    setSelectedEquipIds([]);
  };

  // Mock trend data for charts
  const trendData = [
    { name: '1月', rate: 92, plan: 120, actual: 110, abnormal: 5, passRate: 98.2, failRate: 1.8 },
    { name: '2月', rate: 94, plan: 115, actual: 112, abnormal: 3, passRate: 97.5, failRate: 2.5 },
    { name: '3月', rate: 91, plan: 140, actual: 128, abnormal: 6, passRate: 96.8, failRate: 3.2 },
    { name: '4月', rate: 96, plan: 130, actual: 125, abnormal: 2, passRate: 98.5, failRate: 1.5 },
    { name: '5月', rate: 98, plan: 150, actual: 148, abnormal: 1, passRate: 99.1, failRate: 0.9 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="今日巡查任务" value="42" unit="件" icon={<ClipboardList className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="巡查完成率" value="95.2" unit="%" icon={<CheckCircle2 className="text-green-600" />} color="bg-green-50" />
        <StatCard title="待闭环异常" value="05" unit="例" icon={<AlertTriangle className="text-orange-600" />} color="bg-orange-50" />
        <StatCard title="异常修复平均耗时" value="3.5" unit="h" icon={<Clock className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} label="巡查计划管理" icon={<Calendar size={18} />} />
          <TabButton active={activeTab === 'execution'} onClick={() => setActiveTab('execution')} label="任务执行管理" icon={<RefreshCcw size={18} />} />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="数据统计与分析" icon={<BarChart3 size={18} />} />
        </div>

        <div className="p-6">
          {activeTab === 'plan' && (
            <PlanModule 
              onShowTemp={() => setModalType('tempInspection')} 
              onShowTemplate={() => setModalType('templateConfig')}
              onShowManual={() => setModalType('manualAssign')}
            />
          )}
          {activeTab === 'execution' && <ExecutionModule onShowDetail={setSelectedTaskDetail} />}
          {activeTab === 'stats' && <StatsModule data={trendData} onShowModal={setModalType} />}
        </div>
      </div>

      {selectedTaskDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTaskDetail(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={`px-8 py-6 text-white flex justify-between items-center shadow-lg ${selectedTaskDetail.status === 'abnormal' ? 'bg-red-600' : 'bg-blue-600'}`}>
               <div className="flex items-center space-x-3">
                 <FileSearch size={24} />
                 <h3 className="text-lg font-black tracking-tight">巡查单据明细看板</h3>
               </div>
               <button onClick={() => setSelectedTaskDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">设备名称</p>
                   <p className="text-sm font-black text-gray-800">{selectedTaskDetail.equipment}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">巡查人员</p>
                   <p className="text-sm font-bold text-gray-800 flex items-center"><Users size={14} className="mr-1.5 text-blue-500" /> {selectedTaskDetail.user}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">所属地点</p>
                   <p className="text-sm font-medium text-gray-600 flex items-center"><MapPin size={14} className="mr-1.5 text-blue-500" /> {selectedTaskDetail.dept}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase text-right">单据编号</p>
                   <p className="text-xs font-mono font-bold text-gray-400">{selectedTaskDetail.id}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">现场实拍记录</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="site pic 1" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="site pic 2" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">巡查检测数值对比</label>
                <div className="space-y-3">
                  <ValueRow label="电源电压稳定度" value="218.5V" standard="220V ±10%" status="normal" />
                  <ValueRow label="内部电池电压" value="11.2V" standard=">12.0V" status="abnormal" />
                  <ValueRow label="运行噪音分贝" value="42dB" standard="<55dB" status="normal" />
                  <ValueRow label="冷却液压力" value="0.4MPa" standard="0.3-0.5MPa" status="normal" />
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 mr-3"><MapPin size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-blue-900">执行位置校验</p>
                    <p className="text-[10px] text-blue-500">坐标: 31.2304, 121.4737 | 偏差: 2.1m (允许内)</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-green-600 flex items-center"><Check size={14} className="mr-1" /> 已核验</span>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50/50 flex space-x-4 shrink-0">
               <button onClick={() => setSelectedTaskDetail(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors">关闭明细</button>
               {selectedTaskDetail.status === 'abnormal' && (
                 <button className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center">
                   <AlertCircle size={20} className="mr-2" /> 发起转修工单
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {modalType !== 'none' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setModalType('none')}></div>
          
          {modalType === 'tempInspection' && (
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
              <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Zap size={24} />
                  <h3 className="text-lg font-black tracking-tight">发起临时/专项巡查任务</h3>
                </div>
                <button onClick={() => setModalType('none')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">1. 选择目标设备</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" placeholder="输入设备名称、ID或位置关键词..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">2. 巡查模板</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold text-gray-700">
                        <option>通用开机巡查</option><option>生命支持专项</option><option>电气安全排查</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">3. 任务优先级</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold text-gray-700">
                        <option>正常</option><option>高优先级</option><option>紧急状态</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">4. 指定执行人</label>
                    <div className="flex flex-wrap gap-2">
                      {['张工 (值班)', '李工', '王工'].map(u => (
                        <button key={u} className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-all">{u}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">5. 巡查备注/原因</label>
                    <textarea placeholder="例如：收到临床科室反馈电压波动..." className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"></textarea>
                  </div>
                </div>
                <div className="flex space-x-4 pt-2">
                  <button onClick={() => setModalType('none')} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black transition-colors">取消</button>
                  <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center hover:bg-blue-700 transition-all">
                    <CheckCircle2 size={18} className="mr-2" /> 确认派发
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalType === 'templateConfig' && (
            <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] border border-white">
              <div className="px-10 py-8 bg-blue-600 text-white flex justify-between items-center shrink-0 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-white"><Settings2 size={28} /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">巡查任务模板配置中心</h3>
                    <p className="text-xs text-white/50 mt-1 uppercase font-bold tracking-widest">规范巡查标准与合规性配置</p>
                  </div>
                </div>
                <button onClick={() => setModalType('none')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 scrollbar-hide flex gap-8">
                <div className="w-64 shrink-0 space-y-2">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">模板目录</p>
                   {['生命支持类', '影像诊断类', '手术急救类', '基础护理类'].map(cat => (
                     <button key={cat} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${cat === '生命支持类' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-white'}`}>{cat}</button>
                   ))}
                   <button className="w-full mt-4 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-black text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all"><Plus size={16} className="mr-1" /> 新增类别</button>
                </div>
                <div className="flex-1 space-y-8">
                   <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-black text-gray-800">“生命支持类” 标准巡查细项</h4>
                        <div className="flex space-x-2"><button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Plus size={20}/></button></div>
                      </div>
                      <div className="space-y-4">
                        <ConfigRow label="外观检查" desc="检查外壳、线缆及附件完整性" required />
                        <ConfigRow label="电源/电池状态" desc="检查交流供电指示及内置电池电压" required />
                        <ConfigRow label="报警音量测试" desc="验证声光报警有效性" required />
                        <ConfigRow label="管路密闭性" desc="静态及动态压力自检结果" />
                      </div>
                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex items-center space-x-6">
                           <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">默认巡查周期</p>
                             <select className="text-sm font-black text-blue-600 bg-transparent outline-none cursor-pointer"><option>每日一次</option><option>每周两次</option><option>每旬一次</option></select>
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">异常处理逻辑</p>
                             <span className="text-sm font-black text-red-500">自动转修工单</span>
                           </div>
                         </div>
                         <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center">
                           <Save size={18} className="mr-2" /> 保存当前模板
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* RECONFIGURED: Manual Responsibility Assignment */}
          {modalType === 'manualAssign' && (
            <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white max-h-[90vh]">
              <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center shrink-0 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-2xl"><UserPlus size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">巡查责任人精细化分配</h3>
                    <p className="text-xs text-white/60 mt-1 uppercase font-bold tracking-widest">基于单体设备资产的责任指派系统</p>
                  </div>
                </div>
                <button onClick={() => setModalType('none')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Left: Device Selection List */}
                <div className="flex-1 bg-gray-50/50 p-8 flex flex-col border-r border-gray-100">
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">第一步：选择待分配设备资产</label>
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">已选 {selectedEquipIds.length} 台</span>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={assignSearch}
                        onChange={(e) => setAssignSearch(e.target.value)}
                        placeholder="通过设备名称或设备编号(ID)检索..." 
                        className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm transition-all" 
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
                    {filteredAssignEquipments.map(eq => {
                      const isSelected = selectedEquipIds.includes(eq.id);
                      return (
                        <div 
                          key={eq.id} 
                          onClick={() => setSelectedEquipIds(prev => isSelected ? prev.filter(id => id !== eq.id) : [...prev, eq.id])}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected ? 'bg-white border-indigo-600 shadow-lg scale-[1.02]' : 'bg-white border-transparent hover:border-indigo-100'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200 group-hover:border-indigo-200'
                            }`}>
                              {isSelected && <Check size={16} className="text-white" strokeWidth={4} />}
                            </div>
                            <div>
                               <p className="text-sm font-black text-gray-800">{eq.name}</p>
                               <p className="text-[10px] font-mono text-gray-400 mt-0.5 flex items-center">
                                 <HardDrive size={10} className="mr-1"/> {eq.id} <span className="mx-2 opacity-30">|</span> <MapPin size={10} className="mr-1"/> {eq.dept}
                               </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">当前负责人</p>
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                               eq.assignee === '未指派' || eq.assignee === '待定' ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-600'
                             }`}>{eq.assignee}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: People Selection */}
                <div className="w-80 p-8 flex flex-col">
                   <div className="mb-6 px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">第二步：指派给工程师</label>
                   </div>
                   <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                      {[
                        { name: '王立国', role: '资深工程师', group: '维保一组', count: 12 },
                        { name: '赵大海', role: '中级工程师', group: '维保一组', count: 8 },
                        { name: '周杰明', role: '巡检员', group: '生命支持组', count: 5 },
                        { name: '陈晓', role: '外协维保', group: '厂商服务组', count: 3 },
                      ].map(person => (
                        <div 
                          key={person.name}
                          onClick={() => handleAssignToPerson(person.name)}
                          className="p-4 rounded-[24px] border border-gray-100 bg-white hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight size={20} className="text-indigo-600" />
                           </div>
                           <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg mb-3 ring-4 ring-white shadow-sm">{person.name.slice(0,1)}</div>
                           <h5 className="text-sm font-black text-gray-800">{person.name}</h5>
                           <p className="text-[10px] font-bold text-gray-400 mt-1">{person.role} · {person.group}</p>
                           <div className="mt-4 px-3 py-1 bg-gray-50 rounded-full text-[9px] font-black text-gray-500">
                             当前管理: <span className="text-indigo-600">{person.count}</span> 台设备
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed italic text-center">
                     * 选中左侧设备后点击人员卡片即可完成“一键指派”。
                   </div>
                </div>
              </div>

              <div className="p-10 border-t bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center text-xs text-gray-400 font-bold italic">
                  <ShieldAlert size={16} className="mr-2 text-indigo-500" /> 指派动作将实时同步至资产档案与移动端作业库
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setModalType('none')} className="px-10 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black hover:bg-gray-200 transition-all">
                    取消分配
                  </button>
                  <button onClick={() => setModalType('none')} className="px-12 py-4 bg-indigo-600 text-white rounded-[20px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                    保存并应用变更
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statistical Detail Reports (Keep existing logic) */}
          {['comprehensive', 'taskDetail', 'healthDetail', 'resultsDetail', 'analysisReport'].includes(modalType) && (
            <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] border border-white">
              <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md"><BarChartIcon size={20} /></div>
                   <div>
                     <h3 className="text-lg font-black text-gray-800">
                       {modalType === 'comprehensive' && '巡查效能分析综合报告'}
                       {modalType === 'taskDetail' && '巡查计划执行电子台账'}
                       {modalType === 'healthDetail' && '设备健康分布及合格率分析'}
                       {modalType === 'resultsDetail' && '巡查结果汇总与异常分析'}
                       {modalType === 'analysisReport' && '诊断与建议'}
                     </h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">数据洞察与统计分析报告</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   {['comprehensive'].includes(modalType) && (
                     <button className="p-2 text-gray-400 hover:text-indigo-600 transition-all"><Printer size={18}/></button>
                   )}
                   <button onClick={() => setModalType('none')} className="p-2 text-gray-400 hover:text-red-500 transition-all"><X size={24}/></button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-gray-50/30">
                {modalType === 'comprehensive' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-4 gap-4">
                      <ReportMiniStat label="累计巡查总数" value="1,280" unit="件" />
                      <ReportMiniStat label="系统自动打分" value="98.5" unit="分" color="text-green-600" />
                      <ReportMiniStat label="风险预警点" value="03" unit="处" color="text-red-500" />
                      <ReportMiniStat label="人均巡查负载" value="45" unit="件/周" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-black text-gray-700 mb-6 flex items-center"><TrendingUp size={16} className="mr-2 text-blue-600"/> 月度巡查合格率趋势分析</h4>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                  <YAxis hide domain={[90, 100]} />
                                  <Tooltip />
                                  <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={3} fill="#eef2ff" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                            <h5 className="text-xs font-black text-indigo-900 mb-4 tracking-widest uppercase flex items-center"><ShieldCheck size={14} className="mr-2"/> 效能总结摘要</h5>
                            <p className="text-xs text-indigo-700 leading-relaxed font-medium">本周期内（5月）全院设备巡查覆盖率达到 100%。重点区域（ICU/手术室）巡查合格率环比提升 1.2%。发现 3 处传感器老化隐患，均已通过系统自动生成工单闭环。巡查人均耗时缩短 8%。</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white text-[9px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-100">高覆盖率</span>
                                <span className="px-2 py-1 bg-white text-[9px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-100">响应加速</span>
                                <span className="px-2 py-1 bg-white text-[9px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-100">隐患识别中</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">科室级巡查效能统计明细</h4>
                          <span className="text-[10px] text-gray-400 italic">共 12 个关联科室</span>
                       </div>
                       <table className="w-full text-[11px] border-collapse">
                         <thead className="bg-white text-gray-500 font-bold border-b text-left">
                           <tr>
                             <th className="px-6 py-3">科室名称</th>
                             <th className="px-6 py-3">计划数</th>
                             <th className="px-6 py-3">实测数</th>
                             <th className="px-6 py-3">平均响应(h)</th>
                             <th className="px-6 py-3">异常闭环率</th>
                             <th className="px-6 py-3">效能评定</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {[
                             { d: '重症医学科', p: 450, a: 450, t: 1.2, r: '100%', s: '优' },
                             { d: '医学影像中心', p: 320, a: 315, t: 2.5, r: '92%', s: '良' },
                             { d: '心血管内科', p: 280, a: 280, t: 1.8, r: '100%', s: '优' },
                             { d: '急诊大厅', p: 200, a: 200, t: 0.8, r: '100%', s: '特快' }
                           ].map((row, i) => (
                             <tr key={i} className="hover:bg-blue-50/20">
                               <td className="px-6 py-3 font-black text-gray-700">{row.d}</td>
                               <td className="px-6 py-3 text-gray-500 font-mono">{row.p}</td>
                               <td className="px-6 py-3 text-gray-500 font-mono">{row.a}</td>
                               <td className="px-6 py-3 text-indigo-600 font-bold">{row.t}</td>
                               <td className="px-6 py-3 text-green-600 font-bold">{row.r}</td>
                               <td className="px-6 py-3">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-black ${row.s === '优' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{row.s}</span>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>
                )}

                {modalType === 'taskDetail' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3"><div className="w-1.5 h-6 bg-indigo-600"></div><h4 className="text-sm font-black text-gray-800 tracking-wider">巡查任务明细流水表</h4></div>
                     </div>
                     <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg shadow-gray-100">
                       <table className="w-full text-[11px] border-collapse">
                         <thead className="bg-[#f8fafc] text-gray-500 font-bold border-b border-gray-200 text-left">
                           <tr>
                             <th className="px-4 py-3 border-r border-gray-200">单据 ID</th>
                             <th className="px-4 py-3 border-r border-gray-200">受检设备名称</th>
                             <th className="px-4 py-3 border-r border-gray-200">执行科室</th>
                             <th className="px-4 py-3 border-r border-gray-200">责任人</th>
                             <th className="px-4 py-3 border-r border-gray-200">状态</th>
                             <th className="px-4 py-3 border-r border-gray-200">位置偏差</th>
                             <th className="px-4 py-3">巡查结果</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {[1,2,3,4,5,6,7,8].map(i => (
                             <tr key={i} className="hover:bg-blue-50/20">
                               <td className="px-4 py-3 border-r border-gray-200 font-mono text-gray-400">AUD-0922{i}</td>
                               <td className="px-4 py-3 border-r border-gray-200 font-black text-gray-700">MRI 1.5T 扫描仪</td>
                               <td className="px-4 py-3 border-r border-gray-200 font-medium text-gray-500 text-[10px]">影像科室中心</td>
                               <td className="px-4 py-3 border-r border-gray-200 font-bold text-gray-600">王立国</td>
                               <td className="px-4 py-3 border-r border-gray-200">
                                 <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">已闭环</span>
                               </td>
                               <td className="px-4 py-3 border-r border-gray-200 text-gray-400 font-mono italic">0.52m</td>
                               <td className="px-4 py-3 font-black text-blue-600">全部正常</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                  </div>
                )}

                {modalType === 'healthDetail' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 w-full">合格率雷达分析</h4>
                       <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{ subject: '呼吸机', A: 98 }, { subject: '监护仪', A: 85 }, { subject: '除颤仪', A: 92 }, { subject: '血透机', A: 78 }, { subject: '麻醉机', A: 95 }]}>
                             <PolarGrid />
                             <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold'}} />
                             <Radar name="合格率" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                             <Tooltip />
                           </RadarChart>
                         </ResponsiveContainer>
                       </div>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">科室健康排名 (前五名)</h4>
                       <div className="space-y-6">
                         {[
                           { dept: '心血管内科', score: 99.2, status: '优' },
                           { dept: '消化内科', score: 98.5, status: '优' },
                           { dept: '重症 ICU', score: 96.8, status: '良' },
                           { dept: '影像中心', score: 94.2, status: '良' },
                           { dept: '儿科病区', score: 88.5, status: '中' },
                         ].map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${idx < 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{idx + 1}</span>
                                <span className="text-sm font-black text-gray-700">{item.dept}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-mono font-black text-indigo-600">{item.score}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${item.status === '优' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{item.status}</span>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}

                {modalType === 'resultsDetail' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">任务信息概览</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end"><span className="text-xs text-gray-500 font-bold">总巡查任务数</span><span className="text-xl font-black text-gray-800">1,280</span></div>
                                <div className="flex justify-between items-end"><span className="text-xs text-gray-500 font-bold">正常运行数</span><span className="text-xl font-black text-green-500">1,248</span></div>
                                <div className="flex justify-between items-end"><span className="text-xs text-gray-500 font-bold">发现异常数</span><span className="text-xl font-black text-red-500">32</span></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <h4 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest w-full">结果分布统计</h4>
                            <div className="h-32 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: '正常', value: 97.5 }, { name: '轻微', value: 2.0 }, { name: '严重', value: 0.5 }]} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none"><Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                            <div className="mt-2 flex space-x-3 text-[9px] font-bold">
                                <span className="flex items-center text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"/> 97.5% 正常</span>
                                <span className="flex items-center text-orange-500"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"/> 2.0% 预警</span>
                            </div>
                        </div>
                        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col justify-center">
                            <h4 className="text-[10px] font-black text-indigo-200 mb-2 uppercase tracking-widest">总体健康评估</h4>
                            <p className="text-2xl font-black text-white">健康等级：A</p>
                            <p className="text-[10px] text-indigo-100 mt-2 font-medium">院内 95% 的核心设备处于最佳运行区间。</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                          <h5 className="text-xs font-black text-gray-600 uppercase tracking-widest">受检设备明细表 (故障风险项优先)</h5>
                          <button className="text-[10px] font-black text-blue-600 flex items-center">查看全量 <ChevronRight size={12}/></button>
                       </div>
                       <table className="w-full text-[11px]">
                         <thead className="bg-white text-gray-400 font-bold border-b">
                           <tr>
                             <th className="px-6 py-3 text-left">设备名称/ID</th>
                             <th className="px-6 py-3 text-left">所属科室</th>
                             <th className="px-6 py-3 text-left">最近巡查点</th>
                             <th className="px-6 py-3 text-center">状态标注</th>
                             <th className="px-6 py-3 text-center">风险分值</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {[
                             { n: '德尔格呼吸机 Evita', i: 'VEN-001', d: '重症医学科', p: '内置电池自检', s: '低电量预警', r: 85 },
                             { n: '西门子 3.0T MRI', i: 'MRI-092', d: '影像中心', p: '冷却泵运行分贝', s: '正常', r: 98 },
                             { n: '飞利浦除颤监护仪', i: 'DEF-110', d: '急诊抢救室', p: '放电能量校准', s: '偏差偏大', r: 72 },
                           ].map((item, i) => (
                             <tr key={i} className="hover:bg-gray-50">
                               <td className="px-6 py-3"><p className="font-black text-gray-800">{item.n}</p><p className="text-[9px] text-gray-400 font-mono">{item.i}</p></td>
                               <td className="px-6 py-3 text-gray-500 font-medium">{item.d}</td>
                               <td className="px-6 py-3 text-gray-500">{item.p}</td>
                               <td className="px-6 py-3 text-center">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${item.s === '正常' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{item.s}</span>
                               </td>
                               <td className="px-6 py-3 text-center font-mono font-black text-gray-400">{item.r}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>

                    <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 space-y-4">
                       <h5 className="text-xs font-black text-red-800 uppercase tracking-widest flex items-center"><AlertTriangle size={14} className="mr-2"/> 针对性异常管理建议</h5>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 bg-white rounded-2xl border border-red-50 shadow-sm space-y-2">
                            <p className="text-[10px] font-black text-red-500 uppercase">针对“除颤监护仪”偏差建议</p>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">系统检测到该批次设备放电能量平均偏差达 8%，建议下周发起一次“专项能量标定”任务，并核查附件电极板的氧化情况。</p>
                         </div>
                         <div className="p-4 bg-white rounded-2xl border border-red-50 shadow-sm space-y-2">
                            <p className="text-[10px] font-black text-orange-500 uppercase">针对“影像设备”冷却泵建议</p>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">目前分贝数接近报警阈值，建议巡查员在移动端开启音频取样分析功能，防范泵体轴承故障停机风险。</p>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                {modalType === 'analysisReport' && (
                  <div className="max-w-3xl mx-auto space-y-10 py-10 font-sans animate-in zoom-in-95 duration-500">
                    <div className="text-center border-b pb-8">
                       <h2 className="text-2xl font-black tracking-widest text-gray-900 underline underline-offset-8 decoration-indigo-200">诊断建议报告</h2>
                       <p className="text-[10px] text-gray-400 mt-4 tracking-[0.2em] font-bold">自动化智能诊断报表</p>
                    </div>
                    <div className="space-y-12">
                       <AdviceBlock 
                          title="高价值资产预防性维护维护调整建议" 
                          level="H" 
                          content="数据检测显示影像中心西门子 MRI 梯度功放室温在夜间 02:00 存在均温过高现象（约 26.5℃），虽未触发机房报警，但长期运行可能缩短功放模块寿命。建议巡查员增加针对精密空调运行电流的专项核查。" 
                          suggest="将该机房巡查频次临时提升至 2 次/日。"
                       />
                       <AdviceBlock 
                          title="生命支持类耗材库存联动预警" 
                          level="M" 
                          content="根据呼吸机管路巡查清洁记录，本月管路损耗率环比上升 22%。系统分析显示可能与消毒液浓度调整有关。建议资产部协同药剂科核查消毒流程。" 
                          suggest="建议申领下一季度耗材储备量增加 15%。"
                       />
                       <AdviceBlock 
                          title="巡查人员作业饱和度优化" 
                          level="L" 
                          content="影像运维组目前巡查人均覆盖设备 85 台，已达到负载红线，且平均打卡误差呈现上升趋势。而基础护理组巡查负载较低。" 
                          suggest="建议通过系统重新调配 5F-6F 的护理床位巡查至维保二组。"
                       />
                    </div>
                    <div className="pt-20 text-center border-t italic text-[10px] text-gray-300 font-bold">本建议基于 HIS/SPD 与设备巡查大数据模型生成，仅供管理决策参考。</div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center text-xs text-gray-400 font-bold italic">
                  <ShieldAlert size={14} className="mr-2 text-indigo-500" /> 审计数据受院内保密协议保护，请勿跨级泄露核心数据
                </div>
                
                <div className="flex space-x-3">
                   {modalType === 'comprehensive' && (
                     <>
                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-black text-xs flex items-center hover:bg-gray-50 transition-all active:scale-95">
                           <FileSpreadsheet size={16} className="mr-2 text-green-600" /> 下载 Excel 报告
                        </button>
                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                           <Download size={16} className="mr-2" /> 下载 PDF 报告
                        </button>
                     </>
                   )}

                   {modalType === 'taskDetail' && (
                     <>
                        <button onClick={() => setModalType('none')} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">
                           返回看板
                        </button>
                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                           <Download size={16} className="mr-2" /> 导出报表
                        </button>
                     </>
                   )}

                   {['healthDetail', 'resultsDetail'].includes(modalType) && (
                     <>
                        <button onClick={() => setModalType('none')} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">
                           返回看板
                        </button>
                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-black text-xs flex items-center hover:bg-gray-50 transition-all active:scale-95">
                           <FileSpreadsheet size={16} className="mr-2 text-green-600" /> 导出 Excel
                        </button>
                     </>
                   )}

                   {modalType === 'analysisReport' && (
                     <>
                        <button onClick={() => setModalType('none')} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">
                           返回看板
                        </button>
                        <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-100 flex items-center hover:bg-indigo-700 transition-all active:scale-95">
                           <FileDown size={18} className="mr-2" /> 导出PDF
                        </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentInspection;
