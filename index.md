---
layout : html
---
<p style="padding:3rem 0 0 0">
I recently finished my undergraduate degree in Computer Science from <a href="https://www.ashoka.edu.in">Ashoka University</a> , where I also studied a bit of Analytic Philosophy. The writings on this blog are somewhere between CS and philosophy.</p>
<p>I was Teaching Assistant for Ashoka's Data Structures course in Monsoon 2022. Additionally, I have experience in web development, functional programming, and a deep interest in the theoretical aspects of Computer Science, which extends far into mathematics and Analytic Philosophy. I believe that work is just paid charity and have been interested in AI Safety, having also finished J.Howard's fastAI course and AGI fundamentals recently. I'm open to volunteer work and employment - reach out at mayankkamboj47@gmail.com
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