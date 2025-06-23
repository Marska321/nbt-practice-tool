// Analytics and Progress Tracking Module
class AnalyticsManager {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.sessionData = {
            startTime: null,
            endTime: null,
            questionsAnswered: 0,
            correctAnswers: 0,
            timeSpent: 0,
            questionTypes: {},
            difficulty: {}
        };
    }

    initialize(user, database) {
        this.currentUser = user;
        this.db = database;
        this.startSession();
    }

    startSession() {
        this.sessionData = {
            startTime: new Date(),
            endTime: null,
            questionsAnswered: 0,
            correctAnswers: 0,
            timeSpent: 0,
            questionTypes: {
                'Academic Literacy': { attempted: 0, correct: 0 },
                'Quantitative Literacy': { attempted: 0, correct: 0 }
            },
            difficulty: {
                'Easy': { attempted: 0, correct: 0 },
                'Medium': { attempted: 0, correct: 0 },
                'Hard': { attempted: 0, correct: 0 }
            }
        };
    }

    recordQuestionAnswer(question, userAnswer, isCorrect, timeSpent) {
        this.sessionData.questionsAnswered++;
        if (isCorrect) {
            this.sessionData.correctAnswers++;
        }
        this.sessionData.timeSpent += timeSpent;

        // Track by question type
        const questionType = question.type;
        if (this.sessionData.questionTypes[questionType]) {
            this.sessionData.questionTypes[questionType].attempted++;
            if (isCorrect) {
                this.sessionData.questionTypes[questionType].correct++;
            }
        }

        // Track by difficulty (if available)
        const difficulty = question.difficulty || 'Medium';
        if (this.sessionData.difficulty[difficulty]) {
            this.sessionData.difficulty[difficulty].attempted++;
            if (isCorrect) {
                this.sessionData.difficulty[difficulty].correct++;
            }
        }

        // Store detailed question data
        const questionData = {
            questionId: question.id,
            questionType: question.type,
            difficulty: difficulty,
            userAnswer: userAnswer,
            correctAnswer: question.correct,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            timestamp: new Date()
        };

        this.saveQuestionData(questionData);
    }

    async saveQuestionData(questionData) {
        if (!this.currentUser || !this.db) return;

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const questionsRef = userRef.collection('questions');
            
            await questionsRef.add(questionData);
        } catch (error) {
            console.error('Error saving question data:', error);
        }
    }

    async endSession() {
        this.sessionData.endTime = new Date();
        this.sessionData.totalSessionTime = this.sessionData.endTime - this.sessionData.startTime;

        if (!this.currentUser || !this.db) return;

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const sessionsRef = userRef.collection('sessions');
            
            await sessionsRef.add({
                ...this.sessionData,
                accuracy: this.sessionData.questionsAnswered > 0 ? 
                    (this.sessionData.correctAnswers / this.sessionData.questionsAnswered) * 100 : 0
            });

            // Update user's overall statistics
            await this.updateUserStats();
        } catch (error) {
            console.error('Error saving session data:', error);
        }
    }

    async updateUserStats() {
        if (!this.currentUser || !this.db) return;

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};

            const stats = userData.stats || {
                totalSessions: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                totalTimeSpent: 0,
                averageAccuracy: 0,
                strongestType: null,
                weakestType: null,
                lastActivity: null
            };

            // Update totals
            stats.totalSessions++;
            stats.totalQuestions += this.sessionData.questionsAnswered;
            stats.totalCorrect += this.sessionData.correctAnswers;
            stats.totalTimeSpent += this.sessionData.timeSpent;
            stats.averageAccuracy = (stats.totalCorrect / stats.totalQuestions) * 100;
            stats.lastActivity = new Date();

            // Calculate strongest and weakest types
            const typeAccuracies = {};
            Object.keys(this.sessionData.questionTypes).forEach(type => {
                const data = this.sessionData.questionTypes[type];
                if (data.attempted > 0) {
                    typeAccuracies[type] = (data.correct / data.attempted) * 100;
                }
            });

            if (Object.keys(typeAccuracies).length > 0) {
                stats.strongestType = Object.keys(typeAccuracies).reduce((a, b) => 
                    typeAccuracies[a] > typeAccuracies[b] ? a : b);
                stats.weakestType = Object.keys(typeAccuracies).reduce((a, b) => 
                    typeAccuracies[a] < typeAccuracies[b] ? a : b);
            }

            await userRef.update({ stats });
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }

    async getUserStats() {
        if (!this.currentUser || !this.db) return null;

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};
            return userData.stats || null;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
    }

    async getRecentSessions(limit = 10) {
        if (!this.currentUser || !this.db) return [];

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const sessionsRef = userRef.collection('sessions');
            
            const snapshot = await sessionsRef
                .orderBy('startTime', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching recent sessions:', error);
            return [];
        }
    }

    async getDetailedAnalytics(days = 30) {
        if (!this.currentUser || !this.db) return null;

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const sessionsRef = userRef.collection('sessions');
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const snapshot = await sessionsRef
                .where('startTime', '>=', cutoffDate)
                .orderBy('startTime', 'desc')
                .get();

            const sessions = snapshot.docs.map(doc => doc.data());
            
            return this.calculateDetailedMetrics(sessions);
        } catch (error) {
            console.error('Error fetching detailed analytics:', error);
            return null;
        }
    }

    calculateDetailedMetrics(sessions) {
        if (sessions.length === 0) return null;

        const metrics = {
            totalSessions: sessions.length,
            totalQuestions: 0,
            totalCorrect: 0,
            totalTimeSpent: 0,
            averageAccuracy: 0,
            averageTimePerQuestion: 0,
            progressTrend: 'stable',
            typePerformance: {},
            difficultyPerformance: {},
            dailyActivity: {},
            streaks: {
                current: 0,
                longest: 0
            }
        };

        // Calculate basic metrics
        sessions.forEach(session => {
            metrics.totalQuestions += session.questionsAnswered || 0;
            metrics.totalCorrect += session.correctAnswers || 0;
            metrics.totalTimeSpent += session.timeSpent || 0;

            // Daily activity
            const dateKey = new Date(session.startTime.toDate()).toDateString();
            if (!metrics.dailyActivity[dateKey]) {
                metrics.dailyActivity[dateKey] = {
                    sessions: 0,
                    questions: 0,
                    accuracy: 0
                };
            }
            metrics.dailyActivity[dateKey].sessions++;
            metrics.dailyActivity[dateKey].questions += session.questionsAnswered || 0;

            // Question type performance
            Object.keys(session.questionTypes || {}).forEach(type => {
                if (!metrics.typePerformance[type]) {
                    metrics.typePerformance[type] = { attempted: 0, correct: 0, accuracy: 0 };
                }
                metrics.typePerformance[type].attempted += session.questionTypes[type].attempted || 0;
                metrics.typePerformance[type].correct += session.questionTypes[type].correct || 0;
            });

            // Difficulty performance
            Object.keys(session.difficulty || {}).forEach(diff => {
                if (!metrics.difficultyPerformance[diff]) {
                    metrics.difficultyPerformance[diff] = { attempted: 0, correct: 0, accuracy: 0 };
                }
                metrics.difficultyPerformance[diff].attempted += session.difficulty[diff].attempted || 0;
                metrics.difficultyPerformance[diff].correct += session.difficulty[diff].correct || 0;
            });
        });

        // Calculate derived metrics
        metrics.averageAccuracy = metrics.totalQuestions > 0 ? 
            (metrics.totalCorrect / metrics.totalQuestions) * 100 : 0;
        metrics.averageTimePerQuestion = metrics.totalQuestions > 0 ? 
            metrics.totalTimeSpent / metrics.totalQuestions : 0;

        // Calculate accuracy for each type and difficulty
        Object.keys(metrics.typePerformance).forEach(type => {
            const performance = metrics.typePerformance[type];
            performance.accuracy = performance.attempted > 0 ? 
                (performance.correct / performance.attempted) * 100 : 0;
        });

        Object.keys(metrics.difficultyPerformance).forEach(diff => {
            const performance = metrics.difficultyPerformance[diff];
            performance.accuracy = performance.attempted > 0 ? 
                (performance.correct / performance.attempted) * 100 : 0;
        });

        // Calculate progress trend (compare first and second half of sessions)
        if (sessions.length >= 4) {
            const firstHalf = sessions.slice(Math.floor(sessions.length / 2));
            const secondHalf = sessions.slice(0, Math.floor(sessions.length / 2));
            
            const firstHalfAccuracy = this.calculateAverageAccuracy(firstHalf);
            const secondHalfAccuracy = this.calculateAverageAccuracy(secondHalf);
            
            if (secondHalfAccuracy > firstHalfAccuracy + 5) {
                metrics.progressTrend = 'improving';
            } else if (secondHalfAccuracy < firstHalfAccuracy - 5) {
                metrics.progressTrend = 'declining';
            } else {
                metrics.progressTrend = 'stable';
            }
        }

        return metrics;
    }

    calculateAverageAccuracy(sessions) {
        if (sessions.length === 0) return 0;
        
        let totalQuestions = 0;
        let totalCorrect = 0;
        
        sessions.forEach(session => {
            totalQuestions += session.questionsAnswered || 0;
            totalCorrect += session.correctAnswers || 0;
        });
        
        return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    }

    generateRecommendations(analytics) {
        if (!analytics) return [];

        const recommendations = [];

        // Performance-based recommendations
        if (analytics.averageAccuracy < 60) {
            recommendations.push({
                type: 'improvement',
                title: 'Focus on Fundamentals',
                description: 'Your accuracy is below 60%. Consider reviewing basic concepts and taking more time per question.',
                action: 'Practice more frequently with mixed question types'
            });
        }

        // Type-specific recommendations
        Object.keys(analytics.typePerformance).forEach(type => {
            const performance = analytics.typePerformance[type];
            if (performance.accuracy < 50 && performance.attempted > 5) {
                recommendations.push({
                    type: 'focus',
                    title: `Improve ${type} Skills`,
                    description: `Your ${type} accuracy is ${performance.accuracy.toFixed(1)}%. This area needs attention.`,
                    action: `Focus on ${type} practice sessions`
                });
            }
        });

        // Time-based recommendations
        if (analytics.averageTimePerQuestion > 120) { // 2 minutes per question
            recommendations.push({
                type: 'efficiency',
                title: 'Work on Speed',
                description: 'You\'re spending more than 2 minutes per question on average. Practice time management.',
                action: 'Set time limits during practice sessions'
            });
        }

        // Progress trend recommendations
        if (analytics.progressTrend === 'declining') {
            recommendations.push({
                type: 'motivation',
                title: 'Maintain Momentum',
                description: 'Your recent performance shows a declining trend. Take a break and return with fresh focus.',
                action: 'Review your study methods and consider varying question types'
            });
        } else if (analytics.progressTrend === 'improving') {
            recommendations.push({
                type: 'encouragement',
                title: 'Great Progress!',
                description: 'Your performance is improving consistently. Keep up the excellent work!',
                action: 'Continue your current study routine'
            });
        }

        return recommendations;
    }
}

// Export for use in other modules
window.analyticsManager = new AnalyticsManager();