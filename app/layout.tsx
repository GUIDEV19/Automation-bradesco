import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Automação Excel - Sistema de Processamento',
  description: 'Sistema de automação web com processamento de planilhas Excel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

