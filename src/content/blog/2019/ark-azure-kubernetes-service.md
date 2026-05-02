---
draft: false
featured: "none"
title: "Ark + Azure Kubernetes Service"
description: "As much as Cloud Providers tout their availability and uptime, disasters happen. It's inevitable. And it's usually up to you to be prepared. There are…"
authors:
  - Tommy Falgout
pubDate: 2019-01-11T21:41:31.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
---
As much as Cloud Providers tout their availability and uptime, disasters happen.  It's inevitable. And it's usually up to you to be prepared.  There are services that can help; however, they're not always "Kubernetes aware".

Thankfully, the great folks at [Heptio](https://heptio.com/) open-sourced [Ark](https://github.com/heptio/ark), a Disaster Recovery tool which works for all the major cloud providers.

I got hands-on with Ark and followed their Azure steps.  It was a good start, but didn't highlight how an actual failover and recovery would look to the operator.  I took their steps and created a step-by-step guide to perform a full migration.

Ark support Azure native resources, namely Managed Disk + Snapshots.
You can review those steps here: [https://github.com/heptio/ark/blob/master/docs/azure-config.md](https://github.com/heptio/ark/blob/master/docs/azure-config.md)

Another option would be to use [Restic](https://restic.net/), which performs backups to a local file system.  Later, I'll detail the steps on how to use Restic with Azure.

If you're looking for Best Practices on supporting Business Continuity and Disaster Recovery for AKS/K8S clusters in Azure, you're in luck!  I wrote a Microsoft article covering this use case, which can be found here:
https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region