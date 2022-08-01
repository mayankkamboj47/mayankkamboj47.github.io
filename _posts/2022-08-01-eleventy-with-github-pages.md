---
title : Using Eleventy with Github Pages
layout: post
---

As I recently tried to move my github pages website from Jekyll to Eleventy, I found that the github pages setup for eleventy took me a few hours to figure out. This wasn't the case with Jekyll, the tool I was using for this blog earlier. Eleventy allows a simpler setup and is better for someone familiar with javascript and its tools, and even the initial difficulty in setting things up isn't enough to convince me otherwise. Yet, why have even that difficulty, when you can share what worked for you and save other people's time. That's what this article intends to do. 

# Create your eleventy website like usual
I'll assume you have your files ready, and just need to deploy them. If not, build your beautiful (or ugly) website before proceeding. You can take help from tutorials like [https://www.11ty.dev/docs/getting-started/](https://www.11ty.dev/docs/getting-started/). 

# Add a .nojekyll file in the root folder

Add an empty `.nojekyll` file next to where `package.json` and company are. This file tells github pages that we're not using jekyll, because it assumes that by default. 

# Create a config file .github/workflows/eleventy_build.yml

If the `.github` folder doesn't exist create that too. Same with `workflows`. 

After making the file, add this content to the file : 
```
name: Eleventy Build


on:
  push:
    branches:
      - main
      
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v2


        - name: Setup Node
          uses: actions/setup-node@v1
          with:
            node-version: '12.x'


        - run: npm ci


        - run: npm run build


        - name: Deploy
          uses: peaceiris/actions-gh-pages@v3
          with:
            deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}

            publish_dir: ./_site

```

# Modify the config file

1. If you changed your default eleventy output folder, modify `publish_dir : ./_site` to `publish_dir : <your output folder>` in the config file. If not, skip this step. 
2. Make sure you have a `"build" : "npx @11ty/eleventy"` script set in package.json. If not, then go to `"scripts"` object in `package.json` and add the said property there. 
3. Update `branches : main` to `branches : <your default branch>`. You may be using master instead of main for example. You'll have to specify that here. If your default branch is main, you can skip this too. 

# Setup keys

Open a local terminal (I'm assuming you're on linux) and issue `ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f gh-pages -N ""`. Two files will be created, `gh-pages` (the private key) and `gh-pages.pub` (the public key). 

Go to your github repo in your browser. Now go to `Settings > Deploy Keys`. Click Add. 
Copy the contents of `gh-pages.pub` file you created in your terminal and add them to the box. Set the title to whatever you please. Allow write access and add the key. 

In the same way, you'll add the other, private key. Go to Settings > Secrets. Add a new repository secret. Here, you'll copy paste the contents of `gh-pages` file you created in the local terminal. Set the title to `ACTIONS_DEPLOY_KEY` ( your config file is told to find a key with this name, so don't name this to anything else ). 

# Push !

Now just `git add` the files, `git commit` and push them. Github will build the website for you. It takes a while. You can check the progress on the homepage of your repository. It shows as a yellow circle with a small hash-like value next to it. 
If the build fails, check `Settings > Pages`, and play around there. 

If this doesn't work for you, see 'Resources'. You may find something useful.

# Resources
(Remember that these may say different things about the same issue. You might have to tailor the fix to your needs or maybe one of these will work for you as-it-is). 



[https://quinndombrowski.com/blog/2022/05/07/hosting-eleventy-on-github-pages/](https://quinndombrowski.com/blog/2022/05/07/hosting-eleventy-on-github-pages)


[https://github.com/11ty/eleventy/discussions/1455](https://github.com/11ty/eleventy/discussions/1455)


[https://www.linkedin.com/pulse/eleventy-github-pages-lea-tortay/](https://www.linkedin.com/pulse/eleventy-github-pages-lea-tortay/)


[https://donnacodes.com/publishing_eleventy_site_to_github_pages](https://donnacodes.com/publishing_eleventy_site_to_github_pages)


[https://tomhiskey.co.uk/blog/deploying-eleventy-to-github-pages-one-way/](https://tomhiskey.co.uk/blog/deploying-eleventy-to-github-pages-one-way/)