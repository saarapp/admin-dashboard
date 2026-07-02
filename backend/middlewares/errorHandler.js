// ============================================
// middlewares/errorHandler.js - معالج الأخطاء
// ============================================

class ErrorHandler {
  // معالج الأخطاء العام
  static handleError(err, req, res, next) {
    console.error('❌ خطأ:', err.message);

    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  // معالج المسارات غير الموجودة
  static notFound(req, res, next) {
    res.status(404).json({
      status: 'error',
      message: 'المسار غير موجود'
    });
  }
}

module.exports = ErrorHandler;