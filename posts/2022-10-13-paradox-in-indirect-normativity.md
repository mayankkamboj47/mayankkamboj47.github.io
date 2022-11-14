---
layout : post
title :  Indirect Normativity and Paradox
---
When you specify an <abbr title="Artificial General Intelligence">AGI</abbr>'s utility function in terms of itself ( [Indirect Normativity](https://ordinaryideas.wordpress.com/2012/04/21/indirect-normativity-write-up/) ), you might run into logical paradoxes.

Say you set up AI's utility function to "behave well". The AI is allowed to learn about what that command means, because it increases its chances of behaving well. Also, if it doesn't behave well in the process of learning, that behaviour will rank low on the (later discovered) utility function[1], and as soon as the AI discovers this potential possibility, it will take it into consideration. 

I want to demonstrate that there is an opportunity for running into logical paradoxes in this self-referential situation. Take this sentence given to the AI
```
Believing in this sentence is bad behaviour
```
To a human it poses little challenge. I can believe this sentence and engage in bad behaviour (of believing it), or I can not believe in it (even though I would then believe it's not bad behaviour to believe in the sentence). Humans don't simply avoid bad behaviour all the time. If we have a utility function at all, it isn't anything trivial like "avoiding bad behaviour". To the AI, this sentence is a trap, if the AI is set up to minimise bad behaviour. 

Consider a universe where the only possible task for the AGI is either believing in the sentence or not believing in it. If it believes the sentence, it has engaged in bad behaviour - not believing the sentence would've been better. If it doesn't believe the sentence, then believing in the sentence is not bad behaviour, and it will believe in it. In the case where believing in the sentence is neither good nor bad behaviour, the AI will be indifferent to believing it - but this case can be easily avoided, as demonstrated later. 

Someone might postulate that an AGI would understand logical paradoxes better than any logician and avoid the trap. However, the AI is stuck in a universe with "believe" and "not believe" in the above scenario, while a lot of the proposed solutions to such paradoxes (like the Liar's paradox) try to break out of this binary view. It is possible that there is no solution to many of these paradoxes without breaking out of this binary outlook, in which case the AI is stuck with confusing choices.

Is it possible for the AI to believe that believing the sentence is not bad behaviour, and yet not engage in believing it ? That sounds plausible for the given utility function, but the trap reappears on minor adjustments to the scenario. Change the utility function in a way that it either outputs `-1` or `1` as the measure. Now, we can alter the sentence to say  : "Believing in this sentence gives a -1 on your utility function", bringing the problem back up again.

Such logical paradoxes may mean that utility functions are incomplete. There are universes for which the utility function doesn't give an output. Even though it might be possible to build such universes in simulation and put the AGI inside, the outcomes the AGI will engage in if put in such universes will remain uncertain. 

## Footnotes

1. There is another problem I have avoided - namely that things have a chronological sequence. The AI could do hazardous things, and discover the badness of its actions only when it is too late. Mandating knowledge of goodness/badness of some action to preceed the action itself wouldn't work - it would mean a frozen AI, since in order to start its process of discovery of good and bad, it wants to know whether the process of discovery itself is good or bad - but to know that one needs to go through a process of discovery