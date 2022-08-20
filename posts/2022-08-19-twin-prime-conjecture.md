---
title : Twin Prime Conjecture
layout : post
---

Over the course of my years at university, I have now and then thought about the Twin Prime
Conjecture. I have never intensely conducted the study of primes, or even that of mathematics
(my major is Computer Science),
but I have always felt intimate to the subject and therefore to some of its results.

The approach to solving the conjecture that I list below first came to me in a flash when studying Discrete Mathematics towards the end of my first year of college when I had just been toying with the conjecture a day prior. I turned the lecture
volume to a zero in those days of lockdown online classes, and got to work. It was a failed attempt, and the approach has come back to me again and again over the years sometimes - either getting refined or just expressing the same old results in a new different way. I have never seriously worked on the conjecture though - at best I've worked continuously a week or so. But I haven't completely abandoned it either - so I might continue to think of this for years to come.

# A sieve

The approach begins with Erathosthenes' sieve, which is more than 2000 years old. The idea popularly goes as follows : 

Take the natural numbers from 2 upto a particular limit `N`. Here, I'll take `N=49`. 
```
2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ... 41 42 43 44 45 46 47 48 49
```

Start at the first number

```
2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ... 41 42 43 44 45 46 47 48 49
^
start here
```

The first number is 2. We remove all _other_ multiples of 2. 
```
2 3   5   7   9    11    13    15    17    19    ... 41    43    45    47    49
^
you are here
```
Now, move to the next number, and except the number remove all other multiples. 
```
2 3   5   7        11    13          17    19    ... 41    43          47    49
  ^
  you are here
```
We've removed all multiples of 3 above. You may or may not have noticed that the numbers
above are almost-prime as we continue this process. To leave out just the primes, we'll have
to repeat the process above till (including) square of 49, which is 7  [Why square root?](). 

Now, I'll do two different things. First, we are interested in the patterns between numbers,
not the numbers themselves so I'll write a `*` in place of a number, and that will save us brain
power, to be able to keep going. I will also kind of extend the notion of sieving to the situation where there is no upper limit (49 was the upper limit in the above case). 

Let's first extend the sieve. 

# Extending the sieve

In the previous case, we worked with natural numbers till 49. I'll now remove the "till 49" part. We start with the natural numbers as usual, leaving out 1. 
```
2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ... 
```
But there is no end to these numbers - they stretch to infinity. The sieving will proceed as usual. But no matter how far you sieve now, the sequence never becomes prime. It might get "infinitely close to prime" - although I must admit that I do not know if limits can be formally
applied to this case. I find it helpful to think of the limit of this kind of sieving as the
sequence of primes and so I will do that for the rest of this article. 

To get a feel for how sieving will work without an upper bound, here are a few examples : 

The sieve of 2 : 
```
2 3   5   7   9    11    13    15    17    19    21    23    25    ...
```

The sieve of 3 : 
```
2 3   5   7        11    13          17    19          23    25    ...
```

The sieve of 5 : 
```
2 3   5   7        11    13          17    19          23          ...
```

And so on. 

# Patterns, not numbers

It doesn't matter much to me whether the twin primes are an 11 and 13, or 29 and 31. Only their being twins matters, how far apart they are might matter, and how and whether they repeat definitely matters since we're trying to prove "Such primes extend infintely". 

Instead of the number then, I'll write a `*`, and in the gaps I'll put a ` `. Here are the sieves using this new notation. 

The natural numbers 
```
*****************************************************************************************
```

The sieve of 2 : 
```
** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
```

The sieve of 3 : 
```
** * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   * *   
```

The sieve of 5 : 
```
** * *   * *   * *   *     * *     *   * *   * *   *     * *     *   * *   * *   *     * *   
```

The sieve of 7 : 
```
** * *   * *   * *   *     * *     *   * *   *     *     * *     *   * *   * *   *     * *   
```

Beautiful. I'm also able to see the candidates for twin primes in the sieve of 2 and 3. Then
the incoming primes eliminate some of these twin primes going forward. We have two kinds of
twin primes. One is candidate twin primes - this includes all pairs of the kind `* *` such as
the ones you see in the sieve of 3. Another is "True twin primes", which, for a sieve of x,
are twin primes before x**2. 

Another short way of notation now : Instead of writing the infinitely recurring sieve of
2, I will just write the repeating bit pattern with a non-repeating prefix. For example, 
two's sieve would be `**< *>`. Where the `<>` enclose the repeating bit pattern. 
`**< *>` is the same as `** <* >` which is the same as `** *< *>`. You can expand as much as you please. 
In this notation, sieving will proceed as follows : 
`**< *>` will be written as 11<01>. We will get the numerical value for the `*` we want to sieve for (just count the
number of `*`s before, and add 2) - call this value `a`. We will shift the bit pattern so that this is the last `*` in the prefix, and the rest is the repeating pattern. Now, we will generate another bit pattern of the sort `<1111... (a-1 times)0>`. We've got two bit patterns, one the `11<01>` and the other,
the `<1111... (a-1 times)0>` of size a, where a is prime. We write these repeating portions of the bit patterns next to each other, and repeat each patterns as many times as necessary so that
they are both the same size. You'll see that we have to repeat the a-sized pattern the size-of-the-previous-pattern times, and the other pattern a times [Why?](). 
```
{pattern for the sieve so far, repeated a times}
{a pattern of size a, where the first a-1 digits are 1 and the last is a 0}

= 


01010101010101010101...010101010101010
1111...(a-1 times)01111...(a-1 times)0
```

And now, we take a bitwise `and` to get the resultant pattern after sieving (the prefix will remain as it is). 
Incase of 2 and 3, I have demonstrated this below : 
```
prefix : 11             # 2 and 3, make sure the last 1 represents the number you're sieving wth
{01} repeated 3 times
{110} repeated two times

=

prefix : 11
010101
110110            &
_______
010100
_______

=
prefix : 11, with repeating 010100
or 11{010100}
=  **{ * *  }
```

Converting from `10` bitwise to the star-space notation is not necessary, but it makes it more pleasing to the eye to look at the pattern. 

# What now ? 

There is a twin prime pair in the repeating bit part in the resultant sieve above. If we can show that no matter how many times we repeat this process, there are going to be twin prime candidates in the repeating bit pattern, we've shown that there are infinite twin prime candidates. 

Here's the proof, by induction. 
If there are twin primes in the repeating portion of some sieve, then the next sieve is going to proceed as follows : 
The number `a` will get the same number of zeroes as the size of the pattern, but these zeroes will align themselves only once with each position [Why?](). The above pattern repeats `a` times, which means it is going to have `a` times the twin prime candidates as the previous pattern. Of the `a` different sibils of the same twin prime pair, the number is going to only be able to destroy two maximum - leaving the other sibils intact in the forthcoming pattern. 


# This doesn't prove the conjecture

This proves that no matter how much you sieve, there are going to be twin prime candidates in your resultant sieve. 

More concisely, we've proven there are infinite twin prime candidates in any sieve.

However, being a twin prime candidate is not the same as being a true twin prime - you are a twin prime in `a`'s sieve only if you are a candidate within `a**2` distance from the beginning of the sieve pattern - and we've been unsuccessful at proving that. If the numbers were conspiring, they could keep the twin prime candidates at bay and never allow them to reach within `a**2` distance from the right, making the number of true twin primes finite. However, these twin primes candidates are nastily arranged if we're looking at the sieve of a large number. A single number will not be able to sieve the twin candidates away from the `a**2` range, because there are lots of repeating patterns like `* *   * *` in the sieve. Getting rid of such patterns depends on two numbers rather than just one. 
Numbers will have to collaborate to get rid of all such patterns before they get into the `a**2` range of true candidates. A large number (> 9) will only be able to at best hit one of the `*`s in this pattern, and fly by - leaving the other twin pair intact. Now, the coming numbers will have to take care of the next pair. Plus, you may find it interesting that even the pattern 
```* *   * *``` has infinite repeats in any sieve - and the proof is near identical to the one given for simply twin pairs. What does that mean for the conjecture ? It means not only do you have to keep the twin primes at bay, but also the pattern ```* *   * *``` which can be thought of as one generator pattern for twin primes. Then there are patterns which act as generator patterns for the pattern `* *   * *` once you're looking at a large-enough number - so numbers will have to do even greater collaboration to keep those at bay.

If these numbers truly behave randomly, they will fail and new twin prime candidates will continue to invade their `a**2` space. 