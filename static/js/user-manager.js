// Gerenciador de Usuários para aplicação principal
class UserManager {
    constructor() {
        this.currentUserKey = 'timesheet_current_user';
        this.usersKey = 'timesheet_users';
    }

    // Verificar se usuário está autenticado
    checkAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Obter usuário atual
    getCurrentUser() {
        try {
            const user = localStorage.getItem(this.currentUserKey);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Erro ao obter usuário atual:', error);
            return null;
        }
    }

    // Obter todos os usuários (apenas dados básicos)
    getAllUsers() {
        try {
            const users = localStorage.getItem(this.usersKey);
            if (!users) return [];
            
            const allUsers = JSON.parse(users);
            // Retornar apenas dados seguros (sem senha)
            return allUsers.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                isActive: user.isActive
            }));
        } catch (error) {
            console.error('Erro ao obter usuários:', error);
            return [];
        }
    }

    // Obter usuário por ID
    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(user => user.id === userId) || null;
    }

    // Fazer logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
        window.location.href = '/login.html';
    }

    // Atualizar informações do usuário atual
    updateCurrentUser(userData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        try {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
            
            // Atualizar também na lista de usuários
            const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...userData };
                localStorage.setItem(this.usersKey, JSON.stringify(users));
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return false;
        }
    }

    // Renderizar informações do usuário na UI
    renderUserInfo() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Atualizar header com informações do usuário
        this.updateHeaderUserInfo(user);
    }

    // Atualizar header com informações do usuário
    updateHeaderUserInfo(user) {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Verificar se já existe o elemento de usuário
        let userInfo = document.getElementById('userInfo');
        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.id = 'userInfo';
            userInfo.className = 'user-info';
            
            userInfo.innerHTML = `
                <div class="user-menu">
                    <button class="user-menu-toggle" id="userMenuToggle">
                        <span class="user-avatar">👤</span>
                        <span class="user-name" id="userName">${user.name}</span>
                        <span class="user-arrow">▼</span>
                    </button>
                    <div class="user-dropdown" id="userDropdown" style="display: none;">
                        <div class="user-dropdown-header">
                            <strong>${user.name}</strong>
                            <small>${user.email}</small>
                            <small class="user-department">${user.department}</small>
                        </div>
                        <div class="user-dropdown-actions">
                            <button class="dropdown-item" id="viewProfileBtn">
                                👤 Meu Perfil
                            </button>
                            <button class="dropdown-item" id="userStatsBtn">
                                📊 Minhas Estatísticas
                            </button>
                            <hr class="dropdown-divider">
                            <button class="dropdown-item logout-btn" id="logoutBtn">
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Inserir antes dos botões existentes
            headerActions.insertBefore(userInfo, headerActions.firstChild);
            
            // Adicionar event listeners
            this.bindUserMenuEvents();
        } else {
            // Atualizar informações existentes
            document.getElementById('userName').textContent = user.name;
        }
    }

    // Vincular eventos do menu de usuário
    bindUserMenuEvents() {
        const menuToggle = document.getElementById('userMenuToggle');
        const dropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        // Toggle do menu
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display !== 'none';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        // Prevent close when clicking inside dropdown
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                this.logout();
            }
        });

        // Outros botões do menu
        document.getElementById('viewProfileBtn').addEventListener('click', () => {
            this.showUserProfile();
            dropdown.style.display = 'none';
        });

        document.getElementById('userStatsBtn').addEventListener('click', () => {
            this.showUserStats();
            dropdown.style.display = 'none';
        });
    }

    // Mostrar perfil do usuário
    showUserProfile() {
        const user = this.getCurrentUser();
        alert(`Perfil do Usuário:\nNome: ${user.name}\nE-mail: ${user.email}\nDepartamento: ${user.department}`);
    }

    // Mostrar estatísticas do usuário
    showUserStats() {
        // Implementar modal com estatísticas específicas do usuário
        console.log('Mostrar estatísticas do usuário');
    }

    // Criar filtro de usuários para administradores
    createUserFilter() {
        const users = this.getAllUsers();
        const currentUser = this.getCurrentUser();
        
        if (!users.length) return null;

        const filterHtml = `
            <select id="filterSelectUser" class="filter-select">
                <option value="">Todos os usuários</option>
                <option value="${currentUser.id}" selected>Apenas meus registros</option>
                ${users.map(user => 
                    user.id !== currentUser.id ? 
                    `<option value="${user.id}">${user.name} (${user.department})</option>` 
                    : ''
                ).join('')}
            </select>
        `;

        return filterHtml;
    }

    // Verificar se usuário é administrador (implementação futura)
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
}

// Exportar para uso global
window.UserManager = UserManager;
