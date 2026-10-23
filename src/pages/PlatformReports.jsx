import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import '../components/Management.css';

function PlatformReports() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser?.role || 'admin';
  const isPlatformCoordinator = role === 'platform_coordinator';
  const isPlatformMohfez = role === 'platform_mohfez';

  return (
    <div className="management-page" dir="rtl">
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={26} style={{ color: 'var(--accent-primary)' }} />
          تقارير المنصة
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
          {isPlatformCoordinator
            ? `مرحباً بك ${currentUser?.name || ''}، يمكنك متابعة تقرير أيام عملك وساعات المحفظين المشرف على حلقاتهم أدناه:`
            : 'اختر التقرير المطلوب للاطلاع على الإحصائيات وتفاصيل الجلسات وتصدير البيانات:'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* بطاقة تقرير ساعات المحفظين */}
        <div className="box-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #3b82f6', borderRadius: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', padding: '14px', borderRadius: '12px' }}>
                <Clock size={28} />
              </div>
              <span style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-muted)' }}>
                شهري
              </span>
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>
              {isPlatformCoordinator ? 'تقرير ساعات المحفظين المشرف عليهم' : 'تقرير ساعات المحفظين'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.7', marginBottom: '20px' }}>
              {isPlatformCoordinator
                ? 'متابعة إجمالي الساعات والجلسات المحتسبة للمحفظين الخاضعين لإشرافك وفق جدول الأزهر الشريف.'
                : 'حساب الساعات المعتمدة لكل محفظ تلقائياً بناءً على الحضور الفعلي المسجل ومستوى الحلقات.'}
            </p>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
              <CheckCircle2 size={15} style={{ color: '#10b981' }} />
              حساب المدة تلقائياً وفق معيار الأزهر + تصدير Excel
            </div>
          </div>
          <Link 
            to="/mohfez-hours-report" 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', padding: '12px', fontWeight: 'bold' }}
          >
            فتح تقرير الساعات <ArrowLeft size={16} />
          </Link>
        </div>

        {/* بطاقة تقرير أيام عمل المنسقين */}
        {!isPlatformMohfez && (
          <div className="box-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10b981', borderRadius: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '14px', borderRadius: '12px' }}>
                  <Calendar size={28} />
                </div>
                <span style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  شهري
                </span>
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                {isPlatformCoordinator ? 'تقرير أيام وساعات عمل المنسق' : 'تقرير أيام عمل المنسقين'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.7', marginBottom: '20px' }}>
                {isPlatformCoordinator
                  ? 'عرض إجمالي ساعات إشرافك على الحلقات واحتساب أيام عملك الشهرية (كل 3 ساعات = يوم عمل واحد).'
                  : 'احتساب أيام العمل المستحقة لكل منسق بناءً على ساعات الحلقات التي يشرف عليها وتفاصيل جلساتها.'}
              </p>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                معادلة (الساعات ÷ 3 = يوم عمل) + فلترة بالمحفظ والرواق
              </div>
            </div>
            <Link 
              to="/coordinator-workdays-report" 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', padding: '12px', fontWeight: 'bold' }}
            >
              فتح تقرير أيام العمل <ArrowLeft size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlatformReports;
