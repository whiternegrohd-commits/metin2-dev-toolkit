import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, FileText, Scroll, Map, Palette, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

function Sidebar({ collapsed, onToggle }) {
  const { t } = useLanguage();

  const menuItems = [
    { path: '/', icon: Home, labelKey: 'dashboard' },
    { path: '/shop-manager', icon: ShoppingCart, labelKey: 'shop_manager' },
    { path: '/proto-editor', icon: FileText, labelKey: 'proto_editor' },
    { path: '/quest-generator', icon: Scroll, labelKey: 'quest_generator' },
    { path: '/map-tool', icon: Map, labelKey: 'map_tool' },
    { path: '/ui-tools', icon: Palette, labelKey: 'ui_tools' },
    { path: '/log-analyzer', icon: Activity, labelKey: 'log_analyzer' }
  ];

  return (
    <div className={`bg-dark-surface border-r border-dark-border transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-green to-vivid-blue rounded-lg flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">M2</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Metin2 Dev</h1>
              <p className="text-xs text-text-muted">Toolkit v1.0</p>
            </div>
          </div>
        )}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4 text-text-secondary" /> : <ChevronLeft className="w-4 h-4 text-text-secondary" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 flex-1">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-dark-hover border border-cyber-green/30 text-cyber-green'
                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
              }`
            }>
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-cyber-green' : 'text-text-secondary group-hover:text-text-primary'}`} />
                {!collapsed && <span className="font-medium text-sm">{t(item.labelKey)}</span>}
                {isActive && !collapsed && <div className="ml-auto w-2 h-2 bg-cyber-green rounded-full animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
