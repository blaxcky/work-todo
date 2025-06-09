class TodoApp {
    constructor() {
        this.projects = this.loadFromStorage() || [
            {
                id: 'default',
                name: 'Meine Todos',
                todos: []
            }
        ];
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
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

    render() {
        const container = document.getElementById('todo-container');
        container.innerHTML = '';

        this.projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-section';
            
            projectEl.innerHTML = `
                <div class="project-header">
                    <h2 class="project-title">${project.name}</h2>
                    <button class="add-todo-btn" onclick="app.showAddTodoForm('${project.id}')">
                        + Todo hinzufügen
                    </button>
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
                    ${project.todos.map(todo => `
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox" 
                                   ${todo.completed ? 'checked' : ''} 
                                   onchange="app.toggleTodo('${project.id}', '${todo.id}')">
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                            <span class="todo-priority priority-${todo.priority}">${this.getPriorityText(todo.priority)}</span>
                            <div class="todo-actions">
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('${project.id}', '${todo.id}')">
                                    Löschen
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(projectEl);
        });
    }

    getPriorityText(priority) {
        const priorities = {
            low: 'Niedrig',
            medium: 'Mittel',
            high: 'Hoch'
        };
        return priorities[priority] || 'Mittel';
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

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.projects.forEach(project => {
                    this.hideAddTodoForm(project.id);
                });
            }
        });
    }
}

const app = new TodoApp();