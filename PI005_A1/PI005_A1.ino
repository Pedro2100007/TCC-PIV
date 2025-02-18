#include <ESP8266WiFi.h>        //Biblioteca REDE WIFI
#include <Wire.h>
#include <SPI.h>
#include <OneWire.h>            //Biblioteca protocolo Onewire
#include <DallasTemperature.h>  //Biblioteca p/ o DS18B20
#include "ThingSpeak.h"         //Biblioteca do API

//Configurações WIFI
const char* ssid = "ALGAR_Torres2023";      //Nome do WIFI
const char* password = "t0rres!001";        //Senha WIFI

//Configurações Thingspeak
const char* writeApiKey = "9NG6QLIN8UXLE2AH";  //API Key do ThingSpeak para enviar dados 
const char* readApiKey = "5UWNQD21RD2A7QHG";    //API Key do ThingSpeak para ler dados
unsigned long thingSpeakChannelID = 2840207;    //ID do canal no ThingSpeak 

// Pinos das saídas para os relés da bomba e do aquecedor e pio do barramento OneWire
#define BOMBA 5  // Saída relé bomba (GPIO 5 - D1)
#define AQUECEDOR 4     // Saída relé aquecedor (GPIO 4 - D2)
#define BARRAMENTO 2 // Pino do sensor temperatura DS18B20 (GPIO 2 - D4)

// Inicializa o barramento OneWire e o sensor DS18B20
OneWire barramento(BARRAMENTO);
DallasTemperature sensors(&barramento);

//Cria um objeto WiFiClient para gerenciar conexão TCP-IP
WiFiClient client;

// Configurações de IP estático
IPAddress ip(192, 168, 10, 50);      //IP definido ao NodeMCU
IPAddress gateway(192, 168, 10, 114); //IP do roteador
IPAddress subnet(255, 255, 255, 0);  //Mascara da rede

WiFiServer server(80);      //Criando o servidor web na porta 80

void setup() {
  //Inicializa comunicação serial
  Serial.begin(115200);
  delay(100);

  // Configura os pinos da bomba e do aquecedor como saída
  pinMode(BOMBA, OUTPUT);
  pinMode(AQUECEDOR, OUTPUT);
  digitalWrite(BOMBA, LOW);  // Inicia a bomba desligada
  digitalWrite(AQUECEDOR, LOW);     // Inicia o aquecedor desligado

  // Configura IP estático
  WiFi.config(ip, gateway, subnet);

  // Conecta ao Wi-Fi
  WiFi.begin(ssid, password);     //Aguardando conexão
  Serial.println("");
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Conectado em: ");
  Serial.println(ssid);
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Inicializa o sensor DS18B20
  sensors.begin();

  // Inicializa o ThingSpeak
  ThingSpeak.begin(client);
}

void loop() {
  // Solicita a leitura da temperatura
  sensors.requestTemperatures();
  float temperatura = sensors.getTempCByIndex(0);  // Lê a temperatura em Celsius

  // Exibe a temperatura no monitor serial
  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.println(" °C");

  // Envia a temperatura para o ThingSpeak (Field 1)
  ThingSpeak.setField(1, temperatura);

  // Lê os comandos da bomba do ThingSpeak (usando a Read API Key)
  int bomba = ThingSpeak.readIntField(thingSpeakChannelID, 3, readApiKey);  // Field 3
  if (bomba == -1) {
    Serial.println("Erro ao ler o status da bomba do ThingSpeak.");
  } else {
    // Controla a bomba
    if (bomba == 1) {
      digitalWrite(BOMBA, HIGH);  // Liga a bomba
      Serial.println("BOMBA: LIGADA");
    } else {
      digitalWrite(BOMBA, LOW);   // Desliga a bomba
      Serial.println("BOMBA: DESLIGADA");
    }
  }

  // Lê os comandos do aquecedor do ThingSpeak (usando a Read API Key)
  int aquecedor = ThingSpeak.readIntField(thingSpeakChannelID, 4, readApiKey);  // Field 4
  if (aquecedor == -1) {
    Serial.println("Erro ao ler o status do aquecedor do ThingSpeak.");
  } else {
    // Controla o aquecedor
    if (aquecedor == 1) {
      digitalWrite(AQUECEDOR, HIGH);  // Liga o aquecedor
      Serial.println("AQUECEDOR: LIGADO");
    } else {
      digitalWrite(AQUECEDOR, LOW);   // Desliga o aquecedor
      Serial.println("AQUECEDOR: DESLIGADO");
    }
  }

  // Envia os dados atualizados ao ThingSpeak (usando a Write API Key)
  int status = ThingSpeak.writeFields(thingSpeakChannelID, writeApiKey);

  // Verifica se o envio foi bem-sucedido
  if (status == 200) {
    Serial.println("Dados enviados ao ThingSpeak com sucesso!");
  } else {
    Serial.println("Erro ao enviar dados ao ThingSpeak. Código: " + String(status));
  }

  // Aguarda 15 segundos antes de fazer a próxima leitura
  delay(15000);
}