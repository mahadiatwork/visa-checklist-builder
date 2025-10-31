import './globals.css'

export const metadata = {
  title: 'Visa Checklist Builder',
  description: 'Build and manage visa checklists for migration agents',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
