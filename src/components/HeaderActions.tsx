'use client';

import { useState, useEffect, useRef } from 'react';
import { useBalance } from './BalanceContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export function HeaderActions() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { isHidden, toggle } = useBalance();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();

    const channel = supabase.channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'alert': return '🚨';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  return (
    <div className="flex items-center gap-3 relative" ref={notifRef}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="flex h-10 w-10 relative items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 transition-all focus:outline-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {unreadCount > 0 && (
          <span className="absolute top-[8px] right-[10px] h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-12 right-12 w-[340px] bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-5 z-50 pb-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[16px] text-[#0f172a]">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">Mark all read</button>
            )}
          </div>
          
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span className="text-[13px] font-medium text-gray-500">You're all caught up!</span>
              </div>
            ) : (
              notifications.map((notif) => {
                const content = (
                  <>
                    {!notif.is_read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                    )}
                    <div className="text-xl mt-0.5 shrink-0">{getTypeIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex flex-col">
                        <span className={`text-[13px] truncate ${notif.is_read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                          {notif.title}
                        </span>
                        <p className={`text-[12px] leading-tight mt-0.5 ${notif.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] font-medium text-gray-400 mt-1.5 uppercase tracking-wide">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                    </div>
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-full transition-all shrink-0 text-blue-600 focus:outline-none"
                        title="Mark as read"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                    )}
                  </>
                );

                const className = `flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer relative group ${notif.is_read ? 'hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50'}`;
                const onClick = () => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.link) setShowNotifications(false);
                };

                return notif.link ? (
                  <Link href={notif.link} onClick={onClick} key={notif.id} className={className}>
                    {content}
                  </Link>
                ) : (
                  <div onClick={onClick} key={notif.id} className={className}>
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <button 
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 flex-shrink-0 text-[14px] font-medium text-[#475569] hover:bg-gray-100 transition-colors focus:outline-none"
      >
         {isHidden ? (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
         ) : (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
         )}
         <span className="hidden sm:inline-block">{isHidden ? 'Show balance' : 'Hide balance'}</span>
      </button>
    </div>
  );
}
