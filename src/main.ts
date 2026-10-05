import './style.css'
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://ocnedejiwcvqjiacwbic.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_h4k4MGUIdFiu-Vjk4hKlrg_gGsqUcOz'
const supabase = createClient(url, key)

const root = document.querySelector<HTMLDivElement>('#root')!
let user:any = null
let page = 'home'

const esc=(s:any)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
const money=(n:any)=>n==null?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n))
const date=(d:any)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'No deadline'
const toast=(message:string,bad=false)=>{const x=document.createElement('div');x.className='toast'+(bad?' bad':'');x.textContent=message;document.body.appendChild(x);setTimeout(()=>x.remove(),3200)}
const nav=(p:string)=>{page=p;render()}

async function ensureProfile(){
  if(!user)return
  const {data:p}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle()
  const meta=user.user_metadata||{}
  if(!p){
    await supabase.from('profiles').insert({id:user.id,full_name:meta.full_name||'',company_name:meta.company_name||''})
  }
  const {data:bp}=await supabase.from('business_profiles').select('*').eq('user_id',user.id).maybeSingle()
  if(!bp){
    await supabase.from('business_profiles').insert({
      user_id:user.id,legal_name:meta.company_name||p?.company_name||'',
      services:[],certifications:[],service_areas:[],keywords:[],readiness_score:0,
      country_code:'US',preferred_currency:'USD',preferred_language:'en'
    })
  }
}

function landing(){
 root.innerHTML=`
 <div class="landing">
  <nav><div class="brand"><b>◆</b> Bid<span>Bidder</span></div><div><button class="btn ghost" id="login">Log in</button> <button class="btn primary" id="signup">Get started</button></div></nav>
  <section class="hero"><div><small class="eyebrow">AI-POWERED BID DISCOVERY</small><h1>Find bids.<br><em>Win more business.</em></h1><p>BidBidder helps businesses discover real procurement opportunities, match them to your business, manage applications, and get AI guidance at every step.</p><div class="hero-actions"><button class="btn primary big" id="heroSignup">Start finding bids →</button></div><small>No complicated setup. Built for growing businesses.</small></div>
  <div class="hero-card"><div class="mini-head"><b>AI Match Center</b><span class="live">● LIVE</span></div><div class="match"><div><b>Transportation Services</b><small>Government</small></div><strong>96%</strong></div><div class="match"><div><b>Medical Supply Contract</b><small>Healthcare</small></div><strong>91%</strong></div><div class="match"><div><b>Professional Services</b><small>Education</small></div><strong>87%</strong></div><div class="ai-tip">✦ <span>AI Agent: I can help you find, review and track opportunities.</span></div></div></section>
  <section class="features"><div><span>01</span><h3>Real opportunities</h3><p>Browse procurement opportunities with source links and deadlines.</p></div><div><span>02</span><h3>Smart matching</h3><p>Match bids against your services, keywords and service areas.</p></div><div><span>03</span><h3>Application tracking</h3><p>Save bids, start applications and keep every deadline organized.</p></div><div><span>04</span><h3>AI bid agent</h3><p>Ask for bid guidance, requirements, next steps and best matches.</p></div></section>
  <footer>© 2026 BidBidder. Find. Match. Win.</footer>
 </div>`
 document.querySelector('#login')?.addEventListener('click',()=>auth(false))
 document.querySelectorAll('#signup,#heroSignup').forEach(b=>b.addEventListener('click',()=>auth(true)))
}

function auth(signup=false){
 root.innerHTML=`<div class="auth"><div class="auth-box"><div class="brand center"><b>◆</b> Bid<span>Bidder</span></div><h1>${signup?'Create your account':'Welcome back'}</h1><p>${signup?'Start finding real opportunities.':'Sign in to your BidBidder account.'}</p>
 ${signup?'<input id="name" placeholder="Your name"><input id="company" placeholder="Company name">':''}
 <input id="email" type="email" placeholder="Email"><input id="password" type="password" placeholder="Password">
 <button class="btn primary full" id="submit">${signup?'Create account':'Log in'}</button><button class="text-btn" id="back">← Back</button><div id="msg"></div></div></div>`
 document.querySelector('#back')!.addEventListener('click',landing)
 document.querySelector('#submit')!.addEventListener('click',async()=>{
  const msg=document.querySelector('#msg')!
  const email=(document.querySelector('#email') as HTMLInputElement).value.trim()
  const password=(document.querySelector('#password') as HTMLInputElement).value
  try{
   if(signup){
    const name=(document.querySelector('#name') as HTMLInputElement).value.trim(),company=(document.querySelector('#company') as HTMLInputElement).value.trim()
    const r=await supabase.auth.signUp({email,password,options:{data:{full_name:name,company_name:company},emailRedirectTo:window.location.origin+'/'}})
    if(r.error)throw r.error
    msg.innerHTML='<div class="success">Account created. Check your email if confirmation is required.</div>'
    if(r.data.session){user=r.data.user;await ensureProfile();nav('dashboard')}
   }else{
    const r=await supabase.auth.signInWithPassword({email,password})
    if(r.error)throw r.error
    user=r.data.user;await ensureProfile();nav('dashboard')
   }
  }catch(e:any){msg.innerHTML='<div class="error">'+esc(e.message||'Something went wrong')+'</div>'}
 })
}

function shell(title:string,active:string,content:string){
 root.innerHTML=`<div class="app"><aside><div class="brand"><b>◆</b> Bid<span>Bidder</span></div>
 <button class="nav ${active==='dashboard'?'active':''}" data-p="dashboard">⌂ Dashboard</button>
 <button class="nav ${active==='bids'?'active':''}" data-p="bids">◈ Find Bids</button>
 <button class="nav ${active==='matches'?'active':''}" data-p="matches">✦ AI Match Center</button>
 <button class="nav ${active==='saved'?'active':''}" data-p="saved">☆ Saved</button>
 <button class="nav ${active==='applications'?'active':''}" data-p="applications">✓ Applications</button>
 <button class="nav ${active==='agent'?'active':''}" data-p="agent">✧ AI Bid Agent</button>
 <button class="nav ${active==='notifications'?'active':''}" data-p="notifications">♢ Notifications <i id="noteCount"></i></button>
 <button class="nav ${active==='profile'?'active':''}" data-p="profile">◎ Business Profile</button>
 <div class="sidebottom"><button class="nav" data-p="support">? Help & Support</button><button class="nav" id="signout">↪ Sign out</button></div></aside>
 <main><header><b>${title}</b><span>${esc(user?.email||'')}</span></header><section class="page">${content}</section></main></div>`
 bindNav()
 document.querySelector('#signout')?.addEventListener('click',async()=>{await supabase.auth.signOut();user=null;landing()})
 loadUnread()
}
function bindNav(){document.querySelectorAll<HTMLElement>('[data-p]').forEach(x=>x.addEventListener('click',()=>nav(x.dataset.p!)))}
async function loadUnread(){if(!user)return;const r=await supabase.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null);const n=document.querySelector('#noteCount');if(n)n.textContent=r.count?String(r.count):''}

async function dashboard(){
 const [a,b,c,d]=await Promise.all([
  supabase.from('bid_opportunities').select('*',{count:'exact',head:true}).eq('status','open'),
  supabase.from('bid_applications').select('*',{count:'exact',head:true}).eq('user_id',user.id),
  supabase.from('saved_opportunities').select('*',{count:'exact',head:true}).eq('user_id',user.id),
  supabase.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null)
 ])
 shell('Dashboard','dashboard',`
 <div class="welcome"><div><small class="eyebrow">YOUR BIDBIDDER COMMAND CENTER</small><h1>Let's win some business.</h1><p>Real opportunities, matches, applications and alerts in one place.</p></div><button class="btn primary" data-p="bids">Find new bids →</button></div>
 <div class="stats"><div><small>Open opportunities</small><strong>${a.count||0}</strong></div><div><small>Applications</small><strong>${b.count||0}</strong></div><div><small>Saved bids</small><strong>${c.count||0}</strong></div><div><small>Unread alerts</small><strong>${d.count||0}</strong></div></div>
 <div class="dashboard-grid"><div class="card"><div class="card-head"><h2>AI Match Center</h2><span class="status-dot">● LIVE</span></div><p>Score opportunities against your business profile and show the strongest matches first.</p><button class="btn dark" data-p="matches">View my matches →</button></div>
 <div class="card dark"><h2>AI Bid Agent</h2><p>Ask which bids fit, what the requirements mean, or what you should do next.</p><button class="btn primary" data-p="agent">Ask the AI Agent →</button></div></div>
 <div class="section-head"><h2>Connected bid sources</h2><p>BidBidder is now structured to bring in transportation, medical, healthcare, education and other procurement opportunities.</p></div>`)
 bindNav()
}

function opportunityCard(x:any,score?:number){
 return `<article class="opp"><div class="score">${score??'—'}<small>% MATCH</small></div><div class="opp-main"><div class="opp-top"><div><span class="tag">${esc(x.category||'Other')}</span><h2>${esc(x.title)}</h2><p><b>${esc(x.agency_name||'Buyer')}</b> · ${esc(x.location||'Location')}</p></div><strong>${x.deadline?'Due '+date(x.deadline):'Open'}</strong></div>
 <p class="desc">${esc(x.description||'No description available.')}</p><div class="opp-meta"><span>Type: ${esc(x.opportunity_type||'RFP')}</span><span>Posted: ${date(x.posted_at)}</span>${x.estimated_value?'<span>Value: '+money(x.estimated_value)+'</span>':''}</div>
 <div class="opp-actions"><button class="btn primary apply" data-id="${x.id}">Start application</button><button class="btn ghost save" data-id="${x.id}">☆ Save</button>${x.source_url?'<a class="btn ghost" target="_blank" rel="noopener" href="'+esc(x.source_url)+'">View source ↗</a>':''}</div></div></article>`
}

async function bids(){
 shell('Find Bids','bids',`<div class="pageintro"><small class="eyebrow">LIVE OPPORTUNITY MARKETPLACE</small><h1>Find Bids</h1><p>Search across connected opportunities and filter by industry, location and deadline.</p></div>
 <div class="toolbar"><input id="search" placeholder="Search title, buyer, keyword..."><select id="category"><option value="">All categories</option><option>Construction</option><option>Transportation</option><option>Medical Supplies</option><option>Healthcare Services</option><option>Professional Services</option><option>Facilities & Janitorial</option><option>Information Technology</option><option>Education</option><option>Food Services</option><option>Security</option><option>Other</option></select><select id="state"><option value="">All locations</option><option>Ohio</option><option>Nationwide</option><option>United States</option></select></div><div id="bidList">Loading opportunities...</div>`)
 const r=await supabase.from('bid_opportunities').select('*').eq('status','open').order('deadline',{ascending:true}).limit(100)
 const list=r.data||[]
 const cats=[...new Set(list.map((x:any)=>x.category).filter(Boolean))] as string[]
 const sel=document.querySelector('#category') as HTMLSelectElement
 cats.forEach(c=>sel?.insertAdjacentHTML('beforeend','<option>'+esc(c)+'</option>'))
 const draw=()=>{
  const q=(document.querySelector('#search') as HTMLInputElement).value.toLowerCase()
  const cat=sel.value.toLowerCase(),loc=(document.querySelector('#state') as HTMLSelectElement).value.toLowerCase()
  const filtered=list.filter((x:any)=>{const hay=[x.title,x.agency_name,x.description,x.category,x.location,...(x.keywords||[])].join(' ').toLowerCase();return (!q||hay.includes(q))&&(!cat||String(x.category).toLowerCase()===cat)&&(!loc||hay.includes(loc))})
  const el=document.querySelector('#bidList')!
  el.innerHTML=filtered.length?'<div class="opp-list">'+filtered.map(x=>opportunityCard(x)).join('')+'</div>':'<div class="empty">No open opportunities match those filters.</div>'
  bindBidButtons()
 }
 document.querySelector('#search')?.addEventListener('input',draw);sel?.addEventListener('change',draw);document.querySelector('#state')?.addEventListener('change',draw);draw()
}
async function bindBidButtons(){
 document.querySelectorAll<HTMLButtonElement>('.save').forEach(b=>b.addEventListener('click',async()=>{const r=await supabase.from('saved_opportunities').upsert({user_id:user.id,opportunity_id:b.dataset.id});toast(r.error?r.error.message:'Saved to your pipeline.',!!r.error);if(!r.error)await supabase.from('notifications').insert({user_id:user.id,type:'saved',title:'Bid saved',message:'Opportunity added to your saved bids.',opportunity_id:b.dataset.id})}))
 document.querySelectorAll<HTMLButtonElement>('.apply').forEach(b=>b.addEventListener('click',async()=>{const op=await supabase.from('bid_opportunities').select('title,deadline').eq('id',b.dataset.id).maybeSingle();const ex=await supabase.from('bid_applications').select('id').eq('user_id',user.id).eq('opportunity_id',b.dataset.id).maybeSingle();if(ex.data){toast('You already started this application.');return}const r=await supabase.from('bid_applications').insert({user_id:user.id,opportunity_id:b.dataset.id,status:'planning',due_date:op.data?.deadline});if(r.error){toast(r.error.message,true);return}await supabase.from('notifications').insert({user_id:user.id,type:'application_started',title:'Application started',message:'Your application for '+(op.data?.title||'this opportunity')+' is now in planning.',opportunity_id:b.dataset.id});toast('Application started.');nav('applications')}))
}

function scoreBid(o:any,p:any){
 const terms=[...(o.keywords||[]),o.category||'',o.title||'',o.description||'',o.location||''].join(' ').toLowerCase()
 const keys=[...(p?.keywords||[]),...(p?.services||[]),...(p?.service_areas||[])].map((x:string)=>x.toLowerCase()).filter(Boolean)
 let score=35;const reasons:string[]=[]
 for(const k of keys)if(terms.includes(k)){score+=12;reasons.push('Matches '+k)}
 if(p?.industry&&terms.includes(String(p.industry).toLowerCase())){score+=15;reasons.push('Matches your industry')}
 if(o.country_code==='US'&&p?.country_code==='US'){score+=5;reasons.push('Available in your country')}
 return {score:Math.min(99,score),reasons:[...new Set(reasons)].slice(0,3)}
}
async function matches(){
 const {data:p}=await supabase.from('business_profiles').select('*').eq('user_id',user.id).maybeSingle()
 const r=await supabase.from('bid_opportunities').select('*').eq('status','open').order('deadline',{ascending:true}).limit(100)
 const scored=(r.data||[]).map((x:any)=>({...x,...scoreBid(x,p)})).sort((a:any,b:any)=>b.score-a.score)
 for(const x of scored.slice(0,20)) await supabase.from('bid_matches').upsert({user_id:user.id,opportunity_id:x.id,match_score:x.score,match_reasons:x.reasons,status:'new'},{onConflict:'user_id,opportunity_id'})
 shell('AI Match Center','matches',`<div class="pageintro"><small class="eyebrow">PERSONALIZED MATCHING</small><h1>AI Match Center</h1><p>These scores use your business profile, services, keywords, service areas and industry.</p></div><div class="card"><b>${scored.length}</b> open opportunities scored for you. <button class="btn ghost" data-p="profile">Improve my profile</button></div><div class="opp-list" style="margin-top:15px">${scored.slice(0,20).map((x:any)=>opportunityCard(x,x.score)).join('')}</div>`)
 bindBidButtons()
}

async function listPage(p:string){
 const table=p==='saved'?'saved_opportunities':'bid_applications'
 const r=await supabase.from(table).select('*, bid_opportunities(*)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100)
 let html=''
 if(p==='saved'){
  html=r.data?.length?'<div class="opp-list">'+r.data.map((x:any)=>opportunityCard(x.bid_opportunities||{},undefined)).join('')+'</div>':'<div class="empty">You have no saved bids yet. <button class="btn primary" data-p="bids">Find bids</button></div>'
 }else{
  html=r.data?.length?'<div class="application-list">'+r.data.map((x:any)=>{const o=x.bid_opportunities||{};return '<div class="card application-card" data-app="'+x.id+'"><div class="opp-top"><div><span class="tag">'+esc(o.category||'Bid')+'</span><h2>'+esc(o.title||'Opportunity')+'</h2><p><b>'+esc(o.agency_name||'Buyer')+'</b> · Due '+date(o.deadline)+'</p></div><strong>'+esc(x.status)+'</strong></div><div class="form-grid"><label>Status<select class="app-status"><option value="planning" '+(x.status==='planning'?'selected':'')+'>Planning</option><option value="in_progress" '+(x.status==='in_progress'?'selected':'')+'>In progress</option><option value="submitted" '+(x.status==='submitted'?'selected':'')+'>Submitted</option><option value="under_review" '+(x.status==='under_review'?'selected':'')+'>Under review</option><option value="awarded" '+(x.status==='awarded'?'selected':'')+'>Awarded</option><option value="not_awarded" '+(x.status==='not_awarded'?'selected':'')+'>Not awarded</option></select></label><label>Deadline<input class="app-deadline" type="date" value="'+(x.due_date?String(x.due_date).slice(0,10):'')+'"></label></div><label class="app-notes-label">Application notes / proposal notes<textarea class="app-notes" rows="7" placeholder="Enter your proposal notes, pricing notes, requirements, questions, and next steps...">'+esc(x.notes||'')+'</textarea></label><div class="opp-actions"><button class="btn primary save-application">Save application</button><a class="btn ghost" target="_blank" rel="noopener" href="'+esc(o.source_url||'#')+'">View bid source ↗</a></div><div class="app-msg"></div></div>}).join('')+'</div>':'<div class="empty">No applications yet. <button class="btn primary" data-p="bids">Find a bid</button></div>'
 }
 shell(p==='saved'?'Saved Bids':'Applications',p,`<div class="pageintro"><small class="eyebrow">PIPELINE</small><h1>${p==='saved'?'Saved Bids':'Applications'}</h1><p>${p==='saved'?'Opportunities you want to revisit.':'Track every opportunity you have started, submitted or won.'}</p></div>${html}`)
 bindBidButtons()
 document.querySelectorAll<HTMLButtonElement>('.save-application').forEach(b=>b.addEventListener('click',async()=>{
   const card=b.closest<HTMLElement>('.application-card')!
   const id=card.dataset.app!
   const status=(card.querySelector('.app-status') as HTMLSelectElement).value
   const due=(card.querySelector('.app-deadline') as HTMLInputElement).value
   const notes=(card.querySelector('.app-notes') as HTMLTextAreaElement).value
   const r=await supabase.from('bid_applications').update({status,due_date:due?new Date(due+'T23:59:59').toISOString():null,notes,submitted_at:status==='submitted'?new Date().toISOString():null}).eq('id',id).eq('user_id',user.id)
   const msg=card.querySelector('.app-msg')!
   msg.innerHTML=r.error?'<div class="error">'+esc(r.error.message)+'</div>':'<div class="success">Application saved.</div>'
   if(!r.error){await supabase.from('notifications').insert({user_id:user.id,type:'application_updated',title:'Application updated',message:'Your BidBidder application was updated.',application_id:id})}
 }))
}

async function notifications(){
 const r=await supabase.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100)
 shell('Notifications','notifications',`<div class="pageintro"><small class="eyebrow">ALERT CENTER</small><h1>Notifications</h1><p>New saves, application activity and deadline reminders appear here.</p></div><div class="card list-card">${r.data?.length?r.data.map((x:any)=>'<div class="list-row"><div><b>'+esc(x.title)+'</b><span>'+esc(x.message||'')+'</span></div><small>'+date(x.created_at)+'</small></div>').join(''):'<div class="empty">No notifications yet.</div>'}</div>`)
 if(r.data?.some((x:any)=>!x.read_at))await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).is('read_at',null)
}

async function agent(){
 shell('AI Bid Agent','agent',`<div class="pageintro"><small class="eyebrow">ALWAYS-ON ASSISTANT</small><h1>AI Bid Agent</h1><p>Ask about your best matches, requirements, application steps or deadlines.</p></div><div class="agent-wrap"><div class="chat" id="chat"><div class="bubble">Hi! I’m your BidBidder AI Agent. I can review your current opportunities and help you decide what to do next.</div></div><form id="ask"><input id="question" placeholder="Ask: Which bids fit my business?"><button class="btn primary">Send</button></form></div>`)
 document.querySelector('#ask')!.addEventListener('submit',async e=>{e.preventDefault();const q=(document.querySelector('#question') as HTMLInputElement).value.trim();if(!q)return;const chat=document.querySelector('#chat')!;chat.innerHTML+='<div class="bubble user">'+esc(q)+'</div>';const r=await supabase.functions.invoke('bid-agent',{body:{message:q}});chat.innerHTML+='<div class="bubble">'+esc(r.data?.answer||r.error?.message||'I could not complete that request.')+'</div>';chat.scrollTop=chat.scrollHeight;(document.querySelector('#question') as HTMLInputElement).value='' })
}

async function profile(){
 const {data:p}=await supabase.from('business_profiles').select('*').eq('user_id',user.id).maybeSingle()
 shell('Business Profile','profile',`<div class="pageintro"><small class="eyebrow">MATCHING PROFILE</small><h1>Business Profile</h1><p>Tell BidBidder what you sell so the Match Center can find better opportunities.</p></div><div class="card form-card"><div class="form-grid"><label>Industry<input id="industry" value="${esc(p?.industry||'')}"></label><label>Service areas<input id="areas" value="${esc((p?.service_areas||[]).join(', '))}"></label><label>Services<input id="services" value="${esc((p?.services||[]).join(', '))}"></label><label>Keywords<input id="keywords" value="${esc((p?.keywords||[]).join(', '))}"></label></div><label>Certifications<input id="certs" value="${esc((p?.certifications||[]).join(', '))}"></label><button class="btn primary" id="saveProfile">Save profile</button><div id="profileMsg"></div></div>`)
 document.querySelector('#saveProfile')!.addEventListener('click',async()=>{const arr=(id:string)=>((document.querySelector('#'+id) as HTMLInputElement).value||'').split(',').map(x=>x.trim()).filter(Boolean);const r=await supabase.from('business_profiles').upsert({user_id:user.id,industry:(document.querySelector('#industry') as HTMLInputElement).value.trim(),service_areas:arr('areas'),services:arr('services'),keywords:arr('keywords'),certifications:arr('certs'),readiness_score:70});document.querySelector('#profileMsg')!.innerHTML=r.error?'<div class="error">'+esc(r.error.message)+'</div>':'<div class="success">Profile saved. Your AI Match Center will use these details.</div>'})
}

function support(){
 shell('Help & Support','support',`<div class="pageintro"><small class="eyebrow">SUPPORT</small><h1>Help & Support</h1><p>Send BidBidder a question or report a problem.</p></div><div class="card form-card"><form id="support"><label>Subject<input id="subject"></label><label>Message<textarea id="description" rows="6"></textarea></label><button class="btn primary">Send support request</button><div id="supportMsg"></div></form></div>`)
 document.querySelector('#support')!.addEventListener('submit',async e=>{e.preventDefault();const r=await supabase.from('support_requests').insert({user_id:user.id,subject:(document.querySelector('#subject') as HTMLInputElement).value,message:(document.querySelector('#description') as HTMLTextAreaElement).value});document.querySelector('#supportMsg')!.innerHTML=r.error?'<div class="error">'+esc(r.error.message)+'</div>':'<div class="success">Request sent.</div>'})
}

async function render(){
 if(!user){landing();return}
 await ensureProfile()
 if(page==='dashboard')await dashboard()
 else if(page==='bids')await bids()
 else if(page==='matches')await matches()
 else if(page==='saved')await listPage('saved')
 else if(page==='applications')await listPage('applications')
 else if(page==='agent')await agent()
 else if(page==='notifications')await notifications()
 else if(page==='profile')await profile()
 else support()
}
landing()
supabase.auth.getSession().then(async r=>{if(r.data.session){user=r.data.session.user;page='dashboard';await render()}})
