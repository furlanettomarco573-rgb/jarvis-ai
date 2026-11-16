/*
 * Jarvis client
 *
 * La risposta attuale resta locale e gratuita. Il punto di integrazione AI
 * è requestAiReply(): potrà chiamare un backend senza esporre chiavi API.
 */

const JarvisConfig = Object.freeze({
  aiEndpoint: "",
  useAi: false
});

const form = document.getElementById("form");
const input = document.getElementById("message");
const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const mic = document.getElementById("mic");
const status = document.getElementById("status");
const sendButton = form.querySelector('button[type="submit"]');

function setStatus(text, state = "") {
  status.textContent = text;
  status.className = `status${state ? ` is-${state}` : ""}`;
}

function addMessage(text, type) {
  const item = document.createElement("div");
  item.className = `message ${type}`;
  item.textContent = text;
  chat.appendChild(item);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  return item;
}

function addLink(text, href) {
  const link = document.createElement("a");
  link.className = "chat-link";
  link.href = href;
  link.textContent = text;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  chat.appendChild(link);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function suggest(text) {
  input.value = text;
  input.focus();
}

function replyLocally(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes("whatsapp")) {
    addMessage("Per aprire WhatsApp, premi qui sotto. L'app si aprirà e potrai scegliere tu a chi scrivere.", "jarvis");
    addLink("Apri WhatsApp", "https://wa.me/");
    return;
  }

  if (normalized.includes("internet") || normalized.includes("cercare") || normalized.includes("cerca")) {
    addMessage("Puoi effettuare una ricerca su Google da qui:", "jarvis");
    const query = text
      .replace(/voglio cercare qualcosa su internet/gi, "")
      .replace(/cerca( su internet)?/gi, "")
      .trim();
    const url = query
      ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
      : "https://www.google.com/";
    addLink("Apri Google", url);
    return;
  }

  if (normalized.includes("microfono")) {
    addMessage("Premi il pulsante 🎙️ vicino alla casella di testo e consenti l'accesso al microfono, se il browser lo richiede.", "jarvis");
    return;
  }

  addMessage("Ho ricevuto il tuo messaggio! La chat è pronta. Nel prossimo passaggio collegheremo un modello AI per permettermi di rispondere davvero alle tue domande.", "jarvis");
}

async function requestAiReply(text) {
  if (!JarvisConfig.useAi || !JarvisConfig.aiEndpoint) return false;

  const response = await fetch(JarvisConfig.aiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  addMessage(data.reply || "Non ho ricevuto una risposta valida dal modello AI.", "jarvis");
  return true;
}

async function handleMessage(text) {
  welcome.hidden = true;
  addMessage(text, "user");
  input.value = "";
  sendButton.disabled = true;

  try {
    setStatus("Jarvis sta pensando...");
    const handledByAi = await requestAiReply(text);
    if (!handledByAi) replyLocally(text);
    setStatus("Jarvis AI • Versione iniziale");
  } catch (error) {
    console.error(error);
    addMessage("Non riesco a contattare il modello AI in questo momento. Provo con le funzioni locali disponibili.", "jarvis");
    replyLocally(text);
    setStatus("Connessione AI non disponibile", "error");
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text && !sendButton.disabled) handleMessage(text);
});

document.querySelectorAll("[data-suggestion]").forEach((button) => {
  button.addEventListener("click", () => suggest(button.dataset.suggestion));
});

mic.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    welcome.hidden = true;
    addMessage("Il riconoscimento vocale non è supportato da questo browser. Puoi comunque scrivere i messaggi.", "jarvis");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "it-IT";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  mic.disabled = true;
  setStatus("Jarvis sta ascoltando...", "listening");

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    input.focus();
    setStatus("Jarvis AI • Versione iniziale");
  };

  recognition.onerror = () => {
    welcome.hidden = true;
    addMessage("Non sono riuscito ad avviare il microfono. Controlla i permessi del browser.", "jarvis");
    setStatus("Microfono non disponibile", "error");
  };

  recognition.onend = () => {
    mic.disabled = false;
    if (!status.classList.contains("is-error")) setStatus("Jarvis AI • Versione iniziale");
  };

  try {
    recognition.start();
  } catch (error) {
    mic.disabled = false;
    setStatus("Microfono non disponibile", "error");
    console.error(error);
  }
});
