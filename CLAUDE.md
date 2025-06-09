# Claude.md - Projektplanung

## Beschreibung der App
Es soll eine Todo-Web-App sein.
Modernes reponsives Design.
Todos sollen in Projekte organisiert werden können.

## Aktuelle Aufgaben

- [x] Projekt-Setup: Package.json, Ordnerstruktur, Git initialisieren
- [x] Frontend-Framework auswählen und einrichten (Vanilla JS + Vite)
- [x] LocalStorage Service für Daten-Persistierung entwickeln
- [x] Datenstrukturen für Todos und Projekte definieren
- [x] Responsive UI/UX Design implementieren
- [x] Grundfunktionalität: Todo erstellen, löschen, abhaken
- [x] Prioritäten-System implementiert
- [x] GitHub Pages Setup und Deployment-Pipeline
- [x] Todo-Bearbeitung (Edit-Funktion)
- [x] Neue Projekte hinzufügen
- [x] Projekt-Management (umbenennen/löschen)
- [x] Suchfunktion mit Highlighting
- [x] Dark/Light Mode Toggle

## Nächste Aufgaben
- [ ] Repository auf GitHub erstellen und Code pushen
- [ ] GitHub Pages aktivieren

## Implementierte Features ✅

- [x] Todo erstellen, bearbeiten, löschen
- [x] Projekte erstellen und Todos zuordnen
- [x] Todo-Status (offen, erledigt)
- [x] Suchfunktion für Todos mit Highlighting
- [x] Prioritäten für Todos (hoch, mittel, niedrig)
- [x] Dark/Light Mode Toggle
- [x] Todo bearbeiten (Edit-Funktion)
- [x] Projekt löschen/umbenennen
- [x] Responsive Design
- [x] LocalStorage Persistierung
- [x] GitHub Pages Deployment

## Zukünftige Features 🚀

- [ ] Drag & Drop für Todo-Reihenfolge
- [ ] Due Dates für Todos
- [ ] Tags/Labels für bessere Organisation
- [ ] Datenexport (JSON, CSV)
- [ ] Todo-Statistiken anzeigen
- [ ] Keyboard Shortcuts
- [ ] Todo-Kategorien/Farben
- [ ] Benachrichtigungen für Deadlines

## Technische Schulden

- [ ] Tests schreiben (Unit, Integration)
- [ ] Code-Dokumentation
- [ ] Performance-Optimierung
- [ ] Accessibility (a11y) Standards
- [ ] Browser-Kompatibilität testen 

## Technische Schulden

- [ ] 

## Notizen

### Implementierte Technologien
- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **Build Tool**: Vite
- **Datenspeicherung**: LocalStorage
- **Design**: Responsive, moderne UI

### Starten der Anwendung
```bash
npm install
npm run dev
```
Läuft auf: http://localhost:5173/

### Deployment auf GitHub Pages
1. Repository auf GitHub erstellen
2. Code pushen:
```bash
git add .
git commit -m "Complete todo app with all features"
git branch -M main
git remote add origin https://github.com/USERNAME/work-todo.git
git push -u origin main
```
3. In Repository Settings → Pages → Source: "GitHub Actions" auswählen
4. App läuft automatisch auf: https://USERNAME.github.io/work-todo/

### Datenstruktur
```javascript
{
  projects: [
    {
      id: string,
      name: string,
      todos: [
        {
          id: string,
          text: string,
          completed: boolean,
          priority: "low" | "medium" | "high",
          createdAt: Date
        }
      ]
    }
  ]
}
```

### Features im Detail
- **📝 Todo-Management**: Erstellen, bearbeiten, löschen, abhaken
- **📁 Projekt-Organisation**: Mehrere Projekte mit separaten Todo-Listen
- **🔍 Suchfunktion**: Live-Suche mit Highlighting der Treffer
- **🎯 Prioritäten**: Drei Prioritätsstufen (Hoch, Mittel, Niedrig)
- **🌙 Dark Mode**: Theme-Wechsel mit LocalStorage-Persistierung
- **📱 Responsive**: Optimiert für Desktop, Tablet und Mobile
- **💾 Persistierung**: Automatisches Speichern in LocalStorage
- **⌨️ Keyboard Support**: ESC zum Abbrechen, Enter zum Bestätigen
