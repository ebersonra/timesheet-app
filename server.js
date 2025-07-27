const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

class TimesheetServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Segurança
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"]
                }
            }
        }));

        // CORS
        this.app.use(cors());

        // Compressão
        this.app.use(compression());

        // Parse JSON
        this.app.use(express.json());

        // Arquivos estáticos
        this.app.use('/static', express.static(path.join(__dirname, 'static')));
    }

    setupRoutes() {
        // Rota principal
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        // API routes
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Rota não encontrada' });
        });

        // Error handler
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Erro interno do servidor' });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Servidor rodando na porta ${this.port}`);
            console.log(`📱 Acesse: http://localhost:${this.port}`);
        });
    }
}

// Inicializar servidor
const server = new TimesheetServer();
server.start();

module.exports = TimesheetServer;
