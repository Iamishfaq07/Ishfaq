# Why I built a free 485-lesson security course

Every few weeks someone asks me the same question: *where do I start?* And for years my honest
answer was a shrug and three links, none of which actually started where the person asking was
standing.

That's the gap KashSec exists to close.

## The problem with "beginner" material

Open almost any beginner security course and count how long it takes before something is assumed
rather than taught. Usually it's about four minutes.

- "Open a terminal and `cd` into the directory" — assumes Linux.
- "The request goes out over TCP port 443" — assumes networking.
- "Just intercept it in Burp" — assumes a proxy, a certificate store, and the browser trust model.

None of those assumptions are unreasonable *for the audience the author had in mind*. They're just
fatal for the person who doesn't have them. That person doesn't conclude "this course wasn't
written for me." They conclude "I'm not smart enough for security," and they leave.

The first hard month is where the field loses most of the people it claims it wants.

## What I did instead

I started Path 00 at a genuinely absurd altitude: **what is a computer**. What a file is. What a
process is. Why a program needs memory. Then the security mindset — thinking in terms of trust
boundaries and assumptions — before a single tool appears.

From there it climbs:

| Stage | Paths | What it covers |
| --- | --- | --- |
| Foundations | 00–05 | Computers, Linux, Windows, networking, the web, crypto basics |
| Core security | 06–12 | Web app security, threat modelling, blue team, forensics |
| Specialised | 13–19 | Mobile, malware/RE, cloud, CTF, API security |
| Advanced | 20–25 | DevSecOps, AI red teaming, Zero Trust, OT/ICS, career prep |

485 sub-lessons. 42 interactive labs. 104 practice tasks where you type the answer and the answer
is deliberately *not* on the page. 21 quizzes and a final exam.

## Three rules I wrote it under

**1. Never assume a prerequisite you haven't taught.** If a lesson needs a concept, either the
concept has its own lesson earlier in the path or it gets explained inline. This is the rule that
made the course five times longer than I planned, and it's the only one that actually matters.

**2. Every abstraction gets a lab.** You can read about JWT signature confusion three times and
still not believe it. You forge one token in a browser lab and you never forget it. The labs are
all client-side — no VM, no lab infrastructure, no "sorry, the target is down."

**3. No paywall, ever.** Not a freemium tier, not a certificate upsell. The people who most need
free security education are exactly the people least able to signal that they'd pay for it.

> The measure of a course isn't how much it covers. It's how few people it loses.

## What I got wrong

Plenty.

The first version had **no progress tracking**, and people would close the tab and lose their place
across 485 lessons. Adding progress, bookmarks, notes and a streak counter changed completion more
than any content improvement I made.

I also badly underestimated **offline use**. A meaningful share of the audience is on unreliable or
metered connections. Turning the whole thing into a PWA — app shell plus all 485 lessons cached —
wasn't a nice-to-have. It was the difference between usable and not.

And I wrote the early quizzes as recognition tests, four options and one obviously silly distractor.
Useless. The typed-answer practice tasks that replaced them are harder, less satisfying, and
actually teach.

## If you're starting out

Start at Path 00 even if you think it's beneath you. It takes an afternoon, and it's the cheapest
way to find out which "obvious" thing you never actually learned.

Then pick **one** path and finish it. Breadth is a trap early on; the field is wide enough that you
can browse forever and never get good at anything.

[Start here →](https://kashsec.vercel.app/)
