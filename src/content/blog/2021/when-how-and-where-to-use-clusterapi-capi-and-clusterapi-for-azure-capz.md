---
draft: false
featured: "none"
title: "When, How and Where to use ClusterAPI (CAPI) and ClusterAPI for Azure (CAPZ)"
description: "A post by Tommy Falgout"
authors:
  - Tommy Falgout
pubDate: 2021-08-16T23:20:07.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
image:
  src: https://i.imgur.com/qEEldh5.jpeg
  alt: "Post image"
ogImage:
  src: https://i.imgur.com/qEEldh5.jpeg
---
This article explains why, when, and how to use self-managed Kubernetes clusters in Azure for testing custom scenarios.

Kubernetes has gotten so large and complex that most companies prefer to use the managed service (e.g. AKS, GKE) instead of running it themselves.  By using a managed Kubernetes service, this frees up the operations team to focus on their core competency instead of optimizing, backing up and upgrading of Kubernetes.

While this reduces the operational burden, you lose the ability to modify the platform.  Sometimes these are acceptable tradeoffs, sometimes you need to manage it yourself.

Historically, AKS-engine was the OSS tool for creating unmanaged Kubernetes clusters on Azure, but it had some limitations.  [CAPI/CAPZ is the go-forward solution](https://cloudblogs.microsoft.com/opensource/2020/12/15/introducing-cluster-api-provider-azure-capz-kubernetes-cluster-management/) for creating and operating self-managed clusters declaratively.

I highly recommend reading Scott Lowe's article on [An introduction to CAPI](https://blog.scottlowe.org/2019/08/26/an-introduction-to-kubernetes-cluster-api).  It covers a lot of terminology and concepts used here.

One of the reasons for using CAPI/CAPZ is as a testing and development tool for Kubernetes on Azure. For example, you might need to build and test the following scenarios:

    - A kernel change to the worker nodes

    - A modification to the K8S config on control plane nodes

    - An installation of a different CNI

    - The use of K8S to manage K8S

This diagram represents a high level architecture of a starter CAPI/CAPZ cluster.

![](https://raw.githubusercontent.com/lastcoolnameleft/kubernetes-examples/master/capi-capz/architecture.png)

The rest of this article will explain how to implement the above scenarios utilizing the [CAPI quickstart](https://cluster-api.sigs.k8s.io/user/quick-start.html).  Because the command arguments will change over time, this article will describe the steps and provide a link to the full details like this:

[Link to CAPI Quick Start with details](https://cluster-api.sigs.k8s.io/user/quick-start.html#generating-the-cluster-configuration): `base command to run`

## Create the KIND Cluster

Similar to [RepRap](https://en.wikipedia.org/wiki/RepRap_project), CAPI uses a Kubernetes cluster to make more Kubernetes clusters.  The easiest way is with [Kuberenetes IN Docker (KIND)](https://kind.sigs.k8s.io/).  As the name implies, it's a Kubernetes cluster which runs as a Docker container.  This is our starting point for what we call "Bootstrap Cluster".

[Create Kind Cluster](https://cluster-api.sigs.k8s.io/user/quick-start.html#install-andor-configure-a-kubernetes-cluster): `kind create cluster`

## Initialize cluster for Azure

We will use this bootstrap cluster to initialize the "Management Cluster" which contains all of the CRDs and runs the CAPI controllers.  This is where we will apply all of our changes to meet our scenarios.

[Initialize cluster for Azure](https://cluster-api.sigs.k8s.io/user/quick-start.html#initialization-for-common-providers): `clusterctl init --infrastructure azure`

## Generate cluster configuration

Now that our management cluster is ready, we want to define what our workload cluster will look like.  Thankfully, there are different flavors we can pick from.  By using the default, we will get an unmanaged K8S cluster using virtual machines.

[Generate cluster configuration](https://cluster-api.sigs.k8s.io/user/quick-start.html#generating-the-cluster-configuration): `clusterctl generate cluster capi-quickstart > capi-quickstart.yaml`

We now have a file which contains the CRDs which will define our workload cluster.  We will modify `capi-quickstart.yaml` and edit the CRDs to implement each of our scenarios.

Full documentation is available for [CAPI (baseline) CRDs ](https://doc.crds.dev/github.com/kubernetes-sigs/cluster-api) and [CAPZ (Azure specific resources) CRDs](https://doc.crds.dev/github.com/kubernetes-sigs/cluster-api-provider-azure).

## Scenario: Worker node kernel change

If we want to modify the worker nodes, we likely want to add a `preKubeadmCommands` and `postKubeadmCommands` directive in the `KubeadmConfigTemplate`.

`preKubeadmCommands` allows a list of commands to run on the worker node BEFORE joining the cluster.

`postKubeadmCommands` allows a list of commands to run on the worker node AFTER joining the cluster.

```
apiVersion: bootstrap.cluster.x-k8s.io/v1alpha4
kind: KubeadmConfigTemplate
metadata:
  name: capi-quickstart-md-0
  namespace: default
spec:
  template:
    spec:
      preKubeadmCommands:
        - wget -P /tmp https://kernel.ubuntu.com/<path>.deb
        - dpkg -i /tmp/<package name>.deb
      postKubeadmCommands:
        - reboot

```

After you've made these changes, you can proceed to the rest of the steps by applying the resources to your management cluster which will then create your workload cluster and deploy the CNI.

## Scenario: Modify Kubernetes components

If we want to modify the control plane, we can make changes to the `KubeadmControlPlane`. This allows us to leverage the [kubeadm API](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/control-plane-flags/) to customize various components.

For example, to enable a Feature Gate on the kube-apiserver:

```
apiVersion: controlplane.cluster.x-k8s.io/v1alpha4
kind: KubeadmControlPlane
metadata:
  name: capi-quickstart-control-plane
  namespace: default
spec:
  kubeadmConfigSpec:
    clusterConfiguration:
      apiServer:
        extraArgs:
          feature-gates: MyFeatureGate=true

```

The above example omits some fields for brevity. Make sure that you keep any existing args and configurations that you are not modifying in-place.

After you've made these changes, you can proceed to the rest of the steps by applying the resources to your management cluster which will then create your workload cluster and deploy the CNI.

## Apply the Workload Cluster

Now that we have defined what our cluster should look like, apply the resources to the management cluster.  The CAPZ operator will detect the updated resources and talk to Azure Resource Manager.

[Apply the workload cluster](https://cluster-api.sigs.k8s.io/user/quick-start.html#apply-the-workload-cluster) `kubectl apply -f capi-quickstart.yaml`

## Monitor the Cluster Creation

After you've made the changes to the `capi-quickstart.yaml` resources and applied them, you're ready to watch the cluster come up.

[Watch the cluster creation](https://cluster-api.sigs.k8s.io/user/quick-start.html#accessing-the-workload-cluster):

    - `kubectl get cluster`

    - `clusterctl describe cluster capi-quickstart`

    - `kubectl get kubeadmcontrolplane` - Verify the Control Plane is up

Now that the workload cluster is up and running, it's time to start using it!

## Get the Kubeconfig for the Workload Cluster

Now that we're dealing with two clusters (management cluster in Docker and workload cluster in Azure), we now have two kubeconfig files.  For ease, we will save it to the local directory.

[Get the Kubeconfig for the workload cluster](https://cluster-api.sigs.k8s.io/user/quick-start.html#accessing-the-workload-cluster) `clusterctl get kubeconfig capi-quickstart > capi-quickstart.kubeconfig`

## Install the CNI

By default, the workload cluster will not have a CNI and one must be installed.

[Deploy the CNI](https://cluster-api.sigs.k8s.io/user/quick-start.html#deploy-a-cni-solution) `kubectl --kubeconfig=./capi-quickstart.kubeconfig apply -f https://...calico.yaml`

## Scenario: Install a different CNI

If you want to use flannel as your CNI, then you can apply the resources to your management cluster which will then create your workload cluster.

However, instead of [Deploying the CNI](https://cluster-api.sigs.k8s.io/user/quick-start.html#deploy-a-cni-solution), you can follow the steps in the [Install Flannel](https://capz.sigs.k8s.io/topics/flannel.html) walkthrough.

## Cleanup

When you're done, you can cleanup both the workload and management cluster easily.

[Delete the workload cluster](https://cluster-api.sigs.k8s.io/user/quick-start.html#clean-up) `kubectl delete cluster capi-quickstart`

If you want to create the workload cluster again, you can do so by re-applying `capi-quickstart.yaml`

[Delete the management cluster](https://cluster-api.sigs.k8s.io/user/quick-start.html#clean-up) `kind delete cluster`

If you want to create the management cluster again, you must start from scratch.  If you delete the management cluster without deleting the workload cluster, then the workload cluster and Azure resources will remain.

## Summary

Similar to how Kubernetes allows you to orchestrate containers using a declarative syntax, CAPI/CAPZ allows you to do the same, but for Kubernetes clusters in Azure.

This article covered example scenarios for when to use CAPI/CAPZ as well as a walkthrough on how to implement them.

I'm especially excited for the future of CAPI/CAPZ and how it can integrate with other Cloud Native methodologies like GitOps to declaratively manage clusters.

P.S.  I am extremely grateful to Cecile Robert Michon's ([Twitter](https://twitter.com/cecilerobertm) & [Github](https://github.com/CecileRobertMichon)) technical guidance for this article.  Without her support, I wouldn't have gotten this far and definitely would have missed a few key scenarios.  Thanks Cecile!