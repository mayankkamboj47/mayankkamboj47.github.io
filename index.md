---
layout : html
---
<p style="padding:3rem 0">
I am a third year Computer Science student at <a href="https://www.ashoka.edu.in">Ashoka University</a>. I also do a bit of logic and number theory. I'm <abbr title="Teaching Assistant">TA</abbr>ing for Ashoka's CS1201 : Data Structures under Professor <a href="https://debayangupta.com">Debayan Gupta</a>
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