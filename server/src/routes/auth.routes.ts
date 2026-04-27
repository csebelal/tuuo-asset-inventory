import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { LoginLog } from '../models/User';
import { config } from '../config/env';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';

const router = Router();

const getClientIp = (req: Request): string => {
  let ip = req.headers['x-forwarded-for'] as string;
  
  if (!ip) {
    ip = req.socket.remoteAddress || req.ip || 'unknown';
  }
  
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = 'localhost';
  }
  
  return ip;
};

router.post('/login', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      await LoginLog.create({
        userId: null,
        username,
        ipAddress: clientIp,
        userAgent,
        success: false
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginLog.create({
        userId: user._id,
        username: user.username,
        ipAddress: clientIp,
        userAgent,
        success: false
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await LoginLog.create({
      userId: user._id,
      username: user.username,
      ipAddress: clientIp,
      userAgent,
      success: true
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: role || 'viewer' });
    await user.save();

    res.status(201).json({ message: 'User created', user: { id: user._id, username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/seed', async (req: Request, res: Response) => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      return res.json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({
      username: 'admin',
      email: 'admin@tuuo.com',
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();

    res.json({ message: 'Admin user created', username: 'admin', password: 'admin123' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (role && ['admin', 'editor', 'viewer'].includes(role)) user.role = role;
    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('/me response:', { username: user.username, role: user.role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/seed', async (req: Request, res: Response) => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      return res.json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({
      username: 'admin',
      email: 'admin@tuuo.com',
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();

    res.json({ message: 'Admin user created', username: 'admin', password: 'admin123' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (role && ['admin', 'editor', 'viewer'].includes(role)) user.role = role;
    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/login-logs', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await LoginLog.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
