import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/client';
import { UserPlus, Trash2, Loader2, RefreshCw, Lock, Pencil, LogIn, CheckCircle, XCircle } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface LoginLog {
  _id: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'admin';
  const showUserManagement = isAdmin;

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.getUsers();
      
      let userData = [];
      if (res.data && Array.isArray(res.data)) {
        userData = res.data;
      } else if (res.data?.users) {
        userData = res.data.users;
      }
      
      setUsers(userData);
      setError('');
    } catch (err: any) {
      setUsers([
        { _id: '1', username: 'admin', email: 'admin@tuuo.com', role: 'admin', createdAt: new Date().toISOString() },
        { _id: '2', username: 'tofayel', email: 'tofayel@tuuo.com', role: 'editor', createdAt: new Date().toISOString() }
      ]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    if (!isAdmin) return;
    setLoadingLogs(true);
    try {
      const res = await authApi.getLoginLogs();
      const logs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setLoginLogs(logs);
    } catch (err) {
      console.error('Failed to fetch login logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (isAdmin) {
      fetchLoginLogs();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await authApi.register(formData);
      setSuccess('User created successfully!');
      setShowModal(false);
      setFormData({ username: '', email: '', password: '', role: 'viewer' });
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await authApi.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setSubmitting(true);
    try {
      console.log('Updating user:', editingUser);
      const res = await authApi.updateUser(editingUser._id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role
      });
      console.log('Update response:', res);
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  return (
    <div className="space-y-4">
      {currentUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentUser.username}</p>
                <p className="text-sm text-slate-500 capitalize">{currentUser.role}</p>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)} className="gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Login Logs - Admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                <CardTitle>Login History</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={fetchLoginLogs}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loadingLogs ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <CardDescription>Recent login attempts (last 100)</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : loginLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-slate-600">Time</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600">Username</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600">IP Address</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.map((log) => (
                      <tr key={log._id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2 text-slate-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 font-medium">{log.username}</td>
                        <td className="py-2 px-2 text-slate-600 font-mono text-xs">{log.ipAddress}</td>
                        <td className="py-2 px-2">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" /> Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="w-4 h-4" /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500">No login logs found</p>
            )}
          </CardContent>
        </Card>
      )}

      {showUserManagement && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchUsers}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => setShowModal(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {error && !showModal && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Username</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Role</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Created</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">{user.username}</td>
                      <td className="py-3 px-2 text-slate-600">{user.email}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500">No users found</p>
          )}
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            TUUO Asset Inventory Management System v1.0
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Developed by <a href="https://belal09.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Belal Hossain</a>. Built with React, Node.js, Express, and MongoDB.
          </p>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Role</label>
                <select
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setError(''); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Current Password</label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">New Password</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={changingPassword} className="flex-1">
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Username</label>
                <Input
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Email</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Role</label>
                <select
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingUser(null); setError(''); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
