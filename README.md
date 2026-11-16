# Jarvis AI

Prototipo di assistente personale in italiano, pubblicabile come sito statico tramite GitHub Pages.

## Stato attuale

Questa versione mantiene le funzionalità originali:

- interfaccia chat responsive;
- suggerimenti rapidi per giornata, WhatsApp, ricerca web e voce;
- apertura di WhatsApp e Google;
- ricerca Google con query quando disponibile;
- riconoscimento vocale tramite Web Speech API;
- fallback locale con risposte predefinite.

Il modello AI non è ancora attivo. Il client contiene un adapter preparato in `app.js`, ma `JarvisConfig.useAi` è impostato su `false` e non sono presenti chiavi API o servizi a pagamento.

## Struttura

```text
index.html              Struttura e contenuto della pagina
styles.css              Stili responsive e interfaccia mobile
app.js                  Logica chat, voce e adapter AI futuro
manifest.webmanifest    Metadati per installazione web su Android
README.md               Documentazione
```

## Esecuzione locale

È sufficiente servire la cartella con un server HTTP statico, ad esempio:

```bash
python3 -m http.server 8080
```

Poi aprire `http://localhost:8080` nel browser.

## Integrazione AI futura

L’integrazione dovrà usare un backend sicuro. Non inserire mai API key in `index.html`, `styles.css`, `app.js` o in altri file pubblici. Quando sarà disponibile un endpoint autenticato, l’adapter `requestAiReply()` potrà essere collegato impostando la configurazione lato client con il solo URL pubblico dell’endpoint.

## Roadmap

1. Memoria locale e gestione delle conversazioni.
2. Backend AI sicuro con risposte in streaming.
3. Memoria a lungo termine controllabile dall’utente.
4. Voce bidirezionale e sintesi vocale.
5. Analisi di immagini e documenti.
6. App Android nativa e integrazione con strumenti del dispositivo.
7. Automazioni con conferma per le azioni sensibili.
