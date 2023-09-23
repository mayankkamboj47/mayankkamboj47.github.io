---
layout : post
title : Why the P(H)=1/3 solution to sleeping beauty doesn't work
---
Note :  This is a paper outline. I have highlighted the paragraph with the central claim in yellow.


> ### Abstract
> This paper argues that two popular arguments for the P(H)=1/3 solution to Sleeping Beauty are flawed. The first argument, from Elga (2001), relies on incompatible assumptions. The second, an argument that says Beauty will guess correctly more with P(H)=1/3, relies on a poor understanding of the notion of trials. Finally, a solution that avoids these issues is proposed.

Beauty will sleep continuously for two days - Monday and Tuesday. Her mother agrees, but only if they play a game. The mother will flip a coin. If the coin shows heads, mother will wake Beauty on Monday. If tails, she wakes Beauty on both Monday and Tuesday. Beauty forgets her previous awakenings. What probability should Beauty assign to heads when awakened?

At first Beauty might think: "Heads or tails, I would've woken up - it tells me nothing. The coin is fair, besides, so $P(H) = 1/2$." But Elga (2001) argues for $P(H) = 1/3$. His argument is the following:


$1. P(H) + P(T) = 1$

__Justification__ : Heads and Tails are complements

$2. P(Mon|T) = P(Tue|T) = \frac{1}{2}$

__Justification__ : Equal chance of awakening being on Monday or Tuesday if tails.

$3. P(H|Mon) = P(T|Mon)$

__Justification__ : Beauty will wake up on Monday no matter the coin outcome. So say it is tossed after Monday awakening then and Beauty knows this.

Together these give $P(H) = 1/3$.

## Problems with Elga's Third Premise

The third premise here combines two contradictory intuitions:

1. On Monday, the coin isn't tossed yet, so heads and tails are equally likely. 
1. If today is Monday, it rules out that today is Tuesday, and with it, some probability of tails.

Elga uses the second intuition to get $P(T|Mon) = P(T)/2$. But he combines it with the first intuition that the toss happens on Monday. Therefore, on Monday, the coin isn't tossed yet, and yet Beauty knows that probability of Tails has fallen - as if she has a crystal ball !

An example shows how strange the combination of these two intuitions is. Say you're being blindfolded and fed a candy based on a coin toss. On heads, you get a sour candy. On tails, you get either a sour or sweet candy with 50-50 chance. If the candy turns out to be sour, will you assign equal likelihood to heads and tails ? Here, the sweet candy and sour candy correspond to Monday and Tuesday. If a sour candy increases chances of heads, shouldn't
the fact that today is Monday and not Tuesday, also increase the chance of heads ?

It would, but the third premise forces it not to, and relies on a fairly reasonable-sounding intution. The third premise only avoids
contradiction by giving relative likelihood. We have two ways of showing the falsity of the solution. The first way, with a weaker conclusion, shows that it is like biasing the coin. The second way, in just a few sentences, shows that if someone believes in logical tautologies, they would find Elga's premises contradictory. 

### <mark>Elga's Premises ≡ Biasing the coin</mark>

We do this by cases. First, that Biasing the coin -> Elga's premises. Then the other way around. 
Take a biased coin with $P(H) = 1/3$. Heads means I give you sour candy. Tails means I randomly choose sour or sweet candy. Then:

$P(H) + P(T) = 1$

$P(S|H) = 1$

$P(S|T) = P(Sw|T) = 1/2$

From these, we can derive 
$P(H|S) = P(T|S) = \frac{1}{2}$

Replace S with Mon and Sw with Tue, since they're just arbitrary names. This matches Elga's assumptions. Same can be done in the other direction. That is, instead of using a biased coin case to derive Elga's assumptions, we could start with Elga's assumptions,
replace the symbols 'Mon' and 'Tue' with 'S' and 'Sw', and derive our biased coin sour and sweet candy premises, listed above. This proves the equivalence. 

### A logical Beauty

<mark>At any point, Beauty believes in logical tautologies - for example that the coin is either tossed or not tossed. She thus believes that the coin is either tossed or not tossed when wakes on a Monday. If tossed already, Elga's third premise stands intuitionless, and Beauty has no reason to believe in it. Alternatively, if the toss hasn't happened yet, it must happen today. Today must certainly be Monday then, and $P(Mon)=1$, not Elga's $P(Mon)=2/3$. Either way, we find contradiction with Elga's three assumptions. </mark>


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