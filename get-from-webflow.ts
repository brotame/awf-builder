document.addEventListener('copy', (e: ClipboardEvent) => {
  const data = e.clipboardData.getData('application/json');
  console.log(data);
});
