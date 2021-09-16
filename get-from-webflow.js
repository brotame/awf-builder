document.addEventListener('copy', (e) => {
  const data = e.clipboardData.getData('application/json');
  console.log(data);
});
