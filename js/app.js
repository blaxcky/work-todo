class TodoApp {
    constructor() {
        this.projects = this.loadFromStorage() || [
            {
                id: 'default',
                name: 'Meine Todos',
                todos: [],
                sections: [{ id: 'general', name: 'Allgemein', collapsed: false }]
            }
        ];
        this.searchTerm = '';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.isCompletedSectionCollapsed = localStorage.getItem('completedSectionCollapsed') === 'true';
        this.currentProjectId = this.projects[0].id;
        this.init();
    }

    init() {
        this.applyTheme();
        this.applySidebarState();
        this.renderSidebar();
        this.render();
        this.bindEvents();
        this.bindProjectEvents();
    }

    loadFromStorage() {
        const data = localStorage.getItem('todoApp');
        if (!data) return null;
        
        const projects = JSON.parse(data);
        
        // Migrate existing projects to support sections
        projects.forEach(project => {
            if (!project.sections) {
                project.sections = [{ id: 'general', name: 'Allgemein', collapsed: false }];
            }
            
            // Migrate existing todos to have a section
            project.todos.forEach(todo => {
                if (!todo.section) {
                    todo.section = 'general';
                }
            });
        });
        
        return projects;
    }


    saveToStorage() {
        localStorage.setItem('todoApp', JSON.stringify(this.projects));
    }

    addProject(name) {
        const project = {
            id: Date.now().toString(),
            name: name,
            todos: [],
            sections: [{ id: 'general', name: 'Allgemein', collapsed: false }]
        };
        this.projects.push(project);
        this.saveToStorage();
        this.renderSidebar();
        this.switchToProject(project.id);
    }

    findTodoById(project, todoId) {
        return project.todos.find(todo => todo.id === todoId) || null;
    }

    addTodo(projectId, text, priority = 'medium', dueDate = null, section = 'general') {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                priority: priority,
                dueDate: dueDate,
                section: section,
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
            const todo = this.findTodoById(project, todoId);
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


    showDeleteTodoModal(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const todo = this.findTodoById(project, todoId);
        if (!todo) return;
        
        // Store the todo info for deletion
        this.todoToDelete = { projectId, todoId };
        
        // Update modal content
        const previewElement = document.getElementById('delete-todo-preview');
        const priorityText = this.getPriorityText(todo.priority);
        const dueDateHtml = todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : '';
        
        previewElement.innerHTML = `
            <div class="todo-text">${todo.text}</div>
            <div class="todo-meta">
                <span class="priority-badge ${todo.priority}">${priorityText}</span>
                ${dueDateHtml}
            </div>
        `;
        
        // Show modal
        document.getElementById('delete-todo-modal').style.display = 'flex';
    }
    
    hideDeleteTodoModal() {
        document.getElementById('delete-todo-modal').style.display = 'none';
        this.todoToDelete = null;
    }
    
    confirmDeleteTodo() {
        if (!this.todoToDelete) return;
        
        const { projectId, todoId } = this.todoToDelete;
        this.deleteTodo(projectId, todoId);
        this.hideDeleteTodoModal();
    }

    deleteTodo(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const mainTodoIndex = project.todos.findIndex(t => t.id === todoId);
            if (mainTodoIndex !== -1) {
                project.todos.splice(mainTodoIndex, 1);
                this.saveToStorage();
                this.render();
            }
        }
    }



    editTodo(projectId, todoId, newText, newPriority, newDueDate = null) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = this.findTodoById(project, todoId);
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
        this.updateFloatingArchiveButton();
        
        // Update completed section visibility after rendering
        setTimeout(() => {
            this.updateCompletedSectionVisibility();
            this.bindCompletedSectionEvents();
            this.bindCheckboxEvents();
            this.bindSectionKeyboardEvents();
        }, 50);
    }

    updateFloatingArchiveButton() {
        const floatingBtn = document.getElementById('floating-archive-btn');
        const badge = document.getElementById('floating-archive-badge');
        const completedMainTodosCount = this.countCompletedMainTodos();
        
        // Zeige den Button nur wenn es erledigte Main-Todos gibt und nicht im Archiv
        if (completedMainTodosCount > 0 && this.currentProjectId !== 'archive') {
            floatingBtn.style.display = 'flex';
            badge.textContent = completedMainTodosCount;
            floatingBtn.title = `${completedMainTodosCount} erledigte Todo${completedMainTodosCount === 1 ? '' : 's'} archivieren`;
        } else {
            floatingBtn.style.display = 'none';
        }
    }

    renderSingleProject(container) {
        const currentProject = this.projects.find(p => p.id === this.currentProjectId);
        
        if (!currentProject) {
            container.innerHTML = '<div class="no-results">Projekt nicht gefunden</div>';
            return;
        }

        const filteredTodos = this.searchTerm 
            ? this.filterTodosRecursive(currentProject.todos, this.searchTerm)
            : currentProject.todos;

        const sortedTodos = this.sortTodosByPriority([...filteredTodos]);

        const sectionOptions = currentProject.sections.map(section => 
            `<option value="${section.id}">${section.name}</option>`
        ).join('');

        container.innerHTML = `
            <div class="project-section">
                <div class="add-todo-form">
                    <div class="input-row">
                        <input type="text" id="todo-text-${currentProject.id}" placeholder="Neues Todo hinzufügen... (p1=hoch, p2=mittel, p3=niedrig)" class="todo-input" autocomplete="off" autocorrect="off" spellcheck="false">
                        <input type="date" id="todo-date-${currentProject.id}" class="todo-date-input" title="Fälligkeitsdatum (optional)" autocomplete="off">
                        <select id="todo-section-${currentProject.id}" class="todo-section-select" title="Bereich auswählen">
                            ${sectionOptions}
                        </select>
                        <button onclick="app.submitTodo('${currentProject.id}')" class="add-btn">+</button>
                    </div>
                </div>
                <div class="todos-list">
                    ${this.renderTodoHierarchy(sortedTodos, currentProject.id)}
                </div>
            </div>
        `;
        
        if (this.searchTerm && sortedTodos.length === 0 && currentProject.todos.length > 0) {
            container.querySelector('.todos-list').innerHTML = '<div class="no-results">Keine Todos gefunden für "' + this.searchTerm + '"</div>';
        }
    }

    renderAllProjects(container) {
        let allTodos = [];
        
        // Alle Todos aus allen Projekten sammeln (inkl. Subtasks) - Archiv ausschließen
        this.projects.forEach(project => {
            if (project.id !== 'archive') {
                this.collectAllTodosFromProject(project, allTodos);
            }
        });

        // Nach Suchbegriff filtern
        const filteredTodos = this.searchTerm 
            ? this.filterTodosRecursive(allTodos, this.searchTerm)
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
                            ${this.renderTodoHierarchyForAllProjects(projectTodos, projectId)}
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    collectAllTodosFromProject(project, allTodos) {
        project.todos.forEach(todo => {
            const todoWithProject = {
                ...todo,
                projectId: project.id,
                projectName: project.name
            };
            allTodos.push(todoWithProject);
        });
    }

    renderTodoHierarchyForAllProjects(todos, projectId, level = 0) {
        return todos.map(todo => {
            let html = `
                <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" 
                     data-todo-id="${todo.id}" data-project-id="${todo.projectId}">
                    <div class="todo-main-content">
                        <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                               ${todo.completed ? 'checked' : ''} 
                               >
                        <div class="todo-content">
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                            ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                        </div>
                        <div class="todo-actions">
                            <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${todo.projectId}', '${todo.id}')" title="Bearbeiten">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.showDeleteTodoModal('${todo.projectId}', '${todo.id}')" title="Löschen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            return html;
        }).join('');
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
            ? this.filterTodosRecursive(archiveProject.todos, this.searchTerm)
            : archiveProject.todos;

        const sortedTodos = this.sortTodosForArchive([...filteredTodos]);

        container.innerHTML = `
            <div class="project-section">
                <div class="archive-info-banner">
                    <div class="archive-banner-icon">📦</div>
                    <div class="archive-banner-text">
                        <h3>Archiv</h3>
                        <p>Alle archivierten Todos • ${archiveProject.todos.length} Einträge</p>
                    </div>
                    <button class="btn-clear-archive" onclick="app.showClearArchiveModal()" title="Archiv leeren">
                        🗑️ Archiv leeren
                    </button>
                </div>
                <div class="todos-list">
                    ${sortedTodos.length > 0 ? this.renderTodoHierarchyForArchive(sortedTodos, 'archive') : '<div class="no-todos">Keine Todos im Archiv gefunden</div>'}
                </div>
            </div>
        `;
        
        if (this.searchTerm && sortedTodos.length === 0 && archiveProject.todos.length > 0) {
            container.querySelector('.todos-list').innerHTML = '<div class="no-results">Keine Archiv-Todos gefunden für "' + this.searchTerm + '"</div>';
        }
    }

    renderTodoHierarchyForArchive(todos, projectId, level = 0) {
        return todos.map(todo => {
            let html = `
                <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" 
                     data-todo-id="${todo.id}" data-project-id="${projectId}">
                    <div class="todo-main-content">
                        <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                               ${todo.completed ? 'checked' : ''} 
                               >
                        <div class="todo-content">
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                            ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                            ${todo.originalProject ? `<span class="original-project">aus: ${todo.originalProject}</span>` : ''}
                        </div>
                        <div class="todo-actions">
                            <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${projectId}', '${todo.id}')" title="Bearbeiten">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.showDeleteTodoModal('${projectId}', '${todo.id}')" title="Löschen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            return html;
        }).join('');
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
        const sorted = todos.sort((a, b) => {
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


        return sorted;
    }

    sortTodosForArchive(todos) {
        const sorted = todos.sort((a, b) => {
            // Sortiere nach Archivierungsdatum (neuste zuerst)
            if (a.archivedAt && b.archivedAt) {
                const dateA = a.archivedAt instanceof Date ? a.archivedAt : new Date(a.archivedAt);
                const dateB = b.archivedAt instanceof Date ? b.archivedAt : new Date(b.archivedAt);
                const dateDiff = dateB - dateA; // Neuste zuerst
                if (dateDiff !== 0) return dateDiff;
            }
            
            // Falls kein Archivierungsdatum, nach Erstellungsdatum sortieren (neuste zuerst)
            const createdA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const createdB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return createdB - createdA;
        });


        return sorted;
    }

    highlightSearchTerm(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    filterTodosRecursive(todos, searchTerm) {
        const filtered = [];
        const term = searchTerm.toLowerCase();
        
        todos.forEach(todo => {
            const matchesText = todo.text.toLowerCase().includes(term);
            
            if (matchesText) {
                filtered.push({ ...todo });
            }
        });
        
        return filtered;
    }

    renderTodoHierarchy(todos, projectId, level = 0) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return '';
        
        let html = '';
        
        // Group todos by section
        const todosBySection = {};
        todos.forEach(todo => {
            const sectionId = todo.section || 'general';
            if (!todosBySection[sectionId]) {
                todosBySection[sectionId] = [];
            }
            todosBySection[sectionId].push(todo);
        });
        
        // Render sections
        project.sections.forEach(section => {
            const sectionTodos = todosBySection[section.id] || [];
            const activeTodos = sectionTodos.filter(todo => !todo.completed);
            const completedTodos = sectionTodos.filter(todo => todo.completed);
            
            // Always show sections, even if empty
            html += `
                <div class="section-container">
                    <div class="section-header" onclick="app.toggleSection('${projectId}', '${section.id}')" style="cursor: pointer;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-toggle-icon ${section.collapsed ? 'collapsed' : ''}">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                        <span class="section-name">${section.name}</span>
                        <span class="section-count">(${sectionTodos.length})</span>
                        <div class="section-actions">
                            <button class="btn-small btn-edit-section" onclick="event.stopPropagation(); app.showEditSectionForm('${projectId}', '${section.id}')" title="Bereich bearbeiten">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-small btn-delete-section" onclick="event.stopPropagation(); app.showDeleteSectionModal('${projectId}', '${section.id}')" title="Bereich löschen">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="section-content" id="section-content-${projectId}-${section.id}" style="display: ${section.collapsed ? 'none' : 'block'}">
            `;
            
            // Render active todos in section
            if (activeTodos.length > 0) {
                html += activeTodos.map(todo => {
                    return this.renderSingleTodo(todo, projectId, level);
                }).join('');
            } else if (sectionTodos.length === 0) {
                html += '<div class="no-todos">Noch keine Todos in diesem Bereich</div>';
            }
            
            // Add completed section if there are completed todos
            if (completedTodos.length > 0) {
                html += `
                    <div class="completed-section">
                        <div class="completed-header" onclick="app.toggleCompletedSection()" style="cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="completed-toggle-icon">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                            <span>Erledigt (${completedTodos.length})</span>
                        </div>
                        <div class="completed-todos" id="completed-todos-${projectId}-${section.id}">
                `;
                
                // Render completed todos
                html += completedTodos.map(todo => {
                    return this.renderSingleTodo(todo, projectId, level);
                }).join('');
                
                html += `
                        </div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        // Add button to create new section
        html += `
            <div class="add-section-container">
                <button class="btn-add-section" onclick="app.showAddSectionForm('${projectId}')" title="Neuen Bereich hinzufügen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Neuen Bereich hinzufügen
                </button>
                <div id="add-section-form-${projectId}" class="add-section-form" style="display: none;">
                    <input type="text" id="section-name-input-${projectId}" placeholder="Bereichsname eingeben..." class="section-input">
                    <div class="form-actions">
                        <button onclick="app.submitSection('${projectId}')" class="btn-confirm" title="Erstellen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"></polyline><path d="m21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path></svg>
                        </button>
                        <button onclick="app.hideAddSectionForm('${projectId}')" class="btn-cancel" title="Abbrechen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    renderSingleTodo(todo, projectId, level = 0) {
        let html = `
            <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}" 
                 data-todo-id="${todo.id}" data-project-id="${projectId}">
                <div class="todo-main-content">
                    <input type="checkbox" class="todo-checkbox priority-${todo.priority}" 
                           ${todo.completed ? 'checked' : ''} 
                           >
                    <div class="todo-content">
                        <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                        ${todo.dueDate ? `<span class="todo-due-date ${this.isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}">📅 ${this.formatDueDate(todo.dueDate)}</span>` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${projectId}', '${todo.id}')" title="Bearbeiten">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-small btn-delete" onclick="app.showDeleteTodoModal('${projectId}', '${todo.id}')" title="Löschen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return html;
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


    parsePriorityFromText(text) {
        // Regex für p1, p2, p3 (case-insensitive)
        const priorityRegex = /\b(p[123])\b/i;
        const match = text.match(priorityRegex);
        
        if (match) {
            const priorityCode = match[1].toLowerCase();
            const cleanedText = text.replace(priorityRegex, '').trim();
            
            let priority;
            switch (priorityCode) {
                case 'p1':
                    priority = 'high';
                    break;
                case 'p2':
                    priority = 'medium';
                    break;
                case 'p3':
                    priority = 'low';
                    break;
                default:
                    priority = 'medium';
            }
            
            return { text: cleanedText, priority };
        }
        
        return { text, priority: null };
    }

    submitTodo(projectId) {
        const textInput = document.getElementById(`todo-text-${projectId}`);
        const dateInput = document.getElementById(`todo-date-${projectId}`);
        const sectionSelect = document.getElementById(`todo-section-${projectId}`);
        
        const originalText = textInput.value.trim();
        const dueDate = dateInput.value ? new Date(dateInput.value) : null;
        const selectedSection = sectionSelect ? sectionSelect.value : 'general';
        
        if (originalText) {
            // Parse Priorität aus dem Text
            const { text, priority: parsedPriority } = this.parsePriorityFromText(originalText);
            
            // Verwende geparste Priorität, falls vorhanden, sonst Standard-Priorität
            const finalPriority = parsedPriority || 'medium';
            
            this.addTodo(projectId, text, finalPriority, dueDate, selectedSection);
            // Nach dem Re-Rendering die neuen Elemente finden und Fokus setzen
            setTimeout(() => {
                const newTextInput = document.getElementById(`todo-text-${projectId}`);
                const newDateInput = document.getElementById(`todo-date-${projectId}`);
                const newSectionSelect = document.getElementById(`todo-section-${projectId}`);
                if (newTextInput) {
                    newTextInput.value = '';
                    newTextInput.focus();
                }
                if (newDateInput) {
                    newDateInput.value = '';
                }
                if (newSectionSelect) {
                    newSectionSelect.value = 'general';
                }
            }, 0);
        }
    }

    showEditTodoForm(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        const todo = this.findTodoById(project, todoId);
        
        if (!todo) {
            console.error('Todo nicht gefunden:', todoId);
            return;
        }
        
        const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
        if (!todoElement) {
            // Fallback: Re-render mit Edit-Form
            this.render();
            return;
        }
        
        const dueDateValue = todo.dueDate ? (todo.dueDate instanceof Date ? todo.dueDate.toISOString().split('T')[0] : new Date(todo.dueDate).toISOString().split('T')[0]) : '';
        
        // Find the todo-main-content div to replace it
        const mainContent = todoElement.querySelector('.todo-main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="edit-todo-form">
                    <input type="text" id="edit-text-${todoId}" value="${todo.text.replace(/"/g, '&quot;')}" class="edit-input" placeholder="Text bearbeiten... (p1=hoch, p2=mittel, p3=niedrig)" autocomplete="off" autocorrect="off" spellcheck="false">
                    <input type="date" id="edit-date-${todoId}" value="${dueDateValue}" class="edit-date-input" title="Fälligkeitsdatum" autocomplete="off">
                    <button onclick="app.saveEditTodo('${projectId}', '${todoId}')" class="btn-small" title="Speichern">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"></polyline><path d="m21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path></svg>
                    </button>
                    <button onclick="app.cancelEditTodo('${projectId}', '${todoId}')" class="btn-small" title="Abbrechen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
            
            // Focus on the text input and set cursor to end
            const textInput = document.getElementById(`edit-text-${todoId}`);
            textInput.focus();
            textInput.setSelectionRange(textInput.value.length, textInput.value.length);
        }
    }

    saveEditTodo(projectId, todoId) {
        const originalText = document.getElementById(`edit-text-${todoId}`).value.trim();
        const newDateValue = document.getElementById(`edit-date-${todoId}`).value;
        const newDueDate = newDateValue ? new Date(newDateValue) : null;
        
        if (originalText) {
            // Parse Priorität aus dem Text
            const { text, priority: parsedPriority } = this.parsePriorityFromText(originalText);
            
            // Verwende geparste Priorität, falls vorhanden, sonst behalte die aktuelle Priorität
            const project = this.projects.find(p => p.id === projectId);
            const currentTodo = this.findTodoById(project, todoId);
            const finalPriority = parsedPriority || currentTodo.priority;
            
            this.editTodo(projectId, todoId, text, finalPriority, newDueDate);
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
            
            
            // Event listener für Edit-Todo-Eingabefelder
            if (e.target.classList.contains('edit-input') && e.key === 'Enter') {
                const todoId = e.target.id.replace('edit-text-', '');
                const projectId = this.currentProjectId;
                this.saveEditTodo(projectId, todoId);
            }
            
            
            // ESC zum Abbrechen von Edit-Formularen
            if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
                const todoId = e.target.id.replace('edit-text-', '');
                const projectId = this.currentProjectId;
                this.cancelEditTodo(projectId, todoId);
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

        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('menu-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdownMenu();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdown-content');
            const menuToggle = document.getElementById('menu-toggle');
            if (!menuToggle.contains(e.target) && !dropdown.contains(e.target)) {
                this.closeDropdownMenu();
            }
        });

        document.getElementById('archive-btn').addEventListener('click', () => {
            this.closeDropdownMenu();
            this.showArchiveModal();
        });

        document.getElementById('floating-archive-btn').addEventListener('click', () => {
            this.showArchiveModal();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.closeDropdownMenu();
            this.showExportModal();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            this.closeDropdownMenu();
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

        document.getElementById('clear-archive-modal').addEventListener('click', (e) => {
            if (e.target.id === 'clear-archive-modal') {
                this.hideClearArchiveModal();
            }
        });

        document.getElementById('delete-todo-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-todo-modal') {
                this.hideDeleteTodoModal();
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

        document.getElementById('clear-archive-cancel').addEventListener('click', () => {
            this.hideClearArchiveModal();
        });

        document.getElementById('clear-archive-confirm').addEventListener('click', () => {
            this.confirmClearArchive();
        });

        // Delete todo modal events
        document.getElementById('delete-todo-cancel').addEventListener('click', () => {
            this.hideDeleteTodoModal();
        });

        document.getElementById('delete-todo-confirm').addEventListener('click', () => {
            this.confirmDeleteTodo();
        });
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('darkTheme', this.isDarkTheme);
        this.applyTheme();
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
        this.applySidebarState();
    }

    applySidebarState() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (this.isSidebarCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
    }

    toggleDropdownMenu() {
        const dropdown = document.getElementById('dropdown-content');
        dropdown.classList.toggle('show');
    }

    closeDropdownMenu() {
        const dropdown = document.getElementById('dropdown-content');
        dropdown.classList.remove('show');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        const messageElement = toast.querySelector('.toast-message');
        
        // Reset classes
        toast.classList.remove('toast-success', 'toast-error', 'toast-info');
        
        // Add appropriate class
        toast.classList.add(`toast-${type}`);
        
        messageElement.textContent = message;
        toast.classList.add('show');
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
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
                this.closeDropdownMenu();
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
        this.hideClearArchiveModal();
        this.hideDeleteTodoModal();
    }

    showArchiveModal() {
        const completedMainTodosCount = this.countCompletedMainTodos();
        if (completedMainTodosCount === 0) {
            this.showToast('Keine erledigten Main-Todos zum Archivieren gefunden.', 'info');
            return;
        }
        
        document.getElementById('archive-count-text').textContent = 
            `${completedMainTodosCount} erledigte Todo${completedMainTodosCount === 1 ? '' : 's'} werden in das Projekt "Archiv" verschoben.`;
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
            this.showToast('Bitte wählen Sie eine JSON oder CSV Datei aus.', 'error');
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
            
            this.showToast(`Daten erfolgreich importiert! ${mode === 'replace' ? 'Ersetzt' : 'Zusammengeführt'}`);
        } catch (error) {
            this.showToast(`Fehler beim Importieren: ${error.message}`, 'error');
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
            // Exclude archive project from completed todos count
            if (project.id !== 'archive') {
                count += this.countCompletedTodosInList(project.todos);
            }
        });
        return count;
    }

    countCompletedMainTodos() {
        let count = 0;
        this.projects.forEach(project => {
            // Exclude archive project and only count main-level completed todos
            if (project.id !== 'archive') {
                count += project.todos.filter(todo => todo.completed).length;
            }
        });
        return count;
    }

    countCompletedTodosInList(todos) {
        let count = 0;
        todos.forEach(todo => {
            if (todo.completed) {
                count++;
            }
        });
        return count;
    }

    confirmArchive() {
        const archiveProject = this.getOrCreateArchiveProject();
        let movedCount = 0;

        // Gehe durch alle Projekte und verschiebe erledigte Todos (außer Archiv)
        this.projects.forEach(project => {
            if (project.id === archiveProject.id || project.id === 'archive') return; // Skip das Archiv-Projekt selbst
            
            const completedTodos = project.todos.filter(todo => todo.completed);
            const remainingTodos = project.todos.filter(todo => !todo.completed);
            
            // Füge erledigte Todos zum Archiv hinzu (am Anfang, damit neue oben stehen)
            completedTodos.forEach(todo => {
                // Füge Projektinformation zum Todo hinzu
                todo.originalProject = project.name;
                todo.archivedAt = new Date();
                archiveProject.todos.unshift(todo); // unshift() fügt am Anfang hinzu
                movedCount++;
            });
            
            // Behalte nur die nicht erledigten Todos im ursprünglichen Projekt
            project.todos = remainingTodos;
        });

        this.saveToStorage();
        this.renderSidebar();
        this.render();
        this.hideArchiveModal();
        
        this.showToast(`${movedCount} erledigte Todo${movedCount === 1 ? '' : 's'} wurden ins Archiv verschoben.`);
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

    showClearArchiveModal() {
        const archiveProject = this.projects.find(p => p.id === 'archive');
        if (!archiveProject || archiveProject.todos.length === 0) {
            this.showToast('Das Archiv ist bereits leer.', 'info');
            return;
        }
        
        document.getElementById('clear-archive-count-text').textContent = 
            `${archiveProject.todos.length} Todo${archiveProject.todos.length === 1 ? '' : 's'} im Archiv ${archiveProject.todos.length === 1 ? 'wird' : 'werden'} permanent gelöscht.`;
        document.getElementById('clear-archive-modal').style.display = 'flex';
    }

    hideClearArchiveModal() {
        document.getElementById('clear-archive-modal').style.display = 'none';
    }

    confirmClearArchive() {
        const archiveProject = this.projects.find(p => p.id === 'archive');
        if (!archiveProject) {
            this.showToast('Archiv-Projekt nicht gefunden.', 'error');
            return;
        }

        const todoCount = archiveProject.todos.length;
        archiveProject.todos = [];
        
        this.saveToStorage();
        this.renderSidebar();
        this.render();
        this.hideClearArchiveModal();
        
        this.showToast(`${todoCount} Todo${todoCount === 1 ? '' : 's'} aus dem Archiv gelöscht.`);
    }

    toggleCompletedSection() {
        console.log('toggleCompletedSection called, current state:', this.isCompletedSectionCollapsed);
        this.isCompletedSectionCollapsed = !this.isCompletedSectionCollapsed;
        localStorage.setItem('completedSectionCollapsed', this.isCompletedSectionCollapsed);
        console.log('New state:', this.isCompletedSectionCollapsed);
        this.updateCompletedSectionVisibility();
    }

    updateCompletedSectionVisibility() {
        const completedSections = document.querySelectorAll('.completed-todos');
        const toggleIcons = document.querySelectorAll('.completed-toggle-icon');
        
        console.log('updateCompletedSectionVisibility called');
        console.log('Found completed sections:', completedSections.length);
        console.log('Found toggle icons:', toggleIcons.length);
        console.log('isCompletedSectionCollapsed:', this.isCompletedSectionCollapsed);
        
        completedSections.forEach(section => {
            if (this.isCompletedSectionCollapsed) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
        
        toggleIcons.forEach(icon => {
            if (this.isCompletedSectionCollapsed) {
                icon.style.transform = 'rotate(0deg)';
            } else {
                icon.style.transform = 'rotate(90deg)';
            }
        });
    }
    
    bindCompletedSectionEvents() {
        const completedHeaders = document.querySelectorAll('.completed-header');
        console.log('Binding events to completed headers:', completedHeaders.length);
        
        completedHeaders.forEach(header => {
            // Remove existing event listeners
            header.removeEventListener('click', this.toggleCompletedSection.bind(this));
            // Add new event listener
            header.addEventListener('click', this.toggleCompletedSection.bind(this));
        });
    }
    
    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('.todo-checkbox');
        
        checkboxes.forEach(checkbox => {
            // Remove existing event listeners by cloning the element
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
            
            newCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const todoItem = newCheckbox.closest('.todo-item');
                const todoId = todoItem.dataset.todoId;
                const projectId = todoItem.dataset.projectId;
                this.toggleTodo(projectId, todoId);
            });
        });
    }

    bindSectionKeyboardEvents() {
        // Bind Enter key to section input forms
        document.querySelectorAll('.section-input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const projectId = input.id.replace('section-name-input-', '');
                    this.submitSection(projectId);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    const projectId = input.id.replace('section-name-input-', '');
                    this.hideAddSectionForm(projectId);
                }
            });
        });
    }

    // Section Management Functions
    toggleSection(projectId, sectionId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const section = project.sections.find(s => s.id === sectionId);
            if (section) {
                section.collapsed = !section.collapsed;
                this.saveToStorage();
                
                // Update UI
                const sectionContent = document.getElementById(`section-content-${projectId}-${sectionId}`);
                const toggleIcon = sectionContent.parentElement.querySelector('.section-toggle-icon');
                
                if (section.collapsed) {
                    sectionContent.style.display = 'none';
                    toggleIcon.classList.add('collapsed');
                } else {
                    sectionContent.style.display = 'block';
                    toggleIcon.classList.remove('collapsed');
                }
            }
        }
    }

    showAddSectionForm(projectId) {
        const form = document.getElementById(`add-section-form-${projectId}`);
        const input = document.getElementById(`section-name-input-${projectId}`);
        
        if (form) {
            form.style.display = 'block';
            input.focus();
        }
    }

    hideAddSectionForm(projectId) {
        const form = document.getElementById(`add-section-form-${projectId}`);
        const input = document.getElementById(`section-name-input-${projectId}`);
        
        if (form) {
            form.style.display = 'none';
            input.value = '';
        }
    }

    submitSection(projectId) {
        const input = document.getElementById(`section-name-input-${projectId}`);
        const name = input.value.trim();
        
        if (name) {
            this.addSection(projectId, name);
            this.hideAddSectionForm(projectId);
        }
    }

    addSection(projectId, name) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const section = {
                id: Date.now().toString(),
                name: name,
                collapsed: false
            };
            project.sections.push(section);
            this.saveToStorage();
            this.render();
        }
    }

    showEditSectionForm(projectId, sectionId) {
        const project = this.projects.find(p => p.id === projectId);
        const section = project?.sections.find(s => s.id === sectionId);
        
        if (section) {
            const sectionNameSpan = document.querySelector(`#section-content-${projectId}-${sectionId}`).parentElement.querySelector('.section-name');
            const currentName = section.name;
            
            sectionNameSpan.innerHTML = `<input type="text" id="edit-section-input-${sectionId}" value="${currentName}" class="section-edit-input" style="background: transparent; border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px; font-size: inherit;">`;
            
            const input = document.getElementById(`edit-section-input-${sectionId}`);
            input.focus();
            input.select();
            
            const handleSave = () => {
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    section.name = newName;
                    this.saveToStorage();
                }
                sectionNameSpan.textContent = newName || currentName;
                input.removeEventListener('blur', handleSave);
                input.removeEventListener('keypress', handleKeyPress);
            };
            
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    handleSave();
                } else if (e.key === 'Escape') {
                    sectionNameSpan.textContent = currentName;
                    input.removeEventListener('blur', handleSave);
                    input.removeEventListener('keypress', handleKeyPress);
                }
            };
            
            input.addEventListener('blur', handleSave);
            input.addEventListener('keypress', handleKeyPress);
        }
    }

    showDeleteSectionModal(projectId, sectionId) {
        const project = this.projects.find(p => p.id === projectId);
        const section = project?.sections.find(s => s.id === sectionId);
        
        if (section && section.id !== 'general') {
            const todosInSection = project.todos.filter(todo => todo.section === sectionId);
            
            if (todosInSection.length > 0) {
                const confirmMove = confirm(`Der Bereich "${section.name}" enthält ${todosInSection.length} Todo(s). Diese werden in den Bereich "Allgemein" verschoben. Fortfahren?`);
                if (confirmMove) {
                    this.deleteSection(projectId, sectionId);
                }
            } else {
                const confirmDelete = confirm(`Soll der Bereich "${section.name}" wirklich gelöscht werden?`);
                if (confirmDelete) {
                    this.deleteSection(projectId, sectionId);
                }
            }
        }
    }

    deleteSection(projectId, sectionId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && sectionId !== 'general') {
            // Move todos to general section
            project.todos.forEach(todo => {
                if (todo.section === sectionId) {
                    todo.section = 'general';
                }
            });
            
            // Remove section
            project.sections = project.sections.filter(s => s.id !== sectionId);
            
            this.saveToStorage();
            this.render();
        }
    }

}

// Make app globally available for onclick handlers
window.app = new TodoApp();