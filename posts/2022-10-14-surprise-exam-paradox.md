---
layout : post
title  : A Solution to the Paradox of the Surprise Exam
---
Disjunction of two non-surprising things can surprise. If someone knows I will have an apple, and I have it, he won't be surprised. If the same person knows I will have an orange, he will not be surprised when I have it. However, when the same person knows I will have an apple or I will have an orange, he will not know exactly which one until I pick one and take a bite - and therein lies the element of surprise. 

A popular paradox, called the paradox of the surprise exam, misses this point. The solution proposed in this post fills in the gap. 

The paradox goes as follows. If you have to put a surprise exam in a book, you can't put it on the last page, because when readers turn to the second last page, they'll know that the surprise exam can only be on the last page since it isn't on any of the other pages. Second, you can't put it on the second last page either, because when readers reach the third last page, they will know that the exam is on the second last page, because it can't be on the last page (due to the reasoning given in the previous sentence). So they won't be surprised in this case either, and the exam can't be on the second last page. Now, you repeat and say that it can't be on the third last page, with similar reasoning. This sort of backward induction leads one to conclude that a surprise exam can't be on any of the pages in the book. 

The problem lies at the point when you start to argue that the exam can't be on the second last page, because when the person flips to the third last page she'll know already it's on the second last page. Not quite true. When you flip to the third last page, you have two possibilities left. One, the exam is on the second last page and you are not surprised. Second, the exam is on the last page and you are not surprised. However, remember, that disjunction of two non-surprising things can surprise.

"But the exam is not a surprise exam in either case!", one might complain. When someone is on the third last page, she imagines the exam to be on the next page. If it is, her beliefs are verified and the exam didn't surprise her. If it isn't, she is now sure it is on the last page, without having to flip to that page. So it can't be on either page, because it is by definition a surprise exam.

To that, I say that the definition of "surprise exam" is flawed. There exists a strategy of reading the book, by which you're not surprised by the surprise exam. The strategy is merely a reverse-version of the backward induction that the paradox does from the last page to the first. I will proceed from the first page to the last. 

Assume the exam is on either the first page, or the remainder of the pages. If it is on the first page, you are not surprised, if it is on the remainder of the pages, you are not surprised. 
Wait what ? Why are you not surprised if it is on the remainder of the pages ? 
Because then it is either on the second page, in which case you are not surprised, or it is on the remainder of the pages, in which case you're not surprised. 
Why are you not surprised when it is on the remainder of the pages this time ? 
Because then it is either on the third page, or on the remainder pages. Either case, you are not surprised. 
But why ? 
...
(a lot of cases later)
...
Because then you know the exam is on the last page, and you are not surprised. 

I hope I have succeeded in demonstrating that such a "surprise exam" by definition can't exist, as there exists a strategy to not be surprised by it. The element of surprise lies only in when you find out which side(s) of the disjunction is true. In the above case for example, say you are arguing "the exam is either on the first page or the remainder, and in either case I am not surprised". Yet, you are surprised by which case comes out to be true - whether it is on the first page or the remainder. To the person who is using the more traditional backwards version fo the paradox, being on the third page doesn't guarantee the exam is on the second page. It merely guarantees that there is a next guess the reader can make for where the exam is (second-last-page), which is either correct, or if incorrect, leaves future opportunity for making a correct guess (last-page). But it's not until you have flipped to the second last page, that you find out in which way you'll be unsurprised. 

With all of that, let's see if we can spot the error loud and clear in the logical argument.

```
Z : The exam is on the last page
Y : The exam is on the second last page
A : You've read till 2nd last page w/o finding exam
B : You've read till 3rd last page w/o finding exam

(A -> Z)                                    premise                                     1
(A -> Z) -> notZ                            by defn. of surprise                X       2
notZ                                        Modus ponens                                3

B -> Y or Z                                 premise                                     4
B                                           premise                                     5
Y or Z                                      modus ponens                                6
Y                                           or OUT                                      7
not Y                                       by defn. of surprise                 x      8


Wait, I want to try something : 
Y and (not Y)                               and IN                                      9
1=0                                                                                     10
```

It is clear the argument is flawed. I hope I have set it up in a charitable fashion. 
Now let's try our proposed solution (in second order logic) : 
```
Z : The exam is on the last page
Y : The exam is on the second last page
A : You've read till 2nd last page w/o finding exam
B : You've read till 3rd last page w/o finding exam
U : Unsurprising

(A -> Z)                                    premise                                     1
(A -> Z) -> UZ                              new defn. of surprising                     2
UZ                                          modus ponens                                3

B -> Y or Z                                 premise                                     1
B                                           premise                                     2
Y or Z                                      modus ponens                                3
UY                                          new defn. of surprising                     4
```
But there is no way to proceed forward to a paradoxical situation unlike the above case. Problem solved ? Here are the axioms for "surprising", which we have used above (the notation above has been simplified to get rid of integer values). 

```
Cn : You have read from the first page till nth last page
Zn : The exam is on nth last page
U  : Unsurprising

Under the universe of page numbers 1-n

Rule 1 : Possibility of future prediction rules out surprise
forall(x)forall(y)(((Cx => Zy) ^ (y < x)) => UZy)

Under the universe of propositions : 
Rule 2 : Avoid surprise by assuming (what could be) the unsurprising proposition
forall(P)forall(Q)((UP ^ (P or Q)) => UQ)

Under the universe of propositions : 
Rule 3 : Disjunction of two unsurprising things can be surprising
forall(P)forall(Q)(((UP ^ UQ) => U(P or Q)) => (1=0))
```

If you have pointed out a flaw in my reasoning, or want to share something, please contact me. My email is in the footer. 