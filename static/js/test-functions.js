// Script de teste para verificar funcionalidades
console.log('🔍 Iniciando testes de funcionalidade...');

// Teste 1: Verificar se as classes estão definidas
function testClassDefinitions() {
    console.log('\n📋 Teste 1: Verificando definições de classes');
    
    const tests = [
        { name: 'Utils', obj: window.Utils },
        { name: 'UIComponents', obj: window.UIComponents }
    ];
    
    tests.forEach(test => {
        if (typeof test.obj !== 'undefined') {
            console.log(`✅ ${test.name} está definido`);
        } else {
            console.log(`❌ ${test.name} NÃO está definido`);
        }
    });
}

// Teste 2: Verificar métodos essenciais
function testEssentialMethods() {
    console.log('\n🔧 Teste 2: Verificando métodos essenciais');
    
    const utilsMethods = [
        'detectNetworkConnection',
        'getCurrentLocation', 
        'getCompleteLocationInfo',
        'analyzeLocationConsistency'
    ];
    
    const componentsMethods = [
        'quickFill',
        'storeLocationData',
        'getStoredLocationData',
        'clearStoredLocationData',
        'renderLocationInfo'
    ];
    
    utilsMethods.forEach(method => {
        if (Utils && typeof Utils[method] === 'function') {
            console.log(`✅ Utils.${method}() está disponível`);
        } else {
            console.log(`❌ Utils.${method}() NÃO está disponível`);
        }
    });
    
    componentsMethods.forEach(method => {
        if (UIComponents && typeof UIComponents[method] === 'function') {
            console.log(`✅ UIComponents.${method}() está disponível`);
        } else {
            console.log(`❌ UIComponents.${method}() NÃO está disponível`);
        }
    });
}

// Teste 3: Verificar APIs do navegador
function testBrowserAPIs() {
    console.log('\n🌐 Teste 3: Verificando APIs do navegador');
    
    const apis = [
        { name: 'Geolocation', check: () => 'geolocation' in navigator },
        { name: 'Network Information', check: () => 'connection' in navigator },
        { name: 'WebRTC', check: () => 'RTCPeerConnection' in window }
    ];
    
    apis.forEach(api => {
        if (api.check()) {
            console.log(`✅ ${api.name} API está disponível`);
        } else {
            console.log(`⚠️ ${api.name} API NÃO está disponível`);
        }
    });
}

// Teste 4: Verificar elementos DOM
function testDOMElements() {
    console.log('\n🎯 Teste 4: Verificando elementos DOM');
    
    const elements = [
        'quickFillBtn',
        'detectLocationBtn', 
        'timesheetForm',
        'timesheetTable'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Elemento #${id} encontrado`);
        } else {
            console.log(`❌ Elemento #${id} NÃO encontrado`);
        }
    });
}

// Executar todos os testes
function runAllTests() {
    testClassDefinitions();
    testEssentialMethods();
    testBrowserAPIs();
    testDOMElements();
    
    console.log('\n🎉 Testes concluídos!');
    console.log('\n💡 Para testar funcionalidades:');
    console.log('- Clique no botão "⚡ Preenchimento Rápido"');
    console.log('- Clique no botão "🌐 Detectar Local"');
    console.log('- Ou acesse /test-location.html para testes isolados');
}

// Executar quando DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Exportar para uso global
window.runTests = runAllTests;
