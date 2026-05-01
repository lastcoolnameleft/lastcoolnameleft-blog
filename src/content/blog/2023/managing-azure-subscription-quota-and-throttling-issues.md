---
draft: false
featured: "none"
title: "Managing Azure Subscription Quota and Throttling Issues"
description: "A post by Tommy Falgout"
authors:
  - Tommy Falgout
pubDate: 2023-06-21T19:51:07.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
image:
  src: https://i.imgur.com/qEEldh5.jpeg
  alt: "Post image"
ogImage:
  src: https://i.imgur.com/qEEldh5.jpeg
---
As Azure customers and partners build bigger and more complex solutions in their subscriptions, you might hit quota and throttling issues.  These can be irksome and cause confusion.  This article will walkthrough some of the scenarios I’ve seen and how to design with them in mind.

Let’s make sure we’re on the same page regarding terminology used in this article:

- [Azure Resource Manager](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview) (ARM) - The management layer and API behind all Azure resources

- [Resource Provider](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types) (RP) - Each resource type inside Azure has a RP which allows you to manage that resource (e.g. Storage, Key Vault, VMSS, etc.)

- Quota - the maximum number of a specific resource available for your subscription.  Similar to a credit card limit

- Examples:

- [Subscription or Resource Quota](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits)

- [Max RPS for Storage account](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#standard-storage-account-limits)

- [Max size of single blob container](https://learn.microsoft.com/en-us/azure/storage/blobs/scalability-targets#scale-targets-for-blob-storage)

- [Azure Function default timeout](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-functions-limits)

- [Maximum # of VMs in a VMSS](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#virtual-machine-scale-sets-limits)

- Some quotas have [adjustable and non-adjustable quotas](https://learn.microsoft.com/en-us/azure/quotas/quotas-overview#adjustable-and-non-adjustable-quotas)

- Some adjustable quotas can be managed programmatically using the [Azure Quota Service API](https://learn.microsoft.com/en-us/rest/api/quota/)

- Throttling - maximum number of API requests you can make in a certain period.  Similar to bandwidth throttling

- NOTE: There are subscription and tenant level throttling limits.  Each [Storage](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#storage-throttling), [Networking](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#network-throttling), [Compute](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshooting-throttling-errors) and [Azure Resource Graph](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#azure-resource-graph-throttling) also have throttling limits

- NOTE: Throttling for RP’s are per subscription per region

- Examples:

- [Rate limit of writes to a subscription per hour](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#subscription-and-tenant-limits)

- [Rate limit of Deleting a VMSS in 3 min](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshooting-throttling-errors#call-rate-informational-response-headers)

## Managing Quotas

Because quotas are mostly static, [viewing your quotas is pretty simple](https://learn.microsoft.com/en-us/azure/quotas/view-quotas).  Simply to go the Azure Portal and click on “My quotas”.

If you need to increase your quota, you might need to open an Azure Support ticket.  For example, if you need to start deploying in a new region, you might need to open a ticket to increase the “Total Regional vCPUs” and “VMSS” quotas in “West Central US”.  Once the ticket has been approved, the quota will be available to you.

## Managing Throttling

For the most part, you won’t need to worry about throttling, but if you’re doing very large scale deployments with LOTS of constant churning of resources, you might hit throttling limits.

These limits are less about the number of resources, but **HOW** you use the resources.  For example:

- You can have [5000 AKS cluster in one subscription](https://learn.microsoft.com/en-us/azure/aks/quotas-skus-regions#service-quotas-and-limits), each AKS cluster can have a maximum of 100 node pools.  If you try creating the max # of AKS clusters with the max # of node pools simultaneously, then you’ll definitely hit the throttling limit.

- Some OSS projects aggressively call ARM and the RP API’s in a reconciliation loop.  Multiple instances of these projects will also hit the throttling limit.

Since throttling is specific to the current time window, it can be trickier.  There’s no “hard formula” for when you’ll hit a threshold.  But when you do, [you’ll probably start seeing 429 HTTP status responses](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#error-code).

## Throttling Examples

Thankfully, you can get insights into your current throttling status by looking at response headers for the requests.

- `x-ms-ratelimit-remaining-subscription-reads` - # of read operations to this subscription remaining

- `x-ms-ratelimit-remaining-subscription-writes` - # of writes operations to this subscription remaining

- `x-ms-ratelimit-remaining-resource` - Compute RP specific header, which could show multiple policy statuses.  (see “Read Request for GETting a VMSS” below for details)

Let’s dig into this deeper using the Azure CLI.

### Example: Create a Resource Group (Write Request)

Because this request creates a RG, it will count against our subscription writes:

```markdown
?  az group create -n $RG --location $LOCATION --verbose --debug --debug 2>&1 | grep 'x-ms'

DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-client-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-ratelimit-remaining-subscription-writes': '1199'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-correlation-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-routing-request-id': 'SOUTHCENTRALUS:20230512T163152Z:<guid>'
```

**NOTE**: The key point is how the `x-ms-ratelimit-remaining-subscription-writes` is now 1199 (instead of the standard 1200 per hour as per the [Subscription and Tenant limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#retrieving-the-header-values))

### Example: GET a VMSS (Read Request)

This request performs a GET (read) request on an existing VMSS.  This is similar to the write request for the RG, but since Compute RP also has a separate set of throttling policies, it also counts against the Compute RP limits.

`markdown
?  az vmss show -n $VMSS_NAME -g $RG --debug 2>&1 | grep x-ms
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-client-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-ratelimit-remaining-resource': 'Microsoft.Compute/GetVMScaleSet3Min;197,Microsoft.Compute/GetVMScaleSet30Min;1297'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-ratelimit-remaining-subscription-reads': '11999'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-correlation-request-id': '<guid>'
DEBUG: cli.azure.cli.core.sdk.policies:     'x-ms-routing-request-id': 'SOUTHCENTRALUS:20230512T162738Z:<guid>'`

NOTE: The key point is how `x-ms-ratelimit-remaining-resource` has two key-value pairs:

- Microsoft.Compute/GetVMScaleSet3Min;197 - I ran this command before, so I have 197 requests available in the 3 minute window for performing GET requests on the VMSS resource

- Microsoft.Compute/GetVMScaleSet30Min;1297 - I now have 1297 requests available in the 30 minute window for performing GET requests on VMSS resources

NOTE: `x-ms-ratelimit-remaining-subscription-reads` doesn’t seem to decrease (11999).  Even if I run the same command again.  I haven’t figured that out yet.

## Designing with quotas and throttling in mind

Most Azure deployments won’t need this type of fine tuning, but just in case, there’s some [documented Throttling Best Practices](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshooting-throttling-errors#best-practices) as well as my personal pro-tips:

- Use the Azure SDK, as many services have the [recommended retry guidance built-in](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#error-code)

- Instead of creating and deleting VMSS (which consume multiple VMSS API requests), scale the VMSS to 0 (which only consumes 1 VMSS API request)

- Any type of Kubernetes cluster auto-scaler will perform a reconciliation loop with Azure Compute RP.  This could eat into your throttling limits

- Use the [Azure Quota Service API](https://learn.microsoft.com/en-us/rest/api/quota/) to programmatically request quota increases

If you’re unable to workaround the throttling limits, then the next step is to look at the [Deployment Stamp pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp) using multiple subscriptions.  You can programmatically create subscriptions using [Subscription vending](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending).

Hopefully this article has helped you understand quotas limits and throttling limits in Azure, and how to work around them.  Let me know if you have any additional questions and/or feedback and I can follow-up with additional details.