import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟登录验证
    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        // 保存登录状态
        localStorage.setItem('famlee_admin_token', 'authenticated');
        onLoginSuccess();
      } else {
        setError('账号或密码错误');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Famlée
          </h1>
          <p className="text-muted-foreground">后台管理系统</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>管理员登录</CardTitle>
            <CardDescription>请输入您的账号和密码以继续</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">账号</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入账号"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            {/* Demo Hint */}
            <div className="mt-6 p-3 bg-muted rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">演示账号信息:</p>
              <p>账号: admin</p>
              <p>密码: 123456</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Famlée - 心理健康支持平台
        </p>
      </div>
    </div>
  );
};
