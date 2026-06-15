---
layout : post
title : A substitution model of computation 
---

A Substitution Model of Computation

String substitution is sufficient to create a model of computation as powerful as Turing machines. The model uses fewer basic operations, and programs written in it are often more compact and easier to follow.

The Model

We start with a set S that contains infinitely many symbols. These symbols will be used to create the input and output strings, as well as the intermediate strings that result from the transformations we apply to the input. The reason for having an infinite set of symbols will become clear in the section on Turing completeness. Within this infinite symbol set, we also have the symbols 1 and 0.

The input is a string of 1s separated by 0s. Each sequence of 1s represents a number equal to the count of 1s in that sequence. For instance, if we have the input 5, 4, it would be represented as "1111101111". The output is a continuous string of 1s, which represents the number equal to the count of 1s in the string. For example, a program that doubles the given number would produce "1111" for the input "11". Similarly, a program that multiplies two numbers together would generate "111111" for the input "110111" (which represents 2,3).

To manipulate the input string, we have an operation called "chg" (read as: change), which allows us to substitute a specific substring with another substring. For instance, applying the one-line program

chg 1 ◆

to the input "111" would result in the output "◆◆◆".

Here is a brief program that doubles any given input:

chg 1 ◆
chg ◆ 11

One could also write this as shorthand:

chg 1 11

where we assume that all instances of "1" are replaced with "11" at the same time.

Finally, the special symbols "$" and "^" allow us to refer to the start and the end of a string. For example, "chg 1$ 0" only replaces the "1" at the end of the string with a "0". If the string doesn't end in "1", it matches nothing. Similarly, the line "chg ^hi hello" only matches the starting "hi" in a string. If the input string was "hi hiroshi", it would match just the starting "hi", and not the "hi" in "hiroshi". If the string doesn't start with "hi", it matches nothing.

Turing Completeness

Can this model of computation perform every possible calculation? That is hard to answer because every possible calculation is hard to define formally. It is easier to show that our model can solve everything that other models can. Since models come in different levels of capability, known as the power of the model, we will simulate the most powerful model known: Turing machines. These machines can do everything a modern computer can, and some things more, owing to their infinite memory. Simulating Turing machines in our model is straightforward.

A Turing machine consists of a tape with blocks, each containing a 1 or a 0, similar to the input of our computation model. It produces output in a similar way to our model, too. However, only the start and end result are similar — the process of calculation is quite different in Turing machines. Turing machines have infinite memory to begin with, whereas our model never does at any finite point in time. In our model, we obtain additional memory by writing a command. For example, the command

chg $ 000

makes three zeroes appear at the end.

Turing machines contain a head, which is always at a particular point on the tape and has the ability to do four operations: move right, move left, put a 1, put a 0. All instructions look like this:

«In state X, if at "<1 or 0>", perform one of the 4 operations, and go to state Y.»

We will simulate these instructions in the substitution model. For this, first we need a representation of the head. We use a set of symbols to represent the head in different states. For each state, we will have two symbols — one for head at 1 and another for head at 0.

At the start of the computation, we can introduce the head with the following short program:

chg 1$ ◆
chg 0$ ◼

"◆" represents the head in state 0 and at bit 1, "◼" in state 0 at bit 0. To add more states, we simply add more symbols, two per state — one for 1 and another for 0.

Turing machines generally perform the following operation at every step:

«In state X, if at "<1 or 0>", "<operation>", and go to state Y.»

Without loss of generality, say that "◆" and "◼" represent the head in state X, at 1 and 0 respectively. And say that "●" represents the head in state Y at a 1, and "◩" represents the head in state Y at a 0. Here is how to perform all the possible operations for a Turing machine:

If at a 1:
    Going left:
        chg 1◆ ●1
        chg 0◆ ◩1
    Going right:
        chg ◆1 1●
        chg ◆0 1◩
    Writing a 0:
        chg ◆ ◩
    Writing a 1:
        chg ◆ ●

The case for 0 is identical, but "◼" will replace "◆", and "0" will replace "1" in the string to be substituted with.

With this, we finish the translation of the quadruples. However, there is still one piece left. In a Turing machine, for every state, we cycle through the quadruples to see if a quadruple matches the state we're currently in. If it does, we execute the quadruple code. Otherwise, we stop. We've only translated the quadruples so far. We still need a way to cycle through them, and stop once nothing matches.

We could make this cycling implicit, as in the case of Turing machines. If we want to make it explicit, we introduce a repeat-till-no-change operator:

repeat till no change:
    <translated quadruples here>

We only need this repeat-till-no-change operator once in the entire program, to cycle through the translated quadruples. This finishes the proof of equivalence to Turing machines.

Here is a translation of a simple piece of code that adds a 1 at the start of the input:

chg 1$ ◆
repeat till no change :
    chg 1◆ ◆1
    chg ^◆ ◼1                                  a01La0
    chg ◼  ●                                   a001a1
chg ● 1

"chg 1$ ◆" introduces the head. "chg 1◆ ◆1" and "chg ^◆ ◼1" together are the translation of the quadruple "a01La0". Finally, "chg ● 1" ensures that only 1 and 0 remain in the final output.

With this example, we close the section on Turing completeness. Direct translation is often not optimal. For example, for the above problem of prepending 1, the optimal solution is the one-liner

chg ^ 1

where we exploit the fact that "^" alone matches the start of the string, but no characters, making "chg ^ x" equivalent to saying "prepend x".

Writing Programs

The following examples illustrate how common computations can be expressed in the substitution model.

Addition of a constant, say 5, is simply

chg $ 11111

compared to the much larger collection of quadruples required in a Turing machine, where the number of quadruples grows with the size of the constant being added.

Multiplication by constants is equally direct:

chg 1 111

which multiplies by 3. By mapping each "1" to "111", we triple the total count of 1s.

If simultaneous substitution is undesirable, the same computation can be written as

chg 1 ●
chg ● 111

We first map each "1" to a "●", and then each "●" to "111".

What about exponentiation? Here's how to calculate 2^x. The intuition is to keep doubling a number which starts from 1, and decrementing the input, until only the former number remains.

chg ^ ●                            # Introduce ●, which will multiply in number to 2^x
repeat till no change :
    chg ●1 ●                       # decrement the number
    repeat till no change :        # if none of the number is left, replace ● with 'S'
        chg ●$ S
        chg ●S SS
    chg ● ●●                       # double the ●
chg S 1                            # ensure only 1 and 0 in the final output

This example uses a nested repeat, but it closely follows the underlying idea.

These examples illustrate that computations requiring many Turing-machine quadruples can often be expressed concisely in the substitution model.

For a slightly more ambitious example, refer to [https://mayankkamboj47.github.io/posts/2024-01-03-neuralnets-turing-complete/], where we demonstrate the turing completeness of (recurrent) neural networks by reducing them to the substitution model.

Conclusion

The substitution model of computation, together with the repeat-till-no-change operator, allows programs to be expressed using only two primitives.

In contrast to the usual approach of introducing additional primitives to obtain more concise programs, this model relies on repeated application of substitution rules. By showing that the model can simulate Turing machines, we establish that substitution, together with repeated rule application, is sufficient for universal computation.
