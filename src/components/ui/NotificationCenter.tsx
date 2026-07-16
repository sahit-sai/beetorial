'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/app/notifications/actions'
import { Notification } from '@/lib/mock-data'

interface NotificationCenterProps {
  userId: string
  initialNotifications: Notification[]
}

export function NotificationCenter({ userId, initialNotifications }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync state if initialNotifications changes
  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = async (id: string) => {
    // Optimistic client update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationReadAction(id)
  }

  const handleMarkAllRead = async () => {
    // Optimistic client update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await markAllNotificationsReadAction(userId)
  }

  return (
    <div className="relative font-sans text-xs" ref={containerRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-[#3C32CF] dark:text-slate-400 dark:hover:text-[#5146e5] rounded-xl hover:bg-slate-105 dark:hover:bg-slate-900/40 transition-all duration-200"
        title="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 bg-white border border-slate-100 dark:bg-[#0f0f20] dark:border-slate-800/80 rounded-2xl shadow-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <span className="font-heading font-black text-sm text-slate-900 dark:text-slate-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#3C32CF] hover:underline dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Scroll */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-1.5">
                <Check className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] italic">You have no notifications</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border transition-all duration-150 relative flex gap-2.5 ${
                    notif.is_read
                      ? 'bg-slate-50/50 border-slate-100 text-slate-500 dark:bg-slate-900/10 dark:border-slate-850'
                      : 'bg-white border-[#3C32CF]/10 text-slate-800 dark:bg-[#14142a] dark:border-[#5146e5]/10 dark:text-slate-200 shadow-sm'
                  }`}
                >
                  {/* Unread Status Dot Indicator */}
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#3C32CF] dark:bg-[#5146e5] shrink-0 mt-1" />
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <span className={`font-heading font-extrabold text-xs block leading-tight ${
                      notif.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-950 dark:text-white'
                    }`}>
                      {notif.title}
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">
                      {notif.content}
                    </p>
                    <span className="text-[8px] text-slate-400 block pt-0.5">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Mark Read Individual Action */}
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1 text-slate-350 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 shrink-0 h-fit"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
