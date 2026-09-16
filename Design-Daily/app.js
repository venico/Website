'use strict';
const $ = id => document.getElementById(id);
const SOURCE_LABELS = {"欧洲设计学院":"欧洲设计学院","欧洲新车安全评鉴协会":"欧洲新车安全评鉴协会","大众汽车新闻中心":"大众汽车新闻中心","Dezeen": "德泽恩", "designboom": "设计邦", "Yanko Design": "扬科设计", "Smashing Magazine": "设计与开发杂志", "Nielsen Norman Group": "尼尔森诺曼集团", "Motionographer": "动态设计观察", "Core77": "工业设计网", "Creative Bloq": "创意视界"};
const sourceName = name => SOURCE_LABELS[name] || data?.sourceLabels?.[name] || data?.sources?.find(s=>s.name===name)?.label || '设计媒体';
const categoryLabel = name => ({'用户体验设计':'UX设计','界面设计':'UI设计','人工智能设计':'AI设计'}[name] || name);
const CATEGORIES = ['全部','用户体验设计','界面设计','人工智能设计','工业设计','动效设计','动态设计','家具设计','交通工具设计','建筑设计','空间设计','视觉设计'];
let data, category='全部', sort='hot', selectedDate='', limit=11;
let activeArticle=null;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=u=>{try{const url=new URL(u);return url.protocol==='https:'?escapeHTML(url.href):''}catch{return ''}};
const fmtDate=d=>d.replaceAll('-','.');
const currentIssue=()=>data.issues.find(i=>i.date===selectedDate);
const issueArticles=()=>{const ids=new Set(currentIssue()?.articleIds??[]);return data.articles.filter(a=>ids.has(a.id))};
const ordered=articles=>[...articles].sort((a,b)=>sort==='hot'?b.score-a.score||b.publishedAt.localeCompare(a.publishedAt):b.publishedAt.localeCompare(a.publishedAt));
const heat=a=>`<span class="score" title="本站关注指数 ${a.score}，并非阅读量"><span class="score-bars" aria-hidden="true"><i></i><i></i><i></i></span>${a.score}</span>`;
const collage=a=>{
 const n=parseInt(a.id.slice(-4),16)%4;
 const shapes=[`<circle cx="340" cy="260" r="160" fill="#20251e"/><path d="M360 100h210v310H360z" fill="#d7f533" transform="rotate(18 460 250)"/><circle cx="340" cy="260" r="70" fill="#eeeee5"/>`,`<path d="M160 400 370 80 580 400z" fill="#20251e"/><circle cx="500" cy="180" r="100" fill="#d7f533"/><path d="M140 330h430v70H140z" fill="#b8bbaa" transform="rotate(-12 340 360)"/>`,`<rect x="200" y="100" width="170" height="290" fill="#20251e" transform="rotate(-18 285 245)"/><path d="M380 120a150 150 0 0 1 0 300z" fill="#d7f533"/><circle cx="530" cy="360" r="55" fill="#858c78"/>`,`<circle cx="390" cy="260" r="170" fill="#b6bba8"/><path d="M190 130h300v150H190z" fill="#20251e" transform="rotate(12 340 200)"/><path d="M320 270h240v120H320z" fill="#d7f533" transform="rotate(-16 440 330)"/>`];
 return `<svg class="collage" viewBox="0 0 800 500" role="img" aria-label="极简几何拼贴缺省封面"><rect width="800" height="500" fill="#eeeee5"/>${shapes[n]}<path d="M70 440h660" stroke="#9ba08f"/><text x="70" y="470" fill="#656d59" font-size="12" font-weight="400" letter-spacing="2">象素之间 · 灵感拼贴</text></svg>`;
};
const videoPlayer=a=>a.video?.provider==='vimeo'&&/^\d+$/.test(a.video.id)?`<div class="video-player"><iframe src="https://player.vimeo.com/video/${a.video.id}" title="${escapeHTML(a.titleZh)} · 视频" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div><p class="video-help">点击播放；若播放器无法加载，可通过原文入口观看。</p>`:'';
function story(a,index,kind=''){
 const title=a.titleZh||'设计资讯';
 return `<article class="story ${kind}"><a href="?article=${a.id}" data-article="${a.id}" aria-label="查看详情：${escapeHTML(title)}"><div class="story-image ${a.image?'':'no-image'}">${a.image?`<img src="${safeURL(a.image)}" alt="${escapeHTML(title)}" ${index>1?'loading="lazy"':'fetchpriority="high"'} decoding="async">`:collage(a)}${a.video?'<span class="video-label"><span aria-hidden="true">▶</span><span>播放视频</span></span>':''}${kind==='featured'?'<span class="featured-label">本期关注</span>':''}${a.image?`<span class="image-credit">${escapeHTML(sourceName(a.source))}</span>`:''}</div><div class="story-category"><span class="category-name">${escapeHTML(categoryLabel(a.category))}</span>${heat(a)}</div><${kind?'h2':'h3'}>${escapeHTML(title)}</${kind?'h2':'h3'}><p class="summary">${escapeHTML(a.summaryZh||'前往来源网站阅读全文。')}</p><div class="story-meta"><span class="source">${escapeHTML(sourceName(a.source))} <span class="source-arrow">↗</span></span><time datetime="${escapeHTML(a.publishedAt)}">${fmtDate(a.date)} 发布</time></div></a></article>`;
}
function showInfo(title,body){$('dialogTitle').textContent=title;$('dialogBody').innerHTML=body;if(!$('infoDialog').open)$('infoDialog').showModal()}
const DAILY_LINES=[
 ['设计，','每天发生。','从屏幕到日常物件，保持对好设计的好奇。'],
 ['换个角度，','看见日常。','一把椅子，一次点击，都藏着重新思考的可能。'],
 ['好设计，','值得停留。','放慢一点，看看形态、材料与体验之间的关系。'],
 ['灵感，','就在身边。','从一个细节出发，发现生活还有多少种解法。'],
 ['让想法，','走进生活。','连接数字与实体，观察创意如何成为真实体验。'],
 ['少一点，','想深一点。','去掉多余的表达，让真正重要的体验浮现。'],
 ['从细节，','读懂设计。','留意那些不显眼的决定，它们常常改变整体。'],
 ['保持好奇，','继续发现。','今天的新作品，也许会打开明天的新思路。'],
 ['日常之中，','另有可能。','把熟悉的事物再看一遍，让问题带来新的方向。'],
 ['形式之外，','还有体验。','不止看它是什么样，也关心它如何被使用。'],
 ['让创意，','有迹可循。','沿着作品寻找过程，看见每一次选择的理由。'],
 ['在变化中，','寻找秩序。','从界面到空间，观察设计怎样回应新的生活。'],
 ['把目光，','交给细节。','一处转角，一段动效，都能成为今天的灵感。'],
 ['设计未完，','探索继续。','收集值得思考的作品，让好问题不断生长。']
];
function renderDailyLines(){
 const day=Math.floor(Date.parse(selectedDate+'T00:00:00Z')/86400000);
 const line=DAILY_LINES[((day%DAILY_LINES.length)+DAILY_LINES.length)%DAILY_LINES.length];
 const copy=currentIssue()?.masthead;
 $('site-title').innerHTML=escapeHTML(copy?.lead||line[0])+'<span>'+escapeHTML(copy?.title||line[1])+'</span><i aria-hidden="true">✳</i>';
 document.querySelector('.masthead p').textContent=copy?.subtitle||line[2];
}
function render(){
 renderDailyLines();
 const issue=issueArticles(), dates=data.issues.map(i=>i.date).sort();
 const items=ordered(issue.filter(a=>category==='全部'||a.category===category));
 $('datePicker').value=selectedDate;$('datePicker').min=dates[0];$('datePicker').max=dates.at(-1);
 $('weekday').textContent=new Date(selectedDate+'T12:00:00+08:00').toLocaleDateString('zh-CN',{weekday:'long',timeZone:'Asia/Shanghai'});
 $('issueMonth').textContent=selectedDate.slice(5).replace('-','.');$('issueYear').textContent=selectedDate.slice(0,4)+' 年 · 第 '+String(Math.max(1,dates.indexOf(selectedDate)+1)).padStart(3,'0')+' 期';
 $('previousDay').disabled=!dates.some(d=>d<selectedDate);$('nextDay').disabled=!dates.some(d=>d>selectedDate);
 $('articleCount').textContent=`${items.length} 条资讯 · ${new Set(items.map(a=>a.source)).size} 个来源`;
 $('categories').innerHTML=CATEGORIES.map(c=>`<button data-category="${c}" class="${category===c?'active':''}" aria-pressed="${category===c}">${categoryLabel(c)}<small>${c==='全部'?issue.length:issue.filter(a=>a.category===c).length}</small></button>`).join('');
 $('sortHot').classList.toggle('selected',sort==='hot');$('sortNew').classList.toggle('selected',sort==='new');$('sortHot').setAttribute('aria-pressed',sort==='hot');$('sortNew').setAttribute('aria-pressed',sort==='new');
 if(!items.length){$('news').innerHTML=`<div class="empty-state"><span class="eyebrow">给好奇心一点留白</span><h2>${currentIssue()?'这一期，暂时没有这个领域的资讯。':'这一天还没有日报。'}</h2><p>只收录已采集的内容。可以切换设计领域，或回到最近一期。</p><button id="resetFilters">查看最近一期 · 全部设计</button></div>`;$('resetFilters').onclick=()=>{category='全部';selectedDate=dates.at(-1);limit=11;render()};$('loadMoreStatus').hidden=true;return}
 const ranked=[...issue].sort((a,b)=>b.score-a.score).slice(0,5);
 const featured=`<div class="feature-grid">${story(items[0],0,'featured')}${items[1]?`<div class="feature-secondary">${story(items[1],1,'secondary')}</div>`:''}<aside class="hot-panel" aria-label="本期热度榜"><h2 class="section-title">本期热度榜 <span>趋势观察 ↗</span></h2>${ranked.map((a,i)=>`<a class="hot-item" href="?article=${a.id}" data-article="${a.id}"><span class="hot-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHTML(a.titleZh||'设计资讯')}</h3><p>${escapeHTML(categoryLabel(a.category))} · 关注指数 ${a.score}</p></div></a>`).join('')}</aside></div>`;
 const rest=items.slice(2,limit);
 $('news').innerHTML=featured+(rest.length?`<div class="feed-heading"><h2>继续发现<span>更多设计发现</span></h2><span>${category==='全部'?'跨越领域的设计视角':categoryLabel(category)}</span></div><div class="news-grid">${rest.map((a,i)=>story(a,i+2)).join('')}</div>`:'');
 bindCoverFallbacks($('news'));
 updateLoadStatus(items.length);
}

function bindCoverFallbacks(root){
 root.querySelectorAll('.story-image img').forEach(img=>img.addEventListener('error',()=>{const holder=img.parentElement;holder.classList.add('no-image');const label=img.closest('.story').querySelector('.category-name').textContent;img.remove();holder.querySelector('.image-credit')?.remove();holder.insertAdjacentHTML('afterbegin',collage({id:holder.closest('.story').querySelector('[data-article]').dataset.article}))},{once:true}));
}
function updateLoadStatus(total){
 const status=$('loadMoreStatus');
 status.hidden=total===0;
 status.textContent=limit<total?'上滑自动加载 20 条':'本期资讯已全部加载';
}
function loadNextPage(){
 if(!data||$('listingPage').hidden)return;
 const items=ordered(issueArticles().filter(a=>category==='全部'||a.category===category));
 if(limit>=items.length)return;
 const grid=$('news').querySelector('.news-grid');
 if(!grid)return;
 const start=limit;limit=Math.min(limit+20,items.length);
 const fragment=document.createElement('div');
 fragment.innerHTML=items.slice(start,limit).map((a,i)=>story(a,start+i)).join('');
 bindCoverFallbacks(fragment);
 grid.append(...fragment.children);
 updateLoadStatus(items.length);
}
const loadObserver=new IntersectionObserver(entries=>{
 if(entries.some(entry=>entry.isIntersecting))loadNextPage();
},{rootMargin:'0px 0px 200px 0px'});
loadObserver.observe($('loadMoreStatus'));

function changeDate(value){selectedDate=value;limit=11;activeArticle=null;showListing();render();syncListURL()}
function archives(){showInfo('每一天，都值得翻阅。',`<p>按采集日期归档，文章卡片保留原始发布日期。</p>${[...data.issues].sort((a,b)=>b.date.localeCompare(a.date)).map(i=>`<button class="archive-day" data-date="${i.date}">${fmtDate(i.date)}<span>${i.articleIds.length} 条资讯 ↗</span></button>`).join('')}`)}
function sources(scope=null){
 const catalog=data.sourceCatalog||data.sources;
 const cats=scope&&scope!=='全部'?[scope]:CATEGORIES.filter(c=>c!=='全部');
 const issued=issueArticles().filter(a=>!scope||scope==='全部'||a.category===scope);
 const names=new Set(issued.map(a=>a.source));
 const count=catalog.filter(s=>!scope||scope==='全部'||(s.categories||[s.category]).includes(scope)).length;
 const supplements=[...new Map(issued.filter(a=>!catalog.some(s=>s.name===a.source)).map(a=>[a.source,a])).values()];
 const extra=supplements.length?'<section class="source-group"><h3>本期补充来源</h3><ul class="source-list">'+supplements.map(a=>`<li class="source-row"><a href="${safeURL(a.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(sourceName(a.source))} ↗</a><small>人工核实原文</small></li>`).join('')+'</ul></section>':'';
 const groups=cats.map(c=>{
  const list=catalog.filter(s=>(s.categories||[s.category]).includes(c));
  return `<section class="source-group"><h3>${escapeHTML(categoryLabel(c))}<small>${list.length} 个来源</small></h3><ul class="source-list">${list.map(s=>{
   const status=data.sources.find(x=>x.name===s.name);
   const note=s.mode==='curated'?'网页精选来源':status?.ok?'订阅采集正常':'订阅源 · 待下次采集验证';
   return `<li class="source-row"><a href="${safeURL(s.homepage||s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.label)} ↗</a><small>${names.has(s.name)?'本期有收录 · ':''}${note}</small></li>`;
  }).join('')}</ul></section>`;
 }).join('');
 showInfo(scope&&scope!=='全部'?categoryLabel(scope)+' · 资讯来源':'全部资讯来源',`<p>共 ${count} 个来源。跨领域媒体会列在多个分类中，总数按来源去重。${scope?'本期实际收录 '+names.size+' 个来源。':''}</p>${groups}${extra}<p>插画、包装归入视觉设计；室内、展示归入空间设计。来源目录不等于本期收录数量；文章保留原文入口。</p>`);
}

$('closeDialog').onclick=()=>$('infoDialog').close();$('infoDialog').addEventListener('click',e=>{if(e.target===$('infoDialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close()}});
$('dialogBody').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(b){changeDate(b.dataset.date);$('infoDialog').close()}});
$('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;limit=11;render();syncListURL()}});
$('datePicker').onchange=e=>{if(e.target.value)changeDate(e.target.value)};
$('previousDay').onclick=()=>{const d=data.issues.map(i=>i.date).filter(d=>d<selectedDate).sort().at(-1);if(d)changeDate(d)};
$('nextDay').onclick=()=>{const d=data.issues.map(i=>i.date).filter(d=>d>selectedDate).sort()[0];if(d)changeDate(d)};
$('sortHot').onclick=()=>{sort='hot';render();syncListURL()};$('sortNew').onclick=()=>{sort='new';render();syncListURL()};
$('todayButton').onclick=()=>{category='全部';changeDate(data.issues.map(i=>i.date).sort().at(-1))};$('archiveButton').onclick=archives;$('sourcesButton').onclick=()=>sources();$('articleCount').onclick=()=>sources(category);
$('aboutButton').onclick=()=>showInfo('设计，每天发生。','<p>象素之间 是一份跨领域的设计资讯日报。从工业产品到交互界面，从动态影像到家具与出行，每天整理设计的新动向。</p><p>首页浏览简介，详情页阅读中文整理与设计解读，也可前往原文深入了解。日报按采集日期归档，各条资讯标注原始发布日期。</p><p>人工智能设计栏目收录人工智能工具、生成式创作与相关设计实践。动效关注交互与界面运动，动态设计关注影像、动画与视觉叙事。</p>');
async function start(){try{const r=await fetch('./data.json',{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);data=await r.json();if(!data.issues?.length)throw Error('No editions');const params=new URLSearchParams(location.search);selectedDate=params.get('date')||data.issues.map(i=>i.date).sort().at(-1);if(!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate))selectedDate=data.issues.map(i=>i.date).sort().at(-1);category=CATEGORIES.includes(params.get('category'))?params.get('category'):'全部';sort=params.get('sort')==='new'?'new':'hot';$('scheduleNote').textContent=data.schedule?.active?'每天 09:00（北京时间）更新':'每日简报计划：北京时间 09:00，推送尚未启用。';render();if(params.get('article'))openArticle(params.get('article'),false)}catch(e){$('news').innerHTML='<div class="empty-state"><h2>日报暂时没有展开。</h2><p>资讯读取失败，请稍后重试。</p><button id="retry">重新加载</button></div>';$('retry').onclick=start;$('articleCount').textContent='连接暂时中断'}}

function listURL(){const p=new URLSearchParams({date:selectedDate,category,sort});return '?'+p.toString()}
function syncListURL(){if(!activeArticle)history.replaceState(null,'',listURL())}
function showListing(){activeArticle=null;$('listingPage').hidden=false;$('articlePage').hidden=true;document.title='象素之间 · 每天发现好设计'}
function articleGallery(a){
 const seen=new Set(a.image?[new URL(a.image,location.href).href.split('#')[0]]:[]);
 const images=(a.images||[]).filter(image=>{
  const url=safeURL(image.url);if(!url||url==='#')return false;
  const key=new URL(url,location.href).href.split('#')[0];
  if(seen.has(key))return false;seen.add(key);return true;
 });
 return images.length?`<div class="article-gallery">${images.map((image,index)=>`<figure><a href="${safeURL(image.url)}" target="_blank" rel="noopener noreferrer"><img src="${safeURL(image.url)}" alt="${escapeHTML(a.titleZh)} · 配图 ${index+1}" loading="lazy" decoding="async"></a></figure>`).join('')}</div>`:'';
}
function openArticle(id,push=true){
 const article=data.articles.find(a=>a.id===id);
 if(push){history.pushState({article:id},'',listURL()+'&article='+encodeURIComponent(id));window.scrollTo(0,0)}
 activeArticle=id;$('listingPage').hidden=true;$('articlePage').hidden=false;
 if(!article){$('articlePage').innerHTML='<div class="empty-state"><h1>这篇资讯暂时不可用。</h1><p>链接可能已失效，请返回日报继续阅读。</p><a class="primary-link" href="./" data-back>返回日报</a></div>';return}
 const a=article,title=a.titleZh,src=sourceName(a.source);
 document.title=title+' · 象素之间';
 $('articlePage').innerHTML=`<nav class="detail-breadcrumb" aria-label="当前位置"><a href="${listURL()}" data-back>← 返回日报</a><span> / </span><span>${escapeHTML(categoryLabel(a.category))}</span></nav><header class="detail-header"><div class="detail-kicker">${escapeHTML(categoryLabel(a.category))}<span>第 ${String(data.articles.indexOf(a)+1).padStart(3,'0')} 条资讯</span></div><h1>${escapeHTML(title)}</h1><div class="detail-meta"><span>来源：${escapeHTML(src)}</span><time datetime="${escapeHTML(a.publishedAt)}">${fmtDate(a.date)} 发布</time><span>收录于 ${fmtDate(a.firstSeen)}</span></div></header><div class="detail-layout"><article class="detail-content">${videoPlayer(a)}${a.image?`<figure><img src="${safeURL(a.image)}" alt="${escapeHTML(title)}"><figcaption>图片来源：${escapeHTML(src)} · 图片版权归原作者所有</figcaption></figure>`:''}<section class="detail-summary"><span class="eyebrow">中文整理 · 象素之间</span><p class="detail-lead">${escapeHTML(a.summaryZh)}</p>${(a.reading?.sections||[]).map(section=>`<section class="reading-section"><h2>${escapeHTML(section.heading)}</h2>${section.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}</section>`).join('')}${articleGallery(a)}<p class="editorial-note">${a.reading?.basis==='article'?'根据原文独立整理。':'资讯事实依据来源公开摘要整理。'}设计解读为本站编辑观点。完整原文、项目图片及影像请前往来源查看。</p><a class="reading-original" href="${safeURL(a.url)}" target="_blank" rel="noopener noreferrer">前往${escapeHTML(src)}阅读原文 ↗</a></section><a class="detail-back" href="${listURL()}" data-back>← 返回本期，继续发现</a></article><aside class="detail-aside"><div class="original-card"><span class="eyebrow">继续深入阅读</span><h2>设计的细节，<br>值得多看一眼。</h2><p>前往${escapeHTML(src)}查看完整内容。</p><a class="primary-link" href="${safeURL(a.url)}" target="_blank" rel="noopener noreferrer">阅读原文 <span>↗</span></a><small>原文网站可能使用外文。</small></div><div class="detail-index"><span>本期关注指数</span><strong>${a.score}<small> / 100</small></strong><p>依时效与内容完整度估算，<br>不是全网浏览量或点赞量。</p></div></aside></div>`;
 $('articlePage').querySelectorAll('figure img').forEach(img=>img.addEventListener('error',()=>{img.closest('figure').remove()},{once:true}));
}
document.addEventListener('click',e=>{const play=e.target.closest('.video-label');if(play){e.preventDefault();const card=play.closest('.story');const item=data.articles.find(x=>x.id===card.querySelector('[data-article]').dataset.article);const cover=card.querySelector('.story-image');cover.classList.remove('no-image');cover.classList.add('playing');cover.innerHTML=videoPlayer(item);return;}const a=e.target.closest('a[data-article],a[data-back]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(a.hasAttribute('data-back')){history.pushState(null,'',listURL());showListing();render();window.scrollTo(0,0)}else openArticle(a.dataset.article)});
window.addEventListener('popstate',()=>{if(!data)return;const p=new URLSearchParams(location.search);selectedDate=p.get('date')||data.issues.map(i=>i.date).sort().at(-1);category=CATEGORIES.includes(p.get('category'))?p.get('category'):'全部';sort=p.get('sort')==='new'?'new':'hot';if(p.get('article'))openArticle(p.get('article'),false);else{showListing();render()}});
start();

