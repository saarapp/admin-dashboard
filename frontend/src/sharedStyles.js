// ============================================
// sharedStyles.js - ستايل مشترك لكل الصفحات
// ============================================

var shared = {
  // الألوان
  colors: {
    primary: '#667eea',
    primaryDark: '#1a1a2e',
    secondary: '#764ba2',
    success: '#00c853',
    danger: '#ff1744',
    warning: '#ffc400',
    info: '#00b0ff',
    dark: '#1a1a2e',
    light: '#f0f2f5',
    white: '#ffffff',
    text: '#333333',
    textLight: '#999999',
    border: '#e9ecef'
  },

  // التدرجات
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
    danger: 'linear-gradient(135deg, #ff1744 0%, #ff5252 100%)',
    warning: 'linear-gradient(135deg, #ffc400 0%, #ffab00 100%)',
    info: 'linear-gradient(135deg, #00b0ff 0%, #448aff 100%)',
    dark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  },

  // الصفحة
  pageContainer: {
    padding: '25px',
    direction: 'rtl'
  },

  // عنوان الصفحة
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },

  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0
  },

  // البطاقات
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    padding: '25px',
    marginBottom: '20px'
  },

  // بطاقات الإحصائيات
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '25px'
  },

  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    padding: '20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  statIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },

  statLabel: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '500',
    margin: '0 0 5px 0'
  },

  statNumber: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0
  },

  // المدخلات
  inputGroup: {
    marginBottom: '18px'
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#1a1a2e',
    fontSize: '14px'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 0.3s',
    backgroundColor: '#fafafa'
  },

  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fafafa'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fafafa',
    resize: 'vertical'
  },

  // الأزرار
  btnPrimary: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
  },

  btnSuccess: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #00c853, #00e676)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,200,83,0.3)'
  },

  btnDanger: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #ff1744, #ff5252)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,23,68,0.3)'
  },

  btnWarning: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #ffc400, #ffab00)',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  btnInfo: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #00b0ff, #448aff)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  btnSmall: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'white'
  },

  btnFull: {
    width: '100%'
  },

  // الجداول
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginTop: '10px'
  },

  th: {
    backgroundColor: '#f8f9fa',
    padding: '14px 16px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a2e',
    borderBottom: '2px solid #e9ecef'
  },

  td: {
    padding: '14px 16px',
    textAlign: 'right',
    fontSize: '13px',
    color: '#555',
    borderBottom: '1px solid #f5f5f5'
  },

  // الشارات
  badge: {
    padding: '4px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block'
  },

  // الفلتر
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },

  filterBtn: {
    padding: '8px 18px',
    border: '2px solid #e9ecef',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s',
    backgroundColor: 'white'
  },

  filterBtnActive: {
    border: '2px solid #667eea',
    backgroundColor: '#667eea',
    color: 'white'
  },

  // التبويبات
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },

  tab: {
    padding: '12px 24px',
    border: '2px solid #e9ecef',
    borderRadius: '12px 12px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
    backgroundColor: 'white'
  },

  tabActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
    color: 'white'
  },

  tabContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '0 0 16px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },

  // الرسائل
  success: {
    background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
    color: '#2e7d32',
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #a5d6a7'
  },

  error: {
    background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
    color: '#c62828',
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #ef9a9a'
  },

  // حالة فارغة
  noData: {
    textAlign: 'center',
    color: '#bbb',
    padding: '50px 20px',
    fontSize: '15px'
  },

  // نصائح
  hint: {
    color: '#666',
    fontSize: '13px',
    backgroundColor: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    borderRight: '4px solid #667eea'
  },

  // قسم
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: '25px',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default shared;