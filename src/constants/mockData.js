export const ORDER_TYPES = ['ВКР', 'Курсовая', 'Практика', 'Сессия']

export const SUBJECTS = ['Экономика', 'Право', 'Программирование', 'Юриспруденция', 'Психология']

export const EXECUTOR_SPECIALIZATIONS = [
  'Web разработка',
  'Мобильная разработка',
  'Дизайн',
  'Писание контента',
  'Переводы',
]

export const STUDENT_ACTIVE_ORDERS = [
  { id: 1, title: 'Курсовая по экономике', status: 'В работе', progress: 60 },
]

export const STUDENT_ALL_ORDERS = [
  { id: 1, title: 'Курсовая по экономике', executor: 'Анна', rating: 4.8, status: 'В работе' },
  { id: 2, title: 'ВКР по информатике', executor: 'Петр', rating: 4.9, status: 'Ожидание' },
]

export const EXECUTOR_AVAILABLE_ORDERS = [
  { id: 1, title: 'Курсовая', deadline: '20 мая', price: '5000₽' },
  { id: 2, title: 'ВКР', deadline: '25 июня', price: '15000₽' },
]

export const EXECUTOR_MY_ORDERS = [
  { id: 1, title: 'Курсовая по экономике', student: 'Иван', status: 'Принята', deadline: '20 мая' },
  { id: 2, title: 'Практика', student: 'Мария', status: 'Завершена', deadline: '10 мая' },
]

export const EXECUTOR_WORKS = [
  { id: 1, title: 'Курсовая по экономике', progress: 60 },
  { id: 2, title: 'Практика', progress: 100 },
]

export const FINANCE_TRANSACTIONS = [
  { amount: '+ 5 000₽', order: 'Заказ #12', date: '2 часа назад', type: 'in' },
  { amount: '+ 7 500₽', order: 'Заказ #15', date: '5 часов назад', type: 'in' },
  { amount: '- 2 000₽', order: 'Вывод средств', date: '1 день назад', type: 'out' },
]

export const INITIAL_CHAT_MESSAGES = [
  { id: 1, sender: 'executor', text: 'Я принял ваш заказ', time: '10:30' },
  { id: 2, sender: 'user', text: 'Спасибо! Когда будет готово?', time: '10:32' },
]
