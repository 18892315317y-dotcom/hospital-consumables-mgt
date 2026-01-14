
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RefreshCcw, 
  Upload, 
  FileText, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  X,
  Database,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Tag,
  Stethoscope,
  MoreHorizontal,
  ClipboardCheck,
  HardDrive,
  Layers,
  RotateCcw
} from 'lucide-react';
import { MenuKey } from '../types';

type CatalogTab = 'list' | 'sync';

interface SyncItem {
  id: string;
  productId: string;
  productCode: string;
  name: string;
  type: string;
  spec: string;
  vendor: string;
  externalPrice: number;
  localPrice: number | null;
  status: 'match' | 'new' | 'mismatch' | 'deleted';
  diffDetail?: string;
  // 设备/耗材特有
  model?: string;
  unit?: string;
  category?: string;
}

const CatalogManagement: React.FC<{ subKey: MenuKey }> = ({ subKey }) => {
  const isDrug = subKey === 'cat-drug';
  const isEquip = subKey === 'cat-equip';
  const isConsumable = subKey === 'cat-consumable';
  
  const [activeTab, setActiveTab] = useState<CatalogTab>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState<SyncItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // ========================== 1. 数据源定义 ==========================

  // --- 药品数据 (保持不变) ---
  const drugData = [
    { id: 'D-001', name: '阿托伐他汀钙片', spec: '20mg*7片', vendor: '大连辉瑞', shelfLife: '3年', batch: '第一批国家集采', status: '启用', usage: 1250, stock: 450, price: 3.84 },
    { id: 'D-002', name: '氨氯地平片', spec: '5mg*14片', vendor: '华润赛科', shelfLife: '2年', batch: '第二批国家集采', status: '已申报', usage: 890, stock: 120, price: 0.15 },
    { id: 'D-003', name: '恩替卡韦分散片', spec: '0.5mg*28片', vendor: '正大天晴', shelfLife: '2年', batch: '第一批国家集采', status: '启用', usage: 600, stock: 200, price: 5.62 },
    { id: 'D-004', name: '头孢克肟胶囊', spec: '0.1g*6粒', vendor: '成都倍特', shelfLife: '3年', batch: '第三批国家集采', status: '停用', usage: 300, stock: 0, price: 1.25 },
    { id: 'D-005', name: '利伐沙班片', spec: '10mg*10片', vendor: '拜耳医药', shelfLife: '3年', batch: '第五批国家集采', status: '已申报', usage: 150, stock: 85, price: 16.50 },
  ];

  const hisSyncDrugData: SyncItem[] = [
    { id: 'H-001', productId: 'PID-99201', productCode: '690123456001', name: '阿托伐他汀钙片', type: '口服', spec: '20mg*7片', vendor: '大连辉瑞', externalPrice: 3.84, localPrice: 3.84, status: 'match' },
    { id: 'H-002', productId: 'PID-99205', productCode: '690123456005', name: '阿莫西林胶囊', type: '口服', spec: '0.25g*24粒', vendor: '石药集团', externalPrice: 1.18, localPrice: 1.25, status: 'mismatch', diffDetail: '平台价格下调 ￥0.07' },
    { id: 'H-003', productId: 'PID-88302', productCode: '690123456882', name: '磷酸奥司他韦胶囊', type: '口服', spec: '75mg*10粒', vendor: '宜昌东阳光', externalPrice: 15.50, localPrice: null, status: 'new', diffDetail: '平台新增品种' },
  ];

  // --- 设备数据 ---
  const equipData = [
    { id: 'E-001', name: 'GE 螺旋CT扫描仪', spec: 'Optima 660', vendor: '通用医疗', designLife: '10年', dept: '影像科', status: '启用', usage: 4500, stock: 2, price: 4500000 },
    { id: 'E-002', name: '迈瑞 全自动监护仪', spec: 'BeneVision N22', vendor: '迈瑞医疗', designLife: '5年', dept: 'ICU', status: '已申报', usage: 120, stock: 15, price: 85000 },
    { id: 'E-003', name: '超声多普勒诊断系统', spec: 'EPIQ 7', vendor: '飞利浦', designLife: '8年', dept: '超声科', status: '启用', usage: 3200, stock: 4, price: 1200000 },
  ];

  const syncEquipData: SyncItem[] = [
    { id: 'HE-001', productId: 'EQ-8820', productCode: '6970001', name: 'GE 螺旋CT扫描仪', type: '大型设备', spec: 'Optima 660', vendor: '通用医疗', externalPrice: 4500000, localPrice: 4500000, status: 'match' },
    { id: 'HE-002', productId: 'EQ-7710', productCode: '6970002', name: '核磁共振成像仪', type: '大型设备', spec: 'SIGNA 1.5T', vendor: '通用医疗', externalPrice: 8800000, localPrice: null, status: 'new', diffDetail: '资产系统新增条目' },
  ];

  // --- 耗材数据 ---
  const consumableData = [
    { id: 'C-001', name: '一次性使用无菌注射器', spec: '5ml', unit: '支', vendor: '山东威高', category: '低值耗材', status: '启用', usage: 45000, stock: 12000, price: 0.45 },
    { id: 'C-002', name: '药物洗脱支架', spec: '3.0*18mm', unit: '套', vendor: '微创医疗', category: '高值耗材', status: '已申报', usage: 85, stock: 20, price: 7500 },
    { id: 'C-003', name: '医用外科口罩', spec: '挂耳型', unit: '盒', vendor: '稳健医疗', category: '低值耗材', status: '启用', usage: 12000, stock: 5000, price: 15.00 },
  ];

  const syncConsumableData: SyncItem[] = [
    { id: 'HC-001', productId: 'CS-1001', productCode: '6920001', name: '一次性使用无菌注射器', type: '普通耗材', spec: '5ml', vendor: '山东威高', externalPrice: 0.45, localPrice: 0.45, status: 'match' },
    { id: 'HC-002', productId: 'CS-2005', productCode: '6920005', name: '球囊扩张导管', type: '介入耗材', spec: '2.5*20mm', vendor: '微创医疗', externalPrice: 2800, localPrice: 3200, status: 'mismatch', diffDetail: 'SPD系统调价 ￥-400' },
  ];

  // ========================== 2. 交互逻辑定义 ==========================

  // 当前激活的数据集
  const currentListData = isDrug ? drugData : isEquip ? equipData : consumableData;
  const currentSyncData = isDrug ? hisSyncDrugData : isEquip ? syncEquipData : syncConsumableData;

  // 勾选逻辑
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [selectedSyncIds, setSelectedSyncIds] = useState<string[]>([]);

  const toggleListSelectAll = () => {
    if (selectedListIds.length === currentListData.length) setSelectedListIds([]);
    else setSelectedListIds(currentListData.map(d => d.id));
  };

  const toggleSyncSelectAll = () => {
    if (selectedSyncIds.length === currentSyncData.length) setSelectedSyncIds([]);
    else setSelectedSyncIds(currentSyncData.map(d => d.id));
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500); 
  };

  const getSyncStatusBadge = (status: SyncItem['status']) => {
    switch(status) {
      case 'match': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">数据一致</span>;
      case 'new': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200 whitespace-nowrap">系统新增</span>;
      case 'mismatch': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 whitespace-nowrap">信息差异</span>;
      case 'deleted': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">系统移除</span>;
    }
  };

  // 样式常量
  const FILTER_CONTAINER_CLASS = "p-6 border-b bg-gray-50/30 flex flex-wrap items-end gap-x-4 gap-y-3";

  // 主题配色
  const themeClass = isDrug ? 'teal' : isEquip ? 'indigo' : 'blue';
  const themeColorClass = isDrug ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-100' : isEquip ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100';
  const themeTextClass = isDrug ? 'text-teal-600' : isEquip ? 'text-indigo-600' : 'text-blue-600';
  const themeBorderClass = isDrug ? 'border-teal-200 text-teal-600 hover:bg-teal-50' : isEquip ? 'border-indigo-200 text-indigo-600 hover:bg-indigo-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50';

  return (
    <div className="p-6 space-y-6">
      {/* 顶部标题与核心操作 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className={`p-3 text-white rounded-xl shadow-lg ${isDrug ? 'bg-teal-600 shadow-teal-100' : isEquip ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>
            {isDrug ? <FileText size={24} /> : isEquip ? <HardDrive size={24} /> : <Layers size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {isDrug ? (activeTab === 'list' ? '集采药品申报目录' : '集采药品 HIS 库') : 
               isEquip ? (activeTab === 'list' ? '设备申报目录' : 'HIS 集采库') : 
               (activeTab === 'list' ? '耗材申报目录' : 'HIS 集采库')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isDrug ? '管理院内正式药品申报目录与外部 HIS 平台同步。' : isEquip ? '管理院内固定资产设备目录与 HIS 集采库同步。' : '管理院内高低值耗材目录与 HIS 集采库同步。'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === 'list' ? (
            <>
              <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                <Download size={16} className="mr-2" /> 导出报表
              </button>
              <button className={`flex items-center px-4 py-2 border rounded-lg text-sm font-bold transition-all ${isDrug ? 'border-teal-100 text-teal-600 bg-teal-50 hover:bg-teal-100' : isEquip ? 'border-indigo-100 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100'}`}>
                <Upload size={16} className="mr-2" /> 批量导入
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className={`flex items-center px-6 py-2 text-white rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95 ${isDrug ? 'bg-teal-600 shadow-teal-100 hover:bg-teal-700' : isEquip ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'}`}
              >
                <Plus size={18} className="mr-2" /> 手动录入
              </button>
            </>
          ) : (
            <div className="flex flex-col items-end">
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`flex items-center px-6 py-2.5 text-white rounded-lg text-sm font-black shadow-lg active:scale-95 transition-all disabled:opacity-50 ${isDrug ? 'bg-teal-600 shadow-teal-100 hover:bg-teal-700' : isEquip ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'}`}
              >
                {isSyncing ? <RefreshCcw size={16} className="mr-2 animate-spin" /> : <Database size={16} className="mr-2" />}
                同步 HIS 最新数据
              </button>
              <div className="flex items-center text-[10px] text-gray-400 font-medium italic mt-1">
                <Clock size={10} className="mr-1" /> 最后同步：今日 14:32:05
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 功能页签 */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-100 w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? (isDrug ? 'bg-teal-600 text-white shadow-md' : isEquip ? 'bg-indigo-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : 'text-gray-500 hover:bg-gray-50'}`}
        >
          {isDrug ? '药品申报目录' : isEquip ? '设备申报目录' : '耗材申报目录'}
        </button>
        <button 
          onClick={() => setActiveTab('sync')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'sync' ? (isDrug ? 'bg-teal-600 text-white shadow-md' : isEquip ? 'bg-indigo-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : 'text-gray-500 hover:bg-gray-50'}`}
        >
          {isDrug ? 'HIS 集采库' : isEquip ? 'HIS 集采库' : 'HIS 集采库'}
          <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
        </button>
      </div>

      {/* 主视图 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {activeTab === 'list' ? (
          /* 1. 申报目录视图 */
          <div className="animate-in fade-in duration-300">
            <div className={FILTER_CONTAINER_CLASS}>
              <div className="w-full md:w-80 lg:w-96 relative">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1 mb-1 block">模糊搜索</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isDrug ? "药品名称/规格..." : isEquip ? "设备名称/型号..." : "耗材名称/类别..."} 
                    className="w-full h-11 pl-10 pr-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-500/20 text-sm shadow-sm transition-all font-medium"
                  />
                </div>
              </div>
              {isDrug && (
                <>
                  <FilterGroup label="药品分类" options={['全部分类', '抗微生物', '心血管', '消化系统']} />
                  <FilterGroup label="生产厂家" options={['全部厂家', '大连辉瑞', '华润赛科', '正大天晴']} />
                </>
              )}
              {isEquip && (
                <>
                  <FilterGroup label="设备类型" options={['全部类型', '成像设备', '监护设备', '治疗设备']} />
                  <FilterGroup label="安装科室" options={['全部科室', '影像科', 'ICU', '超声科']} />
                </>
              )}
              {isConsumable && (
                <>
                  <FilterGroup label="耗材类别" options={['全部类别', '高值耗材', '低值耗材', '通用耗材']} />
                  <FilterGroup label="单位" options={['全部单位', '支', '套', '盒', '个']} />
                </>
              )}
              <FilterGroup label="状态" options={['全部状态', '启用', '停用', '已申报', '待审核']} />
              
              {/* 操作按钮组 */}
              <div className="flex items-center space-x-2">
                <button 
                  className={`h-11 px-6 rounded-xl text-white text-xs font-black flex items-center shadow-lg transition-all active:scale-95 ${themeColorClass}`}
                >
                  <Search size={16} className="mr-1.5" />
                  筛选
                </button>
                <button 
                  className={`h-11 px-4 border rounded-xl bg-white text-xs font-bold flex items-center transition-all hover:bg-gray-50 border-gray-200 text-gray-500`}
                >
                  <RotateCcw size={16} className="mr-1.5" />
                  取消筛选
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest border-b">
                    <th className="px-6 py-4 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedListIds.length === currentListData.length && currentListData.length > 0}
                        onChange={toggleListSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                      />
                    </th>
                    <th className="px-6 py-4">{isDrug ? '药品' : isEquip ? '设备' : '耗材'}编号/信息</th>
                    <th className="px-6 py-4">{isEquip ? '型号规格' : '规格属性'}</th>
                    <th className="px-6 py-4">{isEquip ? '安装科室' : '生产厂家'}</th>
                    <th className="px-6 py-4">{isEquip ? '设计年限' : isConsumable ? '单位' : '保质期'}</th>
                    <th className="px-6 py-4">使用频次/量</th>
                    <th className="px-6 py-4">当前库存</th>
                    <th className="px-6 py-4 text-right">参考价格</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentListData.map((item: any) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors group ${selectedListIds.includes(item.id) ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedListIds.includes(item.id)}
                          onChange={() => setSelectedListIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800">{item.name}</span>
                           <span className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">{item.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {isConsumable ? (
                          <div className="flex items-center space-x-2">
                             <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px]">{item.category}</span>
                             <span>{item.spec}</span>
                          </div>
                        ) : item.spec}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{isEquip ? item.dept : item.vendor}</td>
                      <td className="px-6 py-4 text-gray-500">{isEquip ? item.designLife : isConsumable ? item.unit : item.shelfLife}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-500"># {item.usage}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700">{item.stock}</td>
                      <td className="px-6 py-4 text-right font-black text-gray-700">￥{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === '启用' ? 'bg-teal-50 text-teal-700 border-teal-100' : 
                          item.status === '已申报' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className={`font-bold hover:underline ${isDrug ? 'text-teal-600' : isEquip ? 'text-indigo-600' : 'text-blue-600'}`}>移除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-gray-50/50 border-t flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">总计: {currentListData.length} 项</span>
                {selectedListIds.length > 0 && (
                  <button className={`flex items-center px-6 py-2 text-white rounded-lg text-sm font-black shadow-lg transition-all animate-in slide-in-from-left-2 ${isDrug ? 'bg-teal-600 shadow-teal-100 hover:bg-teal-700' : isEquip ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'}`}>
                    <ClipboardCheck size={16} className="mr-2" />
                    申报所选 ({selectedListIds.length})
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 border rounded-lg bg-white text-gray-400 hover:text-teal-600"><ChevronLeft size={16} /></button>
                <button className={`w-8 h-8 rounded-lg text-xs font-bold shadow-md ${isDrug ? 'bg-teal-600 text-white' : isEquip ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>1</button>
                <button className="p-2 border rounded-lg bg-white text-gray-400 hover:text-teal-600"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        ) : (
          /* 2. HIS 集采库同步视图 */
          <div className="animate-in fade-in duration-300">
            <div className={FILTER_CONTAINER_CLASS}>
                <div className="w-full md:w-56 lg:w-64 relative">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1 mb-1 block">模糊搜索</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="产品ID/编码/名称..." className="w-full h-11 pl-10 pr-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-500/20 text-sm shadow-sm transition-all font-medium" />
                  </div>
                </div>
                <FilterGroup label="对接系统" options={['全部来源', 'HIS 财务', '固定资产库', 'SPD 物资库']} />
                <FilterGroup label="比对状态" options={['全部状态', '数据一致', '系统新增', '信息差异', '系统移除']} />
                
                {/* 操作按钮组 (同步库) */}
                <div className="flex items-center space-x-2">
                  <button 
                    className={`h-11 px-6 rounded-xl text-white text-xs font-black flex items-center shadow-lg transition-all active:scale-95 ${themeColorClass}`}
                  >
                    <Search size={16} className="mr-1.5" />
                    筛选
                  </button>
                  <button 
                    className={`h-11 px-4 border rounded-xl bg-white text-xs font-bold flex items-center transition-all hover:bg-gray-50 border-gray-200 text-gray-500`}
                  >
                    <RotateCcw size={16} className="mr-1.5" />
                    取消筛选
                  </button>
                </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest border-b">
                    <th className="px-6 py-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSyncIds.length === currentSyncData.length && currentSyncData.length > 0}
                        onChange={toggleSyncSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                      />
                    </th>
                    <th className="px-6 py-4">外部系统编码</th>
                    <th className="px-6 py-4">产品基本信息</th>
                    <th className="px-6 py-4">规格/型号</th>
                    <th className="px-6 py-4">生产厂家/品牌</th>
                    <th className="px-4 py-4 text-right">外部系统价</th>
                    <th className="px-4 py-4 text-right">院内库价格</th>
                    <th className="px-6 py-4 text-center">状态标注</th>
                    <th className="px-6 py-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSyncData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors group ${selectedSyncIds.includes(item.id) ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedSyncIds.includes(item.id)} 
                          onChange={() => setSelectedSyncIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-gray-600 font-mono tracking-tighter bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.productCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800">{item.name}</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">类别: {item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.spec}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs font-medium">{item.vendor}</td>
                      <td className={`px-4 py-4 text-right font-black ${isDrug ? 'text-teal-600' : isEquip ? 'text-indigo-600' : 'text-blue-600'}`}>
                        ￥{item.externalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-300">
                        {item.localPrice ? `￥${item.localPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '--'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          {getSyncStatusBadge(item.status)}
                          {item.diffDetail && <span className="text-[9px] text-gray-400 mt-1 max-w-[120px] truncate">{item.diffDetail}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          {item.status !== 'match' ? (
                            <button onClick={() => setShowDiffModal(item)} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black hover:bg-orange-100 transition-colors flex items-center shadow-sm">
                              <Eye size={12} className="mr-1" /> 对比差异
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-300 font-black tracking-widest uppercase">数据一致</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50/50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                {selectedSyncIds.length > 0 && (
                  <button className={`flex items-center px-8 py-3 text-white rounded-2xl font-black shadow-xl transition-all tracking-wide animate-in zoom-in-95 ${isDrug ? 'bg-teal-600 shadow-teal-100 hover:scale-105' : isEquip ? 'bg-indigo-600 shadow-indigo-100 hover:scale-105' : 'bg-blue-600 shadow-blue-100 hover:scale-105'}`}>
                    <ShieldCheck size={18} className="mr-2.5" /> 批量入库
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 mr-4 font-bold tracking-tighter uppercase italic">外部记录: {currentSyncData.length * 10}+</span>
                <button className="p-2 border rounded-lg bg-white text-gray-400 hover:text-teal-600 transition-all"><ChevronLeft size={16} /></button>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3].map((p, i) => (
                    <button key={i} className={`w-8 h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all ${p === 1 ? (isDrug ? 'bg-teal-600 text-white' : isEquip ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white') : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                  ))}
                </div>
                <button className="p-2 border rounded-lg bg-white text-gray-400 hover:text-teal-600 transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: 差异比对 */}
      {showDiffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDiffModal(null)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                     <AlertCircle size={24} />
                   </div>
                   <h4 className="text-xl font-black text-gray-800">系统数据差异分析</h4>
                 </div>
                 <button onClick={() => setShowDiffModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400"/></button>
            </div>
            <div className="space-y-5">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">同步源属性 (HIS)</p>
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                       <p><span className="text-gray-400 mr-2">产品编码:</span> <span className="font-mono font-bold">{showDiffModal.productCode}</span></p>
                       <p><span className="text-gray-400 mr-2">属性分类:</span> <span className="font-bold text-teal-600">{showDiffModal.type}</span></p>
                       <p><span className="text-gray-400 mr-2">规格型号:</span> <span className="font-bold">{showDiffModal.spec}</span></p>
                       <p><span className="text-gray-400 mr-2">生产厂家:</span> <span className="font-bold text-blue-600">{showDiffModal.vendor}</span></p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-100/50 rounded-2xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">本地库价格</p>
                       <p className="text-xl font-black text-gray-400">{showDiffModal.localPrice ? `￥${showDiffModal.localPrice.toLocaleString()}` : '未入库'}</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                       <p className="text-[10px] font-bold text-teal-600 mb-2 uppercase">外部系统价</p>
                       <p className="text-xl font-black text-teal-600">￥{showDiffModal.externalPrice.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
                    <p className="text-xs text-orange-600 font-bold italic">“{showDiffModal.diffDetail}”</p>
                 </div>
                 <div className="flex space-x-4 pt-2">
                    <button onClick={() => setShowDiffModal(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors">取消</button>
                    <button className={`flex-1 py-4 text-white rounded-2xl font-black shadow-lg transition-all flex items-center justify-center ${isDrug ? 'bg-teal-600 shadow-teal-100' : isEquip ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>
                      <Check size={20} className="mr-2" /> 同步更新
                    </button>
                 </div>
              </div>
          </div>
        </div>
      )}

      {/* Modal: 手动录入 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`px-8 py-6 text-white flex justify-between items-center ${isDrug ? 'bg-teal-600' : isEquip ? 'bg-indigo-600' : 'bg-blue-600'}`}>
               <div className="flex items-center">
                 <Plus size={24} className="mr-3" />
                 <h3 className="text-xl font-bold">手动录入{isDrug ? '药品' : isEquip ? '设备' : '耗材'}信息</h3>
               </div>
               <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label={`${isDrug ? '药品' : isEquip ? '设备' : '耗材'}名称`} placeholder="全称" />
                <InputGroup label="产品 ID" placeholder="ID-XXXXX" />
                <InputGroup label="规格型号" placeholder="型号规格描述" />
                <InputGroup label="产品编码" placeholder="69XXXXXXXXXXX" />
                <InputGroup label="厂家/品牌" placeholder="全称" />
                <InputGroup label="属性分类" type="select" options={isDrug ? ['口服', '注射剂'] : isEquip ? ['成像', '监护'] : ['高值', '低值']} />
                {isEquip && <InputGroup label="安装科室" type="select" options={['影像科', 'ICU', '门诊']} />}
                {isConsumable && <InputGroup label="单位" type="select" options={['支', '套', '盒', '个']} />}
                <InputGroup label="参考价格 (￥)" type="number" placeholder="0.00" />
              </div>
              <div className="flex space-x-4">
                <button className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black" onClick={() => setShowAddModal(false)}>取消</button>
                <button className={`flex-1 py-4 text-white rounded-2xl font-black shadow-lg ${isDrug ? 'bg-teal-600 shadow-teal-100' : isEquip ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>提交入库</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助组件
const FilterGroup = ({ label, options }: { label: string, options: string[] }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">{label}</span>
    <select className="h-11 min-w-[110px] px-3 border rounded-xl bg-white text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm cursor-pointer hover:border-teal-300 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_4px_center]">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const InputGroup = ({ label, placeholder, type = 'text', options = [] }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-600">{label}</label>
    {type === 'select' ? (
      <select className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none font-bold text-gray-700">
        {options.map((opt: any) => <option key={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        placeholder={placeholder} 
        className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none placeholder:text-gray-300 font-bold" 
      />
    )}
  </div>
);

export default CatalogManagement;
