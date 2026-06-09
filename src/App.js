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
      if(!res.ok){ const t=await res.text(); console.error("DB get error:",table,res.status,t); if(!__dbErrShown){__dbErrShown=true;alert("Erro ao LER ("+table+"): "+res.status+" — "+t.slice(0,200));} return []; }
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
      if(!res.ok){ const t=await res.text(); console.error("DB save error:",table,res.status,t); alert("Erro ao SALVAR ("+table+"): "+res.status+" — "+t.slice(0,250)); }
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
  { id:"manuela", name:"Manuela", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"gustavo", name:"Gustavo Coelho", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:false },
  { id:"hebert_ofi", name:"Hebert Oficina", role:"Oficina", password:"ofi2026", canDelete:false, apenasOficina:true },
  { id:"matheus_ofi", name:"Matheus", role:"Oficina150", password:"mat2026", canDelete:false, apenasOfi150:true },
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
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABhARkDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAAAAUGBwgDBAkBAv/EAEUQAAEDAwIDAwYJCgYDAQAAAAEAAgMEBREGBxIhMQhBURMUImFxkQkVFjIzUlSBkhcjNUJTVnKhsdEkJTRVYpOCouHx/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAUGAgMEAQf/xAA1EQACAgECBAIHBwQDAAAAAAAAAQIDBAURBhIxURMhMkFxgZGhsRQVFiIzQlIkYcHRcoLw/9oADAMBAAIRAxEAPwC5aELHNNFDjysjWZ6ZK8lJRW7Z6k30MiFr+e0n2iP8S989pc/Tx/iWvx6v5L4nvJLsZ0IBBGR0QtpiCF8TTRQgGWRrAfErF57SfaI/xLXK2EXs2jJRk+iNhCwCspSQBPGSfWs6yjOM/Re54011BCELI8BCx1E8MDeKaRrB6yk99/tbHcJqWrnuy6KXtZNL2s2RqnP0VuKiFq0txoqnHkahjie7K2iQBnuWyu2Fi5oNNf2MZRcXs0CFrmupASDUR5HrXnn9H9pj96x+0VfyXxHJLsbKFigqIJyRFK1+OuCsq2RlGS3i9zxprqCEHktY19GCQaiMEdea8nZCHpPYKLl0RsoWqbhRAEmpjwOZ5rUotSWCtmdDS3ihlkacFombnPsykLYT9Fphxa6oVUIBBGQQQe8IWZ4CELzib9Ye9AeoXnE36w96OJv1h70B6hecTfrD3r1ACEIQAhCEAJobhOcDTgOI9hTvTO3DP52nCgOJ3tptnu+p3act8iI1uJ/13e9HG8EOD3cjnqvEL5RuyykmafqRU2qGTOTw4K3019A1XHSSUxPNhyE5pHBkbnnoBlfY9IylkYVdr7efuKplV+HdKIy9eVTn1sdMx5AYMnBTb4n/AF3e9bN3qDVXOebOQXED2LVXyvVMp5WXZbv5N/IsuPX4dUYmehc/z6D03fPHepSi+iZ/CFFlB/roP4wpTi+ib7ArfwX6FvtRFav1ifSR9RXyK2R8DcPncOTfBbd6r2W+gfO4+ljDR4lRrUzy1U7p5nFz3HK7+I9ceDFU0+m/kv8AZpwMPxnzz6Iy19fV10hfUSuI7mjoFq4Hgs1JTy1VQ2CFvE9xTqi0fGabL5z5bHd0VFxdOzdTcrILm26tsmbMirHSi/IaMb3xu4o3uY4dCCnLYNSSMcKWvPEx3IP8Eg3Gjmoap1PMMEdD4ha614uZk6dd+R7NdV/tGVlVeRDz8zfv0RgusoZISxx4mkHxWjl31ne9DnOdjicTjxXi5b7FZZKcVsm99jZCLjFJi/oeoMd0dEXEh7e8p+KMLJMae6wSd3FhSc08TQfEZX0Tg/I58SVb/a/qQWqw2tUu6NO+VIpLZNNnBxgKMi97nFznOyTnqndr6rAjipGnm45KaCr3FmZ42Z4SflBfNndplXJVzP1jY3W1CzS+390u0kha5sJZH6X6xCoAzUl8huT6+mutZDM55fxNmd1V4N99v9Y7jWeksum2Rso2uLqiR7sAnuCp1uptxqXbm8tt2oKQxl4zFI3m149RVj4Sw/CxHc+s38kR+qW81vKvUTZ2eu0/fLBdILRrSpdcLZI4M8u/58WeWc+Cvhaq+luluguFFK2WnnYHxvaeRBXHFdD+wfqypv8AtXJbauV0r7ZKI2uccnhI/wDitZGkk9oa9Vlg2iv1zt9Q6nq4qfMUjerTkLnX+Wzc/wDe2u94/sr3dsip832PuozjymG/zC5moCRPy2bn/vbXe8f2R+Wzc/8Ae2u94/smnZtL6hvNMam12irq4WnBfFGXAFb3yA1n+7dx/wCkoBeG9e5xIHytruZ8R/ZXJm3Yu+jOy7a9Y1H+Y3SeJjA6Tvc7Ayce1UZGgdZggnTdxwD+xKttuPpa/V/Y6stHS22d9dRiGR8HD6QAIzyQDl0HvbqCk2EumuNWUxFWyVzaUObwh5I9HHqUBQ7275V5m1bSSVDrVE/ieGw/mgM9Ek6x3C19uTpqy7fDT76aOlLY+FkRbxkYAJ5BS7vFc71tTs3YttLHZ21c11pCKuRkfEWu9HI5DrlAWD7O+5DdzNAU96khENWz83UMHTiHLKklQV2LdG3bSW1UYvEDqeeskMoid1aCeWVOqAEy9wj/AIqAepPRMfXxzcIh4NVc4qe2nS9q+p36av6hDcQhC+WFkFvRdR5C8CMnAkGE7dTVQpbRK/OCRgKPKKYwVkMw/VcE5NcVokhpoGn5w4irfpOp+BpN8N/NdP8AsReVj8+TB9/8DVHTn1XqEKnkoZ7f/r4P4wpSj+jb7Aott36Qp/4wpTj+jb7Ar/wX6FvtRCav1iMrXtWZKuOkafRYMlNpKurCXX2bKSj0VT1m6V2dbKXfb4EniQUKYpdh0bfwcVRNOWggDAKeabug4w21Od3ucnEvpHDlKq06td/P4kBnz5r5De1tQCot/nLG/nI+/wBSYo6KU7jGJaGZh6Fh/ootcOF7m+DiFU+MMWNeTG2P7l5+1EnpVjlW4v1HiEIVRJQ9Y7gka8dxBUo22cTW6GbPIsCiw9Cnharm2HSjzxgSMBaBnmrVwrmxxrbVN+XLv8CN1Kl2Rjt13+ogajqvO7vK8HLWnhCTj0XpJc4uPUnKz2+A1VfDAP1nDPsVctnPKvcvXJ/U74pVwS9SJC0zTtprPC1v6w4iqvfCMNofktY3SBnnflneTP62Mc15vl2lL7t5rup0vb7XTyw08beF7ycnKqlu5ubqTcu9i5X+cYj5RQs+YwepfaMWlUUwrXqSRUrJ883LuMhXw+DttVRS6Eu9xla5sdTUN8mT0OAc/wBVUTaLbi/bkalitNmgJj4h5eY/Njb3ldPdsNIUGhtGUGnbewBlOwcbgPnO7yt5gRT26qjyOyczc4L6hgXONdAfhB6ryO1NLBnnJVtXP5AdDOwdQU8GzBqKiGLEtQX8T2jpz7yp4Fbp8v4BUW7i8OJmVy3pd2dZ0OjKbSlsuT6C3wfsThzvaU3RqvUom8sL3XeUzni8qUB13bTUb2hzaeBzT0IYOajntHbgO2020qb3S0cU8xcIoo3NHCC44yQqZbE9pDVmkL1T0d+rZLnaHuDZBK7L2DxBVjO2Kflp2f47vp5r66B74px5MZ9HIP8AJAVut7t8NdzO1DYrVNCyZxc2SngDB93JZ62/b47eVlNe9VW+orIYHjhdWxCRrfvxyUjbQdqux6Y0bQ6fvenZWTUUYi44iAHAeIx1Sfvp2nbTrfRtTpmxadl8pWYaZJcOx7OXVAWi2G3EpNydBUt8ghEE2OCeIdGuHI4UgKAuw/pe66d2na+6QPgfVyGVjHjBDc8lPqAExNeHN0YP+KfaYWuTm7t9TVWOLXtp/vRI6X+v7hBQhZqalnqQ8wsLuAZd6gvmMYSm9ordlhbS82YVknmlnc10ri4tGB7FjQik0ml0PdgQhC8BsW39I0/8YUpR/Mb7Aottn6Rp/wCMKUmfMb7Ff+C/07favoQmr+lEj3WMZZfJDjk4ZCRz0Ts3ApsGKrA/4kppZHiqrrtDoz7Iv1vf4klhz56IsfOgpA61uZ3tcnGmTt/OBVzQl/UZAT2X0Thu/wAbTq328vgQWoQ5b5GC4PEdFM89Aw/0UWPOZHu8XEp/6xqxTWl7QfSk5BR+Oiq3GOQp5EKl+1fUkdKg1W5dwQvumZ5Wpij+s4Bbl9oxQ15haMNLQQqrGicqnauiaXxJNzSko+s0EZOMZOPBCFpMgTj0JSeWr31LhlsY5e1Nw9Ce4DJTVh7SG2mlqiez1lROaqGQslLW5GQVYOGcP7TnRk+kfP8A0cOo2+HS1635Fce15pHU9z3ouNXQWKvqYDG3EkcLnNPXvCgKvoqugqHU9bTS08zerJGFpH3FdfLBXW3UNkpL1SwxyU9ZEJI3OYCS0qtPbz2+sj9CR6soqGGnrqaYNe6NuOMHxX1YrRUTarcjUm3N8ZcrDVujBcDLCT6Mg8CF0r2Q3Et+5Wh6a/UZDZsBtRF3sfhcoVbb4Oy+1MWpbtYzK408sQl4M8sj/wDUA+PhDW1NRpGz0tNTzTE1HEeBhOOR8FR/4nuv+21f/S7+y67XymsdXwR3iKjlxzaJwD/VJnxNof7BaPwtQHPjZrs66x3EoH3JrBbaEHDZJxwlx9Q6pC3x2a1JtXWwtugbPRz/AEVRHzaT4LqDa4aGCjZHbo4Y6cfNEQAb/JQZ26bdTVeytTUzMaZKeVroyRzByEBzkVr9it3rpprs83Knp6L43qaKoDG072cf5tzsYx4YKqgrA9kvW9g0Lb9S3bUlKKqi8m1oiLc8T8jCARdTawoL9UvrZ9sfN5Xc3mGm4W+3kFq6X3R05pmsFTT6EopamM+iZ42u4T7CnBuP2gbhq6qdabHZ7XY7bK7h4xCC/HjlK+1lm2Es3Bc9aailulwzxmIABgPr8UBbTs26/r9xNAx3qvoG0Tg8sYxrcN4QcDClBM3aK+6Pv2lYqjRUcUdsYeBrY28IBCeSAFH+tj/nX/ipAUe6zOb271BVXi9/0K/5IktL/W9wjJy6Dbx1FSw9HMwU2k59vh/iqg+pUvh9b6jUv/dCXzntRIQbtTGkuM0BHIOJHsWsnPr2j8nUR1bRydyKQrRD5xc4IsZBdzWrUMGVGdLHXfy9/QyouU6VY+xq/cQhLOsWQx3fycDGsa1oyAkZcmXj/Zr5U778r23NtU/EgpdzYtf6Sp/4wpRY5vCPSHTxUTtJaQWnBHQrN57W/apfxKa0PXI6ZCcZQ5uZ9zkzMN5DTT22JMrIKarhMU4a9h7srQ+IbR+xb70wvPaz7VL+JHntZ9ql/EVJ3cUYl0uazH3f99jmjp1sFtGzYkKktNtpZxNAxrHjvylAyMAyXtAHrUWeeVn2qX8RXhq6sjBqZcH/AJFbKuLaKY8tVGy/s0eS0uc3vKe4rawuArbj5KN2YouX3pEQstHTTVlQ2CBhc4/yVQyb7c3IdjW8pPp/glK4RprUV0Qo6TonVd2Y7HoRekSlXX9Nh0NS0cvmlL1gtcdsoxGOch5vd61i1dTGos8mBks9IK8x0R0aNZXNfnf5n7V6iGeYp5cZLp0I7QvB0Xq+eE6N7cq/Raa0LdLtI4NMcJazJ6khc7LjVy1twmrJnF0kshe4nxJyujm42gZNwds7taoi5tQG8UBHe4A8lzpv9pr7Hdqi13KnfBVU7yx7HjBBBX0rhHD8LEdz6zfyRX9Ut5reReo6FdlzePSV32zt1quF1p6Gvt0QhfHM7h4gOhCjnt0bsafuOl4NH2K4RV0ssgkqHxHLWAdBn71S+KWWJ3FFI+M+LXELx73vcXPc5zj1JOSrYRh8q1/wd1qnl1hdbqI3eRigDC7uyT/8VX7DaLhfLrBbLZTSVNVO8MYxjckkrpn2YttGbbbdwUVQwfGVViWqdjnnHIfcgIO+EJ+PLbX2S726vqqancwxv8k8tGVUn5Wam/32v/7iulfab29/KHtlW26BnFXU48vTeJcO5cxLvb6u1XKe310D4amB5ZIx4wQQgLx9ireCzz6Kk07qa9sguFK/Mbql/wA9nt9yR+3VurYK/S0GkrFcIq2aZ4fO6J2WtHhlUrjkkidxRvcx3i04KJHvkcXSPc9x6lxyUB8qznZF20sOs9Fahm1ZL5vanPaBKXcIDgR3/cq7aYslx1FfKa0WunfUVNQ8Na1gyfarpbrbaXfRHZSp9N2GCpluJljlq/Ns8RcSC7pzx1QCHqrbPs1aajc+u1I+ZzRzjgfxOUOa1uGycDHwaVs1yrZCMMfKcc/ZzSRt0/QFquHBuXabrJJxeljjBS9oy4bbt7RNJWUEccGleIcDavoPblAWw7EDQNpmubQvo2Gd5axw9antJOlKqwVdpjl04+idQn5hpQ3g/wDXklZACZmpLLcay6vnhY0sPQp5oUdqWm1ajUqrW0k9/I34+RKiXNEjv5N3X9m33pe0ba6y3yzOqWBocOWE5kKOwuGcXDvjdBvddzou1Cy2Dg0vMTNS0BuFsfEwAyDm1IWlrHW0ty84qmNDWjknghdmTo+PkZccqW/NH4eRqry511OtdGMi9WO5Vd0mnYxpYT6K1Pk1c/2bVISFHW8KYdtkrJN7t79TfHU7YxUUl5EefJq6fUaj5NXPH0bVIaFh+EMLvL4mX3rd2RHnybuf7Nq8+Tdz/ZhSIhefhDC/lL4j71u7Ijv5N3PH0QQNN3Mn6IKREJ+EML+Uh963dkMOk0rWyyATubGzvITttNqpbdFwwsy7vcepW+hSen6HiYL5q47y7s5r8y25bSfkC+KiMTQvid0cML7QpeUVJbM5k9vMZz9HvL3EVAAJyvk6Ok+0hPNCgHwxpz/Z82dv3jf3NCx29ttoW04PEe8+KjPejYTRu5LX1VTB5jc8cqqFoyfaO9S2hTdNMKK1XBbJHHObnJyfVlDrz2M9Xx1TxbLxRSwZ9AvyDj1rZ092MNRy1DPjm+UsMOfS8kCSr0IW0xIr2d2L0XttGyegpfO7jj0qqZo4s+odylRCEAKGd6uzzo7cZz64xm23Vw/1ELR6XtCmZCAofeuxlq2Kod8WXmimiz6JeCCsun+xjqiWob8b3ukhhz6XkgSVetCAivZnYzR22sLZqGn87uWMOqpWji+7wUpSxxysLJWNe09Q4ZC+kIBp6n240XqSIx3awUc2erhGAfeoe1t2SNAXgPkssk9omPNvB6Qz/JWNQgI52C27qNtdIGwz3B1diVzmyHwJUjIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgP/9k=";
const PAD        = n=>String(n).padStart(2,"0");
const fmtDate    = d=>`${d.getFullYear()}-${PAD(d.getMonth()+1)}-${PAD(d.getDate())}`;
const TODAY_STR  = fmtDate(TODAY);
const diffDays   = s=>{ if(!s) return null; const d=Math.floor((TODAY-new Date(s))/86400000); return d>=0?d:null; };
const TIPOS = [
  {v:"preventivo",l:"📋 Preventivo",color:"#1565C0",bg:"#F0F4FF"},
  {v:"corretivo",l:"🔧 Corretivo",color:"#C62828",bg:"#FFF0F0"},
  {v:"a_faturar",l:"💰 A Faturar",color:"#1A7A3C",bg:"#F0FFF5"},
  {v:"mau_uso",l:"⚠️ Mau Uso",color:"#E67E00",bg:"#FFF8F0"},
  {v:"entrega_tecnica",l:"📦 Entrega Técnica",color:"#6A1B9A",bg:"#F8F0FF"},
  {v:"bateria",l:"🔋 Bateria",color:"#00838F",bg:"#F0FAFA"},
  {v:"carregador",l:"🔌 Carregador",color:"#AD1457",bg:"#FFF0F5"},
];
const tipoCfg = v=>TIPOS.find(t=>t.v===v)||TIPOS[0];
const TC = {"Anderson":"#E67E00","Dilson":"#1A7A3C","Rafael":"#1565C0","Helbert":"#6A1B9A","Luiz Guilherme":"#C62828","Denison":"#00838F","Arthur":"#4E342E","Eduardo":"#37474F","Luiz Ribeiro":"#558B2F","Bruno":"#AD1457","Marcus":"#283593"};
const techColor = t=>TC[t]||"#555";
const statusCfg = {
  "aberto":{color:"#C62828",bg:"#FFF0F0",label:"Aberto"},
  "em andamento":{color:"#E67E00",bg:"#FFF8F0",label:"Em Andamento"},
  "acompanhar":{color:"#1565C0",bg:"#F0F4FF",label:"Acompanhar"},
  "concluído":{color:"#1A7A3C",bg:"#F0FFF5",label:"Concluído"},
};
const empSitCfg = {
  "Atendido":{color:"#1A7A3C",bg:"#F0FFF5"},
  "Pendente":{color:"#C62828",bg:"#FFF0F0"},
  "Parcialmente Atendido":{color:"#E67E00",bg:"#FFF8F0"},
  "Aprovado":{color:"#1565C0",bg:"#F0F4FF"},
  "Aberto":{color:"#888",bg:"#F8F8F8"},
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
  "agendada":{color:"#1565C0",bg:"#F0F4FF",dot:"#1565C0",label:"Agendada"},
  "confirmada":{color:"#1A7A3C",bg:"#F0FFF5",dot:"#1A7A3C",label:"Confirmada"},
  "concluida":{color:"#00838F",bg:"#F0FAFA",dot:"#00838F",label:"Concluída"},
  "cancelada":{color:"#C62828",bg:"#FFF0F0",dot:"#C62828",label:"Cancelada"},
  "remarcada":{color:"#E67E00",bg:"#FFF8F0",dot:"#E67E00",label:"Remarcada"},
  "nao_atende":{color:"#6A1B9A",bg:"#F8F0FF",dot:"#6A1B9A",label:"Cliente não atende"},
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
  const [user,setUser]=useState(list[0]?.id||"manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const handle=()=>{const u=list.find(x=>x.id===user&&x.password===pass)||USERS.find(x=>x.id===user&&x.password===pass);if(u)onLogin(u);else setErr("Senha incorreta.");};
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#FFF",borderRadius:16,padding:40,width:380,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={LOGO_MOV} alt="Grupo MOV 35 anos" style={{height:64,width:"auto",margin:"0 auto 14px",display:"block"}}/>
          <div style={{fontSize:12,color:"#AAA",marginTop:4}}>Gestão Manutenção Grupo MOV</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Usuário</div>
          <select value={user} onChange={e=>setUser(e.target.value)} style={{width:"100%",padding:"10px 12px",fontSize:14}}>{list.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}</select>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Senha</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="Digite sua senha" style={{width:"100%",padding:"10px 12px",fontSize:14}}/>
        </div>
        {err&&<div style={{fontSize:12,color:"#C62828",marginBottom:12,textAlign:"center"}}>{err}</div>}
        <button onClick={handle} style={{width:"100%",padding:12,background:"#F5C800",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer"}}>Entrar</button>
      </div>
    </div>
  );
}

// ── MODAL RELATÓRIO (Excel/PDF/Manual + IA) ───────────────────────────────────
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
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>➕ Novo Relatório</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {[["manual","✏️ Manual"],["texto","🤖 Colar texto (IA)"],["arquivo","📎 Arquivo"]].map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px 0",borderRadius:8,border:`2px solid ${mode===m?"#F5C800":"#E0E0E0"}`,background:mode===m?"#FFFBF0":"#FFF",fontWeight:600,fontSize:12,cursor:"pointer",color:mode===m?"#C47D00":"#888"}}>{l}</button>
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
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>📥 Importar relatórios via Excel</div>
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
function ProcessoModal({onClose,onSave,tipo}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>{isMU?"⚠️ Novo Processo Mau Uso":"💰 Novo Processo A Faturar"}</div>
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
  const [form,setForm]=useState(initial||{req:"",data:TODAY_STR,natureza:"Empréstimo/Obriga Retorno",requerente:"",item:"",descricao:"",situacao:"Aberto",centroResultado:"",quant:"1",retorno:"",dataRetorno:"",observacao:"",retornoAlmox:"",retornoSistema:"",numRelatorio:"",slaAlert:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.dataRetorno?diffDays(form.dataRetorno):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>🔄 Requisição Empréstimo</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Nº REQ" value={form.req} onChange={v=>upd("req",v)} placeholder="8821"/>
            <Inp type="date" label="Data" value={form.data} onChange={v=>upd("data",v)}/>
            <Sel label="Situação" value={form.situacao} onChange={v=>upd("situacao",v)} options={["Aberto","Aprovado","Atendido","Pendente","Parcialmente Atendido"]}/>
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
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>📦 Req. Saída/Entrada</div>
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
          <div style={{fontWeight:800,fontSize:17,color:"#F5C800"}}>👤 Gerenciar Usuários</div>
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
                    <button onClick={()=>salvar(r)} style={{background:"#F5C800",border:"none",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",marginRight:4}}>Salvar</button>
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
  const sc=document.createElement("script");
  sc.src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
  sc.onload=()=>resolve(window.Chart);
  sc.onerror=()=>reject(new Error("Falha ao carregar gráficos"));
  document.body.appendChild(sc);
});
function ChartCanvas({type,data,options,height=240}){
  const ref=useRef(null); const inst=useRef(null);
  const key=JSON.stringify({type,data,options});
  useEffect(()=>{
    let alive=true;
    loadChartLib().then(Chart=>{
      if(!alive||!ref.current)return;
      if(inst.current){inst.current.destroy();inst.current=null;}
      inst.current=new Chart(ref.current.getContext("2d"),{type,data,options:{...options}});
    }).catch(()=>{});
    return ()=>{alive=false;if(inst.current){inst.current.destroy();inst.current=null;}};
  },[key]);
  return <div style={{position:"relative",height}}><canvas ref={ref}/></div>;
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [users,setUsers]=useState(USERS);
  const [modalUsers,setModalUsers]=useState(false);
  const [tab,setTab]=useState("relatorios");
  useEffect(()=>{ if(user&&user.apenasOficina) setTab("apontamentos_oficina"); },[user?.id]);
  useEffect(()=>{ if(user&&user.apenasOfi150) setTab("apontamentos_150"); },[user?.id]);
  const [reports,setReports]=useState(REAL_REPORTS);
  const [processosMU,setProcessosMU]=useState([]);
  const [processosAF,setProcessosAF]=useState([]);
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
  const [filterReqStatus,setFilterReqStatus]=useState("sem_retorno");
  const [showArqRel,setShowArqRel]=useState(false);
  const [showArqMU,setShowArqMU]=useState(false);
  const [showArqAF,setShowArqAF]=useState(false);
  const [showArqEmp,setShowArqEmp]=useState(false);
  const [showArqSaida,setShowArqSaida]=useState(false);
  const [showArqReq,setShowArqReq]=useState(false);
  const [uberPedidos,setUberPedidos]=useState([]);
  const [financeiro,setFinanceiro]=useState([]);
  const [frota,setFrota]=useState([]);
  const [prioridades,setPrioridades]=useState([]);
  const [rhFiscal,setRhFiscal]=useState([]);
  const [pendGustavo,setPendGustavo]=useState([]);
  const [oficina,setOficina]=useState([]);
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
  const [agOfiObs,setAgOfiObs]=useState("");
  const [agOfiRelatorio,setAgOfiRelatorio]=useState("");
  const [pendHebert,setPendHebert]=useState([]);
  const [showArqHeb,setShowArqHeb]=useState(false);
  // Filtros nova aba oficina
  const [ofiNovaData,setOfiNovaData]=useState("");
  const [ofiNovaOS,setOfiNovaOS]=useState("");
  const [ofiNovaPat,setOfiNovaPat]=useState("");
  const [ofiNovaTech,setOfiNovaTech]=useState("todos");
  const [ofiNovaServ,setOfiNovaServ]=useState("todos");
  const [apontamentos,setApontamentos]=useState([]);
  const [apontamentos150,setApontamentos150]=useState([]);
  const [agendaOfi150,setAgendaOfi150]=useState({});
  const [agOfi150Month,setAgOfi150Month]=useState(TODAY.getMonth());
  const [agOfi150Year,setAgOfi150Year]=useState(TODAY.getFullYear());
  const [agOfi150Tech,setAgOfi150Tech]=useState("todos");
  const [agOfi150Servico,setAgOfi150Servico]=useState("todos");
  const [agOfi150TechSel,setAgOfi150TechSel]=useState("Matheus");
  const [agOfi150Date,setAgOfi150Date]=useState("");
  const [agOfi150Empresa,setAgOfi150Empresa]=useState("");
  const [agOfi150Pat,setAgOfi150Pat]=useState("");
  const [agOfi150ServSel,setAgOfi150ServSel]=useState(SERVICOS_OFICINA[0]);
  const [agOfi150Entrada,setAgOfi150Entrada]=useState("");
  const [agOfi150Saida,setAgOfi150Saida]=useState("");
  const [agOfi150Obs,setAgOfi150Obs]=useState("");
  const [agOfi150Relatorio,setAgOfi150Relatorio]=useState("");
  const [pendMatheus,setPendMatheus]=useState([]);
  const [showArqMat,setShowArqMat]=useState(false);
  const [ofi150Data,setOfi150Data]=useState("");
  const [ofi150OS,setOfi150OS]=useState("");
  const [ofi150Pat,setOfi150Pat]=useState("");
  const [ofi150Tech,setOfi150Tech]=useState("todos");
  const [ofi150Serv,setOfi150Serv]=useState("todos");
  const [sas,setSas]=useState([]);

  // Modais
  const [modalReport,setModalReport]=useState(false);
  const [modalImport,setModalImport]=useState(false);
  const [modalMU,setModalMU]=useState(false);
  const [modalAF,setModalAF]=useState(false);
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
      const [rels, mus, afs, emps, saidas, reqs, ubers, escRows, usrs, fins, fros, pris, rhs, guss, ofis, agOfiRows, hebRows, apRows, sasRows, carrosRows, ap150Rows, agOfi150Rows, matRows] = await Promise.all([
        db.get("relatorios"), db.get("processos_mu"), db.get("processos_af"),
        db.get("emprestimos"), db.get("saida_entrada"), db.get("requisicoes"),
        db.get("uber_pedidos"), db.get("escala"), db.get("usuarios"), db.get("financeiro"),
        db.get("pendencias_frota"), db.get("prioridades_clientes"), db.get("rh_fiscal"), db.get("pendencias_gustavo"), db.get("oficina"),
        db.get("agenda_oficina"), db.get("pendencias_hebert"), db.get("apontamentos_oficina"), db.get("sas"), db.get("carros"), db.get("apontamentos_150"), db.get("agenda_ofi_150"), db.get("pendencias_matheus")
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
      if(agOfiRows.length>0){ const ao={}; agOfiRows.forEach(r=>{ if(r&&r.key) ao[r.key]=r.slots||[]; }); setAgendaOfi(ao); }
      if(hebRows.length>0) setPendHebert(hebRows);
      if(apRows.length>0) setApontamentos(apRows);
      if(sasRows.length>0) setSas(sasRows);
      if(carrosRows.length>0) setCarros(carrosRows);
      if(ap150Rows.length>0) setApontamentos150(ap150Rows);
      if(agOfi150Rows.length>0){ const ao={}; agOfi150Rows.forEach(r=>{ if(r&&r.key) ao[r.key]=r.slots||[]; }); setAgendaOfi150(ao); }
      if(matRows.length>0) setPendMatheus(matRows);
      if(escRows.length>0){ const sched={}; const prev={}; escRows.forEach(r=>{ if(r&&r.key){ if(r.key.startsWith("PREV__")) prev[r.key.slice(6)]=r.slots||[]; else sched[r.key]=r.slots||[]; } }); setSchedule(sched); setAgendaPrev(prev); }
      if(usrs.length>0){ const merged=[...usrs]; if(!merged.find(u=>u.id==="manuela")) merged.unshift(USERS[0]); setUsers(merged); }
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
  const updateEmp=(id,changes)=>{const updated=emprestimos.map(r=>r.id===id?{...r,...changes}:r);setEmprestimos(updated);db.save("emprestimos",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateSaida=(id,changes)=>{const updated=saidaEntrada.map(r=>r.id===id?{...r,...changes}:r);setSaidaEntrada(updated);db.save("saida_entrada",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
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
  const [carros,setCarros]=useState([]);
  const updateCarro=(id,changes)=>{ setCarros(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("carros",id,row); return np; }); };
  const addCarro=()=>{ const row={id:`CAR${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,placa:"",tecnico:ALL_TECHS[0],manutencao:"",valor:"",aprovadoGustavo:"nao",dataExecucao:"",oficina:"",obs:""}; setCarros(p=>[row,...p]); db.save("carros",row.id,row); notify("✅ Registro criado!"); };
  const delCarro=(id)=>{ setCarros(p=>p.filter(x=>x.id!==id)); db.delete("carros",id); };
  const mathCrud=mkCrud("pendencias_matheus",setPendMatheus);
  const saveAgendaOfi150=(key,slots)=>{ setAgendaOfi150(p=>({...p,[key]:slots})); db.save("agenda_ofi_150",key,{key,slots}); };
  const updateApon150=(id,changes)=>{ setApontamentos150(prev=>{ const np=prev.map(x=>x.id===id?{...x,...changes}:x); const row=np.find(x=>x.id===id); db.save("apontamentos_150",id,row); return np; }); };
  const addApon150=()=>{ const row={id:`AP150${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,os:"",patrimonio:"",tecnico:"Matheus",servico:SERVICOS_OFICINA[0],inicio:"",termino:"",total:"",oficina:"150",obs:"",relatorio:""}; setApontamentos150(p=>[row,...p]); db.save("apontamentos_150",row.id,row); notify("✅ Apontamento criado!"); };
  const delApon150=(id)=>{ setApontamentos150(p=>p.filter(x=>x.id!==id)); db.delete("apontamentos_150",id); };
  const priCrud=mkCrud("prioridades_clientes",setPrioridades);
  const rhCrud=mkCrud("rh_fiscal",setRhFiscal);
  const gusCrud=mkCrud("pendencias_gustavo",setPendGustavo);
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

  if(!user)return<LoginScreen users={users} onLogin={u=>{setUser(u);notify(`Bem-vinda, ${u.name}!`);}}/>;

  const CSS=`
    *{box-sizing:border-box;margin:0;padding:0;}
    textarea{resize:none;}
    ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-thumb{background:#CCC;border-radius:3px;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideDown{from{transform:translateY(-12px);opacity:0}to{transform:translateY(0);opacity:1}}
    .card{background:#FFF;border:1px solid #E2E2E2;border-radius:12px;}
    .btn{cursor:pointer;border:none;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;transition:all .15s;}
    .btn-primary{background:#F5C800;color:#1A1A1A;padding:9px 20px;}
    .btn-primary:hover{background:#E6B800;}
    .btn-primary:disabled{opacity:.4;cursor:not-allowed;}
    .btn-ghost{background:transparent;color:#666;padding:8px 16px;border:1px solid #E0E0E0;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;transition:all .15s;}
    .btn-ghost:hover{background:#F5F5F5;border-color:#BDBDBD;}
    .nav-tab{cursor:pointer;padding:7px 13px;border-radius:7px;font-size:12px;font-weight:600;border:none;background:transparent;color:#AAA;font-family:inherit;transition:all .15s;white-space:nowrap;}
    .nav-tab.active{background:#F5C800;color:#1A1A1A;}
    .nav-tab:hover:not(.active){color:#FFF;background:#333;}
    select{background:#FFF;color:#1A1A1A;border:1px solid #E0E0E0;border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12px;cursor:pointer;outline:none;}
    select:focus{border-color:#F5C800;}
    input[type=text],input[type=password],input[type=date],input[type=time],textarea{background:#FFF;color:#1A1A1A;border:1px solid #E0E0E0;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:13px;outline:none;transition:border-color .15s;}
    input[type=text]:focus,input[type=password]:focus,input[type=date]:focus,input[type=time]:focus,textarea:focus{border-color:#F5C800;box-shadow:0 0 0 3px rgba(245,200,0,.15);}
    input[type=date],input[type=time]{cursor:pointer;}
    .notif{position:fixed;top:16px;right:16px;background:#1A1A1A;color:#F5C800;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:700;z-index:999;animation:slideDown .25s ease;box-shadow:0 4px 20px rgba(0,0,0,.2);}
    .tbl-wrap{overflow-x:auto;width:100%;}
    table{width:100%;border-collapse:collapse;min-width:700px;}
    th{background:#F8F8F8;padding:9px 12px;text-align:left;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #EBEBEB;white-space:nowrap;}
    td{padding:10px 12px;font-size:12px;border-bottom:1px solid #F4F4F4;vertical-align:middle;}
    tr:hover td{background:#FAFAFA;}
    tr:last-child td{border-bottom:none;}
  `;

  return(
    <div style={{minHeight:"100vh",background:"#F2F2F2",color:"#1A1A1A",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif"}}>
      <style>{CSS}</style>
      {notification&&<div className="notif">{notification}</div>}

      {/* HEADER */}
      <div style={{background:"#1A1A1A"}}>
        <div style={{padding:"12px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#FFF",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",flexShrink:0}}>
              <img src={LOGO_MOV} alt="Grupo MOV 35 anos" style={{height:26,width:"auto",display:"block"}}/>
            </div>
            <div>
              <div style={{fontSize:9,color:"#666",letterSpacing:1.5,textTransform:"uppercase"}}>Gestão Manutenção Grupo MOV</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:"#888"}}>{user.name} — {user.role}</span>
            {user.canDelete&&<button onClick={()=>setModalUsers(true)} style={{background:"#F5C800",border:"none",color:"#1A1A1A",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>👤 Usuários</button>}
            <button onClick={()=>setUser(null)} style={{background:"#333",border:"none",color:"#AAA",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>Sair</button>
          </div>
        </div>
        <div style={{padding:"8px 24px 0",display:"flex",gap:3,overflowX:"auto"}}>
          {[
            ["relatorios","📋 Conf. Relatórios","normal"],
            ["agenda_prev","🗓 Agenda","normal"],
            ["dashboard","📊 Dashboard","normal"],
            ["apontamentos_oficina","📝 Apontamentos Oficina","oficina"],
            ["agenda_ofi","🗓 Agenda Oficina","oficina"],
            ["dashboard_ofi","📊 Dashboard Oficina","oficina"],
            ["apontamentos_150","📝 Apontamentos Oficina 150","ofi150"],
            ["agenda_ofi_150","🗓 Agenda Oficina 150","ofi150"],
            ["dashboard_ofi_150","📊 Dashboard Oficina 150","ofi150"],
            ["mau_uso","⚠️ Mau Uso","normal"],
            ["a_faturar","💰 A Faturar","normal"],
            ["emprestimos","🔄 Req. Empréstimo e Retorno","normal"],
            ["saida_entrada","📦 Req. Entrada/Saída","normal"],
            ["dashboard_req","📊 Dashboard Requisições","normal"],
            ["sas","📄 SAS","normal"],
            ["carros","🚙 Carros","normal"],
            ["uber","🚗 Uber","normal"],
            ["financeiro","💰 Financeiro","normal"],
            ["pendencias_frota","🚜 Pendências Frota","normal"],
            ["prioridades_clientes","⭐ Prioridades Clientes","somanuela"],
            ["rh_fiscal","🧾 RH-Fiscal","somanuela"],
            ["pendencias_gustavo","📌 Pendências Gustavo","somanuela"],
            ["pendencias_hebert","🔧 Pendências Hebert","hebert"],
            ["pendencias_matheus","🔧 Pendências Matheus","matheus"],
          ].filter(([k,l,tipo])=>{
            if(user.apenasOficina) return ["apontamentos_oficina","agenda_ofi","dashboard_ofi","pendencias_hebert"].includes(k);
            if(user.apenasOfi150) return ["apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_matheus"].includes(k);
            if(tipo==="somanuela") return user.id==="manuela";
            if(tipo==="hebert") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_ofi";
            if(tipo==="matheus") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_ofi";
            if(tipo==="ofi150") return user.id==="manuela"||user.id==="gustavo"||user.id==="matheus_ofi";
            if(tipo==="oficina") return user.id==="manuela"||user.id==="gustavo"||user.id==="hebert_ofi";
            return true;
          }).map(([k,l])=>(
            <button key={k} className={`nav-tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>
              {l}{k==="emprestimos"&&empAlerta>0&&<span style={{marginLeft:5,background:"#C62828",color:"#FFF",borderRadius:8,fontSize:9,padding:"1px 5px"}}>{empAlerta}</span>}
            </button>
          ))}
        </div>
        <div style={{height:3,background:"linear-gradient(90deg,#F5C800,#FFE566,#F5C800)",marginTop:8}}/>
      </div>

      <div style={{maxWidth:1300,margin:"0 auto",padding:"24px 20px"}}>

        {/* ── RELATÓRIOS ── */}
        {tab==="relatorios"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            {/* Filtros */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Buscar empresa, ação, patrimônio..." style={{minWidth:220,fontSize:12}}/>
              <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os tipos</option>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select>
              <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option><option value="metropolitana">Metropolitana BH</option><option value="roca">Roca</option><option value="centroOeste">Centro-Oeste</option></select>
              <select value={filterTech} onChange={e=>setFilterTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{fontSize:12}}><option value="todos">Todos status</option>{REL_STATUS_KEYS.map(v=><option key={v} value={v}>{v}</option>)}</select>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={filterDateFrom} onChange={e=>setFilterDateFrom(e.target.value)} style={{fontSize:12}}/></div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={filterDateTo} onChange={e=>setFilterDateTo(e.target.value)} style={{fontSize:12}}/></div>
              <button onClick={()=>setShowArqRel(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqRel?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:showArqRel?"#888":"#AAA",fontFamily:"inherit"}}>
                {showArqRel?"✓ Arquivados":"📁 Ver Arquivados"}
              </button>
              {(filterTipo!=="todos"||filterTech!=="todos"||filterStatus!=="todos"||filterRegion!=="todas"||filterDateFrom||filterDateTo||searchText)&&<BtnG onClick={()=>{setFilterTipo("todos");setFilterTech("todos");setFilterStatus("todos");setFilterRegion("todas");setFilterDateFrom("");setFilterDateTo("");setSearchText("");}}>✕ Limpar</BtnG>}
              <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").length} registro(s)</span>
              <BtnImport onClick={()=>setModalImport(true)}/>
              <BtnExcel onClick={()=>exportCSV(filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado"),"relatorios_grupomov",[{key:"dataReg",label:"Data"},{key:"reportNum",label:"Nº Relatório"},{key:"type",label:"Tipo"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"date",label:"Data Atend."},{key:"numChamado",label:"Chamado"},{key:"acao",label:"Ação"},{key:"horaEntrada",label:"Entrada"},{key:"horaSaida",label:"Saída"},{key:"horasTrabalhadas",label:"Horas Trab."},{key:"status",label:"Status"},{key:"requisicaoPeca",label:"Requisição"},{key:"dataPeca",label:"Data Peça"},{key:"execPeca",label:"Executado"},{key:"chamadoPeca",label:"Chamado Peça"},{key:"relatorioPeca",label:"Relatório Peça"},{key:"dataRelPeca",label:"Data Rel. Peça"},{key:"processoStatus",label:"Processo"}])}/>
              <BtnY onClick={()=>setModalReport(true)}>+ Novo Relatório</BtnY>
            </div>
            {/* Tabela */}
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Nº Relatório</th><th>Tipo</th><th>Empresa</th><th>Patrimônio</th><th>Técnico</th><th>Data Atend.</th><th>Chamado</th><th>Ação</th><th>Entrada</th><th>Saída</th><th>Status</th><th>Processo</th><th>Registrado por</th>{user.canDelete&&<th>Excluir</th>}</tr></thead>
                  <tbody>
                    {filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").length===0&&<tr><td colSpan={user.canDelete?15:14} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Relatório".</td></tr>}
                    {filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").map(d=>{
                      const sc=REL_STATUS[d.status]||{color:"#888",bg:"#F5F5F5"};
                      const tc=tipoCfg(d.type);
                      const isArq=d.processoStatus==="arquivado";
                      const pend=isPendentePecas(d.status);
                      const nCols=user.canDelete?15:14;
                      return(
                        <Fragment key={d.id}>
                        <tr style={{opacity:isArq?.5:1,background:isArq?"#F8F8F8":""}}>
                          <td><input type="date" value={d.dataReg||""} onChange={e=>updateReport(d.id,{dataReg:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.reportNum||""} onChange={e=>updateReport(d.id,{reportNum:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px",fontWeight:700}}/></td>
                          <td><select value={d.type} onChange={e=>updateReport(d.id,{type:e.target.value})} style={{fontSize:10,padding:"3px 5px",color:tc.color,background:tc.bg,border:"none",borderRadius:5,fontWeight:700}}>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></td>
                          <td><input type="text" value={d.empresa||""} onChange={e=>updateReport(d.id,{empresa:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.patrimonio||""} onChange={e=>updateReport(d.id,{patrimonio:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={d.tecnico||""} onChange={e=>updateReport(d.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                          <td><input type="date" value={d.date||""} onChange={e=>updateReport(d.id,{date:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.numChamado||""} onChange={e=>updateReport(d.id,{numChamado:e.target.value})} placeholder="—" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.acao||""} onChange={e=>updateReport(d.id,{acao:e.target.value})} placeholder="Ação..." style={{width:160,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="time" value={d.horaEntrada||""} onChange={e=>{const v=e.target.value;updateReport(d.id,{horaEntrada:v,horasTrabalhadas:calcHoras(v,d.horaSaida)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="time" value={d.horaSaida||""} onChange={e=>{const v=e.target.value;updateReport(d.id,{horaSaida:v,horasTrabalhadas:calcHoras(d.horaEntrada,v)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={d.status||""} onChange={e=>updateReport(d.id,{status:e.target.value})} style={{fontSize:11,padding:"4px 7px",color:sc.color,background:sc.bg,border:`1px solid ${sc.color}33`,borderRadius:6,fontWeight:700,minWidth:150}}>{!REL_STATUS[d.status]&&<option value={d.status||""}>{d.status||"— selecionar —"}</option>}{REL_STATUS_KEYS.map(v=><option key={v} value={v}>{v}</option>)}</select></td>
                          <td><PSSelect value={d.processoStatus} onChange={v=>updateReport(d.id,{processoStatus:v})}/></td>
                          <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{d.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(d.registradoEm)}</span></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir este relatório?")){setReports(p=>p.filter(r=>r.id!==d.id));db.delete("relatorios",d.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
                        {pend&&(
                          <tr>
                            <td colSpan={nCols} style={{padding:"0 12px 12px"}}>
                              <div style={{background:"#FFF7E0",borderLeft:"4px solid #F5C800",borderRadius:8,padding:"10px 14px"}}>
                                <div style={{fontSize:10,fontWeight:800,color:"#92600A",letterSpacing:.5,marginBottom:8}}>⚠️ PEÇAS PENDENTES — acompanhamento</div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>REQUISIÇÃO</span><input type="text" value={d.requisicaoPeca||""} onChange={e=>updateReport(d.id,{requisicaoPeca:e.target.value})} placeholder="REQ-000" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>QUANTIDADE</span><input type="number" min="0" value={d.qtdPeca||""} onChange={e=>updateReport(d.id,{qtdPeca:e.target.value})} placeholder="0" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>CÓDIGO</span><input type="text" value={d.codPeca||""} onChange={e=>updateReport(d.id,{codPeca:e.target.value})} placeholder="COD-000" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>PEÇA</span><input type="text" value={d.pecaNome||""} onChange={e=>updateReport(d.id,{pecaNome:e.target.value})} placeholder="Nome da peça" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>STATUS PEÇA</span><select value={d.statusPeca||"separada"} onChange={e=>updateReport(d.id,{statusPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px",fontWeight:700,color:d.statusPeca==="ruptura"?"#C62828":d.statusPeca==="atendido"?"#1A7A3C":"#1565C0"}}><option value="separada">Separada</option><option value="ruptura">Ruptura</option><option value="atendido">Atendido</option></select></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>DATA PEÇA</span><input type="date" value={d.dataPeca||""} onChange={e=>updateReport(d.id,{dataPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>EXECUTADO</span><select value={d.execPeca||""} onChange={e=>updateReport(d.id,{execPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}>{EXECUTADO_OPTS.map(o=><option key={o} value={o}>{o||"—"}</option>)}</select></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>CHAMADO</span><input type="text" value={d.chamadoPeca||""} onChange={e=>updateReport(d.id,{chamadoPeca:e.target.value})} placeholder="—" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>RELATÓRIO</span><input type="text" value={d.relatorioPeca||""} onChange={e=>updateReport(d.id,{relatorioPeca:e.target.value})} placeholder="REL-000" style={{fontSize:11,padding:"4px 6px"}}/></div>
                                  <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:9,fontWeight:700,color:"#999"}}>DATA</span><input type="date" value={d.dataRelPeca||""} onChange={e=>updateReport(d.id,{dataRelPeca:e.target.value})} style={{fontSize:11,padding:"4px 6px"}}/></div>
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

        {/* ── APONTAMENTOS OFICINA ── */}
        {tab==="apontamentos_oficina"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📝 Apontamentos Oficina</div><div style={{fontSize:13,color:"#888"}}>{apontamentos.length} registro(s)</div></div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(apontamentos,"apontamentos_oficina",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"oficina",label:"Oficina"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={addApon}>+ Novo Apontamento</BtnY>
              </div>
            </div>
            {/* Filtros */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input type="date" value={ofiNovaData} onChange={e=>setOfiNovaData(e.target.value)} style={{fontSize:12}} title="Filtrar por data"/>
              <input type="text" value={ofiNovaOS} onChange={e=>setOfiNovaOS(e.target.value)} placeholder="🔍 OS" style={{width:100,fontSize:12}}/>
              <input type="text" value={ofiNovaPat} onChange={e=>setOfiNovaPat(e.target.value)} placeholder="🔍 Patrimônio" style={{width:130,fontSize:12}}/>
              <select value={ofiNovaTech} onChange={e=>setOfiNovaTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={ofiNovaServ} onChange={e=>setOfiNovaServ(e.target.value)} style={{fontSize:12}}><option value="todos">Todos serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
              {(ofiNovaData||ofiNovaOS||ofiNovaPat||ofiNovaTech!=="todos"||ofiNovaServ!=="todos")&&<BtnG onClick={()=>{setOfiNovaData("");setOfiNovaOS("");setOfiNovaPat("");setOfiNovaTech("todos");setOfiNovaServ("todos");}}>✕ Limpar</BtnG>}
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>OS</th><th>Patrimônio</th><th>Técnico</th><th>Serviço</th><th>Início</th><th>Término</th><th>Total</th><th>Oficina</th><th>Relatório</th><th>Observação</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {apontamentos.filter(a=>{
                      if(ofiNovaData&&a.data!==ofiNovaData)return false;
                      if(ofiNovaOS&&!( a.os||"").toLowerCase().includes(ofiNovaOS.toLowerCase()))return false;
                      if(ofiNovaPat&&!(a.patrimonio||"").toLowerCase().includes(ofiNovaPat.toLowerCase()))return false;
                      if(ofiNovaTech!=="todos"&&a.tecnico!==ofiNovaTech)return false;
                      if(ofiNovaServ!=="todos"&&a.servico!==ofiNovaServ)return false;
                      return true;
                    }).map(a=>(
                      <tr key={a.id}>
                        <td><input type="date" value={a.data||""} onChange={e=>updateApon(a.id,{data:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="text" value={a.os||""} onChange={e=>updateApon(a.id,{os:e.target.value})} placeholder="OS-001" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="text" value={a.patrimonio||""} onChange={e=>updateApon(a.id,{patrimonio:e.target.value})} placeholder="PAT-001" style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><select value={a.tecnico||OFICINA_TECHS[0]} onChange={e=>updateApon(a.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                        <td><select value={a.servico||SERVICOS_OFICINA[0]} onChange={e=>updateApon(a.id,{servico:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></td>
                        <td><input type="time" value={a.inicio||""} onChange={e=>{const v=e.target.value;updateApon(a.id,{inicio:v,total:calcHoras(v,a.termino)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="time" value={a.termino||""} onChange={e=>{const v=e.target.value;updateApon(a.id,{termino:v,total:calcHoras(a.inicio,v)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><span style={{display:"inline-block",minWidth:54,fontSize:12,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:6,padding:"4px 8px"}}>{a.total||calcHoras(a.inicio,a.termino)||"—"}</span></td>
                        <td><select value={a.oficina||"1340"} onChange={e=>updateApon(a.id,{oficina:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:700}}>{OFICINAS_UNID.map(o=><option key={o}>{o}</option>)}</select></td>
                        <td><input type="text" value={a.relatorio||""} onChange={e=>updateApon(a.id,{relatorio:e.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="text" value={a.obs||""} onChange={e=>updateApon(a.id,{obs:e.target.value})} placeholder="Obs..." style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                        <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{a.registradoPor||"—"}</td>
                        {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))delApon(a.id);}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                      </tr>
                    ))}
                    {apontamentos.length===0&&<tr><td colSpan={12} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum apontamento. Clique em "+ Novo Apontamento".</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── AGENDA OFICINA ── */}
        {tab==="agenda_ofi"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfiYear}-${String(agOfiMonth+1).padStart(2,"0")}`;
          const techsList=OFICINA_TECHS.filter(t=>agOfiTech==="todos"||t===agOfiTech);
          const addAtendOfi=()=>{
            const dataFinal=agOfiDate||`${ym}-01`;
            if(!agOfiEmpresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agOfiTechSel}__${dataFinal}`;
            saveAgendaOfi(key,[...(agendaOfi[key]||[]),{client:agOfiEmpresa,patrimonio:agOfiPat||"",servico:agOfiServSel,status:"agendada",horaEntrada:agOfiEntrada,horaSaida:agOfiSaida,horasTrabalhadas:calcHoras(agOfiEntrada,agOfiSaida),obs:agOfiObs,relatorio:agOfiRelatorio||""}]);
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
              <div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agOfiTechSel} onChange={e=>setAgOfiTechSel(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{OFICINA_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agOfiDate||`${ym}-01`} onChange={e=>setAgOfiDate(e.target.value)} style={{fontSize:12,padding:"6px 8px"}}/>
                  <input type="text" placeholder="Empresa/Serviço" value={agOfiEmpresa} onChange={e=>setAgOfiEmpresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",flex:1,minWidth:140}}/>
                  <input type="text" placeholder="Patrimônio" value={agOfiPat} onChange={e=>setAgOfiPat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <select value={agOfiServSel} onChange={e=>setAgOfiServSel(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Ent.</span><input type="time" value={agOfiEntrada} onChange={e=>setAgOfiEntrada(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Saí.</span><input type="time" value={agOfiSaida} onChange={e=>setAgOfiSaida(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <input type="text" placeholder="Obs..." value={agOfiObs} onChange={e=>setAgOfiObs(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:120}}/>
                  <input type="text" placeholder="Nº Relatório" value={agOfiRelatorio||""} onChange={e=>setAgOfiRelatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <BtnY onClick={addAtendOfi}>Adicionar</BtnY>
                </div>
              </div>
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
                    <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,overflow:"hidden"}}>
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
                              <button onClick={()=>{if(window.confirm("Remover?")){const arr=(agendaOfi[e.key]||[]).filter((_,j)=>j!==e.si);saveAgendaOfi(e.key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:13}}>✕</button>
                            </div>
                            <div style={{fontSize:11,color:"#888",marginBottom:4}}>🏷️ {e.s.patrimonio||"—"} · <b style={{color:"#1565C0"}}>{e.s.servico||"—"}</b></div>
                            <div style={{marginBottom:4}}>
                              <input type="text" value={e.s.relatorio||""} placeholder="Nº Relatório" onChange={ev=>{const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,relatorio:ev.target.value};saveAgendaOfi(e.key,arr);}} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0"}}/>
                            </div>
                            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                              <input type="time" value={e.s.horaEntrada||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,horaEntrada:v,horasTrabalhadas:calcHoras(v,e.s.horaSaida)};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <input type="time" value={e.s.horaSaida||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,horaSaida:v,horasTrabalhadas:calcHoras(e.s.horaEntrada,v)};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <span style={{fontSize:10,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:5,padding:"2px 6px"}}>{e.s.horasTrabalhadas||"—"}</span>
                            </div>
                            {e.s.obs&&<div style={{fontSize:10,color:"#888",fontStyle:"italic"}}>{e.s.obs}</div>}
                            <div style={{marginTop:4}}>
                              <select value={e.s.status||"agendada"} onChange={ev=>{const arr=[...(agendaOfi[e.key]||[])];arr[e.si]={...e.s,status:ev.target.value};saveAgendaOfi(e.key,arr);}} style={{fontSize:10,padding:"2px 5px",fontWeight:700,borderRadius:6,border:"1px solid #E0E0E0",width:"100%"}}>
                                <option value="agendada">Agendada</option>
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
          const parseMin=h=>{if(!h)return 0;const m=String(h).match(/^(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
          const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"0h00";
          // Apontamentos do mês
          const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
          const apMes=apontamentos.filter(a=>a.data&&a.data.startsWith(mesAtual));
          const totalMinMes=apMes.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
          // Por técnico
          const byTech={}; OFICINA_TECHS.forEach(t=>{byTech[t]=apMes.filter(a=>a.tecnico===t);});
          const techHorasData={labels:OFICINA_TECHS,datasets:[{label:"Horas",data:OFICINA_TECHS.map(t=>+(byTech[t].reduce((a,r)=>a+parseMin(r.total||calcHoras(r.inicio,r.termino)),0)/60).toFixed(1)),backgroundColor:"#F5C800",borderRadius:4}]};
          // Por serviço
          const byServ={}; SERVICOS_OFICINA.forEach(s=>{byServ[s]=apMes.filter(a=>a.servico===s).length;});
          const servData={labels:SERVICOS_OFICINA,datasets:[{label:"Qtd",data:SERVICOS_OFICINA.map(s=>byServ[s]),backgroundColor:["#1565C0","#C62828","#E67E00","#F5C800","#1A7A3C","#00838F","#AD1457","#6A1B9A","#4E342E"],borderRadius:4}]};
          // Agenda oficina do mês
          const agOfiAtend=[];
          Object.keys(agendaOfi).forEach(k=>{const i=k.indexOf("__");if(i<0)return;const kt=k.slice(0,i),kd=k.slice(i+2);if(!kd.startsWith(ym))return;(agendaOfi[k]||[]).forEach(s=>agOfiAtend.push({tech:kt,date:kd,servico:s.servico,status:s.status,horas:s.horasTrabalhadas}));});
          const concluidos=agOfiAtend.filter(a=>a.status==="concluida").length;
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{fontWeight:800,fontSize:22,marginBottom:16}}>📊 Dashboard Oficina — {MESES[agOfiMonth]} {agOfiYear}</div>
              <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
                <select value={agOfiMonth} onChange={e=>setAgOfiMonth(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                <select value={agOfiYear} onChange={e=>setAgOfiYear(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {[{l:"Apontamentos (mês)",v:apMes.length,c:"#1A1A1A"},{l:"Horas Totais (mês)",v:fmtMin(totalMinMes),c:"#C47D00"},{l:"Agendados",v:agOfiAtend.length,c:"#1565C0"},{l:"Concluídos",v:concluidos,c:"#1A7A3C"}].map((s,i)=>(
                  <div key={i} className="card" style={{padding:"16px 20px",borderTop:`3px solid ${s.c}`}}>
                    <div style={{fontSize:10,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
                    <div style={{fontSize:28,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>⏱ Horas por Técnico (mês)</div>
                  <ChartCanvas type="bar" data={techHorasData} options={{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}},maintainAspectRatio:false}} height={Math.max(160,OFICINA_TECHS.length*34)}/>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>🔧 Serviços Realizados (mês)</div>
                  <ChartCanvas type="bar" data={servData} options={{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}},maintainAspectRatio:false}} height={Math.max(160,SERVICOS_OFICINA.length*34)}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {OFICINA_TECHS.map(tech=>{
                  const color=techColor(tech);
                  const techAp=apMes.filter(a=>a.tecnico===tech);
                  const totalMin=techAp.reduce((a,r)=>a+parseMin(r.total||calcHoras(r.inicio,r.termino)),0);
                  return(
                    <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,padding:"14px 16px"}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:8}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                      <div style={{fontSize:11,color:"#AAA",marginBottom:4}}>Horas: <b style={{color:"#C47D00"}}>{fmtMin(totalMin)}</b></div>
                      <div style={{fontSize:11,color:"#AAA",marginBottom:4}}>Apontamentos: <b style={{color:"#1A1A1A"}}>{techAp.length}</b></div>
                      <div style={{fontSize:11,color:"#AAA"}}>Serviços: {[...new Set(techAp.map(a=>a.servico))].join(", ")||"—"}</div>
                    </div>
                  );
                })}
              </div>
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
                  <thead><tr><th>Data</th><th>Nº Relatório</th><th>Tipo</th><th>Empresa</th><th>Patrimônio</th><th>Técnico</th><th>Data Atend.</th><th>Chamado</th><th>Ação</th><th>Entrada</th><th>Saída</th><th>Horas Trab.</th><th>Status</th><th>Processo</th><th>Registrado por</th>{user.canDelete&&<th>Excluir</th>}</tr></thead>
                  <tbody>
                    {filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado").length===0&&<tr><td colSpan={user.canDelete?16:15} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Relatório".</td></tr>}
                    {filteredOficina.filter(d=>showArqOfi||d.processoStatus!=="arquivado").map(d=>{
                      const sc=REL_STATUS[d.status]||{color:"#888",bg:"#F5F5F5"};
                      const tc=tipoCfg(d.type);
                      const isArq=d.processoStatus==="arquivado";
                      const pend=isPendentePecas(d.status);
                      const nCols=user.canDelete?16:15;
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
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir este relatório?")){setOficina(p=>p.filter(r=>r.id!==d.id));db.delete("oficina",d.id);}}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
                        {pend&&(
                          <tr>
                            <td colSpan={nCols} style={{padding:"0 12px 12px"}}>
                              <div style={{background:"#FFF7E0",borderLeft:"4px solid #F5C800",borderRadius:8,padding:"10px 14px"}}>
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
        {tab==="mau_uso"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>⚠️ Processos Mau Uso</div><div style={{fontSize:13,color:"#888"}}>{processosMU.filter(p=>!showArqMU?p.processoStatus!=="arquivado":true).length} processo(s)</div></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowArqMU(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqMU?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqMU?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                <BtnExcel onClick={()=>exportCSV(processosMU.filter(p=>showArqMU||p.processoStatus!=="arquivado"),"mau_uso_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"relatorio",label:"Relatório"},{key:"chamado",label:"Chamado"},{key:"enviadoAprovacao",label:"Enviado Aprov."},{key:"aprovado",label:"Aprovado"},{key:"numMauUso",label:"Nº Mau Uso"},{key:"ov",label:"OV"},{key:"valor",label:"Valor"},{key:"aprovadoPor",label:"Aprovado por"},{key:"processoStatus",label:"Processo"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={()=>setModalMU(true)}>+ Novo Processo</BtnY>
              </div>
            </div>
            {processosMU.length===0?(
              <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhum processo cadastrado. Clique em "+ Novo Processo" para começar.</div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Data</th><th>Empresa</th><th>Patrimônio</th><th>Relatório</th><th>Chamado</th><th>Enviado Aprov.</th><th>SLA</th><th>Aprovado</th><th>Nº Mau Uso</th><th>OV</th><th>Valor</th><th>Aprovado por</th><th>Processo</th><th>Obs</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                    <tbody>
                      {processosMU.map(p=>{
                        const sla=p.enviadoAprovacao==="sim"&&p.dataEnvio?diffDays(p.dataEnvio):null;
                        const pendSLA=p.enviadoAprovacao==="nao"?diffDays(p.date):null;
                        return(
                          <tr key={p.id}>
                            <td style={{whiteSpace:"nowrap"}}>{p.date}</td>
                            <td style={{maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.empresa}</td>
                            <td style={{fontSize:11}}>{p.patrimonio}</td>
                            <td><input type="text" value={p.relatorio||""} onChange={e=>updateMU(p.id,{relatorio:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.chamado||""} onChange={e=>updateMU(p.id,{chamado:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><select value={p.enviadoAprovacao} onChange={e=>updateMU(p.id,{enviadoAprovacao:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}><option value="nao">Não</option><option value="sim">Sim</option></select></td>
                            <td>{p.enviadoAprovacao==="sim"?<SlaBadge days={sla}/>:<span style={{fontSize:11,color:"#C62828",fontWeight:700}}>⏱{pendSLA}d</span>}</td>
                            <td><select value={p.aprovado} onChange={e=>updateMU(p.id,{aprovado:e.target.value})} style={{fontSize:11,padding:"3px 6px",color:p.aprovado==="sim"?"#1A7A3C":"#C62828",fontWeight:700}}><option value="nao">Não</option><option value="sim">Sim</option></select></td>
                            <td><input type="text" value={p.numMauUso||""} onChange={e=>updateMU(p.id,{numMauUso:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.ov||""} onChange={e=>updateMU(p.id,{ov:e.target.value})} style={{width:70,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.valor||""} onChange={e=>updateMU(p.id,{valor:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.aprovadoPor||""} onChange={e=>updateMU(p.id,{aprovadoPor:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.obs||""} onChange={e=>updateMU(p.id,{obs:e.target.value})} style={{width:120,fontSize:11,padding:"3px 6px"}} placeholder="Obs..."/></td>
                            <td><PSSelect value={p.processoStatus} onChange={v=>updateMU(p.id,{processoStatus:v})}/></td>
                            {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?')){setProcessosMU(p2=>p2.filter(x=>x.id!==p.id));db.delete('processos_mu',p.id);}}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROCESSOS A FATURAR ── */}
        {tab==="a_faturar"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>💰 Processos A Faturar</div><div style={{fontSize:13,color:"#888"}}>{processosAF.filter(p=>!showArqAF?p.processoStatus!=="arquivado":true).length} processo(s)</div></div>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setShowArqAF(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqAF?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqAF?"✓ Arquivados":"📁 Ver Arquivados"}</button><BtnExcel onClick={()=>exportCSV(processosAF.filter(p=>showArqAF||p.processoStatus!=="arquivado"),"a_faturar_grupomov",[{key:"date",label:"Data"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"relatorio",label:"Relatório"},{key:"chamado",label:"Chamado"},{key:"aprovado",label:"Aprovado"},{key:"ov",label:"OV"},{key:"aprovadoPor",label:"Aprovado por"},{key:"servicoExecutado",label:"Serviço Exec."},{key:"processoStatus",label:"Processo"},{key:"obs",label:"Obs"}])}/><BtnY onClick={()=>setModalAF(true)}>+ Novo Processo</BtnY></div>
            </div>
            {processosAF.filter(p=>showArqAF||p.processoStatus!=="arquivado").length===0?(
              <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhum processo cadastrado. Clique em "+ Novo Processo" para começar.</div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Data</th><th>Empresa</th><th>Patrimônio</th><th>Relatório</th><th>Chamado</th><th>Enviado Aprov.</th><th>SLA</th><th>Aprovado</th><th>OV</th><th>Aprovado por</th><th>Serviço Exec.</th><th>Nº Chamado</th><th>Nº Relatório</th><th>Processo</th><th>Obs</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                    <tbody>
                      {processosAF.filter(p=>showArqAF||p.processoStatus!=="arquivado").map(p=>{
                        const sla=p.enviadoAprovacao==="sim"&&p.dataEnvio?diffDays(p.dataEnvio):null;
                        const pendSLA=p.enviadoAprovacao==="nao"?diffDays(p.date):null;
                        return(
                          <tr key={p.id}>
                            <td style={{whiteSpace:"nowrap"}}>{p.date}</td>
                            <td style={{maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.empresa}</td>
                            <td style={{fontSize:11}}>{p.patrimonio}</td>
                            <td><input type="text" value={p.relatorio||""} onChange={e=>updateAF(p.id,{relatorio:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.chamado||""} onChange={e=>updateAF(p.id,{chamado:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><select value={p.enviadoAprovacao} onChange={e=>updateAF(p.id,{enviadoAprovacao:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}><option value="nao">Não</option><option value="sim">Sim</option></select></td>
                            <td>{p.enviadoAprovacao==="sim"?<SlaBadge days={sla}/>:<span style={{fontSize:11,color:"#C62828",fontWeight:700}}>⏱{pendSLA}d</span>}</td>
                            <td><select value={p.aprovado} onChange={e=>updateAF(p.id,{aprovado:e.target.value})} style={{fontSize:11,padding:"3px 6px",color:p.aprovado==="sim"?"#1A7A3C":"#C62828",fontWeight:700}}><option value="nao">Não</option><option value="sim">Sim</option></select></td>
                            <td><input type="text" value={p.ov||""} onChange={e=>updateAF(p.id,{ov:e.target.value})} style={{width:70,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.aprovadoPor||""} onChange={e=>updateAF(p.id,{aprovadoPor:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><select value={p.servicoExecutado} onChange={e=>updateAF(p.id,{servicoExecutado:e.target.value})} style={{fontSize:11,padding:"3px 6px",color:p.servicoExecutado==="sim"?"#1A7A3C":"#888",fontWeight:700}}><option value="nao">Não</option><option value="sim">Sim</option></select></td>
                            <td><input type="text" value={p.numChamado2||""} onChange={e=>updateAF(p.id,{numChamado2:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.relatorio2||""} onChange={e=>updateAF(p.id,{relatorio2:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={p.obs||""} onChange={e=>updateAF(p.id,{obs:e.target.value})} style={{width:120,fontSize:11,padding:"3px 6px"}} placeholder="Obs..."/></td>
                            <td><PSSelect value={p.processoStatus} onChange={v=>updateAF(p.id,{processoStatus:v})}/></td>
                            {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?')){setProcessosAF(p2=>p2.filter(x=>x.id!==p.id));db.delete('processos_af',p.id);}}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REQ. EMPRÉSTIMO ── */}
        {tab==="emprestimos"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🔄 Requisições de Empréstimo</div>
                <div style={{fontSize:13,color:"#888"}}>{emprestimos.length} registros · {empAlerta>0&&<span style={{color:"#C62828",fontWeight:700}}>{empAlerta} com retorno em atraso!</span>}</div>
              </div>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setShowArqEmp(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqEmp?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqEmp?"✓ Arquivados":"📁 Ver Arquivados"}</button><BtnExcel onClick={()=>exportCSV(emprestimos,"emprestimos_grupomov",[{key:"req",label:"REQ"},{key:"data",label:"Data"},{key:"requerente",label:"Requerente"},{key:"item",label:"Ítem"},{key:"descricao",label:"Descrição"},{key:"situacao",label:"Situação"},{key:"quant",label:"Qtd"},{key:"retorno",label:"Retorno"},{key:"dataRetorno",label:"Data Retorno"},{key:"numRelatorio",label:"Nº Relatório"},{key:"observacao",label:"Obs"},{key:"processoStatus",label:"Processo"}])}/><BtnY onClick={()=>{setEditEmp(null);setModalEmp(true);}}>+ Nova Requisição</BtnY></div>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>REQ</th><th>Data</th><th>Requerente</th><th>Ítem</th><th>Descrição</th><th>Situação</th><th>Centro/PAT</th><th>Qtd</th><th>Retorno</th><th>Data Retorno</th><th>SLA Retorno</th><th>Relatório Aplicado</th><th>Data de Aplicação</th><th>Status</th><th>Obs</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {emprestimos.filter(e=>showArqEmp||e.processoStatus!=="arquivado").map(e=>{
                      const sc=empSitCfg[e.situacao]||{color:"#888",bg:"#F8F8F8"};
                      const sla=e.dataRetorno?diffDays(e.dataRetorno):null;
                      const atrasado=sla!==null&&sla<0;
                      return(
                        <tr key={e.id} style={{background:atrasado?"#FFF8F8":""}}>
                          <td style={{fontWeight:700,whiteSpace:"nowrap"}}>{e.req}{atrasado&&<span style={{marginLeft:4,color:"#C62828",fontSize:10}}>⚠</span>}</td>
                          <td style={{whiteSpace:"nowrap",color:"#888",fontSize:11}}>{e.data}</td>
                          <td style={{maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.requerente}</td>
                          <td style={{fontSize:11,color:"#888"}}>{e.item}</td>
                          <td style={{maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.descricao}</td>
                          <td><Tag color={sc.color} bg={sc.bg}>{e.situacao}</Tag></td>
                          <td style={{maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:11}}>{e.centroResultado}</td>
                          <td style={{textAlign:"center"}}>{e.quant}</td>
                          <td style={{fontSize:11}}>{e.retorno}</td>
                          <td style={{whiteSpace:"nowrap",color:atrasado?"#C62828":"#888",fontWeight:atrasado?700:400,fontSize:11}}>{e.dataRetorno}</td>
                          <td><SlaBadge days={sla}/></td>
                          <td><input type="text" value={e.relatorioAplicado||""} onChange={ev=>updateEmp(e.id,{relatorioAplicado:ev.target.value})} placeholder="REL-001" style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="date" value={e.dataAplicacao||""} onChange={ev=>updateEmp(e.id,{dataAplicacao:ev.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={e.statusEmp||"pendente"} onChange={ev=>updateEmp(e.id,{statusEmp:ev.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:e.statusEmp==="concluido"?"#1A7A3C":"#C62828",background:e.statusEmp==="concluido"?"#F0FFF5":"#FFF0F0"}}><option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option></select></td>
                          <td><input type="text" value={e.observacao||""} onChange={ev=>updateEmp(e.id,{observacao:ev.target.value})} placeholder="Obs..." style={{width:120,fontSize:11,padding:"3px 6px"}}/></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?')){setEmprestimos(p=>p.filter(x=>x.id!==e.id));db.delete('emprestimos',e.id);}}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SAÍDA/ENTRADA ── */}
        {tab==="saida_entrada"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📦 Requisições Entrada/Saída</div>
                <div style={{fontSize:13,color:"#888"}}>{saidaEntrada.length} registros</div>
              </div>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setShowArqSaida(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqSaida?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqSaida?"✓ Arquivados":"📁 Ver Arquivados"}</button><BtnY onClick={()=>{const row={id:`SAI${Date.now()}`,registradoPor:user.name,registradoEm:new Date().toISOString(),data:TODAY_STR,relSolicitacao:"",empresa:"",patrimonio:"",peca:"",codigo:"",quantidade:"1",req:"",statusReq:"",dataAtendimento:"",localPeca:"",dataEntregaTecnico:"",relatorioAplicado:"",obs:"",statusFinal:"pendente",processoStatus:"em_andamento"};setSaidaEntrada(p=>[row,...p]);db.save("saida_entrada",row.id,row);notify("✅ Registro criado!");}}>+ Nova Entrada/Saída</BtnY></div>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Rel. Solicitação</th><th>Empresa</th><th>Patrimônio</th><th>Peça</th><th>Cód</th><th>Qtd</th><th>REQ Gerada</th><th>Status</th><th>SLA (dias)</th><th>Data Atendimento</th><th>Local da Peça</th><th>Data Entrega Técnico</th><th>Rel. Aplicado</th><th>Observação</th><th>Status Final</th><th>Processo</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {saidaEntrada.filter(s=>showArqSaida||s.processoStatus!=="arquivado").map(s=>{
                      const isRuptura=s.statusReq==="ruptura";
                      const isAtendido=s.statusReq==="atendido";
                      const slaRuptura=s.data?diffDays(s.data):null;
                      return(
                        <tr key={s.id}>
                          <td><input type="date" value={s.data||""} onChange={e=>updateSaida(s.id,{data:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.relSolicitacao||""} onChange={e=>updateSaida(s.id,{relSolicitacao:e.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.empresa||""} onChange={e=>updateSaida(s.id,{empresa:e.target.value})} placeholder="Empresa" style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.patrimonio||""} onChange={e=>updateSaida(s.id,{patrimonio:e.target.value})} placeholder="PAT-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.peca||""} onChange={e=>updateSaida(s.id,{peca:e.target.value})} placeholder="Nome da peça" style={{width:120,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.codigo||""} onChange={e=>updateSaida(s.id,{codigo:e.target.value})} placeholder="Cód" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.quantidade||""} onChange={e=>updateSaida(s.id,{quantidade:e.target.value})} placeholder="1" style={{width:50,fontSize:11,padding:"3px 6px",textAlign:"center"}}/></td>
                          <td><input type="text" value={s.req||""} onChange={e=>updateSaida(s.id,{req:e.target.value})} placeholder="REQ" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td>
                            <select value={s.statusReq||""} onChange={e=>updateSaida(s.id,{statusReq:e.target.value})}
                              style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",
                                color:s.statusReq==="atendido"?"#1A7A3C":s.statusReq==="ruptura"?"#C62828":"#888",
                                background:s.statusReq==="atendido"?"#F0FFF5":s.statusReq==="ruptura"?"#FFF0F0":"#F8F8F8"}}>
                              <option value="">Selecione...</option>
                              <option value="atendido">✅ Atendido</option>
                              <option value="ruptura">🔴 Ruptura</option>
                            </select>
                          </td>
                          <td>{isRuptura?<SlaBadge days={slaRuptura}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td>{isAtendido?<input type="date" value={s.dataAtendimento||""} onChange={e=>updateSaida(s.id,{dataAtendimento:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td>{isAtendido?<select value={s.localPeca||""} onChange={e=>updateSaida(s.id,{localPeca:e.target.value})} style={{fontSize:11,padding:"3px 5px",borderRadius:5}}><option value="">Selecione...</option><option value="suporte">📦 Suporte</option><option value="entregue_tecnico">🧑‍🔧 Entregue ao Técnico</option></select>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td>{isAtendido?<input type="date" value={s.dataEntregaTecnico||""} onChange={e=>updateSaida(s.id,{dataEntregaTecnico:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td>{isAtendido?<input type="text" value={s.relatorioAplicado||""} onChange={e=>updateSaida(s.id,{relatorioAplicado:e.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td>{(isAtendido||isRuptura)?<input type="text" value={s.obs||""} onChange={e=>updateSaida(s.id,{obs:e.target.value})} placeholder="Obs..." style={{width:110,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                          <td><select value={s.statusFinal||"pendente"} onChange={e=>updateSaida(s.id,{statusFinal:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:s.statusFinal==="concluido"?"#1A7A3C":"#C62828",background:s.statusFinal==="concluido"?"#F0FFF5":"#FFF0F0"}}><option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option></select></td>
                          <td><PSSelect value={s.processoStatus} onChange={v=>updateSaida(s.id,{processoStatus:v})}/></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?')){setSaidaEntrada(p=>p.filter(x=>x.id!==s.id));db.delete('saida_entrada',s.id);}}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REQUISIÇÕES ── */}
        {/* ── AGENDA (mensal, todos os técnicos) ── */}
        {tab==="agenda_prev"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agpYear}-${String(agpMonth+1).padStart(2,"0")}`;
          const matchSt=s=>agpStatus==="todos"||s.status===agpStatus;
          const matchTipo=s=>agpTipo==="todos"||(s.type||"preventivo")===agpTipo;
          const isDone=s=>s.status==="preventiva_concluida"||s.status==="corretiva_concluida";
          const techsComDados=Array.from(new Set(Object.keys(schedule).map(k=>{const i=k.indexOf("__");return i<0?null:[k.slice(0,i),k.slice(i+2)];}).filter(x=>x&&x[1].startsWith(ym)).map(x=>x[0])));
          const baseTechs=agpRegion==="todas"?ALL_TECHS:(REGIONS[agpRegion]?.techs||ALL_TECHS);
          const techs=Array.from(new Set([...baseTechs,...(agpRegion==="todas"?techsComDados:[])]));
          const techsList=techs.filter(t=>agpTech==="todos"||t===agpTech);
          const addAtend=()=>{
            const dataFinal=agDate||`${ym}-01`;
            if(!agEmpresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agTech}__${dataFinal}`;
            saveSched(key,[...(schedule[key]||[]),{client:agEmpresa,patrimonio:agPat||"",type:agTipo,status:agStatus,horaEntrada:agEntrada,horaSaida:agSaida,horasTrabalhadas:calcHoras(agEntrada,agSaida),relatorio:agRelatorio||""}]);
            setAgEmpresa("");setAgPat("");setAgEntrada("");setAgSaida("");setAgRelatorio("");
            notify("✅ Atendimento salvo!");
          };
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🗓 Agenda</div><div style={{fontSize:13,color:"#888"}}>Agenda mensal de todos os técnicos — {MESES[agpMonth]} {agpYear}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <select value={agpRegion} onChange={e=>setAgpRegion(e.target.value)} style={{fontSize:12}}>
                    <option value="todas">🌐 Todas regiões</option>
                    <option value="metropolitana">Metropolitana BH</option>
                    <option value="roca">Roca</option>
                    <option value="centroOeste">Centro-Oeste</option>
                  </select>
                  <select value={agpTech} onChange={e=>setAgpTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <select value={agpTipo} onChange={e=>setAgpTipo(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os tipos</option><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select>
                  <select value={agpStatus} onChange={e=>setAgpStatus(e.target.value)} style={{fontSize:12}}><option value="todos">Todas as situações</option>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select>
                  <select value={agpMonth} onChange={e=>setAgpMonth(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                  <select value={agpYear} onChange={e=>setAgpYear(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
                </div>
              </div>

              <div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agTech} onChange={e=>setAgTech(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agDate||`${ym}-01`} onChange={e=>setAgDate(e.target.value)} style={{fontSize:12,padding:"6px 8px"}}/>
                  <input type="text" placeholder="Empresa" value={agEmpresa} onChange={e=>setAgEmpresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",flex:1,minWidth:140}}/>
                  <input type="text" placeholder="Patrimônio(s)" value={agPat} onChange={e=>setAgPat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:120}}/>
                  <input type="text" placeholder="Nº Relatório" value={agRelatorio||""} onChange={e=>setAgRelatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Ent.</span><input type="time" value={agEntrada} onChange={e=>setAgEntrada(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Saí.</span><input type="time" value={agSaida} onChange={e=>setAgSaida(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <select value={agTipo} onChange={e=>setAgTipo(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:600}}><option value="preventivo">Preventivo</option><option value="corretivo">Corretivo</option></select>
                  <select value={agStatus} onChange={e=>setAgStatus(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}</select>
                  <BtnY onClick={addAtend}>Adicionar</BtnY>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {techsList.map(tech=>{
                  const color=techColor(tech);
                  const entries=[];
                  Object.keys(schedule).forEach(k=>{
                    const i=k.indexOf("__"); if(i<0) return;
                    const kt=k.slice(0,i), kd=k.slice(i+2);
                    if(kt!==tech||!kd.startsWith(ym)) return;
                    (schedule[k]||[]).forEach((s,si)=>{ if(matchSt(s)&&matchTipo(s)) entries.push({s,date:kd,key:k,si}); });
                  });
                  entries.sort((a,b)=>a.date.localeCompare(b.date));
                  const done=entries.filter(e=>isDone(e.s)).length;
                  return(
                    <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,overflow:"hidden"}}>
                      <div style={{padding:"12px 14px",borderBottom:"1px solid #F4F4F4"}}>
                        <div style={{fontWeight:700,fontSize:14}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                        <div style={{fontSize:11,color:"#AAA",marginTop:2}}>{entries.length} atendimento(s) · {done} concl. · {MESES[agpMonth]}</div>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {entries.length===0&&<div style={{fontSize:12,color:"#CCC",textAlign:"center",padding:"8px 0"}}>Sem atendimentos</div>}
                        {entries.map((e,ix)=>{const st=escSt(e.s.status);const dia=e.date.slice(8,10);const tipoLbl=(e.s.type||"preventivo")==="corretivo"?"Corretivo":"Preventivo";return(
                          <div key={ix} style={{padding:"8px 0",borderBottom:"1px solid #F8F8F8"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#fff",background:color,borderRadius:6,padding:"1px 7px"}}>Dia {dia||"?"}</span>
                              <span style={{fontSize:13,fontWeight:700,color:"#222",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.s.client}</span>
                              <button onClick={()=>{if(window.confirm("Remover este atendimento?")){const arr=(schedule[e.key]||[]).filter((_,j)=>j!==e.si);saveSched(e.key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:13}}>✕</button>
                            </div>
                            <div style={{fontSize:11,color:"#888",marginBottom:5}}>🏷️ {e.s.patrimonio||"—"} · <b style={{color:(e.s.type||"preventivo")==="corretivo"?"#C62828":"#1565C0"}}>{tipoLbl}</b></div>
                            <div style={{marginBottom:5}}>
                              <input type="text" value={e.s.relatorio||""} placeholder="Nº Relatório" onChange={ev=>{const arr=[...(schedule[e.key]||[])];arr[e.si]={...e.s,relatorio:ev.target.value};saveSched(e.key,arr);}} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0"}}/>
                            </div>
                            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
                              <input type="time" value={e.s.horaEntrada||""} title="Entrada" onChange={ev=>{const v=ev.target.value;const arr=[...(schedule[e.key]||[])];arr[e.si]={...e.s,horaEntrada:v,horasTrabalhadas:calcHoras(v,e.s.horaSaida)};saveSched(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <input type="time" value={e.s.horaSaida||""} title="Saída" onChange={ev=>{const v=ev.target.value;const arr=[...(schedule[e.key]||[])];arr[e.si]={...e.s,horaSaida:v,horasTrabalhadas:calcHoras(e.s.horaEntrada,v)};saveSched(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <span style={{fontSize:10,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:5,padding:"2px 6px"}}>{e.s.horasTrabalhadas||calcHoras(e.s.horaEntrada,e.s.horaSaida)||"—"}</span>
                            </div>
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <input type="date" value={e.date} onChange={ev=>{const nd=ev.target.value;if(!nd||nd===e.date)return;const oldArr=(schedule[e.key]||[]).filter((_,j)=>j!==e.si);const nk=`${tech}__${nd}`;const nArr=[...(schedule[nk]||[]),{...e.s}];saveSched(e.key,oldArr);saveSched(nk,nArr);}} style={{fontSize:10,padding:"2px 5px"}}/>
                              <select value={e.s.status||"agendada"} onChange={ev=>{const arr=[...(schedule[e.key]||[])];arr[e.si]={...e.s,status:ev.target.value};saveSched(e.key,arr);}} style={{fontSize:10,padding:"2px 5px",color:st.c,background:st.bg,fontWeight:700,borderRadius:6,border:`1px solid ${st.c}33`,flex:1}}>
                                {ESCALA_STATUS_KEYS.map(k=><option key={k} value={k}>{ESCALA_STATUS[k].l}</option>)}
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

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{fontWeight:800,fontSize:22,marginBottom:20}}>📊 Dashboard de Atendimentos</div>

            {/* ── FILTRO + GRÁFICOS ── */}
            {(()=>{
              const chartTitle={fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:1,marginBottom:12};
              const inRange=d=>{ if(dashFrom&&(!d.date||d.date<dashFrom))return false; if(dashTo&&(!d.date||d.date>dashTo))return false; return true; };
              const dashReports=agendaAtendimentos.filter(d=>(dashRegion==="todas"||d.region===dashRegion)&&inRange(d));
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
              const BLU="#1565C0",RED="#C62828",YEL="#F5C800",ORG="#C47D00";
              return(
                <>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:1}}>Filtro</span>
                    <select value={dashRegion} onChange={e=>setDashRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option>{regList.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>De</span><input type="date" value={dashFrom} onChange={e=>setDashFrom(e.target.value)} style={{fontSize:12}}/></div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:"#888",fontWeight:600}}>Até</span><input type="date" value={dashTo} onChange={e=>setDashTo(e.target.value)} style={{fontSize:12}}/></div>
                    {(dashRegion!=="todas"||dashFrom||dashTo)&&<BtnG onClick={()=>{setDashRegion("todas");setDashFrom("");setDashTo("");}}>✕ Limpar</BtnG>}
                    <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{dashReports.length} atendimento(s) no filtro</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:24}}>
                    <div className="card" style={{padding:"16px 20px"}}>
                      <div style={chartTitle}>Preventivas × Corretivas (qtd e %)</div>
                      <ChartCanvas type="doughnut" height={230}
                        data={{labels:["Preventivas","Corretivas"],datasets:[{data:[prev,corr],backgroundColor:[BLU,RED],borderWidth:0}]}}
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
                    <div style={{fontSize:32,fontWeight:700,color:"#C47D00",lineHeight:1}}>{fmtMin(totalMin)}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>horas trabalhadas</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:32,fontWeight:700,color:"#1565C0",lineHeight:1}}>{mesReps.filter(r=>r.type==="preventivo").length}</div>
                    <div style={{fontSize:12,color:"#AAA"}}>preventivos</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:32,fontWeight:700,color:"#C62828",lineHeight:1}}>{mesReps.filter(r=>r.type==="corretivo").length}</div>
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
                  <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,overflow:"hidden"}}>
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

      </div>

        {/* ── UBER ── */}
        {tab==="uber"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🚗 Pedidos Uber</div>
                <div style={{fontSize:13,color:"#888"}}>{uberPedidos.length} pedido(s) registrado(s)</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(uberPedidos,"uber_grupomov",[
                  {key:"data",label:"Data"},{key:"solicitante",label:"Solicitante"},{key:"departamento",label:"Departamento"},
                  {key:"motivo",label:"Motivo"},{key:"empresa",label:"Empresa"},{key:"relatorio",label:"Relatório"},
                  {key:"endereco",label:"Endereço"},{key:"valor",label:"Valor (R$)"},{key:"status",label:"Status"},{key:"obs",label:"Obs"}
                ])}/>
                <BtnY onClick={addUber}>+ Novo Pedido</BtnY>
              </div>
            </div>

            {uberPedidos.length===0?(
              <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                <div style={{fontSize:32,marginBottom:12}}>🚗</div>
                Nenhum pedido. Clique em "+ Novo Pedido" para começar.
              </div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th><th>Solicitante</th><th>Departamento</th><th>Motivo</th>
                        <th>Empresa</th><th>Patrimônio</th><th>Relatório</th><th>Endereço</th><th>Valor (R$)</th>
                        <th>Status</th><th>Obs</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {uberPedidos.map(p=>(
                        <tr key={p.id}>
                          <td><input type="date" value={p.data||""} onChange={e=>updateUber(p.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={p.solicitante||""} onChange={e=>updateUber(p.id,{solicitante:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px"}} placeholder="Nome"/></td>
                          <td>
                            <select value={p.departamento||"MANUTENÇÃO"} onChange={e=>updateUber(p.id,{departamento:e.target.value,motivo:e.target.value==="MANUTENÇÃO"?p.motivo:"OUTROS"})} style={{fontSize:11,padding:"3px 5px",fontWeight:600}}>
                              {["MANUTENÇÃO","RH","COMERCIAL","FROTAS","FINANCEIRO","COMPRAS","ALMOXARIFADO","FISCAL","GILBERTO","GUSTAVO"].map(d=><option key={d}>{d}</option>)}
                            </select>
                          </td>
                          <td>
                            <select value={p.motivo||""} onChange={e=>updateUber(p.id,{motivo:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>
                              <option value="">Selecione...</option>
                              {p.departamento==="MANUTENÇÃO"?<option value="ENVIO DE PEÇAS">ENVIO DE PEÇAS</option>:null}
                              <option value="OUTROS">OUTROS</option>
                            </select>
                          </td>
                          <td><input type="text" value={p.empresa||""} onChange={e=>updateUber(p.id,{empresa:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}} placeholder="Empresa"/></td>
                          <td><input type="text" value={p.patrimonio||""} onChange={e=>updateUber(p.id,{patrimonio:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}} placeholder="PAT-001"/></td>
                          <td><input type="text" value={p.relatorio||""} onChange={e=>updateUber(p.id,{relatorio:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="REL-001"/></td>
                          <td><input type="text" value={p.endereco||""} onChange={e=>updateUber(p.id,{endereco:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}} placeholder="Rua, número..."/></td>
                          <td><input type="text" value={p.valor||""} onChange={e=>updateUber(p.id,{valor:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px",textAlign:"right"}} placeholder="0,00"/></td>
                          <td>
                            <select value={p.status||"pendente"} onChange={e=>updateUber(p.id,{status:e.target.value})}
                              style={{fontSize:11,padding:"3px 5px",fontWeight:700,borderRadius:5,border:"none",
                                color:p.status==="concluido"?"#1A7A3C":p.status==="cancelado"?"#C62828":"#E67E00",
                                background:p.status==="concluido"?"#F0FFF5":p.status==="cancelado"?"#FFF0F0":"#FFF8F0"}}>
                              <option value="pendente">⏳ Pendente</option>
                              <option value="em_andamento">🚗 Em Andamento</option>
                              <option value="concluido">✅ Concluído</option>
                              <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </td>
                          <td><input type="text" value={p.obs||""} onChange={e=>updateUber(p.id,{obs:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                          <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{p.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(p.registradoEm)}</span></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir pedido?"))delUber(p.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ── FINANCEIRO ── */}
        {tab==="financeiro"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>💰 Financeiro</div>
                <div style={{fontSize:13,color:"#888"}}>{financeiro.length} lançamento(s)</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(financeiro,"financeiro_grupomov",[{key:"data",label:"Data"},{key:"ticket",label:"Ticket"},{key:"tecnico",label:"Técnico"},{key:"solicitacao",label:"Solicitação"},{key:"atendimento",label:"Atendimento"},{key:"patrimonio",label:"Patrimônio"},{key:"valor",label:"Valor"},{key:"situacao",label:"Situação"},{key:"acerto",label:"Acerto"},{key:"dataAcerto",label:"Data Acerto"},{key:"reembolso",label:"Reembolso"},{key:"valorReembolso",label:"Valor Reembolso"},{key:"ticketReembolso",label:"Ticket Reembolso"},{key:"registradoPor",label:"Registrado por"}])}/>
                <BtnY onClick={addFin}>+ Novo Lançamento</BtnY>
              </div>
            </div>

            {financeiro.length===0?(
              <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                <div style={{fontSize:32,marginBottom:12}}>💰</div>
                Nenhum lançamento. Clique em "+ Novo Lançamento".
              </div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Data</th><th>Ticket</th><th>Técnico</th><th>Solicitação</th><th>Atendimento</th><th>Patrimônio</th><th>Valor</th><th>Situação</th><th>Acerto</th><th>Data Acerto</th><th>Reembolso</th><th>Valor Reemb.</th><th>Ticket Reemb.</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                    <tbody>
                      {financeiro.map(f=>{
                        const pend=f.situacao==="pendente";
                        const semAcerto=f.acerto==="nao";
                        return(
                          <tr key={f.id}>
                            <td><input type="date" value={f.data||""} onChange={e=>updateFin(f.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><input type="text" value={f.ticket||""} onChange={e=>updateFin(f.id,{ticket:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="Ticket"/></td>
                            <td><select value={f.tecnico||""} onChange={e=>updateFin(f.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                            <td><select value={f.solicitacao||"combustivel"} onChange={e=>updateFin(f.id,{solicitacao:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:600}}><option value="combustivel">⛽ Combustível</option><option value="alimentacao">🍽️ Alimentação</option><option value="viagem">✈️ Viagem</option><option value="outros">📦 Outros</option></select></td>
                            <td><input type="text" value={f.atendimento||""} onChange={e=>updateFin(f.id,{atendimento:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}} placeholder="Atendimento"/></td>
                            <td><input type="text" value={f.patrimonio||""} onChange={e=>updateFin(f.id,{patrimonio:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}} placeholder="PAT-001"/></td>
                            <td><input type="text" value={f.valor||""} onChange={e=>updateFin(f.id,{valor:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px",textAlign:"right"}} placeholder="R$ 0,00"/></td>
                            <td><select value={f.situacao||"pendente"} onChange={e=>updateFin(f.id,{situacao:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:pend?"#C62828":"#1A7A3C",background:pend?"#FFF0F0":"#F0FFF5"}}><option value="pago">✅ Pago</option><option value="pendente">⏳ Pendente</option></select></td>
                            <td><select value={f.acerto||"nao"} onChange={e=>updateFin(f.id,{acerto:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:semAcerto?"#C62828":"#1A7A3C",background:semAcerto?"#FFF0F0":"#F0FFF5"}}><option value="sim">Sim</option><option value="nao">Não</option></select></td>
                            <td><input type="date" value={f.dataAcerto||""} onChange={e=>updateFin(f.id,{dataAcerto:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                            <td><select value={f.reembolso||"nao"} onChange={e=>updateFin(f.id,{reembolso:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:600}}><option value="sim">Sim</option><option value="nao">Não</option></select></td>
                            <td><input type="text" value={f.valorReembolso||""} onChange={e=>updateFin(f.id,{valorReembolso:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px",textAlign:"right"}} placeholder="R$ 0,00"/></td>
                            <td><input type="text" value={f.ticketReembolso||""} onChange={e=>updateFin(f.id,{ticketReembolso:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="Ticket"/></td>
                            <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{f.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(f.registradoEm)}</span></td>
                            {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir este lançamento?"))delFin(f.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PENDÊNCIAS FROTA ── */}
        {tab==="pendencias_frota"&&(()=>{
          const list=frota.filter(r=>showArqFro||!r.arquivado);
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🚜 Pendências Frota</div><div style={{fontSize:13,color:"#888"}}>{list.length} pendência(s)</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqFro(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqFro?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqFro?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>froCrud.add({dataEnvio:TODAY_STR,rel:"",empresa:"",tecnico:ALL_TECHS[0],pat:"",patTipo:"bateria",resolvido:"nao",novoPat:"",data:"",nf:"",relEntrega:""})}>+ Nova Pendência</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma pendência.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data Envio</th><th>Rel</th><th>Empresa</th><th>Técnico</th><th>PAT</th><th>Tipo</th><th>Resolvido</th><th>Novo PAT</th><th>Data</th><th>NF</th><th>Rel Entrega</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>{list.map(r=>{const ok=r.resolvido==="sim";return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.dataEnvio||""} onChange={e=>froCrud.update(r.id,{dataEnvio:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.rel||""} onChange={e=>froCrud.update(r.id,{rel:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="REL-001"/></td>
                      <td><input type="text" value={r.empresa||""} onChange={e=>froCrud.update(r.id,{empresa:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><select value={r.tecnico||""} onChange={e=>froCrud.update(r.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                      <td><input type="text" value={r.pat||""} onChange={e=>froCrud.update(r.id,{pat:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="PAT-001"/></td>
                      <td><select value={r.patTipo||"bateria"} onChange={e=>froCrud.update(r.id,{patTipo:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:600}}><option value="bateria">🔋 Bateria</option><option value="carregador">🔌 Carregador</option><option value="estrado">🟫 Estrado</option><option value="maquina">🏗️ Máquina</option></select></td>
                      <td><select value={r.resolvido||"nao"} onChange={e=>froCrud.update(r.id,{resolvido:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:ok?"#1A7A3C":"#C62828",background:ok?"#F0FFF5":"#FFF0F0"}}><option value="sim">Sim</option><option value="nao">Não</option></select></td>
                      <td><input type="text" value={r.novoPat||""} onChange={e=>froCrud.update(r.id,{novoPat:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="—"/></td>
                      <td><input type="date" value={r.data||""} onChange={e=>froCrud.update(r.id,{data:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><input type="text" value={r.nf||""} onChange={e=>froCrud.update(r.id,{nf:e.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}} placeholder="NF"/></td>
                      <td><input type="text" value={r.relEntrega||""} onChange={e=>froCrud.update(r.id,{relEntrega:e.target.value})} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="—"/></td>
                      <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      {user.canDelete&&<td style={{whiteSpace:"nowrap"}}><button onClick={()=>froCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))froCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
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
                  <thead><tr><th>Data</th><th>Empresa</th><th>PAT</th><th>Motivo da Contestação</th><th>Email/WhatsApp</th><th>Responsável</th><th>Status</th><th>Data Resolução</th><th>Observação</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
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
                      {user.canDelete&&<td style={{whiteSpace:"nowrap"}}><button onClick={()=>priCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))priCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

        {/* ── RH-FISCAL (somente Manuela) ── */}
        {tab==="rh_fiscal"&&user.id==="manuela"&&(()=>{
          const list=rhFiscal.filter(r=>showArqRh||!r.arquivado);
          const MOT={folga:"Folga",falta:"Falta",atestado:"Atestado",ferias:"Férias",acesso_tecnico:"Acesso Técnico",treinamento:"Treinamento",sala_reuniao:"Separar Sala de Reunião",demissao:"Demissão",promocao:"Promoção",liberacao:"Liberação"};
          const STS={concluido:"Concluído",pendente_luana:"Pendente Luana",pendente_elci:"Pendente Elci",escalado:"Escalado"};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🧾 RH-Fiscal</div><div style={{fontSize:13,color:"#888"}}>{list.length} item(ns) · visível só para você</div></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowArqRh(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqRh?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqRh?"✓ Arquivados":"📁 Ver Arquivados"}</button>
                  <BtnY onClick={()=>rhCrud.add({dataEnvio:TODAY_STR,responsavel:"Luana",motivo:"folga",funcionario:"",status:"pendente_luana",obs:""})}>+ Novo Item</BtnY>
                </div>
              </div>
              {list.length===0?(<div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhum item.</div>):(
                <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
                  <thead><tr><th>Data de Envio</th><th>Responsável</th><th>Motivo</th><th>Funcionário</th><th>Status</th><th>Observação</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>{list.map(r=>{const conc=r.status==="concluido";return(
                    <tr key={r.id} style={{opacity:r.arquivado?.5:1}}>
                      <td><input type="date" value={r.dataEnvio||""} onChange={e=>rhCrud.update(r.id,{dataEnvio:e.target.value})} style={{width:140,fontSize:11,padding:"3px 6px"}}/></td>
                      <td><select value={r.responsavel||"Luana"} onChange={e=>rhCrud.update(r.id,{responsavel:e.target.value})} style={{fontSize:11,padding:"3px 6px"}}><option>Luana</option><option>Elci</option></select></td>
                      <td><select value={r.motivo||"folga"} onChange={e=>rhCrud.update(r.id,{motivo:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:600}}>{Object.entries(MOT).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.funcionario||""} onChange={e=>rhCrud.update(r.id,{funcionario:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}} placeholder="Nome do funcionário"/></td>
                      <td><select value={r.status||"pendente_luana"} onChange={e=>rhCrud.update(r.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",fontWeight:700,borderRadius:5,border:"none",color:conc?"#1A7A3C":"#C47D00",background:conc?"#F0FFF5":"#FFFBF0",minWidth:140}}>{Object.entries(STS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
                      <td><input type="text" value={r.obs||""} onChange={e=>rhCrud.update(r.id,{obs:e.target.value})} style={{width:220,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                      <td style={{fontSize:10,color:"#888",lineHeight:1.3,whiteSpace:"nowrap"}}>{r.registradoPor||"—"}<br/><span style={{color:"#BBB"}}>{fmtDateTime(r.registradoEm)}</span></td>
                      {user.canDelete&&<td style={{whiteSpace:"nowrap"}}><button onClick={()=>rhCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))rhCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
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
                  <thead><tr><th>Data</th><th>Prioridade</th><th>Solicitação</th><th>Empresa</th><th>Demanda</th><th>Status</th><th>Observações</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
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
                      {user.canDelete&&<td style={{whiteSpace:"nowrap"}}><button onClick={()=>gusCrud.update(r.id,{arquivado:!r.arquivado})} title="Arquivar" style={{background:"#F5F5F5",border:"none",borderRadius:5,cursor:"pointer",padding:"3px 6px",fontSize:11,marginRight:3}}>🗄️</button><button onClick={()=>{if(window.confirm("Excluir?"))gusCrud.del(r.id);}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                    </tr>);})}</tbody>
                </table></div></div>
              )}
            </div>
          );
        })()}

      {/* ── DASHBOARD REQUISIÇÕES ── */}
        {tab==="dashboard_req"&&(()=>{
          const allReqs=[...emprestimos,...saidaEntrada];
          const totalEmp=emprestimos.length;
          const totalSai=saidaEntrada.length;
          const total=allReqs.length;
          // Rupturas (saída/entrada)
          const rupturas=saidaEntrada.filter(s=>s.statusReq==="ruptura");
          const rupturasInfo=rupturas.map(s=>({peca:s.peca||s.descricao||"—",empresa:s.empresa||"—",dias:s.data?diffDays(s.data):null,codigo:s.codigo||"—"}));
          // Atendidos
          const atendidos=saidaEntrada.filter(s=>s.statusReq==="atendido").length;
          // Pendentes
          const pendentes=emprestimos.filter(e=>(e.statusEmp||"pendente")==="pendente").length + saidaEntrada.filter(s=>(s.statusFinal||"pendente")==="pendente").length;
          const concluidos=emprestimos.filter(e=>e.statusEmp==="concluido").length + saidaEntrada.filter(s=>s.statusFinal==="concluido").length;
          // Por técnico (requerente)
          const byTech={};
          emprestimos.forEach(e=>{const t=e.requerente||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          saidaEntrada.forEach(s=>{const t=s.requerente||s.empresa||"Sem técnico";byTech[t]=(byTech[t]||0)+1;});
          // Peças aplicadas por relatório
          const pecasAplicadas=saidaEntrada.filter(s=>s.relatorioAplicado).map(s=>({rel:s.relatorioAplicado,peca:s.peca||s.descricao||"—",empresa:s.empresa||"—"}));
          const empPecasAplicadas=emprestimos.filter(e=>e.relatorioAplicado).map(e=>({rel:e.relatorioAplicado,peca:e.descricao||"—",empresa:e.requerente||"—"}));
          const todasPecasAplicadas=[...pecasAplicadas,...empPecasAplicadas];
          // Gráfico: status empréstimos
          const chartStatusEmpData={labels:["Pendente","Concluído"],datasets:[{data:[emprestimos.filter(e=>(e.statusEmp||"pendente")==="pendente").length,emprestimos.filter(e=>e.statusEmp==="concluido").length],backgroundColor:["#FFF0F0","#F0FFF5"],borderColor:["#C62828","#1A7A3C"],borderWidth:2}]};
          // Gráfico: status saída/entrada
          const chartStatusSaiData={labels:["Ruptura","Atendido","Pendente","Concluído"],datasets:[{data:[rupturas.length,atendidos,saidaEntrada.filter(s=>(s.statusFinal||"pendente")==="pendente").length,saidaEntrada.filter(s=>s.statusFinal==="concluido").length],backgroundColor:["#FFF0F0","#F0FFF5","#FFF8F0","#F0F4FF"],borderColor:["#C62828","#1A7A3C","#E67E00","#1565C0"],borderWidth:2}]};
          // Gráfico: por técnico
          const techLabels=Object.keys(byTech);
          const techValues=techLabels.map(t=>byTech[t]);
          const chartTechData={labels:techLabels,datasets:[{label:"Requisições",data:techValues,backgroundColor:"#F5C800",borderColor:"#C47D00",borderWidth:1,borderRadius:4}]};

          const KPI=({label,value,color="#1A1A1A",bg="#FFF",icon})=>(
            <div className="card" style={{padding:"16px 20px",background:bg,display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>{icon} {label}</div>
              <div style={{fontSize:32,fontWeight:800,color,lineHeight:1}}>{value}</div>
            </div>
          );
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{fontWeight:800,fontSize:22,marginBottom:16}}>📊 Dashboard Requisições</div>

              {/* KPIs */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
                <KPI icon="📦" label="Total Requisições" value={total}/>
                <KPI icon="🔄" label="Empréstimo e Retorno" value={totalEmp}/>
                <KPI icon="📤" label="Entrada/Saída" value={totalSai}/>
                <KPI icon="🔴" label="Rupturas" value={rupturas.length} color="#C62828" bg="#FFF0F0"/>
                <KPI icon="✅" label="Concluídos" value={concluidos} color="#1A7A3C" bg="#F0FFF5"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                <KPI icon="⏳" label="Pendentes" value={pendentes} color="#E67E00" bg="#FFF8F0"/>
                <KPI icon="✅" label="Atendidos (S/E)" value={atendidos} color="#1A7A3C" bg="#F0FFF5"/>
                <KPI icon="🔧" label="Peças Aplicadas c/ Relatório" value={todasPecasAplicadas.length}/>
              </div>

              {/* Gráficos */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>Status — Empréstimo e Retorno</div>
                  <ChartCanvas type="doughnut" data={chartStatusEmpData} options={{plugins:{legend:{position:"bottom"}},cutout:"65%"}} height={200}/>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>Status — Entrada/Saída</div>
                  <ChartCanvas type="doughnut" data={chartStatusSaiData} options={{plugins:{legend:{position:"bottom"}},cutout:"65%"}} height={200}/>
                </div>
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>Requisições por Técnico/Requerente</div>
                  <ChartCanvas type="bar" data={chartTechData} options={{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}},indexAxis:"y"}} height={200}/>
                </div>
              </div>

              {/* Rupturas detalhadas */}
              {rupturas.length>0&&(
                <div className="card" style={{padding:16,marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#C62828",marginBottom:10}}>🔴 Rupturas — Detalhamento ({rupturas.length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Peça</th><th>Código</th><th>Empresa</th><th>Data</th><th>SLA (dias em ruptura)</th></tr></thead>
                    <tbody>{rupturasInfo.map((r,i)=>(
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{r.peca}</td>
                        <td style={{fontSize:11,color:"#888"}}>{r.codigo}</td>
                        <td>{r.empresa}</td>
                        <td style={{fontSize:11,color:"#888"}}>{rupturas[i]?.data||"—"}</td>
                        <td><SlaBadge days={r.dias}/></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {/* Peças aplicadas por relatório */}
              {todasPecasAplicadas.length>0&&(
                <div className="card" style={{padding:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>🔧 Peças Aplicadas por Relatório ({todasPecasAplicadas.length})</div>
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Relatório</th><th>Peça</th><th>Empresa/Requerente</th></tr></thead>
                    <tbody>{todasPecasAplicadas.map((p,i)=>(
                      <tr key={i}>
                        <td style={{fontWeight:700,color:"#1565C0"}}>{p.rel}</td>
                        <td>{p.peca}</td>
                        <td style={{fontSize:11,color:"#888"}}>{p.empresa}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}
              {todasPecasAplicadas.length===0&&rupturas.length===0&&total===0&&(
                <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>
                  <div style={{fontSize:32,marginBottom:12}}>📊</div>
                  Nenhuma requisição cadastrada ainda.
                </div>
              )}
            </div>
          );
        })()}

        {/* ── SAS ── */}
        {tab==="sas"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📄 SAS</div><div style={{fontSize:13,color:"#888"}}>{sas.length} registro(s)</div></div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(sas,"sas_grupomov",[{key:"dataSolicitacao",label:"Data Solicitação"},{key:"email",label:"E-mail"},{key:"nfNum",label:"Nº NF"},{key:"equipamento",label:"Equipamento"},{key:"cliente",label:"Cliente"},{key:"nome",label:"Nome"},{key:"tel",label:"Tel"},{key:"emailContato",label:"Email Contato"},{key:"servico",label:"Serviço"},{key:"dataRealizacao",label:"Data Realização"},{key:"relatorioMov",label:"Relatório MOV"},{key:"envioFaturamento",label:"Envio Faturamento"},{key:"valor",label:"Valor"},{key:"status",label:"Status"},{key:"dataEnvioSas",label:"Data Envio SAS"}])}/>
                <BtnY onClick={addSas}>+ Novo SAS</BtnY>
              </div>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data Solic.</th><th>E-mail</th><th>Nº NF</th><th>Equipamento</th><th>Cliente</th><th>Nome</th><th>Tel</th><th>Email Contato</th><th>Serviço</th><th>Data Realização</th><th>Relatório MOV</th><th>Envio Faturamento</th><th>Valor</th><th>Status</th><th>SLA / Data Envio SAS</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {sas.length===0&&<tr><td colSpan={17} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo SAS".</td></tr>}
                    {sas.map(s=>{
                      const isPend=s.status==="pendente";
                      const slaVal=isPend&&s.dataSolicitacao?diffDays(s.dataSolicitacao):null;
                      return(
                        <tr key={s.id}>
                          <td><input type="date" value={s.dataSolicitacao||""} onChange={e=>updateSas(s.id,{dataSolicitacao:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.email||""} onChange={e=>updateSas(s.id,{email:e.target.value})} placeholder="email@..." style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.nfNum||""} onChange={e=>updateSas(s.id,{nfNum:e.target.value})} placeholder="NF-001" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.equipamento||""} onChange={e=>updateSas(s.id,{equipamento:e.target.value})} placeholder="Equipamento" style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.cliente||""} onChange={e=>updateSas(s.id,{cliente:e.target.value})} placeholder="Cliente" style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.nome||""} onChange={e=>updateSas(s.id,{nome:e.target.value})} placeholder="Nome" style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.tel||""} onChange={e=>updateSas(s.id,{tel:e.target.value})} placeholder="Tel" style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.emailContato||""} onChange={e=>updateSas(s.id,{emailContato:e.target.value})} placeholder="email@..." style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={s.servico||"entrega_tecnica"} onChange={e=>updateSas(s.id,{servico:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:600,color:"#1565C0"}}><option value="entrega_tecnica">📦 Entrega Técnica</option><option value="manutencao_externa">🔧 Manutenção Externa</option></select></td>
                          <td><input type="date" value={s.dataRealizacao||""} onChange={e=>updateSas(s.id,{dataRealizacao:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.relatorioMov||""} onChange={e=>updateSas(s.id,{relatorioMov:e.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.envioFaturamento||""} onChange={e=>updateSas(s.id,{envioFaturamento:e.target.value})} placeholder="Info..." style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={s.valor||""} onChange={e=>updateSas(s.id,{valor:e.target.value})} placeholder="0,00" style={{width:80,fontSize:11,padding:"3px 6px",textAlign:"right"}}/></td>
                          <td><select value={s.status||"pendente"} onChange={e=>updateSas(s.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:700,borderRadius:5,border:"none",color:s.status==="concluido"?"#1A7A3C":"#C62828",background:s.status==="concluido"?"#F0FFF5":"#FFF0F0"}}><option value="pendente">⏳ Pendente</option><option value="concluido">✅ Concluído</option></select></td>
                          <td>{isPend?<SlaBadge days={slaVal}/>:<input type="date" value={s.dataEnvioSas||""} onChange={e=>updateSas(s.id,{dataEnvioSas:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/>}</td>
                          <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{s.registradoPor||"—"}</td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))delSas(s.id);}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CARROS ── */}
        {tab==="carros"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🚙 Carros</div><div style={{fontSize:13,color:"#888"}}>{carros.length} registro(s)</div></div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(carros,"carros_grupomov",[{key:"data",label:"Data"},{key:"placa",label:"Placa"},{key:"tecnico",label:"Técnico"},{key:"manutencao",label:"Manutenção"},{key:"valor",label:"Valor"},{key:"aprovadoGustavo",label:"Aprovado Gustavo"},{key:"dataExecucao",label:"Data Execução"},{key:"oficina",label:"Oficina"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={addCarro}>+ Novo Registro</BtnY>
              </div>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Placa</th><th>Técnico</th><th>Manutenção</th><th>Valor</th><th>Aprov. Gustavo</th><th>Data Execução</th><th>Oficina</th><th>Observações</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {carros.length===0&&<tr><td colSpan={11} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Registro".</td></tr>}
                    {carros.map(c=>(
                      <tr key={c.id}>
                        <td><input type="date" value={c.data||""} onChange={e=>updateCarro(c.id,{data:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="text" value={c.placa||""} onChange={e=>updateCarro(c.id,{placa:e.target.value})} placeholder="ABC-1234" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><select value={c.tecnico||ALL_TECHS[0]} onChange={e=>updateCarro(c.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{[...ALL_TECHS,...OFICINA_TECHS].map(t=><option key={t}>{t}</option>)}</select></td>
                        <td><input type="text" value={c.manutencao||""} onChange={e=>updateCarro(c.id,{manutencao:e.target.value})} placeholder="Descreva a manutenção..." style={{width:180,fontSize:11,padding:"3px 6px"}}/></td>
                        <td><input type="text" value={c.valor||""} onChange={e=>updateCarro(c.id,{valor:e.target.value})} placeholder="0,00" style={{width:80,fontSize:11,padding:"3px 6px",textAlign:"right"}}/></td>
                        <td><select value={c.aprovadoGustavo||"nao"} onChange={e=>updateCarro(c.id,{aprovadoGustavo:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:700,borderRadius:5,border:"none",color:c.aprovadoGustavo==="sim"?"#1A7A3C":"#C62828",background:c.aprovadoGustavo==="sim"?"#F0FFF5":"#FFF0F0"}}><option value="nao">❌ Não</option><option value="sim">✅ Sim</option></select></td>
                        <td>{c.aprovadoGustavo==="sim"?<input type="date" value={c.dataExecucao||""} onChange={e=>updateCarro(c.id,{dataExecucao:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                        <td>{c.aprovadoGustavo==="sim"?<input type="text" value={c.oficina||""} onChange={e=>updateCarro(c.id,{oficina:e.target.value})} placeholder="Oficina..." style={{width:120,fontSize:11,padding:"3px 6px"}}/>:<span style={{color:"#CCC",fontSize:11}}>—</span>}</td>
                        <td><input type="text" value={c.obs||""} onChange={e=>updateCarro(c.id,{obs:e.target.value})} placeholder="Obs..." style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                        <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{c.registradoPor||"—"}</td>
                        {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))delCarro(c.id);}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── APONTAMENTOS OFICINA 150 ── */}
        {tab==="apontamentos_150"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📝 Apontamentos Oficina 150</div><div style={{fontSize:13,color:"#888"}}>{apontamentos150.length} registro(s) · Matheus, Pedro Souza, Pedro Pimentel</div></div>
              <div style={{display:"flex",gap:8}}>
                <BtnExcel onClick={()=>exportCSV(apontamentos150,"apontamentos_150",[{key:"data",label:"Data"},{key:"os",label:"OS"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"servico",label:"Serviço"},{key:"inicio",label:"Início"},{key:"termino",label:"Término"},{key:"total",label:"Total"},{key:"relatorio",label:"Relatório"},{key:"obs",label:"Obs"}])}/>
                <BtnY onClick={addApon150}>+ Novo Apontamento</BtnY>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input type="date" value={ofi150Data} onChange={e=>setOfi150Data(e.target.value)} style={{fontSize:12}}/>
              <input type="text" value={ofi150OS} onChange={e=>setOfi150OS(e.target.value)} placeholder="🔍 OS" style={{width:100,fontSize:12}}/>
              <input type="text" value={ofi150Pat} onChange={e=>setOfi150Pat(e.target.value)} placeholder="🔍 Patrimônio" style={{width:130,fontSize:12}}/>
              <select value={ofi150Tech} onChange={e=>setOfi150Tech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={ofi150Serv} onChange={e=>setOfi150Serv(e.target.value)} style={{fontSize:12}}><option value="todos">Todos serviços</option>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div className="card" style={{overflow:"hidden"}}><div className="tbl-wrap"><table>
              <thead><tr><th>Data</th><th>OS</th><th>Patrimônio</th><th>Técnico</th><th>Serviço</th><th>Início</th><th>Término</th><th>Total</th><th>Relatório</th><th>Obs</th><th>Registrado por</th>{user.canDelete&&<th>✕</th>}</tr></thead>
              <tbody>
                {apontamentos150.filter(a=>{
                  if(ofi150Data&&a.data!==ofi150Data)return false;
                  if(ofi150OS&&!(a.os||"").toLowerCase().includes(ofi150OS.toLowerCase()))return false;
                  if(ofi150Pat&&!(a.patrimonio||"").toLowerCase().includes(ofi150Pat.toLowerCase()))return false;
                  if(ofi150Tech!=="todos"&&a.tecnico!==ofi150Tech)return false;
                  if(ofi150Serv!=="todos"&&a.servico!==ofi150Serv)return false;
                  return true;
                }).map(a=>(
                  <tr key={a.id}>
                    <td><input type="date" value={a.data||""} onChange={e=>updateApon150(a.id,{data:e.target.value})} style={{width:130,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><input type="text" value={a.os||""} onChange={e=>updateApon150(a.id,{os:e.target.value})} placeholder="OS-001" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><input type="text" value={a.patrimonio||""} onChange={e=>updateApon150(a.id,{patrimonio:e.target.value})} placeholder="PAT-001" style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><select value={a.tecnico||"Matheus"} onChange={e=>updateApon150(a.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                    <td><select value={a.servico||SERVICOS_OFICINA[0]} onChange={e=>updateApon150(a.id,{servico:e.target.value})} style={{fontSize:11,padding:"3px 5px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select></td>
                    <td><input type="time" value={a.inicio||""} onChange={e=>{const v=e.target.value;updateApon150(a.id,{inicio:v,total:calcHoras(v,a.termino)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><input type="time" value={a.termino||""} onChange={e=>{const v=e.target.value;updateApon150(a.id,{termino:v,total:calcHoras(a.inicio,v)});}} style={{width:95,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><span style={{display:"inline-block",minWidth:54,fontSize:12,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:6,padding:"4px 8px"}}>{a.total||calcHoras(a.inicio,a.termino)||"—"}</span></td>
                    <td><input type="text" value={a.relatorio||""} onChange={e=>updateApon150(a.id,{relatorio:e.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                    <td><input type="text" value={a.obs||""} onChange={e=>updateApon150(a.id,{obs:e.target.value})} placeholder="Obs..." style={{width:120,fontSize:11,padding:"3px 6px"}}/></td>
                    <td style={{fontSize:10,color:"#888",whiteSpace:"nowrap"}}>{a.registradoPor||"—"}</td>
                    {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))delApon150(a.id);}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
                  </tr>
                ))}
                {apontamentos150.length===0&&<tr><td colSpan={12} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum apontamento. Clique em "+ Novo Apontamento".</td></tr>}
              </tbody>
            </table></div></div>
          </div>
        )}

        {/* ── AGENDA OFICINA 150 ── */}
        {tab==="agenda_ofi_150"&&(()=>{
          const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const ym=`${agOfi150Year}-${String(agOfi150Month+1).padStart(2,"0")}`;
          const addAtend150=()=>{
            const dataFinal=agOfi150Date||`${ym}-01`;
            if(!agOfi150Empresa){alert("Preencha ao menos a Empresa.");return;}
            const key=`${agOfi150TechSel}__${dataFinal}`;
            saveAgendaOfi150(key,[...(agendaOfi150[key]||[]),{client:agOfi150Empresa,patrimonio:agOfi150Pat||"",servico:agOfi150ServSel,status:"agendada",horaEntrada:agOfi150Entrada,horaSaida:agOfi150Saida,horasTrabalhadas:calcHoras(agOfi150Entrada,agOfi150Saida),obs:agOfi150Obs,relatorio:agOfi150Relatorio||""}]);
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
              <div className="card" style={{padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>➕ Novo atendimento</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={agOfi150TechSel} onChange={e=>setAgOfi150TechSel(e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>{OFICINA_150_TECHS.map(t=><option key={t}>{t}</option>)}</select>
                  <input type="date" value={agOfi150Date||`${ym}-01`} onChange={e=>setAgOfi150Date(e.target.value)} style={{fontSize:12,padding:"6px 8px"}}/>
                  <input type="text" placeholder="Empresa/Serviço" value={agOfi150Empresa} onChange={e=>setAgOfi150Empresa(e.target.value)} style={{fontSize:12,padding:"7px 8px",flex:1,minWidth:140}}/>
                  <input type="text" placeholder="Patrimônio" value={agOfi150Pat} onChange={e=>setAgOfi150Pat(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <select value={agOfi150ServSel} onChange={e=>setAgOfi150ServSel(e.target.value)} style={{fontSize:12,padding:"7px 8px",fontWeight:600,color:"#1565C0"}}>{SERVICOS_OFICINA.map(s=><option key={s}>{s}</option>)}</select>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Ent.</span><input type="time" value={agOfi150Entrada} onChange={e=>setAgOfi150Entrada(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888"}}>Saí.</span><input type="time" value={agOfi150Saida} onChange={e=>setAgOfi150Saida(e.target.value)} style={{fontSize:12,padding:"6px 6px"}}/></div>
                  <input type="text" placeholder="Obs..." value={agOfi150Obs} onChange={e=>setAgOfi150Obs(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <input type="text" placeholder="Nº Relatório" value={agOfi150Relatorio||""} onChange={e=>setAgOfi150Relatorio(e.target.value)} style={{fontSize:12,padding:"7px 8px",minWidth:100}}/>
                  <BtnY onClick={addAtend150}>Adicionar</BtnY>
                </div>
              </div>
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
                    <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,overflow:"hidden"}}>
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
                              <button onClick={()=>{if(window.confirm("Remover?")){const arr=(agendaOfi150[e.key]||[]).filter((_,j)=>j!==e.si);saveAgendaOfi150(e.key,arr);}}} style={{background:"none",border:"none",color:"#D33",cursor:"pointer",fontSize:13}}>✕</button>
                            </div>
                            <div style={{fontSize:11,color:"#888",marginBottom:4}}>🏷️ {e.s.patrimonio||"—"} · <b style={{color:"#1565C0"}}>{e.s.servico||"—"}</b></div>
                            <div style={{marginBottom:4}}><input type="text" value={e.s.relatorio||""} placeholder="Nº Relatório" onChange={ev=>{const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,relatorio:ev.target.value};saveAgendaOfi150(e.key,arr);}} style={{width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5,border:"1px solid #E0E0E0"}}/></div>
                            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                              <input type="time" value={e.s.horaEntrada||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,horaEntrada:v,horasTrabalhadas:calcHoras(v,e.s.horaSaida)};saveAgendaOfi150(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <input type="time" value={e.s.horaSaida||""} onChange={ev=>{const v=ev.target.value;const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,horaSaida:v,horasTrabalhadas:calcHoras(e.s.horaEntrada,v)};saveAgendaOfi150(e.key,arr);}} style={{fontSize:10,padding:"2px 4px",width:78}}/>
                              <span style={{fontSize:10,fontWeight:700,color:"#C47D00",background:"#FFFBF0",border:"1px solid #FFE8A0",borderRadius:5,padding:"2px 6px"}}>{e.s.horasTrabalhadas||calcHoras(e.s.horaEntrada,e.s.horaSaida)||"—"}</span>
                            </div>
                            {e.s.obs&&<div style={{fontSize:10,color:"#888",fontStyle:"italic",marginBottom:4}}>{e.s.obs}</div>}
                            <select value={e.s.status||"agendada"} onChange={ev=>{const arr=[...(agendaOfi150[e.key]||[])];arr[e.si]={...e.s,status:ev.target.value};saveAgendaOfi150(e.key,arr);}} style={{fontSize:10,padding:"2px 5px",fontWeight:700,borderRadius:6,border:"1px solid #E0E0E0",width:"100%"}}>
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
          const parseMin=h=>{if(!h)return 0;const m=String(h).match(/^(\d+)[hH:](\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
          const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"0h00";
          const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
          const apMes=apontamentos150.filter(a=>a.data&&a.data.startsWith(mesAtual));
          const totalMin=apMes.reduce((acc,a)=>acc+parseMin(a.total||calcHoras(a.inicio,a.termino)),0);
          const agAtend=[];
          Object.keys(agendaOfi150).forEach(k=>{const i=k.indexOf("__");if(i<0)return;const kt=k.slice(0,i),kd=k.slice(i+2);if(!kd.startsWith(ym))return;(agendaOfi150[k]||[]).forEach(s=>agAtend.push({tech:kt,date:kd,servico:s.servico,status:s.status,horas:s.horasTrabalhadas||calcHoras(s.horaEntrada,s.horaSaida)}));});
          const concluidos=agAtend.filter(a=>a.status==="concluida").length;
          const techHorasData={labels:OFICINA_150_TECHS,datasets:[{label:"Horas",data:OFICINA_150_TECHS.map(t=>+(apMes.filter(a=>a.tecnico===t).reduce((a,r)=>a+parseMin(r.total||calcHoras(r.inicio,r.termino)),0)/60).toFixed(1)),backgroundColor:"#F5C800",borderRadius:4}]};
          const byServ={}; SERVICOS_OFICINA.forEach(s=>{byServ[s]=apMes.filter(a=>a.servico===s).length;});
          const servData={labels:SERVICOS_OFICINA,datasets:[{label:"Qtd",data:SERVICOS_OFICINA.map(s=>byServ[s]),backgroundColor:["#1565C0","#C62828","#E67E00","#F5C800","#1A7A3C","#00838F","#AD1457","#6A1B9A","#4E342E"],borderRadius:4}]};
          return(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{fontWeight:800,fontSize:22,marginBottom:16}}>📊 Dashboard Oficina 150 — {MESES[agOfi150Month]} {agOfi150Year}</div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <select value={agOfi150Month} onChange={e=>setAgOfi150Month(Number(e.target.value))} style={{fontSize:12}}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                <select value={agOfi150Year} onChange={e=>setAgOfi150Year(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {[{l:"Apontamentos (mês)",v:apMes.length,c:"#1A1A1A"},{l:"Horas Totais (mês)",v:fmtMin(totalMin),c:"#C47D00"},{l:"Agendados",v:agAtend.length,c:"#1565C0"},{l:"Concluídos",v:concluidos,c:"#1A7A3C"}].map((s,i)=>(
                  <div key={i} className="card" style={{padding:"16px 20px",borderTop:`3px solid ${s.c}`}}>
                    <div style={{fontSize:10,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
                    <div style={{fontSize:28,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                <div className="card" style={{padding:16}}><div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>⏱ Horas por Técnico</div><ChartCanvas type="bar" data={techHorasData} options={{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}},maintainAspectRatio:false}} height={160}/></div>
                <div className="card" style={{padding:16}}><div style={{fontSize:12,fontWeight:800,color:"#555",marginBottom:10}}>🔧 Serviços Realizados</div><ChartCanvas type="bar" data={servData} options={{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}},maintainAspectRatio:false}} height={240}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {OFICINA_150_TECHS.map(tech=>{
                  const color=techColor(tech);
                  const techAp=apMes.filter(a=>a.tecnico===tech);
                  const totalM=techAp.reduce((a,r)=>a+parseMin(r.total||calcHoras(r.inicio,r.termino)),0);
                  return(<div key={tech} className="card" style={{borderTop:`3px solid ${color}`,padding:"14px 16px"}}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:8}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                    <div style={{fontSize:11,color:"#AAA",marginBottom:4}}>Horas: <b style={{color:"#C47D00"}}>{fmtMin(totalM)}</b></div>
                    <div style={{fontSize:11,color:"#AAA",marginBottom:4}}>Apontamentos: <b>{techAp.length}</b></div>
                    <div style={{fontSize:11,color:"#AAA"}}>Serviços: {[...new Set(techAp.map(a=>a.servico))].join(", ")||"—"}</div>
                  </div>);
                })}
              </div>
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

      {modalReport&&<ReportModal onClose={()=>setModalReport(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setReports(p=>[dd,...p]);db.save("relatorios",dd.id,dd);notify("✅ Relatório salvo!");}}/>}
      {modalOfi&&<ReportModal techs={OFICINA_TECHS} onClose={()=>setModalOfi(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setOficina(p=>[dd,...p]);db.save("oficina",dd.id,dd);notify("✅ Relatório (Oficina) salvo!");}}/>}
      {modalImportOfi&&<ImportExcelModal onClose={()=>setModalImportOfi(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setOficina(p=>[...stamp,...p]);stamp.forEach(d=>db.save("oficina",d.id,d));setModalImportOfi(false);notify(`✅ ${stamp.length} importado(s)!`);}}/>}
      {modalUsers&&<UsersModal users={users} onClose={()=>setModalUsers(false)} onSaveUser={saveUser} onDeleteUser={deleteUser}/>}
      {modalImport&&<ImportExcelModal onClose={()=>setModalImport(false)} onImport={novos=>{const stamp=novos.map(d=>({...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()}));setReports(p=>[...stamp,...p]);stamp.forEach(d=>db.save("relatorios",d.id,d));setModalImport(false);notify(`✅ ${stamp.length} relatório(s) importado(s)!`);}}/>}
      {modalMU&&<ProcessoModal onClose={()=>setModalMU(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setProcessosMU(p=>[dd,...p]);db.save("processos_mu",dd.id,dd);notify("✅ Processo Mau Uso salvo!");}} tipo="mau_uso"/>}
      {modalAF&&<ProcessoModal onClose={()=>setModalAF(false)} onSave={d=>{const dd={...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};setProcessosAF(p=>[dd,...p]);db.save("processos_af",dd.id,dd);notify("✅ Processo A Faturar salvo!");}} tipo="a_faturar"/>}
      {modalEmp&&<EmpModal onClose={()=>{setModalEmp(false);setEditEmp(null);}} onSave={d=>{const dd=editEmp?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editEmp)setEmprestimos(p=>p.map(x=>x.id===dd.id?dd:x));else setEmprestimos(p=>[dd,...p]);db.save("emprestimos",dd.id,dd);notify("✅ Salvo!");}} initial={editEmp}/>}
      {modalSaida&&<SaidaModal onClose={()=>{setModalSaida(false);setEditSaida(null);}} onSave={d=>{const dd=editSaida?d:{...d,registradoPor:d.registradoPor||user.name,registradoEm:d.registradoEm||new Date().toISOString()};if(editSaida)setSaidaEntrada(p=>p.map(x=>x.id===dd.id?dd:x));else setSaidaEntrada(p=>[dd,...p]);db.save("saida_entrada",dd.id,dd);notify("✅ Salvo!");}} initial={editSaida}/>}
    </div>
  );
}

    
