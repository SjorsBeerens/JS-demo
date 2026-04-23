(function(){
    // Minimal demo6: responsive canvas, single-color background (or simple gradient),
    // only show name and sprite. Keep code tiny and easy to read.
    const canvas = document.getElementById('art');
    const ctx = canvas.getContext('2d');
    const newBtn = document.getElementById('newBtn');
    const nameEl = document.getElementById('name');
    const typesEl = document.getElementById('types');
    const descEl = document.getElementById('desc');
    const rawEl = document.getElementById('raw');

    const typeColors = {
        normal:'#A8A77A', fire:'#EE8130', water:'#6390F0', electric:'#F7D02C', grass:'#7AC74C', ice:'#96D9D6',
        fighting:'#C22E28', poison:'#A33EA1', ground:'#E2BF65', flying:'#A98FF3', psychic:'#F95587', bug:'#A6B91A',
        rock:'#B6A136', ghost:'#735797', dragon:'#6F35FC', dark:'#705746', steel:'#B7B7CE', fairy:'#D685AD'
    };

    function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
    function pickRandomId(){ return randInt(1,898); }

    async function fetchPokemon(id){
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if(!res.ok) throw new Error('API error');
        return res.json();
    }

    function resizeCanvas(){
        // match canvas internal size to displayed size for crisp drawing
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(300, Math.round(rect.width));
        canvas.height = Math.max(200, Math.round(rect.width * 0.75));
    }

    function drawBackground(primary, secondary){
        if(!primary) primary = '#ffffff';
        if(!secondary){
            ctx.fillStyle = primary;
        } else {
            const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
            g.addColorStop(0, primary);
            g.addColorStop(1, secondary);
            ctx.fillStyle = g;
        }
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    function drawSpriteCentered(imgUrl, size){
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = ()=>{
            const w = size, h = size;
            const cx = canvas.width/2, cy = canvas.height/2;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 16;
            ctx.drawImage(img, cx - w/2, cy - h/2, w, h);
            ctx.restore();
        };
        img.src = imgUrl;
    }

    async function loadAndRender(){
        try{
            resizeCanvas();
            // ensure normal UI visible
            document.getElementById('offlineFallback').classList.remove('show');
            canvas.style.display = '';
            const infoEl = document.querySelector('.info'); if(infoEl) infoEl.style.display = '';
            nameEl.textContent = 'Laden...';
            const id = pickRandomId();
            const data = await fetchPokemon(id);
            nameEl.textContent = data.name ? data.name.charAt(0).toUpperCase() + data.name.slice(1) + ` (#${data.id})` : 'Pokémon';

            const mainTypes = data.types.map(t=>t.type.name);
            const primary = typeColors[mainTypes[0]] || '#dddddd';
            const secondary = mainTypes[1] ? (typeColors[mainTypes[1]] || primary) : null;

            // update types UI
            typesEl.innerHTML = '';
            data.types.forEach(t=>{
                const pill = document.createElement('span');
                pill.className = 'type-pill';
                pill.textContent = t.type.name;
                pill.style.background = typeColors[t.type.name] || '#777';
                typesEl.appendChild(pill);
            });

            // description
            descEl.textContent = `Base exp: ${data.base_experience} • Abilities: ${data.abilities.map(a=>a.ability.name).join(', ')}`;

            // raw JSON
            rawEl.textContent = JSON.stringify(data, null, 2);

            drawBackground(primary, secondary);

            const spriteUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            const size = Math.max(120, Math.min(360, data.base_experience * 1.2));
            if(spriteUrl) drawSpriteCentered(spriteUrl, size);
        }catch(err){
            console.error(err);
                // Always show the friendly offline fallback when a fetch error occurs
                showOfflineFallback();
        }
    }

    function showOfflineFallback(){
        // hide canvas and info pane
        ctx.clearRect(0,0,canvas.width,canvas.height);
        canvas.style.display = 'none';
        const infoEl = document.querySelector('.info'); if(infoEl) infoEl.style.display = 'none';

        const fb = document.getElementById('offlineFallback');
                fb.innerHTML = '';
                fb.classList.add('show');
                fb.setAttribute('aria-hidden', 'false');

                // Try to show bundled pikachu.png first; fall back to SVG if not available
                const img = document.createElement('img');
                img.alt = 'Pikachu';
                img.style.maxWidth = '320px';
                img.style.width = '60%';
                img.style.borderRadius = '8px';
                img.src = 'pikachu.png';

                const appendMessageAndRetry = (container)=>{
                        const h2 = document.createElement('h2'); h2.textContent = 'Geen verbinding met de API';
                        const p = document.createElement('p'); p.textContent = 'Helaas kan ik nu geen Pokémon laden — er is geen connectie met de API.';
                        const btn = document.createElement('button'); btn.id = 'retryOffline'; btn.className = 'retry-btn'; btn.textContent = 'Opnieuw proberen';
                        container.appendChild(h2); container.appendChild(p); container.appendChild(btn);
                        btn.addEventListener('click', ()=>{
                                fb.classList.remove('show');
                                fb.setAttribute('aria-hidden','true');
                                canvas.style.display = '';
                                const infoEl2 = document.querySelector('.info'); if(infoEl2) infoEl2.style.display = '';
                                loadAndRender();
                        });
                };

                img.onload = ()=>{
                        fb.appendChild(img);
                        appendMessageAndRetry(fb);
                };
                img.onerror = ()=>{
                        // fallback to inline SVG when image not present
                        const svg = document.createElement('div');
                        svg.innerHTML = `
                        <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pikachu icon">
                            <rect width="220" height="220" rx="20" fill="#FFF7C6"/>
                            <g transform="translate(20,10)">
                                <ellipse cx="90" cy="100" rx="70" ry="60" fill="#FFD94A" stroke="#E6B800" stroke-width="3"/>
                                <circle cx="55" cy="90" r="8" fill="#111" />
                                <circle cx="125" cy="90" r="8" fill="#111" />
                                <circle cx="45" cy="115" r="12" fill="#FF6B6B" />
                                <circle cx="135" cy="115" r="12" fill="#FF6B6B" />
                                <path d="M80 120 q10 12 20 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
                                <polygon points="10,45 30,10 45,50" fill="#FFD94A" stroke="#E6B800" stroke-width="3" />
                                <polygon points="170,45 150,10 135,50" fill="#FFD94A" stroke="#E6B800" stroke-width="3" />
                            </g>
                        </svg>
                        `;
                        fb.appendChild(svg);
                        appendMessageAndRetry(fb);
                };

                // start loading image
                // if image file doesn't exist in project, onerror will trigger and we fallback to SVG
                // note: for the service worker to cache the image, ensure it's present and SW updated
    }

    window.addEventListener('resize', ()=>{
        // keep canvas crisp when resizing
        resizeCanvas();
    });

    newBtn.addEventListener('click', ()=> loadAndRender());

    // initial placeholder
    window.addEventListener('load', ()=>{
        resizeCanvas();
        ctx.fillStyle = '#fafafa'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#666'; ctx.font = '18px Arial'; ctx.fillText('Klik op "Nieuwe Pokémon" om te starten', 20, 30);
    });

})();
