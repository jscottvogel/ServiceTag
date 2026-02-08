import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <span className="badge badge-primary">✨ Professional Service Management</span>
                        </motion.div>

                        <h1 className="hero-title">
                            Manage Your Services
                            <br />
                            <span className="text-gradient">Like Never Before</span>
                        </h1>

                        <p className="hero-description">
                            Experience the future of service management with our premium mobile-first platform.
                            Built with cutting-edge AWS technology for unparalleled performance and reliability.
                        </p>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
                                Get Started Free
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="btn btn-secondary btn-lg">
                                Watch Demo
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M6.66667 5L13.3333 10L6.66667 15V5Z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        className="feature-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <FeatureCard
                            icon="🚀"
                            title="Lightning Fast"
                            description="Built on AWS App Runner for instant scalability and blazing performance"
                            delay={0.5}
                        />
                        <FeatureCard
                            icon="🔒"
                            title="Secure by Default"
                            description="Enterprise-grade security with AWS Cognito authentication"
                            delay={0.6}
                        />
                        <FeatureCard
                            icon="📱"
                            title="Mobile First"
                            description="Stunning responsive design optimized for all devices"
                            delay={0.7}
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Real-time Sync"
                            description="DynamoDB-powered real-time data synchronization"
                            delay={0.8}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <StatCard number="99.9%" label="Uptime" />
                        <StatCard number="<100ms" label="Response Time" />
                        <StatCard number="∞" label="Scalability" />
                        <StatCard number="24/7" label="Support" />
                    </div>
                </div>
            </section>
        </div>
    )
}

interface FeatureCardProps {
    icon: string
    title: string
    description: string
    delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
    return (
        <motion.div
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </motion.div>
    )
}

interface StatCardProps {
    number: string
    label: string
}

function StatCard({ number, label }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-number text-gradient">{number}</div>
            <div className="stat-label">{label}</div>
        </div>
    )
}
