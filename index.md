---
layout : html
---

<h1>Hello</h1>

I am happy to see you stumble upon this corner of the web. From here, you can either check out my [work](./work), or read the posts below. The [about](./about) section has some books I have enjoyed and found useful. 

<h1> Posts </h1>

{%- for post in collections.post reversed -%}
  {{post.date | humanise}}
  <a href={{post.url}}>
    <h2 class="post-title">
    {%- if post.data.title -%} 
        {{post.data.title}} 
    {%- else -%} 
        {{post.fileSlug}}
    {%- endif -%}
    </h2>
  </a>
{%- endfor -%}