(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function o(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(t){if(t.ep)return;t.ep=!0;const i=o(t);fetch(t.href,i)}})();class v{constructor(){this.projects=this.loadFromStorage()||[{id:"default",name:"Meine Todos",todos:[]}],this.searchTerm="",this.isDarkTheme=localStorage.getItem("darkTheme")==="true",this.isSidebarCollapsed=localStorage.getItem("sidebarCollapsed")==="true",this.isCompletedSectionCollapsed=localStorage.getItem("completedSectionCollapsed")!=="false",this.currentProjectId=this.projects[0].id,this.init()}init(){this.applyTheme(),this.applySidebarState(),this.renderSidebar(),this.render(),this.bindEvents(),this.bindProjectEvents()}loadFromStorage(){const e=localStorage.getItem("todoApp");if(!e)return null;const o=JSON.parse(e);return o.forEach(s=>{s.todos.forEach(t=>{t.subtasks||(t.subtasks=[]),t.collapsed===void 0&&(t.collapsed=!1),t.parentId||(t.parentId=null),this.migrateTodoData(t)})}),o}migrateTodoData(e){e.subtasks&&e.subtasks.forEach(o=>{o.subtasks||(o.subtasks=[]),o.collapsed===void 0&&(o.collapsed=!1),o.parentId||(o.parentId=e.id),this.migrateTodoData(o)})}saveToStorage(){localStorage.setItem("todoApp",JSON.stringify(this.projects))}addProject(e){const o={id:Date.now().toString(),name:e,todos:[]};this.projects.push(o),this.saveToStorage(),this.renderSidebar(),this.switchToProject(o.id)}findTodoById(e,o){for(let s of e.todos){if(s.id===o)return s;const t=this.findTodoInSubtasks(s,o);if(t)return t}return null}findTodoInSubtasks(e,o){if(!e.subtasks)return null;for(let s of e.subtasks){if(s.id===o)return s;const t=this.findTodoInSubtasks(s,o);if(t)return t}return null}addTodo(e,o,s="medium",t=null,i=null){const r=this.projects.find(n=>n.id===e);if(r){const n={id:Date.now().toString(),text:o,completed:!1,priority:s,dueDate:t,createdAt:new Date,parentId:i,subtasks:[],collapsed:!1};if(i){const a=this.findTodoById(r,i);a&&a.subtasks.push(n)}else r.todos.push(n);return this.saveToStorage(),this.render(),!0}return!1}toggleTodo(e,o){const s=this.projects.find(t=>t.id===e);if(s){const t=this.findTodoById(s,o);if(t){const i=t.completed;if(t.completed=!t.completed,t.subtasks&&t.subtasks.length>0&&this.toggleSubtasks(t.subtasks,t.completed),!i){const r=document.querySelector(`[data-todo-id="${o}"]`);if(r){r.style.transition="all 0.3s ease",r.style.transform="scale(0.98)",r.style.opacity="0.8",setTimeout(()=>{this.saveToStorage(),this.render()},300);return}}this.saveToStorage(),this.render()}}}toggleSubtasks(e,o){e.forEach(s=>{s.completed=o,s.subtasks&&s.subtasks.length>0&&this.toggleSubtasks(s.subtasks,o)})}deleteTodo(e,o){const s=this.projects.find(t=>t.id===e);if(s){const t=s.todos.findIndex(i=>i.id===o);t!==-1?s.todos.splice(t,1):this.deleteFromSubtasks(s.todos,o),this.saveToStorage(),this.render()}}deleteFromSubtasks(e,o){for(let s of e)if(s.subtasks){const t=s.subtasks.findIndex(i=>i.id===o);if(t!==-1)return s.subtasks.splice(t,1),!0;if(this.deleteFromSubtasks(s.subtasks,o))return!0}return!1}toggleSubtaskCollapse(e,o){const s=this.projects.find(t=>t.id===e);if(s){const t=this.findTodoById(s,o);t&&t.subtasks&&t.subtasks.length>0&&(t.collapsed=!t.collapsed,this.saveToStorage(),this.render())}}addSubtask(e,o,s,t="medium",i=null){return this.addTodo(e,s,t,i,o)}editTodo(e,o,s,t,i=null){const r=this.projects.find(n=>n.id===e);if(r){const n=this.findTodoById(r,o);n&&(n.text=s,n.priority=t,n.dueDate=i,this.saveToStorage(),this.render())}}renderSidebar(){const e=document.querySelector(".project-list");e.innerHTML="";const o=document.createElement("div");o.className=`project-item special-project ${this.currentProjectId==="all"?"active":""}`,o.onclick=()=>this.switchToProject("all"),o.innerHTML=`
            <span class="project-name">📋 Alle Projekte</span>
        `,e.appendChild(o);const s=this.projects.find(t=>t.id==="archive");if(s&&s.todos.length>0){const t=document.createElement("div");t.className=`project-item special-project ${this.currentProjectId==="archive"?"active":""}`,t.onclick=()=>this.switchToProject("archive"),t.innerHTML=`
                <span class="project-name">📦 Archiv</span>
                <span class="todo-count">${s.todos.length}</span>
            `,e.appendChild(t)}if(this.projects.filter(t=>t.id!=="archive").length>0){const t=document.createElement("div");t.className="project-separator",e.appendChild(t)}this.projects.filter(t=>t.id!=="archive").forEach(t=>{const i=document.createElement("div");i.className=`project-item ${t.id===this.currentProjectId?"active":""}`,i.onclick=()=>this.switchToProject(t.id),i.innerHTML=`
                <span class="project-name">${t.name}</span>
                ${t.id!=="default"?`
                    <div class="project-actions">
                        <button class="btn-small btn-edit" onclick="event.stopPropagation(); app.showEditProjectForm('${t.id}')" title="Bearbeiten">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-small btn-delete" onclick="event.stopPropagation(); app.deleteProject('${t.id}')" title="Löschen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                `:""}
            `,i.addEventListener("dragover",r=>this.handleDragOver(r)),i.addEventListener("drop",r=>this.handleDrop(r,t.id)),i.addEventListener("dragenter",r=>this.handleDragEnter(r)),i.addEventListener("dragleave",r=>this.handleDragLeave(r)),e.appendChild(i)})}switchToProject(e){this.currentProjectId=e,this.renderSidebar(),this.render(),this.updatePageTitle()}updatePageTitle(){const e=document.getElementById("current-project-title");if(e)if(this.currentProjectId==="all")e.textContent="Alle Projekte";else if(this.currentProjectId==="archive")e.textContent="Archiv";else{const o=this.projects.find(s=>s.id===this.currentProjectId);o&&(e.textContent=o.name)}}render(){const e=document.getElementById("todo-container");this.currentProjectId==="all"?this.renderAllProjects(e):this.currentProjectId==="archive"?this.renderArchiveProject(e):this.renderSingleProject(e),this.updatePageTitle(),this.updateFloatingArchiveButton(),setTimeout(()=>{this.updateCompletedSectionVisibility()},50)}updateFloatingArchiveButton(){const e=document.getElementById("floating-archive-btn"),o=document.getElementById("floating-archive-badge"),s=this.countCompletedMainTodos();s>0&&this.currentProjectId!=="archive"?(e.style.display="flex",o.textContent=s,e.title=`${s} erledigte Todo${s===1?"":"s"} archivieren`):e.style.display="none"}renderSingleProject(e){const o=this.projects.find(i=>i.id===this.currentProjectId);if(!o){e.innerHTML='<div class="no-results">Projekt nicht gefunden</div>';return}const s=this.searchTerm?this.filterTodosRecursive(o.todos,this.searchTerm):o.todos,t=this.sortTodosByPriority([...s]);e.innerHTML=`
            <div class="project-section">
                <div class="add-todo-form">
                    <div class="input-row">
                        <input type="text" id="todo-text-${o.id}" placeholder="Neues Todo hinzufügen... (p1=hoch, p2=mittel, p3=niedrig)" class="todo-input" autocomplete="off" autocorrect="off" spellcheck="false">
                        <input type="date" id="todo-date-${o.id}" class="todo-date-input" title="Fälligkeitsdatum (optional)" autocomplete="off">
                        <button onclick="app.submitTodo('${o.id}')" class="add-btn">+</button>
                    </div>
                </div>
                <div class="todos-list">
                    ${t.length>0?this.renderTodoHierarchy(t,o.id):'<div class="no-todos">Noch keine Todos in diesem Projekt</div>'}
                </div>
            </div>
        `,this.searchTerm&&t.length===0&&o.todos.length>0&&(e.querySelector(".todos-list").innerHTML='<div class="no-results">Keine Todos gefunden für "'+this.searchTerm+'"</div>')}renderAllProjects(e){let o=[];this.projects.forEach(r=>{this.collectAllTodosFromProject(r,o)});const s=this.searchTerm?this.filterTodosRecursive(o,this.searchTerm):o,t={};s.forEach(r=>{t[r.projectId]||(t[r.projectId]=[]),t[r.projectId].push(r)}),Object.keys(t).forEach(r=>{t[r]=this.sortTodosByPriority(t[r])});let i="";Object.keys(t).length===0?i='<div class="no-todos">Keine Todos gefunden</div>':Object.keys(t).forEach(r=>{const n=t[r],a=n[0].projectName;i+=`
                    <div class="project-section">
                        <div class="project-header">
                            <h3 class="project-title">${a}</h3>
                        </div>
                        <div class="todos-list">
                            ${this.renderTodoHierarchyForAllProjects(n,r)}
                        </div>
                    </div>
                `}),e.innerHTML=i}collectAllTodosFromProject(e,o){e.todos.forEach(s=>{const t={...s,projectId:e.id,projectName:e.name,collapsed:s.collapsed!==void 0?s.collapsed:!0};o.push(t)})}renderTodoHierarchyForAllProjects(e,o,s=0){return e.map(t=>{const i=t.subtasks&&t.subtasks.length>0,r=t.collapsed!==void 0?t.collapsed:!0,n=s*20;let a=`
                <div class="todo-item ${t.completed?"completed":""} priority-${t.priority} ${this.isOverdue(t.dueDate)&&!t.completed?"overdue":""} ${i&&!r?"has-visible-subtasks":""}" 
                     data-todo-id="${t.id}" data-project-id="${t.projectId}" 
                     style="padding-left: ${n+12}px">
                    <div class="todo-main-content">
                        <div class="drag-handle" 
                             draggable="true" 
                             onmousedown="app.handleDragStart(event)" 
                             ondragstart="app.handleDragStart(event)" 
                             ondragend="app.handleDragEnd(event)" 
                             title="Zum Verschieben ziehen">
                            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="3" cy="3" r="1" fill="currentColor"/>
                                <circle cx="9" cy="3" r="1" fill="currentColor"/>
                                <circle cx="3" cy="8" r="1" fill="currentColor"/>
                                <circle cx="9" cy="8" r="1" fill="currentColor"/>
                                <circle cx="3" cy="13" r="1" fill="currentColor"/>
                                <circle cx="9" cy="13" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                        ${i?`
                            <button class="subtask-toggle" onclick="app.toggleSubtaskCollapse('${t.projectId}', '${t.id}')" title="${r?"Aufklappen":"Zuklappen"}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${r?0:90}deg); transition: transform 0.3s ease;">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                                <span class="subtask-count">(${t.subtasks.length})</span>
                            </button>
                        `:'<div class="subtask-spacer"></div>'}
                        
                        <input type="checkbox" class="todo-checkbox priority-${t.priority}" 
                               ${t.completed?"checked":""} 
                               onchange="app.toggleTodo('${t.projectId}', '${t.id}')">
                        <div class="todo-content">
                            <span class="todo-text ${t.completed?"completed":""}">${this.highlightSearchTerm(t.text)}</span>
                            ${t.dueDate?`<span class="todo-due-date ${this.isOverdue(t.dueDate)&&!t.completed?"overdue":""}">📅 ${this.formatDueDate(t.dueDate)}</span>`:""}
                        </div>
                        <div class="todo-actions">
                            ${s<3?`
                                <button class="btn-small btn-add-subtask" onclick="app.showAddSubtaskForm('${t.projectId}', '${t.id}')" title="Unter-Aufgabe hinzufügen">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            `:""}
                            <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${t.projectId}', '${t.id}')" title="Bearbeiten">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteTodo('${t.projectId}', '${t.id}')" title="Löschen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;if(i&&!r){const d=t.subtasks.map(c=>({...c,projectId:t.projectId,projectName:t.projectName}));a+=this.renderTodoHierarchyForAllProjects(d,o,s+1)}return a}).join("")}renderArchiveProject(e){const o=this.projects.find(i=>i.id==="archive");if(!o||o.todos.length===0){e.innerHTML=`
                <div class="project-section">
                    <div class="archive-empty">
                        <div class="archive-empty-icon">📦</div>
                        <h3>Archiv ist leer</h3>
                        <p>Verwenden Sie den "Archivieren" Button, um erledigte Todos hierher zu verschieben.</p>
                    </div>
                </div>
            `;return}const s=this.searchTerm?this.filterTodosRecursive(o.todos,this.searchTerm):o.todos,t=this.sortTodosForArchive([...s]);e.innerHTML=`
            <div class="project-section">
                <div class="archive-info-banner">
                    <div class="archive-banner-icon">📦</div>
                    <div class="archive-banner-text">
                        <h3>Archiv</h3>
                        <p>Alle archivierten Todos • ${o.todos.length} Einträge</p>
                    </div>
                    <button class="btn-clear-archive" onclick="app.showClearArchiveModal()" title="Archiv leeren">
                        🗑️ Archiv leeren
                    </button>
                </div>
                <div class="todos-list">
                    ${t.length>0?this.renderTodoHierarchyForArchive(t,"archive"):'<div class="no-todos">Keine Todos im Archiv gefunden</div>'}
                </div>
            </div>
        `,this.searchTerm&&t.length===0&&o.todos.length>0&&(e.querySelector(".todos-list").innerHTML='<div class="no-results">Keine Archiv-Todos gefunden für "'+this.searchTerm+'"</div>')}renderTodoHierarchyForArchive(e,o,s=0){return e.map(t=>{const i=t.subtasks&&t.subtasks.length>0,r=t.collapsed!==void 0?t.collapsed:!0,n=s*20;let a=`
                <div class="todo-item ${t.completed?"completed":""} priority-${t.priority} ${this.isOverdue(t.dueDate)&&!t.completed?"overdue":""} ${i&&!r?"has-visible-subtasks":""}" 
                     data-todo-id="${t.id}" data-project-id="${o}" 
                     style="padding-left: ${n+12}px">
                    <div class="todo-main-content">
                        <div class="drag-handle" 
                             draggable="true" 
                             onmousedown="app.handleDragStart(event)" 
                             ondragstart="app.handleDragStart(event)" 
                             ondragend="app.handleDragEnd(event)" 
                             title="Zum Verschieben ziehen">
                            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="3" cy="3" r="1" fill="currentColor"/>
                                <circle cx="9" cy="3" r="1" fill="currentColor"/>
                                <circle cx="3" cy="8" r="1" fill="currentColor"/>
                                <circle cx="9" cy="8" r="1" fill="currentColor"/>
                                <circle cx="3" cy="13" r="1" fill="currentColor"/>
                                <circle cx="9" cy="13" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                        ${i?`
                            <button class="subtask-toggle" onclick="app.toggleSubtaskCollapse('${o}', '${t.id}')" title="${r?"Aufklappen":"Zuklappen"}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${r?0:90}deg); transition: transform 0.3s ease;">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                                <span class="subtask-count">(${t.subtasks.length})</span>
                            </button>
                        `:'<div class="subtask-spacer"></div>'}
                        
                        <input type="checkbox" class="todo-checkbox priority-${t.priority}" 
                               ${t.completed?"checked":""} 
                               onchange="app.toggleTodo('${o}', '${t.id}')">
                        <div class="todo-content">
                            <span class="todo-text ${t.completed?"completed":""}">${this.highlightSearchTerm(t.text)}</span>
                            ${t.dueDate?`<span class="todo-due-date ${this.isOverdue(t.dueDate)&&!t.completed?"overdue":""}">📅 ${this.formatDueDate(t.dueDate)}</span>`:""}
                            ${t.originalProject?`<span class="original-project">aus: ${t.originalProject}</span>`:""}
                        </div>
                        <div class="todo-actions">
                            ${s<3?`
                                <button class="btn-small btn-add-subtask" onclick="app.showAddSubtaskForm('${o}', '${t.id}')" title="Unter-Aufgabe hinzufügen">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M8 6h13"></path>
                                        <path d="M8 12h13"></path>
                                        <path d="M8 18h13"></path>
                                        <path d="M3 6h.01"></path>
                                        <path d="M3 12h.01"></path>
                                        <path d="M3 18h.01"></path>
                                    </svg>
                                </button>
                            `:""}
                            <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${o}', '${t.id}')" title="Bearbeiten">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteTodo('${o}', '${t.id}')" title="Löschen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;return i&&!r&&(a+=this.renderTodoHierarchyForArchive(t.subtasks,o,s+1)),a}).join("")}getPriorityText(e){return{low:"Niedrig",medium:"Mittel",high:"Hoch"}[e]||"Mittel"}formatDueDate(e){if(!e)return"";const o=e instanceof Date?e:new Date(e),s=new Date,t=new Date(s);t.setDate(s.getDate()+1);const i=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()),r=i(o),n=i(s),a=i(t);return r.getTime()===n.getTime()?"Heute":r.getTime()===a.getTime()?"Morgen":o.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}isOverdue(e){if(!e)return!1;const o=e instanceof Date?e:new Date(e),s=new Date,t=i=>new Date(i.getFullYear(),i.getMonth(),i.getDate());return t(o)<t(s)}sortTodosByPriority(e){const o={high:3,medium:2,low:1},s=e.sort((t,i)=>{if(t.completed!==i.completed)return t.completed?1:-1;if(!t.completed&&!i.completed){const c=this.isOverdue(t.dueDate),l=this.isOverdue(i.dueDate);if(c!==l)return c?-1:1}const r=t.dueDate&&!t.completed,n=i.dueDate&&!i.completed;if(r&&!n)return-1;if(!r&&n)return 1;if(r&&n){const c=t.dueDate instanceof Date?t.dueDate:new Date(t.dueDate),l=i.dueDate instanceof Date?i.dueDate:new Date(i.dueDate),h=c-l;if(h!==0)return h}const a=o[t.priority]||2,d=o[i.priority]||2;return a!==d?d-a:new Date(i.createdAt)-new Date(t.createdAt)});return s.forEach(t=>{t.subtasks&&t.subtasks.length>0&&(t.subtasks=this.sortTodosByPriority(t.subtasks))}),s}sortTodosForArchive(e){const o=e.sort((s,t)=>{if(s.archivedAt&&t.archivedAt){const n=s.archivedAt instanceof Date?s.archivedAt:new Date(s.archivedAt),d=(t.archivedAt instanceof Date?t.archivedAt:new Date(t.archivedAt))-n;if(d!==0)return d}const i=s.createdAt instanceof Date?s.createdAt:new Date(s.createdAt);return(t.createdAt instanceof Date?t.createdAt:new Date(t.createdAt))-i});return o.forEach(s=>{s.subtasks&&s.subtasks.length>0&&(s.subtasks=this.sortTodosForArchive(s.subtasks))}),o}highlightSearchTerm(e){if(!this.searchTerm)return e;const o=new RegExp(`(${this.searchTerm})`,"gi");return e.replace(o,"<mark>$1</mark>")}filterTodosRecursive(e,o){const s=[],t=o.toLowerCase();return e.forEach(i=>{const r=i.text.toLowerCase().includes(t),n=i.subtasks&&this.hasMatchingSubtasks(i.subtasks,t);if(r||n){const a={...i};i.subtasks&&(a.subtasks=this.filterTodosRecursive(i.subtasks,o)),s.push(a)}}),s}hasMatchingSubtasks(e,o){return e.some(s=>{const t=s.text.toLowerCase().includes(o),i=s.subtasks&&this.hasMatchingSubtasks(s.subtasks,o);return t||i})}renderTodoHierarchy(e,o,s=0){if(s===0){const t=e.filter(n=>!n.completed),i=e.filter(n=>n.completed);let r="";return r+=t.map(n=>this.renderSingleTodo(n,o,s)).join(""),i.length>0&&(r+=`
                    <div class="completed-section">
                        <div class="completed-header" onclick="app.toggleCompletedSection()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="completed-toggle-icon">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                            <span>Erledigt (${i.length})</span>
                        </div>
                        <div class="completed-todos" id="completed-todos-${o}">
                `,r+=i.map(n=>this.renderSingleTodo(n,o,s)).join(""),r+=`
                        </div>
                    </div>
                `),r}else return e.map(t=>this.renderSingleTodo(t,o,s)).join("")}renderSingleTodo(e,o,s){const t=e.subtasks&&e.subtasks.length>0,i=e.collapsed||!1,r=s*20;let n=`
            <div class="todo-item ${e.completed?"completed":""} priority-${e.priority} ${this.isOverdue(e.dueDate)&&!e.completed?"overdue":""} ${t&&!i?"has-visible-subtasks":""}" 
                 data-todo-id="${e.id}" data-project-id="${o}" 
                 style="padding-left: ${r+12}px">
                <div class="todo-main-content">
                    <div class="drag-handle" 
                         draggable="true" 
                         onmousedown="app.handleDragStart(event)" 
                         ondragstart="app.handleDragStart(event)" 
                         ondragend="app.handleDragEnd(event)" 
                         title="Zum Verschieben ziehen">
                        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="3" cy="3" r="1" fill="currentColor"/>
                            <circle cx="9" cy="3" r="1" fill="currentColor"/>
                            <circle cx="3" cy="8" r="1" fill="currentColor"/>
                            <circle cx="9" cy="8" r="1" fill="currentColor"/>
                            <circle cx="3" cy="13" r="1" fill="currentColor"/>
                            <circle cx="9" cy="13" r="1" fill="currentColor"/>
                        </svg>
                    </div>
                    ${t?`
                        <button class="subtask-toggle" onclick="app.toggleSubtaskCollapse('${o}', '${e.id}')" title="${i?"Aufklappen":"Zuklappen"}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${i?0:90}deg); transition: transform 0.3s ease;">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    `:'<div class="subtask-spacer"></div>'}
                    
                    <input type="checkbox" class="todo-checkbox priority-${e.priority}" 
                           ${e.completed?"checked":""} 
                           onchange="app.toggleTodo('${o}', '${e.id}')">
                    <div class="todo-content">
                        <span class="todo-text ${e.completed?"completed":""}">${this.highlightSearchTerm(e.text)}</span>
                        ${e.dueDate?`<span class="todo-due-date ${this.isOverdue(e.dueDate)&&!e.completed?"overdue":""}">📅 ${this.formatDueDate(e.dueDate)}</span>`:""}
                    </div>
                    <div class="todo-actions">
                        ${s<3?`
                            <button class="btn-small btn-add-subtask" onclick="app.showAddSubtaskForm('${o}', '${e.id}')" title="Unter-Aufgabe hinzufügen">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8 6h13"></path>
                                    <path d="M8 12h13"></path>
                                    <path d="M8 18h13"></path>
                                    <path d="M3 6h.01"></path>
                                    <path d="M3 12h.01"></path>
                                    <path d="M3 18h.01"></path>
                                </svg>
                            </button>
                        `:""}
                        <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${o}', '${e.id}')" title="Bearbeiten">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-small btn-delete" onclick="app.deleteTodo('${o}', '${e.id}')" title="Löschen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;return t&&!i&&(n+=this.renderTodoHierarchy(e.subtasks,o,s+1)),n}search(e){this.searchTerm=e,this.render();const o=document.getElementById("clear-search");e?o.style.display="block":o.style.display="none"}clearSearch(){document.getElementById("search-input").value="",this.search("")}parsePriorityFromText(e){const o=/\b(p[123])\b/i,s=e.match(o);if(s){const t=s[1].toLowerCase(),i=e.replace(o,"").trim();let r;switch(t){case"p1":r="high";break;case"p2":r="medium";break;case"p3":r="low";break;default:r="medium"}return{text:i,priority:r}}return{text:e,priority:null}}submitTodo(e){const o=document.getElementById(`todo-text-${e}`),s=document.getElementById(`todo-date-${e}`),t=o.value.trim(),i=s.value?new Date(s.value):null;if(t){const{text:r,priority:n}=this.parsePriorityFromText(t),a=n||"medium";this.addTodo(e,r,a,i),setTimeout(()=>{const d=document.getElementById(`todo-text-${e}`),c=document.getElementById(`todo-date-${e}`);d&&(d.value="",d.focus()),c&&(c.value="")},0)}}showEditTodoForm(e,o){const s=this.projects.find(a=>a.id===e),t=this.findTodoById(s,o);if(!t){console.error("Todo nicht gefunden:",o);return}const i=document.querySelector(`[data-todo-id="${o}"]`);if(!i){this.render();return}const r=t.dueDate?t.dueDate instanceof Date?t.dueDate.toISOString().split("T")[0]:new Date(t.dueDate).toISOString().split("T")[0]:"",n=i.querySelector(".todo-main-content");if(n){n.innerHTML=`
                <div class="edit-todo-form">
                    <input type="text" id="edit-text-${o}" value="${t.text.replace(/"/g,"&quot;")}" class="edit-input" placeholder="Text bearbeiten... (p1=hoch, p2=mittel, p3=niedrig)" autocomplete="off" autocorrect="off" spellcheck="false">
                    <input type="date" id="edit-date-${o}" value="${r}" class="edit-date-input" title="Fälligkeitsdatum" autocomplete="off">
                    <button onclick="app.saveEditTodo('${e}', '${o}')" class="btn-small" title="Speichern">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"></polyline><path d="m21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path></svg>
                    </button>
                    <button onclick="app.cancelEditTodo('${e}', '${o}')" class="btn-small" title="Abbrechen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;const a=document.getElementById(`edit-text-${o}`);a.focus(),a.setSelectionRange(a.value.length,a.value.length)}}saveEditTodo(e,o){const s=document.getElementById(`edit-text-${o}`).value.trim(),t=document.getElementById(`edit-date-${o}`).value,i=t?new Date(t):null;if(s){const{text:r,priority:n}=this.parsePriorityFromText(s),a=this.projects.find(l=>l.id===e),d=this.findTodoById(a,o),c=n||d.priority;this.editTodo(e,o,r,c,i)}}cancelEditTodo(e,o){this.render()}showAddSubtaskForm(e,o){const s=document.querySelector(`[data-todo-id="${o}"]`);if(!s||s.querySelector(".add-subtask-form"))return;const t=`
            <div class="add-subtask-form" style="margin-left: 40px; margin-top: 8px;">
                <div class="subtask-input-row">
                    <input type="text" id="subtask-text-${o}" placeholder="Unter-Aufgabe hinzufügen... (p1=hoch, p2=mittel, p3=niedrig)" class="subtask-input" autocomplete="off" autocorrect="off" spellcheck="false">
                    <button onclick="app.submitSubtask('${e}', '${o}')" class="btn-small btn-confirm" title="Hinzufügen">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"></polyline><path d="m21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path></svg>
                    </button>
                    <button onclick="app.cancelAddSubtask('${o}')" class="btn-small btn-cancel" title="Abbrechen">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
        `;s.insertAdjacentHTML("afterend",t),document.getElementById(`subtask-text-${o}`).focus()}submitSubtask(e,o){const t=document.getElementById(`subtask-text-${o}`).value.trim();if(t){const{text:i,priority:r}=this.parsePriorityFromText(t),n=r||"medium";this.addSubtask(e,o,i,n),this.cancelAddSubtask(o)}}cancelAddSubtask(e){const o=document.querySelector(".add-subtask-form");o&&o.remove()}showAddProjectForm(){document.getElementById("add-project-form").style.display="flex",document.getElementById("project-name-input").focus()}hideAddProjectForm(){document.getElementById("add-project-form").style.display="none",document.getElementById("project-name-input").value=""}submitProject(){const o=document.getElementById("project-name-input").value.trim();o&&(this.addProject(o),this.hideAddProjectForm())}deleteProject(e){if(e==="default"||e==="archive")return;const o=this.projects.find(s=>s.id===e);o&&confirm(`Projekt "${o.name}" wirklich löschen? Alle Todos gehen verloren.`)&&(this.projects=this.projects.filter(s=>s.id!==e),this.currentProjectId===e&&(this.currentProjectId=this.projects[0].id),this.saveToStorage(),this.renderSidebar(),this.render())}showEditProjectForm(e){if(e==="archive")return;const o=this.projects.find(t=>t.id===e);if(!o)return;const s=prompt("Neuer Projektname:",o.name);s&&s.trim()!==o.name&&(o.name=s.trim(),this.saveToStorage(),this.renderSidebar(),this.updatePageTitle())}bindProjectEvents(){document.getElementById("add-project-btn").addEventListener("click",()=>{this.showAddProjectForm()}),document.getElementById("project-name-input").addEventListener("keydown",e=>{e.key==="Enter"&&this.submitProject()}),document.addEventListener("keydown",e=>{if(e.target.classList.contains("todo-input")&&e.key==="Enter"){const o=e.target.id.replace("todo-text-","");this.submitTodo(o)}if(e.target.classList.contains("subtask-input")&&e.key==="Enter"){const o=e.target.id.replace("subtask-text-",""),s=this.currentProjectId;this.submitSubtask(s,o)}if(e.target.classList.contains("edit-input")&&e.key==="Enter"){const o=e.target.id.replace("edit-text-",""),s=this.currentProjectId;this.saveEditTodo(s,o)}if(e.key==="Escape"&&e.target.classList.contains("subtask-input")){const o=e.target.id.replace("subtask-text-","");this.cancelAddSubtask(o)}if(e.key==="Escape"&&e.target.classList.contains("edit-input")){const o=e.target.id.replace("edit-text-",""),s=this.currentProjectId;this.cancelEditTodo(s,o)}}),document.getElementById("search-input").addEventListener("input",e=>{this.search(e.target.value)}),document.getElementById("clear-search").addEventListener("click",()=>{this.clearSearch()}),document.getElementById("theme-toggle").addEventListener("click",()=>{this.toggleTheme()}),document.getElementById("sidebar-toggle").addEventListener("click",()=>{this.toggleSidebar()}),document.getElementById("menu-toggle").addEventListener("click",e=>{e.stopPropagation(),this.toggleDropdownMenu()}),document.addEventListener("click",e=>{const o=document.getElementById("dropdown-content");!document.getElementById("menu-toggle").contains(e.target)&&!o.contains(e.target)&&this.closeDropdownMenu()}),document.getElementById("archive-btn").addEventListener("click",()=>{this.closeDropdownMenu(),this.showArchiveModal()}),document.getElementById("floating-archive-btn").addEventListener("click",()=>{this.showArchiveModal()}),document.getElementById("export-btn").addEventListener("click",()=>{this.closeDropdownMenu(),this.showExportModal()}),document.getElementById("import-btn").addEventListener("click",()=>{this.closeDropdownMenu(),this.showImportModal()}),document.querySelectorAll(".modal-close").forEach(e=>{e.addEventListener("click",o=>{this.hideAllModals()})}),document.getElementById("export-modal").addEventListener("click",e=>{e.target.id==="export-modal"&&this.hideExportModal()}),document.getElementById("import-modal").addEventListener("click",e=>{e.target.id==="import-modal"&&this.hideImportModal()}),document.getElementById("archive-modal").addEventListener("click",e=>{e.target.id==="archive-modal"&&this.hideArchiveModal()}),document.getElementById("clear-archive-modal").addEventListener("click",e=>{e.target.id==="clear-archive-modal"&&this.hideClearArchiveModal()}),document.getElementById("export-json").addEventListener("click",()=>{this.exportData("json")}),document.getElementById("export-csv").addEventListener("click",()=>{this.exportData("csv")}),document.querySelector(".file-select-btn").addEventListener("click",()=>{document.getElementById("file-input").click()}),document.getElementById("file-input").addEventListener("change",e=>{this.handleFileSelect(e.target.files[0])}),document.getElementById("file-drop-zone").addEventListener("dragover",e=>{e.preventDefault(),e.currentTarget.classList.add("drag-over")}),document.getElementById("file-drop-zone").addEventListener("dragleave",e=>{e.currentTarget.classList.remove("drag-over")}),document.getElementById("file-drop-zone").addEventListener("drop",e=>{e.preventDefault(),e.currentTarget.classList.remove("drag-over"),this.handleFileSelect(e.dataTransfer.files[0])}),document.getElementById("import-cancel").addEventListener("click",()=>{this.hideImportModal()}),document.getElementById("import-confirm").addEventListener("click",()=>{this.confirmImport()}),document.getElementById("archive-cancel").addEventListener("click",()=>{this.hideArchiveModal()}),document.getElementById("archive-confirm").addEventListener("click",()=>{this.confirmArchive()}),document.getElementById("clear-archive-cancel").addEventListener("click",()=>{this.hideClearArchiveModal()}),document.getElementById("clear-archive-confirm").addEventListener("click",()=>{this.confirmClearArchive()})}toggleTheme(){this.isDarkTheme=!this.isDarkTheme,localStorage.setItem("darkTheme",this.isDarkTheme),this.applyTheme()}toggleSidebar(){this.isSidebarCollapsed=!this.isSidebarCollapsed,localStorage.setItem("sidebarCollapsed",this.isSidebarCollapsed),this.applySidebarState()}applySidebarState(){const e=document.querySelector(".sidebar");e&&(this.isSidebarCollapsed?e.classList.add("collapsed"):e.classList.remove("collapsed"))}toggleDropdownMenu(){document.getElementById("dropdown-content").classList.toggle("show")}closeDropdownMenu(){document.getElementById("dropdown-content").classList.remove("show")}showToast(e,o="success"){const s=document.getElementById("toast-notification"),t=s.querySelector(".toast-message");s.classList.remove("toast-success","toast-error","toast-info"),s.classList.add(`toast-${o}`),t.textContent=e,s.classList.add("show"),setTimeout(()=>{s.classList.remove("show")},4e3)}applyTheme(){const e=document.body,o=document.getElementById("theme-toggle");this.isDarkTheme?(e.classList.add("dark-theme"),o&&(o.textContent="☀️")):(e.classList.remove("dark-theme"),o&&(o.textContent="🌙"))}bindEvents(){document.addEventListener("keydown",e=>{e.key==="Escape"&&(this.hideAddProjectForm(),this.hideAllModals(),this.closeDropdownMenu())})}showExportModal(){document.getElementById("export-modal").style.display="flex"}hideExportModal(){document.getElementById("export-modal").style.display="none"}showImportModal(){document.getElementById("import-modal").style.display="flex",this.resetImportModal()}hideImportModal(){document.getElementById("import-modal").style.display="none",this.resetImportModal()}hideAllModals(){this.hideExportModal(),this.hideImportModal(),this.hideArchiveModal(),this.hideClearArchiveModal()}showArchiveModal(){const e=this.countCompletedMainTodos();if(e===0){this.showToast("Keine erledigten Main-Todos zum Archivieren gefunden.","info");return}document.getElementById("archive-count-text").textContent=`${e} erledigte Todo${e===1?"":"s"} werden in das Projekt "Archiv" verschoben.`,document.getElementById("archive-modal").style.display="flex"}hideArchiveModal(){document.getElementById("archive-modal").style.display="none"}resetImportModal(){document.getElementById("file-input").value="",document.getElementById("import-options").style.display="none",document.querySelector('input[name="import-mode"][value="merge"]').checked=!0,this.selectedFile=null}exportData(e){const o=new Date().toISOString().split("T")[0];let s,t,i;e==="json"?(s=`todos-export-${o}.json`,t=JSON.stringify(this.projects,null,2),i="application/json"):e==="csv"&&(s=`todos-export-${o}.csv`,t=this.generateCSV(),i="text/csv");const r=new Blob([t],{type:i}),n=URL.createObjectURL(r),a=document.createElement("a");a.href=n,a.download=s,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(n),this.hideExportModal()}generateCSV(){const o=[["Projekt","Todo","Priorität","Status","Fälligkeitsdatum","Erstellt am"]];return this.projects.forEach(s=>{s.todos.forEach(t=>{const i=t.dueDate?(t.dueDate instanceof Date?t.dueDate:new Date(t.dueDate)).toLocaleDateString("de-DE"):"";o.push([`"${s.name}"`,`"${t.text}"`,`"${this.getPriorityText(t.priority)}"`,`"${t.completed?"Erledigt":"Offen"}"`,`"${i}"`,`"${new Date(t.createdAt).toLocaleString("de-DE")}"`])})}),o.map(s=>s.join(",")).join(`
`)}handleFileSelect(e){if(!e)return;const o=["application/json","text/csv","text/plain"],s=e.name.split(".").pop().toLowerCase();if(!o.includes(e.type)&&!["json","csv"].includes(s)){this.showToast("Bitte wählen Sie eine JSON oder CSV Datei aus.","error");return}this.selectedFile=e,document.getElementById("import-options").style.display="block";const t=document.getElementById("file-drop-zone");t.innerHTML=`
            <div class="upload-icon">✅</div>
            <div class="upload-text">
                <strong>${e.name}</strong><br>
                <span class="file-size">${this.formatFileSize(e.size)}</span>
            </div>
            <div class="upload-hint">Datei ausgewählt</div>
        `}formatFileSize(e){if(e===0)return"0 Bytes";const o=1024,s=["Bytes","KB","MB"],t=Math.floor(Math.log(e)/Math.log(o));return parseFloat((e/Math.pow(o,t)).toFixed(2))+" "+s[t]}async confirmImport(){var o;if(!this.selectedFile)return;const e=document.querySelector('input[name="import-mode"]:checked').value;try{const s=await this.readFile(this.selectedFile),t=this.selectedFile.name.split(".").pop().toLowerCase();let i;t==="json"?i=this.parseJSON(s):t==="csv"&&(i=this.parseCSV(s)),e==="replace"?this.projects=i:this.mergeData(i),this.saveToStorage(),this.currentProjectId=((o=this.projects[0])==null?void 0:o.id)||"default",this.renderSidebar(),this.render(),this.hideImportModal(),this.showToast(`Daten erfolgreich importiert! ${e==="replace"?"Ersetzt":"Zusammengeführt"}`)}catch(s){this.showToast(`Fehler beim Importieren: ${s.message}`,"error")}}readFile(e){return new Promise((o,s)=>{const t=new FileReader;t.onload=i=>o(i.target.result),t.onerror=()=>s(new Error("Fehler beim Lesen der Datei")),t.readAsText(e)})}parseJSON(e){try{const o=JSON.parse(e);if(!Array.isArray(o))throw new Error("JSON muss ein Array von Projekten sein");return o.forEach(s=>{if(!s.id||!s.name||!Array.isArray(s.todos))throw new Error("Ungültige Projektstruktur in JSON");s.todos.forEach(t=>{if(!t.id||!t.text||typeof t.completed!="boolean")throw new Error("Ungültige Todo-Struktur in JSON");t.createdAt?typeof t.createdAt=="string"&&(t.createdAt=new Date(t.createdAt)):t.createdAt=new Date,t.priority||(t.priority="medium")})}),o}catch(o){throw new Error(`JSON Parse Error: ${o.message}`)}}parseCSV(e){try{const o=e.split(`
`).filter(r=>r.trim()),s=o[0].split(",").map(r=>r.replace(/"/g,"").trim());if(!["Projekt","Todo"].every(r=>s.includes(r)))throw new Error('CSV muss mindestens "Projekt" und "Todo" Spalten enthalten');const i={};for(let r=1;r<o.length;r++){const n=o[r].split(",").map(u=>u.replace(/"/g,"").trim()),a={};s.forEach((u,f)=>{a[u]=n[f]||""});const d=a.Projekt,c=a.Todo;if(!d||!c)continue;i[d]||(i[d]={id:Date.now().toString()+Math.random().toString(36).substr(2,9),name:d,todos:[]});const l=this.mapPriorityFromText(a.Priorität)||"medium",h=a.Status==="Erledigt",p=a.Fälligkeitsdatum||"",g=p?this.parseDueDateFromCSV(p):null;i[d].todos.push({id:Date.now().toString()+Math.random().toString(36).substr(2,9),text:c,completed:h,priority:l,dueDate:g,createdAt:new Date})}return Object.values(i)}catch(o){throw new Error(`CSV Parse Error: ${o.message}`)}}mapPriorityFromText(e){if(!e)return"medium";const o=e.toLowerCase();return o.includes("hoch")||o.includes("high")?"high":o.includes("niedrig")||o.includes("low")?"low":"medium"}parseDueDateFromCSV(e){if(!e||e.trim()==="")return null;try{const o=/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,s=e.match(o);if(s){const[,i,r,n]=s;return new Date(parseInt(n),parseInt(r)-1,parseInt(i))}const t=new Date(e);return isNaN(t.getTime())?null:t}catch{return null}}mergeData(e){e.forEach(o=>{const s=this.projects.find(t=>t.name===o.name);s?o.todos.forEach(t=>{t.id=Date.now().toString()+Math.random().toString(36).substr(2,9),s.todos.push(t)}):(o.id=Date.now().toString()+Math.random().toString(36).substr(2,9),o.todos.forEach(t=>{t.id=Date.now().toString()+Math.random().toString(36).substr(2,9)}),this.projects.push(o))})}countCompletedTodos(){let e=0;return this.projects.forEach(o=>{o.id!=="archive"&&(e+=this.countCompletedTodosInList(o.todos))}),e}countCompletedMainTodos(){let e=0;return this.projects.forEach(o=>{o.id!=="archive"&&(e+=o.todos.filter(s=>s.completed).length)}),e}countCompletedTodosInList(e){let o=0;return e.forEach(s=>{s.completed&&o++,s.subtasks&&s.subtasks.length>0&&(o+=this.countCompletedTodosInList(s.subtasks))}),o}confirmArchive(){const e=this.getOrCreateArchiveProject();let o=0;this.projects.forEach(s=>{if(s.id===e.id||s.id==="archive")return;const t=s.todos.filter(r=>r.completed),i=s.todos.filter(r=>!r.completed);t.forEach(r=>{r.originalProject=s.name,r.archivedAt=new Date,e.todos.unshift(r),o++}),s.todos=i}),this.saveToStorage(),this.renderSidebar(),this.render(),this.hideArchiveModal(),this.showToast(`${o} erledigte Todo${o===1?"":"s"} wurden ins Archiv verschoben.`)}getOrCreateArchiveProject(){let e=this.projects.find(o=>o.id==="archive");return e||(e={id:"archive",name:"Archiv",todos:[]},this.projects.push(e)),e}showClearArchiveModal(){const e=this.projects.find(o=>o.id==="archive");if(!e||e.todos.length===0){this.showToast("Das Archiv ist bereits leer.","info");return}document.getElementById("clear-archive-count-text").textContent=`${e.todos.length} Todo${e.todos.length===1?"":"s"} im Archiv ${e.todos.length===1?"wird":"werden"} permanent gelöscht.`,document.getElementById("clear-archive-modal").style.display="flex"}hideClearArchiveModal(){document.getElementById("clear-archive-modal").style.display="none"}confirmClearArchive(){const e=this.projects.find(s=>s.id==="archive");if(!e){this.showToast("Archiv-Projekt nicht gefunden.","error");return}const o=e.todos.length;e.todos=[],this.saveToStorage(),this.renderSidebar(),this.render(),this.hideClearArchiveModal(),this.showToast(`${o} Todo${o===1?"":"s"} aus dem Archiv gelöscht.`)}toggleCompletedSection(){this.isCompletedSectionCollapsed=!this.isCompletedSectionCollapsed,localStorage.setItem("completedSectionCollapsed",this.isCompletedSectionCollapsed),this.updateCompletedSectionVisibility()}updateCompletedSectionVisibility(){const e=document.querySelectorAll(".completed-todos"),o=document.querySelectorAll(".completed-toggle-icon");e.forEach(s=>{this.isCompletedSectionCollapsed?s.style.display="none":s.style.display="block"}),o.forEach(s=>{this.isCompletedSectionCollapsed?s.style.transform="rotate(0deg)":s.style.transform="rotate(90deg)"})}handleDragStart(e){if(!e.target.closest(".drag-handle"))return e.preventDefault(),!1;const s=e.currentTarget.closest(".todo-item");if(!s)return e.preventDefault(),!1;const t=s.dataset.todoId,i=s.dataset.projectId;this.dragData={todoId:t,sourceProjectId:i},s.classList.add("dragging"),e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t);const r=s.cloneNode(!0);r.style.transform="scale(0.8)",r.style.opacity="0.8",document.body.appendChild(r),e.dataTransfer.setDragImage(r,0,0),setTimeout(()=>document.body.removeChild(r),0)}handleDragEnd(e){const s=e.currentTarget.closest(".todo-item");s&&s.classList.remove("dragging"),document.querySelectorAll(".project-item").forEach(t=>{t.classList.remove("drag-over")}),this.dragData=null}handleDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}handleDragEnter(e){e.preventDefault(),this.dragData&&e.currentTarget.classList.add("drag-over")}handleDragLeave(e){const o=e.currentTarget;o.contains(e.relatedTarget)||o.classList.remove("drag-over")}handleDrop(e,o){if(e.preventDefault(),e.currentTarget.classList.remove("drag-over"),!this.dragData||!o)return;const{todoId:t,sourceProjectId:i}=this.dragData;i!==o&&o!=="archive"&&this.moveTodoToProject(t,i,o)}moveTodoToProject(e,o,s){const t=this.projects.find(n=>n.id===o),i=this.projects.find(n=>n.id===s);if(!t||!i){console.error("Source or target project not found");return}const r=this.findAndRemoveTodo(t,e);if(!r){console.error("Todo not found in source project");return}i.todos.push(r),this.saveToStorage(),this.renderSidebar(),this.render(),this.showToast(`Todo zu "${i.name}" verschoben`,"success")}findAndRemoveTodo(e,o){const s=e.todos.findIndex(t=>t.id===o);if(s!==-1)return e.todos.splice(s,1)[0];for(let t of e.todos){const i=this.findAndRemoveFromSubtasks(t,o);if(i)return i}return null}findAndRemoveFromSubtasks(e,o){if(!e.subtasks)return null;const s=e.subtasks.findIndex(t=>t.id===o);if(s!==-1)return e.subtasks.splice(s,1)[0];for(let t of e.subtasks){const i=this.findAndRemoveFromSubtasks(t,o);if(i)return i}return null}}new v;
