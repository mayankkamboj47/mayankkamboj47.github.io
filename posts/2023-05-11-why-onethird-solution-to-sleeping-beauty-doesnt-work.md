---
layout : post
title : A critique on common P(H)=1/3 arguments for Sleeping Beauty
---


> ### Abstract
> This paper shows flaws in two popular arguments for the P(H)=1/3 solution to the Sleeping Beauty problem. The first argument, from Elga (2001), relies on incompatible assumptions. The second frequentist argument says Beauty will guess correctly more with P(H)=1/3. I show that this relies on a poor understanding of the notion of trials, and provide an examination of trial outcomes that refutes the point. I propose a solution where heads and tails are equally likely on Monday yet P(H) stays 1/2.

Beauty will sleep for two days - Monday and Tuesday. Her mother agrees, but only if they play a game. The mother flips a coin. If heads, she wakes Beauty on Monday only. If tails, she wakes Beauty on both days. Beauty forgets her awakenings. What probability should Beauty assign to heads when awakened?

At first Beauty might think: "Waking up gives me no new info. The coin is fair, so $P(H) = 1/2$." But Elga (2001) argues another solution is reasonable with $P(H) = 1/3$. His argument goes:


$1. P(H) + P(T) = 1$

__Justification__ : Heads and Tails are complements

$2. P(Mon|T) = P(Tue|T) = \frac{1}{2}$

__Justification__ : Equal chance of Monday or Tuesday if tails.

$3. P(H|Mon) = P(T|Mon)$

__Justification__ : Beauty will wake up on Monday no matter the coin outcome. So say it is tossed on Monday then and Beauty knows this.

Together these give $P(H) = 1/3$.

It's insightful to see where Elga goes wrong. With the premises stated clearly this way, the flaw must be in one of them.

## Problems with Elga's Third Premise

The core problem is the third premise. First, whether the coin is tossed Sunday or Monday only doesn't matter _if Beauty doesn't know_. If she does, Monday gives her new info. Elga ignores this. He just says :

> [Beauty's] credence upon awakening in the coin's landing Heads ought to be the same regardless of whether [the Mother] use[s] method (1) or (2). So without loss of generality, suppose [she] use[s] - and [Beauty] knows that she uses - method 2. 

Method 1 and 2 here refer to whether the coin is tossed on a Sunday or on Monday. Elga doesn't argue for why Beauty's knowledge of the method doesn't change the problem, and this has been missed by the critiques that have followed. 

More importantly, the third premise combines two contradictory intuitions:

1. The toss happens on Monday, so heads and tails are equally likely.
1. Monday rules out Tuesday, and with it, some probability of tails. 

An example shows the conflict. Say heads means I play guitar. Tails means I randomly choose guitar or another instrument. If I play guitar, do you assign equal likelihood to heads and tails? No - tails is now less likely since guitar playing fits better with heads.

Elga uses the second intuition to get $P(T|Mon) = P(T)/2$. But he combines it with the first intuition that the toss happens on Monday. This gives Beauty a crystal ball to predict future coin flips!

The crystal ball avoids contradiction only by giving relative likelihood. I show this is like biasing the coin. Take a biased coin with $P(H) = 1/3$. Heads means I play guitar. Tails means I randomly choose guitar or flute. Then:

$P(H) + P(T) = 1$

$P(G|H) = 1$

$P(G|T) = P(F|T) = 1/2$

From these, we can derive 
$P(H|G) = P(T|G) = \frac{1}{2}$

Replace G with Mon and F with Tue, since they're just arbitrary names. This matches Elga's assumptions. Same can be don in the other direction. The two problems are equivalent. 

The contradiction arises because "Monday" means two different things in Elga's premises. First it's an event certain to happen. Then it's an uncertain event - "today is Monday".

Beauty knows that coin is tossed or not when she wakes on a Monday. If tossed already, Monday lowers the odds of Tuesday and thus of tails. But then she can't assume the toss is still 50/50 on Monday - that relies on the fair coin being tossed today. Alternatively, if the toss hasn't happened yet, it must happen today. Today must be Monday then, and $P(Mon)=1$, not Elga's $P(Mon)=2/3$. Either way, we find contradiction with Elga's three assumptions. 


## Problem with the frequentist argument
Believing P(H)=1/3 makes Beauty correct more days on average. This forms the essence of many Dutch book arguments supporting the thirder solution and gives the argument credence. But a true frequentist would see the issue.

When repeating trials, probability P(E)=p means the limit of E's relative frequency is p. E must be an trial outcome that happens per trial. For Beauty, the total days correct is not a trial outcome [2]. Something is an outcome if you can answer in yes/no to whether it happened. For example,  answering correctly at least one day, and another, answering correctly everyday are outcomes.

Let's examine three strategies against these outcomes :

1. Random guessing each day
1. Always guessing tails
1. Always guessing heads


__Outcome : Answering correctly some day__
1. Random guessing

Beauty has a 0.5 chance of being correct each day. Chances of being correct once = 1 - Chances of being wrong always = 1 - 0.25 = 0.75

2. Guessing tails

Since Beauty has to be correct just once for the event to occur, guessing correctly 2 days in a row doesn't give her anything extra. She's correct with 0.5 chance.

3. Guessing heads

If the coin shows heads (50% chance), she'll get this one. 0.5 chance. 

__Outcome : Answering correctly all days__
1. Random guessing

Chances that the coin shows heads and Beauty guesses correctly all days = 0.5 * 0.5 = 0.25
Chances that the coin shows tails and Beauty guesses correctly all days = 0.5 * 0.5 * 0.5 = 0.125
Chances that beaeuty guesses correctly = 0.25 + 0.125 = 0.375

2. Tails only

If and only if the coin shows tails (50% chance), she'll guess correctly all days with this strategy. So she guesses correctly 50% of the days. 

3. Heads only

She'll guess correctly in case the coin shows Heads, and only then. Chance = 0.5. 

The heads and tails only strategies give identical results for the above trial outcomes, showing Beauty doesn't have more to gain by guessing one way than the other. Random guessing is more interesting, but perhaps a subject matter for future papers if anything.

## A timeless solution

Assumptions 2 and 3 conflict - you can't have both. Many solutions reject 3, but the intuition behind it is sound. It just conflicts with 2. I propose rejecting 2 instead with a "timeless" solution:

Take Tuesday = $t$ and Monday = { $t, \bar{t}$ }

$P(\bar{t}) = \frac{1}{2}$

$H=\bar{t}$

Using just these assumptions, one can derive Elga's assumption 3. Infact, one can derive the following, stronger and more intuitive result : 
$P(H) = P(H|Mon) = P(T|Mon) = P(T) = \frac{1}{2}$

This avoids Elga's problems. It doesn't assume Beauty's ignorance of toss timing matters. It avoids combining the conflicting intuitions about Monday. And it matches the frequentist argument by examining proper trial outcomes. By defining Monday and Tuesday as events that may occur rather than "today", it ditches reliance on the notion of time and avoids unnecessarily complicating matters, providing a cleaner basis for P(H)=1/2.

## Summary

Elga's argument incorrectly combines conflicting intuitions about Monday. The frequentist argument for P(H)=1/3 doesn't withstand rigorous analysis of trial outcomes, relying on the notion of in-trial 'days'. My solution provides a cleaner set of assumptions that give P(H)=1/2 without these issues. There is nothing wrong with Elga's Premise 3, but combining it with Premise 2 is the core flaw in his reasoning.


## Footnotes

1. Elga, Adam. Self-locating belief and the Sleeping Beauty problem. Princeton University Website. [https://www.princeton.edu/~adame/papers/sleeping/sleeping.pdf](https://www.princeton.edu/~adame/papers/sleeping/sleeping.pdf).
2. Trial outcomes are synonymous with the more formal word, event