---
layout : html
---
<p style="padding:3rem 0">
I am about to graduate from Ashoka University with a Bachelor of Science in Computer Science. I have written stuff in logic, number theory, and the philosophy of probability, some of which can be found as posts on this blog. Last academic year, I was a Teaching Assistant for Ashoka's CS1201: Data Structures course under Professor <a href="https://debayangupta.com">Debayan Gupta</a>. Currently, I am seeking employment opportunities where I can apply my skills and experience.
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