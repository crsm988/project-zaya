# Protecția și corecția vederii

Proiect la fizică, clasa a IX-a — **realizat de Buga Mădălina**.

Site static (HTML + CSS + JavaScript, fără build) despre:

- structura ochiului și funcționarea lui ca sistem optic (refracție, lentile, convergență, acomodare);
- defectele de vedere: miopie, hipermetropie, astigmatism, prezbiopie;
- maladii și disfuncții: cataractă, glaucom, degenerescență maculară, retinopatie diabetică, dezlipire de retină, keratocon, strabism, ambliopie, daltonism, nictalopie, conjunctivită, ochi uscat;
- metode de corecție (ochelari, lentile de contact, chirurgie laser) și importanța ochelarilor;
- reguli de protecție a vederii, probleme rezolvate și un test de verificare.

Elemente interactive: simulator al razelor de lumină prin ochi (cu/fără ochelari), grafic al acomodării în funcție de vârstă, calculator de dioptrii, listă de obiceiuri și test cu 10 întrebări.

## Publicare pe Vercel

1. Intră pe [vercel.com](https://vercel.com) și autentifică-te cu contul GitHub.
2. **Add New… → Project** și importă acest repository.
3. La *Framework Preset* alege **Other**; nu e nevoie de comandă de build sau de director de output.
4. Apasă **Deploy** — site-ul primește un link de forma `https://<nume>.vercel.app`.

Alternativ, din terminal: `npx vercel` (apoi `npx vercel --prod`).

## Rulare locală

Deschide `index.html` în browser sau pornește un server simplu:

```bash
python3 -m http.server 8000
```
