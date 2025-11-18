// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const nameInputSection = document.getElementById('name-input-section');
    const wheelSection = document.getElementById('wheel-section');
    const difficultySection = document.getElementById('difficulty-section');
    const mathSection = document.getElementById('math-section');
    
    const nameInput = document.getElementById('name-input');
    const addNameBtn = document.getElementById('add-name-btn');
    const nameList = document.getElementById('name-list');
    const startGameBtn = document.getElementById('start-game-btn');
    
    const wheelCanvas = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const backToNamesBtn = document.getElementById('back-to-names-btn');
    const backToWheelBtn = document.getElementById('back-to-wheel-btn');
    
    const difficultyPlayerSpan = document.getElementById('difficulty-player');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    const selectedPlayerSpan = document.getElementById('selected-player');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const resultElement = document.getElementById('result');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const currentDifficultySpan = document.getElementById('current-difficulty');
    const difficultyBadge = document.getElementById('difficulty-badge');
    
    // Statistik pemain
    const questionsAnsweredElement = document.getElementById('questions-answered');
    const correctAnswersElement = document.getElementById('correct-answers');
    const scoreElement = document.getElementById('score');
    
    // Variabel global
    let names = [];
    let currentPlayer = '';
    let currentQuestion = {};
    let wheelSpinning = false;
    let wheelAnimation = null;
    let currentDifficulty = '';
    let winnerIndex = -1;
    
    // Statistik game
    let playerStats = {
        questionsAnswered: 0,
        correctAnswers: 0,
        score: 0
    };

    // SOAL MATEMATIKA
    const soalMudah = [
        { soal: "5 + 3 = ?", jawaban: 8 },
        { soal: "12 - 4 = ?", jawaban: 8 },
        { soal: "6 × 7 = ?", jawaban: 42 },
        { soal: "48 ÷ 6 = ?", jawaban: 8 },
        { soal: "15 + 23 = ?", jawaban: 38 },
        { soal: "56 - 29 = ?", jawaban: 27 },
        { soal: "9 × 8 = ?", jawaban: 72 },
        { soal: "81 ÷ 9 = ?", jawaban: 9 },
        { soal: "25 + 17 = ?", jawaban: 42 },
        { soal: "100 - 45 = ?", jawaban: 55 }
    ];

    const soalSulit = [
    { soal: "Diketahui fungsi f(x) = x² - 4x + 7. Nilai dari f(5) adalah...", jawaban: 12 },
    { soal: "Jika log(2x) = 2, maka nilai x adalah...", jawaban: 50 },
    { soal: "Jumlah 5 suku pertama dari barisan aritmatika 3, 7, 11, ... adalah...", jawaban: 55 },
    { soal: "Diketahui vektor u = (2, 5) dan v = (6, -1). Nilai dari u · v adalah...", jawaban: 7 },
    { soal: "Persamaan garis singgung lingkaran x² + y² = 25 di titik (3,4) adalah ax + by = 25. Nilai a + b adalah...", jawaban: 7 },
    { soal: "Nilai x yang memenuhi persamaan 2^(x+1) = 32 adalah...", jawaban: 4 },
    { soal: "Suku ke-6 dari barisan geometri 2, 6, 18, ... adalah...", jawaban: 486 },
    { soal: "Jika sin x = 0.6 dan x sudut lancip, maka nilai cos x adalah... (dibulatkan 1 angka desimal)", jawaban: 0.8 },
    { soal: "Turunan pertama dari fungsi f(x) = 3x⁴ - 2x² + 5x - 1 adalah f'(x) = ax³ + bx + c. Nilai a + b + c adalah...", jawaban: 15 },
    { soal: "Nilai minimum dari fungsi f(x) = x² - 6x + 10 adalah...", jawaban: 1 },
    // Soal tambahan
    { soal: "Jika 3^(x-1) = 81, maka nilai x adalah...", jawaban: 5 },
    { soal: "Nilai dari log₄(64) adalah...", jawaban: 3 },
    { soal: "Panjang sisi miring segitiga siku-siku dengan sisi 6 cm dan 8 cm adalah...", jawaban: 10 }
];
    
    // Fungsi untuk menambah nama
    addNameBtn.addEventListener('click', function() {
        const name = nameInput.value.trim();
        if (name && !names.includes(name)) {
            names.push(name);
            updateNameList();
            nameInput.value = '';
            nameInput.focus();
        }
    });
    
    // Fungsi untuk menambah nama dengan Enter
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNameBtn.click();
        }
    });
    
    // Fungsi untuk memperbarui daftar nama
    function updateNameList() {
        nameList.innerHTML = '';
        names.forEach((name, index) => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.innerHTML = `
                <span>${name}</span>
                <button class="remove-btn" data-index="${index}">Hapus</button>
            `;
            nameList.appendChild(nameItem);
        });
        
        // Tambahkan event listener untuk tombol hapus
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                names.splice(index, 1);
                updateNameList();
            });
        });
    }
    
    // Fungsi untuk memulai game
    startGameBtn.addEventListener('click', function() {
        if (names.length < 2) {
            alert('Minimal 2 nama diperlukan untuk memulai game!');
            return;
        }
        
        nameInputSection.classList.add('hidden');
        wheelSection.classList.remove('hidden');
        drawWheel();
    });
    
    // Fungsi untuk kembali ke input nama
    backToNamesBtn.addEventListener('click', function() {
        wheelSection.classList.add('hidden');
        nameInputSection.classList.remove('hidden');
    });
    
    // Fungsi untuk kembali ke wheel
    backToWheelBtn.addEventListener('click', function() {
        difficultySection.classList.add('hidden');
        wheelSection.classList.remove('hidden');
        drawWheel();
    });
    
    // Fungsi untuk menggambar roda
    function drawWheel(highlightIndex = -1) {
        const ctx = wheelCanvas.getContext('2d');
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = wheelCanvas.width / 2 - 10;
        
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        
        const sliceAngle = (2 * Math.PI) / names.length;
        
        // Gambar setiap segmen roda
        names.forEach((name, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            
            // Warna untuk segmen - kuning untuk pemenang
            let color;
            if (index === highlightIndex) {
                color = '#FFD700'; // Kuning untuk pemenang
            } else {
                color = index % 2 === 0 ? '#6e8efb' : '#a777e3';
            }
            
            ctx.fillStyle = color;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Tambahkan garis pemisah
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + radius * Math.cos(startAngle),
                centerY + radius * Math.sin(startAngle)
            );
            ctx.stroke();
            
            // Tambahkan teks nama
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = index === highlightIndex ? '#000' : '#fff'; // Hitam untuk teks di background kuning
            ctx.font = 'bold 14px Poppins';
            ctx.fillText(name, radius - 20, 5);
            ctx.restore();
        });
        
        // Gambar lingkaran tengah
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Fungsi untuk memutar roda - VERSI SMOOTH
    spinBtn.addEventListener('click', function() {
        if (wheelSpinning) return;
        
        wheelSpinning = true;
        const ctx = wheelCanvas.getContext('2d');
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = wheelCanvas.width / 2 - 10;
        const sliceAngle = (2 * Math.PI) / names.length;
        
        // Pilih pemenang secara acak
        winnerIndex = Math.floor(Math.random() * names.length);
        currentPlayer = names[winnerIndex];
        
        // Parameter animasi
        let startTime = null;
        const duration = 4000; // 4 detik
        const spins = 5 + Math.random() * 3; // 5-8 putaran
        const totalRotation = spins * 2 * Math.PI;
        
        // Hitung sudut target agar pemenang berhenti di posisi atas
        const targetOffset = (Math.PI / 2) - (winnerIndex * sliceAngle + sliceAngle / 2);
        const targetRotation = totalRotation + targetOffset;
        
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function untuk efek perlambatan yang smooth
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = easeOut * targetRotation;
            
            // Gambar roda dengan rotasi saat ini
            drawRotatedWheel(currentRotation);
            
            if (progress < 1) {
                wheelAnimation = requestAnimationFrame(animate);
            } else {
                // Animasi selesai
                wheelSpinning = false;
                
                // Gambar roda final dengan highlight pemenang
                drawWheelWithHighlight(winnerIndex, currentRotation);
                
                setTimeout(() => {
                    showDifficultySelection();
                }, 1000);
            }
        }
        
        function drawRotatedWheel(angle) {
            ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.translate(-centerX, -centerY);
            
            // Gambar semua segmen
            names.forEach((name, index) => {
                const startAngle = index * sliceAngle;
                const endAngle = (index + 1) * sliceAngle;
                
                ctx.fillStyle = index % 2 === 0 ? '#6e8efb' : '#a777e3';
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();
                
                // Garis pemisah
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + radius * Math.cos(startAngle),
                    centerY + radius * Math.sin(startAngle)
                );
                ctx.stroke();
                
                // Teks nama
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Poppins';
                ctx.fillText(name, radius - 20, 5);
                ctx.restore();
            });
            
            // Lingkaran tengah
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        }
        
        wheelAnimation = requestAnimationFrame(animate);
    });

    
    // Fungsi untuk menggambar roda dengan highlight pemenang
    function drawWheelWithHighlight(winnerIndex, finalRotation) {
        const ctx = wheelCanvas.getContext('2d');
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = wheelCanvas.width / 2 - 10;
        const sliceAngle = (2 * Math.PI) / names.length;
        
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(finalRotation);
        ctx.translate(-centerX, -centerY);
        
        // Gambar semua segmen dengan highlight pemenang
        names.forEach((name, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            
            if (index === winnerIndex) {
                // Highlight segmen pemenang dengan warna kuning
                ctx.fillStyle = '#FFD700'; // Warna kuning emas
            } else {
                ctx.fillStyle = index % 2 === 0 ? '#6e8efb' : '#a777e3';
            }
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Garis pemisah
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + radius * Math.cos(startAngle),
                centerY + radius * Math.sin(startAngle)
            );
            ctx.stroke();
            
            // Teks nama
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = index === winnerIndex ? '#000' : '#fff'; // Hitam untuk teks di background kuning
            ctx.font = 'bold 14px Poppins';
            ctx.fillText(name, radius - 20, 5);
            ctx.restore();
        });
        
        // Lingkaran tengah
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Fungsi untuk menampilkan pilihan tingkat kesulitan
    function showDifficultySelection() {
        wheelSection.classList.add('hidden');
        difficultySection.classList.remove('hidden');
        difficultyPlayerSpan.textContent = currentPlayer;
    }
    
    // Event listener untuk tombol tingkat kesulitan
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentDifficulty = this.getAttribute('data-difficulty');
            showMathQuestion();
        });
    });
    
    // Fungsi untuk menampilkan soal matematika
    function showMathQuestion() {
        difficultySection.classList.add('hidden');
        mathSection.classList.remove('hidden');
        
        selectedPlayerSpan.textContent = currentPlayer;
        resetPlayerStats();
        generateMathQuestion();
        answerInput.value = '';
        resultElement.classList.add('hidden');
        nextPlayerBtn.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        
        // Set badge tingkat kesulitan
        currentDifficultySpan.textContent = currentDifficulty === 'easy' ? 'Mudah' : 'Sulit';
        difficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
        
        answerInput.focus();
    }
    
    // Fungsi untuk mereset statistik pemain
    function resetPlayerStats() {
        playerStats = {
            questionsAnswered: 0,
            correctAnswers: 0,
            score: 0
        };
        updateStatsDisplay();
    }
    
    // Fungsi untuk memperbarui tampilan statistik
    function updateStatsDisplay() {
        questionsAnsweredElement.textContent = playerStats.questionsAnswered;
        correctAnswersElement.textContent = playerStats.correctAnswers;
        scoreElement.textContent = playerStats.score;
    }
    
    // FUNGSI UNTUK MEMBUAT SOAL MUDAH SECARA ACAK (TAK TERBATAS)
    function generateSoalMudah() {
        const operations = ['+', '-', '×', '÷'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer, soal;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                soal = `${num1} + ${num2} = ?`;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                soal = `${num1} - ${num2} = ?`;
                break;
            case '×':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                soal = `${num1} × ${num2} = ?`;
                break;
            case '÷':
                num2 = Math.floor(Math.random() * 10) + 2; // Pembagi
                answer = Math.floor(Math.random() * 10) + 1; // Hasil
                num1 = num2 * answer; // Yang dibagi
                soal = `${num1} ÷ ${num2} = ?`;
                break;
        }
        
        return {
            soal: soal,
            jawaban: answer
        };
    }

    // GANTI fungsi generateMathQuestion() menjadi:
    function generateMathQuestion() {
        if (currentDifficulty === 'easy') {
            // Generate soal mudah secara acak (tak terbatas)
            const soalTerpilih = generateSoalMudah();
            currentQuestion = {
                question: soalTerpilih.soal,
                answer: soalTerpilih.jawaban
            };
        } else {
            // Pilih soal sulit dari array yang tetap
            const randomIndex = Math.floor(Math.random() * soalSulit.length);
            const soalTerpilih = soalSulit[randomIndex];
            currentQuestion = {
                question: soalTerpilih.soal,
                answer: soalTerpilih.jawaban
            };
        }
        
        questionElement.textContent = currentQuestion.question;
    }
    
    // Fungsi untuk memeriksa jawaban
    submitAnswerBtn.addEventListener('click', function() {
        let userAnswer;
        
        // Handle jawaban desimal
        if (currentQuestion.answer.toString().includes('.')) {
            userAnswer = parseFloat(answerInput.value);
        } else {
            userAnswer = parseInt(answerInput.value);
        }
        
        if (isNaN(userAnswer)) {
            alert('Masukkan jawaban yang valid!');
            return;
        }
        
        playerStats.questionsAnswered++;
        
        resultElement.classList.remove('hidden');
        
        // Bandingkan jawaban dengan toleransi untuk angka desimal
        const isCorrect = Math.abs(userAnswer - currentQuestion.answer) < 0.01;
        
        if (isCorrect) {
            // Jawaban benar
            playerStats.correctAnswers++;
            playerStats.score += currentDifficulty === 'easy' ? 5 : 10;
            
            resultElement.textContent = currentDifficulty === 'easy' 
                ? 'Jawaban Benar! 🎉 +5 Poin' 
                : 'Jawaban Benar! 🎉 +10 Poin';
            resultElement.className = 'result correct';
            
            // Tampilkan tombol soal berikutnya
            nextQuestionBtn.classList.remove('hidden');
            nextPlayerBtn.classList.add('hidden');
            
            // Efek celebrasi
            createParticles();
            questionElement.classList.add('celebrate');
            setTimeout(() => {
                questionElement.classList.remove('celebrate');
            }, 1500);
            
        } else {
            // Jawaban salah
            resultElement.textContent = `Jawaban Salah! Jawaban yang benar adalah ${currentQuestion.answer}`;
            resultElement.className = 'result incorrect';
            
            // Tampilkan tombol pemain berikutnya
            nextPlayerBtn.classList.remove('hidden');
            nextQuestionBtn.classList.add('hidden');
        }
        
        updateStatsDisplay();
        submitAnswerBtn.disabled = true;
    });
    
    // Fungsi untuk membuat efek partikel
    function createParticles() {
        const mathProblem = document.querySelector('.math-problem');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--tx', `${Math.random() * 100 - 50}px`);
            particle.style.setProperty('--ty', `${Math.random() * 100 - 50}px`);
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            mathProblem.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    // Fungsi untuk soal berikutnya
    nextQuestionBtn.addEventListener('click', function() {
        generateMathQuestion();
        answerInput.value = '';
        resultElement.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        submitAnswerBtn.disabled = false;
        answerInput.focus();
    });
    
    // Fungsi untuk pemain berikutnya
    nextPlayerBtn.addEventListener('click', function() {
        mathSection.classList.add('hidden');
        wheelSection.classList.remove('hidden');
        // Gambar wheel dengan highlight pemenang sebelumnya
        drawWheel(winnerIndex);
        submitAnswerBtn.disabled = false;
    });
    
    // Tambahkan event listener untuk input answer
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswerBtn.click();
        }
    });
    
    // Tambahkan nama default
    names = [];
    updateNameList();
});