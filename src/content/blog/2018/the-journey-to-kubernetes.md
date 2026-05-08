---
draft: false
featured: "none"
title: "The Journey to Kubernetes"
description: "I created this article with the intent of explaining the migration journey from deploying a legacy application with manual steps to an automated…"
authors:
  - Tommy Falgout
pubDate: 2018-07-25T18:45:18.000Z
license: cc-by-nc-sa-4-0
tags:
  - engineering
  - kubernetes
  - containers
---
I created this article with the intent of explaining the migration journey from deploying a legacy application with manual steps to an automated [Kubernetes](https://kubernetes.io/) deployment with proper DevOps practices.  Its intent is not to help you understand Kubernetes deeper ([thereâ€™s an abundance of materials out there already](https://www.katacoda.com/)).

As a [Cloud Solution Architect for Microsoft](https://www.linkedin.com/in/lastcoolnameleft/), every week I work with our partners to assist them towards containerization and Kubernetes.  Iâ€™ll use [AKS](https://docs.microsoft.com/en-us/azure/aks/intro-kubernetes) and discuss itâ€™s strengths and weaknesses without holding punches. Disclaimer:  Given I work for Microsoft, I am self-aware of my bias. So in this article, I will make an effort to be more critical of Azure to balance that out.

[Beginning With the End in Mind](https://www.franklincovey.com/the-7-habits/habit-2.html), I created the following outline:


## Intent

**[Duckiehunt](https://www.duckiehunt.com) is secure, monitored and deployable with the least amount of manual effort, cost and code-change.**


## Purpose

I wrote [Duckiehunt](https://www.duckiehunt.com) in 2007 as a [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) website. It embodies many of the customer requirements I see:  


	- Old code, using legacy tooling

	- Want a reliable, resilient infrastructure

	- Want to automate deployment

	- Don't want to re-write

	- Migration should involve minimal/no code change

	- Need to update to modern standards (e.g. HTTPS, MySQL encryption, private DB instance with backups)





## Outcomes



- CI/CD (Code Check-in triggers automated tests and pushes to Production)

- Monitoring cluster + app (visualization + alerts if down)

- HTTPS enabled for duckiehunt.com (CA Cert + forced redirection to https)

- Running on Kubernetes (AKS)

- Managed MySQL





## Milestones: (in reverse order of accomplishment)



- Production DNS migrated

- Azure Monitor + Container Monitoring Solution + LogAnalytics

- Distinct Dev + Prod environments

- VSTS + Github integration

- Securely expose UI + API

- Integrated MySQL instance

- Installed on AKS

- Test in Minikube

- Migrate App to Container




From here on, Iâ€™ll explain my journey as steps fulfilling the milestones I created.  Iâ€™ll list my estimated time, as along with my actual time to compare.  The times below are not â€œTime to get X workingâ€, but â€œTime to get X working correctly and automate as if I had to support this in productionâ€ (which I do).  As a result, theyâ€™re much higher than a simple success case.


## Migrate app to Container

**Estimated Time: 4 hours.  Actual Time: 10 hours**

I wrote this in 2007 using a PHP version that is no longer supported (5.3) and a framework ([CodeIgniter](https://codeigniter.com/)) that is not as active.  I didnâ€™t want to re-write it yet.  Thankfully, 5.6 is mostly backwards compatible and I was able to find a container using that.  

I would have been done in ~4 hours; however, I lost an embarrassing amount of hours banging my head against the wall when I automated the docker build. (I would always get 404)  I learned this was because [Linuxâ€™s file system is case-sensitive and OSXâ€™s is not](https://github.com/docker/for-mac/issues/2096#issuecomment-332747000), and the PHP framework I chose in 2007 expects the first character of some files to start with a capital letter.  ***grumble* *grumble***


## Test in Minikube

**Estimated time: 12 hours.  Actual Time: 10 hours**

Now that I got my PHP app running in a container, it was time to get it running inside Kubernetes.  To do this, I needed to deploy, integrate and test the following:  Pod, Service, Secrets, Configuration, MySQL and environment variables.

This is a pretty iterative approach of "This, thisâ€¦nopeâ€¦how about this?...Nope...This?...ah ha!...Ok, now this...Nope."  This is where [Draft](https://draft.sh/) comes in.  Itâ€™s a Kubernetes tool specifically designed for this use case, and I think Iâ€™ve started to develop romantic feelings for this tool because of how much time and headache it saved me while being dead simple to use.


## Install in AKS

**Estimated time: 8 hours.  Actual time: 2 hours**

Creating a new AKS cluster takes about 10 minutes and is instantly ready to use.  Because I had done the work on testing it Minikube the hard-word was already done, but I expected some additional hiccups.  Again, this is where my love and adoration of Draft started to shine.  I was almost done in 30 minutes, but I took some shortcuts with Minikube that came back to bite me.


## Integrated MySQL instance

**Estimated time: 2 hours.  Actual time: 3 hours**

Azure now offers [MySQL as a Service](https://docs.microsoft.com/en-us/azure/mysql/overview) (aka Azure Database for MySQL) and I chose to use that.  I could have run MySQL in a container in the cluster; however, I would have had to manage my own SLA, backups, scaling, etc.  Given my intent of this project is to have the least amount of work and cost, and the cost is still within my MSDN budget, I chose to splurge.

I spent an hour experimenting with [Open Service Broker for Azure](https://osba.sh/) (a way of managing external dependencies, like MySQL, native to K8S). I really like the idea, but I wanted one instance for both Dev + Prod and needed a high control over how my app read in database parameters (since it was written in 2007).  If I was doing more deployments than one, OSBA would be the right fit, but not this time.

Steps taken: 


- Create the Azure Database for MySQL Instance

- Created the dev/prod accounts

- Migrated the data (mysqldump)

- White-listed the source IPs (To MySQL, the cluster traffic looks as if it's coming from the Ingress IP address)

- Injected the connection string to my application (Using K8S Secrets)



Then I was off to the races.  OSBA would have automated all of that for me, but I'll save that for a proverbial rainy day.


## Securely expose UI + API


**Estimated time: 4 hours.  Actual time: 20 hours**

This was the most frustrating part of the entire journey.  I decided to use [Nginx Ingress Controller](https://github.com/kubernetes/ingress-nginx) with [Cert-manager](https://docs.microsoft.com/en-us/azure/aks/ingress) (for SSL). Thereâ€™s lots of old documentation that conflicts with recommended practices, which led to lots of confusion and frustration.  I got so frustrated I purposely deleted the entire cluster and started from scratch.

Lessonsâ€™ learned:


- nginx-ingress is pretty straight-forward and stable.  Cert-manager is complicated and I had to restart it a lot.  I really miss kube-lego (same functionality, but deprecated.  Kube-lego was simple and reliable)

- Put your nginx-ingress + cert-manager in kube-system, not in the same namespace as your app

- You might have to restart cert manager pods when you modify services.  I had issues where cert-manager was not registering my changes.

- cert-manager might take ~30 minutes to re-calibrate itself and successfully pull the cert itâ€™s been failing on for the last 6 hours 

- cert-manager creates secrets when it tries to negotiate, so be mindful of extra resources left around, even if you delete the helm chart

- cert-manager injects its own ingress into your service for verifying you own the domain.  If you donâ€™t have your service/ingress working properly, cert-manager will not work

- If youâ€™re doing DNS changes, cert-manager will take a long time to â€œuncacheâ€ the result. Rebooting kibe-dns doesnâ€™t help.

- Thereâ€™s no documentation for best-practices for setting up 2 different domains with cert-manager (e.g. dev.duckiehunt.com; www.duckiehunt.com)

- [AKS's HTTP application routing](https://docs.microsoft.com/en-us/azure/aks/http-application-routing) is a neat idea, but you [cannot use custom domains](https://github.com/MicrosoftDocs/azure-docs/issues/11060#issuecomment-405550781).  So you're forced to use its *.aksapps.io domain for your services.  Great idea, but not useful in real-world scenarios



To summarize, I was finally able to get [development](http://dev.duckiehunt.com) and [production](https://www.duckiehunt.com) running in two different namespaces with one ingress controller and one cert-manager.  Should have been simple, but death-by-1000-papercuts ensued with managing certs for each of them.  Now Iâ€™m wiser, but the journey was long and frustrating.  That might involve a blog post of its own.


## VSTS + Github integration

Estimated time: 4 hours.  Actual time: 2 hours

VSTS makes CI/CD easy.  Real easy.  Almost too easy.  

I lost some time (and ~8 failed builds) because the VSTS UX isnâ€™t intuitive to me and documentation is sparse.  But now that itâ€™s working, I have a fully automated Github commit -> Production release pipeline which completes within 5 minutes.  This will save me a tremendous amount of time in the future.  This is what Iâ€™m most excited about.


## Azure Monitor + Container Monitoring Solution + LogAnalytics

**Estimated time: 3 hour.  Actual time: None.  **

This was the surprising part.  All of this work was already done for me by setting up the AKS cluster and integrated into the portal.  I was impressed that this was glued together without any additional effort needed.

That said, hereâ€™s some â€œgotchasâ€:


The LogAnalytics SLA is ~6 hours.  My testing showed that new logs showed up within 5 minutes, but after a cluster is newly created, initial logs would take ~30 minutes to appear.  

- The LogAnalytics UX isnâ€™t intuitive, but the query language is extremely powerful and each of the pods logs were available by clicking through the dashboard.  

- Monitoring and Logging are two pillars of the solution; however, Alerting is missing from the documentation.  That integration is forthcoming, and will likely involve another blog entry.

- The â€œHealthâ€ tile is useful for getting an overview of your cluster; however, the â€œMetricsâ€ tile seems pretty limited.  Both are still in Preview, and I expect to see additional improvements coming soon.





## Production DNS migrated

**Estimated time: 1 hour.  Actual time: 1 hour**

Since I did the heavy lifting in the â€œSecurely expose UI + APIâ€ section, this was as easy as flipping a light switch and updating the DNS record in my registrar (dreamhost.com).  No real magic here.


## Summary


This has been a wonderful learning experience for me, because I was not just trying to showcase AKS/K8S and its potential, but also using it as it is intended to be used, thus getting my hands dirtier than normal.  Most of the underestimated time was spent on a few issues that â€œrat-holedâ€ me due to technical misunderstandings and gaps in my knowledge.  Iâ€™ve filled in many of those gaps now and hope that it saves you some time too.

If this has been valuable for you, please let me know by commenting below.  And if youâ€™re interesting in getting a [DuckieHunt](https://www.duckiehunt.com/) duck, let me know as Iâ€™d love to see more take flight!

P.S.  The source code for this project is also available [here.](https://github.com/lastcoolnameleft/duckiehunt)