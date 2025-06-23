// Question Bank for NBT AQL Practice
const questionBank = {
    academic: [
        {
            id: 'acad_1',
            type: 'Academic Literacy',
            difficulty: 'Medium',
            passage: `The concept of sustainable development has evolved significantly since its introduction in the 1980s. Initially focused on environmental conservation, it now encompasses economic viability and social equity. This triple bottom line approach recognizes that true sustainability cannot be achieved without addressing all three dimensions simultaneously.

Recent studies suggest that companies adopting sustainable practices often experience improved financial performance in the long term. However, the initial investment required for sustainable technologies and processes can be substantial, creating a barrier for smaller organizations.`,
            question: 'According to the passage, what is the main challenge for smaller organizations in adopting sustainable practices?',
            options: [
                'Lack of understanding of environmental issues',
                'The substantial initial investment required',
                'Absence of government regulations',
                'Limited access to sustainable technologies'
            ],
            correct: 1,
            explanation: 'The passage explicitly states that "the initial investment required for sustainable technologies and processes can be substantial, creating a barrier for smaller organizations."'
        },
        {
            id: 'acad_2',
            type: 'Academic Literacy',
            difficulty: 'Easy',
            passage: `Digital literacy has become as fundamental as traditional literacy in the 21st century. It encompasses not only the ability to use digital devices and software but also the critical thinking skills needed to evaluate online information. The proliferation of misinformation and fake news has made these evaluation skills increasingly important.

Educational institutions worldwide are grappling with how to integrate digital literacy into their curricula effectively. Some argue for dedicated courses, while others advocate for embedding these skills across all subjects.`,
            question: 'What does the passage suggest about the current state of digital literacy education?',
            options: [
                'All schools have successfully integrated digital literacy',
                'There is universal agreement on the best teaching methods',
                'Educational institutions are struggling with implementation approaches',
                'Digital literacy is only taught through dedicated courses'
            ],
            correct: 2,
            explanation: 'The passage states that "Educational institutions worldwide are grappling with how to integrate digital literacy into their curricula effectively," indicating they are struggling with implementation approaches.'
        },
        {
            id: 'acad_3',
            type: 'Academic Literacy',
            difficulty: 'Hard',
            passage: `The phenomenon of urbanization has accelerated dramatically over the past century. In 1900, approximately 13% of the world\'s population lived in cities. By 2020, this figure had risen to over 56%, and projections suggest it will reach 68% by 2050.

This rapid urban growth presents both opportunities and challenges. Cities often serve as engines of economic growth and innovation, providing better access to education, healthcare, and employment. However, unplanned urbanization can lead to overcrowding, inadequate infrastructure, and environmental degradation.`,
            question: 'Based on the passage, what can be inferred about the relationship between urbanization and development?',
            options: [
                'Urbanization always leads to positive outcomes',
                'Cities provide benefits but require careful planning',
                'Rural areas are becoming completely abandoned',
                'Urban growth will stop after 2050'
            ],
            correct: 1,
            explanation: 'The passage presents both the opportunities (economic growth, better access to services) and challenges (overcrowding, infrastructure issues) of urbanization, suggesting that cities provide benefits but require careful planning.'
        }
    ],
    quantitative: [
        {
            id: 'quant_1',
            type: 'Quantitative Literacy',
            difficulty: 'Easy',
            question: 'A research study found that 65% of 800 students prefer online learning. If the margin of error is ±3%, what is the range for the actual percentage of students who prefer online learning?',
            options: [
                '62% to 68%',
                '60% to 70%',
                '65% to 68%',
                '62% to 65%'
            ],
            correct: 0,
            explanation: 'With a margin of error of ±3%, the range is 65% - 3% = 62% to 65% + 3% = 68%.'
        },
        {
            id: 'quant_2',
            type: 'Quantitative Literacy',
            difficulty: 'Hard',
            question: 'A graph shows that Company A\'s profits increased from R2 million to R3.2 million over 3 years. What was the average annual percentage increase?',
            options: [
                '15%',
                '20%',
                '18%',
                '22%'
            ],
            correct: 1,
            explanation: 'The total increase is (3.2 - 2)/2 = 0.6/2 = 0.3 = 30% over 3 years. Average annual increase = 30%/3 = 10%. However, for compound growth: (3.2/2)^(1/3) - 1 ≈ 0.2 = 20%.'
        },
        {
            id: 'quant_3',
            type: 'Quantitative Literacy',
            difficulty: 'Medium',
            question: 'In a survey of 500 people, 40% support Policy A, 35% support Policy B, and 25% are undecided. If 50 undecided people change to support Policy A, what percentage now supports Policy A?',
            options: [
                '45%',
                '50%',
                '48%',
                '52%'
            ],
            correct: 1,
            explanation: 'Initially: 40% of 500 = 200 people support Policy A. After 50 undecided people switch: 200 + 50 = 250 people. Percentage = 250/500 = 50%.'
        },
        {
            id: 'quant_4',
            type: 'Quantitative Literacy',
            difficulty: 'Easy',
            question: 'A bar chart shows smartphone usage by age group. If 18-25 year-olds use smartphones 8 hours daily and 26-35 year-olds use them 6 hours daily, and there are equal numbers in each group, what is the average daily usage across both groups?',
            options: [
                '6 hours',
                '7 hours',
                '7.5 hours',
                '8 hours'
            ],
            correct: 1,
            explanation: 'With equal numbers in each group, the average is (8 + 6)/2 = 14/2 = 7 hours.'
        }
    ]
};

// Question Generator Class
class QuestionGenerator {
    constructor() {
        this.usedQuestions = new Set();
    }

    generatePracticeTest(isPremium, testLength = null) {
        const academicQuestions = [...questionBank.academic];
        const quantitativeQuestions = [...questionBank.quantitative];
        
        // Shuffle arrays
        this.shuffleArray(academicQuestions);
        this.shuffleArray(quantitativeQuestions);
        
        let selectedQuestions = [];
        
        if (isPremium) {
            // Premium users get custom test length or default 10 questions
            const totalQuestions = testLength || 10;
            const academicCount = Math.ceil(totalQuestions / 2);
            const quantCount = totalQuestions - academicCount;
            
            selectedQuestions = [
                ...academicQuestions.slice(0, academicCount),
                ...quantitativeQuestions.slice(0, quantCount)
            ];
        } else {
            // Free users get 3 questions max (2 academic, 1 quantitative)
            selectedQuestions = [
                ...academicQuestions.slice(0, 2),
                ...quantitativeQuestions.slice(0, 1)
            ];
        }
        
        // Shuffle the final selection
        this.shuffleArray(selectedQuestions);
        return selectedQuestions;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getRandomQuestion(type = null) {
        let availableQuestions = [];
        
        if (type === 'academic') {
            availableQuestions = questionBank.academic;
        } else if (type === 'quantitative') {
            availableQuestions = questionBank.quantitative;
        } else {
            availableQuestions = [...questionBank.academic, ...questionBank.quantitative];
        }
        
        // Filter out used questions
        const unusedQuestions = availableQuestions.filter(q => !this.usedQuestions.has(q.id));
        
        if (unusedQuestions.length === 0) {
            // Reset if all questions have been used
            this.usedQuestions.clear();
            return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        }
        
        const selected = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
        this.usedQuestions.add(selected.id);
        return selected;
    }

    resetUsedQuestions() {
        this.usedQuestions.clear();
    }
}

// Export question generator
window.questionGenerator = new QuestionGenerator();
