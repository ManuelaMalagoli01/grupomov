/* eslint-disable */
// eslint-disable-next-line
import { useState, useEffect } from "react"; // eslint-disable-line

// ── DADOS BASE ──────────────────────────────────────────────────────────────
const REGIONS = {
  metropolitana: { label: "Metropolitana BH", techs: ["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme","Denison"] },
  roca:          { label: "Roca",              techs: ["Arthur","Eduardo","Luiz Ribeiro"] },
  centroOeste:   { label: "Centro-Oeste",      techs: ["Bruno","Marcus"] },
};
// Divisão da escala metropolitana por tipo
const METRO_PREVENTIVO = ["Rafael","Helbert","Luiz Guilherme","Denison"];
const METRO_CORRETIVO  = ["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme","Denison"];
const ALL_TECHS = Object.values(REGIONS).flatMap(r => r.techs);
const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const TODAY = new Date();
const PAD = n => String(n).padStart(2,"0");
const fmtDate = d => `${d.getFullYear()}-${PAD(d.getMonth()+1)}-${PAD(d.getDate())}`;
const TODAY_STR = fmtDate(TODAY);

const SLA_OPTIONS = [4,8,12,24,48];

const TIPOS = [
  { v:"preventivo",       l:"📋 Preventivo",       color:"#1565C0", bg:"#F0F4FF" },
  { v:"corretivo",        l:"🔧 Corretivo",         color:"#C62828", bg:"#FFF0F0" },
  { v:"a_faturar",        l:"💰 A Faturar",         color:"#1A7A3C", bg:"#F0FFF5" },
  { v:"mau_uso",          l:"⚠️ Mau Uso",           color:"#E67E00", bg:"#FFF8F0" },
  { v:"entrega_tecnica",  l:"📦 Entrega Técnica",   color:"#6A1B9A", bg:"#F8F0FF" },
  { v:"bateria",          l:"🔋 Bateria",            color:"#00838F", bg:"#F0FAFA" },
  { v:"carregador",       l:"🔌 Carregador",         color:"#AD1457", bg:"#FFF0F5" },
];
const tipoLabel = v => TIPOS.find(t=>t.v===v)?.l || v;
const tipoCfg   = v => TIPOS.find(t=>t.v===v) || TIPOS[0];

const TECH_COLORS = {
  "Anderson":"#E67E00","Dilson":"#1A7A3C","Rafael":"#1565C0","Helbert":"#6A1B9A",
  "Luiz Guilherme":"#C62828","Denison":"#00838F","Arthur":"#4E342E","Eduardo":"#37474F",
  "Luiz Ribeiro":"#558B2F","Bruno":"#AD1457","Marcus":"#283593",
};
const techColor = t => TECH_COLORS[t] || "#555";

// ── DADOS REAIS GRUPO MOV (200 registros mais recentes) ──────────────────────
const DB_STATS = {"total":1737,"preventivos":614,"corretivos":1011,"a_faturar":109,"mau_uso":3,"acompanhar":326,"clientes":95};

async function loadAllReports() {
  // Carrega dos dados embutidos — base real Grupo MOV Jan-Mai 2026
  return REAL_REPORTS;
}

// Amostra dos 200 registros mais recentes da base real
const REAL_REPORTS = [{"id":"P30408","reportNum":"REL-30408","type":"preventivo","empresa":"KRUG BIER INDÚSTRIA LTDA","patrimonio":"1395/A959Y02818V","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"15:54","horaSaida":"18:18","horasTrabalhadas":"02:24","horasDeslocamento":"00:00","kmDeslocado":"66"},{"id":"P30407","reportNum":"REL-30407","type":"preventivo","empresa":"MASTERZOO INDUSTRIA E COMERCIO DE RACOES LTDA","patrimonio":"MZ001/MZ001","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PT1654","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"15:27","horaSaida":"16:45","horasTrabalhadas":"01:18","horasDeslocamento":"01:11","kmDeslocado":"81,06 km"},{"id":"P30399","reportNum":"REL-30399","type":"preventivo","empresa":"MASTERZOO INDUSTRIA E COMERCIO DE RACOES LTDA","patrimonio":"0912/340260E05620","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"13:26","horaSaida":"15:21","horasTrabalhadas":"01:55","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30397","reportNum":"REL-30397","type":"preventivo","empresa":"MASTERZOO INDUSTRIA E COMERCIO DE RACOES LTDA","patrimonio":"0872/340260D05119","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"10:06","horaSaida":"13:18","horasTrabalhadas":"03:12","horasDeslocamento":"01:39","kmDeslocado":"41,46 km"},{"id":"P30396","reportNum":"REL-30396","type":"preventivo","empresa":"GUTENBERG DISTRIBUIDORA DE LIVROS LTDA - Grupo Autêntica","patrimonio":"1086/340260000126","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"09:05","horaSaida":"13:16","horasTrabalhadas":"04:11","horasDeslocamento":"00:22","kmDeslocado":"15,06 km"},{"id":"P30393","reportNum":"REL-30393","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1177/341930V01879","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-26","horaEntrada":"08:42","horaSaida":"10:35","horasTrabalhadas":"01:53","horasDeslocamento":"00:32","kmDeslocado":"10,80 km"},{"id":"P30390","reportNum":"REL-30390","type":"preventivo","empresa":"CASTANHEIRA & CIA LTDA - Supermercado Santo Antônio","patrimonio":"0597/340260F06661","tecnico":"Anderson","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"16:33","horaSaida":"18:02","horasTrabalhadas":"01:29","horasDeslocamento":"01:30","kmDeslocado":"130,22 km"},{"id":"P30389","reportNum":"REL-30389","type":"preventivo","empresa":"BRINK'S SEGURANCA E TRANSPORTE DE VALORES LTDA","patrimonio":"1185/340261V03902","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"11:02","horaSaida":"18:07","horasTrabalhadas":"07:05","horasDeslocamento":"00:43","kmDeslocado":"9,63 km"},{"id":"P30387","reportNum":"REL-30387","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1500/A376Y02117V","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MOV","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"13:37","horaSaida":"17:34","horasTrabalhadas":"03:57","horasDeslocamento":"00:00","kmDeslocado":"24"},{"id":"P30386","reportNum":"REL-30386","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"1075/A972Y01544R","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"15:22","horaSaida":"17:01","horasTrabalhadas":"01:39","horasDeslocamento":"00:30","kmDeslocado":"15,65 km"},{"id":"P30383","reportNum":"REL-30383","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"0963/6A330649","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"13:49","horaSaida":"15:15","horasTrabalhadas":"01:26","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30381","reportNum":"REL-30381","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"0969/6A330871","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-25","horaEntrada":"11:22","horaSaida":"13:44","horasTrabalhadas":"02:22","horasDeslocamento":"00:51","kmDeslocado":"16,30 km"},{"id":"P30375","reportNum":"REL-30375","type":"preventivo","empresa":"INDALABOR INDAIA LABORATORIO FARMACEUTICO LTDA","patrimonio":"1479/A959Y02984V","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"14:32","horaSaida":"16:58","horasTrabalhadas":"02:26","horasDeslocamento":"02:36","kmDeslocado":"15,53 km"},{"id":"P30368","reportNum":"REL-30368","type":"preventivo","empresa":"INDUSTRIA MINEIRA DE RAÇÕES LTDA - Vitaminas","patrimonio":"0420/341833B03248","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"14:38","horaSaida":"16:25","horasTrabalhadas":"01:47","horasDeslocamento":"00:00","kmDeslocado":"370"},{"id":"P30367","reportNum":"REL-30367","type":"preventivo","empresa":"INDALABOR INDAIA LABORATORIO FARMACEUTICO LTDA","patrimonio":"1495/A959Y03041V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"09:48","horaSaida":"14:42","horasTrabalhadas":"04:54","horasDeslocamento":"00:51","kmDeslocado":"13,25 km"},{"id":"P30365","reportNum":"REL-30365","type":"preventivo","empresa":"INDUSTRIA MINEIRA DE RAÇÕES LTDA - Vitaminas","patrimonio":"1861/B4X095V00132","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"09:38","horaSaida":"14:37","horasTrabalhadas":"04:21","horasDeslocamento":"00:00","kmDeslocado":"370"},{"id":"P30363","reportNum":"REL-30363","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1081/A972Y01410R","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"11:00","horaSaida":"13:57","horasTrabalhadas":"02:57","horasDeslocamento":"00:00","kmDeslocado":"24"},{"id":"P30360","reportNum":"REL-30360","type":"preventivo","empresa":"ORTHOCRIN INDUSTRIA E COMERCIO LTDA","patrimonio":"1313/A252Y02005U","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"11:33","horaSaida":"13:08","horasTrabalhadas":"01:35","horasDeslocamento":"00:09","kmDeslocado":"46,19 km"},{"id":"P30357","reportNum":"REL-30357","type":"preventivo","empresa":"ORGANIZACOES NUTRI DE REFEICOES COLETIVAS LTDA - Nutri Alibraz","patrimonio":"0731/340260101845","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-22","horaEntrada":"09:14","horaSaida":"10:42","horasTrabalhadas":"01:28","horasDeslocamento":"00:50","kmDeslocado":"49,60 km"},{"id":"P30346","reportNum":"REL-30346","type":"preventivo","empresa":"METALSIDER LTDA","patrimonio":"0522/341834C00675","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-21","horaEntrada":"12:05","horaSaida":"14:56","horasTrabalhadas":"02:51","horasDeslocamento":"00:00","kmDeslocado":"32"},{"id":"P30341","reportNum":"REL-30341","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1080/A972Y00002R","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-21","horaEntrada":"08:41","horaSaida":"12:57","horasTrabalhadas":"04:16","horasDeslocamento":"00:00","kmDeslocado":"11,89 km"},{"id":"P30338","reportNum":"REL-30338","type":"preventivo","empresa":"MULTIFARMA COMERCIO E REPRESENTACOES LTDA.","patrimonio":"340260D05695/340260D05695","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-21","horaEntrada":"10:26","horaSaida":"11:43","horasTrabalhadas":"01:17","horasDeslocamento":"00:00","kmDeslocado":"32"},{"id":"P30337","reportNum":"REL-30337","type":"preventivo","empresa":"MULTIFARMA COMERCIO E REPRESENTACOES LTDA.","patrimonio":"340260E05412/340260E05412","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-21","horaEntrada":"08:21","horaSaida":"10:20","horasTrabalhadas":"01:59","horasDeslocamento":"00:00","kmDeslocado":"15,28 km"},{"id":"P30336","reportNum":"REL-30336","type":"preventivo","empresa":"NAKAN IMPORT COMERCIO DE FERRAMENTAS LTDA","patrimonio":"0461/341833B03707","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-21","horaEntrada":"08:23","horaSaida":"08:28","horasTrabalhadas":"00:05","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P30333","reportNum":"REL-30333","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"1397/A959Y02817V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"16:02","horaSaida":"18:59","horasTrabalhadas":"02:57","horasDeslocamento":"00:00","kmDeslocado":"7,81 km"},{"id":"P30329","reportNum":"REL-30329","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"1364/341930X03239","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"11:16","horaSaida":"17:18","horasTrabalhadas":"06:02","horasDeslocamento":"00:00","kmDeslocado":"14,8"},{"id":"P30323","reportNum":"REL-30323","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1272/10205615","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"11:07","horaSaida":"12:31","horasTrabalhadas":"01:24","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30322","reportNum":"REL-30322","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"0966/6A330757","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"08:30","horaSaida":"12:31","horasTrabalhadas":"04:01","horasDeslocamento":"00:55","kmDeslocado":"7,81 km"},{"id":"P30321","reportNum":"REL-30321","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1508/20220401173","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"16:41","horaSaida":"18:00","horasTrabalhadas":"01:19","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30318","reportNum":"REL-30318","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1269/10188251","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-20","horaEntrada":"15:25","horaSaida":"10:58","horasTrabalhadas":"04:27","horasDeslocamento":"00:00","kmDeslocado":"11,89 km"},{"id":"P30315","reportNum":"REL-30315","type":"preventivo","empresa":"NAKAN IMPORT COMERCIO DE FERRAMENTAS LTDA","patrimonio":"1401/340137F03425","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-19","horaEntrada":"07:59","horaSaida":"17:29","horasTrabalhadas":"08:47","horasDeslocamento":"00:31","kmDeslocado":"26"},{"id":"P30311","reportNum":"REL-30311","type":"preventivo","empresa":"NAKAN IMPORT COMERCIO DE FERRAMENTAS LTDA","patrimonio":"0290/340137000214","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-19","horaEntrada":"12:36","horaSaida":"17:37","horasTrabalhadas":"05:01","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P30303","reportNum":"REL-30303","type":"preventivo","empresa":"BELFAR LTDA","patrimonio":"0800/516216Z26073","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"RX20 20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-19","horaEntrada":"11:07","horaSaida":"11:35","horasTrabalhadas":"00:28","horasDeslocamento":"01:28","kmDeslocado":"62"},{"id":"P30297","reportNum":"REL-30297","type":"preventivo","empresa":"NL DISTRIBUIDORA DE ALIMENTOS LTDA","patrimonio":"0990/6A330363","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-19","horaEntrada":"12:46","horaSaida":"16:31","horasTrabalhadas":"03:45","horasDeslocamento":"00:00","kmDeslocado":"24"},{"id":"P30286","reportNum":"REL-30286","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1270/10205613","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-18","horaEntrada":"14:43","horaSaida":"16:11","horasTrabalhadas":"01:28","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30281","reportNum":"REL-30281","type":"preventivo","empresa":"NL DISTRIBUIDORA DE ALIMENTOS LTDA","patrimonio":"0964/6A330650","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-18","horaEntrada":"10:07","horaSaida":"13:46","horasTrabalhadas":"03:39","horasDeslocamento":"00:40","kmDeslocado":"14,50 km"},{"id":"P30279","reportNum":"REL-30279","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1271/10205614","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-18","horaEntrada":"10:26","horaSaida":"12:16","horasTrabalhadas":"01:50","horasDeslocamento":"00:39","kmDeslocado":"11,89 km"},{"id":"P30269","reportNum":"REL-30269","type":"preventivo","empresa":"SGS GEOSOL LABORATORIOS LTDA","patrimonio":"1688/340262M01768","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"15:01","horaSaida":"16:43","horasTrabalhadas":"01:42","horasDeslocamento":"00:33","kmDeslocado":"44,47 km"},{"id":"P30268","reportNum":"REL-30268","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"1651/341930M05928","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"16:15","horaSaida":"17:41","horasTrabalhadas":"01:26","horasDeslocamento":"00:54","kmDeslocado":"8,77 km"},{"id":"P30267","reportNum":"REL-30267","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0745/341834C00776","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"14:24","horaSaida":"17:45","horasTrabalhadas":"03:21","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30265","reportNum":"REL-30265","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"0241100/0241100","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"TE18","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"09:14","horaSaida":"17:02","horasTrabalhadas":"07:48","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30262","reportNum":"REL-30262","type":"preventivo","empresa":"SGS GEOSOL LABORATORIOS LTDA","patrimonio":"1689/340262M01769","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"09:59","horaSaida":"15:07","horasTrabalhadas":"05:08","horasDeslocamento":"01:19","kmDeslocado":"21,53 km"},{"id":"P30259","reportNum":"REL-30259","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0770/341834C00851","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"09:03","horaSaida":"13:06","horasTrabalhadas":"04:03","horasDeslocamento":"00:35","kmDeslocado":"12,96 km"},{"id":"P30257","reportNum":"REL-30257","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0005/341832000156","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-15","horaEntrada":"09:19","horaSaida":"12:05","horasTrabalhadas":"02:46","horasDeslocamento":"00:43","kmDeslocado":"12,96 km"},{"id":"P30252","reportNum":"REL-30252","type":"preventivo","empresa":"AP BETIM COMPERCIO DE PEÇAS AUTOMOTIVAS LTDA - Minas Textil","patrimonio":"0729/340260A02103","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-14","horaEntrada":"15:36","horaSaida":"17:35","horasTrabalhadas":"01:59","horasDeslocamento":"01:08","kmDeslocado":"23,89 km"},{"id":"P30245","reportNum":"REL-30245","type":"preventivo","empresa":"RITZ FERRAMENTAS LTDA","patrimonio":"0861/348098D00192","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"R06-06 BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-14","horaEntrada":"12:52","horaSaida":"14:39","horasTrabalhadas":"01:47","horasDeslocamento":"00:00","kmDeslocado":"40"},{"id":"P30241","reportNum":"REL-30241","type":"preventivo","empresa":"QUIBASA QUIMICA BASICA LTDA","patrimonio":"1172/340261V03553","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-14","horaEntrada":"10:12","horaSaida":"11:40","horasTrabalhadas":"01:28","horasDeslocamento":"00:00","kmDeslocado":"12"},{"id":"P30236","reportNum":"REL-30236","type":"preventivo","empresa":"VMI SISTEMAS DE SEGURANCA LTDA","patrimonio":"0076/710141002814","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EXU 18/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-14","horaEntrada":"15:30","horaSaida":"17:04","horasTrabalhadas":"01:34","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30230","reportNum":"REL-30230","type":"preventivo","empresa":"LATICINIOS ITA INDUSTRIA E COMERCIO DE ALIMENTOS LTDA","patrimonio":"0676/340129E03303","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGU 18/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-13","horaEntrada":"13:49","horaSaida":"15:03","horasTrabalhadas":"01:14","horasDeslocamento":"01:54","kmDeslocado":"120"},{"id":"P30228","reportNum":"REL-30228","type":"preventivo","empresa":"DROGAMAXI DROGARIA EIRELI","patrimonio":"1169/340261V03638","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-13","horaEntrada":"15:04","horaSaida":"16:11","horasTrabalhadas":"01:07","horasDeslocamento":"00:00","kmDeslocado":"18"},{"id":"P30227","reportNum":"REL-30227","type":"preventivo","empresa":"DROGAMAXI DROGARIA EIRELI","patrimonio":"1170/340261V03639","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-13","horaEntrada":"13:46","horaSaida":"16:11","horasTrabalhadas":"02:25","horasDeslocamento":"00:00","kmDeslocado":"16"},{"id":"P30223","reportNum":"REL-30223","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1373/341930X03210","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-13","horaEntrada":"09:51","horaSaida":"14:57","horasTrabalhadas":"04:00","horasDeslocamento":"00:00","kmDeslocado":"000"},{"id":"P30220","reportNum":"REL-30220","type":"preventivo","empresa":"DROGAMAXI DROGARIA EIRELI","patrimonio":"1119/341834B00163","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-13","horaEntrada":"08:59","horaSaida":"13:45","horasTrabalhadas":"04:46","horasDeslocamento":"00:27","kmDeslocado":"6,85 km"},{"id":"P30212","reportNum":"REL-30212","type":"preventivo","empresa":"GLOBOPACK INSUSTRIA E COMERCIO DE EMBALAGENS LTDA","patrimonio":"1307/A252Y02013U","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"13:21","horaSaida":"16:32","horasTrabalhadas":"02:19","horasDeslocamento":"00:25","kmDeslocado":"5,35 km"},{"id":"P30211","reportNum":"REL-30211","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341033G01329/341033G01329","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"KMSX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"14:34","horaSaida":"16:53","horasTrabalhadas":"02:19","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30209","reportNum":"REL-30209","type":"preventivo","empresa":"XEQUE MATE BEBIDAS LTDA","patrimonio":"1491/A959Y03039V","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MS 1.6","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"14:59","horaSaida":"15:59","horasTrabalhadas":"01:00","horasDeslocamento":"00:45","kmDeslocado":"6,19 km"},{"id":"P30208","reportNum":"REL-30208","type":"preventivo","empresa":"XEQUE MATE BEBIDAS LTDA","patrimonio":"1477/A959Y02983V","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"13:56","horaSaida":"14:53","horasTrabalhadas":"00:57","horasDeslocamento":"00:05","kmDeslocado":"3,32 km"},{"id":"P30205","reportNum":"REL-30205","type":"preventivo","empresa":"DISTRIBUIDORA DE EMBALAGENS EMBALAPACK EIREL","patrimonio":"0881/340260E05497","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"08:26","horaSaida":"13:21","horasTrabalhadas":"04:55","horasDeslocamento":"01:08","kmDeslocado":"10,97 km"},{"id":"P30204","reportNum":"REL-30204","type":"preventivo","empresa":"ABB ELETRIFICACAO LTDA","patrimonio":"1098/340261J02386","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-12","horaEntrada":"11:18","horaSaida":"13:06","horasTrabalhadas":"01:48","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30196","reportNum":"REL-30196","type":"preventivo","empresa":"AGILE SOLUCOES EM EQUIPAMENTOS PARA MINERACAO EIRELI","patrimonio":"0776/341834C00949","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-11","horaEntrada":"12:06","horaSaida":"17:30","horasTrabalhadas":"05:24","horasDeslocamento":"02:54","kmDeslocado":"136,66 km"},{"id":"P30183","reportNum":"REL-30183","type":"preventivo","empresa":"CNR MATERIAIS DE CONSTRUCOES LTDA - Via Expressa","patrimonio":"0968/6A330759","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"14:48","horaSaida":"17:58","horasTrabalhadas":"03:10","horasDeslocamento":"00:01","kmDeslocado":"12,21 km"},{"id":"P30179","reportNum":"REL-30179","type":"preventivo","empresa":"CNR MATERIAIS DE CONSTRUCOES LTDA - Via Expressa","patrimonio":"0701/340260Z01701","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"16:23","horaSaida":"17:56","horasTrabalhadas":"01:33","horasDeslocamento":"00:00","kmDeslocado":"14"},{"id":"P30177","reportNum":"REL-30177","type":"preventivo","empresa":"CNR MATERIAIS DE CONSTRUCOES LTDA - Via Expressa","patrimonio":"1274/10205617","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"08:31","horaSaida":"14:28","horasTrabalhadas":"05:57","horasDeslocamento":"00:22","kmDeslocado":"12,38 km"},{"id":"P30175","reportNum":"REL-30175","type":"preventivo","empresa":"VIA MINAS TRANSPORTES E ENCOMENDAS LTDA","patrimonio":"1179/340261J02409","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"10:56","horaSaida":"13:30","horasTrabalhadas":"02:34","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30173","reportNum":"REL-30173","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1652/341930M05929","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"09:24","horaSaida":"12:29","horasTrabalhadas":"03:05","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P30170","reportNum":"REL-30170","type":"preventivo","empresa":"VIA MINAS TRANSPORTES E ENCOMENDAS LTDA","patrimonio":"0916/B4X091V00304","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"08:58","horaSaida":"10:55","horasTrabalhadas":"01:57","horasDeslocamento":"00:00","kmDeslocado":"16.6"},{"id":"P30169","reportNum":"REL-30169","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1674/20220704210","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-08","horaEntrada":"07:59","horaSaida":"09:32","horasTrabalhadas":"01:33","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30165","reportNum":"REL-30165","type":"preventivo","empresa":"ESTAMPARIA SA","patrimonio":"1173/340261V03642","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"16:15","horaSaida":"17:56","horasTrabalhadas":"01:41","horasDeslocamento":"00:23","kmDeslocado":"15,77 km"},{"id":"P30153","reportNum":"REL-30153","type":"preventivo","empresa":"CARLEZANI INDUSTRIA E COMERCIO LTDA - Fábrica","patrimonio":"1303/A252Y02017U","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"11:13","horaSaida":"11:27","horasTrabalhadas":"00:14","horasDeslocamento":"02:22","kmDeslocado":"130,36 km"},{"id":"P30151","reportNum":"REL-30151","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1759/340140N01940","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"10:29","horaSaida":"11:54","horasTrabalhadas":"01:25","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30146","reportNum":"REL-30146","type":"preventivo","empresa":"CARLEZANI INDUSTRIA E COMERCIO LTDA - Fábrica","patrimonio":"0700/340260Z01658","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"08:01","horaSaida":"10:34","horasTrabalhadas":"02:33","horasDeslocamento":"00:13","kmDeslocado":"130,36 km"},{"id":"P30145","reportNum":"REL-30145","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1678/20220704289","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"09:06","horaSaida":"10:29","horasTrabalhadas":"01:23","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30143","reportNum":"REL-30143","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1758/340140N01939","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-07","horaEntrada":"07:19","horaSaida":"08:48","horasTrabalhadas":"01:29","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30139","reportNum":"REL-30139","type":"preventivo","empresa":"CARLEZANI INDUSTRIA E COMERCIO LTDA - Fábrica","patrimonio":"1303/A252Y02017U","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"10:55","horaSaida":"16:03","horasTrabalhadas":"05:08","horasDeslocamento":"01:00","kmDeslocado":"130,36 km"},{"id":"P30135","reportNum":"REL-30135","type":"preventivo","empresa":"SUPERMERCADOS BH COMERCIO DE ALIMENTOS LTDA - LAFAIETE","patrimonio":"1314/A252Y02007U","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"13:45","horaSaida":"16:06","horasTrabalhadas":"02:21","horasDeslocamento":"00:01","kmDeslocado":"108,88 km"},{"id":"P30133","reportNum":"REL-30133","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1761/340140N01948","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"14:27","horaSaida":"15:32","horasTrabalhadas":"01:05","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30131","reportNum":"REL-30131","type":"preventivo","empresa":"DHF PRODUTOS ALIMENTICIOS LTDA - Pav. G","patrimonio":"0929/340260E06186","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"10:32","horaSaida":"13:32","horasTrabalhadas":"03:00","horasDeslocamento":"00:34","kmDeslocado":"10,97 km"},{"id":"P30130","reportNum":"REL-30130","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"SEM SERIE/SEM SERIE","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"KMSX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"08:54","horaSaida":"12:29","horasTrabalhadas":"03:35","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30129","reportNum":"REL-30129","type":"preventivo","empresa":"SUPERMERCADOS BH COMERCIO DE ALIMENTOS LTDA - LAFAIETE","patrimonio":"1315/A252Y02015U","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"10:32","horaSaida":"12:26","horasTrabalhadas":"01:54","horasDeslocamento":"00:00","kmDeslocado":"220"},{"id":"P30128","reportNum":"REL-30128","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1760/340140N01942","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"11:07","horaSaida":"12:15","horasTrabalhadas":"01:08","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30127","reportNum":"REL-30127","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"0455/341833B03706","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"09:50","horaSaida":"12:12","horasTrabalhadas":"02:22","horasDeslocamento":"00:00","kmDeslocado":"0000"},{"id":"P30142","reportNum":"REL-30142","type":"preventivo","empresa":"DHF PRODUTOS ALIMENTICIOS LTDA - Pav. 4","patrimonio":"0730/340260A02146","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-06","horaEntrada":"13:33","horaSaida":"17:59","horasTrabalhadas":"04:26","horasDeslocamento":"06:00","kmDeslocado":"9,09 km"},{"id":"P30123","reportNum":"REL-30123","type":"preventivo","empresa":"ESTAMPARIA SA","patrimonio":"0880/340260E05496","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"14:11","horaSaida":"18:02","horasTrabalhadas":"03:10","horasDeslocamento":"02:26","kmDeslocado":"31,36 km"},{"id":"P30118","reportNum":"REL-30118","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1678/20220704289","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"16:33","horaSaida":"16:56","horasTrabalhadas":"00:23","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30116","reportNum":"REL-30116","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1523/20220401136","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"15:09","horaSaida":"15:44","horasTrabalhadas":"00:35","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30115","reportNum":"REL-30115","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1555/20220401148","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"14:20","horaSaida":"14:55","horasTrabalhadas":"00:35","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30114","reportNum":"REL-30114","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1784/340140P02200","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"13:43","horaSaida":"14:25","horasTrabalhadas":"00:42","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30112","reportNum":"REL-30112","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1787/340140P02201","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"10:52","horaSaida":"13:39","horasTrabalhadas":"02:47","horasDeslocamento":"00:01","kmDeslocado":"11,89 km"},{"id":"P30110","reportNum":"REL-30110","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1551/20220401147","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"11:29","horaSaida":"12:25","horasTrabalhadas":"00:56","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30109","reportNum":"REL-30109","type":"preventivo","empresa":"GLOBAL HOSPITALAR IMPORTACAO E COMERCIO LTDA","patrimonio":"0680/341834C01750","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"08:57","horaSaida":"12:21","horasTrabalhadas":"03:24","horasDeslocamento":"00:34","kmDeslocado":"15,74 km"},{"id":"P30108","reportNum":"REL-30108","type":"preventivo","empresa":"ATLAS COPCO BRASIL LTDA","patrimonio":"0926/340260E06184","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"09:37","horaSaida":"11:39","horasTrabalhadas":"02:02","horasDeslocamento":"01:04","kmDeslocado":"6,74 km"},{"id":"P30106","reportNum":"REL-30106","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1559/20220401155","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"10:55","horaSaida":"11:29","horasTrabalhadas":"00:34","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30104","reportNum":"REL-30104","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1664/20220704294","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"09:58","horaSaida":"10:46","horasTrabalhadas":"00:48","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30103","reportNum":"REL-30103","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1790/340140P02202","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"09:31","horaSaida":"10:37","horasTrabalhadas":"01:06","horasDeslocamento":"00:28","kmDeslocado":"11,89 km"},{"id":"P30101","reportNum":"REL-30101","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1639/20220704208","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"09:21","horaSaida":"09:50","horasTrabalhadas":"00:29","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30099","reportNum":"REL-30099","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1514/20220401182","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"09:08","horaSaida":"09:14","horasTrabalhadas":"00:06","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30098","reportNum":"REL-30098","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1655/20220704290","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"08:21","horaSaida":"08:54","horasTrabalhadas":"00:33","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30097","reportNum":"REL-30097","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1543/20220401145","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-05","horaEntrada":"07:32","horaSaida":"07:59","horasTrabalhadas":"00:27","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30096","reportNum":"REL-30096","type":"preventivo","empresa":"AFP MATERIAIS PARA CONSTRUCAO LTDA","patrimonio":"0413/341832000521","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"11:33","horaSaida":"16:44","horasTrabalhadas":"05:11","horasDeslocamento":"03:04","kmDeslocado":"133,88 km"},{"id":"P30095","reportNum":"REL-30095","type":"preventivo","empresa":"ITAMBE ALIMENTOS S/A - Sete Lagoas","patrimonio":"1805/340140P02207","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"13:24","horaSaida":"16:45","horasTrabalhadas":"03:21","horasDeslocamento":"01:55","kmDeslocado":"65,30 km"},{"id":"P30092","reportNum":"REL-30092","type":"preventivo","empresa":"ARQUA INDUSTRIA BRASILEIRA DE MANGUEIRAS E TERMOPLASTICOS LTDA","patrimonio":"1360/341930X03235","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"15:28","horaSaida":"16:58","horasTrabalhadas":"01:30","horasDeslocamento":"00:56","kmDeslocado":"30,77 km"},{"id":"P30091","reportNum":"REL-30091","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1514/20220401182","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"15:47","horaSaida":"16:36","horasTrabalhadas":"00:49","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30090","reportNum":"REL-30090","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1670/20220704241","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"15:50","horaSaida":"16:36","horasTrabalhadas":"00:46","horasDeslocamento":"00:00","kmDeslocado":"00"},{"id":"P30089","reportNum":"REL-30089","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1636/20220704244","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"15:04","horaSaida":"15:48","horasTrabalhadas":"00:44","horasDeslocamento":"00:00","kmDeslocado":"000"},{"id":"P30088","reportNum":"REL-30088","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1535/20220401140","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"15:19","horaSaida":"15:40","horasTrabalhadas":"00:21","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30087","reportNum":"REL-30087","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1511/20220401176","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"14:41","horaSaida":"15:06","horasTrabalhadas":"00:25","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30086","reportNum":"REL-30086","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1531/20220401138","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"14:22","horaSaida":"15:02","horasTrabalhadas":"00:40","horasDeslocamento":"00:00","kmDeslocado":"000"},{"id":"P30085","reportNum":"REL-30085","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1547/20220401146","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"12:23","horaSaida":"14:31","horasTrabalhadas":"00:42","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30083","reportNum":"REL-30083","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1508/20220401173","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"12:25","horaSaida":"14:10","horasTrabalhadas":"00:41","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P30081","reportNum":"REL-30081","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1517/20220401183","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"LHE150","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"11:13","horaSaida":"12:24","horasTrabalhadas":"01:11","horasDeslocamento":"00:00","kmDeslocado":"121,23 km"},{"id":"P30080","reportNum":"REL-30080","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1642/20220704223","tecnico":"Marcus","region":"centroOeste","acao":"","pendencia":"","modelo":"TEE15","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-05-04","horaEntrada":"11:30","horaSaida":"12:11","horasTrabalhadas":"00:41","horasDeslocamento":"00:00","kmDeslocado":"00"},{"id":"P30074","reportNum":"REL-30074","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1790/340140P02202","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-30","horaEntrada":"16:40","horaSaida":"17:37","horasTrabalhadas":"00:57","horasDeslocamento":"01:03","kmDeslocado":"22,69 km"},{"id":"P30072","reportNum":"REL-30072","type":"preventivo","empresa":"AGUA DE COCO LTDA","patrimonio":"1082/A959Y01654R","tecnico":"Eduardo","region":"roca","acao":"","pendencia":"","modelo":"MS 1.6","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-30","horaEntrada":"16:28","horaSaida":"17:20","horasTrabalhadas":"00:52","horasDeslocamento":"00:00","kmDeslocado":"12"},{"id":"P30071","reportNum":"REL-30071","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1784/340140P02200","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-30","horaEntrada":"15:35","horaSaida":"16:37","horasTrabalhadas":"01:02","horasDeslocamento":"00:31","kmDeslocado":"11,89 km"},{"id":"P30061","reportNum":"REL-30061","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1787/340140P02201","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"15:18","horaSaida":"16:38","horasTrabalhadas":"01:20","horasDeslocamento":"00:33","kmDeslocado":"10,80 km"},{"id":"P30055","reportNum":"REL-30055","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1650/10507113","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"13:44","horaSaida":"15:02","horasTrabalhadas":"01:18","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30053","reportNum":"REL-30053","type":"preventivo","empresa":"KRUG BIER INDÚSTRIA LTDA","patrimonio":"1483/A959Y02986V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS 1.6","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"13:40","horaSaida":"14:42","horasTrabalhadas":"01:02","horasDeslocamento":"00:00","kmDeslocado":"66"},{"id":"P30048","reportNum":"REL-30048","type":"preventivo","empresa":"KRUG BIER INDÚSTRIA LTDA","patrimonio":"1395/A959Y02818V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"08:55","horaSaida":"11:55","horasTrabalhadas":"03:00","horasDeslocamento":"01:31","kmDeslocado":"61"},{"id":"P30047","reportNum":"REL-30047","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1500/A376Y02117V","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"MOV","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"08:45","horaSaida":"11:49","horasTrabalhadas":"03:04","horasDeslocamento":"00:16","kmDeslocado":"11,89 km"},{"id":"P30064","reportNum":"REL-30064","type":"preventivo","empresa":"KRUG BIER INDÚSTRIA LTDA","patrimonio":"0764/341834C00970","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-29","horaEntrada":"14:43","horaSaida":"17:02","horasTrabalhadas":"02:19","horasDeslocamento":"06:56","kmDeslocado":"66"},{"id":"P30041","reportNum":"REL-30041","type":"preventivo","empresa":"VIA MINAS TRANSPORTES E ENCOMENDAS LTDA","patrimonio":"1179/340261J02409","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"12:38","horaSaida":"18:09","horasTrabalhadas":"05:31","horasDeslocamento":"00:27","kmDeslocado":"7,08 km"},{"id":"P30040","reportNum":"REL-30040","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"0969/6A330871","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"15:24","horaSaida":"17:09","horasTrabalhadas":"01:45","horasDeslocamento":"00:43","kmDeslocado":"15,65 km"},{"id":"P30035","reportNum":"REL-30035","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"0963/6A330649","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"13:55","horaSaida":"15:23","horasTrabalhadas":"01:28","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30034","reportNum":"REL-30034","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1312/A252Y02008U","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"10:40","horaSaida":"15:08","horasTrabalhadas":"03:05","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P30031","reportNum":"REL-30031","type":"preventivo","empresa":"MVC TRANSPORTE E LOGISTICA S.A","patrimonio":"1075/A972Y01544R","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"08:59","horaSaida":"12:30","horasTrabalhadas":"03:31","horasDeslocamento":"00:40","kmDeslocado":"16,30 km"},{"id":"P30029","reportNum":"REL-30029","type":"preventivo","empresa":"GENOMA EMPREENDIMENTOS LTDA - Center LAB","patrimonio":"1171/340261V03641","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-28","horaEntrada":"10:58","horaSaida":"11:14","horasTrabalhadas":"00:16","horasDeslocamento":"01:17","kmDeslocado":"14,55 km"},{"id":"P30024","reportNum":"REL-30024","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1269/10188251","tecnico":"Anderson","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"16:37","horaSaida":"18:45","horasTrabalhadas":"02:08","horasDeslocamento":"00:00","kmDeslocado":"25"},{"id":"P30022","reportNum":"REL-30022","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1272/10205615","tecnico":"Helbert","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"15:25","horaSaida":"17:05","horasTrabalhadas":"01:40","horasDeslocamento":"00:37","kmDeslocado":"10,80 km"},{"id":"P30017","reportNum":"REL-30017","type":"preventivo","empresa":"NORMET DO BRASIL IMPORTACAO E COMERCIO DE MAQUINAS E EQUIPAMENTOS LTDA","patrimonio":"1102/340260D05261","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"14:00","horaSaida":"15:26","horasTrabalhadas":"01:26","horasDeslocamento":"00:33","kmDeslocado":"5,86 km"},{"id":"P30016","reportNum":"REL-30016","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1270/10205613","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"14:13","horaSaida":"15:23","horasTrabalhadas":"01:10","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30014","reportNum":"REL-30014","type":"preventivo","empresa":"TURQUEZA TECIDOS E VESTUARIOS S/A","patrimonio":"0874/340260D05187","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"11:01","horaSaida":"12:34","horasTrabalhadas":"01:33","horasDeslocamento":"00:00","kmDeslocado":"48"},{"id":"P30013","reportNum":"REL-30013","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1271/10205614","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"11:19","horaSaida":"12:46","horasTrabalhadas":"01:27","horasDeslocamento":"00:00","kmDeslocado":"24"},{"id":"P30011","reportNum":"REL-30011","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341076L00132/341076L00132","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"OPX25","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-27","horaEntrada":"09:06","horaSaida":"12:07","horasTrabalhadas":"03:01","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P30003","reportNum":"REL-30003","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1271/10205614","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"15:09","horaSaida":"17:41","horasTrabalhadas":"02:32","horasDeslocamento":"00:59","kmDeslocado":"22,69 km"},{"id":"P30002","reportNum":"REL-30002","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"0241098/0241098","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"TE18","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"15:09","horaSaida":"16:53","horasTrabalhadas":"01:44","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29999","reportNum":"REL-29999","type":"preventivo","empresa":"DROGAMAXI DROGARIA EIRELI","patrimonio":"1169/340261V03638","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"13:58","horaSaida":"14:18","horasTrabalhadas":"00:20","horasDeslocamento":"00:37","kmDeslocado":"6,85 km"},{"id":"P29998","reportNum":"REL-29998","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1373/341930X03210","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"10:27","horaSaida":"14:04","horasTrabalhadas":"03:37","horasDeslocamento":"00:00","kmDeslocado":"121,23 km"},{"id":"P29996","reportNum":"REL-29996","type":"preventivo","empresa":"GUTENBERG DISTRIBUIDORA DE LIVROS LTDA - Grupo Autêntica","patrimonio":"1086/340260000126","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"08:25","horaSaida":"13:19","horasTrabalhadas":"04:54","horasDeslocamento":"00:13","kmDeslocado":"15,06 km"},{"id":"P29994","reportNum":"REL-29994","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341076L00131/341076L00131","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"OPX25","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"08:32","horaSaida":"11:59","horasTrabalhadas":"03:27","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29993","reportNum":"REL-29993","type":"preventivo","empresa":"GLOBAL HOSPITALAR IMPORTACAO E COMERCIO LTDA","patrimonio":"0680/341834C01750","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-24","horaEntrada":"09:01","horaSaida":"10:55","horasTrabalhadas":"01:54","horasDeslocamento":"01:30","kmDeslocado":"32,22 km"},{"id":"P29989","reportNum":"REL-29989","type":"preventivo","empresa":"MKT BENEFICIADORA E IMPORTADORA LTDA - Frigo Muzzi/ Bem Fresco","patrimonio":"0233/340260000119","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-23","horaEntrada":"13:24","horaSaida":"17:13","horasTrabalhadas":"03:49","horasDeslocamento":"01:17","kmDeslocado":"76,23 km"},{"id":"P29984","reportNum":"REL-29984","type":"preventivo","empresa":"MKT BENEFICIADORA E IMPORTADORA LTDA - Frigo Muzzi/ Bem Fresco","patrimonio":"0679/341834C01749","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-23","horaEntrada":"09:12","horaSaida":"13:23","horasTrabalhadas":"04:11","horasDeslocamento":"00:46","kmDeslocado":"36,76 km"},{"id":"P29983","reportNum":"REL-29983","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341033C00594/341033C00594","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"KMSX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-23","horaEntrada":"08:52","horaSaida":"12:26","horasTrabalhadas":"03:34","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29982","reportNum":"REL-29982","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1081/A972Y01410R","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-23","horaEntrada":"09:10","horaSaida":"12:25","horasTrabalhadas":"03:15","horasDeslocamento":"00:16","kmDeslocado":"11,89 km"},{"id":"P29978","reportNum":"REL-29978","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"1397/A959Y02817V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-22","horaEntrada":"16:07","horaSaida":"17:20","horasTrabalhadas":"01:13","horasDeslocamento":"01:38","kmDeslocado":"15,13 km"},{"id":"P29977","reportNum":"REL-29977","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0745/341834C00776","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-22","horaEntrada":"16:02","horaSaida":"17:50","horasTrabalhadas":"01:48","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P29967","reportNum":"REL-29967","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1080/A972Y00002R","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MR 16/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-22","horaEntrada":"10:39","horaSaida":"13:17","horasTrabalhadas":"02:38","horasDeslocamento":"00:17","kmDeslocado":"11,89 km"},{"id":"P29964","reportNum":"REL-29964","type":"preventivo","empresa":"DHF PRODUTOS ALIMENTICIOS LTDA - Pav. G","patrimonio":"0929/340260E06186","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-22","horaEntrada":"10:02","horaSaida":"12:16","horasTrabalhadas":"02:14","horasDeslocamento":"00:15","kmDeslocado":"10,97 km"},{"id":"P29971","reportNum":"REL-29971","type":"preventivo","empresa":"GLOBOPACK INSUSTRIA E COMERCIO DE EMBALAGENS LTDA","patrimonio":"1307/A252Y02013U","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-21","horaEntrada":"13:11","horaSaida":"15:43","horasTrabalhadas":"02:03","horasDeslocamento":"08:53","kmDeslocado":"10,76 km"},{"id":"P29960","reportNum":"REL-29960","type":"preventivo","empresa":"GLOBOPACK INSUSTRIA E COMERCIO DE EMBALAGENS LTDA","patrimonio":"1307/A252Y02013U","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-20","horaEntrada":"16:42","horaSaida":"17:03","horasTrabalhadas":"00:21","horasDeslocamento":"00:00","kmDeslocado":"12"},{"id":"P29956","reportNum":"REL-29956","type":"preventivo","empresa":"DHF PRODUTOS ALIMENTICIOS LTDA - Pav. 4","patrimonio":"0730/340260A02146","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-20","horaEntrada":"10:25","horaSaida":"16:45","horasTrabalhadas":"06:20","horasDeslocamento":"00:16","kmDeslocado":"9,09 km"},{"id":"P29952","reportNum":"REL-29952","type":"preventivo","empresa":"DISTRIBUIDORA DE EMBALAGENS EMBALAPACK EIREL","patrimonio":"0881/340260E05497","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-20","horaEntrada":"08:42","horaSaida":"10:18","horasTrabalhadas":"01:36","horasDeslocamento":"00:11","kmDeslocado":"10,97 km"},{"id":"P29948","reportNum":"REL-29948","type":"preventivo","empresa":"MOSAIC FERTILIZANTES P&K LTDA - Araxá","patrimonio":"1377/341930X03211","tecnico":"Anderson","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-17","horaEntrada":"08:07","horaSaida":"14:41","horasTrabalhadas":"05:43","horasDeslocamento":"05:11","kmDeslocado":"369,24 km"},{"id":"P29945","reportNum":"REL-29945","type":"preventivo","empresa":"NAKAN IMPORT COMERCIO DE FERRAMENTAS LTDA","patrimonio":"0290/340137000214","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-17","horaEntrada":"15:35","horaSaida":"17:21","horasTrabalhadas":"01:46","horasDeslocamento":"00:22","kmDeslocado":"28"},{"id":"P29941","reportNum":"REL-29941","type":"preventivo","empresa":"ORGANIZACOES NUTRI DE REFEICOES COLETIVAS LTDA - Nutri Alibraz","patrimonio":"0731/340260101845","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-17","horaEntrada":"12:04","horaSaida":"14:53","horasTrabalhadas":"02:02","horasDeslocamento":"00:42","kmDeslocado":"23,18 km"},{"id":"P29937","reportNum":"REL-29937","type":"preventivo","empresa":"ORTHOCRIN INDUSTRIA E COMERCIO LTDA","patrimonio":"1313/A252Y02005U","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-17","horaEntrada":"08:28","horaSaida":"11:38","horasTrabalhadas":"03:10","horasDeslocamento":"01:31","kmDeslocado":"46,19 km"},{"id":"P29926","reportNum":"REL-29926","type":"preventivo","empresa":"SGS GEOSOL LABORATORIOS LTDA","patrimonio":"1689/340262M01769","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-16","horaEntrada":"14:55","horaSaida":"16:58","horasTrabalhadas":"02:03","horasDeslocamento":"01:44","kmDeslocado":"22,94 km"},{"id":"P29925","reportNum":"REL-29925","type":"preventivo","empresa":"HOCKET ECOMMERCE DE UTILIDADES LTDA","patrimonio":"1489/A959Y03038V","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-16","horaEntrada":"15:28","horaSaida":"16:50","horasTrabalhadas":"01:22","horasDeslocamento":"00:33","kmDeslocado":"14"},{"id":"P29921","reportNum":"REL-29921","type":"preventivo","empresa":"METALSIDER LTDA","patrimonio":"0522/341834C00675","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-16","horaEntrada":"12:06","horaSaida":"14:40","horasTrabalhadas":"01:46","horasDeslocamento":"00:14","kmDeslocado":"22"},{"id":"P29917","reportNum":"REL-29917","type":"preventivo","empresa":"MULTIFARMA COMERCIO E REPRESENTACOES LTDA.","patrimonio":"340260E05412/340260E05412","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-16","horaEntrada":"09:57","horaSaida":"11:41","horasTrabalhadas":"01:44","horasDeslocamento":"00:09","kmDeslocado":"32,68 km"},{"id":"P29915","reportNum":"REL-29915","type":"preventivo","empresa":"MULTIFARMA COMERCIO E REPRESENTACOES LTDA.","patrimonio":"340260D05695/340260D05695","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-16","horaEntrada":"08:07","horaSaida":"10:06","horasTrabalhadas":"01:59","horasDeslocamento":"00:23","kmDeslocado":"15,28 km"},{"id":"P29911","reportNum":"REL-29911","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"1651/341930M05928","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"15:00","horaSaida":"17:00","horasTrabalhadas":"02:00","horasDeslocamento":"00:00","kmDeslocado":"12,96 km"},{"id":"P29909","reportNum":"REL-29909","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - CD Pará de Minas","patrimonio":"1174/341930V01876","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"13:53","horaSaida":"17:17","horasTrabalhadas":"03:24","horasDeslocamento":"00:00","kmDeslocado":"20"},{"id":"P29908","reportNum":"REL-29908","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1784/340140P02200","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"15:23","horaSaida":"17:04","horasTrabalhadas":"01:41","horasDeslocamento":"00:37","kmDeslocado":"10,80 km"},{"id":"P29906","reportNum":"REL-29906","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341076L00133/341076L00133","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"OPX25","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"16:08","horaSaida":"16:48","horasTrabalhadas":"00:40","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29905","reportNum":"REL-29905","type":"preventivo","empresa":"INDALABOR INDAIA LABORATORIO FARMACEUTICO LTDA","patrimonio":"1479/A959Y02984V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"14:50","horaSaida":"16:45","horasTrabalhadas":"01:55","horasDeslocamento":"00:00","kmDeslocado":"30"},{"id":"P29903","reportNum":"REL-29903","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - Contagem","patrimonio":"1650/10507113","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"10:28","horaSaida":"15:22","horasTrabalhadas":"03:38","horasDeslocamento":"00:00","kmDeslocado":"24"},{"id":"P29901","reportNum":"REL-29901","type":"preventivo","empresa":"INDALABOR INDAIA LABORATORIO FARMACEUTICO LTDA","patrimonio":"1495/A959Y03041V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"11:29","horaSaida":"14:49","horasTrabalhadas":"03:20","horasDeslocamento":"00:28","kmDeslocado":"13,25 km"},{"id":"P29898","reportNum":"REL-29898","type":"preventivo","empresa":"ERBA DIAGNOSTICS BRAZIL PROD E DIST DE P","patrimonio":"1393/A959Y02815V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"09:44","horaSaida":"10:58","horasTrabalhadas":"01:14","horasDeslocamento":"00:31","kmDeslocado":"6,78 km"},{"id":"P29895","reportNum":"REL-29895","type":"preventivo","empresa":"INDALABOR INDAIA LABORATORIO FARMACEUTICO LTDA","patrimonio":"1479/A959Y02984V","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-15","horaEntrada":"09:01","horaSaida":"09:13","horasTrabalhadas":"00:12","horasDeslocamento":"01:30","kmDeslocado":"13,25 km"},{"id":"P29890","reportNum":"REL-29890","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1759/340140N01940","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-14","horaEntrada":"16:28","horaSaida":"17:29","horasTrabalhadas":"01:01","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P29887","reportNum":"REL-29887","type":"preventivo","empresa":"UNION MEDIC COMERCIO E REPRESENTACAO DE PRODUTOS PARA A SAUDE LTDA - Ruby Rose","patrimonio":"1487/A959Y03042V","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"MS16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-14","horaEntrada":"13:13","horaSaida":"16:32","horasTrabalhadas":"03:19","horasDeslocamento":"00:14","kmDeslocado":"11"},{"id":"P29886","reportNum":"REL-29886","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1758/340140N01939","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-14","horaEntrada":"14:58","horaSaida":"16:27","horasTrabalhadas":"01:29","horasDeslocamento":"00:01","kmDeslocado":"121,23 km"},{"id":"P29880","reportNum":"REL-29880","type":"preventivo","empresa":"SUPERMERCADOS BH COMERCIO DE ALIMENTOS LTDA - LAFAIETE","patrimonio":"1315/A252Y02015U","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-14","horaEntrada":"10:21","horaSaida":"12:18","horasTrabalhadas":"01:57","horasDeslocamento":"00:00","kmDeslocado":"220"},{"id":"P29877","reportNum":"REL-29877","type":"preventivo","empresa":"DENTAL SORRIA LTDA","patrimonio":"0210/340260000905","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-14","horaEntrada":"08:54","horaSaida":"11:05","horasTrabalhadas":"02:11","horasDeslocamento":"00:56","kmDeslocado":"24,71 km"},{"id":"P29870","reportNum":"REL-29870","type":"preventivo","empresa":"AGILE SOLUCOES EM EQUIPAMENTOS PARA MINERACAO EIRELI","patrimonio":"0776/341834C00949","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-13","horaEntrada":"10:29","horaSaida":"14:53","horasTrabalhadas":"04:24","horasDeslocamento":"03:31","kmDeslocado":"136,66 km"},{"id":"P29864","reportNum":"REL-29864","type":"preventivo","empresa":"ABB ELETRIFICACAO LTDA","patrimonio":"1098/340261J02386","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-13","horaEntrada":"13:46","horaSaida":"15:25","horasTrabalhadas":"01:39","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29860","reportNum":"REL-29860","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341033G01328/341033G01328","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"KMSX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-13","horaEntrada":"09:08","horaSaida":"12:22","horasTrabalhadas":"03:14","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29856","reportNum":"REL-29856","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0005/341832000156","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-12","horaEntrada":"14:42","horaSaida":"17:20","horasTrabalhadas":"02:38","horasDeslocamento":"06:39","kmDeslocado":"21,74 km"},{"id":"P29851","reportNum":"REL-29851","type":"preventivo","empresa":"SGS GEOSOL LABORATORIOS LTDA","patrimonio":"1689/340262M01769","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-10","horaEntrada":"16:14","horaSaida":"17:35","horasTrabalhadas":"01:21","horasDeslocamento":"00:13","kmDeslocado":"44,47 km"},{"id":"P29844","reportNum":"REL-29844","type":"preventivo","empresa":"DISTRIBUIDORA DE EMBALAGENS EMBALAPACK EIREL","patrimonio":"0881/340260E05497","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-10","horaEntrada":"10:39","horaSaida":"12:38","horasTrabalhadas":"01:59","horasDeslocamento":"01:12","kmDeslocado":"20,06 km"},{"id":"P29859","reportNum":"REL-29859","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"1651/341930M05928","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-10","horaEntrada":"11:44","horaSaida":"14:47","horasTrabalhadas":"03:03","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P29841","reportNum":"REL-29841","type":"preventivo","empresa":"AP BETIM COMPERCIO DE PEÇAS AUTOMOTIVAS LTDA - Minas Textil","patrimonio":"0729/340260A02103","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"14:34","horaSaida":"17:30","horasTrabalhadas":"02:56","horasDeslocamento":"00:06","kmDeslocado":"21,25 km"},{"id":"P29910","reportNum":"REL-29910","type":"preventivo","empresa":"CARLEZANI INDUSTRIA E COMERCIO LTDA - Fábrica","patrimonio":"1303/A252Y02017U","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"MP20 - BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"17:50","horaSaida":"17:57","horasTrabalhadas":"00:07","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P29848","reportNum":"REL-29848","type":"preventivo","empresa":"EMPRESA DE TRANSPORTES APOTEOSE LTDA - EMTEL","patrimonio":"0005/341832000156","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"14:42","horaSaida":"17:20","horasTrabalhadas":"02:38","horasDeslocamento":"06:39","kmDeslocado":"21,74 km"},{"id":"P29832","reportNum":"REL-29832","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"0455/341833B03706","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"13:53","horaSaida":"15:44","horasTrabalhadas":"01:51","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P29830","reportNum":"REL-29830","type":"preventivo","empresa":"RITZ FERRAMENTAS LTDA","patrimonio":"0861/348098D00192","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"R06-06 BR","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"12:56","horaSaida":"14:27","horasTrabalhadas":"01:31","horasDeslocamento":"00:00","kmDeslocado":"30"},{"id":"P29817","reportNum":"REL-29817","type":"preventivo","empresa":"ADLER PTI S.A.","patrimonio":"0744/340260000283","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-09","horaEntrada":"09:01","horaSaida":"09:50","horasTrabalhadas":"00:49","horasDeslocamento":"00:53","kmDeslocado":"36"},{"id":"P29815","reportNum":"REL-29815","type":"preventivo","empresa":"AP BETIM COMPERCIO DE PEÇAS AUTOMOTIVAS LTDA - Minas Textil","patrimonio":"0729/340260A02103","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"16:45","horaSaida":"17:30","horasTrabalhadas":"00:45","horasDeslocamento":"00:39","kmDeslocado":"21,25 km"},{"id":"P29812","reportNum":"REL-29812","type":"preventivo","empresa":"ITAMBE ALIMENTOS S A - CD Pará de Minas","patrimonio":"1178/341930V01880","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"13:34","horaSaida":"16:38","horasTrabalhadas":"03:04","horasDeslocamento":"00:00","kmDeslocado":"00"},{"id":"P29833","reportNum":"REL-29833","type":"preventivo","empresa":"CARLEZANI INDUSTRIA E COMERCIO LTDA - Fábrica","patrimonio":"0700/340260Z01658","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"14:47","horaSaida":"16:18","horasTrabalhadas":"01:31","horasDeslocamento":"00:00","kmDeslocado":"26"},{"id":"P29810","reportNum":"REL-29810","type":"preventivo","empresa":"ADLER PTI S.A.","patrimonio":"0744/340260000283","tecnico":"Denison","region":"metropolitana","acao":"","pendencia":"","modelo":"EGV 14/16","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"09:12","horaSaida":"15:53","horasTrabalhadas":"06:41","horasDeslocamento":"00:17","kmDeslocado":"36"},{"id":"P29809","reportNum":"REL-29809","type":"preventivo","empresa":"AFP MATERIAIS PARA CONSTRUCAO LTDA","patrimonio":"0413/341832000521","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"10:38","horaSaida":"12:51","horasTrabalhadas":"02:13","horasDeslocamento":"00:00","kmDeslocado":"136"},{"id":"P29807","reportNum":"REL-29807","type":"preventivo","empresa":"ROCA SANITARIOS BRASIL LTDA","patrimonio":"341033G01329/341033G01329","tecnico":"Luiz Ribeiro","region":"roca","acao":"","pendencia":"","modelo":"KMSX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-08","horaEntrada":"07:56","horaSaida":"12:42","horasTrabalhadas":"04:46","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29798","reportNum":"REL-29798","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"1364/341930X03239","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"FMX NG 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-07","horaEntrada":"15:29","horaSaida":"17:13","horasTrabalhadas":"01:44","horasDeslocamento":"00:53","kmDeslocado":"7,32 km"},{"id":"P29795","reportNum":"REL-29795","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1760/340140N01942","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-07","horaEntrada":"14:15","horaSaida":"16:08","horasTrabalhadas":"01:53","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P29793","reportNum":"REL-29793","type":"preventivo","empresa":"DVL - DISTRIBUIDORA VIA LACTEA LTDA - Contagem","patrimonio":"0966/6A330757","tecnico":"Luiz Guilherme","region":"metropolitana","acao":"","pendencia":"","modelo":"PE4500","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-07","horaEntrada":"09:30","horaSaida":"15:17","horasTrabalhadas":"05:04","horasDeslocamento":"00:49","kmDeslocado":"7,81 km"},{"id":"P29788","reportNum":"REL-29788","type":"preventivo","empresa":"FARMAX S.A.","patrimonio":"1761/340140N01948","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-07","horaEntrada":"10:34","horaSaida":"12:09","horasTrabalhadas":"01:35","horasDeslocamento":"00:00","kmDeslocado":"120"},{"id":"P29784","reportNum":"REL-29784","type":"preventivo","empresa":"ITAMBE ALIMENTOS S/A - Sete Lagoas","patrimonio":"0449/340137B01113","tecnico":"Rafael","region":"metropolitana","acao":"","pendencia":"","modelo":"ERX 27","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-07","horaEntrada":"16:09","horaSaida":"17:51","horasTrabalhadas":"01:42","horasDeslocamento":"00:00","kmDeslocado":"0"},{"id":"P29775","reportNum":"REL-29775","type":"preventivo","empresa":"INDUSTRIA MINEIRA DE RAÇÕES LTDA - Vitaminas","patrimonio":"1861/B4X095V00132","tecnico":"Bruno","region":"centroOeste","acao":"","pendencia":"","modelo":"FME 17/20","sla":null,"urgent":false,"status":"concluído","execRelatorio":"","requisicaoPeca":"","ruptura":false,"chegadaPeca":"","date":"2026-04-06","horaEntrada":"13:22","horaSaida":"15:37","horasTrabalhadas":"02:15","horasDeslocamento":"00:00","kmDeslocado":"300"}]
;


// Escala diária de exemplo
const buildSampleSchedule = () => {
  const s = {};
  ALL_TECHS.forEach(tech => {
    s[`${tech}__${TODAY_STR}`] = [
      { client: "Cliente A", patrimonio: "PAT-001", type: "preventivo" },
      { client: "Cliente B", patrimonio: "PAT-002", type: "preventivo" },
      { client: "Cliente C", patrimonio: "PAT-003", type: "corretivo" },
    ];
  });
  return s;
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
const statusCfg = {
  "aberto":       { color:"#C62828", bg:"#FFF0F0", label:"Aberto" },
  "em andamento": { color:"#E67E00", bg:"#FFF8F0", label:"Em Andamento" },
  "acompanhar":   { color:"#1565C0", bg:"#F0F4FF", label:"Acompanhar" },
  "concluído":    { color:"#1A7A3C", bg:"#F0FFF5", label:"Concluído" },
};
const slaStatus = (item) => {
  if (!item.urgent || !item.sla) return null;
  // simula tempo decorrido
  return { pct: 60, remaining: Math.round(item.sla * 0.4), color: "#E67E00" };
};

// ── COMPONENTES PEQUENOS ────────────────────────────────────────────────────
const Tag = ({ children, color, bg, border }) => (
  <span style={{ display:"inline-block", fontSize:10, fontWeight:700, letterSpacing:.6, padding:"3px 8px", borderRadius:5, color, background:bg, border:`1px solid ${border||bg}` }}>{children}</span>
);
const Input = ({ label, value, onChange, placeholder, style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:4, ...style }}>
    {label && <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1 }}>{label}</div>}
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""} />
  </div>
);
const Sel = ({ label, value, onChange, options, style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:4, ...style }}>
    {label && <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1 }}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)}>
      {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  </div>
);

// ── MODAL DE RELATÓRIO ──────────────────────────────────────────────────────
function ReportModal({ onClose, onSave, initialType }) {
  const [step, setStep] = useState("input"); // input | result
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    reportNum:"", type: initialType||"corretivo", empresa:"", patrimonio:"",
    tecnico: ALL_TECHS[0], region:"metropolitana", acao:"", sla:8, urgent:false,
    status:"aberto", execRelatorio:"", requisicaoPeca:"", ruptura:false, chegadaPeca:"", date: TODAY_STR,
    horaEntrada:"", horaSaida:"", horasTrabalhadas:"", horasDeslocamento:"", horasTotais:"",
  });

  const calcHoras = (entrada, saida, deslocamento) => {
    if (!entrada || !saida) return "";
    const [eh,em] = entrada.split(":").map(Number);
    const [sh,sm] = saida.split(":").map(Number);
    const totalMin = (sh*60+sm) - (eh*60+em);
    if (totalMin <= 0) return "";
    const descMin = parseFloat(deslocamento||0) * 60;
    const trabMin = totalMin - descMin;
    const fmtH = m => `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`;
    return fmtH(Math.max(trabMin,0));
  };

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const analyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`Analise o relatório técnico abaixo e retorne SOMENTE um JSON válido (sem markdown) com:
{
  "reportNum": "número do relatório encontrado no texto ou vazio",
  "empresa": "nome da empresa/cliente",
  "patrimonio": "número de patrimônio ou código do equipamento",
  "tecnico": "nome do técnico mencionado ou vazio",
  "acao": "ação principal que deve ser realizada",
  "tipo": "preventivo | corretivo | a_faturar | mau_uso | entrega_tecnica | bateria | carregador",
  "urgente": true ou false,
  "pecas": ["peça 1","peça 2"],
  "horaEntrada": "HH:MM ou vazio",
  "horaSaida": "HH:MM ou vazio",
  "horasDeslocamento": "número decimal de horas de deslocamento ou 0"
}
Relatório:\n${text}` }]
        })
      });
      const data = await res.json();
      const txt = data.content.map(i=>i.text||"").join("");
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      setAiData(parsed);
      setForm(p=>({...p,
        reportNum: parsed.reportNum||p.reportNum,
        empresa: parsed.empresa||p.empresa,
        patrimonio: parsed.patrimonio||p.patrimonio,
        tecnico: ALL_TECHS.includes(parsed.tecnico) ? parsed.tecnico : p.tecnico,
        acao: parsed.acao||p.acao,
        type: ["preventivo","corretivo","a_faturar","mau_uso","entrega_tecnica","bateria","carregador"].includes(parsed.tipo) ? parsed.tipo : p.type,
        urgent: parsed.urgente||false,
        horaEntrada: parsed.horaEntrada||p.horaEntrada,
        horaSaida: parsed.horaSaida||p.horaSaida,
        horasDeslocamento: String(parsed.horasDeslocamento||p.horasDeslocamento||""),
        horasTrabalhadas: calcHoras(parsed.horaEntrada||"", parsed.horaSaida||"", parsed.horasDeslocamento||0),
        horasTotais: (() => {
          const e=parsed.horaEntrada||"", s=parsed.horaSaida||"";
          if(!e||!s) return "";
          const [eh,em]=e.split(":").map(Number), [sh,sm]=s.split(":").map(Number);
          const tot=(sh*60+sm)-(eh*60+em);
          return tot>0?`${Math.floor(tot/60)}h${String(tot%60).padStart(2,"0")}`:"";
        })(),
      }));
      setStep("result");
    } catch { setErr("Não foi possível analisar. Preencha os campos manualmente."); setStep("result"); }
    setAnalyzing(false);
  };

  const save = () => {
    onSave({ ...form, id: `${form.type[0].toUpperCase()}${Date.now()}` });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#FFF", borderRadius:16, width:720, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:"#1A1A1A", padding:"18px 24px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#F5C800" }}>
              ➕ Novo Relatório
            </div>
            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>Preventivo · Corretivo · A Faturar · Mau Uso · Entrega Técnica</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ padding:24 }}>
          {/* Texto do relatório */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Texto do Relatório (opcional — IA preenche os campos)</div>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={5}
              placeholder="Cole o texto do relatório aqui. A IA extrai número, empresa, patrimônio, técnico e ação automaticamente..."
              style={{ width:"100%", resize:"none" }} />
            <div style={{ display:"flex", gap:10, marginTop:10 }}>
              <button className="btn btn-primary" onClick={analyze} disabled={analyzing||!text.trim()} style={{ opacity:analyzing||!text.trim()?0.4:1 }}>
                {analyzing ? "⏳ Analisando..." : "🤖 Analisar com IA"}
              </button>
              {step==="result" && <Tag color="#1A7A3C" bg="#F0FFF5">✓ IA preencheu os campos abaixo</Tag>}
            </div>
            {err && <div style={{ fontSize:12, color:"#C62828", marginTop:8 }}>{err}</div>}
          </div>

          <div style={{ borderTop:"1px solid #F0F0F0", paddingTop:20, display:"flex", flexDirection:"column", gap:16 }}>
            {/* Linha 1 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Input label="Nº Relatório" value={form.reportNum} onChange={v=>upd("reportNum",v)} placeholder="REL-2026-001" />
              <Input label="Empresa / Cliente" value={form.empresa} onChange={v=>upd("empresa",v)} placeholder="Nome da empresa" />
              <Input label="Patrimônio" value={form.patrimonio} onChange={v=>upd("patrimonio",v)} placeholder="PAT-000" />
            </div>
            {/* Linha 2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Sel label="Tipo" value={form.type} onChange={v=>upd("type",v)}
                options={TIPOS.map(t=>({v:t.v,l:t.l}))} />
              <Sel label="Técnico Responsável" value={form.tecnico} onChange={v=>upd("tecnico",v)}
                options={ALL_TECHS} />
              <Sel label="Região" value={form.region} onChange={v=>upd("region",v)}
                options={[{v:"metropolitana",l:"Metropolitana BH"},{v:"roca",l:"Roca"},{v:"centroOeste",l:"Centro-Oeste"}]} />
            </div>
            {/* Ação */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Ação a ser realizada</div>
              <textarea value={form.acao} onChange={e=>upd("acao",e.target.value)} rows={3}
                placeholder="Descreva a ação que deve ser executada..." style={{ width:"100%", resize:"none" }} />
            </div>
            {/* SLA / Urgente */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, alignItems:"end" }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>🚨 Urgente (SLA)</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <input type="checkbox" checked={form.urgent} onChange={e=>upd("urgent",e.target.checked)} style={{ width:18, height:18, cursor:"pointer" }} />
                  <span style={{ fontSize:13, color: form.urgent?"#C62828":"#888", fontWeight: form.urgent?700:400 }}>{form.urgent?"SIM — definir horas":"Não urgente"}</span>
                </div>
              </div>
              {form.urgent && (
                <Sel label="SLA (horas)" value={form.sla} onChange={v=>upd("sla",Number(v))}
                  options={SLA_OPTIONS.map(h=>({v:h,l:`${h}h`}))} />
              )}
              <Sel label="Status" value={form.status} onChange={v=>upd("status",v)}
                options={[{v:"aberto",l:"Aberto"},{v:"em andamento",l:"Em Andamento"},{v:"acompanhar",l:"Acompanhar"},{v:"concluído",l:"Concluído"}]} />
            </div>
            {/* Execução */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Nº Relatório de Execução" value={form.execRelatorio} onChange={v=>upd("execRelatorio",v)} placeholder="EXE-001" />
              <Input label="Data do Atendimento" value={form.date} onChange={v=>upd("date",v)} placeholder="YYYY-MM-DD" />
            </div>
            {/* Horas */}
            <div style={{ background:"#FFFBF0", border:"1px solid #FFE8A0", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#C47D00", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>⏱ Horas do Atendimento</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:12, alignItems:"end" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Entrada</div>
                  <input type="text" value={form.horaEntrada} placeholder="08:00"
                    onChange={e=>{ upd("horaEntrada",e.target.value); upd("horasTrabalhadas", calcHoras(e.target.value, form.horaSaida, form.horasDeslocamento)); }} />
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Saída</div>
                  <input type="text" value={form.horaSaida} placeholder="17:30"
                    onChange={e=>{ upd("horaSaida",e.target.value); upd("horasTrabalhadas", calcHoras(form.horaEntrada, e.target.value, form.horasDeslocamento)); }} />
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Deslocamento (h)</div>
                  <input type="text" value={form.horasDeslocamento} placeholder="Ex: 1.5"
                    onChange={e=>{ upd("horasDeslocamento",e.target.value); upd("horasTrabalhadas", calcHoras(form.horaEntrada, form.horaSaida, e.target.value)); }} />
                </div>
                <div style={{ background:"#FFF", borderRadius:8, border:"1px solid #FFE8A0", padding:"9px 12px" }}>
                  <div style={{ fontSize:10, color:"#C47D00", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Trabalhadas</div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1A" }}>{form.horasTrabalhadas||"—"}</div>
                </div>
                <div style={{ background:"#FFF", borderRadius:8, border:"1px solid #E0E0E0", padding:"9px 12px" }}>
                  <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Total (c/ desloc.)</div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#555" }}>{form.horasTotais||"—"}</div>
                </div>
              </div>
            </div>

            {/* Peças */}
            <div style={{ background:"#FAFAFA", border:"1px solid #F0F0F0", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>📦 Gestão de Peças</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, alignItems:"end" }}>
                <Input label="Nº Requisição de Peça" value={form.requisicaoPeca} onChange={v=>upd("requisicaoPeca",v)} placeholder="REQ-000" />
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Ruptura de Estoque</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input type="checkbox" checked={form.ruptura} onChange={e=>upd("ruptura",e.target.checked)} style={{ width:18, height:18, cursor:"pointer" }} />
                    <span style={{ fontSize:13, color: form.ruptura?"#C62828":"#888", fontWeight: form.ruptura?700:400 }}>{form.ruptura?"EM RUPTURA":"Disponível"}</span>
                  </div>
                </div>
                {form.ruptura && <Input label="Previsão de Chegada" value={form.chegadaPeca} onChange={v=>upd("chegadaPeca",v)} placeholder="DD/MM/AAAA" />}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:12, marginTop:24, justifyContent:"flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.reportNum||!form.empresa}>
              Salvar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL ESCALA DIÁRIA ─────────────────────────────────────────────────────
function ScheduleModal({ tech, date, slots, onClose, onSave }) {
  const [items, setItems] = useState(slots || []);
  const addItem = () => setItems(p=>[...p, { client:"", patrimonio:"", type:"preventivo" }]);
  const updItem = (i,k,v) => setItems(p=>p.map((it,idx)=>idx===i?{...it,[k]:v}:it));
  const removeItem = i => setItems(p=>p.filter((_,idx)=>idx!==i));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#FFF", borderRadius:16, width:600, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ background:"#1A1A1A", padding:"16px 22px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#F5C800" }}>📅 Escala — {tech}</div>
            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{date} · {items.length} atendimento(s)</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:22 }}>
          {items.map((it,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px 32px", gap:10, alignItems:"end", marginBottom:12 }}>
              <Input label={i===0?"Cliente":""}  value={it.client} onChange={v=>updItem(i,"client",v)} placeholder="Nome do cliente" />
              <Input label={i===0?"Patrimônio":""} value={it.patrimonio} onChange={v=>updItem(i,"patrimonio",v)} placeholder="PAT-000" />
              <Sel label={i===0?"Tipo":""} value={it.type} onChange={v=>updItem(i,"type",v)}
                options={[{v:"preventivo",l:"Prev."},{v:"corretivo",l:"Corret."}]} />
              <button onClick={()=>removeItem(i)} style={{ background:"#FFF0F0", border:"1px solid #FFD0D0", borderRadius:7, color:"#C62828", cursor:"pointer", fontWeight:700, fontSize:16, height:36, marginTop: i===0?18:0 }}>✕</button>
            </div>
          ))}
          <button onClick={addItem} className="btn btn-ghost" style={{ width:"100%", marginTop:4, borderStyle:"dashed" }}>+ Adicionar atendimento</button>
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:20 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={()=>{ onSave(items); onClose(); }}>Salvar Escala</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Config status agenda
const AGENDA_STATUS = {
  "agendada":        { color:"#1565C0", bg:"#F0F4FF", dot:"#1565C0",  label:"Agendada" },
  "confirmada":      { color:"#1A7A3C", bg:"#F0FFF5", dot:"#1A7A3C",  label:"Confirmada" },
  "concluida":       { color:"#00838F", bg:"#F0FAFA", dot:"#00838F",  label:"Concluída" },
  "cancelada":       { color:"#C62828", bg:"#FFF0F0", dot:"#C62828",  label:"Cancelada" },
  "remarcada":       { color:"#E67E00", bg:"#FFF8F0", dot:"#E67E00",  label:"Remarcada" },
  "nao_atende":      { color:"#6A1B9A", bg:"#F8F0FF", dot:"#6A1B9A",  label:"Cliente não atende" },
};

const AGENDA_REGIONS = {
  metropolitana: { label:"Metropolitana BH", techs: METRO_PREVENTIVO },
  centroOeste:   { label:"Centro-Oeste",     techs: ["Bruno","Marcus"] },
};

// Gera dias do mês
const getDaysInMonth = (year, month) => new Date(year, month+1, 0).getDate();
const getDayOfWeek  = (year, month, day) => new Date(year, month, day).getDay();

// Config status requisição
const reqStatusCfg = {
  "reservada": { color:"#1565C0", bg:"#F0F4FF", label:"🔒 Reservada" },
  "entregue":  { color:"#1A7A3C", bg:"#F0FFF5", label:"✅ Entregue" },
  "ruptura":   { color:"#C62828", bg:"#FFF0F0", label:"🚨 Ruptura" },
};

const SAMPLE_REQS = [
  { id:"REQ001", numRequisicao:"REQ-2026-001", nomePeca:"Capacitor 40µF",   codigoPeca:"CAP-40UF", numRelatorio:"REL-2026-010", patrimonio:"PAT-880", tecnico:"Arthur",  status:"reservada", dataRequisicao:TODAY_STR, tecnicoEntrega:"", dataEntrega:"", entregoPor:"", previsaoChegada:"" },
  { id:"REQ002", numRequisicao:"REQ-2026-002", nomePeca:"Rolamento 6205",   codigoPeca:"ROL-6205", numRelatorio:"REL-2026-002", patrimonio:"PAT-112", tecnico:"Helbert", status:"ruptura",   dataRequisicao:TODAY_STR, tecnicoEntrega:"", dataEntrega:"", entregoPor:"", previsaoChegada:"" },
];

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [reports, setReports] = useState(REAL_REPORTS);
  const [requisicoes, setRequisicoes] = useState(SAMPLE_REQS);
  const [reqModal, setReqModal] = useState(false);
  const [novaReq, setNovaReq] = useState({ numRequisicao:"", nomePeca:"", codigoPeca:"", numRelatorio:"", patrimonio:"", tecnico:"", dataRequisicao:TODAY_STR, status:"reservada", tecnicoEntrega:"", dataEntrega:"", entregoPor:"", previsaoChegada:"" });
  const [schedule, setSchedule] = useState(buildSampleSchedule());
  const [modal, setModal] = useState(null);
  const [schedModal, setSchedModal] = useState(null);
  const [notification, setNotification] = useState("");
  const [filterTech, setFilterTech] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterRegion, setFilterRegion] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [schedDate, setSchedDate] = useState(TODAY_STR);
  const [schedRegion, setSchedRegion] = useState("metropolitana");
  const [schedType, setSchedType] = useState("preventivo");

  // Agenda
  const [agendaRegion, setAgendaRegion] = useState("metropolitana");
  const [agendaTech, setAgendaTech] = useState(METRO_PREVENTIVO[0]);
  const [agendaMonth, setAgendaMonth] = useState(TODAY.getMonth());
  const [agendaYear, setAgendaYear] = useState(TODAY.getFullYear());

  // Dashboard visual
  const [dashDate, setDashDate] = useState(TODAY_STR);
  const [dashRegion, setDashRegion] = useState("metropolitana");
  const [agendaItems, setAgendaItems] = useState({}); // key: "tech__YYYY-MM-DD__idx"
  const [agendaModal, setAgendaModal] = useState(null); // { tech, date, idx } | null
  const [agendaForm, setAgendaForm] = useState({ empresa:"", patrimônios:["","",""], status:"agendada", contato:"", obs:"" });

  const updAgenda = (key, data) => setAgendaItems(p=>({...p,[key]:data}));
  const delAgenda = (key) => setAgendaItems(p=>{ const n={...p}; delete n[key]; return n; });

  const openAgendaModal = (tech, date, idx, existing) => {
    setAgendaModal({tech, date, idx});
    setAgendaForm(existing || { empresa:"", patrimônios:["","",""], status:"agendada", contato:"", obs:"" });
  };

  const notify = msg => { setNotification(msg); setTimeout(()=>setNotification(""),3000); };

  const updateReq = (id, changes) => {
    setRequisicoes(p=>p.map(r=>r.id===id?{...r,...changes}:r));
    notify("Requisição atualizada!");
  };

  const saveReport = (data) => {
    const key = `${data.tecnico}__${data.date}`;
    setSchedule(prev => {
      const slots = prev[key] || [];
      const already = slots.some(s => s.client === data.empresa && s.patrimonio === data.patrimonio);
      if (!already) return { ...prev, [key]: [...slots, { client: data.empresa, patrimonio: data.patrimonio, type: data.type, reportNum: data.reportNum, status:"atendido" }] };
      return prev;
    });
    setReports(p=>[{ ...data, id:`R${Date.now()}` }, ...p]);
    notify("✅ Relatório salvo e escala atualizada!");
  };

  const updateItem = (id, changes) => {
    setReports(p=>p.map(i=>i.id===id?{...i,...changes}:i));
    notify("Atualizado!");
  };

  const items = reports.filter(d => {
    if (filterTipo !== "todos" && d.type !== filterTipo) return false;
    if (filterTech !== "todos" && d.tecnico !== filterTech) return false;
    if (filterStatus !== "todos" && d.status !== filterStatus) return false;
    if (filterRegion !== "todas" && d.region !== filterRegion) return false;
    return true;
  });

  const rupturasAtivas = requisicoes.filter(i=>i.status==="ruptura");

  const techsForRegion = schedRegion === "metropolitana"
    ? (schedType === "preventivo" ? METRO_PREVENTIVO : METRO_CORRETIVO)
    : (REGIONS[schedRegion]?.techs || []);

  return (
    <div style={{ minHeight:"100vh", background:"#F2F2F2", color:"#1A1A1A", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea{resize:none;}
        ::-webkit-scrollbar{width:5px;height:5px;} ::-webkit-scrollbar-thumb{background:#CCC;border-radius:3px;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{transform:translateY(-12px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .card{background:#FFF;border:1px solid #E2E2E2;border-radius:12px;}
        .btn{cursor:pointer;border:none;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;transition:all .15s;}
        .btn-primary{background:#F5C800;color:#1A1A1A;padding:9px 20px;}
        .btn-primary:hover{background:#E6B800;}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed;}
        .btn-ghost{background:transparent;color:#666;padding:8px 16px;border:1px solid #E0E0E0;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;transition:all .15s;}
        .btn-ghost:hover{background:#F5F5F5;border-color:#BDBDBD;}
        .nav-tab{cursor:pointer;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;border:none;background:transparent;color:#AAA;font-family:inherit;transition:all .15s;white-space:nowrap;}
        .nav-tab.active{background:#F5C800;color:#1A1A1A;}
        .nav-tab:hover:not(.active){color:#FFF;background:#333;}
        .sub-tab{cursor:pointer;padding:7px 16px;border-radius:7px;font-size:12px;font-weight:600;border:1.5px solid #E0E0E0;background:#FFF;color:#888;transition:all .15s;font-family:inherit;}
        .sub-tab.active{background:#1A1A1A;color:#F5C800;border-color:#1A1A1A;}
        select{background:#FFF;color:#1A1A1A;border:1px solid #E0E0E0;border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12px;cursor:pointer;outline:none;}
        select:focus{border-color:#F5C800;}
        input[type=text],textarea{background:#FFF;color:#1A1A1A;border:1px solid #E0E0E0;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:13px;outline:none;transition:border-color .15s;}
        input[type=text]:focus,textarea:focus{border-color:#F5C800;box-shadow:0 0 0 3px rgba(245,200,0,.15);}
        .notif{position:fixed;top:16px;right:16px;background:#1A1A1A;color:#F5C800;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:700;z-index:999;animation:slideDown .25s ease;box-shadow:0 4px 20px rgba(0,0,0,.2);}
        .row-hover:hover{background:#FAFAFA;}
        .tbl-wrap{overflow-x:auto;width:100%;}
        table{width:100%;border-collapse:collapse;min-width:800px;}
        th{background:#F8F8F8;padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #EBEBEB;white-space:nowrap;}
        td{padding:12px 14px;font-size:13px;border-bottom:1px solid #F4F4F4;vertical-align:top;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#FAFAFA;}
        .stat-num{font-size:36px;font-weight:700;line-height:1;color:#1A1A1A;}
      `}</style>

      {notification && <div className="notif">{notification}</div>}
      {modal && <ReportModal initialType={modal} onClose={()=>setModal(null)} onSave={saveReport} />}
      {schedModal && (
        <ScheduleModal
          tech={schedModal.tech} date={schedModal.date}
          slots={schedule[`${schedModal.tech}__${schedModal.date}`]||[]}
          onClose={()=>setSchedModal(null)}
          onSave={items=>{ setSchedule(p=>({...p,[`${schedModal.tech}__${schedModal.date}`]:items})); notify("Escala salva!"); }}
        />
      )}

      {/* HEADER — logo + nav em linha separada */}
      <div style={{ background:"#1A1A1A" }}>
        {/* Linha 1: Logo + título */}
        <div style={{ padding:"14px 28px 0", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:34, height:34, background:"#F5C800", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⚙</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#FFF", letterSpacing:"-.3px" }}>GRUPO MOV</div>
            <div style={{ fontSize:9, color:"#666", letterSpacing:1.5, textTransform:"uppercase" }}>Gestão Técnica de Campo</div>
          </div>
          {rupturasAtivas.length>0 && (
            <div style={{ marginLeft:"auto", background:"#C62828", color:"#FFF", borderRadius:8, fontSize:11, padding:"4px 10px", fontWeight:700 }}>
              🚨 {rupturasAtivas.length} ruptura(s)
            </div>
          )}
        </div>
        {/* Linha 2: Navegação */}
        <div style={{ padding:"10px 28px 0", display:"flex", gap:4, overflowX:"auto" }}>
          {[["dashboard","📋 Relatórios"],["schedule","📅 Escala"],["agenda","🗓 Agenda"],["dash","📊 Dashboard"],["ruptura","📦 Requisições"]].map(([k,l])=>(
            <button key={k} className={`nav-tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
        {/* Linha amarela */}
        <div style={{ height:3, background:"linear-gradient(90deg,#F5C800,#FFE566,#F5C800)", marginTop:10 }} />
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 20px" }}>

        {/* ── RELATÓRIOS ── */}
        {tab==="dashboard" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            {/* Stats — base completa */}
            <div style={{ background:"#FFFBF0", border:"1px solid #FFE8A0", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:12, color:"#C47D00", fontWeight:600 }}>
              📊 Base Grupo MOV: <b>{DB_STATS.total.toLocaleString()}</b> relatórios · <b>{DB_STATS.clientes}</b> clientes · Jan–Mai 2026 · Exibindo os 200 mais recentes
            </div>

            {/* Cards linha 1 — 4 tipos principais */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:10 }}>
              {TIPOS.slice(0,4).map(t=>{
                const total = t.v==="preventivo" ? DB_STATS.preventivos
                            : t.v==="corretivo"  ? DB_STATS.corretivos
                            : t.v==="a_faturar"  ? DB_STATS.a_faturar
                            : t.v==="mau_uso"    ? DB_STATS.mau_uso
                            : reports.filter(r=>r.type===t.v).length;
                const filtered = reports.filter(r=>r.type===t.v).length;
                return (
                  <div key={t.v} className="card" style={{ padding:"16px 18px", borderTop:`3px solid ${t.color}`, cursor:"pointer" }}
                    onClick={()=>setFilterTipo(filterTipo===t.v?"todos":t.v)}>
                    <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>{t.l}</div>
                    <div style={{ fontSize:32, fontWeight:700, color: filterTipo===t.v ? t.color : "#1A1A1A", lineHeight:1, fontFamily:"Inter,sans-serif" }}>
                      {filterTipo===t.v ? filtered : total}
                    </div>
                    {filterTipo===t.v && <div style={{ fontSize:10, color:t.color, fontWeight:600, marginTop:5 }}>● mostrando {filtered} na amostra</div>}
                  </div>
                );
              })}
            </div>

            {/* Cards linha 2 — 3 tipos extras */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {TIPOS.slice(4).map(t=>(
                <div key={t.v} className="card" style={{ padding:"16px 18px", borderTop:`3px solid ${t.color}`, cursor:"pointer" }}
                  onClick={()=>setFilterTipo(filterTipo===t.v?"todos":t.v)}>
                  <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>{t.l}</div>
                  <div style={{ fontSize:32, fontWeight:700, color: filterTipo===t.v ? t.color : "#1A1A1A", lineHeight:1, fontFamily:"Inter,sans-serif" }}>
                    {reports.filter(r=>r.type===t.v).length}
                  </div>
                  {filterTipo===t.v && <div style={{ fontSize:10, color:t.color, fontWeight:600, marginTop:5 }}>● filtrado</div>}
                </div>
              ))}
            </div>

            {/* Botão novo relatório + urgentes/rupturas */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#AAA", fontWeight:700 }}>🚨 Urgentes:</span>
                <span style={{ fontSize:14, fontWeight:800, color:"#E67E00" }}>{reports.filter(r=>r.urgent&&r.status!=="concluído").length}</span>
                <span style={{ fontSize:11, color:"#AAA", fontWeight:700, marginLeft:8 }}>🔩 Rupturas:</span>
                <span style={{ fontSize:14, fontWeight:800, color:"#6A1B9A" }}>{rupturasAtivas.length}</span>
              </div>
              <div style={{ marginLeft:"auto" }}>
                <button className="btn btn-primary" onClick={()=>setModal("novo")}>+ Novo Relatório</button>
              </div>
            </div>

            {/* Filtros */}
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Filtrar:</span>
              <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)}>
                <option value="todos">Todos os tipos</option>
                {TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
              <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)}>
                <option value="todas">Todas regiões</option>
                <option value="metropolitana">Metropolitana BH</option>
                <option value="roca">Roca</option>
                <option value="centroOeste">Centro-Oeste</option>
              </select>
              <select value={filterTech} onChange={e=>setFilterTech(e.target.value)}>
                <option value="todos">Todos técnicos</option>
                {ALL_TECHS.map(t=><option key={t}>{t}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="todos">Todos status</option>
                <option value="aberto">Aberto</option>
                <option value="em andamento">Em Andamento</option>
                <option value="acompanhar">Acompanhar</option>
                <option value="concluído">Concluído</option>
              </select>
              {(filterTipo!=="todos"||filterTech!=="todos"||filterStatus!=="todos"||filterRegion!=="todas") && (
                <button className="btn btn-ghost" style={{ fontSize:11, padding:"6px 12px" }}
                  onClick={()=>{ setFilterTipo("todos"); setFilterTech("todos"); setFilterStatus("todos"); setFilterRegion("todas"); }}>
                  ✕ Limpar filtros
                </button>
              )}
              <span style={{ marginLeft:"auto", fontSize:12, color:"#AAA" }}>{items.length} registro(s)</span>
            </div>

            {/* Tabela com scroll horizontal */}
            <div className="card" style={{ overflow:"hidden" }}>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nº Relatório</th>
                      <th>Tipo</th>
                      <th>Empresa</th>
                      <th>Patrimônio</th>
                      <th>Técnico</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Nº Chamado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length===0 && (
                      <tr><td colSpan={8} style={{ textAlign:"center", color:"#CCC", padding:40 }}>Nenhum registro encontrado</td></tr>
                    )}
                    {items.map(d=>{
                      const sc = statusCfg[d.status]||statusCfg["aberto"];
                      const tc = tipoCfg(d.type);
                      return (
                        <>
                          <tr key={d.id}>
                            <td style={{ fontWeight:700, fontSize:12, whiteSpace:"nowrap" }}>{d.reportNum}</td>
                            <td><Tag color={tc.color} bg={tc.bg}>{tc.l}</Tag></td>
                            <td>
                              <div style={{ fontWeight:600, maxWidth:220 }}>{d.empresa}</div>
                              {d.urgent && <Tag color="#C62828" bg="#FFF0F0">🚨 Urgente</Tag>}
                            </td>
                            <td style={{ fontSize:12, color:"#666", whiteSpace:"nowrap" }}>{d.patrimonio}</td>
                            <td style={{ whiteSpace:"nowrap" }}>
                              <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:techColor(d.tecnico), marginRight:5 }} />
                              {d.tecnico}
                            </td>
                            <td style={{ fontSize:12, color:"#888", whiteSpace:"nowrap" }}>{d.date}</td>
                            <td>
                              <select value={d.status} onChange={e=>updateItem(d.id,{status:e.target.value})}
                                style={{ fontSize:11, padding:"4px 8px", color:sc.color, background:sc.bg, border:`1px solid ${sc.color}44`, borderRadius:6, fontWeight:700 }}>
                                {Object.entries(statusCfg).map(([v,{label}])=><option key={v} value={v}>{label}</option>)}
                              </select>
                            </td>
                            <td style={{ fontSize:12, color:"#888" }}>{d.execRelatorio||"—"}</td>
                          </tr>
                          {d.acao && (
                            <tr key={d.id+"_acao"}>
                              <td colSpan={8} style={{ background:"#FAFAFA", padding:"6px 14px 10px", borderBottom:"2px solid #F0F0F0" }}>
                                <span style={{ fontSize:11, color:"#888", fontWeight:600 }}>🔧 Ação: </span>
                                <span style={{ fontSize:12, color:"#444" }}>{d.acao}</span>
                                {d.pendencia && d.pendencia !== "Não" && (
                                  <span style={{ marginLeft:12, fontSize:11, color:"#E67E00", fontWeight:600 }}>⚠ Pendência: {d.pendencia}</span>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ESCALA DIÁRIA ── */}
        {tab==="schedule" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:4 }}>📅 Escala Diária</div>
                <div style={{ fontSize:13, color:"#888" }}>Gerencie os atendimentos do dia por técnico. Clique em qualquer card para editar.</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <select value={schedRegion} onChange={e=>setSchedRegion(e.target.value)}>
                  <option value="metropolitana">Metropolitana BH</option>
                  <option value="roca">Roca</option>
                  <option value="centroOeste">Centro-Oeste</option>
                </select>
                <input type="text" value={schedDate} onChange={e=>setSchedDate(e.target.value)}
                  style={{ width:140 }} placeholder="YYYY-MM-DD" />
              </div>
            </div>

            {/* Sub-abas preventivo/corretivo — só Metropolitana */}
            {schedRegion === "metropolitana" && (
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                <button className={`sub-tab ${schedType==="preventivo"?"active":""}`} onClick={()=>setSchedType("preventivo")}>
                  📋 Preventiva — Rafael, Helbert, Luiz Guilherme, Denison
                </button>
                <button className={`sub-tab ${schedType==="corretivo"?"active":""}`} onClick={()=>setSchedType("corretivo")}>
                  🔧 Corretiva — Anderson, Dilson + equipe mista
                </button>
              </div>
            )}

            {/* Legenda */}
            <div style={{ marginBottom:16, padding:"8px 14px", background:"#F8F8F8", borderRadius:8, border:"1px solid #EBEBEB", display:"flex", alignItems:"center", gap:8 }}>
              {schedRegion==="metropolitana" ? (
                schedType==="preventivo"
                  ? <><span style={{ fontSize:12, color:"#1565C0", fontWeight:700 }}>📋 Escala Preventiva</span><span style={{ fontSize:12, color:"#AAA" }}>Rafael, Helbert, Luiz Guilherme e Denison — foco em manutenção preventiva</span></>
                  : <><span style={{ fontSize:12, color:"#C62828", fontWeight:700 }}>🔧 Escala Corretiva</span><span style={{ fontSize:12, color:"#AAA" }}>Anderson e Dilson (exclusivo corretivo) + Rafael, Helbert, Luiz Guilherme e Denison (também atendem corretivas)</span></>
              ) : (
                <span style={{ fontSize:12, color:"#888" }}>📍 {REGIONS[schedRegion]?.label} — todos os técnicos da região</span>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {techsForRegion.map(tech => {
                const key = `${tech}__${schedDate}`;
                const slots = schedule[key]||[];
                const atendidos = slots.filter(s=>s.status==="atendido").length;
                const color = techColor(tech);
                return (
                  <div key={tech} className="card" style={{ borderTop:`3px solid ${color}`, overflow:"hidden" }}>
                    <div style={{ padding:"14px 16px", borderBottom:"1px solid #F4F4F4", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"#1A1A1A" }}>
                          <span style={{ display:"inline-block", width:10, height:10, borderRadius:"50%", background:color, marginRight:7 }} />
                          {tech}
                        </div>
                        <div style={{ fontSize:11, color:"#AAA", marginTop:2 }}>{slots.length} atendimento(s) · {atendidos} concluído(s)</div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize:12, padding:"6px 12px" }}
                        onClick={()=>setSchedModal({tech, date:schedDate})}>✏ Editar</button>
                    </div>
                    <div style={{ padding:"10px 16px" }}>
                      {slots.length===0 && <div style={{ fontSize:12, color:"#CCC", padding:"8px 0", textAlign:"center" }}>Sem atendimentos</div>}
                      {slots.map((s,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom: i<slots.length-1?"1px solid #F8F8F8":"none" }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background: s.status==="atendido"?"#1A7A3C":s.type==="corretivo"?"#C62828":"#1565C0", flexShrink:0 }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:500, color:"#1A1A1A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.client||"—"}</div>
                            <div style={{ fontSize:10, color:"#AAA" }}>{s.patrimonio} · {s.type==="corretivo"?"Corretivo":"Preventivo"}</div>
                          </div>
                          {s.reportNum && <div style={{ fontSize:10, color:"#888", fontWeight:600, flexShrink:0 }}>{s.reportNum}</div>}
                          {s.status==="atendido" && <Tag color="#1A7A3C" bg="#F0FFF5">✓</Tag>}
                        </div>
                      ))}
                    </div>
                    {/* Barra de progresso */}
                    {slots.length>0 && (
                      <div style={{ padding:"0 16px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#AAA", marginBottom:4 }}>
                          <span>Progresso</span><span>{atendidos}/{slots.length}</span>
                        </div>
                        <div style={{ height:4, background:"#F0F0F0", borderRadius:2 }}>
                          <div style={{ width:`${slots.length?atendidos/slots.length*100:0}%`, height:4, background:color, borderRadius:2, transition:"width .3s" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Histórico por técnico */}
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:11, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Resumo do Dia — O que cada técnico atendeu</div>
              <div className="card" style={{ overflow:"hidden" }}>
                {techsForRegion.map((tech,i)=>{
                  const key = `${tech}__${schedDate}`;
                  const slots = schedule[key]||[];
                  const prev = slots.filter(s=>s.type==="preventivo").length;
                  const corr = slots.filter(s=>s.type==="corretivo").length;
                  const color = techColor(tech);
                  return (
                    <div key={tech} style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 18px", borderBottom: i<techsForRegion.length-1?"1px solid #F8F8F8":"none" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:color+"18", border:`2px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color, flexShrink:0 }}>
                        {tech.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{tech}</div>
                        <div style={{ fontSize:11, color:"#AAA" }}>
                          {slots.length===0 ? "Sem atendimentos neste dia" : slots.map(s=>s.client).filter(Boolean).join(", ")}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {prev>0 && <Tag color="#1565C0" bg="#F0F4FF">📋 {prev} prev.</Tag>}
                        {corr>0 && <Tag color="#C62828" bg="#FFF0F0">🔧 {corr} corret.</Tag>}
                        {slots.length===0 && <Tag color="#AAA" bg="#F8F8F8">Livre</Tag>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REQUISIÇÕES ── */}
        {tab==="ruptura" && (
          <div style={{ animation:"fadeIn .3s ease" }}>

            {/* Header + botão nova requisição */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:4 }}>📦 Requisições de Peças</div>
                <div style={{ fontSize:13, color:"#888" }}>Controle de peças solicitadas pelos técnicos. Visível para toda a equipe.</div>
              </div>
              <button className="btn btn-primary" onClick={()=>setReqModal(true)}>+ Nova Requisição</button>
            </div>

            {/* Stats rápidos */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:22 }}>
              {[
                { l:"Reservadas",        v: requisicoes.filter(r=>r.status==="reservada").length,        color:"#1565C0", bg:"#F0F4FF", icon:"🔒" },
                { l:"Entregues",         v: requisicoes.filter(r=>r.status==="entregue").length,          color:"#1A7A3C", bg:"#F0FFF5", icon:"✅" },
                { l:"Ruptura",           v: requisicoes.filter(r=>r.status==="ruptura").length,           color:"#C62828", bg:"#FFF0F0", icon:"🚨" },
              ].map((s,i)=>(
                <div key={i} className="card" style={{ padding:"16px 20px", borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{s.icon} {s.l}</div>
                  <div style={{ fontSize:34, fontWeight:800, color:s.color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Lista de requisições */}
            {requisicoes.length===0 ? (
              <div className="card" style={{ padding:48, textAlign:"center", color:"#CCC", fontSize:14 }}>
                Nenhuma requisição cadastrada. Clique em "+ Nova Requisição" para começar.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {requisicoes.map(r=>{
                  const scReq = reqStatusCfg[r.status]||reqStatusCfg["reservada"];
                  const horasAberto = r.status==="ruptura" && r.dataRequisicao
                    ? Math.round((Date.now()-new Date(r.dataRequisicao).getTime())/3600000)
                    : null;
                  return (
                    <div key={r.id} className="card" style={{ overflow:"hidden", borderLeft:`4px solid ${scReq.color}` }}>
                      {/* Linha principal */}
                      <div style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:16, alignItems:"start" }}>
                        {/* Peça */}
                        <div>
                          <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Peça</div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{r.nomePeca}</div>
                          <div style={{ fontSize:11, color:"#888", marginTop:2 }}>Cód: <b>{r.codigoPeca||"—"}</b></div>
                        </div>
                        {/* Referências */}
                        <div>
                          <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Referências</div>
                          <div style={{ fontSize:12, color:"#555" }}>🏷 Patrimônio: <b>{r.patrimonio||"—"}</b></div>
                          <div style={{ fontSize:12, color:"#555" }}>📋 Relatório: <b>{r.numRelatorio||"—"}</b></div>
                          <div style={{ fontSize:12, color:"#555" }}>👤 Técnico: <b>{r.tecnico||"—"}</b></div>
                        </div>
                        {/* Status + SLA */}
                        <div>
                          <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Status</div>
                          <select value={r.status} onChange={e=>updateReq(r.id,{status:e.target.value})}
                            style={{ fontSize:12, padding:"6px 10px", color:scReq.color, background:scReq.bg, border:`1px solid ${scReq.color}44`, borderRadius:7, fontWeight:700, width:"100%" }}>
                            <option value="reservada">🔒 Reservada</option>
                            <option value="entregue">✅ Entregue ao Técnico</option>
                            <option value="ruptura">🚨 Ruptura</option>
                          </select>
                          {r.status==="ruptura" && horasAberto!==null && (
                            <div style={{ marginTop:8 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#C62828", fontWeight:700, marginBottom:3 }}>
                                <span>⏱ Em ruptura</span><span>{horasAberto}h</span>
                              </div>
                              <div style={{ height:5, background:"#FFE0E0", borderRadius:3 }}>
                                <div style={{ width:`${Math.min(horasAberto/48*100,100)}%`, height:5, background:"#C62828", borderRadius:3, transition:"width .3s" }} />
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Data requisição */}
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Data Req.</div>
                          <div style={{ fontSize:12, color:"#555", fontWeight:600 }}>{r.dataRequisicao||"—"}</div>
                        </div>
                      </div>

                      {/* Linha entrega — aparece quando status = entregue */}
                      {r.status==="entregue" && (
                        <div style={{ background:"#F0FFF5", borderTop:"1px solid #A0DDBB", padding:"12px 20px", display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                          <div style={{ fontSize:12, color:"#1A7A3C", fontWeight:700 }}>✅ Entregue pelo Almoxarifado</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <div style={{ fontSize:10, color:"#666", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Técnico que recebeu</div>
                            <select value={r.tecnicoEntrega||""} onChange={e=>updateReq(r.id,{tecnicoEntrega:e.target.value})}
                              style={{ fontSize:12, padding:"6px 10px", minWidth:160 }}>
                              <option value="">Selecionar técnico</option>
                              {ALL_TECHS.map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <div style={{ fontSize:10, color:"#666", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Data de entrega</div>
                            <input type="text" value={r.dataEntrega||""} onChange={e=>updateReq(r.id,{dataEntrega:e.target.value})}
                              placeholder="DD/MM/AAAA" style={{ width:140, fontSize:12 }} />
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <div style={{ fontSize:10, color:"#666", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Entregue por</div>
                            <input type="text" value={r.entregoPor||""} onChange={e=>updateReq(r.id,{entregoPor:e.target.value})}
                              placeholder="Nome do almoxarife" style={{ width:160, fontSize:12 }} />
                          </div>
                        </div>
                      )}

                      {/* Linha ruptura — previsão */}
                      {r.status==="ruptura" && (
                        <div style={{ background:"#FFF0F0", borderTop:"1px solid #FFCCCC", padding:"12px 20px", display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                          <div style={{ fontSize:12, color:"#C62828", fontWeight:700 }}>🚨 Peça não disponível no estoque</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <div style={{ fontSize:10, color:"#888", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Previsão de chegada</div>
                            <input type="text" value={r.previsaoChegada||""} onChange={e=>updateReq(r.id,{previsaoChegada:e.target.value})}
                              placeholder="DD/MM/AAAA" style={{ width:140, fontSize:12 }} />
                          </div>
                          <button className="btn btn-primary" style={{ fontSize:12 }}
                            onClick={()=>updateReq(r.id,{status:"reservada",previsaoChegada:""})}>
                            Peça chegou — Reservar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal nova requisição */}
            {reqModal && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
                onClick={()=>setReqModal(false)}>
                <div style={{ background:"#FFF", borderRadius:16, width:520, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
                  onClick={e=>e.stopPropagation()}>
                  <div style={{ background:"#1A1A1A", padding:"16px 22px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"#F5C800" }}>📦 Nova Requisição</div>
                    <button onClick={()=>setReqModal(false)} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>✕</button>
                  </div>
                  <div style={{ padding:22, display:"flex", flexDirection:"column", gap:14 }}>

                    {/* Número da requisição — campo principal */}
                    <div style={{ background:"#FFFBF0", border:"1px solid #FFE8A0", borderRadius:10, padding:14 }}>
                      <div style={{ fontSize:11, color:"#C47D00", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
                        Nº Requisição (do outro sistema)
                      </div>
                      <input type="text" value={novaReq.numRequisicao} onChange={e=>setNovaReq(p=>({...p,numRequisicao:e.target.value}))}
                        placeholder="Ex: REQ-2026-010" style={{ fontSize:16, fontWeight:700 }} />
                    </div>

                    {/* Dados complementares do relatório */}
                    <div style={{ fontSize:11, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Dados do relatório vinculado</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <Input label="Nº Relatório" value={novaReq.numRelatorio} onChange={v=>setNovaReq(p=>({...p,numRelatorio:v}))} placeholder="REL-2026-001" />
                      <Input label="Patrimônio" value={novaReq.patrimonio} onChange={v=>setNovaReq(p=>({...p,patrimonio:v}))} placeholder="PAT-000" />
                      <Input label="Nome da Peça" value={novaReq.nomePeca} onChange={v=>setNovaReq(p=>({...p,nomePeca:v}))} placeholder="Ex: Capacitor 40µF" />
                      <Input label="Código da Peça" value={novaReq.codigoPeca} onChange={v=>setNovaReq(p=>({...p,codigoPeca:v}))} placeholder="CAP-40UF-001" />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <Sel label="Técnico Solicitante" value={novaReq.tecnico} onChange={v=>setNovaReq(p=>({...p,tecnico:v}))}
                        options={[""].concat(ALL_TECHS)} />
                      <Sel label="Status Inicial" value={novaReq.status} onChange={v=>setNovaReq(p=>({...p,status:v}))}
                        options={[{v:"reservada",l:"🔒 Reservada"},{v:"ruptura",l:"🚨 Ruptura"}]} />
                    </div>

                    <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:4 }}>
                      <button className="btn btn-ghost" onClick={()=>setReqModal(false)}>Cancelar</button>
                      <button className="btn btn-primary" disabled={!novaReq.numRequisicao}
                        onClick={()=>{
                          setRequisicoes(p=>[{ ...novaReq, id:`REQ${Date.now()}`, dataRequisicao:TODAY_STR },...p]);
                          setNovaReq({ numRequisicao:"", nomePeca:"", codigoPeca:"", numRelatorio:"", patrimonio:"", tecnico:"", dataRequisicao:TODAY_STR, status:"reservada", tecnicoEntrega:"", dataEntrega:"", entregoPor:"", previsaoChegada:"" });
                          setReqModal(false);
                          notify("📦 Requisição criada!");
                        }}>
                        Criar Requisição
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AGENDA ── */}
        {tab==="agenda" && (
          <div style={{ animation:"fadeIn .3s ease" }}>

            {/* Modal agendamento */}
            {agendaModal && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}
                onClick={()=>setAgendaModal(null)}>
                <div style={{ background:"#FFF", borderRadius:16, width:520, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", maxHeight:"90vh", overflowY:"auto" }}
                  onClick={e=>e.stopPropagation()}>
                  <div style={{ background:"#1A1A1A", padding:"16px 22px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#F5C800" }}>🗓 Agendamento</div>
                      <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{agendaModal.tech} · {agendaModal.date}</div>
                    </div>
                    <button onClick={()=>setAgendaModal(null)} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>✕</button>
                  </div>
                  <div style={{ padding:22, display:"flex", flexDirection:"column", gap:14 }}>
                    <Input label="Empresa" value={agendaForm.empresa} onChange={v=>setAgendaForm(p=>({...p,empresa:v}))} placeholder="Nome da empresa" />

                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Patrimônios (até 3)</div>
                      {[0,1,2].map(i=>(
                        <input key={i} type="text"
                          value={agendaForm.patrimônios[i]||""}
                          onChange={e=>{ const p=[...agendaForm.patrimônios]; p[i]=e.target.value; setAgendaForm(f=>({...f,patrimônios:p})); }}
                          placeholder={`Patrimônio ${i+1}`}
                          style={{ width:"100%", marginBottom: i<2?8:0 }} />
                      ))}
                    </div>

                    <Sel label="Status" value={agendaForm.status} onChange={v=>setAgendaForm(p=>({...p,status:v}))}
                      options={Object.entries(AGENDA_STATUS).map(([v,c])=>({v, l:c.label}))} />

                    <Input label="Contato / Gestor da Empresa" value={agendaForm.contato} onChange={v=>setAgendaForm(p=>({...p,contato:v}))} placeholder="Nome do responsável" />
                    <Input label="Observações" value={agendaForm.obs} onChange={v=>setAgendaForm(p=>({...p,obs:v}))} placeholder="Informações adicionais..." />

                    <div style={{ display:"flex", gap:10, justifyContent:"space-between", marginTop:4 }}>
                      <div>
                        {agendaItems[`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`] && (
                          <button className="btn btn-ghost" style={{ color:"#C62828", borderColor:"#FFCCCC" }}
                            onClick={()=>{ delAgenda(`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`); setAgendaModal(null); notify("Agendamento removido."); }}>
                            Remover
                          </button>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:10 }}>
                        <button className="btn btn-ghost" onClick={()=>setAgendaModal(null)}>Cancelar</button>
                        <button className="btn btn-primary" disabled={!agendaForm.empresa}
                          onClick={()=>{
                            updAgenda(`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`, agendaForm);
                            setAgendaModal(null);
                            notify("🗓 Agendamento salvo!");
                          }}>Salvar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:4 }}>🗓 Agenda Preventiva</div>
                <div style={{ fontSize:13, color:"#888" }}>2026 a 2030 · até 5 empresas/dia · 3 patrimônios por empresa</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                {/* Região */}
                <select value={agendaRegion} onChange={e=>{ setAgendaRegion(e.target.value); setAgendaTech(AGENDA_REGIONS[e.target.value].techs[0]); }}>
                  <option value="metropolitana">Metropolitana BH</option>
                  <option value="centroOeste">Centro-Oeste</option>
                </select>
                {/* Técnico */}
                <select value={agendaTech} onChange={e=>setAgendaTech(e.target.value)}>
                  {AGENDA_REGIONS[agendaRegion].techs.map(t=><option key={t}>{t}</option>)}
                </select>
                {/* Mês e Ano */}
                <select value={agendaMonth} onChange={e=>setAgendaMonth(Number(e.target.value))}>
                  {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=>(
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <select value={agendaYear} onChange={e=>setAgendaYear(Number(e.target.value))}>
                  {[2026,2027,2028,2029,2030].map(y=>(
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Legenda status */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18 }}>
              {Object.entries(AGENDA_STATUS).map(([k,s])=>(
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#666" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:s.dot }} />
                  {s.label}
                </div>
              ))}
            </div>

            {/* Grade do mês */}
            {(() => {
              const daysInMonth = getDaysInMonth(agendaYear, agendaMonth);
              const firstDow = getDayOfWeek(agendaYear, agendaMonth, 1);
              const weeks = [];
              let day = 1 - firstDow;
              while (day <= daysInMonth) {
                const week = [];
                for (let d=0; d<7; d++, day++) week.push(day);
                weeks.push(week);
              }
              const DOWS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
              return (
                <div className="card" style={{ overflow:"hidden" }}>
                  {/* Header dias semana */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#1A1A1A" }}>
                    {DOWS.map(d=>(
                      <div key={d} style={{ padding:"8px 0", textAlign:"center", fontSize:11, fontWeight:700, color: d==="Dom"||d==="Sáb"?"#F5C800":"#888", letterSpacing:1 }}>{d}</div>
                    ))}
                  </div>
                  {/* Semanas */}
                  {weeks.map((week,wi)=>(
                    <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderTop:"1px solid #F0F0F0" }}>
                      {week.map((day,di)=>{
                        const isValid = day >= 1 && day <= daysInMonth;
                        const isSun = di===0, isSat = di===6;
                        const isWeekend = isSun||isSat;
                        const dateStr = isValid ? `${agendaYear}-${PAD(agendaMonth+1)}-${PAD(day)}` : "";
                        const isToday = dateStr === TODAY_STR;
                        const slots = isValid ? [0,1,2,3,4].map(i=>{
                          const key = `${agendaTech}__${dateStr}__${i}`;
                          return { idx:i, key, data: agendaItems[key]||null };
                        }) : [];
                        const filled = slots.filter(s=>s.data).length;

                        return (
                          <div key={di} style={{
                            minHeight:110, padding:"6px 6px 4px", borderRight: di<6?"1px solid #F0F0F0":"none",
                            background: !isValid?"#FAFAFA": isWeekend?"#FFFBF0": isToday?"#FFFFF0":"#FFF",
                            opacity: !isValid?0.3:1,
                          }}>
                            {isValid && (
                              <>
                                {/* Número do dia */}
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                                  <div style={{ fontSize:12, fontWeight: isToday?800:500, color: isToday?"#F5C800": isWeekend?"#AAA":"#1A1A1A",
                                    background: isToday?"#1A1A1A":"transparent", borderRadius:isToday?12:0, padding:isToday?"2px 6px":"0" }}>
                                    {day}
                                  </div>
                                  {!isWeekend && filled<5 && (
                                    <button onClick={()=>openAgendaModal(agendaTech, dateStr, filled, null)}
                                      style={{ background:"none", border:"none", color:"#CCC", fontSize:16, cursor:"pointer", lineHeight:1, padding:0 }}
                                      title="Adicionar agendamento">+</button>
                                  )}
                                </div>
                                {/* Slots de empresa */}
                                {slots.map(s=> s.data ? (
                                  <div key={s.idx} onClick={()=>openAgendaModal(agendaTech, dateStr, s.idx, s.data)}
                                    style={{ fontSize:10, fontWeight:600, padding:"3px 6px", borderRadius:5, marginBottom:3, cursor:"pointer",
                                      background: AGENDA_STATUS[s.data.status]?.bg||"#F0F0F0",
                                      color: AGENDA_STATUS[s.data.status]?.color||"#555",
                                      borderLeft:`3px solid ${AGENDA_STATUS[s.data.status]?.dot||"#CCC"}`,
                                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                    {s.data.empresa}
                                  </div>
                                ) : null)}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Resumo do mês */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:11, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>
                Resumo — {agendaTech} · {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][agendaMonth]} {agendaYear}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {["agendada","confirmada","concluida"].map(st=>{
                  const cfg = AGENDA_STATUS[st];
                  const cnt = Object.entries(agendaItems).filter(([k,v])=>k.startsWith(agendaTech)&&v.status===st).length;
                  return (
                    <div key={st} className="card" style={{ padding:"12px 16px", borderTop:`3px solid ${cfg.color}` }}>
                      <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{cfg.label}</div>
                      <div style={{ fontSize:28, fontWeight:800, color:cfg.color, fontFamily:"'Syne',sans-serif" }}>{cnt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD VISUAL ── */}
        {tab==="dash" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:4 }}>📊 Dashboard de Atendimentos</div>
                <div style={{ fontSize:13, color:"#888" }}>Atendimentos por técnico — escala diária e relatórios</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <select value={dashRegion} onChange={e=>setDashRegion(e.target.value)}>
                  <option value="metropolitana">Metropolitana BH</option>
                  <option value="roca">Roca</option>
                  <option value="centroOeste">Centro-Oeste</option>
                </select>
                <input type="text" value={dashDate} onChange={e=>setDashDate(e.target.value)}
                  style={{ width:150 }} placeholder="YYYY-MM-DD" />
              </div>
            </div>

            {/* Techs da região selecionada */}
            {(() => {
              const techs = REGIONS[dashRegion]?.techs || [];

              // Dados da escala do dia
              const schedData = techs.map(tech => {
                const key = `${tech}__${dashDate}`;
                const slots = schedule[key] || [];
                return { tech, slots, total: slots.length, prev: slots.filter(s=>s.type==="preventivo").length, corr: slots.filter(s=>s.type==="corretivo").length };
              });

              // Dados dos relatórios do dia
              const reportsData = techs.map(tech => {
                const techReports = reports.filter(r => r.tecnico === tech && r.date === dashDate);
                return { tech, reports: techReports };
              });

              const maxSlots = Math.max(...schedData.map(d=>d.total), 1);

              return (
                <>
                  {/* Gráfico de barras — atendimentos por técnico */}
                  <div className="card" style={{ padding:24, marginBottom:20 }}>
                    <div style={{ fontSize:11, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:20 }}>
                      Atendimentos na Escala — {dashDate}
                    </div>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:16, height:160 }}>
                      {schedData.map(({tech, total, prev, corr}) => {
                        const color = techColor(tech);
                        const pct = total / 5 * 100; // máx 5 por dia
                        return (
                          <div key={tech} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                            {/* Barra */}
                            <div style={{ width:"100%", height:120, display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative" }}>
                              {total === 0 ? (
                                <div style={{ width:"100%", height:4, background:"#F0F0F0", borderRadius:4 }} />
                              ) : (
                                <div style={{ width:"100%", borderRadius:"6px 6px 0 0", overflow:"hidden", height:`${Math.max(pct,8)}%` }}>
                                  <div style={{ height:`${prev/total*100}%`, background:color, opacity:1 }} />
                                  <div style={{ height:`${corr/total*100}%`, background:color, opacity:0.5 }} />
                                </div>
                              )}
                              {/* Número no topo */}
                              <div style={{ position:"absolute", top:0, width:"100%", textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color: total>0?color:"#DDD" }}>
                                {total}
                              </div>
                            </div>
                            {/* Nome técnico */}
                            <div style={{ fontSize:10, fontWeight:700, color:"#888", textAlign:"center", lineHeight:1.3 }}>
                              {tech.split(" ")[0]}
                            </div>
                            {/* Tags prev/corr */}
                            {total > 0 && (
                              <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center" }}>
                                {prev>0 && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4, background:"#F0F4FF", color:"#1565C0" }}>{prev}P</span>}
                                {corr>0 && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4, background:"#FFF0F0", color:"#C62828" }}>{corr}C</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Legenda */}
                    <div style={{ display:"flex", gap:16, marginTop:16, justifyContent:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#888" }}>
                        <div style={{ width:12, height:12, borderRadius:3, background:"#1565C0" }} /> Preventivo
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#888" }}>
                        <div style={{ width:12, height:12, borderRadius:3, background:"#1565C0", opacity:0.4 }} /> Corretivo
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#888" }}>
                        <div style={{ width:12, height:8, borderRadius:2, background:"#F0F0F0", border:"1px dashed #CCC" }} /> Máx: 5/dia
                      </div>
                    </div>
                  </div>

                  {/* Cards detalhados por técnico */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                    {techs.map(tech => {
                      const color = techColor(tech);
                      const key = `${tech}__${dashDate}`;
                      const slots = schedule[key] || [];
                      const techReps = reports.filter(r => r.tecnico === tech && r.date === dashDate);

                      // Calcular horas totais do dia somando todos os relatórios
                      const parseHMin = h => {
                        if (!h) return 0;
                        const m = h.match(/(\d+)h(\d+)?/);
                        return m ? parseInt(m[1])*60 + parseInt(m[2]||0) : 0;
                      };
                      const totalTrabMin = techReps.reduce((a,r)=>a+parseHMin(r.horasTrabalhadas),0);
                      const totalDeslMin = techReps.reduce((a,r)=>a+Math.round((parseFloat(r.horasDeslocamento||0))*60),0);
                      const fmtMin = m => m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"—";

                      return (
                        <div key={tech} className="card" style={{ borderTop:`3px solid ${color}`, overflow:"hidden" }}>
                          {/* Header do card */}
                          <div style={{ padding:"14px 16px", borderBottom:"1px solid #F4F4F4", display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:color+"18", border:`2px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color, flexShrink:0 }}>
                              {tech.split(" ").map(n=>n[0]).join("").slice(0,2)}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700, fontSize:14 }}>{tech}</div>
                              <div style={{ fontSize:11, color:"#AAA" }}>
                                {slots.length} na escala · {techReps.length} relatório(s)
                              </div>
                            </div>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color, lineHeight:1 }}>
                              {slots.length}
                            </div>
                          </div>

                          {/* Horas do dia */}
                          {techReps.length > 0 && (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, borderBottom:"1px solid #F4F4F4" }}>
                              <div style={{ padding:"10px 16px", borderRight:"1px solid #F4F4F4" }}>
                                <div style={{ fontSize:9, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>⏱ Horas trabalhadas</div>
                                <div style={{ fontSize:18, fontWeight:800, color:"#C47D00", fontFamily:"'Syne',sans-serif" }}>{fmtMin(totalTrabMin)}</div>
                              </div>
                              <div style={{ padding:"10px 16px" }}>
                                <div style={{ fontSize:9, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>🚗 Deslocamento</div>
                                <div style={{ fontSize:18, fontWeight:800, color:"#888", fontFamily:"'Syne',sans-serif" }}>{fmtMin(totalDeslMin)}</div>
                              </div>
                            </div>
                          )}

                          {/* Lista de empresas da escala */}
                          <div style={{ padding:"10px 16px" }}>
                            {slots.length === 0 ? (
                              <div style={{ fontSize:12, color:"#CCC", textAlign:"center", padding:"8px 0" }}>Sem atendimentos neste dia</div>
                            ) : (
                              slots.map((s, i) => (
                                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom: i<slots.length-1?"1px solid #F8F8F8":"none" }}>
                                  <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background: s.status==="atendido"?"#1A7A3C": s.type==="corretivo"?"#C62828":"#1565C0" }} />
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.client||"—"}</div>
                                    <div style={{ fontSize:10, color:"#AAA" }}>{s.patrimonio} · {s.type==="corretivo"?"Corretivo":"Preventivo"}</div>
                                  </div>
                                  {s.status==="atendido"
                                    ? <span style={{ fontSize:10, color:"#1A7A3C", fontWeight:700 }}>✓</span>
                                    : <span style={{ fontSize:10, color:"#CCC" }}>—</span>}
                                </div>
                              ))
                            )}

                            {/* Relatórios com horas */}
                            {techReps.length > 0 && (
                              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px dashed #EEE" }}>
                                <div style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Relatórios do dia</div>
                                {techReps.map((r,i) => {
                                  const tc = tipoCfg(r.type);
                                  return (
                                    <div key={i} style={{ padding:"5px 0", borderBottom: i<techReps.length-1?"1px solid #F8F8F8":"none" }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                        <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:tc.bg, color:tc.color }}>{tc.l}</span>
                                        <span style={{ fontSize:11, color:"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{r.empresa}</span>
                                        <span style={{ fontSize:10, color:"#AAA", flexShrink:0 }}>{r.reportNum}</span>
                                      </div>
                                      {(r.horaEntrada||r.horaSaida) && (
                                        <div style={{ fontSize:10, color:"#888", marginTop:3, paddingLeft:2 }}>
                                          🕐 {r.horaEntrada||"?"} → {r.horaSaida||"?"} · 
                                          <span style={{ color:"#C47D00", fontWeight:600 }}> {r.horasTrabalhadas||"?"} trabalhadas</span>
                                          {r.horasDeslocamento && <span style={{ color:"#888" }}> · {r.horasDeslocamento}h desloc.</span>}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Barra de progresso */}
                          <div style={{ padding:"8px 16px 14px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#AAA", marginBottom:4 }}>
                              <span>Capacidade do dia</span>
                              <span>{slots.length}/5</span>
                            </div>
                            <div style={{ height:5, background:"#F0F0F0", borderRadius:3 }}>
                              <div style={{ width:`${slots.length/5*100}%`, height:5, background:color, borderRadius:3, transition:"width .3s" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totalizador geral do dia */}
                  <div className="card" style={{ marginTop:20, padding:"18px 24px", display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
                    <div style={{ fontSize:11, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Total do dia —</div>
                    {(() => {
                      const parseHMin = h => { if(!h) return 0; const m=h.match(/(\d+)h(\d+)?/); return m?parseInt(m[1])*60+parseInt(m[2]||0):0; };
                      const dayReports = reports.filter(r=>r.date===dashDate && REGIONS[dashRegion]?.techs.includes(r.tecnico));
                      const totalTrabMin = dayReports.reduce((a,r)=>a+parseHMin(r.horasTrabalhadas),0);
                      const totalDeslMin = dayReports.reduce((a,r)=>a+Math.round((parseFloat(r.horasDeslocamento||0))*60),0);
                      const fmtMin = m => m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"—";
                      return [
                        { l:"Atendimentos na escala", v: schedData.reduce((a,d)=>a+d.total,0), c:"#1A1A1A" },
                        { l:"Preventivos",             v: schedData.reduce((a,d)=>a+d.prev,0),  c:"#1565C0" },
                        { l:"Corretivos",              v: schedData.reduce((a,d)=>a+d.corr,0),  c:"#C62828" },
                        { l:"Relatórios emitidos",     v: dayReports.length,                     c:"#1A7A3C" },
                        { l:"Horas trabalhadas",       v: fmtMin(totalTrabMin),                  c:"#C47D00" },
                        { l:"Deslocamento",            v: fmtMin(totalDeslMin),                  c:"#888" },
                      ].map((s,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:s.c, lineHeight:1 }}>{s.v}</div>
                          <div style={{ fontSize:11, color:"#AAA" }}>{s.l}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
