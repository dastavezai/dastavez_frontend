import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText, 
  MessageSquare, 
  Activity, 
  TrendingUp,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Bell,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  IndianRupee,
  Tag,
  FileDown,
  Plus
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { adminAPI, fileAPI, User as APIUser, FileUpload, lawyerAPI, Lawyer, profileAPI, authAPI, AdminCoupon, subscriptionAPI } from '../lib/api';
import { ScrollArea } from '../components/ui/scroll-area';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  subscriptionStatus: 'free' | 'premium';
  createdAt: string;
  lastLogin: string;
  profileImage?: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalFiles: number;
  growth: number;
}

interface CouponForm {
  code: string;
  discountPercentage: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalFiles: 0,
    growth: 0
  });
  // Interpreted in RUPEES for display/editing. Conversion to paise happens on update call
  const [subscriptionPrice, setSubscriptionPrice] = useState(0);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [newLawyer, setNewLawyer] = useState({ name: '', phone: '', email: '', address: '' });
  const [adminProfile, setAdminProfile] = useState<APIUser | null>(null);
  const [adminForm, setAdminForm] = useState({ firstName: '', lastName: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponDraft, setCouponDraft] = useState({ code: '', discountPercentage: 0, maxUses: 1, validFrom: '', validUntil: '' });

  const normalizeCurrency = (value: any): number => {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    // Heuristic: treat very large values as paise and convert to rupees
    // or if explicitly divisible by 100 and looks like paise
    if (n > 100000 || (n % 100 === 0 && n.toString().length > 3)) {
      return Math.round(n / 100);
    }
    return n;
  };
  const [couponForm, setCouponForm] = useState<CouponForm>({
    code: '',
    discountPercentage: 20,
    maxUses: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const usersPromise = adminAPI.getAllUsers();
      const filesPromise = fileAPI.getAllFiles();
      const statsPromise = adminAPI.getStats();
      const lawyersPromise = lawyerAPI.list();
      const mePromise = authAPI.getCurrentUser();
      const couponsPromise = adminAPI.listCoupons();
      const pricePromise = subscriptionAPI.getPrice();

      const [usersRes, filesRes, statsRes, lawyersRes, meRes, couponsRes, priceRes] = await Promise.allSettled([
        usersPromise,
        filesPromise,
	statsPromise,
        lawyersPromise,
        mePromise,
        couponsPromise,
        pricePromise,
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value);
      } else {
        console.warn('Failed to load users:', usersRes.reason);
      }

      if (filesRes.status === 'fulfilled') {
        setFiles(filesRes.value);
      } else {
        console.warn('Failed to load files:', filesRes.reason);
      }

      if (lawyersRes.status === 'fulfilled') {
        setLawyers(lawyersRes.value);
      } else {
        console.warn('Failed to load lawyers (optional):', lawyersRes.reason);
        setLawyers([]);
      }

      if (meRes.status === 'fulfilled') {
        const me = meRes.value as APIUser;
        setAdminProfile(me);
        setAdminForm({ firstName: me?.firstName || '', lastName: me?.lastName || '', email: me?.email || '' });
      } else {
        console.warn('Failed to load current user:', meRes.reason);
      }

      if (couponsRes.status === 'fulfilled') {
        setCoupons(couponsRes.value as AdminCoupon[]);
      } else {
        console.warn('Failed to load coupons:', couponsRes.reason);
      }

      const priceOk = priceRes.status === 'fulfilled';
      const statsOk = statsRes.status === 'fulfilled';
      if (statsOk || priceOk) {
        const statsData = statsOk ? (statsRes as PromiseFulfilledResult<any>).value : ({} as any);
        const usersData = usersRes.status === 'fulfilled' ? usersRes.value : [];
        const filesData = filesRes.status === 'fulfilled' ? filesRes.value : [];
        const priceData = priceOk ? (priceRes as PromiseFulfilledResult<any>).value : undefined;
        if (priceData?.price != null) {
          setSubscriptionPrice(Number(priceData.price));
        }
        const premiumCount = (statsData.activeUsers && Number.isFinite(statsData.activeUsers))
          ? Number(statsData.activeUsers)
          : usersData.filter((u: any) => u.subscriptionStatus === 'premium').length;

        const priceRupees = normalizeCurrency(priceData?.price ?? 0);
        let totalRevenue = premiumCount * priceRupees;
        let monthlyRevenue = premiumCount * priceRupees;

        // Fallbacks: compute revenue from subscription price × premium users when API doesn't provide totals
        if (!monthlyRevenue && priceRupees) {
          monthlyRevenue = premiumCount * priceRupees;
        }
        if (!totalRevenue && priceRupees) {
          totalRevenue = premiumCount * priceRupees;
        }

        setAnalyticsData({
          totalUsers: statsData.totalUsers || usersData.length,
          activeUsers: premiumCount,
          totalRevenue,
          monthlyRevenue,
          totalFiles: filesData.length,
          growth: statsData.growth || 0,
        });
      } else {
        const usersData = usersRes.status === 'fulfilled' ? usersRes.value : [];
        const filesData = filesRes.status === 'fulfilled' ? filesRes.value : [];
        setAnalyticsData({
          totalUsers: usersData.length,
          activeUsers: usersData.filter((u: any) => u.subscriptionStatus === 'premium').length,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalFiles: filesData.length,
          growth: 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdminProfile = async () => {
    try {
      setIsSavingProfile(true);
      await profileAPI.updateInfo({ firstName: adminForm.firstName, lastName: adminForm.lastName });
      setAdminProfile(prev => prev ? { ...prev, firstName: adminForm.firstName, lastName: adminForm.lastName } : prev);
      toast({ title: 'Profile updated', description: 'Admin profile updated successfully' });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateLawyer = async () => {
    if (!newLawyer.name || !newLawyer.phone || !newLawyer.email || !newLawyer.address) {
      toast({ title: 'Missing info', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    try {
      const created = await lawyerAPI.create(newLawyer);
      setLawyers([created, ...lawyers]);
      setNewLawyer({ name: '', phone: '', email: '', address: '' });
      toast({ title: 'Lawyer added', description: 'Lawyer has been added successfully' });
    } catch (error) {
      console.error('Error creating lawyer:', error);
      toast({ title: 'Error', description: 'Failed to add lawyer', variant: 'destructive' });
    }
  };

  const handleDeleteLawyer = async (id: string) => {
    try {
      await lawyerAPI.delete(id);
      setLawyers(lawyers.filter(l => l._id !== id));
      toast({ title: 'Deleted', description: 'Lawyer removed' });
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      toast({ title: 'Error', description: 'Failed to delete lawyer', variant: 'destructive' });
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    toast({
      title: "Action completed",
      description: `${action} performed on user ${userId}`,
    });
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: "System action",
      description: `${action} completed successfully`,
    });
  };

  const handleUpdateSubscriptionPrice = async () => {
    try {
      // backend expects paise; assume current input is rupees
      await adminAPI.updateSubscriptionPrice(Math.round(subscriptionPrice * 100));
      toast({
        title: "Success",
        description: "Subscription price updated successfully",
      });
    } catch (error) {
      console.error('Error updating subscription price:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription price",
        variant: "destructive"
      });
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const payload = {
        code: couponDraft.code,
        discountPercentage: couponDraft.discountPercentage,
        maxUses: couponDraft.maxUses,
        validFrom: new Date(couponDraft.validFrom || new Date().toISOString()).toISOString(),
        validUntil: new Date(couponDraft.validUntil || new Date(Date.now() + 30*24*60*60*1000)).toISOString(),
      };
      const created = await adminAPI.createCoupon(payload);
      setCoupons([created as AdminCoupon, ...coupons]);
      setIsCouponModalOpen(false);
      setCouponDraft({ code: '', discountPercentage: 0, maxUses: 1, validFrom: '', validUntil: '' });
      toast({ title: 'Coupon created', description: 'New coupon added successfully' });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({ title: 'Error', description: 'Failed to create coupon', variant: 'destructive' });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await adminAPI.deleteCoupon(id);
      setCoupons(coupons.filter(c => c._id !== id));
      toast({ title: 'Deleted', description: 'Coupon removed' });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
    }
  }

  // Access to this page is guarded by RequireAdmin

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-slate-300">Manage your Justice AI Oracle platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Lawyers
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading dashboard data...</div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{analyticsData.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-slate-400">+{analyticsData.growth}% from last month</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Premium Users</CardTitle>
                      <Activity className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{analyticsData.activeUsers.toLocaleString()}</div>
                      <p className="text-xs text-slate-400">Premium subscribers</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Total Files</CardTitle>
                      <FileText className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{analyticsData.totalFiles.toLocaleString()}</div>
                      <p className="text-xs text-slate-400">Uploaded documents</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Revenue</CardTitle>
                      <IndianRupee className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">₹{Number(analyticsData.totalRevenue || 0).toLocaleString()}</div>
                      <p className="text-xs text-slate-400">₹{Number(analyticsData.monthlyRevenue || 0).toLocaleString()} this month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Users and Files (Dashboard Overview) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Recent Users</CardTitle>
                        <CardDescription className="text-slate-400">Latest registered or active users</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScrollArea className="h-80 pr-2">
                        <div className="space-y-3">
                          {users.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={user.profileImage} />
                                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={user.subscriptionStatus === 'premium' ? 'default' : 'secondary'}>
                                  {user.subscriptionStatus}
                                </Badge>
                                {user.isAdmin && <Badge variant="outline">Admin</Badge>}
                                <Button size="sm" variant="destructive" onClick={async () => {
                                  try {
                                    await adminAPI.deleteUser(user._id);
                                    setUsers(prev => prev.filter(u => u._id !== user._id));
                                    toast({ title: 'User deleted', description: `${user.email} removed` });
                                  } catch (err) {
                                    console.error('Failed to delete user', err);
                                    toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
                                  }
                                }}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                          {users.length === 0 && (
                            <div className="text-sm text-slate-400">No users found.</div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Recent Files */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Recent Files</CardTitle>
                        <CardDescription className="text-slate-400">Latest uploaded documents</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScrollArea className="h-80 pr-2">
                        <div className="space-y-3">
                          {files.map((file) => (
                            <div key={file._id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-slate-600 rounded-md flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-slate-300" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{file.fileName}</p>
                                  <p className="text-xs text-slate-400">{file.fileType} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{file.fileType.split('/')[1]?.toUpperCase()}</Badge>
                                <Button size="sm" variant="ghost" onClick={() => window.open(file.fileUrl, '_blank')}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {files.length === 0 && (
                            <div className="text-sm text-slate-400">No files found.</div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Manage Lawyers</CardTitle>
                <CardDescription className="text-slate-400">Add and manage registered lawyers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Name</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" value={newLawyer.name} onChange={(e) => setNewLawyer({ ...newLawyer, name: e.target.value })} placeholder="Enter full name" />
                  </div>
                  <div>
                    <Label className="text-white">Phone</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" value={newLawyer.phone} onChange={(e) => setNewLawyer({ ...newLawyer, phone: e.target.value })} placeholder="Enter phone number" />
                  </div>
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" type="email" value={newLawyer.email} onChange={(e) => setNewLawyer({ ...newLawyer, email: e.target.value })} placeholder="Enter email address" />
                  </div>
                  <div>
                    <Label className="text-white">Address</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" value={newLawyer.address} onChange={(e) => setNewLawyer({ ...newLawyer, address: e.target.value })} placeholder="Enter address" />
                  </div>
                </div>
                <div>
                  <Button onClick={handleCreateLawyer}>Add Lawyer</Button>
                </div>

                <div className="space-y-3">
                  {lawyers.map((lawyer) => (
                    <div key={lawyer._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{lawyer.name}</p>
                        <p className="text-xs text-slate-400">{lawyer.phone} • {lawyer.email}</p>
                        <p className="text-xs text-slate-500">{lawyer.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteLawyer(lawyer._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {lawyers.length === 0 && (
                    <div className="text-sm text-slate-400">No lawyers found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
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
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-white">Loading users...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search users..." className="pl-8 bg-slate-700 border-slate-600" />
                      </div>
                      <Select>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                              <p className="text-xs text-slate-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.subscriptionStatus === 'premium' ? 'default' : 'secondary'}>
                              {user.subscriptionStatus}
                            </Badge>
                            {user.isAdmin && <Badge variant="outline">Admin</Badge>}
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleUserAction('View', user._id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleUserAction('Edit', user._id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleUserAction('Delete', user._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">File Management</CardTitle>
                    <CardDescription className="text-slate-400">View and manage uploaded files</CardDescription>
                  </div>
                  <Button onClick={() => handleSystemAction('Upload file')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-white">Loading files...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search files..." className="pl-8 bg-slate-700 border-slate-600" />
                      </div>
                      <Select>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">DOC</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      {files.map((file) => (
                        <div key={file._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{file.fileName}</p>
                              <p className="text-xs text-slate-400">{file.fileType} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                              <p className="text-xs text-slate-400">Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{file.fileType.split('/')[1]?.toUpperCase()}</Badge>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => window.open(file.fileUrl, '_blank')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleUserAction('Download', file._id)}>
                                <FileDown className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleUserAction('Delete', file._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          


          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Admin Profile Section (replacing system settings and platform info) */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Profile</CardTitle>
                <CardDescription className="text-slate-400">View and update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">First Name</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Last Name</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={adminForm.email}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveAdminProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </Button>
                  {adminProfile && (
                    <div className="text-xs text-slate-400">
                      Status: {adminProfile.isVerified ? 'Verified' : 'Unverified'} • {adminProfile.isAdmin ? 'Admin' : 'User'} • Plan: {adminProfile.subscriptionStatus}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Price Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Subscription Price Management</CardTitle>
                <CardDescription className="text-slate-400">Update subscription pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                     <Label htmlFor="subscription-price" className="text-white">Subscription Price (₹)</Label>
                    <Input
                      id="subscription-price"
                      type="number"
                      value={subscriptionPrice}
                      onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                       placeholder="399"
                    />
                     <p className="text-xs text-slate-400 mt-1">Current price: ₹{Number(subscriptionPrice || 0).toFixed(2)}</p>
                  </div>
                  <Button onClick={handleUpdateSubscriptionPrice} className="mt-6">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Update Price
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Coupon Management</CardTitle>
                </div>
                <Button onClick={() => setIsCouponModalOpen(true)} variant="secondary">Create Coupon</Button>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left p-2">CODE</th>
                        <th className="text-left p-2">DISCOUNT</th>
                        <th className="text-left p-2">USES</th>
                        <th className="text-left p-2">VALID FROM</th>
                        <th className="text-left p-2">VALID UNTIL</th>
                        <th className="text-left p-2">STATUS</th>
                        <th className="text-left p-2">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => {
                        const used = (c as any).used ?? 0;
                        const now = Date.now();
                        const status = new Date(c.validUntil).getTime() < now ? 'EXPIRED' : 'ACTIVE';
                        return (
                          <tr key={c._id} className="border-t border-slate-700">
                            <td className="p-2 text-white">{c.code}</td>
                            <td className="p-2 text-white">{c.discountPercentage}%</td>
                            <td className="p-2 text-white">{used} / {c.maxUses}</td>
                            <td className="p-2 text-white">{new Date(c.validFrom).toLocaleDateString()}</td>
                            <td className="p-2 text-white">{new Date(c.validUntil).toLocaleDateString()}</td>
                            <td className="p-2">
                              <span className={`text-xs px-2 py-1 rounded ${status === 'EXPIRED' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>{status}</span>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button size="sm" variant="secondary">Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteCoupon(c._id)}>Delete</Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr>
                          <td className="p-4 text-slate-400" colSpan={7}>No coupons found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Create Coupon Modal */}
            {isCouponModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/80" onClick={() => setIsCouponModalOpen(false)} />
                <div className="relative z-50 w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
                  <div className="text-lg font-semibold text-white">Create New Coupon</div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white">Coupon Code</Label>
                      <Input className="bg-slate-700 border-slate-600 text-white" value={couponDraft.code} onChange={(e) => setCouponDraft({ ...couponDraft, code: e.target.value })} placeholder="Enter coupon code" />
                    </div>
                    <div>
                      <Label className="text-white">Discount Percentage</Label>
                      <Input type="number" className="bg-slate-700 border-slate-600 text-white" value={couponDraft.discountPercentage} onChange={(e) => setCouponDraft({ ...couponDraft, discountPercentage: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-white">Maximum Uses</Label>
                      <Input type="number" className="bg-slate-700 border-slate-600 text-white" value={couponDraft.maxUses} onChange={(e) => setCouponDraft({ ...couponDraft, maxUses: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-white">Valid From</Label>
                      <Input type="date" className="bg-slate-700 border-slate-600 text-white" value={couponDraft.validFrom} onChange={(e) => setCouponDraft({ ...couponDraft, validFrom: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-white">Valid Until</Label>
                      <Input type="date" className="bg-slate-700 border-slate-600 text-white" value={couponDraft.validUntil} onChange={(e) => setCouponDraft({ ...couponDraft, validUntil: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setIsCouponModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCoupon}>Create</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin; 
