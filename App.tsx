
import React, { useState } from 'react';
import { 
  Settings, 
  BookOpen, 
  HardDrive, 
  Database, 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  User,
  Map
} from 'lucide-react';
import { MenuKey, NavItem } from './types';

// Page Components
import Dashboard from './pages/Dashboard';
import CatalogManagement from './pages/CatalogManagement';
import UsageManagement from './pages/UsageManagement';
import ContractManagement from './pages/ContractManagement';
import DemandDeclaration from './pages/DemandDeclaration';
import InvoiceManagement from './pages/InvoiceManagement';
import SystemManagement from './pages/SystemManagement';
import EquipmentBenefit from './pages/EquipmentBenefit';
import EquipmentInspection from './pages/EquipmentInspection';
import MyInspection from './pages/MyInspection';
import EquipmentMaintenance from './pages/EquipmentMaintenance';
import EquipmentScrap from './pages/EquipmentScrap';
import EquipmentIssueReturn from './pages/EquipmentIssueReturn';
import BusinessFlowMap from './pages/BusinessFlowMap';
import DeptEquipmentBenefit from './pages/DeptEquipmentBenefit';
import EquipmentProcurementPlan from './pages/EquipmentProcurementPlan'; // Imported new page

const App: React.FC = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<MenuKey>('dash-flow-map');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dash', 'cat', 'dec', 'mgt', 'eq', 'con', 'sys']);
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { 
      key: 'dash', label: '驾驶舱页面', icon: <LayoutDashboard size={18} />, color: 'border-purple-500',
      children: [
        { key: 'dash-flow-map', label: '业务全景地图' },
        { key: 'dash-equip', label: '设备效益统计' },
        { key: 'dash-dept-benefit', label: '科室设备效益' },
        { key: 'dash-vbp', label: '集采情况统计' }
      ]
    },
    { 
      key: 'cat', label: '集采目录管理', icon: <BookOpen size={18} />, color: 'border-yellow-500',
      children: [
        // { key: 'cat-drug', label: '药品目录' }, // 暂时隐藏
        { key: 'cat-equip', label: '设备目录' },
        { key: 'cat-consumable', label: '耗材目录' }
      ]
    },
    { 
      key: 'dec', label: '需求申报与执行', icon: <ClipboardCheck size={18} />, color: 'border-lime-500',
      children: [
        { key: 'dec-report', label: '科室需求提报' },
        { key: 'dec-procurement-plan', label: '设备采购计划' }, // Added new menu item
        // { key: 'mgt-drug-emergency', label: '药品临采管理' }, // 暂时隐藏
        { key: 'mgt-consumable-emergency', label: '耗材临采管理' },
        { key: 'dec-invoice', label: '发票管理' },
        { key: 'dec-audit', label: '审核管理' },
        { key: 'dec-flow', label: '审批流管理' }
      ]
    },
    { 
      key: 'mgt', label: '使用统计', icon: <Database size={18} />, color: 'border-blue-500',
      children: [
        // { key: 'mgt-drug', label: '药品使用情况' }, // 暂时隐藏
        // { key: 'mgt-drug-alert', label: '药品阈值预警' }, // 暂时隐藏
        { key: 'mgt-consumable', label: '耗材使用情况' },
        { key: 'mgt-consumable-alert', label: '耗材阈值预警' }
      ]
    },
    { 
      key: 'eq', label: '设备管理', icon: <HardDrive size={18} />, color: 'border-green-500',
      children: [
        { key: 'eq-info', label: '设备基本信息维护' },
        { key: 'eq-issue', label: '领用与归还' },
        { key: 'eq-scrap', label: '设备报废' },
        { key: 'eq-inspection', label: '设备巡查' },
        { key: 'eq-my-inspection', label: '我的巡查' }
      ]
    },
    { 
      key: 'con', label: '合同管理', icon: <FileText size={18} />, color: 'border-orange-500',
      children: [
        { key: 'con-list', label: '合同列表' }
      ]
    },
    { 
      key: 'sys', label: '系统基础管理', icon: <Settings size={18} />, color: 'border-red-500',
      children: [
        { key: 'sys-dept', label: '科室管理' },
        { key: 'sys-role', label: '角色与权限' },
        { key: 'sys-user', label: '用户管理' },
        { key: 'sys-log', label: '日志管理' }
      ]
    }
  ];

  const toggleExpand = (key: string) => {
    setExpandedMenus(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderContent = () => {
    if (activeSubMenu === 'dash-flow-map') return <BusinessFlowMap />;
    if (activeSubMenu === 'dash-dept-benefit') return <DeptEquipmentBenefit />;
    if (activeSubMenu === 'dec-procurement-plan') return <EquipmentProcurementPlan />; // Render new page
    if (activeSubMenu.startsWith('sys')) return <SystemManagement subKey={activeSubMenu} />;
    if (activeSubMenu.startsWith('cat')) return <CatalogManagement subKey={activeSubMenu} />;
    if (activeSubMenu === 'eq-info') return <EquipmentMaintenance />;
    if (activeSubMenu === 'eq-issue') return <EquipmentIssueReturn />;
    if (activeSubMenu === 'eq-scrap') return <EquipmentScrap />;
    if (activeSubMenu === 'eq-inspection') return <EquipmentInspection />;
    if (activeSubMenu === 'eq-my-inspection') return <MyInspection />;
    
    if (activeSubMenu.startsWith('mgt')) return <UsageManagement subKey={activeSubMenu} />;
    if (activeSubMenu.startsWith('dash-equip')) return <EquipmentBenefit />;
    if (activeSubMenu.startsWith('dash')) return <Dashboard subKey={activeSubMenu} />;
    if (activeSubMenu.startsWith('con')) return <ContractManagement />;
    if (activeSubMenu === 'dec-report') return <DemandDeclaration subKey={activeSubMenu} />;
    if (activeSubMenu === 'dec-invoice') return <InvoiceManagement />;
    if (activeSubMenu.startsWith('dec')) return <DemandDeclaration subKey={activeSubMenu} />;
    return <Dashboard subKey="dash-vbp" />; 
  };

  const getBreadcrumb = () => {
    const parent = navItems.find(item => item.children.some(child => child.key === activeSubMenu));
    const child = parent?.children.find(c => c.key === activeSubMenu);
    return parent && child ? (
      <div className="flex items-center text-sm">
        <span className="text-gray-400">{parent.label}</span>
        <ChevronRight size={14} className="mx-2 text-gray-300" />
        <span className="text-gray-800 font-semibold">{child.label}</span>
      </div>
    ) : '首页';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      <aside className={`bg-[#001529] text-gray-300 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          {!collapsed && <span className="font-bold text-lg text-white tracking-tight">医院耗材管理系统</span>}
          {collapsed && <span className="font-bold text-xl mx-auto text-blue-400">H</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {navItems.map((item) => {
            const isExpanded = expandedMenus.includes(item.key);
            const hasActiveChild = item.children.some(c => c.key === activeSubMenu);

            return (
              <div key={item.key} className="mb-1">
                <button
                  onClick={() => toggleExpand(item.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    hasActiveChild ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`shrink-0 transition-colors ${hasActiveChild ? 'text-blue-400' : 'text-gray-500'}`}>{item.icon}</span>
                    {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {!collapsed && isExpanded && (
                  <div className="bg-[#000c17]">
                    {item.children.map(child => (
                      <button
                        key={child.key}
                        onClick={() => setActiveSubMenu(child.key)}
                        className={`w-full text-left pl-12 py-2.5 text-xs transition-all border-l-4 ${
                          activeSubMenu === child.key 
                            ? `text-white bg-blue-600/20 ${item.color.replace('border-', 'border-l-')}` 
                            : 'text-gray-500 hover:text-white border-transparent'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <button onClick={() => setCollapsed(!collapsed)} className="w-full flex justify-center p-2 text-gray-500 hover:text-white">
             {collapsed ? <ChevronRight /> : <ChevronRight className="rotate-180" />}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div>{getBreadcrumb()}</div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索功能或单据..." 
                className="pl-10 pr-4 py-1.5 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:ring-1 focus:ring-blue-500 w-64 outline-none"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">A</div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-700">超级管理员</p>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-[#f0f2f5]">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
