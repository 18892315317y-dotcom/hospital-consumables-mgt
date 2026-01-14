
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  RefreshCcw, 
  Settings2, 
  CheckCircle,
  Clock,
  CreditCard,
  Filter,
  ArrowRight,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  supplier: string;
  date: string;
  expire: string;
  status: '履约中' | '临近期' | '已终止';
  amount: number;
  paidAmount: number; // 已付金额
  paidRatio: string; // 已付占比
  nextPaymentDate: string; // 下次付款日期
  paymentDueStatus?: '5天内付款' | '正常';
}

const ContractManagement: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchSetting, setShowBatchSetting] = useState(false);

  // 模拟从 HIS 同步过来的合同数据
  const contracts: Contract[] = [
    { 
      id: 'HT-2023-001', 
      name: '2024年度介入类耗材供应合同', 
      supplier: '北京华润医药有限公司', 
      date: '2023-12-01', 
      expire: '2024-12-01', 
      status: '履约中', 
      amount: 5000000, 
      paidAmount: 1500000, 
      paidRatio: '30%', 
      nextPaymentDate: '2024-05-20',
      paymentDueStatus: '5天内付款' 
    },
    { 
      id: 'HT-2023-102', 
      name: '骨科关节集采配套采购协议', 
      supplier: '威高骨科器材有限公司', 
      date: '2024-01-15', 
      expire: '2025-01-15', 
      status: '履约中', 
      amount: 2400000, 
      paidAmount: 1200000, 
      paidRatio: '50%', 
      nextPaymentDate: '2024-07-15',
      paymentDueStatus: '正常' 
    },
    { 
      id: 'HT-2022-045', 
      name: '通用低值耗材年度框架协议', 
      supplier: '上海医药集团', 
      date: '2023-05-10', 
      expire: '2024-05-10', 
      status: '临近期', 
      amount: 800000, 
      paidAmount: 720000, 
      paidRatio: '90%', 
      nextPaymentDate: '2024-05-10',
      paymentDueStatus: '正常' 
    },
    { 
      id: 'HT-2021-089', 
      name: 'MRI专用造影剂供应合同', 
      supplier: '江苏恒瑞医药', 
      date: '2022-03-20', 
      expire: '2024-03-20', 
      status: '已终止', 
      amount: 1200000, 
      paidAmount: 1200000, 
      paidRatio: '100%', 
      nextPaymentDate: '-',
      paymentDueStatus: '正常' 
    },
    { 
      id: 'HT-2024-012', 
      name: '手术室一次性耗材补充协议', 
      supplier: '山东新华医疗', 
      date: '2024-02-01', 
      expire: '2025-02-01', 
      status: '履约中', 
      amount: 350000, 
      paidAmount: 0, 
      paidRatio: '0%', 
      nextPaymentDate: '2024-06-01',
      paymentDueStatus: '正常' 
    },
  ];

  // 计算勾选合同的统计数据
  const selectedSummary = useMemo(() => {
    const selectedItems = contracts.filter(c => selectedIds.includes(c.id));
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = selectedItems.reduce((sum, item) => sum + item.paidAmount, 0);
    return { totalAmount, totalPaid };
  }, [selectedIds, contracts]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contracts.length) setSelectedIds([]);
    else setSelectedIds(contracts.map(c => c.id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* 预警区域 */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-xl border-l-4 border-orange-500 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">效期预警</p>
              <p className="text-sm font-bold text-gray-700">2份合同即将到期 (90天内)</p>
            </div>
          </div>
          <button className="text-orange-600 text-xs font-bold hover:underline">立即续约</button>
        </div>
        <div className="flex-1 bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-full animate-pulse">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">付款预警</p>
              <p className="text-sm font-bold text-red-600">1份合同5天内到达付款节点</p>
            </div>
          </div>
          <button className="text-red-600 text-xs font-bold hover:underline">去处理</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 操作工具栏 */}
        <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <RefreshCcw size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">合同执行管理</h3>
              <p className="text-xs text-gray-400">数据已与 HIS 财务系统实时同步</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium flex items-center hover:bg-gray-50 transition-colors">
              <Download size={16} className="mr-2" />
              导出合同报表
            </button>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-bold flex items-center hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
              <RefreshCcw size={16} className="mr-2" />
              实时同步 HIS
            </button>
          </div>
        </div>

        {/* 增强型筛选区 */}
        <div className="p-6 bg-gray-50/50 border-b space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center"><Search size={12} className="mr-1"/> 合同搜索</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="合同编号或名称..." 
                  className="w-full pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* 供应商筛选 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center"><Filter size={12} className="mr-1"/> 供应商</label>
              <select className="w-full pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600">
                <option>全部供应商</option>
                <option>北京华润医药有限公司</option>
                <option>威高骨科器材有限公司</option>
                <option>上海医药集团</option>
              </select>
            </div>

            {/* 金额区间筛选 */}
            <div className="space-y-1.5 lg:col-span-1">
              <label className="text-xs font-bold text-gray-500 flex items-center">合同金额区间 (元)</label>
              <div className="flex items-center space-x-2">
                <input type="number" placeholder="最小" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                <span className="text-gray-300">-</span>
                <input type="number" placeholder="最大" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            {/* 到期日区间筛选 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center"><Calendar size={12} className="mr-1"/> 到期日区间</label>
              <div className="flex items-center space-x-2">
                <input type="date" className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20" />
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
                <input type="date" className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button className="text-xs text-gray-400 hover:text-blue-600 font-medium mr-4">清空筛选条件</button>
            <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
              执行查询
            </button>
          </div>
        </div>

        {/* 表格区 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-[11px] font-bold uppercase border-b whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === contracts.length && contracts.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" 
                  />
                </th>
                <th className="px-6 py-4">合同基础信息</th>
                <th className="px-6 py-4">供应商</th>
                <th className="px-6 py-4">合同总金额</th>
                <th className="px-6 py-4">已付金额</th>
                <th className="px-6 py-4">已付占比</th>
                <th className="px-6 py-4">下次付款日期</th>
                <th className="px-6 py-4">到期截止日期</th>
                <th className="px-6 py-4">执行状态/预警</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map((item) => (
                <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)} 
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 cursor-pointer truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">{item.supplier}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-700 font-mono">￥{item.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-blue-600 font-mono">￥{item.paidAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-blue-500" style={{ width: item.paidRatio }}></div>
                       </div>
                       <span className="text-xs font-bold text-gray-500 font-mono">{item.paidRatio}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-mono font-bold ${item.paymentDueStatus === '5天内付款' ? 'text-red-600' : 'text-gray-500'}`}>
                      {item.nextPaymentDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-mono">{item.expire}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1.5">
                      {item.paymentDueStatus === '5天内付款' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-red-600 w-fit border border-red-100 shadow-sm animate-pulse">
                          <Clock size={10} className="mr-1" /> 5日内付款预警
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                        item.status === '履约中' ? 'bg-green-50 text-green-600' :
                        item.status === '临近期' ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">明细</button>
                      <button className="text-gray-300 hover:text-blue-600 transition-colors">
                        <Settings2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contracts.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <RefreshCcw size={48} className="text-gray-200 mb-4 animate-spin-slow" />
              <p className="text-gray-400 text-sm">暂无合同数据，请点击上方按钮从 HIS 同步</p>
            </div>
          )}
        </div>

        {/* 底部功能区：包含批量操作与翻页 */}
        <div className="p-6 bg-gray-50/50 border-t flex items-center justify-between">
          {/* 左侧：批量操作统计 (原上方提示移动至此) */}
          <div className="flex-1">
            {selectedIds.length > 0 ? (
              <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-left-2 transition-all">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">
                    已选 <span className="text-blue-600">{selectedIds.length}</span> 份合同
                  </span>
                  <div className="flex items-center space-x-3 mt-1 text-[10px] text-gray-500 font-medium">
                    <span>总金额: <span className="text-gray-800 font-bold">￥{selectedSummary.totalAmount.toLocaleString()}</span></span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>已付金额: <span className="text-blue-600 font-bold">￥{selectedSummary.totalPaid.toLocaleString()}</span></span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBatchSetting(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                >
                  <Settings2 size={14} className="mr-1.5" />
                  统一设置付款期
                </button>
                <button 
                  onClick={() => setSelectedIds([])} 
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  取消选择
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                总计: {contracts.length} 份合同单据
              </span>
            )}
          </div>

          {/* 右侧：翻页组件 */}
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === 1 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 侧边设置面板 - 付款期配置 (保持不变) */}
      {showBatchSetting && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowBatchSetting(false)}></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600 text-white rounded-lg mr-3 shadow-md shadow-blue-200">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">批量付款规则配置</h4>
                  <p className="text-xs text-gray-400">设置选中合同的分阶段付款比例与时限</p>
                </div>
              </div>
              <button onClick={() => setShowBatchSetting(false)} className="text-gray-300 hover:text-gray-600 transition-colors text-2xl font-light">&times;</button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-800">已选中 {selectedIds.length} 份合同</span>
                <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-bold">同步覆盖模式</span>
              </div>
              <p className="text-[11px] text-blue-600 mt-1.5 leading-relaxed">警告：此操作将重置所选合同的现有付款节点信息。配置将自动同步至财务模块排款计划。</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
              {/* 第一阶段 */}
              <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-5 hover:border-blue-200 transition-colors shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">首付款 (预付)</span>
                  </div>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">系统推荐比例 30%</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500">金额比例 (%)</label>
                    <div className="relative">
                      <input type="number" defaultValue={30} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500">付款限时 (天)</label>
                    <div className="relative">
                      <input type="number" defaultValue={7} placeholder="合同签署后..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]">DAYS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 第二阶段 */}
              <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-5 hover:border-blue-200 transition-colors shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">进度/验收款</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500">金额比例 (%)</label>
                    <div className="relative">
                      <input type="number" defaultValue={60} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500">结算触发节点</label>
                    <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none">
                      <option>系统确认完全验收后</option>
                      <option>HIS财务进项发票入账后</option>
                      <option>设备安装完成调试后</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 第三阶段 - 质保金 */}
              <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <Plus size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">新增付款阶段 (如质保尾款)</span>
              </button>
            </div>

            <div className="pt-8 border-t mt-auto flex space-x-4">
              <button 
                onClick={() => setShowBatchSetting(false)}
                className="flex-1 py-3.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                取消修改
              </button>
              <button 
                onClick={() => setShowBatchSetting(false)}
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 flex items-center justify-center transition-all active:scale-95"
              >
                <CheckCircle size={18} className="mr-2" />
                确认并下发规则
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
