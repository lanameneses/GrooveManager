const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

async function checkCurrentSession() {
  const response = await fetch("/api/session");

  if (response.ok) {
    window.location.href = "/stock.html";
  }
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginMessage.textContent = "A verificar os dados...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Não foi possível iniciar sessão.");
    }

    loginMessage.textContent = "Sessão iniciada.";
    window.location.href = "/stock.html";
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
  }
});

checkCurrentSession().catch(() => {
  loginMessage.textContent = "Não foi possível verificar a sessão.";
});
