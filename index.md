---
layout : html
---
<p style="padding:3rem 0 0 0">
I'm currently enrolled in <a href="https://aisafetyfundamentals.com/">AGI Safety fundamentals</a> and volunteer at <a href="https://www.saynotodisinfo.com">say no to disinfo</a>. My undergraduate degree was in Computer Science, with significant coursework in Analytic Philosophy; the writings on this blog lie somewhere between the two subjects</p>
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
