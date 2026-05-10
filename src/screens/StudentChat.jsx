import { motion } from 'framer-motion'
import { FiSend } from 'react-icons/fi'
import { useState } from 'react'

export default function StudentChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'executor', text: 'Я принял ваш заказ', time: '10:30' },
    { id: 2, sender: 'user', text: 'Спасибо! Когда будет готово?', time: '10:32' },
  ])

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'user', text: message, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }])
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-4"
      >
        Чат
      </motion.h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Сообщение..."
          className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg"
        >
          <FiSend size={20} />
        </motion.button>
      </div>
    </div>
  )
}
