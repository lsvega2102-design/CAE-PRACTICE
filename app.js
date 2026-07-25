const app = {
    currentView: 'dashboard',
    currentExerciseType: null,
    currentExerciseData: null,
    currentPage: 1,
    itemsPerPage: 10,
    previousView: 'dashboard',
    
    init: function() {
        document.getElementById('home-btn').addEventListener('click', () => this.navigate('dashboard'));
    },

    navigate: function(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        if (viewId === 'dashboard') {
            document.getElementById('view-dashboard').classList.add('active');
            this.currentExerciseType = null;
        } else if (viewId === 'reading-hub') {
            document.getElementById('view-reading-hub').classList.add('active');
            this.currentExerciseType = null;
        } else {
            if (['part1', 'part2', 'part3', 'part4'].includes(viewId)) {
                this.previousView = 'reading-hub';
            } else {
                this.previousView = 'dashboard';
            }
            document.getElementById('view-exercise').classList.add('active');
            this.loadExercise(viewId);
        }
        
        this.clearFeedback();
    },

    goBack: function() {
        this.navigate(this.previousView || 'dashboard');
    },

    clearFeedback: function() {
        const fb = document.getElementById('ex-feedback');
        fb.className = 'feedback';
        fb.innerHTML = '';
        fb.style.display = 'none';
    },

    showFeedback: function(isCorrect, message) {
        const fb = document.getElementById('ex-feedback');
        fb.className = `feedback ${isCorrect ? 'success' : 'error'}`;
        fb.innerHTML = message;
        fb.style.display = 'block';
    },

    loadExercise: function(type) {
        if (this.currentExerciseType !== type) {
            this.currentPage = 1;
        }
        this.currentExerciseType = type;
        const container = document.getElementById('ex-content');
        const titleEl = document.getElementById('ex-title');
        container.innerHTML = '';
        
        document.getElementById('check-btn').style.display = 'inline-block';

        switch(type) {
            case 'part1':
                this.currentExerciseData = appData.part1;
                titleEl.textContent = "Part 1: Multiple-choice cloze";
                this.renderPaginatedExercises(container, 'part1');
                break;
            case 'part2':
                this.currentExerciseData = appData.part2;
                titleEl.textContent = "Part 2: Open cloze";
                this.renderPaginatedExercises(container, 'part2');
                break;
            case 'part3':
                this.currentExerciseData = appData.part3;
                titleEl.textContent = "Part 3: Word formation";
                this.renderPaginatedExercises(container, 'part3');
                break;
            case 'part4':
                this.currentExerciseData = appData.part4;
                titleEl.textContent = "Part 4: Key word transformation";
                this.renderPaginatedExercises(container, 'part4');
                break;
            case 'phrasal':
                this.currentExerciseData = appData.phrasalVerbs;
                titleEl.textContent = "Phrasal Verbs Practice";
                this.renderPaginatedExercises(container, 'phrasal');
                break;
            case 'collocations':
                this.currentExerciseData = appData.collocations;
                titleEl.textContent = "Match the Collocations";
                this.renderCollocations(container);
                break;
        }
    },

    // ─── UNIFIED PAGINATED RENDERER ───────────────────────────
    renderPaginatedExercises: function(container, type) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentBatch = this.currentExerciseData.slice(startIndex, endIndex);

        let html = this.getInstructionText(type);
        html += `<div style="display:flex; flex-direction:column; gap: 1.5rem;">`;

        currentBatch.forEach(item => {
            html += this.renderExerciseItem(item, type);
        });

        html += `</div>`;

        // Pagination
        const totalPages = Math.ceil(this.currentExerciseData.length / this.itemsPerPage);
        if (totalPages > 1) {
            html += `<div id="pagination-controls" class="pagination-controls"></div>`;
            container.innerHTML = html;
            this.setupPagination(totalPages);
        } else {
            container.innerHTML = html;
        }
    },

    getInstructionText: function(type) {
        const instructions = {
            part1: `<p class="exercise-text">Read each sentence and choose the word (A, B, C or D) that best fits the gap.</p>`,
            part2: `<p class="exercise-text">Read each sentence and type the missing word. Only ONE word is needed for each gap.</p>`,
            part3: `<p class="exercise-text">Read each sentence. Use the word given in <strong>CAPITALS</strong> to form a word that fits in the gap.</p>`,
            part4: `<p class="exercise-text">Complete the second sentence so that it has a similar meaning to the first. Use the <strong>keyword</strong> given. You must use between <strong>3 and 6 words</strong>, including the keyword.</p>`,
            phrasal: `<p class="exercise-text">Read the meaning and the example sentence, then type the correct <strong>phrasal verb</strong> (conjugated to fit the sentence).</p>`
        };
        return instructions[type] || '';
    },

    // ─── INDIVIDUAL EXERCISE RENDERERS ────────────────────────
    renderExerciseItem: function(item, type) {
        switch(type) {
            case 'part1': return this.renderPart1Item(item);
            case 'part2': return this.renderPart2Item(item);
            case 'part3': return this.renderPart3Item(item);
            case 'part4': return this.renderPart4Item(item);
            case 'phrasal': return this.renderPhrasalItem(item);
            default: return '';
        }
    },

    renderPart1Item: function(item) {
        let sentenceHtml = item.sentence.replace('{gap}', 
            `<select id="ex-${item.id}" class="gap-select">
                <option value="">-- Choose --</option>
                ${item.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>`
        );
        return `
            <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                <div style="font-weight: bold; color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.85rem;">Question ${item.id}</div>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    ${sentenceHtml}
                    <div id="feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                </div>
            </div>`;
    },

    renderPart2Item: function(item) {
        let sentenceHtml = item.sentence.replace('{gap}', 
            `<input type="text" id="ex-${item.id}" class="gap-input" style="width: 100px;" autocomplete="off" placeholder="type word...">`
        );
        return `
            <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                <div style="font-weight: bold; color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.85rem;">Question ${item.id}</div>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    ${sentenceHtml}
                    <div id="feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                </div>
            </div>`;
    },

    renderPart3Item: function(item) {
        let sentenceHtml = item.sentence.replace('{gap}', 
            `<input type="text" id="ex-${item.id}" class="gap-input" style="width: 140px;" autocomplete="off" placeholder="transform...">`
        );
        return `
            <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                <div style="font-weight: bold; color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.85rem;">Question ${item.id}</div>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    ${sentenceHtml}
                </div>
                <div style="margin-top: 0.5rem;">
                    <span class="root-word">Root: ${item.root}</span>
                    <div id="feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                </div>
            </div>`;
    },

    renderPart4Item: function(item) {
        return `
            <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                <div style="font-weight: bold; color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.85rem;">Question ${item.id}</div>
                <div style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 0.75rem; color: #cbd5e1;">
                    ${item.original}
                </div>
                <div class="keyword-box" style="margin-bottom: 0.75rem;">${item.keyword}</div>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    ${item.prompt} 
                    <input type="text" id="ex-${item.id}" class="gap-input" style="width: 250px;" autocomplete="off" placeholder="3-6 words..."> 
                    ${item.end}
                    <div id="feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                </div>
            </div>`;
    },

    renderPhrasalItem: function(item) {
        let exampleWithGap = item.example.replace('{gap}', 
            `<input type="text" id="ex-${item.id}" class="gap-input" style="width: 150px;" autocomplete="off" placeholder="type verb...">`
        );
        return `
            <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                <div style="font-weight: bold; color: var(--primary); margin-bottom: 0.5rem;">Meaning: ${item.meaning}</div>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    ${exampleWithGap}
                    <div id="feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                </div>
            </div>`;
    },

    // ─── PAGINATION SETUP ─────────────────────────────────────
    setupPagination: function(totalPages) {
        const paginationControls = document.getElementById('pagination-controls');
        let pageButtons = '';
        for (let i = 1; i <= totalPages; i++) {
            const btnClass = i === this.currentPage ? 'btn' : 'btn btn-secondary';
            pageButtons += `<button class="${btnClass} page-btn" data-page="${i}" style="padding: 0.5rem 1rem; border-radius: 4px;">${i}</button>`;
        }

        paginationControls.innerHTML = `
            <button class="btn btn-secondary" id="btn-prev" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <div class="page-numbers" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                ${pageButtons}
            </div>
            <button class="btn btn-secondary" id="btn-next" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('btn-prev').addEventListener('click', () => {
            if (this.currentPage > 1) this.changePage(-1);
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            if (this.currentPage < totalPages) this.changePage(1);
        });

        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedPage = parseInt(e.target.getAttribute('data-page'));
                this.currentPage = selectedPage;
                this.clearFeedback();
                this.loadExercise(this.currentExerciseType);
            });
        });
    },

    // ─── COLLOCATIONS (unchanged) ─────────────────────────────
    renderCollocations: function(container) {
        let html = `<p class="exercise-text">Match the verbs on the left with the correct noun phrases on the right.</p>
        <div class="collocation-grid">
            <div style="display:flex; flex-direction:column; gap:1rem;">`;
        
        this.currentExerciseData.forEach(item => {
            html += `<div class="collocation-item" style="background: rgba(59,130,246,0.1); border-color: var(--primary);">${item.part1}</div>`;
        });
        html += `</div><div style="display:flex; flex-direction:column; gap:1rem;">`;
        
        let rightSide = [...this.currentExerciseData].sort(() => Math.random() - 0.5);
        rightSide.forEach((item, i) => {
            html += `<div class="collocation-item"><select id="colloc-${item.id}" class="gap-select" style="width:100%; margin-bottom: 0.5rem;"><option value="">-- Select Verb --</option>`;
            this.currentExerciseData.forEach(v => {
                html += `<option value="${v.part1}">${v.part1}</option>`;
            });
            html += `</select> ${item.part2}</div>`;
        });
        
        html += `</div></div>`;
        container.innerHTML = html;
        this.currentExerciseData.shuffledRight = rightSide;
    },

    changePage: function(delta) {
        this.currentPage += delta;
        this.clearFeedback();
        this.loadExercise(this.currentExerciseType);
    },

    // ─── UNIFIED CHECK ANSWER ─────────────────────────────────
    checkAnswer: function() {
        this.clearFeedback();
        let isCorrect = true;
        let message = "All correct! Great job! 🎉";

        if (this.currentExerciseType === 'collocations') {
            this.currentExerciseData.shuffledRight.forEach(item => {
                const val = document.getElementById(`colloc-${item.id}`).value;
                if (val !== item.part1) isCorrect = false;
            });
        } else {
            // Unified check for all paginated types
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const currentBatch = this.currentExerciseData.slice(startIndex, endIndex);

            currentBatch.forEach(item => {
                const input = document.getElementById(`ex-${item.id}`);
                const feedbackBox = document.getElementById(`feedback-${item.id}`);
                
                if (!input || !feedbackBox) return;

                // Reset styles
                input.classList.remove('correct-input', 'incorrect-input');
                feedbackBox.style.display = 'none';

                const userVal = input.tagName === 'SELECT' ? input.value : input.value.trim();
                const expectedAnswer = this.getExpectedAnswer(item);
                const isItemCorrect = this.compareAnswer(userVal, expectedAnswer, this.currentExerciseType);

                if (!isItemCorrect) {
                    isCorrect = false;
                    input.classList.add('incorrect-input');
                    feedbackBox.textContent = `Correct answer: ${expectedAnswer}`;
                    feedbackBox.style.display = 'block';
                } else {
                    input.classList.add('correct-input');
                }
            });
        }

        if (!isCorrect && message === "All correct! Great job! 🎉") {
            message = "Some answers are incorrect. Keep trying! 💪";
        }

        this.showFeedback(isCorrect, message);
    },

    getExpectedAnswer: function(item) {
        if (this.currentExerciseType === 'phrasal') {
            return item.answer || item.verb;
        }
        return item.answer;
    },

    compareAnswer: function(userVal, expected, type) {
        if (!userVal || !expected) return false;

        if (type === 'part1') {
            // Select-based: exact match
            return userVal.toLowerCase() === expected.toLowerCase();
        }
        if (type === 'part2') {
            // Open cloze: case-insensitive
            return userVal.toLowerCase() === expected.toLowerCase();
        }
        if (type === 'part3') {
            // Word formation: case-insensitive
            return userVal.toLowerCase() === expected.toLowerCase();
        }
        if (type === 'part4') {
            // Key word transformation: case-insensitive, trim extra spaces
            const normalizedUser = userVal.toLowerCase().replace(/\s+/g, ' ');
            const normalizedExpected = expected.toLowerCase().replace(/\s+/g, ' ');
            return normalizedUser === normalizedExpected;
        }
        if (type === 'phrasal') {
            return userVal.toLowerCase() === expected.toLowerCase();
        }
        return false;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
