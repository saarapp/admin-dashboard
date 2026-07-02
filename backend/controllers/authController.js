// ============================================
// controllers/authController.js - التحكم بـ المصادقة
// ============================================

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  // تسجيل الدخول
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // التحقق من المدخلات
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'البريد وكلمة المرور مطلوبة'
        });
      }

      // البحث عن المستخدم
      const user = await User.getByEmail(email);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'البريد أو كلمة المرور غير صحيحة'
        });
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'البريد أو كلمة المرور غير صحيحة'
        });
      }

      // التحقق من أن المستخدم نشط
      if (!user.is_active) {
        return res.status(403).json({
          status: 'error',
          message: 'حسابك غير مفعل'
        });
      }

      // إنشاء JWT Token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        status: 'success',
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // التحقق من الـ Token
  static async verify(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'التوكن مطلوب'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.getById(decoded.id);

      res.json({
        status: 'success',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'التوكن غير صحيح أو منتهي الصلاحية'
      });
    }
  }
}

module.exports = AuthController;