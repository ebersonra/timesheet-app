// Sistema de Autenticação
class AuthManager {
    constructor() {
        this.usersKey = 'timesheet_users';
        this.currentUserKey = 'timesheet_current_user';
        this.init();
    }

    // Inicializar sistema de autenticação
    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    // Verificar se usuário está logado
    checkAuthStatus() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // Redirecionar para a aplicação principal
            window.location.href = '/index.html';
        }
    }

    // Vincular eventos
    bindEvents() {
        // Alternar entre login e cadastro
        document.getElementById('showRegister').addEventListener('click', () => {
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', () => {
            this.showLoginForm();
        });

        // Formulários
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('registerFormElement').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });
    }

    // Mostrar formulário de cadastro
    showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    // Mostrar formulário de login
    showLoginForm() {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }

    // Manipular login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.showLoading();

        try {
            const user = await this.loginUser(email, password);
            if (user) {
                this.setCurrentUser(user);
                this.showToast('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1000);
            } else {
                this.showToast('E-mail ou senha incorretos', 'error');
            }
        } catch (error) {
            this.showToast('Erro ao fazer login', 'error');
            console.error('Erro no login:', error);
        } finally {
            this.hideLoading();
        }
    }

    // Manipular cadastro
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const department = document.getElementById('registerDepartment').value;

        // Validações
        if (password !== confirmPassword) {
            this.showToast('Senhas não coincidem', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        this.showLoading();

        try {
            const userExists = this.checkUserExists(email);
            if (userExists) {
                this.showToast('E-mail já cadastrado', 'error');
                return;
            }

            const newUser = await this.registerUser({
                name,
                email,
                password,
                department
            });

            if (newUser) {
                this.setCurrentUser(newUser);
                this.showToast('Cadastro realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1000);
            }
        } catch (error) {
            this.showToast('Erro ao cadastrar usuário', 'error');
            console.error('Erro no cadastro:', error);
        } finally {
            this.hideLoading();
        }
    }

    // Fazer login do usuário
    loginUser(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = this.getUsers();
                const user = users.find(u => 
                    u.email === email && u.password === this.hashPassword(password)
                );
                resolve(user || null);
            }, 500);
        });
    }

    // Registrar novo usuário
    registerUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = this.getUsers();
                const newUser = {
                    id: Utils.generateId(),
                    name: userData.name,
                    email: userData.email,
                    password: this.hashPassword(userData.password),
                    department: userData.department,
                    createdAt: new Date().toISOString(),
                    isActive: true
                };

                users.push(newUser);
                this.saveUsers(users);
                
                // Retornar usuário sem senha
                const { password, ...userWithoutPassword } = newUser;
                resolve(userWithoutPassword);
            }, 500);
        });
    }

    // Verificar se usuário existe
    checkUserExists(email) {
        const users = this.getUsers();
        return users.some(u => u.email === email);
    }

    // Hash simples da senha (em produção usar bcrypt ou similar)
    hashPassword(password) {
        // Implementação simples para demonstração
        // Em produção, usar biblioteca de hash segura
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Obter todos os usuários
    getUsers() {
        try {
            const users = localStorage.getItem(this.usersKey);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    // Salvar usuários
    saveUsers(users) {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            return false;
        }
    }

    // Definir usuário atual
    setCurrentUser(user) {
        try {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        } catch (error) {
            console.error('Erro ao definir usuário atual:', error);
        }
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

    // Fazer logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
        window.location.href = '/login.html';
    }

    // Utilitários de UI
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        // Criar toast temporário se não houver sistema de toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Animação de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Exportar para uso global
window.AuthManager = AuthManager;
