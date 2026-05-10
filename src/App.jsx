import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { FiHome, FiList, FiMessageCircle, FiDollarSign, FiUser } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import StudentHome from './screens/StudentHome'
import StudentOrders from './screens/StudentOrders'
import StudentChat from './screens/StudentChat'
import StudentProfile from './screens/StudentProfile'
import ExecutorHome from './screens/ExecutorHome'
import ExecutorOrders from './screens/ExecutorOrders'
import ExecutorWork from './screens/ExecutorWork'
import ExecutorFinance from './screens/ExecutorFinance'
import ExecutorProfile from './screens/ExecutorProfile'
import Welcome from './screens/Welcome'
import Registration from './screens/Registration'
import ThemeToggle from './components/ThemeToggle'
import EditProfileModal from './modals/EditProfileModal'
import CreateOrderModal from './modals/CreateOrderModal'
// import TakeOrderModal from './modals/TakeOrderModal'

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [role, setRole] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [currentTab, setCurrentTab] = useState('home')
  const [userName, setUserName] = useState('')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [showTakeOrder, setShowTakeOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const handleRegister = (data) => {
    setUserName(data.name)
    setRole(data.role)
    setIsRegistered(true)
  }

  const handleLogout = () => {
    setRole(null)
    setIsRegistered(false)
    setCurrentTab('home')
    setUserName('')
  }

  const renderScreen = () => {
    if (!role) {
      return isRegistered ? (
        <Welcome onSelectRole={setRole} />
      ) : (
        <Registration onRegister={handleRegister} />
      )
    }

    if (role === 'student') {
      switch (currentTab) {
        case 'home':
          return <StudentHome userName={userName} onLogout={handleLogout} onCreateOrder={() => setShowCreateOrder(true)} />
        case 'orders':
          return <StudentOrders />
        case 'chat':
          return <StudentChat />
        case 'profile':
          return <StudentProfile userName={userName} onLogout={handleLogout} onEditProfile={() => setShowEditProfile(true)} />
        default:
          return <StudentHome userName={userName} onLogout={handleLogout} onCreateOrder={() => setShowCreateOrder(true)} />
      }
    }

    if (role === 'executor') {
      switch (currentTab) {
        case 'home':
          return <ExecutorHome userName={userName} onLogout={handleLogout} onTakeOrder={(order) => { setSelectedOrder(order); setShowTakeOrder(true); }} />
        case 'orders':
          return <ExecutorOrders onTakeOrder={(order) => { setSelectedOrder(order); setShowTakeOrder(true); }} />
        case 'work':
          return <ExecutorWork />
        case 'finance':
          return <ExecutorFinance />
        case 'profile':
          return <ExecutorProfile userName={userName} onLogout={handleLogout} onEditProfile={() => setShowEditProfile(true)} />
        default:
          return <ExecutorHome userName={userName} onLogout={handleLogout} onTakeOrder={(order) => { setSelectedOrder(order); setShowTakeOrder(true); }} />
      }
    }
  }

  const navItems = role === 'student'
    ? [
      { id: 'home', label: 'Главная', icon: FiHome },
      { id: 'orders', label: 'Мои Заказы', icon: FiList },
      { id: 'chat', label: 'Чат', icon: FiMessageCircle },
      { id: 'profile', label: 'Профиль', icon: FiUser },
    ]
    : role === 'executor'
      ? [
        { id: 'home', label: 'Заказы', icon: FiList },
        { id: 'work', label: 'Работа', icon: FiHome },
        { id: 'chat', label: 'Чат', icon: FiMessageCircle },
        { id: 'finance', label: 'Финансы', icon: FiDollarSign },
        { id: 'profile', label: 'Профиль', icon: FiUser },
      ]
      : []

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-white transition-colors">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {role && navItems.length > 0 && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-w-md mx-auto">
            <div className="flex justify-around">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${currentTab === item.id
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                      }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    <span className="text-[10px]">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </nav>
        )}

        <Toaster position="top-center" />

        <AnimatePresence>
          {showEditProfile && <EditProfileModal userName={userName} onClose={() => setShowEditProfile(false)} onSave={(name) => { setUserName(name); setShowEditProfile(false); }} />}
          {showCreateOrder && <CreateOrderModal onClose={() => setShowCreateOrder(false)} />}
          {/* {showTakeOrder && <TakeOrderModal order={selectedOrder} onClose={() => setShowTakeOrder(false)} />} */}
        </AnimatePresence>
      </div>
    </div>
  )
}
