async function initAccordion() {
  const { default: Accordion } = await import('accordion-js');
  // await import('accordion-js/dist/accordion.min.css'); - переніс імпорт в цсс що б не перебивало стилі. =)

  new Accordion('.accordion-container', {
    duration: 400,
    showMultiple: false,
    collapse: true,
  });
}

initAccordion();
