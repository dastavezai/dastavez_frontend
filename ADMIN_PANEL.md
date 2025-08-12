# Justice AI Oracle - Admin Panel

## Overview

The admin panel provides comprehensive management capabilities for the Justice AI Oracle platform. It features a modern, responsive interface with real-time monitoring, user management, and system administration tools.

## Features

### 🔐 Authentication
- Secure admin login system
- Demo credentials: `admin` / `admin123`
- Session management
- Password visibility toggle

### 📊 Dashboard
- **Statistics Overview**
  - Total Users: 1,250
  - Active Users: 892
  - Total Cases: 456
  - Revenue: $125,000
- **Recent Activity Feed**
  - Real-time system activities
  - User registrations
  - Case completions
  - System backups
- **System Status Monitor**
  - Web Server status
  - Database connectivity
  - AI Processing status
  - File Storage status

### 👥 User Management
- **User List View**
  - Search and filter users
  - View user profiles with avatars
  - Status indicators (Active, Inactive, Pending)
  - Role management (Admin, User, Moderator)
- **User Actions**
  - View user details
  - Edit user information
  - Delete users
  - Add new users

### ⚙️ System Settings
- **Configuration Options**
  - Maintenance Mode toggle
  - Email Notifications settings
  - Auto Backup configuration
  - Performance monitoring
- **Platform Information**
  - Version tracking
  - Database size monitoring
  - Backup status
  - Uptime statistics
  - Active session count
- **System Actions**
  - Database backup
  - Cache clearing
  - Log export
  - System restart

### 🛡️ Security Features
- **Security Overview**
  - Two-Factor Authentication status
  - SSL Certificate validation
  - Firewall status
  - Data encryption status
- **Security Events**
  - Login attempts monitoring
  - Suspicious activity detection
  - Failed login tracking
  - Security alerts

## Navigation

### Sidebar Menu
- **Dashboard**: Overview and statistics
- **Users**: User management (12 pending)
- **Analytics**: Data visualization and trends
- **Content**: Content management (3 updates)
- **Security**: Security monitoring and settings
- **System**: System configuration and maintenance

### Quick Actions
- Add User
- Backup Database
- View Logs

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks
- **Routing**: React Router DOM

## File Structure

```
src/
├── pages/
│   ├── Admin.tsx              # Main admin page with tabs
│   └── AdminDashboard.tsx     # Enhanced dashboard with sidebar
├── components/
│   ├── AdminLogin.tsx         # Authentication component
│   ├── AdminSidebar.tsx       # Navigation sidebar
│   └── ui/                    # shadcn/ui components
└── hooks/
    └── use-toast.ts          # Toast notifications
```

## Routes

- `/admin` - Main admin panel with authentication
- `/admin-dashboard` - Enhanced dashboard with sidebar layout

## Getting Started

1. **Access the Admin Panel**
   ```
   Navigate to: http://localhost:5173/admin
   ```

2. **Login**
   ```
   Username: Fahimahmad904@gmail.com
   Password: 123456789
   ```

3. **Explore Features**
   - Dashboard: View platform statistics
   - Users: Manage user accounts
   - System: Configure platform settings

## Security Considerations

- **Authentication Required**: All admin functions require login
- **Demo Mode**: Current implementation uses demo credentials
- **Session Management**: Implement proper session handling for production
- **Access Control**: Add role-based permissions for different admin levels

## Customization

### Adding New Sections
1. Create new component in `src/components/`
2. Add route in `src/App.tsx`
3. Update sidebar navigation in `AdminSidebar.tsx`

### Styling
- Uses Tailwind CSS with custom dark theme
- Purple accent colors for admin branding
- Responsive design for mobile and desktop

### Data Integration
- Currently uses mock data
- Replace with real API calls for production
- Implement proper error handling

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Charts and graphs with real data
- **User Roles**: Granular permission system
- **Audit Logs**: Comprehensive activity tracking
- **API Integration**: Connect to backend services
- **Export Features**: Data export capabilities
- **Bulk Operations**: Mass user management
- **Notification System**: Real-time alerts

## Development

### Running the Project
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Code Quality
```bash
npm run lint
```

## Support

For technical support or feature requests, please refer to the main project documentation or create an issue in the repository.

---

**Note**: This admin panel is designed for the Justice AI Oracle platform and includes features specific to legal AI services. Customize the branding, features, and data models according to your specific requirements. 