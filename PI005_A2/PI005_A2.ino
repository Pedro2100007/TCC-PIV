#include <ESP8266WiFi.h>
#include <Wire.h>
#include <SPI.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "ThingSpeak.h"

// Configurações Wi-Fi
const char* ssid = "ALGAR_Torres2023";
const char* password = "t0rres!001";

// Configurações ThingSpeak
const char* writeApiKey = "9NG6QLIN8UXLE2AH";
const char* readApiKey = "5UWNQD21RD2A7QHG";
unsigned long Channel = 2840207;
unsigned int field3 = 3;     //field3 = variavel indica qual field (1)
unsigned int field4 = 4;     //field4 = variavel indica qual field (2)


// Pinos
#define BOMBA 5         //D1
#define AQUECEDOR 4     //D2 
#define BARRAMENTO 2    //D4 a ser utilizado como barramento do OneWire para o sensor DS18B20 
#define TRIGGER_PIN 12  //D6
#define ECHO_PIN 14     //D5

// Inicializa o barramento OneWire e o sensor DS18B20
OneWire barramento(BARRAMENTO);
DallasTemperature sensors(&barramento);

//Seção configuração WIFI e IP estático
WiFiClient client;

IPAddress ip(192, 168, 10, 50);             //IP definido ao NodeMCU
IPAddress gateway(192, 168, 10, 114);       //IP do roteador
IPAddress subnet(255, 255, 255, 0);         //Mascara da rede

WiFiServer server(80);                     //Cria o servidor web na porta 80

void setup() {

  Serial.begin(115200); //velocidade do monitor serial
  delay(100);

  pinMode(BOMBA, OUTPUT);                  //indica o pino 5 como saída da bomba
  pinMode(AQUECEDOR, OUTPUT);              //indica o pino 4 como saída do aquecedor
  digitalWrite(BOMBA, LOW);                //coloca o pino 5 em um - inicia desligado
  digitalWrite(AQUECEDOR, LOW);            //coloca o pino 4 em um - inicia desligado

  pinMode(TRIGGER_PIN, OUTPUT);             //indica o pino 12 como saida de sinal do sensor HC-SR04
  pinMode(ECHO_PIN, INPUT);                 //indica o pino 14 como entrada de sinal do sensor HC-SR04

  //WiFi.config(ip, gateway, subnet); depois de removido passou a comunicar com o thingspeak
  WiFi.begin(ssid, password);                 //Conecta ao WIFI
  Serial.println("Conectando ao Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    //delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado ao Wi-Fi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  sensors.begin();
  ThingSpeak.begin(client);
}

//função que faz a emissão do sinal do HC-SR04
float lerDistancia() {
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);
  //função que faz a recepção do sinal do HC-SR04
  long duracao = pulseIn(ECHO_PIN, HIGH);
  float distancia = duracao * 0.034 / 2; // Distância em centímetros - distance to an object = ((speed of sound in the air)*time)/2
  return distancia;
}
//fim função emissão / recepção

//Início seção de execução em loop
void loop() {

  //Verifica se o WIFI continua conectado e reconecta se necessário
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado. Tentando reconectar...");
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  //Seção de leitura dos sensores
  //Lê a temperatua no DS18B20
  sensors.requestTemperatures();
  float temperatura = sensors.getTempCByIndex(0);
  //float temperatura = 30; teste para atribuir dado para temperatura
  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.println(" °C");

  //chama função de emissão / recepção do sensor HC-SR04
  float distancia = lerDistancia();
  Serial.print("Distância: ");
  Serial.print(distancia);
  Serial.println(" cm");

// Seção escreve a temperatura e o nível no Thingspeak
  ThingSpeak.setField(1, temperatura);
  ThingSpeak.setField(2, distancia);

  int status = ThingSpeak.writeFields(Channel, writeApiKey);  //--> Verifica se escrita foi bem sucedida = 200
  if (status == 200) {
    Serial.println("Dados enviados ao ThingSpeak com sucesso!");
  } else {
    Serial.println("Erro ao enviar dados ao ThingSpeak. Código: " + String(status));
  }

//Seção de comando das saídas recebendo do Thingspeak
//Lê os canais 3 e 4 do thingspeak
int statusCode = 0;
  int est_bba = ThingSpeak.readFloatField(Channel, field3);  //--> Pega ultimo estado field3 (Bomba) 
  int est_aqu = ThingSpeak.readFloatField(Channel, field4);  //--> Pega ultimo estado field4 (Aquecedor)

  statusCode = ThingSpeak.getLastReadStatus();  //--> Verifica se leitura foi bem sucedida = 200
  if(statusCode == 200){

    //Atua na bomba
    if(est_bba == 1){
      digitalWrite(BOMBA, HIGH);
      Serial.println("Bomba ligada");
    }
    else if(est_bba == 0){
      digitalWrite(BOMBA, LOW);
      Serial.println("Bomba desligada");
    }
    Serial.print("O último estado da bomba no API é : ");
    Serial.println(est_bba);   

    //Atua no aquecedor
    if(est_aqu == 1){
      digitalWrite(AQUECEDOR, HIGH);
      Serial.println("Aquecedor ligado");
    }
    else if(est_aqu == 0){
      digitalWrite(AQUECEDOR, LOW);
      Serial.println("Aquecedor desligado");
    }
    Serial.print("O último estado do aquecedor no API é : ");
    Serial.println(est_aqu);    
  }
  else {
    Serial.println("Problem reading channel. HTTP error code " + String(statusCode));
  }

  delay(15000); // Aguarda 15 segundos
}