# Tone of voice for posts

How the posts under `content/posts/` should read. Read before writing or editing a post. The
docs, READMEs and `CLAUDE.md` files in the repositories keep the family's plain register
(`../../ankka-brain/voice.md`); this file is for the writing section only.

*As of 2026-10-20.*

## In one line
A craftsman talking to you across a table about something that happened, until it turns out to
have been about the work all along. Then one line that lands, and stop.

## What the voice believes
These are the working beliefs behind the voice, and they are what make it rather than any trick
of punctuation.

- **The reader has to care, or nothing else matters.** Information is not the point of a post;
  the point is that a reader feels why it matters. Everything else is production.
- **A conclusion has to be earned.** Beats join with *therefore* and *but*, never *and then*.
  If the only link between two paragraphs is that one came after the other, something is broken.
- **Take a side.** A stance specific enough to exclude as well as include. A position that
  agrees with everyone has said nothing. Hedging is a defect.
- **Set the expectation, then break it.** Comedy and horror run on the same structure: setup,
  confirmation, rug-pull. So does a good post.
- **Honesty beats the press release.** The thing that never shipped. The design the client
  loved and did not run. The failure is told straight and is what makes the rest believable.
- **Restraint is a choice, not a shortage.** Leave out the words that do not belong. The job
  is often not to describe the thing but to find the few words that belong there.

## The shape of a post
Nearly every post follows the same arc. Keep it.

1. **Open on something that happened.** A specific moment, told flat, in one to three short
   lines: the pod that would not start, the message a stranger left, the photos on a company's
   team page. Or open on a single blunt claim with a full stop and no preamble. Never open with
   context, a definition or a throat-clear.
2. **A deadpan aside.** One line of self-deprecation before the point. It buys trust for what
   follows.
3. **The pivot.** A short paragraph that turns the story into the subject. The hinges: "But
   here's the thing." "But that misses the point." "Anyway." "But it got me thinking."
4. **The principle, built not announced.** Two to five short paragraphs. Each one follows from
   the last by consequence or complication. Name a named thing: a project, a person, a talk, a
   document, a release. Never "studies show" or "many people".
5. **Bring it home to the work.** The story becomes the engineering lesson. One paragraph, no
   more.
6. **The kicker.** Two or three very short lines, each its own paragraph, ending on a callback
   to the opening or an inversion of the sentence before. Then stop. No summary, no call to
   action, no question to the reader.

Length: 300 to 700 words for a short post. A longer post keeps the same arc and adds a middle;
it does not add an introduction.

## The moves
Techniques that can be reused deliberately. One or two per post, not all of them.

- **The one-word paragraph.** "Misdirection." "Wow." Used once, at the moment the post changes
  gear.
- **The list of fragments.** "Setup. Confirmation. Then pull the rug." "Journal. Snapshot.
  Projection. And the thing that reads it." Nouns or short clauses, full stops between, the last
  one broken with "And" or "Then".
- **The triad whose third beat turns.** Two parallel lines that set a rhythm, a third that
  completes it, then "But" and the line that matters.
- **The inversion.** The same words, reversed, carrying the whole argument. Easy to work with
  does not mean easy. Taking every side is taking none. The line that passes, not the line that
  lands. Aim for one per post and put it at the end.
- **The taxonomy with a tag.** Name a type in bold or title case, describe it deadpan in two or
  three sentences, then say what it really means: "It says: we are careful, but we ship." Works
  for anything that comes in recognisable kinds.
- **"X without being Y."** Warm without being casual. Strict without being brittle. Premium
  without pomposity. The verbal form of a design trade-off.
- **The specific absurd detail.** A suspiciously resilient Ficus. A kebab recommendation at
  10:47pm. A build that only fails on a Tuesday. One concrete, slightly too precise detail does
  more than an adjective.
- **The British idiom, used once.** All mouth and no trousers. Barking up the wrong tree. Hey
  presto. Here's the rub. Naff. One per post, never two.
- **The named reference.** A real person, work, talk or campaign, named, so the reader can go
  and look.

## Sentences
- Short, mostly. A long rolling sentence is allowed once it has earned the right by being
  followed by one of three words.
- Sentences start with And, But, So, Because, Which. That is where the reasoning shows.
- First person singular, "I", and a reader addressed as "you". "We" only when it means a real
  group of people who were in the room.
- Contractions throughout: it's, doesn't, I'll, you've.
- Conversational hinges are allowed and are part of the sound: the thing is, the truth is,
  don't get me wrong, by the way, anyway.
- No rhetorical questions, or one, two words long, right before the kicker. "But me?"
- No hedges. Not "might", "perhaps", "arguably", "in some ways". Say it or cut it.
- No exclamation marks, no emoji, no hashtags.

## Words
Used: land, lands, care, feel, earn, earned, stick, hollow, edge, attitude, taste, craft,
restraint, rug-pull, beat, rhythm, truth, story, character, the job, the work, fine, passable,
"it'll do".

Avoided: leverage, robust, seamless, powerful, unlock, journey, solution, "best practice",
passionate, authentic, "not only ... but also", "it's important to note", moreover, furthermore,
"in today's world". Brand-personality adjectives in pairs ("confident, not arrogant") are what
the voice mocks; do not describe things that way.

## Mechanics that are this site's
- British spelling: licence, recognise, behaviour, optimised.
- Family and product names lower case, always: ankka, voice, satisfactory. Even starting a
  sentence.
- Headings in sentence case, lower case where the site's posts already do it.
- Dashes: prefer a full stop and a new sentence. Where a dash is needed, a spaced en dash,
  never an em dash.
- Backticks for an identifier, a path or a version when one has to appear; keep them rare in a
  post. Describe the thing in words first and name it once.
- Exact numbers and dates. "Twenty years", "five years on one account", "3M views in 72 hours".
  Never "recently" or "a while ago".
- Front matter as the schema in `src/content.config.ts` requires; `kind` says what sort of
  post it is (decision, trap, release, essay); `summary` is one plain sentence in the family's
  register, not a teaser.

## Applying it to engineering subjects
The arc does not change because the subject is a build. The anecdote is the pod that would not
start, the licence key that turned up in a customer's logs, the test that only failed on a
Tuesday. The principle is the design rule. The kicker is the rule inverted or the anecdote
revisited.

An opening in this voice, for the decision the draft post about Pekko records:

> Every pipeline we shipped carried a licence key.
>
> Not ours. Akka's. Injected into every pod, so every customer who ran one of our pipelines
> inherited a key they had never signed for, and the terms that came with it.
>
> Nobody noticed for a while. That's the problem with constraints. They don't stay where you
> put them.

And a kicker for the same post:

> A dependency that brings back a licence is not a version bump.
>
> It's a design change wearing a version number.

The middle still carries the real content: the versions, the divergences page, what was lost
and what it costs now. Just without headings that say "context" and "the decision", and with
each paragraph following from the last.

## Before publishing
- Read it aloud. Does it sound like one person talking, or like a document?
- Delete the first paragraph if it is context. The post starts where something happens.
- Find every "and then" between paragraphs and replace the join with a reason.
- Count the hedges. Should be zero.
- Is there a side taken that someone could disagree with? If not, there is no post yet.
- Does the last line call back or invert? Does it stop there?
- Cut more.
