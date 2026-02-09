import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    type: string;
    created_at: string;
}

export const NotificationBell: React.FC = () => {
    const { socket, isConnected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Initial sync
    useEffect(() => {
        if (socket && isConnected) {
            socket.emit('notification:sync');
        }
    }, [socket, isConnected]);

    // Real-time listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotification: Notification) => {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            // Optional: Play sound or show toast
        };

        const handleSync = (data: { notifications: Notification[]; unreadCount: number }) => {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setIsLoading(false);
        };

        const handleReadSuccess = ({ notificationId }: { notificationId: number }) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        };

        const handleReadAllSuccess = () => {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        };

        socket.on('notification:new', handleNewNotification);
        socket.on('notification:sync', handleSync);
        socket.on('notification:read_success', handleReadSuccess);
        socket.on('notification:read_all_success', handleReadAllSuccess);

        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('notification:sync', handleSync);
            socket.off('notification:read_success', handleReadSuccess);
            socket.off('notification:read_all_success', handleReadAllSuccess);
        };
    }, [socket]);

    const markAsRead = (id: number) => {
        if (socket) {
            socket.emit('notification:read', { notificationId: id });
        }
    };

    const markAllRead = () => {
        if (socket) {
            socket.emit('notification:read_all');
        }
    };

    const deleteNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors relative"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 text-[10px] font-bold flex items-center justify-center bg-red-500 text-white rounded-full border border-white dark:border-slate-900 shadow-sm z-10">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-sm text-healthcare-dark">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead()}
                                    className="text-xs text-healthcare-primary hover:underline font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {isLoading ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                    <Bell size={24} className="text-slate-200" />
                                    No notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={clsx(
                                                'p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 text-left group',
                                                !n.is_read && 'bg-teal-50/30 dark:bg-teal-900/10',
                                            )}
                                        >
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-start justify-between">
                                                    <p
                                                        className={clsx(
                                                            'text-sm font-medium text-healthcare-dark',
                                                            !n.is_read && 'text-healthcare-primary',
                                                        )}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(
                                                            new Date(n.created_at),
                                                            { addSuffix: true },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(n.id);
                                                        }}
                                                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-teal-600"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(n.id);
                                                    }}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-red-400 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
