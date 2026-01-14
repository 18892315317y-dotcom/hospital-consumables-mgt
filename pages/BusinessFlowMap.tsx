
import React from 'react';
import { 
  Database, 
  ClipboardCheck, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Users, 
  FileText, 
  HardDrive,
  Activity,
  Package,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const BusinessFlowMap: React.FC = () => {
  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">业务全景流程地图</h2>
          <p className="text-sm text-gray-400 mt-1">可视化系统核心业务逻辑闭环，涵盖从基础同步到决策分析的完整链条</p>
        </div>
        <div className="flex items-center space-x-6 text-[11px] font-bold text-gray-400">
           <div className="flex items-center"><div className="w-3 h-3 rounded bg-blue-500 mr-2"></div> 核心业务流</div>
           <div className="flex items-center"><div className="w-3 h-3 rounded bg-orange-500 mr-2"></div> 预警/审计流</div>
           <div className="flex items-center"><div className="w-3 h-3 rounded bg-green-500 mr-2"></div> 数据归口流</div>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-10">
        <div className="min-w-[1200px] space-y-24 py-10 relative">
          
          {/* 背景泳道 (可选) */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
             <div className="h-1/4 border-b border-gray-900 flex items-center pl-4 font-black uppercase tracking-widest text-4xl">System Layer</div>
             <div className="h-1/4 border-b border-gray-900 flex items-center pl-4 font-black uppercase tracking-widest text-4xl">Clinical Layer</div>
             <div className="h-1/4 border-b border-gray-900 flex items-center pl-4 font-black uppercase tracking-widest text-4xl">Asset Layer</div>
             <div className="h-1/4 flex items-center pl-4 font-black uppercase tracking-widest text-4xl">Analysis Layer</div>
          </div>

          {/* 第一排：基础数据层 (The Foundation) */}
          <div className="flex justify-between items-center relative z-10">
             <FlowNode 
               icon={<Database className="text-gray-500" />} 
               title="外部 HIS / SPD 系统" 
               desc="全院物资主数据库" 
               color="border-gray-200"
               type="external"
             />
             <Connector label="定时全量同步" color="blue" />
             <FlowNode 
               icon={<ShieldCheck className="text-blue-600" />} 
               title="院内集采目录" 
               desc="规范品种、价格、厂家映射" 
               color="border-blue-200 shadow-blue-50"
             />
             <Connector label="标准库下发" color="blue" />
             <FlowNode 
               icon={<HardDrive className="text-indigo-600" />} 
               title="设备资产档案" 
               desc="单机精细化全生命周期管理" 
               color="border-indigo-200 shadow-indigo-50"
             />
          </div>

          {/* 第二排：业务执行层 (Action & Approval) */}
          <div className="flex justify-between items-center relative z-10">
             <FlowNode 
               icon={<Users className="text-blue-500" />} 
               title="科室需求发起" 
               desc="基于临床实际需求发起申报" 
               color="border-blue-400"
             />
             <Connector label="自定义审批流引擎" color="orange" dashed />
             <FlowNode 
               icon={<Zap className="text-orange-500" />} 
               title="多级联合审核" 
               desc="科主任 -> 职能处室 -> 院领导" 
               color="border-orange-300 shadow-orange-50"
             />
             <Connector label="审核通过" color="green" />
             <FlowNode 
               icon={<FileText className="text-green-600" />} 
               title="合同与执行" 
               desc="合同付款节点监控与采购执行" 
               color="border-green-400 shadow-green-50"
             />
          </div>

          {/* 第三排：运行状态层 (Operational State) */}
          <div className="flex justify-between items-center relative z-10">
             <FlowNode 
               icon={<RotateCcw className="text-purple-600" />} 
               title="设备领用与归还" 
               desc="资产实物状态动态追踪" 
               color="border-purple-200 shadow-purple-50"
             />
             <Connector label="巡查/维保工单" color="blue" />
             <FlowNode 
               icon={<Activity className="text-blue-600" />} 
               title="日常巡检与预警" 
               desc="异常自动转修、电池寿命预警" 
               color="border-blue-200"
             />
             <Connector label="报废评估" color="red" />
             <FlowNode 
               icon={<Trash2 className="text-red-500" />} 
               title="设备报废处置" 
               desc="残值核销、技术鉴定、物理移除" 
               color="border-red-400 shadow-red-50"
             />
          </div>

          {/* 第四排：分析看板层 (Dashboard & Audit) */}
          <div className="flex justify-center items-center relative z-10">
             <div className="bg-gray-900 text-white p-10 rounded-[50px] shadow-2xl flex items-center space-x-12 border-4 border-gray-800">
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl"><TrendingUp size={32} /></div>
                   <p className="text-sm font-black tracking-widest uppercase">效益分析 ROI</p>
                </div>
                <div className="w-px h-20 bg-gray-700"></div>
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl"><AlertTriangle size={32} /></div>
                   <p className="text-sm font-black tracking-widest uppercase">集采审计 VBP</p>
                </div>
                <div className="w-px h-20 bg-gray-700"></div>
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl"><ShieldCheck size={32} /></div>
                   <p className="text-sm font-black tracking-widest uppercase">全景看板</p>
                </div>
             </div>
          </div>

          {/* 装饰连接线 - 全局数据反馈 (SVG) */}
          <svg className="absolute inset-0 w-full h-full z-[-1] pointer-events-none" style={{ minHeight: '1000px' }}>
            {/* 这里的连接线由于是动态布局，在实际组件中可能需要更复杂的计算，原型中先固定关键路径 */}
            <path d="M 1150 750 L 1150 850" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

        </div>
      </div>

      {/* 底部业务说明 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
        <div className="space-y-3">
           <h4 className="text-sm font-black text-gray-800 flex items-center"><Package className="mr-2 text-blue-600" size={18}/> 目录治理核心</h4>
           <p className="text-xs text-gray-500 leading-relaxed italic">“系统不仅仅记录领用，更关注目录的合规。每一笔临采都会触发自动审计，确保集采替代品种的最高优先权。”</p>
        </div>
        <div className="space-y-3">
           <h4 className="text-sm font-black text-gray-800 flex items-center"><Building2 className="mr-2 text-orange-600" size={18}/> 职责闭环模型</h4>
           <p className="text-xs text-gray-500 leading-relaxed italic">“审批流与资产责任人深度绑定。巡查记录、维修工单、效益分析形成闭环，实现从物理实物到财务资产的统一治理。”</p>
        </div>
        <div className="space-y-3">
           <h4 className="text-sm font-black text-gray-800 flex items-center"><Activity className="mr-2 text-green-600" size={18}/> 数据价值归口</h4>
           <p className="text-xs text-gray-500 leading-relaxed italic">“通过对接 HIS 计费接口，系统能自动核算每台设备的边际效益，解决传统管理中‘家底不清、收益不明’的痛点。”</p>
        </div>
      </div>
    </div>
  );
};

// 子组件：流程节点
const FlowNode = ({ icon, title, desc, color, type = 'normal' }: any) => (
  <div className={`p-6 rounded-[32px] border-2 bg-white flex flex-col items-center text-center w-64 transition-all hover:scale-105 shadow-sm ${color} ${type === 'external' ? 'bg-gray-50 border-dashed' : ''}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${type === 'external' ? 'bg-gray-200' : 'bg-white shadow-md'}`}>
      {icon}
    </div>
    <h4 className={`text-sm font-black mb-1 ${type === 'external' ? 'text-gray-400' : 'text-gray-800'}`}>{title}</h4>
    <p className="text-[10px] text-gray-400 font-bold leading-tight uppercase">{desc}</p>
  </div>
);

// 子组件：连接线
const Connector = ({ label, color, dashed = false }: { label: string, color: 'blue' | 'orange' | 'green' | 'red', dashed?: boolean }) => {
  const colorMap = {
    blue: 'border-blue-500 text-blue-500',
    orange: 'border-orange-500 text-orange-500',
    green: 'border-green-500 text-green-500',
    red: 'border-red-500 text-red-500',
  };
  return (
    <div className="flex-1 px-4 flex flex-col items-center justify-center space-y-2">
      <span className={`text-[9px] font-black uppercase tracking-widest ${colorMap[color].split(' ')[1]}`}>{label}</span>
      <div className={`w-full border-b-2 ${dashed ? 'border-dashed' : ''} ${colorMap[color].split(' ')[0]}`}></div>
    </div>
  );
};

const Trash2 = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

export default BusinessFlowMap;
