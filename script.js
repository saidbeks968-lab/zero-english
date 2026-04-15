// ==================== LESSONS DATA ====================
const lessons = {
    'm1l1': { name: '🔤 Alifbo va harflar', month: 1, order: 1 },
    'm1l2': { name: '📝 50 ta eng oddiy so\'z', month: 1, order: 2 },
    'm1l3': { name: '👋 Salomlashish va tanishtirish', month: 1, order: 3 },
    'm1l4': { name: '👤 Olmoshlar (I, You, He, She...)', month: 1, order: 4 },
    'm2l1': { name: '⚡ "to be" fe\'li (am/is/are)', month: 2, order: 1 },
    'm2l2': { name: '🎨 Ranglar va raqamlar', month: 2, order: 2 },
    'm2l3': { name: '📅 Hafta kunlari, oylar', month: 2, order: 3 },
    'm2l4': { name: '🏠 Mening uyim va oilam', month: 2, order: 4 },
    'm3l1': { name: '⏰ Hozirgi zamon (Present Simple)', month: 3, order: 1 },
    'm3l2': { name: '❓ So\'roq va inkor gaplar', month: 3, order: 2 },
    'm3l3': { name: '📖 O\'tgan zamon (Past Simple)', month: 3, order: 3 },
    'm3l4': { name: '🔮 Kelasi zamon (Future)', month: 3, order: 4 },
    'm4l1': { name: '✨ Present Perfect zamon', month: 4, order: 1 },
    'm4l2': { name: '📊 Taqqoslash (Comparative)', month: 4, order: 2 },
    'm4l3': { name: '🏆 Eng yuqori daraja (Superlative)', month: 4, order: 3 },
    'm4l4': { name: '💬 Modal fe\'llar', month: 4, order: 4 },
    'm5l1': { name: '🔗 Shart gaplar (If...)', month: 5, order: 1 },
    'm5l2': { name: '🎭 Passiv voice', month: 5, order: 2 },
    'm5l3': { name: '🗣️ Fikr bildirish', month: 5, order: 3 },
    'm5l4': { name: '📞 Telefonda suhbat', month: 5, order: 4 },
    'm6l1': { name: '🎤 Speaking practice', month: 6, order: 1 },
    'm6l2': { name: '📺 Real ingliz tili', month: 6, order: 2 },
    'm6l3': { name: '✍️ Ingliz tilida yozish', month: 6, order: 3 },
    'm6l4': { name: '🏁 Final test', month: 6, order: 4 }
};

const allLessonIds = Object.keys(lessons);
const totalLessons = allLessonIds.length;

// ==================== TIMER VARIABLES ====================
let lessonTimer = null;
let lessonTimeLeft = 0;
let currentLessonId = null;
let isTimerRunning = false;

// ==================== USER MANAGEMENT ====================
function register() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!firstName || !lastName || !email || !password) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }
    if (password !== confirmPassword) {
        alert("Parollar mos kelmadi!");
        return;
    }
    if (password.length < 4) {
        alert("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    if (users.find(u => u.email === email)) {
        alert("Bu email bilan ro'yxatdan o'tilgan!");
        return;
    }

    const newUser = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        registeredAt: new Date().toISOString(),
        completedLessons: [],
        startDate: new Date().toISOString(),
        streak: 0,
        lastActive: new Date().toISOString(),
        quizScores: {}
    };

    users.push(newUser);
    localStorage.setItem('zeroEnglishUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
    }));

    alert("Ro'yxatdan o'tish muvaffaqiyatli!");
    window.location.href = 'dashboard.html';
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert("Iltimos, email va parolni kiriting!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const user = users.find(u => (u.email === username || u.firstName === username) && u.password === password);

    if (!user) {
        alert("Email yoki parol xato!");
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }));

    window.location.href = 'dashboard.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// ==================== DASHBOARD ====================
function getAvailableLessons(completedLessons) {
    let available = [];
    for (let i = 0; i < allLessonIds.length; i++) {
        if (completedLessons.includes(allLessonIds[i])) {
            available.push(allLessonIds[i]);
        } else if (i === 0 || completedLessons.includes(allLessonIds[i-1])) {
            available.push(allLessonIds[i]);
            break;
        }
    }
    return available;
}

function loadDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').innerHTML = currentUser.firstName;

    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    let user = users.find(u => u.id === currentUser.id);
    
    if (!user) {
        logout();
        return;
    }

    let completedLessons = user.completedLessons || [];
    let startDate = user.startDate;

    // Update streak
    updateStreak(user);
    
    // Reminder check (3 days no activity)
    const lastActive = new Date(user.lastActive || user.startDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    const reminderCard = document.getElementById('reminderCard');
    if (reminderCard) {
        if (daysDiff >= 3) {
            reminderCard.style.display = 'flex';
            const daysLeftSpan = document.getElementById('daysLeft');
            if (daysLeftSpan) daysLeftSpan.innerHTML = daysDiff;
        } else {
            reminderCard.style.display = 'none';
        }
    }

    // Progress
    const completedCount = completedLessons.length;
    const progressPercent = (completedCount / totalLessons) * 100;
    const totalProgress = document.getElementById('totalProgress');
    const progressText = document.getElementById('progressText');
    const streakCount = document.getElementById('streakCount');
    const startDateSpan = document.getElementById('startDate');
    
    if (totalProgress) {
        totalProgress.style.width = progressPercent + '%';
        totalProgress.innerHTML = Math.round(progressPercent) + '%';
    }
    if (progressText) progressText.innerHTML = `${completedCount}/${totalLessons} dars tugatilgan`;
    if (streakCount) streakCount.innerHTML = user.streak || 0;
    if (startDateSpan) startDateSpan.innerHTML = new Date(startDate).toLocaleDateString('uz-UZ');

    // Certificate check
    const sixMonthsLater = new Date(startDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const isCompleted = completedCount === totalLessons;
    const isTimePassed = today >= sixMonthsLater;
    const certBtn = document.getElementById('certBtn');
    const certStatus = document.getElementById('certStatus');
    
    if (certBtn && certStatus) {
        if (isCompleted && isTimePassed) {
            certBtn.style.display = 'block';
            certStatus.innerHTML = '✅ Tayyor! Sertifikat olishingiz mumkin';
            certStatus.style.color = '#28a745';
        } else if (isCompleted && !isTimePassed) {
            certStatus.innerHTML = '⏳ 6 oy to‘liq bo‘lishini kuting';
            certStatus.style.color = '#ff9800';
        } else {
            certStatus.innerHTML = '❌ Avval barcha darslarni tugating';
            certStatus.style.color = '#dc3545';
        }
    }

    // Render months with lock logic
    const availableLessons = getAvailableLessons(completedLessons);
    
    for (let month = 1; month <= 6; month++) {
        renderMonthLessons(month, completedLessons, availableLessons);
    }

    // Motivation quotes
    showMotivation();
}

function renderMonthLessons(month, completedLessons, availableLessons) {
    const monthLessons = allLessonIds.filter(id => lessons[id].month === month);
    const container = document.getElementById(`month${month}Lessons`);
    if (!container) return;
    
    container.innerHTML = '';
    let monthCompletedCount = 0;
    
    monthLessons.forEach(lessonId => {
        const lesson = lessons[lessonId];
        const isCompleted = completedLessons.includes(lessonId);
        const isAvailable = availableLessons.includes(lessonId);
        
        if (isCompleted) monthCompletedCount++;
        
        const lessonDiv = document.createElement('div');
        lessonDiv.className = `lesson-item ${isCompleted ? 'completed' : ''} ${!isAvailable && !isCompleted ? 'locked' : ''}`;
        lessonDiv.innerHTML = `
            <div class="lesson-name">
                <span class="lesson-status">${isCompleted ? '✅' : (!isAvailable ? '🔒' : '📘')}</span>
                <span>${lesson.name}</span>
            </div>
            <button class="lesson-btn ${isCompleted ? 'completed-btn' : ''}" 
                onclick="${isAvailable || isCompleted ? `openLesson('${lessonId}')` : 'alert(\"Avval oldingi darsni tugating!\")'}"
                ${!isAvailable && !isCompleted ? 'disabled' : ''}>
                ${isCompleted ? 'Takrorlash' : (isAvailable ? 'Boshlash →' : '🔒 Qulflangan')}
            </button>
        `;
        container.appendChild(lessonDiv);
    });
    
    const monthProgress = (monthCompletedCount / monthLessons.length) * 100;
    const progressSpan = document.getElementById(`month${month}Progress`);
    if (progressSpan) {
        progressSpan.innerHTML = Math.round(monthProgress) + '%';
    }
}

function updateStreak(user) {
    const lastActive = new Date(user.lastActive || user.startDate);
    const today = new Date();
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
    } else if (diffDays > 1) {
        user.streak = 1;
    }
    
    user.lastActive = today.toISOString();
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem('zeroEnglishUsers', JSON.stringify(users));
    }
}

function showMotivation() {
    const quotes = [
        { en: '"The secret of getting ahead is getting started." - Mark Twain', uz: '"Oldinga chiqishning siri - boshlashdir."' },
        { en: '"Don\'t watch the clock; do what it does. Keep going." - Sam Levenson', uz: '"Soatga qaramang, uning qilganini qiling. Davom eting."' },
        { en: '"The harder you work for something, the greater you\'ll feel when you achieve it."', uz: '"Bir narsa uchun qancha ko\'p harakat qilsang, unga erishganingda shuncha ko\'p zavqlanasan."' },
        { en: '"Learning is a treasure that will follow its owner everywhere." - Chinese Proverb', uz: '"Bilim - egasini hamma joyda kuzatib boradigan xazina."' },
        { en: '"Today a reader, tomorrow a leader." - Margaret Fuller', uz: '"Bugun o\'quvchi, ertaga yetakchi."' },
        { en: '"The beautiful thing about learning is that no one can take it away from you." - B.B. King', uz: '"O\'rganishning go\'zalligi shundaki, uni hech kim sizdan tortib ololmaydi."' }
    ];
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    const motivationText = document.getElementById('motivationText');
    const motivationUz = document.getElementById('motivationUz');
    if (motivationText) motivationText.innerHTML = random.en;
    if (motivationUz) motivationUz.innerHTML = random.uz;
}

function startFirstLesson() {
    openLesson('m1l1');
}

// ==================== 20 MINUTE LESSON SYSTEM ====================

function getFullLessonContent(lessonId) {
    const contents = {
        'm1l1': `
            <h3>🔤 Ingliz Alifbosi - To'liq dars (20 daqiqa)</h3>
            
            <div class="tip-box">
                💡 <strong>Maqsad:</strong> 20 daqiqa ichida ingliz alifbosini to'liq o'rganasiz!
            </div>
            
            <h4>📚 1-qism: 26 ta harf va talaffuz (7 daqiqa)</h4>
            <p>Ingliz tilida 26 ta harf bor. Quyida harflar va ularning o'zbekcha talaffuzi:</p>
            <table>
                <tr><th>Harf</th><th>Talaffuz</th><th>Misol so'z</th><th>Tarjimasi</th></tr>
                <tr><td>A a</td><td>ey</td><td>Apple</td><td>Olma</td></tr>
                <tr><td>B b</td><td>bi</td><td>Boy</td><td>Bola</td></tr>
                <tr><td>C c</td><td>si</td><td>Cat</td><td>Mushuk</td></tr>
                <tr><td>D d</td><td>di</td><td>Dog</td><td>It</td></tr>
                <tr><td>E e</td><td>i</td><td>Egg</td><td>Tuxum</td></tr>
                <tr><td>F f</td><td>ef</td><td>Fish</td><td>Baliq</td></tr>
                <tr><td>G g</td><td>ji</td><td>Girl</td><td>Qiz</td></tr>
                <tr><td>H h</td><td>eych</td><td>Hat</td><td>Shapka</td></tr>
                <tr><td>I i</td><td>ay</td><td>Ice</td><td>Muz</td></tr>
                <tr><td>J j</td><td>jey</td><td>Juice</td><td>Sharbat</td></tr>
                <tr><td>K k</td><td>key</td><td>Kite</td><td>Varrak</td></tr>
                <tr><td>L l</td><td>el</td><td>Leg</td><td>Oyoq</td></tr>
                <tr><td>M m</td><td>em</td><td>Mother</td><td>Ona</td></tr>
                <tr><td>N n</td><td>en</td><td>Nose</td><td>Burun</td></tr>
                <tr><td>O o</td><td>ou</td><td>Orange</td><td>Apelsin</td></tr>
                <tr><td>P p</td><td>pi</td><td>Pen</td><td>Qalam</td></tr>
                <tr><td>Q q</td><td>kyu</td><td>Queen</td><td>Malika</td></tr>
                <tr><td>R r</td><td>ar</td><td>Red</td><td>Qizil</td></tr>
                <tr><td>S s</td><td>es</td><td>Sun</td><td>Quyosh</td></tr>
                <tr><td>T t</td><td>ti</td><td>Tea</td><td>Choy</td></tr>
                <tr><td>U u</td><td>yu</td><td>Umbrella</td><td>Soyabon</td></tr>
                <tr><td>V v</td><td>vi</td><td>Violin</td><td>Skripka</td></tr>
                <tr><td>W w</td><td>dabliyu</td><td>Water</td><td>Suv</td></tr>
                <tr><td>X x</td><td>eks</td><td>X-ray</td><td>Rentgen</td></tr>
                <tr><td>Y y</td><td>way</td><td>Yellow</td><td>Sariq</td></tr>
                <tr><td>Z z</td><td>zed</td><td>Zebra</td><td>Zebra</td></tr>
            </table>
            
            <h4>📝 2-qism: Unlilar va undoshlar (3 daqiqa)</h4>
            <div class="example-box">
                <p><strong>Unlilar (Vowels):</strong> A, E, I, O, U (5 ta harf)</p>
                <p><strong>Undoshlar (Consonants):</strong> Qolgan 21 ta harf</p>
                <p>🎵 <strong>Qo'shiq:</strong> A-E-I-O-U (ovoz chiqarib ayting)</p>
            </div>
            
            <h4>🎯 3-qism: Amaliy mashq (5 daqiqa)</h4>
            <p>Quyidagi so'zlarni harflab ko'ring:</p>
            <ul>
                <li>CAT → C - A - T</li>
                <li>DOG → D - O - G</li>
                <li>SUN → S - U - N</li>
                <li>BIRD → B - I - R - D</li>
                <li>FISH → F - I - S - H</li>
            </ul>
            
            <h4>✍️ 4-qism: Yozish mashqi (5 daqiqa)</h4>
            <div class="warning-box">
                <p><strong>Vazifa:</strong></p>
                <ol>
                    <li>O'z ismingizni ingliz harflari bilan yozing: ___________</li>
                    <li>Alfabetni 3 marta ovoz chiqarib o'qing</li>
                    <li>Qo'shningizga alifboni aytib bering</li>
                </ol>
            </div>
            
            <div class="tip-box">
                ⭐ <strong>Esda tuting!</strong> Ingliz alifbosini har kuni takrorlang. 5 kundan keyin eslab qolasiz!
            </div>
        `,
        
        'm1l2': `
            <h3>📝 50 ta eng oddiy so'z - To'liq dars (20 daqiqa)</h3>
            
            <div class="tip-box">
                💡 <strong>Maqsad:</strong> 20 daqiqa ichida 50 ta eng kerakli so'zni o'rganasiz!
            </div>
            
            <h4>🎯 1-qism: Salomlashish so'zlari (4 daqiqa)</h4>
            <table>
                <tr><th>Inglizcha</th><th>O'zbekcha</th><th>Ishlatilishi</th></tr>
                <tr><td>Hello</td><td>Salom</td><td>Har qanday vaziyatda</td></tr>
                <tr><td>Hi</td><td>Salom</td><td>Do'stlar orasida</td></tr>
                <tr><td>Good morning</td><td>Xayrli tong</td><td>00:00 - 12:00</td></tr>
                <tr><td>Good afternoon</td><td>Xayrli kun</td><td>12:00 - 18:00</td></tr>
                <tr><td>Good evening</td><td>Xayrli kech</td><td>18:00 - 00:00</td></tr>
                <tr><td>Good night</td><td>Xayrli tun</td><td>Uyqudan oldin</td></tr>
                <tr><td>Goodbye</td><td>Xayr</td><td>Rasmiy</td></tr>
                <tr><td>Bye</td><td>Xayr</td><td>Norasmiy</td></tr>
            </table>
            
            <h4>🙏 2-qism: Xushmuomalalik so'zlari (4 daqiqa)</h4>
            <table>
                <tr><th>Inglizcha</th><th>O'zbekcha</th></tr>
                <tr><td>Please</td><td>Iltimos</td></tr>
                <tr><td>Thank you</td><td>Rahmat</td></tr>
                <tr><td>Thanks</td><td>Rahmat (qisqa)</td></tr>
                <tr><td>You're welcome</td><td>Arzimaydi</td></tr>
                <tr><td>Sorry</td><td>Kechirasiz</td></tr>
                <tr><td>Excuse me</td><td>Kechirasiz (e'tibor uchun)</td></tr>
                <tr><td>Yes</td><td>Ha</td></tr>
                <tr><td>No</td><td>Yo'q</td></tr>
            </table>
            
            <h4>👤 3-qism: Tanishtirish so'zlari (4 daqiqa)</h4>
            <table>
                <tr><th>Inglizcha</th><th>O'zbekcha</th></tr>
                <tr><td>What's your name?</td><td>Ismingiz nima?</td></tr>
                <tr><td>My name is...</td><td>Mening ismim...</td></tr>
                <tr><td>I am...</td><td>Men ...man</td></tr>
                <tr><td>Nice to meet you</td><td>Tanishganimdan xursandman</td></tr>
                <tr><td>How are you?</td><td>Qalaysiz?</td></tr>
                <tr><td>I'm fine, thank you</td><td>Yaxshi, rahmat</td></tr>
                <tr><td>And you?</td><td>Sizchi?</td></tr>
            </table>
            
            <h4>💬 4-qism: Amaliy suhbat (4 daqiqa)</h4>
            <div class="example-box">
                <p><strong>Dialogni o'qing va takrorlang:</strong></p>
                <p><strong>A:</strong> Hello! What's your name?</p>
                <p><strong>B:</strong> Hi! My name is John.</p>
                <p><strong>A:</strong> Nice to meet you, John! How are you?</p>
                <p><strong>B:</strong> I'm fine, thank you. And you?</p>
                <p><strong>A:</strong> I'm good, thanks!</p>
                <p><strong>B:</strong> Goodbye!</p>
                <p><strong>A:</strong> Bye!</p>
            </div>
            
            <h4>✍️ 5-qism: Yozma mashq (4 daqiqa)</h4>
            <div class="warning-box">
                <p><strong>Vazifa:</strong> O'zingiz va do'stingiz o'rtasidagi suhbatni yozing (6 ta gap):</p>
                <p>_________________________________________</p>
                <p>_________________________________________</p>
                <p>_________________________________________</p>
            </div>
        `,
        
        'm1l3': `
            <h3>👋 Salomlashish va tanishtirish - To'liq dars (20 daqiqa)</h3>
            
            <div class="tip-box">
                💡 <strong>Maqsad:</strong> 20 daqiqa ichida ingliz tilida salomlashish va tanishtirishni o'rganasiz!
            </div>
            
            <h4>🌅 1-qism: Kun vaqtiga qarab salomlashish (5 daqiqa)</h4>
            <div class="example-box">
                <ul>
                    <li><strong>Good morning</strong> - ertalab (00:00 - 12:00)</li>
                    <li><strong>Good afternoon</strong> - tushdan keyin (12:00 - 18:00)</li>
                    <li><strong>Good evening</strong> - kechqurun (18:00 - 00:00)</li>
                    <li><strong>Good night</strong> - tun (uyquga ketishdan oldin)</li>
                </ul>
            </div>
            
            <h4>💼 2-qism: Rasmiy va norasmiy salomlashish (5 daqiqa)</h4>
            <p><strong>📌 Rasmiy (kattalar, ish, o'qituvchilar bilan):</strong></p>
            <ul>
                <li>Good morning, sir/madam</li>
                <li>How do you do?</li>
                <li>It's a pleasure to meet you</li>
            </ul>
            <p><strong>📌 Norasmiy (do'stlar, tengdoshlar bilan):</strong></p>
            <ul>
                <li>Hey! / Hi!</li>
                <li>What's up?</li>
                <li>How's it going?</li>
                <li>Long time no see!</li>
            </ul>
            
            <h4>📝 3-qism: Tanishtirish iboralari (5 daqiqa)</h4>
            <table>
                <tr><th>Inglizcha</th><th>O'zbekcha</th></tr>
                <tr><td>Let me introduce myself</td><td>O'zimni tanishtirishga ruxsat eting</td></tr>
                <tr><td>This is my friend</td><td>Bu mening do'stim</td></tr>
                <tr><td>I'd like you to meet...</td><td>Sizni ... bilan tanishtirmoqchiman</td></tr>
                <tr><td>Where are you from?</td><td>Qayerliksiz?</td></tr>
                <tr><td>I'm from Uzbekistan</td><td>Men O'zbekistondanman</td></tr>
                <tr><td>What do you do?</td><td>Nima ish qilasiz?</td></tr>
                <tr><td>I'm a student</td><td>Men talabaman</td></tr>
            </table>
            
            <h4>🎭 4-qism: Rolli o'yin (5 daqiqa)</h4>
            <div class="warning-box">
                <p><strong>Vazifa:</strong> Quyidagi vaziyatlar uchun dialog tuzing:</p>
                <ol>
                    <li>Birinchi marta uchrashayotgan qo'shningiz bilan</li>
                    <li>Ertalab maktabda o'qituvchingiz bilan</li>
                    <li>Kechqurun do'stingiz bilan ko'chada uchrashdingiz</li>
                </ol>
                <p>Javoblaringizni yozing: _________________</p>
            </div>
        `,
        
        'm1l4': `
            <h3>👤 Olmoshlar (Pronouns) - To'liq dars (20 daqiqa)</h3>
            
            <div class="tip-box">
                💡 <strong>Maqsad:</strong> 20 daqiqa ichida ingliz tilidagi olmoshlarni to'liq o'rganasiz!
            </div>
            
            <h4>📚 1-qism: Olmoshlar jadvali (5 daqiqa)</h4>
            <table>
                <tr style="background:#667eea; color:white;"><th>Inglizcha</th><th>O'zbekcha</th><th>Misol</th></tr>
                <tr><td>I</td><td>Men</td><td>I am a student.</td></tr>
                <tr><td>You</td><td>Sen / Siz</td><td>You are my friend.</td></tr>
                <tr><td>He</td><td>U (erkak)</td><td>He is a doctor.</td></tr>
                <tr><td>She</td><td>U (ayol)</td><td>She is a teacher.</td></tr>
                <tr><td>It</td><td>U (narsa/hayvon)</td><td>It is a cat.</td></tr>
                <tr><td>We</td><td>Biz</td><td>We are happy.</td></tr>
                <tr><td>They</td><td>Ular</td><td>They are friends.</td></tr>
            </table>
            
            <h4>🎯 2-qism: Olmoshlarni qo'llash qoidalari (5 daqiqa)</h4>
            <div class="example-box">
                <ul>
                    <li><strong>He</strong> - faqat erkaklar uchun (otam, akam, erkak o'qituvchi)</li>
                    <li><strong>She</strong> - faqat ayollar uchun (onam, opam, ayol o'qituvchi)</li>
                    <li><strong>It</strong> - jonsiz narsalar, hayvonlar, ob-havo</li>
                    <li><strong>They</strong> - ko'plikdagi hamma narsa uchun</li>
                </ul>
            </div>
            
            <h4>✍️ 3-qism: Amaliy mashqlar (5 daqiqa)</h4>
            <div class="warning-box">
                <p>Bo'sh joylarga to'g'ri olmoshni qo'ying:</p>
                <ol>
                    <li>_____ am a teacher. (Men)</li>
                    <li>_____ is my brother. (U - erkak)</li>
                    <li>_____ are students. (Ular)</li>
                    <li>_____ is a book. (U - narsa)</li>
                    <li>_____ are my parents. (Ular)</li>
                    <li>_____ is a doctor. (U - ayol)</li>
                    <li>_____ are going to school. (Biz)</li>
                </ol>
            </div>
            
            <h4>💬 4-qism: Gap tuzish (5 daqiqa)</h4>
            <div class="warning-box">
                <p><strong>Vazifa:</strong> Quyidagi olmoshlar bilan 7 ta gap tuzing:</p>
                <ul>
                    <li>I → _________________________________</li>
                    <li>You → _________________________________</li>
                    <li>He → _________________________________</li>
                    <li>She → _________________________________</li>
                    <li>It → _________________________________</li>
                    <li>We → _________________________________</li>
                    <li>They → _________________________________</li>
                </ul>
            </div>
        `
    };
    
    // Default content for lessons not yet customized
    const defaultContent = `
        <h3>📖 ${lessons[lessonId]?.name || 'Dars'}</h3>
        <div class="tip-box">
            💡 <strong>Bu darsni o'rganish uchun 20 daqiqa vaqt ajrating!</strong>
        </div>
        <h4>📚 Dars mazmuni</h4>
        <p>${lessons[lessonId]?.content || 'Dars mazmuni tayyorlanmoqda. Iltimos, keyinroq qaytib keling.'}</p>
        <h4>✍️ Amaliy mashqlar</h4>
        <ul>
            <li>Mavzuga oid 10 ta yangi so'z yozing</li>
            <li>Har bir so'z bilan gap tuzing</li>
            <li>O'rganganlaringizni ovoz chiqarib takrorlang</li>
            <li>Do'stingiz bilan suhbat quring</li>
        </ul>
        <div class="warning-box">
            <p><strong>📝 Vazifa:</strong> O'rganganlaringizni qog'ozga yozing va 3 marta takrorlang!</p>
        </div>
    `;
    
    return contents[lessonId] || defaultContent;
}

function startLessonTimer(seconds) {
    if (lessonTimer) {
        clearInterval(lessonTimer);
    }
    
    lessonTimeLeft = seconds;
    updateTimerDisplay();
    
    lessonTimer = setInterval(() => {
        if (lessonTimeLeft <= 0) {
            clearInterval(lessonTimer);
            lessonTimer = null;
            isTimerRunning = false;
            
            const completeBtn = document.getElementById('completeLessonBtn');
            const timerDisplay = document.getElementById('timerDisplay');
            
            if (completeBtn) {
                completeBtn.style.display = 'block';
                completeBtn.disabled = false;
            }
            if (timerDisplay) {
                timerDisplay.innerHTML = "✅ Tayyor!";
                timerDisplay.style.color = '#28a745';
            }
            
            const timerProgress = document.getElementById('timerProgress');
            if (timerProgress) {
                timerProgress.style.width = '0%';
                timerProgress.style.background = '#28a745';
            }
        } else {
            lessonTimeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
    
    isTimerRunning = true;
}

function updateTimerDisplay() {
    const minutes = Math.floor(lessonTimeLeft / 60);
    const seconds = lessonTimeLeft % 60;
    const display = document.getElementById('timerDisplay');
    const progress = document.getElementById('timerProgress');
    
    if (display) {
        display.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (progress) {
        const percent = (lessonTimeLeft / 1200) * 100;
        progress.style.width = percent + '%';
    }
}

function openLesson(lessonId) {
    const lesson = lessons[lessonId];
    if (!lesson) return;
    
    currentLessonId = lessonId;
    
    // Stop any existing timer
    if (lessonTimer) {
        clearInterval(lessonTimer);
        lessonTimer = null;
    }
    
    const fullContent = getFullLessonContent(lessonId);
    
    const modal = document.getElementById('lessonModal');
    const content = document.getElementById('lessonContent');
    
    content.innerHTML = `
        <div class="lesson-header">
            <h2 class="lesson-title">📖 ${lesson.name}</h2>
            <div class="timer-container">
                <div class="timer-display" id="timerDisplay">20:00</div>
                <div class="timer-bar">
                    <div class="timer-progress" id="timerProgress" style="width: 100%"></div>
                </div>
                <div class="timer-text">
                    <i>⏰</i> Darsni tugatish uchun 20 daqiqa (1200 soniya) o'qishingiz kerak!
                    <br><small>Sahifani yopmang, taymer to'xtab qoladi!</small>
                </div>
            </div>
        </div>
        <div class="lesson-body">
            ${fullContent}
        </div>
        <button id="completeLessonBtn" class="next-btn" style="display: none;" onclick="completeLesson('${lessonId}')">
            ✅ Darsni tugatish (20 daqiqa to'ldi)
        </button>
    `;
    
    modal.style.display = 'block';
    
    // Start the 20 minute timer (1200 seconds)
    startLessonTimer(1200);
}

function completeLesson(lessonId) {
    // Check if timer is done
    if (lessonTimeLeft > 0) {
        alert("⏰ Darsni tugatish uchun 20 daqiqa to'liq o'qishingiz kerak! Iltimos, darsni oxirigacha o'qing.");
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        let completed = users[userIndex].completedLessons || [];
        if (!completed.includes(lessonId)) {
            completed.push(lessonId);
            users[userIndex].completedLessons = completed;
            localStorage.setItem('zeroEnglishUsers', JSON.stringify(users));
            
            // Update current user
            localStorage.setItem('currentUser', JSON.stringify({
                id: users[userIndex].id,
                firstName: users[userIndex].firstName,
                lastName: users[userIndex].lastName,
                email: users[userIndex].email
            }));
            
            // Show celebration
            alert("🎉 Tabriklaymiz! Dars muvaffaqiyatli tugatildi!\n⭐ Siz 1 yulduzcha va 10 ball oldingiz!\n📚 Davom eting!");
        }
    }
    
    // Clear timer
    if (lessonTimer) {
        clearInterval(lessonTimer);
        lessonTimer = null;
    }
    
    closeModal();
    loadDashboard();
}

function closeModal() {
    const modal = document.getElementById('lessonModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Clear timer when modal is closed
    if (lessonTimer) {
        clearInterval(lessonTimer);
        lessonTimer = null;
    }
    
    isTimerRunning = false;
    currentLessonId = null;
}

function goToCertificate() {
    window.location.href = 'certificate.html';
}

// ==================== PARENT PANEL ====================
function searchChild() {
    const firstName = document.getElementById('parentFirstName').value.trim();
    const lastName = document.getElementById('parentLastName').value.trim();
    
    if (!firstName || !lastName) {
        alert("Iltimos, ism va familiyani kiriting!");
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const child = users.find(u => u.firstName === firstName && u.lastName === lastName);
    
    const resultDiv = document.getElementById('childResult');
    
    if (!child) {
        resultDiv.innerHTML = `<div style="background:#ffebee; padding:15px; border-radius:10px; color:#c62828;">❌ "${firstName} ${lastName}" ismli o‘quvchi topilmadi.</div>`;
        resultDiv.style.display = 'block';
        return;
    }
    
    const completed = child.completedLessons?.length || 0;
    const progress = (completed / totalLessons) * 100;
    const startDate = new Date(child.startDate);
    const today = new Date();
    const monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    
    resultDiv.innerHTML = `
        <div style="background:#e8f5e9; padding:20px; border-radius:15px;">
            <h3>📊 ${child.firstName} ${child.lastName}</h3>
            <p>✅ Tugatilgan darslar: ${completed}/${totalLessons}</p>
            <div class="big-progress-bar" style="margin:10px 0;">
                <div class="big-progress" style="width: ${progress}%; background:#28a745;">${Math.round(progress)}%</div>
            </div>
            <p>📅 Boshlangan sana: ${startDate.toLocaleDateString('uz-UZ')}</p>
            <p>⏳ O'tgan oylar: ${monthsPassed} oy</p>
            <p>🔥 Kunlik streak: ${child.streak || 0} kun</p>
            ${progress === 100 ? '<p style="color:#28a745; font-weight:bold;">🎉 Sertifikat olishga tayyor!</p>' : ''}
        </div>
    `;
    resultDiv.style.display = 'block';
}
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // O'ZGARTIRILGAN: username = SA1D, password = 12-=[] 
    if (username === 'SA1D' && password === '12-=[]') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadUsersTable();
    } else {
        alert("Xato! Username yoki parol noto'g'ri!");
    }
}

function loadUsersTable() {
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const container = document.getElementById('usersTable');
    
    if (users.length === 0) {
        container.innerHTML = '<p>Hech qanday o‘quvchi yo‘q.</p>';
        return;
    }
    
    let html = '<table class="users-table"><tr><th>ID</th><th>Ism</th><th>Familiya</th><th>Email</th><th>Parol</th><th>Darslar</th><th>Streak</th><th>Boshlangan</th><th></th></tr>';
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.password}</td>
                <td>${user.completedLessons?.length || 0}/${totalLessons}</td>
                <td>${user.streak || 0} kun</td>
                <td>${new Date(user.startDate).toLocaleDateString()}</td>
                <td><button class="delete-btn" onclick="deleteUser(${user.id})">🗑️</button></td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

function deleteUser(userId) {
    if (confirm("O‘quvchini o‘chirmoqchimisiz?")) {
        let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('zeroEnglishUsers', JSON.stringify(users));
        loadUsersTable();
    }
}

function adminLogout() {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

// ==================== COMPETITION ====================
const monthlyQuestions = [
    { question: "What is 'Hello' in Uzbek?", options: ["Salom", "Xayr", "Rahmat", "Iltimos"], correct: 0 },
    { question: "How do you say 'Thank you' in English?", options: ["Please", "Sorry", "Thank you", "Hello"], correct: 2 },
    { question: "What is the color 'Red' in Uzbek?", options: ["Ko'k", "Yashil", "Qizil", "Sariq"], correct: 2 },
    { question: "'I am a student' - What does 'am' mean?", options: ["Men", "San", "...man", "...san"], correct: 2 },
    { question: "What is 'Mother' in English?", options: ["Father", "Mother", "Brother", "Sister"], correct: 1 },
    { question: "What is 'Book' in Uzbek?", options: ["Qalam", "Kitob", "Stol", "Deraza"], correct: 1 },
    { question: "How do you say 'Good morning'?", options: ["Good night", "Good evening", "Good morning", "Good bye"], correct: 2 },
    { question: "What is 'Apple' in Uzbek?", options: ["Olma", "Banan", "Anor", "Uzum"], correct: 0 },
    { question: "'I go to school' - What is 'go' in Uzbek?", options: ["Kelmoq", "Borish", "Turmoq", "O'tirmoq"], correct: 1 },
    { question: "What is 'Happy' in Uzbek?", options: ["Xafa", "Baxtli", "Kichik", "Katta"], correct: 1 }
];

let userAnswers = new Array(10).fill(null);

function loadCompetition() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const quizKey = `${currentYear}-${currentMonth}`;
    const hasTaken = user.quizScores && user.quizScores[quizKey];
    
    const statusDiv = document.getElementById('competitionStatus');
    const submitBtn = document.getElementById('submitQuizBtn');
    
    if (statusDiv) {
        if (hasTaken) {
            statusDiv.innerHTML = `<div style="background:#e8f5e9; padding:15px; border-radius:10px;">✅ Siz bu oyning testini topshirgansiz! Ball: ${hasTaken}/10</div>`;
            if (submitBtn) submitBtn.style.display = 'none';
        } else {
            statusDiv.innerHTML = `<div style="background:#fff3e0; padding:15px; border-radius:10px;">📝 Bu oyning testi! 10 ta savolga javob bering.</div>`;
            if (submitBtn) submitBtn.style.display = 'block';
        }
    }
    
    // Render questions
    const container = document.getElementById('quizQuestions');
    if (container) {
        let html = '';
        monthlyQuestions.forEach((q, index) => {
            html += `
                <div class="question-card">
                    <p>${index+1}. ${q.question}</p>
                    ${q.options.map((opt, optIndex) => `
                        <div class="question-option" data-q="${index}" data-opt="${optIndex}" onclick="selectAnswer(${index}, ${optIndex})">
                            ${String.fromCharCode(65+optIndex)}. ${opt}
                        </div>
                    `).join('')}
                </div>
            `;
        });
        container.innerHTML = html;
    }
    
    loadRanking();
}

function selectAnswer(questionIndex, optionIndex) {
    userAnswers[questionIndex] = optionIndex;
    
    const container = document.getElementById('quizQuestions');
    if (container) {
        const questionDivs = container.querySelectorAll('.question-card');
        if (questionDivs[questionIndex]) {
            const options = questionDivs[questionIndex].querySelectorAll('.question-option');
            options.forEach(opt => opt.classList.remove('selected'));
            if (options[optionIndex]) options[optionIndex].classList.add('selected');
        }
    }
}

function submitQuiz() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === null) {
            alert(`Iltimos, ${i+1}-savolga javob bering!`);
            return;
        }
    }
    
    let score = 0;
    for (let i = 0; i < monthlyQuestions.length; i++) {
        if (userAnswers[i] === monthlyQuestions[i].correct) {
            score++;
        }
    }
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const quizKey = `${currentYear}-${currentMonth}`;
        if (!users[userIndex].quizScores) users[userIndex].quizScores = {};
        users[userIndex].quizScores[quizKey] = score;
        localStorage.setItem('zeroEnglishUsers', JSON.stringify(users));
    }
    
    alert(`🎉 Test yakunlandi! Sizning ballingiz: ${score}/10`);
    location.reload();
}

function loadRanking() {
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const quizKey = `${currentYear}-${currentMonth}`;
    
    const rankings = users.map(user => ({
        name: `${user.firstName} ${user.lastName}`,
        score: (user.quizScores && user.quizScores[quizKey]) || 0
    })).sort((a, b) => b.score - a.score).slice(0, 10);
    
    const container = document.getElementById('rankingList');
    if (container) {
        if (rankings.length === 0) {
            container.innerHTML = '<p>Hali hech kim test topshirmagan.</p>';
            return;
        }
        
        let html = '<ul class="ranking-list">';
        rankings.forEach((r, i) => {
            html += `<li><span>${i+1}. ${r.name}</span><span>⭐ ${r.score}/10</span></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    }
}

// ==================== CERTIFICATE ====================
function loadCertificate() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('zeroEnglishUsers') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) return;
    
    const completedCount = (user.completedLessons || []).length;
    const startDate = new Date(user.startDate);
    const sixMonthsLater = new Date(startDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const today = new Date();
    
    if (completedCount !== totalLessons || today < sixMonthsLater) {
        alert("Sertifikat olish uchun barcha 24 darsni tugatib, 6 oy to'liq bo'lishi kerak!");
        window.location.href = 'dashboard.html';
        return;
    }
    
    const certFirstName = document.getElementById('certFirstName');
    const certLastName = document.getElementById('certLastName');
    const certDate = document.getElementById('certDate');
    
    if (certFirstName) certFirstName.innerHTML = user.firstName;
    if (certLastName) certLastName.innerHTML = user.lastName;
    if (certDate) certDate.innerHTML = today.toLocaleDateString('uz-UZ');
}

function downloadCertificate() {
    const certificate = document.getElementById('certificateForDownload');
    
    if (typeof html2canvas !== 'undefined') {
        html2canvas(certificate, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `ZeroEnglish_Sertifikat_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }).catch(err => {
            alert("Sertifikat yuklab olishda xatolik yuz berdi.");
        });
    } else {
        alert("html2canvas yuklanmadi. Iltimos, internet ulanishini tekshiring.");
    }
}

// ==================== INITIALIZATION ====================
if (document.body.classList.contains('auth-page') && window.location.pathname.includes('index.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'dashboard.html';
    }
} else if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
} else if (window.location.pathname.includes('certificate.html')) {
    loadCertificate();
} else if (window.location.pathname.includes('competition.html')) {
    loadCompetition();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('lessonModal');
    if (event.target === modal) {
        closeModal();
    }
}