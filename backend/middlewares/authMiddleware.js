// ============================================
// middlewares/authMiddleware.js - التحقق من المصادقة
// ============================================

const jwt = require('jsonwebtoken');

class AuthMiddleware {
  // التحقق من التوكن
  static verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'التوكن مطلوب'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'التوكن غير صحيح أو منتهي الصلاحية'
      });
    }
  }

  // التحقق من الدور (Admin فقط)
  static requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'صلاحيات غير كافية - مدير مطلوب'
      });
    }
    next();
  }

  // التحقق من الدور (Accountant أو Admin)
  static requireAccountant(req, res, next) {
    if (!['admin', 'accountant'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'صلاحيات غير كافية - محاسب مطلوب'
      });
    }
    next();
  }
}

module.exports = AuthMiddleware;