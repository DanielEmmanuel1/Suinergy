'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    TrendingUp,
    Gift,
    User,
    Menu,
    X,
    ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/strategies', label: 'Strategies', icon: TrendingUp },
    { href: '/rewards', label: 'Rewards', icon: Gift },
    { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar } = useAppStore()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2 rounded-lg bg-white border border-black/10 shadow-sm"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarCollapsed === false || isMobileOpen) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-black/10 flex flex-col",
                            isMobileOpen && "lg:translate-x-0",
                            !isMobileOpen && "lg:translate-x-0 -translate-x-full lg:translate-x-0"
                        )}
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-black/10">
                            <div className="flex items-center justify-between">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold">
                                        S
                                    </div>
                                    <span className="font-bold text-xl tracking-tight font-heading">Suinergy</span>
                                </Link>
                                <button
                                    onClick={toggleSidebar}
                                    className="hidden lg:flex p-1.5 rounded-lg hover:bg-[#f4f3f0] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-black" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-brand-gradient text-white"
                                                : "text-black hover:bg-[#f4f3f0]"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Collapse Button (Desktop) */}
                        <div className="p-4 border-t border-black/10 hidden lg:block">
                            <button
                                onClick={toggleSidebar}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-black hover:bg-[#f4f3f0] transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-sm">Collapse</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Collapsed Sidebar */}
            {sidebarCollapsed && (
                <aside className="hidden lg:block sticky top-0 h-screen w-16 bg-white border-r border-black/10 flex flex-col items-center py-4">
                    <Link href="/dashboard" className="mb-8">
                        <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center text-white font-bold">
                            S
                        </div>
                    </Link>
                    <nav className="flex-1 space-y-2">
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
                                            ? "bg-brand-gradient text-white"
                                            : "text-black hover:bg-[#f4f3f0]"
                                    )}
                                    title={item.label}
                                >
                                    <Icon className="w-5 h-5" />
                                </Link>
                            )
                        })}
                    </nav>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-black hover:bg-[#f4f3f0] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                </aside>
            )}

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}

