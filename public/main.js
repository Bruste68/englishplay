console.log("🔥 Main.js Build Version: 2025-05-23 19:00");

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function updateLoginUI() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const token = localStorage.getItem("jwtToken");

  if (!loginBtn || !signupBtn) return;

  if (token) {
    loginBtn.textContent = "로그아웃";
    loginBtn.style.background = "#666";
    loginBtn.onclick = () => {
      const confirmed = confirm("로그아웃 하시겠습니까?");
      if (confirmed) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loggedInUser");
        updateLoginUI();
      }
    };

    signupBtn.disabled = true;
    signupBtn.style.background = "#ccc";
    signupBtn.style.cursor = "not-allowed";
  } else {
    loginBtn.textContent = "로그인";
    loginBtn.style.background = "#00c851";
    loginBtn.onclick = () => {
      const modal = document.getElementById("loginModal");
      if (modal) {
        modal.style.display = "flex";
        showLogin();
      }
    };

    signupBtn.disabled = false;
    signupBtn.style.background = "#00c851";
    signupBtn.style.cursor = "pointer";
    signupBtn.onclick = () => {
      const modal = document.getElementById("loginModal");
      if (modal) {
        modal.style.display = "flex";
        showSignup();
      }
    };
  }
}

async function fetchMyInfo() {
  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.warn("/api/me 응답 실패", res.status);
      throw new Error("인증 실패");
    }

    await res.json();
  } catch (err) {
    localStorage.removeItem("jwtToken");
  }

  updateLoginUI();
}

function showMessage(message, type = "info", duration = 3000) {
  const msgBox = document.getElementById("authMessage");
  if (!msgBox) return;
  msgBox.textContent = message;
  msgBox.style.textAlign = "center";
  msgBox.style.fontSize = "1.2rem";
  msgBox.style.fontWeight = "bold";
  msgBox.style.padding = "10px";
  msgBox.style.background = "white";
  msgBox.style.color = type === "error" ? "red" : type === "success" ? "#007bff" : "black";
  if (type === "success") {
    setTimeout(() => { msgBox.textContent = ""; }, duration);
  }
}

function closeModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "none";
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

document.getElementById("tabLogin")?.addEventListener("click", showLogin);
document.getElementById("tabSignup")?.addEventListener("click", showSignup);

document.getElementById("findId")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("가입 시 입력했던 이메일을 입력해주세요:");
  if (!email || !isValidEmail(email)) {
    alert("유효한 이메일을 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    alert(data.exists ? "✅ 이 이메일은 가입된 계정입니다." : "❌ 이 이메일로 등록된 계정이 없습니다.");
  } catch {
    alert("⚠️ 서버 오류가 발생했습니다.");
  }
});

document.getElementById("findPassword")?.addEventListener("click", (e) => {
  e.preventDefault();
  alert("🔐 비밀번호 초기화는 현재 지원되지 않습니다.\n관리자에게 문의해주세요.");
});

function loginWithProvider(provider) {
  const redirectUri = encodeURIComponent('https://samspeakgo.com/oauth2callback.html');
  if (provider === 'google') {
    const clientId = '925681825495-78b1e74h3oilhd3qtv4g5e746gda5hk1.apps.googleusercontent.com';
    const scope = 'profile email';
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  } else if (provider === 'kakao') {
    const clientId = '9e5e840bebeea56af25cb779aebb865c';
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }
}

// optional dummy if referenced
function loginWithFacebook() {
  alert("🔗 페이스북 로그인 기능은 준비 중입니다.");
}

document.addEventListener("DOMContentLoaded", function () {
  const langSelect = document.getElementById("langSelect");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const signupEmailInput = document.getElementById("signupEmail");
  const emailStatusBox = document.getElementById("emailStatus");
  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");
  const modal = document.getElementById("loginModal");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const savedEmail = localStorage.getItem("rememberedEmail");
  const savedPassword = localStorage.getItem("rememberedPassword");
  const rememberEmailCheckbox = document.getElementById("rememberEmail");
  const rememberPasswordCheckbox = document.getElementById("rememberPassword");

  window.API_BASE = location.hostname === "localhost" ? "http://localhost:5000" : "https://samspeakgo.com";

  langSelect?.addEventListener("change", function () {
    if (this.value !== "#") window.location.href = this.value;
  });

  loginBtn?.addEventListener("click", () => modal && (modal.style.display = "flex", showLogin()));
  signupBtn?.addEventListener("click", () => modal && (modal.style.display = "flex", showSignup()));

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user_id = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!user_id || !password) return showMessage("❌ 로그인 실패: 아이디와 비밀번호는 필수입니다.", "error");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user_id, password })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        if (result.token) {
          localStorage.setItem("jwtToken", result.token);
        }

        localStorage.setItem("loggedInUser", result.user?.id || user_id);

        rememberEmailCheckbox?.checked
          ? localStorage.setItem("rememberedEmail", user_id)
          : localStorage.removeItem("rememberedEmail");

        rememberPasswordCheckbox?.checked
          ? localStorage.setItem("rememberedPassword", password)
          : localStorage.removeItem("rememberedPassword");

        await fetchMyInfo();
        updateLoginUI();
        setTimeout(closeModal, 1500);
      } else {
        showMessage("❌ 로그인 실패: " + result.message, "error");
      }
    } catch (err) {
      console.error("❌ 서버 응답 오류", err);
      showMessage("⚠️ 서버 연결 실패", "error");
    }
  });

  signupForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const user_id = document.getElementById("signupId").value.trim();
    const name = document.getElementById("signupName").value.trim();
    const birth = document.getElementById("signupBirth").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!user_id || !name || !birth) {
      return showMessage("📛 모든 필드를 입력해주세요", "error");
    }
    if (password.length < 8) {
      return showMessage("🔒 비밀번호는 최소 8자 이상", "error");
    }
    if (password !== confirm) {
      return showMessage("❗ 비밀번호가 일치하지 않습니다", "error");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
      return showMessage("📅 생년월일은 YYYY-MM-DD 형식으로 입력해주세요", "error");
    }

    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user_id, name, birth, password })
      });
      const result = await res.json();

      if (res.ok && result.success) {
        showMessage("🎉 가입 성공!", "success");
        setTimeout(() => {
          showLogin();
        }, 1500);
      } else {
        showMessage("🚫 가입 실패: " + (result.message || "알 수 없는 오류"), "error");
      }
    } catch (err) {
      showMessage("⚠️ 서버 오류: " + err.message, "error");
    }
  });

  if (savedEmail) {
    const loginIdInput = document.getElementById("loginId");
    if (loginIdInput) loginIdInput.value = savedEmail;
    if (rememberEmailCheckbox) rememberEmailCheckbox.checked = true;
  }
  if (savedPassword) {
    loginPasswordInput.value = savedPassword;
    document.getElementById("rememberPassword").checked = true;
  }

  signupEmailInput?.addEventListener("input", checkEmailAvailability);
  signupEmailInput?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkEmailAvailability();
    }
  });

  async function checkEmailAvailability() {
    const email = signupEmailInput.value.trim();
    if (!emailStatusBox || email === "") return emailStatusBox.textContent = "";

    if (!isValidEmail(email)) {
      emailStatusBox.textContent = "📛 이메일 형식이 올바르지 않거나 지원되지 않는 도메인입니다.";
      emailStatusBox.style.color = "red";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await res.json();
      if (result.exists) {
        emailStatusBox.textContent = "🚫 이미 가입된 이메일입니다.";
        emailStatusBox.style.color = "red";
      } else {
        emailStatusBox.textContent = "✅ 사용 가능한 이메일입니다.";
        emailStatusBox.style.color = "#007bff";
      }
    } catch (err) {
      emailStatusBox.textContent = "⚠️ 이메일 확인 중 오류";
      emailStatusBox.style.color = "red";
    }
  }

  fetchMyInfo();
  document.getElementById("tabLogin")?.addEventListener("click", showLogin);
  document.getElementById("tabSignup")?.addEventListener("click", showSignup);
});

window.showSignup = showSignup;
window.showLogin = showLogin;
window.closeModal = closeModal;
window.loginWithProvider = loginWithProvider;
window.loginWithFacebook = loginWithFacebook;