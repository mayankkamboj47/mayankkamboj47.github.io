---
layout : html
---

I am a third year Computer Science student at <a href="https://www.ashoka.edu.in">Ashoka University</a>. I also do a bit of logic and number theory. This semester I'm also <abbr title="Teaching Assistant">TA</abbr>ing for CS1201 : Data Structures at my university under [Professor Debayan Gupta](https://debayangupta.com/). 

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