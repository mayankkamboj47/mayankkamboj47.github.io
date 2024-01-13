---
layout : html
---
<p style="padding:3rem 0 0 0">
I recently finished my undergraduate degree in Computer Science from <a href="https://www.ashoka.edu.in">Ashoka University</a> , where I also studied a bit of Analytic Philosophy. The writings on this blog are somewhere between CS and philosophy.</p>
<p>I was Teaching Assistant for Ashoka's Data Structures course in Monsoon 2022. Additionally, I have experience in web development, functional programming, and a deep interest in the theoretical aspects of Computer Science, which extends into mathematics and Analytic Philosophy. With the belief that work is just paid charity, I've become interested in AI Alignment, and finished J.Howard's <a href="https://www.fast.ai/">fastAI</a> course and <a href="https://aisafetyfundamentals.com/">AGI Safety fundamentals</a> recently. I'm open to volunteer work and employment - reach out at mayankkamboj47@gmail.com
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