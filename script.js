// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const nameInputSection = document.getElementById('name-input-section');
    const wheelSection = document.getElementById('wheel-section');
    const mathSection = document.getElementById('math-section');
    
    const nameInput = document.getElementById('name-input');
    const addNameBtn = document.getElementById('add-name-btn');
    const nameList = document.getElementById('name-list');
    const startGameBtn = document.getElementById('start-game-btn');
    
    const wheelCanvas = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const backToNamesBtn = document.getElementById('back-to-names-btn');
    
    const selectedPlayerSpan = document.getElementById('selected-player');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const resultElement = document.getElementById('result');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    
    // Variabel global
    let names = [];
    let currentPlayer = '';
    let currentQuestion = {};
    let wheelSpinning = false;
    let wheelAnimation = null;
    
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
    
    // Fungsi untuk menggambar roda
    function drawWheel() {
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
            
            // Warna alternatif untuk segmen
            ctx.fillStyle = index % 2 === 0 ? '#6e8efb' : '#a777e3';
            
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
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
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
    
    // Fungsi untuk memutar roda
    spinBtn.addEventListener('click', function() {
        if (wheelSpinning) return;
        
        wheelSpinning = true;
        const ctx = wheelCanvas.getContext('2d');
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        
        let rotation = 0;
        const spins = 5 + Math.random() * 5; // 5-10 putaran
        const totalRotation = spins * 2 * Math.PI;
        const sliceAngle = (2 * Math.PI) / names.length;
        
        // Pilih pemenang secara acak
        const winnerIndex = Math.floor(Math.random() * names.length);
        const targetAngle = winnerIndex * sliceAngle + Math.random() * sliceAngle;
        
        let currentSpins = 0;
        
        function animate() {
            rotation += 0.1;
            currentSpins += 0.1;
            
            if (currentSpins >= totalRotation + targetAngle) {
                cancelAnimationFrame(wheelAnimation);
                wheelSpinning = false;
                currentPlayer = names[winnerIndex];
                setTimeout(() => {
                    showMathQuestion();
                }, 1000);
                return;
            }
            
            // Gambar ulang roda dengan rotasi
            ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // Gambar roda yang diputar
            const sliceAngle = (2 * Math.PI) / names.length;
            names.forEach((name, index) => {
                const startAngle = index * sliceAngle;
                const endAngle = (index + 1) * sliceAngle;
                
                ctx.fillStyle = index % 2 === 0 ? '#6e8efb' : '#a777e3';
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, wheelCanvas.width / 2 - 10, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + (wheelCanvas.width / 2 - 10) * Math.cos(startAngle),
                    centerY + (wheelCanvas.width / 2 - 10) * Math.sin(startAngle)
                );
                ctx.stroke();
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(name, wheelCanvas.width / 2 - 20, 5);
                ctx.restore();
            });
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
            
            wheelAnimation = requestAnimationFrame(animate);
        }
        
        animate();
    });
    
    // Fungsi untuk menampilkan soal matematika
    function showMathQuestion() {
        wheelSection.classList.add('hidden');
        mathSection.classList.remove('hidden');
        
        selectedPlayerSpan.textContent = currentPlayer;
        generateMathQuestion();
        answerInput.value = '';
        resultElement.classList.add('hidden');
        nextPlayerBtn.classList.add('hidden');
        answerInput.focus();
    }
    
    // Fungsi untuk menghasilkan soal matematika acak
    function generateMathQuestion() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                break;
        }
        
        currentQuestion = {
            question: `${num1} ${operation} ${num2} = ?`,
            answer: answer
        };
        
        questionElement.textContent = currentQuestion.question;
    }
    
    // Fungsi untuk memeriksa jawaban
    submitAnswerBtn.addEventListener('click', function() {
        const userAnswer = parseInt(answerInput.value);
        
        if (isNaN(userAnswer)) {
            alert('Masukkan jawaban yang valid!');
            return;
        }
        
        resultElement.classList.remove('hidden');
        
        if (userAnswer === currentQuestion.answer) {
            resultElement.textContent = 'Jawaban Benar! 🎉';
            resultElement.className = 'result correct';
        } else {
            resultElement.textContent = `Jawaban Salah! Jawaban yang benar adalah ${currentQuestion.answer}`;
            resultElement.className = 'result incorrect';
        }
        
        nextPlayerBtn.classList.remove('hidden');
    });
    
    // Fungsi untuk melanjutkan ke pemain berikutnya
    nextPlayerBtn.addEventListener('click', function() {
        mathSection.classList.add('hidden');
        wheelSection.classList.remove('hidden');
        drawWheel();
    });
    
    // Tambahkan nama default dari gambar
    names = [];
    updateNameList();
});