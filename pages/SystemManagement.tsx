
import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  History, 
  Share2, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  X,
  UserCheck,
  Building2,
  Calendar,
  Lock,
  ArrowRightLeft,
  Activity,
  UserPlus,
  User as UserIcon,
  Smartphone,
  Mail,
  ShieldAlert,
  ChevronDown,
  MoreVertical,
  CheckSquare,
  Square,
  Settings,
  ChevronRight as ChevronRightIcon,
  Layout,
  BookMarked
} from 'lucide-react';
import { MenuKey } from '../types';

type RoleTab = 'list' | 'template';

const SystemManagement: React.FC<{ subKey: MenuKey }> = ({ subKey }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 角色管理内部的分页状态
  const [roleActiveTab, setRoleActiveTab] = useState<RoleTab>('list');
  const [selectedTemplateForConfig, setSelectedTemplateForConfig] = useState('T002'); // 默认选中标准业务

  // --- 科室管理数据 ---
  const departments = [
    { id: 'D001', name: '医学工程处', category: '管理处室', manager: '张科长', count: 12, status: 'active' },
    { id: 'D002', name: '心血管内科', category: '临床科室', manager: '王主任', count: 45, status: 'active' },
    { id: 'D003', name: '医学影像中心', category: '医技科室', manager: '李主任', count: 32, status: 'active' },
    { id: 'D004', name: '财务处', category: '管理处室', manager: '陈处长', count: 15, status: 'active' },
    { id: 'D005', name: '药剂科', category: '医技科室', manager: '赵主任', count: 28, status: 'active' },
  ];

  // --- 角色管理数据 ---
  const roles = [
    { id: 'R001', name: '超级管理员', key: 'admin', dept: '信息中心', desc: '拥有系统全部模块的最高操作权限。', users: 3, isConfigured: true },
    { id: 'R002', name: '科室负责人', key: 'dept_head', dept: '全院通用', desc: '负责本科室的需求提报初审、领用签认。', users: 48, isConfigured: true },
    { id: 'R003', name: '设备科管理员', key: 'asset_mgr', dept: '医学工程处', desc: '管理全院资产档案、维保计划及报废审核。', users: 5, isConfigured: true },
    { id: 'R004', name: '审计专员', key: 'auditor', dept: '财务处', desc: '负责集采合规性审计及合同付款节点复核。', users: 2, isConfigured: false },
  ];

  // --- 权限模板数据 ---
  const templates = [
    { id: 'T001', name: '仅查询', key: 'view_only', desc: '仅具备数据看板与列表查看权限，不可进行增删改操作。' },
    { id: 'T002', name: '标准业务', key: 'std_business', desc: '具备常规的申领、申报及基础信息维护权限。' },
    { id: 'T003', name: '全权限', key: 'full_access', desc: '具备系统内所有模块的最高管控与审核权限。' },
  ];

  // --- 权限树模拟数据 ---
  const permissionGroups = [
    { 
      title: '设备资产管理', 
      permissions: [
        { key: 'eq-info', label: '基础信息维护', desc: '新增、修改、删除设备档案' },
        { key: 'eq-issue', label: '领用归还管理', desc: '处理跨科室调拨与归还验收' },
        { key: 'eq-scrap', label: '资产报废审核', desc: '报废技术鉴定与归档处置' }
      ] 
    },
    { 
      title: '需求申报审计', 
      permissions: [
        { key: 'dec-report', label: '科室需求提报', desc: '发起采购申请单' },
        { key: 'dec-audit', label: '多级审批管理', desc: '对申请单进行通过或驳回' },
        { key: 'dec-flow', label: '流程引擎配置', desc: '修改审批环节与人员指派' }
      ] 
    },
    { 
      title: '效益分析中心', 
      permissions: [
        { key: 'dash-equip', label: 'ROI统计看板', desc: '查看设备收入、支出、保值率' },
        { key: 'dash-vbp', label: '集采合规审计', desc: '审计目录外采购占比' }
      ] 
    }
  ];

  // --- 用户管理数据 ---
  const users = [
    { id: 'U1001', name: '林峰', username: 'linfeng_admin', dept: '信息中心', role: '超级管理员', phone: '138****0011', status: 'active', email: 'lin.f@hospital.com' },
    { id: 'U1002', name: '张伟', username: 'zhangwei_med', dept: '医学工程处', role: '设备科管理员', phone: '139****5522', status: 'active', email: 'zhang.w@hospital.com' },
    { id: 'U1003', name: '王芳', username: 'wangfang_heart', dept: '心血管内科', role: '科室负责人', phone: '135****8833', status: 'active', email: 'wang.f@hospital.com' },
    { id: 'U1004', name: '陈建国', username: 'chenjg_fin', dept: '财务处', role: '审计专员', phone: '137****4499', status: 'disabled', email: 'chen.jg@hospital.com' },
  ];

  // --- 日志管理数据 ---
  const logs = [
    { id: 'L1024', user: '超级管理员', action: '修改审批流', module: '审批引擎', time: '2024-05-22 10:30:15', ip: '192.168.1.102', result: '成功' },
    { id: 'L1023', user: '张医生', action: '提交领用申请', module: '设备管理', time: '2024-05-22 09:45:22', ip: '192.168.2.15', result: '成功' },
    { id: 'L1022', user: '王主任', action: '删除草稿', module: '需求申报', time: '2024-05-22 09:12:08', ip: '192.168.2.44', result: '失败', reason: '权限不足' },
  ];

  const renderHeader = (icon: React.ReactNode, title: string, desc: string, actionLabel?: string) => (
    <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">{title}</h3>
          <p className="text-xs text-gray-400 mt-1">{desc}</p>
        </div>
      </div>
      {actionLabel && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> {
            subKey === 'sys-role' && roleActiveTab === 'template' ? '新增权限模板' : actionLabel
          }
        </button>
      )}
    </div>
  );

  const renderSearchAndFilter = (placeholder = "关键词检索...") => (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input 
          type="text" 
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/10" 
        />
      </div>
      <button className="p-2.5 text-gray-400 hover:text-red-600 bg-white rounded-xl transition-all border border-gray-100 shadow-sm"><Filter size={18}/></button>
    </div>
  );

  // --- 分支渲染逻辑 ---
  
  // 1. 科室管理
  if (subKey === 'sys-dept') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {renderHeader(<Building2 size={24}/>, '科室管理', '维护全院科室架构与处室映射关系', '新增科室')}
        {renderSearchAndFilter("搜索科室名称或负责人...")}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                <th className="px-6 py-4">科室名称</th>
                <th className="px-6 py-4">科室 ID</th>
                <th className="px-6 py-4">科室类别</th>
                <th className="px-6 py-4">负责人</th>
                <th className="px-6 py-4 text-center">成员数量</th>
                <th className="px-6 py-4 text-center">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-red-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black text-xs">{dept.name.charAt(0)}</div>
                      <p className="font-black text-gray-800">{dept.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-400">{dept.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black">{dept.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{dept.manager}</td>
                  <td className="px-6 py-4 text-center font-mono font-black text-gray-400">{dept.count} 人</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-black">启用中</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                      <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAddModal && <AddDeptModal onClose={() => setShowAddModal(false)} />}
      </div>
    );
  }

  // 2. 角色与权限
  if (subKey === 'sys-role') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {renderHeader(<ShieldCheck size={24}/>, '角色与权限管理', '配置系统角色及各模块的操作权限范围', '新增角色')}
        
        {/* 角色内部分页切换 */}
        <div className="flex space-x-1 p-1 bg-gray-100/50 rounded-xl w-fit">
          <button 
            onClick={() => setRoleActiveTab('list')}
            className={`px-8 py-2 rounded-lg text-xs font-black transition-all ${roleActiveTab === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            角色列表
          </button>
          <button 
            onClick={() => setRoleActiveTab('template')}
            className={`px-8 py-2 rounded-lg text-xs font-black transition-all ${roleActiveTab === 'template' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            权限模板配置
          </button>
        </div>

        {roleActiveTab === 'list' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-left-4 duration-300">
            <div className="lg:col-span-3 space-y-6">
              {renderSearchAndFilter("搜索角色名称...")}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                        <th className="px-6 py-4">角色名称</th>
                        <th className="px-6 py-4">角色标识</th>
                        <th className="px-6 py-4">所属科室</th>
                        <th className="px-6 py-4">角色描述</th>
                        <th className="px-6 py-4 text-center">绑定用户</th>
                        <th className="px-6 py-4 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {roles.map(role => (
                        <tr key={role.id} className="hover:bg-red-50/10 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-gray-800">{role.name}</p>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-red-600 text-xs">
                             {role.key}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">{role.dept}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs">{role.desc}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-black text-gray-700">{role.users}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => setRoleActiveTab('template')} 
                              className={`text-xs font-black hover:underline ${role.isConfigured ? 'text-blue-600' : 'text-red-600'}`}
                            >
                              {role.isConfigured ? '修改权限' : '去配权'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
            {/* 安全概览 */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border-2 border-red-50 shadow-xl shadow-red-50/50 relative overflow-hidden">
                  <Shield size={120} className="absolute -right-8 -bottom-8 opacity-5 text-red-600" />
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-red-900 opacity-60">安全概览</h4>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">当前定义角色</span>
                        <span className="text-2xl font-black text-gray-800">{roles.length}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">已赋权角色数</span>
                        <span className="text-2xl font-black text-indigo-600">{roles.filter(r => r.isConfigured).length}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">已赋权用户数</span>
                        <span className="text-2xl font-black text-gray-800">152</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">权限空载警告</span>
                        <span className="text-2xl font-black text-green-500">0</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-dashed border-red-100 flex items-center justify-between">
                     <span className="text-[10px] font-black text-gray-400">系统合规性得分</span>
                     <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">98.5</span>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">操作小贴士</h5>
                  <p className="text-xs text-gray-500 leading-relaxed italic">“修改权限后，受影响的用户将在下次登录系统时自动生效新的权限配置。系统建议每季度审计一次权限清单。”</p>
              </div>
            </div>
          </div>
        ) : (
          /* 权限模板配置面板 */
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[600px] animate-in zoom-in-95 duration-300">
            {/* 左侧模板切换 */}
            <div className="w-full lg:w-72 bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0">
               <div className="p-6 border-b border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">修改模板配置</p>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {templates.map(tmp => (
                   <button 
                     key={tmp.id}
                     onClick={() => setSelectedTemplateForConfig(tmp.id)}
                     className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${selectedTemplateForConfig === tmp.id ? 'bg-white shadow-lg border border-red-100' : 'hover:bg-white'}`}
                   >
                     <div>
                       <p className={`text-sm font-black ${selectedTemplateForConfig === tmp.id ? 'text-red-600' : 'text-gray-700'}`}>{tmp.name}</p>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase">{tmp.key}</p>
                     </div>
                     <ChevronRightIcon size={16} className={`${selectedTemplateForConfig === tmp.id ? 'text-red-600 translate-x-1' : 'text-gray-200'} transition-transform`} />
                   </button>
                 ))}
               </div>
            </div>
            
            {/* 右侧权限勾选矩阵 */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
               <div className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                 <div>
                   <h4 className="text-lg font-black text-gray-800">分配模块权限</h4>
                   <p className="text-xs text-gray-400 mt-1">正在为模板 <span className="text-red-600 font-black">“{templates.find(t => t.id === selectedTemplateForConfig)?.name}”</span> 设置访问控制权限</p>
                 </div>
                 <div className="flex space-x-3">
                   <button className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black">全选</button>
                   <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-100">保存模板</button>
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                  {permissionGroups.map((group, idx) => (
                    <section key={idx} className="space-y-4">
                       <div className="flex items-center space-x-3 mb-6">
                         <div className="w-1.5 h-4 bg-red-600 rounded-full"></div>
                         <h5 className="text-sm font-black text-gray-800 uppercase tracking-widest">{group.title}</h5>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.permissions.map(perm => (
                            <label key={perm.key} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 flex items-start space-x-4 cursor-pointer hover:bg-red-50/30 hover:border-red-100 transition-all group">
                               <div className="pt-0.5">
                                 <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center group-hover:border-red-500 transition-colors">
                                   <div className="w-2 h-2 bg-red-600 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                 </div>
                               </div>
                               <div>
                                 <p className="text-sm font-black text-gray-800">{perm.label}</p>
                                 <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{perm.desc}</p>
                               </div>
                               <input type="checkbox" className="hidden" />
                            </label>
                          ))}
                       </div>
                    </section>
                  ))}
               </div>
            </div>
          </div>
        )}
        {showAddModal && (roleActiveTab === 'list' ? <AddRoleModal onClose={() => setShowAddModal(false)} /> : <AddTemplateModal onClose={() => setShowAddModal(false)} />)}
      </div>
    );
  }

  // 3. 用户管理
  if (subKey === 'sys-user') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {renderHeader(<UserPlus size={24}/>, '系统用户管理', '配置人员登录账号、科室归属及多角色关联', '新增用户')}
        {renderSearchAndFilter("搜索姓名、工号、账号...")}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-left text-sm">
             <thead>
               <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                 <th className="px-6 py-4">用户信息</th>
                 <th className="px-6 py-4">所属科室</th>
                 <th className="px-6 py-4">系统角色</th>
                 <th className="px-6 py-4">联系方式</th>
                 <th className="px-6 py-4 text-center">账户状态</th>
                 <th className="px-6 py-4 text-right">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {users.map(user => (
                 <tr key={user.id} className="hover:bg-red-50/10 transition-colors group">
                   <td className="px-6 py-4">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">{user.name.charAt(0)}</div>
                       <div>
                         <p className="font-black text-gray-800">{user.name}</p>
                         <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">@{user.username}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className="text-xs font-bold text-gray-600">{user.dept}</span>
                   </td>
                   <td className="px-6 py-4">
                     <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black border border-blue-100">{user.role}</span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="space-y-1">
                        <p className="text-xs text-gray-700 flex items-center"><Smartphone size={10} className="mr-1 text-gray-300"/> {user.phone}</p>
                        <p className="text-[10px] text-gray-400 flex items-center"><Mail size={10} className="mr-1 text-gray-300"/> {user.email}</p>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${user.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        {user.status === 'active' ? '已激活' : '已锁定'}
                      </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600" title="修改资料"><Edit2 size={16}/></button>
                        <button className="p-2 text-gray-400 hover:text-red-600" title="重置密码"><Lock size={16}/></button>
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="更多操作"><MoreVertical size={16}/></button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
        {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} />}
      </div>
    );
  }

  // 4. 日志管理
  if (subKey === 'sys-log') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {renderHeader(<History size={24}/>, '审计日志', '系统操作痕迹追踪，保障资产变动可溯源', '导出日志')}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="选择时间范围" className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
           </div>
           <select className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none">
             <option>全部操作类型</option><option>新增</option><option>修改</option><option>删除</option><option>审核</option>
           </select>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="搜索操作人..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b text-[10px]">
                <th className="px-6 py-4">操作时间</th>
                <th className="px-6 py-4">操作账号</th>
                <th className="px-6 py-4">所属模块</th>
                <th className="px-6 py-4">操作内容</th>
                <th className="px-6 py-4 text-center">状态</th>
                <th className="px-6 py-4">IP 地址</th>
                <th className="px-6 py-4 text-right">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-red-50/10 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-gray-400">{log.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400"><UserIcon size={10}/></div>
                       <span className="font-bold text-gray-700">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">{log.module}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">{log.action}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-black ${log.result === '成功' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{log.result}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400">{log.ip}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-300 hover:text-red-600 transition-all"><MoreHorizontal size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 默认兜底
  return (
    <div className="p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <Lock size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">模块页面开发中</h3>
            <p className="text-sm text-gray-400">当前仅开放核心导航预览</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-24">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
             <Activity className="text-gray-300" />
          </div>
          <h4 className="font-bold text-gray-600">请选择左侧菜单项</h4>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">通过侧边栏可进入具体的科室、角色、用户或日志管理视图。</p>
        </div>
      </div>
    </div>
  );
};

// --- 子组件：新增权限模板弹窗 ---
const AddTemplateModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
      <div className="px-8 py-6 bg-red-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <BookMarked size={24} />
          <h3 className="text-lg font-black tracking-tight">新增权限配置模板</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
      </div>
      <div className="p-8 space-y-6">
        <FormInput label="模板名称" placeholder="如：外部审计专用" required />
        <FormInput label="模板 Key" placeholder="tpl_audit_xxx" required />
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">模板说明</label>
          <textarea className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-red-500/20" placeholder="说明该权限模板的适用场景..."></textarea>
        </div>
        <div className="flex space-x-4 pt-4">
           <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">取消</button>
           <button onClick={onClose} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100">确认新增模板</button>
        </div>
      </div>
    </div>
  </div>
);

// --- 子组件：新增科室弹窗 ---
const AddDeptModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
      <div className="px-8 py-6 bg-red-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <Building2 size={24} />
          <h3 className="text-lg font-black tracking-tight">新增临床/职能科室</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
      </div>
      <div className="p-8 space-y-6">
        <FormInput label="科室名称" placeholder="如：医学工程处、介入手术室" required />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">科室类别</label>
            <select className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20">
              <option>管理处室</option><option>临床科室</option><option>医技科室</option><option>保障科室</option>
            </select>
          </div>
          <FormInput label="科室编码" placeholder="DEPT-XXXX" />
        </div>
        <FormInput label="科室负责人" placeholder="从人员库检索指派..." />
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
           <span className="text-xs font-black text-gray-600">激活状态：<span className="text-green-600 uppercase ml-2 tracking-widest">Active</span></span>
           <div className="w-10 h-5 bg-red-600 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div></div>
        </div>
        <div className="flex space-x-4 pt-4">
           <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">返回</button>
           <button onClick={onClose} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100">确认入库</button>
        </div>
      </div>
    </div>
  </div>
);

// --- 子组件：新增角色弹窗 ---
const AddRoleModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
      <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <Shield size={24} />
          <h3 className="text-lg font-black tracking-tight">配置新系统角色</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="角色名称" placeholder="如：科室库管员" required />
          <FormInput label="角色 Key" placeholder="role_key_xxx" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">所属科室</label>
          <select className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>全院通用</option><option>信息中心</option><option>财务处</option><option>医学工程处</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">绑定权限模板</label>
          <div className="grid grid-cols-3 gap-2">
            <button className="py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">仅查询</button>
            <button className="py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black border">标准业务</button>
            <button className="py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black border">全权限</button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">角色职责描述</label>
          <textarea className="w-full h-20 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="说明该角色在系统中的主要职责范围..."></textarea>
        </div>
        <div className="flex space-x-4 pt-4">
           {/* 
              Fix: Changed onClose prop to onClick for the button element.
              HTML button elements do not have an onClose attribute.
           */}
           <button onClick={() => onClose()} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">取消</button>
           <button onClick={() => onClose()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100">确认发布</button>
        </div>
      </div>
    </div>
  </div>
);

// --- 子组件：新增用户弹窗 ---
const AddUserModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-white">
      <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <UserPlus size={24} />
          <h3 className="text-lg font-black tracking-tight">注册新系统账号</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <FormInput label="真实姓名" placeholder="输入员工姓名" required />
          <FormInput label="工号/账号名" placeholder="输入唯一工号" required />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">归属科室</label>
            <select className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>心血管内科</option><option>医学工程处</option><option>信息中心</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">系统角色</label>
            <select className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>科室负责人</option><option>普通职员</option><option>超级管理员</option>
            </select>
          </div>
          <FormInput label="联系手机" placeholder="13XXXXXXXXX" />
          <FormInput label="办公邮箱" placeholder="example@hospital.com" />
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
           <ShieldAlert size={18} className="text-blue-600 mt-0.5" />
           <p className="text-[10px] text-blue-700 leading-relaxed">提示：默认初始密码为 <span className="font-black">Hospital@123</span>，用户首次登录系统时将被强制要求修改密码以保证安全。</p>
        </div>
        <div className="flex space-x-4">
           <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">返回列表</button>
           <button onClick={onClose} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100">激活账号</button>
        </div>
      </div>
    </div>
  </div>
);

const FormInput = ({ label, placeholder, required, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type}
      placeholder={placeholder}
      className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-gray-300" 
    />
  </div>
);

export default SystemManagement;
