(function(){
  const bottle = document.getElementById('bottle');

  if (bottle) bottle.addEventListener('click', ()=>{
    bottle.classList.add('wig');
    setTimeout(()=> bottle.classList.remove('wig'), 800);
  });
})();
