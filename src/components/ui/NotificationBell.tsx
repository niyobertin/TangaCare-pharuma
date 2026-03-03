import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { Link } from '@tanstack/react-router';
import { pharmacyService } from '../../services/pharmacy.service';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    type: string;
    created_at: string;
    data?: {
        order_id?: number;
        action?: string;
    };
}

export const NotificationBell: React.FC = () => {
    const { socket, isConnected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [alertCount, setAlertCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.is_read) {
                markAsRead(notification.id); // Use the existing markAsRead function
            }

            // Navigate based on notification data
            if (notification.data && notification.data.order_id) {
                setIsOpen(false); // Close popover
                navigate({
                    to: '/app/procurement/orders/$orderId' as any,
                    params: { orderId: String(notification.data.order_id) } as any,
                    search: {} as any
                });
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const fetchAlertSummary = async () => {
        try {
            const response = await pharmacyService.getAlertSummary();
            setAlertCount(response.data.total);
        } catch (error) {
            console.error('Failed to fetch alert summary:', error);
        }
    };

    // Initial sync
    useEffect(() => {
        if (socket && isConnected) {
            socket.emit('notification:sync');
        }
        fetchAlertSummary();
        const interval = setInterval(fetchAlertSummary, 2 * 60 * 1000); // 2 mins
        return () => clearInterval(interval);
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
                {unreadCount + alertCount > 0 && (
                    <span
                        className={clsx(
                            'absolute top-0 right-0 w-4 h-4 text-[10px] font-bold flex items-center justify-center text-white rounded-full border border-white dark:border-slate-900 shadow-sm z-10',
                            alertCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-teal-500',
                        )}
                    >
                        {unreadCount + alertCount > 9 ? '9+' : unreadCount + alertCount}
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
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllRead()}
                                        className="text-xs text-healthcare-primary hover:underline font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {alertCount > 0 && (
                            <Link
                                to={"/app/alerts" as any}
                                search={{} as any}
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                                        <AlertTriangle size={14} />
                                    </div>
                                    <span className="text-xs font-black text-red-600 dark:text-red-400">
                                        {alertCount} Unresolved Alerts
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="text-red-400 group-hover:translate-x-1 transition-transform"
                                />
                            </Link>
                        )}

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
                                            onClick={() => handleNotificationClick(n)}
                                            className={clsx(
                                                'p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 text-left group cursor-pointer',
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
