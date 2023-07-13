---
layout : html
---
<p style="padding:3rem 0">
I am an independent researcher currently focussed on Artificial Intelligence alignment. I have written papers in logic, number theory, and philosophy of probability, versions of which you can find on this blog. I was a Teaching Assistant for Ashoka's <span style="font-family:monospace;">CS1201 : Data Structures</span> last Monsoon, under Professor <a href="https://debayangupta.com">Debayan Gupta</a> who previously taught at Massachussets Institute of Technology. I'm currently looking for research opportunities in AI labs, as well as for potential collaborators. 
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