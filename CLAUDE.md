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

## Geplante Features

- [x] Todo erstellen, bearbeiten, löschen
- [ ] Projekte erstellen und Todos zuordnen (neue Projekte hinzufügen)
- [x] Todo-Status (offen, erledigt)
- [ ] Drag & Drop für Todo-Reihenfolge
- [ ] Suchfunktion für Todos
- [x] Prioritäten für Todos (hoch, mittel, niedrig)
- [ ] Due Dates für Todos
- [ ] Tags/Labels für bessere Organisation
- [ ] Dark/Light Mode Toggle
- [ ] Datenexport (JSON, CSV)
- [ ] Todo bearbeiten (Edit-Funktion)
- [ ] Projekt löschen/umbenennen
- [ ] Todo-Statistiken anzeigen

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
npm run dev
```
Läuft auf: http://localhost:5173/

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
