---
layout : post
title : Why the P(H)=1/3 solution to Sleeping Beauty Doesn't Work
---


> ### Abstract
> This paper shows that Elga's P(H)=1/3 solution for Sleeping Beauty is wrong. It lists 3 basic assumptions Elga uses, and shows that they can't hold together. It also discusses the problem with frequentist reasoning that guessing tails allows one to be correct more often on average. Finally, it proposes a way to formalise the problem such that heads and tails are both equally likely on a Monday. 

There are multiple points of confusion in the [Sleeping Beauty Problem](https://www.princeton.edu/~adame/papers/sleeping/sleeping.pdf). These, combined with (what I will show to be) the wrong solution that the original paper argued for, has laid perfect ground for a never-ending debate. Below, I hope to settle some of this debate. 

Let's begin by introducing the problem. Beauty wants to sleep for 2 days in a row - Monday and Tuesday. Her mother objects, agreeing only if she plays a game with her. The mother will toss a coin. If its a heads, she'll wake her up on a Monday and then put her back to sleep shortly after. If its a tails, she'll do the same on Tuesday. Beauty doesn't remember anything that happens when she is drowsy, which means she'll forget her previous awakenings. On waking up, what probability should beauty assign to heads ? 

The problem may seem strange to you because it indeed is. It's a natural instinct to give this solution from Beauty's perspective : "Mother would have woken me up no matter what the coin showed. So waking up tells me nothing. The coin is fair, I should guess P(H)=1/2". Elga, however, says that P(H) should be 1/3. Here is his argument. 

$1. P(H) + P(T) = 1$

__Justification__ : Heads and Tails are complements of each other

$2. P(Mon|T) = P(Tue|T) = \frac{1}{2}$

__Justification__ : If the coin shows heads, it is either a Monday or a Tuesday today with equal chance. 

$3. P(H|Mon) = P(T|Mon)$

__Justification__ : Since Beauty is woken up on Monday in both cases, the coin could be tossed on a Monday without changing anything about the experiment. Say it is tossed on Monday then and Beauty knows about it. 

These together give $P(H)=\frac{1}{3}$, for full working refer to Elga. It's usually interesting to stop at this point and see where Elga went wrong. Because of the way I have stated his argument, it's clear that the fault lies with one of the premises. 

In this case, it's the third premise. First, and the weakest argument I'll make against it, is that it doesn't matter whether the coin is tossed on Monday or Tuesday *if Beauty doesn't know about it*. If she does, Monday carries additional information for her that it didn't before. Elga's justification contains no consideration for this possibility. He merely says : 
> [Beauty's] credence upon awakening in the coin's landing Heads ought to be the same regardless of whether [the Mother] use[s] method (1) or (2). So without loss of generality, suppose [she] use[s] - and [Beauty] knows that she uses - method 2. 

Method 1 and 2 here refer to whether the coin is tossed on a Sunday or on Monday after Beauty's awakening. Elga doesn't argue for why Beauty's knowledge of which method is being used doesn't change the problem. 

A second and more central problem with the third assumption is that it combines two contradictory kinds of intuitions together carelessly. First of these intuitions is the reasoning along "If I wake up on Monday, coin toss is happening today, so both heads and tails have equal chance". The second kind of intuition can be better explained using an example. If I played a guitar upon heads and any randomly chosen instrument out of many upon tails, and I do end up playing the guitar - are you going to assign equal chance to heads and tails ? No, chances of tails fall to a fraction of its initial value once you have the additional evidence of me playing the guitar, which always happens when I get heads, and rarely when I get tails. This kind of reasoning gives Elga $P(T|Mon) = \frac{P(T)}{2}$. That is, chances of Tails on Monday are just 1/2 of the original chance. He combines these two together to get the situation where when Beauty wakes up on Monday, the coin toss has not yet happened, but her chances of tails still fall down to $\frac{P(T)}{2}$ from $P(T)$. She seems to have a crystal ball that can predict outcomes of yet-to-happen tosses !

The only reason the crystal ball situation above doesn't lead to contradiction is that it gives her just the _relative_ likelihood of one outcome over another. I'll demonstrate that this is akin to believing the coin is biased. Say I have a biased coin with $P(H) = \frac{1}{3}$. If it is heads, I play a guitar. If it is tails, I pick 50-50 between a guitar and a flute. Formalising, 
$P(H) + P(T) = 1$

$P(G|H) = 1$

$P(G|T) = P(F|T) = 1/2$

From these, we can derive 
$P(H|G) = P(T|G) = \frac{1}{2}$

Now, just replace G with Mon and F with Tue. The biased coin assumptions thus reduce to Elga's three assumptions. The same could be done the other way around, by replacing the symbols "Mon" and "Tue" with G and F respectively. This proves the equivalence. 

Third, it is an unfortunate coincidence that $P(H)=\frac{1}{3}$ also makes Beauty correct the maximum number of days on average. It means that if the experiment was repeated a large number of times, you'd win about twice as many days with tails as with heads. The $P(H)=1/3$ solution gets a good chunk of its following because of this alignment with the frequentist vision. A true frequentist would spot the issue here, however. 
    When you repeat an experiment $n$ times, and the ratio of trails where some event $E$ happens to the total (n) is $p$ as $n \rightarrow \infty$, then we say that $P(E)=p$. In
Beauty's case, the outcome of the whole ordeal is not known. Total number of days she is correct
doesn't count as an outcome. An outcome should be of the nature that we can answer in "yes" or "no" in reply to the question of whether it happened. For example, "Beauty guessed whether the coin showed heads or tails correctly everyday" and "Beauty guessed whether the coin showed heads or tails correctly at least one day" count as outcomes. Let's consider these outcomes, and examine how 3 different strategies fare in these scenarios - a heads only strategy, a tails only strategy, and a random guessing strategy where she flips a coin every awakening herself.

__Answering correctly some day__
1. Random guessing

Beauty has a 0.5 chance of being correct each day. Chances of being correct once = 1 - Chances of being wrong always = 1 - 0.25 = 0.75

2. Guessing tails

Since Beauty has to be correct just once for the event to occur, guessing correctly 2 days in a row doesn't give her anything extra. She's correct with 0.5 chance.

3. Guessing heads

If the coin shows heads (50% chance), she'll get this one. 0.5 chance. 

__Answering correctly all days__
1. Random guessing

Everyday, she has a 0.5 chance of being wrong. Chance of being correct always = Chance she is never wrong = 1 - 0.25 = 0.75

2. Tails only

If and only if the coin shows tails (50% chance), she'll guess correctly all days with this strategy. So she guesses correctly 50% of the days. 

3. Heads only

She'll guess correctly in case the coin shows Heads, and only then. Chance = 0.5. 

The longer the experiment lasts, the greater the difference between the random guessing strategies for the two cases. However, the strategies will always sum up to 1. One could play the trickster here and make Beauty uncertain about whether she should answer correctly all days or just one. But I will not do this, because this is exactly the kind of contagious uncertainty that we are trying to stop delving into. Once we get started down this path, there is no stop to making Beauty uncertain about even more things. 

Enough on frequentism. Let's return to the bizarre crystal ball outcome from a few paragraphs earlier, that I argued arises from sloppy combination of two different, seemingl contradictory intuitions. One, that the coin toss is yet to happen, and two that Monday means chances of tails are half the original. In both these cases, Monday is meant in a slightly different sense. In the first, Monday is an event that's certainly going to happen. It will be the first day of Beauty's slumber. In the second, "Monday" is an event that's not certainly going to happen - it could be either Monday or Tuesday today. Elga's "Monday" is an uncertain event in his formalism, and refers to "Today is Monday". 

Let's see what happens according to Beauty if she thinks "today is Monday". Either the coin has been tossed already or not. If it has been tossed already, then Monday occuring gives her evidence against "Tails and Tuesday", bringing down the probability of tails to $\frac{1}{P(T)}$. But now, because the coin has been tossed already, she doesn't have any grounds for assumption 3. Alternatively, the coin hasn't been tossed already, which means today _had_ to be Monday, with probability 1. An event with probability 1 can't rule out other events, so it can't possibly rule out the chance of "Tails and Tuesday", which means Beauty has no reason to believe in assumption 2 in this case. Together, it means that Beauty shouldn't believe in assumptions 1, 2 and 3 together. A tossed coin has bearing on whether today is Monday or not, but that today is Monday and the coin will be tossed today doesn't have bearing on the outcome of the coin. 

Assumptions 2 and 3 do not hold together. Many people have proposed solutions which reject assumption 3. There is a reason for it - it's easiest to reject the problematic premise. However, the intuition behind the premise is not wrong, it is just incompatible with premise 2. Here, I propose a solution which rejects assumption 2 - a "timeless" solution, where Monday means "A Monday comes to pass" and Tuesday means "A Tuesday comes to pass", rather than "Today is Monday" and "Today is Tuesday". 

Take Tuesday = $t$ and Monday = { $t, \bar{t}$ }

$P(\bar{t}) = \frac{1}{2}$

$H=\bar{t}$

Using just these assumptions, one can derive Elga's assumption 3. Infact, one can derive the following, stronger and more intuitive result : 
$P(H) = P(H|Mon) = P(T|Mon) = P(T) = \frac{1}{2}$

We have discussed multiple problems with Elga's solution. First of these is whether Beauty's ignorance of whether the coin is tossed on Monday or Sunday can be disposed of so easily. Second is how Beauty can predict which coin toss outcome is more likely on Monday, before the coin toss even happens, which arises from a peculiar combination of two intuitions. These are "Odds of tails to heads fall on Monday" and "heads and tails have equal chance on Monday" which lead Beauty to believe that originally tails should have greater probability than heads. I show that this is equivalent to believing the coin is biased in a similar problem, further raising doubts upon what the combination of two intuitions is doing. I discuss the problem with the frequentist belief which often backs Elga's 1/3 solution. I show the problem with it - namely it should only talk about trials and not "days" inside of a single trial. Alas, the outcomes of trials are undefined in Elga's formulation. I propose two natural ways to define it, a "always correct" and "once correct" case - and discuss 3 strategies in each case. Both heads only and tails only strategy give similar results for the discussed cases.
Finally, I return to Elga's three assumptions and show how they fail to hold together - either assumption 2 holds and 3 doesn't, or vice versa. I close with a formalisation in which a strong version of assumption 3 holds, justifying the intuition behind it and closing the case for the fact that there is nothing wrong with assumption 3, but the sloppy combination of assumption 3 and 2 is the root of the problem in Elga's solution. 

## Citations

1. Elga, Adam. Self-locating belief and the Sleeping Beauty problem. Princeton University Website. [https://www.princeton.edu/~adame/papers/sleeping/sleeping.pdf](https://www.princeton.edu/~adame/papers/sleeping/sleeping.pdf).