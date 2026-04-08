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
            nameEl.textContent = 'Fout bij laden';
            ctx.clearRect(0,0,canvas.width,canvas.height);
        }
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
