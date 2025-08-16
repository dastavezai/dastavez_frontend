# API Integration Documentation

This document explains how the frontend is integrated with the Law AI backend API.

## Overview

The frontend application is now fully integrated with the backend API using relative paths. All API calls are centralized in the `src/lib/api.ts` file for easy maintenance and consistency.

## API Service Structure

### Core API Functions (`src/lib/api.ts`)

The API service is organized into several modules:

1. **Authentication API** (`authAPI`)
2. **Chat API** (`chatAPI`)
3. **File Management API** (`fileAPI`)
4. **Subscription & Payments API** (`subscriptionAPI`)
5. **Profile Management API** (`profileAPI`)
6. **Contact API** (`contactAPI`)
7. **Admin API** (`adminAPI`)

### Key Features

- **Automatic Token Management**: JWT tokens are automatically included in requests
- **Error Handling**: Centralized error handling with meaningful error messages
- **Type Safety**: Full TypeScript support with proper interfaces
- **File Upload Support**: Handles multipart form data for file uploads

## Authentication Flow

### 1. Email Check
```typescript
import { authAPI } from '@/lib/api';

const checkEmail = async (email: string) => {
  const response = await authAPI.checkEmail(email);
  // response.exists: boolean
  // response.message: string (if user doesn't exist)
};
```

### 2. Login
```typescript
const login = async (email: string, password: string) => {
  const response = await authAPI.login(email, password);
  // Token is automatically stored in localStorage
  // response.user: User object
  // response.token: JWT token
};
```

### 3. Registration
```typescript
const signup = async (userData) => {
  const response = await authAPI.signup({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    otp: '123456'
  });
  // Token is automatically stored in localStorage 
};
```

### 4. Logout
```typescript
const logout = () => {
  authAPI.logout(); // Removes token from localStorage
};
```

## Chat Integration

### Send Message
```typescript
import { chatAPI } from '@/lib/api';

const sendMessage = async (message: string) => {
  const response = await chatAPI.sendMessage(message);
  // response.response: AI response
  // response.remainingMessages: number
  // response.subscriptionStatus: 'free' | 'premium'
};
```

### Get Chat History
```typescript
const getHistory = async () => {
  const history = await chatAPI.getHistory();
  // Returns array of ChatMessage objects
};
```

### Clear Chat History
```typescript
const clearHistory = async () => {
  await chatAPI.clearHistory();
};
```

## File Management

### Upload File
```typescript
import { fileAPI } from '@/lib/api';

const uploadFile = async (file: File) => {
  const response = await fileAPI.uploadFile(file);
  // response.file: FileUpload object
  // response.remainingMessages: number
};
```

### Get All Files
```typescript
const getAllFiles = async () => {
  const files = await fileAPI.getAllFiles();
  // Returns array of FileUpload objects
};
```

### Analyze File
```typescript
const analyzeFile = async (fileId: string, question: string) => {
  const response = await fileAPI.analyzeFile(fileId, question);
  // response.analysis: string
  // response.fileName: string
};
```

## Subscription & Payments

### Get Subscription Price
```typescript
import { subscriptionAPI } from '@/lib/api';

const getPrice = async () => {
  const response = await subscriptionAPI.getPrice();
  // response.price: number
};
```

### Create Payment Order
```typescript
const createOrder = async (amount: number, currency: string = 'INR', couponCode?: string) => {
  const response = await subscriptionAPI.createOrder(amount, currency, couponCode);
  // response.order: Order object
  // response.appliedCoupon?: Coupon object
};
```

### Validate Coupon
```typescript
const validateCoupon = async (code: string) => {
  const response = await subscriptionAPI.validateCoupon(code);
  // response.coupon: Coupon object
};
```

## Profile Management

### Get Profile Info
```typescript
import { profileAPI } from '@/lib/api';

const getProfile = async () => {
  const user = await profileAPI.getInfo();
  // Returns User object
};
```

### Update Profile
```typescript
const updateProfile = async (data: { firstName?: string; lastName?: string }) => {
  await profileAPI.updateInfo(data);
};
```

### Upload Profile Image
```typescript
const uploadImage = async (image: File) => {
  const response = await profileAPI.uploadImage(image);
  // response.user: Updated User object
};
```

## Utility Functions

### Check Authentication Status
```typescript
import { isAuthenticated, getToken } from '@/lib/api';

const isLoggedIn = isAuthenticated(); // boolean
const token = getToken(); // string | null
```

## Error Handling

All API functions throw errors with meaningful messages:

```typescript
try {
  const response = await authAPI.login(email, password);
  // Handle success
} catch (error: any) {
  console.error('Login failed:', error.message);
  // Handle error
}
```

## Component Integration Examples

### Auth Component
The `Auth.tsx` component now uses the API service:

```typescript
// Check email
const data = await authAPI.checkEmail(state.email);

// Login
const data = await authAPI.login(emailToUse, state.password);

// Register
const data = await authAPI.signup({
  firstName: state.firstName,
  lastName: state.lastName,
  email: state.email,
  password: state.password,
  confirmPassword: state.confirmPassword,
  otp: state.otp,
});
```

### Chat Component
The `Chat.tsx` component integrates with the chat API:

```typescript
// Load chat history
const history = await chatAPI.getHistory();

// Send message
const response = await chatAPI.sendMessage(inputMessage.trim());

// Clear history
await chatAPI.clearHistory();
```

### Profile Component
The `Profile.tsx` component uses profile and auth APIs:

```typescript
// Get profile info
const userData = await profileAPI.getInfo();

// Update profile
await profileAPI.updateInfo({
  firstName: formData.firstName,
  lastName: formData.lastName
});

// Logout
authAPI.logout();
```

## Environment Variables

The API base URL is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = '/api';
```

## Testing

A test file `test-api.js` is included to verify API connectivity:

```bash
node test-api.js
```

## Security Features

1. **JWT Token Management**: Automatic token inclusion in requests
2. **Authentication Checks**: Components verify authentication status
3. **Error Handling**: Graceful error handling with user-friendly messages
4. **Rate Limiting**: Backend handles rate limiting
5. **CORS**: Properly configured for the frontend domain

## File Upload Limits

- Maximum file size: 5MB
- Allowed file types: PDF, Word documents, images (JPEG, PNG, GIF), text files, Excel files

## Rate Limiting

- Authentication endpoints: 10 requests per 15 minutes
- Login endpoint: 5 failed attempts per hour
- Chat endpoints: 100 requests per 15 minutes

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS is configured for your frontend domain
2. **Authentication Errors**: Check if the JWT token is valid and not expired
3. **File Upload Errors**: Verify file size and type restrictions
4. **Network Errors**: Check API endpoint availability

### Debug Mode

Enable debug logging by adding to your component:

```typescript
console.log('API Response:', response);
console.log('Error:', error.message);
```

## Next Steps

1. **Add Loading States**: Implement proper loading indicators
2. **Add Error Boundaries**: Create React error boundaries for better UX
3. **Add Retry Logic**: Implement automatic retry for failed requests
4. **Add Offline Support**: Consider caching for offline functionality
5. **Add Real-time Features**: Consider WebSocket integration for real-time chat

## API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/check-email` | POST | Check if email exists | No |
| `/auth/login` | POST | User login | No |
| `/auth/signup` | POST | User registration | No |
| `/auth/user` | GET | Get current user | Yes |
| `/auth/forgot-password` | POST | Request password reset | No |
| `/auth/verify-reset-otp` | POST | Verify reset OTP | No |
| `/auth/reset-password` | POST | Reset password | No |
| `/api/chat/message` | POST | Send chat message | Yes |
| `/api/chat/history` | GET | Get chat history | Yes |
| `/api/chat/clear` | DELETE | Clear chat history | Yes |
| `/api/files/upload` | POST | Upload file | Yes |
| `/api/files/all` | GET | Get all files | Yes |
| `/api/files/analyze/:fileId` | POST | Analyze file | Yes |
| `/api/files/:fileId` | DELETE | Delete file | Yes |
| `/api/subscription/price` | GET | Get subscription price | Yes |
| `/api/subscription/order` | POST | Create payment order | Yes |
| `/api/subscription/verify` | POST | Verify payment | Yes |
| `/api/subscription/status` | GET | Get subscription status | Yes |
| `/api/subscription/validate-coupon` | POST | Validate coupon | Yes |
| `/api/profile/info` | GET | Get profile info | Yes |
| `/api/profile/info` | PUT | Update profile | Yes |
| `/api/profile/upload-image` | POST | Upload profile image | Yes |
| `/api/contact` | POST | Send contact email | No |

This integration provides a complete, type-safe, and maintainable way to interact with the Law AI backend API. 