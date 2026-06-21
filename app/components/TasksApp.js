'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TasksApp({ session }) {
  const [activePage, setActivePage] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('task'); // task | meeting | reminder
  const [toast, setToast] = useState(null);

  // Form fields for new task
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('work');
  const [newDate, setNewDate] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    const userId = session.user.id;

    const [tasksRes, meetingsRes, remindersRes, profileRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('meetings').select('*').eq('user_id', userId).order('meeting_date'),
      supabase.from('reminders').select('*').eq('user_id', userId).order('reminder_date'),
      supabase.from('profiles').select('*').eq('id', userId).single(),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (meetingsRes.data) setMeetings(meetingsRes.data);
    if (remindersRes.data) setReminders(remindersRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [session]);

  const addTask = async () => {
    if (!newTitle.trim()) {
      showToast('الرجاء إدخال عنوان المهمة');
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: session.user.id,
        title: newTitle.trim(),
        task_type: newType,
        due_date: newDate || null,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      showToast('حدث خطأ: ' + error.message);
    } else {
      setTasks([data, ...tasks]);
      setNewTitle('');
      setNewDate('');
      setShowAdd(false);
      showToast('تم إضافة المهمة بنجاح');
    }
  };

  const toggleTask = async (task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id);

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('هل تريد حذف هذه المهمة؟')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
      showToast('تم حذف المهمة');
    }
  };

  const handleLogout = async () => {
    if (!confirm('هل تريد تسجيل الخروج؟')) return;
    await supabase.auth.signOut();
  };

  const typeLabels = { work: 'الشركة', personal: 'شخصي', family: 'العائلة', relatives: 'الأهل' };
  const typeColors = { work: '#1E3A5F', personal: '#9333EA', family: '#16A34A', relatives: '#D97706' };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'بدون تاريخ';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diff = Math.round((date - today) / 86400000);
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'غداً';
    if (diff === -1) return 'أمس';
    if (diff > 1) return `بعد ${diff} أيام`;
    return `متأخرة ${Math.abs(diff)} أيام`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8693A8' }}>
        جارٍ التحميل...
      </div>
    );
  }

  return (
    <div className="app">
      <div className="content-area">
        {/* Tasks Page */}
        {activePage === 'tasks' && (
          <section className="page active">
            <div className="top-bar">
              <div>
                <div className="greeting">مرحباً، {profile?.full_name || 'صديقي'}</div>
                <h2>مهامي</h2>
              </div>
              <div className="top-actions">
                <button className="icon-btn" onClick={handleLogout} aria-label="تسجيل الخروج">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="scroll">
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8693A8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <p>لا توجد مهام بعد</p>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>اضغط زر + لإضافة مهمة جديدة</p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map((t) => (
                    <div className="task-wrapper" key={t.id}>
                      <div className={`task ${t.completed ? 'completed' : ''}`}>
                        <button
                          className={`checkbox ${t.completed ? 'done' : ''}`}
                          onClick={() => toggleTask(t)}
                          aria-label="إكمال"
                        >
                          {t.completed && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <div className="task-content">
                          <div className="task-title">{t.title}</div>
                          <div className="task-meta">
                            <span className="meta-item">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {formatDate(t.due_date)}
                            </span>
                            <span className="priority" style={{ background: typeColors[t.task_type] + '15', color: typeColors[t.task_type] }}>
                              {typeLabels[t.task_type]}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(t.id)}
                          style={{ background: 'none', color: '#DC2626', padding: '6px', display: 'flex' }}
                          aria-label="حذف"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Meetings Page */}
        {activePage === 'meetings' && (
          <section className="page active">
            <div className="top-bar">
              <h2>اجتماعاتي</h2>
            </div>
            <div className="scroll">
              {meetings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8693A8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                  <p>لا توجد اجتماعات</p>
                </div>
              ) : (
                meetings.map((m) => (
                  <div key={m.id} className="meeting-card">
                    <h3>{m.title}</h3>
                    <p style={{ fontSize: '13px', color: '#8693A8', marginTop: '6px' }}>
                      {m.meeting_date} · {m.meeting_time?.slice(0, 5)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Reminders Page */}
        {activePage === 'reminders' && (
          <section className="page active">
            <div className="top-bar">
              <h2>التذكيرات</h2>
            </div>
            <div className="scroll">
              {reminders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8693A8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏰</div>
                  <p>لا توجد تذكيرات</p>
                </div>
              ) : (
                reminders.map((r) => (
                  <div key={r.id} className="reminder-card">
                    <h4>{r.title}</h4>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Settings Page */}
        {activePage === 'settings' && (
          <section className="page active">
            <div className="top-bar">
              <h2>الإعدادات</h2>
            </div>
            <div className="scroll">
              <div className="profile-card" style={{ marginTop: 8, padding: '14px 4px 18px', display: 'flex', gap: 14, alignItems: 'center', background: 'transparent', border: 'none' }}>
                <div className="profile-avatar" style={{ width: 56, height: 56, borderRadius: 18, background: '#162A47', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 18, flexShrink: 0 }}>
                  {profile?.full_name?.[0] || session.user.email[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 600, color: '#0A1628' }}>{profile?.full_name || 'مستخدم'}</h4>
                  <p style={{ fontSize: '12.5px', color: '#8693A8', marginTop: 2 }}>{session.user.email}</p>
                </div>
              </div>

              <div className="settings-section" style={{ marginTop: 16 }}>
                <div className="settings-group">
                  <button className="setting-row" onClick={handleLogout}>
                    <div className="setting-icon danger">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </div>
                    <div className="setting-content">
                      <div className="name" style={{ color: '#DC2626' }}>تسجيل الخروج</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activePage === 'tasks' ? 'active' : ''}`} onClick={() => setActivePage('tasks')}>
          <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/>
            <path d="m17 8 2 2 4-4"/><path d="m17 14 2 2 4-4"/>
          </svg>
          <span>المهام</span>
        </button>
        <button className={`nav-item ${activePage === 'meetings' ? 'active' : ''}`} onClick={() => setActivePage('meetings')}>
          <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>الاجتماعات</span>
        </button>
        <button className="nav-add" onClick={() => setShowAdd(true)} aria-label="إضافة">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button className={`nav-item ${activePage === 'reminders' ? 'active' : ''}`} onClick={() => setActivePage('reminders')}>
          <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>
            <path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/><path d="m9 13 2 2 4-4"/>
          </svg>
          <span>التذكيرات</span>
        </button>
        <button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
          <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>الإعدادات</span>
        </button>
      </nav>

      {/* Add Task Modal */}
      {showAdd && (
        <>
          <div className="modal-backdrop active" onClick={() => setShowAdd(false)} />
          <div className="sheet active" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '20px', zIndex: 100, maxWidth: 560, margin: '0 auto' }}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>مهمة جديدة</h3>
            <p style={{ fontSize: 13, color: '#8693A8', marginBottom: 18 }}>أضف مهمة لإنجازها</p>

            <div className="form-field" style={{ marginBottom: 14 }}>
              <label>عنوان المهمة</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: مراجعة العرض التقديمي"
                autoFocus
              />
            </div>

            <div className="form-field" style={{ marginBottom: 14 }}>
              <label>التاريخ (اختياري)</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="form-field" style={{ marginBottom: 18 }}>
              <label>النوع</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setNewType(k)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 99,
                      background: newType === k ? '#0A1628' : '#F4F6FA',
                      color: newType === k ? 'white' : '#0A1628',
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>
                إلغاء
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={addTask}>
                إضافة المهمة
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <div className="toast active">{toast}</div>}
    </div>
  );
}
