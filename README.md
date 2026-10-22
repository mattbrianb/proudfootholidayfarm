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
| `CNAME` | Tells GitHub Pages the custom domain |

The original full-size photos stay in `Images/` on your computer. `.gitignore` keeps them out of GitHub, because the site uses the smaller copies in `assets/img/`.

## Common edits

- **Change a price or policy:** search the HTML files for `R600` or the wording and edit it in place. Prices appear on `index.html`, `main-house.html`, `cottage.html` and `rates.html`.
- **Change the WhatsApp number:** edit `whatsapp` in `assets/js/config.js`. Use digits only, starting with 27 and with no leading 0. Also update the `wa.me/` links and `tel:` links in the HTML.
- **Add a photo:**
  1. Save it into the right `assets/img/` folder twice: once about 1800px wide (`name.jpg`) and once about 720px wide (`name-sm.jpg`).
  2. Copy one of the `<button ... data-full=...>` lines in that page's gallery and change the file name and description.

## Publish on GitHub Pages

1. Create a repository on GitHub, for example `proudfoot-website`, and push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "New Proudfoot website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/proudfoot-website.git
   git push -u origin main
   ```

2. On GitHub, go to **Settings > Pages**. Under **Source**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`. Save.
3. Under **Custom domain**, enter `www.proudfootholidayfarm.co.za` and save. The `CNAME` file already holds this.

## Point the domain at GitHub

At the company that manages the domain's DNS (where the `.co.za` domain is registered), replace the records that currently point to Wix:

| Type | Name / Host | Value |
|---|---|---|
| CNAME | `www` | `YOUR-USERNAME.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

DNS changes can take a few hours to spread. Once GitHub shows the domain as verified, tick **Enforce HTTPS** in Settings > Pages.

Don't cancel the Wix plan until the new site loads on the domain.

## Turn on the booking calendar

Until the tracker is connected, the enquiry form opens the guest's email app with the enquiry filled in, and the calendar lets them pick dates. To show booked dates and log enquiries in a Google Sheet, follow `booking-tracker/SETUP.md`.

## Preview on your computer

From this folder, run:

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
