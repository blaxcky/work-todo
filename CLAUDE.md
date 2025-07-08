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

## Implementierte Features ✅

- [x] Todo erstellen, bearbeiten, löschen
- [x] Projekte erstellen und Todos zuordnen
- [x] Todo-Status (offen, erledigt)
- [x] Suchfunktion für Todos mit Highlighting
- [x] Prioritäten für Todos (hoch, mittel, niedrig)
- [x] Dark/Light Mode Toggle
- [x] Todo bearbeiten (Edit-Funktion)
- [x] Projekt löschen/umbenennen
- [x] Due Dates für Todos mit visuellen Indikatoren
- [x] Responsive Design
- [x] LocalStorage Persistierung
- [x] GitHub Pages Deployment
- [x] Archiv-Funktion mit Leeren-Option

## Zukünftige Features 🚀

- [ ] Drag & Drop für Todo-Reihenfolge
- [ ] Tags/Labels für bessere Organisation
- [ ] Todo-Statistiken anzeigen
- [ ] Keyboard Shortcuts
- [ ] Todo-Kategorien/Farben
- [ ] Benachrichtigungen für Deadlines

## Design-Modernisierung Roadmap 🎨

### Moderne Designelemente
- [ ] **Border-Radius & Glassmorphism**: Abgerundete Ecken (8px-16px) statt `border-radius: 0`
- [ ] **Glassmorphism-Effekte**: Sidebar und Cards mit `backdrop-filter: blur(20px)`
- [ ] **Weiche Schatten**: Größere, weichere Box-Shadows statt harte Kanten
- [ ] **Gradient-Backgrounds**: Sidebar und Header mit subtilen linearen Gradienten
- [ ] **CSS Custom Properties**: Einheitliche Farbvariablen für bessere Wartbarkeit

### Erweiterte Animationen
- [ ] **Ripple-Effekte**: Bei Button-Klicks (Material Design Style)
- [ ] **Elastic Hover**: Buttons mit `scale()` und `ease-out` Timing
- [ ] **Loading-Spinner**: Für Todo-Erstellung/Speicherung
- [ ] **Pulse-Animationen**: Für wichtige Buttons oder überfällige Todos
- [ ] **Slide-In Animationen**: Neue Todos gleiten von links/rechts ein
- [ ] **Stagger-Animationen**: Todo-Liste mit versetzten Einblendungen
- [ ] **Completion-Animation**: Checkbox mit Konfetti/Checkmark-Animation
- [ ] **Priority-Animations**: Hohe Priorität leicht pulsierend, überfällige Todos mit rotem Glow

### UI/UX Verbesserungen
- [ ] **CSS Grid**: Modernere Layouts statt reines Flexbox
- [ ] **Container Queries**: Für bessere Responsive-Komponenten
- [ ] **Fluid Typography**: `clamp()` für bessere Skalierung
- [ ] **Floating Labels**: Input-Labels die nach oben gleiten
- [ ] **Toggle-Switches**: Statt einfachen Checkboxen für Settings
- [ ] **Progress-Indicators**: Für mehrstufige Aktionen
- [ ] **Skeleton-Loading**: Statt leere Zustände

### Performance & Accessibility
- [ ] **Focus-Rings**: Moderne, sichtbare Focus-Indikatoren
- [ ] **High-Contrast**: Bessere Farb-Kontraste
- [ ] **Reduced-Motion**: `prefers-reduced-motion` Media Query
- [ ] **GPU-Animationen**: `transform` und `opacity` für bessere Performance
- [ ] **Custom Scroll-Bars**: Moderne, schlanke Scrollbars

## Technische Schulden

- [ ] Tests schreiben (Unit, Integration)
- [ ] Code-Dokumentation
- [ ] Performance-Optimierung
- [ ] Accessibility (a11y) Standards
- [ ] Browser-Kompatibilität testen 

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

## Git Workflow Notizen
- only commit to git, never push to github