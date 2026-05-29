import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { FiHome, FiList, FiMessageCircle, FiDollarSign, FiUser, FiRefreshCw, FiSend } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram, useBackButton, haptic, closeWebApp } from './hooks/useTelegram'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth.jsx'
import { isRunningInTelegram } from './utils/telegramInitData'

const StudentHome = lazy(() => import('./screens/StudentHome'))
const StudentOrders = lazy(() => import('./screens/StudentOrders'))
const ChatList = lazy(() => import('./screens/ChatList'))
const ChatRoom = lazy(() => import('./screens/ChatRoom'))
const StudentProfile = lazy(() => import('./screens/StudentProfile'))
const ExecutorHome = lazy(() => import('./screens/ExecutorHome'))
const ExecutorOrders = lazy(() => import('./screens/ExecutorOrders'))
const ExecutorWork = lazy(() => import('./screens/ExecutorWork'))
const ExecutorFinance = lazy(() => import('./screens/ExecutorFinance'))
const ExecutorProfile = lazy(() => import('./screens/ExecutorProfile'))
const Registration = lazy(() => import('./screens/Registration'))
const EditProfileModal = lazy(() => import('./modals/EditProfileModal'))
const CreateOrderModal = lazy(() => import('./modals/CreateOrderModal'))
const OrderDetailModal = lazy(() => import('./modals/OrderDetailModal'))
const ExecutorOrderDetailModal = lazy(() => import('./modals/ExecutorOrderDetailModal'))

function ScreenFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ErrorScreen({ message, onRetry }) {
  const insideTelegram = isRunningInTelegram()
  const isInitDataMissing = !insideTelegram

  if (isInitDataMissing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-500 flex items-center justify-center mb-4">
          <FiSend size={28} />
        </div>
        <h2 className="text-lg font-bold mb-2">Откройте через Telegram</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Это приложение работает только внутри Telegram. Откройте бота и нажмите кнопку запуска.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center mb-4">
        <FiRefreshCw size={24} />
      </div>
      <h2 className="text-lg font-bold mb-2">Ошибка входа</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="bg-blue-500 active:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg text-sm"
      >
        Повторить
      </button>
    </div>
  )
}

export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { user, role, isNewUser, loading, error, retry, refreshProfile, logout } = useAuth()
  const [currentTab, setCurrentTab] = useState('home')
  const [activeChat, setActiveChat] = useState(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState(null)
  const [activeExecutorOrder, setActiveExecutorOrder] = useState(null)
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [isSelectingRole, setIsSelectingRole] = useState(false)

  const bumpOrders = useCallback(() => setOrdersRefreshKey((k) => k + 1), [])
  const handleOpenOrder = useCallback((id) => {
    haptic('selection')
    setActiveOrderId(id)
  }, [])
  const handleOpenExecutorOrder = useCallback((order) => {
    haptic('selection')
    setActiveExecutorOrder(order)
  }, [])
  const handleOpenChatTab = useCallback(() => {
    setActiveExecutorOrder(null)
    setActiveOrderId(null)
    setActiveChat(null)
    haptic('selection')
    setCurrentTab('chat')
  }, [])

  useTelegram()

  const handleTabChange = useCallback((tab) => {
    haptic('selection')
    setActiveChat(null)
    setCurrentTab(tab)
  }, [])

  const handleOpenChat = useCallback((room) => {
    haptic('selection')
    setActiveChat(room)
  }, [])

  const handleCloseChat = useCallback(() => {
    setActiveChat(null)
  }, [])

  const handleLogout = useCallback(() => {
    haptic('warning')
    setIsSelectingRole(true)
  }, [])

  const showBackButton = role !== null && (currentTab !== 'home' || activeChat !== null)
  const handleBack = useCallback(() => {
    if (activeChat !== null) {
      handleCloseChat()
    } else {
      handleTabChange('home')
    }
  }, [activeChat, handleCloseChat, handleTabChange])
  useBackButton(showBackButton, handleBack)

  const renderScreen = () => {
    if (loading) return <ScreenFallback />
    if (error) return <ErrorScreen message={error} onRetry={retry} />

    if (!user || isNewUser || !role || isSelectingRole) {
      return (
        <Registration
          onCompleted={() => {
            refreshProfile()
            setIsSelectingRole(false)
          }}
          isChangingRole={isSelectingRole}
          onCancelChange={() => setIsSelectingRole(false)}
        />
      )
    }

    if (role === 'student') {
      if (currentTab === 'chat' && activeChat !== null) {
        return <ChatRoom room={activeChat} onBack={handleCloseChat} />
      }
      switch (currentTab) {
        case 'home':
          return (
            <StudentHome
              user={user}
              onLogout={handleLogout}
              onCreateOrder={() => setShowCreateOrder(true)}
              onOpenOrder={handleOpenOrder}
              refreshKey={ordersRefreshKey}
            />
          )
        case 'orders':
          return (
            <StudentOrders
              onOpenOrder={handleOpenOrder}
              refreshKey={ordersRefreshKey}
            />
          )
        case 'chat':
          return <ChatList onOpenChat={handleOpenChat} />
        case 'profile':
          return (
            <StudentProfile
              user={user}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              onEditProfile={() => setShowEditProfile(true)}
            />
          )
        default:
          return null
      }
    }

    if (role === 'executor') {
      if (currentTab === 'chat' && activeChat !== null) {
        return <ChatRoom room={activeChat} onBack={handleCloseChat} />
      }
      switch (currentTab) {
        case 'home':
          return (
            <ExecutorHome
              user={user}
              onLogout={handleLogout}
              onOpenOrder={handleOpenExecutorOrder}
              refreshKey={ordersRefreshKey}
            />
          )
        case 'orders':
          return (
            <ExecutorOrders
              onOpenOrder={handleOpenExecutorOrder}
              refreshKey={ordersRefreshKey}
            />
          )
        case 'work':
          return (
            <ExecutorWork
              onOpenOrder={handleOpenExecutorOrder}
              refreshKey={ordersRefreshKey}
            />
          )
        case 'chat':
          return <ChatList onOpenChat={handleOpenChat} />
        case 'finance':
          return <ExecutorFinance />
        case 'profile':
          return (
            <ExecutorProfile
              user={user}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              onEditProfile={() => setShowEditProfile(true)}
            />
          )
        default:
          return null
      }
    }
    return null
  }

  const navItems = !role
    ? []
    : role === 'student'
      ? [
        { id: 'home', label: 'Главная', icon: FiHome },
        { id: 'orders', label: 'Заказы', icon: FiList },
        { id: 'chat', label: 'Чат', icon: FiMessageCircle },
        { id: 'profile', label: 'Профиль', icon: FiUser },
      ]
      : [
        { id: 'home', label: 'Заказы', icon: FiList },
        { id: 'work', label: 'Работа', icon: FiHome },
        { id: 'chat', label: 'Чат', icon: FiMessageCircle },
        { id: 'finance', label: 'Финансы', icon: FiDollarSign },
        { id: 'profile', label: 'Профиль', icon: FiUser },
      ]

  const hideNav = activeChat !== null

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="mx-auto max-w-md min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-white transition-colors">
        <Suspense fallback={<ScreenFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role ?? 'guest'}-${currentTab}-${activeChat?.id ?? ''}-${isNewUser}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </Suspense>

        {role && navItems.length > 0 && !hideNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 z-30"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex justify-around">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = currentTab === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
                      active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}
                    whileTap={{ scale: 0.92 }}
                  >
                    <Icon size={20} />
                    <span className="text-[10px]">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </nav>
        )}

        <Toaster
          position="top-center"
          toastOptions={{ style: { fontSize: 14, maxWidth: '90vw' } }}
        />

        <Suspense fallback={null}>
          <AnimatePresence>
            {showEditProfile && user && (
              <EditProfileModal
                user={user}
                role={role}
                onClose={() => setShowEditProfile(false)}
                onSaved={() => {
                  setShowEditProfile(false)
                  refreshProfile()
                }}
              />
            )}
            {showCreateOrder && (
              <CreateOrderModal
                onClose={() => setShowCreateOrder(false)}
                onCreated={() => {
                  setShowCreateOrder(false)
                  bumpOrders()
                }}
              />
            )}
            {activeOrderId !== null && (
              <OrderDetailModal
                orderId={activeOrderId}
                onClose={() => setActiveOrderId(null)}
                onChanged={bumpOrders}
                onOpenChat={handleOpenChatTab}
              />
            )}
            {activeExecutorOrder !== null && (
              <ExecutorOrderDetailModal
                order={activeExecutorOrder}
                user={user}
                onClose={() => setActiveExecutorOrder(null)}
                onChanged={bumpOrders}
                onOpenChat={handleOpenChatTab}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  )
}
