// Remove the DOMContentLoaded wrapper, as ES module scripts are deferred and run after DOM is ready.
  // Fetch page views on load
  fetch('./api/counter.php')
    .then(response => {
      console.log('Response from counter API:', response); // Debugging log
      return response.json();
    })
    .then(data => {
      console.log('Data from counter API:', data); // Debugging log
      document.getElementById('pageViews').textContent = data.views?.toLocaleString?.() ?? 'Counter unavailable';
    })
    .catch(error => {
      console.error('Error fetching page views:', error);
      document.getElementById('pageViews').textContent = 'Counter unavailable';
    });

  // --- 5-year percent calculation and update ---
  function updateFiveYearSummary() {
    const baseRent = parseFloat(document.getElementById('base-rent')?.value) || 0;
    // Get 5th year rents as numbers
    const dsa5str = document.getElementById('dsa-5y')?.textContent || '';
    const rso5str = document.getElementById('rso-5y')?.textContent || '';
    const lahd5str = document.getElementById('lahd-5y')?.textContent || '';
    // Extract rent values from strings (match $X,XXX)
    function extractRent(str) {
      const match = str.match(/\$([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, '')) : null;
    }
    const dsa5 = extractRent(dsa5str);
    const rso5 = extractRent(rso5str);
    const lahd5 = extractRent(lahd5str);

    function pct(oldVal, newVal) {
      if (!oldVal || !newVal) return '';
      const val = ((newVal - oldVal) / oldVal) * 100;
      return (val > 0 ? '+' : '') + val.toFixed(1) + '%';
    }

    const elDsa = document.getElementById('fiveyr-dsa');
    const elRso = document.getElementById('fiveyr-rso');
    const elLahd = document.getElementById('fiveyr-lahd');

    if (elDsa) elDsa.textContent = dsa5 ? pct(baseRent, dsa5) : '';
    if (elRso) elRso.textContent = rso5 ? pct(baseRent, rso5) : '';
    if (elLahd) elLahd.textContent = lahd5 ? pct(baseRent, lahd5) : '';
    // Return for use in share functions
    return {
      dsa: dsa5 ? pct(baseRent, dsa5) : '',
      rso: rso5 ? pct(baseRent, rso5) : '',
      lahd: lahd5 ? pct(baseRent, lahd5) : ''
    };
  }

  // Call updateFiveYearSummary whenever results are updated
  function observeRentChanges() {
    const observer = new MutationObserver(updateFiveYearSummary);
    ['dsa-5y', 'rso-5y', 'lahd-5y'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el, { childList: true, subtree: true });
    });
    const baseRentEl = document.getElementById('base-rent');
    if (baseRentEl) baseRentEl.addEventListener('input', updateFiveYearSummary);
  }
  observeRentChanges();
  updateFiveYearSummary();

  // --- Copy my future rent functionality ---
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Your future rent summary has been copied! Paste it into your letter to your city councilor.');
      } else {
        alert('Failed to copy. Please copy manually:\n\n' + text);
      }
    } catch (err) {
      alert('Failed to copy. Please copy manually:\n\n' + text);
    }
    document.body.removeChild(textArea);
  }

  function setupCopyButton() {
    const copyBtn = document.getElementById('copymyfuturerent');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async function() {
      try {
        const baseRent = document.getElementById('base-rent')?.value || '';
        const cpiValues = [1,2,3,4,5].map(i => document.getElementById(`cpi-y${i}`).value);
        const params = new URLSearchParams({
            rent: baseRent,
            cpi: cpiValues.join(',')
        });
        
        const dsa5 = document.getElementById('dsa-5y')?.textContent || '';
        const rso5 = document.getElementById('rso-5y')?.textContent || '';
        const lahd5 = document.getElementById('lahd-5y')?.textContent || '';
        const url = `${window.location.origin}${window.location.pathname}?${params}`;
        const pct = updateFiveYearSummary();

        const msg =
`My current rent is $${parseFloat(baseRent || 0).toLocaleString()} per month.\n
\n
If the city adopts:\n
- The Keep LA Housed Plan, my rent in 5 years would be: ${pct.dsa} ${dsa5}\n
- The current RSO policy, my rent in 5 years would be: ${pct.rso} ${rso5}\n
- The LAHD proposal, my rent in 5 years would be: ${pct.lahd} ${lahd5}\n
\n
As you can see, there is negligable difference between the LAHD plan and the Current RSO. We deserve better. That's why I encourage you to support the Keep LA Housed Plan!\n
\n
This is what your choices will cost me. Please consider the impact of these policies on tenants like me.\n
\n
These numbers were calculated using historical real historical inflation data.\n
See my calculation here: ${url}\n
\n
\n
Mi renta actual es de $${parseFloat(baseRent || 0).toLocaleString()} al mes.\n
\n
Si la ciudad adopta:\n
- El Plan Keep LA Housed, mi renta en 5 años sería: ${pct.dsa} ${dsa5}\n
- La política actual de RSO, mi renta en 5 años sería: ${pct.rso} ${rso5}\n
- La propuesta de LAHD, mi renta en 5 años sería: ${pct.lahd} ${lahd5}\n
\n
Como pueden ver, la diferencia entre el plan de LAHD y el RSO actual es mínima. Merecemos algo mejor. Por eso los animo a apoyar el Plan Keep LA Housed.\n
\n
Esto es lo que me costarán sus decisiones. Por favor, consideren el impacto de estas políticas en inquilinos como yo.\n
\n
Estas cifras se calcularon utilizando datos históricos de inflación real.\n
Vean mi cálculo aquí: ${url}\n
\n
\n`;
        // Prefer Clipboard API when available and page is secure
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(msg);
            alert('Your future rent summary has been copied! Paste it into your letter to your city councilor.');
            return;
          } catch (err) {
            // fall through to fallback
          }
        }
        fallbackCopyTextToClipboard(msg);
      } catch (err) {
        // Catch any unexpected errors so UI still works
        alert('An unexpected error occurred. Please copy manually.');
      }
    });
  }
  setupCopyButton();

  // --- WhatsApp share functionality ---
  const waBtn = document.getElementById('whatsappShare');
  if (waBtn) {
    waBtn.addEventListener('click', function() {
      const baseRent = document.getElementById('base-rent').value;
      const dsa5 = document.getElementById('dsa-5y').textContent || '';
      const rso5 = document.getElementById('rso-5y').textContent || '';
      const lahd5 = document.getElementById('lahd-5y').textContent || '';
      const url = window.location.href;
      const pct = updateFiveYearSummary();

      const msg =
`My current rent is $${parseFloat(baseRent || 0).toLocaleString()} per month.\n
\n
If the city adopts:\n
- The Keep LA Housed Plan, my rent in 5 years would be: ${pct.dsa} ${dsa5}\n
- The current RSO policy, my rent in 5 years would be: ${pct.rso} ${rso5}\n
- The LAHD proposal, my rent in 5 years would be: ${pct.lahd} ${lahd5}\n
\n
As you can see, there is negligable difference between the LAHD plan and the Current RSO. We deserve better. That's why I encourage you to support the Keep LA Housed Plan!\n
\n
This is what your choices will cost me. Please consider the impact of these policies on tenants like me.\n
\n
These numbers were calculated using historical real historical inflation data.\n
See my calculation here: ${url}\n
\n
\n
Mi renta actual es de $${parseFloat(baseRent || 0).toLocaleString()} al mes.\n
\n
Si la ciudad adopta:\n
- El Plan Keep LA Housed, mi renta en 5 años sería: ${pct.dsa} ${dsa5}\n
- La política actual de RSO, mi renta en 5 años sería: ${pct.rso} ${rso5}\n
- La propuesta de LAHD, mi renta en 5 años sería: ${pct.lahd} ${lahd5}\n
\n
Como pueden ver, la diferencia entre el plan de LAHD y el RSO actual es mínima. Merecemos algo mejor. Por eso los animo a apoyar el Plan Keep LA Housed.\n
\n
Esto es lo que me costarán sus decisiones. Por favor, consideren el impacto de estas políticas en inquilinos como yo.\n
\n
Estas cifras se calcularon utilizando datos históricos de inflación real.\n
Vean mi cálculo aquí: ${url}\n
\n
\n`;

      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    });
  }

  // --- Email share functionality ---
  const emailBtn = document.getElementById('emailShare');
  if (emailBtn) {
    emailBtn.addEventListener('click', function() {
      const baseRent = document.getElementById('base-rent').value;
      const dsa5 = document.getElementById('dsa-5y').textContent || '';
      const rso5 = document.getElementById('rso-5y').textContent || '';
      const lahd5 = document.getElementById('lahd-5y').textContent || '';
      const url = window.location.href;
      const pct = updateFiveYearSummary();

      const subject = encodeURIComponent("My LA Rent Calculator Results");
      const body =
`My current rent is $${parseFloat(baseRent || 0).toLocaleString()} per month.\n
\n
If the city adopts:\n
- The Keep LA Housed Plan, my rent in 5 years would be: ${pct.dsa} ${dsa5}\n
- The current RSO policy, my rent in 5 years would be: ${pct.rso} ${rso5}\n
- The LAHD proposal, my rent in 5 years would be: ${pct.lahd} ${lahd5}\n
\n
As you can see, there is negligable difference between the LAHD plan and the Current RSO. We deserve better. That's why I encourage you to support the Keep LA Housed Plan!\n
\n
This is what your choices will cost me. Please consider the impact of these policies on tenants like me.\n
\n
These numbers were calculated using historical real historical inflation data.\n
See my calculation here: ${url}\n
\n
\n
Mi renta actual es de $${parseFloat(baseRent || 0).toLocaleString()} al mes.\n
\n
Si la ciudad adopta:\n
- El Plan Keep LA Housed, mi renta en 5 años sería: ${pct.dsa} ${dsa5}\n
- La política actual de RSO, mi renta en 5 años sería: ${pct.rso} ${rso5}\n
- La propuesta de LAHD, mi renta en 5 años sería: ${pct.lahd} ${lahd5}\n
\n
Como pueden ver, la diferencia entre el plan de LAHD y el RSO actual es mínima. Merecemos algo mejor. Por eso los animo a apoyar el Plan Keep LA Housed.\n
\n
Esto es lo que me costarán sus decisiones. Por favor, consideren el impacto de estas políticas en inquilinos como yo.\n
\n
Estas cifras se calcularon utilizando datos históricos de inflación real.\n
Vean mi cálculo aquí: ${url}\n
\n
\n`;

      window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
    });
  }
;
