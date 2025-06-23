// Analytics Dashboard UI Module
class AnalyticsDashboard {
    constructor() {
        this.isVisible = false;
        this.currentView = 'overview';
    }

    async showDashboard() {
        this.isVisible = true;
        const analytics = await window.analyticsManager.getDetailedAnalytics(30);
        const userStats = await window.analyticsManager.getUserStats();
        
        if (!analytics && !userStats) {
            this.showNoDataMessage();
            return;
        }

        this.renderDashboard(analytics, userStats);
    }

    hideDashboard() {
        this.isVisible = false;
        const container = document.getElementById('questionContainer');
        container.innerHTML = '';
        if (window.app) {
            window.app.showWelcomeMessage();
        }
    }

    showNoDataMessage() {
        const container = document.getElementById('questionContainer');
        container.innerHTML = `
            <div class="question-card">
                <h2>📊 Analytics Dashboard</h2>
                <div class="no-data-message">
                    <p>No practice data available yet.</p>
                    <p>Complete some practice sessions to see your detailed analytics and progress reports!</p>
                    <div style="margin-top: 20px;">
                        <button class="btn" onclick="analyticsDashboard.hideDashboard()">Start Practicing</button>
                    </div>
                </div>
            </div>`;
    }

    renderDashboard(analytics, userStats) {
        const container = document.getElementById('questionContainer');
        
        container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="dashboard-header">
                    <h2>📊 Analytics Dashboard</h2>
                    <div class="dashboard-nav">
                        <button class="nav-btn ${this.currentView === 'overview' ? 'active' : ''}" 
                                onclick="analyticsDashboard.switchView('overview')">Overview</button>
                        <button class="nav-btn ${this.currentView === 'performance' ? 'active' : ''}" 
                                onclick="analyticsDashboard.switchView('performance')">Performance</button>
                        <button class="nav-btn ${this.currentView === 'progress' ? 'active' : ''}" 
                                onclick="analyticsDashboard.switchView('progress')">Progress</button>
                        <button class="nav-btn ${this.currentView === 'recommendations' ? 'active' : ''}" 
                                onclick="analyticsDashboard.switchView('recommendations')">Tips</button>
                    </div>
                    <button class="btn btn-secondary" onclick="analyticsDashboard.hideDashboard()">Back to Practice</button>
                </div>
                
                <div class="dashboard-content" id="dashboardContent">
                    ${this.renderCurrentView(analytics, userStats)}
                </div>
            </div>`;
    }

    renderCurrentView(analytics, userStats) {
        switch (this.currentView) {
            case 'overview':
                return this.renderOverview(analytics, userStats);
            case 'performance':
                return this.renderPerformance(analytics);
            case 'progress':
                return this.renderProgress(analytics);
            case 'recommendations':
                return this.renderRecommendations(analytics);
            default:
                return this.renderOverview(analytics, userStats);
        }
    }

    renderOverview(analytics, userStats) {
        if (!analytics || !userStats) {
            return '<div class="no-data">No data available</div>';
        }

        const progressIcon = analytics.progressTrend === 'improving' ? '📈' : 
                           analytics.progressTrend === 'declining' ? '📉' : '📊';

        return `
            <div class="overview-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Total Sessions</h3>
                        <span class="stat-icon">🎯</span>
                    </div>
                    <div class="stat-value">${userStats.totalSessions || 0}</div>
                    <div class="stat-detail">Practice sessions completed</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Overall Accuracy</h3>
                        <span class="stat-icon">🎖️</span>
                    </div>
                    <div class="stat-value">${(userStats.averageAccuracy || 0).toFixed(1)}%</div>
                    <div class="stat-detail">Across all questions</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Questions Answered</h3>
                        <span class="stat-icon">📝</span>
                    </div>
                    <div class="stat-value">${userStats.totalQuestions || 0}</div>
                    <div class="stat-detail">${userStats.totalCorrect || 0} correct answers</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Progress Trend</h3>
                        <span class="stat-icon">${progressIcon}</span>
                    </div>
                    <div class="stat-value">${analytics.progressTrend}</div>
                    <div class="stat-detail">Last 30 days</div>
                </div>

                <div class="stat-card full-width">
                    <div class="stat-header">
                        <h3>Subject Performance</h3>
                        <span class="stat-icon">📊</span>
                    </div>
                    <div class="subject-breakdown">
                        ${this.renderSubjectBreakdown(analytics.typePerformance)}
                    </div>
                </div>

                <div class="stat-card full-width">
                    <div class="stat-header">
                        <h3>Study Time</h3>
                        <span class="stat-icon">⏱️</span>
                    </div>
                    <div class="time-stats">
                        <div class="time-stat">
                            <span class="time-label">Total Time:</span>
                            <span class="time-value">${this.formatTime(userStats.totalTimeSpent || 0)}</span>
                        </div>
                        <div class="time-stat">
                            <span class="time-label">Avg per Question:</span>
                            <span class="time-value">${this.formatTime(analytics.averageTimePerQuestion || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderPerformance(analytics) {
        if (!analytics) {
            return '<div class="no-data">No performance data available</div>';
        }

        return `
            <div class="performance-section">
                <div class="performance-grid">
                    <div class="performance-card">
                        <h3>Question Type Performance</h3>
                        <div class="performance-breakdown">
                            ${Object.keys(analytics.typePerformance).map(type => {
                                const perf = analytics.typePerformance[type];
                                const accuracy = perf.accuracy || 0;
                                const color = accuracy >= 70 ? '#16a34a' : accuracy >= 50 ? '#f59e0b' : '#dc2626';
                                
                                return `
                                    <div class="performance-item">
                                        <div class="performance-label">${type}</div>
                                        <div class="performance-bar">
                                            <div class="performance-fill" style="width: ${accuracy}%; background-color: ${color}"></div>
                                        </div>
                                        <div class="performance-stats">
                                            <span class="accuracy">${accuracy.toFixed(1)}%</span>
                                            <span class="attempts">${perf.attempted} questions</span>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    </div>

                    <div class="performance-card">
                        <h3>Difficulty Level Performance</h3>
                        <div class="performance-breakdown">
                            ${Object.keys(analytics.difficultyPerformance).map(diff => {
                                const perf = analytics.difficultyPerformance[diff];
                                const accuracy = perf.accuracy || 0;
                                const color = accuracy >= 70 ? '#16a34a' : accuracy >= 50 ? '#f59e0b' : '#dc2626';
                                
                                return `
                                    <div class="performance-item">
                                        <div class="performance-label">${diff}</div>
                                        <div class="performance-bar">
                                            <div class="performance-fill" style="width: ${accuracy}%; background-color: ${color}"></div>
                                        </div>
                                        <div class="performance-stats">
                                            <span class="accuracy">${accuracy.toFixed(1)}%</span>
                                            <span class="attempts">${perf.attempted} questions</span>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="detailed-metrics">
                    <h3>Detailed Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Questions per Session:</span>
                            <span class="metric-value">${(analytics.totalQuestions / analytics.totalSessions).toFixed(1)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Average Session Time:</span>
                            <span class="metric-value">${this.formatTime(analytics.totalTimeSpent / analytics.totalSessions)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Improvement Rate:</span>
                            <span class="metric-value">${analytics.progressTrend}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderProgress(analytics) {
        if (!analytics) {
            return '<div class="no-data">No progress data available</div>';
        }

        const recentSessions = Object.keys(analytics.dailyActivity)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 14);

        return `
            <div class="progress-section">
                <div class="progress-chart">
                    <h3>Recent Activity (Last 14 Days)</h3>
                    <div class="activity-chart">
                        ${recentSessions.map(date => {
                            const activity = analytics.dailyActivity[date];
                            const height = Math.max((activity.sessions / 5) * 100, 10); // Scale to max 5 sessions
                            const accuracy = activity.questions > 0 ? 
                                ((activity.accuracy || 0) / activity.questions) * 100 : 0;
                            
                            return `
                                <div class="activity-bar" title="${date}: ${activity.sessions} sessions, ${activity.questions} questions">
                                    <div class="bar-fill" style="height: ${height}%; background-color: ${accuracy >= 70 ? '#16a34a' : accuracy >= 50 ? '#f59e0b' : '#dc2626'}"></div>
                                    <div class="bar-label">${new Date(date).getDate()}</div>
                                </div>`;
                        }).join('')}
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #16a34a"></div>
                            <span>High Performance (70%+)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #f59e0b"></div>
                            <span>Moderate Performance (50-69%)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #dc2626"></div>
                            <span>Needs Improvement (&lt;50%)</span>
                        </div>
                    </div>
                </div>

                <div class="milestones">
                    <h3>Achievements & Milestones</h3>
                    <div class="milestone-list">
                        ${this.generateMilestones(analytics)}
                    </div>
                </div>
            </div>`;
    }

    renderRecommendations(analytics) {
        if (!analytics) {
            return '<div class="no-data">No recommendations available</div>';
        }

        const recommendations = window.analyticsManager.generateRecommendations(analytics);

        return `
            <div class="recommendations-section">
                <h3>Personalized Study Recommendations</h3>
                <div class="recommendations-grid">
                    ${recommendations.length > 0 ? recommendations.map(rec => `
                        <div class="recommendation-card ${rec.type}">
                            <div class="rec-header">
                                <h4>${rec.title}</h4>
                                <span class="rec-type">${rec.type}</span>
                            </div>
                            <p class="rec-description">${rec.description}</p>
                            <div class="rec-action">
                                <strong>Action:</strong> ${rec.action}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="recommendation-card encouragement">
                            <div class="rec-header">
                                <h4>Keep Practicing!</h4>
                                <span class="rec-type">general</span>
                            </div>
                            <p class="rec-description">You're doing great! Continue practicing regularly to improve your NBT performance.</p>
                            <div class="rec-action">
                                <strong>Action:</strong> Maintain consistent practice sessions
                            </div>
                        </div>
                    `}
                </div>

                <div class="study-tips">
                    <h4>General Study Tips</h4>
                    <ul class="tips-list">
                        <li>Practice regularly for 15-30 minutes rather than long cramming sessions</li>
                        <li>Focus on your weaker question types to improve overall performance</li>
                        <li>Time yourself during practice to improve speed and efficiency</li>
                        <li>Review explanations for both correct and incorrect answers</li>
                        <li>Take breaks between study sessions to maintain focus</li>
                    </ul>
                </div>
            </div>`;
    }

    renderSubjectBreakdown(typePerformance) {
        return Object.keys(typePerformance).map(type => {
            const perf = typePerformance[type];
            const accuracy = perf.accuracy || 0;
            const status = accuracy >= 70 ? 'excellent' : accuracy >= 50 ? 'good' : 'needs-work';
            
            return `
                <div class="subject-item">
                    <div class="subject-name">${type}</div>
                    <div class="subject-accuracy ${status}">${accuracy.toFixed(1)}%</div>
                    <div class="subject-questions">${perf.attempted} questions</div>
                </div>`;
        }).join('');
    }

    generateMilestones(analytics) {
        const milestones = [];
        
        if (analytics.totalSessions >= 1) {
            milestones.push({ icon: '🎯', text: 'First practice session completed!', achieved: true });
        }
        if (analytics.totalSessions >= 5) {
            milestones.push({ icon: '🔥', text: '5 practice sessions completed', achieved: true });
        }
        if (analytics.totalSessions >= 10) {
            milestones.push({ icon: '⭐', text: '10 practice sessions milestone', achieved: true });
        }
        if (analytics.averageAccuracy >= 70) {
            milestones.push({ icon: '🏆', text: 'Achieved 70% average accuracy', achieved: true });
        }
        if (analytics.totalQuestions >= 50) {
            milestones.push({ icon: '📚', text: '50 questions answered', achieved: true });
        }
        if (analytics.totalQuestions >= 100) {
            milestones.push({ icon: '💯', text: '100 questions milestone reached', achieved: true });
        }

        // Future milestones
        if (analytics.totalSessions < 20) {
            milestones.push({ icon: '🎖️', text: 'Complete 20 practice sessions', achieved: false });
        }
        if (analytics.averageAccuracy < 80) {
            milestones.push({ icon: '🥇', text: 'Achieve 80% average accuracy', achieved: false });
        }

        return milestones.map(milestone => `
            <div class="milestone ${milestone.achieved ? 'achieved' : 'pending'}">
                <span class="milestone-icon">${milestone.icon}</span>
                <span class="milestone-text">${milestone.text}</span>
                ${milestone.achieved ? '<span class="milestone-status">✓</span>' : '<span class="milestone-status">○</span>'}
            </div>
        `).join('');
    }

    formatTime(seconds) {
        if (!seconds || seconds < 60) {
            return `${Math.round(seconds || 0)}s`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        
        if (minutes < 60) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }

    switchView(view) {
        this.currentView = view;
        this.showDashboard(); // Re-render with new view
    }
}

// Export for use in other modules
window.analyticsDashboard = new AnalyticsDashboard();