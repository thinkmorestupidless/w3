---
title: "Pekko, not Akka: what leaving BSL cost"
date: 2026-10-14
family: ankka
kind: decision
summary: "ankka reimplements Akka's component model on Apache Pekko so that nothing on the path a customer runs carries a BSL licence."
repos: [ankka, ankka-flow, cloudflow]
minutes: 9
draft: true
---

> A dependency that reintroduces a BSL licence is a design change, not a version bump.

## context

ankka exists to offer Akka's component model with no licence constraint on who runs it or what they run on it. Cloudflow, forked to build graph pipelines over ankka's topics, ran on commercial Akka with a licence key injected into every pipeline pod. Every customer of a pipeline inherited that key, and the terms that came with it.

That is the whole problem in one sentence. The constraint does not stay with the platform; it transfers to everyone downstream.

## the decision

Apache Pekko everywhere on the JVM, pinned whole via family overrides in each build. Cloudflow was ported to Pekko in its phase 1; ankka-flow started on Pekko. Every deliberate departure from Akka is listed in ankka's `docs/reference/akka-divergences.md`, so a reader who knows Akka can see exactly what is different and why.

```scala
// project/Dependencies.scala
val pekko        = "1.7.0"
val pekkoHttp    = "1.4.0"
val pekkoKafka   = "1.2.0"
val pekkoMgmt    = "1.2.1"
val kafkaClients = "3.9.2"
```

One line, mirrored in every JVM repository. A Pekko bump is a family change, not a repo change, and it is made in ankka first.

## what lost

1. **Commercial Akka with a licence key.** Lost: the constraint transfers to every customer.
2. **Akka 2.6, frozen.** Lost: unmaintained; Pekko is the maintained continuation.

## what it costs now

ankka-flow additionally excludes pekko-http and pekko-grpc by rule; that is a repo decision, not a family one. cloudflow's frozen 0.1.0 line is the one place Akka survives, for an existing consumer who has not moved yet. Every other repository in the family shares the line above and will share the next one.

The honest list for this decision is short. Pekko lags Akka on a handful of features, and the divergences page says which. None of them has been missed yet.
