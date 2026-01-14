
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Briefcase, 
  FileText, 
  X, 
  Save, 
  ShoppingCart,
  Trash2,
  AlertCircle,
  LayoutList,
  UserCheck,
  History,
  Archive,
  Building2,
  User,
  CheckCircle2,
  Eye,
  Edit
} from 'lucide-react';

// --- Types ---

interface TemplateItem {
  id: string;
  name: string;
  model: string;
  price: number;
  supplier: string;
  specs: string;
}

interface ProcurementTemplate {
  id: string;
  title: string;
  period: string; // e.g., "2024年第三季度"
  status: 'draft' | 'published' | 'closed';
  items: TemplateItem[];
  createTime: string;
  creator: string;
}

interface PlanItem extends TemplateItem {
  quantity: number;
  reason: string;
}

interface DeptPlan {
  id: string;
  dept: string;
  templateId: string;
  templateName: string;
  period: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitter: string;
  submitTime: string;
  totalAmount: number;
  items: PlanItem[];
  auditComment?: string; // Add optional audit comment for history
}

// --- Mock Data ---

const MOCK_ITEMS: TemplateItem[] = [
  { id: 'ITM-001', name: '多参数监护仪', model: 'BeneVision N17', price: 68000, supplier: '迈瑞医疗', specs: '含心电、血氧、无创血压模块' },
  { id: 'ITM-002', name: '便携式彩超', model: 'M9', price: 350000, supplier: '迈瑞医疗', specs: '心脏、腹部探头各一' },
  { id: 'ITM-003', name: '输液泵', model: 'BeneFusion VP5', price: 8500, supplier: '迈瑞医疗', specs: '高精度流速控制' },
  { id: 'ITM-004', name: '除颤监护仪', model: 'BeneHeart D6', price: 92000, supplier: '迈瑞医疗', specs: '双相波除颤' },
  { id: 'ITM-005', name: '呼吸机', model: 'SV300', price: 180000, supplier: '迈瑞医疗', specs: '有创/无创一体' },
];

// --- Sub-components ---

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ProcurementTemplate[]>([
    {
      id: 'TPL-2024-Q3',
      title: '2024年第三季度常规设备采购目录',
      period: '2024年第三季度',
      status: 'published',
      items: [MOCK_ITEMS[0], MOCK_ITEMS[2], MOCK_ITEMS[3]],
      createTime: '2024-06-01',
      creator: '张院长'
    },
    {
      id: 'TPL-2024-ICU',
      title: 'ICU专项扩建设备采购目录',
      period: '2024年下半年',
      status: 'draft',
      items: [MOCK_ITEMS[1], MOCK_ITEMS[4]],
      createTime: '2024-06-10',
      creator: '李副院长'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ProcurementTemplate>>({
    title: '', period: '', items: [], status: 'draft'
  });

  const handleAddItem = (item: TemplateItem) => {
    setNewTemplate(prev => ({
      ...prev,
      items: prev.items?.some(i => i.id === item.id) ? prev.items : [...(prev.items || []), item]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setNewTemplate(prev => ({
      ...prev,
      items: prev.items?.filter(i => i.id !== id)
    }));
  };

  const handleSaveTemplate = (status: 'published' | 'draft') => {
    if (!newTemplate.title || !newTemplate.period || !newTemplate.items?.length) return;
    const template: ProcurementTemplate = {
      id: `TPL-${Date.now()}`,
      title: newTemplate.title!,
      period: newTemplate.period!,
      status: status,
      items: newTemplate.items as TemplateItem[],
      createTime: new Date().toISOString().split('T')[0],
      creator: '当前用户'
    };
    setTemplates([template, ...templates]);
    setShowModal(false);
    setNewTemplate({ title: '', period: '', items: [], status: 'draft' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="搜索模板..." className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
          <Plus size={16} className="mr-2" /> 发起新采购计划模板
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-black text-gray-800">{tpl.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${tpl.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {tpl.status === 'published' ? '已发布 (生效中)' : '草稿'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium flex items-center">
                  <Clock size={12} className="mr-1" /> 创建于: {tpl.createTime} | 发起人: {tpl.creator}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500">适用周期</p>
                <p className="text-sm font-black text-indigo-600">{tpl.period}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">包含设备范围 ({tpl.items.length})</p>
              <div className="flex flex-wrap gap-2">
                {tpl.items.map(item => (
                  <span key={item.id} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg shadow-sm">
                    {item.name} <span className="text-gray-300 mx-1">|</span> {item.model}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center"><Trash2 size={12} className="mr-1"/> 删除</button>
               {tpl.status !== 'published' && (
                 <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                   <Settings size={12} className="mr-1"/> 编辑模板
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet size={24} />
                <h3 className="text-xl font-black">制定新采购计划模板</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Form & Selection */}
              <div className="w-1/2 p-8 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
                 <div className="space-y-4 mb-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase">计划标题</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                        placeholder="例如：2024年Q4全院通用设备采购"
                        value={newTemplate.title}
                        onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase">执行周期</label>
                      <select 
                        className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        value={newTemplate.period}
                        onChange={e => setNewTemplate({...newTemplate, period: e.target.value})}
                      >
                        <option value="">请选择...</option>
                        <option>2024年第三季度</option>
                        <option>2024年第四季度</option>
                        <option>2025年第一季度</option>
                        <option>年度专项</option>
                      </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block">可选设备库 (点击添加)</label>
                    <div className="space-y-2">
                       {MOCK_ITEMS.map(item => (
                         <div 
                           key={item.id} 
                           onClick={() => handleAddItem(item)}
                           className="p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
                         >
                            <div className="flex justify-between items-start">
                               <div>
                                 <p className="text-sm font-black text-gray-800 group-hover:text-indigo-600">{item.name}</p>
                                 <p className="text-[10px] text-gray-400">{item.model} | {item.supplier}</p>
                               </div>
                               <Plus size={16} className="text-gray-300 group-hover:text-indigo-500" />
                            </div>
                            <p className="text-xs font-mono font-bold text-gray-600 mt-2">￥{item.price.toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Right: Selected Preview */}
              <div className="w-1/2 p-8 overflow-y-auto flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black text-gray-800">已选入模板清单</h4>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{newTemplate.items?.length || 0} 项</span>
                 </div>
                 
                 <div className="flex-1 space-y-3">
                    {newTemplate.items?.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl">
                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                        <p className="text-xs font-bold">暂无内容，请从左侧添加</p>
                      </div>
                    ) : (
                      newTemplate.items?.map(item => (
                        <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center group">
                           <div>
                              <p className="text-sm font-bold text-gray-800">{item.name}</p>
                              <p className="text-[10px] text-gray-400">{item.model}</p>
                           </div>
                           <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ))
                    )}
                 </div>

                 <div className="mt-6 pt-6 border-t flex space-x-3">
                    <button 
                      onClick={() => handleSaveTemplate('draft')} 
                      className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-black hover:bg-gray-50 transition-all"
                    >
                      保存草稿
                    </button>
                    <button 
                      onClick={() => handleSaveTemplate('published')} 
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      发布模板
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanSubmission: React.FC = () => {
  const [listTab, setListTab] = useState<'active' | 'history'>('active');
  const [plans, setPlans] = useState<DeptPlan[]>([
    {
      id: 'PLN-IM-2024Q3',
      dept: '影像中心',
      templateId: 'TPL-2024-Q3',
      templateName: '2024年第三季度常规设备采购目录',
      period: '2024年第三季度',
      status: 'submitted',
      submitter: '王主任',
      submitTime: '2024-06-15',
      totalAmount: 1250000,
      items: [
        { ...MOCK_ITEMS[0], quantity: 5, reason: '老旧设备替换' },
        { ...MOCK_ITEMS[3], quantity: 2, reason: '新增床位配置' }
      ]
    },
    // Historical Record (Approved)
    {
      id: 'PLN-IM-2024Q1',
      dept: '影像中心',
      templateId: 'TPL-2024-Q1',
      templateName: '2024年第一季度常规设备采购目录',
      period: '2024年第一季度',
      status: 'approved',
      submitter: '王主任',
      submitTime: '2024-01-10',
      totalAmount: 350000,
      items: [
        { ...MOCK_ITEMS[1], quantity: 1, reason: '科研急需' }
      ],
      auditComment: '同意采购，请按流程执行。'
    },
    // Historical Record (Rejected)
    {
        id: 'PLN-IM-2023Q4',
        dept: '影像中心',
        templateId: 'TPL-2023-Q4',
        templateName: '2023年第四季度专项采购',
        period: '2023年第四季度',
        status: 'rejected',
        submitter: '王主任',
        submitTime: '2023-10-12',
        totalAmount: 2400000,
        items: [
            { ...MOCK_ITEMS[4], quantity: 10, reason: '批量更新' }
        ],
        auditComment: '预算不足，建议减少采购数量或延后至明年。'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newPlanItems, setNewPlanItems] = useState<PlanItem[]>([]);
  
  // Audit/Detail Modal States
  const [focusedPlan, setFocusedPlan] = useState<DeptPlan | null>(null);
  const [auditComment, setAuditComment] = useState('');
  const [isAuditMode, setIsAuditMode] = useState(false);

  // Mock available templates for selection
  const activeTemplates = [
    { id: 'TPL-2024-Q3', title: '2024年第三季度常规设备采购目录', items: [MOCK_ITEMS[0], MOCK_ITEMS[2], MOCK_ITEMS[3], MOCK_ITEMS[4]] }
  ];

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = activeTemplates.find(t => t.id === tplId);
    if (tpl) {
      // Initialize plan items with 0 quantity
      setNewPlanItems(tpl.items.map(i => ({ ...i, quantity: 0, reason: '' })));
    } else {
      setNewPlanItems([]);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setNewPlanItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQ = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const handleReasonChange = (itemId: string, val: string) => {
    setNewPlanItems(prev => prev.map(item => item.id === itemId ? { ...item, reason: val } : item));
  };

  const handleSubmitPlan = () => {
    const validItems = newPlanItems.filter(i => i.quantity > 0);
    if (validItems.length === 0) return;

    const tpl = activeTemplates.find(t => t.id === selectedTemplateId);
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newPlan: DeptPlan = {
      id: `PLN-${Date.now()}`,
      dept: '当前科室',
      templateId: selectedTemplateId,
      templateName: tpl?.title || '',
      period: '2024年第三季度', // Simplified
      status: 'submitted',
      submitter: '当前用户',
      submitTime: new Date().toISOString().split('T')[0],
      totalAmount: total,
      items: validItems
    };

    setPlans([newPlan, ...plans]);
    setShowModal(false);
    setSelectedTemplateId('');
    setNewPlanItems([]);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('确定要删除该草稿吗？')) {
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAuditSubmit = (status: 'approved' | 'rejected') => {
    if (!focusedPlan) return;
    setPlans(prev => prev.map(p => 
      p.id === focusedPlan.id 
        ? { ...p, status: status, auditComment: auditComment } 
        : p
    ));
    setFocusedPlan(null);
    setAuditComment('');
  };

  const filteredPlans = plans.filter(p => {
    if (listTab === 'active') return ['draft', 'submitted'].includes(p.status);
    return ['approved', 'rejected'].includes(p.status);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-black text-gray-700">科室采购计划管理</h3>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setListTab('active')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${listTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              进行中
            </button>
            <button 
              onClick={() => setListTab('history')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${listTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              历史记录
            </button>
          </div>
        </div>
        
        {listTab === 'active' && (
          <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} className="mr-2" /> 提报新计划
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {filteredPlans.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              {listTab === 'active' ? <FileSpreadsheet size={32} /> : <History size={32} />}
            </div>
            <p className="text-gray-400 font-bold text-sm">
              {listTab === 'active' ? '暂无进行中的采购计划' : '暂无历史采购记录'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b text-[11px]">
              <tr>
                 <th className="px-6 py-4">单据编号</th>
                 <th className="px-6 py-4">计划名称</th>
                 <th className="px-6 py-4">提报科室</th>
                 <th className="px-6 py-4">提报人</th>
                 <th className="px-6 py-4">提交时间</th>
                 <th className="px-6 py-4 text-right">计划总额</th>
                 <th className="px-6 py-4 text-center">状态</th>
                 <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlans.map(plan => (
                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{plan.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{plan.templateName}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center">
                          <Building2 size={14} className="mr-1.5 text-gray-400" />
                          <span className="text-gray-700">{plan.dept}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center">
                          <User size={14} className="mr-1.5 text-gray-400" />
                          <span className="text-gray-700">{plan.submitter}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{plan.submitTime}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-blue-600">
                       ￥{plan.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          plan.status === 'submitted' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          plan.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                          plan.status === 'rejected' ? 'bg-red-100 text-red-600 border border-red-200' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {plan.status === 'submitted' ? '已提交' : plan.status === 'approved' ? '已通过' : plan.status === 'rejected' ? '已驳回' : '草稿'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center items-center space-x-3">
                          {plan.status === 'submitted' ? (
                             <>
                               <button 
                                  onClick={() => {setFocusedPlan(plan); setAuditComment(''); setIsAuditMode(true);}} 
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                               >
                                 <CheckCircle2 size={12} className="mr-1"/> 审核
                               </button>
                               <button 
                                  onClick={() => {setFocusedPlan(plan); setIsAuditMode(false);}} 
                                  className="text-gray-500 hover:text-blue-600 font-bold text-xs flex items-center ml-2"
                               >
                                 <Eye size={12} className="mr-1"/> 明细
                               </button>
                             </>
                          ) : (
                             <button 
                                onClick={() => {setFocusedPlan(plan); setIsAuditMode(false);}} 
                                className="text-gray-500 hover:text-blue-600 font-bold text-xs flex items-center"
                             >
                               <Eye size={12} className="mr-1"/> 详情
                             </button>
                          )}
                          {plan.status === 'draft' && (
                             <>
                               <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center"><Edit size={12} className="mr-1"/> 编辑</button>
                               <button onClick={() => handleDeletePlan(plan.id)} className="text-red-600 hover:text-red-800 font-bold text-xs flex items-center"><Trash2 size={12} className="mr-1"/> 删除</button>
                             </>
                          )}
                       </div>
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <LayoutList size={24} />
                <h3 className="text-xl font-black">提报采购计划</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
               <div className="p-6 border-b bg-gray-50/50 flex items-center space-x-4 shrink-0">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">第一步：选择计划模板</span>
                  <select 
                    className="flex-1 max-w-md h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    <option value="">-- 请选择当前开放的采购模板 --</option>
                    {activeTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
               </div>

               {selectedTemplateId ? (
                 <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 gap-4">
                       {newPlanItems.map(item => (
                         <div key={item.id} className={`p-4 rounded-2xl border transition-all flex items-start justify-between ${item.quantity > 0 ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-white border-gray-100 opacity-80 hover:opacity-100'}`}>
                            <div className="flex-1 mr-8">
                               <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="text-sm font-black text-gray-800">{item.name}</h4>
                                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">{item.model}</span>
                               </div>
                               <p className="text-xs text-gray-400 mb-2">{item.specs}</p>
                               <p className="text-sm font-mono font-black text-gray-600">￥{item.price.toLocaleString()}</p>
                               {item.quantity > 0 && (
                                 <input 
                                   type="text" 
                                   placeholder="请填写具体的申请理由..."
                                   className="w-full mt-3 px-3 py-2 bg-white border border-blue-100 rounded-lg text-xs outline-none focus:border-blue-300"
                                   value={item.reason}
                                   onChange={e => handleReasonChange(item.id, e.target.value)}
                                 />
                               )}
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                               <span className="text-[10px] font-bold text-gray-400 uppercase">申请数量</span>
                               <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                  <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">-</button>
                                  <div className="w-10 h-8 flex items-center justify-center font-black text-blue-600 border-x border-gray-100 bg-gray-50/50">{item.quantity}</div>
                                  <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">+</button>
                                </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <Briefcase size={64} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">请先选择上方的采购模板</p>
                 </div>
               )}
            </div>

            <div className="p-6 border-t bg-white flex justify-between items-center shrink-0">
               <div className="text-sm font-bold text-gray-600">
                 已选 <span className="text-blue-600 text-lg font-black mx-1">{newPlanItems.filter(i => i.quantity > 0).length}</span> 项设备，
                 预估总额 <span className="text-blue-600 text-lg font-black font-mono mx-1">￥{newPlanItems.reduce((sum, i) => sum + i.quantity * i.price, 0).toLocaleString()}</span>
               </div>
               <div className="flex space-x-3">
                  <button onClick={() => setShowModal(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">取消</button>
                  <button onClick={handleSubmitPlan} disabled={!selectedTemplateId} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">提交计划</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit/Detail Modal */}
      {focusedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFocusedPlan(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${focusedPlan.status === 'submitted' && isAuditMode ? 'bg-indigo-600' : 'bg-gray-800'}`}>
              <div className="flex items-center space-x-3">
                {focusedPlan.status === 'submitted' && isAuditMode ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                <h3 className="text-xl font-black">{focusedPlan.status === 'submitted' && isAuditMode ? '采购计划审核' : '采购计划详情'}</h3>
              </div>
              <button onClick={() => setFocusedPlan(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">提报信息</p>
                        <h4 className="text-base font-black text-gray-900 mt-1">{focusedPlan.templateName}</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">计划总额</p>
                        <p className="text-xl font-mono font-black text-blue-600 mt-1">￥{focusedPlan.totalAmount.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/50 text-xs">
                     <div><span className="text-gray-400 font-bold mr-2">提报科室:</span> <span className="font-bold text-gray-800">{focusedPlan.dept}</span></div>
                     <div><span className="text-gray-400 font-bold mr-2">提报人:</span> <span className="font-bold text-gray-800">{focusedPlan.submitter}</span></div>
                     <div><span className="text-gray-400 font-bold mr-2">提交时间:</span> <span className="font-bold text-gray-800">{focusedPlan.submitTime}</span></div>
                     <div><span className="text-gray-400 font-bold mr-2">申请设备数:</span> <span className="font-bold text-gray-800">{focusedPlan.items.length} 项</span></div>
                  </div>
               </div>

               {/* Audit Comment Section for History */}
               {focusedPlan.auditComment && (
                 <div className={`px-6 py-3 border text-xs flex items-start space-x-2 rounded-xl ${focusedPlan.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p><span className="font-bold">审核意见：</span>{focusedPlan.auditComment}</p>
                 </div>
               )}

               <div className="space-y-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">申请明细</p>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                     <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 font-bold text-gray-500">
                           <tr>
                              <th className="px-4 py-3">设备名称</th>
                              <th className="px-4 py-3 text-center">申请数量</th>
                              <th className="px-4 py-3 text-right">单价</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {focusedPlan.items.map((item, idx) => (
                              <tr key={idx}>
                                 <td className="px-4 py-3 font-medium text-gray-700">{item.name} <span className="text-[10px] text-gray-400 block">{item.model}</span></td>
                                 <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                                 <td className="px-4 py-3 text-right font-mono text-gray-500">￥{item.price.toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {focusedPlan.status === 'submitted' && isAuditMode && (
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">审核意见</label>
                    <textarea 
                      value={auditComment} 
                      onChange={(e) => setAuditComment(e.target.value)}
                      placeholder="请输入审核意见（驳回时必填）..."
                      className="w-full h-24 p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 bg-gray-50"
                    ></textarea>
                 </div>
               )}
            </div>

            <div className="p-6 border-t bg-white flex space-x-4">
               {focusedPlan.status === 'submitted' && isAuditMode ? (
                 <>
                   <button 
                     onClick={() => handleAuditSubmit('rejected')} 
                     className="flex-1 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black hover:bg-red-100 transition-all"
                   >
                     驳回申请
                   </button>
                   <button 
                     onClick={() => handleAuditSubmit('approved')} 
                     className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                   >
                     通过审核
                   </button>
                 </>
               ) : (
                 <button onClick={() => setFocusedPlan(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all">
                   关闭
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const EquipmentProcurementPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'template' | 'plan'>('template');

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">设备采购计划</h3>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'template' ? '由科室主任/管理层制定全院或专项设备采购目录' : '科室根据已发布的模板提报具体采购需求'}
            </p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('template')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'template' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={14} className="mr-2" /> 采购模板管理 (主任)
          </button>
          <button 
            onClick={() => setActiveTab('plan')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'plan' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserCheck size={14} className="mr-2" /> 科室计划提报 (经办)
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
        {activeTab === 'template' ? <TemplateManager /> : <PlanSubmission />}
      </div>
    </div>
  );
};

export default EquipmentProcurementPlan;
