import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Linkedin Agentic Service',
    description: 'Sorry, no frontend enabled. Contact dev for support.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
} 