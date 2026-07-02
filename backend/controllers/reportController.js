// ============================================
// controllers/reportController.js - التحكم بـ التقارير
// ============================================

const supabase = require('../config/supabase');

class ReportController {
  // تقرير يومي
  static async getDailyReport(req, res) {
    try {
      const { date } = req.query;
      const reportDate = date || new Date().toISOString().split('T')[0];

      const startDate = `${reportDate}T00:00:00`;
      const endDate = `${reportDate}T23:59:59`;

      // جلب السجلات لهذا اليوم
      const { data: records, error } = await supabase
        .from('records')
        .select('*, captains(name, phone_number), users(full_name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // حساب الإحصائيات
      let stats = {
        totalRecords: records.length,
        warnings: 0,
        deductions: 0,
        compensations: 0,
        totalDeductionAmount: 0,
        totalCompensationAmount: 0
      };

      records.forEach(record => {
        if (record.record_type === 'warning') stats.warnings += 1;
        else if (record.record_type === 'deduction') {
          stats.deductions += 1;
          stats.totalDeductionAmount += record.amount || 0;
        } else if (record.record_type === 'compensation') {
          stats.compensations += 1;
          stats.totalCompensationAmount += record.amount || 0;
        }
      });

      // جلب إحصائيات الإشعارات
      const { data: notifications } = await supabase
        .from('notifications')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      let notifStats = { sent: 0, failed: 0, pending: 0 };
      if (notifications) {
        notifications.forEach(n => {
          notifStats[n.status] = (notifStats[n.status] || 0) + 1;
        });
      }

      // جلب إحصائيات الطعون
      const { data: appeals } = await supabase
        .from('appeals')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      let appealStats = { pending: 0, approved: 0, rejected: 0 };
      if (appeals) {
        appeals.forEach(a => {
          appealStats[a.status] = (appealStats[a.status] || 0) + 1;
        });
      }

      res.json({
        status: 'success',
        data: {
          date: reportDate,
          stats,
          notifStats,
          appealStats,
          records
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تقرير شهري
  static async getMonthlyReport(req, res) {
    try {
      const { month, year } = req.query;
      const reportMonth = month || (new Date().getMonth() + 1);
      const reportYear = year || new Date().getFullYear();

      const startDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-01T00:00:00`;
      const lastDay = new Date(reportYear, reportMonth, 0).getDate();
      const endDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-${lastDay}T23:59:59`;

      // جلب السجلات للشهر
      const { data: records, error } = await supabase
        .from('records')
        .select('*, captains(name, phone_number), users(full_name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // حساب الإحصائيات العامة
      let stats = {
        totalRecords: records.length,
        warnings: 0,
        deductions: 0,
        compensations: 0,
        totalDeductionAmount: 0,
        totalCompensationAmount: 0
      };

      records.forEach(record => {
        if (record.record_type === 'warning') stats.warnings += 1;
        else if (record.record_type === 'deduction') {
          stats.deductions += 1;
          stats.totalDeductionAmount += record.amount || 0;
        } else if (record.record_type === 'compensation') {
          stats.compensations += 1;
          stats.totalCompensationAmount += record.amount || 0;
        }
      });

      // إحصائيات حسب اليوم
      let dailyStats = {};
      records.forEach(record => {
        const day = record.created_at.split('T')[0];
        if (!dailyStats[day]) {
          dailyStats[day] = { warnings: 0, deductions: 0, compensations: 0, deductionAmount: 0, compensationAmount: 0 };
        }
        if (record.record_type === 'warning') dailyStats[day].warnings += 1;
        else if (record.record_type === 'deduction') {
          dailyStats[day].deductions += 1;
          dailyStats[day].deductionAmount += record.amount || 0;
        } else if (record.record_type === 'compensation') {
          dailyStats[day].compensations += 1;
          dailyStats[day].compensationAmount += record.amount || 0;
        }
      });

      // أكثر الكابتنات غرامات
      let captainStats = {};
      records.forEach(record => {
        const captainName = record.captains?.name || 'غير معروف';
        if (!captainStats[captainName]) {
          captainStats[captainName] = { warnings: 0, deductions: 0, compensations: 0, totalAmount: 0 };
        }
        if (record.record_type === 'warning') captainStats[captainName].warnings += 1;
        else if (record.record_type === 'deduction') {
          captainStats[captainName].deductions += 1;
          captainStats[captainName].totalAmount += record.amount || 0;
        } else if (record.record_type === 'compensation') {
          captainStats[captainName].compensations += 1;
          captainStats[captainName].totalAmount -= record.amount || 0;
        }
      });

      // ترتيب الكابتنات حسب المبلغ
      const topCaptains = Object.entries(captainStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      // إحصائيات الطعون
      const { data: appeals } = await supabase
        .from('appeals')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      let appealStats = { pending: 0, approved: 0, rejected: 0 };
      if (appeals) {
        appeals.forEach(a => {