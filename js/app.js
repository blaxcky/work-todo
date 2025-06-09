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
        this.init();
    }

    init() {
        this.applyTheme();
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
        this.render();
    }

    addTodo(projectId, text, priority = 'medium') {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                priority: priority,
                createdAt: new Date()
            };
            project.todos.push(todo);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTodo(projectId, todoId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = !todo.completed;
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

    editTodo(projectId, todoId, newText, newPriority) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                todo.text = newText;
                todo.priority = newPriority;
                this.saveToStorage();
                this.render();
            }
        }
    }

    render() {
        const container = document.getElementById('todo-container');
        container.innerHTML = '';

        this.projects.forEach(project => {
            const filteredTodos = this.searchTerm 
                ? project.todos.filter(todo => 
                    todo.text.toLowerCase().includes(this.searchTerm.toLowerCase()))
                : project.todos;
            
            // Nur Projekte anzeigen, die Todos enthalten (oder alle wenn keine Suche)
            if (!this.searchTerm || filteredTodos.length > 0) {
                const projectEl = document.createElement('div');
                projectEl.className = 'project-section';
                
                projectEl.innerHTML = `
                <div class="project-header">
                    <h2 class="project-title">${project.name}</h2>
                    <div class="project-actions">
                        <button class="add-todo-btn" onclick="app.showAddTodoForm('${project.id}')">
                            + Todo hinzufügen
                        </button>
                        ${project.id !== 'default' ? `
                            <button class="btn-small btn-edit" onclick="app.showEditProjectForm('${project.id}')">
                                Umbenennen
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteProject('${project.id}')">
                                Projekt löschen
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div id="add-form-${project.id}" style="display: none;">
                    <div class="input-group">
                        <input type="text" id="todo-text-${project.id}" placeholder="Todo-Text eingeben...">
                    </div>
                    <div class="input-group">
                        <select id="todo-priority-${project.id}">
                            <option value="low">Niedrig</option>
                            <option value="medium" selected>Mittel</option>
                            <option value="high">Hoch</option>
                        </select>
                    </div>
                    <button onclick="app.submitTodo('${project.id}')" class="add-todo-btn">Hinzufügen</button>
                    <button onclick="app.hideAddTodoForm('${project.id}')" class="btn-small">Abbrechen</button>
                </div>
                <div class="todos-list">
                    ${filteredTodos.map(todo => `
                        <div class="todo-item" data-todo-id="${todo.id}">
                            <input type="checkbox" class="todo-checkbox" 
                                   ${todo.completed ? 'checked' : ''} 
                                   onchange="app.toggleTodo('${project.id}', '${todo.id}')">
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.highlightSearchTerm(todo.text)}</span>
                            <span class="todo-priority priority-${todo.priority}">${this.getPriorityText(todo.priority)}</span>
                            <div class="todo-actions">
                                <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${project.id}', '${todo.id}')">
                                    Bearbeiten
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('${project.id}', '${todo.id}')">
                                    Löschen
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
                container.appendChild(projectEl);
            }
        });
        
        if (this.searchTerm && container.children.length === 0) {
            container.innerHTML = '<div class="no-results">Keine Todos gefunden für "' + this.searchTerm + '"</div>';
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

    showAddTodoForm(projectId) {
        document.getElementById(`add-form-${projectId}`).style.display = 'block';
        document.getElementById(`todo-text-${projectId}`).focus();
    }

    hideAddTodoForm(projectId) {
        document.getElementById(`add-form-${projectId}`).style.display = 'none';
        document.getElementById(`todo-text-${projectId}`).value = '';
    }

    submitTodo(projectId) {
        const textInput = document.getElementById(`todo-text-${projectId}`);
        const prioritySelect = document.getElementById(`todo-priority-${projectId}`);
        
        const text = textInput.value.trim();
        if (text) {
            this.addTodo(projectId, text, prioritySelect.value);
            this.hideAddTodoForm(projectId);
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
        
        todoElement.innerHTML = `
            <div class="edit-todo-form">
                <input type="text" id="edit-text-${todoId}" value="${todo.text}" class="edit-input">
                <select id="edit-priority-${todoId}" class="edit-select">
                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Niedrig</option>
                    <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Mittel</option>
                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>Hoch</option>
                </select>
                <button onclick="app.saveEditTodo('${projectId}', '${todoId}')" class="btn-small">Speichern</button>
                <button onclick="app.cancelEditTodo('${projectId}', '${todoId}')" class="btn-small">Abbrechen</button>
            </div>
        `;
    }

    saveEditTodo(projectId, todoId) {
        const newText = document.getElementById(`edit-text-${todoId}`).value.trim();
        const newPriority = document.getElementById(`edit-priority-${todoId}`).value;
        
        if (newText) {
            this.editTodo(projectId, todoId, newText, newPriority);
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
        if (projectId === 'default') return;
        
        const project = this.projects.find(p => p.id === projectId);
        if (project && confirm(`Projekt "${project.name}" wirklich löschen? Alle Todos gehen verloren.`)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveToStorage();
            this.render();
        }
    }

    showEditProjectForm(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const newName = prompt('Neuer Projektname:', project.name);
        if (newName && newName.trim() !== project.name) {
            project.name = newName.trim();
            this.saveToStorage();
            this.render();
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

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.search(e.target.value);
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
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
                this.projects.forEach(project => {
                    this.hideAddTodoForm(project.id);
                });
                this.hideAddProjectForm();
            }
        });
    }
}

const app = new TodoApp();