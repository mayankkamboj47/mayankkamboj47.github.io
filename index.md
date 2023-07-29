---
layout : html
---
<p style="padding:3rem 0">

I'm in the final year of my <abbr  title="Computer Science">CS</abbr> major at Ashoka University. I was a Teaching Assistant for Ashoka's Data Structures course last academic year. I often delve into analytic philosophy and number theory; my work on the same is available as posts on this blog. I am a competent web developer, and good at functional programming. I'm currently interested in open source, AI Safety, and improving wellbeing in a more general sense.
</p>
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