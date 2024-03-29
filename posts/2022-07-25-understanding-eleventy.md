---
layout    : post
braceOpen : "{{mayank}}"
title     : Understanding eleventy
---

This article will build upon a chain of examples, taking a bottom up approach to explaining how eleventy works. 
The concepts below are not comprehensive, but they hopefully cover all the core topics. If something has been
ommitted, inform me on my email please. Let's begin.

## A simple code example 

To get started, just create a markdown
file. Maybe index.md. And write some content in there
```markdown
## My first markdown file
Here is a paragraph
```
Now, simply execute in terminal `npx run @11ty/eleventy --serve`, and it will convert your markdown to html, start up
a server, and you'll be able to see the HTML for your markdown on the homepage - your first website. You also witnessed
something I love about eleventy - no configuration or setup files, just what you need to get started. 

Instead of markdown, you can also use another templating language (liquidJS, nunjucks, javascript and some others are
supported by default). I'll use liquid in the examples that follow. It looks simple and you'll pick it up as you read it. Moving 
forward, you can
either rename your .md files to .liquid but you don't need to . I'll be using liquid syntax in .md files (eleventy figures out automatically
you're using liquid).

Say you want an /about page, and an /about/contact page. You can create these
by making multiple folders, and putting liquid files in appropriate places. 
Here is how to go about it : Create an about folder, and put in it an index.md (this will be your /about page) and a
contact.md (this will be your /about/contact). 
Your directory should look like this. 
```
index.md
/about
	index.md
	contact.md
```

It's just what you would do with HTML to create multiple pages - just the pages are in liquid instead of html. Add some
random markup and run `npx run @11ty/eleventy --serve` again. 

## Adding frontmatter

Your .md or .liquid files (or nunjucks etc.) are called templates. Note this down as this term is used a lot in eleventy
conversations. You can create and consume variables (data) in your tempalates. To do that, assign
these variables at the top of the page in a section called 'frontmatter'. For example, here is the about/index.md
page with some front matter. 

```liquid
---
title : About me
name  : Mayank Kamboj
---

Hi, I am {{braceOpen}}, I see you want to learn more about me. 
```
You can see that the initial section of the document marked with three dashes is not markdown. It is the front matter
of the document which specifies some variables. 
The syntax - called the YAML syntax - looks fairly simple, and includes just variables and values separated by colon. The variables
are consumed by enclosing their name in two curly braces.

## Special frontmatter

I'll pull a variable out of thin air. Just watch

```liquid
---
title : About me
name  : Mayank Kamboj
---
Hi, I am {{name}} and it is {{page.date}} right now.
```
The {{page.date}} value is supplied by eleventy without you needing to specifically declare it - it's a special value. 
You can override it of course, by specifying a date yourself (in ISO format). By default it points to the date and time
when the template file was first created. 

Input and output directories : 
Input directory is where eleventy looks for your templates and builds a website from them. Output directory is where
this built website lives. By default, the input directory is '.' and the output directory is '_site'. 
We can change these if we want. The below changes your input directory to source. Put this code in .eleventy.js in
the root of your site. 
```javascript
module.exports = function(eleventyConfig){
  return {
    input : 'src'
  }
}
```
Be sure to remove this before proceeding because I'll work with the default folder settings for this tutorial. 

## Layouts

Now here is where things will start to get real.. eleventy. Usually you write some boilerplate code again and again. 
For example, all HTML documents look like 
```HTML
<!doctype html> 
<html lang='en'> <!-- put the lang tag always --> 

<meta charset='utf-8' />  <!-- no head tag ? Yes, this is valid html. Saves time AND space -->
<title>Some title</title>

<!-- and then the rest of the html -->
```
What if you could type all this just once, and have all your html files build on this boilerplate code? 
Layouts can help you there. In your input folder, create a '_includes' folder, and in there, create a
boilerplate.html. Add the following code to it : 
```HTML
---
title : Override this title
lang  : en
---
<!doctype html>

<html lang='{{lang}}'>

<meta charset='utf-8' />
<title>&#123;	&#123;	title}}</title>

&#123;	&#123;	content}}
```

Rather than typing the boilerplate code now, just include the layout in the front matter of the template you're making
(I just used
a lot of jargon in this sentence, which is to test if you understand the important terms. These will be important as we
move forward): 
```
---
layout : boilerplate
title  : About me
name   : Mayank Kamboj
---
# About me
Hi, my name is &#123;	&#123;	name}}. 
```

Let's break down what is happening above. We have two files, one is the layout file in _includes, and another is your template (the location
of the template doesn't matter). Let's first look at layout. 
The layout code looks like any other template, except for the &#123;	&#123;	content}} variable. When the template code uses
boilerplate.html as its layout, the contents of the template code (excluding the front
matter) are inserted where &#123;	&#123;	content}} is. Front matter of both the files is combined in an interesting way - this
combining of front matter is its own topic called data cascading, and will come up again and again - its first appearance
is in the section below. 

## A simple data cascade 

Introduction of layouts starts an interesting topic about front matter. What if some property is present in both the
layout and the template using the layout ? In many cases, the data in the layout is overriden by the template which
consumes the layout. This is what happens with &#123;	&#123;	title}} above. It is overriden by the about page to "About me". 
This also allows us to insert at random insertion points in the layout, like the &lt;title&gt; tag, where otherwise we
were only allowed to insert where &#123;	&#123;	content}} is. In other cases, rather than overriding, eleventy combines two pieces
of data. The 'tags' property which is covered in the 'collections' section follows this pattern. 

As we start consuming data from different places in a template(eg. front matter of both the
template and the layout template), the need to resolve data conflicts arises. Data
cascade thus grows in complexity. Infact, layouts can further specify a layout which can also further specify a layout
and so on, forming a chain. This also leads to a chain of data-conflict resolving, which is probably where the 
'cascade' of data cascade comes from.. 


# Collections
You can group your templates into collections. This is handy when, for example, you have certain 'posts' on your website
and you want to do something in batch with them, like display the recent posts on the homepage. 
You can group templates into a collection by specifying a tag in the front matter. For example : 
```
---
tags : post
---
# My first post
```
creates a template with the tag post, which automatically includes it in the post collection. 
You can specify multiple tags too, like so : 
```
---
tags : ['post', 'travel', 'food']
---
# The Mexican Tortillas
```
And use the tags in your code via the variable &#123;	collection.post} or &#123;	collection.<tag_name>}. You can create more
interesting kinds of collections in the config. 

# Config
The config file lives by default in .eleventy.js in the root directory. You can specify custom settings and filters etc.
in this file. This also serves as another entry point where we can specify data that templates can use. 

## Data cascade
Config is in an even lower priority than layouts. Layouts can override config data, and template's front matter
can override the layout's data.

# Pagination 
If you're consuming too much data to nicely fit on a single page, you may want to split the results on multiple pages.
You can do so using pagination. Just specify the source of data and how large you want one page to be. 
You can also specify the links to each of the page using 'permalink'. In general, you can use permalink to override the
default routes based on directory structure. Eleventy will now build multiple pages from your single template, taking
care of inserting the right amount of data per page. 

## Data files
_data includes the global data files. In there, we can write out data that any template can use. If you want your data
access to be more local, you can use .11ty.js files in the local folders. For example, adjacent to your template you
can have &lt;templatename&gt;.11ty.js and export data from there. This data will only be visible in the template with name
&lt;templatename&gt;. To restrict access just to the directory &lt;dname&gt;, inside &lt;dname&gt; put &lt;dname&gt;.11ty.js and export the data
from there. This way, one can have lots of .11ty.js files providing data to a single template. Conflicts in this case
are resolved by 'distance'. The farther up you go a directory tree, the less priority the data file gets. Global then
has the least priority. 

## The end
I've ommitted some topics above, that I do not consider a part of 'core' eleventy. If you disagree and think a 'core'
feature is missing (it's hard to define that word afterall, as I am not using it in the official sense), do let me
know and I'll write about it in the future or make edits to this article. 