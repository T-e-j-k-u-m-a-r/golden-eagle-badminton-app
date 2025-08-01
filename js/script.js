let currentLoginType = "Player";

const playerBtn = document.getElementById("playerBtn");
const adminBtn = document.getElementById("adminBtn");
const loginTypeText = document.getElementById("loginTypeText");
const loginForm = document.getElementById("loginForm");

playerBtn.addEventListener("click", () => {
  currentLoginType = "Player";
  playerBtn.classList.add("active");
  adminBtn.classList.remove("active");
  loginTypeText.innerHTML = `Logging in as <strong>Player</strong>`;
});

adminBtn.addEventListener("click", () => {
  currentLoginType = "Admin";
  adminBtn.classList.add("active");
  playerBtn.classList.remove("active");
  loginTypeText.innerHTML = `Logging in as <strong>Admin</strong>`;
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Temporary check - to be replaced with Firebase
  if (currentLoginType === "Admin" && username === "admin" && password === "admin") {
    alert("Admin login successful!");
  } else if (currentLoginType === "Player") {
    alert(`Player login successful! Welcome ${username}`);
  } else {
    alert("Invalid credentials!");
  }

  loginForm.reset();
});

// Footer date and day
const dateElement = document.getElementById("dateInfo");
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = `📅 Today is ${today.toLocaleDateString('en-US', options)}`;

