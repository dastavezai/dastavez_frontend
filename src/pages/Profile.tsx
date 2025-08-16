import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  LogOut, 
  Edit, 
  Save, 
  X,
  Key,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import FloatingCard from '@/components/FloatingCard';
import GavelAnimation from '@/components/GavelAnimation';
import { profileAPI, authAPI, isAuthenticated, User as APIUser } from '@/lib/api';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  joinDate: string;
  lastLogin: string;
  subscription: 'free' | 'premium' | 'enterprise';
  verified: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const userData = await profileAPI.getInfo();
      setProfile({
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: '',
        location: '',
        joinDate: userData.createdAt,
        lastLogin: userData.lastLogin,
        subscription: userData.subscriptionStatus,
        verified: userData.isVerified
      });
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to mock data for demo
      setProfile({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        joinDate: '2024-01-15',
        lastLogin: '2024-12-19T10:30:00Z',
        subscription: 'premium',
        verified: true
      });
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('lastLoginEmail');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      await profileAPI.updateInfo({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      
      // Step 1: Initiate password change (this will send OTP to email)
      const initiateResponse = await fetch('/api/profile/password/initiate-change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword
        })
      });

      if (initiateResponse.ok) {
        // Step 2: Complete password change with OTP
        // Note: You'll need to add an OTP input field to your form
        // For now, we'll just show a success message for the initiation
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        // You should show a message asking user to check email for OTP
        alert('Password change initiated. Please check your email for OTP to complete the process.');
      } else {
        const errorData = await initiateResponse.json();
        setErrors({ currentPassword: errorData.message || 'Failed to initiate password change' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ currentPassword: 'An error occurred while changing password' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-judicial-dark flex items-center justify-center">
        <div className="text-center">
          <GavelAnimation />
          <p className="text-judicial-gold mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-judicial-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load profile</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-judicial-dark">
      {/* Header */}
      <div className="bg-judicial-navy/50 backdrop-blur-sm border-b border-judicial-gold/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/chat')}
                className="text-judicial-gold hover:bg-judicial-gold/10"
              >
                ← Back to Chat
              </Button>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/chat')}
                className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
              >
                Go to Chat
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <FloatingCard>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-judicial-gold to-judicial-lightGold flex items-center justify-center">
                  <User className="h-12 w-12 text-judicial-dark" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-judicial-lightGold mb-4">{profile.email}</p>
                
                <div className="space-y-2 mb-6">
                  <Badge 
                    variant={profile.verified ? "default" : "secondary"}
                    className={profile.verified ? "bg-green-500" : "bg-gray-500"}
                  >
                    {profile.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="border-judicial-gold text-judicial-gold"
                  >
                    {profile.subscription.charAt(0).toUpperCase() + profile.subscription.slice(1)} Plan
                  </Badge>
                </div>

                <div className="text-left space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-judicial-gold" />
                    <span className="text-gray-400">Joined: {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-judicial-gold" />
                    <span className="text-gray-400">Last login: {new Date(profile.lastLogin).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-judicial-navy/50">
                <TabsTrigger value="profile" className="text-judicial-gold">Profile</TabsTrigger>
                <TabsTrigger value="security" className="text-judicial-gold">Security</TabsTrigger>
                <TabsTrigger value="preferences" className="text-judicial-gold">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <FloatingCard>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">Personal Information</CardTitle>
                        <CardDescription className="text-gray-400">
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
                      >
                        {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-judicial-gold">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="bg-judicial-navy/50 border-judicial-gold/30 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-judicial-gold">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="bg-judicial-navy/50 border-judicial-gold/30 text-white"
                        />
                      </div>
                    </div>
                    
                                         <div>
                       <Label htmlFor="email" className="text-judicial-gold">Email</Label>
                       <Input
                         id="email"
                         value={formData.email}
                         disabled
                         className="bg-judicial-navy/50 border-judicial-gold/30 text-gray-400"
                       />
                     </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveProfile} className="bg-judicial-gold text-judicial-dark hover:bg-judicial-lightGold">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </FloatingCard>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <FloatingCard>
                  <CardHeader>
                    <CardTitle className="text-white">Security Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-judicial-gold">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="bg-judicial-navy/50 border-judicial-gold/30 text-white pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-judicial-gold"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-judicial-gold">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="bg-judicial-navy/50 border-judicial-gold/30 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-judicial-gold">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-judicial-navy/50 border-judicial-gold/30 text-white"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      onClick={handleChangePassword}
                      className="bg-judicial-gold text-judicial-dark hover:bg-judicial-lightGold"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </FloatingCard>
              </TabsContent>

              <TabsContent value="preferences" className="mt-6">
                <FloatingCard>
                  <CardHeader>
                    <CardTitle className="text-white">Preferences</CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your experience and notification settings
                    </CardDescription>
                  </CardHeader>
                                     <CardContent className="space-y-6">
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                         <Globe className="h-5 w-5 text-judicial-gold" />
                         Language & Region
                       </h3>
                       <div className="space-y-3">
                         <div>
                           <Label className="text-judicial-gold">Language</Label>
                           <select className="w-full mt-1 p-2 bg-judicial-navy/50 border border-judicial-gold/30 text-white rounded">
                             <option>English</option>
                             <option>Spanish</option>
                             <option>French</option>
                           </select>
                         </div>
                         <div>
                           <Label className="text-judicial-gold">Time Zone</Label>
                           <select className="w-full mt-1 p-2 bg-judicial-navy/50 border border-judicial-gold/30 text-white rounded">
                             <option>UTC-5 (Eastern Time)</option>
                             <option>UTC-8 (Pacific Time)</option>
                             <option>UTC+0 (GMT)</option>
                           </select>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                </FloatingCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 