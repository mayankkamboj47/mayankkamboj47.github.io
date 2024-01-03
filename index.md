---
layout : html
---
<p style="padding:3rem 0">
I finished my undergraduate degree in Computer Science from Ashoka University. I also took courses in Analytic Philosophy my third semester onwards; the writings on this blog are of a mixed nature between computer science and philosophy. I was a Teaching Assistant for Ashoka's Data Structures course in Monsoon 2022. I am good at web development, functional programming, and have recently taught myself Machine Learning from J.Howard's fast.ai course. I'm interested in improving human wellbeing through my work, and therefore, in AI Safety, and open source. I'm open to volunteer work, and am looking for employment at the moment. If you're interested, please reach out at mayankkamboj47@gmail.com
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