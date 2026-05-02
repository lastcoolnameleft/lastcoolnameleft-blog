---
draft: false
featured: "none"
title: "Creating a Dev Env with Azure Functions for Python"
description: "Azure Functions (one of the many Serverless Platforms inside Azure) allows you to use Python as your runtime environment. This is great; however, it…"
authors:
  - Tommy Falgout
pubDate: 2019-08-07T21:08:28.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
---
[Azure Functions](https://azure.microsoft.com/en-us/services/functions/) (one of the many Serverless Platforms inside Azure) allows you to [use Python as your runtime environment](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-python).

This is great; however, it requires Python 3.6, which is a problem for my development on a Mac (which uses Python 3.7).  Downgrading/dual installation has the potential for many perils, so I wanted an isolated runtime development environment which wouldn't interfere with my current setup.

Here's my requirements:

 	- Run [Azure Functions locally](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) (e.g. "func host start")

 	- Publish Azure Functions locally (e.g. "func azure functionapp publish")

 	- Use my existing Azure CLI session (i.e. don't have to login each time)

 	- Won't confuse my existing Python 3.7 env.

[Docker](https://www.docker.com) to the rescue!

I'll spare you the details of the iterative process of creating the [Dockerfile](https://docs.docker.com/engine/reference/builder/), but after a some iterations, I knew I was on the right track.

You can copy/create my code here:
[https://gist.github.com/lastcoolnameleft/05b6b09735fb435b2cb4469f6cf30ac6](https://gist.github.com/lastcoolnameleft/05b6b09735fb435b2cb4469f6cf30ac6)

In short, it creates a Docker image and runs it with:

 	- Ubuntu 18.04

 	- Python 3.6

 	- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

 	- [Azure Function Core Tools](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

 	- Forwards port 7071 from inside the container to my localhost (used for local function testing)

 	- Mounts my home dir to /root to maintain my Azure CLI session.  (e.g. No login!)

This will definitely save me time each time I want to setup a new Function (or other) environment and I hope it helps save time for you too.

Make my func the p-func!