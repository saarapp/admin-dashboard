// ============================================
// routes/recordRoutes.js - مسارات السجلات
// ============================================

const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/recordController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع مسارات السجلات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.requireAccountant);

// جلب جميع السجلات
router.get('/', RecordController.getAllRecords);

// جلب السجلات حسب النوع
router.get('/type', RecordController.getRecordsByType);

// جلب إحصائيات عامة
router.get('/stats/global', RecordController.getStats);

// جلب سجلات الكابتن الواحد
router.get('/captain/:captainId', RecordController.getCaptainRecords);

// جلب سجل واحد
router.get('/:id', RecordController.getRecordById);

// إنشاء سجل جديد (إنذار/خصم/تعويض)
router.post('/', RecordController.createRecord);

// تحديث سجل
router.put('/:id', RecordController.updateRecord);

// حذف سجل
router.delete('/:id', RecordController.deleteRecord);

module.exports = router;