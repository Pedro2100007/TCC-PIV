// Configurações do ThingSpeak
const channelID = '2840207'; // Channel ID
const readAPIKey = '5UWNQD21RD2A7QHG'; // Read API Key
const writeAPIKey = '9NG6QLIN8UXLE2AH'; // Write API Key
const temperatureField = 'field1';
const levelField = 'field2';
const bombaField = 'field3';
const resistenciaField = 'field4';

// Elementos da seção de controle manual
const temperatureElement = document.getElementById('temperature');
const levelElement = document.getElementById('level');
const bombaOnButton = document.getElementById('bombaOn');
const bombaOffButton = document.getElementById('bombaOff');
const resistenciaOnButton = document.getElementById('resistenciaOn');
const resistenciaOffButton = document.getElementById('resistenciaOff');

// Variáveis para armazenar os últimos valores válidos do thingspeak
let lastValidTemperature = '--';
let lastValidLevel = '--';

// Função para buscar dados do ThingSpeak em tempo real
function fetchData() {
    fetch(`https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readAPIKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data); // Log dos dados recebidos

            // Atualiza a temperatura se o campo não estiver vazio
            if (data[temperatureField] && data[temperatureField].trim() !== '') {
                lastValidTemperature = data[temperatureField];
            }
            temperatureElement.textContent = lastValidTemperature;

            // Atualiza o nível se o campo não estiver vazio
            if (data[levelField] && data[levelField].trim() !== '') {
                lastValidLevel = data[levelField];
            }
            levelElement.textContent = lastValidLevel;

            // Atualiza o texto do status da bomba baseado no field3 do thingspeak
            if (data[bombaField] == 1) {
                statusBomba.textContent = 'Bomba Ligada'; // Atualiza o texto do status da bomba
                statusBomba.style.color = 'green'; // Muda a cor do texto para verde
            } else {
                statusBomba.textContent = 'Bomba Desligada'; // Atualiza o texto
                statusBomba.style.color = 'red'; // Muda a cor do texto para vermelho
            }
            
            // Atualiza o texto do status do aquecedor baseado no field4 do thingspeak
            if (data[resistenciaField] == 1) {
                statusAquecedor.textContent = 'Aquecedor Ligado'; // Atualiza o texto do status da bomba
                statusAquecedor.style.color = 'green'; // Muda a cor do texto para verde
            } else {
                statusAquecedor.textContent = 'Aquecedor Desligado'; // Atualiza o texto
                statusAquecedor.style.color = 'red'; // Muda a cor do texto para vermelho
            }

        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            // Mantém os últimos valores válidos em caso de erro
            temperatureElement.textContent = lastValidTemperature;
            levelElement.textContent = lastValidLevel;
        });
}

// Atualiza os dados em tempo real a cada 5 segundos
if (temperatureElement && levelElement) {
    setInterval(fetchData, 5000);
    fetchData(); // Busca os dados imediatamente ao carregar a página
}


// Função para atualizar um campo no ThingSpeak
function updateField(field, value) {
    const url = `https://api.thingspeak.com/update?api_key=${writeAPIKey}&${field}=${value}`;
    console.log(`Enviando requisição para: ${url}`); // Log da URL de requisição

    fetch(url, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        console.log(`Campo ${field} atualizado com sucesso. Resposta: ${data}`);
    })
    .catch(error => {
        console.error(`Erro ao atualizar campo ${field}:`, error);
    });
}

// Event listeners para os botões do controle manual
if (bombaOnButton && bombaOffButton && resistenciaOnButton && resistenciaOffButton) {
    bombaOnButton.addEventListener('click', () => {
        if (modoAutomatico === 0) { // Verifica se o modo automático está desligado
            console.log('Ligando bomba...');
            updateField(bombaField, 1);
        } else {
            alert('Modo automático está ligado. Desligue o modo automático para controlar manualmente.');
        }
    });

    bombaOffButton.addEventListener('click', () => {
        if (modoAutomatico === 0) { // Verifica se o modo automático está desligado
            console.log('Desligando bomba...');
            updateField(bombaField, 0);
        } else {
            alert('Modo automático está ligado. Desligue o modo automático para controlar manualmente.');
        }
    });

    resistenciaOnButton.addEventListener('click', () => {
        if (modoAutomatico === 0) { // Verifica se o modo automático está desligado
            console.log('Ligando resistência...');
            updateField(resistenciaField, 1);
        } else {
            alert('Modo automático está ligado. Desligue o modo automático para controlar manualmente.');
        }
    });

    resistenciaOffButton.addEventListener('click', () => {
        if (modoAutomatico === 0) { // Verifica se o modo automático está desligado
            console.log('Desligando resistência...');
            updateField(resistenciaField, 0);
        } else {
            alert('Modo automático está ligado. Desligue o modo automático para controlar manualmente.');
        }
    });
}


// Incluído para o modo automático
// Função para dados controle automático
let modoAutomatico = 0; // 0 para desligado, 1 para ligado

function toggleModoAutomatico() {
    modoAutomatico = modoAutomatico === 0 ? 1 : 0;
    const botao = document.getElementById('modoAutomatico');
    botao.textContent = modoAutomatico === 1 ? 'Ligado' : 'Desligado';   
}

document.getElementById('bombaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const intervaloLigar = parseInt(document.getElementById('intervaloLigar').value);
    const tempoDesligar = parseInt(document.getElementById('tempoDesligar').value);
    const temperaturaAlvo = parseInt(document.getElementById('temperaturaAlvo').value);

});


// Função para consultar dados históricos
if (document.getElementById('timeForm')) {
    document.getElementById('timeForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Impede o envio padrão do formulário

        // Obtém as datas de início e fim do formulário
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Verifica se as datas foram preenchidas
        if (!startDate || !endDate) {
            alert('Por favor, preencha ambas as datas.');
            return;
        }

        // Converte as datas para o formato UNIX timestamp (segundos)
        const startUnix = Math.floor(new Date(startDate).getTime() / 1000);
        const endUnix = Math.floor(new Date(endDate).getTime() / 1000);

        console.log('Data Inicial (Unix):', startUnix); // Log da data inicial
        console.log('Data Final (Unix):', endUnix); // Log da data final

        // URL da API do ThingSpeak para buscar os feeds no intervalo de datas
        const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&start=${startUnix}&end=${endUnix}`;

        console.log('URL da API:', url); // Log da URL da API

        // Faz a requisição à API
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data); // Log dos dados recebidos

                const feeds = data.feeds;

                // Verifica se há dados no período selecionado
                if (feeds.length === 0) {
                    alert('Nenhum dado encontrado para o período selecionado.');
                    return;
                }

                // Extrai as temperaturas (campo field1)
                const temperatures = feeds.map(feed => parseFloat(feed.field1));

                // Calcula a média, máxima e mínima
                const avgTemp = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2);
                const maxTemp = Math.max(...temperatures).toFixed(2);
                const minTemp = Math.min(...temperatures).toFixed(2);

                // Exibe os resultados na página
                document.getElementById('avgTemp').textContent = avgTemp;
                document.getElementById('maxTemp').textContent = maxTemp;
                document.getElementById('minTemp').textContent = minTemp;

                console.log('Resultados calculados:', { avgTemp, maxTemp, minTemp }); // Log dos resultados
            })
            .catch(error => {
                console.error('Erro ao buscar dados:', error); // Log de erro
                alert('Erro ao buscar dados. Verifique o console para mais detalhes.');
            });
    });
}