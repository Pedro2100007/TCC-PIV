// Constantes para acessar o canal e a chave de leitura do ThingSpeak
const canalId = "2840207";
const chaveLeitura = "5UWNQD21RD2A7QHG";

// Variável para armazenar a instância do gráfico
let meuGrafico = null;

// Função para carregar os dados com base nas datas selecionadas
function carregarDados() {
    // Obtém as datas de início e fim dos campos de entrada
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    // Verifica se ambas as datas foram selecionadas
    if (!dataInicio || !dataFim) {
        alert("Por favor, selecione ambas as datas.");
        return;
    }

    // Formata as datas no formato esperado pela API (YYYY-MM-DD)
    const inicioFormatado = new Date(dataInicio).toISOString().split('T')[0];
    const fimFormatado = new Date(dataFim).toISOString().split('T')[0];

    // Constrói a URL da API com as datas de início e fim
    const url = `https://api.thingspeak.com/channels/${canalId}/fields/1.json?api_key=${chaveLeitura}&start=${inicioFormatado}&end=${fimFormatado}`;

    // Faz a requisição à API do ThingSpeak
    fetch(url)
        .then(response => response.json()) // Converte a resposta para JSON
        .then(data => {
            // Extrai os timestamps (datas) e os valores do field 1
            const timestamps = data.feeds.map(feed => feed.created_at);
            const valores = data.feeds.map(feed => parseFloat(feed.field1)); // Converte os valores para números


                // Calcula a média, máxima e mínima - incluido, mas não está funcionando
                const avgTemp = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);
                const maxTemp = Math.max(...valores).toFixed(2);
                const minTemp = Math.min(...valores).toFixed(2);

                // Exibe os resultados na página
                document.getElementById('avgTemp').textContent = avgTemp;
                document.getElementById('maxTemp').textContent = maxTemp;
                document.getElementById('minTemp').textContent = minTemp;

                console.log('Resultados calculados:', { avgTemp, maxTemp, minTemp }); // Log dos resultados


            // Exibe os valores na página - utilizado para confirmação 
            //const valoresDiv = document.getElementById('valores');
            //valoresDiv.innerHTML = valores.join('<br>');

            // Obtém o contexto do canvas onde o gráfico será renderizado
            const ctx = document.getElementById('meuGrafico').getContext('2d');

            // Destrói os gráfico anterior, se existir
            if (meuGrafico) {
                meuGrafico.destroy();
            }

            // Cria um novo gráfico
            meuGrafico = new Chart(ctx, {
                type: 'line', // Tipo de gráfico (linha)
                data: {
                    labels: timestamps, // Eixo X: timestamps (datas)
                    datasets: [{
                        label: 'Temperatura', // Legenda do dataset
                        data: valores, // Eixo Y: valores do field 1
                        borderColor: 'blue', // Cor da linha
                        fill: false // Não preencher a área sob a linha
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time', // Eixo X é do tipo tempo
                            time: {
                                tooltipFormat: 'DD T', // Formato da tooltip (dia e hora)
                                unit: 'minute' // Unidade de tempo (minuto)
                            },
                            title: {
                                display: true,
                                text: 'Data / Hora' // Título do eixo X
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperatura' // Título do eixo Y
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Erro ao buscar dados:', error)); // Captura e exibe erros
}