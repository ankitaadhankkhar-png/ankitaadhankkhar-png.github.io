{
  // ---------- language switch (English / German) ----------
  const getLang = () => { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } };
  const setLangPref = l => { try { localStorage.setItem('lang', l); } catch (e) {} };
  let lang = getLang();

  const applyLang = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-de]').forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'de' ? el.dataset.de : el.dataset.en;
    });
    const b = document.getElementById('lang');
    if (b) {
      b.textContent = lang === 'de' ? 'English' : 'Deutsch';
      b.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
    }
    renderQuiz();
  };

  const langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', () => { lang = lang === 'de' ? 'en' : 'de'; setLangPref(lang); applyLang(); });

  // ---------- current page in navigation ----------
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const target = a.getAttribute('href');
    if (target === here || (here.startsWith('article') && target === 'writing.html')) a.setAttribute('aria-current', 'page');
  });

  // ---------- profile photo fallback ----------
  document.querySelectorAll('.ph img').forEach(img => {
    img.addEventListener('error', () => { img.remove(); });
  });

  // ---------- explainer: can an AI model forget you? ----------
  const T = {
    en: {
      step: n => `Question ${n} of 3`, out: 'Outcome', yes: 'Yes', no: 'No', again: 'Start again',
      q: [
        "Was the person's data used to train the model?",
        'Could their personal data be pulled out of the model, directly or by prompting it?',
        'Can the developer retrain or replace the model within a reasonable time?'
      ],
      r: {
        r0: ['Erasure stops at the data you hold', "The model never saw this person's data, so the request covers what the organisation stores, not the model."],
        r1: ['The model may count as anonymous', 'If extraction is very unlikely, regulators may treat the model as anonymous (the EDPB looks at this case by case). Erase the training data and document why the model itself is out of scope.'],
        r2: ['Erase at the source, then retrain', 'Remove the data from training sets, suppress outputs in the meantime, and make sure the next version is trained without it. Record every step.'],
        r3: ['Suppress now, document, plan for later', 'Filter outputs promptly and be honest that this is suppression, not erasure. Record why retraining is not yet feasible and remove the data in the next training cycle.']
      }
    },
    de: {
      step: n => `Frage ${n} von 3`, out: 'Ergebnis', yes: 'Ja', no: 'Nein', again: 'Neu starten',
      q: [
        'Wurden die Daten der Person zum Training des Modells verwendet?',
        'Lassen sich ihre personenbezogenen Daten aus dem Modell herausholen, direkt oder durch gezielte Eingaben?',
        'Kann der Entwickler das Modell in angemessener Zeit neu trainieren oder ersetzen?'
      ],
      r: {
        r0: ['Die Löschung betrifft nur gespeicherte Daten', 'Das Modell wurde nicht mit den Daten dieser Person trainiert. Der Antrag betrifft also die gespeicherten Daten, nicht das Modell.'],
        r1: ['Das Modell kann als anonym gelten', 'Ist eine Extraktion sehr unwahrscheinlich, können Aufsichtsbehörden das Modell als anonym behandeln (der EDSA prüft dies im Einzelfall). Trainingsdaten löschen und dokumentieren, warum das Modell selbst nicht betroffen ist.'],
        r2: ['An der Quelle löschen, dann neu trainieren', 'Daten aus den Trainingssätzen entfernen, Ausgaben vorübergehend unterdrücken und sicherstellen, dass die nächste Version ohne sie trainiert wird. Jeden Schritt dokumentieren.'],
        r3: ['Jetzt unterdrücken, dokumentieren, später löschen', 'Ausgaben umgehend filtern und offen sagen, dass dies eine Unterdrückung ist, keine Löschung. Festhalten, warum ein Neutraining noch nicht möglich ist, und die Daten im nächsten Trainingszyklus entfernen.']
      }
    }
  };
  const flow = [{ yes: 1, no: 'r0' }, { yes: 2, no: 'r1' }, { yes: 'r2', no: 'r3' }];
  const box = document.getElementById('qbox');
  let state = 0;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function renderQuiz() {
    if (!box) return;
    const t = T[lang] || T.en;
    if (typeof state === 'number') {
      const f = flow[state];
      box.innerHTML = `<div><div class="step">${esc(t.step(state + 1))}</div><p class="q">${esc(t.q[state])}</p>
        <div class="opts"><button class="opt" type="button" data-n="${f.yes}">${esc(t.yes)}</button><button class="opt" type="button" data-n="${f.no}">${esc(t.no)}</button></div></div>`;
    } else {
      const [h, p] = t.r[state];
      box.innerHTML = `<div class="res"><div class="step">${esc(t.out)}</div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>
        <button class="again" type="button" id="again">${esc(t.again)}</button>`;
    }
  }
  if (box) {
    box.addEventListener('click', e => {
      if (e.target.closest('#again')) { state = 0; renderQuiz(); return; }
      const b = e.target.closest('.opt'); if (!b) return;
      const n = b.dataset.n; state = /^\d+$/.test(n) ? Number(n) : n; renderQuiz();
    });
  }

  // ---------- copy email ----------
  const cp = document.getElementById('copy');
  if (cp) cp.addEventListener('click', async () => {
    const original = cp.textContent;
    try { await navigator.clipboard.writeText('ankitaadhankkhar@gmail.com'); cp.textContent = lang === 'de' ? 'Kopiert' : 'Copied'; }
    catch (e) { cp.textContent = lang === 'de' ? 'Bitte manuell kopieren' : 'Copy it from above'; }
    setTimeout(() => { cp.textContent = original; }, 2200);
  });

  applyLang();
}
