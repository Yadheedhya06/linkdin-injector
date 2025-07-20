
import { FaXTwitter, FaLinkedin, FaTelegram } from 'react-icons/fa6'

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100vh',
        textAlign: 'center' as const,
        padding: '25vh 20px',
    },
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '40px 60px',
        zIndex: 1,
    },
    title: {
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    subtitle: {
        fontSize: '1.5rem',
        marginBottom: '20px',
    },
    socials: {
        display: 'flex',
        gap: '25px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconLink: {
        color: '#e2e8f0',
        fontSize: '2.5rem',
    },
    footer: {
        padding: '5px 0',
        fontSize: '0.9rem',
    },
}

export default function Home() {
    return (
        <main style={styles.container}>
            <div style={styles.glassContainer}>
                <h1 style={styles.title}>Sorry, this is a LinkedIn Agentic Service</h1>
                <p style={styles.subtitle}>No frontend enabled. Contact dev for support.</p>
            </div>
            <div style={styles.socials}>
                <a
                    href="https://x.com/jeydReal"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.iconLink}
                >
                    <FaXTwitter />
                </a>
                <a
                    href="https://www.linkedin.com/in/yadheedhya/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.iconLink}
                >
                    <FaLinkedin />
                </a>
                <a
                    href="https://t.me/jeydhl"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.iconLink}
                >
                    <FaTelegram />
                </a>
            </div>
            <footer style={styles.footer}>
                <p>Feel free to contribute if you have a good FE idea for this service 😉</p>
            </footer>
        </main>
    )
} 