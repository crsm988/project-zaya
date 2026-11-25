# Protecția și corecția vederii

Proiect la fizică, clasa a IX-a — **realizat de Buga Mădălina**.

Site static (HTML + CSS + JavaScript, fără build), cu 5 capitole:

1. **Ochiul** — structură și funcționare (schemă etichetată);
2. **Defecte de vedere** — miopie, hipermetropie, astigmatism, prezbiopie, cu simulator interactiv al razelor de lumină;
3. **Metode de corecție** — ochelari, lentile de contact, chirurgie laser, formule și calculator de dioptrii;
4. **Importanța ochelarilor** — beneficii, tipuri de lentile, istorie, mituri și adevăruri;
5. **Concluzii și bibliografie**.

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
