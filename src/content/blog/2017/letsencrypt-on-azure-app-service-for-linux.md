---
draft: false
featured: "none"
title: "LetsEncrypt on Azure App Service for Linux"
description: "Azure App Service for Linux is a pretty neat offering from Azure. You get all of the DevOps features you want (A/B Testing, Hosted Application, Tiered…"
authors:
  - Tommy Falgout
pubDate: 2017-08-14T16:21:33.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
---
[Azure App Service for Linux](https://docs.microsoft.com/en-us/azure/app-service/app-service-value-prop-what-is) is a pretty neat offering from Azure.  You get all of the DevOps features you want (A/B Testing, Hosted Application, Tiered Support, Button-click scaling, lots of templates and more!) without the headache of managing VM's.

9 years ago, I wrote a quacky little website called "[Duckiehunt](https://duckiehunt.com/)".  Unfortunately, I didn't pay the tech debt and things kept breaking until it was abandoned.  I'm now using [Duckiehunt](https://duckiehunt.com/) as a learning ground for Azure's services and alternatives.

Azure App Service for Linux was the perfect fit.  However, back in 2008 SSL wasn't as ubiquitous.  Now, it's a badge of shame to NOT have it.  Azure does offer an [App Service Certificate](https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-purchase-ssl-web-site), but I'd like to find a cheaper/more open solution.  

Enter [Let'sEncrypt](https://letsencrypt.org/) from [Mozilla](https://www.mozilla.org/en-US/) and the [EFF](https://www.eff.org/).  If you don't know, [EFF](https://www.eff.org/) are the unsung heroes of the internet.  They fight tirelessly to support your freedom and rights on the internet.  [Mozilla](https://www.mozilla.org/en-US/) and [EFF](https://www.eff.org/) offer [Let'sEncrypt](https://letsencrypt.org/) as a free way to encrypt websites via CertBot.  Now I'll dig into the technical details behind encrypting an App Service for Linux with [Let'sEncrypt](https://letsencrypt.org/).

**Step #1: Get [CertBot](https://certbot.eff.org/)**
Because I'm on OSX, I was able to run: `brew install certbot`.  For the full range of options, [CertBot's](https://certbot.eff.org/) webpage has what you need.

**Step #2: Create Cert locally**

Before CertBot can create the certificate for you, it must first validate you own the domain.  It will prompt you for a few questions, and then ask you to create a file on the webhost and add content to that file for validation.

Thankfully, Azure App Service for Linux provides a terminal access to your container so you can make these modifications yourself.

> âžœ sudo certbot certonly -d duckiehunt.com --manual
> ...
> Create a file containing just this data:
> 
> %RANDOM STRING 1%
> 
> And make it available on your web server at this URL:
> 
> http://duckiehunt.com/.well-known/acme-challenge/%RANDOM STRING 2%
> 
> -------------------------------------------------------------------------------
> Press Enter to Continue

**Step #3: Add the validation file to you website**

I then went to the Kudu instance of my [App Service](https://example.scm.azurewebsites.net) and ran:
> âžœ mkdir /var/www/html/.well-known/acme-challenge/
> âžœ echo "%RANDOM STRING 2%" > %RANDOM STRING 1%

At this point, the validation is in place and it's time to continue with Chatbot by pressing "Enter".

> Waiting for verification...
> Cleaning up challenges
> 
> IMPORTANT NOTES:
>  - Congratulations! Your certificate and chain have been saved at:
>    /etc/letsencrypt/live/duckiehunt.com/fullchain.pem
>    Your key file has been saved at:
>    /etc/letsencrypt/live/duckiehunt.com/privkey.pem
>    Your cert will expire on 2017-11-12. To obtain a new or tweaked
>    version of this certificate in the future, simply run certbot
>    again. To non-interactively renew *all* of your certificates, run
>    "certbot renew"
>  - If you like Certbot, please consider supporting our work by:
> 
>    Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
>    Donating to EFF:                    https://eff.org/donate-le

Huzzah!  I've now got a certificate.  Time to upload.

**Step #4: Upload the certificate to Azure**
Azure has a pretty [descriptive set of steps for associating a certificate to your App Service](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-tutorial-custom-ssl#enforce-https-for-web-apps-on-linux), which I was able to follow.

Openssl will ask for a Password which you need to keep as you upload the cert to Azure.

> âžœ cd /etc/letsencrypt/live/duckiehunt.com
> âžœ openssl pkcs12 -export -out myserver.pfx -inkey privkey.pem -in fullchain.pem
> Enter Export Password:
> Verifying - Enter Export Password:
> âžœ cp myserver.pfx ~/Desktop

**Step #5: Bind the certificate to your App Service**

From here on you're ready to Bind your SSL Certificate to your App Service.  I'll let Microsoft's documentation lead the way from here.
[https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-tutorial-custom-ssl#bind-your-ssl-certificate](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-tutorial-custom-ssl#bind-your-ssl-certificate)
**Step #6: Bask in doing your part to secure the internet.**

In summary, the process was pretty painless.


I used Let'sEncrypt to create a new Certificate for my App Service for Linux by creating a file that Let'sEncrypt could use to validate I owned the site.
I then encrypted that certificate to upload to Azure. 
Once it was uploaded, I bound that certificate to my domain and voila!  [A more secure Duckiehunt](https://duckiehunt.com)



One bummer is that the certificate is intended to expire in 3 months instead of the industry standard of 12 months.  The renewal process looks pretty easy, but that's a different blog post.

--Tommy feels that he's done his part in making the world a bit safer.