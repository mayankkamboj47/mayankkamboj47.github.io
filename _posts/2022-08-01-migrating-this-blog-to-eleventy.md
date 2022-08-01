---
layout : post
title  : Migrating this blog to eleventy
---
I've decided to move this website to eleventy. I find it much simpler to use than Jekyll, and I'll also get the luxury to use a tool I understand in greater depth than I do Jekyll. For the past few days (more than a week actually), I have been reading eleventy's docs and also a bit of their source code. I intend to make my push into open source development by contributing to eleventy, and moving this website will give me greater involvement with the project. 

Let's get started. 

First, I'll create a new git branch and shift to that, so that I can go back easily incase I make a mess. 
`git checkout -b eleventy`.

Now, we'll `npm init`. The default configuration is fine. 

Next up, let's get rid of the jekyll configuration files, gemfiles and stuff. Only the
pages that belong on the website should stay. 

Next up we'll rename our markdown files to .md, and also remove the layout parameter from
the front matter to avoid running into a layout-not-found error. We'll have to make sure we remove all the incompatible front matter. This includes the jekyll dates, which either have to be reformatted. I don't really need a precise date and time, just the date preserved in the filename will be enough. Now, permalinks. It isn't necessary to have them when eleventy defaults will work. Structuring the files is better in this case than providing permalinks which should instead be more like exceptions to eleventy's defaults. 

The site works now, but all of the pretty jekyll layouts have gone away. We'll create our own. 

First thing, we want the list of recent posts on the homepage. 
To do that, we'll first tag each of the posts with the tag 'post'. While we do so, I think it better to add the tag post to a layout, and have all of the posts consume that layout. The contact surface is minimised when just a single `layout : post` property declares a post a post. 

Next, I'll temporarily create a peek filter to look into what properties each element
of collections.tagname exposes. Or maybe we don't need that. I remember having written or read something about it. Yes, I was right. It's in my notes and also at https://www.11ty.dev/docs/collections/#collection-item-data-structure . 

 I will just go to my old jekyll site, and see how the posts were displayed on the index page. I see it has just the date and the link to the post. Lovely. 
We'll need the item.url and item.title for this. Incase the item.title property isn't available, (I'll actually make sure that it is available on all my posts), we'll use the file slug. Philosophical question, should I use the file slug when a better way to force myself to add a title is when there is no fallback available. Should humans let themselves fail hard when they make avoidable mistakes, so that they learn to avoid them better ? I think so. Either way, I am not so serious about correcting _this_ mistake - the slug looks pretty to me.

Once this is done, we turn our eyes to the navigation. To create our navigation, we'll modify the html.liquid template. We could have kept the navigation separate and included it as a partial, maybe in nunjucks. Or we could have kept the navigation data separate at least. But since I will not be changing the navigation in the future, I will not do that - I am sure about the navigation staying static in the future. 

I'll also add a bit of CSS to the default html.liquid page. After this, a footer with a link to github and email. 

I'm pretty happy with the website now the way it is. Before finishing, we'll reverse the
ordering for posts, from newest to oldest. This is easy, just add `reversed` in the for
loop in liquid template. 

And now make the dates on the posts look less scary. We'll write a filter called humanise. It'll take the scary string and return a more easy-to-read one. 

Finally, modify package.json to explain how to build the website `build : npx @11ty/eleventy --build`, and push :)


PS : Some mysterious error with Jekyll caused the build to fail and show just a limited amount of content on the webpage. Thereafter, I deleted my old repository and built it all over again, only to have the same issue. Then, I decided to build everytime I push and deploy the static website. While it works for now, I will be fixing this in the near future. 