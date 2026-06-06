import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Users, BarChart3, Settings, Shield, FileText, Activity,
  Trash2, Edit, Plus, Save, Download, Server, Zap, Search, Eye,
  IndianRupee, CheckCircle, AlertTriangle, UserPlus, X
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import AdminSidebar from '../components/AdminSidebar';
import {
  getTemplateDesigns, deleteTemplateDesign,
  getFeatureAccessMatrix, updateFeatureAccessMatrix,
  getFinancialStats, createTemplateDesign, updateTemplateDesign,
  getTemplateDesignCategories
} from '../chat-advanced/services/adminService';
import DesignCreatorModal from '../components/DesignCreatorModal';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();

  // Data States
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);

  // Template Design Modal State
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<any>(null);
  const [designForm, setDesignForm] = useState({
    name: '',
    description: '',
    categories: [],
    isUniversal: false,
    isDefault: false,
    config: {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      headingSize: 16,
      lineSpacing: 1.15,
      letterSpacing: 0,
      paragraphSpacing: { before: 0, after: 6 },
      textTransform: 'none',
      wordSpacing: 0,
      pageSize: 'A4',
      pageOrientation: 'portrait',
      margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
      firstLineIndent: 0,
      titleAlignment: 'center',
      bodyAlignment: 'justified',
      titleBold: true,
      titleUnderline: false,
      titleItalic: false,
      headerText: '',
      footerText: '',
      headerAlignment: 'center',
      footerAlignment: 'center',
      showHeaderOnFirst: true,
      showFooterOnFirst: true,
      pageNumbering: 'none',
      borderStyle: 'none',
      borderColor: '#000000',
      borderWidth: 1,
      colorScheme: { primary: '#000000', accent: '#1a365d', background: '#ffffff' },
      watermarkText: '',
      watermarkOpacity: 0.1,
      images: [],
    }
  });

  // Users State (Mock for now, matching original)
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15 10:30', avatar: 'https://github.com/shadcn.png' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', lastLogin: '2024-01-15 09:15' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'pending', lastLogin: '2024-01-14 16:45' }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeSection === 'templates') loadTemplates();
    if (activeSection === 'features') loadFeatures();
  }, [activeSection]);

  // Template Design Handlers
  const openDesignModal = (design: any = null) => {
    if (design) {
      setEditingDesign(design);
      setDesignForm({
        name: design.name,
        description: design.description || '',
        categories: design.categories || [],
        isUniversal: design.isUniversal || false,
        isDefault: design.isDefault || false,
        config: { ...designForm.config, ...(design.config || {}) }
      });
    } else {
      setEditingDesign(null);
      setDesignForm({
        name: '',
        description: '',
        categories: [],
        isUniversal: false,
        isDefault: false,
        config: {
          fontFamily: 'Times New Roman',
          fontSize: 12,
          headingSize: 16,
          lineSpacing: 1.15,
          letterSpacing: 0,
          paragraphSpacing: { before: 0, after: 6 },
          textTransform: 'none',
          wordSpacing: 0,
          pageSize: 'A4',
          pageOrientation: 'portrait',
          margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          firstLineIndent: 0,
          titleAlignment: 'center',
          bodyAlignment: 'justified',
          titleBold: true,
          titleUnderline: false,
          titleItalic: false,
          headerText: '',
          footerText: '',
          headerAlignment: 'center',
          footerAlignment: 'center',
          showHeaderOnFirst: true,
          showFooterOnFirst: true,
          pageNumbering: 'none',
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 1,
          colorScheme: { primary: '#000000', accent: '#1a365d', background: '#ffffff' },
          watermarkText: '',
          watermarkOpacity: 0.1,
          images: [],
        }
      });
    }
    setIsDesignModalOpen(true);
  };

  const handleSaveDesign = async (designData: any) => {
    try {
      if (editingDesign) {
        await updateTemplateDesign(editingDesign._id, designData);
      } else {
        await createTemplateDesign(designData);
      }
      setIsDesignModalOpen(false);
      toast({ title: 'Success', description: editingDesign ? 'Design updated' : 'Design created' });
      loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save design', variant: 'destructive' });
    }
  };

  const loadStats = async () => {
    try {
      // In a real app, you might want to wrap this to avoid error if endpoint doesn't exist yet
      // const data = await getFinancialStats(); 
      // setStats(data);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await getTemplateDesigns();
      setTemplates(res.designs || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load templates', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const res = await getFeatureAccessMatrix();
      setFeatures(res.matrix || res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplateDesign(id);
      toast({ title: 'Success', description: 'Template deleted' });
      loadTemplates();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const handleSaveFeatures = async () => {
    try {
      await updateFeatureAccessMatrix(features);
      toast({ title: 'Success', description: 'Feature settings saved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getTemplateDesignCategories();
      setCategories(res.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleUserAction = (action, userId) => {
    toast({ title: "Action completed", description: `${action} performed on user ${userId}` });
  };

  const handleSystemAction = (action) => {
    toast({ title: "System action", description: `${action} completed successfully` });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,250</div>
            <p className="text-xs text-slate-400">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">892</div>
            <p className="text-xs text-slate-400">+8% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">456</div>
            <p className="text-xs text-slate-400">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹125,000</div>
            <p className="text-xs text-slate-400">+12.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Latest system activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'New user registered', time: '2 minutes ago', type: 'success' },
              { action: 'Case analysis completed', time: '5 minutes ago', type: 'info' },
              { action: 'System backup completed', time: '1 hour ago', type: 'success' },
              { action: 'Payment received', time: '2 hours ago', type: 'success' },
              { action: 'Server maintenance', time: '3 hours ago', type: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription className="text-slate-400">Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { service: 'Web Server', status: 'Online', uptime: '99.9%' },
              { service: 'Database', status: 'Online', uptime: '99.8%' },
              { service: 'AI Processing', status: 'Online', uptime: '99.7%' },
              { service: 'File Storage', status: 'Online', uptime: '99.9%' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-white">{service.service}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-400">{service.status}</p>
                  <p className="text-xs text-slate-400">{service.uptime}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Template Designs</CardTitle>
            <CardDescription className="text-slate-400">Manage contract designs</CardDescription>
          </div>
          <Button onClick={() => openDesignModal()}>
            <Plus className="w-4 h-4 mr-2" />
            New Design
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-white">Loading templates...</div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <p className="text-slate-400">No templates found.</p>
              ) : (
                templates.map((t) => (
                  <div key={t._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      {t.previewImage ? (
                        <img src={t.previewImage} alt={t.name} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.categories?.join(', ') || 'Universal'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openDesignModal(t)}>
                        <Edit className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(t._id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Feature Access Control</CardTitle>
            <CardDescription className="text-slate-400">Manage feature availability by user tier</CardDescription>
          </div>
          <Button onClick={handleSaveFeatures}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-white">
            <p className="text-sm text-slate-400">Configure which features are available to Free vs Premium users.</p>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span>Advanced Chat</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span>Template Export</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <span>Unlimited Documents</span>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-slate-400">Manage platform users and permissions</CardDescription>
            </div>
            <Button onClick={() => handleSystemAction('Add new user')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search users..."
                  className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
                />
              </div>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-400">Last login: {user.lastLogin}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>
                      {user.status}
                    </Badge>
                    <Badge variant="outline">{user.role}</Badge>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleUserAction('View', user.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUserAction('Edit', user.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUserAction('Delete', user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Settings</CardTitle>
            <CardDescription className="text-slate-400">Configure platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Maintenance Mode</label>
                  <p className="text-xs text-slate-400">Temporarily disable platform access</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Email Notifications</label>
                  <p className="text-xs text-slate-400">Send email alerts to users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Auto Backup</label>
                  <p className="text-xs text-slate-400">Automatic daily backups</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Platform Information</CardTitle>
            <CardDescription className="text-slate-400">System details and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Platform Version</span>
                <span className="text-sm text-white">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Database Size</span>
                <span className="text-sm text-white">2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Last Backup</span>
                <span className="text-sm text-white">2024-01-15 02:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Uptime</span>
                <span className="text-sm text-white">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">System Actions</CardTitle>
          <CardDescription className="text-slate-400">Perform system maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => handleSystemAction('Database backup')}>
              <Download className="w-4 h-4 mr-2" />
              Backup Database
            </Button>
            <Button variant="outline" onClick={() => handleSystemAction('Cache cleared')}>
              <Zap className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" onClick={() => handleSystemAction('Logs exported')}>
              <FileText className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline" onClick={() => handleSystemAction('System restart')}>
              <Server className="w-4 h-4 mr-2" />
              Restart System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'templates': return renderTemplates();
      case 'features': return renderFeatures();
      case 'system': return renderSystem();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
      <DesignCreatorModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        editingDesign={editingDesign}
        designForm={designForm}
        setDesignForm={setDesignForm}
        onSave={handleSaveDesign}
        onFileUpload={() => { }}
        isAnalyzing={false}
        isSaving={false}
        templateCategories={categories.length > 0 ? categories : ['Legal', 'Business', 'Academic', 'Personal']}
      />
    </div>
  );
};

export default AdminDashboard;