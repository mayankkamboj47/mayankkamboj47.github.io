---
layout : html
---

## Research and Writing

- [Why the P(H)=1/3 solution to sleeping beauty doesn't work](../posts/2023-05-11-why-onethird-solution-to-sleeping-beauty-doesnt-work) [Probability and Statistics, Philosophy]
- A Substitution Based Model of Computation [forthcoming] [Computability theory]
- For the sequence of primes 2, 3, ... p, there are infinite twin co-primes [forthcoming] [Mathematics, Number theory]

## Programming
### React : 
[react-speedreader](https://www.github.com/mayankkamboj47/react-speedreader)
ReactJS, CSS modules

I decided to prop-drill the state and dispatch, creating a proto-version of a reducer before I read/knew about them. The theming system is flexible, and can handle lots of themes fast - just modify the CSS and add one line of 3 words to the Javascript code. Let CSS do what it does best.

### For fun 
[game-of-life](https://mayankkamboj47.github.io/game-of-life)
John Conway's game of life

### Fullstack projects (MERN stack)
[travel](https://www.github.com/mayankkamboj47/travel) and [shop](https://www.github.com/mayankkamboj47/shop)


These projects were assigned for class. We worked in a team of 3, with me doing most of the programming. A messy codebase. The only noteworthy thing is the extensive component reuse of
&lt;Filterable&gt; and &lt;Filterbar&gt; in Travel. These components make it easy to add new filters as possible, or remove old ones. Just add a useState hook, pass it to an object. This way
work on the frontend minimised, and backend work is completely zero. Once you add a filter
on the frontend, backend handles it automatically - no changes needed. 