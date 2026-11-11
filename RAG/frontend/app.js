/* Cognito Hosted UI / SDK-free browser flow.
 * Configure the Cognito User Pool and app client first.
 * This starter uses Cognito USER_PASSWORD_AUTH via InitiateAuth.
 * Enable this auth flow on the app client; use a production-grade
 * hosted UI + authorization-code/PKCE flow for production deployments.
 */
const CONFIG = {
  region: "ap-south-1",
  userPoolClientId: "REPLACE_WITH_USER_POOL_CLIENT_ID",
  apiUrl: "REPLACE_WITH_API_GATEWAY_URL"
};

const $ = (id) => document.getElementById(id);
const loginPanel = $("loginPanel");
const chatPanel = $("chatPanel");
const logoutButton = $("logoutButton");
const loginMessage = $("loginMessage");
const chatMessage = $("chatMessage");
const messages = $("messages");
let idToken = sessionStorage.getItem("rag_id_token") || "";

function showAuthenticated(authenticated) {
  loginPanel.classList.toggle("hidden", authenticated);
  chatPanel.classList.toggle("hidden", !authenticated);
  logoutButton.classList.toggle("hidden", !authenticated);
}
function addMessage(role, text, citations = []) {
  const welcome = messages.querySelector(".welcome");
  if (welcome) welcome.remove();
  const card = document.createElement("div");
  card.className = `message-card ${role}`;
  card.textContent = text;
  if (role === "assistant" && citations.length) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "sources";
    const title = document.createElement("strong");
    title.textContent = "Sources";
    sourceBox.append(title);
    citations.forEach((citation, index) => {
      const line = document.createElement("div");
      const location = citation.location || {};
      const uri = location.s3Location?.uri || location.webLocation?.url || "";
      const label = citation.title || uri || `Source ${index + 1}`;
      if (uri.startsWith("https://")) {
        const a = document.createElement("a");
        a.href = uri;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = label;
        line.append(a);
      } else {
        line.textContent = label;
      }
      sourceBox.append(line);
    });
    card.append(sourceBox);
  }
  messages.append(card);
  messages.scrollTop = messages.scrollHeight;
}
function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}
function tokenIsValid(token) {
  const payload = decodeJwtPayload(token);
  return Boolean(payload && payload.exp * 1000 > Date.now());
}
if (idToken && tokenIsValid(idToken)) showAuthenticated(true);
else { sessionStorage.removeItem("rag_id_token"); idToken = ""; showAuthenticated(false); }

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  const button = $("loginButton");
  button.disabled = true;
  try {
    if (CONFIG.userPoolClientId.startsWith("REPLACE_")) throw new Error("Configure userPoolClientId in frontend/app.js first.");
    const response = await fetch(`https://cognito-idp.${CONFIG.region}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CONFIG.userPoolClientId,
        AuthParameters: {
          USERNAME: $("username").value.trim(),
          PASSWORD: $("password").value
        }
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.Message || "Sign-in failed.");
    if (data.ChallengeName) throw new Error(`Additional sign-in challenge required: ${data.ChallengeName}. This starter supports direct password sign-in only.`);
    idToken = data.AuthenticationResult?.IdToken || "";
    if (!idToken) throw new Error("Cognito did not return an ID token.");
    sessionStorage.setItem("rag_id_token", idToken);
    $("password").value = "";
    showAuthenticated(true);
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

logoutButton.addEventListener("click", () => {
  idToken = "";
  sessionStorage.removeItem("rag_id_token");
  messages.replaceChildren();
  showAuthenticated(false);
});

$("chatForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  chatMessage.textContent = "";
  const question = $("question").value.trim();
  if (!question) return;
  if (!tokenIsValid(idToken)) {
    logoutButton.click();
    loginMessage.textContent = "Your session expired. Please sign in again.";
    return;
  }
  if (CONFIG.apiUrl.startsWith("REPLACE_")) {
    chatMessage.textContent = "Configure apiUrl in frontend/app.js after deployment.";
    return;
  }
  $("question").value = "";
  addMessage("user", question);
  const button = $("sendButton");
  button.disabled = true;
  button.textContent = "Thinking...";
  try {
    const response = await fetch(`${CONFIG.apiUrl.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": idToken },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 403) {
      logoutButton.click();
      throw new Error("Your session is no longer authorized. Please sign in again.");
    }
    if (!response.ok) throw new Error(data.message || "The assistant could not answer this question.");
    addMessage("assistant", data.answer || "No answer was returned.", data.citations || []);
  } catch (error) {
    chatMessage.textContent = error.message;
    addMessage("assistant", `Error: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Send";
  }
});
