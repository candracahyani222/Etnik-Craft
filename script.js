const products = window.PRODUCTS || [];
const grid = document.getElementById('productGrid');
const filters = document.getElementById('filters');
const search = document.getElementById('searchInput');
const empty = document.getElementById('emptyState');
let activeCategory = 'Semua';

const categories = ['Semua', ...new Set(products.map(p => p.category))];

function renderFilters(){
  filters.innerHTML = categories.map(c => `<button class="filter ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join('');
  filters.querySelectorAll('.filter').forEach(btn=>{
    btn.addEventListener('click',()=>{
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderProducts();
    });
  });
}

function productCard(p){
  return `<article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="Lihat ${escapeHtml(p.name)}">
    <div class="product-img"><img loading="lazy" src="${p.image}" alt="${escapeHtml(p.name)}"></div>
    <div class="product-info">
      <div class="product-cat">${escapeHtml(p.category)}</div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="product-price">${escapeHtml(p.price)}</div>
    </div>
    <span class="plus">+</span>
  </article>`;
}

function renderProducts(){
  const q = search.value.trim().toLowerCase();
  const list = products.filter(p =>
    (activeCategory === 'Semua' || p.category === activeCategory) &&
    (!q || `${p.name} ${p.category}`.toLowerCase().includes(q))
  );
  grid.innerHTML = list.map(productCard).join('');
  empty.hidden = list.length !== 0;
  grid.querySelectorAll('.product-card').forEach(card=>{
    card.addEventListener('click',()=>openModal(Number(card.dataset.id)));
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')openModal(Number(card.dataset.id));});
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalCategory = document.getElementById('modalCategory');
const modalWhatsApp = document.getElementById('modalWhatsApp');

function openModal(id){
  const p = products.find(x=>x.id===id);
  if(!p)return;
  modalImage.src=p.image;
  modalImage.alt=p.name;
  modalTitle.textContent=p.name;
  modalPrice.textContent=p.price;
  modalCategory.textContent=p.category;
  modalWhatsApp.href=`https://wa.me/6281818452400?text=${encodeURIComponent(`Halo Kak, saya tertarik membeli ${p.name} dari Etnik Craft.`)}`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
modal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
search.addEventListener('input',renderProducts);

const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

/* Mini game */
const gameProducts = document.getElementById('gameProducts');
const basketItems = document.getElementById('basketItems');
const basket = document.getElementById('basket');
const counter = document.getElementById('gameCounter');
const reset = document.getElementById('resetGame');
const complete = document.getElementById('gameComplete');
const gameWhatsApp = document.getElementById('gameWhatsApp');
const gameSet = products.filter(p => ['Makanan','Aksesori','Fashion / Tenun','Kerajinan'].includes(p.category)).slice(0,8);
let chosen = [];

function renderGameProducts(){
  gameProducts.innerHTML = gameSet.map((p,i)=>`
    <div class="game-product" draggable="true" data-id="${p.id}">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" draggable="false">
      <small>${escapeHtml(p.name)}</small>
      <button type="button">+ Masukkan</button>
    </div>`).join('');
  gameProducts.querySelectorAll('.game-product').forEach(el=>{
    const id=Number(el.dataset.id);
    el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',String(id)));
    el.addEventListener('click',()=>addToBasket(id));
    el.querySelector('button').addEventListener('click',e=>{e.stopPropagation();addToBasket(id)});
  });
}
basket.addEventListener('dragover',e=>e.preventDefault());
basket.addEventListener('drop',e=>{e.preventDefault();const id=Number(e.dataTransfer.getData('text/plain'));addToBasket(id)});

function addToBasket(id){
  const p=products.find(x=>x.id===id);
  if(!p || chosen.length>=8)return;
  chosen.push(p);
  const item=document.createElement('div');
  item.className='basket-item';
  item.style.left=(10+Math.random()*72)+'%';
  item.style.bottom=(8+Math.random()*55)+'px';
  item.style.transform=`rotate(${(-12+Math.random()*24).toFixed(1)}deg)`;
  item.innerHTML=`<img src="${p.image}" alt="${escapeHtml(p.name)}">`;
  basketItems.appendChild(item);
  counter.textContent=`${chosen.length} oleh-oleh ${chosen.length===1?'sudah masuk':'sudah masuk'}`;
  if(chosen.length>=5){
    complete.hidden=false;
    counter.textContent=`${chosen.length} oleh-oleh sudah masuk ✦`;
  }
  if(chosen.length>=8){
    complete.querySelector('b').textContent='Keranjangmu benar-benar penuh!';
  }
}
reset.addEventListener('click',()=>{
  chosen=[];
  basketItems.innerHTML='';
  complete.hidden=true;
  counter.textContent='0 oleh-oleh sudah masuk';
});
gameWhatsApp.addEventListener('click',()=>{
  const names=chosen.map(p=>`• ${p.name}`).join('\n');
  const text=`Halo Kak, saya tertarik dengan beberapa produk Etnik Craft.\n\n${names}\n\nBoleh info ketersediaan dan cara ordernya?`;
  window.open(`https://wa.me/6281818452400?text=${encodeURIComponent(text)}`,'_blank');
});

renderFilters();
renderProducts();
renderGameProducts();
