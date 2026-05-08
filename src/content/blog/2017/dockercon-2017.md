---
draft: false
featured: "none"
title: "DockerCon 2017"
description: "After hearing about it for years, I was fortunate enough to attend DockerCon this time around. Since joining Microsoft as a Open Source Technical…"
authors:
  - Tommy Falgout
pubDate: 2017-04-20T19:41:07.000Z
license: cc-by-nc-sa-4-0
tags:
  - engineering
  - containers
  - events
---
After hearing about it for years, I was fortunate enough to attend [DockerCon](http://2017.dockercon.com/) this time around.  Since joining Microsoft as a Open Source Technical Evangelist, 80% of my job is either learning or teaching.  This was my first OSS conference since joining Microsoft, and I was eager to share with others my experiences.

I was even more excited to find out that a [Drew Erny](https://twitter.com/dperny) (my Godmother's grandson) was not only attending, but presenting!  It was also a change for me to hobnob with some of the Docker elite and some of the other Microsoft movers and shakers.

I've captured all of my [conference notes here](https://github.com/lastcoolnameleft/Conference-Notes/tree/master/DockerCon-2017), but below is my overview of the event and[ here's some pictures](https://www.flickr.com/photos/snoopykiss/tags/dockercon2017):

Announcements:


  - [Running Linux Containers native on Windows](https://blogs.technet.microsoft.com/hybridcloud/2017/04/18/dockercon-2017-powering-new-linux-innovations-with-hyper-v-isolation-and-windows-server/) - This demo had a hiccup, but shows some interesting potential

	- Docker Multi-Stage Build - TL;DR - Specify multiple FROM's separate build env from deploy artifact.  [For more details](https://ordina-jworks.github.io/conference/2017/04/18/DockerCon-Multi-Stage-Builds-And-More.html)

	- [MobyProject](https://blog.docker.com/2017/04/introducing-the-moby-project/) - Open Source project to help developers create their own Docker-like container platform.  This one was unclear at first, until I read a few more articles on it.

  - [LinuxKit](https://github.com/linuxkit/linuxkit) - A toolkit for building secure, portable and lean operating systems for containers was open sourced live on stage!




Keynote:


- Topics ranged from enterprise deployments to enterprise scaling to enterprise security and "how to convince your enterprise boss" and "Docker Enterprise.  Look at how Enterprisey we are and how Dockery other enterprises are".

-   Day 1's keynote felt more developer centric, and Day 2's felt more enterprise centric.  Afterwards, I also noticed the undertone of "Look how Enterprise Docker is" in not just the keynotes, but many of the presentations.  Docker is definitely positioning itself to be more respected in the Enterprise world.  I get it and completely understand it, but the message was tilted every so slightly towards that slant.
NOTE:  There used to be rumors of Microsoft buying Docker.  If Microsoft had, and then Docker made the same Enterprise slant, there would be a HUGE backlash.  Docker has worked hard to be beloved and it shows.





[![Untitled](/images/2017/34128110416_00f99d6c7e_k.jpg)](https://www.flickr.com/photos/snoopykiss/34128110416/in/photolist-TPsK2b-TRPuQa-TPsJz9-SLWnhb-TPsJs5-TRPukc-TPsJ9E-SLWmG3-TPsHUS-U4nCN8-SLWkZS-TPsGPq-TZMudQ)

Pre-event Organization:


- Since I registered late, I missed a number of the critical emails including an FYI to RSVP to a party that was waitlisted by the time I discovered it.  Thankfully, by then I had found my own crew to dine and drink with.

- The DockerCon app was helpful for detailing the tracks and available sessions and adding them to the DockerCon app's calendar.  Would be helpful if it exported to a personal calendar for reminders as I got caught up in the Expo hall many times.




Event Organization:


- As a coordinator of 1000+ people events, I understand exactly how difficult this is.  Your best hope is that no one really notices the blood, sweat and tears that go into setting it up.  And it's now that everything is done that I appreciate how good of a job they did.

- The was more than adequate signage and information for what is happening and where.

- This is the first convention I've been to that included a swing set, which was awesome.  Lots of break-out areas, separated by pallets and bean-bag private spaces.



[![Untitled](/images/2017/34011284382_2190074ae5_k.jpg)](https://www.flickr.com/photos/snoopykiss/34011284382/in/photolist-TPsK2b-TRPuQa-TPsJz9-SLWnhb-TPsJs5-TRPukc-TPsJ9E-SLWmG3-TPsHUS-U4nCN8-SLWkZS-TPsGPq-TZMudQ)


Ecosystem Expo:


- Microsoft and IBM were the platinum sponsors and it showed as they were the first two you saw when walking in. Outside of that, there were plenty of vendors eager to talk and lots of great swag.  Drones were the most popular prize, but sadly the luck of the Coonass wasn't with me.

- Lots of great vendors.  I got to pick the brains of talented teams at AWS, Rancher, Yippie.io, Redhat, Docker, Aqua, RedisLabs, 1&1, Citrix, Cloud Native Compute Foundation,  Oracle (yes, that Oracle. They provide Oracle server on containers now!)






Presentations:
Lots of great presentations and speakers.


- "Creating Effective Images" was the top rated and thankfully repeated since I missed it the first time.  I highly recommend watching when it becomes available online.

- Docker Swarm Deep Dive - Drew Erny did a great job of headlining this talk with demos from some of his compatriots.  I saw how Docker bakes security into everything they do which will make all of our lives easier.  I have been focused on Kubernetes, but the new announcements for Docker Swarm have gotten me really excited, especially how they handle Secrets and image security, software supply chain lifecycle and desktop deployments.





Here's some great quotes I overheard:


- "I only use microservices to effectively hide the root cause of any problem I create"

- "Whatever layer you're at, the layer below you is just magic"

- "To quote WuTang: Cache rules everything around me."

- "Bro, do you even Load Balance?"

- "Complaint Driven Development"

- "According to metrics, you don't have metrics"

- [This love poem](https://twitter.com/lastcoolname/status/854710347273469952)




[![Untitled](/images/2017/34011286602_8b4cb27c98_k.jpg)](https://www.flickr.com/photos/snoopykiss/34011286602/in/photolist-TPsK2b-TRPuQa-TPsJz9-TRPukc-SLWnhb-TPsJs5-TPsJ9E-SLWmG3-TPsHUS-U4nCN8-SLWkZS-TPsGPq-TZMudQ)

Prior to DockerCon, I really hoped to attend and meet a few more Microsoft'ers and some Docker'ers(?) but got swept up into the community and the common goal it has for deploying software better, faster, stronger.  I can't wait till next year.

https://www.flickr.com/photos/snoopykiss/34011280702/in/photolist-TPsK2b-TRPuQa-TPsJz9-SLWnhb-TPsJs5-TRPukc-TPsJ9E-SLWmG3-TPsHUS-U4nCN8-SLWkZS-TPsGPq-TZMudQ

P.S.  If you are interested in toying around with Docker, check out: http://training.play-with-docker.com/ It's a great walkthrough without the need to install anything (browser based development!)