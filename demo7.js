// initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const bottle = document.getElementById('bottle');
  if (!bottle) return;

  bottle.addEventListener('click', () => {
    // quick wig for feedback
    bottle.classList.add('wig');
    setTimeout(() => bottle.classList.remove('wig'), 800);

    // if not already flying, add the `.fly` class to start the flying animation
    if (!bottle.classList.contains('fly')) {
      bottle.classList.add('fly');
      // no forced reflow needed here because `.fly` is only added when
      // absent, so the animation will start on first add
    }
  });
});
