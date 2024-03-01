---
layout : html
---
<p style="padding:3rem 0 0 0">
I'm currently enrolled in <a href="https://aisafetyfundamentals.com/">AGI Safety fundamentals</a> and volunteer at <a href="https://www.saynotodisinfo.com">say no to disinfo</a>. My undergraduate degree was in Computer Science, with significant coursework in Analytic Philosophy; the writings on this blog lie somewhere between the two subjects</p>
<p>I was Teaching Assistant for Ashoka's Data Structures course in Monsoon 2022. Additionally, I have experience in web development, functional programming, and a deep interest in the theoretical aspects of Computer Science, which extends into maths and logic. I'm looking for opportunities to do good, both paid and unpaid. If you have something to suggest, I'd love to hear from you at mayankkamboj47@gmail.com
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
