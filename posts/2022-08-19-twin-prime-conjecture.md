---
title : Twin Prime Conjecture
layout : post
---

Over the course of my years at university, I have now and then thought about the Twin Prime
Conjecture. It's an interesting, unproven claim in mathematics that there are infinite primes of the kind `a-1, a+1`. I have never intensely conducted the study of primes, or even that of mathematics
(my major is Computer Science),
but that hasn't stopped me from delving into these areas as I have pleased, resulting in the idea presented below. 

The approach to proving a weak version of the conjecture that I will demonstrate first came to me in a flash when studying Discrete Mathematics towards the end of my first year of college. I had been toying with the conjecture a day prior to that. It was a failed attempt, and the approach has come back to me again and again over the years - getting refined or just expressing itself differently. 

# A sieve

The approach begins with Erathosthenes' sieve, a 2000 year old idea of how to find the series of primes upto some N. The idea goes as follows : 

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

We remove all _other_ multiples of the number we are at (here 2). 
```
2 3   5   7   9    11    13    15    17    19    ... 41    43    45    47    49
^
you are here
```
Now, move to the next number, and remove all its multiples, except the number itself.  
```
2 3   5   7        11    13          17    19    ... 41    43          47    49
  ^
  you are here
```
You may or may not have noticed that the numbers
above are almost-prime as we continue this process of removing (sieving) the multiples. To leave out just the primes, we'll have
to repeat the process above till (including) square root of 49, which is 7  <sup>[Why square root?]()<sup>. 

We'll modify this sieve in 2 ways now. First, I will take the situation where there is no upper limit when sieving (49 was the upper limit in the above case). Second, since we are interested in the patterns between numbers and
not the numbers themselves, I'll write a `*` in place of every number, and that will save us brainpower to be able to keep going and looking at the patterns. 

Let's first extend the sieve. 

# Extending the sieve

In the previous case, we worked with natural numbers till 49. I'll now remove the "till 49" part. We start with the natural numbers as usual, leaving out 1. 
```
2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ... 
```
There is no end to these numbers - they stretch to infinity. The sieving will proceed as usual mostly, but no matter how far you sieve now, the sequence never becomes completely prime. It might get "infinitely close to prime" - although I must admit that I do not know if limits can be formally
applied to this case. I find it helpful to think of primes as the limit of calculating a sieve of `N` as `N->infinity` and but that is not necessary to understand the things coming up next. 

Here are some sieves with no upper bounds : 

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

Since we're trying to prove "Such twin primes extend infintely", I will try to get rid of anything that distracts from the distribution of the twins to the value of the twins - as long as the numbers have a gap of 2, they're twin primes and that's all we need. 

Instead of the number then, I'll write a `*`, and the sieved out numbers will be replaced with a blank space ` `. Here are the sieves using this new notation. 

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
twin primes. One is __candidate twin primes__ - this includes all pairs of the kind `* *` such as
the ones you see in the sieve of 3. The other is __true twin primes__, which, for a sieve of x,
are twin primes in the x**2 leftmost places. 

Instead of writing the infinitely recurring sieve of
2, I will just write the repeating bit pattern with a non-repeating prefix. For example, 
two's sieve would be `**< *>`. Where the `<>` enclose the repeating bit pattern. 
`**< *>` is the same as `** <* >` which is the same as `** *< *>`, because once you get rid of the notation and write them fully extended they give the same pattern. You can expand as much as or as little as you please. 


To sieve ahead,  `**< *>` will be first be written as 11<01> where `*` is replaced with 1 and space with 0. We make sure that the `*` that corresponds to the number we're going to sieve with, is the last `*` in the prefix - here, this is the last of the two `*`s. We will then get the numerical value for the `*` we want to sieve for (just count the
number of `*`s before, and add 2 to get the numerical value for a `*`) - call this value `a`. Now, we will generate another bit pattern of the sort `<1111... (a-1 times)0>`, giving us two bit patterns. First is the pattern `11<01>` and the second is the pattern `<1111... (a-1 times)0>` of size a, where a is prime. We write these repeating portions of the bit patterns next to each other, and repeat each patterns as many times as necessary so that
they are both the same size (this part will become clear in the demonstration to follow). You'll see that we have to repeat the a-sized pattern `size-of-the-first-pattern` times, and the first pattern `a` times [Why?](). 
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
prefix : 11             # make sure the last 1 represents the number you're sieving for, here 3
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
prefix (same as before always): 11, with repeating 010100

= 11{010100}
= **{ * *  }
```

Converting from bitwise pattern notation to the star-space notation is not necessary, but I'll welcome anything that makes it more bearable to look at the series, and I'll therefore continue to use the `*` notation. 

# What now ? 

There is a twin prime pair in the repeating bit part in the resultant sieve above. If we can show that no matter how many times we repeat this process, there are going to be twin prime candidates in the repeating bit pattern, it will be the same as showing that there are infinite twin prime candidates. Let's do that. 

Here's the proof, by induction. 

Base : There is a twin prime in the repeating portion of the sieve of 2. 

Inductive hypothesis : There is at least one twin prime in the repeating portion of some sieve

Inductive step  : 

The next prime `a` will generate a pattern that will be repeated `the-size-of-the-previous-pattern` times, and since there is one zero per repeat, there are going to be `the-size-of-the-previous-pattern` zeroes in this pattern. 

These zeroes will align themselves only once with each digit in the previous pattern [Why?](). The previous pattern repeats `a` times before we take the bitwise `and`, which means it is going to have `a` times the twin prime candidates as the previous pattern. Each number in the pattern will have `a` different sibils. Of the `a` different repeats of the same twin prime pair, the number is going to only be able to destroy two maximum - because it can destroy only one number from its `a` sibils, leaving the other sibils intact in the forthcoming pattern. Therefore, it can destroy one number in one of the occurences of the twin pair, and another in the next occurence of the twin pair, still leaving `a-2` occurences intact for the next pattern. 


# This doesn't prove the conjecture

This proves that no matter how much you sieve, there are going to be twin prime candidates in your resultant sieve. 

More concisely, we've proven there are infinite __twin prime candidates__ in any sieve.

However, being a twin prime candidate is not the same as being a __true twin prime__. A __candidate twin prime__ in `a`'s sieve is a __true twin prime__ only if it is a candidate within `a**2` distance from the beginning of the sieve pattern - and we've been unsuccessful at proving that. If the numbers were conspiring, they could keep the twin prime candidates at bay and never allow them to reach within `a**2` distance from the right, making the number of true twin primes finite. 

However, these twin primes candidates are very randomly arranged if we're looking at the sieve of a large number. A single number will not be able to sieve the twin candidates away from the `a**2` range, because there are lots of tricky repeating patterns like 

```
* *   * *
``` 

in the sieve. Getting rid of such patterns depends on two numbers rather than just one.  A large number (> 9) will only be able to at best hit one of the `*`s in this pattern, and fly by - leaving the other twin pair intact. The coming numbers will have to take care of the next pair. Thus the primes not only need to "play smart" themselves to keep destroying these twins, but they may also need some kind of reliance on other primes to finish their unfinished job. 

Plus, you may find it interesting that even the pattern 
```
* *   * *
``` 
has infinite repeats in any sieve - and the proof is near identical to the one given for simply twin pairs. What does that mean for the conjecture ? It means not only do you have to keep the twin primes at bay, but also the pattern ```* *   * *``` which can be thought of as one generator pattern for twin primes. Then there are patterns which act as generator patterns for the pattern <pre>* *   * *</pre> once you're looking at a large-enough number - so numbers will have an even greater dependence on each other to keep those at bay. 

One can imagine this as a game between primes trying to destroy twin primes, and the twin primes trying to get into the zone all the time. There are multiple layers of the rules, and we can observe the game between the primes and twins at those layers of rules. If any of the rules reveal that some of the twin prime candidates will inevitably keep reaching the `n**2` zone, we are done. If it is possible for the primes to destroy the twins at some particular layer of rules, we can go to a new layer of rules until we find one where the twins win out. 

If the primes do not conspire and sieve randomly, they will fail and new twin prime candidates will continue to invade their `a**2` space. 