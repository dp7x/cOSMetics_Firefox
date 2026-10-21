# Prova della versione Firefox 1.90.2

Questa prima versione Firefox contiene le stesse quattro funzioni della versione Chrome 1.90. Strava non è incluso. Il repository Chrome non è stato modificato.

## Caricamento temporaneo

1. Usa Firefox desktop 140 o successivo.
2. Estrai il pacchetto di prova in una cartella separata da Chrome.
3. Apri `about:debugging#/runtime/this-firefox`.
4. Premi **Carica componente aggiuntivo temporaneo** e scegli `manifest.json`.
5. Apri o ricarica la pagina di iD su OpenStreetMap.

Il caricamento temporaneo dura fino alla chiusura di Firefox. Per l'installazione permanente serve la firma Mozilla. Non disattivare le verifiche delle firme nel tuo Firefox.

Le impostazioni di Chrome non vengono importate automaticamente. Firefox usa il proprio archivio di preferenze. Il consenso alla trasmissione dei dati di posizione riguarda l'area della mappa richiesta a Nominatim/Overture, non il GPS del dispositivo.

## Controlli da fare in iD

- **Popup:** apri più sezioni, scorri i contenuti e verifica che Salva rimanga visibile. Chiudi e riapri: le sezioni devono mantenere il loro stato.
- **Sfondi:** salva due sfondi con nomi e URL; in iD apri le impostazioni dello sfondo personalizzato e scegli entrambi. Riapri il popup per verificare il salvataggio.
- **Commenti:** crea o modifica oggetti di categorie diverse, apri il salvataggio e premi Suggerisci. Verifica lingua, opzione inglese, distinzione creati/modificati e massimo quattro categorie per gruppo.
- **Hashtag:** imposta un hashtag nel popup. Apri il salvataggio in iD: deve comparire nel campo hashtag anche senza premere Suggerisci. Verifica sostituzione, azzeramento, assenza di duplicati e conservazione degli altri hashtag. Il commento non deve ricevere il suffisso con l'hashtag.
- **Overture:** attiva i controlli, passa a zoom 18 e carica l'area. Controlla allineamento, spostamento del pannello e tema chiaro/scuro. Seleziona un edificio non già presente, premi A e verifica che venga aggiunto alle modifiche e rimosso dall'overlay. Annulla con i normali strumenti di iD; per la prova non è necessario caricare alcun changeset.
- **Griglia:** genera una griglia su OpenStreetMap, controlla il download GeoJSON, trascinala in iD e verifica il centro della griglia. Riapri il popup per controllare che i parametri siano memorizzati.

## Controlli automatici

Con Node.js installato:

```text
npm ci
npm run build
npm test
```

Il pacchetto contiene già `dist/overture.js`: per la prova manuale non occorre compilare nulla.

## Repository separato

Nome previsto: `dp7x/cOSMetics_Firefox`. Se non esiste, crea un repository vuoto su GitHub, senza inizializzare README o licenza. Estrai i sorgenti nella cartella da usare per questo progetto e pubblicali con:

```text
git init -b main
git add .
git commit -m "Port cOSMetics 1.90 to Firefox"
git remote add origin https://github.com/dp7x/cOSMetics_Firefox.git
git push -u origin main
```

Se il repository esiste già e contiene file, non usare questi comandi per sovrascriverlo: allinealo prima con i sorgenti preparati.
