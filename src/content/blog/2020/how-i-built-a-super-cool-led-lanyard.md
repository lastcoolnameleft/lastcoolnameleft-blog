---
draft: false
featured: "3"
title: "How I built a super cool LED Lanyard"
description: "I scoffed when I heard wearable technology was an upcoming \"big thing\" for fashion. However, since basking in the warm glowing, warming glow of my first…"
authors:
  - Tommy Falgout
pubDate: 2020-02-26T21:41:56.000Z
license: cc-by-nc-sa-4-0
tags:
  - project
  - engineering
  - projects
  - travel
image:
  src: /images/2020/gphoto-e53c3bf086.jpg
  alt: "LED Lanyard"
ogImage:
  src: /images/2020/gphoto-e53c3bf086.jpg
---
I scoffed when I heard wearable technology was an upcoming "big thing" for fashion.  However, since basking in the [warm glowing, warming glow](https://getyarn.io/yarn-clip/b6b7252f-fd5a-4696-85d5-0fc070130f0a) of my first LED on an Arduino, I was hooked.

When my buddy, Dan Stach, started showcasing his breakthroughs in  lanyard technology, I knew he was onto something.  And I knew I wanted to turn it to 11.
> 
I got tired of boring lanyards, so I made my own. [pic.twitter.com/LPd8Roi6rd](https://t.co/LPd8Roi6rd)

> â€” Tommy Falgout (@lastcoolname) [June 5, 2019](https://twitter.com/lastcoolname/status/1136092293801418753?ref_src=twsrc%5Etfw)

We iterated over and over until we streamlined the design to be portable enough to fit behind the badge.  After rigorous field-testing (i.e.: lot of tech conferences), the design now fits in a small travel case and can be assembled in minutes.

If you are interested in building your own, you should know a few things about the build and procurement process:

## Straps

We tried a few different straps and the black one from Strapworks looks the coolest.  The white strap looks ok, but the black one makes the design look very 8-bit.

[![](/images/2020/gphoto-e53c3bf086.jpg)](https://photos.google.com/share/AF1QipNFBzpdAFa8yUa6srpBYJPTZ8tIj906KW4jv1yAXMKOsVVLA48pw0JmcYr3lAl4nw?key=b3dEcEt2T0JacmtZRHBDbGt5eXZCQTFMVi1XQWZn&source=ctrlq.org)

## Controller case

This has the most potential for customization and fun.  My original case was custom co-designed with the owner of [Bricks and Minifigs, Dallas](https://www.facebook.com/BAMNorthDallas/) (a used LEGO retailer).  I've streamlined this to use LEGO + tack to make the box smaller.

For a while I considered selling LED lanyards, and planned to use a 4"x6" craft case, but was unsatisfied with the results.  Every option has felt too bulky or awkward for my taste while LEGO hits that perfect intersection of cool, functional and modular.

[![](/images/2020/gphoto-940744de81.jpg)](https://photos.google.com/share/AF1QipMh-p1sKEXyAW8cEjupCIANKgseuM6T3JQocifWR7-kjpQaVT1QbX3MpKkbDoA90Q?key=WEIzdnJxZ3pfalNyV3RsZGR0NVNQWlFRMTZHU2Rn&source=ctrlq.org)

## LED Controller

The controller is what you use to turn the LED on & off as well as display patterns.  The cheapest/easiest is to purchase an RF LED controller because it just works and comes with a remote for ~$11.

[![](/images/2020/gphoto-ddc8464648.jpg)](https://photos.google.com/share/AF1QipMFyYrxHmABA92VT4fpWjf-Y1i2wmAu-1mpgyKqd7DgtFdoW9LUPYCShY818Ux3uw?key=MmRuU0xJN283aTF6M2JuUHQxZjV6TnZRT09xbkNR&source=ctrlq.org)

I really wanted to go [take it to the next level](https://twitter.com/stuartatmsft/status/1153852717976018944) so I used a [RaspberryPi Zero W](https://www.raspberrypi.org/blog/raspberry-pi-zero/) for extra customization.  This presented NUMEROUS challenges which is deserving of a [separate post](https://github.com/lastcoolnameleft/led-lanyard/blob/master/docs/raspberrypi.md).  If you are interested in pursuing this, contact me to discuss.
> 
Canâ€™t believe the nerd quotient of my good friend Tommy â€” [@lastcoolname](https://twitter.com/lastcoolname?ref_src=twsrc%5Etfw). Ever heard of a lanyard that you could SSH into or that changes colors using bot framework? Yeah, me neither. Until now. Wow. [#iot](https://twitter.com/hashtag/iot?src=hash&ref_src=twsrc%5Etfw) [#RaspberryPi](https://twitter.com/hashtag/RaspberryPi?src=hash&ref_src=twsrc%5Etfw) [@OpenAtMicrosoft](https://twitter.com/OpenAtMicrosoft?ref_src=twsrc%5Etfw) [pic.twitter.com/5qfnyzzLWm](https://t.co/5qfnyzzLWm)

> â€” Stuart R. Kirk - Microsoft ðŸ§ (@stuartatmsft) [July 24, 2019](https://twitter.com/stuartatmsft/status/1153852717976018944?ref_src=twsrc%5Etfw)

## LED strip

There are many LED options, but the ones we wanted were [WS2812B](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf), which used RGB LED, could be individually addressed, and would easily talk with our LED controller.  We also liked the 144 pixels per meter which gave it a nice density.  We also liked [IP30](http://www.dsmt.com/resources/ip-rating-chart/) which mean it had no plastic coating on top.  This made it more likely to break, but more flexible and would dissipate the heat better.

[![](/images/2020/gphoto-9ad8058832.jpg)](https://photos.google.com/share/AF1QipNHDW6jiC1iEDE0Do06Iw_I4-cDJyGWUh7NXZuRG6kJ7g7oaxVtrx4OOtEt-D9KZQ?key=RUVMcWF5Wm1GZjUxQ3ZhdUtoUHk2eUVzSzJ4UFlR&source=ctrlq.org)

## Battery

Come to find out, managing electricity is hard.  We lost many hours debugging why the LED would power off when changing patterns.  Cheap wires were the culprit as the controller couldn't pull enough current for some configurations (e.g. all white LED).  A credit-card battery worked best because of the bendable power cord which was useful in the tight space of the controller box and minimized our wire problems.

## Summary

If by the end of this post, you're still interested in making your own, you're in luck!  I created [a parts list](https://github.com/lastcoolnameleft/led-lanyard/blob/master/docs/parts.md) and [assembly instructions](https://github.com/lastcoolnameleft/led-lanyard/blob/master/docs/assembly.md).
Please let me know how it goes (share your pics!) and if there's anything I can do to [improve the experience](https://github.com/lastcoolnameleft/led-lanyard/issues).

-- Tommy wants to be the light of your life.  Well, at least your lanyard.