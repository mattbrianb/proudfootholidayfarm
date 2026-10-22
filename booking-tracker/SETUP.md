# Booking tracker setup

The booking tracker is a Google Sheet. It's free and runs on the owner's Google account.

- **Website enquiries** land in the sheet as **Pending** and are emailed to the owner.
- **The owner** changes the Status to **Confirmed** from the Google Sheets app on their phone.
- **The website calendar** then shows those nights as booked.
- **Guests** only ever see which dates are taken, never names or contact details.

Setup takes about 10 minutes and is done once.

## 1. Create the sheet

1. Sign in to the Google account that should own the bookings. The owner's account is best.
2. Go to [sheets.new](https://sheets.new) and name the sheet **Proudfoot Bookings**.

## 2. Add the script

1. In the sheet, open **Extensions > Apps Script**.
2. Delete what is in the editor, then paste in everything from `booking-tracker/Code.gs`.
3. Near the top, check `OWNER_EMAIL`. Enquiry emails go to this address. To add more, separate them with commas.
4. Click **Save** (the disk icon).
5. Choose `setup` in the function drop-down at the top, then click **Run**.
6. Google asks for permission. Click **Review permissions**, pick the account, then click **Advanced > Go to project (unsafe) > Allow**. The "unsafe" warning appears because the script is yours and not published by Google. The script only uses this sheet and sends email from your account.
7. Go back to the sheet. There is now a **Bookings** tab with coloured headings and drop-downs.

## 3. Publish it so the website can reach it

1. In Apps Script, click **Deploy > New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Fill in the settings:
   - Description: `Proudfoot website`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then copy the **Web app URL**. It ends in `/exec`.
5. Open `assets/js/config.js` in the website files and paste the URL between the quotes:

   ```js
   trackerUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec'
   ```

6. Save the file and push to GitHub. The calendar and enquiry form go live within a minute or two.

## Running bookings day to day

The **Status** column controls everything:

| Status | Meaning | Shows as booked on the website? |
|---|---|---|
| Pending | New enquiry, not yet answered | No |
| Confirmed | Deposit paid or booking agreed | **Yes** |
| Blocked | Dates you want closed (family visit, maintenance) | **Yes** |
| Declined | You said no | No |
| Cancelled | Guest cancelled | No |

How to handle the common cases:

- **Booking by phone or WhatsApp:** add a row yourself. Fill in Status, Place, Arrive and Leave; the other columns are optional.
- **Leave is the check-out day.** A stay from Fri 12 to Mon 15 Dec blocks the nights of the 12th, 13th and 14th. The 15th stays free for the next guests.
- **On your phone:** install the Google Sheets app, open **Proudfoot Bookings**, and tap a Status cell to change it.
- **Double bookings:** if an enquiry overlaps a Confirmed or Blocked booking, the email says so.

## Changing the script later

If you edit `Code.gs`, publish the change:

1. Click **Deploy > Manage deployments**.
2. Click the pencil, set **Version** to **New version**, and click **Deploy**.

The web app URL stays the same.
