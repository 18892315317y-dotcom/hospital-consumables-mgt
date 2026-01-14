
import { 
  Search, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ChevronRight, 
  X, 
  Save, 
  Send, 
  Trash2, 
  Info,
  Calendar,
  Package,
  History as HistoryIcon,
  Filter,
  AlertCircle,
  Check,
  Calculator,
  ChevronLeft,
  RotateCcw,
  Undo2,
  ShieldCheck,
  MessageSquare,
  ListOrdered,
  User,
  MapPin,
  ChevronLeftCircle,
  ChevronRightCircle,
  FileSearch,
  BadgeCheck,
  Stamp,
  Printer,
  Users,
  UserCheck,
  LayoutGrid,
  ArrowRight,
  Building2,
  Lock,
  Zap,
  Download,
  RefreshCcw // Added import
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { MenuKey } from '../types';

interface DeclarationItem {
  id: string;
  drugId: string;
  quantity: number;
  reason: string;
  price: number; // 从HIS获取的单价
}

interface Declaration {
  id: string;
  deptCategory: string;
  dept: string;
  amount: number;
  status: 'draft' | 'auditing' | 'completed' | 'voided' | 'reported' | 'in_stock'; // Added new statuses
  applicant: string;
  time: string;
  period: string;
  reason: string;
  items: DeclarationItem[];
  auditComment?: string;
  auditor?: string;
  auditTime?: string;
  submissionType?: string; // 新增提报类型
}

// 模拟组织架构与人员库
const ORG_STRUCTURE = [
  { id: 'dept-1', name: '资产设备科', staff: ['王晓东', '李明华', '赵建国', '孙志远'] },
  { id: 'dept-2', name: '医务处', staff: ['陈主任', '周医生', '吴干事'] },
  { id: 'dept-3', name: '财务处', staff: ['郑会计', '冯出纳', '张科员'] },
  { id: 'dept-4', name: '护理部', staff: ['刘护士长', '马老师', '王护士'] },
  { id: 'dept-5', name: '院长室', staff: ['高院长', '徐副院长', '朱助理'] },
  { id: 'dept-6', name: '临床科室(通用)', staff: ['科室负责人', '执行主任', '申领员'] },
  { id: 'dept-7', name: '药剂科/办', staff: ['林主任', '方药师'] },
];

// 审批流节点定义
interface FlowNode {
  id: string;
  label: string;
  deptId: string; // 每个节点锁定一个部门
  staff: string[]; // 部门下的多个人员
  description: string;
  type: 'start' | 'audit' | 'execute';
}

// 金额格式化工具函数
const formatCurrency = (amount: number) => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 科室级联数据
const DEPT_MAP: Record<string, string[]> = {
  '临床科室': ['呼吸内科', '消化内科', '心血管外科', '儿科', '急诊科', 'ICU'],
  '医技科室': ['影像科', '检验科', '超声科', '病理科', '药剂科']
};

// 模拟目录数据 (HIS库)
const CATALOG_DRUGS = [
  { id: 'DRUG-001', name: '阿托伐他汀钙片', spec: '20mg*7片', vendor: '大连辉瑞', price: 3.84 },
  { id: 'DRUG-002', name: '氨氯地平片', spec: '5mg*14片', vendor: '华润赛科', price: 0.15 },
  { id: 'DRUG-003', name: '利伐沙班片', spec: '10mg*10片', vendor: '拜耳医药', price: 16.50 },
  { id: 'DRUG-004', name: '阿莫西林胶囊', spec: '0.25g*24粒', vendor: '石药集团', price: 1.18 },
  { id: 'DRUG-005', name: '布地奈德吸入剂', spec: '2ml:1mg*5支', vendor: '阿斯利康', price: 12.40 },
];

const DemandDeclaration: React.FC<{ subKey: MenuKey }> = ({ subKey }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false); // 批量选品弹窗状态
  const [listTab, setListTab] = useState<'current' | 'history'>('current');
  const [hoverStatusId, setHoverStatusId] = useState<string | null>(null);
  
  // 审核相关状态
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditingItems, setAuditingItems] = useState<Declaration[]>([]);
  const [currentAuditIndex, setCurrentAuditIndex] = useState(0); 
  const [auditDecision, setAuditDecision] = useState<'pass' | 'reject'>('pass');
  const [auditComment, setAuditComment] = useState('');

  // 结果明细展示状态
  const [viewingResult, setViewingResult] = useState<Declaration | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // --- 审批流编辑器状态 ---
  const [activeFlowType, setActiveFlowType] = useState<'standard' | 'emergency' | 'scrap'>('standard');
  
  const [standardNodes, setStandardNodes] = useState<FlowNode[]>([
    { id: 's-1', label: '科室经办人提报', deptId: 'dept-6', staff: ['申领员'], description: '初始提报环节', type: 'start' },
    { id: 's-2', label: '科室主任审核', deptId: 'dept-6', staff: ['科室负责人'], description: '核实业务必要性', type: 'audit' },
    { id: 's-3', label: '职能部室审批', deptId: 'dept-2', staff: ['陈主任'], description: '专业维度审核', type: 'audit' },
    { id: 's-4', label: '资产设备科复核', deptId: 'dept-1', staff: ['王晓东', '李明华'], description: '库存与采购合规性复核', type: 'audit' },
    { id: 's-5', label: '采购执行', deptId: 'dept-1', staff: ['赵建国'], description: '流程结束转入采购阶段', type: 'execute' },
  ]);

  const [emergencyNodes, setEmergencyNodes] = useState<FlowNode[]>([
    { id: 'e-1', label: '临床科室发起临采', deptId: 'dept-6', staff: ['申领员'], description: '针对目录外急需品的临时申请', type: 'start' },
    { id: 'e-2', label: '科室主任审核', deptId: 'dept-6', staff: ['科室负责人'], description: '确认采购紧迫性', type: 'audit' },
    { id: 'e-3', label: '药剂科/办专业初审', deptId: 'dept-7', staff: ['林主任'], description: '技术性及准入审核', type: 'audit' },
    { id: 'e-4', label: '分管院长终审', deptId: 'dept-5', staff: ['高院长'], description: '合规性及资金审批', type: 'audit' },
    { id: 'e-5', label: '采购部特项执行', deptId: 'dept-1', staff: ['孙志远'], description: '建立临时采购档案并下单', type: 'execute' },
  ]);

  const [scrapNodes, setScrapNodes] = useState<FlowNode[]>([
    { id: 'sc-1', label: '科室发起报废申请', deptId: 'dept-6', staff: ['申领员'], description: '录入资产现状及报废原因', type: 'start' },
    { id: 'sc-2', label: '科室主任审核', deptId: 'dept-6', staff: ['科室负责人'], description: '确认设备已无使用价值', type: 'audit' },
    { id: 'sc-3', label: '资产管理处复核', deptId: 'dept-1', staff: ['王晓东', '李明华'], description: '核验折旧年限及残值预估', type: 'audit' },
    { id: 'sc-4', label: '分管院长签批', deptId: 'dept-5', staff: ['徐副院长'], description: '大型设备报废最终核准', type: 'audit' },
    { id: 'sc-5', label: '资产处置执行', deptId: 'dept-1', staff: ['赵建国'], description: '流程闭环，进行实物报废处置', type: 'execute' },
  ]);

  const flowNodes = useMemo(() => {
    if (activeFlowType === 'standard') return standardNodes;
    if (activeFlowType === 'emergency') return emergencyNodes;
    return scrapNodes;
  }, [activeFlowType, standardNodes, emergencyNodes, scrapNodes]);

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // 当前正在编辑的临时数据
  const [editingData, setEditingData] = useState<Partial<Declaration>>({
    deptCategory: '',
    dept: '',
    period: '2024年第三季度',
    items: [],
    submissionType: '药品' // 默认提报类型
  });

  const [declarations, setDeclarations] = useState<Declaration[]>([
    { 
      id: 'REQ-2024-05-01-XXXX-001', 
      deptCategory: '医技科室',
      dept: '医学影像中心-放射科检查组', 
      amount: 12800, 
      status: 'auditing', 
      applicant: '王主任', 
      time: '2024-05-18 10:30:22',
      period: '2024年第三季度',
      reason: '科室手术量季节性增加',
      items: [{ id: '1', drugId: 'DRUG-001', quantity: 1000, reason: '临床必备', price: 3.84 }],
      submissionType: '药品'
    },
    { 
      id: 'REQ-2024-05-02-XXXX-002', 
      deptCategory: '临床科室',
      dept: '重症医学科(ICU)-中心病区', 
      amount: 4500, 
      status: 'draft', 
      applicant: '王主任', 
      time: '2024-05-19 14:15:05',
      period: '2024年第四季度',
      reason: '科研备用耗材申请',
      items: [{ id: '1', drugId: 'DRUG-003', quantity: 200, reason: '重点实验项目', price: 16.50 }],
      submissionType: '耗材'
    },
    { 
      id: 'REQ-2024-05-03-XXXX-005', 
      deptCategory: '临床科室',
      dept: '呼吸内科门诊', 
      amount: 8600, 
      status: 'auditing', 
      applicant: '陈医生', 
      time: '2024-05-20 09:12:33',
      period: '2024年第三季度',
      reason: '季度常规补货',
      items: [{ id: '1', drugId: 'DRUG-005', quantity: 500, reason: '临床常备', price: 12.40 }],
      submissionType: '药品'
    },
    { 
      id: 'REQ-2024-05-04-XXXX-006', 
      deptCategory: '临床科室',
      dept: '急诊医学科', 
      amount: 15200, 
      status: 'auditing', 
      applicant: '张护士长', 
      time: '2024-05-20 11:45:10',
      period: '2024年第三季度',
      reason: '急救物资增补',
      items: [{ id: '1', drugId: 'DRUG-004', quantity: 1200, reason: '急诊高峰预备', price: 1.18 }],
      submissionType: '药品'
    },
    { 
      id: 'REQ-2024-05-05-XXXX-007', 
      deptCategory: '医技科室',
      dept: '检验科-生化组', 
      amount: 32000, 
      status: 'auditing', 
      applicant: '刘技师', 
      time: '2024-05-21 08:30:00',
      period: '2024年第四季度',
      reason: '实验室试剂耗材',
      items: [{ id: '1', drugId: 'DRUG-002', quantity: 5000, reason: '样本检测量增加', price: 0.15 }],
      submissionType: '耗材'
    },
    { 
      id: 'REQ-2024-05-06-XXXX-008', 
      deptCategory: '医技科室',
      dept: '病理科', 
      amount: 9800, 
      status: 'draft', 
      applicant: '孙主任', 
      time: '2024-05-21 14:20:55',
      period: '2024年第三季度',
      reason: '科室科研项目申请',
      items: [{ id: '1', drugId: 'DRUG-003', quantity: 400, reason: '实验比对', price: 16.50 }],
      submissionType: '耗材'
    },
    { 
      id: 'REQ-2024-05-07-XXXX-009', 
      deptCategory: '临床科室',
      dept: '心血管外科', 
      amount: 54000, 
      status: 'auditing', 
      applicant: '周教授', 
      time: '2024-05-22 10:05:12',
      period: '2024年第四季度',
      reason: '高值耗材专项申报',
      items: [{ id: '1', drugId: 'DRUG-001', quantity: 2500, reason: '手术量预期增长', price: 3.84 }],
      submissionType: '耗材'
    },
    { 
      id: 'REQ-2024-04-12-XXXX-003', 
      deptCategory: '临床科室',
      dept: '普通外科手术中心-第一分部', 
      amount: 21000, 
      status: 'completed', 
      applicant: '李医生', 
      time: '2024-04-12 09:00:00',
      period: '2024年第二季度',
      reason: '年度常规采购',
      items: [
        { id: '1', drugId: 'DRUG-002', quantity: 500, reason: '门诊备货', price: 0.15 },
        { id: '2', drugId: 'DRUG-004', quantity: 100, reason: '急诊常备', price: 1.18 }
      ],
      auditor: '超级管理员',
      auditComment: '符合季度用量波动范围，准予执行。',
      auditTime: '2024-04-13 14:22:00',
      submissionType: '药品'
    },
    { 
      id: 'REQ-2024-03-05-XXXX-004', 
      deptCategory: '临床科室',
      dept: '消化内科门诊中心', 
      amount: 8000, 
      status: 'voided', 
      applicant: '张护士', 
      time: '2024-03-05 16:45:10',
      period: '2024年第一季度',
      reason: '由于科室预算调整，申请废弃此单',
      items: [],
      auditor: '处室主任',
      auditComment: '应科室书面申请进行线下调减处理。',
      auditTime: '2024-03-06 09:00:10',
      submissionType: '耗材'
    },
    // New data for 'reported' status
    {
      id: 'REQ-2024-02-15-XXXX-010',
      deptCategory: '临床科室',
      dept: '神经内科住院部',
      amount: 45000,
      status: 'reported',
      applicant: '赵医生',
      time: '2024-02-15 10:00:00',
      period: '2024年第一季度',
      reason: '季度常规药品补充',
      items: [
        { id: '1', drugId: 'DRUG-003', quantity: 2000, reason: '临床治疗', price: 16.50 },
        { id: '2', drugId: 'DRUG-005', quantity: 800, reason: '备用', price: 12.40 }
      ],
      auditor: '超级管理员',
      auditComment: '审核通过，已上报采购平台。',
      auditTime: '2024-02-16 09:30:00',
      submissionType: '药品'
    },
    // New data for 'in_stock' status
    {
      id: 'REQ-2024-01-10-XXXX-011',
      deptCategory: '医技科室',
      dept: '检验科-免疫组',
      amount: 18000,
      status: 'in_stock',
      applicant: '钱技师',
      time: '2024-01-10 14:20:00',
      period: '2024年第一季度',
      reason: '免疫试剂耗材采购',
      items: [
        { id: '1', drugId: 'DRUG-002', quantity: 3000, reason: '常规检测', price: 0.15 },
        { id: '2', drugId: 'DRUG-004', quantity: 500, reason: '急诊备用', price: 1.18 }
      ],
      auditor: '超级管理员',
      auditComment: '同意采购，物资已入库。',
      auditTime: '2024-01-11 16:00:00',
      submissionType: '耗材'
    }
  ]);

  const getHeader = () => {
    switch(subKey) {
      case 'dec-report': return '科室需求提报';
      case 'dec-audit': return '审核管理';
      case 'dec-flow': return '审批流管理';
      default: return '需求申报执行';
    }
  };

  // 总价实时计算
  const totalAmount = useMemo(() => {
    return (editingData.items || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [editingData.items]);

  // 严格过滤列表数据：修正“进行中”排除历史数据
  const filteredDeclarations = useMemo(() => {
    return declarations.filter(d => {
      if (listTab === 'current') {
        // 进行中：仅显示 草稿(draft) 或 审核中(auditing)
        if (subKey === 'dec-audit') return d.status === 'auditing';
        return d.status === 'draft' || d.status === 'auditing'; 
      } else {
        // 历史：显示 已完成(completed), 已废弃(voided), 已上报(reported), 已入库(in_stock)
        return ['completed', 'voided', 'reported', 'in_stock'].includes(d.status);
      }
    });
  }, [declarations, listTab, subKey]);

  // 处理勾选逻辑
  const toggleAuditSelect = (id: string, index: number) => {
    if (listTab === 'history') return;
    if (subKey === 'dec-audit' && (index === 1 || index === 2)) return;

    const item = declarations.find(d => d.id === id);
    if (item?.status !== 'auditing') return;
    
    setSelectedAuditIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAuditSelectAll = () => {
    if (listTab === 'history') return;
    const auditableItems = filteredDeclarations.filter((d, idx) => 
      d.status === 'auditing' && !(subKey === 'dec-audit' && (idx === 1 || idx === 2))
    );
    if (selectedAuditIds.length === auditableItems.length) {
      setSelectedAuditIds([]);
    } else {
      setSelectedAuditIds(auditableItems.map(d => d.id));
    }
  };

  const handleOpenAudit = (items: Declaration[]) => {
    setAuditingItems(items);
    setCurrentAuditIndex(0);
    setAuditDecision('pass');
    setAuditComment('');
    setIsAuditModalOpen(true);
  };

  const handleExecuteAudit = () => {
    const currentItem = auditingItems[currentAuditIndex];
    setDeclarations(prev => prev.map(d => {
      if (d.id === currentItem.id) {
        return { 
          ...d, 
          status: auditDecision === 'pass' ? 'completed' : 'voided',
          auditor: '超级管理员',
          auditComment: auditComment || (auditDecision === 'pass' ? '自动核准通过' : '不符合准入条件'),
          auditTime: new Date().toLocaleString()
        };
      }
      return d;
    }));

    if (currentAuditIndex < auditingItems.length - 1) {
      setCurrentAuditIndex(prev => prev + 1);
      setAuditDecision('pass');
      setAuditComment('');
    } else {
      setIsAuditModalOpen(false);
      setSelectedAuditIds([]);
    }
  };

  const handleEditDraft = (declaration: Declaration) => {
    setEditingData(declaration);
    setIsCreating(true);
  };

  const handleRevoke = (id: string) => {
    if (confirm('确定要撤回该笔申报申请吗？撤回后将变更为草稿状态。')) {
      setDeclarations(prev => prev.map(d => d.id === id ? { ...d, status: 'draft' } : d));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要永久删除该份草稿吗？删除后不可恢复。')) {
      setDeclarations(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleReport = (id: string) => {
    if(confirm('确定要将该通过审核的单据上报至 HIS 系统吗？')) {
      setDeclarations(prev => prev.map(d => d.id === id ? { ...d, status: 'reported' } : d));
    }
  };

  const handleSyncHis = () => {
    setIsSyncing(true);
    // Simulate API call
    setTimeout(() => {
      let count = 0;
      setDeclarations(prev => prev.map(d => {
        if (d.status === 'reported') {
          count++;
          return { ...d, status: 'in_stock' };
        }
        return d;
      }));
      setIsSyncing(false);
      if(count > 0) alert(`HIS 同步成功！${count} 笔已上报单据更新为“已入库”状态。`);
      else alert('HIS 同步完成，暂无新入库数据。');
    }, 1500);
  };

  const handleCreateNew = () => {
    setEditingData({ deptCategory: '', dept: '', period: '2024年第三季度', items: [], submissionType: '药品' });
    setIsCreating(true);
  };

  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const toggleSelection = (id: string) => {
    setTempSelection(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const confirmSelection = () => {
    const newItems: DeclarationItem[] = tempSelection.map(id => {
      const product = CATALOG_DRUGS.find(p => p.id === id);
      return { id: Math.random().toString(36).substr(2, 9), drugId: id, quantity: 1, price: product?.price || 0, reason: '' };
    });
    const existingIds = (editingData.items || []).map(i => i.drugId);
    const filteredNew = newItems.filter(ni => !existingIds.includes(ni.drugId));
    setEditingData(prev => ({ ...prev, items: [...(prev.items || []), ...filteredNew] }));
    setIsSelectorOpen(false);
    setTempSelection([]);
  };

  // --- 审批流管理核心逻辑 ---
  const addFlowNode = (index: number) => {
    const prefix = activeFlowType === 'standard' ? 's' : activeFlowType === 'emergency' ? 'e' : 'sc';
    const newNode: FlowNode = {
      id: `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
      label: '新审批阶段',
      deptId: 'dept-1', // 默认选中第一个部门
      staff: [],
      description: '请点击节点配置审批权限',
      type: 'audit'
    };
    const update = (nodes: FlowNode[]) => {
      const copy = [...nodes];
      copy.splice(index + 1, 0, newNode);
      return copy;
    };
    if (activeFlowType === 'standard') setStandardNodes(update);
    else if (activeFlowType === 'emergency') setEmergencyNodes(update);
    else setScrapNodes(update);
  };

  const removeFlowNode = (id: string) => {
    const nodeIndex = flowNodes.findIndex(n => n.id === id);
    if (nodeIndex === 0) {
      alert('首个提报环节为系统预设，不可删除');
      return;
    }
    if (flowNodes[nodeIndex].type === 'execute') {
      alert('执行环节不可删除');
      return;
    }
    const filter = (nodes: FlowNode[]) => nodes.filter(n => n.id !== id);
    if (activeFlowType === 'standard') setStandardNodes(filter);
    else if (activeFlowType === 'emergency') setEmergencyNodes(filter);
    else setScrapNodes(filter);
    if (editingNodeId === id) setEditingNodeId(null);
  };

  const updateFlowNode = (id: string, data: Partial<FlowNode>) => {
    const update = (nodes: FlowNode[]) => nodes.map(n => n.id === id ? { ...n, ...data } : n);
    if (activeFlowType === 'standard') setStandardNodes(update);
    else if (activeFlowType === 'emergency') setEmergencyNodes(update);
    else setScrapNodes(update);
  };

  // 渲染审批流设计器
  const renderFlowEditor = () => {
    const editingNode = flowNodes.find(n => n.id === editingNodeId);
    const isFirstNode = flowNodes[0]?.id === editingNodeId;
    const availableStaff = ORG_STRUCTURE.find(o => o.id === editingNode?.deptId)?.staff || [];

    return (
      <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
        {/* 流程切换器 */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
           <div className="flex items-center space-x-1 p-1 bg-gray-200/50 rounded-xl">
              <button 
                onClick={() => { setActiveFlowType('standard'); setEditingNodeId(null); }}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center ${activeFlowType === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FileText size={14} className="mr-2" /> 需求申报流程
              </button>
              <button 
                onClick={() => { setActiveFlowType('emergency'); setEditingNodeId(null); }}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center ${activeFlowType === 'emergency' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Zap size={14} className="mr-2" /> 临采审批流
              </button>
              <button 
                onClick={() => { setActiveFlowType('scrap'); setEditingNodeId(null); }}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center ${activeFlowType === 'scrap' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Trash2 size={14} className="mr-2" /> 设备报废审批流
              </button>
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
            当前编辑模式：{activeFlowType === 'standard' ? '常规申报路径' : activeFlowType === 'emergency' ? '临时增补通道' : '报废处置工作流'}
           </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧流程画布 */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-12 scrollbar-hide relative">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    {activeFlowType === 'standard' && '全院申报流程蓝图'}
                    {activeFlowType === 'emergency' && '临时采购(临采)审批引擎'}
                    {activeFlowType === 'scrap' && '设备资产报废审批机制'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">您可以动态增加审批层级，但提报起始环节由系统锁定</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-100 flex items-center hover:scale-105 transition-all">
                  <Save size={18} className="mr-2" /> 发布并应用
                </button>
              </div>

              <div className="relative">
                {/* 连接线 */}
                <div className={`absolute left-8 top-10 bottom-10 w-0.5 z-0 ${
                  activeFlowType === 'standard' ? 'bg-blue-100' : 
                  activeFlowType === 'emergency' ? 'bg-indigo-100' : 'bg-red-100'
                }`}></div>
                
                <div className="space-y-10 relative z-10">
                    {flowNodes.map((node, index) => {
                      const deptName = ORG_STRUCTURE.find(o => o.id === node.deptId)?.name;
                      const themeColor = activeFlowType === 'standard' ? 'blue' : activeFlowType === 'emergency' ? 'indigo' : 'red';
                      
                      return (
                        <div key={node.id} className="relative group">
                          <div 
                            onClick={() => setEditingNodeId(node.id)}
                            className={`flex items-start space-x-6 p-6 rounded-[28px] border-2 transition-all cursor-pointer ${
                              editingNodeId === node.id 
                                ? `bg-white border-${themeColor}-600 shadow-2xl scale-[1.02]` 
                                : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                            }`}
                          >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative ${
                              node.type === 'start' ? `bg-${themeColor}-600 text-white` : 
                              node.type === 'execute' ? 'bg-green-600 text-white' : 
                              'bg-white border-blue-100 text-blue-600 border'
                            }`}>
                              {node.type === 'start' ? (
                                activeFlowType === 'standard' ? <FileText size={28} /> : 
                                activeFlowType === 'emergency' ? <Zap size={28} /> : <Trash2 size={28} />
                              ) : node.type === 'execute' ? <BadgeCheck size={28} /> : <UserCheck size={28} />}
                              {index === 0 && (
                                <div className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full shadow-lg">
                                  <Lock size={12} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 pr-8">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-lg font-black text-gray-800">{node.label}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                  node.type === 'audit' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {node.type === 'start' ? '发起节点' : node.type === 'execute' ? '执行环节' : '审批节点'}
                                </span>
                              </div>
                              <div className={`flex items-center text-[10px] font-bold mb-2 text-${themeColor}-600`}>
                                <Building2 size={12} className="mr-1" /> {deptName || '未分配部门'}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {node.staff.length > 0 ? node.staff.map(s => (
                                  <span key={s} className="flex items-center px-2.5 py-1 bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-600 rounded-lg">
                                    <User size={10} className="mr-1.5 text-blue-400" /> {s}
                                  </span>
                                )) : (
                                  <span className="text-[10px] text-gray-300 font-bold italic">未配置审批人</span>
                                )}
                              </div>
                            </div>
                            {node.type === 'audit' && index !== 0 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFlowNode(node.id); }}
                                className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
                              ><Trash2 size={18}/></button>
                            )}
                          </div>

                          {/* 添加按钮 (节点间) */}
                          {index < flowNodes.length - 1 && (
                            <div className="absolute left-5 -bottom-7 z-20">
                               <button 
                                onClick={() => addFlowNode(index)}
                                className="w-7 h-7 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group"
                               >
                                 <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                               </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧属性面板 */}
          <div className="w-96 bg-white border-l border-gray-100 p-8 shrink-0 animate-in slide-in-from-right duration-300 overflow-y-auto scrollbar-hide">
            {editingNodeId ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-lg font-black text-gray-800">节点属性配置</h4>
                   {isFirstNode && (
                     <span className="flex items-center text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                       <Lock size={12} className="mr-1.5" /> 只读环节
                     </span>
                   )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">节点显示名称</label>
                    <input 
                      type="text" 
                      disabled={isFirstNode}
                      value={editingNode?.label} 
                      onChange={(e) => updateFlowNode(editingNodeId, { label: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50" 
                    />
                  </div>

                  <div className="space-y-6 pt-4 border-t border-gray-50">
                    {/* 第一步：选择部门 */}
                    <div className="space-y-2">
                      <label className={`text-[10px] font-black uppercase tracking-widest block ml-1 flex items-center ${
                        activeFlowType === 'standard' ? 'text-blue-600' : 
                        activeFlowType === 'emergency' ? 'text-indigo-600' : 'text-red-600'
                      }`}>
                        第一步：选择归属部门
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          disabled={isFirstNode}
                          value={editingNode?.deptId}
                          onChange={(e) => updateFlowNode(editingNodeId, { deptId: e.target.value, staff: [] })}
                          className={`w-full px-4 py-3 bg-opacity-10 border rounded-2xl text-sm font-black outline-none focus:ring-2 disabled:opacity-50 ${
                            activeFlowType === 'scrap' ? 'bg-red-500 border-red-100 text-red-900 focus:ring-red-500/20' : 'bg-blue-50 border-blue-100 text-blue-900 focus:ring-blue-500/20'
                          }`}
                        >
                          {ORG_STRUCTURE.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 第二步：勾选人员 */}
                    <div className="space-y-2">
                      <label className={`text-[10px] font-black uppercase tracking-widest block ml-1 flex items-center ${
                        activeFlowType === 'standard' ? 'text-blue-600' : 
                        activeFlowType === 'emergency' ? 'text-indigo-600' : 'text-red-600'
                      }`}>
                        第二步：勾选部门内审批人
                      </label>
                      <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                        {availableStaff.map(s => {
                          const isChecked = editingNode?.staff.includes(s);
                          const activeColor = activeFlowType === 'scrap' ? 'red' : activeFlowType === 'emergency' ? 'indigo' : 'blue';
                          
                          return (
                            <label key={s} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                              isChecked ? `bg-white shadow-sm border border-${activeColor}-100` : 'hover:bg-gray-100'
                            } ${isFirstNode ? 'pointer-events-none opacity-80' : ''}`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isChecked ? `bg-${activeColor}-600 border-${activeColor}-600` : 'bg-white border-gray-300'
                                }`}>
                                  {isChecked && <Check size={14} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className={`text-xs font-black ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>{s}</span>
                              </div>
                              {isChecked && <UserCheck size={14} className={`text-${activeColor}-600`} />}
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={isChecked}
                                onChange={() => {
                                  if (isFirstNode) return;
                                  const newStaff = isChecked 
                                    ? editingNode?.staff.filter(st => st !== s) || []
                                    : [...(editingNode?.staff || []), s];
                                  updateFlowNode(editingNodeId, { staff: newStaff });
                                }}
                              />
                            </label>
                          );
                        })}
                        {availableStaff.length === 0 && (
                          <p className="text-[10px] text-center text-gray-400 py-8 italic">请先选择一个有效的部门</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">业务功能定义</label>
                    <textarea 
                      disabled={isFirstNode}
                      value={editingNode?.description} 
                      onChange={(e) => updateFlowNode(editingNodeId, { description: e.target.value })}
                      className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none disabled:opacity-50" 
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => setEditingNodeId(null)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-100 hover:bg-black transition-all"
                    >
                      保存节点配置
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200 mb-6">
                  <LayoutGrid size={48} />
                </div>
                <h5 className="text-base font-black text-gray-800">未选择任何节点</h5>
                <p className="text-xs text-gray-400 mt-2 font-medium">请在左侧蓝图中点击具体节点，进行审批权限与角色的精细化配置</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染结果明细弹窗
  const renderResultDetailModal = () => {
    if (!viewingResult) return null;
    const isPass = viewingResult.status === 'completed';

    return (
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingResult(null)}></div>
        <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[85vh]">
          <div className={`px-8 py-6 text-white flex justify-between items-center shrink-0 ${isPass ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="flex items-center space-x-3">
               <BadgeCheck size={24} />
               <h3 className="text-xl font-black tracking-tight">申报审核执行报告</h3>
            </div>
            <button onClick={() => setViewingResult(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
             <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">单据编号</p>
                   <p className="text-sm font-mono font-black text-gray-800">{viewingResult.id}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">当前状态</p>
                   <p className={`text-sm font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>{isPass ? '审核已通过' : '申请被驳回'}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-gray-900 pl-3">申报基础信息</h4>
                   <div className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                      <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报科室:</span> <span className="text-gray-800 font-black">{viewingResult.dept}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报人员:</span> <span className="text-gray-800 font-black">{viewingResult.applicant}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">申报周期:</span> <span className="text-gray-800 font-black">{viewingResult.period}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报时间:</span> <span className="text-gray-800 font-black">{viewingResult.time}</span></div>
                      {viewingResult.submissionType && <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">提报类型:</span> <span className="text-gray-800 font-black">{viewingResult.submissionType}</span></div>}
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">审计处理追踪</h4>
                   <div className="space-y-3 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                      <div className="flex justify-between text-xs"><span className="text-indigo-400 font-bold">审核人员:</span> <span className="text-indigo-900 font-black">{viewingResult.auditor || '系统审计'}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-indigo-400 font-bold">处理时间:</span> <span className="text-indigo-900 font-black">{viewingResult.auditTime || '--'}</span></div>
                      <div className="pt-2 mt-2 border-t border-indigo-100">
                         <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">审核意见:</span>
                         <p className="text-xs text-indigo-800 leading-relaxed font-medium italic">“{viewingResult.auditComment}”</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-l-4 border-blue-600 pl-3">申报清单明细</h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-black">
                      <tr>
                        <th className="px-5 py-3">产品名称/规格</th>
                        <th className="px-5 py-3 text-center">数量</th>
                        <th className="px-5 py-3 text-right">参考流水</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {viewingResult.items.length > 0 ? (
                        viewingResult.items.map((item, idx) => {
                          const product = CATALOG_DRUGS.find(p => p.id === item.drugId);
                          return (
                            <tr key={idx}>
                              <td className="px-5 py-3">
                                <p className="font-bold text-gray-800">{product?.name}</p>
                                <p className="text-[10px] text-gray-400">{product?.spec}</p>
                              </td>
                              <td className="px-5 py-3 text-center font-mono font-black text-indigo-600">{item.quantity}</td>
                              <td className="px-5 py-3 text-right font-mono text-gray-600">￥{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">该单据无明细内容</td></tr>
                      )}
                      <tr className="bg-gray-50/50">
                        <td colSpan={2} className="px-5 py-3 text-right font-bold text-gray-400 uppercase tracking-widest">总计金额估算:</td>
                        <td className="px-5 py-3 text-right font-black text-blue-600 text-sm">￥{formatCurrency(viewingResult.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>

             <div className="flex justify-between items-center pt-8 opacity-40 grayscale pointer-events-none">
                <div className="flex flex-col items-center">
                   <div className="w-20 h-10 border-b border-gray-400 flex items-end justify-center font-mono text-sm">{viewingResult.applicant.slice(0,1)}**</div>
                   <span className="text-[9px] text-gray-400 font-bold mt-1">提报人电子签名</span>
                </div>
                <div className="relative">
                   <div className={`w-20 h-20 border-2 rounded-full flex items-center justify-center rotate-[-12deg] ${isPass ? 'border-green-600/30' : 'border-red-600/30'}`}>
                      <div className="text-center">
                         <p className={`text-[8px] font-black uppercase ${isPass ? 'text-green-600/30' : 'text-red-600/30'}`}>审计通过</p>
                         <div className={`my-0.5 border-t ${isPass ? 'border-green-600/30' : 'border-red-600/30'}`}></div>
                         <p className={`text-[8px] font-bold ${isPass ? 'text-green-600/30' : 'text-red-600/30'}`}>{viewingResult.auditTime?.split(' ')[0]}</p>
                      </div>
                   </div>
                   <div className="absolute -top-2 -right-2"><Stamp size={24} className="text-gray-300/30" /></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染批量选品弹窗
  const renderProductSelector = () => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSelectorOpen(false)}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
          <h4 className="text-lg font-black text-gray-800">选择目标申报产品</h4>
          <button onClick={() => setIsSelectorOpen(false)}><X className="text-gray-400" /></button>
        </div>
        <div className="p-4 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="输入名称或拼音码检索..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {CATALOG_DRUGS.map(drug => (
            <div 
              key={drug.id} 
              onClick={() => toggleSelection(drug.id)}
              className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between ${tempSelection.includes(drug.id) ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${tempSelection.includes(drug.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {tempSelection.includes(drug.id) && <Check size={14} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 whitespace-nowrap">{drug.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{drug.spec} | {drug.vendor}</p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="text-sm font-black text-blue-600 font-mono">￥{formatCurrency(drug.price)}</p>
                <p className="text-[10px] text-gray-400">HIS参考价</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center whitespace-nowrap">
          <span className="text-xs font-bold text-gray-400">已选 {tempSelection.length} 项产品</span>
          <button 
            disabled={tempSelection.length === 0}
            onClick={confirmSelection}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg disabled:opacity-50"
          >
            确认加入申报单
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染审核弹窗
  const renderAuditModal = () => {
    const currentItem = auditingItems[currentAuditIndex];
    if (!currentItem) return null;

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAuditModalOpen(false)}></div>
        <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white flex flex-col max-h-[88vh]">
          <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
               <ShieldCheck size={24} />
               <h3 className="text-xl font-black tracking-tight">单据审核决策</h3>
            </div>
            <div className="flex items-center space-x-4">
               {auditingItems.length > 1 && (
                 <div className="flex items-center bg-white/10 px-3 py-1 rounded-full text-xs font-bold space-x-2">
                    <button 
                      disabled={currentAuditIndex === 0}
                      onClick={() => setCurrentAuditIndex(prev => prev - 1)}
                      className="disabled:opacity-30"
                    ><ChevronLeftCircle size={16}/></button>
                    <span className="font-mono tracking-tighter">第 {currentAuditIndex + 1} / {auditingItems.length} 份</span>
                    <button 
                      disabled={currentAuditIndex === auditingItems.length - 1}
                      onClick={() => setCurrentAuditIndex(prev => prev + 1)}
                      className="disabled:opacity-30"
                    ><ChevronRightCircle size={16}/></button>
                 </div>
               )}
               <button onClick={() => setIsAuditModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
             <div className="grid grid-cols-2 gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
               <div className="space-y-1.5">
                  <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <MapPin size={10} className="mr-1"/> 申报科室
                  </div>
                  <p className="text-sm font-black text-indigo-900">{currentItem.dept}</p>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <User size={10} className="mr-1"/> 提报人员
                  </div>
                  <p className="text-sm font-black text-indigo-900">{currentItem.applicant}</p>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <Calendar size={10} className="mr-1"/> 申报周期
                  </div>
                  <p className="text-sm font-black text-indigo-900">{currentItem.period}</p>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <Calculator size={10} className="mr-1"/> 预估流水总计
                  </div>
                  <p className="text-lg font-black text-indigo-600 font-mono">￥{formatCurrency(currentItem.amount)}</p>
               </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center space-x-2 ml-1">
                  <ListOrdered size={14} className="text-gray-400" />
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">申报明细项 ({currentItem.items.length})</label>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-black uppercase">
                      <tr>
                        <th className="px-4 py-3">产品名称/规格</th>
                        <th className="px-4 py-3 text-center">申报数量</th>
                        <th className="px-4 py-3 text-right">参考流水</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentItem.items.length > 0 ? (
                        currentItem.items.map((item, idx) => {
                          const product = CATALOG_DRUGS.find(p => p.id === item.drugId);
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3">
                                <p className="font-bold text-gray-800">{product?.name || '未知产品'}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{product?.spec}</p>
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-black text-indigo-600 bg-indigo-50/20">{item.quantity}</td>
                              <td className="px-4 py-3 text-right font-mono text-gray-600">￥{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">该单据暂无明细</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>

             <div className="space-y-4 pt-2 border-t border-dashed">
               <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">审核结论</label>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAuditDecision('pass')}
                    className={`p-4 rounded-2xl border-2 border-transparent flex flex-col items-center transition-all ${auditDecision === 'pass' ? 'border-green-500 bg-green-50/50 text-green-700 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <CheckCircle2 size={24} className="mb-2" />
                    <span className="text-sm font-black">审核通过</span>
                  </button>
                  <button 
                    onClick={() => setAuditDecision('reject')}
                    className={`p-4 rounded-2xl border-2 border-transparent flex flex-col items-center transition-all ${auditDecision === 'reject' ? 'border-red-500 bg-red-50/50 text-red-700 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <AlertCircle size={24} className="mb-2" />
                    <span className="text-sm font-black">驳回申请</span>
                  </button>
               </div>
             </div>

             <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
               <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center">
                 <MessageSquare size={14} className="mr-1.5" /> 审核理由/意见 {auditDecision === 'reject' && <span className="text-red-500 ml-1 font-bold">*</span>}
               </label>
               <textarea 
                 value={auditComment}
                 onChange={(e) => setAuditComment(e.target.value)}
                 placeholder={auditDecision === 'pass' ? "可填入核准建议..." : "请详细说明驳回原因，以便提报人进行修改..."}
                 className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
               />
             </div>
          </div>
          
          <div className="p-8 border-t bg-gray-50/50 flex space-x-4 shrink-0">
             <button onClick={() => setIsAuditModalOpen(false)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors">取消</button>
             <button 
              disabled={auditDecision === 'reject' && !auditComment.trim()}
              onClick={handleExecuteAudit}
              className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 ${auditDecision === 'pass' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}
             >
               {currentAuditIndex < auditingItems.length - 1 ? '确认并审核下一份' : '完成本次审核'}
             </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染表单模态框
  const renderForm = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreating(false)}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <Plus size={24} />
            <h3 className="text-xl font-black tracking-tight">{editingData?.id ? '编辑需求申报单' : '发起新需求申报'}</h3>
          </div>
          <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {/* 更新网格为4列以容纳新字段 */}
          <div className="grid grid-cols-4 gap-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
            {/* 新增提报类型选择 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">提报类型</label>
              <select
                value={editingData?.submissionType}
                onChange={(e) => setEditingData(prev => ({ ...prev, submissionType: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="药品">药品</option>
                <option value="耗材">耗材</option>
                <option value="设备">设备</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">申报科室类别</label>
              <select 
                value={editingData?.deptCategory}
                onChange={(e) => setEditingData(prev => ({ ...prev, deptCategory: e.target.value, dept: '' }))}
                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">请选择类别...</option>
                {Object.keys(DEPT_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">具体申报科室</label>
              <select 
                value={editingData?.dept}
                disabled={!editingData?.deptCategory}
                onChange={(e) => setEditingData(prev => ({ ...prev, dept: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">请选择具体科室...</option>
                {editingData?.deptCategory && DEPT_MAP[editingData.deptCategory].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">申报周期</label>
              <select 
                value={editingData?.period}
                onChange={(e) => setEditingData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>2024年第三季度</option>
                <option>2024年第四季度</option>
                <option>年度补充申报</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-sm font-black text-gray-800 flex items-center">
                <Package size={18} className="mr-2 text-blue-600" /> 申报产品明细清单
              </h4>
              <button 
                onClick={() => setIsSelectorOpen(true)}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl flex items-center border border-blue-100 shadow-sm transition-all"
              >
                <Plus size={14} className="mr-1" /> 批量添加申报产品
              </button>
            </div>
            
            <div className="space-y-4">
              {editingData?.items?.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                   <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto text-gray-300 mb-4"><Package size={40} /></div>
                   <p className="text-sm text-gray-400 font-bold">暂无申报内容，请点击上方按钮批量导入产品</p>
                </div>
              ) : (
                editingData?.items?.map((item, index) => {
                  const productInfo = CATALOG_DRUGS.find(p => p.id === item.drugId);
                  return (
                    <div key={item.id} className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-5 relative group border-l-4 border-l-blue-500">
                      <button 
                        onClick={() => setEditingData(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== item.id) }))}
                        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      ><Trash2 size={18}/></button>
                      <div className="grid grid-cols-5 gap-6">
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">选定产品信息</label>
                          <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                             <p className="text-sm font-black text-gray-800 whitespace-nowrap">{productInfo?.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{productInfo?.spec}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">申报采购数量</label>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 0);
                              const newItems = [...(editingData.items || [])];
                              newItems[index].quantity = val;
                              setEditingData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">HIS 单价</label>
                          <div className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-50 rounded-xl text-sm font-mono font-bold text-gray-400 whitespace-nowrap">
                            ￥{formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-blue-400 uppercase ml-1">预估总价</label>
                          <div className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-mono font-black text-blue-600 whitespace-nowrap">
                            ￥{formatCurrency(item.quantity * item.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-6 whitespace-nowrap">
            <div className="flex items-center text-xs text-gray-400 font-bold italic">
              <Info size={16} className="mr-2 text-blue-500" /> 
              提示：单价数据实时同步自 HIS 数据库。
            </div>
            <div className="flex items-center space-x-2">
               <Calculator size={18} className="text-blue-600" />
               <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">全单总额预估:</span>
               <span className="text-2xl font-black text-blue-600 font-mono">￥{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <div className="flex space-x-4 whitespace-nowrap">
             <button onClick={() => setIsCreating(false)} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center">
               <Save size={18} className="mr-2" /> 保存为草稿
             </button>
             <button 
                disabled={!editingData.dept || editingData.items?.length === 0}
                onClick={() => setIsCreating(false)} 
                className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
             >
               <Send size={18} className="mr-2" /> 正式提交审核
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible flex flex-col flex-1">
          {/* Header & Tabs */}
          <div className="px-8 pt-8 flex justify-between items-end border-b border-gray-100">
             <div className="space-y-6 pb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 text-white rounded-2xl shadow-lg ${subKey === 'dec-flow' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                    {subKey === 'dec-flow' ? <Share2 size={22} /> : <FileText size={22} />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{getHeader()}</h3>
                </div>
                {subKey !== 'dec-flow' && (
                  <div className="flex space-x-1 p-1.5 bg-gray-100/80 rounded-2xl w-fit">
                    <button 
                      onClick={() => { setListTab('current'); setSelectedAuditIds([]); }}
                      className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${listTab === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      当前进行中
                    </button>
                    <button 
                      onClick={() => { setListTab('history'); setSelectedAuditIds([]); }}
                      className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${listTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      审核历史
                    </button>
                  </div>
                )}
             </div>

             <div className="pb-6">
               {subKey === 'dec-report' && listTab === 'current' && (
                  <button 
                    onClick={handleCreateNew}
                    className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <Plus size={20} className="mr-2" /> 发起申报
                  </button>
               )}
               {subKey === 'dec-audit' && listTab === 'current' && selectedAuditIds.length > 0 && (
                  <button 
                    onClick={() => handleOpenAudit(declarations.filter(d => selectedAuditIds.includes(d.id)))}
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center hover:bg-indigo-700 active:scale-95 transition-all animate-in slide-in-from-right-4"
                  >
                    <ShieldCheck size={20} className="mr-2" /> 批量审核
                  </button>
               )}
             </div>
          </div>

          {subKey === 'dec-flow' ? (
            renderFlowEditor()
          ) : (
            <div className="p-8 space-y-6 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="搜索单号、提报人关键词..." className="w-full h-12 pl-12 pr-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-700" />
                </div>
                <div className="flex space-x-3">
                   <button 
                     onClick={handleSyncHis}
                     disabled={isSyncing}
                     className="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all whitespace-nowrap"
                   >
                     <RefreshCcw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> 
                     {isSyncing ? '同步中...' : '同步 HIS'}
                   </button>
                   <button className="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap">
                     <Calendar size={16} className="mr-2 text-blue-500" /> 周期维度
                   </button>
                   <button className="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap">
                     <Filter size={16} className="mr-2 text-indigo-500" /> 高级过滤
                   </button>
                   <button className="flex items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap">
                     <Download size={16} className="mr-2 text-green-500" /> 导出
                   </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 shadow-sm bg-white overflow-x-auto overflow-y-visible flex-1 scrollbar-hide">
                <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b">
                       {subKey === 'dec-audit' && listTab === 'current' && (
                         <th className="px-6 py-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedAuditIds.length === filteredDeclarations.filter((d,idx) => d.status === 'auditing' && !(idx === 1 || idx === 2)).length && selectedAuditIds.length > 0}
                              onChange={toggleAuditSelectAll}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" 
                            />
                         </th>
                       )}
                       <th className="px-6 py-4 min-w-[240px] whitespace-nowrap">申报单编号</th>
                       <th className="px-6 py-4 min-w-[200px] whitespace-nowrap">申报科室</th>
                       <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">预估流水</th>
                       <th className="px-6 py-4 min-w-[140px] whitespace-nowrap">申报周期</th>
                       <th className="px-6 py-4 min-w-[100px] whitespace-nowrap">提报人</th>
                       <th className="px-6 py-4 min-w-[140px] whitespace-nowrap">状态追踪</th>
                       <th className="px-6 py-4 min-w-[120px] whitespace-nowrap text-center sticky right-0 bg-gray-50/50 z-10">操作</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {filteredDeclarations.map((item, index) => (
                       <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedAuditIds.includes(item.id) ? 'bg-indigo-50/50' : ''}`}>
                         {subKey === 'dec-audit' && listTab === 'current' && (
                           <td className="px-6 py-4 text-center">
                              {item.status === 'auditing' && !(index === 1 || index === 2) ? (
                                <input 
                                  type="checkbox" 
                                  checked={selectedAuditIds.includes(item.id)}
                                  onChange={() => toggleAuditSelect(item.id, index)}
                                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" 
                                />
                              ) : item.status === 'auditing' && (
                                <span className="text-[10px] text-gray-300 font-black">-</span>
                              )}
                           </td>
                         )}
                         <td className="px-6 py-6 whitespace-nowrap">
                            <span className="font-mono font-black text-gray-900 text-sm tracking-tight">{item.id}</span>
                         </td>
                         <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-[11px] text-blue-600 font-black uppercase flex items-center">
                              <div className="w-1 h-1 bg-blue-500 rounded-full mr-1.5"></div>{item.dept}
                            </span>
                         </td>
                         <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-800 font-mono">￥{formatCurrency(item.amount)}</span>
                         </td>
                         <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{item.period}</span>
                         </td>
                         <td className="px-6 py-6 whitespace-nowrap">
                            <span className="text-xs font-black text-gray-700">{item.applicant}</span>
                         </td>
                         <td className="px-6 py-6 whitespace-nowrap relative">
                           <div 
                            className="inline-block relative"
                            onMouseEnter={() => setHoverStatusId(item.id)}
                            onMouseLeave={() => setHoverStatusId(null)}
                           >
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border transition-all cursor-help shadow-sm whitespace-nowrap ${
                              item.status === 'auditing' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                              item.status === 'draft' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                              item.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                              item.status === 'reported' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                              item.status === 'in_stock' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                              'bg-red-50 text-red-500 border-red-100'
                            }`}>
                              {item.status === 'auditing' && <><Clock size={11} className="mr-1.5" /> 审批中</>}
                              {item.status === 'draft' && <><FileText size={11} className="mr-1.5" /> 草稿箱</>}
                              {item.status === 'completed' && <><CheckCircle2 size={11} className="mr-1.5" /> 已通过</>}
                              {item.status === 'reported' && <><Send size={11} className="mr-1.5" /> 已上报</>}
                              {item.status === 'in_stock' && <><Package size={11} className="mr-1.5" /> 已入库</>}
                              {item.status === 'voided' && <><AlertCircle size={11} className="mr-1.5" /> 被驳回</>}
                            </span>

                            {hoverStatusId === item.id && item.status !== 'draft' && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-4 z-[110] whitespace-normal">
                                 <div className="flex items-center space-x-2 mb-5 border-b border-gray-50 pb-3">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                    <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">流程节点追踪报告</h5>
                                 </div>
                                 <div className="space-y-5">
                                    <WorkflowNode status="completed" label="科室经办人提交" user={item.applicant} time={item.time} isLast={false} />
                                    <WorkflowNode status={item.status === 'auditing' ? 'processing' : (item.status === 'voided' ? 'voided' : 'completed')} label="处室主任初审" user="陈主任" time={item.status === 'completed' || item.status === 'reported' || item.status === 'in_stock' ? '已核准' : '审核中...'} isLast={false} />
                                    <WorkflowNode status={item.status === 'completed' || item.status === 'reported' || item.status === 'in_stock' ? 'completed' : 'pending'} label="资设科复核" user="库管办" time="--" isLast={true} />
                                 </div>
                                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
                              </div>
                            )}
                           </div>
                         </td>
                         <td className="px-6 py-6 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-blue-50/100 z-10 transition-colors">
                            <div className="flex flex-col items-center justify-center space-y-1">
                               {subKey === 'dec-audit' ? (
                                  item.status === 'auditing' ? (
                                    <>
                                      {!(index === 1 || index === 2) ? (
                                        <button onClick={() => handleOpenAudit([item])} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs transition-colors">审核</button>
                                      ) : (
                                        <span className="text-gray-400 font-bold text-[10px] cursor-not-allowed">无审核权</span>
                                      )}
                                      <button className="text-gray-400 hover:text-blue-600 font-bold text-xs transition-colors">详情</button>
                                    </>
                                  ) : (
                                    <button onClick={() => setViewingResult(item)} className="text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors">结果明细</button>
                                  )
                               ) : (
                                 // 科室需求提报模块操作项
                                 <>
                                   <button onClick={() => setViewingResult(item)} className="text-gray-500 hover:text-blue-600 font-bold text-xs transition-colors mb-1">明细</button>
                                   
                                   {listTab === 'current' ? (
                                     item.status === 'draft' ? (
                                       <div className="flex space-x-2">
                                         <button onClick={() => handleEditDraft(item)} className="text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors">编辑</button>
                                         <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 font-bold text-xs transition-colors">删除</button>
                                       </div>
                                     ) : (
                                       <button onClick={() => handleRevoke(item.id)} className="text-orange-600 hover:text-orange-800 font-bold text-xs transition-colors">撤销</button>
                                     )
                                   ) : (
                                     item.status === 'completed' && (
                                        <button 
                                          onClick={() => handleReport(item.id)}
                                          className="text-indigo-600 hover:text-indigo-800 font-bold text-xs transition-colors"
                                        >
                                          上报
                                        </button>
                                     )
                                   )}
                                 </>
                               )}
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between pt-10 shrink-0 whitespace-nowrap">
                 <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-6 py-2 rounded-full border border-gray-100 shadow-inner">
                    <HistoryIcon size={14} className="mr-2 text-blue-400" />
                    已显示最近三个月内的提报数据
                 </div>
                 
                 <div className="flex items-center space-x-2">
                    <button className="p-2 border border-gray-100 rounded-xl bg-white text-gray-300 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((page) => (
                        <button key={page} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}>{page}</button>
                      ))}
                    </div>
                    <button className="p-2 border border-gray-100 rounded-xl bg-white text-gray-300 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                      <ChevronRight size={16} />
                    </button>
                 </div>
              </div>
            </div>
          )}
       </div>

       {/* 表单弹窗 */}
       {isCreating && renderForm()}

       {/* 批量选品弹窗 */}
       {isSelectorOpen && renderProductSelector()}

       {/* 审核弹窗 */}
       {isAuditModalOpen && renderAuditModal()}

       {/* 结果明细弹窗 */}
       {viewingResult && renderResultDetailModal()}
    </div>
  );
};

// 审核流节点子组件 (用于列表气泡)
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

export default DemandDeclaration;
