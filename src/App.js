        /* eslint-disable */
import { useState, useRef, useEffect, Fragment } from "react";
// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPA_URL = "https://kpaddzigzqbnkfzprlwl.supabase.co";
const SUPA_KEY = "sb_publishable_RZaBuoZXGvPNTZaqGjHMlQ_kMH_dTVG";

let __dbErrShown=false;
const db = {
  async get(table) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*`, {
        headers: {"apikey": SUPA_KEY}
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
        headers: {"apikey": SUPA_KEY, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
        body: JSON.stringify({id, data})
      });
      if(!res.ok){ const t=await res.text(); console.error("DB save error:",table,res.status,t); if(res.status!==404&&res.status!==422)alert("Erro ao SALVAR ("+table+"): "+res.status+" — "+t.slice(0,250)); }
    } catch(e) { console.error("DB save error:", e); alert("Erro de conexão ao salvar: "+e.message); }
  },
  async delete(table, id) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: "DELETE",
        headers: {"apikey": SUPA_KEY}
      });
    } catch(e) { console.error("DB delete error:", e); }
  }
};



const USERS = [
  { id:"manuela",      username:"manuela.malagoli",  name:"Manuela Malagoli", role:"Administradora",         password:"mov2026", canDelete:true },
  { id:"gustavo",      username:"gustavo.coelho",    name:"Gustavo Coelho",   role:"Administrador",           password:"mov2026", canDelete:true },
  { id:"renato",       username:"renato.tecnico",    name:"Renato",           role:"Assistente",              password:"mov2026", canDelete:true },
  { id:"hebert_ofi",   username:"hebert.oficina",    name:"Hebert Oficina",   role:"Oficina",                 password:"ofi2026", canDelete:true, apenasOficina:true },
  { id:"matheus_ofi",  username:"matheus.oficina",   name:"Matheus",          role:"Oficina150",              password:"mat2026", canDelete:true, apenasOfi150:true },
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
const OFICINA_TECHS = ["Hebert","Eduardo","João","André","Junio","Matheus","Lucio","Davi","Pedro Souza","Pedro Pimentel","Reginaldo"];

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
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABhARkDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAAAAUGBwgDBAkBAv/EAEUQAAEDAwIDAwYJCgYDAQAAAAEAAgMEBREGBxIhMQhBURMUImFxkQkVFjIzUlSBkhcjNUJTVnKhsdEkJTRVYpOCouHx/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAUGAgMEAQf/xAA1EQACAgECBAIHBwQDAAAAAAAAAQIDBAURBhIxURMhMkFxgZGhsRQVFiIzQlIkYcHRcoLw/9oADAMBAAIRAxEAPwC5aELHNNFDjysjWZ6ZK8lJRW7Z6k30MiFr+e0n2iP8S989pc/Tx/iWvx6v5L4nvJLsZ0IBBGR0QtpiCF8TTRQgGWRrAfErF57SfaI/xLXK2EXs2jJRk+iNhCwCspSQBPGSfWs6yjOM/Re54011BCELI8BCx1E8MDeKaRrB6yk99/tbHcJqWrnuy6KXtZNL2s2RqnP0VuKiFq0txoqnHkahjie7K2iQBnuWyu2Fi5oNNf2MZRcXs0CFrmupASDUR5HrXnn9H9pj96x+0VfyXxHJLsbKFigqIJyRFK1+OuCsq2RlGS3i9zxprqCEHktY19GCQaiMEdea8nZCHpPYKLl0RsoWqbhRAEmpjwOZ5rUotSWCtmdDS3ihlkacFombnPsykLYT9Fphxa6oVUIBBGQQQe8IWZ4CELzib9Ye9AeoXnE36w96OJv1h70B6hecTfrD3r1ACEIQAhCEAJobhOcDTgOI9hTvTO3DP52nCgOJ3tptnu+p3act8iI1uJ/13e9HG8EOD3cjnqvEL5RuyykmafqRU2qGTOTw4K3019A1XHSSUxPNhyE5pHBkbnnoBlfY9IylkYVdr7efuKplV+HdKIy9eVTn1sdMx5AYMnBTb4n/AF3e9bN3qDVXOebOQXED2LVXyvVMp5WXZbv5N/IsuPX4dUYmehc/z6D03fPHepSi+iZ/CFFlB/roP4wpTi+ib7ArfwX6FvtRFav1ifSR9RXyK2R8DcPncOTfBbd6r2W+gfO4+ljDR4lRrUzy1U7p5nFz3HK7+I9ceDFU0+m/kv8AZpwMPxnzz6Iy19fV10hfUSuI7mjoFq4Hgs1JTy1VQ2CFvE9xTqi0fGabL5z5bHd0VFxdOzdTcrILm26tsmbMirHSi/IaMb3xu4o3uY4dCCnLYNSSMcKWvPEx3IP8Eg3Gjmoap1PMMEdD4ha614uZk6dd+R7NdV/tGVlVeRDz8zfv0RgusoZISxx4mkHxWjl31ne9DnOdjicTjxXi5b7FZZKcVsm99jZCLjFJi/oeoMd0dEXEh7e8p+KMLJMae6wSd3FhSc08TQfEZX0Tg/I58SVb/a/qQWqw2tUu6NO+VIpLZNNnBxgKMi97nFznOyTnqndr6rAjipGnm45KaCr3FmZ42Z4SflBfNndplXJVzP1jY3W1CzS+390u0kha5sJZH6X6xCoAzUl8huT6+mutZDM55fxNmd1V4N99v9Y7jWeksum2Rso2uLqiR7sAnuCp1uptxqXbm8tt2oKQxl4zFI3m149RVj4Sw/CxHc+s38kR+qW81vKvUTZ2eu0/fLBdILRrSpdcLZI4M8u/58WeWc+Cvhaq+luluguFFK2WnnYHxvaeRBXHFdD+wfqypv8AtXJbauV0r7ZKI2uccnhI/wDitZGkk9oa9Vlg2iv1zt9Q6nq4qfMUjerTkLnX+Wzc/wDe2u94/sr3dsip832PuozjymG/zC5moCRPy2bn/vbXe8f2R+Wzc/8Ae2u94/smnZtL6hvNMam12irq4WnBfFGXAFb3yA1n+7dx/wCkoBeG9e5xIHytruZ8R/ZXJm3Yu+jOy7a9Y1H+Y3SeJjA6Tvc7Ayce1UZGgdZggnTdxwD+xKttuPpa/V/Y6stHS22d9dRiGR8HD6QAIzyQDl0HvbqCk2EumuNWUxFWyVzaUObwh5I9HHqUBQ7275V5m1bSSVDrVE/ieGw/mgM9Ek6x3C19uTpqy7fDT76aOlLY+FkRbxkYAJ5BS7vFc71tTs3YttLHZ21c11pCKuRkfEWu9HI5DrlAWD7O+5DdzNAU96khENWz83UMHTiHLKklQV2LdG3bSW1UYvEDqeeskMoid1aCeWVOqAEy9wj/AIqAepPRMfXxzcIh4NVc4qe2nS9q+p36av6hDcQhC+WFkFvRdR5C8CMnAkGE7dTVQpbRK/OCRgKPKKYwVkMw/VcE5NcVokhpoGn5w4irfpOp+BpN8N/NdP8AsReVj8+TB9/8DVHTn1XqEKnkoZ7f/r4P4wpSj+jb7Aott36Qp/4wpTj+jb7Ar/wX6FvtRCav1iMrXtWZKuOkafRYMlNpKurCXX2bKSj0VT1m6V2dbKXfb4EniQUKYpdh0bfwcVRNOWggDAKeabug4w21Od3ucnEvpHDlKq06td/P4kBnz5r5De1tQCot/nLG/nI+/wBSYo6KU7jGJaGZh6Fh/ootcOF7m+DiFU+MMWNeTG2P7l5+1EnpVjlW4v1HiEIVRJQ9Y7gka8dxBUo22cTW6GbPIsCiw9Cnharm2HSjzxgSMBaBnmrVwrmxxrbVN+XLv8CN1Kl2Rjt13+ogajqvO7vK8HLWnhCTj0XpJc4uPUnKz2+A1VfDAP1nDPsVctnPKvcvXJ/U74pVwS9SJC0zTtprPC1v6w4iqvfCMNofktY3SBnnflneTP62Mc15vl2lL7t5rup0vb7XTyw08beF7ycnKqlu5ubqTcu9i5X+cYj5RQs+YwepfaMWlUUwrXqSRUrJ883LuMhXw+DttVRS6Eu9xla5sdTUN8mT0OAc/wBVUTaLbi/bkalitNmgJj4h5eY/Njb3ldPdsNIUGhtGUGnbewBlOwcbgPnO7yt5gRT26qjyOyczc4L6hgXONdAfhB6ryO1NLBnnJVtXP5AdDOwdQU8GzBqKiGLEtQX8T2jpz7yp4Fbp8v4BUW7i8OJmVy3pd2dZ0OjKbSlsuT6C3wfsThzvaU3RqvUom8sL3XeUzni8qUB13bTUb2hzaeBzT0IYOajntHbgO2020qb3S0cU8xcIoo3NHCC44yQqZbE9pDVmkL1T0d+rZLnaHuDZBK7L2DxBVjO2Kflp2f47vp5r66B74px5MZ9HIP8AJAVut7t8NdzO1DYrVNCyZxc2SngDB93JZ62/b47eVlNe9VW+orIYHjhdWxCRrfvxyUjbQdqux6Y0bQ6fvenZWTUUYi44iAHAeIx1Sfvp2nbTrfRtTpmxadl8pWYaZJcOx7OXVAWi2G3EpNydBUt8ghEE2OCeIdGuHI4UgKAuw/pe66d2na+6QPgfVyGVjHjBDc8lPqAExNeHN0YP+KfaYWuTm7t9TVWOLXtp/vRI6X+v7hBQhZqalnqQ8wsLuAZd6gvmMYSm9ordlhbS82YVknmlnc10ri4tGB7FjQik0ml0PdgQhC8BsW39I0/8YUpR/Mb7Aottn6Rp/wCMKUmfMb7Ff+C/07favoQmr+lEj3WMZZfJDjk4ZCRz0Ts3ApsGKrA/4kppZHiqrrtDoz7Iv1vf4klhz56IsfOgpA61uZ3tcnGmTt/OBVzQl/UZAT2X0Thu/wAbTq328vgQWoQ5b5GC4PEdFM89Aw/0UWPOZHu8XEp/6xqxTWl7QfSk5BR+Oiq3GOQp5EKl+1fUkdKg1W5dwQvumZ5Wpij+s4Bbl9oxQ15haMNLQQqrGicqnauiaXxJNzSko+s0EZOMZOPBCFpMgTj0JSeWr31LhlsY5e1Nw9Ce4DJTVh7SG2mlqiez1lROaqGQslLW5GQVYOGcP7TnRk+kfP8A0cOo2+HS1635Fce15pHU9z3ouNXQWKvqYDG3EkcLnNPXvCgKvoqugqHU9bTS08zerJGFpH3FdfLBXW3UNkpL1SwxyU9ZEJI3OYCS0qtPbz2+sj9CR6soqGGnrqaYNe6NuOMHxX1YrRUTarcjUm3N8ZcrDVujBcDLCT6Mg8CF0r2Q3Et+5Wh6a/UZDZsBtRF3sfhcoVbb4Oy+1MWpbtYzK408sQl4M8sj/wDUA+PhDW1NRpGz0tNTzTE1HEeBhOOR8FR/4nuv+21f/S7+y67XymsdXwR3iKjlxzaJwD/VJnxNof7BaPwtQHPjZrs66x3EoH3JrBbaEHDZJxwlx9Q6pC3x2a1JtXWwtugbPRz/AEVRHzaT4LqDa4aGCjZHbo4Y6cfNEQAb/JQZ26bdTVeytTUzMaZKeVroyRzByEBzkVr9it3rpprs83Knp6L43qaKoDG072cf5tzsYx4YKqgrA9kvW9g0Lb9S3bUlKKqi8m1oiLc8T8jCARdTawoL9UvrZ9sfN5Xc3mGm4W+3kFq6X3R05pmsFTT6EopamM+iZ42u4T7CnBuP2gbhq6qdabHZ7XY7bK7h4xCC/HjlK+1lm2Es3Bc9aailulwzxmIABgPr8UBbTs26/r9xNAx3qvoG0Tg8sYxrcN4QcDClBM3aK+6Pv2lYqjRUcUdsYeBrY28IBCeSAFH+tj/nX/ipAUe6zOb271BVXi9/0K/5IktL/W9wjJy6Dbx1FSw9HMwU2k59vh/iqg+pUvh9b6jUv/dCXzntRIQbtTGkuM0BHIOJHsWsnPr2j8nUR1bRydyKQrRD5xc4IsZBdzWrUMGVGdLHXfy9/QyouU6VY+xq/cQhLOsWQx3fycDGsa1oyAkZcmXj/Zr5U778r23NtU/EgpdzYtf6Sp/4wpRY5vCPSHTxUTtJaQWnBHQrN57W/apfxKa0PXI6ZCcZQ5uZ9zkzMN5DTT22JMrIKarhMU4a9h7srQ+IbR+xb70wvPaz7VL+JHntZ9ql/EVJ3cUYl0uazH3f99jmjp1sFtGzYkKktNtpZxNAxrHjvylAyMAyXtAHrUWeeVn2qX8RXhq6sjBqZcH/AJFbKuLaKY8tVGy/s0eS0uc3vKe4rawuArbj5KN2YouX3pEQstHTTVlQ2CBhc4/yVQyb7c3IdjW8pPp/glK4RprUV0Qo6TonVd2Y7HoRekSlXX9Nh0NS0cvmlL1gtcdsoxGOch5vd61i1dTGos8mBks9IK8x0R0aNZXNfnf5n7V6iGeYp5cZLp0I7QvB0Xq+eE6N7cq/Raa0LdLtI4NMcJazJ6khc7LjVy1twmrJnF0kshe4nxJyujm42gZNwds7taoi5tQG8UBHe4A8lzpv9pr7Hdqi13KnfBVU7yx7HjBBBX0rhHD8LEdz6zfyRX9Ut5reReo6FdlzePSV32zt1quF1p6Gvt0QhfHM7h4gOhCjnt0bsafuOl4NH2K4RV0ssgkqHxHLWAdBn71S+KWWJ3FFI+M+LXELx73vcXPc5zj1JOSrYRh8q1/wd1qnl1hdbqI3eRigDC7uyT/8VX7DaLhfLrBbLZTSVNVO8MYxjckkrpn2YttGbbbdwUVQwfGVViWqdjnnHIfcgIO+EJ+PLbX2S726vqqancwxv8k8tGVUn5Wam/32v/7iulfab29/KHtlW26BnFXU48vTeJcO5cxLvb6u1XKe310D4amB5ZIx4wQQgLx9ireCzz6Kk07qa9sguFK/Mbql/wA9nt9yR+3VurYK/S0GkrFcIq2aZ4fO6J2WtHhlUrjkkidxRvcx3i04KJHvkcXSPc9x6lxyUB8qznZF20sOs9Fahm1ZL5vanPaBKXcIDgR3/cq7aYslx1FfKa0WunfUVNQ8Na1gyfarpbrbaXfRHZSp9N2GCpluJljlq/Ns8RcSC7pzx1QCHqrbPs1aajc+u1I+ZzRzjgfxOUOa1uGycDHwaVs1yrZCMMfKcc/ZzSRt0/QFquHBuXabrJJxeljjBS9oy4bbt7RNJWUEccGleIcDavoPblAWw7EDQNpmubQvo2Gd5axw9antJOlKqwVdpjl04+idQn5hpQ3g/wDXklZACZmpLLcay6vnhY0sPQp5oUdqWm1ajUqrW0k9/I34+RKiXNEjv5N3X9m33pe0ba6y3yzOqWBocOWE5kKOwuGcXDvjdBvddzou1Cy2Dg0vMTNS0BuFsfEwAyDm1IWlrHW0ty84qmNDWjknghdmTo+PkZccqW/NH4eRqry511OtdGMi9WO5Vd0mnYxpYT6K1Pk1c/2bVISFHW8KYdtkrJN7t79TfHU7YxUUl5EefJq6fUaj5NXPH0bVIaFh+EMLvL4mX3rd2RHnybuf7Nq8+Tdz/ZhSIhefhDC/lL4j71u7Ijv5N3PH0QQNN3Mn6IKREJ+EML+Uh963dkMOk0rWyyATubGzvITttNqpbdFwwsy7vcepW+hSen6HiYL5q47y7s5r8y25bSfkC+KiMTQvid0cML7QpeUVJbM5k9vMZz9HvL3EVAAJyvk6Ok+0hPNCgHwxpz/Z82dv3jf3NCx29ttoW04PEe8+KjPejYTRu5LX1VTB5jc8cqqFoyfaO9S2hTdNMKK1XBbJHHObnJyfVlDrz2M9Xx1TxbLxRSwZ9AvyDj1rZ092MNRy1DPjm+UsMOfS8kCSr0IW0xIr2d2L0XttGyegpfO7jj0qqZo4s+odylRCEAKGd6uzzo7cZz64xm23Vw/1ELR6XtCmZCAofeuxlq2Kod8WXmimiz6JeCCsun+xjqiWob8b3ukhhz6XkgSVetCAivZnYzR22sLZqGn87uWMOqpWji+7wUpSxxysLJWNe09Q4ZC+kIBp6n240XqSIx3awUc2erhGAfeoe1t2SNAXgPkssk9omPNvB6Qz/JWNQgI52C27qNtdIGwz3B1diVzmyHwJUjIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgP/9k=";
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
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"fixed",top:-100,right:-100,width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-100,left:-100,width:300,height:300,background:"radial-gradient(circle,rgba(245,194,0,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{background:"#FFF",borderRadius:20,padding:48,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#F5C200"}}/>

        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:16,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{height:52,width:"auto"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#1A1A1A",letterSpacing:-.5}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4,letterSpacing:.5}}>Sistema de Gestão de Manutenção</div>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Usuário</label>
          <input ref={usernameRef} type="text" value={username} autoComplete="username" onChange={e=>{setUsername(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="nome.cargo" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Senha</label>
          <input type="password" value={pass} autoComplete="current-password" onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA",boxSizing:"border-box"}}/>
        </div>

        {err&&<div style={{background:"#FFF0F0",border:"1px solid #FFCDD2",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#C62828",marginBottom:16,fontWeight:600}}>⚠️ {err}</div>}

        <button onClick={handle} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:loading?"#E0E0E0":"#F5C200",color:"#1A1A1A",fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer",transition:"all .2s",boxShadow:loading?"none":"0 4px 16px rgba(245,194,0,.4)",letterSpacing:.3}}>
          {loading?"Entrando...":"Entrar →"}
        </button>

        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:"#CCC"}}>Grupo MOV © {new Date().getFullYear()}</div>
      </div>
    </div>
  );
}


function ReportModal({onClose,onSave,techs=ALL_TECHS}){
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
        numChamado:String(pick("Chamado")(o)||""),
        acao:String(pick("Ação")(o)||pick("Acao")(o)||""),
        horasTrabalhadas:String(pick("Horas Trab.")(o)||pick("Horas")(o)||""),
        status:REL_STATUS_KEYS.includes(st)?st:"",
        processoStatus:"em_andamento",
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
              {form.aprovado==="sim"&&<div style={{display:"grid",gridTemplateColumns:isMU?"1fr 1fr 1fr 1fr":"1fr 1fr",gap:12}}>
                {isMU&&<Inp label="Nº Mau Uso" value={form.numMauUso} onChange={v=>upd("numMauUso",v)} placeholder="MU-001"/>}
                <Inp label="OV" value={form.ov} onChange={v=>upd("ov",v)} placeholder="OV-001"/>
                {isMU&&<Inp label="Valor (R$)" value={form.valor} onChange={v=>upd("valor",v)} placeholder="0,00"/>}
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
            <BtnY onClick={()=>{onSave({...form,id:`P${Date.now()}`,tipo});onClose();}} disabled={!form.empresa}>Salvar</BtnY>
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
    <div style={{background:"#111827",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{background:"#FFF",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center"}}><img src={LOGO_MOV} alt="Grupo MOV" style={{height:26,width:"auto",display:"block"}}/></div>
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
        {user.id==="manuela"&&<button onClick={()=>setModalUsers(true)} style={{background:"rgba(245,194,0,.15)",border:"1px solid rgba(245,194,0,.3)",color:"#F5C200",borderRadius:7,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>👤 Usuários</button>}
        <button onClick={()=>{try{localStorage.removeItem("grupomov_user");}catch(e){}setUser(null);}} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#AAA",borderRadius:7,padding:"6px 12px",fontSize:11,cursor:"pointer"}}>Sair</button>
      </div>
    </div>
  );
}

function AppSidebar({tab, setTab, user, empAlerta, badges={}}){
  const bdg=(k)=>badges[k]||0;
  const [oficinasOpen, setOficinasOpen] = useState(
    ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab)
  );
  const [tecExtOpen,setTecExtOpen]=useState(false);
  const oficinasAtiva = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab);
  const tecExtAtiva = ["agenda_prev","dashboard","relatorios"].includes(tab);

  const canSee=(tipo)=>{
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="sogusnao") return user.id!=="gustavo";
    if(tipo==="ruptura_almox") return ["manuela","gustavo","renato"].includes(user.id);
    if(user.id==="renato") return !["sas","financeiro","pendencias_frota","pendencias_hebert","pendencias_matheus","pendencias_gustavo","pendencias_manuela_tab","prioridades_clientes","rh_fiscal"].includes(tipo);
    if(tipo==="hebert") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_ofi";
    if(tipo==="matheus") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_ofi";
    if(tipo==="ofi150") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_ofi";
    if(tipo==="oficina") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_ofi";
    if(tipo==="oficinas") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_ofi"||user.id==="matheus_ofi";
    return true;
  };

  if(user.apenasAgenda) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"#1E293B",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_prev","🗓 Agenda"],["dashboard","📊 Dashboard"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasAgenda150) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"#1E293B",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi_150","🗓 Agenda 150"],["dashboard_ofi_150","📊 Dashboard 150"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasOficina) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"#1E293B",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi","🗓 Agenda Oficina"],["dashboard_ofi","📊 Dashboard Oficina"],["pendencias_hebert","🔧 Pendências Hebert"]].map(([k,l])=>{
        const isActive=tab===k;
        return <button key={k} onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",background:isActive?"rgba(245,194,0,.12)":"transparent",color:isActive?"#F5C200":"#94A3B8",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>{l}</button>;
      })}
    </div>
  );
  if(user.apenasOfi150) return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"#1E293B",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {[["agenda_ofi_150","🗓 Agenda 150"],["dashboard_ofi_150","📊 Dashboard 150"],["pendencias_matheus","🔧 Pendências Matheus"]].map(([k,l])=>{
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
  const SubBtn=({k,l})=>{
    const isActive=tab===k;
    const count=bdg(k);
    return(<button onClick={()=>setTab(k)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 16px 7px 28px",border:"none",background:isActive?"rgba(245,194,0,.08)":"transparent",color:isActive?"#F5C200":"#64748B",fontSize:11,fontWeight:isActive?700:400,cursor:"pointer",textAlign:"left",borderLeft:isActive?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {l}{count>0&&<span style={{marginLeft:"auto",background:isActive?"#F5C200":"#EF4444",color:isActive?"#1A1A1A":"#FFF",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700,minWidth:16,textAlign:"center"}}>{count}</span>}
    </button>);
  };

  return(
    <div style={{position:"fixed",left:0,top:56,width:220,background:"#1E293B",overflowY:"auto",padding:"12px 0",height:"calc(100vh - 56px)",zIndex:50}}>
      {/* TÉCNICOS EXTERNOS - ACORDEÃO */}
      <button onClick={()=>setTecExtOpen(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 16px",border:"none",background:tecExtAtiva?"rgba(245,194,0,.12)":"transparent",color:tecExtAtiva?"#F5C200":"#94A3B8",fontSize:12,fontWeight:tecExtAtiva?700:500,cursor:"pointer",borderLeft:tecExtAtiva?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>
        <span>🚛 Técnicos Externos</span>
        <span style={{fontSize:9,transition:"transform .2s",display:"inline-block",transform:tecExtOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
      </button>
      {tecExtOpen&&<div style={{background:"rgba(0,0,0,.15)"}}>
        <SubBtn k="agenda_prev" l="🗓 Agenda"/>
        <SubBtn k="dashboard" l="📊 Dashboard"/>
        <SubBtn k="relatorios" l="📋 Conf. Relatórios"/>
      </div>}

      {/* OFICINAS - ACORDEÃO */}
      {canSee("oficinas")&&<>
        <button onClick={()=>setOficinasOpen(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 16px",border:"none",background:oficinasAtiva?"rgba(245,194,0,.12)":"transparent",color:oficinasAtiva?"#F5C200":"#94A3B8",fontSize:12,fontWeight:oficinasAtiva?700:500,cursor:"pointer",borderLeft:oficinasAtiva?"3px solid #F5C200":"3px solid transparent",transition:"all .15s",fontFamily:"inherit"}}>
          <span>🏭 Oficinas</span>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {(bdg("pendencias_hebert")+bdg("pendencias_matheus"))>0&&!oficinasOpen&&<span style={{background:"#EF4444",color:"#FFF",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700}}>{bdg("pendencias_hebert")+bdg("pendencias_matheus")}</span>}
            <span style={{fontSize:9,transition:"transform .2s",display:"inline-block",transform:oficinasOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
          </div>
        </button>
        {oficinasOpen&&<div style={{background:"rgba(0,0,0,.15)"}}>
          {canSee("oficina")&&<>
            <div style={{padding:"5px 16px 2px",fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:1}}>Oficina 1340</div>
            <SubBtn k="apontamentos_oficina" l="📝 Apontamentos"/>
            <SubBtn k="agenda_ofi" l="🗓 Agenda"/>
            <SubBtn k="dashboard_ofi" l="📊 Dashboard"/>
            {canSee("hebert")&&<SubBtn k="pendencias_hebert" l="🔧 Pendências Hebert"/>}
          </>}
          {canSee("ofi150")&&<>
            <div style={{padding:"5px 16px 2px",fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:1}}>Oficina 150</div>
            <SubBtn k="apontamentos_150" l="📝 Apontamentos"/>
            <SubBtn k="agenda_ofi_150" l="🗓 Agenda"/>
            <SubBtn k="dashboard_ofi_150" l="📊 Dashboard"/>
            {canSee("matheus")&&<SubBtn k="pendencias_matheus" l="🔧 Pendências Matheus"/>}
          </>}
        </div>}
      </>}

      <Btn k="mau_uso" l="⚠️ Mau Uso"/>
      <Btn k="a_faturar" l="💰 A Faturar"/>
      <Btn k="dashboard_processos" l="📊 Dash Processos"/>
      <Btn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
      <Btn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
      {canSee("ruptura_almox")&&<Btn k="ruptura_almox" l="🔴 Ruptura Almox"/>}
      <Btn k="dashboard_req" l="📊 Dash Requisições"/>
      <Btn k="sas" l="📄 SAS"/>
      <Btn k="carros" l="🚙 Carros"/>
      <Btn k="uber" l="🚗 Uber"/>
      <Btn k="financeiro" l="💰 Financeiro"/>
      <Btn k="pendencias_frota" l="🚜 Pendências Frota"/>
      {canSee("somanuela")&&<Btn k="prioridades_clientes" l="⭐ Prioridades Clientes"/>}
      {canSee("somanuela")&&<Btn k="rh_fiscal" l="🧾 RH-Fiscal"/>}
      {canSee("sogusnao")&&<Btn k="pendencias_gustavo" l="📌 Pendências Gustavo"/>}
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
  const [tab,setTab]=useState("relatorios");
  useEffect(()=>{ if(user&&user.apenasOficina) setTab("agenda_ofi"); },[user?.id]);
  useEffect(()=>{ if(user&&user.apenasAgenda) setTab("agenda_prev"); },[user?.id]);
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
  const [showArqAF,setShowArqAF]=useState(false);
  const [showArqEmp,setShowArqEmp]=useState(false);
  const [showArqSaida,setShowArqSaida]=useState(false);
  // ── Filtros de pesquisa por aba ──
  const [muSearch,setMuSearch]=useState(""); const [muFrom,setMuFrom]=useState(""); const [muTo,setMuTo]=useState(""); const [muMes,setMuMes]=useState(""); const [muAno,setMuAno]=useState("");
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
  const [pendGustavo,setPendGustavo]=useState([]);
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
  const [showArqGus,setShowArqGus]=useState(false);
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
  const [modalApon,setModalApon]=useState(false);
  const [editApon,setEditApon]=useState(null);
  const APON_EMPTY={data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0]||"",servico:SERVICOS_OFICINA[0]||"",inicio:"",termino:"",total:"",oficina:"1340",relatorio:"",obs:""};
  const [aponForm,setAponForm]=useState({data:TODAY_STR,os:"",patrimonio:"",tecnico:"",servico:"",inicio:"",termino:"",total:"",oficina:"1340",relatorio:"",obs:""});
  const [apontamentos150,setApontamentos150]=useState([]);
  const [showArqApon150,setShowArqApon150]=useState(false);
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
  const [agpTipo,setAgpTipo]=useState("todos");

  const notify=msg=>{setNotification(msg);setTimeout(()=>setNotification(""),3000);};

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
      const [rels, mus, afs, emps, saidas, reqs, ubers, escRows, usrs, fins, fros, pris, rhs, guss, ofis, agOfiRows, hebRows, apRows, sasRows, carrosRows, pendManRows, ap150Rows, agOfi150Rows, matRows, rupRows] = await Promise.all([
        safeGet("relatorios"), safeGet("processos_mu"), safeGet("processos_af"),
        safeGet("emprestimos"), safeGet("saida_entrada"), safeGet("requisicoes"),
        safeGet("uber_pedidos"), safeGet("escala"), safeGet("usuarios"), safeGet("financeiro"),
        safeGet("pendencias_frota"), safeGet("prioridades_clientes"), safeGet("rh_fiscal"), safeGet("pendencias_gustavo"), safeGet("oficina"),
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
      if(guss.length>0) setPendGustavo(guss);
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

  const updateReport=(id,changes)=>{const updated=reports.map(r=>r.id===id?{...r,...changes}:r);setReports(updated);db.save("relatorios",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const STS_PECA_OPTS=["Ruptura","Peça Solicitada","Peça Separada Aguardando Execução","Concluído"];
  const STS_PECA_COR={"Ruptura":{c:"#C62828",bg:"#FFF0F0"},"Peça Solicitada":{c:"#E67E00",bg:"#FFF8F0"},"Peça Separada Aguardando Execução":{c:"#1565C0",bg:"#EFF6FF"},"Concluído":{c:"#1A7A3C",bg:"#F0FFF5"}};
  const addPecaRel=(id)=>{const r=reports.find(x=>x.id===id);updateReport(id,{pecas:[...(r.pecas||[]),{situacao:"Peça Solicitada",peca:"",cod:"",quantidade:"",obs:""}]});};
  const updatePecaRel=(id,pi,changes)=>{const r=reports.find(x=>x.id===id);const pecas=[...(r.pecas||[])];pecas[pi]={...pecas[pi],...changes};updateReport(id,{pecas});};
  const delPecaRel=(id,pi)=>{const r=reports.find(x=>x.id===id);updateReport(id,{pecas:(r.pecas||[]).filter((_,i)=>i!==pi)});};
  const updateEmp=(id,changes)=>{const updated=emprestimos.map(r=>r.id===id?{...r,...changes}:r);setEmprestimos(updated);db.save("emprestimos",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateSaida=(id,changes)=>{const updated=saidaEntrada.map(r=>r.id===id?{...r,...changes}:r);setSaidaEntrada(updated);db.save("saida_entrada",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateRuptura=(id,changes)=>{const updated=rupturas.map(r=>r.id===id?{...r,...changes}:r);setRupturas(updated);db.save("rupturas_alm",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const delRuptura=(id)=>{setRupturas(p=>p.filter(x=>x.id!==id));db.delete("rupturas_alm",id);};
  const updateMU=(id,changes)=>{const updated=processosMU.map(r=>r.id===id?{...r,...changes}:r);setProcessosMU(updated);db.save("processos_mu",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateAF=(id,changes)=>{const updated=processosAF.map(r=>r.id===id?{...r,...changes}:r);setProcessosAF(updated);db.save("processos_af",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
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
  const updateApon=(id,changes)=>{ setApontamentos(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("apontamentos_oficina",id,row); return np; }); };
  const addApon=()=>{ const row={id:`APO${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0],servico:SERVICOS_OFICINA[0],inicio:"",termino:"",total:"",oficina:"1340",obs:"",relatorio:""}; setApontamentos(p=>[row,...p]); db.save("apontamentos_oficina",row.id,row); notify("✅ Apontamento criado!"); };
  const delApon=(id)=>{ setApontamentos(p=>p.filter(x=>x.id!==id)); db.delete("apontamentos_oficina",id); };
  const updateSas=(id,changes)=>{ setSas(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("sas",id,row); return np; }); };
  const addSas=()=>{ const row={id:`SAS${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),dataSolicitacao:TODAY_STR,email:"",nfNum:"",equipamento:"",cliente:"",nome:"",tel:"",emailContato:"",servico:"entrega_tecnica",dataRealizacao:"",relatorioMov:"",envioFaturamento:"",valor:"",status:"pendente",dataEnvioSas:""}; setSas(p=>[row,...p]); db.save("sas",row.id,row); notify("✅ SAS criado!"); };
  const delSas=(id)=>{ setSas(p=>p.filter(x=>x.id!==id)); db.delete("sas",id); };

  const mathCrud=mkCrud("pendencias_matheus",setPendMatheus);
  const saveAgendaOfi150=(key,slots)=>{ setAgendaOfi150(p=>({...p,[key]:slots})); db.save("agenda_ofi_150",key,{key,slots}); };
  const updateApon150=(id,changes)=>{ setApontamentos150(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("apontamentos_150",id,row); return np; }); };
  const addApon150=()=>{ const row={id:`AP150${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,os:"",patrimonio:"",tecnico:"Matheus",servico:SERVICOS_OFICINA[0],inicio:"",termino:"",total:"",oficina:"150",obs:"",relatorio:""}; setApontamentos150(p=>[row,...p]); db.save("apontamentos_150",row.id,row); notify("✅ Apontamento criado!"); };
  const delApon150=(id)=>{ setApontamentos150(p=>p.filter(x=>x.id!==id)); db.delete("apontamentos_150",id); };
  const abrirEditar150=(a)=>{setEditApon150(a);setApon150Form({data:a.data||TODAY_STR,os:a.os||"",patrimonio:a.patrimonio||"",tecnico:a.tecnico||OFICINA_TECHS[0]||"",servico:a.servico||SERVICOS_OFICINA[0]||"",inicio:a.inicio||"",termino:a.termino||"",total:a.total||"",oficina:a.oficina||"150",relatorio:a.relatorio||"",obs:a.obs||""});setModalApon150(true);};
  const salvar150=()=>{const total=calcHoras(apon150Form.inicio,apon150Form.termino)||apon150Form.total;if(editApon150){updateApon150(editApon150.id,{...apon150Form,total});setModalApon150(false);setEditApon150(null);notify("✅ Atualizado!");}else{const row={id:`AP150${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),arquivado:false,...apon150Form,total};setApontamentos150(p=>[row,...p]);db.save("apontamentos_150",row.id,row);setModalApon150(false);notify("✅ Apontamento salvo!");}};
  const froCrud=mkCrud("pendencias_frota",setFrota);
  const priCrud=mkCrud("prioridades_clientes",setPrioridades);
  const rhCrud=mkCrud("rh_fiscal",setRhFiscal);
  const gusCrud=mkCrud("pendencias_gustavo",setPendGustavo);
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

  const filteredReports=reports.filter(d=>{
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

  const empAlerta=emprestimos.filter(e=>{
    if(!e.dataRetorno||e.situacao==="Atendido")return false;
    const d=diffDays(e.dataRetorno);
    return d!==null&&d<0;
  }).length;

  // Lista achatada dos atendimentos da Agenda (para o Dashboard)
  const techRegionMap={}; Object.entries(REGIONS).forEach(([rk,rv])=>rv.techs.forEach(t=>{techRegionMap[t]=rk;}));
  const agendaAtendimentos=[];
  Object.keys(schedule).forEach(k=>{ const i=k.indexOf("__"); if(i<0)return; const t=k.slice(0,i), dt=k.slice(i+2); (schedule[k]||[]).forEach(s=>agendaAtendimentos.push({tecnico:t,date:dt,region:techRegionMap[t]||"",type:s.type||"preventivo",status:s.status,horasTrabalhadas:s.horasTrabalhadas||calcHoras(s.horaEntrada,s.horaSaida),horaEntrada:s.horaEntrada,horaSaida:s.horaSaida,empresa:s.client||"",patrimonio:s.patrimonio||"",relatorio:s.relatorio||""})); });

  if(!user)return<LoginScreen users={users} onLogin={u=>{setUser(u);try{localStorage.setItem("grupomov_user",JSON.stringify({id:u.id}));}catch(e){}notify(`Bem-vinda, ${u.name}!`);}}/>;

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
    background:#FFFFFF;border-radius:14px;
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
        {modalReport&&<ReportModal onClose={()=>setModalReport(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setReports(p=>[dd,...p]);db.save("relatorios",dd.id,dd);notify("✅ Relatório salvo!");}}/>}
        {modalOfi&&<ReportModal techs={OFICINA_TECHS} onClose={()=>setModalOfi(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setOficina(p=>[dd,...p]);db.save("oficina",dd.id,dd);notify("✅ Relatório (Oficina) salvo!");}}/>}
        {modalImportOfi&&<ImportExcelModal onClose={()=>setModalImportOfi(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setOficina(p=>[...stamp,...p]);stamp.forEach(d=>db.save("oficina",d.id,d));setModalImportOfi(false);notify(`✅ ${stamp.length} importado(s)!`);}}/>}
        {modalUsers&&<UsersModal users={users} onClose={()=>setModalUsers(false)} onSaveUser={saveUser} onDeleteUser={deleteUser}/>}
        {modalImport&&<ImportExcelModal onClose={()=>setModalImport(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setReports(p=>[...stamp,...p]);stamp.forEach(d=>db.save("relatorios",d.id,d));setModalImport(false);notify(`✅ ${stamp.length} relatório(s) importado(s)!`);}}/>}
        {modalMU&&<ProcessoModal onClose={()=>{setModalMU(false);setEditMU(null);}} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editMU){setProcessosMU(p=>p.map(x=>x.id===dd.id?dd:x));db.save("processos_mu",dd.id,dd);notify("✅ Atualizado!");}else{setProcessosMU(p=>[dd,...p]);db.save("processos_mu",dd.id,dd);notify("✅ Processo Mau Uso salvo!");}setEditMU(null);setModalMU(false);}} tipo="mau_uso" initial={editMU}/>}
        {modalAF&&<ProcessoModal onClose={()=>{setModalAF(false);setEditAF(null);}} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editAF){setProcessosAF(p=>p.map(x=>x.id===dd.id?dd:x));db.save("processos_af",dd.id,dd);notify("✅ Atualizado!");}else{setProcessosAF(p=>[dd,...p]);db.save("processos_af",dd.id,dd);notify("✅ Processo A Faturar salvo!");}setEditAF(null);setModalAF(false);}} tipo="a_faturar" initial={editAF}/>}
        {modalEmp&&<EmpModal onClose={()=>{setModalEmp(false);setEditEmp(null);}} onSave={d=>{const dd=editEmp?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editEmp)setEmprestimos(p=>p.map(x=>x.id===dd.id?dd:x));else setEmprestimos(p=>[dd,...p]);db.save("emprestimos",dd.id,dd);notify("✅ Salvo!");}} initial={editEmp}/>}
        {modalSaida&&<SaidaModal onClose={()=>{setModalSaida(false);setEditSaida(null);}} onSave={d=>{const dd=editSaida?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editSaida)setSaidaEntrada(p=>p.map(x=>x.id===dd.id?dd:x));else setSaidaEntrada(p=>[dd,...p]);db.save("saida_entrada",dd.id,dd);notify("✅ Salvo!");}} initial={editSaida}/>}
  </>);


  const renderTab = () => {
    return (
      <>
        {/* ── CONFERÊNCIA DE RELATÓRIOS ── */}
        {tab==="relatorios"&&(()=>{
          const lista=reports.filter(r=>showArqRel?true:r.processoStatus!=="arquivado").filter(r=>{
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
                <button onClick={()=>setShowArqRel(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqRel?"#1A1A1A":"#FFF",color:showArqRel?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqRel?"Ocultar":"Arquivados"}</button>
                <label style={{cursor:pdfLoading?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:"none",background:pdfLoading?"#E0E0E0":"#1565C0",color:"#FFF",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
                  {pdfLoading?"⏳ Lendo...":"📄 Ler PDF"}
                  <input type="file" accept=".pdf" style={{display:"none"}} disabled={pdfLoading} onChange={async(e)=>{
                    const file=e.target.files?.[0]; if(!file)return;
                    setPdfLoading(true);
                    try{
                      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
                      const resp=await fetch("/api/read-pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pdfBase64:b64})});
                      const respText=await resp.text();
                      if(!resp.ok){let m="Erro API ("+resp.status+")";try{const j=JSON.parse(respText);m=j.error||m;}catch(e){}throw new Error(m);}
                      let data;try{data=JSON.parse(respText);}catch(e){throw new Error("Resposta inválida: "+respText.slice(0,100));}
                      const txt=data.content?.[0]?.text||"{}";
                      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
                      const pecasAPI=(parsed.pecasUsadas||[]).map(p=>({situacao:"Peça Solicitada",peca:p.peca||"",cod:p.cod||"",quantidade:p.quantidade||"1",obs:""}));
                      const row={id:`REL${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),atendimento:parsed.tipoAtendimento||"preventivo",statusFinal:parsed.statusFinal||"Pendente Peças",dataAtendimento:parsed.dataAtendimento||TODAY_STR,empresa:parsed.empresa||"",cidade:parsed.cidade||"",patrimonio:parsed.patrimonio||"",horimetro:parsed.horimetro||"",tecnico:parsed.tecnico||ALL_TECHS[0],chamado:parsed.numChamado||"",servico:parsed.servico||"Mecânica",obs:parsed.obs||"",pecas:pecasAPI,processoStatus:"em_andamento",reportNum:parsed.reportNum||""};
                      setReports(p=>[row,...p]);db.save("relatorios",row.id,row);notify("✅ Relatório criado via PDF!");
                    }catch(err){alert("Erro ao processar PDF: "+err.message);}
                    setPdfLoading(false);e.target.value="";
                  }}/>
                </label>
                <BtnExcel onClick={()=>exportCSV(lista,"relatorios_grupomov",[{key:"dataAtendimento",label:"Data"},{key:"atendimento",label:"Tipo"},{key:"statusFinal",label:"Status"},{key:"empresa",label:"Empresa"},{key:"cidade",label:"Cidade"},{key:"patrimonio",label:"PAT"},{key:"horimetro",label:"Horímetro"},{key:"tecnico",label:"Técnico"},{key:"chamado",label:"Chamado"},{key:"servico",label:"Serviço"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>setModalRel(true)}>+ Novo Relatório</BtnY>
              </div>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:totalPend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Concluídos",v:totalConc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Corretivos",v:totalCorr,c:"#E67E00",bg:"#FFF8F0",i:"🔧"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {/* Filtros */}
            <div className="card" style={{padding:"12px 16px",marginBottom:16,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
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
                    <div style={{padding:"11px 14px",background:isConc?"#F0FFF5":isCorr?"#FFF0F0":"#EFF6FF",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:isCorr?"#C62828":"#1565C0",background:"#FFF",border:`1px solid ${isCorr?"#C6282833":"#1565C033"}`,borderRadius:20,padding:"2px 10px"}}>{isCorr?"🔧 Corretivo":"🔵 Preventivo"}</span>
                        <select value={r.statusFinal||"Pendente Peças"} onChange={e=>updateReport(r.id,{statusFinal:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:isConc?"#1A7A3C":"#C62828",background:isConc?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option>Pendente Peças</option><option>Concluído</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>addPecaRel(r.id)} title="Add Peça" style={{background:"#FFF8F0",border:"none",borderRadius:6,color:"#E67E00",cursor:"pointer",padding:"4px 7px",fontSize:13,fontWeight:700}}>+📦</button>
                        <button onClick={()=>updateReport(r.id,{processoStatus:r.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?")){setReports(p=>p.filter(x=>x.id!==r.id));db.delete("relatorios",r.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {r.dataAtendimento||"—"} · PAT: <b>{r.patrimonio||"—"}</b> · Hor: {r.horimetro||"—"}</div></div>
                        {r.reportNum&&<span style={{fontSize:10,fontWeight:700,color:"#888",background:"#F0F0F0",borderRadius:6,padding:"2px 7px"}}>#{r.reportNum}</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Técnico</div><select value={r.tecnico||ALL_TECHS[0]} onChange={e=>updateReport(r.id,{tecnico:e.target.value})} style={{width:"100%",fontSize:11,fontWeight:700,border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Serviço</div><select value={r.servico||"Mecânica"} onChange={e=>updateReport(r.id,{servico:e.target.value})} style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Chamado</div><input type="text" value={r.chamado||""} onChange={e=>updateReport(r.id,{chamado:e.target.value})} placeholder="—" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Cidade</div><input type="text" value={r.cidade||""} onChange={e=>updateReport(r.id,{cidade:e.target.value})} placeholder="—" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
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
          const lista=apontamentos.filter(a=>(showArqApon||!a.arquivado)&&(()=>{
            if(ofiNovaData&&a.data!==ofiNovaData)return false;
            if(ofiNovaFrom&&(a.data||"")<ofiNovaFrom)return false;
            if(ofiNovaTo&&(a.data||"")>ofiNovaTo)return false;
            if(ofiNovaOS&&!(a.os||"").toLowerCase().includes(ofiNovaOS.toLowerCase()))return false;
            if(ofiNovaPat&&!(a.patrimonio||"").toLowerCase().includes(ofiNovaPat.toLowerCase()))return false;
            if(ofiNovaTech!=="todos"&&a.tecnico!==ofiNovaTech)return false;
            if(ofiNovaServ!=="todos"&&a.servico!==ofiNovaServ)return false;
            return true;
          })()).sort((a,b)=>(a.data||"").localeCompare(b.data||""));
          const totalHorasMin=lista.reduce((acc,a)=>{const p=(a.total||"0:00").split(":");return acc+(parseInt(p[0]||0)*60+parseInt(p[1]||0));},0);
          const totalHorasStr=`${Math.floor(totalHorasMin/60)}h${String(totalHorasMin%60).padStart(2,"0")}m`;
          const abrirEditar=(a)=>{setEditApon(a);setAponForm({data:a.data||TODAY_STR,os:a.os||"",patrimonio:a.patrimonio||"",tecnico:a.tecnico||OFICINA_TECHS[0],servico:a.servico||SERVICOS_OFICINA[0],inicio:a.inicio||"",termino:a.termino||"",total:a.total||"",oficina:a.oficina||"1340",relatorio:a.relatorio||"",obs:a.obs||""});setModalApon(true);};
          const salvarApon=()=>{
            const total=calcHoras(aponForm.inicio,aponForm.termino)||aponForm.total;
            if(editApon){
              updateApon(editApon.id,{...aponForm,total});
              setModalApon(false);setEditApon(null);notify("✅ Atualizado!");
            } else {
              addApon();
              setModalApon(false);notify("✅ Apontamento salvo!");
            }
          };
          return(<div style={{animation:"fadeIn .3s ease"}}>
            {/* Modal */}
            {modalApon&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setModalApon(false);setEditApon(null);}}}>
                <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:580,boxShadow:"0 24px 80px rgba(0,0,0,.3)",overflow:"hidden"}}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{editApon?"✏️ Editar Apontamento":"➕ Novo Apontamento"}</div>
                    <button onClick={()=>{setModalApon(false);setEditApon(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                  <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Data</label><input type="date" value={aponForm.data} onChange={e=>setAponForm(p=>({...p,data:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Técnico</label><select value={aponForm.tecnico} onChange={e=>setAponForm(p=>({...p,tecnico:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>OS</label><input type="text" value={aponForm.os} onChange={e=>setAponForm(p=>({...p,os:e.target.value}))} placeholder="OS-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Patrimônio</label><input type="text" value={aponForm.patrimonio} onChange={e=>setAponForm(p=>({...p,patrimonio:e.target.value}))} placeholder="PAT-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Oficina</label><select value={aponForm.oficina} onChange={e=>setAponForm(p=>({...p,oficina:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",fontWeight:700}}>{OFICINAS_UNID.map(o=><option key={o}>{o}</option>)}</select></div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Serviço</label><select value={aponForm.servico} onChange={e=>setAponForm(p=>({...p,servico:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Início</label><input type="time" value={aponForm.inicio} onChange={e=>{const v=e.target.value;setAponForm(p=>({...p,inicio:v,total:calcHoras(v,p.termino)}));}} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Término</label><input type="time" value={aponForm.termino} onChange={e=>{const v=e.target.value;setAponForm(p=>({...p,termino:v,total:calcHoras(p.inicio,v)}));}} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#F5C200",textTransform:"uppercase",letterSpacing:.8}}>Total</label><div style={{fontSize:20,fontWeight:900,color:"#C47D00",background:"#FFFBF0",border:"1.5px solid #FFE8A0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>{aponForm.total||calcHoras(aponForm.inicio,aponForm.termino)||"—"}</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Relatório</label><input type="text" value={aponForm.relatorio} onChange={e=>setAponForm(p=>({...p,relatorio:e.target.value}))} placeholder="REL-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Observação</label><input type="text" value={aponForm.obs} onChange={e=>setAponForm(p=>({...p,obs:e.target.value}))} placeholder="Obs..." style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                      <BtnG onClick={()=>{setModalApon(false);setEditApon(null);}}>Cancelar</BtnG>
                      <BtnY onClick={salvarApon}>{editApon?"Salvar Alterações":"Adicionar"}</BtnY>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📝 Apontamentos Oficina</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s) · <span style={{color:"#C47D00",fontWeight:700}}>⏱ {totalHorasStr} totais</span></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqApon(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqApon?"#1A1A1A":"#FFF",color:showArqApon?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqApon?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(apontamentos,"apontamentos_oficina",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"PAT"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"oficina",label:"Oficina"},{key:"relatorio",label:"Relatório"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>{setEditApon(null);setAponForm({data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0]||"",servico:SERVICOS_OFICINA[0]||"",inicio:"",termino:"",total:"",oficina:"1340",relatorio:"",obs:""});setModalApon(true);}}>+ Novo Apontamento</BtnY>
              </div>
            </div>

            {/* Filtros */}
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={ofiNovaOS} onChange={e=>setOfiNovaOS(e.target.value)} placeholder="Buscar OS, PAT..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={ofiNovaFrom} onChange={e=>setOfiNovaFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={ofiNovaTo} onChange={e=>setOfiNovaTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={ofiNovaTech} onChange={e=>setOfiNovaTech(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}><option value="todos">Todos técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={ofiNovaServ} onChange={e=>setOfiNovaServ(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0"}}><option value="todos">Todos serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
              {(ofiNovaFrom||ofiNovaTo||ofiNovaOS||ofiNovaTech!=="todos"||ofiNovaServ!=="todos")&&<button onClick={()=>{setOfiNovaFrom("");setOfiNovaTo("");setOfiNovaOS("");setOfiNovaTech("todos");setOfiNovaServ("todos");}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>

            {/* Cards */}
            {lista.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📝</div><div style={{fontSize:15,fontWeight:600}}>Nenhum apontamento</div><div style={{fontSize:13,marginTop:6}}>Clique em "+ Novo Apontamento"</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {lista.map(a=>{
                  const cor=({Mecânica:"#1565C0",Elétrica:"#E67E00",Bateria:"#F5C200",Hidráulica:"#00838F",Funilaria:"#8E44AD",Outros:"#888"})[a.servico]||"#555";
                  const horasNum=parseInt((a.total||"0").split(":")[0]||0);
                  return(<div key={a.id} className="card" style={{borderTop:`4px solid ${cor}`,padding:0,overflow:"hidden",opacity:a.arquivado?0.55:1,transition:"box-shadow .15s"}}>
                    <div style={{padding:"11px 14px",background:cor+"12",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:cor,background:"#FFF",border:`1px solid ${cor}33`,borderRadius:20,padding:"2px 10px"}}>{a.servico||"—"}</span>
                        <span style={{fontSize:11,fontWeight:700,color:"#888"}}>{a.oficina||"—"}</span>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>abrirEditar(a)} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateApon(a.id,{arquivado:!a.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{a.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delApon(a.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{a.tecnico||"—"}</div>
                          <div style={{fontSize:11,color:"#888"}}>📅 {a.data||"—"} · OS: <b style={{color:"#1565C0"}}>{a.os||"—"}</b></div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:22,fontWeight:900,color:"#C47D00",lineHeight:1}}>{a.total||"—"}</div>
                          <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase"}}>horas</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>PAT</div><div style={{fontSize:12,fontWeight:700}}>{a.patrimonio||"—"}</div></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Início → Término</div><div style={{fontSize:11,fontWeight:600,color:"#555"}}>{a.inicio||"—"} → {a.termino||"—"}</div></div>
                        {a.relatorio&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório</div><div style={{fontSize:12,fontWeight:700,color:"#1A7A3C"}}>{a.relatorio}</div></div>}
                        {a.obs&&<div style={{background:"#FFFBF0",borderRadius:8,padding:"7px 10px",borderLeft:"3px solid #F5C200"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Obs</div><div style={{fontSize:11,color:"#666",fontStyle:"italic"}}>{a.obs}</div></div>}
                      </div>
                      <div style={{fontSize:10,color:"#CCC",textAlign:"right"}}>{a.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
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
                      <div style={{padding:"12px 14px",borderBottom:"1px solid #F4F4F4"}}>
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
          const apMes=apontamentos.filter(a=>{
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
              <div key={i} className="card" style={{padding:"18px 20px",borderTop:`4px solid ${s.c}`,background:s.bg}}>
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
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>📋 Apontamentos por Técnico</div>
              <div style={{fontSize:11,color:"#888",marginBottom:12}}>Quantidade de registros no período</div>
              <ChartCanvas type="bar" data={chartApon} options={chartOpts("Apontamentos")} height={220}/>
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
        {tab==="pendencias_hebert"&&(user.id==="manuela"||user.id==="hebert_ofi")&&(()=>{
          const list=pendHebert.filter(r=>showArqHeb||!r.arquivado);
          const PRIO={urgente:{l:"🔴 Urgente",c:"#C62828",bg:"#FFF0F0"},medio:{l:"🟡 Médio",c:"#E67E00",bg:"#FFF8F0"},aguardar:{l:"🟢 Aguardar",c:"#1A7A3C",bg:"#F0FFF5"}};
          const STS={resolvido:"Resolvido",em_andamento:"Em Andamento",pendente:"Pendente"};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🔧 Pendências Hebert Oficina</div><div style={{fontSize:13,color:"#888"}}>{list.length} item(ns) · visível para Manuela e Hebert</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqHeb(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqHeb?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqHeb?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>hebCrud.add({data:TODAY_STR,descricao:"",prioridade:"medio",status:"pendente",obs:""})}>+ Nova Pendência</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma pendência.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data</th><th>Descrição</th><th>Prioridade</th><th>Status</th><th>Observações</th><th>Registrado por</th><th>✕</th></tr></thead>
                  <tbody>{list.map(r=>{
                    const p=PRIO[r.prioridade||"medio"];
                    const res=r.status==="resolvido";
                    return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.data||""} onChange={e=>hebCrud.update(r.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.descricao||""} onChange={e=>hebCrud.update(r.id,{descricao:e.target.value})} style={{width:200,fontSize:11,padding:"3px 6px"}} placeholder="Descreva a pendência..."/></td>
                      <td><select value={r.prioridade||"medio"} onChange={e=>hebCrud.update(r.id,{prioridade:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:p.c,background:p.bg}}>{Object.entries(PRIO).map(([v,x])=><option key={v} value={v}>{x.l}</option>)}</select></td>
                      <td><select value={r.status||"pendente"} onChange={e=>hebCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:res?"#1A7A3C":r.status==="em_andamento"?"#1565C0":"#C62828",background:res?"#F0FFF5":r.status==="em_andamento"?"#F0F4FF":"#FFF0F0"}}>{Object.entries(STS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.obs||""} onChange={e=>hebCrud.update(r.id,{obs:e.target.value})} style={{width:220,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                      <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      <td style={{whiteSpace:"nowrap"}}><button onClick={()=>hebCrud.update(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))hebCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

        {/* ── PENDÊNCIAS MANUELA ── */}
        {tab==="pendencias_manuela_tab"&&user.id==="manuela"&&(()=>{
          const STS_PM={Finalizado:{c:"#1A7A3C",bg:"#F0FFF5"},Pendente:{c:"#C62828",bg:"#FFF0F0"},"Em Andamento":{c:"#1565C0",bg:"#F0F4FF"}};
          const PRI_PM={Urgente:{c:"#C62828",bg:"#FFF0F0"},Normal:{c:"#555",bg:"#F5F5F5"},"Médio Prazo":{c:"#1565C0",bg:"#F0F4FF"}};
          const list=pendManuela.filter(r=>showArqPendMan||!r.arquivado);
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
              <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado").length} registro(s)</span>
              <BtnImport onClick={()=>setModalImportOfi(true)}/>
              <BtnExcel onClick={()=>exportCSV(filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado"),"oficina_grupomov",[{key:"dataReg",label:"Data"},{key:"reportNum",label:"Nº Relatório"},{key:"type",label:"Tipo"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"date",label:"Data Atend."},{key:"numChamado",label:"Chamado"},{key:"acao",label:"Ação"},{key:"horaEntrada",label:"Entrada"},{key:"horaSaida",label:"Saída"},{key:"horasTrabalhadas",label:"Horas Trab."},{key:"status",label:"Status"},{key:"requisicaoPeca",label:"Requisição"},{key:"dataPeca",label:"Data Peça"},{key:"execPeca",label:"Executado"},{key:"chamadoPeca",label:"Chamado Peça"},{key:"relatorioPeca",label:"Relatório Peça"},{key:"dataRelPeca",label:"Data Rel. Peça"},{key:"processoStatus",label:"Processo"}])}/>
              <BtnY onClick={()=>setModalOfi(true)}>+ Novo Relatório</BtnY>
            </div>
            {/* Tabela */}
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Nº Relatório</th><th>Tipo</th><th>Empresa</th><th>Patrimônio</th><th>Técnico</th><th>Data Atend.</th><th>Chamado</th><th>Ação</th><th>Entrada</th><th>Saída</th><th>Horas Trab.</th><th>Status</th><th>Processo</th><th>Registrado por</th><th>Ações</th></tr></thead>
                  <tbody>
                    {filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado").length===0&&<tr><td colSpan={user.canDelete?16:15} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Relatório".</td></tr>}
                    {filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado").map(d=>{
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
          const lista=processosMU.filter(p=>showArqMU||p.processoStatus!=="arquivado");
          const pend=lista.filter(p=>!p.processoStatus||p.processoStatus==="pendente").length;
          const andamento=lista.filter(p=>p.processoStatus==="em_andamento").length;
          const conc=lista.filter(p=>p.processoStatus==="concluido").length;
          const applyFilter=(r,d=r.date||"")=>{
            if(muSearch){const q=muSearch.toLowerCase();if(!((r.empresa||"").toLowerCase().includes(q)||(r.patrimonio||"").toLowerCase().includes(q)||(r.relatorio||"").toLowerCase().includes(q)||(r.numMauUso||"").toLowerCase().includes(q)||(r.chamado||"").toLowerCase().includes(q)||(r.ov||"").toLowerCase().includes(q)))return false;}
            if(muFrom&&d<muFrom)return false;
            if(muTo&&d>muTo)return false;
            if(muMes&&!d.slice(5,7).startsWith(muMes))return false;
            if(muAno&&!d.startsWith(muAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>⚠️ Mau Uso</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} processo(s) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqMU(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqMU?"#1A1A1A":"#FFF",color:showArqMU?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqMU?"Ocultar":"Ver Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"mau_uso_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"relatorio",label:"Relatório"},{key:"numMauUso",label:"Nº MU"},{key:"ov",label:"OV"},{key:"valor",label:"Valor"},{key:"processoStatus",label:"Status"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>{setEditMU(null);setModalMU(true);}}>+ Novo Processo</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF8F8",i:"⏳"},{l:"Em Andamento",v:andamento,c:"#1565C0",bg:"#EFF6FF",i:"🔄"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={muSearch} onChange={e=>setMuSearch(e.target.value)} placeholder="Buscar empresa, PAT, relatório, chamado..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={muFrom} onChange={e=>setMuFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={muTo} onChange={e=>setMuTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={muMes} onChange={e=>setMuMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={muAno} onChange={e=>setMuAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(muSearch||muFrom||muTo||muMes||muAno)&&<button onClick={()=>{setMuSearch('');setMuFrom('');setMuTo('');setMuMes('');setMuAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><div style={{fontSize:15,fontWeight:600}}>{muSearch||muFrom||muTo||muMes||muAno?"Nenhum resultado":"Nenhum processo cadastrado"}</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(p=>{
                  const st=ST[p.processoStatus||"pendente"]||ST.pendente;
                  const slaD=p.date?diffDays(p.date):null;
                  return(<div key={p.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:p.processoStatus==="arquivado"?0.6:1}}>
                    <div style={{padding:"11px 14px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:st.c,background:"#FFF",border:`1px solid ${st.c}33`,borderRadius:20,padding:"2px 10px"}}>{st.l}</span>
                        {slaD!==null&&<span style={{fontSize:10,fontWeight:700,color:slaD>10?"#C62828":slaD>5?"#E67E00":"#888",background:"#F5F5F5",borderRadius:20,padding:"2px 8px"}}>⏱ {slaD}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setEditMU(p);setModalMU(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateMU(p.id,{processoStatus:p.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{p.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir permanentemente?")){setProcessosMU(p2=>p2.filter(x=>x.id!==p.id));db.delete("processos_mu",p.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{p.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {p.date||"—"} · PAT: <b>{p.patrimonio||"—"}</b></div></div>
                        <span style={{fontSize:11,fontWeight:700,color:p.aprovado==="sim"?"#1A7A3C":"#C62828",background:p.aprovado==="sim"?"#F0FFF5":"#FFF0F0",borderRadius:12,padding:"3px 10px"}}>{p.aprovado==="sim"?"✅ Aprovado":"❌ Não"}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório</div><input type="text" value={p.relatorio||""} onChange={e=>updateMU(p.id,{relatorio:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:12,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Nº Mau Uso</div><input type="text" value={p.numMauUso||""} onChange={e=>updateMU(p.id,{numMauUso:e.target.value})} placeholder="—" style={{width:"100%",fontSize:12,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Chamado</div><input type="text" value={p.chamado||""} onChange={e=>updateMU(p.id,{chamado:e.target.value})} placeholder="—" style={{width:"100%",fontSize:12,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Valor / OV</div><div style={{fontSize:13,fontWeight:800,color:"#1A7A3C"}}>{p.valor||"—"}{p.ov&&<span style={{fontSize:10,color:"#888",fontWeight:400}}> · OV {p.ov}</span>}</div></div>
                      </div>
                      {p.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {p.obs}</div>}
                      <select value={p.processoStatus||"pendente"} onChange={e=>updateMU(p.id,{processoStatus:e.target.value})} style={{fontSize:11,padding:"6px 10px",borderRadius:20,border:`1px solid ${st.c}44`,color:st.c,background:st.bg,fontWeight:700,cursor:"pointer"}}>
                        <option value="pendente">⏳ Pendente</option><option value="em_andamento">🔄 Em Andamento</option><option value="concluido">✅ Concluído</option><option value="arquivado">🗄️ Arquivado</option>
                      </select>
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
          const lista=processosAF.filter(p=>showArqAF||p.processoStatus!=="arquivado");
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
          const valorTotal=lista.reduce((acc,p)=>{const v=parseFloat((p.valor||"0").toString().replace(/[^\d.,]/g,"").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>💰 A Faturar</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} processo(s) · <span style={{color:"#E67E00",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqAF(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqAF?"#1A1A1A":"#FFF",color:showArqAF?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqAF?"Ocultar":"Ver Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"a_faturar_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"relatorio",label:"Relatório"},{key:"ov",label:"OV"},{key:"valor",label:"Valor"},{key:"aprovado",label:"Aprovado"},{key:"processoStatus",label:"Status"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>{setEditAF(null);setModalAF(true);}}>+ Novo Processo</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Em Andamento",v:andamento,c:"#1565C0",bg:"#EFF6FF",i:"🔄"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Aprovados",v:aprov,c:"#6A1B9A",bg:"#F3E5F5",i:"👍"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {valorTotal>0&&<div className="card" style={{padding:"14px 20px",marginBottom:18,background:"linear-gradient(90deg,#1A7A3C,#2e9e57)",color:"#FFF",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:24}}>💵</div>
              <div><div style={{fontSize:10,fontWeight:700,opacity:.8,textTransform:"uppercase",letterSpacing:1}}>Valor Total a Faturar</div><div style={{fontSize:22,fontWeight:900}}>R$ {valorTotal.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div></div>
            </div>}
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={afSearch} onChange={e=>setAfSearch(e.target.value)} placeholder="Buscar empresa, PAT, relatório, OV..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={afFrom} onChange={e=>setAfFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={afTo} onChange={e=>setAfTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={afMes} onChange={e=>setAfMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={afAno} onChange={e=>setAfAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(afSearch||afFrom||afTo||afMes||afAno)&&<button onClick={()=>{setAfSearch('');setAfFrom('');setAfTo('');setAfMes('');setAfAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>💰</div><div style={{fontSize:15,fontWeight:600}}>{afSearch||afFrom||afTo||afMes||afAno?"Nenhum resultado":"Nenhum processo"}</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(p=>{
                  const st=ST[p.processoStatus||"pendente"]||ST.pendente;
                  const slaD=p.date?diffDays(p.date):null;
                  return(<div key={p.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:p.processoStatus==="arquivado"?0.6:1}}>
                    <div style={{padding:"11px 14px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:st.c,background:"#FFF",border:`1px solid ${st.c}33`,borderRadius:20,padding:"2px 10px"}}>{st.l}</span>
                        {slaD!==null&&<span style={{fontSize:10,fontWeight:700,color:slaD>10?"#C62828":slaD>5?"#E67E00":"#888",background:"#F5F5F5",borderRadius:20,padding:"2px 8px"}}>⏱ {slaD}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>{setEditAF(p);setModalAF(true);}} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateAF(p.id,{processoStatus:p.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{p.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir permanentemente?")){setProcessosAF(p2=>p2.filter(x=>x.id!==p.id));db.delete("processos_af",p.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{p.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {p.date||"—"} · PAT: <b>{p.patrimonio||"—"}</b></div></div>
                        <span style={{fontSize:11,fontWeight:700,color:p.aprovado==="sim"?"#1A7A3C":"#C62828",background:p.aprovado==="sim"?"#F0FFF5":"#FFF0F0",borderRadius:12,padding:"3px 10px"}}>{p.aprovado==="sim"?"✅ Aprovado":"❌ Não"}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório</div><input type="text" value={p.relatorio||""} onChange={e=>updateAF(p.id,{relatorio:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:12,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>OV</div><input type="text" value={p.ov||""} onChange={e=>updateAF(p.id,{ov:e.target.value})} placeholder="—" style={{width:"100%",fontSize:12,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Valor</div><input type="text" value={p.valor||""} onChange={e=>updateAF(p.id,{valor:e.target.value})} placeholder="R$ 0,00" style={{width:"100%",fontSize:13,fontWeight:800,color:"#1A7A3C",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Serviço Exec.</div><select value={p.servicoExecutado||"nao"} onChange={e=>updateAF(p.id,{servicoExecutado:e.target.value})} style={{fontSize:12,fontWeight:700,color:p.servicoExecutado==="sim"?"#1A7A3C":"#888",border:"none",background:"transparent",outline:"none",cursor:"pointer",padding:0}}><option value="nao">Não</option><option value="sim">Sim</option></select></div>
                      </div>
                      {p.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {p.obs}</div>}
                      <select value={p.processoStatus||"pendente"} onChange={e=>updateAF(p.id,{processoStatus:e.target.value})} style={{fontSize:11,padding:"6px 10px",borderRadius:20,border:`1px solid ${st.c}44`,color:st.c,background:st.bg,fontWeight:700,cursor:"pointer"}}>
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
          const lista=emprestimos.filter(e=>showArqEmp||e.processoStatus!=="arquivado");
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
                <div key={i} className="card" style={{padding:"18px 20px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
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
                    <div style={{padding:"11px 14px",background:sc.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{e.item||e.descricao||<span style={{color:"#CCC"}}>Sem item</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {e.data||"—"} · <b>{e.requerente||"—"}</b></div></div>
                        {e.req&&<span style={{fontSize:11,fontWeight:700,color:"#1565C0",background:"#EFF6FF",borderRadius:8,padding:"3px 8px"}}>{e.req}</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Qtd · PAT</div><div style={{fontSize:12,fontWeight:700}}>{e.quant||"—"} {e.centroResultado&&<span style={{color:"#888",fontWeight:400,fontSize:10}}>· {e.centroResultado}</span>}</div></div>
                        <div style={{background:atrasado?"#FFF0F0":"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Retorno</div><div style={{fontSize:12,fontWeight:700,color:atrasado?"#C62828":"#333"}}>{e.dataRetorno||"—"}</div></div>
                        {e.relatorioAplicado&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório Aplicado</div><div style={{fontSize:12,fontWeight:700,color:"#1A7A3C"}}>{e.relatorioAplicado}{e.dataAplicacao&&<span style={{fontSize:10,color:"#888",fontWeight:400}}> · {e.dataAplicacao}</span>}</div></div>}
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
          const lista=saidaEntrada.filter(s=>showArqSaida||s.processoStatus!=="arquivado");
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
                <BtnExcel onClick={()=>exportCSV(lista,"saida_entrada_grupomov",[{key:"data",label:"Data"},{key:"relSolicitacao",label:"Rel. Sol."},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"PAT"},{key:"peca",label:"Peça"},{key:"codigo",label:"Código"},{key:"quantidade",label:"Qtd"},{key:"req",label:"REQ"},{key:"statusReq",label:"Status REQ"},{key:"statusFinal",label:"Status Final"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>{const row={id:`SAI${Date.now()}_${Math.floor(Math.random()*9999)}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,relSolicitacao:"",empresa:"",patrimonio:"",peca:"",codigo:"",quantidade:"1",req:"",statusReq:"",dataAtendimento:"",localPeca:"",dataEntregaTecnico:"",relatorioAplicado:"",obs:"",statusFinal:"pendente",processoStatus:"em_andamento"};setSaidaEntrada(p=>[row,...p]);db.save("saida_entrada",row.id,row);notify("✅ Registro criado!");}}>+ Novo Registro</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Rupturas",v:rupturas,c:"#C62828",bg:"#FFF0F0",i:"🔴"},{l:"Atendidos",v:atendidos,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
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
                    <div style={{padding:"11px 14px",background:isRuptura?"#FFF0F0":isAtendido?"#F0FFF5":"#F8F9FA",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <select value={s.statusReq||""} onChange={e=>updateSaida(s.id,{statusReq:e.target.value})} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,border:"none",color:isRuptura?"#C62828":isAtendido?"#1A7A3C":"#888",background:isRuptura?"#FFE0E0":isAtendido?"#DCFFE4":"#F0F0F0",cursor:"pointer"}}>
                          <option value="">— Status —</option><option value="atendido">✅ Atendido</option><option value="ruptura">🔴 Ruptura</option>
                        </select>
                        {isRuptura&&slaRuptura!==null&&<span style={{fontSize:10,fontWeight:700,color:slaRuptura>5?"#C62828":"#E67E00",background:"#FFF0F0",borderRadius:20,padding:"2px 8px"}}>⏱ {slaRuptura}d</span>}
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>updateSaida(s.id,{processoStatus:s.processoStatus==="arquivado"?"em_andamento":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{s.processoStatus==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?")){setSaidaEntrada(p=>p.filter(x=>x.id!==s.id));db.delete("saida_entrada",s.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:14,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{s.peca||<span style={{color:"#CCC"}}>Sem peça</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {s.data||"—"} · {s.empresa||"—"}</div></div>
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
          const techsComDados=Array.from(new Set(Object.keys(schedule).map(k=>{const i=k.indexOf("__");return i<0?null:k.slice(0,i);}).filter(Boolean)));
          const baseTechs=agpRegion==="todas"?ALL_TECHS:(REGIONS[agpRegion]?.techs||ALL_TECHS);
          const techs=Array.from(new Set([...baseTechs,...(agpRegion==="todas"?techsComDados:[])]));
          const techsList=techs.filter(t=>agpTech==="todos"||t===agpTech);
          const getTipoCor=t=>(t||"preventivo")==="corretivo"?"#C62828":"#1565C0";
          const addAtend=()=>{
            const dataFinal=agDate||`${ym}-01`;
            if(!agEmpresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agTech}__${dataFinal}`;
            const horas=calcHoras(agEntrada,agSaida);
            saveSched(key,[...(schedule[key]||[]),{client:agEmpresa,cidade:agCidade||"",horimetro:agHorimetro||"",patrimonio:agPat||"",relatorio:agRelatorio||"",type:agTipo,status:(agStatus==="todos"?"agendada":agStatus),horaEntrada:agEntrada,horaSaida:agSaida,horasTrabalhadas:horas}]);
            setAgEmpresa("");setAgCidade("");setAgHorimetro("");setAgPat("");setAgEntrada("");setAgSaida("");setAgRelatorio("");
            notify("✅ Atendimento salvo!");
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🗓 Agenda</div><div style={{fontSize:13,color:"#888"}}>{techsList.length} técnico(s)</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <select value={agpRegion} onChange={e=>setAgpRegion(e.target.value)} style={{fontSize:12}}>
                    <option value="todas">🌐 Todas</option>
                    <option value="metropolitana">Metropolitana</option>
                    <option value="roca">Roça</option>
                    <option value="centroOeste">Centro-Oeste</option>
                  </select>
                  <select value={agpTech} onChange={e=>setAgpTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <select value={agpTipo} onChange={e=>setAgpTipo(e.target.value)} style={{fontSize:12}}><option value="todos">Todos tipos</option><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select>
                  <select value={agpStatus} onChange={e=>setAgpStatus(e.target.value)} style={{fontSize:12}}><option value="todos">Todos status</option>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select>
                  <select value={agpMonth} onChange={e=>setAgpMonth(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                  <select value={agpYear} onChange={e=>setAgpYear(Number(e.target.value))} style={{fontSize:12}}>{[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}</select>
                </div>
              </div>

              {/* Formulário novo atendimento */}
              {!isReadOnlyAgenda(user)&&(
<div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agTech} onChange={e=>setAgTech(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agDate||`${ym}-01`} onChange={e=>setAgDate(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}/>
                  <input type="text" placeholder="Empresa" value={agEmpresa} onChange={e=>setAgEmpresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:130}}/>
                  <input type="text" placeholder="Cidade" value={agCidade||""} onChange={e=>setAgCidade(e.target.value)} style={{fontSize:12,padding:"7px 8px",width:100}}/>
                  <input type="text" placeholder="Horímetro" value={agHorimetro||""} onChange={e=>setAgHorimetro(e.target.value)} style={{fontSize:12,padding:"7px 8px",width:90}}/>
                  <input type="text" placeholder="Patrimônio(s)" value={agPat} onChange={e=>setAgPat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:90}}/>
                  <input type="text" placeholder="Nº Relatório" value={agRelatorio||""} onChange={e=>setAgRelatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",width:100}}/>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Ent.</span><input type="time" value={agEntrada} onChange={e=>setAgEntrada(e.target.value)} style={{fontSize:12,padding:"6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Saí.</span><input type="time" value={agSaida} onChange={e=>setAgSaida(e.target.value)} style={{fontSize:12,padding:"6px"}}/></div>
                  <select value={agTipo} onChange={e=>setAgTipo(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:700,color:getTipoCor(agTipo)}}><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select>
                  <select value={agStatus} onChange={e=>setAgStatus(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select>
                  <BtnY onClick={addAtend}>Adicionar</BtnY>
                </div>
              </div>
              )}

              {/* Calendário horizontal */}
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",width:"100%"}}>
                  <thead>
                    <tr style={{background:"#1A1A1A",position:"sticky",top:0,zIndex:3}}>
                      <th style={{padding:"10px 14px",color:"#F5C200",fontWeight:700,textAlign:"left",position:"sticky",left:0,background:"#1A1A1A",zIndex:4,minWidth:160,whiteSpace:"nowrap",fontSize:13}}>Técnico</th>
                      {dias.map(d=>{
                        const dt=`${ym}-${String(d).padStart(2,"0")}`;
                        const dow=getDOW(dt);
                        const isWkd=dow===0||dow===6;
                        const isToday=dt===TODAY_STR;
                        return(
                          <th key={d} style={{padding:"8px 6px",color:isToday?"#F5C200":isWkd?"#888":"#FFF",fontWeight:isToday?900:600,textAlign:"center",minWidth:220,background:isToday?"#3A3A00":isWkd?"#2A2A2A":"#1A1A1A",borderLeft:"1px solid #333",fontSize:12}}>
                            <div style={{fontSize:14,fontWeight:800}}>Dia {String(d).padStart(2,"0")}</div>
                            <div style={{fontSize:10,color:"#AAA",fontWeight:400}}>{"Dom Seg Ter Qua Qui Sex Sáb".split(" ")[dow]}</div>
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
                          <td style={{padding:"10px 14px",position:"sticky",left:0,background:ti%2===0?"#FAFAFA":"#FFF",zIndex:1,borderBottom:"1px solid #EEE",borderRight:"2px solid #E0E0E0"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                              <span style={{width:10,height:10,borderRadius:"50%",background:color,display:"inline-block",flexShrink:0}}/>
                              <span style={{fontWeight:800,fontSize:13}}>{tech}</span>
                            </div>
                            <div style={{fontSize:11,color:"#888"}}>{totalAtend} atendimento(s) · {totalConc} concl. · {MESES[agpMonth]}</div>
                          </td>
                          {dias.map(d=>{
                            const dt=`${ym}-${String(d).padStart(2,"0")}`;
                            const key=`${tech}__${dt}`;
                            const slots=(schedule[key]||[]).filter(s=>matchSt(s)&&matchTipo(s));
                            const dow=getDOW(dt);
                            const isWkd=dow===0||dow===6;
                            const isToday=dt===TODAY_STR;
                            return(
                              <td key={d} style={{padding:6,verticalAlign:"top",borderLeft:"1px solid #EEE",borderBottom:"1px solid #EEE",background:isToday?"#FFFDE7":isWkd?"#F5F5F5":"transparent",minWidth:220}}>
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
                                    <div key={si} style={{background:"#FFF",border:`1px solid ${tipoC}33`,borderLeft:`4px solid ${tipoC}`,borderRadius:8,padding:"8px 10px",marginBottom:6,boxShadow:"0 2px 6px rgba(0,0,0,.07)"}}>
                                      {/* Header: Empresa + botões */}
                                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                                        <div style={{fontWeight:800,fontSize:13,color:"#1A1A1A",flex:1,marginRight:4,wordBreak:"break-word"}}>{s.client}</div>
                                        {!isReadOnlyAgenda(user)&&(<div style={{display:"flex",gap:3,flexShrink:0}}>
                                          <button onClick={()=>{setEditSlot({key,si,slot:s,tipo:"tecnico"});setEditSlotForm({...s});}} style={{background:"none",border:"none",color:"#1565C0",cursor:"pointer",fontSize:14,padding:"0 2px"}}>✏️</button>
                                          <button onClick={()=>{if(window.confirm("Remover?")){const arr=(schedule[key]||[]).filter((_,j)=>j!==si);saveSched(key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:14,padding:"0 2px"}}>✕</button>
                                        </div>)}
                                      </div>
                                      {/* Patrimônio · Tipo */}
                                      <div style={{fontSize:11,color:"#888",marginBottom:4}}>🏷️ {s.patrimonio||"—"} · <b style={{color:tipoC}}>{(s.type||"preventivo")==="corretivo"?"Corretivo":"Preventivo"}</b></div>
                                      {/* Cidade */}
                                      {s.cidade&&<div style={{fontSize:11,color:"#555",marginBottom:3}}>📍 {s.cidade}</div>}
                                      {/* Horímetro */}
                                      {s.horimetro&&<div style={{fontSize:11,color:"#555",marginBottom:3}}>⏱ {s.horimetro}</div>}
                                      {/* Relatório */}
                                      <input
                                        type="text"
                                        defaultValue={s.relatorio||""}
                                        onBlur={e=>updateSlot({relatorio:e.target.value})}
                                        placeholder="Nº Relatório"
                                        disabled={isReadOnlyAgenda(user)}
                                        style={{width:"100%",fontSize:11,padding:"4px 6px",border:"1px solid #E0E0E0",borderRadius:5,marginBottom:4,boxSizing:"border-box",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}
                                      />
                                      {/* Entrada / Saída / Soma */}
                                      <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:4}}>
                                        <input type="time" defaultValue={s.horaEntrada||""} onBlur={e=>updateSlot({horaEntrada:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:11,padding:"3px 4px",border:"1px solid #E0E0E0",borderRadius:5,flex:1,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/>
                                        <span style={{fontSize:10,color:"#888"}}>→</span>
                                        <input type="time" defaultValue={s.horaSaida||""} onBlur={e=>updateSlot({horaSaida:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:11,padding:"3px 4px",border:"1px solid #E0E0E0",borderRadius:5,flex:1,background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/>
                                        {horas&&<span style={{fontSize:11,fontWeight:800,color:"#1A7A3C",background:"#F0FFF5",padding:"2px 5px",borderRadius:4,whiteSpace:"nowrap"}}>{horas}</span>}
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
                                      }} disabled={isReadOnlyAgenda(user)} style={{fontSize:11,padding:"3px 4px",border:"1px solid #E0E0E0",borderRadius:5,width:"100%",marginBottom:4,boxSizing:"border-box",background:isReadOnlyAgenda(user)?"#F5F5F5":"#FFF"}}/>
                                      {/* Status */}
                                      <select value={s.status||"agendada"} onChange={e=>updateSlot({status:e.target.value})} disabled={isReadOnlyAgenda(user)} style={{fontSize:11,padding:"4px 6px",border:"1px solid #E0E0E0",borderRadius:5,width:"100%",fontWeight:700,color:st.color,background:st.bg}}>
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
            <div style={{fontWeight:800,fontSize:22,marginBottom:20}}>📊 Dashboard de Atendimentos</div>

            {/* ── FILTRO + GRÁFICOS ── */}
            {(()=>{
              const chartTitle={fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:1,marginBottom:12};
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
                    <span style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:1}}>Filtro</span>
                    <select value={dashRegion} onChange={e=>setDashRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option>{regList.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
                    <select value={dashTech} onChange={e=>setDashTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={dashFrom} onChange={e=>setDashFrom(e.target.value)} style={{fontSize:12}}/></div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={dashTo} onChange={e=>setDashTo(e.target.value)} style={{fontSize:12}}/></div>
                    {(dashRegion!=="todas"||dashFrom||dashTo||dashTech!=="todos")&&<BtnG onClick={()=>{setDashRegion("todas");setDashFrom("");setDashTo("");setDashTech("todos");}}>✕ Limpar</BtnG>}
                    <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{dashReports.length} atendimento(s) no filtro</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:24}}>
                    <div className="card" style={{padding:"16px 20px"}}>
                      <div style={chartTitle}>Preventivas × Corretivas (qtd e %)</div>
                      <ChartCanvas type="doughnut" height={230}
                        data={{labels:["Preventivas","Corretivas"],datasets:[{data:[prev,corr],backgroundColor:[BLU,RED],borderWidth:2,borderColor:"#FFF",hoverOffset:6}]}}
                        options={{cutout:"60%",maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} (${pct(c.raw)}%)`}}}}}/>
                      <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:10,fontSize:13}}>
                        <span style={{color:BLU,fontWeight:700}}>{prev} prev · {pct(prev)}%</span>
                        <span style={{color:RED,fontWeight:700}}>{corr} corr · {pct(corr)}%</span>
                      </div>
                    </div>
                    <div className="card" style={{padding:"16px 20px"}}>
                      <div style={chartTitle}>Por região</div>
                      <ChartCanvas type="bar" height={230}
                        data={{labels:regList.map(([,l])=>l),datasets:[{label:"Preventivas",data:regPrev,backgroundColor:BLU,borderRadius:4},{label:"Corretivas",data:regCorr,backgroundColor:RED,borderRadius:4}]}}
                        options={{maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}}/>
                    </div>
                    <div className="card" style={{padding:"16px 20px"}}>
                      <div style={chartTitle}>Atendimentos por técnico</div>
                      {techsWith.length?<ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                        data={{labels:techsWith,datasets:[{label:"Atendimentos",data:techCounts,backgroundColor:YEL,borderColor:"#C9A200",borderWidth:1,borderRadius:4}]}}
                        options={{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}}}}/>:<div style={{color:"#CCC",fontSize:13,padding:"30px 0",textAlign:"center"}}>Sem dados no filtro.</div>}
                    </div>
                    <div className="card" style={{padding:"16px 20px"}}>
                      <div style={chartTitle}>Horas trabalhadas por técnico</div>
                      {techsWith.length?<ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                        data={{labels:techsWith,datasets:[{label:"Horas",data:techHours,backgroundColor:ORG,borderRadius:4}]}}
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
                        borderRadius:4,borderSkipped:false,
                      }))
                    };
                    return(
                      <div className="card" style={{padding:20,marginBottom:16}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Tipo de Serviço por Técnico</div>
                        <ChartCanvas type="bar" height={Math.max(160,techsWith.length*34)}
                          data={chartServTechData}
                          options={{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:true,position:"top",labels:{font:{size:10},boxWidth:12}}},scales:{x:{stacked:true,beginAtZero:true,ticks:{precision:0}},y:{stacked:true,grid:{display:false}}}}}/>
                      </div>
                    );
                  })()}
                  <div style={{fontSize:13,fontWeight:700,color:"#888",margin:"4px 0 14px"}}>Visão geral (todos os atendimentos)</div>
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
                <div key={i} className="card" style={{padding:"16px 20px",borderTop:`3px solid ${s.c}`}}>
                  <div style={{fontSize:10,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
                  <div style={{fontSize:34,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
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
                <div className="card" style={{padding:"16px 20px",marginBottom:20,display:"flex",gap:32,alignItems:"center",flexWrap:"wrap",borderTop:"3px solid #C47D00"}}>
                  <div style={{fontSize:11,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>⏱ Resumo do mês atual</div>
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
                    <div style={{padding:"12px 16px",borderBottom:"1px solid #F4F4F4",display:"flex",alignItems:"center",gap:10}}>
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
                        <div style={{fontSize:20,fontWeight:700,color:"#1565C0"}}>{prevs}</div>
                        <div style={{fontSize:9,color:"#1565C0",fontWeight:600,textTransform:"uppercase"}}>Prev.</div>
                      </div>
                      <div style={{width:8}}/>
                      <div style={{flex:1,textAlign:"center",padding:"8px 0",background:"#FFF0F0",borderRadius:8}}>
                        <div style={{fontSize:20,fontWeight:700,color:"#C62828"}}>{corrs}</div>
                        <div style={{fontSize:9,color:"#C62828",fontWeight:600,textTransform:"uppercase"}}>Corret.</div>
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
          const lista=uberPedidos.filter(p=>showArqUber||!p.arquivado);
          const pend=lista.filter(p=>p.status==="pendente"||!p.status).length;
          const conc=lista.filter(p=>p.status==="concluido").length;
          const totalVal=lista.reduce((acc,p)=>{const v=parseFloat((p.valor||"0").replace(/[^\d.,]/g,"").replace(",","."));return acc+(isNaN(v)?0:v);},0);
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
                <BtnY onClick={addUber}>+ Novo Pedido</BtnY>
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
                    <div style={{padding:"11px 14px",background:ok?"#F0FFF5":"#FFF8F0",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <select value={p.status||"pendente"} onChange={e=>updateUber(p.id,{status:e.target.value})} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":"#E67E00",background:"#FFF",cursor:"pointer"}}>
                        <option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option><option value="cancelado">❌ Cancelado</option>
                      </select>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>updateUber(p.id,{arquivado:!p.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{p.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delUber(p.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
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
          const lista=financeiro.filter(f=>showArqFin||!f.arquivado);
          const pend=lista.filter(f=>f.situacao==="pendente"||!f.situacao).length;
          const pago=lista.filter(f=>f.situacao==="pago").length;
          const totalVal=lista.reduce((acc,f)=>{const v=parseFloat((f.valor||"0").replace(/[^\d.,]/g,"").replace(",","."));return acc+(isNaN(v)?0:v);},0);
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
                <BtnY onClick={addFin}>+ Novo Lançamento</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Pagos",v:pago,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Sem Acerto",v:semAcerto,c:"#E67E00",bg:"#FFF8F0",i:"⚠️"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
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
                    <div style={{padding:"11px 14px",background:sol.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:sol.c,background:"#FFF",border:`1px solid ${sol.c}33`,borderRadius:20,padding:"2px 10px"}}>{sol.l}</span>
                        <select value={f.situacao||"pendente"} onChange={e=>updateFin(f.id,{situacao:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:pago?"#1A7A3C":"#C62828",background:pago?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option value="pago">✅ Pago</option><option value="pendente">⏳ Pendente</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>updateFin(f.id,{arquivado:!f.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{f.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delFin(f.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{f.tecnico||"—"}</div><div style={{fontSize:11,color:"#888"}}>📅 {f.data||"—"} · Ticket: <b style={{color:"#1565C0"}}>{f.ticket||"—"}</b></div></div>
                        <div style={{fontSize:18,fontWeight:900,color:"#1A7A3C"}}>{f.valor?`R$ ${f.valor}`:"R$ —"}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Atendimento / PAT</div><input type="text" value={f.atendimento||""} onChange={e=>updateFin(f.id,{atendimento:e.target.value})} placeholder="Atendimento" style={{width:"100%",fontSize:11,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Acerto</div>
                          <select value={f.acerto||"nao"} onChange={e=>updateFin(f.id,{acerto:e.target.value})} style={{fontSize:11,fontWeight:700,color:f.acerto==="sim"?"#1A7A3C":"#C62828",border:"none",background:"transparent",cursor:"pointer",outline:"none",padding:0}}><option value="sim">✅ Sim</option><option value="nao">❌ Não</option></select>
                        </div>
                        {f.reembolso==="sim"&&<div style={{background:"#EFF6FF",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Reembolso</div><div style={{fontSize:12,fontWeight:700,color:"#1565C0"}}>R$ {f.valorReembolso||"—"} · Ticket: {f.ticketReembolso||"—"}</div></div>}
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
          const lista=frota.filter(r=>showArqFro||!r.arquivado);
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
                <BtnY onClick={()=>froCrud.add({dataEnvio:TODAY_STR,rel:"",empresa:"",tecnico:ALL_TECHS[0],pat:"",patTipo:"bateria",resolvido:"nao",novoPat:"",data:"",nf:"",relEntrega:""})}>+ Nova Pendência</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Resolvidos",v:resolvidos,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
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
                    <div style={{padding:"11px 14px",background:ok?"#F0FFF5":tp.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:ok?"#1A7A3C":tp.c,background:"#FFF",border:`1px solid ${ok?"#1A7A3C":tp.c}33`,borderRadius:20,padding:"2px 10px"}}>{tp.l}</span>
                        <select value={r.resolvido||"nao"} onChange={e=>froCrud.update(r.id,{resolvido:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":"#C62828",background:ok?"#DCFFE4":"#FFE0E0",cursor:"pointer"}}><option value="sim">✅ Resolvido</option><option value="nao">⏳ Pendente</option></select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>froCrud.update(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))froCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.empresa||<span style={{color:"#CCC"}}>Empresa</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {r.dataEnvio||"—"} · <b>{r.tecnico||"—"}</b></div></div>
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
          const list=prioridades.filter(r=>showArqPri||!r.arquivado);
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

        {/* ── RH-FISCAL (somente Manuela) ── */}
        {tab==="rh_fiscal"&&(()=>{
          const MOT={folga:"🏖️ Folga",ferias:"🌴 Férias",afastamento:"🏥 Afastamento",atestado:"📋 Atestado",demissao:"❌ Demissão",admissao:"✅ Admissão",outros:"📦 Outros"};
          const STS={pendente_luana:{l:"⏳ Pend. Luana",c:"#E67E00",bg:"#FFF8F0"},pendente_elci:{l:"⏳ Pend. Elci",c:"#8E44AD",bg:"#F6F0FB"},em_andamento:{l:"🔄 Em Andamento",c:"#1565C0",bg:"#EFF6FF"},concluido:{l:"✅ Concluído",c:"#1A7A3C",bg:"#F0FFF5"}};
          const lista=rhFiscal.filter(r=>showArqRH||!r.arquivado);
          const pend=lista.filter(r=>r.status==="pendente_luana"||r.status==="pendente_elci"||!r.status).length;
          const conc=lista.filter(r=>r.status==="concluido").length;
                    const applyFilter=(r,d=r.dataEnvio||"")=>{
            if(rhSearch){const q=rhSearch.toLowerCase();if(!((r.funcionario||"").toLowerCase().includes(q)||(r.responsavel||"").toLowerCase().includes(q)||(r.obs||"").toLowerCase().includes(q)))return false;}
            if(rhFrom&&d<rhFrom)return false;
            if(rhTo&&d>rhTo)return false;
            if(rhMes&&!d.slice(5,7).startsWith(rhMes))return false;
            if(rhAno&&!d.startsWith(rhAno))return false;
            return true;
          };
          const listaFil=lista.filter(applyFilter);
          return(<div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>🧾 RH-Fiscal</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} item(ns) · <span style={{color:"#C62828",fontWeight:700}}>{pend} pendentes</span></div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqRH(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqRH?"#1A1A1A":"#FFF",color:showArqRH?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqRH?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"rh_fiscal",[{key:"dataEnvio",label:"Data"},{key:"responsavel",label:"Responsável"},{key:"motivo",label:"Motivo"},{key:"funcionario",label:"Funcionário"},{key:"status",label:"Status"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>rhCrud.add({dataEnvio:TODAY_STR,responsavel:"Luana",motivo:"folga",funcionario:"",status:"pendente_luana",obs:""})}>+ Novo Item</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#E67E00",bg:"#FFF8F0",i:"⏳"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
                        <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={rhSearch} onChange={e=>setRhSearch(e.target.value)} placeholder="Buscar funcionário, responsável, obs..." style={{width:"100%",padding:"8px 10px 8px 30px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={rhFrom} onChange={e=>setRhFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={rhTo} onChange={e=>setRhTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={rhMes} onChange={e=>setRhMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={rhAno} onChange={e=>setRhAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(rhSearch||rhFrom||rhTo||rhMes||rhAno)&&<button onClick={()=>{setRhSearch('');setRhFrom('');setRhTo('');setRhMes('');setRhAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>🧾</div><div style={{fontSize:15,fontWeight:600}}>Nenhum item</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(r=>{
                  const st=STS[r.status||"pendente_luana"]||STS.pendente_luana;
                  const mot=MOT[r.motivo||"outros"]||"📦";
                  return(<div key={r.id} className="card" style={{borderTop:`4px solid ${st.c}`,padding:0,overflow:"hidden",opacity:r.arquivado?0.55:1}}>
                    <div style={{padding:"11px 14px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <select value={r.status||"pendente_luana"} onChange={e=>rhCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,border:"none",color:st.c,background:"#FFF",cursor:"pointer"}}>
                        {Object.entries(STS).map(([v,s])=><option key={v} value={v}>{s.l}</option>)}
                      </select>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>rhCrud.update(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{r.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))rhCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.funcionario||<span style={{color:"#CCC"}}>Funcionário</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {r.dataEnvio||"—"} · {r.responsavel||"—"}</div></div>
                        <span style={{fontSize:12,background:"#F5F5F5",borderRadius:8,padding:"4px 10px",fontWeight:600}}>{mot}</span>
                      </div>
                      <select value={r.motivo||"outros"} onChange={e=>rhCrud.update(r.id,{motivo:e.target.value})} style={{fontSize:11,padding:"6px 10px",borderRadius:20,border:"1px solid #E0E0E0",fontWeight:600,cursor:"pointer"}}>
                        {Object.entries(MOT).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                      {r.obs&&<div style={{fontSize:11,color:"#666",fontStyle:"italic",background:"#FFFBF0",borderRadius:8,padding:"6px 10px",borderLeft:"3px solid #F5C200"}}>💬 {r.obs}</div>}
                      <textarea value={r.obs||""} onChange={e=>rhCrud.update(r.id,{obs:e.target.value})} placeholder="Observações..." rows={2} style={{fontSize:11,padding:"8px 10px",borderRadius:8,border:"1px solid #E0E0E0",resize:"none",fontFamily:"inherit",background:"#FAFAFA"}}/>
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{r.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── PENDÊNCIAS GUSTAVO (somente Manuela) ── */}
        {tab==="pendencias_gustavo"&&user.id==="manuela"&&(()=>{
          const list=pendGustavo.filter(r=>showArqGus||!r.arquivado);
          const SOL={cliente:"Cliente",frota:"Frota",oficina:"Oficina",tecnicos:"Técnicos"};
          const STS={resolvido:"Resolvido",diretoria:"Diretoria",em_andamento:"Em Andamento",pendente:"Pendente"};
          const PRIO={urgente:{l:"🔴 Urgente",c:"#C62828",bg:"#FFF0F0"},medio:{l:"🟡 Médio",c:"#E67E00",bg:"#FFF8F0"},aguardar:{l:"🟢 Aguardar",c:"#1A7A3C",bg:"#F0FFF5"}};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📌 Pendências Gustavo</div><div style={{fontSize:13,color:"#888"}}>{list.length} item(ns) · visível só para você</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqGus(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqGus?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqGus?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>gusCrud.add({data:TODAY_STR,solicitacao:"cliente",empresa:"",demanda:"email",status:"pendente",prioridade:"medio",obs:""})}>+ Nova Pendência</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma pendência.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data</th><th>Prioridade</th><th>Solicitação</th><th>Empresa</th><th>Demanda</th><th>Status</th><th>Observações</th><th>Registrado por</th><th>Ações</th></tr></thead>
                  <tbody>{list.map(r=>{const res=r.status==="resolvido";const pend=r.status==="pendente";const p=PRIO[r.prioridade||"medio"];return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.data||""} onChange={e=>gusCrud.update(r.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><select value={r.prioridade||"medio"} onChange={e=>gusCrud.update(r.id,{prioridade:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:p.c,background:p.bg}}>{Object.entries(PRIO).map(([v,x])=><option key={v} value={v}>{x.l}</option>)}</select></td>
                      <td><select value={r.solicitacao||"cliente"} onChange={e=>gusCrud.update(r.id,{solicitacao:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:600}}>{Object.entries(SOL).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.empresa||""} onChange={e=>gusCrud.update(r.id,{empresa:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><select value={r.demanda||"email"} onChange={e=>gusCrud.update(r.id,{demanda:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}><option value="email">📧 Email</option><option value="whatsapp">💬 WhatsApp</option></select></td>
                      <td><select value={r.status||"pendente"} onChange={e=>gusCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:res?"#1A7A3C":pend?"#C62828":"#1565C0",background:res?"#F0FFF5":pend?"#FFF0F0":"#F0F4FF",minWidth:130}}>{Object.entries(STS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.obs||""} onChange={e=>gusCrud.update(r.id,{obs:e.target.value})} style={{width:240,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                      <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      <td style={{whiteSpace:"nowrap"}}><button onClick={()=>gusCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))gusCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>
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
          const lista=rupturas.filter(r=>showArqRuptura||!r.arquivado);
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
                <ExportBar data={lista} filename="ruptura_almox" cols={[{key:"data",label:"Data"},{key:"solicitacao",label:"Solicitação"},{key:"ticket",label:"Ticket"},{key:"requisicao",label:"Requisição"},{key:"peca",label:"Peça"},{key:"codigo",label:"Código"},{key:"quantidade",label:"Qtd"},{key:"osRel",label:"OS/REL"},{key:"pat",label:"PAT"},{key:"empresa",label:"Empresa"},{key:"tecnico",label:"Técnico"},{key:"status",label:"Status"},{key:"dataLiberacao",label:"Dt Liberação"},{key:"obs",label:"Obs"}]}/>
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
            <div className="card" style={{padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
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
                        <div style={{padding:"11px 14px",background:st.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                        <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",lineHeight:1.2,marginBottom:3}}>{r.peca||<span style={{color:"#CCC"}}>Sem peça</span>}</div>
                              <div style={{fontSize:11,color:"#888"}}>📅 {r.data||"—"} · {SOL_LABEL[r.solicitacao]||"—"}</div>
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
          const totalEmp=emprestimos.length;
          const totalSai=saidaEntrada.length;
          const total=allReqs.length;
          // Rupturas S/E
          const rupturasS=saidaEntrada.filter(s=>s.statusReq==="ruptura");
          const rupturasInfo=rupturasS.map(s=>({peca:s.peca||s.descricao||"—",empresa:s.empresa||"—",dias:s.data?diffDays(s.data):null,codigo:s.codigo||"—"}));
          const atendidos=saidaEntrada.filter(s=>s.statusReq==="atendido").length;
          const pendentes=emprestimos.filter(e=>(e.statusEmp||"pendente")==="pendente").length+saidaEntrada.filter(s=>(s.statusFinal||"pendente")==="pendente").length;
          const concluidos=emprestimos.filter(e=>e.statusEmp==="concluido").length+saidaEntrada.filter(s=>s.statusFinal==="concluido").length;
          // Por técnico
          const byTech={};
          emprestimos.forEach(e=>{const t=e.requerente||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          saidaEntrada.forEach(s=>{const t=s.requerente||s.empresa||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          const techSorted=Object.entries(byTech).sort((a,b)=>b[1]-a[1]).slice(0,10);
          // Peças mais solicitadas (S/E + Empréstimos)
          const pecaCount={};
          saidaEntrada.forEach(s=>{const p=s.peca||s.descricao||"";if(p)pecaCount[p]=(pecaCount[p]||0)+1;});
          emprestimos.forEach(e=>{const p=e.item||e.descricao||"";if(p)pecaCount[p]=(pecaCount[p]||0)+1;});
          const topPecas=Object.entries(pecaCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
          // Evolução por mês (últimos 6 meses)
          const getMes=(dateStr)=>{if(!dateStr)return null;const d=new Date(dateStr);if(isNaN(d))return null;return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
          const mesEmp={};emprestimos.forEach(e=>{const m=getMes(e.dataEmp||e.dataSaida||e.registradoEm);if(m)mesEmp[m]=(mesEmp[m]||0)+1;});
          const mesSai={};saidaEntrada.forEach(s=>{const m=getMes(s.dataSaida||s.data||s.registradoEm);if(m)mesSai[m]=(mesSai[m]||0)+1;});
          const allMeses=[...new Set([...Object.keys(mesEmp),...Object.keys(mesSai)])].sort().slice(-6);
          const mesesLabel=allMeses.map(m=>{const[y,mo]=m.split("-");const nomes=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];return`${nomes[parseInt(mo)-1]}/${y.slice(2)}`;});
          const chartEvolucao={labels:mesesLabel,datasets:[{label:"Empréstimo/Retorno",data:allMeses.map(m=>mesEmp[m]||0),backgroundColor:"#F5C200",borderRadius:4},{label:"Entrada/Saída",data:allMeses.map(m=>mesSai[m]||0),backgroundColor:"#1565C0",borderRadius:4}]};
          // Tipo por técnico empilhado
          const techsAtivos=techSorted.slice(0,8).map(([t])=>t);
          const empByTech={};saidaEntrada.forEach(s=>{const t=s.requerente||s.empresa||"Sem técnico";empByTech[t]=(empByTech[t]||0)+1;});
          const empByTechEmp={};emprestimos.forEach(e=>{const t=e.requerente||"Sem técnico";empByTechEmp[t]=(empByTechEmp[t]||0)+1;});
          const chartTipoTech={labels:techsAtivos,datasets:[{label:"Entrada/Saída",data:techsAtivos.map(t=>empByTech[t]||0),backgroundColor:"#1565C0",borderRadius:4},{label:"Empréstimo/Retorno",data:techsAtivos.map(t=>empByTechEmp[t]||0),backgroundColor:"#F5C200",borderRadius:4}]};
          // Gráficos status
          const chartStatusEmpData={labels:["Pendente","Concluído"],datasets:[{data:[emprestimos.filter(e=>(e.statusEmp||"pendente")==="pendente").length,emprestimos.filter(e=>e.statusEmp==="concluido").length],backgroundColor:["#C62828","#1A7A3C"],borderWidth:0}]};
          const chartStatusSaiData={labels:["Ruptura","Atendido","Pendente","Concluído"],datasets:[{data:[rupturasS.length,atendidos,saidaEntrada.filter(s=>(s.statusFinal||"pendente")==="pendente").length,saidaEntrada.filter(s=>s.statusFinal==="concluido").length],backgroundColor:["#C62828","#1A7A3C","#E67E00","#1565C0"],borderWidth:0}]};
          const pecasAplicadas=saidaEntrada.filter(s=>s.relatorioAplicado).map(s=>({rel:s.relatorioAplicado,peca:s.peca||s.descricao||"—",empresa:s.empresa||"—"}));
          const empPecasAplicadas=emprestimos.filter(e=>e.relatorioAplicado).map(e=>({rel:e.relatorioAplicado,peca:e.descricao||"—",empresa:e.requerente||"—"}));
          const todasPecasAplicadas=[...pecasAplicadas,...empPecasAplicadas];
          const KPIR=({label,value,color="#1A1A1A",bg="#FFF",icon,sub})=>(
            <div className="card" style={{padding:"16px 20px",background:bg,borderTop:`3px solid ${color}`,display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>{icon} {label}</div>
              <div style={{fontSize:30,fontWeight:900,color,lineHeight:1}}>{value}</div>
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
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:20}}>
                <KPIR icon="📦" label="Total" value={total} color="#1A1A1A"/>
                <KPIR icon="🔄" label="Empréstimos" value={totalEmp} color="#F5C200"/>
                <KPIR icon="📤" label="Entrada/Saída" value={totalSai} color="#1565C0"/>
                <KPIR icon="🔴" label="Rupturas S/E" value={rupturasS.length} color="#C62828" bg="#FFF8F8"/>
                <KPIR icon="🏭" label="Ruptura Almox" value={(ruptAlmox).filter(r=>!r.arquivado).length} color="#AD1457" bg="#FFF0F8"/>
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
              {ruptAlmox.filter(r=>!r.arquivado).length>0&&(
                <div className="card" style={{padding:16,marginBottom:16,borderLeft:"4px solid #AD1457"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#AD1457",marginBottom:10}}>🏭 Ruptura Almoxarifado — Em Aberto ({ruptAlmox.filter(r=>!r.arquivado&&r.status!=="liberado_almox").length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Data</th><th>Peça</th><th>Cód.</th><th>Empresa</th><th>PAT</th><th>Técnico</th><th>Solicitação</th><th>SLA</th><th>Status</th></tr></thead>
                    <tbody>{ruptAlmox.filter(r=>!r.arquivado&&r.status!=="liberado_almox").map((r,i)=>{
                      const dias=r.status==="separado_suporte"||r.status==="liberado_almox"?null:r.data?Math.floor((Date.now()-new Date(r.data).getTime())/86400000):null;
                      const SOLS={sem_estoque:"Sem estoque",cadastro_compra:"Cadastro e compra",cadastrado_aguard:"Cadastrado aguard.",compra_aguard_ret:"Compra aguard. retorno",consumo_gilberto:"Consumo Gilberto"};
                      const STATS={aguardando:{l:"Aguardando",c:"#E67E00"},aguard_aprov_dir:{l:"Aguard. Diretoria",c:"#8E44AD"},separado_suporte:{l:"Separado Suporte",c:"#1565C0"},liberado_almox:{l:"Liberado",c:"#1A7A3C"}};
                      const st=STATS[r.status]||STATS.aguardando;
                      return(<tr key={i}>
                        <td style={{fontSize:11,whiteSpace:"nowrap"}}>{r.data||"—"}</td>
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
          const mu=processosMU||[];
          const af=processosAF||[];
          const getMes=(d)=>{if(!d)return null;const dt=new Date(d);if(isNaN(dt))return null;return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;};
          const nomesMes=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
          // Evolução MU+AF por mês
          const mesMU={};mu.forEach(p=>{const m=getMes(p.date||p.registradoEm);if(m)mesMU[m]=(mesMU[m]||0)+1;});
          const mesAF={};af.forEach(p=>{const m=getMes(p.date||p.registradoEm);if(m)mesAF[m]=(mesAF[m]||0)+1;});
          const allMeses=[...new Set([...Object.keys(mesMU),...Object.keys(mesAF)])].sort().slice(-6);
          const mesesLabel=allMeses.map(m=>{const[y,mo]=m.split("-");return`${nomesMes[parseInt(mo)-1]}/${y.slice(2)}`;});
          const chartEvolProc={labels:mesesLabel,datasets:[{label:"⚠️ Mau Uso",data:allMeses.map(m=>mesMU[m]||0),backgroundColor:"#C62828",borderRadius:4},{label:"💰 A Faturar",data:allMeses.map(m=>mesAF[m]||0),backgroundColor:"#F5C200",borderRadius:4}]};
          // Top empresas combinadas
          const empCount={};
          mu.forEach(p=>{const e=p.empresa||"";if(e)empCount[e]=(empCount[e]||0)+1;});
          af.forEach(p=>{const e=p.empresa||"";if(e)empCount[e]=(empCount[e]||0)+1;});
          const topEmpresas=Object.entries(empCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
          // Status MU
          const muPend=mu.filter(p=>!p.processoStatus||p.processoStatus==="pendente").length;
          const muAnd=mu.filter(p=>p.processoStatus==="em_andamento").length;
          const muConc=mu.filter(p=>p.processoStatus==="concluido").length;
          const muArq=mu.filter(p=>p.processoStatus==="arquivado").length;
          // Status AF
          const afPend=af.filter(p=>!p.processoStatus||p.processoStatus==="pendente").length;
          const afAnd=af.filter(p=>p.processoStatus==="em_andamento").length;
          const afConc=af.filter(p=>p.processoStatus==="concluido").length;
          // Aprovação AF
          const afAprov=af.filter(p=>p.aprovado==="sim").length;
          const afServExec=af.filter(p=>p.servicoExecutado==="sim").length;
          // Valor total AF
          const valorAF=af.reduce((acc,p)=>{const v=parseFloat((p.valor||"0").toString().replace(/[^\d.,]/g,"").replace(",","."));return acc+(isNaN(v)?0:v);},0);
          const chartMuStatus={labels:["Pendente","Em Andamento","Concluído","Arquivado"],datasets:[{data:[muPend,muAnd,muConc,muArq],backgroundColor:["#C62828","#1565C0","#1A7A3C","#888"],borderWidth:0}]};
          const chartAfStatus={labels:["Pendente","Em Andamento","Concluído"],datasets:[{data:[afPend,afAnd,afConc],backgroundColor:["#E67E00","#1565C0","#1A7A3C"],borderWidth:0}]};
          const chartAfAprov={labels:["Aprovado","Pendente"],datasets:[{data:[afAprov,af.length-afAprov],backgroundColor:["#1A7A3C","#E0E0E0"],borderWidth:0}]};
          const chartEmpTop={labels:topEmpresas.map(([e])=>e),datasets:[{label:"Processos",data:topEmpresas.map(([,q])=>q),backgroundColor:topEmpresas.map((_,i)=>i%2===0?"#F5C200":"#C62828"),borderRadius:4,borderSkipped:false}]};
          const donutOpts=(pos="bottom")=>({plugins:{legend:{position:pos,labels:{font:{size:9}}}},cutout:"60%",maintainAspectRatio:false});
          const barOpts={plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0F0F0"}}},maintainAspectRatio:false};
          const barOptsStack={plugins:{legend:{position:"bottom",labels:{font:{size:10}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}},y:{stacked:true,beginAtZero:true,ticks:{precision:0}}},maintainAspectRatio:false};
          const KPIP=({icon,label,value,color="#1A1A1A",bg="#FFF",sub})=>(
            <div className="card" style={{padding:"14px 18px",borderTop:`3px solid ${color}`,background:bg}}>
              <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>{icon} {label}</div>
              <div style={{fontSize:28,fontWeight:900,color,lineHeight:1}}>{value}</div>
              {sub&&<div style={{fontSize:10,color:"#AAA",marginTop:3}}>{sub}</div>}
            </div>
          );
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{fontWeight:900,fontSize:24}}>📊 Dashboard Processos</div>
                <span style={{fontSize:11,background:"#FFF0E0",color:"#C47D00",borderRadius:20,padding:"3px 12px",fontWeight:700}}>⚠️ Mau Uso + 💰 A Faturar</span>
              </div>

              {/* KPIs gerais */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                <KPIP icon="⚠️" label="Total Mau Uso" value={mu.length} color="#C62828" bg="#FFF8F8"/>
                <KPIP icon="💰" label="Total A Faturar" value={af.length} color="#F5C200"/>
                <KPIP icon="✅" label="AF Aprovados" value={afAprov} color="#1A7A3C" bg="#F0FFF5" sub={`de ${af.length} processos`}/>
                <KPIP icon="🔧" label="Serviço Executado" value={afServExec} color="#1565C0" bg="#F0F4FF" sub={`de ${af.length} A Faturar`}/>
              </div>
              {valorAF>0&&(
                <div className="card" style={{padding:"14px 20px",marginBottom:16,background:"linear-gradient(90deg,#1A7A3C 0%,#2e9e57 100%)",color:"#FFF",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{fontSize:28}}>💵</div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,opacity:.8,textTransform:"uppercase",letterSpacing:.8}}>Valor Total A Faturar</div>
                    <div style={{fontSize:26,fontWeight:900}}>R$ {valorAF.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                  </div>
                </div>
              )}

              {/* Linha 1: Evolução + Top Empresas */}
              <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,marginBottom:16}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📈 Evolução por Mês</div>
                  <div style={{height:200}}><ChartCanvas type="bar" data={chartEvolProc} options={barOptsStack} height={200}/></div>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>🏢 Top Empresas</div>
                  <div style={{height:200}}><ChartCanvas type="bar" data={chartEmpTop} options={{...barOpts,indexAxis:"y"}} height={200}/></div>
                </div>
              </div>

              {/* Linha 2: Status MU, Status AF, Aprovação AF */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#C62828",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>⚠️ Status Mau Uso</div>
                  <div style={{height:180}}><ChartCanvas type="doughnut" data={chartMuStatus} options={donutOpts("bottom")} height={180}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10}}>
                    {[{l:"Pendentes",v:muPend,c:"#C62828"},{l:"Em Andamento",v:muAnd,c:"#1565C0"},{l:"Concluídos",v:muConc,c:"#1A7A3C"},{l:"Arquivados",v:muArq,c:"#888"}].map((s,i)=>(
                      <div key={i} style={{fontSize:10,color:s.c,fontWeight:700,background:"#F8F8F8",borderRadius:6,padding:"4px 8px"}}>{s.v} {s.l}</div>
                    ))}
                  </div>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#C47D00",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>💰 Status A Faturar</div>
                  <div style={{height:180}}><ChartCanvas type="doughnut" data={chartAfStatus} options={donutOpts("bottom")} height={180}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10}}>
                    {[{l:"Pendentes",v:afPend,c:"#E67E00"},{l:"Em Andamento",v:afAnd,c:"#1565C0"},{l:"Concluídos",v:afConc,c:"#1A7A3C"}].map((s,i)=>(
                      <div key={i} style={{fontSize:10,color:s.c,fontWeight:700,background:"#F8F8F8",borderRadius:6,padding:"4px 8px"}}>{s.v} {s.l}</div>
                    ))}
                  </div>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#1A7A3C",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>✅ Aprovação A Faturar</div>
                  <div style={{height:180}}><ChartCanvas type="doughnut" data={chartAfAprov} options={donutOpts("bottom")} height={180}/></div>
                  <div style={{marginTop:10,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:900,color:"#1A7A3C"}}>{af.length>0?Math.round(afAprov/af.length*100):0}%</div>
                    <div style={{fontSize:10,color:"#888"}}>taxa de aprovação</div>
                  </div>
                </div>
              </div>

              {/* Processos pendentes rápidos */}
              {(muPend+afPend)>0&&(
                <div className="card" style={{padding:16,borderLeft:"4px solid #E67E00"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#E67E00",marginBottom:10}}>⏳ Processos Pendentes ({muPend+afPend})</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    {muPend>0&&<div>
                      <div style={{fontSize:10,fontWeight:700,color:"#C62828",marginBottom:6}}>⚠️ Mau Uso Pendentes</div>
                      {mu.filter(p=>!p.processoStatus||p.processoStatus==="pendente").slice(0,5).map((p,i)=>(
                        <div key={i} style={{fontSize:11,padding:"4px 0",borderBottom:"1px solid #F5F5F5",display:"flex",gap:8}}>
                          <span style={{color:"#888"}}>{p.date||"—"}</span>
                          <span style={{fontWeight:600}}>{p.empresa||"—"}</span>
                          <span style={{color:"#888"}}>{p.patrimonio||""}</span>
                        </div>
                      ))}
                    </div>}
                    {afPend>0&&<div>
                      <div style={{fontSize:10,fontWeight:700,color:"#C47D00",marginBottom:6}}>💰 A Faturar Pendentes</div>
                      {af.filter(p=>!p.processoStatus||p.processoStatus==="pendente").slice(0,5).map((p,i)=>(
                        <div key={i} style={{fontSize:11,padding:"4px 0",borderBottom:"1px solid #F5F5F5",display:"flex",gap:8}}>
                          <span style={{color:"#888"}}>{p.date||"—"}</span>
                          <span style={{fontWeight:600}}>{p.empresa||"—"}</span>
                          <span style={{color:"#888"}}>{p.ov?"OV:"+p.ov:""}</span>
                        </div>
                      ))}
                    </div>}
                  </div>
                </div>
              )}
              {mu.length===0&&af.length===0&&(
                <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                  <div style={{fontSize:32,marginBottom:12}}>📊</div>
                  Nenhum processo cadastrado ainda.
                </div>
              )}
            </div>
          );
        })()}

        {/* ── SAS ── */}
        {tab==="sas"&&(()=>{
          const SERV={entrega_tecnica:{l:"🔧 Entrega Técnica",c:"#1565C0",bg:"#EFF6FF"},manutencao:{l:"⚙️ Manutenção",c:"#E67E00",bg:"#FFF8F0"},locacao:{l:"🏗️ Locação",c:"#1A7A3C",bg:"#F0FFF5"},outros:{l:"📦 Outros",c:"#888",bg:"#F5F5F5"}};
          const lista=sas.filter(s=>showArqSas||s.status!=="arquivado");
          const pend=lista.filter(s=>s.status==="pendente"||!s.status).length;
          const conc=lista.filter(s=>s.status==="concluido").length;
          const totalVal=lista.reduce((acc,s)=>{const v=parseFloat((s.valor||"0").replace(/[^\d.,]/g,"").replace(",","."));return acc+(isNaN(v)?0:v);},0);
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
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqSas(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqSas?"#1A1A1A":"#FFF",color:showArqSas?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqSas?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(lista,"sas_grupomov",[{key:"dataSolicitacao",label:"Dt Solic."},{key:"email",label:"Email"},{key:"nfNum",label:"NF"},{key:"equipamento",label:"Equipamento"},{key:"cliente",label:"Cliente"},{key:"nome",label:"Nome"},{key:"servico",label:"Serviço"},{key:"dataRealizacao",label:"Dt Realiz."},{key:"relatorioMov",label:"Rel MOV"},{key:"valor",label:"Valor"},{key:"status",label:"Status"}])}/>
                <BtnY onClick={addSas}>+ Novo SAS</BtnY>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total",v:lista.length,c:"#1A1A1A",bg:"#FFF",i:"📋"},{l:"Pendentes",v:pend,c:"#C62828",bg:"#FFF0F0",i:"⏳"},{l:"Concluídos",v:conc,c:"#1A7A3C",bg:"#F0FFF5",i:"✅"},{l:"Total R$",v:`R$ ${totalVal.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,c:"#1565C0",bg:"#EFF6FF",i:"💵"}].map((k,i)=>(
                <div key={i} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${k.c}`,background:k.bg}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#AAA",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.i} {k.l}</div>
                  <div style={{fontSize:i===3?16:30,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#AAA",fontSize:13}}>🔍</span><input type="text" value={sasSearch} onChange={e=>setSasSearch(e.target.value)} placeholder="Buscar cliente, equipamento, NF, relatório..." style={{width:"100%",padding:"8px 10px 8px 28px",fontSize:12,borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={sasFrom} onChange={e=>setSasFrom(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={sasTo} onChange={e=>setSasTo(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <select value={sasMes} onChange={e=>setSasMes(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Mês</option>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
              <select value={sasAno} onChange={e=>setSasAno(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}><option value="">Ano</option>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select>
              {(sasSearch||sasFrom||sasTo||sasMes||sasAno)&&<button onClick={()=>{setSasSearch('');setSasFrom('');setSasTo('');setSasMes('');setSasAno('');}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>
            {listaFil.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📄</div><div style={{fontSize:15,fontWeight:600}}>Nenhum registro SAS</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {listaFil.map(s=>{
                  const serv=SERV[s.servico||"outros"]||SERV.outros;
                  const ok=s.status==="concluido";
                  const pend=s.status==="pendente"||!s.status;
                  return(<div key={s.id} className="card" style={{borderTop:`4px solid ${ok?"#1A7A3C":pend?"#C62828":serv.c}`,padding:0,overflow:"hidden",opacity:s.status==="arquivado"?0.55:1}}>
                    <div style={{padding:"11px 14px",background:ok?"#F0FFF5":pend?"#FFF0F0":serv.bg,borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:800,color:serv.c,background:"#FFF",border:`1px solid ${serv.c}33`,borderRadius:20,padding:"2px 10px"}}>{serv.l}</span>
                        <select value={s.status||"pendente"} onChange={e=>updateSas(s.id,{status:e.target.value})} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"none",color:ok?"#1A7A3C":pend?"#C62828":"#555",background:ok?"#DCFFE4":pend?"#FFE0E0":"#F0F0F0",cursor:"pointer"}}>
                          <option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option><option value="arquivado">🗄️ Arquivado</option>
                        </select>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>updateSas(s.id,{status:s.status==="arquivado"?"pendente":"arquivado"})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{s.status==="arquivado"?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delSas(s.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:14,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{s.cliente||s.nome||<span style={{color:"#CCC"}}>Cliente</span>}</div><div style={{fontSize:11,color:"#888"}}>📅 {s.dataSolicitacao||"—"} · <b style={{color:"#1565C0"}}>{s.nfNum?`NF ${s.nfNum}`:""}</b></div></div>
                        {s.valor&&<div style={{fontSize:17,fontWeight:900,color:"#1A7A3C"}}>R$ {s.valor}</div>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Equipamento</div><input type="text" value={s.equipamento||""} onChange={e=>updateSas(s.id,{equipamento:e.target.value})} placeholder="Equip." style={{width:"100%",fontSize:11,fontWeight:700,border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Rel. MOV · Data Realiz.</div><input type="text" value={s.relatorioMov||""} onChange={e=>updateSas(s.id,{relatorioMov:e.target.value})} placeholder="REL-000" style={{width:"100%",fontSize:11,fontWeight:700,color:"#1565C0",border:"none",background:"transparent",outline:"none",padding:0}}/></div>
                        {s.envioFaturamento&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px",gridColumn:"span 2"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Envio Faturamento</div><div style={{fontSize:11,fontWeight:700,color:"#1A7A3C"}}>{s.envioFaturamento}</div></div>}
                      </div>
                      <div style={{fontSize:10,color:"#AAA",textAlign:"right"}}>{s.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>);
        })()}

        {/* ── CARROS ── */}
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
          const lista=carros.filter(c=>(showArqCarros||!c.arquivado)&&(carFiltroPlaca==="todas"||c.placa===carFiltroPlaca));
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
                    <div style={{padding:"16px 20px",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#FFF",zIndex:1}}>
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
                  <ExportBar data={lista} filename="carros" cols={[{key:"data",label:"Data"},{key:"placa",label:"Placa"},{key:"status",label:"Status"},{key:"responsavel",label:"Responsável"},{key:"kmAtual",label:"Km Atual"},{key:"kmUltimaRevisao",label:"Km Últ. Rev."},{key:"valorUltimaRevisao",label:"Valor Rev."},{key:"oficina",label:"Oficina"},{key:"obs",label:"Obs"}]}/>
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
          const TECHS_150=OFICINA_TECHS;
          const lista=apontamentos150.filter(a=>(showArqApon150||!a.arquivado)&&(()=>{
            if(ofi150From&&(a.data||"")<ofi150From)return false;
            if(ofi150To&&(a.data||"")>ofi150To)return false;
            return true;
          })()).sort((a,b)=>(a.data||"").localeCompare(b.data||""));
          const totalMin=lista.reduce((acc,a)=>{const p=(a.total||"0:00").split(":");return acc+(parseInt(p[0]||0)*60+parseInt(p[1]||0));},0);
          const totalStr=`${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}m`;

          return(<div style={{animation:"fadeIn .3s ease"}}>
            {/* Modal */}
            {modalApon150&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setModalApon150(false);setEditApon150(null);}}}>
                <div style={{background:"#FFF",borderRadius:16,width:"100%",maxWidth:580,boxShadow:"0 24px 80px rgba(0,0,0,.3)",overflow:"hidden"}}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:900,fontSize:17,color:"#F5C200"}}>{editApon150?"✏️ Editar Apontamento 150":"➕ Novo Apontamento — Oficina 150"}</div>
                    <button onClick={()=>{setModalApon150(false);setEditApon150(null);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#FFF",fontSize:20,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                  <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Data</label><input type="date" value={apon150Form.data} onChange={e=>setApon150Form(p=>({...p,data:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Técnico</label><select value={apon150Form.tecnico} onChange={e=>setApon150Form(p=>({...p,tecnico:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>OS</label><input type="text" value={apon150Form.os} onChange={e=>setApon150Form(p=>({...p,os:e.target.value}))} placeholder="OS-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Patrimônio</label><input type="text" value={apon150Form.patrimonio} onChange={e=>setApon150Form(p=>({...p,patrimonio:e.target.value}))} placeholder="PAT-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Serviço</label><select value={apon150Form.servico} onChange={e=>setApon150Form(p=>({...p,servico:e.target.value}))} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Início</label><input type="time" value={apon150Form.inicio} onChange={e=>{const v=e.target.value;setApon150Form(p=>({...p,inicio:v,total:calcHoras(v,p.termino)}));}} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Término</label><input type="time" value={apon150Form.termino} onChange={e=>{const v=e.target.value;setApon150Form(p=>({...p,termino:v,total:calcHoras(p.inicio,v)}));}} style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#F5C200",textTransform:"uppercase",letterSpacing:.8}}>Total</label><div style={{fontSize:20,fontWeight:900,color:"#C47D00",background:"#FFFBF0",border:"1.5px solid #FFE8A0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>{apon150Form.total||calcHoras(apon150Form.inicio,apon150Form.termino)||"—"}</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Relatório</label><input type="text" value={apon150Form.relatorio} onChange={e=>setApon150Form(p=>({...p,relatorio:e.target.value}))} placeholder="REL-001" style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.8}}>Observação</label><input type="text" value={apon150Form.obs} onChange={e=>setApon150Form(p=>({...p,obs:e.target.value}))} placeholder="Obs..." style={{fontSize:13,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
                      <BtnG onClick={()=>{setModalApon150(false);setEditApon150(null);}}>Cancelar</BtnG>
                      <BtnY onClick={salvar150}>{editApon150?"Salvar Alterações":"Adicionar"}</BtnY>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:900,fontSize:26,letterSpacing:-.5}}>📝 Apontamentos Oficina 150</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{lista.length} registro(s) · <span style={{color:"#C47D00",fontWeight:700}}>⏱ {totalStr} totais</span></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>setShowArqApon150(p=>!p)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid #E0E0E0",background:showArqApon150?"#1A1A1A":"#FFF",color:showArqApon150?"#FFF":"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>📁 {showArqApon150?"Ocultar":"Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(apontamentos150,"apontamentos_150",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"PAT"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"relatorio",label:"Relatório"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>{setEditApon150(null);setApon150Form({data:TODAY_STR,os:"",patrimonio:"",tecnico:OFICINA_TECHS[0]||"",servico:SERVICOS_OFICINA[0]||"",inicio:"",termino:"",total:"",oficina:"150",relatorio:"",obs:""});setModalApon150(true);}}>+ Novo Apontamento</BtnY>
              </div>
            </div>

            {/* Filtros */}
            <div className="card" style={{padding:"10px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>De</span><input type="date" value={ofi150From} onChange={e=>setOfi150From(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontWeight:600}}>Até</span><input type="date" value={ofi150To} onChange={e=>setOfi150To(e.target.value)} style={{fontSize:12,padding:"8px 10px",borderRadius:10,border:"1.5px solid #E0E0E0",background:"#FAFAFA"}}/></div>
              {(ofi150From||ofi150To)&&<button onClick={()=>{setOfi150From("");setOfi150To("");}} style={{padding:"7px 14px",borderRadius:20,background:"#1A1A1A",color:"#FFF",border:"none",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Limpar</button>}
            </div>

            {/* Cards */}
            {lista.length===0?(<div className="card" style={{padding:64,textAlign:"center",color:"#CCC"}}><div style={{fontSize:40,marginBottom:12}}>📝</div><div style={{fontSize:15,fontWeight:600}}>Nenhum apontamento</div></div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {lista.map(a=>{
                  const cor=({Mecânica:"#1565C0",Elétrica:"#E67E00",Bateria:"#F5C200",Hidráulica:"#00838F",Funilaria:"#8E44AD",Outros:"#888"})[a.servico]||"#555";
                  return(<div key={a.id} className="card" style={{borderTop:`4px solid ${cor}`,padding:0,overflow:"hidden",opacity:a.arquivado?0.55:1}}>
                    <div style={{padding:"11px 14px",background:cor+"12",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:800,color:cor,background:"#FFF",border:`1px solid ${cor}33`,borderRadius:20,padding:"2px 10px"}}>{a.servico||"—"}</span>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>abrirEditar150(a)} style={{background:"#EFF6FF",border:"none",borderRadius:6,color:"#1565C0",cursor:"pointer",padding:"4px 7px",fontSize:13}}>✏️</button>
                        <button onClick={()=>updateApon150(a.id,{arquivado:!a.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:6,cursor:"pointer",padding:"4px 7px",fontSize:13}}>{a.arquivado?"📤":"🗄️"}</button>
                        <button onClick={()=>{if(window.confirm("Excluir?"))delApon150(a.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:6,color:"#C62828",cursor:"pointer",padding:"4px 7px",fontSize:11,fontWeight:700}}>✕</button>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{a.tecnico||"—"}</div><div style={{fontSize:11,color:"#888"}}>📅 {a.data||"—"} · OS: <b style={{color:"#1565C0"}}>{a.os||"—"}</b></div></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:900,color:"#C47D00",lineHeight:1}}>{a.total||"—"}</div><div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase"}}>horas</div></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>PAT</div><div style={{fontSize:12,fontWeight:700}}>{a.patrimonio||"—"}</div></div>
                        <div style={{background:"#F8F9FA",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Início → Término</div><div style={{fontSize:11,fontWeight:600,color:"#555"}}>{a.inicio||"—"} → {a.termino||"—"}</div></div>
                        {a.relatorio&&<div style={{background:"#F0FFF5",borderRadius:8,padding:"7px 10px"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Relatório</div><div style={{fontSize:12,fontWeight:700,color:"#1A7A3C"}}>{a.relatorio}</div></div>}
                        {a.obs&&<div style={{background:"#FFFBF0",borderRadius:8,padding:"7px 10px",borderLeft:"3px solid #F5C200"}}><div style={{color:"#AAA",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Obs</div><div style={{fontSize:11,color:"#666"}}>{a.obs}</div></div>}
                      </div>
                      <div style={{fontSize:10,color:"#CCC",textAlign:"right"}}>{a.registradoPor||""}</div>
                    </div>
                  </div>);
                })}
              </div>
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
                      <div style={{padding:"12px 14px",borderBottom:"1px solid #F4F4F4"}}>
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
          const apMes=apontamentos150.filter(a=>{
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
          const chartHoras={labels:techAtivos.length>0?techAtivos:OFICINA_TECHS,datasets:[{label:"Horas Trabalhadas",data:techAtivos.length>0?techAtivos.map(t=>+(byTech[t].mins/60).toFixed(1)):OFICINA_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)):OFICINA_TECHS.map(t=>techColor(t)),borderRadius:6,borderSkipped:false}]};
          const chartApon={labels:techAtivos.length>0?techAtivos:OFICINA_TECHS,datasets:[{label:"Apontamentos",data:techAtivos.length>0?techAtivos.map(t=>byTech[t].aps.length):OFICINA_TECHS.map(()=>0),backgroundColor:techAtivos.length>0?techAtivos.map(t=>techColor(t)+"CC"):OFICINA_TECHS.map(t=>techColor(t)+"CC"),borderRadius:6,borderSkipped:false}]};
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
              <div key={i} className="card" style={{padding:"18px 20px",borderTop:`4px solid ${s.c}`,background:s.bg}}>
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
        {tab==="pendencias_matheus"&&(user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_ofi")&&(()=>{
          const list=pendMatheus.filter(r=>showArqMat||!r.arquivado);
          const PRIO={urgente:{l:"🔴 Urgente",c:"#C62828",bg:"#FFF0F0"},medio:{l:"🟡 Médio",c:"#E67E00",bg:"#FFF8F0"},aguardar:{l:"🟢 Aguardar",c:"#1A7A3C",bg:"#F0FFF5"}};
          const STS={resolvido:"Resolvido",em_andamento:"Em Andamento",pendente:"Pendente"};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🔧 Pendências Matheus</div><div style={{fontSize:13,color:"#888"}}>{list.length} item(ns) · visível para Manuela, Gustavo e Matheus</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqMat(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqMat?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqMat?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>mathCrud.add({data:TODAY_STR,descricao:"",prioridade:"medio",status:"pendente",obs:""})}>+ Nova Pendência</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma pendência.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data</th><th>Descrição</th><th>Prioridade</th><th>Status</th><th>Observações</th><th>Registrado por</th><th>✕</th></tr></thead>
                  <tbody>{list.map(r=>{const p=PRIO[r.prioridade||"medio"];const res=r.status==="resolvido";return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.data||""} onChange={e=>mathCrud.update(r.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.descricao||""} onChange={e=>mathCrud.update(r.id,{descricao:e.target.value})} style={{width:200,fontSize:11,padding:"3px 6px"}} placeholder="Descreva..."/></td>
                      <td><select value={r.prioridade||"medio"} onChange={e=>mathCrud.update(r.id,{prioridade:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:p.c,background:p.bg}}>{Object.entries(PRIO).map(([v,x])=><option key={v} value={v}>{x.l}</option>)}</select></td>
                      <td><select value={r.status||"pendente"} onChange={e=>mathCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:res?"#1A7A3C":r.status==="em_andamento"?"#1565C0":"#C62828",background:res?"#F0FFF5":r.status==="em_andamento"?"#F0F4FF":"#FFF0F0"}}>{Object.entries(STS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.obs||""} onChange={e=>mathCrud.update(r.id,{obs:e.target.value})} style={{width:220,fontSize:11,padding:"3px 6px"}} placeholder="Obs..."/></td>
                      <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      <td style={{whiteSpace:"nowrap"}}><button onClick={()=>mathCrud.update(r.id,{arquivado:!r.arquivado})} style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))mathCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

      </>
    );
  };


  // ── BADGES MENU LATERAL — só status pendente ──
  const menuBadges = {
    relatorios: (reports||[]).filter(r=>!r.arquivado&&r.statusFinal==="Pendente").length,
    mau_uso: (processosMU||[]).filter(p=>!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    a_faturar: (processosAF||[]).filter(p=>!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    dashboard_processos: (processosMU||[]).filter(p=>!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length+(processosAF||[]).filter(p=>!p.arquivado&&(p.processoStatus==="pendente"||p.status==="pendente")).length,
    emprestimos: (emprestimos||[]).filter(e=>!e.arquivado&&(e.statusEmp==="pendente"||e.status==="pendente")).length,
    saida_entrada: (saidaEntrada||[]).filter(s=>!s.arquivado&&(s.statusFinal==="pendente"||s.status==="pendente")).length,
    ruptura_almox: (rupturas||[]).filter(r=>!r.arquivado&&r.status!=="liberado_almox").length,
    dashboard_req: (requisicoes||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    sas: (sas||[]).filter(s=>s.status==="pendente").length,
    pendencias_frota: (frota||[]).filter(f=>!f.arquivado&&f.status==="pendente").length,
    pendencias_hebert: (pendHebert||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    pendencias_matheus: (pendMatheus||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    pendencias_gustavo: (pendGustavo||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    pendencias_manuela_tab: (pendManuela||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    prioridades_clientes: (prioridades||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    rh_fiscal: (rhFiscal||[]).filter(r=>!r.arquivado&&r.status==="pendente").length,
    carros: (carros||[]).filter(c=>!c.arquivado&&c.status==="pendente").length,
    uber: (uberPedidos||[]).filter(u=>u.status==="pendente").length,
    financeiro: (financeiro||[]).filter(f=>f.situacao==="pendente"||f.status==="pendente").length,
  };
  return(
    <div style={{minHeight:"100vh",background:"#F0F2F5",color:"#1A1A1A",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"}}>
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
