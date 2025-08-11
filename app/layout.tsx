import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Lumen Tour Map - Интерактивная карта концертов',
  description: 'Интерактивная карта концертов группы Lumen с актуальным расписанием туров',
  keywords: 'Lumen, концерты, тур, карта, расписание, билеты',
  openGraph: {
    title: 'Lumen Tour Map',
    description: 'Следите за турами группы Lumen на интерактивной карте',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}