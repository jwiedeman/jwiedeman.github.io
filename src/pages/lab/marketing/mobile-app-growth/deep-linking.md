---
layout: ../../../../layouts/Layout.astro
title: "Deep Linking"
description: "Send users from emails, ads, and posts straight to the right screen inside your app."
---
# Deep Linking

A deep link is a URL that opens a specific screen inside your app instead of the home screen. When someone taps a link in an email, ad, or text, it takes them to the exact product, article, or setting. Without deep links, users land on the home screen or the app store and must find the content themselves.

## How it works

Deep links make app screens addressable the way web pages are. There are three kinds. Basic deep links work only if the app is installed. Deferred deep links survive an install: the user goes to the store, installs, and then opens on the intended screen. Universal Links (iOS) and App Links (Android) use normal web URLs that open the app when installed and the website when not. Deferred deep links matter most for acquisition because they keep the user's intent through the install.

## How to do it

1. Set up Universal Links and App Links. Host an `apple-app-site-association` file for iOS and an `assetlinks.json` file for Android on your domain so the OS knows which URLs your app handles.
2. Choose a provider for deferred deep linking and attribution, such as Branch, AppsFlyer OneLink, or Adjust. Firebase Dynamic Links was shut down in August 2025. Do not use it, and migrate any old links.
3. Map each linkable screen to a URL path, such as `/product/12345` or `/settings/notifications`. Document the map and share it with marketing.
4. Use deferred deep links in every acquisition campaign. A new user who clicks an ad for a product should open that product on first launch, not a generic onboarding screen.
5. Add deep links to every external touchpoint: emails, push notifications, social bios, QR codes on print, and support replies.

## What to measure

- **Click-to-open success rate**: share of deep link clicks that open the intended screen for users who have the app.
- **Deferred link completion rate**: share of new users who install and land on the intended screen.
- **Campaign conversion with deep links**: conversion for deep-linked campaigns compared with campaigns that link to the store page.

## Best practices

- Test every link on iOS and Android, installed and not installed, from common sources: email clients, social apps, messaging apps, and mobile browsers.
- Set a fallback for every link. If the app cannot open, send the user to a relevant mobile web page, not an error or the homepage.
- Report on in-app actions by link source, not just installs, to see which channels drive real engagement.

## Common pitfalls

- Skipping deferred deep links, so new users from ads land on the home screen instead of what they clicked.
- Breaking old links when app navigation changes. Keep old paths working or redirect them.
- No mobile web fallback. Some users will not install. Give them a usable web page.
