# Proudfoot Holiday Farm website

A plain HTML/CSS/JavaScript site, hosted free on GitHub Pages at **www.proudfootholidayfarm.co.za**.

## What's where

| File or folder | What it is |
|---|---|
| `index.html` | Home page |
| `main-house.html`, `cottage.html` | One page per place to stay, each with its photos, availability calendar and enquiry form |
| `farm.html`, `rates.html`, `contact.html` | The Farm, Rates and policies, Contact |
| `assets/css/site.css` | All the styling |
| `assets/js/config.js` | **Settings you might change:** WhatsApp number, email, booking tracker link |
| `assets/js/site.js` | Menu, booking bar, calendar, gallery and enquiry form |
| `assets/img/` | Web-sized photos, sorted into `main-house/`, `cottage/`, `farm/` and `brand/` |
| `booking-tracker/` | The Google Sheet booking tracker. Start with `SETUP.md` |

The original full-size photos stay in `Images/` on your computer. `.gitignore` keeps them out of GitHub, because the site uses the smaller copies in `assets/img/`.

## Common edits

- **Change a price or policy:** search the HTML files for `R600` or the wording and edit it in place. Prices appear on `index.html`, `main-house.html`, `cottage.html` and `rates.html`.
- **Change the WhatsApp number:** edit `whatsapp` in `assets/js/config.js`. Use digits only, starting with 27 and with no leading 0. Also update the `wa.me/` links and `tel:` links in the HTML.
- **Add a photo:**
  1. Save it into the right `assets/img/` folder twice: once about 1800px wide (`name.jpg`) and once about 720px wide (`name-sm.jpg`).
  2. Copy one of the `<button ... data-full=...>` lines in that page's gallery and change the file name and description.

## Publishing

The site lives in the GitHub repository `mattbrianb/proudfootholidayfarm` and is published by GitHub Pages (Settings > Pages: Deploy from a branch, `main`, `/ (root)`).

**Preview address (before launch):** https://mattbrianb.github.io/proudfootholidayfarm/

To publish a change, save your edits, then run:

```bash
git add .
git commit -m "Describe the change"
git push
```

GitHub updates the site a minute or two later.

## Launch day: switch the domain from Wix to GitHub

Do these steps when you're happy with the preview.

1. **Tell GitHub the domain.** In the repository on GitHub, go to **Settings > Pages**. Under **Custom domain**, enter `www.proudfootholidayfarm.co.za` and click **Save**. This adds a `CNAME` file to the repository. Afterwards, run `git pull` on your computer so your copy has it too.
2. **Point the domain at GitHub.** At whoever manages the domain's DNS (if the domain was bought through Wix, that's **Wix > Domains > Manage DNS records**), replace the records that point to Wix. Delete the old Wix `A` and `CNAME` records for `@` and `www`, but leave any `MX` (email) records alone.

   | Type | Name / Host | Value |
   |---|---|---|
   | CNAME | `www` | `mattbrianb.github.io` |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

3. **Wait and turn on HTTPS.** DNS changes take from a few minutes to a few hours to spread. When Settings > Pages shows the DNS check as successful, tick **Enforce HTTPS**.
4. **Keep Wix until it's working.** Don't cancel the Wix plan until the new site loads on www.proudfootholidayfarm.co.za.

Once the custom domain is set, the preview address above forwards to the real domain.

## Turn on the booking calendar

Until the tracker is connected, the enquiry form opens the guest's email app with the enquiry filled in, and the calendar lets them pick dates. To show booked dates and log enquiries in a Google Sheet, follow `booking-tracker/SETUP.md`.

## Preview on your computer

From this folder, run:

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
