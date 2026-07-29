const app = {
    currentView: 'dashboard',
    currentExerciseType: null,
    currentTestIndex: 0,
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

    selectTest: function(testIndex) {
        this.currentTestIndex = testIndex;
        this.clearFeedback();
        this.loadExercise(this.currentExerciseType);
    },

    renderTestTabs: function(type) {
        const tests = appData[type];
        if (!tests || !tests.length) return '';
        let html = `<div class="test-tabs">`;
        tests.forEach((test, idx) => {
            const activeClass = idx === this.currentTestIndex ? 'active' : '';
            html += `<button class="test-tab-btn ${activeClass}" onclick="app.selectTest(${idx})">Test ${idx + 1}</button>`;
        });
        html += `</div>`;
        return html;
    },

    loadExercise: function(type) {
        if (this.currentExerciseType !== type) {
            this.currentTestIndex = 0;
            this.currentPage = 1;
        }
        this.currentExerciseType = type;
        const container = document.getElementById('ex-content');
        const titleEl = document.getElementById('ex-title');
        container.innerHTML = '';
        
        document.getElementById('check-btn').style.display = 'inline-block';

        switch(type) {
            case 'part1':
                titleEl.textContent = "Part 1: Multiple-choice cloze";
                this.renderPart1(container);
                break;
            case 'part2':
                titleEl.textContent = "Part 2: Open cloze";
                this.renderPart2(container);
                break;
            case 'part3':
                titleEl.textContent = "Part 3: Word formation";
                this.renderPart3(container);
                break;
            case 'part4':
                titleEl.textContent = "Part 4: Key word transformation";
                this.renderPart4(container);
                break;
            case 'phrasal':
                this.currentExerciseData = appData.phrasalVerbs;
                titleEl.textContent = "Phrasal Verbs Practice";
                this.renderPhrasal(container);
                break;
            case 'collocations':
                this.currentExerciseData = appData.collocations;
                titleEl.textContent = "Match the Collocations";
                this.renderCollocations(container);
                break;
        }
    },

    // ─── PART 1: MULTIPLE-CHOICE CLOZE (Full Text) ────────────
    renderPart1: function(container) {
        if (!window.appData || !appData.part1) {
            container.innerHTML = '<p class="exercise-text" style="color:var(--error);">Data error: appData.part1 is not loaded. Please refresh the page.</p>';
            return;
        }
        if (this.currentTestIndex >= appData.part1.length) this.currentTestIndex = 0;
        const test = appData.part1[this.currentTestIndex];
        if (!test) {
            container.innerHTML = '<p class="exercise-text">No test found for Part 1.</p>';
            return;
        }

        let html = this.renderTestTabs('part1');
        html += `<h3 style="font-size:1.3rem; margin-bottom:0.75rem; color:var(--primary);">${test.title}</h3>`;
        html += `<p class="exercise-text" style="margin-bottom:1.5rem;">Read the text below and choose the word (A, B, C or D) that best fits each gap.</p>`;

        let textWithGaps = test.text;
        test.questions.forEach(q => {
            let selectHtml = `<span class="gap-num">(${q.gap})</span>` +
                `<select id="gap-${q.gap}" class="gap-select" style="margin: 0 4px;">` +
                `<option value="">-- ? --</option>` +
                q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('') +
                `</select>` +
                `<span id="feedback-gap-${q.gap}" class="correct-answer-feedback" style="display:inline-block; margin-left:4px;"></span>`;
            textWithGaps = textWithGaps.replace(`{gap${q.gap}}`, selectHtml);
        });

        const paragraphs = textWithGaps.split('\n\n').map(p => `<p>${p}</p>`).join('');
        html += `<div class="reading-article">${paragraphs}</div>`;
        container.innerHTML = html;
    },

    // ─── PART 2: OPEN CLOZE (Full Text) ───────────────────────
    renderPart2: function(container) {
        if (!window.appData || !appData.part2) {
            container.innerHTML = '<p class="exercise-text" style="color:var(--error);">Data error: appData.part2 is not loaded. Please refresh the page.</p>';
            return;
        }
        if (this.currentTestIndex >= appData.part2.length) this.currentTestIndex = 0;
        const test = appData.part2[this.currentTestIndex];
        if (!test) {
            container.innerHTML = '<p class="exercise-text">No test found for Part 2.</p>';
            return;
        }

        let html = this.renderTestTabs('part2');
        html += `<h3 style="font-size:1.3rem; margin-bottom:0.75rem; color:var(--primary);">${test.title}</h3>`;
        html += `<p class="exercise-text" style="margin-bottom:1.5rem;">Read the text below and type the word which best fits each gap. Use <strong>ONLY ONE word</strong> in each gap.</p>`;

        let textWithGaps = test.text;
        test.answers.forEach(q => {
            let inputHtml = `<span class="gap-num">(${q.gap})</span>` +
                `<input type="text" id="gap-${q.gap}" class="gap-input" style="width: 100px; margin: 0 4px;" autocomplete="off" placeholder="...">` +
                `<span id="feedback-gap-${q.gap}" class="correct-answer-feedback" style="display:inline-block; margin-left:4px;"></span>`;
            textWithGaps = textWithGaps.replace(`{gap${q.gap}}`, inputHtml);
        });

        const paragraphs = textWithGaps.split('\n\n').map(p => `<p>${p}</p>`).join('');
        html += `<div class="reading-article">${paragraphs}</div>`;
        container.innerHTML = html;
    },

    // ─── PART 3: WORD FORMATION (Full Text) ───────────────────
    renderPart3: function(container) {
        if (!window.appData || !appData.part3) {
            container.innerHTML = '<p class="exercise-text" style="color:var(--error);">Data error: appData.part3 is not loaded. Please refresh the page.</p>';
            return;
        }
        if (this.currentTestIndex >= appData.part3.length) this.currentTestIndex = 0;
        const test = appData.part3[this.currentTestIndex];
        if (!test) {
            container.innerHTML = '<p class="exercise-text">No test found for Part 3.</p>';
            return;
        }

        let html = this.renderTestTabs('part3');
        html += `<h3 style="font-size:1.3rem; margin-bottom:0.75rem; color:var(--primary);">${test.title}</h3>`;
        html += `<p class="exercise-text" style="margin-bottom:1.5rem;">Read the text below. Use the word given in <strong>CAPITALS</strong> at the end of each gap to form a word that fits in the gap.</p>`;

        let textWithGaps = test.text;
        test.questions.forEach(q => {
            let inputHtml = `<span class="gap-num">(${q.gap})</span>` +
                `<input type="text" id="gap-${q.gap}" class="gap-input" style="width: 140px; margin: 0 4px;" autocomplete="off" placeholder="transform...">` +
                `<span class="root-tag">${q.root}</span>` +
                `<span id="feedback-gap-${q.gap}" class="correct-answer-feedback" style="display:inline-block; margin-left:4px;"></span>`;
            textWithGaps = textWithGaps.replace(`{gap${q.gap}}`, inputHtml);
        });

        const paragraphs = textWithGaps.split('\n\n').map(p => `<p>${p}</p>`).join('');
        html += `<div class="reading-article">${paragraphs}</div>`;
        container.innerHTML = html;
    },

    // ─── PART 4: KEY WORD TRANSFORMATION (6 Items) ────────────
    renderPart4: function(container) {
        if (!window.appData || !appData.part4) {
            container.innerHTML = '<p class="exercise-text" style="color:var(--error);">Data error: appData.part4 is not loaded. Please refresh the page.</p>';
            return;
        }
        if (this.currentTestIndex >= appData.part4.length) this.currentTestIndex = 0;
        const test = appData.part4[this.currentTestIndex];
        if (!test) {
            container.innerHTML = '<p class="exercise-text">No test found for Part 4.</p>';
            return;
        }

        let html = this.renderTestTabs('part4');
        html += `<h3 style="font-size:1.3rem; margin-bottom:0.75rem; color:var(--primary);">${test.title}</h3>`;
        html += `<p class="exercise-text" style="margin-bottom:1.5rem;">Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. <strong>Do not change the word given</strong>. You must use between <strong>three and six words</strong>, including the word given.</p>`;

        html += `<div style="display:flex; flex-direction:column; gap: 1.5rem;">`;
        test.items.forEach(item => {
            html += `
                <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-weight: bold; color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.85rem;">Question ${item.id}</div>
                    <div style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 0.75rem; color: #cbd5e1;">${item.original}</div>
                    <div class="keyword-box" style="margin-bottom: 0.75rem;">${item.keyword}</div>
                    <div style="font-size: 1.1rem; line-height: 1.8;">
                        ${item.prompt} 
                        <input type="text" id="gap-${item.id}" class="gap-input" style="width: 280px;" autocomplete="off" placeholder="3-6 words..."> 
                        ${item.end}
                        <div id="feedback-gap-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                    </div>
                </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    // ─── PHRASAL VERBS (Paginated Cards) ──────────────────────
    renderPhrasal: function(container) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentBatch = this.currentExerciseData.slice(startIndex, endIndex);

        let html = `<p class="exercise-text">Read the meaning and the example sentence, then type the correct <strong>phrasal verb</strong> (conjugated to fit the sentence).</p>`;
        html += `<div style="display:flex; flex-direction:column; gap: 1.5rem;">`;

        currentBatch.forEach(item => {
            let exampleWithGap = item.example.replace('{gap}', 
                `<input type="text" id="phrasal-${item.id}" class="gap-input" style="width: 150px;" autocomplete="off" placeholder="type verb...">`
            );
            html += `
                <div style="background: var(--secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-weight: bold; color: var(--primary); margin-bottom: 0.5rem;">Meaning: ${item.meaning}</div>
                    <div style="font-size: 1.1rem; line-height: 1.8;">
                        ${exampleWithGap}
                        <div id="phrasal-feedback-${item.id}" class="correct-answer-feedback" style="display:none;"></div>
                    </div>
                </div>`;
        });
        html += `</div>`;

        const totalPages = Math.ceil(this.currentExerciseData.length / this.itemsPerPage);
        if (totalPages > 1) {
            html += `<div id="pagination-controls" class="pagination-controls"></div>`;
            container.innerHTML = html;
            this.setupPagination(totalPages);
        } else {
            container.innerHTML = html;
        }
    },

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
            if (this.currentPage > 1) {
                this.currentPage--;
                this.clearFeedback();
                this.loadExercise('phrasal');
            }
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.clearFeedback();
                this.loadExercise('phrasal');
            }
        });

        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedPage = parseInt(e.target.getAttribute('data-page'));
                this.currentPage = selectedPage;
                this.clearFeedback();
                this.loadExercise('phrasal');
            });
        });
    },

    // ─── COLLOCATIONS ─────────────────────────────────────────
    renderCollocations: function(container) {
        let html = `<p class="exercise-text">Match the verbs on the left with the correct noun phrases on the right.</p>
        <div class="collocation-grid">
            <div style="display:flex; flex-direction:column; gap:1rem;">`;
        
        this.currentExerciseData.forEach(item => {
            html += `<div class="collocation-item" style="background: rgba(59,130,246,0.1); border-color: var(--primary);">${item.part1}</div>`;
        });
        html += `</div><div style="display:flex; flex-direction:column; gap:1rem;">`;
        
        let rightSide = [...this.currentExerciseData].sort(() => Math.random() - 0.5);
        rightSide.forEach((item) => {
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

    // ─── CHECK ANSWERS FOR SIMULATOR ──────────────────────────
    checkAnswer: function() {
        this.clearFeedback();
        let total = 0;
        let correct = 0;

        if (this.currentExerciseType === 'part1') {
            const test = appData.part1[this.currentTestIndex];
            total = test.questions.length;
            test.questions.forEach(q => {
                const el = document.getElementById(`gap-${q.gap}`);
                const fb = document.getElementById(`feedback-gap-${q.gap}`);
                const val = el ? el.value : '';
                el.classList.remove('correct-input', 'incorrect-input');
                if (val === q.answer) {
                    correct++;
                    el.classList.add('correct-input');
                    if (fb) fb.style.display = 'none';
                } else {
                    el.classList.add('incorrect-input');
                    if (fb) {
                        fb.textContent = ` (✓ ${q.answer})`;
                        fb.style.display = 'inline-block';
                    }
                }
            });
        } 
        else if (this.currentExerciseType === 'part2') {
            const test = appData.part2[this.currentTestIndex];
            total = test.answers.length;
            test.answers.forEach(q => {
                const el = document.getElementById(`gap-${q.gap}`);
                const fb = document.getElementById(`feedback-gap-${q.gap}`);
                const val = el ? el.value.trim().toLowerCase() : '';
                el.classList.remove('correct-input', 'incorrect-input');
                if (val === q.answer.toLowerCase()) {
                    correct++;
                    el.classList.add('correct-input');
                    if (fb) fb.style.display = 'none';
                } else {
                    el.classList.add('incorrect-input');
                    if (fb) {
                        fb.textContent = ` (✓ ${q.answer})`;
                        fb.style.display = 'inline-block';
                    }
                }
            });
        }
        else if (this.currentExerciseType === 'part3') {
            const test = appData.part3[this.currentTestIndex];
            total = test.questions.length;
            test.questions.forEach(q => {
                const el = document.getElementById(`gap-${q.gap}`);
                const fb = document.getElementById(`feedback-gap-${q.gap}`);
                const val = el ? el.value.trim().toLowerCase() : '';
                el.classList.remove('correct-input', 'incorrect-input');
                if (val === q.answer.toLowerCase()) {
                    correct++;
                    el.classList.add('correct-input');
                    if (fb) fb.style.display = 'none';
                } else {
                    el.classList.add('incorrect-input');
                    if (fb) {
                        fb.textContent = ` (✓ ${q.answer})`;
                        fb.style.display = 'inline-block';
                    }
                }
            });
        }
        else if (this.currentExerciseType === 'part4') {
            const test = appData.part4[this.currentTestIndex];
            total = test.items.length;
            test.items.forEach(item => {
                const el = document.getElementById(`gap-${item.id}`);
                const fb = document.getElementById(`feedback-gap-${item.id}`);
                const val = el ? el.value.trim().toLowerCase().replace(/\s+/g, ' ') : '';
                const expected = item.answer.toLowerCase().replace(/\s+/g, ' ');
                el.classList.remove('correct-input', 'incorrect-input');
                if (val === expected) {
                    correct++;
                    el.classList.add('correct-input');
                    if (fb) fb.style.display = 'none';
                } else {
                    el.classList.add('incorrect-input');
                    if (fb) {
                        fb.textContent = `Correct answer: ${item.answer}`;
                        fb.style.display = 'block';
                    }
                }
            });
        }
        else if (this.currentExerciseType === 'phrasal') {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const currentBatch = this.currentExerciseData.slice(startIndex, endIndex);
            total = currentBatch.length;

            currentBatch.forEach(item => {
                const input = document.getElementById(`phrasal-${item.id}`);
                const feedbackBox = document.getElementById(`phrasal-feedback-${item.id}`);
                const val = input ? input.value.trim().toLowerCase() : '';
                
                if (!input) return;
                input.classList.remove('correct-input', 'incorrect-input');
                if (feedbackBox) feedbackBox.style.display = 'none';

                const expectedAnswer = item.answer || item.verb;

                if (val !== expectedAnswer.toLowerCase()) {
                    input.classList.add('incorrect-input');
                    if (feedbackBox) {
                        feedbackBox.textContent = `Correct answer: ${expectedAnswer}`;
                        feedbackBox.style.display = 'block';
                    }
                } else {
                    correct++;
                    input.classList.add('correct-input');
                }
            });
        }
        else if (this.currentExerciseType === 'collocations') {
            total = this.currentExerciseData.length;
            this.currentExerciseData.shuffledRight.forEach(item => {
                const val = document.getElementById(`colloc-${item.id}`).value;
                if (val === item.part1) correct++;
            });
        }

        const percentage = Math.round((correct / total) * 100);
        const isPassing = percentage >= 60;
        const message = `<strong>Score: ${correct} / ${total} (${percentage}%)</strong> — ${isPassing ? 'Great job! Passing score 🎯' : 'Keep practicing! 💪'}`;
        this.showFeedback(isPassing, message);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});


window.app = app;