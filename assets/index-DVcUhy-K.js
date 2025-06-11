(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class v{constructor(){this.projects=this.loadFromStorage()||[{id:"default",name:"Meine Todos",todos:[]}],this.searchTerm="",this.isDarkTheme=localStorage.getItem("darkTheme")==="true",this.currentProjectId=this.projects[0].id,this.init()}init(){this.applyTheme(),this.renderSidebar(),this.render(),this.bindEvents(),this.bindProjectEvents()}loadFromStorage(){const e=localStorage.getItem("todoApp");return e?JSON.parse(e):null}saveToStorage(){localStorage.setItem("todoApp",JSON.stringify(this.projects))}addProject(e){const t={id:Date.now().toString(),name:e,todos:[]};this.projects.push(t),this.saveToStorage(),this.renderSidebar(),this.switchToProject(t.id)}addTodo(e,t,r="medium"){const i=this.projects.find(o=>o.id===e);if(i){const o={id:Date.now().toString(),text:t,completed:!1,priority:r,createdAt:new Date};return i.todos.push(o),this.saveToStorage(),this.render(),!0}return!1}toggleTodo(e,t){const r=this.projects.find(i=>i.id===e);if(r){const i=r.todos.find(o=>o.id===t);if(i){const o=i.completed;if(i.completed=!i.completed,!o){const s=document.querySelector(`[data-todo-id="${t}"]`);if(s){s.style.transition="all 0.3s ease",s.style.transform="scale(0.98)",s.style.opacity="0.8",setTimeout(()=>{this.saveToStorage(),this.render()},300);return}}this.saveToStorage(),this.render()}}}deleteTodo(e,t){const r=this.projects.find(i=>i.id===e);r&&(r.todos=r.todos.filter(i=>i.id!==t),this.saveToStorage(),this.render())}editTodo(e,t,r,i){const o=this.projects.find(s=>s.id===e);if(o){const s=o.todos.find(d=>d.id===t);s&&(s.text=r,s.priority=i,this.saveToStorage(),this.render())}}renderSidebar(){const e=document.querySelector(".project-list");e.innerHTML="";const t=document.createElement("div");t.className=`project-item special-project ${this.currentProjectId==="all"?"active":""}`,t.onclick=()=>this.switchToProject("all"),t.innerHTML=`
            <span class="project-name">📋 Alle Projekte</span>
        `,e.appendChild(t);const r=this.projects.find(i=>i.id==="archive");if(r&&r.todos.length>0){const i=document.createElement("div");i.className=`project-item special-project ${this.currentProjectId==="archive"?"active":""}`,i.onclick=()=>this.switchToProject("archive"),i.innerHTML=`
                <span class="project-name">📦 Archiv</span>
                <span class="todo-count">${r.todos.length}</span>
            `,e.appendChild(i)}if(this.projects.filter(i=>i.id!=="archive").length>0){const i=document.createElement("div");i.className="project-separator",e.appendChild(i)}this.projects.filter(i=>i.id!=="archive").forEach(i=>{const o=document.createElement("div");o.className=`project-item ${i.id===this.currentProjectId?"active":""}`,o.onclick=()=>this.switchToProject(i.id),o.innerHTML=`
                <span class="project-name">${i.name}</span>
                ${i.id!=="default"?`
                    <div class="project-actions">
                        <button class="btn-small btn-edit" onclick="event.stopPropagation(); app.showEditProjectForm('${i.id}')">✏️</button>
                        <button class="btn-small btn-delete" onclick="event.stopPropagation(); app.deleteProject('${i.id}')">🗑️</button>
                    </div>
                `:""}
            `,e.appendChild(o)})}switchToProject(e){this.currentProjectId=e,this.renderSidebar(),this.render(),this.updatePageTitle()}updatePageTitle(){const e=document.getElementById("current-project-title");if(e)if(this.currentProjectId==="all")e.textContent="Alle Projekte";else if(this.currentProjectId==="archive")e.textContent="Archiv";else{const t=this.projects.find(r=>r.id===this.currentProjectId);t&&(e.textContent=t.name)}}render(){const e=document.getElementById("todo-container");this.currentProjectId==="all"?this.renderAllProjects(e):this.currentProjectId==="archive"?this.renderArchiveProject(e):this.renderSingleProject(e),this.updatePageTitle()}renderSingleProject(e){const t=this.projects.find(o=>o.id===this.currentProjectId);if(!t){e.innerHTML='<div class="no-results">Projekt nicht gefunden</div>';return}const r=this.searchTerm?t.todos.filter(o=>o.text.toLowerCase().includes(this.searchTerm.toLowerCase())):t.todos,i=this.sortTodosByPriority([...r]);e.innerHTML=`
            <div class="project-section">
                <div class="add-todo-form">
                    <div class="input-row">
                        <input type="text" id="todo-text-${t.id}" placeholder="Neues Todo hinzufügen..." class="todo-input">
                        <div class="priority-radio-group">
                            <label class="priority-radio">
                                <input type="radio" name="priority-${t.id}" value="high" class="radio-input">
                                <span class="radio-custom priority-high"></span>
                                <span class="radio-label">Hoch</span>
                            </label>
                            <label class="priority-radio">
                                <input type="radio" name="priority-${t.id}" value="medium" class="radio-input" checked>
                                <span class="radio-custom priority-medium"></span>
                                <span class="radio-label">Mittel</span>
                            </label>
                            <label class="priority-radio">
                                <input type="radio" name="priority-${t.id}" value="low" class="radio-input">
                                <span class="radio-custom priority-low"></span>
                                <span class="radio-label">Niedrig</span>
                            </label>
                        </div>
                        <button onclick="app.submitTodo('${t.id}')" class="add-btn">+</button>
                    </div>
                </div>
                <div class="todos-list">
                    ${i.length>0?i.map(o=>`
                        <div class="todo-item ${o.completed?"completed":""} priority-${o.priority}" data-todo-id="${o.id}">
                            <input type="checkbox" class="todo-checkbox priority-${o.priority}" 
                                   ${o.completed?"checked":""} 
                                   onchange="app.toggleTodo('${t.id}', '${o.id}')">
                            <span class="todo-text ${o.completed?"completed":""}">${this.highlightSearchTerm(o.text)}</span>
                            <div class="todo-actions">
                                <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${t.id}', '${o.id}')">
                                    Bearbeiten
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('${t.id}', '${o.id}')">
                                    Löschen
                                </button>
                            </div>
                        </div>
                    `).join(""):'<div class="no-todos">Noch keine Todos in diesem Projekt</div>'}
                </div>
            </div>
        `,this.searchTerm&&i.length===0&&t.todos.length>0&&(e.querySelector(".todos-list").innerHTML='<div class="no-results">Keine Todos gefunden für "'+this.searchTerm+'"</div>')}renderAllProjects(e){let t=[];this.projects.forEach(s=>{s.todos.forEach(d=>{t.push({...d,projectId:s.id,projectName:s.name})})});const r=this.searchTerm?t.filter(s=>s.text.toLowerCase().includes(this.searchTerm.toLowerCase())):t,i={};r.forEach(s=>{i[s.projectId]||(i[s.projectId]=[]),i[s.projectId].push(s)}),Object.keys(i).forEach(s=>{i[s]=this.sortTodosByPriority(i[s])});let o="";Object.keys(i).length===0?o='<div class="no-todos">Keine Todos gefunden</div>':Object.keys(i).forEach(s=>{const d=i[s],c=d[0].projectName;o+=`
                    <div class="project-section">
                        <div class="project-header">
                            <h3 class="project-title">${c}</h3>
                        </div>
                        <div class="todos-list">
                            ${d.map(n=>`
                                <div class="todo-item ${n.completed?"completed":""} priority-${n.priority}" data-todo-id="${n.id}">
                                    <input type="checkbox" class="todo-checkbox priority-${n.priority}" 
                                           ${n.completed?"checked":""} 
                                           onchange="app.toggleTodo('${n.projectId}', '${n.id}')">
                                    <span class="todo-text ${n.completed?"completed":""}">${this.highlightSearchTerm(n.text)}</span>
                                    <div class="todo-actions">
                                        <button class="btn-small btn-edit" onclick="app.showEditTodoForm('${n.projectId}', '${n.id}')">
                                            Bearbeiten
                                        </button>
                                        <button class="btn-small btn-delete" onclick="app.deleteTodo('${n.projectId}', '${n.id}')">
                                            Löschen
                                        </button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `}),e.innerHTML=o}renderArchiveProject(e){const t=this.projects.find(o=>o.id==="archive");if(!t||t.todos.length===0){e.innerHTML=`
                <div class="project-section">
                    <div class="archive-empty">
                        <div class="archive-empty-icon">📦</div>
                        <h3>Archiv ist leer</h3>
                        <p>Verwenden Sie den "Archivieren" Button, um erledigte Todos hierher zu verschieben.</p>
                    </div>
                </div>
            `;return}const r=this.searchTerm?t.todos.filter(o=>o.text.toLowerCase().includes(this.searchTerm.toLowerCase())||o.originalProject&&o.originalProject.toLowerCase().includes(this.searchTerm.toLowerCase())):t.todos,i=this.sortTodosByPriority([...r]);e.innerHTML=`
            <div class="project-section">
                <div class="archive-info-banner">
                    <div class="archive-banner-icon">📦</div>
                    <div class="archive-banner-text">
                        <h3>Archiv</h3>
                        <p>Alle archivierten Todos • ${t.todos.length} Einträge</p>
                    </div>
                </div>
                <div class="todos-list">
                    ${i.length>0?i.map(o=>`
                        <div class="todo-item ${o.completed?"completed":""} priority-${o.priority}" data-todo-id="${o.id}">
                            <input type="checkbox" class="todo-checkbox priority-${o.priority}" 
                                   ${o.completed?"checked":""} 
                                   onchange="app.toggleTodo('archive', '${o.id}')">
                            <div class="todo-content">
                                <span class="todo-text ${o.completed?"completed":""}">${this.highlightSearchTerm(o.text)}</span>
                                ${o.originalProject?`<span class="original-project">aus: ${o.originalProject}</span>`:""}
                            </div>
                            <div class="todo-actions">
                                <button class="btn-small btn-edit" onclick="app.showEditTodoForm('archive', '${o.id}')">
                                    Bearbeiten
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteTodo('archive', '${o.id}')">
                                    Löschen
                                </button>
                            </div>
                        </div>
                    `).join(""):'<div class="no-todos">Keine Todos im Archiv gefunden</div>'}
                </div>
            </div>
        `,this.searchTerm&&i.length===0&&t.todos.length>0&&(e.querySelector(".todos-list").innerHTML='<div class="no-results">Keine Archiv-Todos gefunden für "'+this.searchTerm+'"</div>')}getPriorityText(e){return{low:"Niedrig",medium:"Mittel",high:"Hoch"}[e]||"Mittel"}sortTodosByPriority(e){const t={high:3,medium:2,low:1};return e.sort((r,i)=>{if(r.completed!==i.completed)return r.completed?1:-1;const o=t[r.priority]||2,s=t[i.priority]||2;return o!==s?s-o:new Date(i.createdAt)-new Date(r.createdAt)})}highlightSearchTerm(e){if(!this.searchTerm)return e;const t=new RegExp(`(${this.searchTerm})`,"gi");return e.replace(t,"<mark>$1</mark>")}search(e){this.searchTerm=e,this.render();const t=document.getElementById("clear-search");e?t.style.display="block":t.style.display="none"}clearSearch(){document.getElementById("search-input").value="",this.search("")}submitTodo(e){const t=document.getElementById(`todo-text-${e}`),r=document.querySelectorAll(`input[name="priority-${e}"]:checked`),i=t.value.trim(),o=r.length>0?r[0].value:"medium";i&&(this.addTodo(e,i,o),setTimeout(()=>{const s=document.getElementById(`todo-text-${e}`),d=document.querySelector(`input[name="priority-${e}"][value="medium"]`);s&&(s.value="",s.focus()),d&&(d.checked=!0)},0))}showEditTodoForm(e,t){const i=this.projects.find(s=>s.id===e).todos.find(s=>s.id===t),o=document.querySelector(`[data-todo-id="${t}"]`);if(!o){this.render();return}o.innerHTML=`
            <div class="edit-todo-form">
                <input type="text" id="edit-text-${t}" value="${i.text}" class="edit-input">
                <select id="edit-priority-${t}" class="edit-select">
                    <option value="low" ${i.priority==="low"?"selected":""}>Niedrig</option>
                    <option value="medium" ${i.priority==="medium"?"selected":""}>Mittel</option>
                    <option value="high" ${i.priority==="high"?"selected":""}>Hoch</option>
                </select>
                <button onclick="app.saveEditTodo('${e}', '${t}')" class="btn-small">Speichern</button>
                <button onclick="app.cancelEditTodo('${e}', '${t}')" class="btn-small">Abbrechen</button>
            </div>
        `}saveEditTodo(e,t){const r=document.getElementById(`edit-text-${t}`).value.trim(),i=document.getElementById(`edit-priority-${t}`).value;r&&this.editTodo(e,t,r,i)}cancelEditTodo(e,t){this.render()}showAddProjectForm(){document.getElementById("add-project-form").style.display="flex",document.getElementById("project-name-input").focus()}hideAddProjectForm(){document.getElementById("add-project-form").style.display="none",document.getElementById("project-name-input").value=""}submitProject(){const t=document.getElementById("project-name-input").value.trim();t&&(this.addProject(t),this.hideAddProjectForm())}deleteProject(e){if(e==="default"||e==="archive")return;const t=this.projects.find(r=>r.id===e);t&&confirm(`Projekt "${t.name}" wirklich löschen? Alle Todos gehen verloren.`)&&(this.projects=this.projects.filter(r=>r.id!==e),this.currentProjectId===e&&(this.currentProjectId=this.projects[0].id),this.saveToStorage(),this.renderSidebar(),this.render())}showEditProjectForm(e){if(e==="archive")return;const t=this.projects.find(i=>i.id===e);if(!t)return;const r=prompt("Neuer Projektname:",t.name);r&&r.trim()!==t.name&&(t.name=r.trim(),this.saveToStorage(),this.renderSidebar(),this.updatePageTitle())}bindProjectEvents(){document.getElementById("add-project-btn").addEventListener("click",()=>{this.showAddProjectForm()}),document.getElementById("project-name-input").addEventListener("keydown",e=>{e.key==="Enter"&&this.submitProject()}),document.addEventListener("keydown",e=>{if(e.target.classList.contains("todo-input")&&e.key==="Enter"){const t=e.target.id.replace("todo-text-","");this.submitTodo(t)}}),document.getElementById("search-input").addEventListener("input",e=>{this.search(e.target.value)}),document.getElementById("clear-search").addEventListener("click",()=>{this.clearSearch()}),document.getElementById("theme-toggle").addEventListener("click",()=>{this.toggleTheme()}),document.getElementById("archive-btn").addEventListener("click",()=>{this.showArchiveModal()}),document.getElementById("export-btn").addEventListener("click",()=>{this.showExportModal()}),document.getElementById("import-btn").addEventListener("click",()=>{this.showImportModal()}),document.querySelectorAll(".modal-close").forEach(e=>{e.addEventListener("click",t=>{this.hideAllModals()})}),document.getElementById("export-modal").addEventListener("click",e=>{e.target.id==="export-modal"&&this.hideExportModal()}),document.getElementById("import-modal").addEventListener("click",e=>{e.target.id==="import-modal"&&this.hideImportModal()}),document.getElementById("archive-modal").addEventListener("click",e=>{e.target.id==="archive-modal"&&this.hideArchiveModal()}),document.getElementById("export-json").addEventListener("click",()=>{this.exportData("json")}),document.getElementById("export-csv").addEventListener("click",()=>{this.exportData("csv")}),document.querySelector(".file-select-btn").addEventListener("click",()=>{document.getElementById("file-input").click()}),document.getElementById("file-input").addEventListener("change",e=>{this.handleFileSelect(e.target.files[0])}),document.getElementById("file-drop-zone").addEventListener("dragover",e=>{e.preventDefault(),e.currentTarget.classList.add("drag-over")}),document.getElementById("file-drop-zone").addEventListener("dragleave",e=>{e.currentTarget.classList.remove("drag-over")}),document.getElementById("file-drop-zone").addEventListener("drop",e=>{e.preventDefault(),e.currentTarget.classList.remove("drag-over"),this.handleFileSelect(e.dataTransfer.files[0])}),document.getElementById("import-cancel").addEventListener("click",()=>{this.hideImportModal()}),document.getElementById("import-confirm").addEventListener("click",()=>{this.confirmImport()}),document.getElementById("archive-cancel").addEventListener("click",()=>{this.hideArchiveModal()}),document.getElementById("archive-confirm").addEventListener("click",()=>{this.confirmArchive()})}toggleTheme(){this.isDarkTheme=!this.isDarkTheme,localStorage.setItem("darkTheme",this.isDarkTheme),this.applyTheme()}applyTheme(){const e=document.body,t=document.getElementById("theme-toggle");this.isDarkTheme?(e.classList.add("dark-theme"),t&&(t.textContent="☀️")):(e.classList.remove("dark-theme"),t&&(t.textContent="🌙"))}bindEvents(){document.addEventListener("keydown",e=>{e.key==="Escape"&&(this.hideAddProjectForm(),this.hideAllModals())})}showExportModal(){document.getElementById("export-modal").style.display="flex"}hideExportModal(){document.getElementById("export-modal").style.display="none"}showImportModal(){document.getElementById("import-modal").style.display="flex",this.resetImportModal()}hideImportModal(){document.getElementById("import-modal").style.display="none",this.resetImportModal()}hideAllModals(){this.hideExportModal(),this.hideImportModal(),this.hideArchiveModal()}showArchiveModal(){const e=this.countCompletedTodos();if(e===0){alert("Keine erledigten Todos zum Archivieren gefunden.");return}document.getElementById("archive-count-text").textContent=`${e} erledigte Todo${e===1?"":"s"} werden in das Projekt "Archiv" verschoben.`,document.getElementById("archive-modal").style.display="flex"}hideArchiveModal(){document.getElementById("archive-modal").style.display="none"}resetImportModal(){document.getElementById("file-input").value="",document.getElementById("import-options").style.display="none",document.querySelector('input[name="import-mode"][value="merge"]').checked=!0,this.selectedFile=null}exportData(e){const t=new Date().toISOString().split("T")[0];let r,i,o;e==="json"?(r=`todos-export-${t}.json`,i=JSON.stringify(this.projects,null,2),o="application/json"):e==="csv"&&(r=`todos-export-${t}.csv`,i=this.generateCSV(),o="text/csv");const s=new Blob([i],{type:o}),d=URL.createObjectURL(s),c=document.createElement("a");c.href=d,c.download=r,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(d),this.hideExportModal()}generateCSV(){const t=[["Projekt","Todo","Priorität","Status","Erstellt am"]];return this.projects.forEach(r=>{r.todos.forEach(i=>{t.push([`"${r.name}"`,`"${i.text}"`,`"${this.getPriorityText(i.priority)}"`,`"${i.completed?"Erledigt":"Offen"}"`,`"${new Date(i.createdAt).toLocaleString("de-DE")}"`])})}),t.map(r=>r.join(",")).join(`
`)}handleFileSelect(e){if(!e)return;const t=["application/json","text/csv","text/plain"],r=e.name.split(".").pop().toLowerCase();if(!t.includes(e.type)&&!["json","csv"].includes(r)){alert("Bitte wählen Sie eine JSON oder CSV Datei aus.");return}this.selectedFile=e,document.getElementById("import-options").style.display="block";const i=document.getElementById("file-drop-zone");i.innerHTML=`
            <div class="upload-icon">✅</div>
            <div class="upload-text">
                <strong>${e.name}</strong><br>
                <span class="file-size">${this.formatFileSize(e.size)}</span>
            </div>
            <div class="upload-hint">Datei ausgewählt</div>
        `}formatFileSize(e){if(e===0)return"0 Bytes";const t=1024,r=["Bytes","KB","MB"],i=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,i)).toFixed(2))+" "+r[i]}async confirmImport(){var t;if(!this.selectedFile)return;const e=document.querySelector('input[name="import-mode"]:checked').value;try{const r=await this.readFile(this.selectedFile),i=this.selectedFile.name.split(".").pop().toLowerCase();let o;i==="json"?o=this.parseJSON(r):i==="csv"&&(o=this.parseCSV(r)),e==="replace"?this.projects=o:this.mergeData(o),this.saveToStorage(),this.currentProjectId=((t=this.projects[0])==null?void 0:t.id)||"default",this.renderSidebar(),this.render(),this.hideImportModal(),alert(`Daten erfolgreich importiert! ${e==="replace"?"Ersetzt":"Zusammengeführt"}`)}catch(r){alert(`Fehler beim Importieren: ${r.message}`)}}readFile(e){return new Promise((t,r)=>{const i=new FileReader;i.onload=o=>t(o.target.result),i.onerror=()=>r(new Error("Fehler beim Lesen der Datei")),i.readAsText(e)})}parseJSON(e){try{const t=JSON.parse(e);if(!Array.isArray(t))throw new Error("JSON muss ein Array von Projekten sein");return t.forEach(r=>{if(!r.id||!r.name||!Array.isArray(r.todos))throw new Error("Ungültige Projektstruktur in JSON");r.todos.forEach(i=>{if(!i.id||!i.text||typeof i.completed!="boolean")throw new Error("Ungültige Todo-Struktur in JSON");i.createdAt?typeof i.createdAt=="string"&&(i.createdAt=new Date(i.createdAt)):i.createdAt=new Date,i.priority||(i.priority="medium")})}),t}catch(t){throw new Error(`JSON Parse Error: ${t.message}`)}}parseCSV(e){try{const t=e.split(`
`).filter(s=>s.trim()),r=t[0].split(",").map(s=>s.replace(/"/g,"").trim());if(!["Projekt","Todo"].every(s=>r.includes(s)))throw new Error('CSV muss mindestens "Projekt" und "Todo" Spalten enthalten');const o={};for(let s=1;s<t.length;s++){const d=t[s].split(",").map(a=>a.replace(/"/g,"").trim()),c={};r.forEach((a,u)=>{c[a]=d[u]||""});const n=c.Projekt,l=c.Todo;if(!n||!l)continue;o[n]||(o[n]={id:Date.now().toString()+Math.random().toString(36).substr(2,9),name:n,todos:[]});const m=this.mapPriorityFromText(c.Priorität)||"medium",p=c.Status==="Erledigt";o[n].todos.push({id:Date.now().toString()+Math.random().toString(36).substr(2,9),text:l,completed:p,priority:m,createdAt:new Date})}return Object.values(o)}catch(t){throw new Error(`CSV Parse Error: ${t.message}`)}}mapPriorityFromText(e){if(!e)return"medium";const t=e.toLowerCase();return t.includes("hoch")||t.includes("high")?"high":t.includes("niedrig")||t.includes("low")?"low":"medium"}mergeData(e){e.forEach(t=>{const r=this.projects.find(i=>i.name===t.name);r?t.todos.forEach(i=>{i.id=Date.now().toString()+Math.random().toString(36).substr(2,9),r.todos.push(i)}):(t.id=Date.now().toString()+Math.random().toString(36).substr(2,9),t.todos.forEach(i=>{i.id=Date.now().toString()+Math.random().toString(36).substr(2,9)}),this.projects.push(t))})}countCompletedTodos(){let e=0;return this.projects.forEach(t=>{e+=t.todos.filter(r=>r.completed).length}),e}confirmArchive(){const e=this.getOrCreateArchiveProject();let t=0;this.projects.forEach(r=>{if(r.id===e.id)return;const i=r.todos.filter(s=>s.completed),o=r.todos.filter(s=>!s.completed);i.forEach(s=>{s.originalProject=r.name,s.archivedAt=new Date,e.todos.push(s),t++}),r.todos=o}),this.saveToStorage(),this.renderSidebar(),this.render(),this.hideArchiveModal(),alert(`${t} erledigte Todo${t===1?"":"s"} wurden ins Archiv verschoben.`)}getOrCreateArchiveProject(){let e=this.projects.find(t=>t.id==="archive");return e||(e={id:"archive",name:"Archiv",todos:[]},this.projects.push(e)),e}}new v;
