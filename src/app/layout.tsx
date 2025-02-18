import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Container } from '@/components/layout/container'
import { ClientProvider } from '@/components/providers/client-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETHOSLOG - 智能价值观探索日记',
  description: '通过AI分析，探索你的价值观',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProvider>
          <Container>{children}</Container>
        </ClientProvider>
      </body>
    </html>
  )
}