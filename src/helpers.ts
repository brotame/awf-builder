const body = document.body;
let scrollPosition = 0;

export function disableScroll() {
  scrollPosition = window.pageYOffset;
  let oldWidth = body.clientWidth;

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollPosition}px`;
  body.style.width = `${oldWidth}px`;
}

export function enableScroll() {
  if (body.style.overflow !== 'hidden') scrollPosition = window.pageYOffset;

  body.style.overflow = '';
  body.style.position = '';
  body.style.top = ``;
  body.style.width = ``;
  window.scrollTo(0, scrollPosition);
}
