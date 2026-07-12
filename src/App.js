        /* eslint-disable */
import { useState, useRef, useEffect, Fragment } from "react";
// ── SUPABASE CONFIG ─────────────────────────────────────────────────────────── v4
const SUPA_URL = "https://kpaddzigzqbnkfzprlwl.supabase.co";
const SUPA_KEY = "sb_publishable_RZaBuoZXGvPNTZaqGjHMlQ_kMH_dTVG";

let __dbErrShown=false;
const db = {
  async get(table) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*`, {
        headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`}
      });
      if(!res.ok){ const t=await res.text(); console.error("DB get error:",table,res.status,t); if(!__dbErrShown&&res.status!==404){__dbErrShown=true;alert("Erro ao LER ("+table+"): "+res.status+" — "+t.slice(0,200));} return []; }
      const rows = await res.json();
      return Array.isArray(rows) ? rows.map(r => r.data) : [];
    } catch(e) { console.error("DB get error:", e); return []; }
  },
  async save(table, id, data) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
        body: JSON.stringify({id, data})
      });
      if(!res.ok){ const t=await res.text(); console.error("DB save error:",table,res.status,t); if(res.status!==404&&res.status!==422)alert("Erro ao SALVAR ("+table+"): "+res.status+" — "+t.slice(0,250)); }
    } catch(e) { console.error("DB save error:", e); alert("Erro de conexão ao salvar: "+e.message); }
  },
  async delete(table, id) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: "DELETE",
        headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`}
      });
    } catch(e) { console.error("DB delete error:", e); }
  }
};



const USERS = [
  { id:"manuela",      username:"manuela.malagoli",  name:"Manuela Malagoli", role:"Administradora",         password:"mov2026", canDelete:true },
  { id:"gustavo",      username:"gustavo.coelho",    name:"Gustavo Coelho",   role:"Administrador",           password:"mov2026", canDelete:true },
  { id:"renato",       username:"renato.rocha",      name:"Renato",           role:"Assistente",              password:"mov2026", canDelete:true },
  { id:"gustavo",      username:"gustavo.coelho",    name:"Gustavo Coelho",   role:"Administrador",           password:"mov2026", canDelete:true },
  { id:"werick",       username:"werick.coelho",     name:"Werick Coelho",    role:"Comercial",               password:"mov2026", canDelete:false, acessoComercial:true },
  { id:"luciana",      username:"luciana.dias",      name:"Luciana Dias",     role:"Comercial",               password:"mov2026", canDelete:false, acessoComercial:true, semSas:true },
  { id:"fran",         username:"fran.teixeira",     name:"Fran Teixeira",    role:"SAS",                     password:"mov2026", canDelete:false, acessoSas:true },
  { id:"dilson",       username:"dilson.silva",      name:"Dilson Silva",     role:"Técnico",                 password:"mov2026", canDelete:false, apenasAgenda:true },
  { id:"rafael_g",     username:"rafael.gustavo",    name:"Rafael Gustavo",   role:"Técnico",                 password:"mov2026", canDelete:false, apenasAgenda:true },
  { id:"helbert_f",    username:"helbert.figueredo", name:"Helbert Figueredo",role:"Técnico",                 password:"mov2026", canDelete:false, apenasAgenda:true },
  { id:"anderson_s",   username:"anderson.silva",    name:"Anderson Silva",   role:"Técnico",                 password:"mov2026", canDelete:false, apenasAgenda:true },
  { id:"matheus_m",    username:"matheus.menezes",   name:"Matheus Menezes",  role:"Oficina150",              password:"Oficina150", canDelete:false, apenasOficina150:true },
  { id:"hebert_s",     username:"hebert.santos",     name:"Hebert Santos",    role:"Oficina1340",             password:"Oficina1340", canDelete:false, apenasOficina:true },
  { id:"werick",       username:"werick.coelho",     name:"Werick Coelho",    role:"Comercial",               password:"mov2026", canDelete:false, acessoComercial:true },
  { id:"luciana",      username:"luciana.dias",      name:"Luciana Dias",     role:"Comercial",               password:"mov2026", canDelete:false, acessoComercial:true, semSas:true },
  { id:"hebert_s",   username:"hebert.oficina",    name:"Hebert Oficina",   role:"Oficina",                 password:"ofi2026", canDelete:true, apenasOficina:true },
  { id:"matheus_m",  username:"matheus.oficina",   name:"Matheus",          role:"Oficina150",              password:"mat2026", canDelete:true, apenasOfi150:true },
  { id:"rafael",       username:"rafael.tecnico",    name:"Rafael",           role:"Técnico",                 password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"helbert",      username:"helbert.tecnico",   name:"Helbert",          role:"Técnico",                 password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"dilson",       username:"dilson.tecnico",    name:"Dilson",           role:"Líder Metropolitana BH",  password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"anderson",     username:"anderson.tecnico",  name:"Anderson",         role:"Líder Metropolitana BH",  password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"bruno",        username:"bruno.tecnico",     name:"Bruno",            role:"Líder Centro Oeste",      password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"pedro_pimentel",username:"pedro.tecnico",   name:"Pedro Pimentel",   role:"Técnico",                 password:"mov2026", canDelete:true, apenasAgenda150:true },
  { id:"pedro_souza_v", username:"pedro_souza.tecnico", name:"Pedro Souza",  role:"Técnico",                 password:"mov2026", canDelete:true, apenasAgenda150:true },
];
const OFICINA_150_TECHS = ["Matheus","Pedro Souza","Pedro Pimentel"];
const SERVICOS_OFICINA = ["Mecânica","Hidráulica","Pintura","Elétrica","Pequenos Reparos","Bateria","Carregador","Usinagem","Soldagem"];
const OFICINAS_UNID = ["1340","150"];
const REGIONS = {
  metropolitana:{ label:"Metropolitana BH", techs:["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme"] },
  roca:         { label:"Roca",              techs:["Arthur","Eduardo","Luiz Ribeiro"] },
  centroOeste:  { label:"Centro-Oeste",      techs:["Bruno","Marcus"] },
};
const METRO_PREV = ["Rafael","Helbert","Luiz Guilherme"];
const METRO_CORR = ["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme"];
const NAO_PREVENTIVA = ["Anderson","Dilson"];
const OFICINA_TECHS = ["Hebert","Eduardo","João","André","Junio","Lucio","Davi","Reginaldo"];

// ── PLACAS DA FROTA DE CARROS ─────────────────────────────────────────────────
const PLACAS_CARROS = ["PZE4F85","RNE5A21","RTH7C23","RTH7B95","RNP2B27","QXY5H15","PUY4392","OOY0801","RFE6J64","QQC4923","RMF5D28","RNQ3F11"];
const ITENS_REVISAO = [
  {v:"oleo_motor",l:"Óleo Motor"},{v:"oleo_cambio",l:"Óleo Câmbio"},{v:"oleo_freio",l:"Óleo Freio"},
  {v:"oleo_embreagem",l:"Óleo Embreagem"},{v:"filtro_oleo_motor",l:"Filtro Óleo Motor"},{v:"filtro_ar_cond",l:"Filtro Ar Cond."},
  {v:"filtro_ar_motor",l:"Filtro Ar Motor"},{v:"higienizador",l:"Higienizador"},{v:"cabo_velas",l:"Cabo e Velas"},
  {v:"correia_dentada",l:"Correia Dentada"},{v:"correia_alternador",l:"Correia Alternador"},{v:"correia_dh",l:"Correia DH"},
  {v:"correia_servico",l:"Correia Serviço"},{v:"tensor_correias",l:"Tensor Correias"},{v:"outros",l:"Outros"},
];
const CARRO_STATUS = {
  orcamento_pendente:{l:"Orçamento Pendente",c:"#C62828",bg:"#FFF0F0"},
  oficina:           {l:"Oficina",           c:"#E67E00",bg:"#FFF8F0"},
  liberado:          {l:"Liberado",          c:"#1A7A3C",bg:"#F0FFF5"},
};
const APROV_STATUS={
  aguardando_retorno:{l:"⏳ Aguardando Retorno",c:"#E67E00",bg:"#FFF8F0"},
  em_negociacao:{l:"🤝 Em Negociação",c:"#1565C0",bg:"#EFF6FF"},
  aprovado_cliente:{l:"✅ Aprovado pelo Cliente",c:"#1A7A3C",bg:"#F0FFF5"},
  negado_cliente:{l:"❌ Negado pelo Cliente",c:"#C62828",bg:"#FFF0F0"},
  cobrado_faturado:{l:"💰 Cobrado / Faturado",c:"#6A1B9A",bg:"#F3E5F5"},
  encerrado_sem_cobranca:{l:"🔒 Encerrado s/ Cobrança",c:"#546E7A",bg:"#ECEFF1"},
};
const RUP_SOLICITACAO=[
  {v:"sem_estoque",       l:"Sem estoque no almoxarifado"},
  {v:"cadastro_compra",   l:"Solicitação de cadastro e compra"},
  {v:"cadastrado_aguard", l:"Cadastrado e aguardando compra"},
  {v:"compra_aguard_ret", l:"Compra realizada aguardando retorno"},
  {v:"consumo_gilberto",  l:"Consumo Gilberto compras praça"},
];
const RUP_TICKET_OPTS=["cadastro_compra","cadastrado_aguard","compra_aguard_ret"];
const RUP_STATUS=[
  {v:"aguardando",        l:"Aguardando",                    c:"#E67E00",bg:"#FFF8F0"},
  {v:"aguard_aprov_dir",  l:"Aguardando aprovação diretoria",c:"#8E44AD",bg:"#F6F0FB"},
  {v:"separado_suporte",  l:"Separado no Suporte",           c:"#1565C0",bg:"#F0F4FF"},
  {v:"liberado_almox",    l:"Liberado pelo Almox",           c:"#1A7A3C",bg:"#F0FFF5"},
];
const PEND_ACOES = ["Reunião","Envio de Email","Treinamento","Feedback","Retorno para Cliente","Diretoria","Gustavo","Gilberto","Almox","Relatórios","Escala Técnica","Outros"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const fmtDataBR=d=>{if(!d)return"—";if(d.includes("/"))return d;const p=d.split("-");return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d;};
const TODAY      = new Date();
const LOGO_MOV = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAAA+CAYAAAAF19iKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAABCDSURBVHhe7Z15kBzVfcc/r4+5Z++VdlfHaoXEEgljhEoiBmRkJ8JBAcoO8aGEMlfsokjsiiGJHcouByMHu6BcdhycigkkTnAMJiFgYnPjMuaSZA7JkkC3Vrvaa/beuaeP/NE7uzOzM909O6MVReZT1VWrPt50v/ft3+/3fu+9lujp7TGpUSMHgb+rJooaeUiFO2rUqImixjyq4j48qsSSRh9NdR4U2dKZYUIypXE6kmA6nkGRBV3LQsiShIkJJsSTOsPjSVJpHQBJEqxdGWZiKsPQWGK2fCEEqzqCaJpJ71AMgDXLw6iKhDFTViZjMDqVYiqWwZx5Iq9Hpr3FR33QiyyBCUxFMwyOJYgndczsiTXyqNhSeFSJro4Q9UGVwdEkR3qnOdI7zanBGFNxDaspQJIkQn6VdFpnfDJNNKHRGFZZuyKMLInZ8sJ+D16PnPMLACZBn0LAp8CMSEJ+FUkSTEymmYxmUD0S5ywL45+5NhRQ6F5Zh1eV6RuOcbh3ihOnowgB5ywLEwpYZdWYT8WiWNLgxe+R6R2OMzyeZDqeYTqeYWwqRX8kTjSh5Z0/Fc8wPJ6kPxInMpHG71UI+tW8c1whBMm0QWQyxeBogv5IAlMI6kIeZFnQ2uBHCMHx01FGJ1NE4xoT0TQ9gzGSaZ3VHeHCEmvMULEoWpv8TCc0Ysn8xs9SykJb+62DmmYUHi4bw7DciAl4VJnmBi+nIzEyBWVnNINoIoPXI+P3FlqkGlRDFKoik0wb6HqJ1i9AkSS8qkxDyENjnZfxqRTxVKbwtLJQJInGkAdJmExF08hCIAlBciZWKSSa0NANk5Z6X+GhGtUQBdm31CVtzT7OXRlmVXuQWCJDz2AMmIspXGOa1AUU1qwI091ZR3Ojl/5IglTGQMwWV7xcLWNiGgZeT1Ue/31H5bVimshF6t6jymzobqalIf9tHJ5McaI/iikEQgj0MgRViGaYxOIaQ+MJDh6bZGA0gWGYsy5LzLinQlRVQkiCRAlL8v+dikWRSuv4/cpsV3QOE0UWiILd6bRONKHRNxyjMeylqc4zd9A0MTGRhNXDyEVIUn4XUgjiSZ2B0QQjEyky+lzsoBkGac0gGCgewIYCCrIkMTqZKjxUoxqiGBpPEg6oNISKN0ApJqbSTEZTrFwaJDTTeIYJsYSOz6ugKnO3psgSqmz1NtyQzhhMTKVob/LjUfMf0euRaQh6mI6lSaZqlqIYFYtiZCJFLKGxelmYlW1Bgn4Fn1em3kEkumFyOpIAIehcGkSRrFvpj8QJBxRWtPrxe2UCPoVV7SGEJBgYiRcWUxTDMBkcjaMbJh84p4GWeu/MPXlYuzyEqkocPz1deFmNGaqa0QwHFCRJQgCGaZJMGQyNJ4glNBRZYmVbkJGJJFOxud5GU52H5novw+MpJqNphICmsJeWRu+sS0plDAZH5nIe2QxnMqUzOJoo2e31qBLtzX4CPgVZEhgmJFIag6MJEjUrUZKqiCKLIgkkWSBmLIHmsptaDFkWs5lOTTfL6uEUosjSjCjMeXmLGvOpqihqvD+oOKao8f6jJooa86iJosY8Ko4pZBlWLlWoC+QPLhUr1DTh1GCGyZhzsKfIsK7LW7h7HqZpsv94umQPxA5JQFO9TGe7wrbNAS67wE93p0pznURag77hDG8cSvHM6wneeDfJwIhOOjP3Q0G/4KJuH0KYiNyEm7AS7AIrySaAQydT9EWcezx+n2DzOi9B/9z7apU6l8wzDJOnXnPXPV8IFYuiqU7mga+28tGNgcJD89AN+Mp9I/zw8anCQ/Po7lTZ9eByrCq1MGelNrcvnTFZcc1JUunyHqOpTubjlwe56rIAl3zAT9BfJFc/g26YHOrJ8L8vx3jo6WlO9Ftd48awxKGfrsTvcza4//joJHf806ijeDee5+Xxe9ppCJUu892TaTbd2Fe4u2qU/mWXSMLEqwokCcdNVeD3NzuLB2D7JUFkKb9cWbK6qbJE3lbODCoBbLnQz2PfbuPuW5vYtjlgKwiwfnddl4fbdjTyxD3tXPuREJIkGJ82ONLnboR383ofXo/97wBcfVmQ+qB9szz8/JlNvNn/uguEEHhyUtJOXNTtRbVPdhLwS3x4g/thbbeaEAKu2hLk3/9uKRvP8xJw8YbnoijQ1aHy/dtbuPXaOvxewcPPRV39fnOdTEu9/fwNVYFPbA3ljPLOZ3xa5xcvnznXQTVEIUk4NnIurQ0Sl17gL9ydx6o2hWWt7gp10R4wEz9c9wchfvA3rbTUV/bY4aDE1/+sib+9vpHfHksTTzrfRTgosWaF/TNdviFAZ7u9cF7bn2JgzDkmq4TKamfWUthIuwBJEuzYFircPYsQcOG5Xjrb7CtnFuf2QAjY8bEw3/rzFltfXQ4+j+ALn2rgm7c0o7qY7tkQkljf5bG1AtddGcqbr1pIOmPyyt4E0/H3uCgkAWoZogDYepEfT4mXRlUE67rUsk27HR9c6+FLn6mnzsFXZzQYnTQ4NagxHTMcU+uKDBes8eBRnZ/f6xF0daglz12xVOHidfYuc2hMZ8/BlOtZbgvFvpZcIAQlH7QUSxoVNpxbvALqAoLLN7gLRnFhKHxewRc+2UB3Z868jSJMxgx2/usYm27oZf2OU1z9VwM8vStBpvjU07IxTZNlrTLBEmLfutFPU13xY1mO9mY4eDxduLvq2N+FCyQJPC7MZy6yDFtKBJKd7SrrV9s3YB4Oqrj8Qh+f2FraXTFjIW6+a5h/eGSCyISVS3jj3RS3f2+EvUerNxGnu9NDU5F4JuCT2LzOh6+EYLI8uzvO1Bl2HVRDFEKAWqalEALO7/IUdSFX/G7AlY/OYtroQlXgwa8ttS3PNOHL34/wzK44WkFuqW9I47qvD5IsMwdSis42hbbm+Tezsk1h0zovNuEEmgY/eynmqqdTKRWLQpKEbaWXYs0Klc62fFX4fRKfvbLc9Rila2n7pUHHOOKtwyleeGNuNVohp4d17v7RuGN84QaPKlizbP6bsHa5Sle7fSU+9VqM3uEq+TIH7GvMBapiJXfKZfkSla6O/IpY36WyrNW+ctwiy4Lrt9sLzDTh1X1Jegbs088/eTbKMZdJKic2rZufut9+acA2sNYNk/ufmFoUK0FVRJEzGaYcGsKC1cuspX9ZPr3NPnFTjFIV1VwnsbTJvlsbjRu8eSjpOKM8Mq7xyAvVMd1bN/pRcnSvKnDFxfaB9eHeDK/vTxbuPmNULgrFSjuXiywJLvugH99M6rcx7JzUKofzz/GwpNFeFOPTBr9607myNR1ODmSIJysP8pa3ynS0zKnij7aGaG0ofZ+mCU+9Eie9OJ4DqiOKhbkPgA3d3llRrF/tpbWh/Nsp9fZ2dag0hEpXNkBaMxmZtHcdWY72Zhgac3euHZIk2NBtuRBZEnz+43W21nFs2uDVfckznpvIpfxWKEBVBbK8sBvuaFFYu8JyIZdc4KWlfiHxxPwaFQLqggKPwwBUOjO3cMiJE/1aVUQBcOWHLHdx3iqVC8+dH2PkcrgnzcGTZz43kUvFovAolvoXgiLDZ64IEfYLzuv05vlat5RqVFURtl08gNFJveT1hUzHdaKJyt0HwIfO9xH0S1y1JWibDTYMk7cOpxgYWUTfUQ1R+MrMURTy0Y1+li9R2Hie/RtTLjOL0G1JlVHXGc2KLapBR4vCN29p5lqHEdFUhqL5kzNN5aKw6Uq5obNN4Us7GljlMDpYLsmUie5QmeUI2ppZVbh3Yfi8gpuvCfM7q+bnLHIZiGjsWsReR5bKWhTwO/htJ2RZ8Olt1qSVamGaMD5lkEzZ24rmetl1Q/u9Er5FXqX+b7+YJpawf4YzQcVPme09nC1KxQRH+jKMTdmbCo8CkktVtDbKNIbdnVsNpuIGj74QLdy9KFQsCr+34iLOCEd7nUXh9QiWLXHnts5drhYdtzhTvLA7welIGUFPFam4RX3exXt7ijE3mTefyZjBtMOs8eY6iW0u54wuX6rQVGcvIN0wmYgaJa2XW3Qdfvbr6mRQF0LFovCXMcq9mOi6yTO7Sw90MTMAt67L49gV9nsF68/xoNhrgtFJg7seGKs483mkL8O+Y4ubm8ilYlG4tRQZzUoWLSaPPOfsky+5wMeqdvteQENY5g8vCTgGpdMxgwMn0gxVMIfSNOE3B5P0R6ozALcQKhaF25ji/scnuOGuYUc/Xy52Mhsa09nnMEnm/NUe1q2yN3cXdXvoaHUwE8C+oyn2Hklx7PTC3/JY0uS1/UmicbsnO7O4a1EbXFsKHd4+nOLkwOIFT6Zpcvv3Rth1IMWuA0l2HUiyO7sdtLY9B5P83qbSA3GKDN/4fLOrXsp/PhslGjcrGmaPjOm8sm/xcxO5VCwKv8u+u6bDwIjGW4fs39xycQrG9ryT5qadQ9y0c5ibdg5z484IN+2McNNd1nbjzgjf+clk4WWzXLMlyJrlDkEHMB03eP23VmP++u2FP+Oed5L0DCxcVNXAXYva4NZS6LqJpsNjv7S+rV097FWh6yanBrWcLUNP7jZgbcWQZcEXP1XvKrH2w8enmIhascSLb8QWHGz+x9PTi57WLqRiUfhdiiIz86BvHk5WdVqZk6Uol2w6OxQQ/MUf19Pd6Twm0zes8d8vzok9GjfZd7S40Ow4flpj94GFW5lqUfEC459/p50Pbyjtk7Pc+cAY9z40AcBtf1LPnZ9rLjwFgL1HUjz5cpw//Vh43nS9YqQyJj99Lpqz9Nha8p2VqhDWkWxIIHL+kbdv5o/s36GAYPM6Hy02E2CYGX7/7sMT3PPQRN4E389uD3PfX7fmnevEnf8yxr0/turobFKxKF68r4NNDotYAL72z2N892HrgZctUdj70Aq8RQak7vjBKI++GOWhO9u4eL3zW0qOA5lf2pnn9f0pPnnHIBPT+TY/6JM49tjKvE8K2BGNm3zk1j7e7SnfwlQbd3dsg9suqZbz8dPBEZ1fFplBnc6YPPFSjMawTDjgvonFWRCEaVprQ66/c2ieIABiSYMjve4b+KW3EwyMzC/nbOCuRW1wOyCWGzwZpslzu6zvXObSH9HoG9ZY2izT6LBa6mxiGCZPvx7nxruG6beZAPP87tKfc8wlo1mzyqMLDE6rTcU177b3kfv5RNOENw+l6B3Kr9DfvJvCMGFpk+z4jYazhWnC//wqxhfvjXCi394SvLY/6epjKv2RDLsOJBznfywWFdd8sVVexdC0fPEc69M4eGIu82cY8PNXY0iSoKVexufSLS0Wmg6nBjW+8cAYn/v7CIMu5msOj+kMjDqfd/y0xjsn7AW2mFQcaJ58YiXNdc69hFu+HeHHT899gUWSBLftqOeOG5pQFZiIGmz/y37e6Unz5esa+cr1jXnXn02O9GZ46tU4//VilLcOu+8y1geteZiFC5zyRnZN2Hs4zXN74q5czWJQsSge/OpSwgGBJAlkyUQIa8KsLFkNn/0s0d0/Guf5PflfYOnu9HD3rU0EfBI9Axm+fv8YY1M6N19dz9VbAoiZj4hZuQOrLOujY3OTcoWwPoeQzS9kz529ZqZbKrD+R4G841hlZa/LlmOa1rjJ3iMpnt2V4O3DKUYn9QWtKc12e0viYi7pYlOxKGq8/3hvOe4a7wlqoqgxD/Hkk0/W3EeNPP4PQWMCzxZukRMAAAAASUVORK5CYII=";
const PAD        = n=>String(n).padStart(2,"0");
const fmtDate    = d=>`${d.getFullYear()}-${PAD(d.getMonth()+1)}-${PAD(d.getDate())}`;
const TODAY_STR  = fmtDate(TODAY);
const diffDays   = s=>{ if(!s) return null; const d=Math.floor((TODAY-new Date(s))/86400000); return d>=0?d:null; };
const TIPOS = [
  {v:"preventivo",l:"📋 Preventivo",color:"#2563EB",bg:"#EFF6FF"},
  {v:"corretivo",l:"🔧 Corretivo",color:"#EF4444",bg:"#FEF2F2"},
  {v:"a_faturar",l:"💰 A Faturar",color:"#16A34A",bg:"#F0FDF4"},
  {v:"mau_uso",l:"⚠️ Mau Uso",color:"#EA580C",bg:"#FFEDD5"},
  {v:"entrega_tecnica",l:"📦 Entrega Técnica",color:"#7C3AED",bg:"#EDE9FE"},
  {v:"bateria",l:"🔋 Bateria",color:"#00838F",bg:"#F0FAFA"},
  {v:"carregador",l:"🔌 Carregador",color:"#AD1457",bg:"#FFF0F5"},
];
const tipoCfg = v=>TIPOS.find(t=>t.v===v)||TIPOS[0];
const TC = {"Anderson":"#E67E00","Dilson":"#1A7A3C","Rafael":"#1565C0","Helbert":"#6A1B9A","Luiz Guilherme":"#C62828","Denison":"#00838F","Arthur":"#4E342E","Eduardo":"#37474F","Luiz Ribeiro":"#558B2F","Bruno":"#AD1457","Marcus":"#283593"};
const techColor = t=>TC[t]||"#555";
const statusCfg = {
  "aberto":{color:"#EF4444",bg:"#FEF2F2",label:"Aberto"},
  "em andamento":{color:"#EA580C",bg:"#FFEDD5",label:"Em Andamento"},
  "acompanhar":{color:"#2563EB",bg:"#EFF6FF",label:"Acompanhar"},
  "concluído":{color:"#16A34A",bg:"#F0FDF4",label:"Concluído"},
};
const empSitCfg = {
  "Atendido":{color:"#16A34A",bg:"#F0FDF4"},
  "Pendente":{color:"#EF4444",bg:"#FEF2F2"},
  "Parcialmente Atendido":{color:"#EA580C",bg:"#FFEDD5"},
  "Aprovado":{color:"#2563EB",bg:"#EFF6FF"},
  "Retorno Concluído":{color:"#0D9488",bg:"#CCFBF1"},
  "Ruptura":{color:"#EF4444",bg:"#FEF2F2"},
};
const PROCESS_STATUS = {
  "em_andamento": {color:"#E67E00", bg:"#FFF8F0", label:"Em Andamento"},
  "pendente":      {color:"#C62828", bg:"#FFF0F0", label:"Pendente"},
  "ag_diretoria":  {color:"#1565C0", bg:"#F0F4FF", label:"Ag. Diretoria"},
  "concluido":     {color:"#1A7A3C", bg:"#F0FFF5", label:"Concluído"},
  "arquivado":     {color:"#888",    bg:"#F5F5F5", label:"📁 Arquivado"},
};
const PSTag=({status})=>{const c=PROCESS_STATUS[status]||PROCESS_STATUS["em_andamento"];return<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,color:c.color,background:c.bg,whiteSpace:"nowrap"}}>{c.label}</span>;};
const PSSelect=({value,onChange})=>(
  <select value={value||"em_andamento"} onChange={e=>onChange(e.target.value)}
    style={{fontSize:11,padding:"3px 6px",color:(PROCESS_STATUS[value||"em_andamento"]||PROCESS_STATUS["em_andamento"]).color,background:(PROCESS_STATUS[value||"em_andamento"]||PROCESS_STATUS["em_andamento"]).bg,border:"none",borderRadius:5,fontWeight:700,cursor:"pointer"}}>
    <option value="em_andamento">Em Andamento</option>
    <option value="pendente">Pendente</option>
    <option value="ag_diretoria">Ag. Diretoria</option>
    <option value="concluido">Concluído</option>
    <option value="arquivado">📁 Arquivar</option>
  </select>
);
// Situações da Escala (com filtro)
const ESCALA_STATUS = {
  agendada:                  {l:"Agendada",                  c:"#1565C0", bg:"#F0F4FF"},
  preventiva_concluida:      {l:"Preventiva concluída",      c:"#1A7A3C", bg:"#F0FFF5"},
  corretiva_concluida:       {l:"Corretiva concluída",       c:"#1A7A3C", bg:"#F0FFF5"},
  corretiva_pendente_pecas:  {l:"Corretiva pendente peças",  c:"#E67E00", bg:"#FFF8F0"},
  preventiva_pendente_pecas: {l:"Preventiva pendente peças", c:"#E67E00", bg:"#FFF8F0"},
  preventiva_reagendada:     {l:"Preventiva reagendada",     c:"#8E44AD", bg:"#F6F0FB"},
  cancelada:                 {l:"Cancelada",                 c:"#C62828", bg:"#FFF0F0"},
  mau_uso:                   {l:"Mau Uso",                   c:"#C47D00", bg:"#FFFBF0"},
  a_faturar:                 {l:"A Faturar",                 c:"#00838F", bg:"#E0F7FA"},
  ferias:                    {l:"Férias",                    c:"#5C6BC0", bg:"#EEF0FB"},
  entrega_tecnica:           {l:"Entrega Técnica",           c:"#7B1FA2", bg:"#F6EAFB"},
};
const ESCALA_STATUS_KEYS = Object.keys(ESCALA_STATUS);
const escSt = s => ESCALA_STATUS[s] || ESCALA_STATUS.agendada;
// Data/hora de registro (formato brasileiro)
const fmtDateTime = iso => { if(!iso) return "—"; const d=new Date(iso); if(isNaN(d)) return "—"; return d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); };
const REL_STATUS = {
  "Preventiva concluída":      {color:"#1A7A3C", bg:"#F0FFF5"},
  "Preventiva pendente peças": {color:"#E67E00", bg:"#FFF8F0"},
  "Corretiva concluída":       {color:"#1A7A3C", bg:"#F0FFF5"},
  "Corretiva pendente peças":  {color:"#E67E00", bg:"#FFF8F0"},
};
const REL_STATUS_KEYS = Object.keys(REL_STATUS);
const isPendentePecas = s => s==="Preventiva pendente peças" || s==="Corretiva pendente peças";
const EXECUTADO_OPTS = ["", "Sim", "Não", "Devolvido"];
// Calcula Horas Trabalhadas = Saída − Entrada (formato HH:MM)

const getDOW = (dateStr) => {
  const [y,m,d] = dateStr.split("-").map(Number);
  return new Date(y, m-1, d).getDay();
};

const calcHoras = (entrada, saida) => {
  if(!entrada || !saida) return "";
  const [h1,m1]=String(entrada).split(":").map(Number);
  const [h2,m2]=String(saida).split(":").map(Number);
  if([h1,m1,h2,m2].some(n=>Number.isNaN(n))) return "";
  let mins=(h2*60+m2)-(h1*60+m1);
  if(mins<0) mins+=24*60;
  return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`;
};
// Carrega SheetJS sob demanda (sem precisar instalar nada)
const loadXLSX = () => new Promise((resolve,reject)=>{
  if(window.XLSX) return resolve(window.XLSX);
  const sc=document.createElement("script");
  sc.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  sc.onload=()=>resolve(window.XLSX);
  sc.onerror=()=>reject(new Error("Falha ao carregar leitor de Excel"));
  document.body.appendChild(sc);
});
// Mapeia rótulo de Tipo (planilha) para valor interno
const mapTipo = label => {
  const t=(label||"").toString().toLowerCase();
  const found=TIPOS.find(x=>x.l.toLowerCase().includes(t)&&t)||TIPOS.find(x=>t.includes(x.v));
  return found?found.v:"corretivo";
};

const AGENDA_STATUS = {
  "agendada":{color:"#2563EB",bg:"#EFF6FF",dot:"#1565C0",label:"Agendada"},
  "confirmada":{color:"#16A34A",bg:"#F0FDF4",dot:"#1A7A3C",label:"Confirmada"},
  "concluida":{color:"#00838F",bg:"#F0FAFA",dot:"#00838F",label:"Concluída"},
  "cancelada":{color:"#EF4444",bg:"#FEF2F2",dot:"#C62828",label:"Cancelada"},
  "remarcada":{color:"#EA580C",bg:"#FFEDD5",dot:"#E67E00",label:"Remarcada"},
  "nao_atende":{color:"#7C3AED",bg:"#EDE9FE",dot:"#6A1B9A",label:"Cliente não atende"},
};
const getDaysInMonth=(y,m)=>new Date(y,m+1,0).getDate();
const getDayOfWeek=(y,m,d)=>new Date(y,m,d).getDay();
const DB_STATS={total:0,preventivos:0,corretivos:0,a_faturar:0,mau_uso:0};

// Dados reais — relatórios (junho 2026 em diante serão inseridos manualmente)
const REAL_REPORTS = [];


const EMP_DATA = [];

const SAIDA_DATA = [];

// ── COMPONENTES BASE ──────────────────────────────────────────────────────────
const Tag=({children,color,bg,border})=>(<span style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:.6,padding:"3px 8px",borderRadius:5,color,background:bg,border:`1px solid ${border||bg}`}}>{children}</span>);
const Inp=({label,value,onChange,placeholder,type="text",style={}})=>(<div style={{display:"flex",flexDirection:"column",gap:4,...style}}>{label&&<div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>{label}</div>}<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""}/></div>);
const Sel=({label,value,onChange,options,style={}})=>(<div style={{display:"flex",flexDirection:"column",gap:4,...style}}>{label&&<div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>{label}</div>}<select value={value||""} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select></div>);
const BtnY=({children,onClick,disabled,style={}})=>(<button className="btn btn-primary" onClick={onClick} disabled={disabled} style={style}>{children}</button>);
const BtnG=({children,onClick,style={}})=>(<button className="btn btn-ghost" onClick={onClick} style={style}>{children}</button>);
const SlaBadge=({days})=>{if(days===null||days===undefined)return<span style={{color:"#CCC",fontSize:11}}>—</span>;const color=days>30?"#C62828":days>15?"#E67E00":"#1A7A3C";const bg=days>30?"#FFF0F0":days>15?"#FFF8F0":"#F0FFF5";return<span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:5,color,background:bg}}>{days}d</span>;};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin, users=USERS}){
  const list = users&&users.length?users:USERS;
  const [username,setUsername]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const usernameRef=useRef();
  const handle=()=>{
    if(!username.trim()){setErr("Informe seu usuário.");return;}
    setLoading(true);
    setTimeout(()=>{
      const u=list.find(x=>(x.username||x.id)===username.trim().toLowerCase()&&x.password===pass)
               ||USERS.find(x=>(x.username||x.id)===username.trim().toLowerCase()&&x.password===pass);
      if(u)onLogin(u);
      else{setErr("Usuário ou senha incorretos.");setLoading(false);}
    },400);
  };
  return(
    <div style={{minHeight:"100vh",background:"radial-gradient(circle at 20% 20%, #2A2A2A 0%, #0D0D0D 60%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:"-15%",right:"-10%",width:500,height:500,background:"radial-gradient(circle,rgba(245,194,0,.15) 0%,transparent 70%)",pointerEvents:"none",animation:"float1 8s ease-in-out infinite"}}/>
      <div style={{position:"fixed",bottom:"-15%",left:"-10%",width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.10) 0%,transparent 70%)",pointerEvents:"none",animation:"float2 10s ease-in-out infinite"}}/>
      <div style={{position:"fixed",top:"40%",left:"50%",width:300,height:300,background:"radial-gradient(circle,rgba(255,255,255,.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 8px 32px rgba(245,194,0,.25)}50%{box-shadow:0 8px 48px rgba(245,194,0,.4)}}
      `}</style>

      <div style={{background:"rgba(255,255,255,.98)",backdropFilter:"blur(24px)",borderRadius:20,padding:44,border:"1px solid rgba(255,255,255,.3)",width:"100%",maxWidth:430,boxShadow:"0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",position:"relative",overflow:"hidden",animation:"slideUp .5s ease"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:5,background:"linear-gradient(90deg,#F5C200,#FFE066,#F5C200)"}}/>

        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:120,margin:"0 auto 18px",borderRadius:16,overflow:"hidden",boxShadow:"0 12px 32px rgba(0,0,0,.25)",animation:"glow 3s ease-in-out infinite"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={{fontSize:24,fontWeight:900,color:"#1A1A1A",letterSpacing:-.8}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#999",marginTop:5,letterSpacing:.8,fontWeight:600,textTransform:"uppercase"}}>Sistema de Gestão de Manutenção</div>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{display:"block",fontSize:11,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Usuário</label>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#BBB"}}>👤</span>
            <input ref={usernameRef} type="text" value={username} autoComplete="username" onChange={e=>{setUsername(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="nome.cargo" style={{width:"100%",padding:"13px 14px 13px 40px",fontSize:14,borderRadius:12,border:"2px solid #EEE",background:"#FAFAFA",boxSizing:"border-box",transition:"border-color .2s,background .2s",outline:"none"}} onFocus={e=>{e.target.style.borderColor="#F5C200";e.target.style.background="#FFF";}} onBlurCapture={e=>{e.target.style.borderColor="#EEE";e.target.style.background="#FAFAFA";}}/>
          </div>
        </div>
        <div style={{marginBottom:26}}>
          <label style={{display:"block",fontSize:11,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Senha</label>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#BBB"}}>🔒</span>
            <input type="password" value={pass} autoComplete="current-password" onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"13px 14px 13px 40px",fontSize:14,borderRadius:12,border:"2px solid #EEE",background:"#FAFAFA",boxSizing:"border-box",transition:"border-color .2s,background .2s",outline:"none"}} onFocus={e=>{e.target.style.borderColor="#F5C200";e.target.style.background="#FFF";}} onBlurCapture={e=>{e.target.style.borderColor="#EEE";e.target.style.background="#FAFAFA";}}/>
          </div>
        </div>

        {err&&<div style={{background:"#FFF0F0",border:"1.5px solid #FFCDD2",borderRadius:10,padding:"7px 10px",fontSize:12,color:"#C62828",marginBottom:18,fontWeight:700,display:"flex",alignItems:"center",gap:6,animation:"slideUp .3s ease"}}><span>⚠️</span>{err}</div>}

        <button onClick={handle} disabled={loading} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:loading?"#E0E0E0":"linear-gradient(135deg,#F5C200,#E0AD00)",color:"#1A1A1A",fontSize:13,fontWeight:800,cursor:loading?"not-allowed":"pointer",transition:"all .25s",boxShadow:loading?"none":"0 6px 20px rgba(245,194,0,.45)",letterSpacing:.3}}
          onMouseEnter={e=>{if(!loading){e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 8px 26px rgba(245,194,0,.55)";}}}
          onMouseLeave={e=>{e.target.style.transform="translateY(0)";e.target.style.boxShadow=loading?"none":"0 6px 20px rgba(245,194,0,.45)";}}>
          {loading?"⏳ Entrando...":"Entrar →"}
        </button>

        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:"#CCC"}}>Grupo MOV © {new Date().getFullYear()}</div>
      </div>
    </div>
  );
}


function ReportModal({onClose,onSave,techs=ALL_TECHS,initial}){
  const [mode,setMode]=useState("manual");
  const [text,setText]=useState("");
  const [analyzing,setAnalyzing]=useState(false);
  const [err,setErr]=useState("");
  const fileRef=useRef();
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",tecnico:techs[0],region:"metropolitana",type:"corretivo",reportNum:"",execRelatorio:"",acao:"",status:"",urgent:false,sla:8,horaEntrada:"",horaSaida:"",horasTrabalhadas:"",horasDeslocamento:"",requisicaoPeca:"",numChamado:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const analyzeAI=async(content)=>{
    setAnalyzing(true);setErr("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Analise o relatório e retorne SOMENTE JSON válido:\n{"reportNum":"","empresa":"","patrimonio":"","tecnico":"","acao":"","tipo":"preventivo|corretivo|a_faturar|mau_uso|entrega_tecnica|bateria|carregador","urgente":false,"horaEntrada":"HH:MM","horaSaida":"HH:MM","numChamado":"","obs":""}\nRelatório:\n${content}`}]})});
      const data=await res.json();
      const parsed=JSON.parse(data.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim());
      setForm(p=>({...p,reportNum:parsed.reportNum||p.reportNum,empresa:parsed.empresa||p.empresa,patrimonio:parsed.patrimonio||p.patrimonio,tecnico:ALL_TECHS.includes(parsed.tecnico)?parsed.tecnico:p.tecnico,acao:parsed.acao||p.acao,type:parsed.tipo||p.type,urgent:parsed.urgente||false,horaEntrada:parsed.horaEntrada||p.horaEntrada,horaSaida:parsed.horaSaida||p.horaSaida,numChamado:parsed.numChamado||p.numChamado,obs:parsed.obs||p.obs}));
      setMode("manual");
    }catch(e){setErr("Erro ao analisar. Preencha manualmente.");}
    setAnalyzing(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>➕ Novo Relatório</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {[["manual","✏️ Manual"],["texto","🤖 Colar texto (IA)"],["arquivo","📎 Arquivo"]].map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px 0",borderRadius:8,border:`2px solid ${mode===m?"#F5C200":"#E0E0E0"}`,background:mode===m?"#FFFBF0":"#FFF",fontWeight:600,fontSize:12,cursor:"pointer",color:mode===m?"#C47D00":"#888"}}>{l}</button>
            ))}
          </div>
          {mode==="texto"&&<div style={{marginBottom:16}}><textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Cole o texto do relatório..." style={{width:"100%",resize:"none"}}/><div style={{marginTop:8}}><BtnY onClick={()=>analyzeAI(text)} disabled={analyzing||!text.trim()}>{analyzing?"⏳ Analisando...":"🤖 Analisar com IA"}</BtnY></div></div>}
          {mode==="arquivo"&&<div style={{marginBottom:16,padding:20,background:"#FAFAFA",borderRadius:10,border:"2px dashed #E0E0E0",textAlign:"center"}}><div style={{fontSize:13,color:"#888",marginBottom:10}}>Para PDF/Excel: abra o arquivo, copie o texto e use "Colar texto (IA)"</div><input type="file" ref={fileRef} onChange={async e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async ev=>{await analyzeAI(ev.target.result.slice(0,3000));};r.readAsText(f);}} accept=".txt,.csv" style={{display:"none"}}/><BtnY onClick={()=>fileRef.current.click()}>Selecionar .txt / .csv</BtnY></div>}
          {err&&<div style={{fontSize:12,color:"#C62828",marginBottom:12,padding:"8px 12px",background:"#FFF0F0",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <Inp label="Nº Relatório" value={form.reportNum} onChange={v=>upd("reportNum",v)} placeholder="REL-2026-001"/>
              <Inp label="Empresa/Cliente" value={form.empresa} onChange={v=>upd("empresa",v)} placeholder="Nome da empresa"/>
              <Inp label="Patrimônio" value={form.patrimonio} onChange={v=>upd("patrimonio",v)} placeholder="PAT-000"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <Sel label="Tipo" value={form.type} onChange={v=>upd("type",v)} options={TIPOS.map(t=>({v:t.v,l:t.l}))}/>
              <Sel label="Técnico" value={form.tecnico} onChange={v=>upd("tecnico",v)} options={techs}/>
              <Sel label="Região" value={form.region} onChange={v=>upd("region",v)} options={[{v:"metropolitana",l:"Metropolitana BH"},{v:"roca",l:"Roca"},{v:"centroOeste",l:"Centro-Oeste"}]}/>
            </div>
            <div><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Ação / O que foi feito</div><textarea value={form.acao} onChange={e=>upd("acao",e.target.value)} rows={3} placeholder="Descreva a ação..." style={{width:"100%",resize:"none"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Data</div><input type="date" value={form.date||""} onChange={e=>upd("date",e.target.value)} style={{width:"100%"}}/></div>
              <Inp label="Nº Chamado" value={form.numChamado} onChange={v=>upd("numChamado",v)} placeholder="CHM-001"/>
              <Inp label="Nº Execução/Retorno" value={form.execRelatorio} onChange={v=>upd("execRelatorio",v)} placeholder="EXE-001"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,background:"#FFFBF0",padding:12,borderRadius:10,border:"1px solid #FFE8A0"}}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Entrada</div><input type="time" value={form.horaEntrada||""} onChange={e=>upd("horaEntrada",e.target.value)} style={{width:"100%"}}/></div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Saída</div><input type="time" value={form.horaSaida||""} onChange={e=>upd("horaSaida",e.target.value)} style={{width:"100%"}}/></div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Trabalhadas</div><div style={{padding:"9px 12px",borderRadius:8,background:"#FFFBF0",border:"1px solid #FFE8A0",fontSize:13,fontWeight:700,color:"#C47D00"}}>{calcHoras(form.horaEntrada,form.horaSaida)||"—"}</div></div>
              <Inp label="Deslocamento" value={form.horasDeslocamento} onChange={v=>upd("horasDeslocamento",v)} placeholder="01:00"/>
              <Inp label="Req. Peça" value={form.requisicaoPeca} onChange={v=>upd("requisicaoPeca",v)} placeholder="REQ-001"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"end"}}>
              <Sel label="Status" value={form.status} onChange={v=>upd("status",v)} options={[{v:"",l:"— selecionar —"},...REL_STATUS_KEYS.map(v=>({v,l:v}))]}/>
              <div><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Urgente</div><div style={{display:"flex",alignItems:"center",gap:10}}><input type="checkbox" checked={form.urgent} onChange={e=>upd("urgent",e.target.checked)} style={{width:18,height:18}}/><span style={{fontSize:13,color:form.urgent?"#C62828":"#888",fontWeight:form.urgent?700:400}}>{form.urgent?"SIM":"Não"}</span></div></div>
            </div>
            <Inp label="Observações" value={form.obs} onChange={v=>upd("obs",v)} placeholder="Observações adicionais..."/>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:20}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={()=>{onSave({...form,horasTrabalhadas:calcHoras(form.horaEntrada,form.horaSaida)||form.horasTrabalhadas,id:`R${Date.now()}`});onClose();}} disabled={!form.empresa}>Salvar</BtnY>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL IMPORTAR EXCEL ──────────────────────────────────────────────────────
const IMPORT_COLS = ["Data","Nº Relatório","Tipo","Empresa","Patrimônio","Técnico","Data Atend.","Chamado","Ação","Horas Trab.","Status"];
function ImportExcelModal({onClose,onImport}){
  const [rows,setRows]=useState(null);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const fileRef=useRef();

  const pick=k=>(o)=>{ // pega valor por nome de coluna (tolerante a variações)
    const keys=Object.keys(o);
    const found=keys.find(x=>x.trim().toLowerCase()===k.toLowerCase());
    return found?o[found]:"";
  };
  const parseCSV=(txt)=>{
    const sep=txt.indexOf(";")>-1&&(txt.indexOf(";")<txt.indexOf(",")||txt.indexOf(",")===-1)?";":",";
    const lines=txt.replace(/\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim());
    if(!lines.length)return[];
    const head=lines[0].split(sep).map(h=>h.replace(/^"|"$/g,"").trim());
    return lines.slice(1).map(l=>{
      const cells=l.split(sep).map(c=>c.replace(/^"|"$/g,"").trim());
      const o={}; head.forEach((h,i)=>o[h]=cells[i]||""); return o;
    });
  };
  const onFile=async(f)=>{
    if(!f)return; setErr(""); setLoading(true); setRows(null);
    try{
      if(/\.csv$/i.test(f.name)){
        const txt=await f.text(); const data=parseCSV(txt);
        if(!data.length){setErr("Planilha vazia.");}else setRows(data);
      }else{
        const XLSX=await loadXLSX();
        const buf=await f.arrayBuffer();
        const wb=XLSX.read(buf,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const data=XLSX.utils.sheet_to_json(ws,{defval:"",raw:false});
        if(!data.length){setErr("Planilha vazia.");}else setRows(data);
      }
    }catch(e){setErr("Não consegui ler o arquivo. Use .xlsx, .xls ou .csv.");}
    setLoading(false);
  };
  const baixarModelo=async()=>{
    try{
      const XLSX=await loadXLSX();
      const ws=XLSX.utils.json_to_sheet([Object.fromEntries(IMPORT_COLS.map(c=>[c,""]))]);
      const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Relatórios");
      XLSX.writeFile(wb,"modelo_relatorios.xlsx");
    }catch(e){
      const csv="\uFEFF"+IMPORT_COLS.join(";")+"\n";
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download="modelo_relatorios.csv";a.click();
    }
  };
  const confirmar=()=>{
    const novos=rows.map((o,i)=>{
      const st=String(pick("Status")(o)||"").trim();
      return {
        id:`R${Date.now()}${i}`,
        dataReg:String(pick("Data")(o)||""),
        reportNum:String(pick("Nº Relatório")(o)||pick("No Relatório")(o)||pick("Numero")(o)||""),
        type:mapTipo(pick("Tipo")(o)),
        empresa:String(pick("Empresa")(o)||""),
        patrimonio:String(pick("Patrimônio")(o)||pick("Patrimonio")(o)||""),
        tecnico:String(pick("Técnico")(o)||pick("Tecnico")(o)||""),
        date:String(pick("Data Atend.")(o)||pick("Data Atendimento")(o)||""),
        dataAtendimento:String(pick("Data Atend.")(o)||pick("Data Atendimento")(o)||""),
        atendimento:mapTipo(pick("Tipo")(o)),
        numChamado:String(pick("Chamado")(o)||""),chamado:String(pick("Chamado")(o)||""),
        acao:String(pick("Ação")(o)||pick("Acao")(o)||""),
        horasTrabalhadas:String(pick("Horas Trab.")(o)||pick("Horas")(o)||""),
        status:REL_STATUS_KEYS.includes(st)?st:"",
        processoStatus:"em_andamento",statusFinal:String(pick("Status")(o)||pick("Status Final")(o)||"Pendente"),
      };
    });
    onImport(novos);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:680,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>📥 Importar relatórios via Excel</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{fontSize:13,color:"#666",marginBottom:10}}>Selecione uma planilha com estas colunas na primeira aba (a ordem pode variar — eu localizo pelo nome):</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:16}}>
            {IMPORT_COLS.map(c=><span key={c} style={{fontSize:11,background:"#F5F5F5",border:"1px solid #E8E8E8",borderRadius:20,padding:"3px 10px"}}>{c}</span>)}
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <input type="file" ref={fileRef} accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={e=>onFile(e.target.files[0])}/>
            <BtnY onClick={()=>fileRef.current.click()}>{loading?"⏳ Lendo...":"📎 Escolher arquivo"}</BtnY>
            <BtnG onClick={baixarModelo}>⬇️ Baixar modelo</BtnG>
          </div>
          {err&&<div style={{fontSize:12,color:"#C62828",marginBottom:12,padding:"8px 12px",background:"#FFF0F0",borderRadius:8}}>{err}</div>}
          {rows&&(
            <div style={{border:"1px solid #E8E8E8",borderRadius:10,overflow:"hidden"}}>
              <div style={{background:"#F8F8F8",padding:"8px 12px",fontSize:12,color:"#666",borderBottom:"1px solid #EEE"}}>Pré-visualização — {rows.length} linha(s)</div>
              <div style={{overflowX:"auto",maxHeight:200}}>
                <table style={{minWidth:600}}><thead><tr>{Object.keys(rows[0]).slice(0,8).map(k=><th key={k}>{k}</th>)}</tr></thead>
                <tbody>{rows.slice(0,5).map((r,i)=><tr key={i}>{Object.keys(rows[0]).slice(0,8).map(k=><td key={k} style={{fontSize:11}}>{String(r[k])}</td>)}</tr>)}</tbody></table>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:20}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={confirmar} disabled={!rows}>Importar {rows?`(${rows.length})`:""}</BtnY>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL PROCESSO (Mau Uso / A Faturar) ─────────────────────────────────────
function ProcessoModal({onClose,onSave,tipo,initial}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState(initial||{date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>{initial?(isMU?"✏️ Editar Mau Uso":"✏️ Editar A Faturar"):(isMU?"⚠️ Novo Mau Uso":"💰 Novo A Faturar")}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp type="date" label="Data" value={form.date} onChange={v=>upd("date",v)}/>
            <Inp label="Empresa" value={form.empresa} onChange={v=>upd("empresa",v)} placeholder="Nome da empresa"/>
            <Inp label="Patrimônio" value={form.patrimonio} onChange={v=>upd("patrimonio",v)} placeholder="PAT-000"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº Relatório" value={form.relatorio} onChange={v=>upd("relatorio",v)} placeholder="REL-2026-001"/>
            <Inp label="Chamado" value={form.chamado} onChange={v=>upd("chamado",v)} placeholder="CHM-001"/>
          </div>
          <div style={{background:"#F8F8F8",borderRadius:10,padding:16,border:"1px solid #E8E8E8"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Aprovação</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"end"}}>
              <Sel label="Enviado para Aprovação?" value={form.enviadoAprovacao} onChange={v=>upd("enviadoAprovacao",v)} options={[{v:"nao",l:"Não"},{v:"sim",l:"Sim"}]}/>
              {form.enviadoAprovacao==="sim"?<div><Inp type="date" label="Data do Envio" value={form.dataEnvio} onChange={v=>upd("dataEnvio",v)}/>{sla!==null&&<div style={{marginTop:6,fontSize:11,color:"#888"}}>SLA desde envio: <SlaBadge days={sla}/></div>}</div>:<div style={{fontSize:12,color:"#C62828",fontWeight:600,paddingTop:20}}>⏱ SLA contando — aguardando envio</div>}
            </div>
            <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr",gap:12}}>
              <Sel label="Aprovado?" value={form.aprovado} onChange={v=>upd("aprovado",v)} options={[{v:"nao",l:"Não"},{v:"sim",l:"Sim — aprovado"}]}/>
              {isMU&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Inp label="💰 Valor (R$)" value={form.valor} onChange={v=>upd("valor",v)} placeholder="0,00"/>
                <Inp label="OV" value={form.ov} onChange={v=>upd("ov",v)} placeholder="OV-001"/>
              </div>}
              {form.aprovado==="sim"&&<div style={{display:"grid",gridTemplateColumns:isMU?"1fr 1fr":"1fr 1fr",gap:12}}>
                {isMU&&<Inp label="Nº Mau Uso" value={form.numMauUso} onChange={v=>upd("numMauUso",v)} placeholder="MU-001"/>}
                {!isMU&&<Inp label="OV" value={form.ov} onChange={v=>upd("ov",v)} placeholder="OV-001"/>}
                <Inp label="Aprovado por" value={form.aprovadoPor} onChange={v=>upd("aprovadoPor",v)} placeholder="Nome"/>
              </div>}
            </div>
          </div>
          {!isMU&&<div style={{background:"#F0FFF5",borderRadius:10,padding:16,border:"1px solid #A0DDBB"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1A7A3C",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Execução</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <Sel label="Serviço será executado?" value={form.servicoExecutado} onChange={v=>upd("servicoExecutado",v)} options={[{v:"nao",l:"Não"},{v:"sim",l:"Sim"}]}/>
              <Inp label="Nº Chamado" value={form.numChamado2} onChange={v=>upd("numChamado2",v)} placeholder="CHM-001"/>
              <Inp label="Nº Relatório" value={form.relatorio2} onChange={v=>upd("relatorio2",v)} placeholder="REL-001"/>
            </div>
          </div>}
          <Inp label="Observações / Preenchimento livre" value={form.obs} onChange={v=>upd("obs",v)} placeholder="Anotações..."/>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={()=>{onSave({...form,id:form.id||`P${Date.now()}`,tipo});onClose();}} disabled={!form.empresa}>Salvar</BtnY>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL EMPRÉSTIMO ──────────────────────────────────────────────────────────
function EmpModal({onClose,onSave,initial}){
  const [form,setForm]=useState(initial||{req:"",data:TODAY_STR,natureza:"Empréstimo/Obriga Retorno",requerente:"",item:"",descricao:"",situacao:"Aprovado",statusRuptura:"normal",centroResultado:"",quant:"1",retorno:"",dataRetorno:"",observacao:"",retornoAlmox:"",retornoSistema:"",numRelatorio:"",slaAlert:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=(form.dataRetorno&&form.data)?Math.round((new Date(form.dataRetorno)-new Date(form.data))/(1000*60*60*24)):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>🔄 Requisição Empréstimo</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Nº REQ" value={form.req} onChange={v=>upd("req",v)} placeholder="8821"/>
            <Inp type="date" label="Data" value={form.data} onChange={v=>upd("data",v)}/>
            <Sel label="Situação" value={form.situacao} onChange={v=>upd("situacao",v)} options={["Aprovado","Atendido","Pendente","Parcialmente Atendido","Retorno Concluído","Ruptura"]}/>
          </div>
          <Inp label="Requerente" value={form.requerente} onChange={v=>upd("requerente",v)} placeholder="Nome do requerente"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12}}>
            <Inp label="Ítem (Código)" value={form.item} onChange={v=>upd("item",v)} placeholder="2316816"/>
            <Inp label="Descrição" value={form.descricao} onChange={v=>upd("descricao",v)} placeholder="Descrição da peça"/>
          </div>
          <Inp label="Centro de Resultado / Patrimônio" value={form.centroResultado} onChange={v=>upd("centroResultado",v)} placeholder="PAT-001 EQUIPAMENTO SN..."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Quantidade" value={form.quant} onChange={v=>upd("quant",v)} placeholder="1"/>
            <Inp label="Nº Retorno" value={form.retorno} onChange={v=>upd("retorno",v)} placeholder="9081"/>
            <div><Inp type="date" label="Data Retorno" value={form.dataRetorno} onChange={v=>upd("dataRetorno",v)}/>
              {sla!==null&&<div style={{marginTop:4,fontSize:11,color:"#888"}}>SLA: <SlaBadge days={sla}/></div>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº Relatório da Peça" value={form.numRelatorio} onChange={v=>upd("numRelatorio",v)} placeholder="REL-001"/>
            <Inp label="Observação" value={form.observacao} onChange={v=>upd("observacao",v)} placeholder="Obs..."/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Retorno Almoxarifado" value={form.retornoAlmox} onChange={v=>upd("retornoAlmox",v)} placeholder="Data/info"/>
            <Inp label="Retorno Sistema" value={form.retornoSistema} onChange={v=>upd("retornoSistema",v)} placeholder="Data/info"/>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={()=>{onSave({...form,id:form.id||`EMP${Date.now()}`});onClose();}} disabled={!form.requerente&&!form.descricao}>Salvar</BtnY>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL SAÍDA/ENTRADA ───────────────────────────────────────────────────────
function SaidaModal({onClose,onSave,initial}){
  const [form,setForm]=useState(initial||{req:"",empresa:"",dataSaida:TODAY_STR,requerente:"",dataEntrega:"",mes:"",codigo:"",descricao:"",reqRetorno:"",devolucao:"",status:"pendente",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:620,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>📦 Req. Saída/Entrada</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Nº REQ Empréstimo" value={form.req} onChange={v=>upd("req",v)} placeholder="6234"/>
            <Inp label="Empresa" value={form.empresa} onChange={v=>upd("empresa",v)} placeholder="MOV LOC"/>
            <Inp label="Mês" value={form.mes} onChange={v=>upd("mes",v)} placeholder="2026/06"/>
          </div>
          <Inp label="Requerente" value={form.requerente} onChange={v=>upd("requerente",v)} placeholder="Nome do requerente"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12}}>
            <Inp label="Código" value={form.codigo} onChange={v=>upd("codigo",v)} placeholder="2322471"/>
            <Inp label="Descrição" value={form.descricao} onChange={v=>upd("descricao",v)} placeholder="Descrição da peça"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp type="date" label="Data Saída Almox" value={form.dataSaida} onChange={v=>upd("dataSaida",v)}/>
            <Inp type="date" label="Data Entrega" value={form.dataEntrega} onChange={v=>upd("dataEntrega",v)}/>
            <Inp type="date" label="Data Devolução" value={form.devolucao} onChange={v=>upd("devolucao",v)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº REQ Retorno" value={form.reqRetorno} onChange={v=>upd("reqRetorno",v)} placeholder="6352"/>
            <Sel label="Status" value={form.status} onChange={v=>upd("status",v)} options={[{v:"pendente",l:"Pendente"},{v:"devolvido",l:"Devolvido"},{v:"em_uso",l:"Em Uso"}]}/>
          </div>
          <Inp label="Observações" value={form.obs} onChange={v=>upd("obs",v)} placeholder="Obs..."/>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={()=>{onSave({...form,id:form.id||`SAI${Date.now()}`});onClose();}}>Salvar</BtnY>
          </div>
        </div>
      </div>
    </div>
  );
}



// ── EXPORTAR EXCEL (CSV) ──────────────────────────────────────────────────────
const exportCSV = (data, filename, cols) => {
  if(!data||data.length===0){alert("Sem dados para exportar!");return;}
  const header = cols.map(c=>c.label).join(";");
  const rows = data.map(row=>cols.map(c=>{
    const v = row[c.key]||"";
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(";"));
  const csv = "\uFEFF" + [header,...rows].join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename+".csv"; a.click();
  URL.revokeObjectURL(url);
};
const BtnExcel = ({onClick}) => (
  <button onClick={onClick} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #1A7A3C",background:"#F0FFF5",fontSize:12,cursor:"pointer",color:"#1A7A3C",fontWeight:700,fontFamily:"inherit"}}>
    📊 Exportar Excel
  </button>
);
const BtnImport = ({onClick}) => (
  <button onClick={onClick} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #1565C0",background:"#F0F4FF",fontSize:12,cursor:"pointer",color:"#1565C0",fontWeight:700,fontFamily:"inherit"}}>
    📥 Importar Excel
  </button>
);

function ImportAponModal({onClose,onImport,label}){
  const [rows,setRows]=useState(null);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const fileRef=useRef();
  const pick=k=>o=>{const keys=Object.keys(o);const f=keys.find(x=>x.trim().toLowerCase().includes(k.toLowerCase()));return f?o[f]:"";};
  const onFile=async(f)=>{
    if(!f)return;setErr("");setLoading(true);setRows(null);
    try{
      if(/\.csv$/i.test(f.name)){
        const txt=await f.text();const sep=txt.indexOf(";")>-1?";":","
        const lines=txt.replace(/\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim());
        const head=lines[0].split(sep).map(h=>h.replace(/^"|"$/g,"").trim());
        const data=lines.slice(1).map(l=>{const cells=l.split(sep).map(c=>c.replace(/^"|"$/g,"").trim());const o={};head.forEach((h,i)=>o[h]=cells[i]||"");return o;});
        if(!data.length)setErr("Vazia.");else setRows(data);
      }else{
        const XLSX=await loadXLSX();const buf=await f.arrayBuffer();const wb=XLSX.read(buf,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];const data=XLSX.utils.sheet_to_json(ws,{defval:"",raw:false});
        if(!data.length)setErr("Vazia.");else setRows(data);
      }
    }catch(e){setErr("Erro ao ler arquivo.");}
    setLoading(false);
  };
  const doImport=()=>{
    const mapped=rows.map(o=>{
      const MESES_MAP={"janeiro":"01","fevereiro":"02","março":"03","abril":"04","maio":"05","junho":"06","julho":"07","agosto":"08","setembro":"09","outubro":"10","novembro":"11","dezembro":"12"};
      const dia=String(pick("dia")(o)||"").padStart(2,"0");
      const mesNome=String(pick("mês")(o)||pick("mes")(o)||"").toLowerCase().trim();
      const mesNum=MESES_MAP[mesNome]||mesNome.padStart(2,"0");
      const ano=String(pick("ano")(o)||"");
      const dataCalc=(dia&&mesNum&&ano)?`${dia}/${mesNum}/${ano}`:String(pick("data")(o)||pick("date")(o)||"");
      return{
      id:"AX"+Date.now()+Math.random().toString(36).slice(2,6),
      data:dataCalc,
      os:String(pick("o.s")(o)||pick("os")(o)||pick("ordem")(o)||""),
      patrimonio:String(pick("nº do pat")(o)||pick("pat")(o)||pick("patrimonio")(o)||pick("patrimônio")(o)||""),
      tecnico:String(pick("técnico")(o)||pick("tecnico")(o)||""),
      modelo:String(pick("modelo")(o)||""),
      servico:String(pick("serviço realizado")(o)||pick("servico")(o)||pick("serviço")(o)||pick("tipo")(o)||""),
      inicio:String(pick("inicial")(o)||pick("inicio")(o)||pick("início")(o)||pick("entrada")(o)||""),
      termino:String(pick("terminio")(o)||pick("termino")(o)||pick("término")(o)||pick("saida")(o)||""),
      total:String(pick("total hora")(o)||pick("total")(o)||pick("horas")(o)||""),
      obs:String(pick("obsevação")(o)||pick("observação")(o)||pick("obs")(o)||pick("observ")(o)||""),
    };});
    onImport(mapped);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:550,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:15,color:"#F5C200"}}>📥 Importar {label||"Apontamentos"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{fontSize:11,color:"#64748B",marginBottom:12}}>Colunas aceitas: <b>Técnico, O.S, Dia, Mês, Ano, Inicial, Término, Total Hora, Nº do PAT, Modelo, Serviço Realizado, Observação</b> (formato PAINEL)</div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={e=>onFile(e.target.files[0])} style={{marginBottom:12}}/>
          {loading&&<div style={{color:"#3B82F6",fontSize:12}}>Lendo...</div>}
          {err&&<div style={{color:"#DC2626",fontSize:12}}>{err}</div>}
          {rows&&<div>
            <div style={{fontSize:12,fontWeight:700,color:"#1E293B",marginBottom:8}}>{rows.length} linha(s) encontrada(s)</div>
            <div style={{maxHeight:200,overflowY:"auto",fontSize:10,border:"1px solid #E2E8F0",borderRadius:8,padding:8}}>
              {rows.slice(0,5).map((r,i)=><div key={i} style={{marginBottom:4,color:"#64748B"}}>{JSON.stringify(r).slice(0,120)}...</div>)}
              {rows.length>5&&<div style={{color:"#94A3B8"}}>... e mais {rows.length-5}</div>}
            </div>
            <button onClick={doImport} style={{marginTop:12,width:"100%",padding:"10px",borderRadius:10,background:"#F5C200",border:"none",fontWeight:800,fontSize:13,color:"#1A1A1A",cursor:"pointer"}}>Importar {rows.length} linha(s)</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

function ImportAgendaModal({onClose,onImport}){
  const [rows,setRows]=useState(null);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const pick=k=>o=>{const keys=Object.keys(o);const f=keys.find(x=>x.trim().toLowerCase().includes(k.toLowerCase()));return f?o[f]:"";};
  const onFile=async(f)=>{
    if(!f)return;setErr("");setLoading(true);setRows(null);
    try{
      if(/\.csv$/i.test(f.name)){
        const txt=await f.text();const sep=txt.indexOf(";")>-1?";":","
        const lines=txt.replace(/\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim());
        const head=lines[0].split(sep).map(h=>h.replace(/^"|"$/g,"").trim());
        const data=lines.slice(1).map(l=>{const cells=l.split(sep).map(c=>c.replace(/^"|"$/g,"").trim());const o={};head.forEach((h,i)=>o[h]=cells[i]||"");return o;});
        if(!data.length)setErr("Vazia.");else setRows(data);
      }else{
        const XLSX=await loadXLSX();const buf=await f.arrayBuffer();const wb=XLSX.read(buf,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];const data=XLSX.utils.sheet_to_json(ws,{defval:"",raw:false});
        if(!data.length)setErr("Vazia.");else setRows(data);
      }
    }catch(e){setErr("Erro ao ler arquivo.");}
    setLoading(false);
  };
  const doImport=()=>{
    const mapped=rows.map(o=>({
      tecnico:String(pick("tecnico")(o)||pick("técnico")(o)||""),
      data:String(pick("data")(o)||pick("date")(o)||""),
      client:String(pick("cliente")(o)||pick("empresa")(o)||pick("client")(o)||""),
      cidade:String(pick("cidade")(o)||pick("city")(o)||""),
      patrimonio:String(pick("pat")(o)||pick("patrimonio")(o)||pick("patrimônio")(o)||""),
      horimetro:String(pick("horímetro")(o)||pick("horimetro")(o)||""),
      horaEntrada:String(pick("entrada")(o)||pick("início")(o)||pick("inicio")(o)||""),
      horaSaida:String(pick("saída")(o)||pick("saida")(o)||pick("término")(o)||pick("termino")(o)||""),
      horasTrabalhadas:String(pick("horas")(o)||pick("total")(o)||""),
      relatorio:String(pick("relatório")(o)||pick("relatorio")(o)||pick("nº relatório")(o)||pick("os")(o)||""),
      obs:String(pick("obs")(o)||pick("observ")(o)||""),
      servico:String(pick("tipo")(o)||pick("serviço")(o)||pick("servico")(o)||"corretiva"),
      type:String(pick("tipo")(o)||pick("type")(o)||"corretivo"),
      status:String(pick("status")(o)||"agendada"),
      servicos:(pick("serviços")(o)||pick("servicos")(o)||"").split(",").map(s=>s.trim()).filter(Boolean),
      obsServico:String(pick("obs serviço")(o)||pick("obs servico")(o)||""),
    }));
    onImport(mapped);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:600,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:15,color:"#F5C200"}}>📥 Importar Agenda</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{fontSize:11,color:"#64748B",marginBottom:6}}>Colunas aceitas:</div>
          <div style={{fontSize:10,color:"#94A3B8",marginBottom:12,lineHeight:1.6}}>
            <b>Técnico</b>, <b>Data</b>, <b>Cliente/Empresa</b>, <b>Cidade</b>, <b>Patrimônio/PAT</b>, <b>Horímetro</b>, <b>Entrada/Início</b>, <b>Saída/Término</b>, <b>Horas/Total</b>, <b>Relatório/OS</b>, <b>Obs</b>, <b>Tipo</b>, <b>Status</b>, <b>Serviços</b>, <b>Obs Serviço</b>
          </div>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>onFile(e.target.files[0])} style={{marginBottom:12}}/>
          {loading&&<div style={{color:"#3B82F6",fontSize:12}}>Lendo...</div>}
          {err&&<div style={{color:"#DC2626",fontSize:12}}>{err}</div>}
          {rows&&<div>
            <div style={{fontSize:12,fontWeight:700,color:"#1E293B",marginBottom:8}}>{rows.length} linha(s)</div>
            <div style={{maxHeight:180,overflowY:"auto",fontSize:10,border:"1px solid #E2E8F0",borderRadius:8,padding:8}}>
              {rows.slice(0,5).map((r,i)=><div key={i} style={{marginBottom:4,color:"#64748B"}}>{JSON.stringify(r).slice(0,120)}...</div>)}
              {rows.length>5&&<div style={{color:"#94A3B8"}}>... +{rows.length-5}</div>}
            </div>
            <button onClick={doImport} style={{marginTop:12,width:"100%",padding:"10px",borderRadius:10,background:"#F5C200",border:"none",fontWeight:800,fontSize:13,color:"#1A1A1A",cursor:"pointer"}}>Importar {rows.length} atendimento(s)</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// Barra de exportação reutilizável
const ExportBar = ({data, filename, cols, onImport}) => {
  const [loading, setLoading] = useState(false);
  return(
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button onClick={async()=>{
        setLoading(true);
        try{ await exportXLSX(data, filename, cols); }
        catch(e){ alert("Erro: "+e.message); }
        finally{ setLoading(false); }
      }} disabled={loading} style={{padding:"6px 12px",borderRadius:7,border:"1px solid #16A34A",background:"#F0FDF4",fontSize:11,cursor:"pointer",color:"#16A34A",fontWeight:700,fontFamily:"inherit"}}>
        📊 Excel
      </button>
      <button onClick={()=>exportCSV(data, filename, cols)} style={{padding:"6px 12px",borderRadius:7,border:"1px solid #1565C0",background:"#EFF6FF",fontSize:11,cursor:"pointer",color:"#1565C0",fontWeight:700,fontFamily:"inherit"}}>
        📄 CSV
      </button>
      {onImport&&<label style={{padding:"6px 12px",borderRadius:7,border:"1px solid #EA580C",background:"#FFF7ED",fontSize:11,cursor:"pointer",color:"#EA580C",fontWeight:700,fontFamily:"inherit"}}>
        📥 Importar
        <input type="file" accept=".xlsx,.csv" style={{display:"none"}} onChange={onImport}/>
      </label>}
    </div>
  );
};


// Exportar Excel global
const exportXLSX = async (data, filename, cols) => {
  if(!data||data.length===0){alert("Sem dados para exportar!");return;}
  try{
    const XLSX = await loadXLSX();
    const rows = data.map(row=>Object.fromEntries(cols.map(c=>[c.label, row[c.key]||""])));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename.slice(0,30));
    XLSX.writeFile(wb, filename+".xlsx");
  }catch(e){ alert("Erro ao exportar: "+e.message); }
};

// Exportar PDF simples (tabela)
const exportPDFTable = (data, filename, cols, title) => {
  if(!data||data.length===0){alert("Sem dados para exportar!");return;}
  const rows = data.map(row=>cols.map(c=>row[c.key]||"").join(" | ")).join("\n");
  const header = cols.map(c=>c.label).join(" | ");
  const content = title+"\n\n"+header+"\n"+"-".repeat(80)+"\n"+rows;
  const blob = new Blob([content],{type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename+".txt"; a.click();
  URL.revokeObjectURL(url);
};


// ── GERENCIAR USUÁRIOS (somente gestora) ──────────────────────────────────────
function UsersModal({users,onClose,onSaveUser,onDeleteUser}){
  const [rows,setRows]=useState(users.map(u=>({...u})));
  const [novo,setNovo]=useState({name:"",id:"",password:"",canDelete:false});
  const setRow=(id,k,v)=>setRows(p=>p.map(r=>r.id===id?{...r,[k]:v}:r));
  const salvar=(r)=>onSaveUser({...r,role:r.canDelete?"Gestora":"Assistente"});
  const excluir=(id)=>{ if(window.confirm("Excluir este usuário?")){ onDeleteUser(id); setRows(p=>p.filter(r=>r.id!==id)); } };
  const add=()=>{
    if(!novo.name||!novo.id||!novo.password){alert("Preencha nome, usuário e senha.");return;}
    if(rows.find(r=>r.id===novo.id.trim())){alert("Já existe um usuário com esse login.");return;}
    const u={id:novo.id.trim(),name:novo.name.trim(),password:novo.password,canDelete:!!novo.canDelete,role:novo.canDelete?"Gestora":"Assistente"};
    onSaveUser(u); setRows(p=>[...p,u]); setNovo({name:"",id:"",password:"",canDelete:false});
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:720,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>👤 Gerenciar Usuários</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{background:"#FFF8F0",border:"1px solid #FFE8A0",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#C47D00",marginBottom:16}}>
            ⚠️ As senhas são guardadas como texto simples (uso interno). Evite reutilizar senhas pessoais importantes.
          </div>
          <table style={{width:"100%",marginBottom:20}}>
            <thead><tr><th>Nome</th><th>Usuário (login)</th><th>Senha</th><th>Gestor</th><th></th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><input type="text" value={r.name||""} onChange={e=>setRow(r.id,"name",e.target.value)} style={{width:"100%",fontSize:12,padding:"4px 6px"}}/></td>
                  <td><input type="text" value={r.id} disabled style={{width:"100%",fontSize:12,padding:"4px 6px",background:"#F5F5F5",color:"#888"}}/></td>
                  <td><input type="text" value={r.password||""} onChange={e=>setRow(r.id,"password",e.target.value)} style={{width:"100%",fontSize:12,padding:"4px 6px"}}/></td>
                  <td style={{textAlign:"center"}}><input type="checkbox" checked={!!r.canDelete} disabled={r.id==="manuela"} onChange={e=>setRow(r.id,"canDelete",e.target.checked)}/></td>
                  <td style={{whiteSpace:"nowrap"}}>
                    <button onClick={()=>salvar(r)} style={{background:"#F5C200",border:"none",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",marginRight:4}}>Salvar</button>
                    {r.id!=="manuela"&&<button onClick={()=>excluir(r.id)} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",padding:"4px 8px",fontSize:11,cursor:"pointer"}}>✕</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{borderTop:"1px solid #EEE",paddingTop:16}}>
            <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:8}}>+ Adicionar novo usuário</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" placeholder="Nome" value={novo.name} onChange={e=>setNovo(p=>({...p,name:e.target.value}))} style={{fontSize:12,padding:"6px 8px",flex:1,minWidth:120}}/>
              <input type="text" placeholder="Usuário (login)" value={novo.id} onChange={e=>setNovo(p=>({...p,id:e.target.value}))} style={{fontSize:12,padding:"6px 8px",flex:1,minWidth:120}}/>
              <input type="text" placeholder="Senha" value={novo.password} onChange={e=>setNovo(p=>({...p,password:e.target.value}))} style={{fontSize:12,padding:"6px 8px",flex:1,minWidth:100}}/>
              <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4}}><input type="checkbox" checked={novo.canDelete} onChange={e=>setNovo(p=>({...p,canDelete:e.target.checked}))}/>Gestor</label>
              <BtnY onClick={add}>Adicionar</BtnY>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GRÁFICOS (Chart.js carregado sob demanda) ─────────────────────────────────
const loadChartLib = () => new Promise((resolve,reject)=>{
  if(window.Chart) return resolve(window.Chart);
  // Tentar CDN principal
  const tryLoad=(src)=>new Promise((res,rej)=>{
    const sc=document.createElement("script");
    sc.src=src; sc.onload=()=>window.Chart?res(window.Chart):rej(new Error("Chart não carregou")); sc.onerror=()=>rej(new Error("Erro ao carregar"));
    document.body.appendChild(sc);
  });
  tryLoad("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
    .then(resolve)
    .catch(()=>tryLoad("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js").then(resolve).catch(reject));
});
function ChartCanvas({type,data,options,height=240}){
  const ref=useRef(null); const inst=useRef(null);
  const [err,setErr]=useState(null);
  const [loading,setLoading]=useState(true);
  const key=JSON.stringify({type,data,options});
  useEffect(()=>{
    let alive=true;
    setLoading(true); setErr(null);
    loadChartLib().then(Chart=>{
      if(!alive||!ref.current)return;
      if(inst.current){try{inst.current.destroy();}catch(e){}inst.current=null;}
      try{
        inst.current=new Chart(ref.current.getContext("2d"),{type,data:JSON.parse(JSON.stringify(data)),options:{...options,responsive:true,maintainAspectRatio:false}});
        if(alive)setLoading(false);
      }catch(e){if(alive)setErr(e.message);}
    }).catch(e=>{if(alive){setLoading(false);setErr("Erro ao carregar biblioteca de gráficos");}});
    return ()=>{alive=false;if(inst.current){try{inst.current.destroy();}catch(e){}inst.current=null;}};
  },[key]);
  if(err) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#C62828",fontSize:11,background:"#FFF0F0",borderRadius:8}}>⚠️ {err}</div>;
  return <div style={{position:"relative",width:"100%",height:height+"px",minHeight:height}}>
    {loading&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#AAA",fontSize:12,zIndex:1}}>⏳ Carregando gráfico...</div>}
    <canvas ref={ref} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}/>
  </div>;
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────

// ── MODAL EDIÇÃO DE SLOT DE AGENDA ───────────────────────────────────────────
function EditSlotModal({slot,tipo,onClose,onSave}){
  const [form,setForm]=useState({...slot});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const horas=calcHoras(form.horaEntrada,form.horaSaida);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"14px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:15,color:"#F5C200"}}>✏️ Editar Atendimento</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Empresa</label><input value={form.client||""} onChange={e=>upd("client",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Cidade</label><input value={form.cidade||""} onChange={e=>upd("cidade",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Patrimônio</label><input value={form.patrimonio||""} onChange={e=>upd("patrimonio",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Horímetro</label><input value={form.horimetro||""} onChange={e=>upd("horimetro",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
          </div>
          {tipo==="tecnico"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Nº Relatório</label><input value={form.relatorio||""} onChange={e=>upd("relatorio",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Tipo</label><select value={form.type||"preventivo"} onChange={e=>upd("type",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0",fontWeight:700}}><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select></div>
          </div>}
          {(tipo==="ofi"||tipo==="ofi150")&&<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Serviço</label><select value={form.servico||SERVICOS_OFICINA[0]} onChange={e=>upd("servico",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0",fontWeight:600}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Entrada</label><input type="time" value={form.horaEntrada||""} onChange={e=>upd("horaEntrada",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Saída</label><input type="time" value={form.horaSaida||""} onChange={e=>upd("horaSaida",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Horas</label><div style={{fontSize:14,fontWeight:800,color:"#1A7A3C",padding:"8px 10px",borderRadius:8,background:"#F0FFF5"}}>{horas||"--:--"}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Status</label><select value={form.status||"agendada"} onChange={e=>upd("status",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button onClick={onClose} style={{padding:"8px 18px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
            <button onClick={()=>{onSave({...form,horasTrabalhadas:calcHoras(form.horaEntrada,form.horaSaida)});onClose();}} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#F5C200",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}



function AppTopBar({user, setUser, setModalUsers}){
  return(
    <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <img src={LOGO_MOV} alt="Grupo MOV" style={{height:32,width:"auto",display:"block"}}/>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:"#FFF"}}>Grupo MOV</div>
          <div style={{fontSize:9,color:"#888",letterSpacing:1,textTransform:"uppercase"}}>Gestão de Manutenção</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",borderRadius:8,padding:"5px 10px"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#F5C200",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#1A1A1A"}}>{user.name[0]}</div>
          <div style={{fontSize:12,fontWeight:700,color:"#FFF"}}>{user.name}</div>
        </div>
        {user.id==="manuela"&&<button onClick={()=>setModalUsers(true)} style={{background:"rgba(245,194,0,.12)",border:"1px solid rgba(245,194,0,.3)",color:"#F5C200",borderRadius:7,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>👤 Usuários</button>}
        <button onClick={()=>{try{localStorage.removeItem("grupomov_user");}catch(e){}setUser(null);}} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#AAA",borderRadius:7,padding:"6px 12px",fontSize:11,cursor:"pointer"}}>Sair</button>
      </div>
    </div>
  );
}

function AppSidebar({tab, setTab, user, empAlerta, badges={}}){
  const bdg=(k)=>badges[k]||0;
  const OFICINAS_TABS = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"];
  const TECEXT_TABS = ["agenda_prev","dashboard","relatorios"];
  const SERVICOS_TABS = ["mau_uso","a_faturar","dashboard_processos","sas"];
  const ADMIN_TABS = ["uber","financeiro"];
  const ALMOX_TABS = ["emprestimos","saida_entrada","ruptura_almox","dashboard_req"];
  const AREA_TEC_TABS = [...OFICINAS_TABS, ...TECEXT_TABS, "pendencias_frota"];

  const [areaTecOpen, setAreaTecOpen] = useState(AREA_TEC_TABS.includes(tab));
  const [oficinasOpen, setOficinasOpen] = useState(OFICINAS_TABS.includes(tab));
  const [tecExtOpen,setTecExtOpen]=useState(TECEXT_TABS.includes(tab));
  const [servicosOpen,setServicosOpen]=useState(SERVICOS_TABS.includes(tab));
  const [adminOpen,setAdminOpen]=useState(ADMIN_TABS.includes(tab));
  const [almoxOpen,setAlmoxOpen]=useState(ALMOX_TABS.includes(tab));

  const areaTecAtiva = AREA_TEC_TABS.includes(tab);
  const oficinasAtiva = OFICINAS_TABS.includes(tab);
  const tecExtAtiva = TECEXT_TABS.includes(tab);
  const servicosAtiva = SERVICOS_TABS.includes(tab);
  const adminAtiva = ADMIN_TABS.includes(tab);
  const almoxAtiva = ALMOX_TABS.includes(tab);

  const canSee=(tipo)=>{
    if(tipo==="comercial") return user.acessoComercial||user.id==="manuela"||user.id==="gustavo";
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="ruptura_almox") return ["manuela","gustavo","renato"].includes(user.id);
    if(user.id==="renato") return !["sas","financeiro","pendencias_frota","pendencias_hebert","pendencias_matheus","pendencias_manuela_tab","prioridades_clientes","rh_fiscal"].includes(tipo);
    if(tipo==="hebert") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_s";
    if(tipo==="matheus") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_m";
    if(tipo==="ofi150") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_m";
    if(tipo==="oficina") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_s";
    if(tipo==="oficinas") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_s"||user.id==="matheus_m";
    return true;
  };

  if(user.acessoComercial) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      <Btn k="mau_uso" l="⚠️ Mau Uso"/>
      <Btn k="a_faturar" l="💰 A Faturar"/>
      <Btn k="dashboard_processos" l="📊 Dash Processos"/>
      {!user.semSas&&<Btn k="sas" l="📄 SAS"/>}
    </div>
  );
  if(user.acessoSas&&!user.acessoComercial) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      <Btn k="sas" l="📄 SAS"/>
    </div>
  );
  if(user.acessoComercial) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      <Btn k="mau_uso" l="⚠️ Mau Uso"/>
      <Btn k="a_faturar" l="💰 A Faturar"/>
      <Btn k="dashboard_processos" l="📊 Dash Processos"/>
      {!user.semSas&&<Btn k="sas" l="📄 SAS"/>}
    </div>
  );
  if(user.apenasAgenda) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_prev","🗓 Agenda"],["dashboard","📊 Dashboard"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasAgenda150) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi_150","🗓 Agenda 150"],["dashboard_ofi_150","📊 Dashboard 150"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasOficina) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi","🗓 Agenda"],["apontamentos_oficina","📝 Apontamentos"],["pendencias_hebert","📋 Serviços Adm"],["dashboard_ofi","📊 Dashboard"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasOficina150) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi_150","🗓 Agenda"],["apontamentos_150","📝 Apontamentos"],["pendencias_matheus","📋 Serviços Adm"],["dashboard_ofi_150","📊 Dashboard"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.15)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:13,fontWeight:isActive?700:500,cursor:"pointer",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",textAlign:"left",transition:"all .15s"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasOfi150) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi_150","🗓 Agenda"],["apontamentos_150","📝 Apontamentos"],["pendencias_matheus","📋 Serviços Adm"],["dashboard_processos","📊 Dashboard"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );

  const Btn=({k,l,badge})=>{
    const isActive=tab===k;
    const count=badge!==undefined?badge:bdg(k);
    return(<button onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {l}{count>0&&<span style={{marginLeft:"auto",background:isActive?"#F5C200":"#EF4444",color:isActive?"#1A1A1A":"#FFF",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700,minWidth:18,textAlign:"center"}}>{count}</span>}
    </button>);
  };
  const SubBtn=({k,l,badge})=>{
    const isActive=tab===k;
    const count=badge!==undefined?badge:bdg(k);
    return(<button onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 16px 7px 28px",border:"none",background:isActive?"rgba(245,194,0,.08)":"transparent",color:isActive?"#F5C200":"#64748B",fontSize:11,fontWeight:isActive?700:400,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {l}{count>0&&<span style={{marginLeft:"auto",background:isActive?"#F5C200":"#EF4444",color:isActive?"#1A1A1A":"#FFF",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700,minWidth:16,textAlign:"center"}}>{count}</span>}
    </button>);
  };
  const GroupHeader=({label,icon,open,setOpen,ativa,badgeCount})=>(
    <button onClick={()=>setOpen(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 16px",border:"none",background:ativa?"rgba(245,194,0,.12)":"transparent",color:ativa?"#F5C200":"#94A3B8",fontSize:12,fontWeight:ativa?700:600,cursor:"pointer",borderLeft:ativa?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>
      <span>{icon} {label}</span>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        {badgeCount>0&&!open&&<span style={{background:"#EF4444",color:"#FFF",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700}}>{badgeCount}</span>}
        <span style={{fontSize:9,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
      </div>
    </button>
  );

  return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"linear-gradient(180deg,#1E293B,#0F172A)",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {/* ÁREA TÉCNICA - ACORDEÃO (Oficinas + Técnicos Externos + Pendências Frota) */}
      <GroupHeader label="Área Técnica" icon="🛠️" open={areaTecOpen} setOpen={setAreaTecOpen} ativa={areaTecAtiva} badgeCount={bdg("pendencias_hebert")+bdg("pendencias_matheus")+bdg("pendencias_frota")}/>
      {areaTecOpen&&<div style={{background:"rgba(0,0,0,.1)"}}>
        {/* TÉCNICOS EXTERNOS - SUB-ACORDEÃO */}
        <button onClick={()=>setTecExtOpen(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 16px 8px 22px",border:"none",background:tecExtAtiva?"rgba(245,194,0,.10)":"transparent",color:tecExtAtiva?"#F5C200":"#94A3B8",fontSize:11,fontWeight:tecExtAtiva?700:500,cursor:"pointer",borderLeft:tecExtAtiva?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>
          <span>👷 Técnicos Externos</span>
          <span style={{fontSize:9,transition:"transform .2s",display:"inline-block",transform:tecExtOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
        </button>
        {tecExtOpen&&<div style={{background:"rgba(0,0,0,.15)"}}>
          <SubBtn k="agenda_prev" l="🗓 Agenda"/>
          <SubBtn k="dashboard" l="📊 Dashboard"/>
          <SubBtn k="relatorios" l="📋 Conf. Relatórios"/>
        </div>}

        {/* OFICINAS - SUB-ACORDEÃO */}
        {canSee("oficinas")&&<>
          <button onClick={()=>setOficinasOpen(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 16px 8px 22px",border:"none",background:oficinasAtiva?"rgba(245,194,0,.10)":"transparent",color:oficinasAtiva?"#F5C200":"#94A3B8",fontSize:11,fontWeight:oficinasAtiva?700:500,cursor:"pointer",borderLeft:oficinasAtiva?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>
            <span>🏭 Oficinas</span>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              {(bdg("pendencias_hebert")+bdg("pendencias_matheus"))>0&&!oficinasOpen&&<span style={{background:"#EF4444",color:"#FFF",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700}}>{bdg("pendencias_hebert")+bdg("pendencias_matheus")}</span>}
              <span style={{fontSize:9,transition:"transform .2s",display:"inline-block",transform:oficinasOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
            </div>
          </button>
          {oficinasOpen&&<div style={{background:"rgba(0,0,0,.15)"}}>
            {canSee("oficina")&&<>
              <div style={{padding:"5px 16px 2px 22px",fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:1}}>Oficina 1340</div>
              <SubBtn k="apontamentos_oficina" l="📝 Apontamentos"/>
              <SubBtn k="agenda_ofi" l="🗓 Agenda"/>
              <SubBtn k="dashboard_ofi" l="📊 Dashboard"/>
              {canSee("hebert")&&<SubBtn k="pendencias_hebert" l="🔧 Serviços Adm"/>}
            </>}
            {canSee("ofi150")&&<>
              <div style={{padding:"5px 16px 2px 22px",fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:1}}>Oficina 150</div>
              <SubBtn k="apontamentos_150" l="📝 Apontamentos"/>
              <SubBtn k="agenda_ofi_150" l="🗓 Agenda"/>
              <SubBtn k="dashboard_ofi_150" l="📊 Dashboard"/>
              {canSee("matheus")&&<SubBtn k="pendencias_matheus" l="🔧 Serviços Adm"/>}
            </>}
          </div>}
        </>}

        <SubBtn k="pendencias_frota" l="🚜 Pendências Frota"/>
      </div>}

      {/* SERVIÇOS - ACORDEÃO (Mau Uso, A Faturar, Dash Processos, SAS) */}
      <GroupHeader label="Serviços" icon="🧾" open={servicosOpen} setOpen={setServicosOpen} ativa={servicosAtiva} badgeCount={bdg("sas")}/>
      {servicosOpen&&<div style={{background:"rgba(0,0,0,.1)"}}>
        <SubBtn k="mau_uso" l="⚠️ Mau Uso"/>
        <SubBtn k="a_faturar" l="💰 A Faturar"/>
        <SubBtn k="dashboard_processos" l="📊 Dash Processos"/>
        {!user?.semSas&&<SubBtn k="sas" l="📄 SAS"/>}
      </div>}

      {/* ADMINISTRATIVO - ACORDEÃO (Uber, Financeiro) */}
      <GroupHeader label="Administrativo" icon="🗂️" open={adminOpen} setOpen={setAdminOpen} ativa={adminAtiva} badgeCount={0}/>
      {adminOpen&&<div style={{background:"rgba(0,0,0,.1)"}}>
        <SubBtn k="uber" l="🚗 Uber"/>
        <SubBtn k="financeiro" l="💰 Financeiro"/>
      </div>}

      {/* ALMOXARIFADO - ACORDEÃO (Empréstimo, Entrada/Saída, Ruptura, Dash Requisições) */}
      <GroupHeader label="Almoxarifado" icon="📦" open={almoxOpen} setOpen={setAlmoxOpen} ativa={almoxAtiva} badgeCount={empAlerta}/>
      {almoxOpen&&<div style={{background:"rgba(0,0,0,.1)"}}>
        <SubBtn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
        <SubBtn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
        {canSee("ruptura_almox")&&<SubBtn k="ruptura_almox" l="🔴 Ruptura Almox"/>}
        <SubBtn k="dashboard_req" l="📊 Dash Requisições"/>
      </div>}

      <Btn k="carros" l="🚙 Carros"/>
      {canSee("somanuela")&&<Btn k="prioridades_clientes" l="⭐ Prioridades Clientes"/>}
      {canSee("somanuela")&&<Btn k="pendencias_manuela_tab" l="📋 Pendências Manuela"/>}
    </div>
  );
}

export default function App(){
  const isReadOnlyAgenda = (u)=> !!(u && (u.apenasAgenda || u.apenasAgenda150));
  const [user,setUser]=useState(()=>{
    try{
      const saved=localStorage.getItem("grupomov_user");
      if(saved){ const parsed=JSON.parse(saved); return USERS.find(u=>u.id===parsed.id)||null; }
    }catch(e){}
    return null;
  });
  const [users,setUsers]=useState(USERS);
  const [modalUsers,setModalUsers]=useState(false);
  const [tab,setTab]=useState(()=>{try{const s=localStorage.getItem("grupomov_user");if(s){const p=JSON.parse(s);const u=USERS.find(x=>x.id===p.id);if(u?.acessoSas&&!u?.acessoComercial)return"sas";if(u?.acessoComercial)return"mau_uso";if(u?.apenasAgenda)return"agenda_prev";if(u?.apenasOficina)return"agenda_ofi";if(u?.apenasOficina150)return"agenda_ofi_150";}}catch(e){}return"relatorios";});
  useEffect(()=>{ if(user&&user.apenasOficina) setTab("agenda_ofi"); },[user?.id]);
  useEffect(()=>{
    if(!user) return;
    const al = user.acessoSas&&!user.acessoComercial ? ["sas"] :
      user.acessoComercial ? (user.semSas?["mau_uso","a_faturar","dashboard_processos"]:["mau_uso","a_faturar","dashboard_processos","sas"]) :
      user.apenasAgenda||user.apenasAgenda150 ? ["agenda_prev","dashboard_processos"] :
      user.apenasOficina ? ["agenda_ofi","apontamentos_oficina","pendencias_hebert","dashboard_ofi"] :
      user.apenasOficina150 ? ["agenda_ofi_150","apontamentos_150","pendencias_matheus","dashboard_ofi_150"] :
      null;
    if(al&&!al.includes(tab)) setTab(al[0]);
  },[user?.id]);
  useEffect(()=>{ if(user&&user.apenasAgenda150) setTab("agenda_ofi_150"); },[user?.id]);
  useEffect(()=>{ if(user&&user.apenasOfi150) setTab("agenda_ofi_150"); },[user?.id]);
  const [reports,setReports]=useState(REAL_REPORTS);
  const [processosMU,setProcessosMU]=useState([]);
  const [processosAF,setProcessosAF]=useState([]);
  const [rupturas,setRupturas]=useState([]);
  const [modalRuptura,setModalRuptura]=useState(false);
  const [editRuptura,setEditRuptura]=useState(null);
  const [showArqRuptura,setShowArqRuptura]=useState(false);
  const [rupMonth,setRupMonth]=useState(TODAY.getMonth());
  const [rupYear,setRupYear]=useState(TODAY.getFullYear());
  const [rupFiltroStatus,setRupFiltroStatus]=useState("todos");
  const [rupSearch,setRupSearch]=useState("");
  const [rupViewMode,setRupViewMode]=useState("cards");
  const [rupturaForm,setRupturaForm]=useState({solicitacao:"sem_estoque",data:"",ticket:"",requisicao:"",peca:"",codigo:"",quantidade:"",osRel:"",pat:"",empresa:"",tecnico:"",dataLiberacao:"",obs:"",status:"aguardando",arquivado:false});
  const [emprestimos,setEmprestimos]=useState(EMP_DATA);
  const [saidaEntrada,setSaidaEntrada]=useState(SAIDA_DATA);
  const [requisicoes,setRequisicoes]=useState([]);
  const [agendaItems,setAgendaItems]=useState({});
  const [schedule,setSchedule]=useState({});
  const [escalaStatusFilter,setEscalaStatusFilter]=useState("todos");
  const [notification,setNotification]=useState("");

  // Filtros relatórios
  const [filterTipo,setFilterTipo]=useState("todos");
  const [filterTech,setFilterTech]=useState("todos");
  const [filterStatus,setFilterStatus]=useState("todos");
  const [filterRegion,setFilterRegion]=useState("todas");
  const [filterDateFrom,setFilterDateFrom]=useState("");
  const [filterDateTo,setFilterDateTo]=useState("");
  const [searchText,setSearchText]=useState("");
  const [dashRegion,setDashRegion]=useState("todas");
  const [dashFrom,setDashFrom]=useState("");
  const [dashTo,setDashTo]=useState("");
  const [dashTech,setDashTech]=useState("todos");
  const [dashOfiTech,setDashOfiTech]=useState("todos");
  const [dashOfiFrom,setDashOfiFrom]=useState("");
  const [dashOfiTo,setDashOfiTo]=useState("");
  const [dashOfi150Tech,setDashOfi150Tech]=useState("todos");
  const [dashOfi150From,setDashOfi150From]=useState("");
  const [dashOfi150To,setDashOfi150To]=useState("");
  const [filterReqStatus,setFilterReqStatus]=useState("sem_retorno");
  const [showArqRel,setShowArqRel]=useState(false);
  const [relFiltroStatus,setRelFiltroStatus]=useState("todos");
  const [relFiltroAtend,setRelFiltroAtend]=useState("todos");
  const [relFiltroTech,setRelFiltroTech]=useState("todos");
  const [relFiltroPat,setRelFiltroPat]=useState("");
  const [relFiltroEmp,setRelFiltroEmp]=useState("");
  const [relFiltroData,setRelFiltroData]=useState("");
  const [pdfLoading,setPdfLoading]=useState(false);
  const [showArqMU,setShowArqMU]=useState(false);
  // Dashboard Processos filters
  const [dashProcFMes,setDashProcFMes]=useState("");
  const [dashProcFAno,setDashProcFAno]=useState("");
  const [dashProcFDe,setDashProcFDe]=useState("");
  const [dashProcFAte,setDashProcFAte]=useState("");
  const [dashProcFEmpresa,setDashProcFEmpresa]=useState("");
  const [dashProcFPat,setDashProcFPat]=useState("");
  const [dashProcFNumMU,setDashProcFNumMU]=useState("");
  const [dashProcFStatus,setDashProcFStatus]=useState("todos");
  const [dashProcFAprov,setDashProcFAprov]=useState("todos");
  const [dashProcFTipo,setDashProcFTipo]=useState("todos");
  const [showArqAF,setShowArqAF]=useState(false);
  const [showArqEmp,setShowArqEmp]=useState(false);
  const [showArqSaida,setShowArqSaida]=useState(false);
  // ── Filtros de pesquisa por aba ──
  const [muSearch,setMuSearch]=useState(""); const [muFrom,setMuFrom]=useState(""); const [muTo,setMuTo]=useState(""); const [muMes,setMuMes]=useState(""); const [muAno,setMuAno]=useState(""); const [muAprov,setMuAprov]=useState("todos"); const [showFiltrosMU,setShowFiltrosMU]=useState(false);
  const [afSearch,setAfSearch]=useState(""); const [afFrom,setAfFrom]=useState(""); const [afTo,setAfTo]=useState(""); const [afMes,setAfMes]=useState(""); const [afAno,setAfAno]=useState("");
  const [empSearch,setEmpSearch]=useState(""); const [empFrom,setEmpFrom]=useState(""); const [empTo,setEmpTo]=useState(""); const [empMes,setEmpMes]=useState(""); const [empAno,setEmpAno]=useState("");
  const [saiSearch,setSaiSearch]=useState(""); const [saiFrom,setSaiFrom]=useState(""); const [saiTo,setSaiTo]=useState(""); const [saiMes,setSaiMes]=useState(""); const [saiAno,setSaiAno]=useState("");
  const [finSearch,setFinSearch]=useState(""); const [finFrom,setFinFrom]=useState(""); const [finTo,setFinTo]=useState(""); const [finMes,setFinMes]=useState(""); const [finAno,setFinAno]=useState("");
  const [froSearch,setFroSearch]=useState(""); const [froFrom,setFroFrom]=useState(""); const [froTo,setFroTo]=useState(""); const [froMes,setFroMes]=useState(""); const [froAno,setFroAno]=useState("");
  const [rhSearch,setRhSearch]=useState(""); const [rhFrom,setRhFrom]=useState(""); const [rhTo,setRhTo]=useState(""); const [rhMes,setRhMes]=useState(""); const [rhAno,setRhAno]=useState("");
  const [uberSearch,setUberSearch]=useState(""); const [uberFrom,setUberFrom]=useState(""); const [uberTo,setUberTo]=useState(""); const [uberMes,setUberMes]=useState(""); const [uberAno,setUberAno]=useState("");
  const [sasSearch,setSasSearch]=useState(""); const [sasFrom,setSasFrom]=useState(""); const [sasTo,setSasTo]=useState(""); const [sasMes,setSasMes]=useState(""); const [sasAno,setSasAno]=useState("");
  const [showArqReq,setShowArqReq]=useState(false);
  const [uberPedidos,setUberPedidos]=useState([]);
  const [showArqUber,setShowArqUber]=useState(false);
  const [financeiro,setFinanceiro]=useState([]);
  const [showArqFin,setShowArqFin]=useState(false);
  const [frota,setFrota]=useState([]);
  const [prioridades,setPrioridades]=useState([]);
  const [rhFiscal,setRhFiscal]=useState([]);
  const [oficina,setOficina]=useState([]);
  const [carros,setCarros]=useState([]);
  const [carForm,setCarForm]=useState({placa:PLACAS_CARROS[0],status:"orcamento_pendente",data:"",responsavel:"",ultimaRevisaoData:"",itensSubstituidos:[],itensSubstituidosObs:"",kmUltimaRevisao:"",valorUltimaRevisao:"",kmAtual:"",itensProximaRevisao:[],itensProximaRevisaoObs:"",proximaRevisaoData:"",oficina:"",obs:"",requisicao:""});
  const [carFiltroPlaca,setCarFiltroPlaca]=useState("todas");
  const [carMonth,setCarMonth]=useState(TODAY.getMonth());
  const [carYear,setCarYear]=useState(TODAY.getFullYear());
  const [pendManuela,setPendManuela]=useState([]);
  const [modalCarroRevisao,setModalCarroRevisao]=useState(null);
  const [carroFiltroPlaca,setCarroFiltroPlaca]=useState("todas");
  const [carroFiltroData,setCarroFiltroData]=useState("");
  const [carroFiltroStatus,setCarroFiltroStatus]=useState("todos");
  const [showArqCarros,setShowArqCarros]=useState(false);
  const [carSearch,setCarSearch]=useState(""); const [carFrom,setCarFrom]=useState(""); const [carTo,setCarTo]=useState(""); const [carMes,setCarMes]=useState(""); const [carAno,setCarAno]=useState("");
  const [modalCarros,setModalCarros]=useState(false);
  const [editCarro,setEditCarro]=useState(null);
  const [showArqPendMan,setShowArqPendMan]=useState(false);
  const [pendManForm,setPendManForm]=useState({tarefa:"Reunião",tarefaOutros:"",data:"",prioridade:"Normal",solucao:"",status:"Pendente",dataConclusao:""});
  const [editPendMan,setEditPendMan]=useState(null);
  const [modalOfi,setModalOfi]=useState(false);
  const [modalImportOfi,setModalImportOfi]=useState(false);
  const [showArqOfi,setShowArqOfi]=useState(false);
  const [ofiSearch,setOfiSearch]=useState("");
  const [ofiTipo,setOfiTipo]=useState("todos");
  const [ofiRegion,setOfiRegion]=useState("todas");
  const [ofiTech,setOfiTech]=useState("todos");
  const [ofiStatus,setOfiStatus]=useState("todos");
  const [ofiFrom,setOfiFrom]=useState("");
  const [ofiTo,setOfiTo]=useState("");
  const [showArqFro,setShowArqFro]=useState(false);
  const [showArqPri,setShowArqPri]=useState(false);
  const [showArqRh,setShowArqRh]=useState(false);
  const [dashReqTab,setDashReqTab]=useState("visao_geral");
  const [schedOfiDate,setSchedOfiDate]=useState(TODAY_STR);
  const [agendaOfi,setAgendaOfi]=useState({});
  const [agOfiMonth,setAgOfiMonth]=useState(TODAY.getMonth());
  const [agOfiYear,setAgOfiYear]=useState(TODAY.getFullYear());
  const [agOfiTech,setAgOfiTech]=useState("todos");
  const [agOfiServico,setAgOfiServico]=useState("todos");
  const [agOfiStatus,setAgOfiStatus]=useState("todos");
  const [agOfiEmpresa,setAgOfiEmpresa]=useState("");
  const [agOfiPat,setAgOfiPat]=useState("");
  const [agOfiTechSel,setAgOfiTechSel]=useState(OFICINA_TECHS[0]);
  const [agOfiDate,setAgOfiDate]=useState("");
  const [agOfiServSel,setAgOfiServSel]=useState(SERVICOS_OFICINA[0]);
  const [agOfiEntrada,setAgOfiEntrada]=useState("");
  const [agOfiSaida,setAgOfiSaida]=useState("");
  const [agOfiDataInicio,setAgOfiDataInicio]=useState("");
  const [agOfiDataFim,setAgOfiDataFim]=useState("");
  const [agOfiRequisicao,setAgOfiRequisicao]=useState("");
  const [agOfiObs,setAgOfiObs]=useState("");
  const [agOfiRelatorio,setAgOfiRelatorio]=useState("");
  const [agOfiCidade,setAgOfiCidade]=useState("");
  const [agOfiHorimetro,setAgOfiHorimetro]=useState("");
  const [agOfiTipo,setAgOfiTipo]=useState("preventivo");
  const [pendHebert,setPendHebert]=useState([]);
  const [showArqHeb,setShowArqHeb]=useState(false);
  // Filtros nova aba oficina
  const [ofiNovaData,setOfiNovaData]=useState("");
  const [ofiNovaOS,setOfiNovaOS]=useState("");
  const [ofiNovaPat,setOfiNovaPat]=useState("");
  const [ofiNovaTech,setOfiNovaTech]=useState("todos");
  const [ofiNovaServ,setOfiNovaServ]=useState("todos");
  const [ofiNovaFrom,setOfiNovaFrom]=useState("");
  const [ofiNovaTo,setOfiNovaTo]=useState("");
  const [apontamentos,setApontamentos]=useState([]);
  const [showArqApon,setShowArqApon]=useState(false);
  const [aponNovaData,setAponNovaData]=useState(TODAY_STR);
  const [aponNovaOS,setAponNovaOS]=useState("");
  const [aponNovaPat,setAponNovaPat]=useState("");
  const [aponNovaTech,setAponNovaTech]=useState(OFICINA_TECHS[0]||"Hebert");
  const [aponNovaServ,setAponNovaServ]=useState(SERVICOS_OFICINA[0]||"Mecânica");
  const [aponNovaInicio,setAponNovaInicio]=useState("");
  const [aponNovaTermino,setAponNovaTermino]=useState("");
  const [aponNovaRel,setAponNovaRel]=useState("");
  const [aponNovaObs,setAponNovaObs]=useState("");
  const [modalApon,setModalApon]=useState(false);
  const [editApon,setEditApon]=useState(null);
  const APON_EMPTY={data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0]||"",servico:SERVICOS_OFICINA[0]||"",inicio:"",termino:"",total:"",oficina:"1340",relatorio:"",obs:""};
  const [aponForm,setAponForm]=useState({data:TODAY_STR,os:"",patrimonio:"",tecnico:"",servico:"",inicio:"",termino:"",total:"",oficina:"1340",relatorio:"",obs:""});
  const [apontamentos150,setApontamentos150]=useState([]);
  const [showArqApon150,setShowArqApon150]=useState(false);
  const [apon150NovaData,setApon150NovaData]=useState(TODAY_STR);
  const [apon150NovaOS,setApon150NovaOS]=useState("");
  const [apon150NovaPat,setApon150NovaPat]=useState("");
  const [apon150NovaTech,setApon150NovaTech]=useState(OFICINA_150_TECHS[0]||"Matheus");
  const [apon150NovaServ,setApon150NovaServ]=useState(SERVICOS_OFICINA[0]||"Mecânica");
  const [apon150NovaInicio,setApon150NovaInicio]=useState("");
  const [apon150NovaTermino,setApon150NovaTermino]=useState("");
  const [apon150NovaRel,setApon150NovaRel]=useState("");
  const [apon150NovaObs,setApon150NovaObs]=useState("");
  const [modalApon150,setModalApon150]=useState(false);
  const [editApon150,setEditApon150]=useState(null);
  const [apon150Form,setApon150Form]=useState({data:TODAY_STR,os:"",patrimonio:"",tecnico:"",servico:"",inicio:"",termino:"",total:"",oficina:"150",relatorio:"",obs:""});
  const [agendaOfi150,setAgendaOfi150]=useState({});
  const [agOfi150Month,setAgOfi150Month]=useState(TODAY.getMonth());
  const [agOfi150Year,setAgOfi150Year]=useState(TODAY.getFullYear());
  const [agOfi150Tech,setAgOfi150Tech]=useState("todos");
  const [agOfi150Servico,setAgOfi150Servico]=useState("todos");
  const [agOfi150TechSel,setAgOfi150TechSel]=useState(OFICINA_150_TECHS[0]);
  const [agOfi150Date,setAgOfi150Date]=useState("");
  const [agOfi150Empresa,setAgOfi150Empresa]=useState("");
  const [agOfi150Pat,setAgOfi150Pat]=useState("");
  const [agOfi150ServSel,setAgOfi150ServSel]=useState(SERVICOS_OFICINA[0]);
  const [agOfi150Entrada,setAgOfi150Entrada]=useState("");
  const [agOfi150Saida,setAgOfi150Saida]=useState("");
  const [agOfi150Obs,setAgOfi150Obs]=useState("");
  const [agOfi150Relatorio,setAgOfi150Relatorio]=useState("");
  const [agOfi150Cidade,setAgOfi150Cidade]=useState("");
  const [agOfi150Horimetro,setAgOfi150Horimetro]=useState("");
  const [agOfi150Tipo,setAgOfi150Tipo]=useState("preventivo");
  const [agOfi150Status,setAgOfi150Status]=useState("agendada");
  const [pendMatheus,setPendMatheus]=useState([]);
  const [showArqMat,setShowArqMat]=useState(false);
  const [ofi150Data,setOfi150Data]=useState("");
  const [ofi150OS,setOfi150OS]=useState("");
  const [ofi150Pat,setOfi150Pat]=useState("");
  const [ofi150Tech,setOfi150Tech]=useState("todos");
  const [ofi150Serv,setOfi150Serv]=useState("todos");
  const [ofi150From,setOfi150From]=useState("");
  const [ofi150To,setOfi150To]=useState("");
  const [sas,setSas]=useState([]);
  const [showArqSas,setShowArqSas]=useState(false);

  // Modais
  const [modalReport,setModalReport]=useState(false);
  const [editReport,setEditReport]=useState(null);
  const [finEdit,setFinEdit]=useState(null);
  const [finModalOpen,setFinModalOpen]=useState(false);
  const [uberEdit,setUberEdit]=useState(null);
  const [uberModal,setUberModal]=useState(false);
  const [sasEdit,setSasEdit]=useState(null);
  const [sasModal,setSasModal]=useState(false);
  const [froEdit,setFroEdit]=useState(null);
  const [froModal,setFroModal]=useState(false);
  const [modalImport,setModalImport]=useState(false);
  const [modalMU,setModalMU]=useState(false);
  const [editMU,setEditMU]=useState(null);
  const [modalAF,setModalAF]=useState(false);
  const [editAF,setEditAF]=useState(null);
  const [modalEmp,setModalEmp]=useState(null);
  const [modalSaida,setModalSaida]=useState(null);
  const [editEmp,setEditEmp]=useState(null);
  const [editSaida,setEditSaida]=useState(null);

  // Agenda
  const [agendaRegion,setAgendaRegion]=useState("metropolitana");
  const [agendaTech,setAgendaTech]=useState("Rafael");
  const [agendaMonth,setAgendaMonth]=useState(TODAY.getMonth());
  const [agendaYear,setAgendaYear]=useState(TODAY.getFullYear());
  const [agendaModal,setAgendaModal]=useState(null);
  const [agendaForm,setAgendaForm]=useState({empresa:"",patrimonio:"",patrimonio2:"",patrimonio3:"",status:"agendada",contato:"",obs:""});

  // Escala
  const [schedDate,setSchedDate]=useState(TODAY_STR);
  const [schedRegion,setSchedRegion]=useState("metropolitana");
  const [schedType,setSchedType]=useState("preventivo");
  const [schedFilterTech,setSchedFilterTech]=useState("todos");

  // Agenda Preventiva (mensal)
  const [agendaPrev,setAgendaPrev]=useState({});
  const [agpRegion,setAgpRegion]=useState("todas");
  const [agpTech,setAgpTech]=useState("todos");
  const [agpStatus,setAgpStatus]=useState("todos");
  const [agpMonth,setAgpMonth]=useState(TODAY.getMonth());
  const [agpYear,setAgpYear]=useState(TODAY.getFullYear());
  const [agTech,setAgTech]=useState(ALL_TECHS[0]);
  const [agDate,setAgDate]=useState("");
  const [agEmpresa,setAgEmpresa]=useState("");
  const [agCidade,setAgCidade]=useState("");
  const [editSlot,setEditSlot]=useState(null); // {key, si, slot, tipo} para edição de card
  const [editSlotForm,setEditSlotForm]=useState({});
  const [agHorimetro,setAgHorimetro]=useState("");
  const [agPat,setAgPat]=useState("");
  const [agStatus,setAgStatus]=useState("agendada");
  const [agTipo,setAgTipo]=useState("preventivo");
  const [agEntrada,setAgEntrada]=useState("");
  const [agSaida,setAgSaida]=useState("");
  const [agRelatorio,setAgRelatorio]=useState("");
  const [agObs,setAgObs]=useState("");
  const [agpTipo,setAgpTipo]=useState("todos");
  const [formServH,setFormServH]=useState({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});
  const [filtroMesH,setFiltroMesH]=useState("");
  const [formServM,setFormServM]=useState({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});
  const [filtroMesM,setFiltroMesM]=useState("");

  const [agServicos,setAgServicos]=useState([]);
  const [agObsServ,setAgObsServ]=useState("");
  const [showNovoAtend,setShowNovoAtend]=useState(false);

  const [modalImportSas,setModalImportSas]=useState(false);
  const [modalImportMU2,setModalImportMU2]=useState(false);
  const [modalImportAF2,setModalImportAF2]=useState(false);
  const [modalImportRel,setModalImportRel]=useState(false);
  const [modalImportPH,setModalImportPH]=useState(false);
  const [modalImportPM,setModalImportPM]=useState(false);  const notify=msg=>{setNotification(msg);setTimeout(()=>setNotification(""),3000);};
  const [showFiltrosDP,setShowFiltrosDP]=useState(false);
  const [modalImportApon,setModalImportApon]=useState(false);
  const [modalImportApon150,setModalImportApon150]=useState(false);
  const [modalImportAgenda,setModalImportAgenda]=useState(false);

  // ── TÍTULO DO APP ──
  useEffect(()=>{ document.title = "Gestão Manutenção Grupo MOV"; },[]);
  // Desliga e limpa o cache offline (Service Worker) que prendia versões antigas
  useEffect(()=>{
    try{
      if('serviceWorker' in navigator){ navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{}); }
      if(window.caches&&caches.keys){ caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))).catch(()=>{}); }
    }catch(e){}
  },[]);

  // ── CARREGAR DADOS DO SUPABASE ──
  useEffect(()=>{
    const load = async () => {
      const safeGet = async (t) => { try { return await db.get(t); } catch(e) { return []; } };
      const [rels, mus, afs, emps, saidas, reqs, ubers, escRows, usrs, fins, fros, pris, rhs, ofis, agOfiRows, hebRows, apRows, sasRows, carrosRows, pendManRows, ap150Rows, agOfi150Rows, matRows, rupRows] = await Promise.all([
        safeGet("relatorios"), safeGet("processos_mu"), safeGet("processos_af"),
        safeGet("emprestimos"), safeGet("saida_entrada"), safeGet("requisicoes"),
        safeGet("uber_pedidos"), safeGet("escala"), safeGet("usuarios"), safeGet("financeiro"),
        safeGet("pendencias_frota"), safeGet("prioridades_clientes"), safeGet("rh_fiscal"), safeGet("oficina"),
        safeGet("agenda_oficina"), safeGet("pendencias_hebert"), safeGet("apontamentos_oficina"), safeGet("sas"), safeGet("carros"), safeGet("pendencias_manuela"), safeGet("apontamentos_150"), safeGet("agenda_ofi_150"), safeGet("pendencias_matheus"), safeGet("rupturas_alm")
      ]);
      if(rels.length>0) setReports(rels);
      if(mus.length>0) setProcessosMU(mus);
      if(afs.length>0) setProcessosAF(afs);
      if(emps.length>0) setEmprestimos(emps);
      if(saidas.length>0) setSaidaEntrada(saidas);
      if(reqs.length>0) setRequisicoes(reqs);
      if(ubers.length>0) setUberPedidos(ubers);
      if(fins.length>0) setFinanceiro(fins);
      if(fros.length>0) setFrota(fros);
      if(pris.length>0) setPrioridades(pris);
      if(rhs.length>0) setRhFiscal(rhs);
      if(ofis.length>0) setOficina(ofis);
      if(agOfiRows.length>0){ const ao={}; agOfiRows.forEach(r=>{ if(r&&r.key) ao[r.key]=r.slots||[]; else if(r&&r.id&&r.data&&r.data.key) ao[r.data.key]=r.data.slots||[]; }); setAgendaOfi(ao); }
      if(hebRows.length>0) setPendHebert(hebRows);
      if(apRows.length>0) setApontamentos(apRows);
      if(sasRows.length>0) setSas(sasRows);
      if(carrosRows.length>0) setCarros(carrosRows);
      if(pendManRows && pendManRows.length>0) setPendManuela(pendManRows);
      if(ap150Rows.length>0) setApontamentos150(ap150Rows);
      if(agOfi150Rows.length>0){ const ao={}; agOfi150Rows.forEach(r=>{ if(r&&r.key) ao[r.key]=r.slots||[]; else if(r&&r.id&&r.data&&r.data.key) ao[r.data.key]=r.data.slots||[]; }); setAgendaOfi150(ao); }
      if(matRows.length>0) setPendMatheus(matRows);
      if(rupRows&&rupRows.length>0) setRupturas(rupRows);
      if(escRows.length>0){ const sched={}; const prev={}; escRows.forEach(r=>{ const rk=r.key||(r.data&&r.data.key); const rs=r.slots||(r.data&&r.data.slots)||[]; if(rk){ if(rk.startsWith("PREV__")) prev[rk.slice(6)]=rs; else sched[rk]=rs; } }); setSchedule(sched); setAgendaPrev(prev); }
      if(usrs.length>0){
        const merged=[...USERS];
        usrs.forEach(u=>{
          const idx=merged.findIndex(m=>m.id===u.id);
          if(idx>=0) merged[idx]={...merged[idx],...u};
          else merged.push(u);
        });
        setUsers(merged);
      }
      notify("✅ Dados carregados!");
    };
    load();
  },[]);

  // ── SALVAR AUTOMATICAMENTE ──
  const saveDB = async (table, items) => {
    for(const item of items) {
      await db.save(table, item.id, item);
    }
  };
  // Salva a escala de um técnico/dia no banco (visível para todos)
  const saveSched=(key,slots)=>{ setSchedule(p=>({...p,[key]:slots})); db.save("escala", key, {key, slots}); };
  // Agenda Preventiva (mensal) — salva no banco (prefixo PREV__ na mesma tabela)
  const saveAgendaPrev=(key,slots)=>{ setAgendaPrev(p=>({...p,[key]:slots})); db.save("escala", "PREV__"+key, {key:"PREV__"+key, slots}); };

  const updateReport=(id,changes)=>{const updated=(reports||[]).map(r=>r.id===id?{...r,...changes}:r);setReports(updated);db.save("relatorios",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const STS_PECA_OPTS=["Ruptura","Peça Solicitada","Peça Separada Aguardando Execução","Concluído"];
  const STS_PECA_COR={"Ruptura":{c:"#C62828",bg:"#FFF0F0"},"Peça Solicitada":{c:"#E67E00",bg:"#FFF8F0"},"Peça Separada Aguardando Execução":{c:"#1565C0",bg:"#EFF6FF"},"Concluído":{c:"#1A7A3C",bg:"#F0FFF5"}};
  const addPecaRel=(id)=>{const r=(reports||[]).find(x=>x.id===id);updateReport(id,{pecas:[...(r.pecas||[]),{situacao:"Peça Solicitada",peca:"",cod:"",quantidade:"",obs:""}]});};
  const updatePecaRel=(id,pi,changes)=>{const r=(reports||[]).find(x=>x.id===id);const pecas=[...(r.pecas||[])];pecas[pi]={...pecas[pi],...changes};updateReport(id,{pecas});};
  const delPecaRel=(id,pi)=>{const r=(reports||[]).find(x=>x.id===id);updateReport(id,{pecas:(r.pecas||[]).filter((_,i)=>i!==pi)});};
  const updateEmp=(id,changes)=>{const updated=(emprestimos||[]).map(r=>r.id===id?{...r,...changes}:r);setEmprestimos(updated);db.save("emprestimos",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateSaida=(id,changes)=>{const updated=(saidaEntrada||[]).map(r=>r.id===id?{...r,...changes}:r);setSaidaEntrada(updated);db.save("saida_entrada",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateRuptura=(id,changes)=>{const updated=(rupturas||[]).map(r=>r.id===id?{...r,...changes}:r);setRupturas(updated);db.save("rupturas_alm",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const delRuptura=(id)=>{setRupturas(p=>p.filter(x=>x.id!==id));db.delete("rupturas_alm",id);};
  const updateMU=(id,changes)=>{const updated=(processosMU||[]).map(r=>r.id===id?{...r,...changes}:r);setProcessosMU(updated);db.save("processos_mu",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateAF=(id,changes)=>{const updated=(processosAF||[]).map(r=>r.id===id?{...r,...changes}:r);setProcessosAF(updated);db.save("processos_af",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  // Requisições — salvar no banco (visível para todos)
  const updateReq=(id,changes)=>{ setRequisicoes(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("requisicoes",id,row); return np; }); };
  const addReq=()=>{ const row={id:`REQ${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),dataRequisicao:TODAY_STR,numRequisicao:"",nomePeca:"",codigoPeca:"",quantidade:"",atendimento:"corretivo",numRelatorio:"",patrimonio:"",tecnico:ALL_TECHS[0],situacao:"reservada",status:"reservada",dataExecucao:"",tecnicoExecucao:"",relatorioExecucao:"",concluido:"pendente",processoStatus:"em_andamento",tecnicoEntrega:"",dataEntrega:"",dataEntregaParcial:"",previsaoChegada:""}; setRequisicoes(p=>[row,...p]); db.save("requisicoes",row.id,row); notify("✅ Requisição criada e salva!"); };
  const delReq=(id)=>{ setRequisicoes(p=>p.filter(x=>x.id!==id)); db.delete("requisicoes",id); };
  // Uber — salvar no banco
  const updateUber=(id,changes)=>{ setUberPedidos(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("uber_pedidos",id,row); return np; }); };
  const addUber=()=>{ const row={id:`UBR${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,solicitante:"",departamento:"MANUTENÇÃO",motivo:"",empresa:"",patrimonio:"",relatorio:"",endereco:"",valor:"",status:"pendente",obs:""}; setUberPedidos(p=>[row,...p]); db.save("uber_pedidos",row.id,row); notify("✅ Pedido criado e salvo!"); };
  const delUber=(id)=>{ setUberPedidos(p=>p.filter(x=>x.id!==id)); db.delete("uber_pedidos",id); };
  // Financeiro — salvar no banco
  const updateFin=(id,changes)=>{ setFinanceiro(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("financeiro",id,row); return np; }); };
  const addFin=()=>{ const row={id:`FIN${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,ticket:"",tecnico:ALL_TECHS[0],solicitacao:"combustivel",atendimento:"",patrimonio:"",valor:"",situacao:"pendente",acerto:"nao",dataAcerto:"",reembolso:"nao",valorReembolso:"",ticketReembolso:""}; setFinanceiro(p=>[row,...p]); db.save("financeiro",row.id,row); notify("✅ Lançamento criado e salvo!"); };
  const delFin=(id)=>{ setFinanceiro(p=>p.filter(x=>x.id!==id)); db.delete("financeiro",id); };
  // CRUD genérico (salva no banco) para abas novas
  const mkCrud=(table,setFn)=>({
    update:(id,changes)=>{ setFn(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save(table,id,row); return np; }); },
    add:(base)=>{ const r={id:`${table.slice(0,3).toUpperCase()}${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false,...base}; setFn(p=>[r,...p]); db.save(table,r.id,r); notify("✅ Criado e salvo!"); },
    del:(id)=>{ setFn(p=>p.filter(x=>x.id!==id)); db.delete(table,id); },
  });
  const hebCrud=mkCrud("pendencias_hebert",setPendHebert);
  const saveAgendaOfi=(key,slots)=>{ setAgendaOfi(p=>({...p,[key]:slots})); db.save("agenda_oficina", key, {key, slots}); };
  const updateApon=(id,changes)=>{const updated=(apontamentos||[]).map(r=>r.id===id?{...r,...changes}:r);setApontamentos(updated);db.save("apontamentos_oficina",id,updated.find(r=>r.id===id));};
  const addApon=()=>{ const row={id:`APO${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0],servico:SERVICOS_OFICINA[0],inicio:"",termino:"",total:"",oficina:"1340",obs:"",relatorio:"",arquivado:false}; setApontamentos(p=>[...p,row]); db.save("apontamentos_oficina",row.id,row); notify("✅ Linha adicionada!"); };
  const delApon=(id)=>{ setApontamentos(p=>p.filter(x=>x.id!==id)); db.delete("apontamentos_oficina",id); };
  const updateSas=(id,changes)=>{ setSas(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("sas",id,row); return np; }); };
  const addSas=()=>{ const row={id:`SAS${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),dataSolicitacao:TODAY_STR,email:"",nfNum:"",equipamento:"",cliente:"",nome:"",tel:"",emailContato:"",servico:"entrega_tecnica",dataRealizacao:"",relatorioMov:"",envioFaturamento:"",valor:"",status:"pendente",dataEnvioSas:""}; setSas(p=>[row,...p]); db.save("sas",row.id,row); notify("✅ SAS criado!"); };
  const delSas=(id)=>{ setSas(p=>p.filter(x=>x.id!==id)); db.delete("sas",id); };

  const mathCrud=mkCrud("pendencias_matheus",setPendMatheus);
  const saveAgendaOfi150=(key,slots)=>{ setAgendaOfi150(p=>({...p,[key]:slots})); db.save("agenda_ofi_150",key,{key,slots}); };
  const updateApon150=(id,changes)=>{const updated=(apontamentos150||[]).map(r=>r.id===id?{...r,...changes}:r);setApontamentos150(updated);db.save("apontamentos_150",id,updated.find(r=>r.id===id));};
  const addApon150=()=>{ const row={id:`AP150${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,os:"",patrimonio:"",tecnico:"Matheus",servico:SERVICOS_OFICINA[0],inicio:"",termino:"",total:"",oficina:"150",obs:"",relatorio:""}; setApontamentos150(p=>[row,...p]); db.save("apontamentos_150",row.id,row); notify("✅ Apontamento criado!"); };
  const delApon150=(id)=>{ setApontamentos150(p=>p.filter(x=>x.id!==id)); db.delete("apontamentos_150",id); };
  const abrirEditar150=(a)=>{setEditApon150(a);setApon150Form({data:a.data||TODAY_STR,os:a.os||"",patrimonio:a.patrimonio||"",tecnico:a.tecnico||OFICINA_TECHS[0]||"",servico:a.servico||SERVICOS_OFICINA[0]||"",inicio:a.inicio||"",termino:a.termino||"",total:a.total||"",oficina:a.oficina||"150",relatorio:a.relatorio||"",obs:a.obs||""});setModalApon150(true);};
  const salvar150=()=>{const total=calcHoras(apon150Form.inicio,apon150Form.termino)||apon150Form.total;if(editApon150){updateApon150(editApon150.id,{...apon150Form,total});setModalApon150(false);setEditApon150(null);notify("✅ Atualizado!");}else{const row={id:`AP150${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false,...apon150Form,total};setApontamentos150(p=>[row,...p]);db.save("apontamentos_150",row.id,row);setModalApon150(false);notify("✅ Apontamento salvo!");}};
  const froCrud=mkCrud("pendencias_frota",setFrota);
  const priCrud=mkCrud("prioridades_clientes",setPrioridades);
  const rhCrud=mkCrud("rh_fiscal",setRhFiscal);
  const updateCarro=(id,changes)=>{ setCarros(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("carros",id,row); return np; }); };
  const addCarro=()=>{ const row={id:`CAR${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,placa:PLACAS_CARROS[0],tecnico:ALL_TECHS[0],manutencao:"",valor:"",aprovadoGustavo:"nao",dataExecucao:"",oficina:"",obs:"",arquivado:false}; setCarros(p=>[row,...p]); db.save("carros",row.id,row); };
  const delCarro=(id)=>{ setCarros(p=>p.filter(x=>x.id!==id)); db.delete("carros",id); };
  const pendManCrud={
    add:(d)=>{ const row={...d,id:`PM${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false}; setPendManuela(p=>[row,...p]); db.save("pendencias_manuela",row.id,row); notify("✅ Salvo!"); },
    update:(id,ch)=>{ setPendManuela(prev=>{ const np=prev.map(x=>x.id===id?{...x,...ch}:x); const row=np.find(x=>x.id===id); db.save("pendencias_manuela",id,row); return np; }); },
    del:(id)=>{ setPendManuela(p=>p.filter(x=>x.id!==id)); db.delete("pendencias_manuela",id); notify("🗑 Excluído!"); },
  };
  const updateOfi=(id,changes)=>{ setOficina(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("oficina",id,row); return np; }); };
  // Usuários (gerenciados pela gestora)
  const saveUser=(u)=>{ setUsers(prev=>{ const ex=prev.find(x=>x.id===u.id); return ex?prev.map(x=>x.id===u.id?u:x):[...prev,u]; }); db.save("usuarios",u.id,u); notify("✅ Usuário salvo!"); };
  const deleteUser=(id)=>{ if(id==="manuela"){alert("Não é possível excluir a gestora principal.");return;} setUsers(prev=>prev.filter(x=>x.id!==id)); db.delete("usuarios",id); notify("Usuário removido."); };

  const filteredReports=(reports||[]).filter(d=>{
    if(filterTipo!=="todos"&&d.type!==filterTipo)return false;
    if(filterTech!=="todos"&&d.tecnico!==filterTech)return false;
    if(filterStatus!=="todos"&&d.status!==filterStatus)return false;
    if(filterRegion!=="todas"&&d.region!==filterRegion)return false;
    if(filterDateFrom&&d.date<filterDateFrom)return false;
    if(filterDateTo&&d.date>filterDateTo)return false;
    if(searchText){const s=searchText.toLowerCase();if(!d.empresa?.toLowerCase().includes(s)&&!d.acao?.toLowerCase().includes(s)&&!d.reportNum?.toLowerCase().includes(s)&&!d.patrimonio?.toLowerCase().includes(s))return false;}
    return true;
  });

  const filteredOficina=oficina.filter(d=>{
    if(ofiTipo!=="todos"&&d.type!==ofiTipo)return false;
    if(ofiTech!=="todos"&&d.tecnico!==ofiTech)return false;
    if(ofiStatus!=="todos"&&d.status!==ofiStatus)return false;
    if(ofiRegion!=="todas"&&d.region!==ofiRegion)return false;
    if(ofiFrom&&d.date<ofiFrom)return false;
    if(ofiTo&&d.date>ofiTo)return false;
    if(ofiSearch){const s=ofiSearch.toLowerCase();if(!d.empresa?.toLowerCase().includes(s)&&!d.acao?.toLowerCase().includes(s)&&!d.reportNum?.toLowerCase().includes(s)&&!d.patrimonio?.toLowerCase().includes(s))return false;}
    return true;
  });

  const empAlerta=(emprestimos||[]).filter(e=>{
    if(!e.dataRetorno||e.situacao==="Atendido")return false;
    const d=diffDays(e.dataRetorno);
    return d!==null&&d<0;
  }).length;

  // Lista achatada dos atendimentos da Agenda (para o Dashboard)
  const techRegionMap={}; Object.entries(REGIONS).forEach(([rk,rv])=>rv.techs.forEach(t=>{techRegionMap[t]=rk;}));
  const agendaAtendimentos=[];
  Object.keys(schedule).forEach(k=>{ const i=k.indexOf("__"); if(i<0)return; const t=k.slice(0,i), dt=k.slice(i+2); (schedule[k]||[]).forEach(s=>agendaAtendimentos.push({tecnico:t,date:dt,region:techRegionMap[t]||"",type:s.type||"preventivo",status:s.status,horasTrabalhadas:s.horasTrabalhadas||calcHoras(s.horaEntrada,s.horaSaida),horaEntrada:s.horaEntrada,horaSaida:s.horaSaida,empresa:s.client||"",patrimonio:s.patrimonio||"",relatorio:s.relatorio||""})); });

  if(!user)return<LoginScreen users={users} onLogin={u=>{setUser(u);if(u.acessoSas&&!u.acessoComercial)setTab("sas");else if(u.acessoComercial)setTab("mau_uso");else if(u.apenasAgenda)setTab("agenda_prev");else if(u.apenasOficina)setTab("agenda_ofi");else if(u.apenasOficina150)setTab("agenda_ofi_150");try{localStorage.setItem("grupomov_user",JSON.stringify({id:u.id}));}catch(e){}notify(`Bem-vinda, ${u.name}!`);}}/>;

  const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#F0F2F5;font-family:'Inter',sans-serif;}
  textarea{resize:none;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:#F0F0F0;border-radius:3px;}
  ::-webkit-scrollbar-thumb{background:#D0D0D0;border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:#B0B0B0;}

  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{transform:translateY(-16px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

  .card{
    background:#FFFFFF;border-radius:10px;
    box-shadow:0 1px 3px rgba(0,0,0,.05),0 4px 12px rgba(0,0,0,.04);
    border:1px solid rgba(0,0,0,.06);
    transition:box-shadow .2s ease;
  }
  .card:hover{box-shadow:0 2px 6px rgba(0,0,0,.06),0 8px 20px rgba(0,0,0,.07);}

  .btn{cursor:pointer;border:none;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;transition:all .18s ease;letter-spacing:0;}
  .btn-primary{background:#F5C200;color:#1A1A1A;padding:9px 18px;box-shadow:0 2px 6px rgba(245,194,0,.3);}
  .btn-primary:hover{background:#FFCF00;transform:translateY(-1px);box-shadow:0 4px 12px rgba(245,194,0,.4);}
  .btn-primary:active{transform:translateY(0);}
  .btn-ghost{background:transparent;color:#555;padding:8px 14px;border:1.5px solid #E0E0E0;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;transition:all .18s;}
  .btn-ghost:hover{background:#F5F5F5;border-color:#BDBDBD;color:#222;}

  .nav-tab{
    cursor:pointer;padding:9px 15px;border-radius:0;
    font-size:11.5px;font-weight:600;border:none;
    background:transparent;color:#777;
    font-family:'Inter',sans-serif;
    white-space:nowrap;transition:all .15s;
    border-bottom:2.5px solid transparent;
    margin-bottom:-1px;
  }
  .nav-tab.active{color:#F5C200;border-bottom-color:#F5C200;background:rgba(245,194,0,.07);}
  .nav-tab:hover:not(.active){color:#EEE;background:rgba(255,255,255,.06);}

  select{
    background:#FFFFFF;color:#1A1A1A;
    border:1.5px solid #E5E7EB;border-radius:8px;
    padding:7px 10px;font-family:'Inter',sans-serif;font-size:12px;
    cursor:pointer;outline:none;transition:border-color .15s;
  }
  select:focus{border-color:#F5C200;box-shadow:0 0 0 3px rgba(245,194,0,.15);}

  input[type=text],input[type=password],input[type=date],input[type=time],textarea{
    background:#FFFFFF;color:#1A1A1A;
    border:1.5px solid #E5E7EB;border-radius:8px;
    padding:8px 11px;font-family:'Inter',sans-serif;font-size:12px;
    outline:none;transition:all .15s;
  }
  input:focus,textarea:focus{border-color:#F5C200;box-shadow:0 0 0 3px rgba(245,194,0,.12);}
  input:disabled,select:disabled{background:#F9FAFB;color:#9CA3AF;cursor:not-allowed;}

  .notif{
    position:fixed;top:18px;right:18px;z-index:9999;
    background:#111827;color:#F9FAFB;
    padding:12px 20px;border-radius:10px;
    font-size:13px;font-weight:600;
    animation:slideDown .22s ease;
    box-shadow:0 10px 30px rgba(0,0,0,.25);
    border-left:4px solid #F5C200;
    display:flex;align-items:center;gap:8px;
  }

  .tbl-wrap{overflow-x:auto;width:100%;}
  table{width:100%;border-collapse:separate;border-spacing:0;min-width:700px;}
  th{
    background:#F8F9FA;padding:10px 14px;
    text-align:left;font-size:10.5px;font-weight:700;
    color:#6B7280;text-transform:uppercase;letter-spacing:.7px;
    border-bottom:2px solid #E5E7EB;white-space:nowrap;
    font-family:'Inter',sans-serif;
  }
  td{
    padding:10px 14px;font-size:12.5px;
    border-bottom:1px solid #F3F4F6;
    vertical-align:middle;color:#374151;
    font-family:'Inter',sans-serif;
  }
  tr:hover td{background:#FEFCE8;}
  tr:last-child td{border-bottom:none;}

  /* STATUS BADGES */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.2px;font-family:'Inter',sans-serif;}
  .badge-green{background:#F0FDF4;color:#16A34A;}
  .badge-red{background:#FEF2F2;color:#EF4444;}
  .badge-yellow{background:#FEF9C3;color:#A16207;}
  .badge-blue{background:#EFF6FF;color:#2563EB;}
  .badge-orange{background:#FFEDD5;color:#EA580C;}
  .badge-gray{background:#F3F4F6;color:#6B7280;}
  .badge-purple{background:#EDE9FE;color:#7C3AED;}
`;



  const modals = (<>
        {editSlot&&<EditSlotModal
        slot={editSlotForm}
        tipo={editSlot.tipo}
        onClose={()=>setEditSlot(null)}
        onSave={novo=>{
          if(editSlot.tipo==="tecnico"){const arr=[...(schedule[editSlot.key]||[])];arr[editSlot.si]=novo;saveSched(editSlot.key,arr);}
          else if(editSlot.tipo==="ofi"){const arr=[...(agendaOfi[editSlot.key]||[])];arr[editSlot.si]=novo;saveAgendaOfi(editSlot.key,arr);}
          else if(editSlot.tipo==="ofi150"){const arr=[...(agendaOfi150[editSlot.key]||[])];arr[editSlot.si]=novo;saveAgendaOfi150(editSlot.key,arr);}
          notify("✅ Atendimento atualizado!");
          setEditSlot(null);
        }}
        />}
        {modalReport&&<ReportModal initial={editReport} onClose={()=>{setModalReport(false);setEditReport(null);}} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editReport){setReports(p=>p.map(x=>x.id===dd.id?dd:x));db.save("relatorios",dd.id,dd);notify("✅ Atualizado!");}else{setReports(p=>[dd,...p]);db.save("relatorios",dd.id,dd);notify("✅ Relatório salvo!");}setEditReport(null);setModalReport(false);}}/>}
        {modalOfi&&<ReportModal techs={OFICINA_TECHS} onClose={()=>setModalOfi(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setOficina(p=>[dd,...p]);db.save("oficina",dd.id,dd);notify("✅ Relatório (Oficina) salvo!");}}/>}

        {uberModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setUberModal(false);setUberEdit(null);}}}>
            <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
              <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0}}><div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{uberEdit?.id?"✏️ Editar":"🚗 Novo"} Pedido Uber</div><button onClick={()=>{setUberModal(false);setUberEdit(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32}}>✕</button></div>
              <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["data","Data","date"],["solicitante","Solicitante","text"],["empresa","Empresa","text"],["patrimonio","PAT","text"],["relatorio","Relatório","text"],["motivo","Motivo","text"],["valor","Valor","text"],["endereco","Endereço","text"],["obs","Obs","text"]].map(([k,l,t])=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>{l}</label><input type={t} value={uberEdit?.[k]||""} onChange={e=>setUberEdit(p=>({...p,[k]:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                ))}
                <div style={{gridColumn:"span 2",display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                  <BtnG onClick={()=>{setUberModal(false);setUberEdit(null);}}>Cancelar</BtnG>
                  <BtnY onClick={()=>{const d=uberEdit;if(!d?.solicitante){alert("Informe o solicitante.");return;}if(d.id){updateUber(d.id,d);}else{const row={...d,id:`UBR${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),status:"pendente",arquivado:false};setUberPedidos(p=>[row,...p]);db.save("uber",row.id,row);}notify("✅ Salvo!");setUberModal(false);setUberEdit(null);}}>Salvar</BtnY>
                </div>
              </div>
            </div>
          </div>
        )}
        {finModalOpen&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setFinModalOpen(false);setFinEdit(null);}}}>
            <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
              <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0}}><div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{finEdit?.id?"✏️ Editar":"💳 Novo"} Lançamento Financeiro</div><button onClick={()=>{setFinModalOpen(false);setFinEdit(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32}}>✕</button></div>
              <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["data","Data","date"],["ticket","Ticket","text"],["atendimento","Atendimento","text"],["patrimonio","PAT","text"],["valor","Valor","text"],["obs","Obs","text"]].map(([k,l,t])=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>{l}</label><input type={t} value={finEdit?.[k]||""} onChange={e=>setFinEdit(p=>({...p,[k]:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                ))}
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Tipo</label><select value={finEdit?.solicitacao||"combustivel"} onChange={e=>setFinEdit(p=>({...p,solicitacao:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="combustivel">⛽ Combustível</option><option value="alimentacao">🍽️ Alimentação</option><option value="viagem">✈️ Viagem</option><option value="outros">📦 Outros</option></select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Técnico</label><select value={finEdit?.tecnico||ALL_TECHS[0]} onChange={e=>setFinEdit(p=>({...p,tecnico:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Situação</label><select value={finEdit?.situacao||"pendente"} onChange={e=>setFinEdit(p=>({...p,situacao:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="pendente">⏳ Pendente</option><option value="pago">✅ Pago</option></select></div>
                <div style={{gridColumn:"span 2",display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                  <BtnG onClick={()=>{setFinModalOpen(false);setFinEdit(null);}}>Cancelar</BtnG>
                  <BtnY onClick={()=>{const d=finEdit;if(d?.id){updateFin(d.id,d);}else{const row={...d,id:`FIN${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false};setFinanceiro(p=>[row,...p]);db.save("financeiro",row.id,row);}notify("✅ Salvo!");setFinModalOpen(false);setFinEdit(null);}}>Salvar</BtnY>
                </div>
              </div>
            </div>
          </div>
        )}
        {sasModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setSasModal(false);setSasEdit(null);}}}>
            <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
              <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0}}><div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{sasEdit?.id?"✏️ Editar":"📄 Novo"} SAS</div><button onClick={()=>{setSasModal(false);setSasEdit(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32}}>✕</button></div>
              <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["dataSolicitacao","Dt Solicitação","date"],["email","Email","email"],["nfNum","NF","text"],["cliente","Cliente","text"],["nome","Nome","text"],["equipamento","Equipamento","text"],["relatorioMov","Rel. MOV","text"],["valor","Valor","text"],["dataRealizacao","Dt Realização","date"],["envioFaturamento","Envio Faturamento","date"]].map(([k,l,t])=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>{l}</label><input type={t} value={sasEdit?.[k]||""} onChange={e=>setSasEdit(p=>({...p,[k]:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                ))}
                <div style={{gridColumn:"span 2",display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                  <BtnG onClick={()=>{setSasModal(false);setSasEdit(null);}}>Cancelar</BtnG>
                  <BtnY onClick={()=>{const d=sasEdit;if(!d?.cliente&&!d?.nome){alert("Informe o cliente.");return;}if(d?.id){updateSas(d.id,d);}else{const row={...d,id:`SAS${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),status:"pendente",arquivado:false};setSas(p=>[row,...p]);db.save("sas",row.id,row);}notify("✅ Salvo!");setSasModal(false);setSasEdit(null);}}>Salvar</BtnY>
                </div>
              </div>
            </div>
          </div>
        )}
        {froModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setFroModal(false);setFroEdit(null);}}}>
            <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
              <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0}}><div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{froEdit?.id?"✏️ Editar":"🚜 Nova"} Pendência Frota</div><button onClick={()=>{setFroModal(false);setFroEdit(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32}}>✕</button></div>
              <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["dataEnvio","Data Envio","date"],["rel","Relatório","text"],["empresa","Empresa","text"],["pat","PAT","text"],["nf","NF","text"],["novoPat","Novo PAT","text"],["relEntrega","Rel. Entrega","text"]].map(([k,l,t])=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>{l}</label><input type={t} value={froEdit?.[k]||""} onChange={e=>setFroEdit(p=>({...p,[k]:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                ))}
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Tipo</label><select value={froEdit?.patTipo||"bateria"} onChange={e=>setFroEdit(p=>({...p,patTipo:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="bateria">🔋 Bateria</option><option value="carregador">🔌 Carregador</option><option value="estrado">🟫 Estrado</option><option value="maquina">🏗️ Máquina</option></select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Técnico</label><select value={froEdit?.tecnico||ALL_TECHS[0]} onChange={e=>setFroEdit(p=>({...p,tecnico:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Resolvido</label><select value={froEdit?.resolvido||"nao"} onChange={e=>setFroEdit(p=>({...p,resolvido:e.target.value}))} style={{fontSize:13,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="nao">⏳ Não</option><option value="sim">✅ Sim</option></select></div>
                <div style={{gridColumn:"span 2",display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                  <BtnG onClick={()=>{setFroModal(false);setFroEdit(null);}}>Cancelar</BtnG>
                  <BtnY onClick={()=>{const d=froEdit;if(!d?.empresa){alert("Informe a empresa.");return;}if(d?.id){froCrud.update(d.id,d);}else{froCrud.add({...d,arquivado:false});}notify("✅ Salvo!");setFroModal(false);setFroEdit(null);}}>Salvar</BtnY>
                </div>
              </div>
            </div>
          </div>
        )}
        {modalImportOfi&&<ImportExcelModal onClose={()=>setModalImportOfi(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setOficina(p=>[...stamp,...p]);stamp.forEach(d=>db.save("oficina",d.id,d));setModalImportOfi(false);notify(`✅ ${stamp.length} importado(s)!`);}}/>}
        {modalImportSas&&<ImportExcelModal onClose={()=>setModalImportSas(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"S"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setSas(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("sas",d.id,d));setModalImportSas(false);notify(`✅ ${stamp.length} SAS importado(s)!`);}}/>}
        {modalImportMU2&&<ImportExcelModal onClose={()=>setModalImportMU2(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"MU"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setProcessosMU(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("processos_mu",d.id,d));setModalImportMU2(false);notify(`✅ ${stamp.length} Mau Uso importado(s)!`);}}/>}
        {modalImportAF2&&<ImportExcelModal onClose={()=>setModalImportAF2(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"AF"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setProcessosAF(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("processos_af",d.id,d));setModalImportAF2(false);notify(`✅ ${stamp.length} A Faturar importado(s)!`);}}/>}
        {modalImportRel&&<ImportExcelModal onClose={()=>setModalImportRel(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"R"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setReports(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("reports",d.id,d));setModalImportRel(false);notify(`✅ ${stamp.length} relatório(s) importado(s)!`);}}/>}
        {modalImportPH&&<ImportExcelModal onClose={()=>setModalImportPH(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"PH"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setPendHebert(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("pendencias_hebert",d.id,d));setModalImportPH(false);notify(`✅ ${stamp.length} serviço(s) importado(s)!`);}}/>}
        {modalImportPM&&<ImportExcelModal onClose={()=>setModalImportPM(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,id:d.id||"PM"+Date.now()+Math.random().toString(36).slice(2,6),registradoPor:d.registradoPor||user.name}));setPendMatheus(p=>[...stamp,...(p||[])]);stamp.forEach(d=>db.save("pendencias_matheus",d.id,d));setModalImportPM(false);notify(`✅ ${stamp.length} serviço(s) importado(s)!`);}}/>}
        {modalImportApon&&<ImportAponModal label="Apontamentos 1340" onClose={()=>setModalImportApon(false)} onImport={novos=>{setApontamentos(p=>[...novos,...(p||[])]);novos.forEach(d=>db.save("apontamentos_oficina",d.id,d));setModalImportApon(false);notify(`✅ ${novos.length} apontamento(s) importado(s)!`);}}/>}
        {modalImportApon150&&<ImportAponModal label="Apontamentos 150" onClose={()=>setModalImportApon150(false)} onImport={novos=>{setApontamentos150(p=>[...novos,...(p||[])]);novos.forEach(d=>db.save("apontamentos_150",d.id,d));setModalImportApon150(false);notify(`✅ ${novos.length} apontamento(s) importado(s)!`);}}/>}
        {modalImportAgenda&&<ImportAgendaModal onClose={()=>setModalImportAgenda(false)} onImport={novos=>{
          novos.forEach(d=>{
            const tech=d.tecnico||"Sem Técnico";
            const dt=d.data||TODAY_STR;
            const key=`${tech}__${dt}`;
            const slot={client:d.client||"",cidade:d.cidade||"",patrimonio:d.patrimonio||"",horimetro:d.horimetro||"",horaEntrada:d.horaEntrada||"",horaSaida:d.horaSaida||"",horasTrabalhadas:d.horasTrabalhadas||"",relatorio:d.relatorio||"",obs:d.obs||"",servico:d.servico||d.type||"corretiva",type:d.type||d.servico||"corretivo",status:d.status||"agendada",servicos:d.servicos||[],obsServico:d.obsServico||""};
            saveSched(key,[...(schedule[key]||[]),slot]);
          });
          setModalImportAgenda(false);
          notify(`✅ ${novos.length} atendimento(s) importado(s)!`);
        }}/>}
        {modalUsers&&<UsersModal users={users} onClose={()=>setModalUsers(false)} onSaveUser={saveUser} onDeleteUser={deleteUser}/>}
        {modalImport&&<ImportExcelModal onClose={()=>setModalImport(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setReports(p=>[...stamp,...p]);stamp.forEach(d=>db.save("relatorios",d.id,d));setModalImport(false);notify(`✅ ${stamp.length} relatório(s) importado(s)!`);}}/>}
        {modalMU&&<ProcessoModal onClose={()=>{setModalMU(false);setEditMU(null);}} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editMU){setProcessosMU(p=>p.map(x=>x.id===dd.id?dd:x));db.save("processos_mu",dd.id,dd);notify("✅ Atualizado!");}else{setProcessosMU(p=>[dd,...p]);db.save("processos_mu",dd.id,dd);notify("✅ Processo Mau Uso salvo!");}setEditMU(null);setModalMU(false);}} tipo="mau_uso" initial={editMU}/>}
        {modalAF&&<ProcessoModal onClose={()=>{setModalAF(false);setEditAF(null);}} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editAF){setProcessosAF(p=>p.map(x=>x.id===dd.id?dd:x));db.save("processos_af",dd.id,dd);notify("✅ Atualizado!");}else{setProcessosAF(p=>[dd,...p]);db.save("processos_af",dd.id,dd);notify("✅ Processo A Faturar salvo!");}setEditAF(null);setModalAF(false);}} tipo="a_faturar" initial={editAF}/>}
        {modalEmp&&<EmpModal onClose={()=>{setModalEmp(false);setEditEmp(null);}} onSave={d=>{const dd=editEmp?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editEmp)setEmprestimos(p=>p.map(x=>x.id===dd.id?dd:x));else setEmprestimos(p=>[dd,...p]);db.save("emprestimos",dd.id,dd);notify("✅ Salvo!");}} initial={editEmp}/>}
        {modalSaida&&<SaidaModal onClose={()=>{setModalSaida(false);setEditSaida(null);}} onSave={d=>{const dd=editSaida?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editSaida)setSaidaEntrada(p=>p.map(x=>x.id===dd.id?dd:x));else setSaidaEntrada(p=>[dd,...p]);db.save("saida_entrada",dd.id,dd);notify("✅ Salvo!");}} initial={editSaida}/>}
  </>);


  const renderTab = () => {
    const allowedTabs = user?.acessoSas&&!user?.acessoComercial ? ["sas"] :
      user?.acessoComercial ? (user?.semSas?["mau_uso","a_faturar","dashboard_processos"]:["mau_uso","a_faturar","dashboard_processos","sas"]) :
      user?.apenasAgenda||user?.apenasAgenda150 ? ["agenda_prev","dashboard_tech","dashboard_processos"] :
      user?.apenasOficina ? ["agenda_ofi","apontamentos_oficina","pendencias_hebert","dashboard_ofi"] :
      user?.apenasOficina150 ? ["agenda_ofi_150","apontamentos_150","pendencias_matheus","dashboard_ofi_150"] :
      null;
    if(allowedTabs&&!allowedTabs.includes(tab)) return null;
    return (
      <>
        {/* ── CONFERÊNCIA DE RELATÓRIOS ── */}
        {tab==="relatorios"&&(()=>{
          const lista=(reports||[]).filter(r=>r&&(showArqRel?true:r.processoStatus!=="arquivado")).filter(r=>{
            if(relFiltroData&&r.dataAtendimento!==relFiltroData)return false;
            if(relFiltroEmp&&!(r.empresa||"").toLowerCase().includes(relFiltroEmp.toLowerCase()))return false;
            if(relFiltroPat&&!(r.patrimonio||"").toLowerCase().includes(relFiltroPat.toLowerCase()))return false;
            if(relFiltroTech!=="todos"&&r.tecnico!==relFiltroTech)return false;
            if(relFiltroAtend!=="todos"&&r.atendimento!==relFiltroAtend)return false;
            if(relFiltroStatus!=="todos"&&r.statusFinal!==relFiltroStatus)return false;
            return true;
          });
          const totalConc=lista.filter(r=>r.statusFinal==="Concluído").length;
          const totalPend=lista.filter(r=>r.statusFinal!=="Concluído").length;
          const totalCorr=lista.filter(r=>r.atendimento==="corretivo").length;

          return(<div style={{animation:"fadeIn .3s ease"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📋 Conferência de Relatórios</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} relatório(s) · <span style={{color:"#C62828",fontWeight:700}}>{totalPend} pendentes</span></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <BtnImport onClick={()=>setModalImportRel(true)}/>
                <button onClick={()=>setShowArqRel(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqRel?"#1A1A1A":"#FFF",color:showArqRel?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqRel?"Ocultar":"Arquivados"}</button>
                <label style={{cursor:pdfLoading?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:"none",background:pdfLoading?"#E0E0E0":"#1565C0",color:"#FFF",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
                  {pdfLoading?"⏳ Lendo...":"📄 Ler PDF"}
                  <input type="file" accept=".pdf" style={{display:"none"}} disabled={pdfLoading} onChange={async(e)=>{
                    const file=e.target.files?.[0]; if(!file)return;
                    setPdfLoading(true);
                    try{
                      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
                      const resp=await fetch("https://mov-ia.vercel.app/api/read-pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pdfBase64:b64})});
                      const respText=await resp.text();
                      if(!resp.ok){let m="Erro API ("+resp.status+"): "+respText.slice(0,200);try{const j=JSON.parse(respText);m=j.error||j.message||m;}catch(e){}throw new Error(m);}
                      let data;try{data=JSON.parse(respText);}catch(e){throw new Error("Resposta inválida: "+respText.slice(0,100));}
                      const txt=data.content?.[0]?.text||"{}";
                      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
                      const pecasAPI=(parsed.pecasUsadas||[]).map(p=>({situacao:"Peça Solicitada",peca:p.peca||"",cod:p.cod||"",quantidade:p.quantidade||"1",obs:""}));
                      const row={id:`REL${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),atendimento:parsed.tipoAtendimento||"preventivo",statusFinal:parsed.statusFinal||"Pendente Peças",dataAtendimento:parsed.dataAtendimento||TODAY_STR,empresa:parsed.empresa||"",cidade:parsed.cidade||"",patrimonio:parsed.patrimonio||"",horimetro:parsed.horimetro||"",tecnico:parsed.tecnico||ALL_TECHS[0],chamado:parsed.numChamado||"",servico:parsed.servico||"Mecânica",obs:parsed.obs||"",pecas:pecasAPI,processoStatus:"em_andamento",reportNum:parsed.reportNum||"",dataAtendimento:parsed.dataAtendimento||parsed.date||"",atendimento:parsed.type||parsed.atendimento||"corretivo",statusFinal:parsed.statusFinal||parsed.status||"Pendente",chamado:parsed.numChamado||parsed.chamado||""};
                      setReports(p=>[row,...p]);db.save("relatorios",row.id,row);notify("✅ Relatório criado via PDF!");
                    }catch(err){alert("Erro ao processar PDF: "+(err?.message||JSON.stringify(err)));}
                    setPdfLoading(false);e.target.value="";
                  }}/>
                </label>
                <BtnExcel onClick={()=>exportCSV(lista,"relatorios_grupomov",[{key:"dataAtendimento",label:"Data"},{key:"atendimento",label:"Tipo"},{key:"statusFinal",label:"Status"},{key:"empresa",label:"Empresa"},{key:"cidade",label:"Cidade"},{key:"patrimonio",label:"PAT"},{key:"horimetro",label:"Horímetro"},{key:"tecnico",label:"Técnico"},{key:"chamado",label:"Chamado"},{key:"servico",label:"Serviço"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                <BtnY onClick={()=>setModalReport(true)}>+ Novo Relatório</BtnY>
              </div>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:totalPend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Concluídos",v:totalConc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Corretivos",v:totalCorr,c:"#E67E00",bg:"#FFF8F0",i:"🔧"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:19,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {/* Filtros */}
            <div className="card" style={{padding:"6px 10px",marginBottom:16,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input type="date" value={relFiltroData} onChange={e=>setRelFiltroData(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}} title="Data exata"/>
              <input type="text" value={relFiltroEmp} onChange={e=>setRelFiltroEmp(e.target.value)} placeholder="🔍 Empresa" style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",minWidth:140}}/>
              <input type="text" value={relFiltroPat} onChange={e=>setRelFiltroPat(e.target.value)} placeholder="🔍 PAT" style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",width:100}}/>
              <select value={relFiltroTech} onChange={e=>setRelFiltroTech(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={relFiltroAtend} onChange={e=>setRelFiltroAtend(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}><option value="todos">Todos tipos</option><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select>
              <select value={relFiltroStatus} onChange={e=>setRelFiltroStatus(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}><option value="todos">Todos status</option><option>Pendente Peças</option><option>Concluído</option></select>
              {(relFiltroData||relFiltroEmp||relFiltroPat||relFiltroTech!=="todos"||relFiltroAtend!=="todos"||relFiltroStatus!=="todos")&&<button onClick={()=>{setRelFiltroData("");setRelFiltroEmp("");setRelFiltroPat("");setRelFiltroTech("todos");setRelFiltroAtend("todos");setRelFiltroStatus("todos");}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {/* Cards */}
            {lista.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📋</div><div style={{fontSize:15,fontWeight:600}}>Nenhum relatório</div><div style={{fontSize:13,marginTop:6}}>Use "+ Novo Relatório" ou "Ler PDF"</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {lista.map(r=>{
                  const isCorr=r.atendimento==="corretivo";
                  const isConc=r.statusFinal==="Concluído";
                  const pecas=r.pecas||[];
                  const borderC=isConc?"#1A7A3C":isCorr?"#C62828":"#1565C0";
                  return(<div key={r.id} className="card" style={{borderTop:`4px solid ${borderC}`,padding:0,overflow:"hidden",opacity:r.processoStatus==="arquivado"?0.55:1}}>
                    <div style={{padding:"7px 10px",background:isConc?"#F0FFF5":isCorr?"#FFF0F0":"#EFF6FF",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:isCorr?"#C62828":"#1565C0",background:"#FFF",border:`1px solid ${isCorr?"#C6282833":"#1565C033"}`,borderRadius:20,padding:"2px 10px"}}>{isCorr?"🔧 Corretivo":"🔵 Preventivo"}</span>
                        <select value={r.statusFinal||"Pendente Peças"} onChange={e=>updateReport(r.id,{statusFinal:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:isConc?"#1A7A3C":"#C62828",background:isConc?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option>Pendente Peças</option><option>Concluído</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>addPecaRel(r.id)} title="Add Peça" style={{background:"#FFF8F0",border:"none",borderRadius:6,color:"#E67E00",cursor:"pointer",padding:"4px 7px",fontSize:13,fontWeight:700}}>+📦</button>
                        <button onClick={()=>{setEditReport(r);setModalReport(true);}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateReport(r.id,{processoStatus:r.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?")){setReports(p=>p.filter(x=>x.id!==r.id));db.delete("relatorios",r.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {r.dataAtendimento||"—"} · PAT: <b>{r.patrimonio||"—"}</b> · Hor: {r.horimetro||"—"}</div></div>
                        {r.reportNum&&<span style={{fontSize:10,fontWeight:700,color:"#888",background:"#F0F0F0",borderRadius:6,padding:"2px 7px"}}>#{r.reportNum}</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Técnico</div><select value={r.tecnico||ALL_TECHS[0]} onChange={e=>updateReport(r.id,{tecnico:e.target.value})} style={{width:"100%",fontSize:11,fontWeight:700,border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Serviço</div><select value={r.servico||"Mecânica"} onChange={e=>updateReport(r.id,{servico:e.target.value})} style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Chamado</div><input type="text" value={r.chamado||""} onChange={e=>updateReport(r.id,{chamado:e.target.value})} placeholder="—" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Cidade</div><input type="text" value={r.cidade||""} onChange={e=>updateReport(r.id,{cidade:e.target.value})} placeholder="—" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F6F0FB",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#8E44AD",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🔖 Requisição</div><input type="text" value={r.requisicao||""} onChange={e=>updateReport(r.id,{requisicao:e.target.value})} placeholder="REQ-000" style={{width:"100%",fontSize:12,fontWeight:700,color:"#8E44AD",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                      </div>
                      {r.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {r.obs}</div>}
                      {pecas.length>0&&<div style={{borderTop:"1px solid #F0F0F0",paddingTop:8}}>
                        <div style={{fontSize:10,fontWeight:800,color:"#E67E00",textTransform:"uppercase",marginBottom:6}}>📦 Peças ({pecas.length})</div>
                        {pecas.map((p,pi)=>{
                          const stP=STS_PECA_COR[p.situacao]||STS_PECA_COR["Peça Solicitada"];
                          return(<div key={pi} style={{background:stP.bg,borderRadius:8,padding:"8px 10px",marginBottom:4,borderLeft:`3px solid ${stP.c}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                              <select value={p.situacao||"Peça Solicitada"} onChange={e=>updatePecaRel(r.id,pi,{situacao:e.target.value})} style={{fontSize:10,fontWeight:700,color:stP.c,background:"transparent",border:"none",cursor:"pointer",outline:"none",padding:0}}>{STS_PECA_OPTS.map(s=><option key={s}>{s}</option>)}</select>
                              <button onClick={()=>delPecaRel(r.id,pi)} style={{background:"none",border:"none",color:"#C62828",cursor:"pointer",fontSize:11,fontWeight:700}}>✕</button>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 60px",gap:4}}>
                              <input type="text" value={p.peca||""} onChange={e=>updatePecaRel(r.id,pi,{peca:e.target.value})} placeholder="Nome da peça" style={{fontSize:10,border:"none",background:"rgba(255,255,255,.7)",borderRadius:4,padding:"3px 6px",outline:"none"}}/>
                              <input type="text" value={p.cod||""} onChange={e=>updatePecaRel(r.id,pi,{cod:e.target.value})} placeholder="Código" style={{fontSize:10,border:"none",background:"rgba(255,255,255,.7)",borderRadius:4,padding:"3px 6px",outline:"none"}}/>
                              <input type="text" value={p.quantidade||""} onChange={e=>updatePecaRel(r.id,pi,{quantidade:e.target.value})} placeholder="Qtd" style={{fontSize:10,border:"none",background:"rgba(255,255,255,.7)",borderRadius:4,padding:"3px 6px",outline:"none",textAlign:"center"}}/>
                            </div>
                          </div>);
                        })}
                      </div>}
                      <div style={{fontSize:10,color:"#CCC",textAlign:"right"}}>{r.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {tab==="apontamentos_oficina"&&(()=>{
          const lista=(apontamentos||[]).filter(a=>a&&(showArqApon||!a.arquivado)).filter(a=>{
            if(ofiNovaFrom&&(a.data||"")<ofiNovaFrom)return false;
            if(ofiNovaTo&&(a.data||"")>ofiNovaTo)return false;
            if(ofiNovaOS&&!(a.os||"").toLowerCase().includes(ofiNovaOS.toLowerCase()))return false;
            if(ofiNovaTech!=="todos"&&a.tecnico!==ofiNovaTech)return false;
            if(ofiNovaServ!=="todos"&&a.servico!==ofiNovaServ)return false;
            return true;
          }).sort((a,b)=>(a.data||"").localeCompare(b.data||""));
          const totalMin=lista.reduce((acc,a)=>{const p=(a.total||"0:00").split(":");return acc+(parseInt(p[0]||0)*60+parseInt(p[1]||0));},0);
          const totalStr=`${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}m`;
          const inserir=()=>{
            const total=calcHoras(aponNovaInicio,aponNovaTermino);
            if(editingAponId){
              const changes={data:aponNovaData,os:aponNovaOS,patrimonio:aponNovaPat,tecnico:aponNovaTech,servico:aponNovaServ,inicio:aponNovaInicio,termino:aponNovaTermino,total,obs:aponNovaObs};
              updateApon(editingAponId,changes);setEditingAponId(null);notify("✅ Apontamento atualizado!");
              setAponNovaData(TODAY_STR);setAponNovaOS("");setAponNovaPat("");setAponNovaTech(OFICINA_TECHS[0]);setAponNovaServ(SERVICOS_OFICINA[0]);setAponNovaInicio("");setAponNovaTermino("");setAponNovaObs("");
              return;
            }
            const row={id:`APO${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:aponNovaData,os:aponNovaOS,patrimonio:aponNovaPat,tecnico:aponNovaTech,servico:aponNovaServ,inicio:aponNovaInicio,termino:aponNovaTermino,total,oficina:"1340",obs:aponNovaObs,arquivado:false};
            setApontamentos(p=>[...p,row]);db.save("apontamentos_oficina",row.id,row);
            setAponNovaOS("");setAponNovaPat("");setAponNovaInicio("");setAponNovaTermino("");setAponNovaObs("");
            notify("✅ Apontamento salvo!");
          };
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div className="card" style={{marginBottom:16,overflow:"hidden",borderTop:"4px solid #F5C200"}}>
              <div style={{padding:"7px 10px",background:"#1A1A1A",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:900,fontSize:20,color:"#FFF"}}>📝 Apontamentos — Oficina 1340</div><div style={{fontSize:12,color:"#F5C200",marginTop:2}}>{lista.length} registro(s) · ⏱ {totalStr}</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqApon(p=>!p)} style={{padding:"7px 14px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:showArqApon?"rgba(255,255,255,.15)":"transparent",color:"#FFF",fontSize:11,cursor:"pointer",fontWeight:600}}>📁 {showArqApon?"Ocultar":"Arquivados"}</button>
                  <label style={{padding:"7px 14px",borderRadius:8,border:"1px solid #8B5CF6",background:"#F5F3FF",fontSize:12,cursor:"pointer",color:"#8B5CF6",fontWeight:700,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:4}}>
                    📄 Ler PDF
                    <input type="file" accept=".pdf" style={{display:"none"}} onChange={async e=>{
                      const file=e.target.files[0];if(!file)return;
                      try{
                        const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
                        const resp=await fetch("https://mov-ia.vercel.app/api/read-pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pdfBase64:b64})});
                        const respText=await resp.text();
                        if(!resp.ok)throw new Error(respText.slice(0,200));
                        let data;try{data=JSON.parse(respText);}catch(ex){throw new Error("Resposta inválida");}
                        const txt=data.content?.[0]?.text||"{}";
                        const clean=txt.replace(/```json|```/g,"").trim();
                        const parsed=JSON.parse(clean);
                        const row={id:"AP"+Date.now(),data:parsed.data||"",os:parsed.os||parsed.numero||"",patrimonio:parsed.patrimonio||"",tecnico:parsed.tecnico||"",servico:parsed.servico||parsed.tipo||"",inicio:parsed.inicio||"",termino:parsed.termino||parsed.fim||"",total:parsed.total||parsed.horas||"",obs:parsed.obs||parsed.observacao||"",registradoPor:user.name};
                        setApontamentos(p=>[row,...(p||[])]);db.save("apontamentos_oficina",row.id,row);
                        notify("✅ Apontamento criado via PDF!");
                      }catch(err){alert("Erro PDF: "+(err?.message||JSON.stringify(err)));}
                      e.target.value="";
                    }}/>
                  </label>
                  <BtnImport onClick={()=>setModalImportApon(true)}/>
                  <BtnExcel onClick={()=>exportCSV(lista,"apontamentos_oficina",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"PAT"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                </div>
              </div>
              <div style={{padding:"7px 10px",background:"#FFFBF0",borderBottom:"2px solid #FFE8A0",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Data</label><input type="date" value={aponNovaData} onChange={e=>setAponNovaData(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>OS</label><input type="text" value={aponNovaOS} onChange={e=>setAponNovaOS(e.target.value)} placeholder="OS-001" style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:80}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>PAT</label><input type="text" value={aponNovaPat} onChange={e=>setAponNovaPat(e.target.value)} placeholder="PAT-001" style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:90}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Técnico</label><select value={aponNovaTech} onChange={e=>setAponNovaTech(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:600}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Serviço</label><select value={aponNovaServ} onChange={e=>setAponNovaServ(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:700,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Início</label><input type="time" value={aponNovaInicio} onChange={e=>setAponNovaInicio(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Término</label><input type="time" value={aponNovaTermino} onChange={e=>setAponNovaTermino(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                {(aponNovaInicio&&aponNovaTermino)&&<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#C47D00",textTransform:"uppercase"}}>Total</label><span style={{fontSize:13,fontWeight:900,color:"#C47D00",background:"#FFF",border:"1.5px solid #FFE8A0",borderRadius:8,padding:"7px 10px"}}>{calcHoras(aponNovaInicio,aponNovaTermino)}</span></div>}
                <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:120}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Obs</label><input type="text" value={aponNovaObs} onChange={e=>setAponNovaObs(e.target.value)} placeholder="Observação..." style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:"100%"}}/></div>
                <BtnY onClick={inserir}>Salvar</BtnY>
              </div>
              <div style={{padding:"10px 18px",background:"#F8F9FA",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{position:"relative",flex:1,minWidth:160}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:12}}>🔍</span><input type="text" value={ofiNovaOS} onChange={e=>setOfiNovaOS(e.target.value)} placeholder="Buscar OS, PAT..." style={{width:"100%",padding:"6px 10px 6px 26px",fontSize:12,borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={ofiNovaFrom} onChange={e=>setOfiNovaFrom(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={ofiNovaTo} onChange={e=>setOfiNovaTo(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}/></div>
                <select value={ofiNovaTech} onChange={e=>setOfiNovaTech(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}><option value="todos">Todos técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                <select value={ofiNovaServ} onChange={e=>setOfiNovaServ(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}><option value="todos">Todos serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                {(ofiNovaFrom||ofiNovaTo||ofiNovaOS||ofiNovaTech!=="todos"||ofiNovaServ!=="todos")&&<button onClick={()=>{setOfiNovaFrom("");setOfiNovaTo("");setOfiNovaOS("");setOfiNovaTech("todos");setOfiNovaServ("todos");}} style={{padding:"6px 12px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:11,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
              </div>
            </div>
            {lista.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}><div style={{fontSize:32,marginBottom:8}}>📝</div>Preencha o formulário acima e clique em Salvar</div>):(
              <div className="card" style={{overflow:"hidden"}}><div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#1A1A1A"}}>
                    {["Data","OS","PAT","Modelo","Técnico","Serviço","Início","Término","Total","Obs",""].map((h,i)=>(
                      <th key={i} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.8,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lista.map((a,idx)=>{
                      const cor=({Mecânica:"#1565C0",Elétrica:"#E67E00",Bateria:"#C47D00",Hidráulica:"#00838F",Pintura:"#8E44AD","Pequenos Reparos":"#1A7A3C",Soldagem:"#546E7A",Usinagem:"#37474F",Carregador:"#00838F",Outros:"#888"})[a.servico]||"#555";
                      return(<tr key={a.id} style={{borderBottom:"1px solid #F0F0F0",background:a.arquivado?"#FAFAFA":idx%2===0?"#FFF":"#F8FFFE",opacity:a.arquivado?0.55:1}}>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap",fontWeight:700,color:"#1A1A1A"}}>{fmtDataBR(a.data)}</td>
                        <td style={{padding:"10px 12px",fontWeight:800,color:"#1565C0"}}>{a.os||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555"}}>{a.patrimonio||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#555"}}>{a.modelo||"—"}</td>
                        <td style={{padding:"10px 12px",fontWeight:600}}>{a.tecnico||"—"}</td>
                        <td style={{padding:"10px 12px"}}><span style={{fontSize:11,fontWeight:700,color:cor,background:cor+"18",borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap"}}>{a.servico||"—"}</span></td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555",whiteSpace:"nowrap"}}>{a.inicio||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555",whiteSpace:"nowrap"}}>{a.termino||"—"}</td>
                        <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#C47D00",background:"#FFFBF0",border:"2px solid #FFE8A0",borderRadius:8,padding:"4px 10px",whiteSpace:"nowrap"}}>{a.total||"—"}</span></td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#888",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.obs||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:10,color:"#AAA",whiteSpace:"nowrap"}}>{a.registradoPor||"—"}</td>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}><div style={{display:"flex",gap:4}}>
                          <button onClick={()=>{setAponNovaData(a.data||TODAY_STR);setAponNovaOS(a.os||"");setAponNovaPat(a.patrimonio||"");setAponNovaTech(a.tecnico||OFICINA_TECHS[0]);setAponNovaServ(a.servico||SERVICOS_OFICINA[0]);setAponNovaInicio(a.inicio||"");setAponNovaTermino(a.termino||"");setAponNovaObs(a.obs||"");setEditingAponId(a.id);window.scrollTo(0,0);notify("✏️ Dados carregados no formulário — edite e salve!");}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"5px 7px",fontSize:13}}>✏️</button>
                          <button onClick={()=>updateApon(a.id,{arquivado:!a.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"5px 7px",fontSize:12}}>{a.arquivado?"📤":"🗄️"}</button>
                          <button onClick={()=>{if(window.confirm("Excluir?"))delApon(a.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"5px 7px",fontSize:11,fontWeight:700}}>✕</button>
                        </div></td>
                      </tr>);
                    })}
                  </tbody>
                  <tfoot><tr style={{background:"#1A1A1A"}}>
                    <td colSpan={7} style={{padding:"10px 12px",fontSize:11,fontWeight:700,color:"#94A3B8"}}>{lista.length} registro(s)</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#F5C200",background:"rgba(245,194,0,.12)",border:"1px solid rgba(245,194,0,.3)",borderRadius:8,padding:"4px 10px"}}>{totalStr}</span></td>
                    <td colSpan={3}/>
                  </tr></tfoot>
                </table></div></div>
            )}
          </div>);
        })()}
        {/* ── AGENDA OFICINA ── */}
        {tab==="agenda_ofi"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfiYear}-${String(agOfiMonth+1).padStart(2,"0")}`;
          const techsList=OFICINA_TECHS.filter(t=>agOfiTech==="todos"||t===agOfiTech);
          const addAtendOfi=()=>{
            const dataFinal=agOfiDate||`${ym}-01`;
            if(!agOfiEmpresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agOfiTechSel}__${dataFinal}`;
            saveAgendaOfi(key,[...(agendaOfi[key]||[]),{client:agOfiEmpresa,horimetro:agOfiHorimetro||"",patrimonio:agOfiPat||"",servico:agOfiServSel,status:"agendada",dataInicio:agOfiDataInicio,dataFim:agOfiDataFim,requisicao:agOfiRequisicao,obs:agOfiObs,relatorio:agOfiRelatorio||""}]);
            setAgOfiDataInicio("");setAgOfiDataFim("");setAgOfiRequisicao("");
            setAgOfiEmpresa("");setAgOfiPat("");setAgOfiEntrada("");setAgOfiSaida("");setAgOfiObs("");setAgOfiRelatorio("");
            notify("✅ Atendimento Oficina salvo!");
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🗓 Agenda Oficina</div><div style={{fontSize:13,color:"#888"}}>Agenda mensal dos técnicos de oficina — {MESES[agOfiMonth]} {agOfiYear}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <select value={agOfiTech} onChange={e=>setAgOfiTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <select value={agOfiServico} onChange={e=>setAgOfiServico(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <select value={agOfiMonth} onChange={e=>setAgOfiMonth(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                  <select value={agOfiYear} onChange={e=>setAgOfiYear(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
                </div>
              </div>
              {!isReadOnlyAgenda(user)&&(
<div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agOfiTechSel} onChange={e=>setAgOfiTechSel(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agOfiDate||`${ym}-01`} onChange={e=>setAgOfiDate(e.target.value)} style={{fontSize:12,padding:"6px 8px"}}/>
                  <input type="text" placeholder="Empresa/Serviço" value={agOfiEmpresa} onChange={e=>setAgOfiEmpresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",flex:1,minWidth:140}}/>
                  <input type="text" placeholder="Horímetro" value={agOfiHorimetro||""} onChange={e=>setAgOfiHorimetro(e.target.value)} style={{fontSize:12,padding:"7px 8px",width:100}}/>
                  <input type="text" placeholder="Patrimônio" value={agOfiPat} onChange={e=>setAgOfiPat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <select value={agOfiServSel} onChange={e=>setAgOfiServSel(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>Início</span><input type="date" value={agOfiDataInicio} onChange={e=>setAgOfiDataInicio(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>Fim</span><input type="date" value={agOfiDataFim} onChange={e=>setAgOfiDataFim(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <input type="text" placeholder="Nº Requisição" value={agOfiRequisicao} onChange={e=>setAgOfiRequisicao(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:110}}/>
                  <input type="text" placeholder="Obs..." value={agOfiObs} onChange={e=>setAgOfiObs(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:120}}/>
                  <input type="text" placeholder="Nº Relatório" value={agOfiRelatorio||""} onChange={e=>setAgOfiRelatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <BtnY onClick={addAtendOfi}>Adicionar</BtnY>
                </div>
              </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {techsList.map(tech=>{
                  const color=techColor(tech);
                  const entries=[];
                  Object.keys(agendaOfi).forEach(k=>{
                    const i=k.indexOf("__"); if(i<0) return;
                    const kt=k.slice(0,i), kd=k.slice(i+2);
                    if(kt!==tech||!kd.startsWith(ym)) return;
                    (agendaOfi[k]||[]).forEach((s,si)=>{
                      if(agOfiServico==="todos"||s.servico===agOfiServico) entries.push({s,date:kd,key:k,si});
                    });
                  });
                  entries.sort((a,b)=>a.date.localeCompare(b.date));
                  return(
                    <div key={tech} className="card" style={{borderTop:`4px solid ${color}`,overflow:"hidden",transition:"transform .2s",cursor:"default"}}>
                      <div style={{padding:"8px 10px",borderBottom:"1px solid #F4F4F4"}}>
                        <div style={{fontWeight:700,fontSize:14}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                        <div style={{fontSize:11,color:"#AAA",marginTop:2}}>{entries.length} atendimento(s) · {MESES[agOfiMonth]}</div>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {entries.length===0&&<div style={{fontSize:12,color:"#CCC",textAlign:"center",padding:"8px 0"}}>Sem atendimentos</div>}
                        {entries.map((e,ix)=>{const dia=e.date.slice(8,10);return(
                          <div key={ix} style={{padding:"8px 0",borderBottom:"1px solid #F8F8F8"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#fff",background:color,borderRadius:6,padding:"1px 7px"}}>Dia {dia}</span>
                              <span style={{fontSize:12,fontWeight:700,color:"#222",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.s.client}</span>
                              {!isReadOnlyAgenda(user)&&(<><button onClick={()=>{setEditSlot({key:e.key,si:e.si,slot:e.s,tipo:"ofi"});setEditSlotForm({...e.s});}} style={{background:"none",border:"none",color:"#1565C0",cursor:"pointer",fontSize:13,marginRight:2}}>✏️</button><button onClick={()=>{if(window.confirm("Remover?")){const arr=(agendaOfi[e.key]||[]).filter((_,j)=>j!==e.si);saveAgendaOfi(e.key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:13}}>✕</button></>)}
                            </div>
                            <div style={{fontSize:11,color:"#888",marginBottom:4}}>🏷️ {e.s.patrimonio||"—"} · <b style={{color:"#1565C0"}}>{e.s.servico||"—"}</b></div>
                            <div style={{marginBottom:4}}>
                              <input type="text" value={e.s.relatorio||""} placeholder="Nº Relatório" onChange={ev=>{const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,relatorio:ev.target.value};saveAgendaOfi(e.key,arr);}} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0"}}/>
                            </div>
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:9,color:"#888",fontWeight:700}}>INÍCIO</span><input type="date" value={e.s.dataInicio||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,dataInicio:v};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",border:"1px solid #E0E0E0",borderRadius:5}}/></div>
                              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:9,color:"#888",fontWeight:700}}>FIM</span><input type="date" value={e.s.dataFim||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,dataFim:v};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",border:"1px solid #E0E0E0",borderRadius:5}}/></div>
                            </div>
                            <div style={{marginBottom:4}}>
                              <input type="text" value={e.s.requisicao||""} placeholder="Nº Requisição" onChange={ev=>{const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,requisicao:ev.target.value};saveAgendaOfi(e.key,arr);}} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0"}}/>
                            </div>
                            {e.s.obs&&<div style={{fontSize:10,color:"#888",fontStyle:"italic"}}>{e.s.obs}</div>}
                            <div style={{marginTop:4}}>
                              <select value={e.s.status||"agendada"} onChange={ev=>{const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,status:ev.target.value};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 5px",fontWeight:700,borderRadius:6,border:"1px solid #E0E0E0",width:"100%"}}>
                                <option value="agendada">Agendada</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                                <option value="aguardando_diretoria">Aguardando Diretoria</option>
                                <option value="concluida">Concluída</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="remarcada">Remarcada</option>
                              </select>
                            </div>
                          </div>
                        );})}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── DASHBOARD OFICINA ── */}
        {tab==="dashboard_ofi"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfiYear}-${String(agOfiMonth+1).padStart(2,"0")}`;
          const parseMin=h=>{if(!h)return 0;const m=String(h).match(/(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
          const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"0h00";
          const apMes=(apontamentos||[]).filter(a=>{
            if(!a.data)return false;
            if(dashOfiFrom&&a.data<dashOfiFrom)return false;
            if(dashOfiTo&&a.data>dashOfiTo)return false;
            if(!dashOfiFrom&&!dashOfiTo&&!a.data.startsWith(ym))return false;
            if(dashOfiTech!=="todos"&&a.tecnico!==dashOfiTech)return false;
            return true;
          });
          const totalMin=apMes.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
          const osList=[...new Set(apMes.map(a=>a.os).filter(Boolean))];
          const byTech={};
          OFICINA_TECHS.forEach(t=>{
            const aps=apMes.filter(a=>a.tecnico===t);
            const mins=aps.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
            const porServ={};SERVICOS_OFICINA.forEach(s=>{porServ[s]=aps.filter(a=>a.servico===s).length;});
            byTech[t]={aps,mins,porServ};
          });
          const byServ={};
          SERVICOS_OFICINA.forEach(s=>{
            const aps=apMes.filter(a=>a.servico===s);
            byServ[s]={qtd:aps.length,mins:aps.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0)};
          });
          const byOS={};
          osList.forEach(os=>{
            const aps=apMes.filter(a=>a.os===os);
            byOS[os]={aps,mins:aps.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0),tecnico:aps[0]?.tecnico||"—",servico:aps[0]?.servico||"—"};
          });
          const techAtivos=OFICINA_TECHS.filter(t=>byTech[t].aps.length>0);
          const chartHoras={labels:techAtivos.length>0?techAtivos:OFICINA_TECHS,datasets:[{label:"Horas Trabalhadas",data:techAtivos.length>0?techAtivos.map(t=>+(byTech[t].mins/60).toFixed(1)):OFICINA_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)):OFICINA_TECHS.map(t=>techColor(t)),borderRadius:6,borderSkipped:false}]};
          const chartApon={labels:techAtivos.length>0?techAtivos:OFICINA_TECHS,datasets:[{label:"Apontamentos",data:techAtivos.length>0?techAtivos.map(t=>byTech[t].aps.length):OFICINA_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)+"CC"):OFICINA_TECHS.map(t=>techColor(t)+"CC"),borderRadius:6,borderSkipped:false}]};
          const servAtivos=SERVICOS_OFICINA.filter(s=>byServ[s].qtd>0);
          const SERV_COLORS=["#1565C0","#C62828","#E67E00","#F5C200","#1A7A3C","#00838F","#AD1457","#6A1B9A","#4E342E","#37474F"];
          const chartServ={labels:servAtivos,datasets:[
            {label:"Qtd Apontamentos",data:servAtivos.map(s=>byServ[s].qtd),backgroundColor:SERV_COLORS.slice(0,servAtivos.length),borderRadius:6,borderSkipped:false},
            {label:"Horas",data:servAtivos.map(s=>+(byServ[s].mins/60).toFixed(1)),backgroundColor:SERV_COLORS.slice(0,servAtivos.length).map(c=>c+"80"),borderRadius:6,borderSkipped:false}
          ]};
          // Gráfico Serviço x Técnico (stacked)
          const chartServTech={
            labels:techAtivos,
            datasets:servAtivos.map((serv,si)=>({
              label:serv,
              data:techAtivos.map(t=>byTech[t].porServ[serv]||0),
              backgroundColor:SERV_COLORS[si%SERV_COLORS.length],
              borderRadius:4,
              borderSkipped:false,
            }))
          };
          // Horas por serviço por técnico (stacked)
          const chartHorasServTech={
            labels:techAtivos,
            datasets:servAtivos.map((serv,si)=>({
              label:serv,
              data:techAtivos.map(t=>{
                const aps=byTech[t].aps.filter(a=>a.servico===serv);
                return +(aps.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0)/60).toFixed(1);
              }),
              backgroundColor:SERV_COLORS[si%SERV_COLORS.length],
              borderRadius:4,
              borderSkipped:false,
            }))
          };
          const chartOpts=(title)=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>`${c.dataset.label}: ${c.parsed.y}`}}},scales:{x:{grid:{display:false},ticks:{font:{size:11},color:"#555"}},y:{beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}});
          const chartOptsStacked=()=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"bottom",labels:{font:{size:10},boxWidth:12}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:11}}},y:{stacked:true,beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}});
          return(
        <div style={{animation:"fadeIn .3s ease"}}>
          {/* Cabeçalho + Filtros */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontWeight:900,fontSize:24,marginBottom:2}}>📊 Dashboard Oficina 1340</div>
              <div style={{fontSize:12,color:"#888"}}>{MESES[agOfiMonth]} {agOfiYear} · {apMes.length} apontamentos · {techAtivos.length} técnico(s) ativo(s)</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={dashOfiTech} onChange={e=>setDashOfiTech(e.target.value)} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}><option value="todos">👷 Todos técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={agOfiMonth} onChange={e=>setAgOfiMonth(Number(e.target.value))} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
              <select value={agOfiYear} onChange={e=>setAgOfiYear(Number(e.target.value))} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}>{[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}</select>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={dashOfiFrom} onChange={e=>setDashOfiFrom(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={dashOfiTo} onChange={e=>setDashOfiTo(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
              {(dashOfiTech!=="todos"||dashOfiFrom||dashOfiTo)&&<BtnG onClick={()=>{setDashOfiTech("todos");setDashOfiFrom("");setDashOfiTo("");}}>✕ Limpar</BtnG>}
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            {[
              {icon:"📋",l:"Total Apontamentos",v:apMes.length,c:"#1A1A1A",bg:"#FFF"},
              {icon:"⏱",l:"Horas Totais",v:fmtMin(totalMin),c:"#1565C0",bg:"#F0F4FF"},
              {icon:"👷",l:"Técnicos Ativos",v:techAtivos.length,c:"#1A7A3C",bg:"#F0FFF5"},
              {icon:"🔧",l:"OSs Únicas",v:osList.length,c:"#C47D00",bg:"#FFFBF0"},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"8px 12px",borderTop:`4px solid ${s.c}`,background:s.bg}}>
                <div style={{fontSize:11,color:"#888",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.icon} {s.l}</div>
                <div style={{fontSize:32,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Gráficos principais */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>⏱ Horas Trabalhadas por Técnico</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Total de horas no período selecionado</div>
              <ChartCanvas type="bar" data={chartHoras} options={chartOpts("Horas")} height={220}/>
            </div>

          </div>
          {servAtivos.length>0&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>🔧 Qtd de Serviços por Técnico</div>
                <div style={{fontSize:11,color:"#888",marginBottom:12}}>Cada cor = um tipo de serviço (empilhado)</div>
                <ChartCanvas type="bar" data={chartServTech} options={chartOptsStacked()} height={220}/>
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>⏱ Horas por Serviço por Técnico</div>
                <div style={{fontSize:11,color:"#888",marginBottom:12}}>Cada cor = um tipo de serviço (empilhado)</div>
                <ChartCanvas type="bar" data={chartHorasServTech} options={chartOptsStacked()} height={220}/>
              </div>
            </div>
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>📊 Serviços Realizados — Qtd e Horas</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Barras sólidas = quantidade · barras translúcidas = horas</div>
              <ChartCanvas type="bar" data={chartServ} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"top",labels:{font:{size:10},boxWidth:12}}},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}}} height={Math.max(180,servAtivos.length*35)}/>
            </div>
          </>}

          {/* Por Técnico detalhado */}
          <div style={{fontSize:13,fontWeight:800,color:"#555",marginBottom:12}}>👷 Detalhamento por Técnico</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {techAtivos.map(tech=>{
              const d=byTech[tech];
              const color=techColor(tech);
              const pct=totalMin>0?Math.round(d.mins/totalMin*100):0;
              return(
                <div key={tech} className="card" style={{padding:16,borderLeft:`5px solid ${color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                    <div style={{fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:10,height:10,borderRadius:"50%",background:color,display:"inline-block"}}/>
                      {tech}
                    </div>
                    <div style={{display:"flex",gap:10,fontSize:12,flexWrap:"wrap"}}>
                      <span style={{background:"#F0F4FF",color:"#1565C0",fontWeight:700,padding:"4px 12px",borderRadius:6}}>📋 {d.aps.length} apontamentos</span>
                      <span style={{background:"#FFFBF0",color:"#C47D00",fontWeight:700,padding:"4px 12px",borderRadius:6}}>⏱ {fmtMin(d.mins)}</span>
                      <span style={{background:"#F5F5F5",color:"#555",fontWeight:700,padding:"4px 12px",borderRadius:6}}>{pct}% do total</span>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{height:6,background:"#F0F0F0",borderRadius:3,marginBottom:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {SERVICOS_OFICINA.filter(s=>d.porServ[s]>0).map(serv=>(
                      <span key={serv} style={{background:"#F0F4FF",border:"1px solid #DBEAFE",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#1565C0",fontWeight:600}}>
                        {serv} <b style={{color:"#1A1A1A"}}>({d.porServ[serv]})</b>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {apMes.length===0&&<div style={{color:"#CCC",textAlign:"center",padding:40,fontSize:13}}>Sem apontamentos no período.</div>}
          </div>

          {/* Por OS */}
          {osList.length>0&&<>
            <div style={{fontSize:13,fontWeight:800,color:"#555",marginBottom:12}}>🗂 Detalhamento por OS</div>
            <div className="card" style={{overflow:"hidden",marginBottom:20}}>
              <div className="tbl-wrap"><table>
                <thead><tr><th>OS</th><th>Técnico</th><th>Serviço</th><th>Qtd</th><th>Horas</th><th>% do Total</th><th>Patrimônio</th></tr></thead>
                <tbody>{osList.map(os=>{
                  const d=byOS[os];
                  const pct=totalMin>0?Math.round(d.mins/totalMin*100):0;
                  return(<tr key={os}>
                    <td style={{fontWeight:700,color:"#1565C0"}}>{os}</td>
                    <td><span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:"50%",background:techColor(d.tecnico),display:"inline-block"}}/>{d.tecnico}</span></td>
                    <td><span style={{background:"#F0F4FF",color:"#1565C0",fontWeight:600,padding:"2px 8px",borderRadius:5,fontSize:11}}>{d.servico}</span></td>
                    <td style={{textAlign:"center",fontWeight:700}}>{d.aps.length}</td>
                    <td><span style={{color:"#C47D00",fontWeight:700}}>{fmtMin(d.mins)}</span></td>
                    <td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{flex:1,height:6,background:"#F0F0F0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"#1565C0",borderRadius:3}}/></div><span style={{fontSize:11,fontWeight:700,minWidth:30}}>{pct}%</span></div></td>
                    <td style={{fontSize:11,color:"#888"}}>{[...new Set(d.aps.map(a=>a.patrimonio).filter(Boolean))].join(", ")||"—"}</td>
                  </tr>);
                })}</tbody>
              </table></div>
            </div>
          </>}
        </div>
          );
        })()}


        {/* ── PENDÊNCIAS HEBERT (Manuela + Hebert) ── */}
                {tab==="pendencias_hebert"&&(user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_s")&&(()=>{
          const SERVICOS=["ADM Manutenção","Comercial","Frota","Manutenção Frota","Manutenção Cliente","Manutenção Peças","Solicitação Diretoria","Retirada de Peças","Liberação Técnica","Ajuste de Ponto","Solicitação de E-mail","Férias","Atestado","Organização Oficina","Rupturas","Outros"];
          const S_EQUIP=["Comercial","Frota","Manutenção Frota","Manutenção Cliente","Manutenção Peças","Solicitação Diretoria","Retirada de Peças","Liberação Técnica"];
          const S_OBS=["Solicitação Diretoria","Retirada de Peças","Liberação Técnica","Ajuste de Ponto","Solicitação de E-mail","Férias","Atestado","Organização Oficina","Rupturas","Outros"];
          const EQ_OPT=["Cliente","Patrimônio/Nº Série","OS ou REL","Máquina","Bateria","Carregador","Carrinho","Outros"];
          const PM={urgente:{l:"🔴 Urgente",c:"#DC2626"},medio:{l:"🟡 Médio",c:"#D97706"},normal:{l:"🟢 Normal",c:"#059669"}};
          const SM={pendente:"⏳ Pendente",em_andamento:"🔄 Em Andamento",concluido:"✅ Concluído"};
          const list=(pendHebert||[]).filter(r=>r&&(showArqHeb||!r.arquivado));
          const fS=formServH;const sfS=setFormServH;const fM=filtroMesH;const sfM=setFiltroMesH;
          const shEq=S_EQUIP.includes(fS.servico);const shOb=S_OBS.includes(fS.servico);
          const reset=()=>sfS({data:TODAY_STR,servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});
          const addS=()=>{if(!fS.servico)return notify("Selecione um serviço");const rec={...fS,id:Date.now().toString(),registradoPor:user.name,criadoEm:new Date().toISOString()};setPendHebert(p=>[rec,...p]);db.save("pendencias_hebert",[rec,...pendHebert]);reset();notify("Serviço registrado!");};
          const updS=(id,patch)=>{const n=(pendHebert||[]).map(r=>r.id===id?{...r,...patch}:r);setPendHebert(n);db.save("pendencias_hebert",n);};
          const delS=id=>{if(!window.confirm("Excluir?"))return;const n=(pendHebert||[]).filter(r=>r.id!==id);setPendHebert(n);db.save("pendencias_hebert",n);};
          const arcS=id=>{const n=(pendHebert||[]).map(r=>r.id===id?{...r,arquivado:!r.arquivado}:r);setPendHebert(n);db.save("pendencias_hebert",n);};
          const lF=fM?list.filter(r=>r.data&&r.data.startsWith(fM)):list;
          const dT=lF.length;const dP=lF.filter(r=>r.status==="pendente"||!r.status).length;const dA=lF.filter(r=>r.status==="em_andamento").length;const dC=lF.filter(r=>r.status==="concluido").length;
          const svc={};lF.forEach(r=>{const s=r.servico||"—";svc[s]=(svc[s]||0)+1;});const topS=Object.entries(svc).sort((a,b)=>b[1]-a[1]).slice(0,6);
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><div style={{fontWeight:900,fontSize:22,letterSpacing:-.5}}>📋 Serviços Administrativos — Oficina 1340</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{lF.length} registro(s)</div></div>
                <BtnImport onClick={()=>setModalImportPH(true)}/>
                <button onClick={()=>setShowArqHeb(!showArqHeb)} style={{background:showArqHeb?"#D97706":"#F5F5F5",color:showArqHeb?"#FFF":"#888",border:"none",borderRadius:10,padding:"8px 16px",fontWeight:700,fontSize:12,cursor:"pointer"}}>{showArqHeb?"📦 Arquivados":"📦 Arquivados"}</button>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <input type="month" value={fM} onChange={e=>sfM(e.target.value)} style={{fontSize:11,padding:"6px 10px",borderRadius:8,border:"1.5px solid #E0E0E0"}}/>
                {fM&&<button onClick={()=>sfM("")} style={{fontSize:10,padding:"5px 10px",borderRadius:8,border:"none",background:"#F0F0F0",cursor:"pointer",fontWeight:700}}>Limpar</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
                {[{l:"Total",v:dT,c:"#1E293B",bg:"#F8FAFC"},{l:"Pendentes",v:dP,c:"#D97706",bg:"#FFFBEB"},{l:"Em Andamento",v:dA,c:"#2563EB",bg:"#EFF6FF"},{l:"Concluídos",v:dC,c:"#059669",bg:"#ECFDF5"}].map((k,ki)=>(
                  <div key={ki} style={{background:k.bg,borderRadius:12,padding:"8px 10px",borderLeft:`4px solid ${k.c}`}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
                    <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {topS.length>0&&<div style={{background:"#FFF",borderRadius:12,padding:14,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#334155",marginBottom:8}}>🔧 Top Serviços</div>
                {topS.map(([s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#555"}}>{s}</span><span style={{fontWeight:800,color:"#2563EB"}}>{c}</span></div>)}
              </div>}
              {(()=>{
                const prioCnt={urgente:lF.filter(r=>r.prioridade==="urgente").length,medio:lF.filter(r=>r.prioridade==="medio").length,normal:lF.filter(r=>r.prioridade==="normal"||!r.prioridade).length};
                const svcCnt={};lF.forEach(r=>{const ss=r.servico||"—";svcCnt[ss]=(svcCnt[ss]||0)+1;});
                const svcTop=Object.entries(svcCnt).sort((a,b)=>b[1]-a[1]).slice(0,8);
                const stsCnt={pendente:dP,em_andamento:dA,concluido:dC};
                const chSts={labels:["Pendente","Em Andamento","Concluído"],datasets:[{data:[stsCnt.pendente,stsCnt.em_andamento,stsCnt.concluido],backgroundColor:["#F59E0B","#3B82F6","#10B981"],borderWidth:0}]};
                const chPrio={labels:["Urgente","Médio","Normal"],datasets:[{data:[prioCnt.urgente,prioCnt.medio,prioCnt.normal],backgroundColor:["#DC2626","#F59E0B","#10B981"],borderWidth:0}]};
                const chSvc={labels:svcTop.map(s=>s[0].length>15?s[0].slice(0,15)+"…":s[0]),datasets:[{label:"Qtd",data:svcTop.map(s=>s[1]),backgroundColor:"#3B82F6",borderRadius:6}]};
                const doOpt={responsive:true,maintainAspectRatio:false,cutout:"60%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10,padding:10}}}};
                const barOpt={responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}},y:{grid:{display:false},ticks:{font:{size:10}}}}};
                return(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.5fr",gap:14,marginBottom:14}}>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>📊 Status</div>
                      <ChartCanvas type="doughnut" data={chSts} options={doOpt} height={140}/>
                    </div>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>⚡ Prioridade</div>
                      <ChartCanvas type="doughnut" data={chPrio} options={doOpt} height={140}/>
                    </div>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>🔧 Serviços</div>
                      {svcTop.length===0?<div style={{textAlign:"center",color:"#CBD5E1",padding:20}}>Sem dados</div>:<ChartCanvas type="bar" data={chSvc} options={barOpt} height={160}/>}
                    </div>
                  </div>
                );
              })()}
              <button onClick={()=>sfS(p=>({...p,data:TODAY_STR}))} style={{padding:"10px 20px",borderRadius:12,background:"#F5C200",border:"none",fontWeight:800,fontSize:13,color:"#1A1A1A",cursor:"pointer",boxShadow:"0 2px 8px rgba(245,194,0,.3)",marginBottom:14}}>+ Novo Serviço</button>
              {fS.data&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""})}>
                <div style={{background:"#FFF",borderRadius:16,width:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#F5C200"}}>➕ Novo Serviço</div>
                    <button onClick={()=>sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""})} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
                  </div>
                  <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📅 Data</label><input type="date" value={fS.data} onChange={e=>sfS(p=>({...p,data:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box"}}/></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>🔧 Serviço</label><select value={fS.servico} onChange={e=>sfS(p=>({...p,servico:e.target.value,equipCateg:"",equipDetalhe:"",obsCondicional:""}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="">Selecione...</option>{SERVICOS.map(s=><option key={s}>{s}</option>)}</select></div>
                    </div>
                    {shEq&&<div style={{background:"#EFF6FF",borderRadius:10,padding:12,border:"1px solid #3B82F622"}}>
                      <div style={{fontSize:10,fontWeight:800,color:"#2563EB",marginBottom:8}}>📦 Detalhes</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <select value={fS.equipCateg} onChange={e=>sfS(p=>({...p,equipCateg:e.target.value}))} style={{fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7}}><option value="">Categoria...</option>{EQ_OPT.map(o=><option key={o}>{o}</option>)}</select>
                        <input type="text" value={fS.equipDetalhe} onChange={e=>sfS(p=>({...p,equipDetalhe:e.target.value}))} placeholder="Nº, Nome..." style={{fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7}}/>
                      </div>
                      {fS.equipCateg==="Outros"&&<textarea value={fS.obsCondicional} onChange={e=>sfS(p=>({...p,obsCondicional:e.target.value}))} rows={2} placeholder="Observação..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7,marginTop:8,boxSizing:"border-box",resize:"vertical"}}/>}
                    </div>}
                    {shOb&&<div style={{background:"#FFFBEB",borderRadius:10,padding:12,border:"1px solid #F59E0B22"}}>
                      <label style={{fontSize:10,fontWeight:800,color:"#D97706"}}>📝 Observação</label>
                      <textarea value={fS.obsCondicional} onChange={e=>sfS(p=>({...p,obsCondicional:e.target.value}))} rows={2} placeholder="Descreva..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1px solid #F59E0B22",borderRadius:7,marginTop:4,boxSizing:"border-box",resize:"vertical"}}/>
                    </div>}
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📝 Descrição</label><input type="text" value={fS.descricao} onChange={e=>sfS(p=>({...p,descricao:e.target.value}))} placeholder="Descrição..." style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box"}}/></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>⚡ Prioridade</label><select value={fS.prioridade} onChange={e=>sfS(p=>({...p,prioridade:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="normal">🟢 Normal</option><option value="medio">🟡 Médio</option><option value="urgente">🔴 Urgente</option></select></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📌 Status</label><select value={fS.status} onChange={e=>sfS(p=>({...p,status:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option></select></div>
                    </div>
                    <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>💬 Observações</label><textarea value={fS.obs} onChange={e=>sfS(p=>({...p,obs:e.target.value}))} rows={2} placeholder="Obs..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box",resize:"vertical"}}/></div>
                    <button onClick={()=>{addS();sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});}} style={{width:"100%",padding:"12px",borderRadius:10,background:"#F5C200",border:"none",fontWeight:800,fontSize:14,color:"#1A1A1A",cursor:"pointer"}}>Registrar Serviço</button>
                  </div>
                </div>
              </div>}
              {lF.length===0?<div style={{background:"#FFF",borderRadius:12,padding:40,textAlign:"center",color:"#CBD5E1"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontSize:14,fontWeight:600}}>Nenhum serviço</div></div>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320,1fr))",gap:10}}>
                {lF.map((r,ri)=>{const pr=PM[r.prioridade]||PM.normal;return(
                  <div key={r.id||ri} style={{background:"#FFF",borderRadius:12,padding:"8px 10px",borderLeft:`4px solid ${pr.c}`,boxShadow:"0 1px 4px rgba(0,0,0,.05)",opacity:r.arquivado?.5:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",gap:4}}><span style={{fontSize:9,fontWeight:800,color:pr.c,background:pr.c+"15",borderRadius:8,padding:"2px 8px"}}>{pr.l}</span><span style={{fontSize:9,fontWeight:700,color:"#64748B",background:"#F1F5F9",borderRadius:8,padding:"2px 8px"}}>{SM[r.status]||"⏳ Pendente"}</span></div>
                      <div style={{display:"flex",gap:3}}><button onClick={()=>arcS(r.id)} style={{background:"#F1F5F9",border:"none",borderRadius:6,fontSize:11,cursor:"pointer",padding:"3px 6px"}}>{r.arquivado?"📤":"📦"}</button><button onClick={()=>delS(r.id)} style={{background:"#FEF2F2",border:"none",borderRadius:6,color:"#DC2626",fontSize:10,fontWeight:700,cursor:"pointer",padding:"3px 6px"}}>✕</button></div>
                    </div>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:3}}>📅 {fmtDataBR(r.data)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:4}}>{r.servico||"—"}</div>
                    {r.descricao&&<div style={{fontSize:11,color:"#64748B",marginBottom:5}}>{r.descricao}</div>}
                    {S_EQUIP.includes(r.servico)&&(r.equipCateg||r.equipDetalhe)&&<div style={{background:"#EFF6FF",borderRadius:8,padding:"6px 10px",marginBottom:5,fontSize:11,color:"#334155"}}><span style={{fontWeight:700}}>📦 {r.equipCateg}</span>{r.equipDetalhe?` — ${r.equipDetalhe}`:""}</div>}
                    {r.obsCondicional&&<div style={{background:"#FFFBEB",borderRadius:8,padding:"6px 10px",marginBottom:5,fontSize:11,color:"#92400E"}}>📝 {r.obsCondicional}</div>}
                    {r.obs&&<div style={{fontSize:10,color:"#94A3B8",fontStyle:"italic",marginBottom:4}}>💬 {r.obs}</div>}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:6}}>
                      <select value={r.prioridade||"normal"} onChange={e=>updS(r.id,{prioridade:e.target.value})} style={{fontSize:10,padding:"4px 6px",border:"1px solid #E2E8F0",borderRadius:6}}><option value="normal">🟢 Normal</option><option value="medio">🟡 Médio</option><option value="urgente">🔴 Urgente</option></select>
                      <select value={r.status||"pendente"} onChange={e=>updS(r.id,{status:e.target.value})} style={{fontSize:10,padding:"4px 6px",border:"1px solid #E2E8F0",borderRadius:6}}><option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option></select>
                    </div>
                  </div>
                );})}
              </div>)}
            </div>
          );
        })()}
        {/* ── PENDÊNCIAS MANUELA ── */}
        {tab==="pendencias_manuela_tab"&&user.id==="manuela"&&(()=>{
          const STS_PM={Finalizado:{c:"#1A7A3C",bg:"#F0FFF5"},Pendente:{c:"#C62828",bg:"#FFF0F0"},"Em Andamento":{c:"#1565C0",bg:"#F0F4FF"}};
          const PRI_PM={Urgente:{c:"#C62828",bg:"#FFF0F0"},Normal:{c:"#555",bg:"#F5F5F5"},"Médio Prazo":{c:"#1565C0",bg:"#F0F4FF"}};
          const list=(pendManuela||[]).filter(r=>r&&(showArqPendMan||!r.arquivado));
          const emptyForm={tarefa:"Reunião",tarefaOutros:"",data:"",prioridade:"Normal",solucao:"",status:"Pendente",dataConclusao:""};
          const form=pendManForm;
          const upd=(k,v)=>setPendManForm(p=>({...p,[k]:v}));
          const salvar=()=>{
            if(editPendMan){
              pendManCrud.update(editPendMan.id,{...form});
              setEditPendMan(null);
            } else {
              pendManCrud.add(form);
            }
            setPendManForm(emptyForm);
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📋 Pendências Manuela</div><div style={{fontSize:13,color:"#888"}}>{list.length} pendência(s)</div></div>
                <button onClick={()=>setShowArqPendMan(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqPendMan?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqPendMan?"✓ Arquivados":"📁 Ver Arquivados"}</button>
              </div>

              {/* Formulário */}
              <div className="card" style={{padding:18,marginBottom:20,borderTop:"3px solid #F5C200"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:"#555"}}>{editPendMan?"✏️ Editar Pendência":"➕ Nova Pendência"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Tarefa</label>
                    <select value={form.tarefa} onChange={e=>upd("tarefa",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}>
                      {PEND_ACOES.map(a=><option key={a}>{a}</option>)}
                    </select>
                  </div>
                  {form.tarefa==="Outros"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Descrição (Outros)</label>
                      <input type="text" value={form.tarefaOutros} onChange={e=>upd("tarefaOutros",e.target.value)} placeholder="Descreva a tarefa..." style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/>
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Data</label>
                    <input type="date" value={form.data} onChange={e=>upd("data",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Prioridade</label>
                    <select value={form.prioridade} onChange={e=>upd("prioridade",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0",fontWeight:700,color:PRI_PM[form.prioridade]?.c||"#555"}}>
                      <option>Urgente</option><option>Normal</option><option>Médio Prazo</option>
                    </select>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,gridColumn:"1/-1"}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Solução</label>
                    <input type="text" value={form.solucao} onChange={e=>upd("solucao",e.target.value)} placeholder="Descreva a solução ou encaminhamento..." style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Status</label>
                    <select value={form.status} onChange={e=>upd("status",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0",fontWeight:700,color:STS_PM[form.status]?.c||"#555"}}>
                      <option>Finalizado</option><option>Pendente</option><option>Em Andamento</option>
                    </select>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Data Conclusão</label>
                    <input type="date" value={form.dataConclusao} onChange={e=>upd("dataConclusao",e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  {editPendMan&&<button onClick={()=>{setEditPendMan(null);setForm(emptyForm);}} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>}
                  <BtnY onClick={salvar}>{editPendMan?"Salvar Alterações":"Adicionar"}</BtnY>
                </div>
              </div>

              {/* Tabela */}
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma pendência registrada.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Tarefa</th><th>Data</th><th>Prioridade</th><th>Solução</th><th>Status</th><th>Data Conclusão</th><th>Reg. em</th><th>Ações</th></tr></thead>
                  <tbody>{list.map(r=>{
                    const sts=STS_PM[r.status]||{c:"#555",bg:"#F5F5F5"};
                    const pri=PRI_PM[r.prioridade]||{c:"#555",bg:"#F5F5F5"};
                    const tarefaLabel=r.tarefa==="Outros"&&r.tarefaOutros?`Outros: ${r.tarefaOutros}`:r.tarefa;
                    return(
                      <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                         <td>
                           <select value={r.tarefa||"Reunião"} onChange={e=>pendManCrud.update(r.id,{tarefa:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>
                             {PEND_ACOES.map(a=><option key={a}>{a}</option>)}
                           </select>
                           {r.tarefa==="Outros"&&<input type="text" value={r.tarefaOutros||""} onChange={e=>pendManCrud.update(r.id,{tarefaOutros:e.target.value})} placeholder="Descreva..." style={{width:120,fontSize:10,padding:"2px 4px",marginTop:2,display:"block"}}/>}
                         </td>
                         <td><input type="date" value={r.data||""} onChange={e=>pendManCrud.update(r.id,{data:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                         <td><select value={r.prioridade||"Normal"} onChange={e=>pendManCrud.update(r.id,{prioridade:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:700,color:pri.c,background:pri.bg,border:"none",borderRadius:5}}><option>Urgente</option><option>Normal</option><option>Médio Prazo</option></select></td>
                         <td><input type="text" value={r.solucao||""} onChange={e=>pendManCrud.update(r.id,{solucao:e.target.value})} placeholder="Solução..." style={{width:200,fontSize:11,padding:"3px 6px"}}/></td>
                         <td><select value={r.status||"Pendente"} onChange={e=>pendManCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:700,color:sts.c,background:sts.bg,border:"none",borderRadius:5}}><option>Finalizado</option><option>Pendente</option><option>Em Andamento</option></select></td>
                         <td><input type="date" value={r.dataConclusao||""} onChange={e=>pendManCrud.update(r.id,{dataConclusao:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                        <td style={{fontSize:10,color:"#AAA",whiteSpace:"nowrap"}}>{fmtDateTime(r.registradoEm)}</td>
                        <td style={{whiteSpace:"nowrap"}}>
                          <button onClick={()=>{setEditPendMan(r);setForm({tarefa:r.tarefa,tarefaOutros:r.tarefaOutros||"",data:r.data||"",prioridade:r.prioridade||"Normal",solucao:r.solucao||"",status:r.status||"Pendente",dataConclusao:r.dataConclusao||""});}} style={{background:"#F0F4FF",border:"none",borderRadius:5,color:"#1565C0",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700,marginRight:3}}>✏</button>
                          <button onClick={()=>pendManCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button>
                          <button onClick={()=>{if(window.confirm("Excluir?"))pendManCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

        {/* ── OFICINA (clone de Relatórios, técnicos próprios) ── */}
        {tab==="oficina"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            {/* Filtros */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" value={ofiSearch} onChange={e=>setOfiSearch(e.target.value)} placeholder="🔍 Buscar empresa, ação, patrimônio..." style={{minWidth:220,fontSize:12}}/>
              <select value={ofiTipo} onChange={e=>setOfiTipo(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os tipos</option>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select>
              <select value={ofiRegion} onChange={e=>setOfiRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option><option value="metropolitana">Metropolitana BH</option><option value="roca">Roca</option><option value="centroOeste">Centro-Oeste</option></select>
              <select value={ofiTech} onChange={e=>setOfiTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={ofiStatus} onChange={e=>setOfiStatus(e.target.value)} style={{fontSize:12}}><option value="todos">Todos status</option>{REL_STATUS_KEYS.map(v=><option key={v} value={v}>{v}</option>)}</select>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={ofiFrom} onChange={e=>setOfiFrom(e.target.value)} style={{fontSize:12}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={ofiTo} onChange={e=>setOfiTo(e.target.value)} style={{fontSize:12}}/></div>
              <button onClick={()=>setShowArqOfi(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqOfi?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:showArqOfi?"#888":"#AAA",fontFamily:"inherit"}}>
                {showArqOfi?"✓ Arquivados":"📁 Ver Arquivados"}
              </button>
              {(ofiTipo!=="todos"||ofiTech!=="todos"||ofiStatus!=="todos"||ofiRegion!=="todas"||ofiFrom||ofiTo||ofiSearch)&&<BtnG onClick={()=>{setOfiTipo("todos");setOfiTech("todos");setOfiStatus("todos");setOfiRegion("todas");setOfiFrom("");setOfiTo("");setOfiSearch("");}}>✕ Limpar</BtnG>}
              <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{(filteredOficina||[]).filter(d=>showArqOfi||d.processoStatus!=="arquivado").length} registro(s)</span>
              <BtnImport onClick={()=>setModalImportOfi(true)}/>
              <BtnExcel onClick={()=>exportCSV((filteredOficina||[]).filter(d=>showArqOfi||d.processoStatus!=="arquivado"),"oficina_grupomov",[{key:"dataReg",label:"Data"},{key:"reportNum",label:"Nº Relatório"},{key:"type",label:"Tipo"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"date",label:"Data Atend."},{key:"numChamado",label:"Chamado"},{key:"acao",label:"Ação"},{key:"horaEntrada",label:"Entrada"},{key:"horaSaida",label:"Saída"},{key:"horasTrabalhadas",label:"Horas Trab."},{key:"status",label:"Status"},{key:"requisicaoPeca",label:"Requisição"},{key:"dataPeca",label:"Data Peça"},{key:"execPeca",label:"Executado"},{key:"chamadoPeca",label:"Chamado Peça"},{key:"relatorioPeca",label:"Relatório Peça"},{key:"dataRelPeca",label:"Data Rel. Peça"},{key:"processoStatus",label:"Processo"}])}/>
              <BtnY onClick={()=>setModalOfi(true)}>+ Novo Relatório</BtnY>
            </div>
            {/* Tabela */}
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Nº Relatório</th><th>Tipo</th><th>Empresa</th><th>Patrimônio</th><th>Técnico</th><th>Data Atend.</th><th>Chamado</th><th>Ação</th><th>Entrada</th><th>Saída</th><th>Horas Trab.</th><th>Status</th><th>Processo</th><th>Registrado por</th><th>Ações</th></tr></thead>
                  <tbody>
                    {(filteredOficina||[]).filter(d=>showArqOfi||d.processoStatus!=="arquivado").length===0&&<tr><td colSpan={user.canDelete?16:15} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Relatório".</td></tr>}
                    {(filteredOficina||[]).filter(d=>showArqOfi||d.processoStatus!=="arquivado").map(d=>{
                      const sc=REL_STATUS[d.status]||{color:"#888",bg:"#F5F5F5"};
                      const tc=tipoCfg(d.type);
                      const isArq=d.processoStatus==="arquivado";
                      const pend=isPendentePecas(d.status);
                      const nCols=16;
                      return(
                        <Fragment key={d.id}>
                        <tr style={{opacity:isArq?.5:1,background:isArq?"#F8F8F8":""}}>
                          <td><input type="date" value={d.dataReg||""} onChange={e=>updateOfi(d.id,{dataReg:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.reportNum||""} onChange={e=>updateOfi(d.id,{reportNum:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px",fontWeight:700}}/></td>
                          <td><select value={d.type} onChange={e=>updateOfi(d.id,{type:e.target.value})} style={{fontSize:10,padding:"3px 5px",color:tc.color,background:tc.bg,border:"none",borderRadius:5,fontWeight:700}}>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></td>
                          <td><input type="text" value={d.empresa||""} onChange={e=>updateOfi(d.id,{empresa:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.patrimonio||""} onChange={e=>updateOfi(d.id,{patrimonio:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={d.tecnico||""} onChange={e=>updateOfi(d.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                          <td><input type="date" value={d.date||""} onChange={e=>updateOfi(d.id,{date:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.numChamado||""} onChange={e=>updateOfi(d.id,{numChamado:e.target.value})} placeholder="—" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.acao||""} onChange={e=>updateOfi(d.id,{acao:e.target.value})} placeholder="Ação..." style={{width:160,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="time" value={d.horaEntrada||""} onChange={e=>{const v=e.target.value;updateOfi(d.id,{horaEntrada:v,horasTrabalhadas:calcHoras(v,d.horaSaida)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="time" value={d.horaSaida||""} onChange={e=>{const v=e.target.value;updateOfi(d.id,{horaSaida:v,horasTrabalhadas:calcHoras(d.horaEntrada,v)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                          <td style={{textAlign:"center"}}><span style={{display:"inline-block",minWidth:54,fontSize:12,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:6,padding:"4px 8px"}}>{d.horasTrabalhadas||calcHoras(d.horaEntrada,d.horaSaida)||"—"}</span></td>
                          <td><select value={d.status||""} onChange={e=>updateOfi(d.id,{status:e.target.value})} style={{fontSize:11,padding:"4px 7px",color:sc.color,background:sc.bg,border:`1px solid ${sc.color}33`,borderRadius:6,fontWeight:700,minWidth:150}}>{!REL_STATUS[d.status]&&<option value={d.status||""}>{d.status||"— selecionar —"}</option>}{REL_STATUS_KEYS.map(v=><option key={v} value={v}>{v}</option>)}</select></td>
                          <td><PSSelect value={d.processoStatus} onChange={v=>updateOfi(d.id,{processoStatus:v})}/></td>
                          <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{d.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(d.registradoEm)}</span></td>
                          <td style={{whiteSpace:"nowrap"}}><button onClick={()=>updateOfi(d.id,{processoStatus:d.processoStatus==="arquivado"?"em_andamento":"arquivado"})} title={d.processoStatus==="arquivado"?"Desarquivar":"Arquivar"} style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>{d.processoStatus==="arquivado"?"📤":"🗄️"}</button><button onClick={()=>{if(window.confirm("Excluir permanentemente?")){setOficina(p=>p.filter(r=>r.id!==d.id));db.delete("oficina",d.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>
                        </tr>
                        {pend&&(
                          <tr>
                            <td colSpan={nCols} style={{padding:"0 12px 12px"}}>
                              <div style={{background:"#FFF7E0",borderLeft:"4px solid #F5C200",borderRadius:8,padding:"10px 14px"}}>
                                <div style={{fontSize:10,fontWeight:800,color:"#92600A",letterSpacing:.5,marginBottom:8}}>⚠️ PEÇAS PENDENTES — acompanhamento</div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>REQUISIÇÃO</span><input type="text" value={d.requisicaoPeca||""} onChange={e=>updateOfi(d.id,{requisicaoPeca:e.target.value})} placeholder="REQ-000" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>DATA PEÇA</span><input type="date" value={d.dataPeca||""} onChange={e=>updateOfi(d.id,{dataPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>EXECUTADO</span><select value={d.execPeca||""} onChange={e=>updateOfi(d.id,{execPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}>{EXECUTADO_OPTS.map(o=><option key={o} value={o}>{o||"—"}</option>)}</select></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>CHAMADO</span><input type="text" value={d.chamadoPeca||""} onChange={e=>updateOfi(d.id,{chamadoPeca:e.target.value})} placeholder="—" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>RELATÓRIO</span><input type="text" value={d.relatorioPeca||""} onChange={e=>updateOfi(d.id,{relatorioPeca:e.target.value})} placeholder="REL-000" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>DATA</span><input type="date" value={d.dataRelPeca||""} onChange={e=>updateOfi(d.id,{dataRelPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}/></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSOS MAU USO ── */}
        {tab==="mau_uso"&&(()=>{
          const ST={pendente:{l:"Pendente",c:"#C62828",bg:"#FFF0F0"},em_andamento:{l:"Em Andamento",c:"#1565C0",bg:"#EFF6FF"},concluido:{l:"Concluído",c:"#1A7A3C",bg:"#F0FFF5"},arquivado:{l:"Arquivado",c:"#888",bg:"#F5F5F5"}};
          const lista=(processosMU||[]).filter(p=>p&&(showArqMU||p.processoStatus!=="arquivado"));
          const pend=lista.filter(p=>!p.processoStatus||p.processoStatus==="pendente").length;
          const andamento=lista.filter(p=>p.processoStatus==="em_andamento").length;
          const conc=lista.filter(p=>p.processoStatus==="concluido").length;
          const applyFilter=(r,d=r.date||"")=>{
            if(muSearch){const q=muSearch.toLowerCase();if(!((r.empresa||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.relatorio||"").toLowerCase().includes(q)||(r.numMauUso||"").toLowerCase().includes(q)||(r.chamado||"").toLowerCase().includes(q)||(r.ov||"").toLowerCase().includes(q)))return false;}
            if(muFrom&&d<muFrom)return false;
            if(muTo&&d>muTo)return false;
            if(muMes&&!d.slice(5,7).startsWith(muMes))return false;
            if(muAno&&!d.startsWith(muAno))return false;
            if(muAprov&&muAprov!=="todos"&&(r.aprovCliente||"aguardando_retorno")!==muAprov)return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          const hasFilterMU=muSearch||muFrom||muTo||muMes||muAno||(muAprov&&muAprov!=="todos");
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>⚠️ Mau Uso</div><div style={{fontSize:8,color:"#888",marginTop:2}}>{lista.length} processo(s) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
                <BtnImport onClick={()=>setModalImportMU2(true)}/>
                <button onClick={()=>setShowArqMU(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqMU?"#1A1A1A":"#FFF",color:showArqMU?"#FFF":"#555",fontSize:8,cursor:"pointer",fontWeight:600}}>📁 {showArqMU?"Ocultar":"Ver Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"mau_uso_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"relatorio",label:"Relatório"},{key:"numMauUso",label:"Nº MU"},{key:"ov",label:"OV"},{key:"valor",label:"Valor"},{key:"processoStatus",label:"Status"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                <BtnY onClick={()=>{setEditMU(null);setModalMU(true);}}>+ Novo Processo</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF8F8",i:"⏳"},{l:"Em Andamento",v:andamento,c:"#1565C0",bg:"#EFF6FF",i:"🔄"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"8px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:8,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{k.i} {k.l}</div>
                  <div style={{fontSize:19,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Filtros (colapsável) */}
            <button onClick={()=>setShowFiltrosMU(p=>!p)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:10,border:"1.5px solid #E2E8F0",background:showFiltrosMU?"#FFF":"#F8FAFC",cursor:"pointer",marginBottom:10,fontFamily:"inherit",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <span style={{fontSize:11}}>🔍</span>
              <span style={{fontSize:10,fontWeight:700,color:"#1E293B"}}>Filtros</span>
              {hasFilterMU&&<span style={{fontSize:8,fontWeight:700,color:"#1565C0",background:"#EFF6FF",borderRadius:10,padding:"1px 6px"}}>ativo</span>}
              <span style={{fontSize:8,color:"#94A3B8"}}>{showFiltrosMU?"▲":"▼"}</span>
            </button>
            {showFiltrosMU&&<div className="card" style={{padding:"8px 10px",marginBottom:14,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:160}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:8}}>🔍</span><input type="text" value={muSearch} onChange={e=>setMuSearch(e.target.value)} placeholder="Buscar empresa, PAT, relatório, chamado..." style={{width:"100%",padding:"6px 8px 6px 26px",fontSize:8,borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:8,color:"#888",fontWeight:600}}>De</span><input type="date" value={muFrom} onChange={e=>setMuFrom(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:8,color:"#888",fontWeight:600}}>Até</span><input type="date" value={muTo} onChange={e=>setMuTo(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={muMes} onChange={e=>setMuMes(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={muAno} onChange={e=>setMuAno(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              <select value={muAprov} onChange={e=>setMuAprov(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="todos">Status Aprovação: Todos</option>{Object.entries(APROV_STATUS).map(([v,s])=><option key={v} value={v}>{s.l}</option>)}</select>
              {hasFilterMU&&<button onClick={()=>{setMuSearch('');setMuFrom('');setMuTo('');setMuMes('');setMuAno('');setMuAprov('todos');}} style={{padding:"6px 12px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:8,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>}
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:4}}>⚠️</div><div style={{fontSize:8,fontWeight:600}}>{muSearch||muFrom||muTo||muMes||muAno?"Nenhum resultado":"Nenhum processo cadastrado"}</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {listaFil.map(p=>{
                  const st=ST[p.processoStatus||"pendente"]||ST.pendente;
                  const slaD=p.date?diffDays(p.date):null;
                  return(<div key={p.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:p.processoStatus==="arquivado"?0.6:1}}>
                    <div style={{padding:"5px 7px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <span style={{fontSize:8,fontWeight:700,color:st.c,background:"#FFF",border:`1px solid ${st.c}33`,borderRadius:20,padding:"1px 7px"}}>{st.l}</span>
                        {slaD!==null&&<span style={{fontSize:8,fontWeight:700,color:slaD>10?"#C62828":slaD>5?"#E67E00":"#888",background:"#F5F5F5",borderRadius:20,padding:"1px 6px"}}>⏱ {slaD}d</span>}
                      </div>
                      <div style={{display:"flex",gap:2}}>
                        <button onClick={()=>{setEditMU(p);setModalMU(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"3px 5px",fontSize:8}}>✏️</button>
                        <button onClick={()=>updateMU(p.id,{processoStatus:p.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"3px 5px",fontSize:8}}>{p.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir permanentemente?")){setProcessosMU(p2=>p2.filter(x=>x.id!==p.id));db.delete("processos_mu",p.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"3px 5px",fontSize:8,fontWeight:600}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"4px 6px",display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:8,fontWeight:800,color:"#1A1A1A",marginBottom:1}}>{p.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:8,color:"#888"}}>📅 {fmtDataBR(p.date)} · PAT: <b>{p.patrimonio||"—"}</b></div></div>
                        <span style={{fontSize:8,fontWeight:600,color:p.aprovado==="sim"?"#1A7A3C":"#C62828",background:p.aprovado==="sim"?"#F0FFF5":"#FFF0F0",borderRadius:8,padding:"2px 7px"}}>{p.aprovado==="sim"?"✅":"❌"}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>
                        <div style={{background:"#F8F9FA",borderRadius:6,padding:"2px 4px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Rel.</div><input type="text" value={p.relatorio||""} onChange={e=>updateMU(p.id,{relatorio:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:8,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:6,padding:"2px 4px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Nº MU</div><input type="text" value={p.numMauUso||""} onChange={e=>updateMU(p.id,{numMauUso:e.target.value})} placeholder="—" style={{width:"100%",fontSize:8,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:6,padding:"2px 4px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Cham.</div><input type="text" value={p.chamado||""} onChange={e=>updateMU(p.id,{chamado:e.target.value})} placeholder="—" style={{width:"100%",fontSize:8,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F0FFF5",borderRadius:6,padding:"2px 4px",border:"1px solid #C8E8D0",gridColumn:"span 2"}}><div style={{color:"#1A7A3C",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>💰 Valor</div><input type="text" value={p.valor||""} onChange={e=>updateMU(p.id,{valor:e.target.value})} placeholder="R$ 0,00" style={{width:"100%",fontSize:8,fontWeight:700,color:"#1A7A3C",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:6,padding:"2px 4px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>OV</div><input type="text" value={p.ov||""} onChange={e=>updateMU(p.id,{ov:e.target.value})} placeholder="—" style={{width:"100%",fontSize:8,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                      </div>
                      {p.obs&&<div style={{fontSize:8,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:6,padding:"3px 5px",borderLeft:"3px solid #F5C200"}}>💬 {p.obs}</div>}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
                        <select value={p.aprovCliente||"aguardando_retorno"} onChange={e=>updateMU(p.id,{aprovCliente:e.target.value})} style={{width:"100%",fontSize:8,padding:"2px 4px",borderRadius:6,border:`1.5px solid ${(APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.c||"#E67E00")}66`,color:APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.c||"#E67E00",background:APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.bg||"#FFF8F0",fontWeight:700,cursor:"pointer"}}>
                          {Object.entries(APROV_STATUS).map(([v,s])=><option key={v} value={v}>{s.l}</option>)}
                        </select>
                        <select value={p.processoStatus||"pendente"} onChange={e=>updateMU(p.id,{processoStatus:e.target.value})} style={{width:"100%",fontSize:8,padding:"2px 4px",borderRadius:6,border:`1px solid ${st.c}44`,color:st.c,background:st.bg,fontWeight:700,cursor:"pointer"}}>
                          <option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Andamento</option><option value="concluido">✅ Concluído</option><option value="arquivado">🗄️ Arquivado</option>
                        </select>
                      </div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── PROCESSOS A FATURAR ── */}
        {tab==="a_faturar"&&(()=>{
          const ST={pendente:{l:"Pendente",c:"#E67E00",bg:"#FFF8F0"},em_andamento:{l:"Em Andamento",c:"#1565C0",bg:"#EFF6FF"},concluido:{l:"Concluído",c:"#1A7A3C",bg:"#F0FFF5"},arquivado:{l:"Arquivado",c:"#888",bg:"#F5F5F5"}};
          const lista=(processosAF||[]).filter(p=>p&&(showArqAF||p.processoStatus!=="arquivado"));
          const pend=lista.filter(p=>!p.processoStatus||p.processoStatus==="pendente").length;
          const andamento=lista.filter(p=>p.processoStatus==="em_andamento").length;
          const conc=lista.filter(p=>p.processoStatus==="concluido").length;
          const aprov=lista.filter(p=>p.aprovado==="sim").length;
          const applyFilter=(r,d=r.date||"")=>{
            if(afSearch){const q=afSearch.toLowerCase();if(!((r.empresa||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.relatorio||"").toLowerCase().includes(q)||(r.ov||"").toLowerCase().includes(q)||(r.valor||"").toLowerCase().includes(q)||(r.aprovadoPor||"").toLowerCase().includes(q)))return false;}
            if(afFrom&&d<afFrom)return false;
            if(afTo&&d>afTo)return false;
            if(afMes&&!d.slice(5,7).startsWith(afMes))return false;
            if(afAno&&!d.startsWith(afAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          const valorTotal=lista.reduce((acc,p)=>{const v=parseFloat((p.valor||"0").toString().replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>💰 A Faturar</div><div style={{fontSize:8,color:"#888",marginTop:2}}>{lista.length} processo(s) · <span style={{color:"#E67E00",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                <BtnImport onClick={()=>setModalImportAF2(true)}/>
                <button onClick={()=>setShowArqAF(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqAF?"#1A1A1A":"#FFF",color:showArqAF?"#FFF":"#555",fontSize:8,cursor:"pointer",fontWeight:600}}>📁 {showArqAF?"Ocultar":"Ver Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"a_faturar_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"relatorio",label:"Relatório"},{key:"ov",label:"OV"},{key:"valor",label:"Valor"},{key:"aprovado",label:"Aprovado"},{key:"processoStatus",label:"Status"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                <BtnY onClick={()=>{setEditAF(null);setModalAF(true);}}>+ Novo Processo</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Em Andamento",v:andamento,c:"#1565C0",bg:"#EFF6FF",i:"🔄"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Aprovados",v:aprov,c:"#6A1B9A",bg:"#F3E5F5",i:"👍"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"10px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:8,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:19,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {valorTotal>0&&<div className="card" style={{padding:"7px 20px",marginBottom:18,background:"linear-gradient(90deg,#1A7A3C,#2e9e57)",color:"#FFF",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:24}}>💵</div>
              <div><div style={{fontSize:8,fontWeight:700,opacity:.8,textTransform:"uppercase",letterSpacing:1}}>Valor Total a Faturar</div><div style={{fontSize:22,fontWeight:900}}>R$ {valorTotal.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div></div>
            </div>}
            <div className="card" style={{padding:"3px 5px",marginBottom:14,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:8}}>🔍</span><input type="text" value={afSearch} onChange={e=>setAfSearch(e.target.value)} placeholder="Buscar empresa, PAT, relatório, OV..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:8,borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:8,color:"#888",fontWeight:600}}>De</span><input type="date" value={afFrom} onChange={e=>setAfFrom(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:8,color:"#888",fontWeight:600}}>Até</span><input type="date" value={afTo} onChange={e=>setAfTo(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={afMes} onChange={e=>setAfMes(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={afAno} onChange={e=>setAfAno(e.target.value)} style={{fontSize:8,padding:"3px 5px",borderRadius:6,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(afSearch||afFrom||afTo||afMes||afAno)&&<button onClick={()=>{setAfSearch('');setAfFrom('');setAfTo('');setAfMes('');setAfAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:8,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:4}}>💰</div><div style={{fontSize:8,fontWeight:600}}>{afSearch||afFrom||afTo||afMes||afAno?"Nenhum resultado":"Nenhum processo"}</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(p=>{
                  const st=ST[p.processoStatus||"pendente"]||ST.pendente;
                  const slaD=p.date?diffDays(p.date):null;
                  return(<div key={p.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:p.processoStatus==="arquivado"?0.6:1}}>
                    <div style={{padding:"7px 10px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <span style={{fontSize:8,fontWeight:800,color:st.c,background:"#FFF",border:`1px solid ${st.c}33`,borderRadius:20,padding:"2px 10px"}}>{st.l}</span>
                        {slaD!==null&&<span style={{fontSize:8,fontWeight:700,color:slaD>10?"#C62828":slaD>5?"#E67E00":"#888",background:"#F5F5F5",borderRadius:20,padding:"2px 8px"}}>⏱ {slaD}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setEditAF(p);setModalAF(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:8}}>✏️</button>
                        <button onClick={()=>updateAF(p.id,{processoStatus:p.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:8}}>{p.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir permanentemente?")){setProcessosAF(p2=>p2.filter(x=>x.id!==p.id));db.delete("processos_af",p.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:8,fontWeight:600}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"3px 5px",display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:8,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{p.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:8,color:"#888"}}>📅 {fmtDataBR(p.date)} · PAT: <b>{p.patrimonio||"—"}</b></div></div>
                        <span style={{fontSize:8,fontWeight:600,color:p.aprovado==="sim"?"#1A7A3C":"#C62828",background:p.aprovado==="sim"?"#F0FFF5":"#FFF0F0",borderRadius:8,padding:"3px 10px"}}>{p.aprovado==="sim"?"✅ Aprovado":"❌ Não"}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"3px 5px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório</div><input type="text" value={p.relatorio||""} onChange={e=>updateAF(p.id,{relatorio:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:8,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"3px 5px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>OV</div><input type="text" value={p.ov||""} onChange={e=>updateAF(p.id,{ov:e.target.value})} placeholder="—" style={{width:"100%",fontSize:8,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"3px 5px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Valor</div><input type="text" value={p.valor||""} onChange={e=>updateAF(p.id,{valor:e.target.value})} placeholder="R$ 0,00" style={{width:"100%",fontSize:8,fontWeight:800,color:"#1A7A3C",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"3px 5px"}}><div style={{color:"#AAA",fontSize:8,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Serviço Exec.</div><select value={p.servicoExecutado||"nao"} onChange={e=>updateAF(p.id,{servicoExecutado:e.target.value})} style={{fontSize:8,fontWeight:700,color:p.servicoExecutado==="sim"?"#1A7A3C":"#888",border:"none",background:"transparent",outline:"none",cursor:"pointer",padding:0}}><option value="nao">Não</option><option value="sim">Sim</option></select></div>
                      </div>
                      {p.obs&&<div style={{fontSize:8,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {p.obs}</div>}
                      <div style={{borderTop:"1px solid #F0F0F0",paddingTop:8}}>
                        <div style={{fontSize:8,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>Status Aprovação Cliente</div>
                        <select value={p.aprovCliente||"aguardando_retorno"} onChange={e=>updateAF(p.id,{aprovCliente:e.target.value})} style={{width:"100%",fontSize:8,padding:"3px 5px",borderRadius:6,border:`1.5px solid ${(APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.c||"#E67E00")}66`,color:APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.c||"#E67E00",background:APROV_STATUS[p.aprovCliente||"aguardando_retorno"]?.bg||"#FFF8F0",fontWeight:700,cursor:"pointer"}}>
                          {Object.entries(APROV_STATUS).map(([v,s])=><option key={v} value={v}>{s.l}</option>)}
                        </select>
                      </div>
                      <select value={p.processoStatus||"pendente"} onChange={e=>updateAF(p.id,{processoStatus:e.target.value})} style={{fontSize:8,padding:"6px 10px",borderRadius:20,border:`1px solid ${st.c}44`,color:st.c,background:st.bg,fontWeight:700,cursor:"pointer"}}>
                        <option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option><option value="arquivado">🗄️ Arquivado</option>
                      </select>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── REQ. EMPRÉSTIMO ── */}
        {tab==="emprestimos"&&(()=>{
          const SIT={Aprovado:{c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},Atendido:{c:"#1565C0",bg:"#EFF6FF",i:"📦"},Pendente:{c:"#E67E00",bg:"#FFF8F0",i:"⏳"},"Parcialmente Atendido":{c:"#8E44AD",bg:"#F6F0FB",i:"🔀"},"Retorno Concluído":{c:"#00838F",bg:"#E0F7FA",i:"🔁"},Ruptura:{c:"#C62828",bg:"#FFF0F0",i:"🔴"}};
          const lista=(emprestimos||[]).filter(e=>e&&(showArqEmp||e.processoStatus!=="arquivado"));
          const pend=lista.filter(e=>e.situacao==="Pendente"||!e.situacao).length;
          const atrasados=lista.filter(e=>{const s=e.dataRetorno?diffDays(e.dataRetorno):null;return s!==null&&s<0;}).length;
                    const applyFilter=(r,d=r.data||"")=>{
            if(empSearch){const q=empSearch.toLowerCase();if(!((r.req||"").toLowerCase().includes(q)||(r.requerente||"").toLowerCase().includes(q)||(r.item||"").toLowerCase().includes(q)||(r.descricao||"").toLowerCase().includes(q)||(r.centroResultado||"").toLowerCase().includes(q)||(r.observacao||"").toLowerCase().includes(q)))return false;}
            if(empFrom&&d<empFrom)return false;
            if(empTo&&d>empTo)return false;
            if(empMes&&!d.slice(5,7).startsWith(empMes))return false;
            if(empAno&&!d.startsWith(empAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>🔄 Empréstimo e Retorno</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s){atrasados>0&&<span style={{color:"#C62828",fontWeight:700}}> · ⚠️ {atrasados} em atraso</span>}</div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqEmp(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqEmp?"#1A1A1A":"#FFF",color:showArqEmp?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqEmp?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"emprestimos_grupomov",[{key:"req",label:"REQ"},{key:"data",label:"Data"},{key:"requerente",label:"Requerente"},{key:"item",label:"Item"},{key:"descricao",label:"Descrição"},{key:"situacao",label:"Situação"},{key:"quant",label:"Qtd"},{key:"dataRetorno",label:"Retorno"},{key:"observacao",label:"Obs"}])}/>
                <BtnY onClick={()=>{setEditEmp(null);setModalEmp(true);}}>+ Nova Requisição</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Em Atraso",v:atrasados,c:"#C62828",bg:"#FFF0F0",i:"⚠️"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"8px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
                        <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={empSearch} onChange={e=>setEmpSearch(e.target.value)} placeholder="Buscar REQ, requerente, item, descrição..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={empFrom} onChange={e=>setEmpFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={empTo} onChange={e=>setEmpTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={empMes} onChange={e=>setEmpMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={empAno} onChange={e=>setEmpAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(empSearch||empFrom||empTo||empMes||empAno)&&<button onClick={()=>{setEmpSearch('');setEmpFrom('');setEmpTo('');setEmpMes('');setEmpAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>🔄</div><div style={{fontSize:15,fontWeight:600}}>Nenhuma requisição</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(e=>{
                  const sc=SIT[e.situacao]||SIT.Pendente;
                  const sla=e.dataRetorno?diffDays(e.dataRetorno):null;
                  const atrasado=sla!==null&&sla<0;
                  return(<div key={e.id} className="card" style={{borderTop:`4px solid ${sc.c}`,padding:0,overflow:"hidden",opacity:e.processoStatus==="arquivado"?0.55:1,outline:atrasado?"2px solid #C62828":"none"}}>
                    <div style={{padding:"7px 10px",background:sc.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:sc.c,background:"#FFF",border:`1px solid ${sc.c}33`,borderRadius:20,padding:"2px 10px"}}>{sc.i} {e.situacao||"Pendente"}</span>
                        {atrasado&&<span style={{fontSize:10,fontWeight:700,color:"#C62828",background:"#FFF0F0",borderRadius:20,padding:"2px 8px"}}>⚠️ {Math.abs(sla)}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setEditEmp(e);setModalEmp(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateEmp(e.id,{processoStatus:e.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{e.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?")){setEmprestimos(p=>p.filter(x=>x.id!==e.id));db.delete("emprestimos",e.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{e.item||e.descricao||<span style={{color:"#CCC"}}>Sem item</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {e.data||"—"} · <b>{e.requerente||"—"}</b></div></div>
                        {e.req&&<span style={{fontSize:11,fontWeight:700,color:"#1565C0",background:"#EFF6FF",borderRadius:8,padding:"3px 8px"}}>{e.req}</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Qtd · PAT</div><div style={{fontSize:12,fontWeight:700}}>{e.quant||"—"} {e.centroResultado&&<span style={{color:"#888",fontWeight:400,fontSize:10}}>· {e.centroResultado}</span>}</div></div>
                        <div style={{background:atrasado?"#FFF0F0":"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Retorno</div><div style={{fontSize:12,fontWeight:700,color:atrasado?"#C62828":"#333"}}>{e.dataRetorno||"—"}</div></div>
                        {e.relatorioAplicado&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório Aplicado</div><div style={{fontSize:12,fontWeight:700,color:"#1A7A3C"}}>{e.relatorioAplicado}{e.dataAplicacao&&<span style={{fontSize:10,color:"#888",fontWeight:400}}> · {e.dataAplicacao}</span>}</div></div>}
                        {e.retornoAlmox&&<div style={{background:"#EFF6FF",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🔁 Retorno ao Almox</div><div style={{fontSize:12,fontWeight:700,color:"#1565C0"}}>{e.retornoAlmox}{e.dataRetorno&&<span style={{fontSize:10,color:"#888",fontWeight:400}}> · {e.dataRetorno}</span>}</div></div>}
                      </div>
                      {e.observacao&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {e.observacao}</div>}
                      <select value={e.situacao||"Pendente"} onChange={ev=>updateEmp(e.id,{situacao:ev.target.value})} style={{fontSize:11,padding:"6px 10px",borderRadius:20,border:`1px solid ${sc.c}44`,color:sc.c,background:sc.bg,fontWeight:700,cursor:"pointer"}}>
                        {Object.entries(SIT).map(([v,s])=><option key={v} value={v}>{s.i} {v}</option>)}
                      </select>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── SAÍDA/ENTRADA ── */}
        {tab==="saida_entrada"&&(()=>{
          const lista=(saidaEntrada||[]).filter(s=>s&&(showArqSaida||s.processoStatus!=="arquivado"));
          const rupturas=lista.filter(s=>s.statusReq==="ruptura").length;
          const atendidos=lista.filter(s=>s.statusReq==="atendido").length;
          const pend=lista.filter(s=>s.statusFinal==="pendente"||!s.statusFinal).length;
                    const applyFilter=(r,d=r.data||"")=>{
            if(saiSearch){const q=saiSearch.toLowerCase();if(!((r.empresa||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.peca||"").toLowerCase().includes(q)||(r.codigo||"").toLowerCase().includes(q)||(r.req||"").toLowerCase().includes(q)||(r.relSolicitacao||"").toLowerCase().includes(q)||(r.relatorioAplicado||"").toLowerCase().includes(q)))return false;}
            if(saiFrom&&d<saiFrom)return false;
            if(saiTo&&d>saiTo)return false;
            if(saiMes&&!d.slice(5,7).startsWith(saiMes))return false;
            if(saiAno&&!d.startsWith(saiAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📦 Entrada / Saída</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s) · <span style={{color:"#C62828",fontWeight:700}}>{rupturas} rupturas</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqSaida(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqSaida?"#1A1A1A":"#FFF",color:showArqSaida?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqSaida?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"saida_entrada_grupomov",[{key:"data",label:"Data"},{key:"relSolicitacao",label:"Rel. Sol."},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"peca",label:"Peça"},{key:"codigo",label:"Código"},{key:"quantidade",label:"Qtd"},{key:"req",label:"REQ"},{key:"statusReq",label:"Status REQ"},{key:"statusFinal",label:"Status Final"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                <BtnY onClick={()=>{const row={id:`SAI${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,relSolicitacao:"",empresa:"",patrimonio:"",peca:"",codigo:"",quantidade:"1",req:"",statusReq:"",dataAtendimento:"",localPeca:"",dataEntregaTecnico:"",relatorioAplicado:"",obs:"",statusFinal:"pendente",processoStatus:"em_andamento"};setSaidaEntrada(p=>[row,...p]);db.save("saida_entrada",row.id,row);notify("✅ Registro criado!");}}>+ Novo Registro</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Rupturas",v:rupturas,c:"#C62828",bg:"#FFF0F0",i:"🔴"},{l:"Atendidos",v:atendidos,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"8px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
                        <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={saiSearch} onChange={e=>setSaiSearch(e.target.value)} placeholder="Buscar empresa, PAT, peça, REQ..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={saiFrom} onChange={e=>setSaiFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={saiTo} onChange={e=>setSaiTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={saiMes} onChange={e=>setSaiMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={saiAno} onChange={e=>setSaiAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(saiSearch||saiFrom||saiTo||saiMes||saiAno)&&<button onClick={()=>{setSaiSearch('');setSaiFrom('');setSaiTo('');setSaiMes('');setSaiAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📦</div><div style={{fontSize:15,fontWeight:600}}>Nenhum registro</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(s=>{
                  const isRuptura=s.statusReq==="ruptura";
                  const isAtendido=s.statusReq==="atendido";
                  const slaRuptura=isRuptura&&s.data?diffDays(s.data):null;
                  const borderC=isRuptura?"#C62828":isAtendido?"#1A7A3C":"#E0E0E0";
                  return(<div key={s.id} className="card" style={{borderTop:`4px solid ${borderC}`,padding:0,overflow:"hidden",opacity:s.processoStatus==="arquivado"?0.55:1}}>
                    <div style={{padding:"7px 10px",background:isRuptura?"#FFF0F0":isAtendido?"#F0FFF5":"#F8F9FA",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <select value={s.statusReq||""} onChange={e=>updateSaida(s.id,{statusReq:e.target.value})} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,border:"none",color:isRuptura?"#C62828":isAtendido?"#1A7A3C":"#888",background:isRuptura?"#FFE0E0":isAtendido?"#DCFFE4":"#F0F0F0",cursor:"pointer"}}>
                          <option value="">— Status —</option><option value="atendido">✅ Atendido</option><option value="ruptura">🔴 Ruptura</option>
                        </select>
                        {isRuptura&&slaRuptura!==null&&<span style={{fontSize:10,fontWeight:700,color:slaRuptura>5?"#C62828":"#E67E00",background:"#FFF0F0",borderRadius:20,padding:"2px 8px"}}>⏱ {slaRuptura}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{const row={...s};setSaidaEntrada(p=>p.filter(x=>x.id!==s.id));db.delete("saida_entrada",s.id);const nr={...row,id:`SAI${Date.now()}_${Math.floor(Math.random()*9999)}`};setSaidaEntrada(p=>[nr,...p]);db.save("saida_entrada",nr.id,nr);}} title="Duplicar p/ editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                      <button onClick={()=>updateSaida(s.id,{processoStatus:s.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{s.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?")){setSaidaEntrada(p=>p.filter(x=>x.id!==s.id));db.delete("saida_entrada",s.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:14,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{s.peca||<span style={{color:"#CCC"}}>Sem peça</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {fmtDataBR(s.data)} · {s.empresa||"—"}</div></div>
                        {s.req&&<span style={{fontSize:10,fontWeight:700,color:"#1565C0",background:"#EFF6FF",borderRadius:8,padding:"2px 7px"}}>{s.req}</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>PAT · Cód.</div><input type="text" value={s.patrimonio||""} onChange={e=>updateSaida(s.id,{patrimonio:e.target.value})} placeholder="PAT" style={{width:"100%",fontSize:12,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Qtd · Código</div><div style={{fontSize:12,fontWeight:700}}>{s.quantidade||"—"} <span style={{color:"#888",fontWeight:400,fontSize:10}}>{s.codigo?`· ${s.codigo}`:""}</span></div></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Rel. Solicitação</div><input type="text" value={s.relSolicitacao||""} onChange={e=>updateSaida(s.id,{relSolicitacao:e.target.value})} placeholder="OS_REL" style={{width:"100%",fontSize:12,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        {isAtendido&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Rel. Aplicado</div><input type="text" value={s.relatorioAplicado||""} onChange={e=>updateSaida(s.id,{relatorioAplicado:e.target.value})} placeholder="REL-001" style={{width:"100%",fontSize:12,fontWeight:700,color:"#1A7A3C",border:"none",background:"transparent",outline:"none",padding:0}}/></div>}
                      </div>
                      {s.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {s.obs}</div>}
                      <select value={s.statusFinal||"pendente"} onChange={e=>updateSaida(s.id,{statusFinal:e.target.value})} style={{fontSize:11,padding:"6px 10px",borderRadius:20,border:"1px solid #E0E0E0",color:s.statusFinal==="concluido"?"#1A7A3C":"#E67E00",background:s.statusFinal==="concluido"?"#F0FFF5":"#FFF8F0",fontWeight:700,cursor:"pointer"}}>
                        <option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option>
                      </select>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── REQUISIÇÕES ── */}
        {/* ── AGENDA (mensal, todos os técnicos) ── */}
        {tab==="agenda_prev"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agpYear}-${String(agpMonth+1).padStart(2,"0")}`;
          const diasNoMes=new Date(agpYear,agpMonth+1,0).getDate();
          const dias=Array.from({length:diasNoMes},(_,i)=>i+1);
          const matchSt=s=>agpStatus==="todos"||s.status===agpStatus;
          const matchTipo=s=>agpTipo==="todos"||(s.type||"preventivo")===agpTipo;
          const techsComDados=Array.from(new Set(Object.keys(schedule).map(k=>{const i=k.indexOf("__");return i<0?null:k.slice(0,i).trim();}).filter(Boolean)));
          const baseTechs=agpRegion==="todas"?ALL_TECHS:(REGIONS[agpRegion]?.techs||ALL_TECHS);
          const techs=Array.from(new Set([...baseTechs,...(agpRegion==="todas"?techsComDados:[])]));
          const techsList=techs.filter(t=>agpTech==="todos"||t===agpTech);
          const getTipoCor=t=>(t||"preventivo")==="corretivo"?"#C62828":"#1565C0";
          const addAtend=()=>{
            const dataFinal=agDate||`${ym}-01`;
            if(!agEmpresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agTech}__${dataFinal}`;
            const horas=calcHoras(agEntrada,agSaida);
            saveSched(key,[...(schedule[key]||[]),{client:agEmpresa,cidade:agCidade||"",servicos:agServicos,obsServico:agObsServ,horimetro:agHorimetro||"",patrimonio:agPat||"",relatorio:agRelatorio||"",obs:agObs||"",type:agTipo,status:(agStatus==="todos"?"agendada":agStatus),horaEntrada:agEntrada,horaSaida:agSaida,horasTrabalhadas:horas}]);
            setAgServicos([]);setAgObsServ("");setAgEmpresa("");setAgCidade("");setAgHorimetro("");setAgPat("");setAgEntrada("");setAgSaida("");setAgRelatorio("");setAgObs("");
            notify("✅ Atendimento salvo!");
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>🗓 Agenda — Técnicos Externos</div>
                  <div style={{fontSize:13,color:"#888",marginTop:2}}>{techsList.length} técnico(s)</div>
                </div>
              </div>

              {/* Filtros */}
              <div className="card" style={{padding:"6px 10px",marginBottom:18,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <select value={agpRegion} onChange={e=>setAgpRegion(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                  <option value="todas">🌐 Todas Regiões</option>
                  <option value="metropolitana">Metropolitana</option>
                  <option value="roca">Roça</option>
                  <option value="centroOeste">Centro-Oeste</option>
                </select>
                <select value={agpTech} onChange={e=>setAgpTech(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                <select value={agpTipo} onChange={e=>setAgpTipo(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="todos">Todos tipos</option><option value="preventivo">🔵 Preventivo</option><option value="corretivo">🔧 Corretivo</option></select>
                <select value={agpStatus} onChange={e=>setAgpStatus(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="todos">Todos status</option>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select>
                <select value={agpMonth} onChange={e=>setAgpMonth(Number(e.target.value))} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",fontWeight:700}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                <select value={agpYear} onChange={e=>setAgpYear(Number(e.target.value))} style={{fontSize:12,padding:"7px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",fontWeight:700}}>{[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}</select>
              </div>

              {/* Novo Atendimento */}
              {!isReadOnlyAgenda(user)&&<div style={{display:"flex",gap:8,marginBottom:14}}>
                <button onClick={()=>setShowNovoAtend(true)} style={{padding:"10px 20px",borderRadius:12,background:"#F5C200",border:"none",fontWeight:800,fontSize:13,color:"#1A1A1A",cursor:"pointer",boxShadow:"0 2px 8px rgba(245,194,0,.3)"}}>+ Novo Atendimento</button>
                <label style={{padding:"7px 14px",borderRadius:8,border:"1px solid #8B5CF6",background:"#F5F3FF",fontSize:12,cursor:"pointer",color:"#8B5CF6",fontWeight:700,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:4}}>
                  📄 Ler PDF
                  <input type="file" accept=".pdf" style={{display:"none"}} onChange={async e=>{
                    const file=e.target.files[0];if(!file)return;
                    try{
                      const b64=await new Promise((res,rej)=>{const r2=new FileReader();r2.onload=()=>res(r2.result.split(",")[1]);r2.onerror=rej;r2.readAsDataURL(file);});
                      const resp=await fetch("https://mov-ia.vercel.app/api/read-pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pdfBase64:b64})});
                      const respText=await resp.text();
                      if(!resp.ok)throw new Error(respText.slice(0,200));
                      let data2;try{data2=JSON.parse(respText);}catch(ex){throw new Error("Resposta inválida");}
                      const txt2=data2.content?.[0]?.text||"{}";
                      const parsed2=JSON.parse(txt2.replace(/```json|```/g,"").trim());
                      const tech2=parsed2.tecnico||"Sem Técnico";
                      const dt2=parsed2.data||TODAY_STR;
                      const key2=`${tech2}__${dt2}`;
                      const slot2={client:parsed2.cliente||parsed2.empresa||"",cidade:parsed2.cidade||"",patrimonio:parsed2.patrimonio||"",horimetro:parsed2.horimetro||"",horaEntrada:parsed2.inicio||parsed2.entrada||"",horaSaida:parsed2.saida||parsed2.termino||"",relatorio:parsed2.relatorio||parsed2.os||"",obs:parsed2.obs||"",servico:parsed2.tipo||"corretiva",type:parsed2.tipo||"corretivo",status:"agendada",servicos:parsed2.servicos||[],obsServico:parsed2.obsServico||""};
                      saveSched(key2,[...(schedule[key2]||[]),slot2]);
                      notify("✅ Atendimento criado via PDF!");
                    }catch(err2){alert("Erro PDF: "+(err2?.message||JSON.stringify(err2)));}
                    e.target.value="";
                  }}/>
                </label>
                <BtnImport onClick={()=>setModalImportAgenda(true)}/>
                <BtnExcel onClick={()=>{const allAtend=Object.entries(schedule).flatMap(([k,v])=>{const[tech,dt]=k.split("__");return(v||[]).map(s=>({tecnico:tech,data:dt,cliente:s.client,cidade:s.cidade,patrimonio:s.patrimonio,horimetro:s.horimetro,entrada:s.horaEntrada,saida:s.horaSaida,horas:s.horasTrabalhadas||"",relatorio:s.relatorio,obs:s.obs,status:s.status,servicos:(s.servicos||[]).join(", "),obsServico:s.obsServico}));});exportCSV(allAtend,"agenda_tecnicos",[{key:"tecnico",label:"Técnico"},{key:"data",label:"Data"},{key:"cliente",label:"Cliente"},{key:"cidade",label:"Cidade"},{key:"patrimonio",label:"PAT"},{key:"horimetro",label:"Horímetro"},{key:"entrada",label:"Entrada"},{key:"saida",label:"Saída"},{key:"horas",label:"Horas"},{key:"relatorio",label:"Relatório"},{key:"obs",label:"Obs"},{key:"status",label:"Status"},{key:"servicos",label:"Serviços"},{key:"obsServico",label:"Obs Serviço"}]);}}/>
              </div>}
              {showNovoAtend&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowNovoAtend(false)}>
                <div style={{background:"#FFF",borderRadius:16,width:680,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>➕ Novo Atendimento</div>
                    <button onClick={()=>setShowNovoAtend(false)} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
                  </div>
                  <div style={{padding:"22px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Técnico</label><select value={agTech} onChange={e=>setAgTech(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:600}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Data</label><input type="date" value={agDate||`${ym}-01`} onChange={e=>setAgDate(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Empresa</label><input type="text" placeholder="Cliente" value={agEmpresa} onChange={e=>setAgEmpresa(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",minWidth:130}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Cidade</label><select value={agCidade||""} onChange={e=>setAgCidade(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:140}}><option value="">Selecione...</option>{["BH","Santa Luzia","Ribeirão das Neves","Lagoa Santa","Sete Lagoas","Nova Lima","Betim","Lafaiete","Itabirito","Pará de Minas","Divinópolis","Araxá","Tapira","Uberaba"].map(c=><option key={c}>{c}</option>)}</select></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Horímetro</label><input type="text" placeholder="—" value={agHorimetro||""} onChange={e=>setAgHorimetro(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:90}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Patrimônio</label><input type="text" placeholder="PAT-001" value={agPat} onChange={e=>setAgPat(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",minWidth:90}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Relatório</label><input type="text" placeholder="REL-001" value={agRelatorio||""} onChange={e=>setAgRelatorio(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:100}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:140}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Observação</label><input type="text" placeholder="Obs..." value={agObs||""} onChange={e=>setAgObs(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:"100%"}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Início</label><input type="time" value={agEntrada} onChange={e=>setAgEntrada(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Término</label><input type="time" value={agSaida} onChange={e=>setAgSaida(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Tipo</label><select value={agTipo} onChange={e=>setAgTipo(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:700,color:getTipoCor(agTipo)}}><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Status</label><select value={agStatus} onChange={e=>setAgStatus(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,width:"100%",marginTop:4}}>
                     <label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>🔧 Serviços</label>
                     <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                       {["Mecânica","Elétrica","Pequenos Reparos","Bateria","Carregador","Hidráulica","Outros"].map(sv=>{const sel=agServicos.includes(sv);return(<button key={sv} type="button" onClick={()=>setAgServicos(p=>sel?p.filter(x=>x!==sv):[...p,sv])} style={{fontSize:10,padding:"4px 10px",borderRadius:16,border:sel?"2px solid #3B82F6":"1.5px solid #E0E0E0",background:sel?"#EFF6FF":"#FFF",color:sel?"#2563EB":"#888",fontWeight:sel?700:500,cursor:"pointer"}}>{sv}</button>);})}
                     </div>
                   </div>
                   <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:200}}>
                     <label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>📝 Obs. Serviço</label>
                     <input type="text" placeholder="Ex: Troca de rodas..." value={agObsServ} onChange={e=>setAgObsServ(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/>
                   </div>
                   <BtnY onClick={()=>{addAtend();setShowNovoAtend(false);}}>Adicionar</BtnY>
                </div>
              </div>
              </div>}

              {/* Calendário horizontal */}
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",width:"100%"}}>
                  <thead>
                    <tr style={{background:"#1A1A1A",position:"sticky",top:0,zIndex:3}}>
                      <th style={{padding:"6px 10px",color:"#F5C200",fontWeight:800,textAlign:"left",position:"sticky",left:0,background:"#1A1A1A",zIndex:4,minWidth:170,whiteSpace:"nowrap",fontSize:13,borderBottom:"3px solid #F5C200"}}>👷 Técnico</th>
                      {dias.map(d=>{
                        const dt=`${ym}-${String(d).padStart(2,"0")}`;
                        const dow=getDOW(dt);
                        const isWkd=dow===0||dow===6;
                        const isToday=dt===TODAY_STR;
                        return(
                          <th key={d} style={{padding:"10px 6px",color:isToday?"#1A1A1A":isWkd?"#999":"#FFF",fontWeight:isToday?900:600,textAlign:"center",minWidth:230,background:isToday?"#F5C200":isWkd?"#2A2A2A":"#1A1A1A",borderLeft:"1px solid #333",fontSize:12,borderBottom:isToday?"3px solid #C47D00":"3px solid transparent"}}>
                            <div style={{fontSize:14,fontWeight:800}}>{isToday&&"📍 "}Dia {String(d).padStart(2,"0")}</div>
                            <div style={{fontSize:10,color:isToday?"#5A4400":"#AAA",fontWeight:600}}>{"Dom Seg Ter Qua Qui Sex Sáb".split(" ")[dow]}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {techsList.map((tech,ti)=>{
                      const color=techColor(tech);
                      const totalAtend=dias.reduce((acc,d)=>{const dt=`${ym}-${String(d).padStart(2,"0")}`;const key=`${tech}__${dt}`;return acc+(schedule[key]||[]).filter(s=>matchSt(s)&&matchTipo(s)).length;},0);
                      const totalConc=dias.reduce((acc,d)=>{const dt=`${ym}-${String(d).padStart(2,"0")}`;const key=`${tech}__${dt}`;return acc+(schedule[key]||[]).filter(s=>(s.status==="preventiva_concluida"||s.status==="corretiva_concluida")&&matchTipo(s)).length;},0);
                      return(
                        <tr key={tech} style={{background:ti%2===0?"#FAFAFA":"#FFF",verticalAlign:"top"}}>
                          <td style={{padding:"6px 10px",position:"sticky",left:0,background:ti%2===0?"#FAFAFA":"#FFF",zIndex:1,borderBottom:"1px solid #EEE",borderRight:`3px solid ${color}`}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                              <span style={{width:11,height:11,borderRadius:"50%",background:color,display:"inline-block",flexShrink:0,boxShadow:`0 0 0 3px ${color}22`}}/>
                              <span style={{fontWeight:800,fontSize:13,color:"#1A1A1A"}}>{tech}</span>
                            </div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              <span style={{fontSize:10,fontWeight:700,color:"#1565C0",background:"#EFF6FF",borderRadius:8,padding:"2px 7px"}}>{totalAtend} atend.</span>
                              {totalConc>0&&<span style={{fontSize:10,fontWeight:700,color:"#1A7A3C",background:"#F0FFF5",borderRadius:8,padding:"2px 7px"}}>{totalConc} concl.</span>}
                            </div>
                          </td>
                          {dias.map(d=>{
                            const dt=`${ym}-${String(d).padStart(2,"0")}`;
                            const key=`${tech}__${dt}`;
                            const slots=(schedule[key]||[]).filter(s=>matchSt(s)&&matchTipo(s));
                            const dow=getDOW(dt);
                            const isWkd=dow===0||dow===6;
                            const isToday=dt===TODAY_STR;
                            return(
                              <td key={d} style={{padding:6,verticalAlign:"top",borderLeft:"1px solid #EEE",borderBottom:"1px solid #EEE",background:isToday?"#FFFDE7":isWkd?"#F5F5F5":"transparent",minWidth:160}}>
                                {slots.map((s,si)=>{
                                  const st=escSt(s.status);
                                  const tipoC=getTipoCor(s.type);
                                  const horas=s.horasTrabalhadas||calcHoras(s.horaEntrada,s.horaSaida);
                                  const updateSlot=(changes)=>{
                                    const arr=[...(schedule[key]||[])];
                                    arr[si]={...arr[si],...changes,horasTrabalhadas:calcHoras(changes.horaEntrada||arr[si].horaEntrada,changes.horaSaida||arr[si].horaSaida)};
                                    saveSched(key,arr);
                                  };
                                  return(
                                    <div key={si} style={{background:"#FFF",border:`1.5px solid ${tipoC}33`,borderLeft:`4px solid ${tipoC}`,borderRadius:10,padding:"10px 12px",marginBottom:7,boxShadow:"0 2px 8px rgba(0,0,0,.08)",transition:"box-shadow .15s"}}>
                                      {/* Header: Empresa + botões */}
                                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                                        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,marginRight:4}}>
                                          <span style={{fontSize:7,fontWeight:800,color:tipoC,background:tipoC+"15",borderRadius:20,padding:"2px 8px",whiteSpace:"nowrap"}}>{(s.type||"preventivo")==="corretivo"?"🔧 Corretivo":"🔵 Preventivo"}</span>
                                        </div>
                                        {!isReadOnlyAgenda(user)&&(<div style={{display:"flex",gap:2,flexShrink:0}}>
                                          <button onClick={()=>{setEditSlot({key,si,slot:s,tipo:"tecnico"});setEditSlotForm({...s});}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",fontSize:12,padding:"3px 6px"}}>✏️</button>
                                          <button onClick={()=>{if(window.confirm("Remover?")){const arr=(schedule[key]||[]).filter((_,j)=>j!==si);saveSched(key,arr);}}} title="Remover" style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",fontSize:11,fontWeight:700,padding:"3px 6px"}}>✕</button>
                                        </div>)}
                                      </div>
                                      <div style={{fontWeight:700,fontSize:10,color:"#1A1A1A",marginBottom:2,lineHeight:1.2,wordBreak:"break-word"}}>{s.client}</div>
                                      {/* Patrimônio · Cidade · Horímetro chips */}
                                      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>
                                        {s.patrimonio&&<span style={{fontSize:8,background:"#F5F5F5",color:"#555",borderRadius:8,padding:"2px 7px",fontWeight:600}}>🏷️ {s.patrimonio}</span>}
                                        {s.cidade&&<span style={{fontSize:8,background:"#EFF6FF",color:"#1565C0",borderRadius:8,padding:"2px 7px",fontWeight:600}}
                                         >📍 {s.cidade}</span>}
                                        {s.horimetro&&<span style={{fontSize:8,background:"#FFFBF0",color:"#C47D00",borderRadius:8,padding:"2px 7px",fontWeight:600}}>⏱ {s.horimetro}</span>}
                                         {<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>{["Mecânica","Elétrica","Peq.Reparos","Bateria","Carregador","Hidráulica","Outros"].map(sv=>{const sel=(s.servicos||[]).includes(sv==="Peq.Reparos"?"Pequenos Reparos":sv);const svFull=sv==="Peq.Reparos"?"Pequenos Reparos":sv;return(<button key={sv} onClick={()=>{const cur=s.servicos||[];const nv=sel?cur.filter(x=>x!==svFull):[...cur,svFull];updateSched(key,schedule[key].map(x=>x===s?{...x,servicos:nv}:x));}} style={{fontSize:8,padding:"2px 7px",borderRadius:12,border:sel?"1.5px solid #10B981":"1px solid #E2E8F0",background:sel?"#F0FDF4":"#FFF",color:sel?"#059669":"#94A3B8",fontWeight:sel?700:500,cursor:"pointer"}}>{sv}</button>);})}</div>}
                                         <div style={{marginTop:3}}><input type="text" value={s.obsServico||""} onChange={e=>{const nv=e.target.value;updateSched(key,schedule[key].map(x=>x===s?{...x,obsServico:nv}:x));}} placeholder="📝 Obs serviço..." style={{fontSize:10,padding:"3px 7px",borderRadius:8,border:"1px solid #E2E8F0",background:"#FFFBEB",color:"#92400E",width:"100%",boxSizing:"border-box"}}/></div>
                                      </div>
                                      {/* Relatório */}
                                      <input
                                        type="text"
                                        defaultValue={s.relatorio||""}
                                        onBlur={e=>updateSlot({relatorio:e.target.value})}
                                        placeholder="Nº Relatório"
                                        disabled={isReadOnlyAgenda(user)}
                                        style={{width:"100%",fontSize:10,padding:"4px 6px",border:"1px solid #E0E0E0",borderRadius:8,marginBottom:5,boxSizing:"border-box",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FAFAFA",fontWeight:600,color:"#1565C0"}}
                                      />
                                      <input
                                        type="text"
                                        defaultValue={s.obs||""}
                                        onBlur={e=>updateSlot({obs:e.target.value})}
                                        placeholder="📝 Observações..."
                                        disabled={isReadOnlyAgenda(user)}
                                        style={{width:"100%",fontSize:10,padding:"4px 6px",border:"1px solid #FFE8A0",borderRadius:8,marginBottom:5,boxSizing:"border-box",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFFBF0"}}
                                      />
                                      {/* Entrada / Saída / Soma */}
                                      <div style={{display:"flex",gap:3,alignItems:"center",marginBottom:2}}>
                                        <input type="time" defaultValue={s.horaEntrada||""} onBlur={e=>updateSlot({horaEntrada:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"3px 5px",border:"1.5px solid #E0E0E0",borderRadius:8,flex:1,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FAFAFA"}}/>
                                        <span style={{fontSize:10,color:"#AAA"}}>→</span>
                                        <input type="time" defaultValue={s.horaSaida||""} onBlur={e=>updateSlot({horaSaida:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"3px 5px",border:"1.5px solid #E0E0E0",borderRadius:8,flex:1,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FAFAFA"}}/>
                                        {horas&&<span style={{fontSize:9,fontWeight:800,color:"#1A7A3C",background:"#F0FFF5",padding:"4px 7px",borderRadius:8,whiteSpace:"nowrap",border:"1px solid #C8E8D0"}}>{horas}</span>}
                                      </div>
                                      {/* Data */}
                                      <input type="date" defaultValue={dt} onBlur={e=>{
                                        if(isReadOnlyAgenda(user))return;
                                        if(e.target.value&&e.target.value!==dt){
                                          const newKey=`${tech}__${e.target.value}`;
                                          const oldArr=(schedule[key]||[]).filter((_,j)=>j!==si);
                                          saveSched(key,oldArr);
                                          saveSched(newKey,[...(schedule[newKey]||[]),s]);
                                        }
                                      }} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"3px 5px",border:"1.5px solid #E0E0E0",borderRadius:8,width:"100%",marginBottom:5,boxSizing:"border-box",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FAFAFA"}}/>
                                      {/* Status */}
                                      <select value={s.status||"agendada"} onChange={e=>updateSlot({status:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:11,padding:"4px 5px",border:"none",borderRadius:20,width:"100%",fontWeight:700,color:st.color,background:st.bg,cursor:isReadOnlyAgenda(user)?"default":"pointer"}}>
                                        {ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}
                                      </select>
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{fontWeight:900,fontSize:24,letterSpacing:-.5,marginBottom:24,color:"#1E293B"}}>📊 Dashboard de Atendimentos</div>

            {/* ── FILTRO + GRÁFICOS ── */}
            {(()=>{
              const chartTitle={fontSize:11,fontWeight:700,color:"#888",marginBottom:12};
              const inRange=d=>{ if(dashFrom&&(!d.date||d.date<dashFrom))return false; if(dashTo&&(!d.date||d.date>dashTo))return false; return true; };
              const dashReports=agendaAtendimentos.filter(d=>(dashRegion==="todas"||d.region===dashRegion)&&(dashTech==="todos"||d.tecnico===dashTech)&&inRange(d));
              const prev=dashReports.filter(r=>r.type==="preventivo").length;
              const corr=dashReports.filter(r=>r.type==="corretivo").length;
              const totalPC=prev+corr;
              const pct=n=>totalPC?Math.round(n/totalPC*100):0;
              const parseMin=h=>{if(!h)return 0;const m=String(h).match(/^(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
              const regList=[["metropolitana","Metropolitana BH"],["roca","Roca"],["centroOeste","Centro-Oeste"]];
              const regPrev=regList.map(([k])=>dashReports.filter(r=>r.region===k&&r.type==="preventivo").length);
              const regCorr=regList.map(([k])=>dashReports.filter(r=>r.region===k&&r.type==="corretivo").length);
              const techsWith=ALL_TECHS.filter(t=>dashReports.some(r=>r.tecnico===t));
              const techCounts=techsWith.map(t=>dashReports.filter(r=>r.tecnico===t).length);
              const techHours=techsWith.map(t=>+(dashReports.filter(r=>r.tecnico===t).reduce((a,r)=>a+parseMin(r.horasTrabalhadas),0)/60).toFixed(1));
              const BLU="#2563EB",RED="#EF4444",YEL="#F5C200",ORG="#EA580C",GRN="#16A34A",PUR="#7C3AED",TEA="#0D9488";
              return(
                <>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#888",}}>Filtro</span>
                    <select value={dashRegion} onChange={e=>setDashRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option>{regList.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
                    <select value={dashTech} onChange={e=>setDashTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={dashFrom} onChange={e=>setDashFrom(e.target.value)} style={{fontSize:12}}/></div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={dashTo} onChange={e=>setDashTo(e.target.value)} style={{fontSize:12}}/></div>
                    {(dashRegion!=="todas"||dashFrom||dashTo||dashTech!=="todos")&&<BtnG onClick={()=>{setDashRegion("todas");setDashFrom("");setDashTo("");setDashTech("todos");}}>✕ Limpar</BtnG>}
                    <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{dashReports.length} atendimento(s) no filtro</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:24}}>
                    <div className="card" style={{padding:"8px 12px"}}>
                      <div style={chartTitle}>Preventivas × Corretivas (qtd e %)</div>
                      <ChartCanvas type="doughnut" height={230}
                        data={{labels:["Preventivas","Corretivas"],datasets:[{data:[prev,corr],backgroundColor:[BLU,RED],borderWidth:2,borderColor:"#FFF",hoverOffset:6}]}}
                        options={{cutout:"68%",maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} (${pct(c.raw)}%)`}}}}}/>
                      <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:10,fontSize:13}}>
                        <span style={{color:BLU,fontWeight:700}}>{prev} prev · {pct(prev)}%</span>
                        <span style={{color:RED,fontWeight:700}}>{corr} corr · {pct(corr)}%</span>
                      </div>
                    </div>
                    <div className="card" style={{padding:"8px 12px"}}>
                      <div style={chartTitle}>Por região</div>
                      <ChartCanvas type="bar" height={230}
                        data={{labels:regList.map(([,l])=>l),datasets:[{label:"Preventivas",data:regPrev,backgroundColor:BLU,borderRadius:8},{label:"Corretivas",data:regCorr,backgroundColor:RED,borderRadius:8}]}}
                        options={{maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}}/>
                    </div>
                    <div className="card" style={{padding:"8px 12px"}}>
                      <div style={chartTitle}>Atendimentos por técnico</div>
                      {techsWith.length?<ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                        data={{labels:techsWith,datasets:[{label:"Atendimentos",data:techCounts,backgroundColor:YEL,borderColor:"#C9A200",borderWidth:1,borderRadius:8}]}}
                        options={{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#1E293B",titleFont:{size:12,weight:"bold"},bodyFont:{size:11},padding:10,cornerRadius:8}},scales:{x:{beginAtZero:true,ticks:{precision:0}}}}}/>:<div style={{color:"#CCC",fontSize:13,padding:"30px 0",textAlign:"center"}}>Sem dados no filtro.</div>}
                    </div>
                    <div className="card" style={{padding:"8px 12px"}}>
                      <div style={chartTitle}>Horas trabalhadas por técnico</div>
                      {techsWith.length?<ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                        data={{labels:techsWith,datasets:[{label:"Horas",data:techHours,backgroundColor:ORG,borderRadius:8}]}}
                        options={{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw} h`}}},scales:{x:{beginAtZero:true}}}}/>:<div style={{color:"#CCC",fontSize:13,padding:"30px 0",textAlign:"center"}}>Sem dados no filtro.</div>}
                    </div>
                  </div>
                  {/* Gráfico Tipo de Serviço x Técnico */}
                  {techsWith.length>0&&(()=>{
                    const tipos=[...new Set(dashReports.map(r=>r.type).filter(Boolean))];
                    const TIPO_COLORS={"preventivo":"#1A7A3C","corretivo":"#C62828","outros":"#E67E00"};
                    const chartServTechData={
                      labels:techsWith,
                      datasets:tipos.map(tipo=>({
                        label:tipo==="preventivo"?"Preventiva":tipo==="corretivo"?"Corretiva":"Outro",
                        data:techsWith.map(t=>dashReports.filter(r=>r.tecnico===t&&r.type===tipo).length),
                        backgroundColor:TIPO_COLORS[tipo]||"#888",
                        borderRadius:8,borderSkipped:false,
                      }))
                    };
                    return(
                      <div className="card" style={{padding:20,marginBottom:16}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:12}}>Tipo de Serviço por Técnico</div>
                        <ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                          data={chartServTechData}
                          options={{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:true,position:"top",labels:{font:{size:10},boxWidth:12}}},scales:{x:{stacked:true,beginAtZero:true,ticks:{precision:0}},y:{stacked:true,grid:{display:false}}}}}/>
                      </div>
                    );
                  })()}

            {/* ── Serviços por Técnico ── */}
            {(()=>{
              const allAt=Object.entries(schedule).flatMap(([k,v])=>(v||[]).map(s=>({...s,tech:k.split("__")[0]})));
              const SVC=["Mecânica","Elétrica","Pequenos Reparos","Bateria","Carregador","Hidráulica","Outros"];
              const SCOL=["#3B82F6","#EF4444","#F59E0B","#10B981","#0EA5E9","#8B5CF6","#EC4899"];
              const tN=[...new Set(allAt.map(a=>a.tech))].sort();
              const comServ=allAt.filter(a=>a.servicos&&a.servicos.length>0).length;
              const totalH=allAt.reduce((a2,s2)=>a2+(parseFloat(s2.horas)||0),0);
              const sTQ=SVC.map(sv=>allAt.filter(s=>s.servicos&&s.servicos.includes(sv)).length);
              const sTH=SVC.map(sv=>allAt.filter(s=>s.servicos&&s.servicos.includes(sv)).reduce((a2,s2)=>a2+(parseFloat(s2.horas)||0),0));
              const qDS={labels:tN,datasets:SVC.map((sv,si)=>({label:sv,data:tN.map(t=>allAt.filter(s=>s.tech===t&&s.servicos&&s.servicos.includes(sv)).length),backgroundColor:SCOL[si],borderRadius:6}))};
              const hDS={labels:tN,datasets:SVC.map((sv,si)=>({label:sv,data:tN.map(t=>allAt.filter(s=>s.tech===t&&s.servicos&&s.servicos.includes(sv)).reduce((a2,s2)=>a2+(parseFloat(s2.horas)||0),0)),backgroundColor:SCOL[si],borderRadius:6}))};
              const sDS2={labels:SVC.map(s=>s.length>10?s.slice(0,10)+"…":s),datasets:[{label:"Qtd Atendimentos",data:sTQ,backgroundColor:"#3B82F6",borderRadius:8},{label:"Horas",data:sTH,backgroundColor:"rgba(59,130,246,0.2)",borderRadius:8}]};
              const stOp={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11,weight:"600"},boxWidth:12,padding:12,usePointStyle:true}},tooltip:{backgroundColor:"#1E293B",titleFont:{size:12},bodyFont:{size:11},padding:10,cornerRadius:8}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}},y:{stacked:true,beginAtZero:true,ticks:{precision:0},grid:{color:"rgba(0,0,0,.04)"}}}};
              const bOp={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11,weight:"600"},boxWidth:12,padding:12,usePointStyle:true}},tooltip:{backgroundColor:"#1E293B",padding:10,cornerRadius:8}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"rgba(0,0,0,.04)"}}}};
              const pSvc={};allAt.forEach(a=>{if(!a.patrimonio||!a.servicos)return;const p2=a.patrimonio;if(!pSvc[p2])pSvc[p2]={total:0,horas:0,svcs:{},obs:[]};pSvc[p2].total++;pSvc[p2].horas+=(parseFloat(a.horas)||0);a.servicos.forEach(sv=>{pSvc[p2].svcs[sv]=(pSvc[p2].svcs[sv]||0)+1;});if(a.obsServico)pSvc[p2].obs.push(a.obsServico);});
              const pList=Object.entries(pSvc).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
              return(<div style={{marginTop:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><div style={{width:4,height:24,background:"#3B82F6",borderRadius:2}}/><div style={{fontSize:18,fontWeight:900,color:"#1E293B",letterSpacing:-.3}}>Serviços Técnicos</div></div>
                <div style={{display:"grid",gridTemplateColumns:"2fr repeat(3,1fr)",gap:12,marginBottom:20}}>
                  <div style={{background:"linear-gradient(135deg,#1E293B,#0F172A)",borderRadius:16,padding:"20px 24px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:8}}>Com Serviço Registrado</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:40,fontWeight:900,color:"#F5C200"}}>{comServ}</span><span style={{fontSize:14,color:"#94A3B8"}}>de {allAt.length}</span></div>
                    <div style={{fontSize:12,color:"#64748B",marginTop:6}}>{totalH.toFixed(0)}h trabalhadas</div>
                  </div>
                  {[[SVC[0],sTQ[0],sTH[0],SCOL[0]],[SVC[1],sTQ[1],sTH[1],SCOL[1]],[SVC[2],sTQ[2],sTH[2],SCOL[2]]].map(([n,q,h,c],i)=><div key={i} style={{background:"#FFF",borderRadius:14,padding:"8px 12px",borderLeft:`4px solid ${c}`,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:8}}>{n}</div>
                    <div style={{fontSize:19,fontWeight:800,color:"#1E293B"}}>{q}</div>
                    <div style={{fontSize:11,color:"#64748B",marginTop:4}}>{h.toFixed(1)}h</div>
                  </div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                  {[[SVC[3],sTQ[3],sTH[3],SCOL[3]],[SVC[4],sTQ[4],sTH[4],SCOL[4]],[SVC[5],sTQ[5],sTH[5],SCOL[5]],[SVC[6],sTQ[6],sTH[6],SCOL[6]]].map(([n,q,h,c],i)=><div key={i} style={{background:"#FFF",borderRadius:12,padding:"14px 16px",borderLeft:`4px solid ${c}`,boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:6}}>{n}</div>
                    <div style={{fontSize:16,fontWeight:800,color:"#1E293B"}}>{q} <span style={{fontSize:11,color:"#94A3B8",fontWeight:600}}>{h.toFixed(1)}h</span></div>
                  </div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                  <div style={{background:"#FFF",borderRadius:16,padding:"24px 28px",boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:16}}>Qtd de Serviços por Técnico</div>
                    {tN.length===0?<div style={{textAlign:"center",color:"#CBD5E1",padding:40}}>Sem dados</div>:<ChartCanvas type="bar" data={qDS} options={stOp} height={280}/>}
                  </div>
                  <div style={{background:"#FFF",borderRadius:16,padding:"24px 28px",boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:16}}>Horas por Serviço por Técnico</div>
                    {tN.length===0?<div style={{textAlign:"center",color:"#CBD5E1",padding:40}}>Sem dados</div>:<ChartCanvas type="bar" data={hDS} options={stOp} height={280}/>}
                  </div>
                </div>
                <div style={{background:"#FFF",borderRadius:16,padding:"24px 28px",boxShadow:"0 4px 20px rgba(0,0,0,.06)",marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:16}}>Serviços Realizados — Quantidade e Horas</div>
                  <ChartCanvas type="bar" data={sDS2} options={bOp} height={260}/>
                </div>
                {pList.length>0&&<div style={{background:"#FFF",borderRadius:16,padding:"24px 28px",boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:16}}>Serviços por Patrimônio</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                    {pList.map(([pat,d2],pi)=><div key={pi} style={{background:"#F8FAFC",borderRadius:12,padding:"16px",borderLeft:`4px solid ${SCOL[pi%7]}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{fontSize:14,fontWeight:800,color:"#1E293B"}}>PAT {pat}</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#3B82F6"}}>{d2.total} atend · {d2.horas.toFixed(1)}h</span>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(d2.svcs).map(([sv,c2],si)=><span key={si} style={{fontSize:10,background:"#EFF6FF",color:"#2563EB",borderRadius:10,padding:"3px 8px",fontWeight:700}}>{sv}: {c2}</span>)}</div>
                      {d2.obs.length>0&&<div style={{fontSize:11,color:"#64748B",fontStyle:"italic",marginTop:6}}>{d2.obs.slice(0,2).join(" · ")}</div>}
                    </div>)}
                  </div>
                </div>}
              </div>);
            })()}

                  <div style={{fontSize:14,fontWeight:800,color:"#1E293B",margin:"4px 0 14px"}}>Visão geral (todos os atendimentos)</div>
                </>
              );
            })()}

            

            {/* Stats gerais */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {l:"Total Atendimentos",v:agendaAtendimentos.length,c:"#1A1A1A"},
                {l:"Preventivos",v:agendaAtendimentos.filter(r=>r.type==="preventivo").length,c:"#1565C0"},
                {l:"Corretivos",v:agendaAtendimentos.filter(r=>r.type==="corretivo").length,c:"#C62828"},
                {l:"Emp. em Atraso",v:empAlerta,c:"#E67E00"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#FFF",borderRadius:14,padding:"18px 22px",borderLeft:`4px solid ${s.c}`,boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
                  <div style={{fontSize:10,color:"#AAA",fontWeight:700,marginBottom:8}}>{s.l}</div>
                  <div style={{fontSize:36,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Horas totais do mês */}
            {(()=>{
              const parseMin=h=>{if(!h)return 0;const m=String(h).match(/^(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
              const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
              const mesReps=agendaAtendimentos.filter(r=>r.date&&r.date.startsWith(mesAtual));
              const totalMin=mesReps.reduce((a,r)=>a+parseMin(r.horasTrabalhadas),0);
              const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"0h00";
              return(
                <div style={{background:"#FFF",borderRadius:16,padding:"20px 24px",marginBottom:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)",display:"flex",gap:32,alignItems:"center",flexWrap:"wrap",borderTop:"3px solid #C47D00"}}>
                  <div style={{fontSize:11,color:"#AAA",fontWeight:700,}}>⏱ Resumo do mês atual</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:38,fontWeight:900,color:"#1A1A1A",lineHeight:1}}>{fmtMin(totalMin)}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>horas trabalhadas</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:38,fontWeight:900,color:"#2563EB",lineHeight:1}}>{mesReps.filter(r=>r.type==="preventivo").length}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>preventivos</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:38,fontWeight:900,color:"#EF4444",lineHeight:1}}>{mesReps.filter(r=>r.type==="corretivo").length}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>corretivos</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:32,fontWeight:700,color:"#1A1A1A",lineHeight:1}}>{mesReps.length}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>total no mês</div>
                  </div>
                </div>
              );
            })()}

            {/* Cards por técnico */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {ALL_TECHS.map(tech=>{
                const parseMin=h=>{if(!h)return 0;const m=String(h).match(/^(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
                const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"—";
                const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
                const techReps=agendaAtendimentos.filter(r=>r.tecnico===tech&&r.date&&r.date.startsWith(mesAtual));
                const totalMin=techReps.reduce((a,r)=>a+parseMin(r.horasTrabalhadas),0);
                const prevs=techReps.filter(r=>r.type==="preventivo").length;
                const corrs=techReps.filter(r=>r.type==="corretivo").length;
                const color=techColor(tech);
                return(
                  <div key={tech} className="card" style={{borderTop:`4px solid ${color}`,overflow:"hidden",transition:"transform .2s",cursor:"default"}}>
                    <div style={{padding:"6px 10px",borderBottom:"1px solid #F4F4F4",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:color+"18",border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color,flexShrink:0}}>{tech.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{tech}</div>
                        <div style={{fontSize:11,color:"#AAA"}}>{techReps.length} no mês</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:700,color:"#C47D00"}}>{fmtMin(totalMin)}</div>
                        <div style={{fontSize:9,color:"#AAA"}}>horas</div>
                      </div>
                    </div>
                    <div style={{padding:"10px 16px",display:"flex",gap:16}}>
                      <div style={{flex:1,textAlign:"center",padding:"8px 0",background:"#F0F4FF",borderRadius:8}}>
                        <div style={{fontSize:20,fontWeight:700,color:"#3B82F6"}}>{prevs}</div>
                        <div style={{fontSize:9,color:"#3B82F6",fontWeight:600,}}>Prev.</div>
                      </div>
                      <div style={{width:8}}/>
                      <div style={{flex:1,textAlign:"center",padding:"8px 0",background:"#FFF0F0",borderRadius:8}}>
                        <div style={{fontSize:20,fontWeight:700,color:"#F43F5E"}}>{corrs}</div>
                        <div style={{fontSize:9,color:"#F43F5E",fontWeight:600,}}>Corret.</div>
                      </div>
                    </div>
                    {techReps.length>0&&<div style={{padding:"0 16px 12px"}}>
                      {techReps.slice(0,2).map((r,i)=>(
                        <div key={i} style={{fontSize:11,color:"#555",padding:"3px 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          <span style={{fontSize:9,fontWeight:700,padding:"1px 4px",borderRadius:3,background:tipoCfg(r.type).bg,color:tipoCfg(r.type).color,marginRight:4}}>{tipoCfg(r.type).l}</span>
                          {r.empresa}
                        </div>
                      ))}
                    </div>}
                  </div>
                );
              })}
            
            </div>
          </div>
        )}



        {/* ── UBER ── */}
        {tab==="uber"&&(()=>{
          const lista=(uberPedidos||[]).filter(p=>p&&(showArqUber||!p.arquivado));
          const pend=lista.filter(p=>p.status==="pendente"||!p.status).length;
          const conc=lista.filter(p=>p.status==="concluido").length;
          const totalVal=lista.reduce((acc,p)=>{const v=parseFloat((p.valor||"0").replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          const applyFilter=(r,d=r.data||"")=>{
            if(uberSearch){const q=uberSearch.toLowerCase();if(!((r.solicitante||"").toLowerCase().includes(q)||(r.empresa||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.relatorio||"").toLowerCase().includes(q)||(r.motivo||"").toLowerCase().includes(q)||(r.endereco||"").toLowerCase().includes(q)))return false;}
            if(uberFrom&&d<uberFrom)return false;
            if(uberTo&&d>uberTo)return false;
            if(uberMes&&!d.slice(5,7).startsWith(uberMes))return false;
            if(uberAno&&!d.startsWith(uberAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>🚗 Uber / Transporte</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} pedido(s) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqUber(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqUber?"#1A1A1A":"#FFF",color:showArqUber?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqUber?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"uber_grupomov",[{key:"data",label:"Data"},{key:"solicitante",label:"Solicitante"},{key:"motivo",label:"Motivo"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"relatorio",label:"Relatório"},{key:"endereco",label:"Endereço"},{key:"valor",label:"Valor"},{key:"status",label:"Status"}])}/>
                <BtnY onClick={()=>{setUberEdit({data:TODAY_STR,solicitante:"",empresa:"",patrimonio:"",relatorio:"",motivo:"",valor:"",endereco:"",obs:""});setUberModal(true);}}>+ Novo Pedido</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Total R$",v:`R$ ${totalVal.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,c:"#1565C0",bg:"#EFF6FF",i:"💵"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:i===3?18:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={uberSearch} onChange={e=>setUberSearch(e.target.value)} placeholder="Buscar solicitante, empresa, motivo..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={uberFrom} onChange={e=>setUberFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={uberTo} onChange={e=>setUberTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={uberMes} onChange={e=>setUberMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={uberAno} onChange={e=>setUberAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(uberSearch||uberFrom||uberTo||uberMes||uberAno)&&<button onClick={()=>{setUberSearch('');setUberFrom('');setUberTo('');setUberMes('');setUberAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>🚗</div><div style={{fontSize:15,fontWeight:600}}>Nenhum pedido</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(p=>{
                  const ok=p.status==="concluido";
                  return(<div key={p.id} className="card" style={{borderTop:`4px solid ${ok?"#1A7A3C":"#E67E00"}`,padding:0,overflow:"hidden",opacity:p.arquivado?0.55:1}}>
                    <div style={{padding:"7px 10px",background:ok?"#F0FFF5":"#FFF8F0",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <select value={p.status||"pendente"} onChange={e=>updateUber(p.id,{status:e.target.value})} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":"#E67E00",background:"#FFF",cursor:"pointer"}}>
                        <option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option><option value="cancelado">❌ Cancelado</option>
                      </select>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setUberEdit(p);setUberModal(true);}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateUber(p.id,{arquivado:!p.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{p.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delUber(p.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:14,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{p.solicitante||<span style={{color:"#CCC"}}>Solicitante</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {p.data||"—"} · <b>{p.empresa||"—"}</b></div></div>
                        <div style={{fontSize:18,fontWeight:900,color:"#1A7A3C"}}>{p.valor?`R$ ${p.valor}`:"—"}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Motivo</div><input type="text" value={p.motivo||""} onChange={e=>updateUber(p.id,{motivo:e.target.value})} placeholder="Motivo" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>PAT · Relatório</div><div style={{fontSize:11,fontWeight:700}}>{p.patrimonio||"—"} {p.relatorio&&<span style={{color:"#1565C0"}}>· {p.relatorio}</span>}</div></div>
                      </div>
                      {p.endereco&&<div style={{fontSize:11,color:"#555",background:"#F8F9FA",borderRadius:8,padding:"6px 10px"}}>📍 {p.endereco}</div>}
                      {p.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {p.obs}</div>}
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{p.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── FINANCEIRO ── */}
        {tab==="financeiro"&&(()=>{
          const SOL={combustivel:{l:"⛽ Combustível",c:"#E67E00",bg:"#FFF8F0"},alimentacao:{l:"🍽️ Alimentação",c:"#1A7A3C",bg:"#F0FFF5"},viagem:{l:"✈️ Viagem",c:"#1565C0",bg:"#EFF6FF"},outros:{l:"📦 Outros",c:"#888",bg:"#F5F5F5"}};
          const lista=(financeiro||[]).filter(f=>f&&(showArqFin||!f.arquivado));
          const pend=lista.filter(f=>f.situacao==="pendente"||!f.situacao).length;
          const pago=lista.filter(f=>f.situacao==="pago").length;
          const totalVal=lista.reduce((acc,f)=>{const v=parseFloat((f.valor||"0").replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          const semAcerto=lista.filter(f=>f.acerto==="nao"||!f.acerto).length;
                    const applyFilter=(r,d=r.data||"")=>{
            if(finSearch){const q=finSearch.toLowerCase();if(!((r.tecnico||"").toLowerCase().includes(q)||(r.ticket||"").toLowerCase().includes(q)||(r.atendimento||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.valor||"").toLowerCase().includes(q)||(r.ticketReembolso||"").toLowerCase().includes(q)))return false;}
            if(finFrom&&d<finFrom)return false;
            if(finTo&&d>finTo)return false;
            if(finMes&&!d.slice(5,7).startsWith(finMes))return false;
            if(finAno&&!d.startsWith(finAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>💳 Financeiro</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} lançamento(s) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqFin(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqFin?"#1A1A1A":"#FFF",color:showArqFin?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqFin?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"financeiro_grupomov",[{key:"data",label:"Data"},{key:"ticket",label:"Ticket"},{key:"tecnico",label:"Técnico"},{key:"solicitacao",label:"Solicitação"},{key:"atendimento",label:"Atendimento"},{key:"patrimonio",label:"PAT"},{key:"valor",label:"Valor"},{key:"situacao",label:"Situação"},{key:"acerto",label:"Acerto"},{key:"dataAcerto",label:"Dt Acerto"},{key:"reembolso",label:"Reembolso"},{key:"valorReembolso",label:"Vl Reembolso"}])}/>
                <BtnY onClick={()=>{setFinEdit({data:TODAY_STR,ticket:"",solicitacao:"combustivel",tecnico:ALL_TECHS[0],atendimento:"",patrimonio:"",valor:"",situacao:"pendente",acerto:"nao",obs:""});setFinModalOpen(true);}}>+ Novo Lançamento</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Pagos",v:pago,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Sem Acerto",v:semAcerto,c:"#E67E00",bg:"#FFF8F0",i:"⚠️"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:19,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {totalVal>0&&<div className="card" style={{padding:"12px 20px",marginBottom:16,background:"linear-gradient(90deg,#1565C0,#1976D2)",color:"#FFF",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:22}}>💵</div><div><div style={{fontSize:10,fontWeight:700,opacity:.8,textTransform:"uppercase"}}>Total em Lançamentos</div><div style={{fontSize:20,fontWeight:900}}>R$ {totalVal.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div></div>
            </div>}
                        <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={finSearch} onChange={e=>setFinSearch(e.target.value)} placeholder="Buscar técnico, ticket, atendimento, PAT..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={finFrom} onChange={e=>setFinFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={finTo} onChange={e=>setFinTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={finMes} onChange={e=>setFinMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={finAno} onChange={e=>setFinAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(finSearch||finFrom||finTo||finMes||finAno)&&<button onClick={()=>{setFinSearch('');setFinFrom('');setFinTo('');setFinMes('');setFinAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>💳</div><div style={{fontSize:15,fontWeight:600}}>Nenhum lançamento</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(f=>{
                  const sol=SOL[f.solicitacao||"outros"]||SOL.outros;
                  const pago=f.situacao==="pago";
                  return(<div key={f.id} className="card" style={{borderTop:`4px solid ${sol.c}`,padding:0,overflow:"hidden",opacity:f.arquivado?0.55:1}}>
                    <div style={{padding:"7px 10px",background:sol.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:sol.c,background:"#FFF",border:`1px solid ${sol.c}33`,borderRadius:20,padding:"2px 10px"}}>{sol.l}</span>
                        <select value={f.situacao||"pendente"} onChange={e=>updateFin(f.id,{situacao:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:pago?"#1A7A3C":"#C62828",background:pago?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option value="pago">✅ Pago</option><option value="pendente">⏳ Pendente</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setFinEdit(f);setFinModalOpen(true);}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateFin(f.id,{arquivado:!f.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{f.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delFin(f.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{f.tecnico||"—"}</div><div style={{fontSize:11,color:"#888"}}>📅 {f.data||"—"} · Ticket: <b style={{color:"#1565C0"}}>{f.ticket||"—"}</b></div></div>
                        <div style={{fontSize:18,fontWeight:900,color:"#1A7A3C"}}>{f.valor?`R$ ${f.valor}`:"R$ —"}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Atendimento / PAT</div><input type="text" value={f.atendimento||""} onChange={e=>updateFin(f.id,{atendimento:e.target.value})} placeholder="Atendimento" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Acerto</div>
                          <select value={f.acerto||"nao"} onChange={e=>updateFin(f.id,{acerto:e.target.value})} style={{fontSize:11,fontWeight:700,color:f.acerto==="sim"?"#1A7A3C":"#C62828",border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}><option value="sim">✅ Sim</option><option value="nao">❌ Não</option></select>
                        </div>
                        <div style={{background:"#EFF6FF",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#1565C0",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Ticket Acerto</div><input type="text" value={f.ticketAcerto||""} onChange={e=>updateFin(f.id,{ticketAcerto:e.target.value})} placeholder="Nº ticket" style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F3E5F5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#6A1B9A",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Reembolso</div>
                          <select value={f.reembolso||"nao"} onChange={e=>updateFin(f.id,{reembolso:e.target.value})} style={{fontSize:11,fontWeight:700,color:f.reembolso==="sim"?"#6A1B9A":"#888",border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}><option value="sim">✅ Sim</option><option value="nao">❌ Não</option></select>
                        </div>
                        {f.reembolso==="sim"&&<>
                          <div style={{background:"#F3E5F5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#6A1B9A",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Valor Reembolso</div><input type="text" value={f.valorReembolso||""} onChange={e=>updateFin(f.id,{valorReembolso:e.target.value})} placeholder="R$ 0,00" style={{width:"100%",fontSize:12,fontWeight:800,color:"#6A1B9A",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                          <div style={{background:"#F3E5F5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#6A1B9A",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Data Reembolso</div><input type="date" value={f.dataReembolso||""} onChange={e=>updateFin(f.id,{dataReembolso:e.target.value})} style={{width:"100%",fontSize:11,fontWeight:600,color:"#6A1B9A",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                          <div style={{background:"#EFF6FF",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#1565C0",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Ticket Reembolso</div><input type="text" value={f.ticketReembolso||""} onChange={e=>updateFin(f.id,{ticketReembolso:e.target.value})} placeholder="Nº ticket" style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        </>}
                      </div>
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{f.registradoPor||""} · {f.data||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── PENDÊNCIAS FROTA ── */}
        {tab==="pendencias_frota"&&(()=>{
          const TIPO={bateria:{l:"🔋 Bateria",c:"#F5C200",bg:"#FFFBF0"},carregador:{l:"🔌 Carregador",c:"#1565C0",bg:"#EFF6FF"},estrado:{l:"🟫 Estrado",c:"#8B5E3C",bg:"#FDF5EC"},maquina:{l:"🏗️ Máquina",c:"#546E7A",bg:"#ECEFF1"}};
          const lista=(frota||[]).filter(r=>r&&(showArqFro||!r.arquivado));
          const pend=lista.filter(r=>r.resolvido!=="sim").length;
          const resolvidos=lista.filter(r=>r.resolvido==="sim").length;
                    const applyFilter=(r,d=r.dataEnvio||"")=>{
            if(froSearch){const q=froSearch.toLowerCase();if(!((r.empresa||"").toLowerCase().includes(q)||(r.pat||"").toLowerCase().includes(q)||(r.tecnico||"").toLowerCase().includes(q)||(r.rel||"").toLowerCase().includes(q)||(r.novoPat||"").toLowerCase().includes(q)||(r.relEntrega||"").toLowerCase().includes(q)||(r.nf||"").toLowerCase().includes(q)))return false;}
            if(froFrom&&d<froFrom)return false;
            if(froTo&&d>froTo)return false;
            if(froMes&&!d.slice(5,7).startsWith(froMes))return false;
            if(froAno&&!d.startsWith(froAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>🚜 Pendências Frota</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} item(ns) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqFro(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqFro?"#1A1A1A":"#FFF",color:showArqFro?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqFro?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"pendencias_frota",[{key:"dataEnvio",label:"Dt Envio"},{key:"rel",label:"REL"},{key:"empresa",label:"Empresa"},{key:"tecnico",label:"Técnico"},{key:"pat",label:"PAT"},{key:"patTipo",label:"Tipo"},{key:"resolvido",label:"Resolvido"},{key:"novoPat",label:"Novo PAT"},{key:"nf",label:"NF"},{key:"relEntrega",label:"Rel Entrega"}])}/>
                <BtnY onClick={()=>{setFroEdit({dataEnvio:TODAY_STR,rel:"",empresa:"",tecnico:ALL_TECHS[0],pat:"",patTipo:"bateria",resolvido:"nao",novoPat:"",nf:"",relEntrega:""});setFroModal(true);}}>+ Nova Pendência</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Resolvidos",v:resolvidos,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"8px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
                        <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={froSearch} onChange={e=>setFroSearch(e.target.value)} placeholder="Buscar empresa, PAT, técnico, relatório..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={froFrom} onChange={e=>setFroFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={froTo} onChange={e=>setFroTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={froMes} onChange={e=>setFroMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={froAno} onChange={e=>setFroAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(froSearch||froFrom||froTo||froMes||froAno)&&<button onClick={()=>{setFroSearch('');setFroFrom('');setFroTo('');setFroMes('');setFroAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>🚜</div><div style={{fontSize:15,fontWeight:600}}>Nenhuma pendência</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(r=>{
                  const tp=TIPO[r.patTipo||"bateria"]||TIPO.bateria;
                  const ok=r.resolvido==="sim";
                  return(<div key={r.id} className="card" style={{borderTop:`4px solid ${ok?"#1A7A3C":tp.c}`,padding:0,overflow:"hidden",opacity:r.arquivado?0.55:1}}>
                    <div style={{padding:"7px 10px",background:ok?"#F0FFF5":tp.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:ok?"#1A7A3C":tp.c,background:"#FFF",border:`1px solid ${ok?"#1A7A3C":tp.c}33`,borderRadius:20,padding:"2px 10px"}}>{tp.l}</span>
                        <select value={r.resolvido||"nao"} onChange={e=>froCrud.update(r.id,{resolvido:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":"#C62828",background:ok?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option value="sim">✅ Resolvido</option><option value="nao">⏳ Pendente</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setFroEdit({...r});setFroModal(true);}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>froCrud.update(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))froCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                      <div><div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {r.dataEnvio||"—"} · <b>{r.tecnico||"—"}</b></div></div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>PAT · Novo PAT</div><input type="text" value={r.pat||""} onChange={e=>froCrud.update(r.id,{pat:e.target.value})} placeholder="PAT" style={{width:"100%",fontSize:12,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório · NF</div><input type="text" value={r.rel||""} onChange={e=>froCrud.update(r.id,{rel:e.target.value})} placeholder="REL-001" style={{width:"100%",fontSize:12,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        {ok&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Novo PAT · Rel. Entrega</div><div style={{fontSize:12,fontWeight:700,color:"#1A7A3C"}}>{r.novoPat||"—"} {r.relEntrega&&<span style={{fontSize:10,color:"#888"}}>· {r.relEntrega}</span>}</div></div>}
                      </div>
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{r.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── PRIORIDADES CLIENTES (somente Manuela) ── */}
        {tab==="prioridades_clientes"&&user.id==="manuela"&&(()=>{
          const list=(prioridades||[]).filter(r=>r&&(showArqPri||!r.arquivado));
          const STS={escalado_diretoria:"Escalado Diretoria",escalado_financeiro:"Escalado Financeiro",escalado_comercial:"Escalado Comercial",ag_gilberto:"Ag Sr Gilberto",manutencao:"Manutenção Resolvendo",concluido:"Concluído",pendente:"Pendente"};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>⭐ Prioridades Clientes</div><div style={{fontSize:13,color:"#888"}}>{list.length} item(ns) · visível só para você</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqPri(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqPri?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqPri?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>priCrud.add({data:TODAY_STR,empresa:"",pat:"",motivo:"",canal:"email",responsavel:"",status:"pendente",dataResolucao:"",obs:""})}>+ Nova Prioridade</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhum item.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data</th><th>Empresa</th><th>PAT</th><th>Motivo da Contestação</th><th>Email/WhatsApp</th><th>Responsável</th><th>Status</th><th>Data Resolução</th><th>Observação</th><th>Registrado por</th><th>Ações</th></tr></thead>
                  <tbody>{list.map(r=>{const conc=r.status==="concluido";const pend=r.status==="pendente";return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.data||""} onChange={e=>priCrud.update(r.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.empresa||""} onChange={e=>priCrud.update(r.id,{empresa:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.pat||""} onChange={e=>priCrud.update(r.id,{pat:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="PAT-001"/></td>
                      <td><input type="text" value={r.motivo||""} onChange={e=>priCrud.update(r.id,{motivo:e.target.value})} style={{width:200,fontSize:11,padding:"3px 6px"}} placeholder="Motivo..."/></td>
                      <td><select value={r.canal||"email"} onChange={e=>priCrud.update(r.id,{canal:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}><option value="email">📧 Email</option><option value="whatsapp">💬 WhatsApp</option></select></td>
                      <td><input type="text" value={r.responsavel||""} onChange={e=>priCrud.update(r.id,{responsavel:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><select value={r.status||"pendente"} onChange={e=>priCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:conc?"#1A7A3C":pend?"#C62828":"#1565C0",background:conc?"#F0FFF5":pend?"#FFF0F0":"#F0F4FF",minWidth:150}}>{Object.entries(STS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="date" value={r.dataResolucao||""} onChange={e=>priCrud.update(r.id,{dataResolucao:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.obs||""} onChange={e=>priCrud.update(r.id,{obs:e.target.value})} style={{width:200,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                      <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      <td style={{whiteSpace:"nowrap"}}><button onClick={()=>priCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))priCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

      {/* ── RUPTURA ALMOXARIFADO ── */}
        {tab==="ruptura_almox"&&(()=>{
          const SOL_LABEL={sem_estoque:"Sem estoque",cadastro_compra:"Cadastro e compra",cadastrado_aguard:"Cadastrado aguardando",compra_aguard_ret:"Compra aguard. retorno",consumo_gilberto:"Consumo Gilberto"};
          const ST={aguardando:{l:"Aguardando",c:"#E67E00",bg:"#FFF8F0",icon:"⏳"},aguard_aprov_dir:{l:"Aguard. Diretoria",c:"#8E44AD",bg:"#F6F0FB",icon:"🏛️"},separado_suporte:{l:"Separado no Suporte",c:"#1565C0",bg:"#EFF6FF",icon:"📦"},liberado_almox:{l:"Liberado pelo Almox",c:"#1A7A3C",bg:"#F0FFF5",icon:"✅"}};
          const lista=(rupturas||[]).filter(r=>r&&(showArqRuptura||!r.arquivado));
          const byStatus={aguardando:lista.filter(r=>r.status==="aguardando"||!r.status),aguard_aprov_dir:lista.filter(r=>r.status==="aguard_aprov_dir"),separado_suporte:lista.filter(r=>r.status==="separado_suporte"),liberado_almox:lista.filter(r=>r.status==="liberado_almox")};
          const MESES=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
          const ym=`${rupYear}-${String(rupMonth+1).padStart(2,"0")}`;
          const diasNoMes=new Date(rupYear,rupMonth+1,0).getDate();
          const diasArr=Array.from({length:diasNoMes},(_,i)=>i+1);
          const listaFiltrada=lista.filter(r=>{
            if(rupFiltroStatus!=="todos"&&r.status!==rupFiltroStatus) return false;
            if(rupSearch){
              const q=rupSearch.toLowerCase();
              return (r.requisicao||"").toLowerCase().includes(q)||(r.peca||"").toLowerCase().includes(q)||(r.osRel||"").toLowerCase().includes(q)||(r.empresa||"").toLowerCase().includes(q)||(r.pat||"").toLowerCase().includes(q);
            }
            return true;
          });
          const viewMode=rupViewMode; const setViewMode=setRupViewMode;
          const slaD=(r)=>{
            if(r.status==="separado_suporte"||r.status==="liberado_almox") return null;
            if(!r.data) return null;
            const dt=new Date(r.data); if(isNaN(dt)) return null;
            return Math.floor((Date.now()-dt.getTime())/86400000);
          };
          // Gráfico por status
          const chartStatusRup={labels:Object.values(ST).map(s=>s.l),datasets:[{data:Object.keys(ST).map(k=>byStatus[k]?.length||0),backgroundColor:Object.values(ST).map(s=>s.c),borderWidth:0,borderRadius:6}]};
          // Gráfico evolução por mês (últimos 6)
          const getMes=(d)=>{if(!d)return null;const dt=new Date(d);if(isNaN(dt))return null;return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;};
          const allM=[...new Set(lista.map(r=>getMes(r.data)).filter(Boolean))].sort().slice(-6);
          const chartEvolRup={labels:allM.map(m=>{const[y,mo]=m.split("-");return`${MESES[parseInt(mo)-1]}/${y.slice(2)}`;}),datasets:[{label:"Rupturas",data:allM.map(m=>lista.filter(r=>getMes(r.data)===m).length),backgroundColor:"#E67E00",borderRadius:6,borderSkipped:false}]};
          const barOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},animation:{duration:400}};
          return(
          <div style={{animation:"fadeIn .3s ease"}}>
            {/* Modal criar/editar */}
            {modalRuptura&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setModalRuptura(false);setEditRuptura(null);}}}>
                <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:680,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
                  <div style={{background:"#1A1A1A",padding:"18px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:1}}>
                    <div style={{fontWeight:900,fontSize:18,color:"#F5C200"}}>{editRuptura?"✏️ Editar Ruptura":"🔴 Nova Ruptura — Almoxarifado"}</div>
                    <button onClick={()=>{setModalRuptura(false);setEditRuptura(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                  <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
                    {/* Solicitação + Data */}
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Tipo de Solicitação</label>
                        <select value={rupturaForm.solicitacao||"sem_estoque"} onChange={e=>setRupturaForm(p=>({...p,solicitacao:e.target.value,ticket:RUP_TICKET_OPTS.includes(e.target.value)?p.ticket:""}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",fontWeight:600,background:"#FAFAFA"}}>
                          {RUP_SOLICITACAO.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Data</label>
                        <input type="date" value={rupturaForm.data||TODAY_STR} onChange={e=>setRupturaForm(p=>({...p,data:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                      </div>
                    </div>
                    {/* Ticket condicional */}
                    {RUP_TICKET_OPTS.includes(rupturaForm.solicitacao)&&(
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#9C27B0",textTransform:"uppercase",letterSpacing:.8}}>🎫 Ticket</label>
                        <input type="text" value={rupturaForm.ticket||""} onChange={e=>setRupturaForm(p=>({...p,ticket:e.target.value}))} placeholder="Nº do ticket" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #9C27B0",background:"#F9F0FF"}}/>
                      </div>
                    )}
                    {/* Peça + Código + Qtd + Requisição */}
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 1fr",gap:10}}>
                      {[["Peça","peca","Nome da peça"],["Código","codigo","Cód."],["Qtd","quantidade","0"],["Requisição","requisicao","REQ-000"]].map(([lbl,field,ph])=>(
                        <div key={field} style={{display:"flex",flexDirection:"column",gap:6}}>
                          <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>{lbl}</label>
                          <input type="text" value={rupturaForm[field]||""} onChange={e=>setRupturaForm(p=>({...p,[field]:e.target.value}))} placeholder={ph} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                        </div>
                      ))}
                    </div>
                    {/* OS/REL + PAT + Empresa + Técnico */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                      {[["OS / REL","osRel","OS_REL"],["PAT","pat","Patrimônio"],["Empresa","empresa","Cliente"]].map(([lbl,field,ph])=>(
                        <div key={field} style={{display:"flex",flexDirection:"column",gap:6}}>
                          <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>{lbl}</label>
                          <input type="text" value={rupturaForm[field]||""} onChange={e=>setRupturaForm(p=>({...p,[field]:e.target.value}))} placeholder={ph} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                        </div>
                      ))}
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Técnico</label>
                        <select value={rupturaForm.tecnico||ALL_TECHS[0]} onChange={e=>setRupturaForm(p=>({...p,tecnico:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                          {ALL_TECHS.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Status + Data liberação */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Status</label>
                        <select value={rupturaForm.status||"aguardando"} onChange={e=>setRupturaForm(p=>({...p,status:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"none",fontWeight:700,color:ST[rupturaForm.status||"aguardando"]?.c||"#E67E00",background:ST[rupturaForm.status||"aguardando"]?.bg||"#FFF8F0"}}>
                          {RUP_STATUS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Data Liberação p/ Suporte</label>
                        <input type="date" value={rupturaForm.dataLiberacao||""} onChange={e=>setRupturaForm(p=>({...p,dataLiberacao:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                      </div>
                    </div>
                    {/* Obs */}
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <label style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Observações</label>
                      <textarea value={rupturaForm.obs||""} onChange={e=>setRupturaForm(p=>({...p,obs:e.target.value}))} placeholder="Descreva observações relevantes..." rows={3} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",resize:"vertical",fontFamily:"inherit"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:4}}>
                      <BtnG onClick={()=>{setModalRuptura(false);setEditRuptura(null);}}>Cancelar</BtnG>
                      <BtnY onClick={()=>{
                        if(!rupturaForm.peca){alert("Informe a peça.");return;}
                        if(editRuptura){
                          updateRuptura(editRuptura.id,{...rupturaForm});
                          setEditRuptura(null);setModalRuptura(false);
                        } else {
                          const row={...rupturaForm,id:`RUP${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false};
                          setRupturas(p=>[row,...p]);db.save("rupturas_alm",row.id,row);
                          setModalRuptura(false);
                        }
                        notify("✅ Salvo!");
                      }}>{editRuptura?"Salvar Alterações":"Adicionar Ruptura"}</BtnY>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Header ── */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:900,fontSize:26,color:"#1A1A1A",letterSpacing:-.5}}>🔴 Ruptura Almoxarifado</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s) · <span style={{color:"#E67E00",fontWeight:700}}>{byStatus.aguardando?.length||0} aguardando</span></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqRuptura(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqRuptura?"#1A1A1A":"#FFF",color:showArqRuptura?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqRuptura?"Ocultar":"Ver Arquivados"}</button>
                <button onClick={()=>setViewMode(v=>v==="cards"?"calendario":"cards")} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:"#FFF",fontSize:12,cursor:"pointer",fontWeight:600}}>{viewMode==="cards"?"📅 Calendário":"🃏 Cards"}</button>
                <ExportBar data={lista} filename="ruptura_almox" cols={[{key:"data",label:"Data"},{key:"solicitacao",label:"Solicitação"},{key:"ticket",label:"Ticket"},{key:"requisicao",label:"Requisição"},{key:"peca",label:"Peça"},{key:"codigo",label:"Código"},{key:"quantidade",label:"Qtd"},{key:"osRel",label:"OS/REL"},{key:"pat",label:"PAT"},{key:"empresa",label:"Empresa"},{key:"tecnico",label:"Técnico"},{key:"status",label:"Status"},{key:"dataLiberacao",label:"Dt Liberação"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}]}/>
                <BtnY onClick={()=>{setEditRuptura(null);setRupturaForm({solicitacao:"sem_estoque",data:TODAY_STR,ticket:"",requisicao:"",peca:"",codigo:"",quantidade:"",osRel:"",pat:"",empresa:"",tecnico:ALL_TECHS[0]||"",dataLiberacao:"",obs:"",status:"aguardando",arquivado:false});setModalRuptura(true);}}>+ Nova Ruptura</BtnY>
              </div>
            </div>

            {/* ── KPIs ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {Object.entries(ST).map(([k,s])=>(
                <div key={k} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${s.c}`,background:s.bg,cursor:"pointer",transition:"transform .15s",outline:rupFiltroStatus===k?"2px solid "+s.c:"none"}} onClick={()=>setRupFiltroStatus(rupFiltroStatus===k?"todos":k)}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{s.icon} {s.l}</div>
                  <div style={{fontSize:34,fontWeight:900,color:s.c,lineHeight:1}}>{byStatus[k]?.length||0}</div>
                  {rupFiltroStatus===k&&<div style={{fontSize:9,color:s.c,marginTop:4,fontWeight:700}}>● FILTRO ATIVO</div>}
                </div>
              ))}
            </div>

            {/* ── Gráficos ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.8fr",gap:14,marginBottom:20}}>
              <div className="card" style={{padding:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📊 Por Status</div>
                <ChartCanvas type="doughnut" data={chartStatusRup} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}}}} height={160}/>
              </div>
              <div className="card" style={{padding:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📈 Evolução Mensal</div>
                <ChartCanvas type="bar" data={chartEvolRup} options={barOpts} height={160}/>
              </div>
            </div>

            {/* ── Filtros de busca ── */}
            <div className="card" style={{padding:"6px 10px",marginBottom:16,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:14}}>🔍</span>
                <input type="text" value={rupSearch} onChange={e=>setRupSearch(e.target.value)} placeholder="Buscar por requisição, peça, OS/REL, empresa, PAT..." style={{width:"100%",padding:"9px 12px 9px 32px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/>
              </div>
              {viewMode==="calendario"&&(
                <>
                  <select value={rupMonth} onChange={e=>setRupMonth(Number(e.target.value))} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}>
                    {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={rupYear} onChange={e=>setRupYear(Number(e.target.value))} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}>
                    {[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}
                  </select>
                </>
              )}
              {rupSearch&&<button onClick={()=>setRupSearch("")} style={{padding:"8px 14px",borderRadius:20,background:"#F0F0F0",border:"none",cursor:"pointer",fontSize:12,color:"#555"}}>✕ Limpar</button>}
              <span style={{fontSize:11,color:"#AAA"}}>{listaFiltrada.length} resultado(s)</span>
            </div>

            {/* ── View: Cards ── */}
            {viewMode==="cards"&&(
              listaFiltrada.length===0?(
                <div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}>
                  <div style={{fontSize:40,marginBottom:12}}>🔍</div>
                  <div style={{fontSize:15,fontWeight:600}}>Nenhuma ruptura encontrada</div>
                  <div style={{fontSize:13,marginTop:6}}>Tente ajustar os filtros ou clique em "+ Nova Ruptura"</div>
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                  {listaFiltrada.map(r=>{
                    const st=ST[r.status||"aguardando"]||ST.aguardando;
                    const d=slaD(r);
                    const slaC=d===null?null:d>10?"#C62828":d>5?"#E67E00":"#1A7A3C";
                    return(
                      <div key={r.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:r.arquivado?0.55:1,transition:"box-shadow .2s"}}>
                        {/* Card header */}
                        <div style={{padding:"7px 10px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:800,color:st.c,background:"#FFF",border:`1px solid ${st.c}33`,borderRadius:20,padding:"2px 10px",whiteSpace:"nowrap"}}>{st.icon} {st.l}</span>
                            {d!==null&&<span style={{fontSize:10,fontWeight:700,color:slaC,background:slaC+"18",borderRadius:20,padding:"2px 8px"}}>{d}d</span>}
                          </div>
                          <div style={{display:"flex",gap:3}}>
                            <button onClick={()=>{setEditRuptura(r);setRupturaForm({solicitacao:r.solicitacao||"sem_estoque",data:r.data||TODAY_STR,ticket:r.ticket||"",requisicao:r.requisicao||"",peca:r.peca||"",codigo:r.codigo||"",quantidade:r.quantidade||"",osRel:r.osRel||"",pat:r.pat||"",empresa:r.empresa||"",tecnico:r.tecnico||ALL_TECHS[0]||"",dataLiberacao:r.dataLiberacao||"",obs:r.obs||"",status:r.status||"aguardando",arquivado:r.arquivado||false});setModalRuptura(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                            <button onClick={()=>updateRuptura(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.arquivado?"📤":"🗄️"}</button>
                            <button onClick={()=>{if(window.confirm("Excluir permanentemente?"))delRuptura(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                          </div>
                        </div>
                        {/* Card body */}
                        <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",lineHeight:1.2,marginBottom:3}}>{r.peca||<span style={{color:"#CCC"}}>Sem peça</span>}</div>
                              <div style={{fontSize:11,color:"#888"}}>📅 {fmtDataBR(r.data)} · {SOL_LABEL[r.solicitacao]||"—"}</div>
                            </div>
                            {r.codigo&&<span style={{fontSize:10,fontWeight:700,color:"#888",background:"#F0F0F0",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{r.codigo}</span>}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                            <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Empresa / PAT</div>
                              <div style={{fontSize:12,fontWeight:700,color:"#333"}}>{r.empresa||"—"}</div>
                              {r.pat&&<div style={{fontSize:10,color:"#888"}}>PAT {r.pat}</div>}
                            </div>
                            <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>OS/REL · Requisição</div>
                              <div style={{fontSize:12,fontWeight:700,color:"#1565C0"}}>{r.osRel||"—"}</div>
                              {r.requisicao&&<div style={{fontSize:10,color:"#8E44AD",fontWeight:600}}>{r.requisicao}</div>}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                            {r.tecnico&&<span style={{fontSize:10,background:"#EFF6FF",color:"#1565C0",borderRadius:12,padding:"2px 8px",fontWeight:600}}>👷 {r.tecnico}</span>}
                            {r.quantidade&&<span style={{fontSize:10,background:"#F5F5F5",color:"#555",borderRadius:12,padding:"2px 8px",fontWeight:600}}>Qtd: {r.quantidade}</span>}
                            {r.ticket&&<span style={{fontSize:10,background:"#F6F0FB",color:"#8E44AD",borderRadius:12,padding:"2px 8px",fontWeight:600}}>🎫 {r.ticket}</span>}
                          </div>
                          {r.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {r.obs}</div>}
                          {r.dataLiberacao&&<div style={{fontSize:11,color:"#1A7A3C",fontWeight:600,background:"#F0FFF5",borderRadius:8,padding:"5px 10px"}}>✅ Liberado em {r.dataLiberacao}</div>}
                          <div style={{marginTop:2}}>
                            <select value={r.status||"aguardando"} onChange={e=>updateRuptura(r.id,{status:e.target.value,dataLiberacao:e.target.value==="liberado_almox"&&!r.dataLiberacao?TODAY_STR:r.dataLiberacao})} style={{width:"100%",fontSize:11,padding:"6px 10px",borderRadius:20,border:`1px solid ${st.c}44`,color:st.c,background:st.bg,fontWeight:700,cursor:"pointer"}}>
                              {RUP_STATUS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── View: Calendário ── */}
            {viewMode==="calendario"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
                {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=>(
                  <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#AAA",padding:"6px 0",background:"#F8F8F8",borderRadius:8}}>{d}</div>
                ))}
                {Array.from({length:new Date(rupYear,rupMonth,1).getDay()}).map((_,i)=>(
                  <div key={"empty"+i}/>
                ))}
                {diasArr.map(dia=>{
                  const dStr=`${rupYear}-${String(rupMonth+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
                  const dayRups=listaFiltrada.filter(r=>r.data===dStr);
                  const isToday=dStr===TODAY_STR;
                  return(
                    <div key={dia} style={{minHeight:80,background:isToday?"#FFFBF0":"#FFF",border:isToday?"2px solid #F5C200":"1px solid #F0F0F0",borderRadius:10,padding:6,transition:"background .15s"}}>
                      <div style={{fontSize:12,fontWeight:isToday?800:600,color:isToday?"#C47D00":"#555",marginBottom:4,textAlign:"right"}}>{dia}</div>
                      {dayRups.map((r,i)=>{
                        const st=ST[r.status||"aguardando"]||ST.aguardando;
                        return(
                          <div key={i} style={{background:st.bg,border:`1px solid ${st.c}44`,borderRadius:6,padding:"3px 6px",marginBottom:3,cursor:"pointer"}} title={`${r.peca||"—"} · ${r.empresa||"—"}`}
                            onClick={()=>{setEditRuptura(r);setRupturaForm({solicitacao:r.solicitacao||"sem_estoque",data:r.data||TODAY_STR,ticket:r.ticket||"",requisicao:r.requisicao||"",peca:r.peca||"",codigo:r.codigo||"",quantidade:r.quantidade||"",osRel:r.osRel||"",pat:r.pat||"",empresa:r.empresa||"",tecnico:r.tecnico||ALL_TECHS[0]||"",dataLiberacao:r.dataLiberacao||"",obs:r.obs||"",status:r.status||"aguardando",arquivado:r.arquivado||false});setModalRuptura(true);}}>
                            <div style={{fontSize:9,fontWeight:700,color:st.c,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{r.peca||"—"}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

      {/* ── DASHBOARD REQUISIÇÕES ── */}
        {tab==="dashboard_req"&&(()=>{
          const ruptAlmox=rupturas||[];
          const allReqs=[...emprestimos,...saidaEntrada];
          const totalEmp=(emprestimos||[]).length;
          const totalSai=(saidaEntrada||[]).length;
          const total=allReqs.length;
          // Rupturas S/E
          const rupturasS=(saidaEntrada||[]).filter(s=>s.statusReq==="ruptura");
          const rupturasInfo=rupturasS.map(s=>({peca:s.peca||s.descricao||"—",empresa:s.empresa||"—",dias:s.data?diffDays(s.data):null,codigo:s.codigo||"—"}));
          const atendidos=(saidaEntrada||[]).filter(s=>s.statusReq==="atendido").length;
          const pendentes=(emprestimos||[]).filter(e=>(e.statusEmp||"pendente")==="pendente").length+(saidaEntrada||[]).filter(s=>(s.statusFinal||"pendente")==="pendente").length;
          const concluidos=(emprestimos||[]).filter(e=>e.statusEmp==="concluido").length+(saidaEntrada||[]).filter(s=>s.statusFinal==="concluido").length;
          // Por técnico
          const byTech={};
          (emprestimos||[]).forEach(e=>{const t=e.requerente||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          (saidaEntrada||[]).forEach(s=>{const t=s.requerente||s.empresa||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          const techSorted=Object.entries(byTech).sort((a,b)=>b[1]-a[1]).slice(0,10);
          // Peças mais solicitadas (S/E + Empréstimos)
          const pecaCount={};
          (saidaEntrada||[]).forEach(s=>{const p=s.peca||s.descricao||"";if(p)pecaCount[p]=(pecaCount[p]||0)+1;});
          (emprestimos||[]).forEach(e=>{const p=e.item||e.descricao||"";if(p)pecaCount[p]=(pecaCount[p]||0)+1;});
          const topPecas=Object.entries(pecaCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
          // Evolução por mês (últimos 6 meses)
          const getMes=(dateStr)=>{if(!dateStr)return null;const d=new Date(dateStr);if(isNaN(d))return null;return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
          const mesEmp={};(emprestimos||[]).forEach(e=>{const m=getMes(e.dataEmp||e.dataSaida||e.registradoEm);if(m)mesEmp[m]=(mesEmp[m]||0)+1;});
          const mesSai={};(saidaEntrada||[]).forEach(s=>{const m=getMes(s.dataSaida||s.data||s.registradoEm);if(m)mesSai[m]=(mesSai[m]||0)+1;});
          const allMeses=[...new Set([...Object.keys(mesEmp),...Object.keys(mesSai)])].sort().slice(-6);
          const mesesLabel=allMeses.map(m=>{const[y,mo]=m.split("-");const nomes=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];return`${nomes[parseInt(mo)-1]}/${y.slice(2)}`;});
          const chartEvolucao={labels:mesesLabel,datasets:[{label:"Empréstimo/Retorno",data:allMeses.map(m=>mesEmp[m]||0),backgroundColor:"#F5C200",borderRadius:4},{label:"Entrada/Saída",data:allMeses.map(m=>mesSai[m]||0),backgroundColor:"#1565C0",borderRadius:4}]};
          // Tipo por técnico empilhado
          const techsAtivos=techSorted.slice(0,8).map(([t])=>t);
          const empByTech={};(saidaEntrada||[]).forEach(s=>{const t=s.requerente||s.empresa||"Sem técnico";empByTech[t]=(empByTech[t]||0)+1;});
          const empByTechEmp={};(emprestimos||[]).forEach(e=>{const t=e.requerente||"Sem técnico";empByTechEmp[t]=(empByTechEmp[t]||0)+1;});
          const chartTipoTech={labels:techsAtivos,datasets:[{label:"Entrada/Saída",data:techsAtivos.map(t=>empByTech[t]||0),backgroundColor:"#1565C0",borderRadius:4},{label:"Empréstimo/Retorno",data:techsAtivos.map(t=>empByTechEmp[t]||0),backgroundColor:"#F5C200",borderRadius:4}]};
          // Gráficos status
          const chartStatusEmpData={labels:["Pendente","Concluído"],datasets:[{data:[(emprestimos||[]).filter(e=>(e.statusEmp||"pendente")==="pendente").length,(emprestimos||[]).filter(e=>e.statusEmp==="concluido").length],backgroundColor:["#C62828","#1A7A3C"],borderWidth:0}]};
          const chartStatusSaiData={labels:["Ruptura","Atendido","Pendente","Concluído"],datasets:[{data:[rupturasS.length,atendidos,(saidaEntrada||[]).filter(s=>(s.statusFinal||"pendente")==="pendente").length,(saidaEntrada||[]).filter(s=>s.statusFinal==="concluido").length],backgroundColor:["#C62828","#1A7A3C","#E67E00","#1565C0"],borderWidth:0}]};
          const pecasAplicadas=(saidaEntrada||[]).filter(s=>s.relatorioAplicado).map(s=>({rel:s.relatorioAplicado,peca:s.peca||s.descricao||"—",empresa:s.empresa||"—"}));
          const empPecasAplicadas=(emprestimos||[]).filter(e=>e.relatorioAplicado).map(e=>({rel:e.relatorioAplicado,peca:e.descricao||"—",empresa:e.requerente||"—"}));
          const todasPecasAplicadas=[...pecasAplicadas,...empPecasAplicadas];
          const KPIR=({label,value,color="#1A1A1A",bg="#FFF",icon,sub})=>(
            <div className="card" style={{padding:"8px 12px",background:bg,borderTop:`3px solid ${color}`,display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>{icon} {label}</div>
              <div style={{fontSize:19,fontWeight:800,color,lineHeight:1}}>{value}</div>
              {sub&&<div style={{fontSize:10,color:"#AAA"}}>{sub}</div>}
            </div>
          );
          const chartOptsBar={plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},maintainAspectRatio:false};
          const chartOptsBarStacked={plugins:{legend:{position:"bottom",labels:{font:{size:10}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}},y:{stacked:true,beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},maintainAspectRatio:false};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{fontWeight:900,fontSize:24}}>📊 Dashboard Requisições</div>
                <div style={{fontSize:12,color:"#888",background:"#F5F5F5",borderRadius:20,padding:"4px 12px"}}>{total} registros</div>
              </div>

              {/* KPIs */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                <KPIR icon="📦" label="Total" value={total} color="#1A1A1A"/>
                <KPIR icon="🔄" label="Empréstimos" value={totalEmp} color="#F5C200"/>
                <KPIR icon="📤" label="Entrada/Saída" value={totalSai} color="#1565C0"/>
                <KPIR icon="🔴" label="Rupturas S/E" value={rupturasS.length} color="#C62828" bg="#FFF8F8"/>
                <KPIR icon="🏭" label="Ruptura Almox" value={(ruptAlmox).filter(r=>r&&!r.arquivado).length} color="#AD1457" bg="#FFF0F8"/>
                <KPIR icon="⏳" label="Pendentes" value={pendentes} color="#E67E00" bg="#FFF8F0"/>
                <KPIR icon="✅" label="Concluídos" value={concluidos} color="#1A7A3C" bg="#F0FFF5"/>
              </div>

              {/* Linha 1: Evolução por mês + Peças mais solicitadas */}
              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>📈 Evolução por Mês</div>
                  <div style={{height:200}}><ChartCanvas type="bar" data={chartEvolucao} options={chartOptsBarStacked} height={200}/></div>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>🔩 Peças Mais Solicitadas</div>
                  {topPecas.length===0?<div style={{color:"#CCC",fontSize:12,padding:20,textAlign:"center"}}>Sem dados</div>:(
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {topPecas.map(([peca,qtd],i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{fontSize:10,color:"#AAA",width:16,textAlign:"right"}}>{i+1}</div>
                          <div style={{flex:1,fontSize:11,fontWeight:600,color:"#333",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{peca}</div>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{height:6,borderRadius:3,background:"#F5C200",width:Math.max(20,qtd*14)}}/>
                            <div style={{fontSize:11,fontWeight:800,color:"#C47D00",minWidth:20,textAlign:"right"}}>{qtd}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 2: Tipo por técnico empilhado + Status donut */}
              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>👷 Tipo por Técnico/Requerente</div>
                  <div style={{height:220}}><ChartCanvas type="bar" data={chartTipoTech} options={chartOptsBarStacked} height={220}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div className="card" style={{padding:14}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#555",textTransform:"uppercase",marginBottom:8}}>Empréstimos</div>
                    <ChartCanvas type="doughnut" data={chartStatusEmpData} options={{plugins:{legend:{position:"bottom",labels:{font:{size:9}}}},cutout:"60%",maintainAspectRatio:false}} height={160}/>
                  </div>
                  <div className="card" style={{padding:14}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#555",textTransform:"uppercase",marginBottom:8}}>Entrada/Saída</div>
                    <ChartCanvas type="doughnut" data={chartStatusSaiData} options={{plugins:{legend:{position:"bottom",labels:{font:{size:9}}}},cutout:"60%",maintainAspectRatio:false}} height={160}/>
                  </div>
                </div>
              </div>

              {/* Rupturas detalhadas */}
              {rupturasS.length>0&&(
                <div className="card" style={{padding:16,marginBottom:16,borderLeft:"4px solid #C62828"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#C62828",marginBottom:10}}>🔴 Rupturas em Aberto ({rupturasS.length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Peça</th><th>Código</th><th>Empresa</th><th>Data</th><th>SLA (dias)</th></tr></thead>
                    <tbody>{rupturasInfo.map((r,i)=>(
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{r.peca}</td>
                        <td style={{fontSize:11,color:"#888"}}>{r.codigo}</td>
                        <td>{r.empresa}</td>
                        <td style={{fontSize:11,color:"#888"}}>{rupturasS[i]?.data||"—"}</td>
                        <td><SlaBadge days={r.dias}/></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {/* Peças aplicadas */}
              {todasPecasAplicadas.length>0&&(
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>🔧 Peças Aplicadas com Relatório ({todasPecasAplicadas.length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Relatório</th><th>Peça</th><th>Empresa/Requerente</th></tr></thead>
                    <tbody>{todasPecasAplicadas.map((p,i)=>(
                      <tr key={i}><td style={{fontWeight:700,color:"#1565C0"}}>{p.rel}</td><td>{p.peca}</td><td style={{fontSize:11,color:"#888"}}>{p.empresa}</td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}
              {/* Ruptura Almox no Dashboard */}
              {(ruptAlmox||[]).filter(r=>r&&!r.arquivado).length>0&&(
                <div className="card" style={{padding:16,marginBottom:16,borderLeft:"4px solid #AD1457"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#AD1457",marginBottom:10}}>🏭 Ruptura Almoxarifado — Em Aberto ({(ruptAlmox||[]).filter(r=>r&&!r.arquivado&&r.status!=="liberado_almox").length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Data</th><th>Peça</th><th>Cód.</th><th>Empresa</th><th>PAT</th><th>Técnico</th><th>Solicitação</th><th>SLA</th><th>Status</th></tr></thead>
                    <tbody>{(ruptAlmox||[]).filter(r=>r&&!r.arquivado&&r.status!=="liberado_almox").map((r,i)=>{
                      const dias=r.status==="separado_suporte"||r.status==="liberado_almox"?null:r.data?Math.floor((Date.now()-new Date(r.data).getTime())/86400000):null;
                      const SOLS={sem_estoque:"Sem estoque",cadastro_compra:"Cadastro e compra",cadastrado_aguard:"Cadastrado aguard.",compra_aguard_ret:"Compra aguard. retorno",consumo_gilberto:"Consumo Gilberto"};
                      const STATS={aguardando:{l:"Aguardando",c:"#E67E00"},aguard_aprov_dir:{l:"Aguard. Diretoria",c:"#8E44AD"},separado_suporte:{l:"Separado Suporte",c:"#1565C0"},liberado_almox:{l:"Liberado",c:"#1A7A3C"}};
                      const st=STATS[r.status]||STATS.aguardando;
                      return(<tr key={i}>
                        <td style={{fontSize:11,whiteSpace:"nowrap"}}>{fmtDataBR(r.data)}</td>
                        <td style={{fontWeight:700}}>{r.peca||"—"}</td>
                        <td style={{fontSize:11,color:"#888"}}>{r.codigo||"—"}</td>
                        <td style={{fontSize:11}}>{r.empresa||"—"}</td>
                        <td style={{fontSize:11}}>{r.pat||"—"}</td>
                        <td style={{fontSize:11}}>{r.tecnico||"—"}</td>
                        <td style={{fontSize:11}}>{SOLS[r.solicitacao]||r.solicitacao||"—"}</td>
                        <td>{dias!==null?<span style={{fontSize:11,fontWeight:700,color:dias>10?"#C62828":dias>5?"#E67E00":"#1A7A3C"}}>{dias}d</span>:<span style={{fontSize:10,color:"#1A7A3C"}}>✅</span>}</td>
                        <td><span style={{fontSize:10,fontWeight:700,color:st.c}}>{st.l}</span></td>
                      </tr>);
                    })}</tbody>
                  </table></div>
                </div>
              )}
              {total===0&&(
                <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                  <div style={{fontSize:32,marginBottom:12}}>📊</div>
                  Nenhuma requisição cadastrada ainda.
                </div>
              )}
            </div>
          );
        })()}

        {/* ── DASHBOARD PROCESSOS (Mau Uso + A Faturar) ── */}
        {tab==="dashboard_processos"&&(()=>{
          const parseVal=(v)=>{const n=parseFloat((v||"0").toString().replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return isNaN(n)?0:n;};
          const getMes=(d)=>{if(!d)return null;const dt=new Date(d);if(isNaN(dt))return null;return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;};
          const MESES_N=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const MESES=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
          // Filtros (estados no nível componente)
          const fMes=dashProcFMes,setFMes=setDashProcFMes;
          const fAno=dashProcFAno,setFAno=setDashProcFAno;
          const fDe=dashProcFDe,setFDe=setDashProcFDe;
          const fAte=dashProcFAte,setFAte=setDashProcFAte;
          const fEmpresa=dashProcFEmpresa,setFEmpresa=setDashProcFEmpresa;
          const fPat=dashProcFPat,setFPat=setDashProcFPat;
          const fNumMU=dashProcFNumMU,setFNumMU=setDashProcFNumMU;
          const fStatus=dashProcFStatus,setFStatus=setDashProcFStatus;
          const fAprov=dashProcFAprov,setFAprov=setDashProcFAprov;
          const fTipo=dashProcFTipo,setFTipo=setDashProcFTipo;
          const filtrar=(p,dateField="date")=>{
            const d=p[dateField]||"";
            if(fDe&&d<fDe)return false;
            if(fAte&&d>fAte)return false;
            if(fMes&&d.slice(5,7)!==fMes)return false;
            if(fAno&&!d.startsWith(fAno))return false;
            if(fEmpresa&&!(p.empresa||"").toLowerCase().includes(fEmpresa.toLowerCase()))return false;
            if(fPat&&!(p.patrimonio||"").toLowerCase().includes(fPat.toLowerCase()))return false;
            if(fNumMU&&!(p.numMauUso||"").toLowerCase().includes(fNumMU.toLowerCase()))return false;
            if(fStatus!=="todos"&&p.processoStatus!==fStatus)return false;
            if(fAprov!=="todos"&&(p.aprovCliente||"aguardando_retorno")!==fAprov)return false;
            return true;
          };
          const hasFilter=fMes||fAno||fDe||fAte||fEmpresa||fPat||fNumMU||fStatus!=="todos"||fAprov!=="todos"||fTipo!=="todos";
          const clearFilter=()=>{setFMes("");setFAno("");setFDe("");setFAte("");setFEmpresa("");setFPat("");setFNumMU("");setFStatus("todos");setFAprov("todos");setFTipo("todos");};
          const allMU=(processosMU||[]).filter(p=>p.processoStatus!=="arquivado"&&filtrar(p));
          const allAF=(processosAF||[]).filter(p=>p.processoStatus!=="arquivado"&&filtrar(p));
          const allProc=[...allMU.map(p=>({...p,_tipo:"mu"})),...allAF.map(p=>({...p,_tipo:"af"}))];
          const listaTipo=fTipo==="mu"?allMU:fTipo==="af"?allAF:allProc;
          // Valores
          const valMU=allMU.reduce((acc,p)=>acc+parseVal(p.valor),0);
          const valAF=allAF.reduce((acc,p)=>acc+parseVal(p.valor),0);
          const valTotal=valMU+valAF;
          const valAprov=[...allMU,...allAF].filter(p=>p.aprovCliente==="aprovado_cliente").reduce((acc,p)=>acc+parseVal(p.valor),0);
          const valFaturado=[...allMU,...allAF].filter(p=>p.aprovCliente==="cobrado_faturado").reduce((acc,p)=>acc+parseVal(p.valor),0);
          const fmtR=(v)=>`R$ ${v.toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
          // Counts por aprovCliente
          const aprovCounts=Object.entries(APROV_STATUS).map(([k,s])=>({
            label:s.l,total:[...allMU,...allAF].filter(p=>(p.aprovCliente||"aguardando_retorno")===k).length,
            valor:[...allMU,...allAF].filter(p=>(p.aprovCliente||"aguardando_retorno")===k).reduce((acc,p)=>acc+parseVal(p.valor),0),c:s.c,bg:s.bg
          }));
          // Evolução mensal
          const meses=[...new Set(allProc.map(p=>getMes(p.date)).filter(Boolean))].sort().slice(-6);
          const chartEvolData={labels:meses.map(m=>{const[y,mo]=m.split("-");return`${MESES[parseInt(mo)-1]}/${y.slice(2)}`;}),datasets:[
            {label:"Mau Uso",data:meses.map(m=>allMU.filter(p=>getMes(p.date)===m).reduce((acc,p)=>acc+parseVal(p.valor),0)),backgroundColor:"#C62828",borderRadius:5,borderSkipped:false},
            {label:"A Faturar",data:meses.map(m=>allAF.filter(p=>getMes(p.date)===m).reduce((acc,p)=>acc+parseVal(p.valor),0)),backgroundColor:"#1565C0",borderRadius:5,borderSkipped:false},
          ]};
          const barOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{callback:v=>`R$${(v/1000).toFixed(0)}k`,font:{size:10}},grid:{color:"#F0F0F0"}}},animation:{duration:400}};
          // Top empresas
          const empValMap={};
          allProc.forEach(p=>{if(p.empresa)empValMap[p.empresa]=(empValMap[p.empresa]||0)+parseVal(p.valor);});
          const topEmp=Object.entries(empValMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📊 Dashboard de Processos</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{allMU.length+allAF.length} processo(s) {hasFilter&&<span style={{color:"#1565C0",fontWeight:700}}>· filtro ativo</span>}</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {hasFilter&&<button onClick={clearFilter} style={{padding:"8px 16px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar Filtros</button>}
              </div>
            </div>

            {/* ── Filtros ── */}
            <button onClick={()=>setShowFiltrosDP(p=>!p)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:10,border:"1.5px solid #E2E8F0",background:showFiltrosDP?"#FFF":"#F8FAFC",cursor:"pointer",marginBottom:10,fontFamily:"inherit",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <span style={{fontSize:12}}>🔍</span>
              <span style={{fontSize:11,fontWeight:700,color:"#1E293B"}}>Filtros</span>
              <span style={{fontSize:9,color:"#94A3B8",marginLeft:4}}>{showFiltrosDP?"▲":"▼"}</span>
            </button>
            {showFiltrosDP&&<div style={{background:"#FFF",borderRadius:12,padding:"10px 14px",marginBottom:10,border:"1.5px solid #E2E8F0",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",marginBottom:12}}>🔍 Filtros</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Tipo</label>
                  <select value={fTipo} onChange={e=>setFTipo(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                    <option value="todos">Todos</option><option value="mu">⚠️ Mau Uso</option><option value="af">💰 A Faturar</option>
                  </select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Mês</label>
                  <select value={fMes} onChange={e=>setFMes(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                    <option value="">Todos os meses</option>
                    {MESES_N.map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Ano</label>
                  <select value={fAno} onChange={e=>setFAno(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                    <option value="">Todos</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Aprovação Cliente</label>
                  <select value={fAprov} onChange={e=>setFAprov(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                    <option value="todos">Todos os status</option>
                    {Object.entries(APROV_STATUS).map(([v,s])=><option key={v} value={v}>{s.l}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Status Processo</label>
                  <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>
                    <option value="todos">Todos</option><option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option>
                  </select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>De</label>
                  <input type="date" value={fDe} onChange={e=>setFDe(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Até</label>
                  <input type="date" value={fAte} onChange={e=>setFAte(e.target.value)} style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Empresa</label>
                  <input type="text" value={fEmpresa} onChange={e=>setFEmpresa(e.target.value)} placeholder="Filtrar empresa..." style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Patrimônio</label>
                  <input type="text" value={fPat} onChange={e=>setFPat(e.target.value)} placeholder="PAT..." style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <label style={{fontSize:9,fontWeight:700,color:"#AAA",textTransform:"uppercase"}}>Nº Mau Uso</label>
                  <input type="text" value={fNumMU} onChange={e=>setFNumMU(e.target.value)} placeholder="Nº MU..." style={{fontSize:11,padding:"5px 8px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/>
                </div>
              </div>
            </div>}

            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              <div className="card" style={{padding:"8px 12px",borderLeft:"4px solid #1A1A1A"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>📋 Total Processos</div>
                <div style={{fontSize:32,fontWeight:900,color:"#1A1A1A"}}>{allMU.length+allAF.length}</div>
                <div style={{fontSize:11,color:"#888",marginTop:4}}>MU: {allMU.length} · AF: {allAF.length}</div>
              </div>
              <div className="card" style={{padding:"8px 12px",borderLeft:"4px solid #E67E00",background:"#FFF8F0"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>💵 Valor Total</div>
                <div style={{fontSize:18,fontWeight:900,color:"#E67E00"}}>{fmtR(valTotal)}</div>
                <div style={{fontSize:11,color:"#888",marginTop:4}}>MU: {fmtR(valMU)} · AF: {fmtR(valAF)}</div>
              </div>
              <div className="card" style={{padding:"8px 12px",borderLeft:"4px solid #1A7A3C",background:"#F0FFF5"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>✅ Aprovado pelo Cliente</div>
                <div style={{fontSize:18,fontWeight:900,color:"#1A7A3C"}}>{fmtR(valAprov)}</div>
                <div style={{fontSize:11,color:"#888",marginTop:4}}>{[...allMU,...allAF].filter(p=>p.aprovCliente==="aprovado_cliente").length} processo(s)</div>
              </div>
              <div className="card" style={{padding:"8px 12px",borderLeft:"4px solid #6A1B9A",background:"#F3E5F5"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>💰 Cobrado / Faturado</div>
                <div style={{fontSize:18,fontWeight:900,color:"#6A1B9A"}}>{fmtR(valFaturado)}</div>
                <div style={{fontSize:11,color:"#888",marginTop:4}}>{[...allMU,...allAF].filter(p=>p.aprovCliente==="cobrado_faturado").length} processo(s)</div>
              </div>
            </div>

            {/* Painel Aprovação */}
            <div className="card" style={{padding:0,overflow:"hidden",marginBottom:20,borderTop:"4px solid #F5C200"}}>
              <div style={{padding:"14px 20px",background:"#1A1A1A",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>🤝</span>
                <div><div style={{fontWeight:800,fontSize:15,color:"#F5C200"}}>Painel de Aprovação pelo Cliente</div><div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Situação de cada processo junto ao cliente</div></div>
              </div>
              <div style={{padding:"8px 12px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {aprovCounts.map((a,i)=>(
                  <div key={i} style={{background:a.bg,borderRadius:12,padding:"14px 16px",border:`1.5px solid ${a.c}33`,display:"flex",flexDirection:"column",gap:6,cursor:"pointer",outline:fAprov===Object.keys(APROV_STATUS)[i]?`2px solid ${a.c}`:"none"}}
                    onClick={()=>setFAprov(fAprov===Object.keys(APROV_STATUS)[i]?"todos":Object.keys(APROV_STATUS)[i])}>
                    <div style={{fontSize:11,fontWeight:800,color:a.c}}>{a.label}</div>
                    <div style={{fontSize:17,fontWeight:800,color:a.c,lineHeight:1}}>{a.total}</div>
                    <div style={{fontSize:13,fontWeight:700,color:a.c,opacity:.85}}>{fmtR(a.valor)}</div>
                    <div style={{background:"rgba(0,0,0,.08)",borderRadius:4,height:5}}>
                      <div style={{background:a.c,height:5,borderRadius:4,width:`${valTotal>0?Math.min(100,(a.valor/valTotal)*100):0}%`,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:9,color:a.c,opacity:.6,fontWeight:600}}>{valTotal>0?`${((a.valor/valTotal)*100).toFixed(0)}% do total`:"0%"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ROW 1: Evolução linha + Donut status ── */}
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14,marginBottom:14}}>
              <div style={{background:"#FFF",borderRadius:14,padding:"8px 12px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:12}}>📈 Evolução Mensal — Quantidade de Processos</div>
                {meses.length===0?<div style={{textAlign:"center",color:"#CCC",padding:40}}>Sem dados no período</div>:<ChartCanvas type="line" data={{
                  labels:meses.map(m=>{const[y,mo]=m.split("-");return`${MESES[parseInt(mo)-1]}/${y.slice(2)}`;}),
                  datasets:[
                    {label:"Mau Uso",data:meses.map(m=>allMU.filter(p=>getMes(p.date)===m).length),borderColor:"#C62828",backgroundColor:"#C6282818",fill:true,tension:.4,pointRadius:5,pointBackgroundColor:"#C62828"},
                    {label:"A Faturar",data:meses.map(m=>allAF.filter(p=>getMes(p.date)===m).length),borderColor:"#1565C0",backgroundColor:"#1565C018",fill:true,tension:.4,pointRadius:5,pointBackgroundColor:"#1565C0"},
                  ]
                }} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},animation:{duration:400}}} height={180}/>}
              </div>
              <div style={{background:"#FFF",borderRadius:14,padding:"8px 12px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:12}}>🍕 Status dos Processos</div>
                <ChartCanvas type="doughnut" data={{
                  labels:["Pendente","Em Andamento","Concluído"],
                  datasets:[{data:[
                    [...allMU,...allAF].filter(p=>p.processoStatus==="pendente"||!p.processoStatus).length,
                    [...allMU,...allAF].filter(p=>p.processoStatus==="em_andamento").length,
                    [...allMU,...allAF].filter(p=>p.processoStatus==="concluido").length,
                  ],backgroundColor:["#E67E00","#1565C0","#1A7A3C"],borderWidth:0,borderRadius:6}]
                }} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}}}} height={180}/>
              </div>
            </div>

            {/* ── ROW 2: Evolução valores + Top empresas ── */}
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14,marginBottom:14}}>
              <div style={{background:"#FFF",borderRadius:14,padding:"8px 12px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:12}}>💵 Evolução de Valores por Mês</div>
                {meses.length===0?<div style={{textAlign:"center",color:"#CCC",padding:40}}>Sem dados</div>:<ChartCanvas type="bar" data={chartEvolData} options={barOpts} height={180}/>}
              </div>
              <div className="card" style={{padding:18,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:4}}>🏆 Top Empresas por Valor</div>
                {topEmp.length===0?<div style={{color:"#CCC",fontSize:12,textAlign:"center",padding:20}}>Sem dados</div>:topEmp.slice(0,8).map(([emp,val],i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",gap:3}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#333",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i+1}. {emp}</span>
                      <span style={{fontSize:11,fontWeight:800,color:"#1565C0"}}>{fmtR(val)}</span>
                    </div>
                    <div style={{background:"#F0F0F0",borderRadius:4,height:5}}>
                      <div style={{background:`hsl(${210+i*15},70%,${45-i*3}%)`,height:5,borderRadius:4,width:`${topEmp[0][1]>0?(val/topEmp[0][1])*100:0}%`,transition:"width .6s"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* ── ROW 3: Funil aprovação + Termômetro meta + Mapa calor ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
              {/* Funil */}
              <div style={{background:"#FFF",borderRadius:14,padding:"8px 12px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:14}}>🔽 Funil de Aprovação</div>
                {(()=>{
                  const funnelSteps=[
                    {l:"Em Aberto",v:[...allMU,...allAF].length,c:"#1565C0"},
                    {l:"Aguard. Retorno",v:[...allMU,...allAF].filter(p=>p.aprovCliente==="aguardando_retorno"||!p.aprovCliente).length,c:"#E67E00"},
                    {l:"Em Negociação",v:[...allMU,...allAF].filter(p=>p.aprovCliente==="em_negociacao").length,c:"#8E44AD"},
                    {l:"Aprovado",v:[...allMU,...allAF].filter(p=>p.aprovCliente==="aprovado_cliente").length,c:"#1A7A3C"},
                    {l:"Faturado",v:[...allMU,...allAF].filter(p=>p.aprovCliente==="cobrado_faturado").length,c:"#6A1B9A"},
                  ];
                  const max=funnelSteps[0].v||1;
                  return(<div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {funnelSteps.map((s,i)=>(
                      <div key={i} style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                        <div style={{width:`${Math.max(30,100-i*12)}%`,background:s.c,borderRadius:6,padding:"6px 10px",textAlign:"center",transition:"width .5s"}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#FFF",opacity:.9}}>{s.l}</div>
                          <div style={{fontSize:16,fontWeight:900,color:"#FFF"}}>{s.v}</div>
                        </div>
                        {i<funnelSteps.length-1&&<div style={{fontSize:14,color:"#CCC"}}>▼</div>}
                      </div>
                    ))}
                  </div>);
                })()}
              </div>

              {/* Termômetro de meta */}
              <div className="card" style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B"}}>🎯 Meta de Recebimento</div>
                {(()=>{
                  const meta=50000;
                  const recebido=valFaturado;
                  const pct=Math.min(100,(recebido/meta)*100);
                  const cor=pct>=100?"#1A7A3C":pct>=60?"#E67E00":"#C62828";
                  return(<>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:11,color:"#AAA",marginBottom:4}}>Faturado vs Meta</div>
                      <div style={{fontSize:18,fontWeight:800,color:cor}}>{pct.toFixed(0)}%</div>
                      <div style={{fontSize:12,color:"#888"}}>{fmtR(recebido)} de {fmtR(meta)}</div>
                    </div>
                    {/* Gauge visual */}
                    <div style={{position:"relative",height:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg viewBox="0 0 200 110" style={{width:"100%",maxWidth:200}}>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F0F0F0" strokeWidth="16" strokeLinecap="round"/>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={cor} strokeWidth="16" strokeLinecap="round"
                          strokeDasharray={`${(pct/100)*251.2} 251.2`} style={{transition:"stroke-dasharray .8s ease"}}/>
                        <text x="100" y="95" textAnchor="middle" fontSize="13" fontWeight="800" fill={cor}>{fmtR(recebido)}</text>
                        <text x="20" y="115" textAnchor="middle" fontSize="9" fill="#AAA">R$0</text>
                        <text x="180" y="115" textAnchor="middle" fontSize="9" fill="#AAA">{fmtR(meta)}</text>
                      </svg>
                    </div>
                    <div style={{background:cor+"18",borderRadius:8,padding:"8px 12px",textAlign:"center",border:`1px solid ${cor}33`}}>
                      <div style={{fontSize:10,fontWeight:700,color:cor}}>{pct>=100?"🎉 Meta atingida!":pct>=60?"⚡ Em bom caminho":"🔴 Abaixo da meta"}</div>
                      <div style={{fontSize:11,color:"#888",marginTop:2}}>Falta {fmtR(Math.max(0,meta-recebido))}</div>
                    </div>
                  </>);
                })()}
              </div>

              {/* Mapa de calor por dia da semana */}
              <div style={{background:"#FFF",borderRadius:14,padding:"8px 12px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:12}}>🗓️ Processos por Dia da Semana</div>
                {(()=>{
                  const dias=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
                  const counts=Array(7).fill(0);
                  [...allMU,...allAF].forEach(p=>{if(p.date){const d=new Date(p.date);if(!isNaN(d))counts[d.getDay()]++;}});
                  const maxCount=Math.max(...counts,1);
                  return(<div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {dias.map((dia,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,fontWeight:600,color:"#555",width:28,textAlign:"right"}}>{dia}</span>
                        <div style={{flex:1,background:"#F0F0F0",borderRadius:6,height:22,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:6,background:counts[i]>0?`hsl(${200+i*20},70%,${50-Math.floor((counts[i]/maxCount)*20)}%)`:"transparent",width:`${(counts[i]/maxCount)*100}%`,transition:"width .5s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {counts[i]>0&&<span style={{fontSize:10,fontWeight:700,color:"#FFF"}}>{counts[i]}</span>}
                          </div>
                        </div>
                        <span style={{fontSize:10,color:"#AAA",width:20,textAlign:"right"}}>{counts[i]}</span>
                      </div>
                    ))}
                  </div>);
                })()}
              </div>
            </div>

            {/* Breakdown MU vs AF */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[[allMU,"⚠️ Mau Uso","#C62828"],[allAF,"💰 A Faturar","#1565C0"]].map(([list,titulo,cor],ti)=>(
                <div key={ti} className="card" style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"6px 10px",background:cor,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#FFF"}}>{titulo}</div>
                    <div style={{fontWeight:900,fontSize:16,color:"#FFF"}}>{fmtR(list.reduce((acc,p)=>acc+parseVal(p.valor),0))}</div>
                  </div>
                  <div style={{padding:"6px 10px",display:"flex",flexDirection:"column",gap:6}}>
                    {Object.entries(APROV_STATUS).map(([k,s])=>{
                      const items=list.filter(p=>(p.aprovCliente||"aguardando_retorno")===k);
                      if(items.length===0)return null;
                      return(<div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:s.bg,borderRadius:8,border:`1px solid ${s.c}22`}}>
                        <span style={{fontSize:11,fontWeight:700,color:s.c}}>{s.l}</span>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:12,fontWeight:800,color:s.c}}>{fmtR(items.reduce((acc,p)=>acc+parseVal(p.valor),0))}</div>
                          <div style={{fontSize:9,color:"#AAA"}}>{items.length} processo(s)</div>
                        </div>
                      </div>);
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Mau Uso por Empresa (semana) ── */}
            {(()=>{
              const muAll=allMU;
              const hoje=new Date();const semanaAtras=new Date(hoje);semanaAtras.setDate(hoje.getDate()-7);
              const muSemana=muAll.filter(p=>{const d0=p.dataEnvio||p.date;if(!d0)return false;const d=new Date(d0);return !isNaN(d)&&d>=semanaAtras;}).sort((a,b)=>(b.dataEnvio||b.date||"").localeCompare(a.dataEnvio||a.date||""));
              const empData={};muAll.forEach(p=>{const emp=p.empresa||"Sem empresa";if(!empData[emp])empData[emp]={qtd:0,valor:0,mus:[]};empData[emp].qtd++;empData[emp].valor+=parseVal(p.valor);empData[emp].mus.push(p.numMauUso||"—");});
              const empList=Object.entries(empData).sort((a,b)=>b[1].qtd-a[1].qtd).slice(0,10);
              const empChart={labels:empList.map(([e])=>e.length>18?e.slice(0,18)+"…":e),datasets:[{label:"Qtd Mau Uso",data:empList.map(([,d])=>d.qtd),backgroundColor:"#F43F5E",borderRadius:8},{label:"Valor (R$ mil)",data:empList.map(([,d])=>Math.round(d.valor/1000)),backgroundColor:"rgba(244,63,94,0.25)",borderRadius:8}]};
              const empOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11,weight:"600"},boxWidth:12,padding:12}},tooltip:{backgroundColor:"#1E293B",padding:10,cornerRadius:8}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"rgba(0,0,0,.04)"}}}};
              return(
                <div style={{marginTop:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{width:4,height:24,background:"#F43F5E",borderRadius:2}}/><div style={{fontSize:16,fontWeight:900,color:"#1E293B"}}>Mau Uso por Empresa</div></div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
                    <div style={{background:"linear-gradient(135deg,#1E293B,#334155)",borderRadius:12,padding:"8px 12px"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>Total Mau Uso</div>
                      <div style={{fontSize:19,fontWeight:900,color:"#F43F5E"}}>{muAll.length}</div>
                    </div>
                    <div style={{background:"linear-gradient(135deg,#FEF2F2,#FECACA)",borderRadius:12,padding:"8px 12px"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>Enviados p/ Aprovação na Semana</div>
                      <div style={{fontSize:19,fontWeight:900,color:"#DC2626"}}>{muSemana.length}</div>
                      <div style={{fontSize:9,color:"#64748B",marginTop:2}}>últimos 7 dias · por data de envio</div>
                    </div>
                    <div style={{background:"#FFF",borderRadius:12,padding:"8px 12px",borderBottom:"3px solid #F43F5E",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>Valor Total</div>
                      <div style={{fontSize:16,fontWeight:900,color:"#1E293B"}}>{fmtR(muAll.reduce((a,p)=>a+parseVal(p.valor),0))}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
                    <div className="card" style={{padding:12}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:10}}>📊 Empresa × Qtd × Valor</div>
                      {empList.length===0?<div style={{textAlign:"center",color:"#CBD5E1",padding:30}}>Sem dados</div>:<ChartCanvas type="bar" data={empChart} options={empOpts} height={240}/>}
                    </div>
                    <div className="card" style={{padding:12}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:10}}>🏢 Detalhamento por Empresa</div>
                      <div style={{maxHeight:280,overflowY:"auto"}}>
                        {empList.map(([emp,d],i)=>(
                          <div key={i} style={{padding:"7px 8px",borderBottom:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <div style={{fontSize:11,fontWeight:700,color:"#1E293B"}}>{emp}</div>
                              <div style={{fontSize:9,color:"#94A3B8"}}>{d.qtd} processo(s) · MU: {d.mus.slice(0,3).join(", ")}</div>
                            </div>
                            <div style={{fontSize:11,fontWeight:800,color:"#F43F5E"}}>{fmtR(d.valor)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Enviados para aprovação na semana: empresa + nº MU + data de envio */}
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <div style={{padding:"7px 10px",background:"#1E293B",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#FFF"}}>📅 Mau Uso Enviados p/ Aprovação — Últimos 7 dias</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#F43F5E",background:"#FFF",borderRadius:20,padding:"2px 10px"}}>{muSemana.length}</div>
                    </div>
                    {muSemana.length===0?(<div style={{padding:20,textAlign:"center",color:"#CBD5E1",fontSize:11}}>Nenhum envio nos últimos 7 dias</div>):(
                      <div className="tbl-wrap"><table>
                        <thead><tr><th>Empresa</th><th>Nº Mau Uso</th><th>Data Envio</th><th>Status Aprovação</th></tr></thead>
                        <tbody>{muSemana.map(p=>{const as=APROV_STATUS[p.aprovCliente||"aguardando_retorno"];return(
                          <tr key={p.id}>
                            <td style={{fontSize:11,fontWeight:700}}>{p.empresa||"—"}</td>
                            <td style={{fontSize:11}}>{p.numMauUso||"—"}</td>
                            <td style={{fontSize:11}}>{fmtDataBR(p.dataEnvio||p.date)}</td>
                            <td><span style={{fontSize:10,fontWeight:700,color:as?.c||"#888",background:as?.bg||"#F5F5F5",borderRadius:20,padding:"2px 8px"}}>{as?.l||"—"}</span></td>
                          </tr>
                        );})}</tbody>
                      </table></div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>);
        })()}

        {tab==="sas"&&(()=>{
          const SERV={entrega_tecnica:{l:"🔧 Entrega Técnica",c:"#1565C0",bg:"#EFF6FF"},manutencao:{l:"⚙️ Manutenção",c:"#E67E00",bg:"#FFF8F0"},locacao:{l:"🏗️ Locação",c:"#1A7A3C",bg:"#F0FFF5"},outros:{l:"📦 Outros",c:"#888",bg:"#F5F5F5"}};
          const lista=(sas||[]).filter(s=>s&&(showArqSas||s.status!=="arquivado"));
          const pend=lista.filter(s=>s.status==="pendente"||!s.status).length;
          const conc=lista.filter(s=>s.status==="concluido").length;
          const totalVal=lista.reduce((acc,s)=>{const v=parseFloat((s.valor||"0").replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          const applyFilter=(r,d=r.dataSolicitacao||"")=>{
            if(sasSearch){const q=sasSearch.toLowerCase();if(!((r.cliente||"").toLowerCase().includes(q)||(r.nome||"").toLowerCase().includes(q)||(r.equipamento||"").toLowerCase().includes(q)||(r.nfNum||"").toLowerCase().includes(q)||(r.relatorioMov||"").toLowerCase().includes(q)||(r.email||"").toLowerCase().includes(q)))return false;}
            if(sasFrom&&d<sasFrom)return false;
            if(sasTo&&d>sasTo)return false;
            if(sasMes&&!d.slice(5,7).startsWith(sasMes))return false;
            if(sasAno&&!d.startsWith(sasAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📄 SAS</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                <BtnImport onClick={()=>setModalImportSas(true)}/>
                <button onClick={()=>setShowArqSas(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqSas?"#1A1A1A":"#FFF",color:showArqSas?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqSas?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"sas_grupomov",[{key:"dataSolicitacao",label:"Dt Solic."},{key:"email",label:"Email"},{key:"nfNum",label:"NF"},{key:"equipamento",label:"Equipamento"},{key:"cliente",label:"Cliente"},{key:"nome",label:"Nome"},{key:"servico",label:"Serviço"},{key:"dataRealizacao",label:"Dt Realiz."},{key:"relatorioMov",label:"Rel MOV"},{key:"valor",label:"Valor"},{key:"status",label:"Status"}])}/>
                <BtnY onClick={()=>{setSasEdit({dataSolicitacao:TODAY_STR,email:"",nfNum:"",cliente:"",deslocamento:"",observacao:"",nome:"",equipamento:"",relatorioMov:"",valor:"",dataRealizacao:"",envioFaturamento:""});setSasModal(true);}}>+ Novo SAS</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Total R$",v:`R$ ${totalVal.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,c:"#1565C0",bg:"#EFF6FF",i:"💵"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"10px 12px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:9,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:i===3?16:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:"5px 8px",marginBottom:14,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={sasSearch} onChange={e=>setSasSearch(e.target.value)} placeholder="Buscar cliente, equipamento, NF, relatório..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={sasFrom} onChange={e=>setSasFrom(e.target.value)} style={{fontSize:10,padding:"5px 8px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={sasTo} onChange={e=>setSasTo(e.target.value)} style={{fontSize:10,padding:"5px 8px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={sasMes} onChange={e=>setSasMes(e.target.value)} style={{fontSize:10,padding:"5px 8px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={sasAno} onChange={e=>setSasAno(e.target.value)} style={{fontSize:10,padding:"5px 8px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(sasSearch||sasFrom||sasTo||sasMes||sasAno)&&<button onClick={()=>{setSasSearch('');setSasFrom('');setSasTo('');setSasMes('');setSasAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {/* ── SAS DASHBOARD ── */}
            {(()=>{
              const total=listaFil.length;
              const pendentes=listaFil.filter(s=>s.status==="pendente"||!s.status).length;
              const realizados=listaFil.filter(s=>s.status==="realizado").length;
              const faturados=listaFil.filter(s=>s.status==="faturado").length;
              const parseVal=v=>{const n=parseFloat((v||"0").replace(/[^\d.,]/g,"").replace(/\.(\d{3})/g,"$1").replace(",","."));return isNaN(n)?0:n;};
              const totalVal=listaFil.reduce((acc,s)=>acc+parseVal(s.valor),0);
              const fmtR=v=>`R$ ${v.toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
              const MESES_S=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
              const getMesS=d=>{if(!d)return null;const dt=new Date(d);if(isNaN(dt))return null;return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;};
              const mesesS=[...new Set(listaFil.map(s=>getMesS(s.dataSolicitacao)).filter(Boolean))].sort().slice(-6);
              const chartSasData={labels:mesesS.map(m=>{const[y,mo]=m.split("-");return`${MESES_S[parseInt(mo)-1]}/${y.slice(2)}`;}),datasets:[{label:"Solicitações",data:mesesS.map(m=>listaFil.filter(s=>getMesS(s.dataSolicitacao)===m).length),backgroundColor:"#1565C0",borderRadius:5,borderSkipped:false},{label:"Realizadas",data:mesesS.map(m=>listaFil.filter(s=>getMesS(s.dataRealizacao)===m).length),backgroundColor:"#1A7A3C",borderRadius:5,borderSkipped:false}]};
              const barSasOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},animation:{duration:400}};
              const cliMapS={};listaFil.forEach(s=>{if(s.cliente)cliMapS[s.cliente]=(cliMapS[s.cliente]||0)+parseVal(s.valor);});
              const topCliS=Object.entries(cliMapS).sort((a,b)=>b[1]-a[1]).slice(0,5);
              const donutSasData={labels:["Pendente","Realizado","Faturado"],datasets:[{data:[pendentes,realizados,faturados],backgroundColor:["#E67E00","#1565C0","#1A7A3C"],borderWidth:0,borderRadius:4}]};
              return(<>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:16}}>
                  {[{l:"Total",v:total,c:"#1A1A1A",bg:"#FFF",i:"📄"},{l:"Pendentes",v:pendentes,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Realizados",v:realizados,c:"#1565C0",bg:"#EFF6FF",i:"🔧"},{l:"Faturados",v:faturados,c:"#1A7A3C",bg:"#F0FFF5",i:"💰"},{l:"Valor Total",v:fmtR(totalVal),c:"#6A1B9A",bg:"#F3E5F5",i:"💵"}].map((k,i)=>(
                    <div key={i} className="card" style={{padding:"5px 8px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                      <div style={{fontSize:9,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>{k.i} {k.l}</div>
                      <div style={{fontSize:typeof k.v==="string"?13:24,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr",gap:12,marginBottom:16}}>
                  <div className="card" style={{padding:14}}><div style={{fontSize:9,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>📈 Solicitações vs Realizações por Mês</div>{mesesS.length===0?<div style={{textAlign:"center",color:"#CCC",padding:30}}>Sem dados</div>:<ChartCanvas type="bar" data={chartSasData} options={barSasOpts} height={160}/>}</div>
                  <div className="card" style={{padding:14}}><div style={{fontSize:9,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>🍕 Status</div><ChartCanvas type="doughnut" data={donutSasData} options={{responsive:true,maintainAspectRatio:false,cutout:"60%",plugins:{legend:{position:"bottom",labels:{font:{size:9},boxWidth:8}}}}} height={160}/></div>
                  <div className="card" style={{padding:14,display:"flex",flexDirection:"column",gap:7}}><div style={{fontSize:9,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>🏆 Top Clientes</div>{topCliS.length===0?<div style={{color:"#CCC",fontSize:11,textAlign:"center",padding:16}}>Sem dados</div>:topCliS.map(([cli,val],i)=>(<div key={i} style={{display:"flex",flexDirection:"column",gap:3}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,fontWeight:700,color:"#333",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i+1}. {cli}</span><span style={{fontSize:9,fontWeight:800,color:"#1565C0"}}>{fmtR(val)}</span></div><div style={{background:"#F0F0F0",borderRadius:4,height:5}}><div style={{background:`hsl(${210+i*20},70%,45%)`,height:5,borderRadius:4,width:`${topCliS[0][1]>0?(val/topCliS[0][1])*100:0}%`,transition:"width .5s"}}/></div></div>))}</div>
                </div>
              </>);
            })()}
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📄</div><div style={{fontSize:15,fontWeight:600}}>Nenhum registro SAS</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(s=>{
                  const serv=SERV[s.servico||"outros"]||SERV.outros;
                  const ok=s.status==="concluido";
                  const pend=s.status==="pendente"||!s.status;
                  const _gd=(()=>{if(!s.dataGarantia)return null;const _d2=new Date(s.dataGarantia+"T00:00:00"),_h2=new Date();_h2.setHours(0,0,0,0);return Math.floor((_d2-_h2)/86400000);})();const _gc=_gd!==null&&_gd>=0&&_gd<=30?"#DC2626":_gd!==null&&_gd>=0&&_gd<=180?"#D97706":null;
                  return(<div key={s.id} className="card" style={{borderTop:`4px solid ${ok?"#1A7A3C":pend?"#C62828":serv.c}`,padding:0,overflow:"hidden",opacity:s.status==="arquivado"?0.55:1}}>
                    <div style={{padding:"7px 10px",background:ok?"#F0FFF5":pend?"#FFF0F0":serv.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:serv.c,background:"#FFF",border:`1px solid ${serv.c}33`,borderRadius:20,padding:"2px 10px"}}>{serv.l}</span>
                        <select value={s.status||"pendente"} onChange={e=>updateSas(s.id,{status:e.target.value})} style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":pend?"#C62828":"#555",background:ok?"#DCFFE4":pend?"#FFE0E0":"#F0F0F0",cursor:"pointer"}}>
                          <option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option><option value="arquivado">🗄️ Arquivado</option>
                        </select>
                      </div>
                      {_gc&&<div style={{fontSize:9,fontWeight:800,color:_gc,background:_gc+"15",borderRadius:8,padding:"2px 8px"}}>{"🛡️ "+(_gd<=30?"EXPIRA "+_gd+"d":"Gar. "+_gd+"d")}</div>}
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setSasEdit(s);setSasModal(true);}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateSas(s.id,{status:s.status==="arquivado"?"pendente":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{s.status==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delSas(s.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"5px 8px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:11,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{s.cliente||s.nome||<span style={{color:"#CCC"}}>Cliente</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {fmtDataBR(s.dataSolicitacao)} · <b style={{color:"#1565C0"}}>{s.nfNum?`NF ${s.nfNum}`:""}</b></div></div>
                        {s.valor&&<div style={{fontSize:17,fontWeight:900,color:"#1A7A3C"}}>R$ {s.valor}</div>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"5px 8px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Equipamento</div><input type="text" value={s.equipamento||""} onChange={e=>updateSas(s.id,{equipamento:e.target.value})} placeholder="Equip." style={{width:"100%",fontSize:11,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"5px 8px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Rel. MOV · Data Realiz.</div><input type="text" value={s.relatorioMov||""} onChange={e=>updateSas(s.id,{relatorioMov:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        {s.deslocamento&&<div style={{background:"#F8FAFC",borderRadius:8,padding:"5px 8px"}}><div style={{color:"#64748B",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🚗 Desloc.</div><div style={{fontSize:12,fontWeight:700,color:"#334155"}}>R$ {s.deslocamento}</div></div>}
                        {s.envioFaturamento&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"5px 8px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Envio Faturamento</div><div style={{fontSize:11,fontWeight:700,color:"#1A7A3C"}}>{s.envioFaturamento}</div></div>}
                        {s.observacao&&<div style={{background:"#FFFBEB",borderRadius:8,padding:"5px 8px",gridColumn:"span 2"}}><div style={{color:"#D97706",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>📝 Obs</div><div style={{fontSize:11,color:"#555"}}>{s.observacao}</div></div>}
                      </div>
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{s.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

                
        {tab==="carros"&&(()=>{
          const CARRO_FORM_EMPTY={placa:PLACAS_CARROS[0],status:"orcamento_pendente",data:TODAY_STR,responsavel:"",kmAtual:"",kmUltimaRevisao:"",valorUltimaRevisao:"",ultimaRevisaoData:"",itensSubstituidos:[],itensSubstituidosObs:"",itensProximaRevisao:[],itensProximaRevisaoObs:"",proximaRevisaoData:"",oficina:"",obs:"",requisicao:""};
          const toggleIt=(field,val)=>setCarForm(p=>{const a=p[field]||[];return{...p,[field]:a.includes(val)?a.filter(x=>x!==val):[...a,val]};});
          const salvarCarro=()=>{
            if(!carForm.placa){alert("Selecione a placa.");return;}
            if(editCarro){
              updateCarro(editCarro.id,{...carForm});
              setModalCarros(false);setEditCarro(null);setCarForm(CARRO_FORM_EMPTY);
              notify("✅ Registro atualizado!");
            } else {
              const row={id:`CAR${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false,...carForm};
              setCarros(p=>[row,...p]);db.save("carros",row.id,row);
              setModalCarros(false);setCarForm(CARRO_FORM_EMPTY);
              notify("✅ Registro salvo!");
            }
          };
          const abrirEditar=(c)=>{setEditCarro(c);setCarForm({placa:c.placa,status:c.status||"orcamento_pendente",data:c.data||TODAY_STR,responsavel:c.responsavel||"",kmAtual:c.kmAtual||"",kmUltimaRevisao:c.kmUltimaRevisao||"",valorUltimaRevisao:c.valorUltimaRevisao||"",ultimaRevisaoData:c.ultimaRevisaoData||"",itensSubstituidos:c.itensSubstituidos||[],itensSubstituidosObs:c.itensSubstituidosObs||"",itensProximaRevisao:c.itensProximaRevisao||[],itensProximaRevisaoObs:c.itensProximaRevisaoObs||"",proximaRevisaoData:c.proximaRevisaoData||"",oficina:c.oficina||"",obs:c.obs||"",requisicao:c.requisicao||""});setModalCarros(true);};
          const lista=(carros||[]).filter(c=>c&&(showArqCarros||!c.arquivado)&&(carFiltroPlaca==="todas"||c.placa===carFiltroPlaca));
          const applyFilter=(r,d=r.data||"")=>{
            if(carSearch){const q=carSearch.toLowerCase();if(!((r.placa||"").toLowerCase().includes(q)||(r.responsavel||"").toLowerCase().includes(q)||(r.oficina||"").toLowerCase().includes(q)||(r.requisicao||"").toLowerCase().includes(q)||(r.obs||"").toLowerCase().includes(q)))return false;}
            if(carFrom&&d<carFrom)return false;
            if(carTo&&d>carTo)return false;
            if(carMes&&!d.slice(5,7).startsWith(carMes))return false;
            if(carAno&&!d.startsWith(carAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          const itensSubstLabel=(c)=>(c.itensSubstituidos||[]).map(v=>ITENS_REVISAO.find(i=>i.v===v)?.l||v).join(", ")||"—";
          const itensProxLabel=(c)=>(c.itensProximaRevisao||[]).map(v=>ITENS_REVISAO.find(i=>i.v===v)?.l||v).join(", ")||"—";

          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              {/* Modal inserir/editar */}
              {modalCarros&&(
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setModalCarros(false);setEditCarro(null);setCarForm(CARRO_FORM_EMPTY);}}}>
                  <div style={{background:"#FFF",borderRadius:12,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>
                    <div style={{padding:"8px 12px",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#FFF",zIndex:1}}>
                      <div style={{fontWeight:800,fontSize:16,color:"#1A1A1A"}}>{editCarro?"✏️ Editar Registro":"➕ Novo Registro — Carros"}</div>
                      <button onClick={()=>{setModalCarros(false);setEditCarro(null);setCarForm(CARRO_FORM_EMPTY);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888",lineHeight:1}}>✕</button>
                    </div>
                    <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}>
                          <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Placa</label>
                          <select value={carForm.placa} onChange={e=>setCarForm(p=>({...p,placa:e.target.value}))} style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0",fontWeight:700}}>
                            {PLACAS_CARROS.map(p=><option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}>
                          <label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Status</label>
                          <select value={carForm.status} onChange={e=>setCarForm(p=>({...p,status:e.target.value}))} style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"none",fontWeight:700,color:CARRO_STATUS[carForm.status]?.c||"#555",background:CARRO_STATUS[carForm.status]?.bg||"#F5F5F5"}}>
                            {Object.entries(CARRO_STATUS).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Data</label><input type="date" value={carForm.data} onChange={e=>setCarForm(p=>({...p,data:e.target.value}))} style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Responsável</label><input type="text" value={carForm.responsavel} onChange={e=>setCarForm(p=>({...p,responsavel:e.target.value}))} placeholder="Nome" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Km Atual</label><input type="text" value={carForm.kmAtual} onChange={e=>setCarForm(p=>({...p,kmAtual:e.target.value}))} placeholder="Ex: 47500" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Km Última Revisão</label><input type="text" value={carForm.kmUltimaRevisao} onChange={e=>setCarForm(p=>({...p,kmUltimaRevisao:e.target.value}))} placeholder="Ex: 45000" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Valor Última Revisão</label><input type="text" value={carForm.valorUltimaRevisao} onChange={e=>setCarForm(p=>({...p,valorUltimaRevisao:e.target.value}))} placeholder="R$ 0,00" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Data Última Revisão</label><input type="date" value={carForm.ultimaRevisaoData} onChange={e=>setCarForm(p=>({...p,ultimaRevisaoData:e.target.value}))} style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Data Próxima Revisão</label><input type="date" value={carForm.proximaRevisaoData} onChange={e=>setCarForm(p=>({...p,proximaRevisaoData:e.target.value}))} style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                      </div>
                      <div style={{background:"#F8F8F8",borderRadius:8,padding:12}}>
                        <div style={{fontSize:11,fontWeight:800,color:"#555",marginBottom:8}}>✅ Itens Substituídos</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {ITENS_REVISAO.map(it=>{const sel=(carForm.itensSubstituidos||[]).includes(it.v);return(<button key={it.v} onClick={()=>toggleIt("itensSubstituidos",it.v)} style={{fontSize:11,padding:"4px 9px",borderRadius:12,border:sel?"none":"1px solid #E0E0E0",background:sel?"#1A7A3C":"#FFF",color:sel?"#FFF":"#555",cursor:"pointer",fontWeight:sel?700:400}}>{it.l}</button>);})}
                        </div>
                        {(carForm.itensSubstituidos||[]).includes("outros")&&<input type="text" value={carForm.itensSubstituidosObs||""} onChange={e=>setCarForm(p=>({...p,itensSubstituidosObs:e.target.value}))} placeholder="Descrever outros itens substituídos..." style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0",marginTop:8,width:"100%",boxSizing:"border-box"}}/>}
                      </div>
                      <div style={{background:"#F0F4FF",borderRadius:8,padding:12}}>
                        <div style={{fontSize:11,fontWeight:800,color:"#555",marginBottom:8}}>🔜 Itens Próxima Revisão</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {ITENS_REVISAO.map(it=>{const sel=(carForm.itensProximaRevisao||[]).includes(it.v);return(<button key={it.v} onClick={()=>toggleIt("itensProximaRevisao",it.v)} style={{fontSize:11,padding:"4px 9px",borderRadius:12,border:sel?"none":"1px solid #E0E0E0",background:sel?"#1565C0":"#FFF",color:sel?"#FFF":"#555",cursor:"pointer",fontWeight:sel?700:400}}>{it.l}</button>);})}
                        </div>
                        {(carForm.itensProximaRevisao||[]).includes("outros")&&<input type="text" value={carForm.itensProximaRevisaoObs||""} onChange={e=>setCarForm(p=>({...p,itensProximaRevisaoObs:e.target.value}))} placeholder="Descrever outros itens próxima revisão..." style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0",marginTop:8,width:"100%",boxSizing:"border-box"}}/>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Oficina</label><input type="text" value={carForm.oficina} onChange={e=>setCarForm(p=>({...p,oficina:e.target.value}))} placeholder="Nome da oficina" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Nº Requisição</label><input type="text" value={carForm.requisicao||""} onChange={e=>setCarForm(p=>({...p,requisicao:e.target.value}))} placeholder="REQ-000" style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Observações</label><input type="text" value={carForm.obs} onChange={e=>setCarForm(p=>({...p,obs:e.target.value}))} placeholder="Obs gerais..." style={{fontSize:12,padding:"7px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
                      </div>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                        <BtnG onClick={()=>{setModalCarros(false);setEditCarro(null);setCarForm(CARRO_FORM_EMPTY);}}>Cancelar</BtnG>
                        <BtnY onClick={salvarCarro}>{editCarro?"Salvar Alterações":"Adicionar Registro"}</BtnY>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontWeight:900,fontSize:22,marginBottom:2}}>🚙 Carros</div>
                  <div style={{fontSize:13,color:"#888"}}>{lista.length} registro(s)</div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={carFiltroPlaca} onChange={e=>setCarFiltroPlaca(e.target.value)} style={{fontSize:12,padding:"7px 10px",borderRadius:8,border:"1px solid #E0E0E0"}}>
                    <option value="todas">🌐 Todas as placas</option>
                    {PLACAS_CARROS.map(p=><option key={p}>{p}</option>)}
                  </select>
                  <button onClick={()=>setShowArqCarros(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqCarros?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqCarros?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <ExportBar data={lista} filename="carros" cols={[{key:"data",label:"Data"},{key:"placa",label:"Placa"},{key:"status",label:"Status"},{key:"responsavel",label:"Responsável"},{key:"kmAtual",label:"Km Atual"},{key:"kmUltimaRevisao",label:"Km Últ. Rev."},{key:"valorUltimaRevisao",label:"Valor Rev."},{key:"oficina",label:"Oficina"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}]}/>
                  <BtnY onClick={()=>{setEditCarro(null);setCarForm({placa:PLACAS_CARROS[0],status:"orcamento_pendente",data:TODAY_STR,responsavel:"",kmAtual:"",kmUltimaRevisao:"",valorUltimaRevisao:"",ultimaRevisaoData:"",itensSubstituidos:[],itensSubstituidosObs:"",itensProximaRevisao:[],itensProximaRevisaoObs:"",proximaRevisaoData:"",oficina:"",obs:"",requisicao:""});setModalCarros(true);}}>+ Novo Registro</BtnY>
                </div>
              </div>

              {/* Tabela */}
              <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={carSearch} onChange={e=>setCarSearch(e.target.value)} placeholder="Buscar placa, responsável, oficina, requisição..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={carFrom} onChange={e=>setCarFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={carTo} onChange={e=>setCarTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                <select value={carMes} onChange={e=>setCarMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
                <select value={carAno} onChange={e=>setCarAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
                {(carSearch||carFrom||carTo||carMes||carAno)&&<button onClick={()=>{setCarSearch("");setCarFrom("");setCarTo("");setCarMes("");setCarAno("");}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
              </div>
              {listaFil.length===0?(
                <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                  <div style={{fontSize:32,marginBottom:12}}>🚙</div>
                  Nenhum registro. Clique em "+ Novo Registro" para começar.
                </div>
              ):(
                <div className="card" style={{overflow:"hidden"}}>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th><th>Placa</th><th>Status</th><th>Responsável</th>
                          <th>Km Atual</th><th>Km Últ. Rev.</th><th>Data Últ. Rev.</th>
                          <th>Valor Rev.</th><th>Itens Substituídos</th><th>Itens Próx.</th>
                          <th>Próx. Revisão</th><th>Requisição</th><th>Oficina</th><th>Obs</th>
                          <th>Reg. por</th><th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listaFil.map(c=>{
                          const st=CARRO_STATUS[c.status]||CARRO_STATUS.orcamento_pendente;
                          return(
                            <tr key={c.id} style={{opacity:c.arquivado?0.5:1}}>
                              <td style={{whiteSpace:"nowrap",fontSize:11}}>{c.data||"—"}</td>
                              <td><span style={{fontWeight:800,fontSize:13,letterSpacing:.5}}>{c.placa||"—"}</span></td>
                              <td><span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,color:st.c,background:st.bg,whiteSpace:"nowrap"}}>{st.l}</span></td>
                              <td style={{fontSize:11}}>{c.responsavel||"—"}</td>
                              <td style={{fontSize:11,textAlign:"right"}}>{c.kmAtual||"—"}</td>
                              <td style={{fontSize:11,textAlign:"right"}}>{c.kmUltimaRevisao||"—"}</td>
                              <td style={{fontSize:11,whiteSpace:"nowrap"}}>{c.ultimaRevisaoData||"—"}</td>
                              <td style={{fontSize:11,textAlign:"right"}}>{c.valorUltimaRevisao||"—"}</td>
                              <td style={{fontSize:11,maxWidth:180,color:"#1A7A3C"}}>{itensSubstLabel(c)}</td>
                              <td style={{fontSize:11,maxWidth:180,color:"#1565C0"}}>{itensProxLabel(c)}</td>
                              <td style={{fontSize:11,whiteSpace:"nowrap",color:c.proximaRevisaoData&&c.proximaRevisaoData<TODAY_STR?"#C62828":"#333"}}>{c.proximaRevisaoData||"—"}</td>
                              <td style={{fontSize:11}}>{c.oficina||"—"}</td>
                              <td style={{fontSize:11,color:"#1565C0",fontWeight:c.requisicao?700:400}}>{c.requisicao||"—"}</td>
                              <td style={{fontSize:11,maxWidth:140,color:"#888"}}>{c.obs||"—"}</td>
                              <td style={{fontSize:10,color:"#AAA",whiteSpace:"nowrap"}}>{c.registradoPor||"—"}</td>
                              <td style={{whiteSpace:"nowrap"}}>
                                <button onClick={()=>abrirEditar(c)} title="Editar" style={{background:"#F0F4FF",border:"none",borderRadius:5,color:"#1565C0",cursor:"pointer",padding:"3px 7px",fontSize:13,marginRight:3}}>✏️</button>
                                <button onClick={()=>updateCarro(c.id,{arquivado:!c.arquivado})} title={c.arquivado?"Desarquivar":"Arquivar"} style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:13,marginRight:3}}>{c.arquivado?"📤":"🗄️"}</button>
                                <button onClick={()=>{if(window.confirm("Excluir permanentemente?"))delCarro(c.id);}} title="Excluir" style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── APONTAMENTOS OFICINA 150 ── */}
        {tab==="apontamentos_150"&&(()=>{
          const lista=(apontamentos150||[]).filter(a=>a&&(showArqApon||!a.arquivado)).filter(a=>{
            if(ofi150From&&(a.data||"")<ofi150From)return false;
            if(ofi150To&&(a.data||"")>ofi150To)return false;
            if(ofi150OS&&!(a.os||"").toLowerCase().includes(ofi150OS.toLowerCase()))return false;
            if(ofi150Tech!=="todos"&&a.tecnico!==ofi150Tech)return false;
            if(ofi150Serv!=="todos"&&a.servico!==ofi150Serv)return false;
            return true;
          }).sort((a,b)=>(a.data||"").localeCompare(b.data||""));
          const totalMin=lista.reduce((acc,a)=>{const p=(a.total||"0:00").split(":");return acc+(parseInt(p[0]||0)*60+parseInt(p[1]||0));},0);
          const totalStr=`${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}m`;
          const inserir=()=>{
            const total=calcHoras(apon150NovaInicio,apon150NovaTermino);
            const row={id:`AP150${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:apon150NovaData,os:apon150NovaOS,patrimonio:apon150NovaPat,tecnico:apon150NovaTech,servico:apon150NovaServ,inicio:apon150NovaInicio,termino:apon150NovaTermino,total,oficina:"150",obs:apon150NovaObs,arquivado:false};
            setApontamentos150(p=>[...p,row]);db.save("apontamentos_150",row.id,row);
            setApon150NovaOS("");setApon150NovaPat("");setApon150NovaInicio("");setApon150NovaTermino("");setApon150NovaObs("");
            notify("✅ Apontamento salvo!");
          };
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div className="card" style={{marginBottom:16,overflow:"hidden",borderTop:"4px solid #F5C200"}}>
              <div style={{padding:"7px 10px",background:"#1A1A1A",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:900,fontSize:20,color:"#FFF"}}>📝 Apontamentos — Oficina 150</div><div style={{fontSize:12,color:"#F5C200",marginTop:2}}>{lista.length} registro(s) · ⏱ {totalStr}</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqApon150(p=>!p)} style={{padding:"7px 14px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:showArqApon?"rgba(255,255,255,.15)":"transparent",color:"#FFF",fontSize:11,cursor:"pointer",fontWeight:600}}>📁 {showArqApon?"Ocultar":"Arquivados"}</button>
                  <label style={{padding:"7px 14px",borderRadius:8,border:"1px solid #8B5CF6",background:"#F5F3FF",fontSize:12,cursor:"pointer",color:"#8B5CF6",fontWeight:700,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:4}}>
                    📄 Ler PDF
                    <input type="file" accept=".pdf" style={{display:"none"}} onChange={async e=>{
                      const file=e.target.files[0];if(!file)return;
                      try{
                        const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
                        const resp=await fetch("https://mov-ia.vercel.app/api/read-pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pdfBase64:b64})});
                        const respText=await resp.text();
                        if(!resp.ok)throw new Error(respText.slice(0,200));
                        let data;try{data=JSON.parse(respText);}catch(ex){throw new Error("Resposta inválida");}
                        const txt=data.content?.[0]?.text||"{}";
                        const clean=txt.replace(/```json|```/g,"").trim();
                        const parsed=JSON.parse(clean);
                        const row={id:"AP"+Date.now(),data:parsed.data||"",os:parsed.os||parsed.numero||"",patrimonio:parsed.patrimonio||"",tecnico:parsed.tecnico||"",servico:parsed.servico||parsed.tipo||"",inicio:parsed.inicio||"",termino:parsed.termino||parsed.fim||"",total:parsed.total||parsed.horas||"",obs:parsed.obs||parsed.observacao||"",registradoPor:user.name};
                        setApontamentos150(p=>[row,...(p||[])]);db.save("apontamentos_150",row.id,row);
                        notify("✅ Apontamento criado via PDF!");
                      }catch(err){alert("Erro PDF: "+(err?.message||JSON.stringify(err)));}
                      e.target.value="";
                    }}/>
                  </label>
                  <BtnImport onClick={()=>setModalImportApon150(true)}/>
                  <BtnExcel onClick={()=>exportCSV(lista,"apontamentos_150",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"PAT"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"obs",label:"Obs"},{key:"modelo",label:"Modelo"}])}/>
                </div>
              </div>
              <div style={{padding:"7px 10px",background:"#FFFBF0",borderBottom:"2px solid #FFE8A0",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Data</label><input type="date" value={apon150NovaData} onChange={e=>setApon150NovaData(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>OS</label><input type="text" value={apon150NovaOS} onChange={e=>setApon150NovaOS(e.target.value)} placeholder="OS-001" style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:80}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>PAT</label><input type="text" value={apon150NovaPat} onChange={e=>setApon150NovaPat(e.target.value)} placeholder="PAT-001" style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:90}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Técnico</label><select value={apon150NovaTech} onChange={e=>setApon150NovaTech(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:600}}>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Serviço</label><select value={apon150NovaServ} onChange={e=>setApon150NovaServ(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",fontWeight:700,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Início</label><input type="time" value={apon150NovaInicio} onChange={e=>setApon150NovaInicio(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Término</label><input type="time" value={apon150NovaTermino} onChange={e=>setApon150NovaTermino(e.target.value)} style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF"}}/></div>
                {(apon150NovaInicio&&apon150NovaTermino)&&<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:9,fontWeight:700,color:"#C47D00",textTransform:"uppercase"}}>Total</label><span style={{fontSize:13,fontWeight:900,color:"#C47D00",background:"#FFF",border:"1.5px solid #FFE8A0",borderRadius:8,padding:"7px 10px"}}>{calcHoras(apon150NovaInicio,apon150NovaTermino)}</span></div>}
                <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:120}}><label style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase"}}>Obs</label><input type="text" value={apon150NovaObs} onChange={e=>setApon150NovaObs(e.target.value)} placeholder="Observação..." style={{fontSize:12,padding:"7px 9px",borderRadius:8,border:"1.5px solid #E0E0E0",background:"#FFF",width:"100%"}}/></div>
                <BtnY onClick={inserir}>Salvar</BtnY>
              </div>
              <div style={{padding:"10px 18px",background:"#F8F9FA",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{position:"relative",flex:1,minWidth:160}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:12}}>🔍</span><input type="text" value={ofi150OS} onChange={e=>setOfi150OS(e.target.value)} placeholder="Buscar OS, PAT..." style={{width:"100%",padding:"6px 10px 6px 26px",fontSize:12,borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={ofi150From} onChange={e=>setOfi150From(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={ofi150To} onChange={e=>setOfi150To(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}/></div>
                <select value={ofi150Tech} onChange={e=>setOfi150Tech(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}><option value="todos">Todos técnicos</option>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                <select value={ofi150Serv} onChange={e=>setOfi150Serv(e.target.value)} style={{fontSize:12,padding:"6px 9px",borderRadius:8,border:"1px solid #E0E0E0",background:"#FFF"}}><option value="todos">Todos serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                {(ofi150From||ofi150To||ofi150OS||ofi150Tech!=="todos"||ofi150Serv!=="todos")&&<button onClick={()=>{setOfi150From("");setOfi150To("");setOfi150OS("");setOfi150Tech("todos");setOfi150Serv("todos");}} style={{padding:"6px 12px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:11,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
              </div>
            </div>
            {lista.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}><div style={{fontSize:32,marginBottom:8}}>📝</div>Preencha o formulário acima e clique em Salvar</div>):(
              <div className="card" style={{overflow:"hidden"}}><div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#1A1A1A"}}>
                    {["Data","OS","PAT","Modelo","Técnico","Serviço","Início","Término","Total","Obs",""].map((h,i)=>(
                      <th key={i} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.8,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lista.map((a,idx)=>{
                      const cor=({Mecânica:"#1565C0",Elétrica:"#E67E00",Bateria:"#C47D00",Hidráulica:"#00838F",Pintura:"#8E44AD","Pequenos Reparos":"#1A7A3C",Soldagem:"#546E7A",Usinagem:"#37474F",Carregador:"#00838F",Outros:"#888"})[a.servico]||"#555";
                      return(<tr key={a.id} style={{borderBottom:"1px solid #F0F0F0",background:a.arquivado?"#FAFAFA":idx%2===0?"#FFF":"#F8FFFE",opacity:a.arquivado?0.55:1}}>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap",fontWeight:700,color:"#1A1A1A"}}>{fmtDataBR(a.data)}</td>
                        <td style={{padding:"10px 12px",fontWeight:800,color:"#1565C0"}}>{a.os||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555"}}>{a.patrimonio||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#555"}}>{a.modelo||"—"}</td>
                        <td style={{padding:"10px 12px",fontWeight:600}}>{a.tecnico||"—"}</td>
                        <td style={{padding:"10px 12px"}}><span style={{fontSize:11,fontWeight:700,color:cor,background:cor+"18",borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap"}}>{a.servico||"—"}</span></td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555",whiteSpace:"nowrap"}}>{a.inicio||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#555",whiteSpace:"nowrap"}}>{a.termino||"—"}</td>
                        <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#C47D00",background:"#FFFBF0",border:"2px solid #FFE8A0",borderRadius:8,padding:"4px 10px",whiteSpace:"nowrap"}}>{a.total||"—"}</span></td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#888",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.obs||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:10,color:"#AAA",whiteSpace:"nowrap"}}>{a.registradoPor||"—"}</td>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}><div style={{display:"flex",gap:4}}>
                          <button onClick={()=>{setApon150NovaData(a.data||TODAY_STR);setApon150NovaOS(a.os||"");setApon150NovaPat(a.patrimonio||"");setApon150NovaTech(a.tecnico||OFICINA_150_TECHS[0]);setApon150NovaServ(a.servico||SERVICOS_OFICINA[0]);setApon150NovaInicio(a.inicio||"");setApon150NovaTermino(a.termino||"");setApon150NovaObs(a.obs||"");delApon150(a.id);window.scrollTo(0,0);notify("✏️ Dados carregados no formulário — edite e salve!");}} title="Editar" style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"5px 7px",fontSize:13}}>✏️</button>
                          <button onClick={()=>updateApon150(a.id,{arquivado:!a.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"5px 7px",fontSize:12}}>{a.arquivado?"📤":"🗄️"}</button>
                          <button onClick={()=>{if(window.confirm("Excluir?"))delApon150(a.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"5px 7px",fontSize:11,fontWeight:700}}>✕</button>
                        </div></td>
                      </tr>);
                    })}
                  </tbody>
                  <tfoot><tr style={{background:"#1A1A1A"}}>
                    <td colSpan={7} style={{padding:"10px 12px",fontSize:11,fontWeight:700,color:"#94A3B8"}}>{lista.length} registro(s)</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:13,fontWeight:900,color:"#F5C200",background:"rgba(245,194,0,.12)",border:"1px solid rgba(245,194,0,.3)",borderRadius:8,padding:"4px 10px"}}>{totalStr}</span></td>
                    <td colSpan={3}/>
                  </tr></tfoot>
                </table></div></div>
            )}
          </div>);
        })()}
        {/* ── AGENDA OFICINA 150 ── */}
        {tab==="agenda_ofi_150"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfi150Year}-${String(agOfi150Month+1).padStart(2,"0")}`;
          const addAtend150=()=>{
            const dataFinal=agOfi150Date||`${ym}-01`;
            if(!agOfi150Empresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agOfi150TechSel}__${dataFinal}`;
            saveAgendaOfi150(key,[...(agendaOfi150[key]||[]),{client:agOfi150Empresa,horimetro:agOfi150Horimetro||"",patrimonio:agOfi150Pat||"",servico:agOfi150ServSel,status:"agendada",horaEntrada:agOfi150Entrada,horaSaida:agOfi150Saida,horasTrabalhadas:calcHoras(agOfi150Entrada,agOfi150Saida),obs:agOfi150Obs,relatorio:agOfi150Relatorio||""}]);
            setAgOfi150Empresa("");setAgOfi150Pat("");setAgOfi150Entrada("");setAgOfi150Saida("");setAgOfi150Obs("");setAgOfi150Relatorio("");
            notify("✅ Atendimento Oficina 150 salvo!");
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🗓 Agenda Oficina 150</div><div style={{fontSize:13,color:"#888"}}>Matheus · Pedro Souza · Pedro Pimentel — {MESES[agOfi150Month]} {agOfi150Year}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <select value={agOfi150Tech} onChange={e=>setAgOfi150Tech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos</option>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <select value={agOfi150Servico} onChange={e=>setAgOfi150Servico(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <select value={agOfi150Month} onChange={e=>setAgOfi150Month(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                  <select value={agOfi150Year} onChange={e=>setAgOfi150Year(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
                </div>
              </div>
              {!isReadOnlyAgenda(user)&&(
<div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agOfi150TechSel} onChange={e=>setAgOfi150TechSel(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agOfi150Date||`${ym}-01`} onChange={e=>setAgOfi150Date(e.target.value)} style={{fontSize:12,padding:"6px 8px"}}/>
                  <input type="text" placeholder="Empresa/Serviço" value={agOfi150Empresa} onChange={e=>setAgOfi150Empresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",flex:1,minWidth:140}}/>
                  <input type="text" placeholder="Horímetro" value={agOfi150Horimetro||""} onChange={e=>setAgOfi150Horimetro(e.target.value)} style={{fontSize:12,padding:"7px 8px",width:100}}/>
                  <input type="text" placeholder="Patrimônio" value={agOfi150Pat} onChange={e=>setAgOfi150Pat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <select value={agOfi150ServSel} onChange={e=>setAgOfi150ServSel(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Ent.</span><input type="time" value={agOfi150Entrada} onChange={e=>setAgOfi150Entrada(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Saí.</span><input type="time" value={agOfi150Saida} onChange={e=>setAgOfi150Saida(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <input type="text" placeholder="Obs..." value={agOfi150Obs} onChange={e=>setAgOfi150Obs(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <input type="text" placeholder="Nº Relatório" value={agOfi150Relatorio||""} onChange={e=>setAgOfi150Relatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <BtnY onClick={addAtend150}>Adicionar</BtnY>
                </div>
              </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {OFICINA_150_TECHS.filter(t=>agOfi150Tech==="todos"||t===agOfi150Tech).map(tech=>{
                  const color=techColor(tech);
                  const entries=[];
                  Object.keys(agendaOfi150).forEach(k=>{
                    const i=k.indexOf("__"); if(i<0) return;
                    const kt=k.slice(0,i), kd=k.slice(i+2);
                    if(kt!==tech||!kd.startsWith(ym)) return;
                    (agendaOfi150[k]||[]).forEach((s,si)=>{
                      if(agOfi150Servico==="todos"||s.servico===agOfi150Servico) entries.push({s,date:kd,key:k,si});
                    });
                  });
                  entries.sort((a,b)=>a.date.localeCompare(b.date));
                  return(
                    <div key={tech} className="card" style={{borderTop:`4px solid ${color}`,overflow:"hidden",transition:"transform .2s",cursor:"default"}}>
                      <div style={{padding:"8px 10px",borderBottom:"1px solid #F4F4F4"}}>
                        <div style={{fontWeight:700,fontSize:14}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                        <div style={{fontSize:11,color:"#AAA",marginTop:2}}>{entries.length} atendimento(s) · {MESES[agOfi150Month]}</div>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {entries.length===0&&<div style={{fontSize:12,color:"#CCC",textAlign:"center",padding:"8px 0"}}>Sem atendimentos</div>}
                        {entries.map((e,ix)=>{const dia=e.date.slice(8,10);return(
                          <div key={ix} style={{padding:"8px 0",borderBottom:"1px solid #F8F8F8"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#fff",background:color,borderRadius:6,padding:"1px 7px"}}>Dia {dia}</span>
                              <span style={{fontSize:12,fontWeight:700,color:"#222",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.s.client}</span>
                              {!isReadOnlyAgenda(user)&&(<><button onClick={()=>{setEditSlot({key:e.key,si:e.si,slot:e.s,tipo:"ofi150"});setEditSlotForm({...e.s});}} style={{background:"none",border:"none",color:"#1565C0",cursor:"pointer",fontSize:13,marginRight:2}}>✏️</button><button onClick={()=>{if(window.confirm("Remover?")){const arr=(agendaOfi150[e.key]||[]).filter((_,j)=>j!==e.si);saveAgendaOfi150(e.key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:13}}>✕</button></>)}
                            </div>
                            <div style={{fontSize:11,color:"#888",marginBottom:4}}>🏷️ {e.s.patrimonio||"—"} · <b style={{color:"#1565C0"}}>{e.s.servico||"—"}</b></div>
                            <div style={{marginBottom:4}}><input type="text" value={e.s.relatorio||""} placeholder="Nº Relatório" onChange={ev=>{const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,relatorio:ev.target.value};saveAgendaOfi150(e.key,arr);}} disabled={isReadOnlyAgenda(user)} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/></div>
                            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                              <input type="time" value={e.s.horaEntrada||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,horaEntrada:v,horasTrabalhadas:calcHoras(v,e.s.horaSaida)};saveAgendaOfi150(e.key,arr);}} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"2px 4px",width:78,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/>
                              <input type="time" value={e.s.horaSaida||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,horaSaida:v,horasTrabalhadas:calcHoras(e.s.horaEntrada,v)};saveAgendaOfi150(e.key,arr);}} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"2px 4px",width:78,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/>
                              <span style={{fontSize:10,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:5,padding:"2px 6px"}}>{e.s.horasTrabalhadas||calcHoras(e.s.horaEntrada,e.s.horaSaida)||"—"}</span>
                            </div>
                            {e.s.obs&&<div style={{fontSize:10,color:"#888",fontStyle:"italic",marginBottom:4}}>{e.s.obs}</div>}
                            <select value={e.s.status||"agendada"} onChange={ev=>{const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,status:ev.target.value};saveAgendaOfi150(e.key,arr);}} disabled={isReadOnlyAgenda(user)} style={{fontSize:10,padding:"2px 5px",fontWeight:700,borderRadius:6,border:"1px solid #E0E0E0",width:"100%"}}>
                              <option value="agendada">Agendada</option><option value="concluida">Concluída</option><option value="cancelada">Cancelada</option><option value="remarcada">Remarcada</option>
                            </select>
                          </div>
                        );})}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── DASHBOARD OFICINA 150 ── */}
        {tab==="dashboard_ofi_150"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfi150Year}-${String(agOfi150Month+1).padStart(2,"0")}`;
          const parseMin=h=>{if(!h)return 0;const m=String(h).match(/(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
          const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"0h00";
          const apMes=(apontamentos150||[]).filter(a=>{
            if(!a.data)return false;
            if(dashOfi150From&&a.data<dashOfi150From)return false;
            if(dashOfi150To&&a.data>dashOfi150To)return false;
            if(!dashOfi150From&&!dashOfi150To&&!a.data.startsWith(ym))return false;
            if(dashOfi150Tech!=="todos"&&a.tecnico!==dashOfi150Tech)return false;
            return true;
          });
          const totalMin=apMes.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
          const osList=[...new Set(apMes.map(a=>a.os).filter(Boolean))];
          const byTech={};
          OFICINA_150_TECHS.forEach(t=>{
            const aps=apMes.filter(a=>a.tecnico===t);
            const mins=aps.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
            const porServ={};SERVICOS_OFICINA.forEach(s=>{porServ[s]=aps.filter(a=>a.servico===s).length;});
            byTech[t]={aps,mins,porServ};
          });
          const byServ={};
          SERVICOS_OFICINA.forEach(s=>{
            const aps=apMes.filter(a=>a.servico===s);
            byServ[s]={qtd:aps.length,mins:aps.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0)};
          });
          const byOS={};
          osList.forEach(os=>{
            const aps=apMes.filter(a=>a.os===os);
            byOS[os]={aps,mins:aps.reduce((s,a)=>s+parseMin(a.total||calcHoras(a.inicio,a.termino)),0),tecnico:aps[0]?.tecnico||"—",servico:aps[0]?.servico||"—"};
          });
          const techAtivos=OFICINA_150_TECHS.filter(t=>byTech[t].aps.length>0);
          const chartHoras={labels:techAtivos.length>0?techAtivos:OFICINA_150_TECHS,datasets:[{label:"Horas Trabalhadas",data:techAtivos.length>0?techAtivos.map(t=>+(byTech[t].mins/60).toFixed(1)):OFICINA_150_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)):OFICINA_150_TECHS.map(t=>techColor(t)),borderRadius:6,borderSkipped:false}]};
          const chartApon={labels:techAtivos.length>0?techAtivos:OFICINA_150_TECHS,datasets:[{label:"Apontamentos",data:techAtivos.length>0?techAtivos.map(t=>byTech[t].aps.length):OFICINA_150_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)+"CC"):OFICINA_150_TECHS.map(t=>techColor(t)+"CC"),borderRadius:6,borderSkipped:false}]};
          const servAtivos=SERVICOS_OFICINA.filter(s=>byServ[s].qtd>0);
          const SERV_COLORS150=["#1565C0","#C62828","#E67E00","#F5C200","#1A7A3C","#00838F","#AD1457","#6A1B9A","#4E342E","#37474F"];
          const chartServ={labels:servAtivos,datasets:[
            {label:"Qtd Apontamentos",data:servAtivos.map(s=>byServ[s].qtd),backgroundColor:SERV_COLORS150.slice(0,servAtivos.length),borderRadius:6,borderSkipped:false},
            {label:"Horas",data:servAtivos.map(s=>+(byServ[s].mins/60).toFixed(1)),backgroundColor:SERV_COLORS150.slice(0,servAtivos.length).map(c=>c+"80"),borderRadius:6,borderSkipped:false}
          ]};
          const chartServTech150={
            labels:techAtivos,
            datasets:servAtivos.map((serv,si)=>({
              label:serv,
              data:techAtivos.map(t=>byTech[t].porServ[serv]||0),
              backgroundColor:SERV_COLORS150[si%SERV_COLORS150.length],
              borderRadius:4,borderSkipped:false,
            }))
          };
          const chartHorasServTech150={
            labels:techAtivos,
            datasets:servAtivos.map((serv,si)=>({
              label:serv,
              data:techAtivos.map(t=>{
                const aps=byTech[t].aps.filter(a=>a.servico===serv);
                return +(aps.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0)/60).toFixed(1);
              }),
              backgroundColor:SERV_COLORS150[si%SERV_COLORS150.length],
              borderRadius:4,borderSkipped:false,
            }))
          };
          const chartOpts=()=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>`${c.dataset.label}: ${c.parsed.y}`}}},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}});
          const chartOptsStacked150=()=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"bottom",labels:{font:{size:10},boxWidth:12}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:11}}},y:{stacked:true,beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}});
          return(
        <div style={{animation:"fadeIn .3s ease"}}>
          {/* Cabeçalho + Filtros */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontWeight:900,fontSize:24,marginBottom:2}}>📊 Dashboard Oficina 150</div>
              <div style={{fontSize:12,color:"#888"}}>{MESES[agOfi150Month]} {agOfi150Year} · {apMes.length} apontamentos · {techAtivos.length} técnico(s) ativo(s)</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={dashOfi150Tech} onChange={e=>setDashOfi150Tech(e.target.value)} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}><option value="todos">👷 Todos técnicos</option>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={agOfi150Month} onChange={e=>setAgOfi150Month(Number(e.target.value))} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
              <select value={agOfi150Year} onChange={e=>setAgOfi150Year(Number(e.target.value))} style={{fontSize:12,padding:"6px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}>{[2025,2026,2027,2028,2029].map(y=><option key={y}>{y}</option>)}</select>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={dashOfi150From} onChange={e=>setDashOfi150From(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={dashOfi150To} onChange={e=>setDashOfi150To(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:"1px solid #E0E0E0"}}/></div>
              {(dashOfi150Tech!=="todos"||dashOfi150From||dashOfi150To)&&<BtnG onClick={()=>{setDashOfi150Tech("todos");setDashOfi150From("");setDashOfi150To("");}}>✕ Limpar</BtnG>}
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            {[
              {icon:"📋",l:"Total Apontamentos",v:apMes.length,c:"#1A1A1A",bg:"#FFF"},
              {icon:"⏱",l:"Horas Totais",v:fmtMin(totalMin),c:"#1565C0",bg:"#F0F4FF"},
              {icon:"👷",l:"Técnicos Ativos",v:techAtivos.length,c:"#1A7A3C",bg:"#F0FFF5"},
              {icon:"🔧",l:"OSs Únicas",v:osList.length,c:"#C47D00",bg:"#FFFBF0"},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"8px 12px",borderTop:`4px solid ${s.c}`,background:s.bg}}>
                <div style={{fontSize:11,color:"#888",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.icon} {s.l}</div>
                <div style={{fontSize:32,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Gráficos */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>⏱ Horas Trabalhadas por Técnico</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Total de horas no período</div>
              <ChartCanvas type="bar" data={chartHoras} options={chartOpts()} height={220}/>
            </div>
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>📋 Apontamentos por Técnico</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Quantidade de registros no período</div>
              <ChartCanvas type="bar" data={chartApon} options={chartOpts()} height={220}/>
            </div>
          </div>
          {servAtivos.length>0&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>🔧 Qtd de Serviços por Técnico</div>
                <div style={{fontSize:11,color:"#888",marginBottom:12}}>Cada cor = um tipo de serviço (empilhado)</div>
                <ChartCanvas type="bar" data={chartServTech150} options={chartOptsStacked150()} height={220}/>
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>⏱ Horas por Serviço por Técnico</div>
                <div style={{fontSize:11,color:"#888",marginBottom:12}}>Cada cor = um tipo de serviço (empilhado)</div>
                <ChartCanvas type="bar" data={chartHorasServTech150} options={chartOptsStacked150()} height={220}/>
              </div>
            </div>
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>📊 Serviços Realizados — Qtd e Horas</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Barras sólidas = quantidade · translúcidas = horas</div>
              <ChartCanvas type="bar" data={chartServ} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"top",labels:{font:{size:10},boxWidth:12}}},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{beginAtZero:true,grid:{color:"#F0F0F0"},ticks:{precision:0,font:{size:11}}}},animation:{duration:600}}} height={Math.max(180,servAtivos.length*35)}/>
            </div>
          </>}

          {/* Por Técnico detalhado */}
          <div style={{fontSize:13,fontWeight:800,color:"#555",marginBottom:12}}>👷 Detalhamento por Técnico</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {techAtivos.map(tech=>{
              const d=byTech[tech];
              const color=techColor(tech);
              const pct=totalMin>0?Math.round(d.mins/totalMin*100):0;
              return(
                <div key={tech} className="card" style={{padding:16,borderLeft:`5px solid ${color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                    <div style={{fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:10,height:10,borderRadius:"50%",background:color,display:"inline-block"}}/>{tech}
                    </div>
                    <div style={{display:"flex",gap:10,fontSize:12,flexWrap:"wrap"}}>
                      <span style={{background:"#F0F4FF",color:"#1565C0",fontWeight:700,padding:"4px 12px",borderRadius:6}}>📋 {d.aps.length} apontamentos</span>
                      <span style={{background:"#FFFBF0",color:"#C47D00",fontWeight:700,padding:"4px 12px",borderRadius:6}}>⏱ {fmtMin(d.mins)}</span>
                      <span style={{background:"#F5F5F5",color:"#555",fontWeight:700,padding:"4px 12px",borderRadius:6}}>{pct}% do total</span>
                    </div>
                  </div>
                  <div style={{height:6,background:"#F0F0F0",borderRadius:3,marginBottom:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3}}/>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {SERVICOS_OFICINA.filter(s=>d.porServ[s]>0).map(serv=>(
                      <span key={serv} style={{background:"#F0F4FF",border:"1px solid #DBEAFE",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#1565C0",fontWeight:600}}>
                        {serv} <b style={{color:"#1A1A1A"}}>({d.porServ[serv]})</b>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {apMes.length===0&&<div style={{color:"#CCC",textAlign:"center",padding:40,fontSize:13}}>Sem apontamentos no período.</div>}
          </div>

          {/* Por OS */}
          {osList.length>0&&<>
            <div style={{fontSize:13,fontWeight:800,color:"#555",marginBottom:12}}>🗂 Detalhamento por OS</div>
            <div className="card" style={{overflow:"hidden",marginBottom:20}}>
              <div className="tbl-wrap"><table>
                <thead><tr><th>OS</th><th>Técnico</th><th>Serviço</th><th>Qtd</th><th>Horas</th><th>% Total</th><th>Patrimônio</th></tr></thead>
                <tbody>{osList.map(os=>{
                  const d=byOS[os];
                  const pct=totalMin>0?Math.round(d.mins/totalMin*100):0;
                  return(<tr key={os}>
                    <td style={{fontWeight:700,color:"#1565C0"}}>{os}</td>
                    <td><span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:"50%",background:techColor(d.tecnico),display:"inline-block"}}/>{d.tecnico}</span></td>
                    <td><span style={{background:"#F0F4FF",color:"#1565C0",fontWeight:600,padding:"2px 8px",borderRadius:5,fontSize:11}}>{d.servico}</span></td>
                    <td style={{textAlign:"center",fontWeight:700}}>{d.aps.length}</td>
                    <td><span style={{color:"#C47D00",fontWeight:700}}>{fmtMin(d.mins)}</span></td>
                    <td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{flex:1,height:6,background:"#F0F0F0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"#1565C0",borderRadius:3}}/></div><span style={{fontSize:11,fontWeight:700,minWidth:30}}>{pct}%</span></div></td>
                    <td style={{fontSize:11,color:"#888"}}>{[...new Set(d.aps.map(a=>a.patrimonio).filter(Boolean))].join(", ")||"—"}</td>
                  </tr>);
                })}</tbody>
              </table></div>
            </div>
          </>}
        </div>
          );
        })()}


        {/* ── PENDÊNCIAS MATHEUS ── */}
                {tab==="pendencias_matheus"&&(user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_m")&&(()=>{
          const SERVICOS=["ADM Manutenção","Comercial","Frota","Manutenção Frota","Manutenção Cliente","Manutenção Peças","Solicitação Diretoria","Retirada de Peças","Liberação Técnica","Ajuste de Ponto","Solicitação de E-mail","Férias","Atestado","Organização Oficina","Rupturas","Outros"];
          const S_EQUIP=["Comercial","Frota","Manutenção Frota","Manutenção Cliente","Manutenção Peças","Solicitação Diretoria","Retirada de Peças","Liberação Técnica"];
          const S_OBS=["Solicitação Diretoria","Retirada de Peças","Liberação Técnica","Ajuste de Ponto","Solicitação de E-mail","Férias","Atestado","Organização Oficina","Rupturas","Outros"];
          const EQ_OPT=["Cliente","Patrimônio/Nº Série","OS ou REL","Máquina","Bateria","Carregador","Carrinho","Outros"];
          const PM={urgente:{l:"🔴 Urgente",c:"#DC2626"},medio:{l:"🟡 Médio",c:"#D97706"},normal:{l:"🟢 Normal",c:"#059669"}};
          const SM={pendente:"⏳ Pendente",em_andamento:"🔄 Em Andamento",concluido:"✅ Concluído"};
          const list=(pendMatheus||[]).filter(r=>r&&(showArqMat||!r.arquivado));
          const fS=formServM;const sfS=setFormServM;const fM=filtroMesM;const sfM=setFiltroMesM;
          const shEq=S_EQUIP.includes(fS.servico);const shOb=S_OBS.includes(fS.servico);
          const reset=()=>sfS({data:TODAY_STR,servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});
          const addS=()=>{if(!fS.servico)return notify("Selecione um serviço");const rec={...fS,id:Date.now().toString(),registradoPor:user.name,criadoEm:new Date().toISOString()};setPendMatheus(p=>[rec,...p]);db.save("pendencias_matheus",[rec,...pendMatheus]);reset();notify("Serviço registrado!");};
          const updS=(id,patch)=>{const n=(pendMatheus||[]).map(r=>r.id===id?{...r,...patch}:r);setPendMatheus(n);db.save("pendencias_matheus",n);};
          const delS=id=>{if(!window.confirm("Excluir?"))return;const n=(pendMatheus||[]).filter(r=>r.id!==id);setPendMatheus(n);db.save("pendencias_matheus",n);};
          const arcS=id=>{const n=(pendMatheus||[]).map(r=>r.id===id?{...r,arquivado:!r.arquivado}:r);setPendMatheus(n);db.save("pendencias_matheus",n);};
          const lF=fM?list.filter(r=>r.data&&r.data.startsWith(fM)):list;
          const dT=lF.length;const dP=lF.filter(r=>r.status==="pendente"||!r.status).length;const dA=lF.filter(r=>r.status==="em_andamento").length;const dC=lF.filter(r=>r.status==="concluido").length;
          const svc={};lF.forEach(r=>{const s=r.servico||"—";svc[s]=(svc[s]||0)+1;});const topS=Object.entries(svc).sort((a,b)=>b[1]-a[1]).slice(0,6);
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><div style={{fontWeight:900,fontSize:22,letterSpacing:-.5}}>📋 Serviços Administrativos — Oficina 150</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{lF.length} registro(s)</div></div>
                <BtnImport onClick={()=>setModalImportPM(true)}/>
                <button onClick={()=>setShowArqMat(!showArqMat)} style={{background:showArqMat?"#D97706":"#F5F5F5",color:showArqMat?"#FFF":"#888",border:"none",borderRadius:10,padding:"8px 16px",fontWeight:700,fontSize:12,cursor:"pointer"}}>{showArqMat?"📦 Arquivados":"📦 Arquivados"}</button>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <input type="month" value={fM} onChange={e=>sfM(e.target.value)} style={{fontSize:11,padding:"6px 10px",borderRadius:8,border:"1.5px solid #E0E0E0"}}/>
                {fM&&<button onClick={()=>sfM("")} style={{fontSize:10,padding:"5px 10px",borderRadius:8,border:"none",background:"#F0F0F0",cursor:"pointer",fontWeight:700}}>Limpar</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
                {[{l:"Total",v:dT,c:"#1E293B",bg:"#F8FAFC"},{l:"Pendentes",v:dP,c:"#D97706",bg:"#FFFBEB"},{l:"Em Andamento",v:dA,c:"#2563EB",bg:"#EFF6FF"},{l:"Concluídos",v:dC,c:"#059669",bg:"#ECFDF5"}].map((k,ki)=>(
                  <div key={ki} style={{background:k.bg,borderRadius:12,padding:"8px 10px",borderLeft:`4px solid ${k.c}`}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
                    <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {topS.length>0&&<div style={{background:"#FFF",borderRadius:12,padding:14,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#334155",marginBottom:8}}>🔧 Top Serviços</div>
                {topS.map(([s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#555"}}>{s}</span><span style={{fontWeight:800,color:"#2563EB"}}>{c}</span></div>)}
              </div>}
              {(()=>{
                const prioCnt={urgente:lF.filter(r=>r.prioridade==="urgente").length,medio:lF.filter(r=>r.prioridade==="medio").length,normal:lF.filter(r=>r.prioridade==="normal"||!r.prioridade).length};
                const svcCnt={};lF.forEach(r=>{const ss=r.servico||"—";svcCnt[ss]=(svcCnt[ss]||0)+1;});
                const svcTop=Object.entries(svcCnt).sort((a,b)=>b[1]-a[1]).slice(0,8);
                const stsCnt={pendente:dP,em_andamento:dA,concluido:dC};
                const chSts={labels:["Pendente","Em Andamento","Concluído"],datasets:[{data:[stsCnt.pendente,stsCnt.em_andamento,stsCnt.concluido],backgroundColor:["#F59E0B","#3B82F6","#10B981"],borderWidth:0}]};
                const chPrio={labels:["Urgente","Médio","Normal"],datasets:[{data:[prioCnt.urgente,prioCnt.medio,prioCnt.normal],backgroundColor:["#DC2626","#F59E0B","#10B981"],borderWidth:0}]};
                const chSvc={labels:svcTop.map(s=>s[0].length>15?s[0].slice(0,15)+"…":s[0]),datasets:[{label:"Qtd",data:svcTop.map(s=>s[1]),backgroundColor:"#3B82F6",borderRadius:6}]};
                const doOpt={responsive:true,maintainAspectRatio:false,cutout:"60%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10,padding:10}}}};
                const barOpt={responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}},y:{grid:{display:false},ticks:{font:{size:10}}}}};
                return(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.5fr",gap:14,marginBottom:14}}>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>📊 Status</div>
                      <ChartCanvas type="doughnut" data={chSts} options={doOpt} height={140}/>
                    </div>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>⚡ Prioridade</div>
                      <ChartCanvas type="doughnut" data={chPrio} options={doOpt} height={140}/>
                    </div>
                    <div style={{background:"#FFF",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#1E293B",marginBottom:12}}>🔧 Serviços</div>
                      {svcTop.length===0?<div style={{textAlign:"center",color:"#CBD5E1",padding:20}}>Sem dados</div>:<ChartCanvas type="bar" data={chSvc} options={barOpt} height={160}/>}
                    </div>
                  </div>
                );
              })()}
              <button onClick={()=>sfS(p=>({...p,data:TODAY_STR}))} style={{padding:"10px 20px",borderRadius:12,background:"#F5C200",border:"none",fontWeight:800,fontSize:13,color:"#1A1A1A",cursor:"pointer",boxShadow:"0 2px 8px rgba(245,194,0,.3)",marginBottom:14}}>+ Novo Serviço</button>
              {fS.data&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""})}>
                <div style={{background:"#FFF",borderRadius:16,width:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#F5C200"}}>➕ Novo Serviço</div>
                    <button onClick={()=>sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""})} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
                  </div>
                  <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📅 Data</label><input type="date" value={fS.data} onChange={e=>sfS(p=>({...p,data:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box"}}/></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>🔧 Serviço</label><select value={fS.servico} onChange={e=>sfS(p=>({...p,servico:e.target.value,equipCateg:"",equipDetalhe:"",obsCondicional:""}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="">Selecione...</option>{SERVICOS.map(s=><option key={s}>{s}</option>)}</select></div>
                    </div>
                    {shEq&&<div style={{background:"#EFF6FF",borderRadius:10,padding:12,border:"1px solid #3B82F622"}}>
                      <div style={{fontSize:10,fontWeight:800,color:"#2563EB",marginBottom:8}}>📦 Detalhes</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <select value={fS.equipCateg} onChange={e=>sfS(p=>({...p,equipCateg:e.target.value}))} style={{fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7}}><option value="">Categoria...</option>{EQ_OPT.map(o=><option key={o}>{o}</option>)}</select>
                        <input type="text" value={fS.equipDetalhe} onChange={e=>sfS(p=>({...p,equipDetalhe:e.target.value}))} placeholder="Nº, Nome..." style={{fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7}}/>
                      </div>
                      {fS.equipCateg==="Outros"&&<textarea value={fS.obsCondicional} onChange={e=>sfS(p=>({...p,obsCondicional:e.target.value}))} rows={2} placeholder="Observação..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1px solid #D0D5DD",borderRadius:7,marginTop:8,boxSizing:"border-box",resize:"vertical"}}/>}
                    </div>}
                    {shOb&&<div style={{background:"#FFFBEB",borderRadius:10,padding:12,border:"1px solid #F59E0B22"}}>
                      <label style={{fontSize:10,fontWeight:800,color:"#D97706"}}>📝 Observação</label>
                      <textarea value={fS.obsCondicional} onChange={e=>sfS(p=>({...p,obsCondicional:e.target.value}))} rows={2} placeholder="Descreva..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1px solid #F59E0B22",borderRadius:7,marginTop:4,boxSizing:"border-box",resize:"vertical"}}/>
                    </div>}
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📝 Descrição</label><input type="text" value={fS.descricao} onChange={e=>sfS(p=>({...p,descricao:e.target.value}))} placeholder="Descrição..." style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box"}}/></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>⚡ Prioridade</label><select value={fS.prioridade} onChange={e=>sfS(p=>({...p,prioridade:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="normal">🟢 Normal</option><option value="medio">🟡 Médio</option><option value="urgente">🔴 Urgente</option></select></div>
                      <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>📌 Status</label><select value={fS.status} onChange={e=>sfS(p=>({...p,status:e.target.value}))} style={{width:"100%",fontSize:12,padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4}}><option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option></select></div>
                    </div>
                    <div><label style={{fontSize:10,fontWeight:700,color:"#64748B"}}>💬 Observações</label><textarea value={fS.obs} onChange={e=>sfS(p=>({...p,obs:e.target.value}))} rows={2} placeholder="Obs..." style={{width:"100%",fontSize:11,padding:"6px 8px",border:"1.5px solid #E2E8F0",borderRadius:8,marginTop:4,boxSizing:"border-box",resize:"vertical"}}/></div>
                    <button onClick={()=>{addS();sfS({data:"",servico:"",equipCateg:"",equipDetalhe:"",descricao:"",prioridade:"normal",status:"pendente",obsCondicional:"",obs:""});}} style={{width:"100%",padding:"12px",borderRadius:10,background:"#F5C200",border:"none",fontWeight:800,fontSize:14,color:"#1A1A1A",cursor:"pointer"}}>Registrar Serviço</button>
                  </div>
                </div>
              </div>}
              {lF.length===0?<div style={{background:"#FFF",borderRadius:12,padding:40,textAlign:"center",color:"#CBD5E1"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontSize:14,fontWeight:600}}>Nenhum serviço</div></div>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320,1fr))",gap:10}}>
                {lF.map((r,ri)=>{const pr=PM[r.prioridade]||PM.normal;return(
                  <div key={r.id||ri} style={{background:"#FFF",borderRadius:12,padding:"8px 10px",borderLeft:`4px solid ${pr.c}`,boxShadow:"0 1px 4px rgba(0,0,0,.05)",opacity:r.arquivado?.5:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",gap:4}}><span style={{fontSize:9,fontWeight:800,color:pr.c,background:pr.c+"15",borderRadius:8,padding:"2px 8px"}}>{pr.l}</span><span style={{fontSize:9,fontWeight:700,color:"#64748B",background:"#F1F5F9",borderRadius:8,padding:"2px 8px"}}>{SM[r.status]||"⏳ Pendente"}</span></div>
                      <div style={{display:"flex",gap:3}}><button onClick={()=>arcS(r.id)} style={{background:"#F1F5F9",border:"none",borderRadius:6,fontSize:11,cursor:"pointer",padding:"3px 6px"}}>{r.arquivado?"📤":"📦"}</button><button onClick={()=>delS(r.id)} style={{background:"#FEF2F2",border:"none",borderRadius:6,color:"#DC2626",fontSize:10,fontWeight:700,cursor:"pointer",padding:"3px 6px"}}>✕</button></div>
                    </div>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:3}}>📅 {fmtDataBR(r.data)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#1E293B",marginBottom:4}}>{r.servico||"—"}</div>
                    {r.descricao&&<div style={{fontSize:11,color:"#64748B",marginBottom:5}}>{r.descricao}</div>}
                    {S_EQUIP.includes(r.servico)&&(r.equipCateg||r.equipDetalhe)&&<div style={{background:"#EFF6FF",borderRadius:8,padding:"6px 10px",marginBottom:5,fontSize:11,color:"#334155"}}><span style={{fontWeight:700}}>📦 {r.equipCateg}</span>{r.equipDetalhe?` — ${r.equipDetalhe}`:""}</div>}
                    {r.obsCondicional&&<div style={{background:"#FFFBEB",borderRadius:8,padding:"6px 10px",marginBottom:5,fontSize:11,color:"#92400E"}}>📝 {r.obsCondicional}</div>}
                    {r.obs&&<div style={{fontSize:10,color:"#94A3B8",fontStyle:"italic",marginBottom:4}}>💬 {r.obs}</div>}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:6}}>
                      <select value={r.prioridade||"normal"} onChange={e=>updS(r.id,{prioridade:e.target.value})} style={{fontSize:10,padding:"4px 6px",border:"1px solid #E2E8F0",borderRadius:6}}><option value="normal">🟢 Normal</option><option value="medio">🟡 Médio</option><option value="urgente">🔴 Urgente</option></select>
                      <select value={r.status||"pendente"} onChange={e=>updS(r.id,{status:e.target.value})} style={{fontSize:10,padding:"4px 6px",border:"1px solid #E2E8F0",borderRadius:6}}><option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option></select>
                    </div>
                  </div>
                );})}
              </div>)}
            </div>
          );
        })()}

      </>
    );
  };


  // ── BADGES MENU LATERAL — só status pendente ──
  const menuBadges = {
    relatorios: (reports||[]).filter(r=>r&&!r.arquivado&&r.statusFinal==="Pendente").length,
    mau_uso: (processosMU||[]).filter(p=>p&&!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    a_faturar: (processosAF||[]).filter(p=>p&&!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    dashboard_processos: (processosMU||[]).filter(p=>p&&!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length+(processosAF||[]).filter(p=>p&&!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    emprestimos: (emprestimos||[]).filter(e=>e&&!e.arquivado&&(e.statusEmp==="pendente"||e.status==="pendente")).length,
    saida_entrada: (saidaEntrada||[]).filter(s=>s&&!s.arquivado&&(s.statusFinal==="pendente"||s.status==="pendente")).length,
    ruptura_almox: (rupturas||[]).filter(r=>r&&!r.arquivado&&r.status!=="liberado_almox").length,
    dashboard_req: (requisicoes||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    sas: (sas||[]).filter(s=>s.status==="pendente").length,
    pendencias_frota: (frota||[]).filter(f=>f&&!f.arquivado&&f.status==="pendente").length,
    pendencias_hebert: (pendHebert||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    pendencias_matheus: (pendMatheus||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    pendencias_manuela_tab: (pendManuela||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    prioridades_clientes: (prioridades||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    // rh_removed: (rhFiscal||[]).filter(r=>r&&!r.arquivado&&r.status==="pendente").length,
    carros: (carros||[]).filter(c=>c&&!c.arquivado&&c.status==="pendente").length,
    uber: (uberPedidos||[]).filter(u=>u.status==="pendente").length,
    financeiro: (financeiro||[]).filter(f=>f.situacao==="pendente"||f.status==="pendente").length,
  };
  return(
    <div style={{minHeight:"100vh",background:"#F1F5F9",color:"#1A1A1A",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"}}>
      <style>{CSS}</style>
      {notification&&<div className="notif">{notification}</div>}
      <AppTopBar user={user} setUser={setUser} setModalUsers={setModalUsers}/>
      <AppSidebar tab={tab} setTab={setTab} user={user} empAlerta={empAlerta} badges={menuBadges}/>
      <div style={{marginLeft:220,padding:"24px 24px 60px",minHeight:"calc(100vh - 56px)"}}>
        {renderTab()}
        {modals}
      </div>
    </div>
  );
}
