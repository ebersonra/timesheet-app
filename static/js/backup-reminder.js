// Sistema de lembrete de backup
class BackupReminder {
    constructor() {
        this.lastBackupKey = 'timesheet_last_backup_reminder';
        this.checkInterval = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
    }

    // Verificar se deve mostrar lembrete
    shouldShowReminder() {
        const lastReminder = localStorage.getItem(this.lastBackupKey);
        if (!lastReminder) return true;
        
        const lastDate = new Date(lastReminder);
        const now = new Date();
        
        return (now - lastDate) > this.checkInterval;
    }

    // Mostrar lembrete de backup
    showBackupReminder() {
        if (!this.shouldShowReminder()) return;

        const message = `
            🔔 Lembrete de Backup!
            
            Recomendamos fazer backup dos seus dados regularmente.
            Deseja exportar seus registros agora?
        `;

        if (confirm(message)) {
            // Trigger export
            document.getElementById('exportBtn')?.click();
        }

        // Marcar como mostrado
        localStorage.setItem(this.lastBackupKey, new Date().toISOString());
    }

    // Inicializar verificação
    init() {
        // Verificar após 5 segundos do carregamento
        setTimeout(() => {
            this.showBackupReminder();
        }, 5000);
    }
}

// Exportar para uso global
window.BackupReminder = BackupReminder;
