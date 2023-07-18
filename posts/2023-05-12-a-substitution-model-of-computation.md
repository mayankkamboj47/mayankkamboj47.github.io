---
layout : post
title  : A Substitution Model of Computation
---
String substitution is sufficient to create a model of computation as powerful as Turing machines. The model uses a lesser number of basic operations, and programs written in it are much easier for humans to understand. 

## The Model
We start with a set S that contains infinite symbols. These symbols will be used to create the input and output strings, as well as the intermediate strings that result from the transformations we apply to the input. The reason for having an infinite set of symbols will become clear in the section on Turing completeness. Within this infinite symbol set, we also have the symbols "1" and "0". 

The input is a string of 1s separated by 0s. Each sequence of 1s represents a number equal to the count of 1s in that sequence. For instance, if we have the input `5, 4`, it would be represented as "1111101111". The output is a continuous string of 1s, which represents the number equal to the count of 1s in the string. 
For example, a program that doubles the given number would produce "1111" for the input "11". Similarly, a program that multiplies two numbers together would generate "111111" for the input "110111" (which represents `2,3`).

To manipulate the INPUT string, we have an operation called "chg" (read as : change) which allows us to substitute a specific substring with another substring. For instance applying the one line program "chg 1 🔵" to the input "111" would result in the output "🔵🔵🔵" . 

Here is a brief program that doubles any given input:
```
chg 1 🔵
chg 🔵 11
```

One could also write as shorthand
```
chg 1 11
```
where we assume that all instances of 1 are replaced with 11 at the same time. 
 
Finally, the special symbols $\$$ and $\^$ allow us to refer to the start and the end of a string. For example, `chg 1$ 0` only replaces the 1 at the end of the string with a 0. If the string doesn't end in 1, it matches nothing. Similarly, the line `chg ^hi hello` only matches the starting `hi` in a string. If the input string was `hi hiroshi`, it would match just the starting `hi`, and not the `hi` in `hiroshi`. If the string doesn't start with `hi` it matches nothing. 

## Turing completeness
Can we perform every calculation possible with this model of computation ? This is a difficult question to answer because it's difficult to formalise the idea of every calculation possible. A slightly easier question is whether it can perform every operation that a modern computer with infinite memory and compute could perform. The answer is a YES. We prove this by showing that we can simulate Turing machines, the most powerful model of computation known, using our model. 

A Turing machine consists of a tape with blocks, each containing a 1 or a 0, similar to the input of our computation model. It produces output in a similar way to our model. There are significant differences in the processes used by Turing machines and our model to arrive at the final answer. Another minor difference is that Turing machines start with an infinite tape, while our model starts with finite space. However, we can add additional storage by writing a command. For example, the command "chg $ 000" appends three 0s at the end.

Turing machines also contain a head, which is always at a particular point on the tape, has the ability to do four operations : move right, move left, put a 1, put a 0. All instructions look like this : 
In state X, if at <1 or 0>, perform one of the 4 operations, and goto state Y. 

We'll simulate these instructions in the substitution model. For this, first we'll need a representation of the head. We'll use a set of symbols to represent the head in different states. For each state, we'll have two symbols - one for "head at 1" and another for "head at 0". 

At the start of your computation, you can introduce the head with the following short program :
```
chg 1$ 🔵
chg 0$ 🟢
```
🔵 represents the head in state 0 and at bit 1, 🟢 in state 0 at bit 0. To add more states, we just add more symbols, two per state - one for 1 and another for 0.

As I mentioned above, Turing machines generally perform the following operation at every step : 
`In state X, if at <1 or 0> <operation>, and goto state Y`. Without loss of generality, say that 🔵 and 🟢 represent the head in state X, at 1 and 0 respectively. And say that 🔴 represents the head in state Y at a 1, and 🔶 represents the head in state Y at a 0. 
Here is how you can perform all the possible operations for a Turing machine: 
```
    If at a 1 : 
        Going left : 
            chg 1🔵 🔴1
            chg 0🔵 🔶1
        Going right :
            chg 🔵1 1🔴
            chg 🔵0 1🔶
        Writing a 0 : 
            chg 🔵 🔶
        Writing a 1 :
            chg 🔵 🔴
    The case for 0 is identical, but 🟢 will replace the 🔵, and 0 will replace 1 in the
    string to be substituted with
```

That was surprisingly easy ! But there is still one piece left. In a Turing machine, for every state, we cycle through the quadruples to see if a quadruple matches the state we're currently in. If it does, we execute the quadruple code. Otherwise, we stop. We've only translated the quadruples so far. We still need a way to cycle through them, and stop once nothing matches. We could either make this cycling implicit like in the case of Turing machines. If we want to make it explicit, which has its advantages, we will need to introduce a `repeat till no change` operator : 
```
repeat till no change : 
    <translated quadruples here>
```
We only need this `repeat till no change` operator once in the entire program, to cycle through the translated quadruples. This finishes the proof of equivalence to Turing machines. Here is a translation of a simple piece of code that adds a 1 at the start of the input:
```
chg 1$ 🔵                                        introduces the head at the right end
repeat till no change :                          translated quadruples begin here :
    chg 1🔵 🔵1
    chg ^🔵 🟢1                                  a01La0
    chg 🟢  🔴                                   a001a1
chg 🔴 1                                        some closing code to ensure only 1 and 0 remain
```
With this example, we close the section on Turing completeness. Direct translation is often not optimal. For example, for the above problem of prepending 1, optimal way is the one-liner `chg ^ 1`, where we exploit the fact that `^` alone would match the start of the string, but no characters, which means `chg ^ x` is akin to saying `prepend x`.

## The joy of substitution

The way operations are done in the substitution model is intuitive, and usually pretty short. For example, addition of a constant, say 5, is simply `chg $ 11111`, compared to the quadruple hell we get in the Turing machines where the number of quadruples grows with the size of the constant we are adding ! Moreover, it's closer to how humans naturally think about adding in stick math - Given a bunch of sticks and another bunch of sticks, just put them close together and done !
Multiplication with constants is equally intuitive : 
`chg 1 111`, which multiplies with 3. By mapping each `1` to `111` we triple the total count of 1s. If you think that substituting "all at once" is cheating, you'll still not complain to this equivalent program : 
```
chg 1 🔴
chg 🔴 111
```
Not a one-liner, but still quite elegant. We map each 1 to a 🔴 which then maps to 111. Again, it is a very appealing way of visualising multiplication. 

What about exponentiation ? Here's how to calculate 2^x. The intuition is to keep doubling a number which starts from 1, and decrementing the input, until only the former number remains. 
```
chg ^ 🔴                            # Introduce 🔴, which will multiply in number to 2^x
repeat till no change : 
    chg 🔴1 🔴                  # decrement the number
    repeat till no change :         # if none of the number is left, replace 🔴 with 'S'
        chg 🔴$ S
        chg 🔴S SS
    chg 🔴 🔴🔴                 # double 🔴 !
chg S 1                         # final fix
```
Okay, I cheated with a double repeat, but the program is really very intuitive still. I could not have cheated, and made my program a little bit wobbly and confusing.

I hope that the above examples have convinced you that what Turing machine does in a lot of quadruples is often concise in the string substitution model. 

To conclude, the model of computation with substitution and "repeat till no change" allows us to
express programs in a more concise way. In contrast to the standard approach to creating programming languages, which give about conciseness by adding a lot of primitives, our model of computation works with just 2 primitives. By showing the Turing-completeness of this model of computation, we can perhaps also dare say that something so fundamental as substitution is also very powerful - so much so that it maybe all you need if you're open to cycling through your instructions repeatedly. 