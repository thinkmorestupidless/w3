---
title: "NEAT: grow the network, don't design it"
date: 2024-02-29
family: odds-and-ends
kind: essay
summary: "NEAT evolves a neural network's shape as well as its weights; its 2002 tricks, historical markings and speciation, and the novelty search that followed, still owe nothing to transformers."
repos: []
minutes: 14
draft: false
---

In 2015 a man called Seth Bling pointed a program at Super Mario World and walked away.

The program knew nothing. Not what a Goomba was. Not which way was right. Not that the hole was a bad idea. When he came back it had finished the level. [The video is still up](https://www.youtube.com/watch?v=qv6UVOQ0F44), and it is still worth six minutes.

The idea behind that program was thirteen years old at the time. It is twenty-two years old now, and it still has nothing to do with the thing everyone is building on.

So this is a post about that idea. Not because it will replace anything. Because it is good, and because almost nobody has heard of it.

## asking the archive

You can ask a model for a list of forgotten algorithms. I have. You get the ones everyone already knows, because that is what "most likely next word" means. It is the centre of everything ever written. The archive is at the edges.

So you read. Not hunting for the next Dynabook or the next Xanadu. Hunting for the clever trick that solved a hard problem on a small scale, which is where most of the useful ones live.

This one is called NEAT. NeuroEvolution of Augmenting Topologies. Kenneth Stanley and Risto Miikkulainen, University of Texas, 2002. [The paper is eleven pages](https://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf) and you can read it on a train.

## what it does

Everything you have read about neural networks this decade starts the same way. Somebody decides the shape. How many layers, how wide, which activation. Then training finds the weights.

NEAT does not start with a shape. It starts with the smallest network that could possibly work, every input wired straight to every output, and a way to score the result. Then it grows. A node here. A connection there. A weight nudged. A thousand generations later you have a network that solves the problem, and it is usually the smallest one that does.

It is a genetic algorithm. Which means, before the clever part, the ordinary part.

## the ordinary part

A genetic algorithm is a way of getting a good-enough answer to a problem where the best answer would take until the heat death of the universe. Travelling salesman. Job-shop scheduling. Anything NP-hard.

It needs two things. A way to write a candidate answer down, the genome. And a fitness function, which scores one.

Then it does what nature does.

Population. Score. Select. Breed. Mutate. Repeat.

The fittest breed, the children inherit a bit of each parent, and every generation is a step through the space of possible answers towards the ones that score well. Mutation keeps the whole population from settling into the first dip it finds. None of this is new. It has been the whole of it since the 1970s.

The problem is the first requirement. Write a neural network down as a genome. Then breed two of them.

## the problem

Take two networks.

<figure>
  <img src="/posts/neat/parent-networks.svg" alt="Two small neural networks with different shapes, parent 1 and parent 2" />
  <figcaption>Two parents. Their shapes are different, which is the whole point and the whole problem.</figcaption>
</figure>

Pick some connections from one and some from the other. What do you get? Nothing you can trust. A hidden node with nothing feeding it. An output nobody reaches. A connection that means the same thing in both parents and gets counted twice. Every attempt before 2002 either burned its time checking the child was properly wired, or restricted the shapes so hard that evolving them lost its point.

## the trick

Number everything.

<figure>
  <img src="/posts/neat/parent-networks-with-node-ids.svg" alt="The same two networks with an integer on every node" />
  <figcaption>Every node gets an integer.</figcaption>
</figure>

Now every connection is a pair of nodes, from and to, and that pair gets an integer of its own. The paper calls it an innovation number.

<figure>
  <img src="/posts/neat/parent-networks-with-genomes.svg" alt="Each connection labelled with its innovation number, and each network written out as a list of them" />
  <figcaption>Each connection identified by its innovation number. A network is now a list of them.</figcaption>
</figure>

Here is the part that matters. The number is global and it is permanent. The first time any network in the whole population connects node 1 to node 5, that connection becomes innovation 8, and it is innovation 8 forever, in every descendant, in every species, for the rest of the run. The number is not an index. It is a historical marking. It says: this piece of structure has this ancestor.

Which means two genomes can be laid side by side and lined up by number.

<figure>
  <img src="/posts/neat/parent-genomes-comparison.svg" alt="The two genomes stacked and aligned by innovation number, with gaps where one parent lacks a gene" />
  <figcaption>Lined up by number. Genes 6 and 7 are disjoint, genes 9 and 10 are excess.</figcaption>
</figure>

Some innovations are in both parents. Some are in one and sit in the middle of the other's sequence: disjoint. Some are in one and hang off the end: excess. A gene can also be switched off, carried but not built, which is how structure can lie dormant and come back generations later.

Breeding is now two rules. Walk the list. If a number is in one parent only, take it. If it is in both, take the fitter parent's version.

<figure>
  <img src="/posts/neat/parent-genome-crossover.svg" alt="The child's genome assembled gene by gene from the aligned parents" />
  <figcaption>Walk the list, apply the two rules.</figcaption>
</figure>

The child is at least as complex as its more complex parent, leans towards the fitter one, and is a valid network every single time. Nothing to check. Every piece of structure a connection needs arrived with it, because the number says where it came from.

<figure>
  <img src="/posts/neat/parent-offspring-networks.svg" alt="The two parent networks and the child network drawn beneath them" />
  <figcaption>The parents and the child. It is parent 2 with one extra connection, innovation 8, from parent 1.</figcaption>
</figure>

I remember reading this and feeling like I had been shown how the trick was done. It is the Holmes moment. Obvious, once you know how.

## the second problem

Numbering does not get you out of a dip.

<figure>
  <img src="/posts/neat/global-minima-local-minima.png" alt="A rumpled surface with several shallow hollows circled in red and one deep one circled in green" />
  <figcaption>From inside a hollow, every hollow looks like the bottom.</figcaption>
</figure>

New structure usually makes a network worse before it makes it better. A fresh node with random weights is dead weight for a few generations. In a population ranked on fitness it gets culled before it has had a chance to prove itself. So the population settles into the first decent shape it finds and polishes it forever.

NEAT's answer is, again, from biology. Species.

Mules aside, a species is a boundary to breeding. NEAT draws the same boundary: a distance between genomes, and only genomes within a threshold of each other breed. A network with new structure competes against its own kind, not against the whole population. The innovation gets time. If it bears fruit it spreads. If not, the species dies and nothing else was disturbed.

And how do you measure the distance between two genomes? With the same numbers.

<figure>
  <img src="/posts/neat/compatibility-function.png" alt="delta equals c1 E over N plus c2 D over N plus c3 W bar" />
  <figcaption>The compatibility distance from the paper.</figcaption>
</figure>

Count the excess genes, E. Count the disjoint genes, D. Average the weight difference on the genes they share, W. Weight the three with coefficients, divide the counts by the length of the longer genome so size does not dominate. One number, δ. Below the threshold you join the first species you fit. Otherwise you are the first of a new one.

Same trick, second problem. That is usually the sign of a good one.

## should you use it

Not for the thing you are probably doing. If you are fine-tuning a transformer, nothing here applies.

The paper's claim is narrower and better supported. Evolve structure and weights together, protect the new structure while it is weak, start minimal and grow, and you get better reinforcement learning results than a fixed topology gives you, from smaller networks, and the networks go on improving for more generations. Pole balancing, single and double, is the benchmark, and the numbers in the paper are not close.

The trade is size. If the function you want can be approximated by a small network, NEAT is worth a look. If it needs a billion parameters, it is not. [Someone on Stack Exchange](https://ai.stackexchange.com/questions/10965/why-would-someone-use-neat-over-other-machine-learning-algorithms) makes a second point that is easy to miss: a fitness function can be anything you can score. It does not have to be differentiable. That opens doors gradient descent cannot see.

## three ways people pushed it

**Real time.** In 2005 Stanley and others [did it while the game was running](https://nn.cs.utexas.edu/downloads/papers/stanley.ieeetec05.pdf). A squad of soldiers in a game, each with an evolved network for a brain, rewarded when they took cover and punished when they walked into fire, learning as you watched. [Here it is](https://www.youtube.com/watch?v=H2qSjyJ_0-4). Now think of a legged robot on a sea floor or another planet that loses a leg. You cannot pre-train for every way of being damaged. Evolve the gait with what is left.

**HyperNEAT.** The 2009 paper, [breezily titled](https://axon.cs.byu.edu/~dan/778/papers/NeuroEvolution/stanley3**.pdf), fixes something I glossed over. Evolution does not have one gene per cell. The genome holds rules that produce repetition with variation: left and right, fingers and toes, a cortex that repeats the same circuit. A direct encoding, one gene per connection, cannot do that, and it also throws away geometry. The squares on a chessboard are next to each other. The sensors on a robot are in a ring. The network has to learn what the layout already says.

So HyperNEAT evolves something smaller: a network whose only job is to answer, for any two points in a space, what the weight between them is. The space is the substrate, and you lay it out to match the problem: pixels where the pixels are, sensors in a ring.

<figure>
  <img src="/posts/neat/querying-cppn.png" alt="A substrate of nodes beside a small network that is asked for the weight between pairs of them" />
  <figcaption>Every potential connection in the substrate is queried; the small network answers with a weight. The pattern of weights is a function of the geometry.</figcaption>
</figure>

Picture a square of grey noise.

<figure>
  <img src="/posts/neat/perlin-noise.png" alt="A square of soft grey Perlin noise" />
  <figcaption>A plane of values between 0 and 1.</figcaption>
</figure>

Pick two points, draw a line between them, add up the grey along it. That is the weight. Except that two points is four coordinates, so the plane is a hypercube, and what HyperNEAT is really doing is painting the inside of a four-dimensional box. Hence the name.

The side effect is the good bit. Decide later that you need more nodes, a sharper image, a finer ring of sensors. Query the same painting at more points. No further evolution. [The paper on those small networks](http://eplex.cs.ucf.edu/papers/stanley_gpem07.pdf) is a post of its own.

**ES-HyperNEAT.** Inevitable, really. One algorithm evolves shapes and another paints weights, and in [2012 somebody mixed the chocolate with the peanut butter](https://direct.mit.edu/artl/article/18/4/331/2720/An-Enhanced-Hypercube-Based-Encoding-for-Evolving). The rule is that density should follow information. Look at the painting, find where the paint is thickest, put the nodes there. The finding is done with a quadtree, which anyone who has optimised collision detection in a game engine will recognise on sight. Nobody decides where the hidden nodes go any more.

## novelty

The last one changes the fitness function, and it may change something in you.

Around 2015 Stanley was touring a book, [Why Greatness Cannot Be Planned](https://www.amazon.com/Why-Greatness-Cannot-Planned-Objective/dp/3319155237/), and one of the demos was a website called Picbreeder. Visitors evolved images. Every image was drawn by a network that NEAT had grown. You picked the ones you liked and the site bred them.

<figure>
  <img src="/posts/neat/picbreeder-start.png" alt="The Picbreeder interface with a grid of blobby starting images" />
  <figcaption>Where everyone started.</figcaption>
</figure>

<figure>
  <img src="/posts/neat/picbreeder-results.png" alt="A grid of evolved images that look like faces, animals, a car, a butterfly" />
  <figcaption>What turned up, now and then, after many generations.</figcaption>
</figure>

Faces. A car. A butterfly. And nobody could breed one on purpose. Aim for a face and you never arrive. However close you think you are, the next generation goes somewhere else, because there are too many somewhere elses. The only people who found faces were the ones who had stopped looking for them.

So he changed the reward. Stop rewarding getting closer. Reward doing something nobody in the population has done before.

That is it. That is novelty search.

The hard maze shows why it works.

<figure>
  <img src="/posts/neat/hard-maze-example.png" alt="A maze whose exit is close to the start as the crow flies but reachable only by walking away from it first" />
  <figcaption>To reach the end you must first move away from it.</figcaption>
</figure>

Reward distance to the exit and every agent bunches in the dead end nearest it, because moving away from the goal is always punished.

<figure>
  <img src="/posts/neat/hard-map-fitness.png" alt="Agent end positions clustered in the dead end closest to the exit" />
  <figcaption>Fitness: a crowd in the nearest dead end.</figcaption>
</figure>

Reward novelty and the population spreads across the whole maze, and someone walks out.

<figure>
  <img src="/posts/neat/hard-map-novelty.png" alt="Agent end positions spread across the maze, several at the exit" />
  <figcaption>Novelty: the whole maze, and the exit.</figcaption>
</figure>

The comparison in the talk is friendlier to novelty than it needs to be; a naive fitness function was always going to lose that maze. [The short version](https://www.youtube.com/watch?v=-mxpn95uxS4) and [the longer talk](https://www.youtube.com/watch?v=JlSLJ8ciHDE&t=212s) make the case properly. The [biped gait comparison](https://www.youtube.com/watch?v=lyZorMEvmjM) is harder to argue with. One of those robots walks.

## where the archive is

There are many NEAT implementations and few that work. Most are academic code, which is a kind way of saying what you will find out for yourself.

- The original C++ is no longer where the paper pointed. [stanley_neat](https://github.com/janhohenheim/stanley_neat) is the copy that leaves it most alone.
- [SharpNEAT](https://github.com/colgreen/sharpneat) is the one. Documented at length, with videos from its author, examples, and most of the extensions above. I still wish it ran inside Unity.
- Before you trust any of them, look for the standard tests: XOR, pole balancing, double pole balancing. A repository that has all three probably works and will show you how to build an experiment of your own.
- [The Neural Networks Research Group at Texas](https://nn.cs.utexas.edu/?neuroevolution) and [the HyperNEAT page at Central Florida](http://eplex.cs.ucf.edu/hyperNEATpage/HyperNEAT.html) hold everything else.

Stanley's users could not breed a face on purpose. They could only wander until one turned up.

That is how I found this paper.

It is how you will find the next one.
