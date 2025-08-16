// Enhanced Golden Eagle Badminton App – core logic
let batches = JSON.parse(localStorage.getItem('batches')) || {};
let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
let loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || {};
let currentLoginType = 'Player';
let currentBatchId = null;
let currentGameStartTime = null;

const playerBtn = document.getElementById('playerBtn');
const adminBtn = document.getElementById('adminBtn');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const playerLogoutBtn = document.getElementById('playerLogoutBtn');
const playerSetupModal = document.getElementById('playerSetupModal');
const totalPlayersInput = document.getElementById('totalPlayersInput');
const playerNamesInputs = document.getElementById('playerNamesInputs');
const startGameBtn = document.getElementById('startGameBtn');
const endGameBtn = document.getElementById('endGameBtn');

/* ---------- Utility ---------- */
const fmt = d => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const dateToday = () => new Date().toLocaleDateString();

/* ---------- Login type toggle ---------- */
playerBtn.onclick = () => switchLoginType('Player');
adminBtn.onclick = () => switchLoginType('Admin');

function switchLoginType(type) {
  currentLoginType = type;
  if (type === 'Admin') {
    playerBtn.classList.remove('active');
    adminBtn.classList.add('active');
    document.getElementById('loginTypeText').innerHTML = 'Logging in as <strong>Admin</strong>';
  } else {
    adminBtn.classList.remove('active');
    playerBtn.classList.add('active');
    document.getElementById('loginTypeText').innerHTML = 'Logging in as <strong>Player</strong>';
  }
}

/* ---------- Form Submit ---------- */
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (currentLoginType === 'Admin') {
    if (username === 'admin.goldeneagle' && password === '8553314778') {
      loginHistory['admin.goldeneagle'] = { lastLogin: new Date().toISOString(), loginType: 'Admin' };
      localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('adminWelcome').style.display = 'block';
      updateAdminDashboard();
    } else {
      alert('Invalid admin credentials!');
    }
  } else {
    if (/^[A-Za-z]+$/.test(username) && /^[0-9]{10}$/.test(password)) {
      loginHistory[username] = { lastLogin: new Date().toISOString(), loginType: 'Player' };
      localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
      document.getElementById('loginSection').style.display = 'none';
      showPlayerSetupModal(username);
    } else {
      alert('Username (letters) & 10-digit mobile number required.');
    }
  }
  loginForm.reset();
});

/* ---------- Admin Dashboard ---------- */
function updateAdminDashboard() {
  const list = document.getElementById('adminBatchList');
  const today = dateToday();
  document.getElementById('currentDate').textContent = today;

  let html = '';
  Object.entries(batches).forEach(([date, arr]) => {
    html += `<h3>${date}</h3>
      <table>
        <thead>
          <tr><th>Batch</th><th>Start</th><th>End</th><th>Duration</th><th>Players</th><th>Host</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${arr.map(b => `
            <tr>
              <td>${b.batchNumber}</td>
              <td>${b.startTime}</td>
              <td>${b.endTime || '-'}</td>
              <td>${b.duration || '-'}</td>
              <td>${b.players.join(', ')}</td>
              <td>${b.mainPlayer}</td>
              <td>${b.status}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  });
  list.innerHTML = html || '<p>No batches yet.</p>';
}

/* ---------- Player Setup ---------- */
function showPlayerSetupModal(playerName) {
  playerSetupModal.style.display = 'flex';
  totalPlayersInput.value = '';
  playerNamesInputs.innerHTML = '';
  totalPlayersInput.onchange = () => {
    const count = parseInt(totalPlayersInput.value);
    playerNamesInputs.innerHTML = `
      <div>Player 1 (Host): <input value="${playerName}" readonly></div>
      <div>Host Contact: <input id="hostContact" placeholder="10-digit" maxlength="10"></div>`;
    for (let i = 2; i <= count; i++) {
      playerNamesInputs.insertAdjacentHTML('beforeend', `<div>Player ${i}: <input class="extraPlayer"></div>`);
    }
  };

  startGameBtn.onclick = () => {
    const contact = document.getElementById('hostContact')?.value.trim();
    if (!/^[0-9]{10}$/.test(contact)) return alert('Enter valid 10-digit contact.');
    const extras = [...document.querySelectorAll('.extraPlayer')].map(i => i.value.trim()).filter(Boolean);
    const total = parseInt(totalPlayersInput.value);
    if (extras.length + 1 !== total) return alert('Enter all player names.');
    const players = [playerName, ...extras];
    startGame(playerName, players, contact);
  };
}

/* ---------- Start Game ---------- */
function startGame(host, players, contact) {
  const today = dateToday();
  currentGameStartTime = new Date();
  if (!batches[today]) batches[today] = [];
  currentBatchId = `${today}-${batches[today].length + 1}`;
  batches[today].push({
    id: currentBatchId,
    batchNumber: batches[today].length + 1,
    startTime: currentGameStartTime.toLocaleTimeString(),
    players,
    mainPlayer: host,
    hostContactNumber: contact,
    status: 'active'
  });
  localStorage.setItem('batches', JSON.stringify(batches));
  showGameStartAnimation();
}

function showGameStartAnimation() {
  const modal = document.getElementById('gameStartModal');
  modal.style.display = 'flex';
  const timer = setInterval(() => {
    const dur = (Date.now() - currentGameStartTime) / 1000 / 60;
    document.getElementById('gameDuration').textContent = `Game Duration: ${Math.floor(dur)} min`;
  }, 5000);
  endGameBtn.onclick = () => endCurrentGame(timer);
}

function endCurrentGame(interval) {
  clearInterval(interval);
  const end = new Date();
  const durMin = Math.floor((end - currentGameStartTime) / 1000 / 60);
  const dur = `${Math.floor(durMin / 60)}h ${durMin % 60}m`;

  const today = dateToday();
  const b = batches[today].find(x => x.id === currentBatchId);
  if (b) {
    b.endTime = end.toLocaleTimeString();
    b.duration = dur;
    b.status = 'completed';
  }

  gameHistory.push({
    batchId: currentBatchId,
    date: today,
    startTime: b.startTime,
    endTime: b.endTime,
    duration: dur,
    players: b.players
  });

  localStorage.setItem('batches', JSON.stringify(batches));
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

  document.getElementById('gameStartModal').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  currentBatchId = null;
  currentGameStartTime = null;
}

/* ---------- Logout ---------- */
logoutBtn.onclick = () => {
  document.getElementById('adminWelcome').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
};
playerLogoutBtn.onclick = () => {
  document.getElementById('playerDashboard').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
};

/* ---------- Footer date ---------- */
document.getElementById('dateInfo').textContent =
  '📅 Today is ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });