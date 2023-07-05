---
layout : html
---
<p style="padding:3rem 0">
I'm about to finish my BSc. in Computer Science from <a href="https://www.ashoka.edu.in">Ashoka University</a>. In the past, I have written results in logic, number theory, and philosophy of probability. I was a Teaching Assistant for Ashoka's <span style="font-family:monospace;">CS1201 : Data Structures</span> last Monsoon, under Professor <a href="https://debayangupta.com">Debayan Gupta</a>. I'm open to opportunities where I can apply my analytical skills to contribute to moral good, and I'm especially keen on AI Safety roles. 
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