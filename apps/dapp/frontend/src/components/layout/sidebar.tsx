'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    TrendingUp,
    Gift,
    User,
    X,
    ChevronLeft,
    Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

const navItems = [
    { href: '/markets', label: 'Markets', icon: Store },
    { href: '/rewards', label: 'Rewards', icon: Gift },
    { href: '/profile', label: 'Profile', icon: User },
]

interface SidebarProps {
    isMobileOpen?: boolean
    onMobileClose?: () => void
}

export function Sidebar({ isMobileOpen: externalMobileOpen, onMobileClose: externalOnMobileClose }: SidebarProps = {}) {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar } = useAppStore()
    const [internalMobileOpen, setInternalMobileOpen] = useState(false)
    const prevPathnameRef = useRef(pathname)

    const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen

    const handleMobileClose = () => {
        if (externalOnMobileClose) {
            externalOnMobileClose()
        } else {
            setInternalMobileOpen(false)
        }
    }

    // Close mobile sidebar when route changes (only when pathname actually changes)
    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            // Only close if menu is open and pathname changed
            if (isMobileOpen) {
                handleMobileClose()
            }
            prevPathnameRef.current = pathname
        }
    }, [pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobileOpen])

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={handleMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Sidebar - Slides from Bottom, Full Width, Full Height - Completely Hidden When Closed */}
            <aside className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 h-screen z-50 bg-white dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:to-[#121212] flex flex-col shadow-2xl transition-all duration-300 ease-out",
                isMobileOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
            )}>
                {/* Mobile Header with Close Button */}
                <div className="p-4 sm:p-6 border-b border-black/10 dark:border-white/5 flex items-center justify-between flex-shrink-0 dark:bg-gradient-to-r dark:from-[#b92b27]/10 dark:to-[#1565c0]/10">
                    <Link
                        href="/profile"
                        className="flex items-center gap-2"
                        onClick={handleMobileClose}
                    >
                        <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="font-bold text-xl tracking-tight font-heading text-black dark:text-white">Suinergy</span>
                    </Link>
                    <button
                        onClick={handleMobileClose}
                        className="p-2 rounded-lg hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/20 dark:hover:to-[#1565c0]/20 transition-all duration-200"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6 text-black dark:text-white" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleMobileClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-brand-gradient text-white shadow-lg shadow-brand-gradient/20"
                                        : "text-black dark:text-white hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/10 dark:hover:to-[#1565c0]/10"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-base">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Desktop Sidebar - Completely Hidden on Mobile (No Space Taken), Only Shows on Large Screens */}
            <aside className={cn(
                "hidden lg:flex sticky top-0 h-screen bg-white dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:to-[#121212] border-r border-black/10 dark:border-white/5 flex-col overflow-hidden transition-all duration-500 ease-in-out",
                sidebarCollapsed ? "w-16" : "w-64"
            )} aria-hidden={true}>
                {!sidebarCollapsed ? (
                    <>
                        {/* Desktop Logo */}
                        <div className="p-6 border-b border-black/10 dark:border-white/5 dark:bg-gradient-to-r dark:from-[#b92b27]/10 dark:to-[#1565c0]/10">
                            <div className="flex items-center justify-between gap-3">
                                <Link href="/profile" className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                        S
                                    </div>
                                    <span className="font-bold text-xl tracking-tight font-heading whitespace-nowrap text-black dark:text-white">Suinergy</span>
                                </Link>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-1.5 rounded-lg hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/20 dark:hover:to-[#1565c0]/20 transition-all duration-200 flex-shrink-0"
                                    aria-label="Collapse sidebar"
                                >
                                    <ChevronLeft className="w-4 h-4 text-black dark:text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-brand-gradient text-white shadow-lg shadow-brand-gradient/20"
                                                : "text-black dark:text-white hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/10 dark:hover:to-[#1565c0]/10"
                                        )}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Desktop Collapse Button */}
                        <div className="p-4 border-t border-black/10 dark:border-white/5">
                            <button
                                onClick={toggleSidebar}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-black dark:text-white hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/10 dark:hover:to-[#1565c0]/10 transition-all duration-200"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-sm whitespace-nowrap">Collapse</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Collapsed Logo */}
                        <div className="p-4 border-b border-black/10 dark:border-white/5 dark:bg-gradient-to-r dark:from-[#b92b27]/10 dark:to-[#1565c0]/10">
                            <Link href="/profile" className="flex justify-center">
                                <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold">
                                    S
                                </div>
                            </Link>
                        </div>

                        {/* Collapsed Navigation */}
                        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-brand-gradient text-white shadow-lg shadow-brand-gradient/20"
                                                : "text-black dark:text-white hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/10 dark:hover:to-[#1565c0]/10"
                                        )}
                                        title={item.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Collapsed Expand Button */}
                        <div className="p-4 border-t border-black/10 dark:border-white/5">
                            <button
                                onClick={toggleSidebar}
                                className="w-full flex items-center justify-center p-2 rounded-lg text-black dark:text-white hover:bg-[#f4f3f0] dark:hover:bg-gradient-to-r dark:hover:from-[#b92b27]/10 dark:hover:to-[#1565c0]/10 transition-all duration-200"
                                aria-label="Expand sidebar"
                            >
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    )
}
