document.getElementById('timeForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
  
    // Converte as datas para o formato UNIX timestamp
    const startUnix = Math.floor(new Date(startDate).getTime() / 1000);
    const endUnix = Math.floor(new Date(endDate).getTime() / 1000);
  
    // Substitua pelo seu Read API Key e Channel ID do ThingSpeak
    const apiKey = 'SUA_CHAVE_API_AQUI';
    const channelID = 'SEU_CHANNEL_ID_AQUI';
  
    // URL da API do ThingSpeak
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}&start=${startUnix}&end=${endUnix}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const feeds = data.feeds;
  
        if (feeds.length === 0) {
          alert('Nenhum dado encontrado para o período selecionado.');
          return;
        }
  
        // Extrai as temperaturas
        const temperatures = feeds.map(feed => parseFloat(feed.field1));
  
        // Calcula a média, máxima e mínima
        const avgTemp = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2);
        const maxTemp = Math.max(...temperatures).toFixed(2);
        const minTemp = Math.min(...temperatures).toFixed(2);
  
        // Exibe os resultados
        document.getElementById('avgTemp').textContent = avgTemp;
        document.getElementById('maxTemp').textContent = maxTemp;
        document.getElementById('minTemp').textContent = minTemp;

        
      })

      .catch(error => {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao buscar dados. Verifique o console para mais detalhes.');
      });
    

// Redireciona para a página index.html ao clicar no botão Voltar
document.getElementById('voltarButton').addEventListener('click', function () {
    window.location.href = 'index.html';
});
    
  });