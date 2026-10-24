# Booking tracker and owner dashboard setup

The booking tracker is a private Google Sheet with a small script attached. It's free and runs on the owner's Google account.

- **Website enquiries** land in the Sheet as **Pending** and are emailed to the owner.
- **The guest** gets an automatic "we've received your enquiry" email, with their details, the estimate and what happens next.
- **The owner** confirms or declines from the **owner dashboard** (a private page for their phone) or straight in the Sheet.
- **The website calendar** shows Confirmed and Blocked nights as booked. Guests only ever see dates, never names or numbers.

Setup takes about 15 minutes and is done once. The script is published twice, once for the public website and once for the private dashboard.

## How it stays secure

The website's code is public on GitHub, so nothing private lives there.

| Part | Who can reach it | What it can do |
|---|---|---|
| The bookings Sheet | Only people you share it with | Everything |
| Public web app (the link in `config.js`) | Anyone | Return booked **dates** only, and accept new enquiries. It can't read guest details, change bookings or open the dashboard |
| Owner dashboard (a second, private link) | Only the Google accounts in `DASHBOARD_ACCOUNTS` | View bookings, confirm, decline, cancel and close dates |

The dashboard has three locks:
1. **Google sign-in.** Google handles the password and 2-step verification, so there's no login page of ours to attack.
2. **Allow-list.** Only the email addresses in `DASHBOARD_ACCOUNTS` get in. Everyone else sees "Not authorised".
3. **Sheet sharing.** The dashboard runs as the person opening it, so they also need edit access to the Sheet.

A leaked dashboard link is useless without those accounts. On top of that:
- **Guest text is plain text.** Anything a guest types is shown as plain text in the dashboard and emails, so it can't inject code.
- **The guest reply is rate-limited.** One enquiry per email address every 10 minutes, and at most 20 automatic replies an hour. A spammer can't use the form to flood someone's inbox.
- **Turn on 2-step verification** on every Google account in the allow-list. That's the real key to the dashboard.

**Never put the dashboard emails into the GitHub copy of `Code.gs`.** Fill them in only inside Apps Script.

## Who the emails come from

Google runs the script, and sends its emails, as the account that **owns the Sheet and publishes the script**. That should be the farm's Gmail account (`admin@falls.co.za`).

The emails can also show the farm's own address. If that Gmail account has `admin@proudfootholidayfarm.co.za` set up as a **"Send mail as"** alias (Gmail > Settings > Accounts), set `SEND_FROM` to it and every email goes out as **"Proudfoot Holiday Farm" <admin@proudfootholidayfarm.co.za>**.

To send as the alias, the script uses Gmail's sending interface with the **"Send email on your behalf"** permission only. It can never read, change or delete the mailbox. If the alias ever stops working, emails go out from the Gmail address instead, so nothing is lost.

The other email settings in `Code.gs`:
- `OWNER_EMAIL` is where new-enquiry emails go.
- `GUEST_REPLY_TO` is where guests' replies go.

## 1. Create the Sheet

1. Sign in to the **owner's** Google account and go to [sheets.new](https://sheets.new). Name the sheet **Proudfoot Bookings**.
2. Share it (the **Share** button) only with people who should manage bookings, as **Editor**. Keep "General access" set to **Restricted**.

## 2. Add the script

1. In the Sheet, open **Extensions > Apps Script**.
2. In `Code.gs`, delete what's there and paste in everything from `booking-tracker/Code.gs`.
3. Add the dashboard file:
   1. Click **+** next to "Files" and choose **HTML**.
   2. Name it exactly `Dashboard`.
   3. Replace its contents with everything from `booking-tracker/Dashboard.html`.
4. At the top of `Code.gs`, fill in your settings:
   - `OWNER_EMAIL`: where enquiry emails go.
   - `DASHBOARD_ACCOUNTS`: the Google account(s) allowed into the dashboard, for example `['owner@gmail.com', 'helper@gmail.com']`.
   - `AUTO_REPLY`: `true` to email guests automatically, `false` to switch it off.
5. Turn on the permissions file and the Gmail sender:
   1. Click the **gear icon (Project Settings)** on the left and tick **Show "appsscript.json" manifest file in editor**.
   2. Back in the editor, open `appsscript.json` and replace everything with the contents of `booking-tracker/appsscript.json`. This switches on the Gmail sender and limits the script to exactly the permissions listed below.
6. Click **Save**, then choose `setup` in the function drop-down at the top and click **Run**.
7. Approve the permissions. Click **Review permissions**, choose the account, then **Advanced > Go to project (unsafe)**. Tick every box, then click **Allow**. The "unsafe" warning only means Google hasn't reviewed your private script. The permissions are:
   - see and edit **only this spreadsheet**,
   - **send** email on your behalf (it can't read your mailbox),
   - see your email address (to check dashboard access),
   - show the "sheet is ready" pop-up.
8. Back in the Sheet, there's now a **Bookings** tab with coloured headings and drop-downs.

## 3. Publish the public web app (for the website)

1. In Apps Script, click **Deploy > New deployment**, then the gear icon > **Web app**.
2. Fill in the settings:
   - Description: `Website`
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
4. Paste it into `assets/js/config.js` in the website files:

   ```js
   trackerUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec'
   ```

5. Save, commit and push. The calendar and enquiry form switch over within a minute or two.

## 4. Publish the private owner dashboard

1. In Apps Script, click **Deploy > New deployment** again, then the gear icon > **Web app**.
2. Fill in the settings:
   - Description: `Owner dashboard`
   - Execute as: **User accessing the web app**
   - Who has access: **Anyone with a Google account**. The allow-list and Sheet sharing do the real locking. Pick **Only myself** instead if only the Sheet's owner will ever use it.
3. Click **Deploy** and copy this second **Web app URL**.
4. Add `?view=dashboard` to the end. It looks like `https://script.google.com/macros/s/YYYYYYYY/exec?view=dashboard`.
5. Open it on the owner's phone, signed into an allowed account, and approve the permissions once.
6. Add it to the home screen so it opens like an app:
   - **iPhone (Safari):** tap **Share > Add to Home Screen**.
   - **Android (Chrome):** tap **⋮ > Add to Home screen**.

Don't put the dashboard link on the website. Keep it in the owner's bookmarks or home screen.

## Using the dashboard

- **Needs a reply:** every upcoming Pending enquiry, with the dates, guests, estimate and message. It warns you if the dates overlap a confirmed booking or the group is bigger than usual.
  - **Approve** confirms the booking. The website shows those nights as "Booked, unavailable" straight away. Tick **Email the guest** to send a confirmation with the dates, total and 50% deposit; you send payment details yourself.
  - **Reject** declines the enquiry. You can email the guest a polite "not available" that invites them to pick other dates.
  - **Change** edits the place, dates or guest numbers. The estimate is recalculated, and you can email the guest the new details.
  - **Call**, **WhatsApp** and **Email** contact the guest straight away.
- **Double-booking guard:** if you approve or move a booking onto dates that are already confirmed or closed, the dashboard stops and warns you. Press the button again only if you really mean it.
- **Month at a glance:** a calendar for each place, with Confirmed nights in green, Pending in amber and Closed in grey. Use the arrows to change month.
- **Bookings this month:**
  - **Confirmed** bookings can be changed or cancelled (with an optional email to the guest).
  - **Closed** dates can be changed or reopened.
- **Close dates:** blocks nights for family visits or maintenance. The website shows them as booked.

Every "Email the guest" message comes from the Google account that owns the script, with the name "Proudfoot Holiday Farm". Replies go to `OWNER_EMAIL`.

## Working in the Sheet directly

The **Status** column controls everything:

| Status | Meaning | Shows as booked on the website? |
|---|---|---|
| Pending | New enquiry, not yet answered | No |
| Confirmed | Deposit paid or booking agreed | **Yes** |
| Blocked | Dates you want closed | **Yes** |
| Declined | You said no | No |
| Cancelled | Guest cancelled | No |

- **Leave is the check-out day.** A stay from Fri 12 to Mon 15 Dec blocks the nights of the 12th, 13th and 14th.
- **Phone or WhatsApp bookings:** add a row by hand. Fill in Status, Place, Arrive and Leave; the dashboard adds an ID itself.

## Changing the script later

If you edit `Code.gs` or `Dashboard`, publish both web apps again:

1. Click **Deploy > Manage deployments**.
2. For **each** deployment, click the pencil, set **Version** to **New version**, and click **Deploy**.

Both links stay the same.

## Email limits

A free Google account can send about 100 emails a day through scripts. Each enquiry uses two: one to you, one to the guest. That's plenty for a holiday farm. If the daily allowance runs low, the guest reply is skipped, but you still get the enquiry.

## Moving the tracker to another Google account

Google only transfers ownership inside the same organisation. Between two ordinary Gmail accounts, the new account makes a copy instead. The copy brings the bookings and the script with it.

1. **Old owner:** share the Sheet with the new account as **Editor**.
2. **New account:** open the Sheet and choose **File > Make a copy**.
   - Name it **Proudfoot Bookings**.
   - Share it with the old owner as Editor if they should keep access.
3. **New account:** in the copy, open **Extensions > Apps Script** and follow step 2 above. That means pasting the latest `Code.gs`, `Dashboard.html` and `appsscript.json`, and checking the settings at the top of `Code.gs`. Then run `setup` and approve the permissions.
4. **New account:** do steps 3 and 4 above to create new **Website** and **Owner dashboard** links.
   - Put the new website link into `assets/js/config.js` and push.
   - Use the new dashboard link from now on.
5. **Old owner:** in the **old** Sheet's Apps Script, go to **Deploy > Manage deployments** and **archive** both deployments. Until you do, the old links keep working and sending email as the old owner. Then delete or rename the old Sheet so nobody uses it by mistake.
