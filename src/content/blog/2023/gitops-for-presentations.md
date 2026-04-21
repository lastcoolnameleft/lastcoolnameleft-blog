---
title: GitOps for Presentations
description: ""
pubDate: '2023-08-04T16:57:07.000Z'
categories:
  - Work Related Stuff
---

Yes, I work for Microsoft. No, I do not like PowerPoint. Here’s [my alternative](https://lastcoolnameleft.github.io/marp-template/) with the [source code](https://github.com/lastcoolnameleft/marp-template) which I’ll explain here.

For a live example, check out my presentation on "[How to Punkin Chunkin](https://lastcoolnameleft.github.io/how-to-punkin-chunkin/)"[![How to Punkin Chunkin](/wp-content/uploads/2025/03/how-to-punkin-chunkin.png)](https://lastcoolnameleft.github.io/how-to-punkin-chunkin/)

For 20+ years I’ve done UNIX/Linux development and have worked at Microsoft for 6 years. And I’ve learned that Microsoft will typically build the all-encompassing Enterprise-ready solution and the OSS ecosystem will build a narrow-focused tool that you can piece together with others.

Each have their own benefits and constraints. There is [No Silver Bullet](https://en.wikipedia.org/wiki/No_Silver_Bullet).

A common set of requirements I encounter are:

    - I need to easily present to a public audience

    - I might have to use someone else’s computer

    - I want to share the slides afterwards

    - I need to quickly update the slides

    - I just want to display text and images. (PowerPoint is an absurdly impressive tool with lots of features that I rarely use.)

Internal Microsoft SharePoint policy prevents sharing slides with external visitors. This often results in emailing 10-100MB PPTs or PDF files around. Blah!

Piecing bits of OSS, I present to you “GitOps for Presentations”. It involves:

    - Git + GitHub - Version control of content

    - [Markdown](https://daringfireball.net/projects/markdown/) - Easy styling of content

    - [MARP](https://marp.app/) - Converts [CommonMark](https://commonmark.org/) to HTML, PDF, PPT

    - VSCode - Edit the content (There’s even a [MARP extension](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) which allows you to preview in real-time!)

    - [GitHub Actions](https://github.com/features/actions) - Build the presentation from Markdown

    - [GitHub Pages](https://pages.github.com/) - Host the presentation

Benefits:

    - Free ([as in beer](https://www.notion.so/GitOps-for-Presentations-2be5e92c47c343f5942e13b3910a858f?pvs=21))

    - Simple to setup

    - You can style your presentations. For example, I’ve created a [CSS which models the Microsoft styling guides for PPT’s](https://github.com/lastcoolnameleft/marp-template/blob/main/themes/microsoft.css)

    - Easy to share and update

Limitations:

    - MARP’s formatting is basic. Especially if you’re coming from PowerPoint

That’s cool, but why didn’t you …

    - use [Remark](https://remarkjs.com/#1) or [Reveal.js](https://revealjs.com/)?

    - There’s many great presentations frameworks, but I wanted something really simple. [KISS](https://en.wikipedia.org/wiki/KISS_principle)

    - You should be able to replace MARP with any of those other frameworks and still get the same results.

    - just present your PPT and email it?

    - That requires work and time. At conferences, I don’t have time/might forget to follow-up with everyone. I create a QR code and put it at the end of the slides. This enables self-service, discovery and also [saves me previous keystrokes](https://www.hanselman.com/blog/do-they-deserve-the-gift-of-your-keystrokes).

    - use [slides.com](http://slides.com) or Google Slides?

    - Microsoft has embraced OSS and purchased GitHub, so I wanted to find a way to explore integrating all of this. I’ve been very happy with the results!

I’m sold! How do I get started?

    - I’ve made it easy for anyone to get started by creating a [GitHub template for this project](https://github.com/lastcoolnameleft/marp-template) ([which is also a presentation](https://lastcoolnameleft.github.io/marp-template/))

    - Click “Use this template” and create a new repository

    - Enable GitHub Actions to auto-publish to GitHub Pages

    - In your new Repo, click `Settings` -> `Pages`

    - Set Source to `GitHub Actions`

    - You’re done!

PEDANTIC DISCLAIMER:

    - I’m quite familiar with [GitOps](https://www.weave.works/technologies/gitops/), and while this is outside of running Kubernetes clusters as IaC, there are some similarities with the top-level concept of using Git to set my desired state of my presentation.

    - MARP technically uses [CommonMark](https://commonmark.org/). It’s close enough for what most people will need
