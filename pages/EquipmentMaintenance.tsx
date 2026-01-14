
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Paperclip, 
  Settings, 
  Code, 
  Download, 
  ChevronRight, 
  X, 
  Check, 
  Building2, 
  Calendar, 
  DollarSign, 
  HardDrive,
  Trash2,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Upload,
  FileCheck, // Added
  Receipt // Added
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  model: string;
  category: 'clinical' | 'medicalTech';
  dept: string;
  purchaseDate: string;
  amount: number;
  serviceLife: number;
  status: 'active' | 'repair' | 'scrap';
  attachments: { name: string; type: string }[];
  hisMappings: { code: string; label: string }[];
}

const DEPT_MAP: Record<string, string[]> = {
  'clinical': ['心内科', '骨科', 'ICU', '呼吸内科'],
  'medicalTech': ['影像中心', '检验科', '超声室', '内镜中心']
};

const EquipmentMaintenance: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([
    { 
      id: 'EQ-2024-001', name: 'GE 螺旋CT', model: 'Optima 660', category: 'medicalTech', dept: '影像中心', 
      purchaseDate: '2023-05-12', amount: 4500000, serviceLife: 10, status: 'active',
      attachments: [{ name: '操作手册.pdf', type: 'manual' }, { name: '验收报告.jpg', type: 'report' }],
      hisMappings: [{ code: '120101', label: 'CT头部平扫' }, { code: '120102', label: 'CT胸部平扫' }]
    },
    { 
      id: 'EQ-2024-002', name: '德尔格呼吸机', model: 'Evita V500', category: 'clinical', dept: 'ICU', 
      purchaseDate: '2024-01-15', amount: 350000, serviceLife: 8, status: 'active',
      attachments: [{ name: '维保合约.pdf', type: 'contract' }],
      hisMappings: [{ code: '3101', label: '有创呼吸机治疗' }]
    },
    { 
      id: 'EQ-2024-005', name: '迈瑞监护仪', model: 'BeneVision N22', category: 'clinical', dept: '心内科', 
      purchaseDate: '2022-11-20', amount: 85000, serviceLife: 5, status: 'repair',
      attachments: [],
      hisMappings: [{ code: '2501', label: '特级监护' }]
    },
  ]);

  // 筛选与排序状态
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'purchaseDate' | 'amount' | 'serviceLife', direction: 'asc' | 'desc' } | null>(null);

  // 模态框状态
  const [showEditModal, setShowEditModal] = useState<Equipment | null>(null);
  const [showMappingModal, setShowMappingModal] = useState<Equipment | null>(null);
  const [showAttachDrawer, setShowAttachDrawer] = useState<Equipment | null>(null);

  // 处理排序逻辑
  const handleSort = (key: 'purchaseDate' | 'amount' | 'serviceLife') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let data = equipments.filter(e => {
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      const matchDept = filterDept === 'all' || e.dept === filterDept;
      const matchSearch = e.name.includes(searchQuery) || e.id.includes(searchQuery);
      return matchCat && matchDept && matchSearch;
    });

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [equipments, filterCategory, filterDept, searchQuery, sortConfig]);

  return (
    <div className="p-6 space-y-6">
      {/* 顶部操作区 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
            <HardDrive size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">设备基本信息维护</h3>
            <p className="text-xs text-gray-400 mt-1">建立院内医疗设备电子台账，维护 HIS 业务关联库</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-50 transition-all flex items-center shadow-sm"
          >
            <Upload size={18} className="mr-2" /> 导入设备
          </button>
          <button 
            onClick={() => setShowEditModal({ id: '', name: '', model: '', category: 'clinical', dept: '', purchaseDate: '', amount: 0, serviceLife: 0, status: 'active', attachments: [], hisMappings: [] })}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center"
          >
            <Plus size={18} className="mr-2" /> 新增设备入账
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">科室类别</label>
          <select 
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setFilterDept('all'); }}
            className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">全部类别</option>
            <option value="clinical">临床科室</option>
            <option value="medicalTech">医技科室</option>
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">所属科室</label>
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">全部科室</option>
            {filterCategory !== 'all' && DEPT_MAP[filterCategory].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 flex-[2] min-w-[300px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">设备模糊检索</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索设备名称、编号、规格型号..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* 设备列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
              <th className="px-6 py-4">基础信息 (ID/名称)</th>
              <th className="px-6 py-4">规格型号</th>
              <th className="px-6 py-4">所属科室</th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('purchaseDate')}>
                采购日期 {sortConfig?.key === 'purchaseDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('amount')}>
                采购金额 {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('serviceLife')}>
                年限 {sortConfig?.key === 'serviceLife' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-center">映射库</th>
              <th className="px-6 py-4 text-center">附件</th>
              <th className="px-6 py-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-black text-gray-800">{item.name}</p>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">{item.id}</p>
                </td>
                <td className="px-6 py-4 text-gray-500 font-bold">{item.model}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black">{item.dept}</span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-gray-400">{item.purchaseDate}</td>
                <td className="px-6 py-4 font-mono font-black text-gray-700">￥{item.amount.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-gray-500">{item.serviceLife} 年</td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setShowMappingModal(item)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative group"
                  >
                    <Code size={18} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[8px] flex items-center justify-center rounded-full font-bold">
                      {item.hisMappings.length}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setShowAttachDrawer(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative"
                  >
                    <Paperclip size={18} />
                    {item.attachments.length > 0 && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => setShowEditModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Settings size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <Search size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold italic">未检索到匹配的设备资产</p>
          </div>
        )}
      </div>

      {/* 编辑/新增 模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shadow-lg">
               <div className="flex items-center space-x-3">
                 <Plus size={24} />
                 <h3 className="text-lg font-black tracking-tight">{showEditModal.id ? '编辑设备档案' : '录入新资产'}</h3>
               </div>
               <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
               <div className="grid grid-cols-2 gap-6">
                 <InputGroup label="设备名称" placeholder="输入全称" value={showEditModal.name} />
                 <InputGroup label="规格型号" placeholder="例如: Optima 660" value={showEditModal.model} />
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">所属科室类别</label>
                   <select defaultValue={showEditModal.category} className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
                     <option value="clinical">临床科室</option><option value="medicalTech">医技科室</option>
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">具体科室</label>
                   <input type="text" defaultValue={showEditModal.dept} className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                 </div>
                 <InputGroup label="采购日期" type="date" value={showEditModal.purchaseDate} />
                 <InputGroup label="采购金额 (￥)" type="number" value={showEditModal.amount.toString()} />
                 <InputGroup label="预计年限 (年)" type="number" value={showEditModal.serviceLife.toString()} />
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">运行状态</label>
                   <select defaultValue={showEditModal.status} className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
                     <option value="active">在用</option><option value="repair">维修</option><option value="scrap">报废</option>
                   </select>
                 </div>

                 {/* 新增上传区域 */}
                 <div className="col-span-2 pt-4 border-t border-gray-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">入账凭证归档</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer group">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform"><FileCheck size={20} /></div>
                            <span className="text-xs font-black">上传验收报告</span>
                            <span className="text-[9px] mt-1 opacity-60 font-medium">拖拽或点击上传 PDF</span>
                        </div>
                        <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer group">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform"><Receipt size={20} /></div>
                            <span className="text-xs font-black">上传采购发票</span>
                            <span className="text-[9px] mt-1 opacity-60 font-medium">支持电子发票文件</span>
                        </div>
                    </div>
                 </div>
               </div>
            </div>
            <div className="p-8 border-t bg-gray-50/50 flex space-x-4">
               <button onClick={() => setShowEditModal(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500">取消</button>
               <button onClick={() => setShowEditModal(null)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100">保存档案</button>
            </div>
          </div>
        </div>
      )}

      {/* HIS 业务代码映射 模态框 */}
      {showMappingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowMappingModal(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white max-h-[85vh]">
             <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center shrink-0 shadow-xl">
               <div className="flex items-center space-x-4">
                 <div className="p-3 bg-white/20 rounded-2xl"><Code size={32} /></div>
                 <div>
                   <h3 className="text-2xl font-black tracking-tight">HIS 业务代码映射库</h3>
                   <p className="text-xs text-indigo-100 mt-1">关联 HIS 项目计费码以精确核算设备效益</p>
                 </div>
               </div>
               <button onClick={() => setShowMappingModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28}/></button>
             </div>
             <div className="flex-1 flex overflow-hidden">
                {/* 左侧：库列表 */}
                <div className="flex-1 bg-gray-50/50 p-8 border-r border-gray-100 overflow-y-auto scrollbar-hide">
                   <div className="mb-6 flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">已映射项目 ({showMappingModal.hisMappings.length})</label>
                      <button className="text-[10px] font-black text-indigo-600 hover:underline">批量新增</button>
                   </div>
                   <div className="space-y-3">
                      {showMappingModal.hisMappings.map(m => (
                        <div key={m.code} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group shadow-sm">
                           <div>
                              <p className="text-xs font-black text-gray-800">{m.label}</p>
                              <p className="text-[10px] font-mono text-gray-400 mt-0.5">HIS Code: {m.code}</p>
                           </div>
                           <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-indigo-300 hover:text-indigo-400 transition-all cursor-pointer group py-8">
                         <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                         <span className="text-xs font-bold">关联新 HIS 计费项</span>
                      </div>
                   </div>
                </div>
                {/* 右侧：说明 */}
                <div className="w-72 p-8 space-y-6">
                   <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-tighter flex items-center"><ShieldCheck size={14} className="mr-1.5"/> 映射价值说明</p>
                      <p className="text-xs text-indigo-700 leading-relaxed font-medium italic">“通过在此维护计费码映射关系，系统将自动从 HIS 接口实时汇总该设备产生的检查人次与金额，为驾驶舱内的 ROI 效益提供底层数据支撑。”</p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">关联设备</p>
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><HardDrive size={20}/></div>
                         <div><p className="text-xs font-black text-gray-800">{showMappingModal.name}</p><p className="text-[10px] text-gray-400">{showMappingModal.model}</p></div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-8 border-t bg-white flex justify-end">
                <button onClick={() => setShowMappingModal(null)} className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">保存映射关系</button>
             </div>
          </div>
        </div>
      )}

      {/* 附件管理 抽屉面板 */}
      {showAttachDrawer && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAttachDrawer(null)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Paperclip size={24}/></div>
                   <div>
                      <h4 className="text-lg font-black text-gray-800">附件管理中心</h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-bold uppercase tracking-tighter">Documentation & Assets</p>
                   </div>
                </div>
                <button onClick={() => setShowAttachDrawer(null)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><X size={28}/></button>
             </div>

             <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                     已上传文档 <span>{showAttachDrawer.attachments.length}</span>
                   </p>
                   <div className="space-y-3">
                      {showAttachDrawer.attachments.map((at, i) => (
                        <div key={i} className="p-5 rounded-[24px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group">
                           <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-bold"><FileText size={20}/></div>
                              <div><p className="text-sm font-black text-gray-800">{at.name}</p><p className="text-[10px] text-gray-400">{at.type === 'manual' ? '技术说明书' : at.type === 'report' ? '验收报告' : '法律合约'}</p></div>
                           </div>
                           <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-blue-600 bg-blue-50 rounded-lg"><ExternalLink size={16}/></button>
                              <button className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                           </div>
                        </div>
                      ))}
                      {showAttachDrawer.attachments.length === 0 && (
                        <div className="py-12 text-center text-gray-300 italic text-xs bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                          暂无关联的说明书或报告文档
                        </div>
                      )}
                   </div>
                </div>

                <div className="p-8 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4 group hover:bg-blue-50 transition-all cursor-pointer">
                   <div className="p-4 bg-white rounded-2xl shadow-md text-blue-600 group-hover:scale-110 transition-transform"><UploadCloud size={32} /></div>
                   <div>
                      <p className="text-sm font-black text-gray-800 tracking-tight">点击或拖拽上传新文件</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">支持 PDF, JPG, PNG (Max: 20MB)</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 mt-auto border-t">
                <button onClick={() => setShowAttachDrawer(null)} className="w-full py-4 bg-gray-900 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-gray-200 transition-all active:scale-95">完成管理</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      defaultValue={value}
      placeholder={placeholder} 
      className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
    />
  </div>
);

export default EquipmentMaintenance;
