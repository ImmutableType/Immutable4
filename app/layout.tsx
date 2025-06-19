// app/layout.tsx
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/typewriter-logo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
        <div className="app-layout" style={{ height: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  )
}