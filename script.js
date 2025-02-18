const channelID = '2840207';
const readAPIKey = '5UWNQD21RD2A7QHG';
const writeAPIKey = '9NG6QLIN8UXLE2AH';
const temperatureField = 'field1';
const levelField = 'field2';
const bombaField = 'field3';
const resistenciaField = 'field4';

const temperatureElement = document.getElementById('temperature');
const levelElement = document.getElementById('level');
const bombaOnButton = document.getElementById('bombaOn');
const bombaOffButton = document.getElementById('bombaOff');
const resistenciaOnButton = document.getElementById('resistenciaOn');
const resistenciaOffButton = document.getElementById('resistenciaOff');

// Variáveis para armazenar os últimos valores válidos
let lastValidTemperature = '--';
let lastValidLevel = '--';

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

// Atualiza os dados a cada 5 segundos
setInterval(fetchData, 5000);
fetchData(); // Busca os dados imediatamente ao carregar a página