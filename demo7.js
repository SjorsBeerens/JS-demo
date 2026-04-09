(function(){
  const bottle = document.getElementById('bottle');
  if (bottle) bottle.addEventListener('click', ()=>{
    // quick wig for feedback
    bottle.classList.add('wig');
    setTimeout(()=> bottle.classList.remove('wig'), 800);

    // if not already flying, add the `.fly` class to start the bootcamp flying animation
    if (!bottle.classList.contains('fly')){
      bottle.classList.add('fly');
      // ensure animation restarts
      void bottle.offsetWidth;
    }
  });
})();
