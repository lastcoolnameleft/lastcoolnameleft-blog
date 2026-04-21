---
title: Tinkering with Oracle DB in a container.
description: ""
pubDate: '2017-04-28T04:09:10.000Z'
categories:
  - Uncategorized
---

TL;DR: Size matters.

After Oracle's surprise announcement of their [containerization of Oracle DB](https://blog.docker.com/2017/04/oracle-database-dev-tools-in-docker-store/), Oracle WebLogic and a few of their other core technologies, I decided to test it out for myself.  (Speaking authentically, I'm leery of their commitment; however, I recognize that I work on Open Source at Microsoft, so who am I to judge?) 

My end-goal is to get [Oracle DB 12.2](https://www.oracle.com/database/index.html) running in a container on [Kubernetes](https://kubernetes.io/) inside [Azure Container Service](https://docs.microsoft.com/en-us/azure/container-service/).  This is Part 1 of my walkthrough from 0 to operational.


## Build and Verify the Container


Unlike most Docker projects, Oracle does not have a public image on Docker Hub.  To get started, you'll need to:


- [Clone their Github repo](https://github.com/oracle/docker-images)

- [Download the Oracle DB instance](http://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html)

- [Run their buildDockerImage.sh from the Github Repo](https://github.com/oracle/docker-images/blob/master/OracleDatabase/dockerfiles/buildDockerImage.sh)

- Start the container





### Clone the github repo


`git clone git@github.com:oracle/docker-images.git
...
Receiving objects: 100% (5643/5643), 425.77 MiB | 5.41 MiB/s, done.
`

Wait...what?!  425MB?!

After some sleuthing, it appears they once included the OracleLinux binaries in the git repo but have not purged them.  Poor Github.  I have a tremendous amount of appreciation for their architects and support engineers.  Below is the SHA1 of the blob, the # of bytes of each file and the path.


`git clone git@github.com:oracle/docker-images.git
Cloning into 'docker-images'...
remote: Counting objects: 5643, done.
remote: Compressing objects: 100% (35/35), done.
remote: Total 5643 (delta 12), reused 0 (delta 0), pack-reused 5607
Receiving objects: 100% (5643/5643), 425.77 MiB | 5.41 MiB/s, done.
Resolving deltas: 100% (3164/3164), done.


git:(master) git rev-list --objects --all \
| git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
| awk '/^blob/ {print substr($0,6)}' \
| sort --numeric-sort --key=2 | tail -7

35eda80405d711ae557905633d9f9b8d756afb94 42358832 OracleLinux/7.0/oraclelinux-7.0.tar.xz
e359def3dde981199ea692bbb26c24bd37e6fd68 42765288 OracleLinux/7.1/oraclelinux-7.1.tar.xz
0956d25bcb27f804cfc37f2a519a5cfb35af0955 43951872 OracleLinux/6.8/oraclelinux-6.8-rootfs.tar.xz
6de0b5011f509e53623ab0170fbc72e8bb53b501 43953520 OracleLinux/6.9/oraclelinux-6.9-rootfs.tar.xz
b05b9f4971b6d28330545fadc234eb423815dd59 47275816 OracleLinux/7.2/oraclelinux-7.2-rootfs.tar.xz
9b07a976e61ed2cf3a02173bf8c2d829977f2406 49130232 OracleLinux/7.3/oraclelinux-7.3-rootfs.tar.xz
3b7610a3df4892e9cf4f5d01eb3d55bcd3f2ad54 50369896 OracleLinux/6.7/oraclelinux-6.7-rootfs.tar.xz
`


[Moving right along...](https://www.youtube.com/watch?v=MMR5JVo21wQ)


### Download the Oracle DB instance from their website


Since Oracle does not allow anyone else to distribute their software, [you must go to their site, register (Larry Ellison now has my email), and download](http://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html).  Unfortunately, the login process does not allow me to "wget" the file and put on a remote machine, so I must download locally via browser.  I chose "Oracle Database 12c Release 2"

`-rw-r--r--@ 1 thfalgou  staff   3.2G Apr 27 10:07 linuxx64_12201_database.zip
`

Another 3.2GB.

I now have an alternate version of Sir Mix A Lot's infamous song going in my head: I LIKE BIG BINARIES AND I CANNOT LIE...

[Moving right along...](https://www.youtube.com/watch?v=dQw4w9WgXcQ)


### Run their buildDockerImage.sh from the Github Repo


The documentation isn't explicit about where to store the downloaded image.  (in my case the 'OracleDatabase/dockerfiles/12.2.0.1' directory)

Now the moment of truth.  From the "OracleDatabase/dockerfiles" directory, run buildDockerImage.sh



`dockerfiles git:(master) time ./buildDockerImage.sh -v 12.2.0.1 -s
...
Building image 'oracle/database:12.2.0.1-se2' ...
Sending build context to Docker daemon 3.454 GB^M^M
Step 1/16 : FROM oraclelinux:7-slim
 ---> 442ebf722584
...
Pages and pages of output.  So much text that my iTerm buffer no longer had the initial command.
...
  Oracle Database Docker Image for 'se2' version 12.2.0.1 is ready to be extended:

    --> oracle/database:12.2.0.1-se2

  Build completed in 658 seconds.

./buildDockerImage.sh -v 12.2.0.1 -s  3.68s user 8.15s system 1% cpu 10:57.49 total
`


10 Minutes later, the container is finally built.  [10 minutes.  10!](https://www.youtube.com/watch?v=0X06HoBb2e0)

Perhaps I'm being overly dramatic; however, the Docker Ecosystem has lots of high expectations and one of those is rapid development and deployment through small, composable artifacts.  Granted, building and deploying a new version of database is not a common occurrence; however, the process it not conducive to DevOps.  That said, this is their first foray into this, so I'm still excited to see the change.

`dockerfiles git:(master) docker images
oracle/database                                        12.2.0.1-se2        f788cd5b4b9d        4 minutes ago       14.8 GB
oraclelinux                                            7-slim              442ebf722584        6 days ago          114 MB
fedora                                                 latest              15895ef0b3b2        7 days ago          231 MB
microsoft/mssql-server-linux                           latest              7b1c26822d97        7 days ago          1.35 GB
nginx                                                  latest              5766334bdaa0        3 weeks ago         183 MB
ubuntu                                                 latest              0ef2e08ed3fa        8 weeks ago         130 MB
...
`

14GB?  I take that back.


### Start the container


Let's get the party started...

`dockerfiles git:(master) docker run --name oracledb -p 1521:1521 -p 5500:5500 oracle/database:12.2.0.1-se2
ORACLE PASSWORD FOR SYS, SYSTEM AND PDBADMIN: 

LSNRCTL for Linux: Version 12.2.0.1.0 - Production on 28-APR-2017 03:21:48

Copyright (c) 1991, 2016, Oracle.  All rights reserved.

Starting /opt/oracle/product/12.2.0.1/dbhome_1/bin/tnslsnr: please wait...

TNSLSNR for Linux: Version 12.2.0.1.0 - Production
System parameter file is /opt/oracle/product/12.2.0.1/dbhome_1/network/admin/listener.ora
Log messages written to /opt/oracle/diag/tnslsnr/91c68ac2b2bf/listener/alert/log.xml
Listening on: (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1)))
Listening on: (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=0.0.0.0)(PORT=1521)))
...
Copying database files
1% complete
...
`

Huzzah!  After about 9 minutes, it's finally started!  Let's test it!

`~ docker exec -ti oracledb sqlplus pdbadmin@ORCLPDB1

SQL*Plus: Release 12.2.0.1.0 Production on Fri Apr 28 03:58:10 2017

Copyright (c) 1982, 2016, Oracle.  All rights reserved.

Enter password: 

Connected to:
Oracle Database 12c Standard Edition Release 12.2.0.1.0 - 64bit Production

SQL>
`

[We're in!!!  It worked!](https://www.youtube.com/watch?v=QsGxbsQv5kc)

It is at this point that I realize I've already gone through 2 drams of [Aberlour](http://www.aberlour.com/us/) and I should probably stop for the night.  Provided there is enough interest (and whiskey), I'll write-up Step 2 of getting this running on [Kubernetes](https://kubernetes.io/) in [ACS](https://docs.microsoft.com/en-us/azure/container-service/).  As for now, I should stop while the world is only mildly spinning.

NOTE 1: If the database auto-generates a password with a "/" in it, I've found it doesn't work.  You can change that by running:
`docker exec  ./setPassword.sh `

NOTE 2: If you run this multiple times, make sure to run "docker system prune" as it fills up your disk fast.  On my 3rd try, I hit the following error, even with lots of space on my disk.
`  The location specified for 'Fast Recovery Area Location' has insufficient free space.
   CAUSE: Only (9,793MB) free space is available on the location (/opt/oracle/oradata/fast_recovery_area/ORCLCDB/).
   ACTION: Choose a 'Fast Recovery Area Location' that has enough space (minimum of (12,780MB)) or free up space on the specified location.
`

NOTE 3: It looks like everyone uses Docker now...
