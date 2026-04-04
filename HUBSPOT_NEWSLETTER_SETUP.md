# HubSpot Newsletter Setup
## Connect TuloPots newsletter signups to HubSpot

TuloPots now supports a HubSpot sync path:

1. A customer signs up on the TuloPots website
2. The subscriber is saved in the local database
3. The contact is synced into HubSpot
4. If a static HubSpot list is configured, the contact is added to that list
5. You design and send newsletters from HubSpot

---

## 1. Create the HubSpot private app

1. Open your HubSpot account
2. Go to `Settings`
3. Open `Integrations`
4. Open `Private Apps`
5. Click `Create private app`
6. Name it `TuloPots Newsletter Sync`

---

## 2. Give the app the right scopes

Enable at least these scopes:

- contacts read
- contacts write
- lists read
- lists write

These support contact creation, updates, and list membership management.

---

## 3. Copy the private app token

After creating the app, HubSpot will show an access token.

Copy it and save it as:

```text
HUBSPOT_PRIVATE_APP_TOKEN : your-hubspot-private-app-token
```

---

## 4. Create a manual list in HubSpot

1. Open `Contacts`
2. Open `Lists`
3. Create a new list
4. Choose a manual or static list for newsletter subscribers
5. Name it something like:

```text
TuloPots Newsletter
```

6. Open the list details and copy the list ID

Save it as:

```text
HUBSPOT_NEWSLETTER_LIST_ID
```

---

## 5. Copy your HubSpot portal ID

Your portal ID is the HubSpot account ID used in app URLs.

Save it as:

```text
HUBSPOT_PORTAL_ID
```

Optional:

```text
HUBSPOT_APP_BASE_URL=https://app.hubspot.com
```

If your account uses a region-specific host and you want exact deep links, use that instead.

---

## 6. Add the values in Vercel

Open:

`Vercel -> Project -> Settings -> Environment Variables`

Add:

```text
HUBSPOT_PRIVATE_APP_TOKEN=...
HUBSPOT_NEWSLETTER_LIST_ID=...
HUBSPOT_PORTAL_ID=...
HUBSPOT_APP_BASE_URL=https://app.hubspot.com
```

---

## 7. Redeploy

After adding the env vars, redeploy the latest production deployment.

---

## 8. Test the connection

1. Subscribe using the TuloPots footer form
2. Open HubSpot contacts
3. Confirm the new contact appears
4. Open the newsletter list
5. Confirm the contact was added to the list

---

## 9. Backfill existing subscribers

After HubSpot is connected:

1. Open TuloPots admin
2. Open the `Newsletter` tab
3. Click `Sync to HubSpot`

This pushes existing local subscribers into HubSpot.

---

## 10. Use HubSpot to create the newsletter

Once contacts are syncing:

1. Open HubSpot email marketing
2. Choose a newsletter template
3. Select your `TuloPots Newsletter` list
4. Design the campaign
5. Send or schedule

That gives you the HubSpot-style newsletter creation flow while TuloPots keeps collecting the subscribers from the website.

---

## Official references

- [HubSpot Contacts API](https://developers.hubspot.com/docs/api-reference/crm-contacts-v3/guide)
- [HubSpot Lists API](https://developers.hubspot.com/docs/reference/api/crm/lists)
- [HubSpot single-send marketing email API](https://developers.hubspot.com/docs/api-reference/marketing-single-send-v4/guide)
