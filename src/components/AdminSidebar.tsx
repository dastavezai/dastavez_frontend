import React from 'react';
import { Button } from './ui/button';
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Activity, 
  Shield, 
  Database, 
  Server, 
  Bell, 
  LogOut,
  Home,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Badge } from './ui/badge';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'users', label: 'Users', icon: Users, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: Activity, badge: null },
    { id: 'content', label: 'Content', icon: FileText, badge: '3' },
    { id: 'security', label: 'Security', icon: Shield, badge: null },
    { id: 'system', label: 'System', icon: Server, badge: null },
  ];

  const quickActions = [
    { label: 'Add User', icon: Users, action: () => console.log('Add user') },
    { label: 'Backup DB', icon: Database, action: () => console.log('Backup database') },
    { label: 'View Logs', icon: Activity, action: () => console.log('View logs') },
  ];

  return (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700 h-screen p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        </div>
        <p className="text-xs text-slate-400">Justice AI Oracle</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              activeSection === item.id 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start text-slate-300 hover:text-white"
              onClick={action.action}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Web Server</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Database</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">AI Processing</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Alerts</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2 text-xs">
            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
            <div>
              <p className="text-white">Backup completed</p>
              <p className="text-slate-400">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-2 text-xs">
            <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-white">High CPU usage</p>
              <p className="text-slate-400">5 minutes ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Button variant="ghost" className="w-full text-slate-300 hover:text-white">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar; 