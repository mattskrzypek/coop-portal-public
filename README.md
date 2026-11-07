# The Coop: making my homelab useful to other people

I built the Coop at [coop.fatpigeon.ca](https://coop.fatpigeon.ca) as a front door to my FatPigeon homelab. It is for family and friends who want to watch something, find an app, or use a service without needing to understand the server behind it. Some people only use Jellyfin. Others use more of the tools.

I have about seven years of SOC and incident response experience, but I am relatively new to programming. I directed and built this project with AI coding assistants, including Codex. I am not presenting it as an application I hand-coded independently. My contribution starts with deciding what I want the system to do, who it should serve, and what access it should allow.

My hands-on part was mainly the overall architecture, meaning which services exist, how they connect, and who gets access to what, plus testing it with my family and adjusting based on what they ran into.

## Why I built it

I enjoy designing things and seeing them work. The Coop gives that interest a practical purpose: making services I run useful to people besides me.

A collection of working applications is not automatically an easy system to use. People still need to know where to go, how to sign in, and what to do when something breaks. The portal is my attempt to put those pieces together without making everyone learn my homelab.

## How it fits together

The portal is a front end to separate services, not a replacement for them. The source contains ordinary HTML, CSS, and JavaScript, with pages for apps, watching media, account help, statistics, and private administration. It also contains a Crumbs chat interface and a media-search handoff to Requests.

The wider system includes:

- **Jellyfin and Seerr:** watching media and requesting movies or shows.
- **PigeonCards:** my Magic card collection tool, with browsing and card requests for other people.
- **PigeonSOC:** a separate, restricted security investigation interface, not a household permission granted to everyone.
- **Authentik:** shared identity and sign-in across supported services.
- **Unraid and Docker:** hosting the applications, with a reverse proxy handling HTTPS routing and Tailscale used for private access.

Those infrastructure details are documented in my project history. The portal repository describes nginx static hosting behind Nginx Proxy Manager, but it is not a complete infrastructure repository.

## The security decisions matter more than the tiles

The boundary I want is straightforward: being allowed to watch a movie should not mean being allowed to administer the server.

My project records describe separating household access from private administration, using app-specific grants, and restricting management access through private routes and device allowlists. They also record testing anonymous and non-owner access rather than relying on whether an admin link is visible.

One useful lesson from the recorded hardening work was that protecting a reverse-proxy route is not enough if a backend port remains reachable directly. Another was that signing out of the identity provider does not necessarily revoke every application's native sessions or API tokens.

Recovery needs the same precision. Earlier restore checks covered application data and databases, not complete media recovery or replacement-server boot. I do not want to describe that as proof that everything can be restored.

Sign-in today goes through Authentik with MFA. I have not yet tested a full restore myself, and that is the next gap I want to close. A backup you have never restored is a hope, not a plan.

## What I learned about adoption

Getting people to use the Coop has been harder than getting a page online. Some family and friends work in creative fields and object to AI's involvement in building it. That is a real concern about the process, not simply a request for different colours or artwork.

I need to be honest about how it was made and listen rather than assume technical usefulness settles the issue. A working service and a service people trust are different outcomes.

One concrete example: my wife told me the site's wording sounded very AI-forward. She was right. I had the copy rewritten so it sounds like me instead of a product page. It was a small change, but it showed me that the words on the page affect trust as much as the features do.

## What's next

My next step is to run and document a real restore test. After that, I want to write up one complete user journey, from getting access to using a service, alongside the permission checks that protect it. Those would make this a stronger demonstration of the security engineering and automation work I want to move toward.
