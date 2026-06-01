/* eslint-disable */
import { useState, useRef, useEffect } from "react";
// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPA_URL = "https://kpaddzigzqbnkfzprlwl.supabase.co";
const SUPA_KEY = "sb_publishable_RZaBuoZXGvPNTZaqGjHMlQ_kMH_dTVG";

const db = {
  async get(table) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*`, {
        headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`}
      });
      const rows = await res.json();
      return rows.map(r => r.data);
    } catch(e) { console.error("DB get error:", e); return []; }
  },
  async save(table, id, data) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
        body: JSON.stringify({id, data})
      });
    } catch(e) { console.error("DB save error:", e); }
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
  { id:"manuela", name:"Manuela", role:"Gestora",    password:"mov2026", canDelete:true  },
  { id:"renato",  name:"Renato",  role:"Assistente", password:"mov2026", canDelete:false },
];
const REGIONS = {
  metropolitana:{ label:"Metropolitana BH", techs:["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme","Denison"] },
  roca:         { label:"Roca",              techs:["Arthur","Eduardo","Luiz Ribeiro"] },
  centroOeste:  { label:"Centro-Oeste",      techs:["Bruno","Marcus"] },
};
const METRO_PREV = ["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme","Denison"];
const METRO_CORR = ["Anderson","Dilson","Rafael","Helbert","Luiz Guilherme","Denison"];
const ALL_TECHS  = Object.values(REGIONS).flatMap(r=>r.techs);
const TODAY      = new Date();
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
const Inp=({label,value,onChange,placeholder,style={}})=>(<div style={{display:"flex",flexDirection:"column",gap:4,...style}}>{label&&<div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>{label}</div>}<input type="text" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""}/></div>);
const Sel=({label,value,onChange,options,style={}})=>(<div style={{display:"flex",flexDirection:"column",gap:4,...style}}>{label&&<div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>{label}</div>}<select value={value||""} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select></div>);
const BtnY=({children,onClick,disabled,style={}})=>(<button className="btn btn-primary" onClick={onClick} disabled={disabled} style={style}>{children}</button>);
const BtnG=({children,onClick,style={}})=>(<button className="btn btn-ghost" onClick={onClick} style={style}>{children}</button>);
const SlaBadge=({days})=>{if(days===null||days===undefined)return<span style={{color:"#CCC",fontSize:11}}>—</span>;const color=days>30?"#C62828":days>15?"#E67E00":"#1A7A3C";const bg=days>30?"#FFF0F0":days>15?"#FFF8F0":"#F0FFF5";return<span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:5,color,background:bg}}>{days}d</span>;};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [user,setUser]=useState("manuela");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const handle=()=>{const u=USERS.find(x=>x.id===user&&x.password===pass);if(u)onLogin(u);else setErr("Senha incorreta.");};
  return(
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#FFF",borderRadius:16,padding:40,width:380,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,background:"#F5C800",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>⚙</div>
          <div style={{fontWeight:800,fontSize:22}}>GRUPO MOV</div>
          <div style={{fontSize:12,color:"#AAA",marginTop:4}}>Gestão Técnica de Campo</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Usuário</div>
          <select value={user} onChange={e=>setUser(e.target.value)} style={{width:"100%",padding:"10px 12px",fontSize:14}}>{USERS.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}</select>
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
function ReportModal({onClose,onSave}){
  const [mode,setMode]=useState("manual");
  const [text,setText]=useState("");
  const [analyzing,setAnalyzing]=useState(false);
  const [err,setErr]=useState("");
  const fileRef=useRef();
  const [form,setForm]=useState({date:TODAY_STR,empresa:"",patrimonio:"",tecnico:ALL_TECHS[0],region:"metropolitana",type:"corretivo",reportNum:"",execRelatorio:"",acao:"",status:"aberto",urgent:false,sla:8,horaEntrada:"",horaSaida:"",horasTrabalhadas:"",horasDeslocamento:"",requisicaoPeca:"",numChamado:"",obs:""});
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
              <Sel label="Técnico" value={form.tecnico} onChange={v=>upd("tecnico",v)} options={ALL_TECHS}/>
              <Sel label="Região" value={form.region} onChange={v=>upd("region",v)} options={[{v:"metropolitana",l:"Metropolitana BH"},{v:"roca",l:"Roca"},{v:"centroOeste",l:"Centro-Oeste"}]}/>
            </div>
            <div><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Ação / O que foi feito</div><textarea value={form.acao} onChange={e=>upd("acao",e.target.value)} rows={3} placeholder="Descreva a ação..." style={{width:"100%",resize:"none"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <Inp label="Data" value={form.date} onChange={v=>upd("date",v)} placeholder="YYYY-MM-DD"/>
              <Inp label="Nº Chamado" value={form.numChamado} onChange={v=>upd("numChamado",v)} placeholder="CHM-001"/>
              <Inp label="Nº Execução/Retorno" value={form.execRelatorio} onChange={v=>upd("execRelatorio",v)} placeholder="EXE-001"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,background:"#FFFBF0",padding:12,borderRadius:10,border:"1px solid #FFE8A0"}}>
              <Inp label="Entrada" value={form.horaEntrada} onChange={v=>upd("horaEntrada",v)} placeholder="08:00"/>
              <Inp label="Saída" value={form.horaSaida} onChange={v=>upd("horaSaida",v)} placeholder="17:30"/>
              <Inp label="Trabalhadas" value={form.horasTrabalhadas} onChange={v=>upd("horasTrabalhadas",v)} placeholder="08:30"/>
              <Inp label="Deslocamento" value={form.horasDeslocamento} onChange={v=>upd("horasDeslocamento",v)} placeholder="01:00"/>
              <Inp label="Req. Peça" value={form.requisicaoPeca} onChange={v=>upd("requisicaoPeca",v)} placeholder="REQ-001"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"end"}}>
              <Sel label="Status" value={form.status} onChange={v=>upd("status",v)} options={Object.entries(statusCfg).map(([v,{label}])=>({v,l:label}))}/>
              <div><div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Urgente</div><div style={{display:"flex",alignItems:"center",gap:10}}><input type="checkbox" checked={form.urgent} onChange={e=>upd("urgent",e.target.checked)} style={{width:18,height:18}}/><span style={{fontSize:13,color:form.urgent?"#C62828":"#888",fontWeight:form.urgent?700:400}}>{form.urgent?"SIM":"Não"}</span></div></div>
            </div>
            <Inp label="Observações" value={form.obs} onChange={v=>upd("obs",v)} placeholder="Observações adicionais..."/>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:20}}>
            <BtnG onClick={onClose}>Cancelar</BtnG>
            <BtnY onClick={()=>{onSave({...form,id:`R${Date.now()}`});onClose();}} disabled={!form.empresa}>Salvar</BtnY>
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
            <Inp label="Data" value={form.date} onChange={v=>upd("date",v)} placeholder="YYYY-MM-DD"/>
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
              {form.enviadoAprovacao==="sim"?<div><Inp label="Data do Envio" value={form.dataEnvio} onChange={v=>upd("dataEnvio",v)} placeholder="YYYY-MM-DD"/>{sla!==null&&<div style={{marginTop:6,fontSize:11,color:"#888"}}>SLA desde envio: <SlaBadge days={sla}/></div>}</div>:<div style={{fontSize:12,color:"#C62828",fontWeight:600,paddingTop:20}}>⏱ SLA contando — aguardando envio</div>}
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
            <Inp label="Data" value={form.data} onChange={v=>upd("data",v)} placeholder="YYYY-MM-DD"/>
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
            <div><Inp label="Data Retorno" value={form.dataRetorno} onChange={v=>upd("dataRetorno",v)} placeholder="YYYY-MM-DD"/>
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
            <Inp label="Data Saída Almox" value={form.dataSaida} onChange={v=>upd("dataSaida",v)} placeholder="YYYY-MM-DD"/>
            <Inp label="Data Entrega" value={form.dataEntrega} onChange={v=>upd("dataEntrega",v)} placeholder="YYYY-MM-DD"/>
            <Inp label="Data Devolução" value={form.devolucao} onChange={v=>upd("devolucao",v)} placeholder="YYYY-MM-DD"/>
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

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("relatorios");
  const [reports,setReports]=useState(REAL_REPORTS);
  const [processosMU,setProcessosMU]=useState([]);
  const [processosAF,setProcessosAF]=useState([]);
  const [emprestimos,setEmprestimos]=useState(EMP_DATA);
  const [saidaEntrada,setSaidaEntrada]=useState(SAIDA_DATA);
  const [requisicoes,setRequisicoes]=useState([]);
  const [agendaItems,setAgendaItems]=useState({});
  const [schedule,setSchedule]=useState({});
  const [notification,setNotification]=useState("");

  // Filtros relatórios
  const [filterTipo,setFilterTipo]=useState("todos");
  const [filterTech,setFilterTech]=useState("todos");
  const [filterStatus,setFilterStatus]=useState("todos");
  const [filterRegion,setFilterRegion]=useState("todas");
  const [filterDateFrom,setFilterDateFrom]=useState("");
  const [filterDateTo,setFilterDateTo]=useState("");
  const [searchText,setSearchText]=useState("");
  const [filterReqStatus,setFilterReqStatus]=useState("sem_retorno");
  const [showArqRel,setShowArqRel]=useState(false);
  const [showArqMU,setShowArqMU]=useState(false);
  const [showArqAF,setShowArqAF]=useState(false);
  const [showArqEmp,setShowArqEmp]=useState(false);
  const [showArqSaida,setShowArqSaida]=useState(false);
  const [showArqReq,setShowArqReq]=useState(false);
  const [uberPedidos,setUberPedidos]=useState([]);

  // Modais
  const [modalReport,setModalReport]=useState(false);
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

  const notify=msg=>{setNotification(msg);setTimeout(()=>setNotification(""),3000);};

  // ── CARREGAR DADOS DO SUPABASE ──
  useEffect(()=>{
    const load = async () => {
      const [rels, mus, afs, emps, saidas, reqs, ubers] = await Promise.all([
        db.get("relatorios"), db.get("processos_mu"), db.get("processos_af"),
        db.get("emprestimos"), db.get("saida_entrada"), db.get("requisicoes"),
        db.get("uber_pedidos")
      ]);
      if(rels.length>0) setReports(rels);
      if(mus.length>0) setProcessosMU(mus);
      if(afs.length>0) setProcessosAF(afs);
      if(emps.length>0) setEmprestimos(emps);
      if(saidas.length>0) setSaidaEntrada(saidas);
      if(reqs.length>0) setRequisicoes(reqs);
      if(ubers.length>0) setUberPedidos(ubers);
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
  const updateReport=(id,changes)=>{const updated=reports.map(r=>r.id===id?{...r,...changes}:r);setReports(updated);db.save("relatorios",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateEmp=(id,changes)=>{const updated=emprestimos.map(r=>r.id===id?{...r,...changes}:r);setEmprestimos(updated);db.save("emprestimos",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateSaida=(id,changes)=>{const updated=saidaEntrada.map(r=>r.id===id?{...r,...changes}:r);setSaidaEntrada(updated);db.save("saida_entrada",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateMU=(id,changes)=>{const updated=processosMU.map(r=>r.id===id?{...r,...changes}:r);setProcessosMU(updated);db.save("processos_mu",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};
  const updateAF=(id,changes)=>{const updated=processosAF.map(r=>r.id===id?{...r,...changes}:r);setProcessosAF(updated);db.save("processos_af",id,updated.find(r=>r.id===id));notify("✅ Salvo!");};

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

  const empAlerta=emprestimos.filter(e=>{
    if(!e.dataRetorno||e.situacao==="Atendido")return false;
    const d=diffDays(e.dataRetorno);
    return d!==null&&d<0;
  }).length;

  const techsForSched=schedRegion==="todas"?ALL_TECHS:schedRegion==="metropolitana"?(schedType==="preventivo"?METRO_PREV:METRO_CORR):(REGIONS[schedRegion]?.techs||[]);
  const agendaTechs=agendaRegion==="todas"?ALL_TECHS:agendaRegion==="metropolitana"?METRO_PREV:(REGIONS[agendaRegion]?.techs||[]);

  if(!user)return<LoginScreen onLogin={u=>{setUser(u);notify(`Bem-vinda, ${u.name}!`);}}/>;

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
    input[type=text],input[type=password],textarea{background:#FFF;color:#1A1A1A;border:1px solid #E0E0E0;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:13px;outline:none;transition:border-color .15s;}
    input[type=text]:focus,input[type=password]:focus,textarea:focus{border-color:#F5C800;box-shadow:0 0 0 3px rgba(245,200,0,.15);}
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
            <div style={{width:34,height:34,background:"#F5C800",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>⚙</div>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:"#FFF",letterSpacing:"-.3px"}}>GRUPO MOV</div>
              <div style={{fontSize:9,color:"#666",letterSpacing:1.5,textTransform:"uppercase"}}>Gestão Técnica de Campo</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:"#888"}}>{user.name} — {user.role}</span>
            <button onClick={()=>setUser(null)} style={{background:"#333",border:"none",color:"#AAA",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>Sair</button>
          </div>
        </div>
        <div style={{padding:"8px 24px 0",display:"flex",gap:3,overflowX:"auto"}}>
          {[
            ["relatorios","📋 Relatórios"],
            ["escala","📅 Escala"],
            ["agenda","🗓 Agenda"],
            ["dashboard","📊 Dashboard"],
            ["mau_uso","⚠️ Mau Uso"],
            ["a_faturar","💰 A Faturar"],
            ["emprestimos","🔄 Req. Empréstimo"],
            ["saida_entrada","📦 Saída/Entrada"],
            ["requisicoes","📦 Requisições"],
            ["uber","🚗 Uber"],
          ].map(([k,l])=>(
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
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
              {TIPOS.slice(0,4).map(t=>{
                const total=t.v==="preventivo"?DB_STATS.preventivos:t.v==="corretivo"?DB_STATS.corretivos:t.v==="a_faturar"?DB_STATS.a_faturar:t.v==="mau_uso"?DB_STATS.mau_uso:reports.filter(r=>r.type===t.v).length;
                return(
                  <div key={t.v} className="card" style={{padding:"14px 16px",borderTop:`3px solid ${t.color}`,cursor:"pointer"}} onClick={()=>setFilterTipo(filterTipo===t.v?"todos":t.v)}>
                    <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>{t.l}</div>
                    <div style={{fontSize:28,fontWeight:700,color:filterTipo===t.v?t.color:"#1A1A1A",lineHeight:1}}>{filterTipo===t.v?filteredReports.filter(r=>r.type===t.v).length:total}</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
              {TIPOS.slice(4).map(t=>(
                <div key={t.v} className="card" style={{padding:"12px 16px",borderTop:`3px solid ${t.color}`,cursor:"pointer"}} onClick={()=>setFilterTipo(filterTipo===t.v?"todos":t.v)}>
                  <div style={{fontSize:9,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>{t.l}</div>
                  <div style={{fontSize:24,fontWeight:700,color:filterTipo===t.v?t.color:"#1A1A1A",lineHeight:1}}>{reports.filter(r=>r.type===t.v).length}</div>
                </div>
              ))}
            </div>
            {/* Filtros */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="🔍 Buscar empresa, ação, patrimônio..." style={{minWidth:220,fontSize:12}}/>
              <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={{fontSize:12}}><option value="todos">Todos os tipos</option>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select>
              <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} style={{fontSize:12}}><option value="todas">Todas regiões</option><option value="metropolitana">Metropolitana BH</option><option value="roca">Roca</option><option value="centroOeste">Centro-Oeste</option></select>
              <select value={filterTech} onChange={e=>setFilterTech(e.target.value)} style={{fontSize:12}}><option value="todos">Todos técnicos</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{fontSize:12}}><option value="todos">Todos status</option>{Object.entries(statusCfg).map(([v,{label}])=><option key={v} value={v}>{label}</option>)}</select>
              <input type="text" value={filterDateFrom} onChange={e=>setFilterDateFrom(e.target.value)} placeholder="De: YYYY-MM-DD" style={{width:130,fontSize:12}}/>
              <input type="text" value={filterDateTo} onChange={e=>setFilterDateTo(e.target.value)} placeholder="Até: YYYY-MM-DD" style={{width:130,fontSize:12}}/>
              <button onClick={()=>setShowArqRel(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqRel?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:showArqRel?"#888":"#AAA",fontFamily:"inherit"}}>
                {showArqRel?"✓ Arquivados":"📁 Ver Arquivados"}
              </button>
              {(filterTipo!=="todos"||filterTech!=="todos"||filterStatus!=="todos"||filterRegion!=="todas"||filterDateFrom||filterDateTo||searchText)&&<BtnG onClick={()=>{setFilterTipo("todos");setFilterTech("todos");setFilterStatus("todos");setFilterRegion("todas");setFilterDateFrom("");setFilterDateTo("");setSearchText("");}}>✕ Limpar</BtnG>}
              <span style={{marginLeft:"auto",fontSize:11,color:"#AAA"}}>{filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").length} registro(s)</span>
              <BtnExcel onClick={()=>exportCSV(filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado"),"relatorios_grupomov",[{key:"reportNum",label:"Nº Relatório"},{key:"type",label:"Tipo"},{key:"empresa",label:"Empresa"},{key:"patrimonio",label:"Patrimônio"},{key:"tecnico",label:"Técnico"},{key:"date",label:"Data"},{key:"numChamado",label:"Nº Chamado"},{key:"acao",label:"Ação"},{key:"horasTrabalhadas",label:"Horas Trabalhadas"},{key:"status",label:"Status"},{key:"processoStatus",label:"Processo"},{key:"requisicaoPeca",label:"Req. Peça"}])}/>
              <BtnY onClick={()=>setModalReport(true)}>+ Novo Relatório</BtnY>
            </div>
            {/* Tabela */}
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Nº Relatório</th><th>Tipo</th><th>Empresa</th><th>Patrimônio</th><th>Técnico</th><th>Data</th><th>Chamado</th><th>Ação</th><th>Horas Trab.</th><th>Status</th><th>Processo</th><th>Peças</th>{user.canDelete&&<th>Excluir</th>}</tr></thead>
                  <tbody>
                    {filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").length===0&&<tr><td colSpan={13} style={{textAlign:"center",color:"#CCC",padding:40}}>Nenhum registro. Clique em "+ Novo Relatório".</td></tr>}
                    {filteredReports.filter(d=>showArqRel||d.processoStatus!=="arquivado").map(d=>{
                      const sc=statusCfg[d.status]||statusCfg["aberto"];
                      const tc=tipoCfg(d.type);
                      const isArq=d.processoStatus==="arquivado";
                      return(
                        <tr key={d.id} style={{opacity:isArq?.5:1,background:isArq?"#F8F8F8":""}}>
                          <td><input type="text" value={d.reportNum||""} onChange={e=>updateReport(d.id,{reportNum:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px",fontWeight:700}}/></td>
                          <td><select value={d.type} onChange={e=>updateReport(d.id,{type:e.target.value})} style={{fontSize:10,padding:"3px 5px",color:tc.color,background:tc.bg,border:"none",borderRadius:5,fontWeight:700}}>{TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></td>
                          <td><input type="text" value={d.empresa||""} onChange={e=>updateReport(d.id,{empresa:e.target.value})} style={{width:150,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.patrimonio||""} onChange={e=>updateReport(d.id,{patrimonio:e.target.value})} style={{width:110,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><select value={d.tecnico||""} onChange={e=>updateReport(d.id,{tecnico:e.target.value})} style={{fontSize:11,padding:"3px 5px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                          <td><input type="text" value={d.date||""} onChange={e=>updateReport(d.id,{date:e.target.value})} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.numChamado||""} onChange={e=>updateReport(d.id,{numChamado:e.target.value})} placeholder="—" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.acao||""} onChange={e=>updateReport(d.id,{acao:e.target.value})} placeholder="Ação..." style={{width:160,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={d.horasTrabalhadas||""} onChange={e=>updateReport(d.id,{horasTrabalhadas:e.target.value})} placeholder="00:00" style={{width:70,fontSize:11,padding:"3px 6px",textAlign:"center",color:"#C47D00",fontWeight:600}}/></td>
                          <td><select value={d.status} onChange={e=>updateReport(d.id,{status:e.target.value})} style={{fontSize:11,padding:"4px 7px",color:sc.color,background:sc.bg,border:`1px solid ${sc.color}33`,borderRadius:6,fontWeight:700}}>{Object.entries(statusCfg).map(([v,{label}])=><option key={v} value={v}>{label}</option>)}</select></td>
                          <td><PSSelect value={d.processoStatus} onChange={v=>updateReport(d.id,{processoStatus:v})}/></td>
                          <td><input type="text" value={d.requisicaoPeca||""} onChange={e=>updateReport(d.id,{requisicaoPeca:e.target.value})} placeholder="—" style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir este relatório?"))setReports(p=>p.filter(r=>r.id!==d.id));}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
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
                            {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))setProcessosMU(p2=>p2.filter(x=>x.id!==p.id));}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
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
                            {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))setProcessosAF(p2=>p2.filter(x=>x.id!==p.id));}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
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
                  <thead><tr><th>REQ</th><th>Data</th><th>Requerente</th><th>Ítem</th><th>Descrição</th><th>Situação</th><th>Centro/PAT</th><th>Qtd</th><th>Retorno</th><th>Data Retorno</th><th>SLA</th><th>Nº Relatório</th><th>Obs</th><th>Ret.Almox</th><th>Ret.Sistema</th><th>Processo</th><th>Ação</th>{user.canDelete&&<th>✕</th>}</tr></thead>
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
                          <td><input type="text" value={e.numRelatorio||""} onChange={ev=>updateEmp(e.id,{numRelatorio:ev.target.value})} placeholder="REL-001" style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={e.observacao||""} onChange={ev=>updateEmp(e.id,{observacao:ev.target.value})} placeholder="Obs..." style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={e.retornoAlmox||""} onChange={ev=>updateEmp(e.id,{retornoAlmox:ev.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={e.retornoSistema||""} onChange={ev=>updateEmp(e.id,{retornoSistema:ev.target.value})} style={{width:80,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><PSSelect value={e.processoStatus} onChange={v=>updateEmp(e.id,{processoStatus:v})}/></td>
                          <td><BtnG onClick={()=>{setEditEmp(e);setModalEmp(true);}} style={{fontSize:11,padding:"4px 10px"}}>✏ Editar</BtnG></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))setEmprestimos(p=>p.filter(x=>x.id!==e.id));}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
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
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📦 Requisições Saída/Entrada</div>
                <div style={{fontSize:13,color:"#888"}}>{saidaEntrada.length} registros</div>
              </div>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setShowArqSaida(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqSaida?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqSaida?"✓ Arquivados":"📁 Ver Arquivados"}</button><BtnY onClick={()=>{setEditSaida(null);setModalSaida(true);}}>+ Nova Saída/Entrada</BtnY></div>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>REQ</th><th>Empresa</th><th>Requerente</th><th>Código</th><th>Descrição</th><th>Data Saída</th><th>Data Entrega</th><th>Mês</th><th>REQ Retorno</th><th>Devolução</th><th>Status</th><th>Processo</th><th>Obs</th><th>Ação</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                  <tbody>
                    {saidaEntrada.filter(s=>showArqSaida||s.processoStatus!=="arquivado").map(s=>{
                      const devolvido=s.status==="devolvido";
                      return(
                        <tr key={s.id}>
                          <td style={{fontWeight:700}}>{s.req}</td>
                          <td style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.empresa}</td>
                          <td style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.requerente}</td>
                          <td style={{fontSize:11,color:"#888"}}>{s.codigo}</td>
                          <td style={{maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.descricao}</td>
                          <td style={{whiteSpace:"nowrap",color:"#888",fontSize:11}}>{s.dataSaida}</td>
                          <td style={{whiteSpace:"nowrap",color:"#888",fontSize:11}}>{s.dataEntrega}</td>
                          <td style={{fontSize:11,color:"#888"}}>{s.mes}</td>
                          <td style={{fontSize:11}}>{s.reqRetorno}</td>
                          <td style={{whiteSpace:"nowrap",color:devolvido?"#1A7A3C":"#888",fontSize:11}}>{s.devolucao||"—"}</td>
                          <td><select value={s.status} onChange={e=>updateSaida(s.id,{status:e.target.value})} style={{fontSize:11,padding:"3px 6px",color:devolvido?"#1A7A3C":s.status==="em_uso"?"#E67E00":"#C62828",fontWeight:700,background:devolvido?"#F0FFF5":s.status==="em_uso"?"#FFF8F0":"#FFF0F0",border:"none",borderRadius:5}}><option value="pendente">Pendente</option><option value="em_uso">Em Uso</option><option value="devolvido">Devolvido</option></select></td>
                          <td><input type="text" value={s.obs||""} onChange={e=>updateSaida(s.id,{obs:e.target.value})} placeholder="Obs..." style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><PSSelect value={s.processoStatus} onChange={v=>updateSaida(s.id,{processoStatus:v})}/></td>
                          <td><BtnG onClick={()=>{setEditSaida(s);setModalSaida(true);}} style={{fontSize:11,padding:"4px 10px"}}>✏ Editar</BtnG></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm('Excluir?'))setSaidaEntrada(p=>p.filter(x=>x.id!==s.id));}} style={{background:'#FFF0F0',border:'none',borderRadius:5,color:'#C62828',cursor:'pointer',padding:'3px 8px',fontSize:11}}>✕</button></td>}
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
        {tab==="requisicoes"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📦 Requisições de Peças</div>
                <div style={{fontSize:13,color:"#888"}}>{requisicoes.length} requisição(ões)</div>
              </div>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setShowArqReq(p=>!p)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E0E0E0",background:showArqReq?"#F5F5F5":"#FFF",fontSize:12,cursor:"pointer",color:"#888",fontFamily:"inherit"}}>{showArqReq?"✓ Ver Arquivados":"📁 Ver Arquivados"}</button><BtnY onClick={()=>setRequisicoes(p=>[{id:`REQ${Date.now()}`,numRequisicao:"",nomePeca:"",codigoPeca:"",numRelatorio:"",patrimonio:"",tecnico:ALL_TECHS[0],dataRequisicao:TODAY_STR,status:"reservada",situacao:"reservada",processoStatus:"em_andamento",tecnicoEntrega:"",dataEntrega:"",dataEntregaParcial:"",previsaoChegada:""},...p])}>+ Nova Requisição</BtnY></div>
            </div>

            {/* Filtros */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#999",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Filtrar:</span>
              {[
                {v:"todos",l:"Todas"},
                {v:"reservada",l:"🔒 Reservadas"},
                {v:"entregue",l:"✅ Entregues"},
                {v:"ruptura",l:"🚨 Ruptura"},
                {v:"sem_retorno",l:"⚠️ Sem Retorno"},
              ].map(f=>{
                const count = f.v==="todos" ? requisicoes.length
                  : f.v==="sem_retorno" ? requisicoes.filter(r=>r.status==="entregue"&&!r.dataEntrega).length
                  : requisicoes.filter(r=>r.status===f.v).length;
                const active = (filterReqStatus||"todos")===f.v;
                return(
                  <button key={f.v} onClick={()=>setFilterReqStatus(f.v==="todos"?"todos":f.v)}
                    style={{padding:"6px 14px",borderRadius:8,border:`2px solid ${active?"#F5C800":"#E0E0E0"}`,background:active?"#FFFBF0":"#FFF",fontWeight:600,fontSize:12,cursor:"pointer",color:active?"#C47D00":"#888",fontFamily:"inherit"}}>
                    {f.l} <span style={{fontSize:10,background:active?"#F5C800":"#F0F0F0",color:active?"#1A1A1A":"#888",borderRadius:10,padding:"1px 6px",marginLeft:4}}>{count}</span>
                  </button>
                );
              })}
              {filterReqStatus&&filterReqStatus!=="todos"&&<BtnG onClick={()=>setFilterReqStatus("todos")} style={{fontSize:11}}>✕ Limpar</BtnG>}
            </div>

            {/* Alerta sem retorno */}
            {(()=>{
              const semRetorno=requisicoes.filter(r=>r.status==="entregue"&&!r.dataEntrega);
              return semRetorno.length>0?(
                <div style={{background:"#FFF8F0",border:"1px solid #FFE8A0",borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:14}}>⚠️</span>
                  <span style={{fontSize:13,color:"#C47D00",fontWeight:600}}>{semRetorno.length} requisição(ões) entregue(s) sem data de retorno — peças a devolver ao estoque!</span>
                </div>
              ):null;
            })()}

            {requisicoes.length===0?(
              <div className="card" style={{padding:48,textAlign:"center",color:"#CCC"}}>Nenhuma requisição. Clique em "+ Nova Requisição".</div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Nº Req.</th><th>Nome Peça</th><th>Código</th><th>Nº Relatório</th><th>Patrimônio</th><th>Técnico</th><th>Data</th><th>Situação</th><th>Status</th><th>Técnico Entrega</th><th>Data Entrega</th><th>Previsão</th><th>Processo</th>{user.canDelete&&<th>✕</th>}</tr></thead>
                    <tbody>
                      {requisicoes.filter(r=>{
                        const f=filterReqStatus||"sem_retorno";
                        if(f==="todos") return true;
                        if(f==="sem_retorno") return r.status!=="entregue"||(r.status==="entregue"&&!r.dataEntrega);
                        return r.status===f;
                      }).map(r=>(
                        <tr key={r.id} style={{background:r.status==="entregue"&&!r.dataEntrega?"#FFFBF0":""}}>
                          <td><input type="text" value={r.numRequisicao||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,numRequisicao:e.target.value}:x))} style={{width:100,fontSize:11,padding:"3px 6px"}} placeholder="REQ-001"/></td>
                          <td><input type="text" value={r.nomePeca||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,nomePeca:e.target.value}:x))} style={{width:140,fontSize:11,padding:"3px 6px"}} placeholder="Nome da peça"/></td>
                          <td><input type="text" value={r.codigoPeca||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,codigoPeca:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="COD-001"/></td>
                          <td><input type="text" value={r.numRelatorio||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,numRelatorio:e.target.value}:x))} style={{width:100,fontSize:11,padding:"3px 6px"}} placeholder="REL-001"/></td>
                          <td><input type="text" value={r.patrimonio||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,patrimonio:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="PAT-001"/></td>
                          <td><select value={r.tecnico||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,tecnico:e.target.value}:x))} style={{fontSize:11,padding:"3px 6px"}}>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                          <td><input type="text" value={r.dataRequisicao||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,dataRequisicao:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}}/></td>
                          <td>
                            <select value={r.situacao||"reservada"} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,situacao:e.target.value}:x))}
                              style={{fontSize:11,padding:"3px 6px",color:r.situacao==="ruptura"?"#C62828":r.situacao==="parcial"?"#E67E00":"#1565C0",fontWeight:700,background:r.situacao==="ruptura"?"#FFF0F0":r.situacao==="parcial"?"#FFF8F0":"#F0F4FF",border:"none",borderRadius:5}}>
                              <option value="reservada">🔒 Reservada</option>
                              <option value="parcial">⚠️ Parcialmente Atendida</option>
                              <option value="ruptura">🚨 Ruptura</option>
                            </select>
                            {(r.situacao==="parcial"||r.situacao==="ruptura")&&
                              <input type="text" value={r.dataEntregaParcial||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,dataEntregaParcial:e.target.value}:x))}
                                placeholder="Data entrega" style={{width:100,fontSize:10,padding:"2px 5px",marginTop:3,display:"block",color:"#C62828"}}/>
                            }
                          </td>
                          <td><select value={r.status} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,status:e.target.value}:x))} style={{fontSize:11,padding:"3px 6px",color:r.status==="entregue"?"#1A7A3C":r.status==="ruptura"?"#C62828":"#1565C0",fontWeight:700,background:r.status==="entregue"?"#F0FFF5":r.status==="ruptura"?"#FFF0F0":"#F0F4FF",border:"none",borderRadius:5}}><option value="reservada">🔒 Reservada</option><option value="entregue">✅ Entregue</option><option value="ruptura">🚨 Ruptura</option></select></td>
                          <td><select value={r.tecnicoEntrega||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,tecnicoEntrega:e.target.value}:x))} style={{fontSize:11,padding:"3px 6px"}}><option value="">—</option>{ALL_TECHS.map(t=><option key={t}>{t}</option>)}</select></td>
                          <td><input type="text" value={r.dataEntrega||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,dataEntrega:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="DD/MM/AAAA"/></td>
                          <td><input type="text" value={r.previsaoChegada||""} onChange={e=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,previsaoChegada:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="DD/MM/AAAA"/></td>
                          <td><PSSelect value={r.processoStatus} onChange={v=>setRequisicoes(p=>p.map(x=>x.id===r.id?{...x,processoStatus:v}:x))}/></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir esta requisição?"))setRequisicoes(p=>p.filter(x=>x.id!==r.id));}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ESCALA ── */}
        {tab==="escala"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>📅 Escala Diária</div><div style={{fontSize:13,color:"#888"}}>Atendimentos por técnico no dia</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <select value={schedRegion} onChange={e=>{setSchedRegion(e.target.value);setSchedType("preventivo");}} style={{fontSize:12}}>
                  <option value="todas">🌐 Visão Geral</option>
                  <option value="metropolitana">Metropolitana BH</option>
                  <option value="roca">Roca</option>
                  <option value="centroOeste">Centro-Oeste</option>
                </select>
                {schedRegion!=="todas"&&<select value={schedType} onChange={e=>setSchedType(e.target.value)} style={{fontSize:12}}><option value="preventivo">Preventiva</option><option value="corretivo">Corretiva</option></select>}
                <select value={schedFilterTech||"todos"} onChange={e=>setSchedFilterTech(e.target.value)} style={{fontSize:12}}>
                  <option value="todos">Todos os técnicos</option>
                  {ALL_TECHS.map(t=><option key={t}>{t}</option>)}
                </select>
                <input type="date" value={schedDate} onChange={e=>setSchedDate(e.target.value)} style={{fontSize:12,padding:"6px 10px",border:"1px solid #E0E0E0",borderRadius:8}}/>
              </div>
            </div>

            {/* VISÃO GERAL — todos técnicos escalados no dia */}
            {schedRegion==="todas"?(()=>{
              const tecnicosEscalados = ALL_TECHS.filter(tech=>{
                if(schedFilterTech!=="todos"&&tech!==schedFilterTech) return false;
                const key=`${tech}__${schedDate}`;
                return (schedule[key]||[]).length>0;
              });
              return(
                <div>
                  <div className="card" style={{padding:"16px 20px",marginBottom:16,background:"#FFFBF0",border:"1px solid #FFE8A0"}}>
                    <div style={{fontSize:12,color:"#C47D00",fontWeight:700,marginBottom:8}}>
                      📅 {schedDate||"Selecione uma data"} — {tecnicosEscalados.length} técnico(s) escalado(s)
                    </div>
                    {tecnicosEscalados.length===0?(
                      <div style={{fontSize:13,color:"#AAA"}}>Nenhum técnico escalado nesta data. Selecione uma região para adicionar atendimentos.</div>
                    ):(
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {tecnicosEscalados.map(tech=>{
                          const slots=(schedule[`${tech}__${schedDate}`]||[]);
                          const color=techColor(tech);
                          const atendidos=slots.filter(s=>s.status==="atendido").length;
                          return(
                            <div key={tech} style={{background:"#FFF",border:`2px solid ${color}`,borderRadius:10,padding:"8px 14px",minWidth:160}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                                <span style={{width:8,height:8,borderRadius:"50%",background:color,display:"inline-block"}}/>
                                <span style={{fontWeight:700,fontSize:13}}>{tech}</span>
                                <span style={{marginLeft:"auto",fontSize:10,color:"#888"}}>{atendidos}/{slots.length}</span>
                              </div>
                              {slots.map((s,i)=>(
                                <div key={i} style={{fontSize:11,color:"#555",padding:"2px 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  <span style={{width:5,height:5,borderRadius:"50%",background:s.status==="atendido"?"#1A7A3C":s.type==="corretivo"?"#C62828":"#1565C0",display:"inline-block",marginRight:5}}/>
                                  {s.client}
                                </div>
                              ))}
                              <div style={{marginTop:6,height:3,background:"#F0F0F0",borderRadius:2}}>
                                <div style={{width:`${slots.length?atendidos/slots.length*100:0}%`,height:3,background:color,borderRadius:2}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:12,color:"#AAA",textAlign:"center"}}>Selecione uma região no filtro acima para adicionar atendimentos a um técnico específico.</div>
                </div>
              );
            })():(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {techsForSched.filter(t=>schedFilterTech==="todos"||t===schedFilterTech).map(tech=>{
                  const key=`${tech}__${schedDate}`;
                  const slots=schedule[key]||[];
                  const color=techColor(tech);
                  return(
                    <div key={tech} className="card" style={{borderTop:`3px solid ${color}`,overflow:"hidden"}}>
                      <div style={{padding:"12px 14px",borderBottom:"1px solid #F4F4F4",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:14}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}/>{tech}</div>
                          <div style={{fontSize:11,color:"#AAA",marginTop:2}}>{slots.length} atendimento(s) · {schedDate}</div>
                        </div>
                        <BtnG onClick={()=>{const client=prompt(`Adicionar empresa para ${tech}:`);if(client){const pat=prompt("Patrimônio:");const tip=schedType||"preventivo";setSchedule(p=>({...p,[key]:[...(p[key]||[]),{client,patrimonio:pat||"",type:tip,status:"pendente"}]}));notify("Adicionado!");}}} style={{fontSize:11,padding:"5px 10px"}}>+ Add</BtnG>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {slots.length===0&&<div style={{fontSize:12,color:"#CCC",textAlign:"center",padding:"8px 0"}}>Sem atendimentos</div>}
                        {slots.map((s,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<slots.length-1?"1px solid #F8F8F8":"none"}}>
                            <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,background:s.status==="atendido"?"#1A7A3C":s.type==="corretivo"?"#C62828":"#1565C0"}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.client}</div>
                              <div style={{fontSize:10,color:"#AAA"}}>{s.patrimonio} · {s.type}</div>
                            </div>
                            <select value={s.status||"pendente"} onChange={e=>{const newSlots=[...slots];newSlots[i]={...s,status:e.target.value};setSchedule(p=>({...p,[key]:newSlots}));}} style={{fontSize:10,padding:"2px 5px",color:s.status==="atendido"?"#1A7A3C":"#888",fontWeight:700,borderRadius:4,border:"1px solid #E0E0E0"}}>
                              <option value="pendente">Pendente</option>
                              <option value="atendido">✓ Atendido</option>
                            </select>
                          </div>
                        ))}
                      </div>
                      {slots.length>0&&<div style={{padding:"6px 14px 12px"}}>
                        <div style={{height:4,background:"#F0F0F0",borderRadius:2}}>
                          <div style={{width:`${slots.filter(s=>s.status==="atendido").length/slots.length*100}%`,height:4,background:color,borderRadius:2,transition:"width .3s"}}/>
                        </div>
                      </div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── AGENDA ── */}
        {tab==="agenda"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            {agendaModal&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setAgendaModal(null)}>
                <div style={{background:"#FFF",borderRadius:16,width:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
                  <div style={{background:"#1A1A1A",padding:"16px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#F5C800"}}>🗓 {agendaModal.tech} · {agendaModal.date}</div>
                    <button onClick={()=>setAgendaModal(null)} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>✕</button>
                  </div>
                  <div style={{padding:22,display:"flex",flexDirection:"column",gap:12}}>
                    <Inp label="Empresa" value={agendaForm.empresa} onChange={v=>setAgendaForm(p=>({...p,empresa:v}))} placeholder="Nome da empresa"/>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:1}}>Patrimônios (até 3)</div>
                      {[0,1,2].map(i=><input key={i} type="text" value={agendaForm[`patrimonio${i===0?"":i+1}`]||""} onChange={e=>{const k=i===0?"patrimonio":`patrimonio${i+1}`;setAgendaForm(p=>({...p,[k]:e.target.value}));}} placeholder={`Patrimônio ${i+1}`}/>)}
                    </div>
                    <Sel label="Status" value={agendaForm.status} onChange={v=>setAgendaForm(p=>({...p,status:v}))} options={Object.entries(AGENDA_STATUS).map(([v,c])=>({v,l:c.label}))}/>
                    <Inp label="Contato / Gestor" value={agendaForm.contato} onChange={v=>setAgendaForm(p=>({...p,contato:v}))} placeholder="Nome do responsável"/>
                    <Inp label="Observações" value={agendaForm.obs} onChange={v=>setAgendaForm(p=>({...p,obs:v}))} placeholder="Obs..."/>
                    <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:4}}>
                      <div>{agendaItems[`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`]&&<BtnG onClick={()=>{const k=`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`;setAgendaItems(p=>{const n={...p};delete n[k];return n;});setAgendaModal(null);notify("Removido.");}} style={{color:"#C62828",borderColor:"#FFCCCC"}}>Remover</BtnG>}</div>
                      <div style={{display:"flex",gap:10}}>
                        <BtnG onClick={()=>setAgendaModal(null)}>Cancelar</BtnG>
                        <BtnY disabled={!agendaForm.empresa} onClick={()=>{setAgendaItems(p=>({...p,[`${agendaModal.tech}__${agendaModal.date}__${agendaModal.idx}`]:agendaForm}));setAgendaModal(null);notify("🗓 Salvo!");}}>Salvar</BtnY>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div><div style={{fontWeight:800,fontSize:22,marginBottom:4}}>🗓 Agenda Preventiva</div><div style={{fontSize:13,color:"#888"}}>2026–2030 · até 5 empresas/dia · 3 patrimônios por empresa</div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <select value={agendaRegion} onChange={e=>{setAgendaRegion(e.target.value);setAgendaTech(e.target.value==="todas"?"todos":REGIONS[e.target.value==="metropolitana"?"metropolitana":e.target.value]?.techs[0]||"Rafael");}} style={{fontSize:12}}><option value="todas">🌐 Visão Geral</option><option value="metropolitana">Metropolitana BH</option><option value="centroOeste">Centro-Oeste</option></select>
                <select value={agendaTech} onChange={e=>setAgendaTech(e.target.value)} style={{fontSize:12}}>{agendaRegion==="todas"?[<option key="todos" value="todos">Todos os técnicos</option>,...ALL_TECHS.map(t=><option key={t}>{t}</option>)]:(agendaRegion==="metropolitana"?METRO_PREV:REGIONS.centroOeste.techs).map(t=><option key={t}>{t}</option>)}</select>
                <select value={agendaMonth} onChange={e=>setAgendaMonth(Number(e.target.value))} style={{fontSize:12}}>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                <select value={agendaYear} onChange={e=>setAgendaYear(Number(e.target.value))} style={{fontSize:12}}>{[2026,2027,2028,2029,2030].map(y=><option key={y}>{y}</option>)}</select>
              </div>
            </div>
            {/* Legenda */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
              {Object.entries(AGENDA_STATUS).map(([k,s])=><div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"}}><div style={{width:8,height:8,borderRadius:"50%",background:s.dot}}/>{s.label}</div>)}
            </div>
            {/* Grade */}
            {(()=>{
              const daysInMonth=getDaysInMonth(agendaYear,agendaMonth);
              const firstDow=getDayOfWeek(agendaYear,agendaMonth,1);
              const weeks=[]; let day=1-firstDow;
              while(day<=daysInMonth){const week=[];for(let d=0;d<7;d++,day++)week.push(day);weeks.push(week);}
              const DOWS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
              return(
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#1A1A1A"}}>
                    {DOWS.map(d=><div key={d} style={{padding:"7px 0",textAlign:"center",fontSize:10,fontWeight:700,color:d==="Dom"||d==="Sáb"?"#F5C800":"#888",letterSpacing:1}}>{d}</div>)}
                  </div>
                  {weeks.map((week,wi)=>(
                    <div key={wi} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderTop:"1px solid #F0F0F0"}}>
                      {week.map((day,di)=>{
                        const isValid=day>=1&&day<=daysInMonth;
                        const isWeekend=di===0||di===6;
                        const dateStr=isValid?`${agendaYear}-${String(agendaMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`:""
                        const isToday=dateStr===TODAY_STR;
                        const slots=isValid?[0,1,2,3,4].map(i=>({idx:i,key:`${agendaTech}__${dateStr}__${i}`,data:agendaItems[`${agendaTech}__${dateStr}__${i}`]||null})):[];
                        const filled=slots.filter(s=>s.data).length;
                        return(
                          <div key={di} style={{minHeight:100,padding:"5px 5px 4px",borderRight:di<6?"1px solid #F0F0F0":"none",background:!isValid?"#FAFAFA":isWeekend?"#FFFBF0":isToday?"#FFFFF0":"#FFF",opacity:!isValid?.3:1}}>
                            {isValid&&<>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                                <div style={{fontSize:11,fontWeight:isToday?800:500,color:isToday?"#F5C800":isWeekend?"#AAA":"#1A1A1A",background:isToday?"#1A1A1A":"transparent",borderRadius:isToday?10:0,padding:isToday?"1px 5px":"0"}}>{day}</div>
                                {!isWeekend&&filled<5&&<button onClick={()=>{setAgendaModal({tech:agendaTech,date:dateStr,idx:filled});setAgendaForm({empresa:"",patrimonio:"",patrimonio2:"",patrimonio3:"",status:"agendada",contato:"",obs:""}); }} style={{background:"none",border:"none",color:"#CCC",fontSize:15,cursor:"pointer",padding:0}}>+</button>}
                              </div>
                              {slots.map(s=>s.data?(
                                <div key={s.idx} onClick={()=>{setAgendaModal({tech:agendaTech,date:dateStr,idx:s.idx});setAgendaForm(s.data);}}
                                  style={{fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:4,marginBottom:2,cursor:"pointer",background:AGENDA_STATUS[s.data.status]?.bg||"#F0F0F0",color:AGENDA_STATUS[s.data.status]?.color||"#555",borderLeft:`3px solid ${AGENDA_STATUS[s.data.status]?.dot||"#CCC"}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {s.data.empresa}
                                  {s.data.patrimonio&&<span style={{display:"block",fontSize:8,color:"inherit",opacity:.7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.data.patrimonio}</span>}
                                </div>
                              ):null)}
                            </>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div style={{animation:"fadeIn .3s ease"}}>
            <div style={{fontWeight:800,fontSize:22,marginBottom:20}}>📊 Dashboard de Atendimentos</div>

            {/* Stats gerais */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {l:"Total Relatórios",v:reports.length,c:"#1A1A1A"},
                {l:"Preventivos",v:reports.filter(r=>r.type==="preventivo").length,c:"#1565C0"},
                {l:"Corretivos",v:reports.filter(r=>r.type==="corretivo").length,c:"#C62828"},
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
              const parseMin=h=>{if(!h)return 0;const m=h.match(/(\d+)[hH:](\d+)?/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
              const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
              const mesReps=reports.filter(r=>r.date&&r.date.startsWith(mesAtual));
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
                const parseMin=h=>{if(!h)return 0;const m=h.match(/(\d+)[hH:](\d+)?/);return m?parseInt(m[1])*60+parseInt(m[2]||0):0;};
                const fmtMin=m=>m>0?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:"—";
                const mesAtual=`${TODAY.getFullYear()}-${PAD(TODAY.getMonth()+1)}`;
                const techReps=reports.filter(r=>r.tecnico===tech&&r.date&&r.date.startsWith(mesAtual));
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
                <BtnY onClick={()=>setUberPedidos(p=>[{
                  id:`UBR${Date.now()}`,data:TODAY_STR,solicitante:"",departamento:"MANUTENÇÃO",
                  motivo:"",empresa:"",relatorio:"",endereco:"",valor:"",status:"pendente",obs:""
                },...p])}>+ Novo Pedido</BtnY>
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
                        <th>Empresa</th><th>Relatório</th><th>Endereço</th><th>Valor (R$)</th>
                        <th>Status</th><th>Obs</th>{user.canDelete&&<th>✕</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {uberPedidos.map(p=>(
                        <tr key={p.id}>
                          <td><input type="text" value={p.data||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,data:e.target.value}:x))} style={{width:100,fontSize:11,padding:"3px 6px"}}/></td>
                          <td><input type="text" value={p.solicitante||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,solicitante:e.target.value}:x))} style={{width:110,fontSize:11,padding:"3px 6px"}} placeholder="Nome"/></td>
                          <td>
                            <select value={p.departamento||"MANUTENÇÃO"} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,departamento:e.target.value,motivo:e.target.value==="MANUTENÇÃO"?x.motivo:"OUTROS"}:x))} style={{fontSize:11,padding:"3px 5px",fontWeight:600}}>
                              {["MANUTENÇÃO","RH","COMERCIAL","FROTAS","FINANCEIRO","COMPRAS","ALMOXARIFADO","FISCAL","GILBERTO","GUSTAVO"].map(d=><option key={d}>{d}</option>)}
                            </select>
                          </td>
                          <td>
                            <select value={p.motivo||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,motivo:e.target.value}:x))} style={{fontSize:11,padding:"3px 5px"}}>
                              <option value="">Selecione...</option>
                              {p.departamento==="MANUTENÇÃO"?<option value="ENVIO DE PEÇAS">ENVIO DE PEÇAS</option>:null}
                              <option value="OUTROS">OUTROS</option>
                            </select>
                          </td>
                          <td><input type="text" value={p.empresa||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,empresa:e.target.value}:x))} style={{width:130,fontSize:11,padding:"3px 6px"}} placeholder="Empresa"/></td>
                          <td><input type="text" value={p.relatorio||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,relatorio:e.target.value}:x))} style={{width:90,fontSize:11,padding:"3px 6px"}} placeholder="REL-001"/></td>
                          <td><input type="text" value={p.endereco||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,endereco:e.target.value}:x))} style={{width:150,fontSize:11,padding:"3px 6px"}} placeholder="Rua, número..."/></td>
                          <td><input type="text" value={p.valor||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,valor:e.target.value}:x))} style={{width:80,fontSize:11,padding:"3px 6px",textAlign:"right"}} placeholder="0,00"/></td>
                          <td>
                            <select value={p.status||"pendente"} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,status:e.target.value}:x))}
                              style={{fontSize:11,padding:"3px 5px",fontWeight:700,borderRadius:5,border:"none",
                                color:p.status==="concluido"?"#1A7A3C":p.status==="cancelado"?"#C62828":"#E67E00",
                                background:p.status==="concluido"?"#F0FFF5":p.status==="cancelado"?"#FFF0F0":"#FFF8F0"}}>
                              <option value="pendente">⏳ Pendente</option>
                              <option value="em_andamento">🚗 Em Andamento</option>
                              <option value="concluido">✅ Concluído</option>
                              <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </td>
                          <td><input type="text" value={p.obs||""} onChange={e=>setUberPedidos(u=>u.map(x=>x.id===p.id?{...x,obs:e.target.value}:x))} style={{width:130,fontSize:11,padding:"3px 6px"}} placeholder="Observações..."/></td>
                          {user.canDelete&&<td><button onClick={()=>{if(window.confirm("Excluir pedido?"))setUberPedidos(u=>u.filter(x=>x.id!==p.id));}} style={{background:"#FFF0F0",border:"none",borderRadius:5,color:"#C62828",cursor:"pointer",padding:"3px 8px",fontSize:11,fontWeight:700}}>✕</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


      {modalReport&&<ReportModal onClose={()=>setModalReport(false)} onSave={d=>{setReports(p=>[d,...p]);db.save("relatorios",d.id,d);notify("✅ Relatório salvo!");}}/>}
      {modalMU&&<ProcessoModal onClose={()=>setModalMU(false)} onSave={d=>{setProcessosMU(p=>[d,...p]);db.save("processos_mu",d.id,d);notify("✅ Processo Mau Uso salvo!");}} tipo="mau_uso"/>}
      {modalAF&&<ProcessoModal onClose={()=>setModalAF(false)} onSave={d=>{setProcessosAF(p=>[d,...p]);db.save("processos_af",d.id,d);notify("✅ Processo A Faturar salvo!");}} tipo="a_faturar"/>}
      {modalEmp&&<EmpModal onClose={()=>{setModalEmp(false);setEditEmp(null);}} onSave={d=>{if(editEmp)setEmprestimos(p=>p.map(x=>x.id===d.id?d:x));else setEmprestimos(p=>[d,...p]);db.save("emprestimos",d.id,d);notify("✅ Salvo!");}} initial={editEmp}/>}
      {modalSaida&&<SaidaModal onClose={()=>{setModalSaida(false);setEditSaida(null);}} onSave={d=>{if(editSaida)setSaidaEntrada(p=>p.map(x=>x.id===d.id?d:x));else setSaidaEntrada(p=>[d,...p]);db.save("saida_entrada",d.id,d);notify("✅ Salvo!");}} initial={editSaida}/>}
    </div>
  );
}
