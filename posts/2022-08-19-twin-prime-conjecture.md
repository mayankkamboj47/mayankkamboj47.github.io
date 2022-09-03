---
title : Twin Prime Conjecture
layout : post
---

Over the course of my years at university, I have now and then thought about the Twin Prime
Conjecture. It's an interesting, unproven claim in mathematics that there are infinite primes of the kind `a-1, a+1`. I have never intensely conducted the study of primes, or even that of mathematics
(my major is Computer Science),
but that hasn't stopped me from delving into these areas as I have pleased, resulting in the idea presented below. 

The approach to proving a weak version of the conjecture (if it can be called that) occured to me during my discrete maths class when I had been toying with the conjecture a day prior. It was a failed attempt, but it has become more refined overtime. 

# A sieve

The approach begins with Erathosthenes' sieve, which lets you find the series of primes upto some number N. The idea goes as follows : 

Take the natural numbers from 2 upto `N`. Below, `N=49`. 
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

In short, we start at 2, sieve all multiples of two, and proceed to the next unsieved number. 
We can stop when we've reached a number greater than the square root of N. 
You may or may not have noticed that the numbers
above are almost-prime as we continue this process of removing (sieving) the multiples. To leave out just the primes, we'll have
to repeat the process above till (including) square root of 49, which is 7  <sup>[1. Why square root?](#1whysquareroot)<sup>. 

We'll modify this sieve in 2 ways now. 

First, I will remove the upper limit `N` (49 was the upper limit in the above case). This means we will have numbers stretching from 2 to infinity, and no matter how much you sieve, there are always composites lurking around the corner. Yet, as you sieve, the numbers will get progressively more "prime-like". One could maybe say that the sequence "approaches that of primes". I will exploit this property of getting more "prime-like", and claim that whatever holds true no matter how much you sieve, must also hold true for the "limit of the sequence", which is the sequence of primes. 

Second, since we are interested in the patterns between numbers and
not the numbers themselves, I'll write a `*` in place of every number. This will help visually,
and also hide details which are not important to our work below (saving us brainpower). 

Let's first extend the sieve. 

# Unbounded sieving

In the previous case, we worked with natural numbers till 49. I'll now remove the "till 49" part. We start with the natural numbers as usual, leaving out 1. 
```
2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ... 
```
The sieving will proceed as usual mostly, but no matter how far you sieve now, the sequence never becomes completely prime. It might get "infinitely close to prime" - although I must admit that I do not know if limits can be formally
applied to this case. 

I will often use the phrase "sieve of k" to refer to "Sieve till numbers &lt;=k from among all
natural numbers". 

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

(Note : Only difference between sieve of 3 and 5 is the number 25 in the part shown above)
```

And so on. 

# Patterns, not numbers

As long as the prime numbers have a gap of 2, they're twin primes and their value is unimportant in the approach we're going to take. 

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

Beautiful. I'm also able to see the 'candidates' for twin primes in the sieve of 2 and 3. I'll call these __candidate twin primes__ - candidate twin primes for a sieve of k refer to all pairs of the kind `* *` in the sieve of k. Not all candidate twins are actually twins, because some of them will be sieved out by the future primes. __True twin primes__, are twin primes in the k**2 leftmost places. 

Instead of writing the infinitely recurring sieve of
2, I will just write the repeating bit pattern with a non-repeating prefix. For example, 
two's sieve would be `**< *>`. Where the `<>` enclose the repeating bit pattern. 
`**< *>` is the same as `** <* >` which is the same as `** *< *>`, because once you get rid of the notation, all of these expressions give the same pattern. You can expand as much as or as little as you please, although you can't shorten the notation beyond a certain size. 


Say we're working with 2's sieve  `**< *>`. To get the sieve of the next number (3), we will write the pattern as 11<01> where `*` is replaced with 1 and space with 0. We expand the notation just enough to make sure that the number we're sieving with sits at the edge of the prefix. Call the numerical value of the number you're sieving with `a` (just count the
number of `*`s before, and add 2 to get the numerical value for a `*`). Now, we will generate another bit pattern of the sort `<1111... (a-1 times)0>`, giving us two bit patterns. First, the pattern `11<01>` and the second, the pattern `<1111... (a-1 times)0>` of size a, where a is prime. We write these repeating portions of the bit patterns next to each other, and repeat each patterns as many times as necessary so that
they are both the same size (this part will become clear in the demonstration to follow). You'll see that we have to repeat the a-sized pattern `size-of-the-repeating-part-in-the-first-pattern` times, and the first pattern's repeating part `a` times [2 Why?](#2whyRepeatThisManyTimes).

```
Sieve of 2's pattern : 
*{* }

Expand the notation, so that the number we'll sieve with next is at the edge of the brackets. 
**{ *}
Call this pattern-1

Obtain the numerical representation of the number you're sieving (in this case you'll obtain 3). 

Generate another pattern, same size as the number with which you're sieving, where the last value is a 0, and the rest are 1. You'll get 110, since we're sieving with 3. 

In pattern-1, convert * to 1, and spaces to 0. Write this and your generated pattern on top of each other

01
110

Now, repeat them as much as needed to make them the same size. 

010101
110110

Take bitwise and to get : 

010100

This is your pattern, and the prefix is the same as the prefix of pattern-1.  
```

Converting from bitwise pattern notation to the star-space notation is not necessary, but I'll welcome anything that makes it more bearable to look at the series, and I'll therefore continue to use the `*` notation. 

# The proof

There is a twin prime pair in the repeating bit part in the resultant sieve above. If we can show that no matter how many times we repeat this process, there are going to be twin prime candidates in the repeating bit pattern, it will be the same as showing that there are infinite twin prime candidates. Let's do that. 

Here's the proof, by induction. 

Base : There is a twin prime in the repeating portion of the sieve of 2. 

Inductive hypothesis : There is at least one twin prime in the repeating portion of some sieve

Inductive step  : 

The next prime `a` will generate a pattern that will be repeated `the-size-of-the-previous-pattern` times, and since there is one zero per repeat, there are going to be `the-size-of-the-previous-pattern` zeroes in this pattern. 

These zeroes will align themselves only once with each digit in the previous pattern [3 Why?](#3whyZeroesWillAlignOnlyOnce). The previous pattern repeats `a` times before we take the bitwise `and`, so there will be `a` repeats of the same twin pair. Of these `a` different repeats of the same twin prime pair, the number is going to only be able to destroy two maximum - because it can destroy only one number from its `a` sibils, leaving the other sibils intact in the forthcoming pattern. Therefore, it can destroy one number in one of the occurences of the twin pair, and another in the next occurence of the twin pair, still leaving `a-2` occurences intact for the next pattern. 


# This doesn't prove the conjecture

This proves that no matter how much you sieve, there are going to be twin prime candidates in your resultant sieve for our version of the sieve. 

More concisely, we've proven there are infinite __twin prime candidates__ in any sieve.

However, being a twin prime candidate is not the same as being a __true twin prime__. A __candidate twin prime__ in `a`'s sieve is a __true twin prime__ only if it is a candidate within `a**2` distance from the beginning of the sieve pattern.

 If the numbers were conspiring, they could keep the twin prime candidates at bay and never allow them to reach within `a**2` distance from the right, making the number of true twin primes finite, even though there are always candidate twin primes just across the `a**2` horizon.  

However, these twin primes candidates are very randomly arranged if we're looking at the sieve of a large number. A single number will not be able to sieve the twin candidates away from the `a**2` range, because there are lots of tricky repeating patterns like 

```
* *   * *
``` 

in the sieve. Getting rid of such patterns depends on two numbers rather than just one.  A large number (> 9) will only be able to at best hit one of the `*`s in this pattern, and fly by - leaving the other twin pair intact. Some coming number will have to remove the next pair. 

Plus, you may find it interesting that even the pattern 
```
* *   * *
``` 
has infinite repeats in any sieve - and the proof is near identical to the one given for simply twin pairs. What does that mean for the conjecture ? It means not only do you have to keep the twin primes at bay, but also the pattern ```* *   * *``` which can be thought of as a generator pattern for twin primes. Then there are patterns which act as generator patterns for the pattern <pre>* *   * *</pre> once you're looking at a large-enough number - so numbers will have an even greater dependence on each other to keep those at bay. 

A more generalisable strategy would give an even stronger result. Because we can write proofs of the kind presented above for all sorts of patterns ("* *", "* *   * *" etc.), a generalised strategy to prove that these patterns will inevitably also reach the n**2 space will settle
conjectures like [Polignac's](https://en.wikipedia.org/wiki/Twin_prime#Polignac's_conjecture)

Some reflections on how this could be done :
1. We may have to abandon the '*' notation and work with the values of numbers. That will open up more possibilities. 
1. Yitang Zhang's discovery about there being some gap k &lt; 70M, for which there are infinite pairs, which has now been brought down to 200 something, and could be brought down further even to 6 ! This might be a useful result to us. 
1. Above method might be detached (and much clumsier !) than standard methods employed by number theorists. Using formal number theory and sieve theory, which might give us more tools to reason better about what happens to candidate twin primes, as well as simplify the reasoning I have stated above in this article (hopefully down to a single page). 


# Footnotes

<h3 id="1whysquareroot">1. Why Square root ? </h3>
If a number greater than the square root has to be multiplied with a number less than the square root to get n. So if k divides n, k is either less than the square root of n, or the number k is multiplied with to obtain n is less than the square root of n. Checking till square root of n then covers all possiblities of how n could be broken down into a,b such that a*b = n.

<h3 id="2whyRepeatThisManyTimes">2. Why repeat this many times </h3>
To make both patterns the same size, we repeat the patterns such that both have the size equal to the LCM of their individual sizes. Since the two sizes are co-prime (aka HCF = 1), LCM is the product. 

<h3 id="3whyZeroesWillAlignOnlyOnce">3. Why zeroes will align only once </h3>
Proof by contradiction. Assume zero aligns twice at some number k. 

Call size of pattern-1 s. 
For some integers x,y, which are both positive and less than p (you repeat pattern-1 p times), our assumption implies
```
p | sx + k 
p | sy + k                ===>
p | s(x-y)

p doesn't divide s. p can't divide x-y unless x=y. Our assumption is incorrect.  

End of proof
```