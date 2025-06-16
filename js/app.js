class TodoApp {
    constructor() {
        this.projects = this.loadFromStorage() || [
            {
                id: 'default',
                name: 'Meine Todos',
                todos: []
            }
        ];
        this.searchTerm = '';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.currentProjectId = this.projects[0].id;
        this.init();
    }

    init() {
        this.applyTheme();
        this.renderSidebar();
        this.render();
        this.bindEvents();
        this.bindProjectEvents();
    }

    loadFromStorage() {
        const data = localStorage.getItem('todoApp');
        return data ? JSON.parse(data) : null;
    }

    saveToStorage() {
        localStorage.setItem('todoApp', JSON.stringify(this.projects));
    }

    addProject(name) {
        const project = {
            id: Date.now().toString(),
            name: name,
            todos: []
        };
        this.projects.push(project);
        this.saveToStorage();
        this.renderSidebar();
        this.switchToProject(project.id);
    }

    addTodo(projectId, text, priority = 'medium', dueDate = null) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                priority: priority,
                dueDate: dueDate,
                createdAt: new Date()
            };
            project.todos.push(todo);
            this.saveToStorage();
            this.render();
            return true;
        }
        return false;
    }

    toggleTodo(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                // Animation nur bei Completion (nicht beim Un-Check)
                const wasCompleted = todo.completed;
                todo.completed = !todo.completed;
                
                if (!wasCompleted) {
                    // Todo wurde gerade erledigt - Animation für das Verschieben nach unten
                    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
                    if (todoElement) {
                        todoElement.style.transition = 'all 0.3s ease';
                        todoElement.style.transform = 'scale(0.98)';
                        todoElement.style.opacity = '0.8';
                        
                        setTimeout(() => {
                            this.saveToStorage();
                            this.render();
                        }, 300);
                        return;
                    }
                }
                
                this.saveToStorage();
                this.render();
            }
        }
    }

    deleteTodo(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.todos = project.todos.filter(t => t.id !== todoId);
            this.saveToStorage();
            this.render();
        }
    }

    editTodo(projectId, todoId, newText, newPriority, newDueDate = null) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                todo.text = newText;
                todo.priority = newPriority;
                todo.dueDate = newDueDate;
                this.saveToStorage();
                this.render();
            }
        }
    }

    renderSidebar() {
        const projectList = document.querySelector('.project-list');
        projectList.innerHTML = '';

        // Spezial-Projekte Sektion
        const allProjectsItem = document.createElement('div');
        allProjectsItem.className = `project-item special-project ${this.currentProjectId === 'all' ? 'active' : ''}`;
        allProjectsItem.onclick = () => this.switchToProject('all');
        allProjectsItem.innerHTML = `
            <span class="project-name">📋 Alle Projekte</span>
        `;
        projectList.appendChild(allProjectsItem);

        // Archiv-Projekt nur anzeigen wenn es existiert und Todos hat
        const archiveProject = this.projects.find(p => p.id === 'archive');
        if (archiveProject && archiveProject.todos.length > 0) {
            const archiveItem = document.createElement('div');
            archiveItem.className = `project-item special-project ${this.currentProjectId === 'archive' ? 'active' : ''}`;
            archiveItem.onclick = () => this.switchToProject('archive');
            archiveItem.innerHTML = `
                <span class="project-name">📦 Archiv</span>
                <span class="todo-count">${archiveProject.todos.length}</span>
            `;
            projectList.appendChild(archiveItem);
        }

        // Trennlinie zwischen Spezial- und normalen Projekten
        if (this.projects.filter(p => p.id !== 'archive').length > 0) {
            const separator = document.createElement('div');
            separator.className = 'project-separator';
            projectList.appendChild(separator);
        }

        // Normale Projekte (ohne Archiv)
        this.projects.filter(project => project.id !== 'archive').forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = `project-item ${project.id === this.currentProjectId ? 'active' : ''}`;
            projectItem.onclick = () => this.switchToProject(project.id);
            
            projectItem.innerHTML = `
                <span class="project-name">${project.name}</span>
                ${project.id !== 'default' ? `
                    <div class="project-actions">
                        <button class="btn-small btn-edit" onclick="event.stopPropagation(); app.showEditProjectForm('${project.id}')" title="Bearbeiten">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-small btn-delete" onclick="event.stopPropagation(); app.deleteProject('${project.id}')" title="Löschen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                ` : ''}
            `;
            
            projectList.appendChild(projectItem);
        });
    }

    switchToProject(projectId) {
        this.currentProjectId = projectId;
        this.renderSidebar();
        this.render();
        this.updatePageTitle();
    }

    updatePageTitle() {
        const titleElement = document.getElementById('current-project-title');
        if (titleElement) {
            if (this.currentProjectId === 'all') {
                titleElement.textContent = 'Alle Projekte';
            } else if (this.currentProjectId === 'archive') {
                titleElement.textContent = 'Archiv';
            } else {
                const project = this.projects.find(p => p.id === this.currentProjectId);
                if (project) {
                    titleElement.textContent = project.name;
                }
            }
        }
    }

    render() {
        const container = document.getElementById('todo-container');
        
        if (this.currentProjectId === 'all') {
            this.renderAllProjects(container);
        } else if (this.currentProjectId === 'archive') {
            this.renderArchiveProject(container);
        } else {
            this.renderSingleProject(container);
        }
        
        this.updatePageTitle();
    }

    renderSingleProject(container) {
        const currentProject = this.projects.find(p => p.id === this.currentProjectId);
        
        if (!currentProject) {
            container.innerHTML = '<div class="no-results">Projekt nicht gefunden</div>';
            return;
        }

        const filteredTodos = this.searchTerm 
            ? currentProject.todos.filter(todo => 
                todo.text.toLowerCase().includes(this.searchTerm.toLowerCase()))
            : currentProject.todos;

        const sortedTodos = this.sortTodosByPriority([...filteredTodos]);

        container.innerHTML = `
            <div class="project-section">
                <div class="add-todo-form">
                    <div class="input-row">
                        <input type="text" id="todo-text-${currentProject.id}" placeholder="Neues Todo hinzufügen..." class="todo-input">
                        <input type="date" id="todo-date-${currentProject.id}" class="todo-date-input" title="Fälligkeitsdatum (optional)">
                        <div class="priority-radio-group">
                            <label class="priority-radio">
                                <input type="radio" name="priority-${currentProject.id}" value="high" class="radio-input">
                                <span class="radio-custom priority-high"></span>
                                <span class="radio-label">Hoch</span>
                            </label>
                            <label class="priority-radio">
                                <input type="radio" name="priority-${currentProject.id}" value="medium" class="radio-input" checked>
                                <span class="radio-custom priority-medium"></span>
                                <span class="radio-label">Mittel</span>
                            </label>
                            <label class="priority-radio">
                                <input type="radio" name="priority-${currentProject.id}" value="low" class="radio-input">
                                <span class="radio-custom priority-low"></span>
                                <span class="radio-label">Niedrig</span>
                            </label>
                        </div>
                        <button onclick="app.submitTodo('${currentProject.id}')" class="add-btn">+</button>
                    </div>
                </div>
                <div class="todos-list">
                    ${sortedTodos.length > 0 ? sortedTodos.map(todo => `
                        <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" data-todo-id="${todo.id}">
                            <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                                   ${todo.completed ? 'checked' : ''} 
                                   onchange="app.toggleTodo('${currentProject.id}', '${todo.id}')">
                            <div class="todo-content">
                                <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                                ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                            </div>
                            <div class="todo-actions">
                                <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${currentProject.id}', '${todo.id}')" title="Bearbeiten">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('${currentProject.id}', '${todo.id}')" title="Löschen">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<div class="no-todos">Noch keine Todos in diesem Projekt</div>'}
                </div>
            </div>
        `;
        
        if (this.searchTerm && sortedTodos.length === 0 && currentProject.todos.length > 0) {
            container.querySelector('.todos-list').innerHTML = '<div class="no-results">Keine Todos gefunden für "' + this.searchTerm + '"</div>';
        }
    }

    renderAllProjects(container) {
        let allTodos = [];
        
        // Alle Todos aus allen Projekten sammeln
        this.projects.forEach(project => {
            project.todos.forEach(todo => {
                allTodos.push({
                    ...todo,
                    projectId: project.id,
                    projectName: project.name
                });
            });
        });

        // Nach Suchbegriff filtern
        const filteredTodos = this.searchTerm 
            ? allTodos.filter(todo => 
                todo.text.toLowerCase().includes(this.searchTerm.toLowerCase()))
            : allTodos;

        // Nach Projekten gruppieren
        const todosByProject = {};
        filteredTodos.forEach(todo => {
            if (!todosByProject[todo.projectId]) {
                todosByProject[todo.projectId] = [];
            }
            todosByProject[todo.projectId].push(todo);
        });

        // Todos in jedem Projekt nach Priorität sortieren
        Object.keys(todosByProject).forEach(projectId => {
            todosByProject[projectId] = this.sortTodosByPriority(todosByProject[projectId]);
        });

        let html = '';
        
        if (Object.keys(todosByProject).length === 0) {
            html = '<div class="no-todos">Keine Todos gefunden</div>';
        } else {
            Object.keys(todosByProject).forEach(projectId => {
                const projectTodos = todosByProject[projectId];
                const projectName = projectTodos[0].projectName;
                
                html += `
                    <div class="project-section">
                        <div class="project-header">
                            <h3 class="project-title">${projectName}</h3>
                        </div>
                        <div class="todos-list">
                            ${projectTodos.map(todo => `
                                <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" data-todo-id="${todo.id}">
                                    <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                                           ${todo.completed ? 'checked' : ''} 
                                           onchange="app.toggleTodo('${todo.projectId}', '${todo.id}')">
                                    <div class="todo-content">
                                        <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                                        ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                                    </div>
                                    <div class="todo-actions">
                                        <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${todo.projectId}', '${todo.id}')" title="Bearbeiten">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button class="btn-small btn-delete" onclick="app.deleteTodo('${todo.projectId}', '${todo.id}')" title="Löschen">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    renderArchiveProject(container) {
        const archiveProject = this.projects.find(p => p.id === 'archive');
        
        if (!archiveProject || archiveProject.todos.length === 0) {
            container.innerHTML = `
                <div class="project-section">
                    <div class="archive-empty">
                        <div class="archive-empty-icon">📦</div>
                        <h3>Archiv ist leer</h3>
                        <p>Verwenden Sie den "Archivieren" Button, um erledigte Todos hierher zu verschieben.</p>
                    </div>
                </div>
            `;
            return;
        }

        const filteredTodos = this.searchTerm 
            ? archiveProject.todos.filter(todo => 
                todo.text.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (todo.originalProject && todo.originalProject.toLowerCase().includes(this.searchTerm.toLowerCase())))
            : archiveProject.todos;

        const sortedTodos = this.sortTodosByPriority([...filteredTodos]);

        container.innerHTML = `
            <div class="project-section">
                <div class="archive-info-banner">
                    <div class="archive-banner-icon">📦</div>
                    <div class="archive-banner-text">
                        <h3>Archiv</h3>
                        <p>Alle archivierten Todos • ${archiveProject.todos.length} Einträge</p>
                    </div>
                </div>
                <div class="todos-list">
                    ${sortedTodos.length > 0 ? sortedTodos.map(todo => `
                        <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" data-todo-id="${todo.id}">
                            <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                                   ${todo.completed ? 'checked' : ''} 
                                   onchange="app.toggleTodo('archive', '${todo.id}')">
                            <div class="todo-content">
                                <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                                ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                                ${todo.originalProject ? `<span class="original-project">aus: ${todo.originalProject}</span>` : ''}
                            </div>
                            <div class="todo-actions">
                                <button class="btn-small btn-edit" onclick="app.showEditTodoForm('archive', '${todo.id}')" title="Bearbeiten">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('archive', '${todo.id}')" title="Löschen">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<div class="no-todos">Keine Todos im Archiv gefunden</div>'}
                </div>
            </div>
        `;
        
        if (this.searchTerm && sortedTodos.length === 0 && archiveProject.todos.length > 0) {
            container.querySelector('.todos-list').innerHTML = '<div class="no-results">Keine Archiv-Todos gefunden für "' + this.searchTerm + '"</div>';
        }
    }

    getPriorityText(priority) {
        const priorities = {
            low: 'Niedrig',
            medium: 'Mittel',
            high: 'Hoch'
        };
        return priorities[priority] || 'Mittel';
    }

    formatDueDate(dueDate) {
        if (!dueDate) return '';
        
        const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Normalize dates to midnight for comparison
        const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const normalizedDate = normalizeDate(date);
        const normalizedToday = normalizeDate(today);
        const normalizedTomorrow = normalizeDate(tomorrow);
        
        if (normalizedDate.getTime() === normalizedToday.getTime()) {
            return 'Heute';
        } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
            return 'Morgen';
        } else {
            return date.toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }
    }

    isOverdue(dueDate) {
        if (!dueDate) return false;
        const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
        const today = new Date();
        const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return normalizeDate(date) < normalizeDate(today);
    }

    sortTodosByPriority(todos) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return todos.sort((a, b) => {
            // Erledigte Todos immer nach unten
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Überfällige Todos nach oben (nur bei nicht erledigten)
            if (!a.completed && !b.completed) {
                const aOverdue = this.isOverdue(a.dueDate);
                const bOverdue = this.isOverdue(b.dueDate);
                if (aOverdue !== bOverdue) {
                    return aOverdue ? -1 : 1;
                }
            }
            
            // Nach Fälligkeitsdatum sortieren (frühere zuerst)
            const aHasDate = a.dueDate && !a.completed;
            const bHasDate = b.dueDate && !b.completed;
            
            if (aHasDate && !bHasDate) return -1;
            if (!aHasDate && bHasDate) return 1;
            
            if (aHasDate && bHasDate) {
                const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
                const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
                const dateDiff = dateA - dateB;
                if (dateDiff !== 0) return dateDiff;
            }
            
            const priorityA = priorityOrder[a.priority] || 2;
            const priorityB = priorityOrder[b.priority] || 2;
            
            // Nach Priorität sortieren (hoch zu niedrig)
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            
            // Bei gleicher Priorität nach Erstellungsdatum sortieren (neueste zuerst)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    highlightSearchTerm(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    search(term) {
        this.searchTerm = term;
        this.render();
        
        const clearBtn = document.getElementById('clear-search');
        if (term) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        this.search('');
    }


    submitTodo(projectId) {
        const textInput = document.getElementById(`todo-text-${projectId}`);
        const dateInput = document.getElementById(`todo-date-${projectId}`);
        const priorityRadios = document.querySelectorAll(`input[name="priority-${projectId}"]:checked`);
        
        const text = textInput.value.trim();
        const dueDate = dateInput.value ? new Date(dateInput.value) : null;
        const priority = priorityRadios.length > 0 ? priorityRadios[0].value : 'medium';
        
        if (text) {
            this.addTodo(projectId, text, priority, dueDate);
            // Nach dem Re-Rendering die neuen Elemente finden und Fokus setzen
            setTimeout(() => {
                const newTextInput = document.getElementById(`todo-text-${projectId}`);
                const newDateInput = document.getElementById(`todo-date-${projectId}`);
                const newPriorityRadio = document.querySelector(`input[name="priority-${projectId}"][value="medium"]`);
                if (newTextInput) {
                    newTextInput.value = '';
                    newTextInput.focus();
                }
                if (newDateInput) {
                    newDateInput.value = '';
                }
                if (newPriorityRadio) {
                    newPriorityRadio.checked = true;
                }
            }, 0);
        }
    }

    showEditTodoForm(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        const todo = project.todos.find(t => t.id === todoId);
        
        const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
        if (!todoElement) {
            // Fallback: Re-render mit Edit-Form
            this.render();
            return;
        }
        
        const dueDateValue = todo.dueDate ? (todo.dueDate instanceof Date ? todo.dueDate.toISOString().split('T')[0] : new Date(todo.dueDate).toISOString().split('T')[0]) : '';
        
        todoElement.innerHTML = `
            <div class="edit-todo-form">
                <input type="text" id="edit-text-${todoId}" value="${todo.text}" class="edit-input">
                <input type="date" id="edit-date-${todoId}" value="${dueDateValue}" class="edit-date-input" title="Fälligkeitsdatum">
                <select id="edit-priority-${todoId}" class="edit-select">
                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Niedrig</option>
                    <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Mittel</option>
                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>Hoch</option>
                </select>
                <button onclick="app.saveEditTodo('${projectId}', '${todoId}')" class="btn-small" title="Speichern">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"></polyline><path d="m21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path></svg>
                </button>
                <button onclick="app.cancelEditTodo('${projectId}', '${todoId}')" class="btn-small" title="Abbrechen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
    }

    saveEditTodo(projectId, todoId) {
        const newText = document.getElementById(`edit-text-${todoId}`).value.trim();
        const newDateValue = document.getElementById(`edit-date-${todoId}`).value;
        const newDueDate = newDateValue ? new Date(newDateValue) : null;
        const newPriority = document.getElementById(`edit-priority-${todoId}`).value;
        
        if (newText) {
            this.editTodo(projectId, todoId, newText, newPriority, newDueDate);
        }
    }

    cancelEditTodo(projectId, todoId) {
        this.render();
    }

    showAddProjectForm() {
        document.getElementById('add-project-form').style.display = 'flex';
        document.getElementById('project-name-input').focus();
    }

    hideAddProjectForm() {
        document.getElementById('add-project-form').style.display = 'none';
        document.getElementById('project-name-input').value = '';
    }

    submitProject() {
        const input = document.getElementById('project-name-input');
        const name = input.value.trim();
        
        if (name) {
            this.addProject(name);
            this.hideAddProjectForm();
        }
    }

    deleteProject(projectId) {
        if (projectId === 'default' || projectId === 'archive') return;
        
        const project = this.projects.find(p => p.id === projectId);
        if (project && confirm(`Projekt "${project.name}" wirklich löschen? Alle Todos gehen verloren.`)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            
            // Wenn aktuelles Projekt gelöscht wird, zum ersten Projekt wechseln
            if (this.currentProjectId === projectId) {
                this.currentProjectId = this.projects[0].id;
            }
            
            this.saveToStorage();
            this.renderSidebar();
            this.render();
        }
    }

    showEditProjectForm(projectId) {
        if (projectId === 'archive') return; // Archiv kann nicht umbenannt werden
        
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const newName = prompt('Neuer Projektname:', project.name);
        if (newName && newName.trim() !== project.name) {
            project.name = newName.trim();
            this.saveToStorage();
            this.renderSidebar();
            this.updatePageTitle();
        }
    }

    bindProjectEvents() {
        document.getElementById('add-project-btn').addEventListener('click', () => {
            this.showAddProjectForm();
        });

        document.getElementById('project-name-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitProject();
            }
        });

        // Event listener für alle Todo-Eingabefelder
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('todo-input') && e.key === 'Enter') {
                const projectId = e.target.id.replace('todo-text-', '');
                this.submitTodo(projectId);
            }
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.search(e.target.value);
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('archive-btn').addEventListener('click', () => {
            this.showArchiveModal();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            this.showImportModal();
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideAllModals();
            });
        });

        document.getElementById('export-modal').addEventListener('click', (e) => {
            if (e.target.id === 'export-modal') {
                this.hideExportModal();
            }
        });

        document.getElementById('import-modal').addEventListener('click', (e) => {
            if (e.target.id === 'import-modal') {
                this.hideImportModal();
            }
        });

        document.getElementById('archive-modal').addEventListener('click', (e) => {
            if (e.target.id === 'archive-modal') {
                this.hideArchiveModal();
            }
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.exportData('json');
        });

        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportData('csv');
        });

        // Import Event Listeners
        document.querySelector('.file-select-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        document.getElementById('file-drop-zone').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        });

        document.getElementById('file-drop-zone').addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('drag-over');
        });

        document.getElementById('file-drop-zone').addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        document.getElementById('import-cancel').addEventListener('click', () => {
            this.hideImportModal();
        });

        document.getElementById('import-confirm').addEventListener('click', () => {
            this.confirmImport();
        });

        document.getElementById('archive-cancel').addEventListener('click', () => {
            this.hideArchiveModal();
        });

        document.getElementById('archive-confirm').addEventListener('click', () => {
            this.confirmArchive();
        });
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('darkTheme', this.isDarkTheme);
        this.applyTheme();
    }

    applyTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (this.isDarkTheme) {
            body.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddProjectForm();
                this.hideAllModals();
            }
        });
    }

    showExportModal() {
        document.getElementById('export-modal').style.display = 'flex';
    }

    hideExportModal() {
        document.getElementById('export-modal').style.display = 'none';
    }

    showImportModal() {
        document.getElementById('import-modal').style.display = 'flex';
        this.resetImportModal();
    }

    hideImportModal() {
        document.getElementById('import-modal').style.display = 'none';
        this.resetImportModal();
    }

    hideAllModals() {
        this.hideExportModal();
        this.hideImportModal();
        this.hideArchiveModal();
    }

    showArchiveModal() {
        const completedCount = this.countCompletedTodos();
        if (completedCount === 0) {
            alert('Keine erledigten Todos zum Archivieren gefunden.');
            return;
        }
        
        document.getElementById('archive-count-text').textContent = 
            `${completedCount} erledigte Todo${completedCount === 1 ? '' : 's'} werden in das Projekt "Archiv" verschoben.`;
        document.getElementById('archive-modal').style.display = 'flex';
    }

    hideArchiveModal() {
        document.getElementById('archive-modal').style.display = 'none';
    }

    resetImportModal() {
        document.getElementById('file-input').value = '';
        document.getElementById('import-options').style.display = 'none';
        document.querySelector('input[name="import-mode"][value="merge"]').checked = true;
        this.selectedFile = null;
    }

    exportData(format) {
        const timestamp = new Date().toISOString().split('T')[0];
        let filename, content, mimeType;

        if (format === 'json') {
            filename = `todos-export-${timestamp}.json`;
            content = JSON.stringify(this.projects, null, 2);
            mimeType = 'application/json';
        } else if (format === 'csv') {
            filename = `todos-export-${timestamp}.csv`;
            content = this.generateCSV();
            mimeType = 'text/csv';
        }

        // Download-Link erstellen
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.hideExportModal();
    }

    generateCSV() {
        const headers = ['Projekt', 'Todo', 'Priorität', 'Status', 'Fälligkeitsdatum', 'Erstellt am'];
        const rows = [headers];

        this.projects.forEach(project => {
            project.todos.forEach(todo => {
                const dueDate = todo.dueDate ? 
                    (todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate)).toLocaleDateString('de-DE') : 
                    '';
                
                rows.push([
                    `"${project.name}"`,
                    `"${todo.text}"`,
                    `"${this.getPriorityText(todo.priority)}"`,
                    `"${todo.completed ? 'Erledigt' : 'Offen'}"`,
                    `"${dueDate}"`,
                    `"${new Date(todo.createdAt).toLocaleString('de-DE')}"`
                ]);
            });
        });

        return rows.map(row => row.join(',')).join('\n');
    }

    handleFileSelect(file) {
        if (!file) return;

        const allowedTypes = ['application/json', 'text/csv', 'text/plain'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !['json', 'csv'].includes(fileExtension)) {
            alert('Bitte wählen Sie eine JSON oder CSV Datei aus.');
            return;
        }

        this.selectedFile = file;
        document.getElementById('import-options').style.display = 'block';
        
        // Update UI to show selected file
        const dropZone = document.getElementById('file-drop-zone');
        dropZone.innerHTML = `
            <div class="upload-icon">✅</div>
            <div class="upload-text">
                <strong>${file.name}</strong><br>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="upload-hint">Datei ausgewählt</div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async confirmImport() {
        if (!this.selectedFile) return;

        const mode = document.querySelector('input[name="import-mode"]:checked').value;
        
        try {
            const content = await this.readFile(this.selectedFile);
            const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
            
            let importedData;
            if (fileExtension === 'json') {
                importedData = this.parseJSON(content);
            } else if (fileExtension === 'csv') {
                importedData = this.parseCSV(content);
            }

            if (mode === 'replace') {
                this.projects = importedData;
            } else { // merge
                this.mergeData(importedData);
            }

            this.saveToStorage();
            this.currentProjectId = this.projects[0]?.id || 'default';
            this.renderSidebar();
            this.render();
            this.hideImportModal();
            
            alert(`Daten erfolgreich importiert! ${mode === 'replace' ? 'Ersetzt' : 'Zusammengeführt'}`);
        } catch (error) {
            alert(`Fehler beim Importieren: ${error.message}`);
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsText(file);
        });
    }

    parseJSON(content) {
        try {
            const data = JSON.parse(content);
            
            // Validate structure
            if (!Array.isArray(data)) {
                throw new Error('JSON muss ein Array von Projekten sein');
            }
            
            data.forEach(project => {
                if (!project.id || !project.name || !Array.isArray(project.todos)) {
                    throw new Error('Ungültige Projektstruktur in JSON');
                }
                
                project.todos.forEach(todo => {
                    if (!todo.id || !todo.text || typeof todo.completed !== 'boolean') {
                        throw new Error('Ungültige Todo-Struktur in JSON');
                    }
                    // Ensure createdAt is a proper date
                    if (!todo.createdAt) {
                        todo.createdAt = new Date();
                    } else if (typeof todo.createdAt === 'string') {
                        todo.createdAt = new Date(todo.createdAt);
                    }
                    // Ensure priority exists
                    if (!todo.priority) {
                        todo.priority = 'medium';
                    }
                });
            });
            
            return data;
        } catch (error) {
            throw new Error(`JSON Parse Error: ${error.message}`);
        }
    }

    parseCSV(content) {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            // Check required headers
            const requiredHeaders = ['Projekt', 'Todo'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                throw new Error('CSV muss mindestens "Projekt" und "Todo" Spalten enthalten');
            }
            
            const projects = {};
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                
                const projectName = row['Projekt'];
                const todoText = row['Todo'];
                
                if (!projectName || !todoText) continue;
                
                if (!projects[projectName]) {
                    projects[projectName] = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: projectName,
                        todos: []
                    };
                }
                
                const priority = this.mapPriorityFromText(row['Priorität']) || 'medium';
                const completed = row['Status'] === 'Erledigt';
                const dueDateText = row['Fälligkeitsdatum'] || '';
                const dueDate = dueDateText ? this.parseDueDateFromCSV(dueDateText) : null;
                
                projects[projectName].todos.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    text: todoText,
                    completed: completed,
                    priority: priority,
                    dueDate: dueDate,
                    createdAt: new Date()
                });
            }
            
            return Object.values(projects);
        } catch (error) {
            throw new Error(`CSV Parse Error: ${error.message}`);
        }
    }

    mapPriorityFromText(priorityText) {
        if (!priorityText) return 'medium';
        const lower = priorityText.toLowerCase();
        if (lower.includes('hoch') || lower.includes('high')) return 'high';
        if (lower.includes('niedrig') || lower.includes('low')) return 'low';
        return 'medium';
    }

    parseDueDateFromCSV(dateText) {
        if (!dateText || dateText.trim() === '') return null;
        
        try {
            // Try parsing German date format (DD.MM.YYYY)
            const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
            const match = dateText.match(germanDateRegex);
            if (match) {
                const [, day, month, year] = match;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            
            // Fallback to standard date parsing
            const parsedDate = new Date(dateText);
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
        } catch (error) {
            return null;
        }
    }

    mergeData(importedData) {
        importedData.forEach(importedProject => {
            const existingProject = this.projects.find(p => p.name === importedProject.name);
            
            if (existingProject) {
                // Add todos to existing project
                importedProject.todos.forEach(todo => {
                    // Generate new ID to avoid conflicts
                    todo.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    existingProject.todos.push(todo);
                });
            } else {
                // Add new project
                importedProject.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                importedProject.todos.forEach(todo => {
                    todo.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                });
                this.projects.push(importedProject);
            }
        });
    }

    countCompletedTodos() {
        let count = 0;
        this.projects.forEach(project => {
            count += project.todos.filter(todo => todo.completed).length;
        });
        return count;
    }

    confirmArchive() {
        const archiveProject = this.getOrCreateArchiveProject();
        let movedCount = 0;

        // Gehe durch alle Projekte und verschiebe erledigte Todos
        this.projects.forEach(project => {
            if (project.id === archiveProject.id) return; // Skip das Archiv-Projekt selbst
            
            const completedTodos = project.todos.filter(todo => todo.completed);
            const remainingTodos = project.todos.filter(todo => !todo.completed);
            
            // Füge erledigte Todos zum Archiv hinzu
            completedTodos.forEach(todo => {
                // Füge Projektinformation zum Todo hinzu
                todo.originalProject = project.name;
                todo.archivedAt = new Date();
                archiveProject.todos.push(todo);
                movedCount++;
            });
            
            // Behalte nur die nicht erledigten Todos im ursprünglichen Projekt
            project.todos = remainingTodos;
        });

        this.saveToStorage();
        this.renderSidebar();
        this.render();
        this.hideArchiveModal();
        
        alert(`${movedCount} erledigte Todo${movedCount === 1 ? '' : 's'} wurden ins Archiv verschoben.`);
    }

    getOrCreateArchiveProject() {
        // Suche nach existierendem Archiv-Projekt
        let archiveProject = this.projects.find(p => p.id === 'archive');
        
        if (!archiveProject) {
            // Erstelle neues Archiv-Projekt
            archiveProject = {
                id: 'archive',
                name: 'Archiv',
                todos: []
            };
            this.projects.push(archiveProject);
        }
        
        return archiveProject;
    }
}

const app = new TodoApp();