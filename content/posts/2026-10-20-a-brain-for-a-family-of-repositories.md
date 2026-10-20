---
title: "A brain for a family of repositories"
date: 2026-10-20
family: ankka
kind: essay
summary: "Why the cross-repository facts about a family of projects kept drifting, and the pattern that fixed it: one small repository per family that holds the map, the pins, the decisions and the conventions, wired into every agent session through a parent-directory CLAUDE.md."
repos: [ankka-brain, voice-brain]
minutes: 9
draft: true
---

Most of the code on this account was written with an agent beside me. That works well inside one repository, where a `CLAUDE.md` at the root tells the agent what the project is, how to build it and what has bitten before. It works much less well the moment the job spans more than one repository, and by the autumn of 2026 the ankka family had six of them.

This post is about the pattern I ended up with for that: a brain. A small repository per family of work that holds what no single repository can, read by people and agents alike. I'll describe the problem, what a brain contains, how it reaches an agent session, why it holds up, and what it costs.

## The problem

Six repositories shared a thesis, a Pekko version line, a release model, a docs tool, a plugin marketplace, an identity realm and an infrastructure story. Each one documented itself well. The picture across them did not exist anywhere.

Who pins which version of whom. What is waiting on what. Which decision, taken in one repository, quietly constrains a sibling. The reason cloudflow was frozen on the Akka line. Why satisfactory is a separate product rather than a module. All of that lived in scattered paragraphs across several `CLAUDE.md` files, and the rest lived in my head.

An agent working in one repository routinely needed facts from another. It had two options, and both were bad. It could guess, which produced plausible, confident and wrong code. Or I could paste the facts into the session by hand, every session, and watch them drift from whatever was true last week.

The obvious fix is to write the cross-repository facts into every `CLAUDE.md`. I did that for a while. ankka's grew to about 1,600 lines, the same facts were duplicated between repositories, and the copies disagreed. A fact written in two places is wrong in one of them by next month.

I had also tried, back in May, a company-wide brain that was meant to cover everything I do. It stayed a skeleton. The lesson from that attempt was about scope: the knowledge worth mapping is dense inside a family of related projects and thin across unrelated ones. A brain for everything is a brain for nothing.

## What a brain is

On 30 September 2026 the ankka family got `ankka-brain`: a repository checked out beside the others, holding only what has no single-repository home. It is plain markdown in git. There is no tooling, no generator, no database.

The layout has stayed the same since:

- `family.md`, the map. The thesis in a paragraph, a table of what each repository is and how it relates to the root, and the dependency and pinning chain: who consumes what from whom, pinned at which version, by what mechanism. This is the file I open most.
- `principles.md`, the beliefs that show up in real decisions. Each one names the place it bites. "No BSL on the path" is the reason the family exists; "only a tag publishes" is why there is no version file anywhere.
- `conventions.md`, how every repository is built, tested and released, written once. A repository's own file lists only its deviations.
- `glossary.md`, the vocabulary that crosses repository boundaries.
- `roadmap.md`, what is in flight and what waits on what, with a date on every claim.
- `infrastructure.md`, where things publish. Pointers and coordinates, never values.
- `audiences.md` and `voice.md`, who the work is for and how it talks, loaded before writing anything public.
- `reuse-map.md`, what is shared across the family, what should be, and what deliberately is not.
- `repos/`, one short file per repository and a status board that indexes them.
- `decisions/`, a log of the decisions that touch two or more repositories, in the usual ADR shape: status, repos affected, context, decision, alternatives with the real reason each lost, consequences.
- `workspace/`, the file that wires the brain into agent sessions. More on that below.

The rule that keeps it small is the first operating principle: one source, many references. Each repository's own `CLAUDE.md`, docs and design documents stay authoritative for anything inside that repository. The brain never copies them. It points at them. The per-repository file is a page of pointers: the one-liner, why it exists as its own repository, its stage and release, what it depends on and what depends on it, the five to eight files to read before working there, and its open questions.

So the brain holds only six kinds of thing: the map, the decisions that cross repositories, the shared conventions, the shared vocabulary, the publishing pointers, and status. Everything else has a better home already.

## How it reaches an agent

The wiring is the part that makes this more than a wiki. Claude Code loads a `CLAUDE.md` from every directory above the one a session starts in. So the family repositories are checked out as siblings under one directory, the brain among them, and that parent directory gets a `CLAUDE.md` of its own, copied from the brain's `workspace/` folder.

That file is short. It says what the directory is, then imports three brain files so they are always on: the map, the principles and the status board. It then lists what to load on demand and when: conventions before writing code, the glossary for a term, the roadmap before planning, infrastructure before a release, audiences and voice before writing anything public, the repository's own file for the repository you are in. Then one line that matters: if the task is not in a family repository, ignore all of this.

The effect is that a session started in any family repository knows the family before it reads the repository. It knows that ankka-reasoning pins ankka at 0.10.0 and wants the next release for person tokens. It knows that ankka-flow deliberately excludes pekko-http. It knows not to add a dependency that reintroduces a BSL licence, and that doing so would be a design change rather than a version bump. None of that had to be repeated in six places.

Each repository's own `CLAUDE.md` also carries a line pointing at the sibling checkout, for sessions started without the workspace file. One line is enough. The brain is found by convention, not by configuration.

## Why it works

A few properties of the pattern do most of the work.

**It is a repository.** Changes go through commits and pull requests, so the brain has history, and a wrong claim can be traced to the day it was written. The second repository to join the family after the brain existed, ankka-reasoning, arrived as a pull request to the brain that added its row, its file and its pins. That is a better onboarding document than any I would have written by hand.

**Short files, exact values.** Each file stays under about 500 words. Versions are exact and dated: "0.5.0, tagged 2026-09-26", never "the current release". Status claims carry a date line, and the reader is told to check the date before trusting one. This matters more for an agent than for a person. A person reads "recently" and asks. An agent reads "recently" and proceeds.

**Decisions record the alternatives.** The ADR shape forces the entry to say what else was considered and the actual reason it lost. Six months on, that is the only part anyone needs, because the question that comes back is never "what did we decide" but "why not the other thing".

**Maintenance is tied to events, not to a calendar.** The README names the triggers. When a release is cut, update the version table and the repository's row. When a spec opens or closes, update the roadmap. When a decision touches two repositories, log it and link it from each repository's own record. When the same thing gets built twice, add a row to the reuse map. An agent cutting a release can be told to do the brain update as part of the release, and it does.

**The same shape in every family.** The second brain, `voice-brain`, arrived on 19 October 2026 for the VOICE project. It has the same files in the same places, plus two the ankka family did not need: `people.md`, because voice has a copywriter and residents, and `tone-of-voice.md`, because the public site has a register of its own. Someone, or something, that knows one brain can read the other. And conventions shared between families, spec-kit, the scalafmt hook, serialised tests, tag-only deploys, are listed in both so people move between them.

**It says what it does not hold.** Every brain has a limitations list in effect: nothing installation-specific, no secret names beyond public CI, no design treatments. The boundary is written down, so the question of whether something belongs there has an answer before it is asked.

## Public and private

The first version of the brain was private, because it mixed the public platform's map with the hosted product, the infrastructure, and a customer's repository. That made it unreadable by the people the public repositories are for, which defeated half the point.

On 10 October 2026 it split by visibility. `ankka-brain` is public and covers the public repositories; it may say that private members exist and what role they play, and nothing more. `ankka-brain-private` sits beside it for those with access and extends every file rather than repeating it: the same file names, the same sections, only the private rows and chains.

The wiring handles the split cleanly. The parent directory's `CLAUDE.md` comes from the public brain; a `CLAUDE.local.md` beside it comes from the private one, and is never committed anywhere public. Claude Code loads the two side by side. Without the private checkout nothing is missing and nothing fails, which is exactly the behaviour a public contributor should get.

Decision numbering diverged at the split. The public log continues from where it was; the private log starts at 0001; two numbers were retired and not reused. Small things, but they are the kind of thing that confuses an agent if left implicit.

## What it costs

It is another thing to keep current, and it does go stale. The status board in `ankka-brain` today says plainly that most of its rows are behind: ankka is two minor versions past what the board records. The date column makes that visible rather than hidden, which is the best that can be said for it. The monthly re-read in the maintenance ritual exists because the event-driven updates are not enough on their own.

The imports from the parent file into a sibling checkout are "external imports" to Claude Code and need a one-time approval per repository in interactive sessions. In non-interactive runs they are skipped silently, so a scripted session gets the workspace file's own text and none of the imported files. It is written in the workspace README because it was not obvious.

And the brain only pays for itself once there are enough repositories for the cross-repository facts to be the problem. Two repositories do not need one. Six did. VOICE has two and got one anyway, because it has a website, a copywriter and a public of its own, and because the shape was already known and cheap to copy. It is a judgement call, and I would not make it for a pair of hobby projects.

## Starting one

If you have a family of repositories and an agent working across them, the steps are short.

1. Make a repository called `<family>-brain` and check it out beside the others.
2. Write `family.md` first: the thesis, the roles table, the pinning chain. If you cannot fill the pinning chain from memory, that is the problem the brain exists to solve.
3. Write one file per repository that points into that repository's docs and never restates them.
4. Start `decisions/` with entry 0001, which is the decision to have a brain, and record the alternatives you rejected.
5. Put a `CLAUDE.md` in the parent directory that imports the map and the principles and says when to load the rest.
6. Add a line to each repository's own `CLAUDE.md` pointing at the sibling checkout.
7. Write down what the brain will never hold.

Then let the maintenance happen at the events: a release, a spec, a decision that crosses a line.

This site is one more consumer of the brains. The families on the home page, their repositories and what each one is are read from GitHub at build time, and the thesis on each family's page is the brain's own first paragraph, lightly trimmed. One source, many references, applied to the site as well.
