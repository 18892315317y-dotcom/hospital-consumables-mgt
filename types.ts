
import React from 'react';

export type MenuKey = 
  // 系统基础管理
  | 'sys-role' | 'sys-dept' | 'sys-log' | 'sys-flow' | 'sys-user'
  // 集采目录管理
  | 'cat-dynamic' | 'cat-drug' | 'cat-equip' | 'cat-consumable'
  // 设备管理
  | 'eq-info' | 'eq-issue' | 'eq-scrap' | 'eq-inspection' | 'eq-my-inspection'
  // 使用统计
  | 'mgt-drug' | 'mgt-drug-alert' | 'mgt-drug-emergency' 
  | 'mgt-consumable' | 'mgt-consumable-alert' | 'mgt-consumable-emergency'
  // 驾驶舱页面
  | 'dash-stock' | 'dash-usage' | 'dash-equip' | 'dash-dept-benefit' | 'dash-vbp' | 'dash-flow-map'
  // 合同管理
  | 'con-list'
  // 需求申报与执行
  | 'dec-report' | 'dec-procurement-plan' | 'dec-invoice' | 'dec-audit' | 'dec-flow';

export interface SubNavItem {
  key: MenuKey;
  label: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string; // 对应思维导图的颜色
  children: SubNavItem[];
}
