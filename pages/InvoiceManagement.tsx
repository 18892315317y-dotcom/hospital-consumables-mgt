
import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MoreVertical,
  X,
  Save,
  Send,
  Calendar,
  Building2,
  DollarSign,
  FileDigit,
  Link,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  Gavel,
  Zap
} from 'lucide-react';

// 发票数据接口定义
interface Invoice {
  id: string; // 系统ID
  invoiceNo: string; // 发票号码 (必填)
  invoiceCode?: string; // 发票代码
  invoiceTitle: string; // 发票抬头
  taxId: string; // 税号
  orderId: string; // 关联单号
  supplier: string; // 供应商
  amount: number; // 金额
  date: string; // 开票日期
  submitter: string; // 提交人
  submitDate: string; // 提交时间
  status: 'draft' | 'auditing' | 'approved' | 'rejected';
  attachment?: string; // 附件文件名
  auditComment?: string; // 审核意见
  bizType: 'vbp' | 'emergency'; // 业务类型：集采 | 临采
  emergencyCategory?: 'drug' | 'consumable'; // 临采类型：药品 | 耗材
}

// 模拟采购单数据 (集采)
const VBP_ORDERS = [
  { id: 'PO-202405-001', name: '心内科常规耗材采购', supplier: '北京华润医药', amount: 125000 },
  { id: 'PO-202405-004', name: '儿科夏季备药专项', supplier: '国药控股', amount: 48000 },
  { id: 'PO-202405-012', name: '骨科人工关节集采', supplier: '威高骨科', amount: 890000 },
  { id: 'PO-202405-015', name: '影像科CT球管更换', supplier: '通用电气医疗', amount: 450000 },
];

// 模拟采购单数据 (临采)
const EMERGENCY_ORDERS = [
  { id: 'EPO-202405-X01', name: '急诊抢救特效药临采', supplier: '上海医药', amount: 3500 },
  { id: 'EPO-202405-X02', name: '手术室非标耗材补货', supplier: '迈瑞医疗', amount: 12800 },
  { id: 'EPO-202405-X03', name: 'ICU呼吸机配件急采', supplier: '德尔格医疗', amount: 5600 },
];

const InvoiceManagement: React.FC = () => {
  // 业务类型: 'vbp' (集采) | 'emergency' (临采)
  const [bizType, setBizType] = useState<'vbp' | 'emergency'>('vbp');
  // activeTab: 'pending' 对应 "审核中/草稿", 'history' 对应 "审核历史"
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<Invoice | null>(null);
  const [hasAuditPermission] = useState(true); // 模拟审核权限
  
  // 审核相关
  const [auditDecision, setAuditDecision] = useState<'pass' | 'reject'>('pass');
  const [auditComment, setAuditComment] = useState('');

  // 表单状态
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice>>({
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    submitter: '王主任', // 模拟当前登录人
    invoiceTitle: '市第一人民医院', // 默认抬头
    taxId: '12100000400012345A', // 默认税号
    bizType: 'vbp'
  });

  // 模拟发票数据
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      invoiceNo: '88291022',
      invoiceCode: '11002233',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'PO-202405-001',
      supplier: '北京华润医药',
      amount: 125000,
      date: '2024-05-20',
      submitter: '王主任',
      submitDate: '2024-05-21 10:30',
      status: 'auditing',
      attachment: 'invoice_88291022.pdf',
      bizType: 'vbp'
    },
    {
      id: 'INV-002',
      invoiceNo: '77722111',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'PO-202405-004',
      supplier: '国药控股',
      amount: 48000,
      date: '2024-05-22',
      submitter: '王主任',
      submitDate: '',
      status: 'draft',
      bizType: 'vbp'
    },
    {
      id: 'INV-003',
      invoiceNo: '66554433',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'PO-202404-099',
      supplier: '迈瑞医疗',
      amount: 22000,
      date: '2024-04-15',
      submitter: '张医生',
      submitDate: '2024-04-16 09:00',
      status: 'approved',
      attachment: 'invoice_66554433.pdf',
      bizType: 'vbp'
    },
    {
      id: 'INV-004',
      invoiceNo: '12312312',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'PO-202404-088',
      supplier: '上海医药',
      amount: 5600,
      date: '2024-04-10',
      submitter: '李护士',
      submitDate: '2024-04-11 14:20',
      status: 'rejected',
      auditComment: '发票金额与系统采购单总额不符，请核对后重新提交。',
      attachment: 'invoice_12312312.jpg',
      bizType: 'vbp'
    },
    {
      id: 'INV-005',
      invoiceNo: '44556677',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'PO-202403-011',
      supplier: '强生医疗',
      amount: 450000,
      date: '2024-03-20',
      submitter: '王主任',
      submitDate: '2024-03-21 09:30',
      status: 'approved',
      attachment: 'invoice_44556677.pdf',
      bizType: 'vbp'
    },
    {
      id: 'INV-E01',
      invoiceNo: '99881122',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'EPO-202405-X01',
      supplier: '上海医药',
      amount: 3500,
      date: '2024-05-21',
      submitter: '急诊科-李医生',
      submitDate: '2024-05-21 14:00',
      status: 'auditing',
      bizType: 'emergency',
      emergencyCategory: 'drug'
    },
    {
      id: 'INV-E02',
      invoiceNo: '55443322',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'EPO-202405-X02',
      supplier: '迈瑞医疗',
      amount: 12800,
      date: '2024-05-20',
      submitter: '手术室-王护士长',
      submitDate: '',
      status: 'draft',
      bizType: 'emergency',
      emergencyCategory: 'consumable'
    },
    {
      id: 'INV-E03',
      invoiceNo: '88990011',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'EPO-202404-X05',
      supplier: '九州通医药',
      amount: 1200,
      date: '2024-04-05',
      submitter: '急诊科-刘医生',
      submitDate: '2024-04-06 11:00',
      status: 'approved',
      bizType: 'emergency',
      emergencyCategory: 'drug',
      attachment: 'invoice_88990011.jpg'
    },
    {
      id: 'INV-E04',
      invoiceNo: '33221100',
      invoiceTitle: '市第一人民医院',
      taxId: '12100000400012345A',
      orderId: 'EPO-202404-X08',
      supplier: '威高骨科',
      amount: 25000,
      date: '2024-04-12',
      submitter: '骨科-张主任',
      submitDate: '2024-04-12 16:30',
      status: 'rejected',
      auditComment: '非急需物资，建议走常规集采流程。',
      bizType: 'emergency',
      emergencyCategory: 'consumable'
    }
  ]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 先过滤业务类型
      if (inv.bizType !== bizType) return false;

      if (activeTab === 'pending') {
        // 审核中/草稿 列表：显示 draft 和 auditing
        return inv.status === 'draft' || inv.status === 'auditing';
      } else {
        // 审核历史 列表：显示 approved 和 rejected
        return inv.status === 'approved' || inv.status === 'rejected';
      }
    });
  }, [invoices, activeTab, bizType]);

  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
    } else {
      setEditingInvoice({
        id: `INV-${Date.now()}`,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        submitter: '王主任',
        supplier: '',
        amount: 0,
        invoiceNo: '',
        orderId: '',
        invoiceTitle: '市第一人民医院',
        taxId: '12100000400012345A',
        bizType: bizType, // 默认为当前选中的业务类型
        emergencyCategory: bizType === 'emergency' ? 'drug' : undefined
      });
    }
    setShowModal(true);
  };

  const handleSave = (submit: boolean) => {
    // 发票号码现在不能为空，因为是必填项
    if (!editingInvoice.orderId || !editingInvoice.invoiceNo || !editingInvoice.amount || !editingInvoice.invoiceTitle || !editingInvoice.taxId) {
      alert('请填写完整必填信息（含发票号码、抬头、税号等）');
      return;
    }

    const newStatus = submit ? 'auditing' : 'draft';
    const finalInvoice = {
      ...editingInvoice,
      submitDate: submit ? new Date().toLocaleString() : editingInvoice.submitDate || '',
      status: newStatus
    } as Invoice;

    setInvoices(prev => {
      const exists = prev.find(i => i.id === finalInvoice.id);
      if (exists) {
        return prev.map(i => i.id === finalInvoice.id ? finalInvoice : i);
      }
      return [finalInvoice, ...prev];
    });

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条草稿吗？')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleOrderSelect = (orderId: string) => {
    const sourceList = bizType === 'vbp' ? VBP_ORDERS : EMERGENCY_ORDERS;
    const order = sourceList.find(o => o.id === orderId);
    if (order) {
      setEditingInvoice(prev => ({
        ...prev,
        orderId: order.id,
        supplier: order.supplier,
        amount: order.amount // 默认带入订单金额，允许修改
      }));
    }
  };

  const handleAuditAction = () => {
    if (!viewDetail) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === viewDetail.id 
        ? { 
            ...inv, 
            status: auditDecision === 'pass' ? 'approved' : 'rejected',
            auditComment: auditComment || (auditDecision === 'pass' ? '同意' : '驳回')
          } 
        : inv
    ));
    setViewDetail(null);
    setAuditComment('');
  };

  const handlePayment = (id: string) => {
    alert(`已为单据 ${id} 发起付款流程`);
  };

  const getThemeColor = (type: string) => {
    if (type === 'vbp') return 'blue';
    return 'purple';
  };

  const theme = getThemeColor(bizType);

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">待提交发票</p>
            <h3 className="text-2xl font-black text-gray-800">{invoices.filter(i => i.bizType === bizType && i.status === 'draft').length} <span className="text-xs text-gray-400 font-bold">笔</span></h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-gray-600"><FileText size={20}/></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">审核中金额</p>
            <h3 className={`text-2xl font-black text-${theme}-600`}>￥{(invoices.filter(i => i.bizType === bizType && i.status === 'auditing').reduce((acc, cur) => acc + cur.amount, 0) / 10000).toFixed(2)}w</h3>
          </div>
          <div className={`p-3 bg-${theme}-50 rounded-xl text-${theme}-600`}><Clock size={20}/></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">本月已核准</p>
            <h3 className="text-2xl font-black text-green-600">{invoices.filter(i => i.bizType === bizType && i.status === 'approved').length} <span className="text-xs text-gray-400 font-bold">笔</span></h3>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle2 size={20}/></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">异常驳回</p>
            <h3 className="text-2xl font-black text-red-600">{invoices.filter(i => i.bizType === bizType && i.status === 'rejected').length} <span className="text-xs text-gray-400 font-bold">笔</span></h3>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertCircle size={20}/></div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Header & Tabs */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-2.5 ${bizType === 'vbp' ? 'bg-blue-600' : 'bg-purple-600'} text-white rounded-xl shadow-lg ${bizType === 'vbp' ? 'shadow-blue-100' : 'shadow-purple-100'}`}>
              {bizType === 'vbp' ? <Receipt size={20} /> : <Zap size={20} />}
            </div>
            {/* 业务类型切换 */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setBizType('vbp')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${bizType === 'vbp' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                集采发票
              </button>
              <button 
                onClick={() => setBizType('emergency')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${bizType === 'emergency' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                临采发票
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'pending' ? `bg-white text-${theme}-600 shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}
              >
                审核中 / 草稿
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? `bg-white text-${theme}-600 shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}
              >
                审核历史
              </button>
            </div>
            {activeTab === 'pending' && (
              <button 
                onClick={() => handleOpenModal()}
                className={`px-6 py-2.5 text-white rounded-xl text-xs font-black shadow-lg hover:opacity-90 transition-all flex items-center ${bizType === 'vbp' ? 'bg-blue-600 shadow-blue-100' : 'bg-purple-600 shadow-purple-100'}`}
              >
                <Plus size={16} className="mr-1.5" /> 录入{bizType === 'vbp' ? '集采' : '临采'}发票
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <div className="flex items-center space-x-3 flex-1">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="搜索发票号、订单号或供应商..." 
                  className={`w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-${theme}-500/10`}
                />
              </div>
              <button className="h-9 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center">
                <Filter size={14} className="mr-1.5" /> 筛选
              </button>
           </div>
           <div className="flex items-center space-x-2">
              <button className={`p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-${theme}-600 transition-colors`}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-gray-600">1 / 1</span>
              <button className={`p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-${theme}-600 transition-colors`}>
                <ChevronRight size={16} />
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
              <tr>
                <th className="px-6 py-4">发票抬头</th>
                <th className="px-6 py-4">税号</th>
                <th className="px-6 py-4">发票号码</th>
                {bizType === 'emergency' && <th className="px-6 py-4">临采类型</th>}
                <th className="px-6 py-4">关联单号</th>
                <th className="px-6 py-4">供应商</th>
                <th className="px-6 py-4 text-right">开票金额</th>
                <th className="px-6 py-4">开票日期</th>
                <th className="px-6 py-4 text-center">当前状态</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className={`hover:bg-${theme}-50/20 transition-colors group`}>
                  <td className="px-6 py-4">
                    <span className="font-black text-gray-800">{invoice.invoiceTitle || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-mono font-bold">{invoice.taxId || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-700">{invoice.invoiceNo}</span>
                  </td>
                  {/* 临采专用列 */}
                  {bizType === 'emergency' && (
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        invoice.emergencyCategory === 'drug' 
                          ? 'bg-orange-50 text-orange-600 border-orange-100' 
                          : 'bg-cyan-50 text-cyan-600 border-cyan-100'
                      }`}>
                        {invoice.emergencyCategory === 'drug' ? '药品临采' : '耗材临采'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-mono font-bold text-${theme}-600 bg-${theme}-50 px-2 py-1 rounded border border-${theme}-100`}>
                      {invoice.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-700">{invoice.supplier}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-black text-gray-800">￥{invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-500">{invoice.date}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      invoice.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                      invoice.status === 'auditing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      invoice.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {invoice.status === 'draft' ? '草稿' :
                       invoice.status === 'auditing' ? '审核中' :
                       invoice.status === 'approved' ? '已核准' : '已驳回'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      {/* 操作逻辑：审核中/草稿 */}
                      {activeTab === 'pending' && (
                        <>
                          {invoice.status === 'draft' && (
                            <>
                              <button onClick={() => handleOpenModal(invoice)} className={`text-${theme}-600 hover:text-${theme}-800 font-bold text-xs`}>编辑</button>
                              <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-800 font-bold text-xs">删除</button>
                            </>
                          )}
                          {invoice.status === 'auditing' && hasAuditPermission && (
                            <button 
                              onClick={() => { setViewDetail(invoice); setAuditDecision('pass'); }}
                              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                            >
                              <Gavel size={12} className="mr-1" /> 审核
                            </button>
                          )}
                          {/* 如果是审核中但没有权限，或者需要查看 */}
                          {invoice.status === 'auditing' && !hasAuditPermission && (
                             <button onClick={() => setViewDetail(invoice)} className="text-gray-400 hover:text-blue-600 font-bold text-xs">详情</button>
                          )}
                        </>
                      )}

                      {/* 操作逻辑：审核历史 */}
                      {activeTab === 'history' && (
                        <>
                          {invoice.status === 'approved' && (
                            <button onClick={() => handlePayment(invoice.id)} className="text-green-600 hover:text-green-800 font-bold text-xs flex items-center">
                              <CreditCard size={12} className="mr-1" /> 立即付款
                            </button>
                          )}
                          <button onClick={() => setViewDetail(invoice)} className="text-gray-400 hover:text-blue-600 font-bold text-xs">查看明细</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={bizType === 'emergency' ? 10 : 9} className="py-20 text-center text-gray-400 text-xs font-bold italic bg-white">
                    暂无相关{bizType === 'vbp' ? '集采' : '临采'}发票记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 录入/编辑 弹窗 */}
      {showModal && editingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
            <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${bizType === 'vbp' ? 'bg-blue-600' : 'bg-purple-600'}`}>
              <div className="flex items-center space-x-3">
                <Receipt size={24} />
                <h3 className="text-xl font-black tracking-tight">{editingInvoice.id && editingInvoice.id.includes('INV') ? '编辑发票信息' : `录入新${bizType === 'vbp' ? '集采' : '临采'}发票`}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50/30">
              {/* 临采特有字段：临采类型 */}
              {bizType === 'emergency' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">临采类型 <span className="text-red-500 ml-1">*</span></label>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setEditingInvoice({...editingInvoice, emergencyCategory: 'drug'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${editingInvoice.emergencyCategory === 'drug' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-500 hover:border-purple-200'}`}
                    >
                      药品临采
                    </button>
                    <button 
                      onClick={() => setEditingInvoice({...editingInvoice, emergencyCategory: 'consumable'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${editingInvoice.emergencyCategory === 'consumable' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-gray-200 bg-white text-gray-500 hover:border-cyan-200'}`}
                    >
                      耗材临采
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                  <Link size={12} className={`mr-1.5 text-${theme}-600`}/> 关联{bizType === 'vbp' ? '集采' : '临采'}单据 <span className="text-red-500 ml-1">*</span>
                </label>
                <select 
                  value={editingInvoice.orderId} 
                  onChange={(e) => handleOrderSelect(e.target.value)}
                  className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-${theme}-500/10 transition-all cursor-pointer`}
                >
                  <option value="">请选择关联单据...</option>
                  {(bizType === 'vbp' ? VBP_ORDERS : EMERGENCY_ORDERS).map(po => (
                    <option key={po.id} value={po.id}>{po.name} - {po.supplier} (￥{po.amount})</option>
                  ))}
                </select>
              </div>

              {/* 发票抬头与税号 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">发票抬头 <span className="text-red-500 ml-1">*</span></label>
                  <input 
                    type="text" 
                    value={editingInvoice.invoiceTitle}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoiceTitle: e.target.value})}
                    placeholder="请输入发票抬头"
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">纳税人识别号 <span className="text-red-500 ml-1">*</span></label>
                  <input 
                    type="text" 
                    value={editingInvoice.taxId}
                    onChange={(e) => setEditingInvoice({...editingInvoice, taxId: e.target.value})}
                    placeholder="请输入税号"
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-800 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                    <FileDigit size={12} className="mr-1.5"/> 发票号码 <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={editingInvoice.invoiceNo}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoiceNo: e.target.value})}
                    placeholder="输入发票号"
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-800 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">发票代码</label>
                  <input 
                    type="text" 
                    value={editingInvoice.invoiceCode || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoiceCode: e.target.value})}
                    placeholder="选填"
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                    <DollarSign size={12} className="mr-1.5"/> 发票金额 <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={editingInvoice.amount || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, amount: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-black text-${theme}-600 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                    <Calendar size={12} className="mr-1.5"/> 开票日期 <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={editingInvoice.date}
                    onChange={(e) => setEditingInvoice({...editingInvoice, date: e.target.value})}
                    className={`w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-${theme}-500/10`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                  <Building2 size={12} className="mr-1.5"/> 供应商名称
                </label>
                <input 
                  type="text" 
                  value={editingInvoice.supplier}
                  readOnly // 通常由订单带出
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                  <UploadCloud size={12} className="mr-1.5"/> 发票附件 (PDF/图片)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:border-blue-300 transition-colors cursor-pointer text-gray-400 hover:text-blue-500">
                   <UploadCloud size={32} className="mb-2" />
                   <p className="text-xs font-bold">点击上传发票扫描件</p>
                   {editingInvoice.attachment && <p className="text-[10px] text-blue-600 mt-2 font-mono">{editingInvoice.attachment}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-white flex space-x-4 shrink-0">
               <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors">取消</button>
               <button onClick={() => handleSave(false)} className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-50 transition-colors flex items-center justify-center">
                 <Save size={18} className="mr-2" /> 保存草稿
               </button>
               <button onClick={() => handleSave(true)} className={`flex-1 py-3.5 text-white rounded-2xl font-black shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center ${bizType === 'vbp' ? 'bg-blue-600 shadow-blue-100' : 'bg-purple-600 shadow-purple-100'}`}>
                 <Send size={18} className="mr-2" /> 提交审核
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情 弹窗 (包含审核操作) */}
      {viewDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewDetail(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[88vh]">
             <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${viewDetail.status === 'rejected' ? 'bg-red-600' : viewDetail.status === 'approved' ? 'bg-green-600' : viewDetail.status === 'auditing' ? 'bg-indigo-600' : (viewDetail.bizType === 'vbp' ? 'bg-blue-600' : 'bg-purple-600')}`}>
               <div className="flex items-center space-x-3">
                 <FileText size={24} />
                 <h3 className="text-xl font-black tracking-tight">{viewDetail.status === 'auditing' && hasAuditPermission ? '发票审核' : '发票详情'}</h3>
               </div>
               <button onClick={() => setViewDetail(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
             </div>
             
             <div className="p-8 space-y-6 bg-gray-50/30 flex-1 overflow-y-auto scrollbar-hide">
               {viewDetail.status === 'rejected' && (
                 <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3">
                    <AlertCircle size={20} className="text-red-600 mt-0.5" />
                    <div>
                       <p className="text-xs font-black text-red-700 uppercase">驳回原因</p>
                       <p className="text-sm text-red-600 mt-1 font-medium leading-relaxed">{viewDetail.auditComment}</p>
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <DetailItem label="发票抬头" value={viewDetail.invoiceTitle} full />
                  <DetailItem label="纳税人识别号" value={viewDetail.taxId} mono />
                  <div className="col-span-2 border-t border-dashed my-2"></div>
                  {viewDetail.bizType === 'emergency' && (
                    <DetailItem label="临采类型" value={viewDetail.emergencyCategory === 'drug' ? '药品临采' : '耗材临采'} highlight />
                  )}
                  <DetailItem label="发票号码" value={viewDetail.invoiceNo} />
                  <DetailItem label="发票代码" value={viewDetail.invoiceCode} />
                  <DetailItem label="开票日期" value={viewDetail.date} />
                  <DetailItem label="发票金额" value={`￥${viewDetail.amount.toLocaleString()}`} highlight />
                  <DetailItem label="供应商" value={viewDetail.supplier} full />
                  <DetailItem label="关联订单" value={viewDetail.orderId} mono full />
               </div>

               <div className="flex justify-between items-center px-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
                     <span className="bg-gray-100 px-2 py-1 rounded">提交人: {viewDetail.submitter}</span>
                     <span>提交时间: {viewDetail.submitDate}</span>
                  </div>
                  {viewDetail.attachment && (
                    <button className="text-xs font-bold text-blue-600 flex items-center hover:underline">
                      <Download size={14} className="mr-1" /> 下载附件
                    </button>
                  )}
               </div>

               {/* 审核操作区 */}
               {viewDetail.status === 'auditing' && hasAuditPermission && (
                 <div className="mt-4 pt-6 border-t border-gray-200">
                    <div className="mb-4">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">审核处理意见</label>
                      <textarea 
                        value={auditComment}
                        onChange={(e) => setAuditComment(e.target.value)}
                        placeholder="请输入审批意见..." 
                        className="w-full h-20 p-3 mt-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="flex space-x-4">
                       <button 
                         onClick={() => { setAuditDecision('pass'); handleAuditAction(); }}
                         className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg hover:bg-green-700 transition-all active:scale-95"
                       >
                         核准通过
                       </button>
                       <button 
                         onClick={() => { setAuditDecision('reject'); handleAuditAction(); }}
                         className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg hover:bg-red-700 transition-all active:scale-95"
                       >
                         驳回申请
                       </button>
                    </div>
                 </div>
               )}
             </div>
             
             {!(viewDetail.status === 'auditing' && hasAuditPermission) && (
               <div className="p-6 border-t bg-white flex justify-end">
                  <button onClick={() => setViewDetail(null)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-colors">关闭</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, highlight, full, mono }: any) => (
  <div className={`${full ? 'col-span-2' : ''}`}>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold ${highlight ? 'text-blue-600 text-lg' : 'text-gray-800'} ${mono ? 'font-mono' : ''}`}>{value || '--'}</p>
  </div>
);

export default InvoiceManagement;
