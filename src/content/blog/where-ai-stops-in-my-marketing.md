---
title: "I Automate Most of My Marketing With AI. Here's Where I Stop Letting It Write."
seoTitle: "Where I Stop Letting AI Write My Marketing (2026)"
description: "I use AI to source 1,500+ leads a week and cut campaign time by about 70%. Here's what I hand to machines, what stays human, and what 2026 data says."
pubDate: 2026-10-01
keywords: ["AI in marketing workflow", "AI-generated content SEO", "scaled content abuse", "AI visibility"]
faq:
  - q: "Is AI-generated content bad for SEO?"
    a: "Not by itself. Google's guidance says using AI is fine when the content helps people. The risk is publishing many pages that add nothing new, which Google's spam policies call scaled content abuse."
  - q: "Does adding schema markup get you cited by AI tools?"
    a: "Not much, on current evidence. An Ahrefs study of 1,885 pages found no major change in AI citations after adding schema. It's still worth doing for regular search features, but brand mentions matter far more for AI visibility."
  - q: "What should a marketing team automate first?"
    a: "Work that is high-volume, repetitive, and invisible to customers: lead sourcing, data cleanup, research summaries, and reporting. Keep customer-facing writing and positioning decisions human."
  - q: "How do you stop AI from making things up in research?"
    a: "Treat every AI answer as a lead to check, not a fact. Open the original source before you quote anything, and keep the link next to the claim."
---

Every week, a pipeline I built finds and qualifies more than 1,500 sales leads without me touching it. AI workflows I set up in n8n cut the time it takes to run a campaign by roughly 70%. I use Claude and ChatGPT every working day.

And I still write the final version of almost everything a customer reads.

That sounds like a contradiction. It isn't. It's the same tension the whole industry is living with right now. In [HubSpot's 2026 State of Marketing report](https://blog.hubspot.com/marketing/hubspot-blog-marketing-industry-trends-report), 86.4% of marketing teams say they use AI in at least a few areas. In the same survey, 62.7% say we need more unique, human-centered content to compete with AI content. We're all using the machine, and we all want less of what it produces.

Here's how I split the work, and what this year's data says about why the split matters.

## What I actually hand to AI

I'm not cautious about automation. At [Pairing](/work/pairing-dev/), a group of SaaS products where I run marketing, AI does a lot of heavy lifting:

- **Lead sourcing and qualification.** An automated pipeline pulls and scores 1,500+ leads a week. A human could not do this at that volume, and a human shouldn't.
- **Outbound at scale.** Cold-email sequences in Instantly and HubSpot run at a 23% open rate and a 6% reply rate. AI helps me test subject lines and variations quickly.
- **Research.** Summarizing competitors, scanning industry news, pulling together background before a strategy call.
- **First drafts.** Outlines, rough versions, rewrites of the same idea for different channels.
- **Repetitive operations.** Moving data between tools, formatting reports, tagging and routing.

This is where the 70% time saving comes from. None of it is the part a customer remembers.

## Where AI stops: three lines I don't cross

### 1. The voice

AI writes in a voice that sounds like everyone, because it learned from everyone. That's fine for an internal summary. It's a problem for anything with your name, or a client's name, on it.

When I rewrote the website content for Electric Car Chargers UK at [Recognise Design](/work/recognise-designs/), every page had to speak to the people actually buying chargers, about the products the client actually sold. Generic copy about "sustainable mobility" wouldn't have ranked and wouldn't have sold. Together with the technical fixes, that rewrite helped the site reach Google's top three for 14 target keywords in nine months, and client sales rose by about 70%.

My rule: AI can give me the shape. The sentences a reader sees are mine, or the client's.

### 2. The facts

Last month I asked an AI research tool to collect popular YouTube videos on a topic, with what commenters were saying. It came back with nine video titles and a neat summary of viewer reactions. When I checked, seven of the nine titles did not exist, and the "commenter" quotes were made up too.

The output looked confident and professional. That's the danger. A wrong fact in an internal note costs you ten minutes. A wrong fact in a published article costs you trust, and trust is slow to rebuild.

Since then I treat AI research as a list of leads, not a list of facts. Nothing gets quoted until I've opened the source myself. Every statistic in this article has a link next to it for that reason.

### 3. The judgment calls

AI is good at answering the question you asked. It's bad at telling you that you asked the wrong question. What to say no to, which audience to ignore, which channel to stop funding: these are positioning decisions, and they depend on context a model doesn't have, like a founder's appetite for risk or what the sales team keeps hearing on calls.

When I built go-to-market messaging for more than 30 enterprise software products at Skylink, the hard part was never writing the copy. It was choosing which one problem each product should own.

## Why mass-produced AI content is a losing bet in 2026

If the only argument for a human edit were taste, you could ignore it. The data from this year makes a harder case.

**Google is actively cleaning up.** On September 24, 2026, Google started its [fourth confirmed spam update of the year](https://www.searchenginejournal.com/google-september-2026-spam-update/590828/), after updates in March, June, and August (Search Engine Journal). Google hasn't said exactly what this one targets. But its [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) already name "using generative AI tools or other similar tools to generate many pages without adding value for users" as an example of scaled content abuse.

To be clear, Google doesn't ban AI. Its own [guidance on AI-generated content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) says appropriate use of AI isn't against its guidelines. The line is value, not the tool.

**Generic answers now get answered for you.** In a randomized field study of 1,065 US users, researchers from the Indian School of Business and Carnegie Mellon found that [AI Overviews reduced organic clicks by 38%](https://www.searchenginejournal.com/ai-overviews-cut-organic-clicks-38-field-study-finds/573145/) on the searches where they appeared, and pushed zero-click searches from 54% to 72% (reported by Search Engine Journal, April 2026). If your article says the same thing as every other article, Google's summary says it first, and nobody needs to click. (I wrote about what this does to your reporting in [Your Dashboard Can't See AI](/blog/measuring-marketing-when-ai-answers-first/).)

**Volume doesn't buy AI visibility either.** Ahrefs looked at 75,000 brands to see what predicts being mentioned by ChatGPT, Google AI Mode, and AI Overviews. The number of pages on a site [showed almost no relationship](https://thenextweb.com/news/ahrefs-youtube-mentions-ai-visibility-brand-search), with a correlation of about 0.194. The strongest signal was how often a brand is mentioned on YouTube, at about 0.737 (The Next Web, May 2026). Publishing a hundred AI articles doesn't make AI tools talk about you. Real people talking about you does.

## The technical fixes are hygiene, not strategy

I'm an SEO person, so I want to be fair to the technical side. My own site has structured data and an llms.txt file, a plain-text guide that helps AI tools read the site. I add them because they're cheap and they remove friction.

But they aren't what gets you cited. When Ahrefs tracked [1,885 pages that added schema markup](https://ahrefs.com/blog/schema-ai-citations/) against 4,000 control pages, they found "no major uplift in citations on any platform": +2.4% in AI Mode, +2.2% in ChatGPT, and −4.6% in AI Overviews (Ahrefs, May 2026).

Do the technical work. Just don't mistake it for the work that matters.

## My split, in one table

| Machine work | Human work |
|---|---|
| Finding and scoring leads | Deciding who the customer actually is |
| Summarizing research | Checking every fact before it's published |
| First drafts and outlines | The final voice and the final edit |
| Rewriting one idea for five channels | Choosing the one idea worth saying |
| Formatting and moving data | Reading the report and deciding what to change |

The left column is where AI saves you hours. The right column is where your customer decides whether to trust you.

## Sources
1. HubSpot, [2026 State of Marketing](https://blog.hubspot.com/marketing/hubspot-blog-marketing-industry-trends-report) (updated April 10, 2026; 1,500+ marketers)
2. Search Engine Journal, [Google's September 2026 Spam Update](https://www.searchenginejournal.com/google-september-2026-spam-update/590828/) (September 24, 2026)
3. Google Search Central, [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies)
4. Google Search Central, [Guidance on using generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
5. Search Engine Journal, [AI Overviews Cut Organic Clicks 38%, Field Study Finds](https://www.searchenginejournal.com/ai-overviews-cut-organic-clicks-38-field-study-finds/573145/) (April 27, 2026)
6. The Next Web, [YouTube mentions are the top signal for AI brand visibility](https://thenextweb.com/news/ahrefs-youtube-mentions-ai-visibility-brand-search) (May 27, 2026), reporting Ahrefs' 75,000-brand study
7. Ahrefs, [We Tracked 1,885 Pages Adding Schema. AI Citations Barely Moved.](https://ahrefs.com/blog/schema-ai-citations/) (May 11, 2026)
