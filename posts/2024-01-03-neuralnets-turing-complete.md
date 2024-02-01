---
layout : post
title  : Neural Nets are Turing Complete
---

In a [previous post](/posts/2023-05-12-a-substitution-model-of-computation),I introduced a Turing complete model of computation utilising string substitution. Here, we'll prove that neural nets are Turing Complete by implementing the said model (which I'll call the substitution model henceforth) using a neural net.

Since the model has just one instruction `sub s1 s2`, which substitutes in the input `s` all occurences of substring `s1` with substring `s2`,  implementing this instruction is equivalent to implementing the model. Looping from the model can be handled by feeding the neuralnet's output to itself, kind of like RNNs. The difference from traditional RNNs will be that we'll need to run an algorithm to resize the neuralnet every iteration, so that the output fits into the input layer.

The substitution model works with strings. We'll need to convert these into numbers to feed them to the neuralnet. We define a plain mapping from each unique character to an even number, reserving odd numbers for later. Each of the countably infinite characters in the model thus gets mapped to a unique even number. The number 1 will be used as a special sentinel. The rest of the odd numbers will be required for internal represenations, as will become clear below. 

To build the network, we'll utilize special neurons that execute instructions of the sort `if a1==b1 and a2==b2 and ... and an==bn then c else d`, where each of the values can either be hardcoded into the neuron or fed as input. A section at the end shows how these special neurons could be built from scratch. These neurons can execute the instruction `sub s1 s2` in its simplest case where `s1` and `s2` are each one character long. To make longer substitutions work, the network will examine substrings of length `len(s1)` in the input left to right, each layer being responsible for examining a single such substring and substituting. Since substitution can change the length of the string when `s1` and `s2` don't match in size, the layer assumes the longest possible size it can yield, and if the output is shorter, emits the sentinels `1` at the empty spots in the end. 

The layers also have to consider the case when s2 contains s1, such as when
`s1` encoded is `4` and `s2` is `6,4`. Now, once the `4` is substituted by `6,4`, the next layer will examine the 4 of `6, 4` and further substitute `6, 4` for that 4, resulting in a long series of 6s followed by a 4. This is undesirable, for the substitution model skips over the substituted s2 entirely. Therefore, we'll need to change the size of the skip to 2 here incase a substitution happens, or do all substitutions simultaneously in parallel. But there is no obvious way to do either. Therefore we utilize the odds reserved at the start, and substitute for each number what we would obtain by incrementing it by 1. At the end of the network we'll reverse this process, but leave the sentinel 1 intact. 

Here is a demonstration of how such a network would work

![Neuralnet](/img/graph.svg)  

Each layer examines a particular window (the black lines). Here, the window, matching `len(s1)` is of size 1. `s2` is of size 2, and each layer grows by `len(s2) - len(s1) = 1` considering the case where a substitution happens. The neurons are also connected to the value they would emit incase of a substitution, and the one they would emit otherwise. For the top neurons, the
latter value is missing, as they just emit the sentinel `1`. There are a total of `len(s)*len(s2)` layers, as after this the window is sure to go in the region of the string containing only the sentinel `1`s. 

We still need to handle the special symbols  $$$ and `^` from the substitution model. Here I modify not the neural net, but the model itself so that these symbols act just like regular characters. Such a modification entails just mandating each string to start with `^` and end with $$$, and
that the instructions have these symbols either in both s1 and s2, or in neither. That is, `sub $$$ abc` is invalid, but `sub $$$ abc$$$` is a valid way of appending the string "abc" to the end of the input. 

This wraps up the proof. Or at least, how to implement the instructions without the looping. For the looping, we simply resize the neuralnet. I do not give the resizing procedure here, but it is plain upon a quick glance that the resizing is mechanical and could be done with an algorithmic process. 

## Implementing the neurons

We’ll use simple ReLU activation neurons for the implemnetation, which we will assemble together in a network computing what the single neuron does in the above proof. Another way to think of it is that we’re breaking down a single layer of the networks used in the proof into multiple, simpler layers made of ReLU neurons.
To implement a single neuron, take two ReLU neurons, one detecting whether the input is >=C and another whether it is <=C. In the next layer, have a neuron add these together and set its bias such that it is only activated when both of its inputs are. This neuron now only activates when the initial input is exactly C. One could make multiple such neurons, and since each of their calculations can be done in parallel, they stack up nicely in a single layer. Finally, to implement “and”, we could have a neuron afterwards add all of these up, and again have the bias value such that the neuron only activates if all its inputs are activated. Now, based on the activation of this neuron, we could output either C or D conditionally. 