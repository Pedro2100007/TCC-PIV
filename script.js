// Configurações do ThingSpeak
const channelID = '2840207'; // Substitua pelo seu Channel ID
const readAPIKey = '5UWNQD21RD2A7QHG'; // Substitua pela sua Read API Key
const writeAPIKey = '9NG6QLIN8UXLE2AH'; // Substitua pela sua Write API Key
const temperatureField = 'field1';
const levelField = 'field2';
const bombaField = 'field3';
const resistenciaField = 'field4';

// Elementos da página principal
const temperatureElement = document.getElementById('temperature');
const levelElement = document.getElementById('level');
const bombaOnButton = document.getElementById('bombaOn');
const bombaOffButton = document.getElementById('bombaOff');
const resistenciaOnButton = document.getElementById('resistenciaOn');
const resistenciaOffButton = document.getElementById('resistenciaOff');

// Variáveis para armazenar os últimos valores válidos
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
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            // Mantém os últimos valores válidos em caso de erro
            temperatureElement.textContent = lastValidTemperature;
            levelElement.textContent = lastValidLevel;
        });
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

// Event listeners para os botões da página principal
if (bombaOnButton && bombaOffButton && resistenciaOnButton && resistenciaOffButton) {
    bombaOnButton.addEventListener('click', () => {
        console.log('Ligando bomba...');
        updateField(bombaField, 1);
    });

    bombaOffButton.addEventListener('click', () => {
        console.log('Desligando bomba...');
        updateField(bombaField, 0);
    });

    resistenciaOnButton.addEventListener('click', () => {
        console.log('Ligando resistência...');
        updateField(resistenciaField, 1);
    });

    resistenciaOffButton.addEventListener('click', () => {
        console.log('Desligando resistência...');
        updateField(resistenciaField, 0);
    });
}

// Navegação para a página de dados
if (document.getElementById('dadosButton')) {
    document.getElementById('dadosButton').addEventListener('click', function () {
        window.location.href = 'dados.html';
    });
}

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

// Atualiza os dados em tempo real a cada 5 segundos
if (temperatureElement && levelElement) {
    setInterval(fetchData, 5000);
    fetchData(); // Busca os dados imediatamente ao carregar a página
}