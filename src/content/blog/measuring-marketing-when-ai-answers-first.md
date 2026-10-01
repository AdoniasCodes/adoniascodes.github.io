---
title: "Your Dashboard Can't See AI. Here's How to Measure Marketing in 2026."
seoTitle: "How to Measure Marketing When AI Answers First (2026)"
description: "68% of Google searches now end without a click, and AI's influence can be undercounted 10x. A practical measurement setup for small teams, with sources."
pubDate: 2026-10-01
keywords: ["marketing attribution AI search", "zero-click search 2026", "Search Console AI report", "GA4 AI traffic"]
faq:
  - q: "Why does AI traffic show up as \"Direct\" in GA4?"
    a: "When someone reads an AI answer and later types your URL or searches your brand name, there's no referring link to record. GA4 files those visits as Direct or as branded organic search, so the AI step is invisible."
  - q: "Does Search Console show clicks from AI Overviews?"
    a: "No. The AI reports launched worldwide on August 31, 2026 show impressions from AI Overviews, AI Mode, and Discover AI features, but no click data."
  - q: "Should I opt my site out of Google's AI features?"
    a: "For most businesses, no. Opting out removes your content from AI answers your buyers are reading, and Google says it doesn't change regular rankings. Consider it only if AI answers are clearly replacing paid or high-value content."
  - q: "How can a small business measure AI search visibility for free?"
    a: "Use a free-text \"How did you hear about us?\" field, a GA4 channel group for AI referrers, branded search trends in Search Console, and a monthly manual check of your buyers' top questions in ChatGPT, Gemini, and Claude."
---

A potential customer asks Gemini which tool solves their problem. Gemini names three companies, including yours. Two days later they type your URL straight into the browser and sign up.

Your analytics will file that sale under "Direct." The AI answer that actually sent them there doesn't appear anywhere.

That's the measurement problem of 2026, and it's getting bigger every quarter. Here is what the data says, and the setup I'd put in place for any small team that can't afford an enterprise analytics stack.

## The numbers behind the blind spot

**Most searches no longer send a click.** SparkToro found that [68.01% of US Google searches ended without a click](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/) from January to April 2026, up from 60.45% in 2024 (Rand Fishkin, June 2026). The study used Similarweb's web panel and left out Google's mobile app, where zero-click results are even more aggressive, so the true number is probably higher.

**AI answers take clicks without making users less happy.** In a randomized field study of 1,065 US users, researchers from the Indian School of Business and Carnegie Mellon found that [AI Overviews cut organic clicks by 38%](https://www.searchenginejournal.com/ai-overviews-cut-organic-clicks-38-field-study-finds/573145/) on the searches where they appeared. The part that matters for marketers: satisfaction, information quality, and ease of finding information were nearly identical with or without the AI summary (Search Engine Journal, April 2026). People aren't going to drift back to clicking because they miss it.

**The AI market is splitting up.** Kevin Indig's [H1 2026 report](https://www.growth-memo.com/p/ai-halftime-report-h1-2026) estimates ChatGPT's share fell from 78% to 56% between July 2025 and July 2026, while Gemini rose from 15% to 30% and Claude from 2% to 10% (Growth Memo, July 2026). The same report notes that 91% of citations appear in only one of ChatGPT, Perplexity, or AI Overviews. Being visible in one AI tool tells you very little about the others.

## Why attribution breaks

Attribution tools give credit to the touchpoints they can see: a click, a cookie, a tagged link. AI answers create none of those.

Kevin Indig put it plainly in his [September 2026 piece on attribution](https://www.growth-memo.com/p/the-collapse-of-attribution): "The new model is prompt → synthesize → direct visit. Much harder to track and a lot less viable for click-based attribution models." He cites research from Graphite showing that AI can be underattributed by as much as 10x.

So the channel may be working, and your dashboard will tell you it isn't. Teams that trust the dashboard over everything else will cut the wrong budget.

This isn't new to me. When I directed campaigns for [Eagle Eye Business Group](/work/eagle-eye/) across paid social, search, and TV at the same time, TV never showed up in GA4, but it still moved people. AI answers behave the same way: they influence the buyer and leave no trail in your reports.

## Google's new AI report: useful, but only half a number

On August 31, 2026, Google rolled out [AI reports in Search Console worldwide](https://www.searchenginejournal.com/google-search-console-ai-reports-rolled-out-worldwide/587836/). They show impressions from AI Overviews, AI Mode, and generative AI features in Discover, broken down by page, country, and date (Search Engine Journal).

They don't show clicks.

That gives you a number with nothing to compare it against. You can see that a page appeared in AI answers 4,000 times. You can't see whether anyone acted on it. Here's how I'd use it anyway:

- **Watch the trend per page, not the total.** A page whose AI impressions grow month after month is being picked up as a source. That's a signal to keep it updated.
- **Put it next to the classic Performance report for the same page.** If AI impressions go up while classic clicks go down, the AI answer is probably absorbing your traffic. That tells you whether to rewrite the page toward questions an AI summary can't fully answer.
- **Think hard before using the opt-out.** Search Console now has a setting to exclude your site from those three AI surfaces. According to Search Engine Journal, it doesn't affect regular rankings. But opting out removes you from the answers your buyers are reading, so for most businesses it's a last resort.

## What big companies do, and what small teams can borrow

Large companies don't rely on one model. A BCG survey cited by Indig found that [46% of senior measurement professionals](https://www.growth-memo.com/p/the-collapse-of-attribution) use marketing mix modeling (MMM), incrementality testing, and multi-touch attribution together, and that leaders using this combined approach see up to 70% stronger revenue growth. IAB data in the same piece shows 76% of US buy-side decision-makers use incrementality tests, 73% use attribution, 67% use MMM, but only 39% use all three.

Most startups and small businesses can't run a mix model. You don't need one to apply the idea behind it: use several imperfect signals and trust where they agree.

## A measurement setup for small teams

These five checks cost nothing beyond time.

### 1. Ask people how they found you
Add an open text field, "How did you hear about us?", to every signup, demo, and contact form. Make it free text, not a dropdown, so people can write "ChatGPT recommended you" or "saw your founder's post." Read the answers every month. This is the one source that can see AI-driven discovery directly.

### 2. Separate AI referrals in GA4
Some AI tools do pass a referrer when someone clicks a link inside an answer. Create a custom channel group in GA4 that catches sources such as chatgpt.com, gemini.google.com, perplexity.ai, and claude.ai. The number will be small and undercounted, but the trend is real and you'll stop losing it inside "Referral."

### 3. Track branded search as a demand signal
If people hear about you in an AI answer and then search for your name, that shows up as branded search impressions in Search Console. Filter the Performance report by queries containing your brand and watch the monthly line. Rising branded search with flat non-branded traffic often means discovery is happening somewhere you can't see.

### 4. Run a monthly prompt check
Write down the 10 questions your buyers actually ask before they buy. Once a month, ask them in ChatGPT, Gemini, and Claude, and record whether you're mentioned and who is mentioned instead. Given that 91% of citations show up in only one engine, check all three. A spreadsheet is enough.

### 5. Test by switching things off
When you're unsure whether a channel works, pause it for two to four weeks in one segment, region, or audience, and compare against the rest. This is a basic incrementality test, the same method large companies trust most. It answers "what happens without this?" which attribution never can.

## The bigger point

Indig ends his attribution piece with a line I keep coming back to: "In a world where everything measurable can (soon) be automated, alpha lives in the unmeasurable." Brand, reputation, and word of mouth were always hard to measure. AI search makes them matter more, not less. It's the same reason I still [keep the final edit human](/blog/where-ai-stops-in-my-marketing/) even though I automate most of my marketing.

Measurement in 2026 isn't about finding one perfect number. It's about collecting a few honest signals and making a call when they point the same way.

## Sources
1. SparkToro, [In 2026, Less Than One-Third of Google Searches Still Send a Click](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/) (Rand Fishkin, June 9, 2026)
2. Search Engine Journal, [AI Overviews Cut Organic Clicks 38%, Field Study Finds](https://www.searchenginejournal.com/ai-overviews-cut-organic-clicks-38-field-study-finds/573145/) (April 27, 2026)
3. Growth Memo, [AI Halftime Report: H1 2026](https://www.growth-memo.com/p/ai-halftime-report-h1-2026) (Kevin Indig, July 27, 2026)
4. Growth Memo, [The Usefulness of Attribution for AI Search](https://www.growth-memo.com/p/the-collapse-of-attribution) (Kevin Indig, September 28, 2026), citing Graphite, BCG, and IAB
5. Search Engine Journal, [Google Search Console AI Reports Rolled Out Worldwide](https://www.searchenginejournal.com/google-search-console-ai-reports-rolled-out-worldwide/587836/) (August 31, 2026)
