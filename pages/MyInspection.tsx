
import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  MapPin, 
  Camera, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ChevronRight,
  MoreVertical,
  X,
  Upload,
  History,
  LayoutGrid
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  location: string;
  deadline: string;
  status: 'pending' | 'processing' | 'completed';
  priority: 'high' | 'normal';
  specs?: string[];
}

const MyInspection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'history'>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  // 模拟当前人员任务
  const myTasks: Task[] = [
    { id: 'T-2024-001', name: 'ICU 德尔格呼吸机每日巡查', location: '住院楼 3F-ICU 01床', deadline: '今日 12:00 前', status: 'pending', priority: 'high', specs: ['电池电量', '报警音测试', '管路清洁'] },
    { id: 'T-2024-002', name: '影像科 CT 扫描仪开机巡查', location: '门诊楼 1F-CT 室', deadline: '今日 09:00 前', status: 'completed', priority: 'high' },
    { id: 'T-2024-003', name: '急诊中心除颤仪状态核对', location: '急诊大厅-抢救室', deadline: '今日 18:00 前', status: 'pending', priority: 'normal', specs: ['放电测试', '记录纸余量', '有效期贴'] },
    { id: 'T-2024-004', name: '手术室麻醉机例行检查', location: '手术室 05间', deadline: '明日 08:30 前', status: 'pending', priority: 'normal', specs: ['气密性自检', '挥发罐存量'] },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 个人作业概览 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">我的巡查作业</h2>
            <p className="text-xs text-gray-400 mt-0.5">今日待处理：<span className="text-blue-600 font-bold">3</span> 份 | 逾期预警：<span className="text-red-500 font-bold">0</span></p>
          </div>
        </div>
        <div className="flex items-center p-1 bg-gray-50 rounded-xl">
          <button 
            onClick={() => setActiveTab('todo')} 
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'todo' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            待办任务
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            巡查历史
          </button>
        </div>
      </div>

      {activeTab === 'todo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {myTasks.filter(t => t.status !== 'completed').map(task => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
            >
              {task.priority === 'high' && <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 flex items-start justify-end p-1 rounded-bl-3xl font-black text-[9px] text-red-500">紧急</div>}
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">{task.id}</span>
                <Clock size={16} className={task.priority === 'high' ? 'text-red-400 animate-pulse' : 'text-gray-300'} />
              </div>
              <h3 className="font-black text-gray-800 text-base leading-tight group-hover:text-blue-600 transition-colors">{task.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-xs text-gray-500"><MapPin size={12} className="mr-2 text-blue-400" /> {task.location}</div>
                <div className="flex items-center text-xs text-gray-500 font-bold"><Clock size={12} className="mr-2 text-orange-400" /> 截止：{task.deadline}</div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4 border-gray-50">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">待打卡</span>
                <span className="text-blue-600 font-bold text-xs flex items-center">开始巡查 <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" /></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-300">
           <div className="px-6 py-4 bg-gray-50/50 border-b flex justify-between items-center">
             <h4 className="text-sm font-bold text-gray-700">最近完成的巡查记录</h4>
             <button className="flex items-center text-xs font-bold text-blue-600 hover:underline">
               <Download size={14} className="mr-1.5" /> 批量导出报告
             </button>
           </div>
           <table className="w-full text-left">
             <thead className="text-[10px] text-gray-400 font-bold uppercase border-b bg-white">
               <tr>
                 <th className="px-6 py-4">巡查单号</th>
                 <th className="px-6 py-4">巡查项目</th>
                 <th className="px-4 py-4">完成时间</th>
                 <th className="px-4 py-4">巡查结果</th>
                 <th className="px-6 py-4 text-center">报告</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {myTasks.filter(t => t.status === 'completed').map(item => (
                 <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                   <td className="px-6 py-4 font-mono text-[10px] text-gray-400 font-bold">{item.id}</td>
                   <td className="px-6 py-4 font-bold text-gray-700 text-sm">{item.name}</td>
                   <td className="px-4 py-4 text-xs text-gray-500 font-medium">今日 08:45</td>
                   <td className="px-4 py-4">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                       <CheckCircle2 size={10} className="mr-1" /> 运行正常
                     </span>
                   </td>
                   <td className="px-6 py-4 text-center">
                     <button 
                        onClick={() => setReportPreview(item.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                       <FileText size={18} />
                     </button>
                   </td>
                 </tr>
               ))}
               <tr className="hover:bg-gray-50/50 transition-colors">
                 <td className="px-6 py-4 font-mono text-[10px] text-gray-400 font-bold">T-2024-982</td>
                 <td className="px-6 py-4 font-bold text-gray-700 text-sm">血透室反渗透水处理设备</td>
                 <td className="px-4 py-4 text-xs text-gray-500 font-medium">昨日 16:20</td>
                 <td className="px-4 py-4">
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                     <AlertCircle size={10} className="mr-1" /> 建议保养
                   </span>
                 </td>
                 <td className="px-6 py-4 text-center">
                   <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FileText size={18} /></button>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>
      )}

      {/* 巡查作业弹窗 */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0 shadow-lg">
               <div className="flex items-center space-x-3">
                 <ClipboardCheck size={24} />
                 <h3 className="text-lg font-black tracking-tight">巡查作业填报</h3>
               </div>
               <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {/* 基础信息 */}
              <div className="flex items-start justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div>
                   <h4 className="text-base font-black text-blue-900">{selectedTask.name}</h4>
                   <p className="text-xs text-blue-600 font-medium mt-1 flex items-center"><MapPin size={12} className="mr-1" /> {selectedTask.location}</p>
                </div>
                <span className="text-[10px] bg-white text-blue-600 px-2 py-1 rounded font-bold border border-blue-100 shadow-sm">{selectedTask.id}</span>
              </div>

              {/* 核心填报区 */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">1. 状态勾选</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center p-4 rounded-2xl border-2 border-green-500 bg-green-50 text-green-700 font-black transition-all">
                      <CheckCircle2 size={20} className="mr-2" /> 运行正常
                    </button>
                    <button className="flex items-center justify-center p-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-400 font-black hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
                      <AlertCircle size={20} className="mr-2" /> 发现异常
                    </button>
                  </div>
                </div>

                {selectedTask.specs && (
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">2. 细项检查 (数值填报)</label>
                    <div className="space-y-3">
                      {selectedTask.specs.map(spec => (
                        <div key={spec} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-sm font-bold text-gray-700">{spec}</span>
                          <div className="flex items-center space-x-2">
                             <input type="text" placeholder="记录值..." className="w-24 px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                             <span className="text-[10px] text-gray-400 font-bold">单位</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">3. 现场照片上传 (必填项)</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all">
                      <Camera size={24} />
                      <span className="text-[9px] font-bold mt-1">拍摄照片</span>
                    </div>
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <X size={16} className="text-white cursor-pointer" />
                       </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">4. 备注说明</label>
                  <textarea 
                    placeholder="请输入额外说明或发现的问题细节..." 
                    className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50/50 flex space-x-4 shrink-0">
               <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors">取消</button>
               <button 
                onClick={() => setSelectedTask(null)}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center"
               >
                 <CheckCircle2 size={20} className="mr-2" /> 提交巡查记录
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 报告预览弹窗 */}
      {reportPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportPreview(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8">
               <div className="flex justify-between items-center border-b pb-6 mb-8">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-600 text-white rounded-lg"><FileText size={24} /></div>
                   <h3 className="text-xl font-black text-gray-800 tracking-tight">巡查作业报告单预览</h3>
                 </div>
                 <button onClick={() => setReportPreview(null)}><X size={24} className="text-gray-400"/></button>
               </div>
               
               <div className="p-10 border-2 border-gray-100 rounded-2xl space-y-8 font-serif">
                 <div className="text-center space-y-2 border-b-2 border-double border-gray-200 pb-6">
                    <h2 className="text-2xl font-black tracking-widest text-gray-900 underline underline-offset-8 decoration-gray-300">医院设备例行巡查报告单</h2>
                    <p className="text-xs text-gray-400 font-sans italic tracking-widest">HOSPITAL EQUIPMENT INSPECTION RECORD</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-y-4 text-sm font-sans">
                    <p><span className="text-gray-400 font-bold mr-4">巡查单号:</span> <span className="font-mono font-black underline">RPT-2024-051821</span></p>
                    <p><span className="text-gray-400 font-bold mr-4">巡查日期:</span> <span className="font-bold underline">2024-05-18 09:30</span></p>
                    <p><span className="text-gray-400 font-bold mr-4">受检科室:</span> <span className="font-bold underline">心内科 ICU 重症中心</span></p>
                    <p><span className="text-gray-400 font-bold mr-4">巡查人员:</span> <span className="font-bold underline">张工 (E-091)</span></p>
                 </div>

                 <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/30">
                    <p className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">受检设备：{reportPreview}</p>
                    <div className="space-y-4 text-sm">
                       <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500 font-medium">1. 外观检查</span>
                         <span className="text-green-600 font-black">合格 (PASS)</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500 font-medium">2. 电源电压自检</span>
                         <span className="font-bold">220V (标称)</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500 font-medium">3. 运行噪音/散热</span>
                         <span className="text-green-600 font-black">正常 (NORMAL)</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between pt-10 border-t border-gray-100">
                    <div className="flex flex-col items-center">
                       <div className="w-24 h-12 border-b border-gray-300 mb-2 font-mono flex items-end justify-center">张三</div>
                       <span className="text-[10px] text-gray-400 font-bold">巡查人电子签名</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="w-24 h-12 border-b border-gray-300 mb-2 font-mono flex items-end justify-center italic text-blue-400 opacity-50">院内系统核验码</div>
                       <span className="text-[10px] text-gray-400 font-bold">科室负责人复核</span>
                    </div>
                 </div>
               </div>

               <div className="mt-8 flex space-x-4">
                 <button className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">打印单据</button>
                 <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center">
                   <Download size={18} className="mr-2" /> 导出报告 (PDF)
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInspection;
