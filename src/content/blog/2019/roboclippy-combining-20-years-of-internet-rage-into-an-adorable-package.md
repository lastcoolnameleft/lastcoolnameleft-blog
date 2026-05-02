---
draft: false
featured: "none"
title: "RoboClippy - Combining 20 years of Internet rage into an adorable package."
description: "The internetâ€™s a weird place. We already knew that, yet it keeps finding new ways to amaze me. Someone thought it would be a novel idea to incorporate…"
authors:
  - Tommy Falgout
pubDate: 2019-04-04T20:34:34.000Z
license: cc-by-nc-sa-4-0
tags:
  - life
  - project
image:
  src: /images/2019/gphoto-e4fb4ed657.jpg
  alt: "RoboClippy"
ogImage:
  src: /images/2019/gphoto-e4fb4ed657.jpg
---
The internetâ€™s a weird place. We already knew that, yet it keeps finding new ways to amaze me.

Someone thought it would be a novel idea to incorporate Alexa with a novelty electronic fish ([Big Mouth Billy Bass](https://en.wikipedia.org/wiki/Big_Mouth_Billy_Bass)).  Now you can [ask a fish for the current weather](https://www.youtube.com/watch?v=aW5TvT1mo9k) and the fish can tell you if itâ€™s a good day to catch its brethren.

I take that back.  The world is a weird place.  And I embrace it and want to leave my mark on it.

So, when given an opportunity to build something similar, a robotic version of [Clippy](https://en.wikipedia.org/wiki/Office_Assistant) was the only natural solution.  People have [re-fallen in love with Clippy](https://microsoftteams.uservoice.com/forums/555103-public/suggestions/37169866-bring-back-the-clippy-sticker-messaging-pack).
> 
Ya girl got business cards ðŸ˜ŽðŸ“Žâ˜ï¸ [pic.twitter.com/1nNBYvlZ1t](https://t.co/1nNBYvlZ1t)

> â€” Chloe Condon ðŸŽ€ (@ChloeCondon) [February 21, 2019](https://twitter.com/ChloeCondon/status/1098732324622020609?ref_src=twsrc%5Etfw)

However, one thing was missing.  A proper, physical manifestation of our favorite sentient paperclip.  This is the story of that journey.

## RoboClippy Mark I

RoboClippy Mark I was cute, but definitively not a paperclip.  I could get the eyebrows to wiggle, but only manually.

[![](/images/2019/gphoto-a05ead22c4.jpg)](https://photos.google.com/share/AF1QipN2eGEAakgk6LpvmeBbXoBoeQLXtP9ZmBWhgZTayodDzRinnCJzLJ5c6jh-EhYLfg?key=NDlsNGVHTXp0VTZSbHk0ZXJROEk4am9XdnZXUUFB&source=ctrlq.org)

## RoboClippy Mark II

Upon creating RoboClippy Mark II, I realized that the concept of ["Uncanny Valley"](https://en.wikipedia.org/wiki/Uncanny_valley) applies to both humans and paperclips.

[![](/images/2019/gphoto-2345d46c82.jpg)](https://photos.google.com/share/AF1QipOAO10Sbj-P04J9a6QtcOR0J5D-3dKQXP4zavRomrWD4bNtC1kq5NiZA92lWzBNrg?key=NVZreEpFMUdqUUVuTlNQQkwyUDZHR05Cd1dtT01R&source=ctrlq.org)

## RoboClippy Mark III

In RoboClippy Mark III, I realized that animatronics done wrong is nightmare fuel.

[![](/images/2019/gphoto-3ef1e48c30.jpg)](https://photos.google.com/share/AF1QipM7xv3GKOhEPOyLB761YtL1YfP0kylxQJ6Pc03MN6yksFU58ve9rPuk-ehBGckHDA?key=OWUzVEdmVFZBb0FzVjlGWkVfQVZuSkpEYzkzT213&source=ctrlq.org)

But I made progress!  The eyebrows articulate (not realistically), but it doesnâ€™t look natural or have fine motor control.

Since I want to use motors to control LEGO, the [LEGO Mindstorms](https://www.lego.com/en-us/mindstorms) sounded perfect!  Alas, I encountered a number of issues interacting with their LEGO power supplies.

 	- LEGO Mindstorm motors use 9V; however, I wanted to power everything from USB which only uses 5V

 	- LEGO Mindstorm connectors have weird wiring and I wanted more standard cabling

Thereâ€™s a whole field of hobby electronics and motors, so I went down that path.  I soon learned that not all motors are created equal.  [Servo motors](https://en.wikipedia.org/wiki/Servomotor) are good for broad movements where you apply voltage to tell the motor â€œturn leftâ€ or â€œturn rightâ€.  [Stepper motors](https://en.wikipedia.org/wiki/Stepper_motor) are good for fine movements where you apply voltage to tell the motor â€œGo to position Xâ€.

After some experimentation, stepper motors became the natural fit.  The catch is that they use a special protocol to control them called PWM.  And if you want to control multiple motors, you want to use a different protocol ([I2C](https://en.wikipedia.org/wiki/I%C2%B2C)).  In my case, I wanted to control 3 motors (mouth, left eyebrow, right eyebrow).  This was getting more complex than I expected, but I was learning a lot and excited.

## RoboClippy Mark IV

RoboClippy Mark IV was a technological breakthrough.  With the help of my good friends at [Bricks and Minifigs, Plano](https://www.facebook.com/BAMPlano/) we had a working prototype which looked realistic and could articulate itâ€™s mouth.

[![](/images/2019/gphoto-5cd0758bba.jpg)](https://photos.google.com/share/AF1QipODW8EYkblJhWxNuf-528lKNl7vhGkeIt_RpZ-6lUvSRIKRxS-4XqsTqJ27WygV1g?key=ZzJlUWx6Q1FMdDBhQ2RKc1dtWW0xUWktODlhTXh3&source=ctrlq.org)

Remember Uncanny Valley?  Without the eyebrows, it looks ... off.

So, how are we doing so far?  Weâ€™ve got a great structure, the mouth articulates, and the eyebrows articulate!  However, itâ€™s lacking a â€œsoulâ€.  We want it to move the mouth when speaking, we want it to simulate Clippyâ€™s voice and we want to use the eyebrows to emote.

Enter [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/).  There are many services it offers, and in this case Iâ€™ll be using Azure [Speech to Text](https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/) and [Text to Speech](https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/) so that I can give RoboClippy a voice and to listen to what people are saying.

Now for the next problem:  Determining when RoboClippy is speaking.  It seems intuitive to have RoboClippyâ€™s mouth move when the audio is playing and stop when itâ€™s complete, right?  Uncanny Valley wins again.  If you see someoneâ€™s mouth moving when theyâ€™re not speaking (e.g. at the end of a sentence), it doesnâ€™t look right.

So, the next option is to calculate voltage off of the soundcard/speaker, right?  Again, thereâ€™s more nuances to be discovered.  Sound is a wave, so measuring at any point only gets you a snapshot.  Also most microphones measure -2.5V to 2.5V and the Arduino can only detect 0 - 5V, so weâ€™re missing half the data!  A Step-up Converter fixed that problem, but added additional complexity.

[![](/images/2019/gphoto-c01c031072.jpg)](https://photos.google.com/share/AF1QipP-vyftzlx3m4kEt9M8sVcB5PKccIQ0PpT0orgaPRWV8VGWLOmkhNf982tAF5YBSA?key=c2xHSGQ5VVl5VmM1OGVmMjFBaFpqcU1CQzV2blhn&source=ctrlq.org)

## RoboClippy Mark V

Now weâ€™re at RoboClippy Mark V.  Iâ€™m using an Arduino to measure the sound and control the servos.  All of the communication happens on my laptop. Itâ€™s powered and controlled by the USB.  Unfortunately, the results were really flakey and since it drew power from the laptop, there was a potential of the motors drawing too much current and frying it.  It also took about 5-10 minutes to setup and get right each time.  Major progress!  But not very practical.
> 
Inspired by the Big Mouth Billy Bass, I built a [@LEGO](https://twitter.com/Lego?ref_src=twsrc%5Etfw) [#Clippy](https://twitter.com/hashtag/Clippy?src=hash&ref_src=twsrc%5Etfw) [#robot](https://twitter.com/hashtag/robot?src=hash&ref_src=twsrc%5Etfw) using [@Azure](https://twitter.com/Azure?ref_src=twsrc%5Etfw) Huge thanks to [@geekpatrol](https://twitter.com/geekpatrol?ref_src=twsrc%5Etfw) and Bricks and Minifigs, Plano [pic.twitter.com/Fay08GUs4I](https://t.co/Fay08GUs4I)

> â€” Tommy Falgout (@lastcoolname) [October 1, 2018](https://twitter.com/lastcoolname/status/1046773815043379200?ref_src=twsrc%5Etfw)

My local Makerspace had some [Google AIY Voice Kits](https://aiyprojects.withgoogle.com/voice/) which I experimented with.  It had a speaker, a microphone, and a cardboard case, all you needed was to supply your own Raspberry Pi.  This was exactly the packaging I needed to contain RoboClippyâ€™s brains.

The last step is making RoboClippy â€œtalkâ€.  But some interesting questions arose:

 	- How do I know when to start listening?  Wait for a user to press a button?  Not a great experience.

 	- How do I know when to stop listening?  Again, not a great experience.

 	- Whatâ€™s the quickest way to respond?  Perform S2T & T2S locally?  Use a service?

 	- How can I best utilize Azure?  This is Clippy, so using MS products makes sense.

Thankfully, someone wrote an [OSS library](https://github.com/Uberi/speech_recognition) to solve many of these problems.  I also learned something about Alexa/Cortana/OK Google that I wasnâ€™t aware of.  Keyword detection (aka Hotwork detection).

Anyone with an Amazon Dot/Echo is worried that Alexa/Amazon is always listening in on us.  Keyword detection is training an AI model to â€œwake-upâ€ and do something when it hears specific pitches/frequencies.  You can even create you own keyword!  Enter [Snowboy](https://snowboy.kitt.ai/), a service from Kitt.AI for making your own keyword.  This allows RoboClippy to wake-up upon that specific pitch/frequency and then start "really" listening on the microphone.  Thankfully, the same OSS library supported Snowboy so this was surprisingly easy to incorporate.  You can even contribute to the ["Hello Clippy" keyword](https://snowboy.kitt.ai/hotword/27993).

## RoboClippy Mark VI

Now, witness the power of this fully armed and operational RoboClippy.

[![](/images/2019/gphoto-e4fb4ed657.jpg)](https://photos.google.com/share/AF1QipOf7F2FUllrFKZCADU0qtlMSHu5K1gZJQhCK9ZZpEDXUXeUltg6GfnNZBfRGEzljA?key=RVk2bnBwNXppUUtrWjl0cXA4UEJQNmhaWGxMbVRR&source=ctrlq.org)

 	- Our RoboClippy is now MUCH more extensible.

 	- Google hardware for microphone and speakers

 	- Microsoft Azure for Text2Speech, Speech2Text, [Natural Language Processing](https://luis.ai)

 	- I2C to PWM for motor controls

 	- RaspberryPi for orchestration

 	- Power + control (ssh + Python) can be done remotely

 	- 5 easy-to-connect wires (4 for I2C, 1 USB for power)

 	- Written in Python

 	- [Available as Open Source](https://github.com/lastcoolnameleft/robo-clippy)

## Build your own Robo-Clippy

To build your own, you will need:

 	- [Raspberry Pi 3B+](https://amzn.to/2G2bNdA) - You might be able to use an older version, but Iâ€™m not sure how Snowboy will work since it can be resource intensive.

 	- LEGO - Exact parts TBD, but mostly: black 1-width bricks; black plates; grey 2-width bricks, grey plates.

 	- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/) - T2S/S2T - You can sign up for a [free account](https://azure.microsoft.com/en-us/free/) on Azure.

 	- [Google AIY Voice Kit](https://amzn.to/2UoJJsU)

 	- [I2C PWM Driver](https://amzn.to/2Vahz1X) - This might not be essential as the Google AIY Voice Kit allows you to connect multiple servos directly to the HAT.  By the time I got to this stage, I had already integrated the board and I prefer to keep it this way because it makes cabling easier.

 	- [Multi-color breadboard jumper wires](https://amzn.to/2FLDOWI) - These are used for connecting the RPi HAT to the Servos.

 	- [3 Micro Servo Motor](https://amzn.to/2UcNrWk)

 	- [Snowboy - Hotword/keyword detection](https://snowboy.kitt.ai/)

 	- [Python 3 - Glue code](https://github.com/lastcoolnameleft/robo-clippy)

In an upcoming blog, I will detail the steps necessary to create your own.  If you can't wait and want to start working on one now, feel free to email me at tommy at this domain.

[![](/images/2019/gphoto-87fbb75877.jpg)](https://photos.google.com/share/AF1QipNx2ymDwJTsO0GLjyaNDO_z_65I9bmdUVXjqQhZSZo4F5SyA4dv9Cd5Pmy1DAqEwg?key=MmpSQ0VPMGlFUFY4d2lwY0tVdFV3Sy1kOHV2VVZB&source=ctrlq.org)

If you're interested in seeing my presentation on this story, you can view it here:

Special thanks:

 	- Special thanks to Jason and Andrea of [Bricks and Minifigs, Plano](https://www.facebook.com/BAMPlano/) who helped design LEGO Clippy

 	- [Greg Miller](https://www.linkedin.com/in/geekpatrolmiller/) who helped me understand the properties of sound via oscilloscope

 	- [Nina Zakharenko](https://www.nnja.io/) who was the catalyst for this blog post

 	- [Chloe Condon](https://www.linkedin.com/in/chloecondon/) who is an even bigger Clippy fan than myself and helped fuel this social rebirth