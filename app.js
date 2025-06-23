// Main Application Class
class NBTPracticeApp {
    constructor() {
        this.currentTest = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.isPracticeActive = false;
        this.score = 0;
        this.isLoggedIn = false;
        this.isPremium = false;
        this.questionStartTime = null;
        
        // DOM elements
        this.questionContainer = document.getElementById('questionContainer');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.progressFill = document.getElementById('progressFill');
        this.actionButtons = document.getElementById('actionButtons');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.loadingSubtitle = document.getElementById('loadingSubtitle');
        
        // Motivational messages
        this.motivationalMessages = [
            {
                message: "Excellence is a habit, not an act",
                subtitle: "You're building the skills for NBT success!"
            },
            {
                message: "Every expert was once a beginner",
                subtitle: "Your journey to mastery continues with each question"
            },
            {
                message: "Success is where preparation meets opportunity",
                subtitle: "You're preparing for your NBT breakthrough!"
            },
            {
                message: "The only way to do great work is to love what you learn",
                subtitle: "Embrace the challenge and grow stronger"
            },
            {
                message: "Champions are made in practice",
                subtitle: "Every question makes you more confident"
            },
            {
                message: "Progress, not perfection",
                subtitle: "Each attempt teaches you something valuable"
            },
            {
                message: "Your potential is endless",
                subtitle: "Keep pushing forward to unlock your best self"
            },
            {
                message: "Learning is the key to unlocking your future",
                subtitle: "You're investing in your academic success"
            },
            {
                message: "Believe in yourself and your abilities",
                subtitle: "You have everything it takes to succeed"
            },
            {
                message: "Small steps lead to big achievements",
                subtitle: "You're closer to your NBT goals than you think"
            }
        ];
        
        this.initialize();
    }

    initialize() {
        this.showWelcomeMessage();
        this.renderActionButtons();
    }

    showLoadingAnimation() {
        const randomMessage = this.motivationalMessages[Math.floor(Math.random() * this.motivationalMessages.length)];
        this.loadingMessage.textContent = randomMessage.message;
        this.loadingSubtitle.textContent = randomMessage.subtitle;
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoadingAnimation() {
        this.loadingOverlay.style.display = 'none';
    }

    onUserLogin(user, isPremium) {
        this.isLoggedIn = true;
        this.isPremium = isPremium;
        
        // Initialize analytics for the user
        if (window.analyticsManager) {
            window.analyticsManager.initialize(user, db);
        }
        
        this.renderActionButtons();
        this.showWelcomeMessage();
    }

    onUserLogout() {
        this.isLoggedIn = false;
        this.isPremium = false;
        this.stopPractice();
        this.renderActionButtons();
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        if (!this.isLoggedIn) {
            this.questionContainer.innerHTML = `
                <div class="question-card">
                    <h2>Welcome to NBT AQL Practice</h2>
                    <p>Practice Academic and Quantitative Literacy questions to prepare for the National Benchmark Test (NBT).</p>
                    <p><strong>Sign in to start practicing!</strong></p>
                    <ul style="margin: 20px 0; text-align: left;">
                        <li>✓ Academic Literacy practice questions</li>
                        <li>✓ Quantitative Literacy practice questions</li>
                        <li>✓ Detailed explanations for each answer</li>
                        <li>✓ Progress tracking</li>
                    </ul>
                </div>`;
            return;
        }

        this.questionContainer.innerHTML = `
            <div class="question-card">
                <h2>Ready to Practice!</h2>
                <p>Choose your practice mode:</p>
                <div style="margin: 20px 0;">
                    <p><strong>Available Modes:</strong></p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>📚 <strong>Academic Literacy:</strong> Reading comprehension and analysis</li>
                        <li>🔢 <strong>Quantitative Literacy:</strong> Mathematical reasoning and data interpretation</li>
                        <li>🎯 <strong>Mixed Practice:</strong> Combination of both question types</li>
                    </ul>
                </div>
                ${this.isPremium ? 
                    '<p style="color: #16a34a; font-weight: 600;">✨ Premium features unlocked! Enjoy unlimited questions and custom test lengths.</p>' :
                    '<p style="color: #9ca3af;">Free tier: Limited to 3 questions per session. <button class="btn btn-upgrade" onclick="app.showUpgradeInfo()">Upgrade to Premium</button></p>'
                }
            </div>`;
    }

    renderActionButtons() {
        if (!this.isLoggedIn) {
            this.actionButtons.innerHTML = '';
            return;
        }

        if (this.isPracticeActive) {
            this.actionButtons.innerHTML = `
                <button class="btn btn-secondary" onclick="app.stopPractice()">Stop Practice</button>`;
        } else {
            this.actionButtons.innerHTML = `
                <button class="btn" onclick="app.startPractice('mixed')">Mixed Practice</button>
                <button class="btn btn-secondary" onclick="app.startPractice('academic')">Academic Only</button>
                <button class="btn btn-secondary" onclick="app.startPractice('quantitative')">Quantitative Only</button>
                ${this.isPremium ? '<button class="btn btn-premium" onclick="app.startCustomTest()">Custom Test</button>' : ''}
                <button class="btn btn-secondary" onclick="analyticsDashboard.showDashboard()">📊 My Analytics</button>`;
        }
    }

    startPractice(type = 'mixed') {
        if (!this.isLoggedIn) {
            alert('Please sign in to start practicing');
            return;
        }

        // Show loading animation when starting practice
        this.showLoadingAnimation();
        
        setTimeout(() => {
            this.isPracticeActive = true;
            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            this.score = 0;
            this.questionStartTime = new Date();
            
            // Start analytics session
            if (window.analyticsManager) {
                window.analyticsManager.startSession();
            }
            
            // Generate test based on user type and preferences
            this.currentTest = window.questionGenerator.generatePracticeTest(this.isPremium);
            
            if (type !== 'mixed') {
                // Filter for specific question type
                this.currentTest = this.currentTest.filter(q => 
                    type === 'academic' ? q.type === 'Academic Literacy' : q.type === 'Quantitative Literacy'
                );
                
                // Ensure we have questions of the requested type
                if (this.currentTest.length === 0) {
                    const question = window.questionGenerator.getRandomQuestion(type);
                    this.currentTest = [question];
                }
            }

            this.hideLoadingAnimation();
            this.renderActionButtons();
            this.displayQuestion();
            this.updateProgress();
            this.updateScore();
        }, 2000); // Show loading for 2 seconds when starting
    }

    startCustomTest() {
        if (!this.isPremium) {
            this.showUpgradeInfo();
            return;
        }

        const length = prompt("How many questions would you like? (5-50)", "20");
        if (length && !isNaN(length) && length >= 5 && length <= 50) {
            // Show loading animation for custom test
            this.showLoadingAnimation();
            
            setTimeout(() => {
                this.isPracticeActive = true;
                this.currentQuestionIndex = 0;
                this.userAnswers = [];
                this.score = 0;
                this.questionStartTime = new Date();
                
                // Start analytics session
                if (window.analyticsManager) {
                    window.analyticsManager.startSession();
                }
                
                this.currentTest = window.questionGenerator.generatePracticeTest(true, parseInt(length));
                
                this.hideLoadingAnimation();
                this.renderActionButtons();
                this.displayQuestion();
                this.updateProgress();
                this.updateScore();
            }, 2000);
        } else {
            alert("Please enter a valid number between 5 and 50.");
        }
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.currentTest.length) {
            this.showResults();
            return;
        }

        // Record time for new question
        this.questionStartTime = new Date();

        const question = this.currentTest[this.currentQuestionIndex];
        const isAnswered = this.userAnswers[this.currentQuestionIndex] !== undefined;
        
        let html = `
            <div class="question-card">
                <div class="question-type">${question.type}</div>
                <div class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.currentTest.length}</div>
                
                ${question.passage ? `<div class="passage">${question.passage}</div>` : ''}
                
                <div class="question-text">${question.question}</div>
                
                <div class="options">`;

        question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            let optionClass = 'option';
            
            if (isAnswered) {
                const userAnswer = this.userAnswers[this.currentQuestionIndex];
                if (index === userAnswer) {
                    optionClass += ' selected';
                }
                if (index === question.correct) {
                    optionClass += ' correct';
                } else if (index === userAnswer && index !== question.correct) {
                    optionClass += ' incorrect';
                }
            }
            
            html += `
                <div class="${optionClass}" onclick="${isAnswered ? '' : `app.selectAnswer(${index})`}">
                    <div class="option-letter">${letter}</div>
                    <div>${option}</div>
                </div>`;
        });

        html += `</div>`;

        if (isAnswered) {
            html += `
                <div class="explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    ${this.currentQuestionIndex < this.currentTest.length - 1 ? 
                        '<button class="btn" onclick="app.nextQuestion()">Next Question</button>' :
                        '<button class="btn" onclick="app.showResults()">View Results</button>'
                    }
                </div>`;
        }

        html += `</div>`;
        
        this.questionContainer.innerHTML = html;
    }

    selectAnswer(answerIndex) {
        const question = this.currentTest[this.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;
        const timeSpent = this.questionStartTime ? (new Date() - this.questionStartTime) / 1000 : 0;
        
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
        
        // Check if answer is correct
        if (isCorrect) {
            this.score++;
        }
        
        // Record analytics data
        if (window.analyticsManager) {
            window.analyticsManager.recordQuestionAnswer(question, answerIndex, isCorrect, timeSpent);
        }
        
        this.updateScore();
        this.displayQuestion();
    }

    nextQuestion() {
        // Show loading animation before next question
        this.showLoadingAnimation();
        
        setTimeout(() => {
            this.hideLoadingAnimation();
            this.currentQuestionIndex++;
            this.updateProgress();
            this.displayQuestion();
        }, 1500); // Show loading for 1.5 seconds
    }

    async showResults() {
        // End analytics session
        if (window.analyticsManager) {
            await window.analyticsManager.endSession();
        }
        
        const percentage = Math.round((this.score / this.currentTest.length) * 100);
        let performance = '';
        
        if (percentage >= 80) {
            performance = 'Excellent!';
        } else if (percentage >= 60) {
            performance = 'Good work!';
        } else if (percentage >= 40) {
            performance = 'Keep practicing!';
        } else {
            performance = 'More practice needed';
        }

        this.questionContainer.innerHTML = `
            <div class="question-card">
                <h2>Practice Complete!</h2>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 3rem; margin: 20px 0;">${percentage}%</div>
                    <div style="font-size: 1.5rem; margin: 10px 0;">${performance}</div>
                    <div style="font-size: 1.1rem; color: #6b7280;">
                        You got ${this.score} out of ${this.currentTest.length} questions correct
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3>Question Breakdown:</h3>
                    <div style="text-align: left; margin: 10px 0;">
                        ${this.generateQuestionBreakdown()}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn" onclick="app.startPractice('mixed')">Practice Again</button>
                    <button class="btn btn-secondary" onclick="app.stopPractice()">Back to Menu</button>
                    <button class="btn btn-secondary" onclick="analyticsDashboard.showDashboard()">View Analytics</button>
                </div>
            </div>`;
        
        this.isPracticeActive = false;
        this.renderActionButtons();
    }

    generateQuestionBreakdown() {
        let breakdown = '';
        this.currentTest.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            const icon = isCorrect ? '✅' : '❌';
            breakdown += `<div>${icon} Question ${index + 1}: ${question.type}</div>`;
        });
        return breakdown;
    }

    async stopPractice() {
        // End analytics session if practice was active
        if (this.isPracticeActive && window.analyticsManager) {
            await window.analyticsManager.endSession();
        }
        
        this.isPracticeActive = false;
        this.currentTest = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.questionStartTime = null;
        
        this.updateProgress();
        this.updateScore();
        this.renderActionButtons();
        this.showWelcomeMessage();
    }

    updateProgress() {
        if (this.currentTest.length === 0) {
            this.progressFill.style.width = '0%';
            return;
        }
        
        const progress = (this.currentQuestionIndex / this.currentTest.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateScore() {
        if (!this.isPracticeActive) {
            this.scoreDisplay.innerHTML = '';
            return;
        }
        
        this.scoreDisplay.innerHTML = `Score: ${this.score}/${this.userAnswers.length} | Progress: ${this.currentQuestionIndex}/${this.currentTest.length}`;
    }

    showUpgradeInfo() {
        this.questionContainer.innerHTML = `
            <div class="question-card">
                <h2>Upgrade to Premium</h2>
                <p>Unlock the full potential of your NBT preparation!</p>
                
                <div style="margin: 20px 0;">
                    <h3>Premium Features:</h3>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>✨ Custom test lengths (5-50 questions)</li>
                        <li>📊 Advanced analytics dashboard</li>
                        <li>📈 Detailed performance tracking</li>
                        <li>🎯 Subject-specific practice modes</li>
                        <li>💾 Progress saving and history</li>
                        <li>🚀 Personalized recommendations</li>
                    </ul>
                </div>
                
                <div style="color: #6b7280; margin: 15px 0;">
                    <strong>Free Tier:</strong>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>5 questions per practice session</li>
                        <li>Basic analytics overview</li>
                        <li>Standard question types</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-premium" onclick="alert('Premium upgrade coming soon! Contact support for early access.')">
                        Upgrade Now
                    </button>
                    <button class="btn btn-secondary" onclick="app.showWelcomeMessage()">
                        Continue with Free
                    </button>
                </div>
            </div>`;
    }
}

// Initialize the application
window.app = new NBTPracticeApp();
 
