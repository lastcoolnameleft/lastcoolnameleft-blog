---
draft: false
featured: "none"
title: "How to SSH into an AKS agent node"
description: "WARNING: SSH'ing into an agent node is an anti-pattern and should be avoided. However, we don't live in an ideal world, and sometimes we have to do the…"
authors:
  - Tommy Falgout
pubDate: 2018-05-31T16:38:01.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
---
**WARNING:  SSH'ing into an agent node is an [anti-pattern](https://en.wikipedia.org/wiki/Anti-pattern) and should be avoided.  However, we don't live in an ideal world, and sometimes we have to do the needful.**


## Overview


This walkthrough creates an SSH Server running as a Pod in your Kubernetes cluster and uses it as a jumpbox to the agent nodes.  It is designed for users managing a Kubernetes cluster who cannot readily SSH to into their agent nodes (e.g. [AKS](https://docs.microsoft.com/en-us/azure/aks/)) does not publicly expose the agent nodes for security considerations).

This is one of the steps in the [Kubernetes Workshop](https://github.com/lastcoolnameleft/kubernetes-workshop/blob/master/ssh-to-host.md) I have built when working with our partners.


## NOTE

It has been tested in AKS cluster; however, it should also work in other cloud providers.

You can follow the steps on the [SSH to AKS Cluster Nodes](https://docs.microsoft.com/en-us/azure/aks/aks-ssh) walkthrough; however, that requires you to upload your Private SSH key which I would rather avoid.


## Assumptions


* [The SSH Public key has been installed for your user on the Agent host](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/vmaccess#update-ssh-key)
* [You have jq installed](https://stedolan.github.io/jq/stalled) Not vital, but makes the last step easier to understand.


## Install an SSH Server


If you're paranoid, you can generate your own SSH server container; however, (https://github.com/corbinu/ssh-server) has some pretty good security defaults and is available on Docker Hub.

`kubectl run ssh-server --image=corbinu/ssh-server --port=22 --restart=Never`


## Setup port forward


Instead of exposing a service with an IP+Port, we'll take the easy way and use kubectl to port-forward to your localhost.

**NOTE: Run this in a separate window since it will need to be running for as long as you want the SSH connection**

`kubectl port-forward ssh-server 2222:22`


## Inject your Public SSH key


Since we're using the ssh-server as a jumphost, we need to inject our SSH key into the SSH Server.  Using root for simplicity's sake, but I recommend a more secure approach going forward. (TODO:  Change this to use a non-privileged user.)

`cat ~/.ssh/id_rsa.pub | kubectl exec -i ssh-server -- /bin/bash -c "cat >> /root/.ssh/authorized_keys"`


## SSH to the proxied port


Using the SSH Server as a jumphost (via port-forward proxy), ssh into the IP address of the desired host.

`# Get the list of Host + IP's
kubectl get nodes -o json | jq '.items[].status.addresses[].address'
# $USER = Username on the agent host
# $IP = IP of the agent host
ssh -J root@127.0.0.1:2222 $USER@$IP`

**NOTE: If you get "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!" You might need to add `-o StrictHostKeyChecking=no` to the SSH command if you bounce across clusters.  This is because SSH believes that the identity of the host has changed and you need to either remove that entry from your `~/.ssh/known_hosts` or tell it to ignore the host identity.**


## Cleanup




	- `kubectl delete pod ssh-server`

- Kill the `kubectl port-forward` command