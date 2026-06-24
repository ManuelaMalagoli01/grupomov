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
  { id:"manuela", name:"Manuela Malagoli", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"gustavo", name:"Gustavo Coelho", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:true  },
  { id:"hebert_ofi", name:"Hebert Oficina", role:"Oficina", password:"ofi2026", canDelete:true,  apenasOficina:true },
  { id:"matheus_ofi", name:"Matheus", role:"Oficina150", password:"mat2026", canDelete:true,  apenasOfi150:true },
  { id:"rafael", name:"Rafael", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"helbert", name:"Helbert", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"dilson", name:"Dilson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"anderson", name:"Anderson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"bruno", name:"Bruno", role:"Líder Centro Oeste", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"pedro_pimentel", name:"Pedro Pimentel", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
  { id:"pedro_souza_v", name:"Pedro Souza", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
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
  oficina:{l:"Oficina",c:"#E67E00",bg:"#FFF8F0"},
  liberado:{l:"Liberado",c:"#1A7A3C",bg:"#F0FFF5"},
};
const PEND_ACOES = ["Reunião","Envio de Email","Treinamento","Feedback","Retorno para Cliente","Diretoria","Gustavo","Gilberto","Almox","Relatórios","Escala Técnica","Outros"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,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";
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
  const [user,setUser]=useState(list[0]?.id||"manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);
    setTimeout(()=>{
      const u=list.find(x=>x.id===user&&x.password===pass)||USERS.find(x=>x.id===user&&x.password===pass);
      if(u)onLogin(u);
      else{setErr("Senha incorreta. Tente novamente.");setLoading(false);}
    },400);
  };
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Elementos decorativos */}
      <div style={{position:"fixed",top:-100,right:-100,width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-100,left:-100,width:300,height:300,background:"radial-gradient(circle,rgba(245,194,0,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{background:"#FFF",borderRadius:20,padding:48,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
        {/* Faixa amarela topo */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#F5C200"}}/>

        {/* Logo e título */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:16,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{height:52,width:"auto"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#1A1A1A",letterSpacing:-.5}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4,letterSpacing:.5}}>Sistema de Gestão de Manutenção</div>
        </div>

        {/* Campos */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Usuário</label>
          <select value={user} onChange={e=>{setUser(e.target.value);setErr("");}} style={{width:"100%",padding:"12px 14px",fontSize:13,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}>
            {list.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Senha</label>
          <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}/>
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
function ProcessoModal({onClose,onSave,tipo}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>{isMU?"⚠️ Novo Processo Mau Uso":"💰 Novo Processo A Faturar"}</div>
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
  const oficinasAtiva = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab);

  const canSee=(tipo)=>{
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="sogusnao") return user.id!=="gustavo";
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
      <Btn k="relatorios" l="📋 Conf. Relatórios"/>
      <Btn k="agenda_prev" l="🗓 Agenda"/>
      <Btn k="dashboard" l="📊 Dashboard"/>

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
      <Btn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
      <Btn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
      <Btn k="dashboard_req" l="📊 Dash Requisições"/>
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
  { id:"manuela", name:"Manuela Malagoli", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"gustavo", name:"Gustavo Coelho", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:true  },
  { id:"hebert_ofi", name:"Hebert Oficina", role:"Oficina", password:"ofi2026", canDelete:true,  apenasOficina:true },
  { id:"matheus_ofi", name:"Matheus", role:"Oficina150", password:"mat2026", canDelete:true,  apenasOfi150:true },
  { id:"rafael", name:"Rafael", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"helbert", name:"Helbert", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"dilson", name:"Dilson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"anderson", name:"Anderson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"bruno", name:"Bruno", role:"Líder Centro Oeste", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"pedro_pimentel", name:"Pedro Pimentel", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
  { id:"pedro_souza_v", name:"Pedro Souza", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
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
  oficina:{l:"Oficina",c:"#E67E00",bg:"#FFF8F0"},
  liberado:{l:"Liberado",c:"#1A7A3C",bg:"#F0FFF5"},
};
const PEND_ACOES = ["Reunião","Envio de Email","Treinamento","Feedback","Retorno para Cliente","Diretoria","Gustavo","Gilberto","Almox","Relatórios","Escala Técnica","Outros"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,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";
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
  const [user,setUser]=useState(list[0]?.id||"manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);
    setTimeout(()=>{
      const u=list.find(x=>x.id===user&&x.password===pass)||USERS.find(x=>x.id===user&&x.password===pass);
      if(u)onLogin(u);
      else{setErr("Senha incorreta. Tente novamente.");setLoading(false);}
    },400);
  };
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Elementos decorativos */}
      <div style={{position:"fixed",top:-100,right:-100,width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-100,left:-100,width:300,height:300,background:"radial-gradient(circle,rgba(245,194,0,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{background:"#FFF",borderRadius:20,padding:48,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
        {/* Faixa amarela topo */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#F5C200"}}/>

        {/* Logo e título */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:16,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{height:52,width:"auto"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#1A1A1A",letterSpacing:-.5}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4,letterSpacing:.5}}>Sistema de Gestão de Manutenção</div>
        </div>

        {/* Campos */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Usuário</label>
          <select value={user} onChange={e=>{setUser(e.target.value);setErr("");}} style={{width:"100%",padding:"12px 14px",fontSize:13,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}>
            {list.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Senha</label>
          <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}/>
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
function ProcessoModal({onClose,onSave,tipo}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>{isMU?"⚠️ Novo Processo Mau Uso":"💰 Novo Processo A Faturar"}</div>
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
  const oficinasAtiva = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab);

  const canSee=(tipo)=>{
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="sogusnao") return user.id!=="gustavo";
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
      <Btn k="relatorios" l="📋 Conf. Relatórios"/>
      <Btn k="agenda_prev" l="🗓 Agenda"/>
      <Btn k="dashboard" l="📊 Dashboard"/>

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
      <Btn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
      <Btn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
      <Btn k="dashboard_req" l="📊 Dash Requisições"/>
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
  { id:"manuela", name:"Manuela Malagoli", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"gustavo", name:"Gustavo Coelho", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:true  },
  { id:"hebert_ofi", name:"Hebert Oficina", role:"Oficina", password:"ofi2026", canDelete:true,  apenasOficina:true },
  { id:"matheus_ofi", name:"Matheus", role:"Oficina150", password:"mat2026", canDelete:true,  apenasOfi150:true },
  { id:"rafael", name:"Rafael", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"helbert", name:"Helbert", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"dilson", name:"Dilson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"anderson", name:"Anderson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"bruno", name:"Bruno", role:"Líder Centro Oeste", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"pedro_pimentel", name:"Pedro Pimentel", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
  { id:"pedro_souza_v", name:"Pedro Souza", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
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
  oficina:{l:"Oficina",c:"#E67E00",bg:"#FFF8F0"},
  liberado:{l:"Liberado",c:"#1A7A3C",bg:"#F0FFF5"},
};
const PEND_ACOES = ["Reunião","Envio de Email","Treinamento","Feedback","Retorno para Cliente","Diretoria","Gustavo","Gilberto","Almox","Relatórios","Escala Técnica","Outros"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,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";
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
  const [user,setUser]=useState(list[0]?.id||"manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);
    setTimeout(()=>{
      const u=list.find(x=>x.id===user&&x.password===pass)||USERS.find(x=>x.id===user&&x.password===pass);
      if(u)onLogin(u);
      else{setErr("Senha incorreta. Tente novamente.");setLoading(false);}
    },400);
  };
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Elementos decorativos */}
      <div style={{position:"fixed",top:-100,right:-100,width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-100,left:-100,width:300,height:300,background:"radial-gradient(circle,rgba(245,194,0,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{background:"#FFF",borderRadius:20,padding:48,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
        {/* Faixa amarela topo */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#F5C200"}}/>

        {/* Logo e título */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:16,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{height:52,width:"auto"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#1A1A1A",letterSpacing:-.5}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4,letterSpacing:.5}}>Sistema de Gestão de Manutenção</div>
        </div>

        {/* Campos */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Usuário</label>
          <select value={user} onChange={e=>{setUser(e.target.value);setErr("");}} style={{width:"100%",padding:"12px 14px",fontSize:13,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}>
            {list.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Senha</label>
          <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}/>
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
function ProcessoModal({onClose,onSave,tipo}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>{isMU?"⚠️ Novo Processo Mau Uso":"💰 Novo Processo A Faturar"}</div>
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
  const oficinasAtiva = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab);

  const canSee=(tipo)=>{
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="sogusnao") return user.id!=="gustavo";
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
      <Btn k="relatorios" l="📋 Conf. Relatórios"/>
      <Btn k="agenda_prev" l="🗓 Agenda"/>
      <Btn k="dashboard" l="📊 Dashboard"/>

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
      <Btn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
      <Btn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
      <Btn k="dashboard_req" l="📊 Dash Requisições"/>
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
  { id:"manuela", name:"Manuela Malagoli", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"gustavo", name:"Gustavo Coelho", role:"ADM", password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:true  },
  { id:"hebert_ofi", name:"Hebert Oficina", role:"Oficina", password:"ofi2026", canDelete:true,  apenasOficina:true },
  { id:"matheus_ofi", name:"Matheus", role:"Oficina150", password:"mat2026", canDelete:true,  apenasOfi150:true },
  { id:"rafael", name:"Rafael", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"helbert", name:"Helbert", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"dilson", name:"Dilson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"anderson", name:"Anderson", role:"Líder Metropolitana BH", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"bruno", name:"Bruno", role:"Líder Centro Oeste", password:"mov2026", canDelete:true, apenasAgenda:true },
  { id:"pedro_pimentel", name:"Pedro Pimentel", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
  { id:"pedro_souza_v", name:"Pedro Souza", role:"Técnico", password:"mov2026", canDelete:true, apenasAgenda150:true },
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
  oficina:{l:"Oficina",c:"#E67E00",bg:"#FFF8F0"},
  liberado:{l:"Liberado",c:"#1A7A3C",bg:"#F0FFF5"},
};
const PEND_ACOES = ["Reunião","Envio de Email","Treinamento","Feedback","Retorno para Cliente","Diretoria","Gustavo","Gilberto","Almox","Relatórios","Escala Técnica","Outros"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
const LOGO_MOV = "data:image/jpeg;base64,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";
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
  const [user,setUser]=useState(list[0]?.id||"manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);
    setTimeout(()=>{
      const u=list.find(x=>x.id===user&&x.password===pass)||USERS.find(x=>x.id===user&&x.password===pass);
      if(u)onLogin(u);
      else{setErr("Senha incorreta. Tente novamente.");setLoading(false);}
    },400);
  };
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Elementos decorativos */}
      <div style={{position:"fixed",top:-100,right:-100,width:400,height:400,background:"radial-gradient(circle,rgba(245,194,0,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-100,left:-100,width:300,height:300,background:"radial-gradient(circle,rgba(245,194,0,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{background:"#FFF",borderRadius:20,padding:48,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.5)",position:"relative",overflow:"hidden"}}>
        {/* Faixa amarela topo */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#F5C200"}}/>

        {/* Logo e título */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:80,height:80,borderRadius:16,background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            <img src={LOGO_MOV} alt="Grupo MOV" style={{height:52,width:"auto"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#1A1A1A",letterSpacing:-.5}}>Grupo MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4,letterSpacing:.5}}>Sistema de Gestão de Manutenção</div>
        </div>

        {/* Campos */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Usuário</label>
          <select value={user} onChange={e=>{setUser(e.target.value);setErr("");}} style={{width:"100%",padding:"12px 14px",fontSize:13,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}>
            {list.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Senha</label>
          <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{width:"100%",padding:"12px 14px",fontSize:14,borderRadius:10,border:"2px solid #F0F0F0",background:"#FAFAFA"}}/>
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
function ProcessoModal({onClose,onSave,tipo}){
  const isMU=tipo==="mau_uso";
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",relatorio:"",chamado:"",enviadoAprovacao:"nao",dataEnvio:"",aprovado:"nao",numMauUso:"",ov:"",valor:"",aprovadoPor:"",servicoExecutado:"nao",numChamado2:"",relatorio2:"",obs:""});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sla=form.enviadoAprovacao==="sim"&&form.dataEnvio?diffDays(form.dataEnvio):null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#FFF",borderRadius:16,width:640,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:17,color:"#F5C200"}}>{isMU?"⚠️ Novo Processo Mau Uso":"💰 Novo Processo A Faturar"}</div>
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
  const oficinasAtiva = ["apontamentos_oficina","agenda_ofi","dashboard_ofi","apontamentos_150","agenda_ofi_150","dashboard_ofi_150","pendencias_hebert","pendencias_matheus"].includes(tab);

  const canSee=(tipo)=>{
    if(user.apenasAgenda) return ["agenda","dashboard"].includes(tipo);
    if(user.apenasAgenda150) return ["agenda150","dashboard_ofi_150"].includes(tipo);
    if(user.apenasOficina) return ["agenda_ofi","dashboard_ofi","hebert"].includes(tipo);
    if(user.apenasOfi150) return ["agenda_ofi_150","dashboard_ofi_150","matheus"].includes(tipo);
    if(tipo==="somanuela") return user.id==="manuela";
    if(tipo==="sogusnao") return user.id!=="gustavo";
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
      <Btn k="relatorios" l="📋 Conf. Relatórios"/>
      <Btn k="agenda_prev" l="🗓 Agenda"/>
      <Btn k="dashboard" l="📊 Dashboard"/>

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
      <Btn k="emprestimos" l="🔄 Req. Empréstimo" badge={empAlerta}/>
      <Btn k="saida_entrada" l="📦 Req. Entrada/Saída"/>
      <Btn k="dashboard_req" l="📊 Dash Requisições"/>
                          </div>
    </div>
  );
}

