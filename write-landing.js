const fs = require('fs');
const path = require('path');

const TARGET = path.join(
  __dirname,
  'frontend/src/app/pages/landing/landing.component.ts'
);

const CONTENT = `import {
  Component, signal, computed, OnInit, AfterViewInit, OnDestroy,
  inject, PLATFORM_ID, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: \`
    <div class="landing" (mousemove)="onMouseMove($event)">

      <!-- Scroll progress bar -->
      <div class="scroll-bar" [style.width.%]="scrollProgress()"></div>

      <!-- Particle canvas -->
      <canvas #particleCanvas class="particle-canvas"></canvas>

      <!-- Aurora orbs -->
      <div class="aurora">
        <div class="orb o1"></div>
        <div class="orb o2"></div>
        <div class="orb o3"></div>
        <div class="orb o4"></div>
      </div>

      <!-- NAVBAR -->
      <nav class="navbar" [class.scrolled]="isScrolled()">
        <div class="nav-wrap">
          <a class="nav-logo" routerLink="/">
            <div class="logo-box">
              <span class="logo-n">N</span>
              <div class="logo-shine"></div>
            </div>
            <div>
              <div class="logo-name">NeoBank</div>
              <div class="logo-sub">Premium Banking</div>
            </div>
          </a>

          <div class="nav-links">
            <a href="#features"     class="nl">Features</a>
            <a href="#how-it-works" class="nl">How It Works</a>
            <a href="#products"     class="nl">Products</a>
            <a href="#testimonials" class="nl">Reviews</a>
            <a href="#contact"      class="nl">Contact</a>
          </div>

          <div class="nav-cta">
            <a routerLink="/login"    class="btn-ghost">Sign In</a>
            <a routerLink="/register" class="btn-glow">Get Started <span class="ga">&#8594;</span></a>
          </div>

          <button class="burger" [class.open]="mobileOpen()" (click)="mobileOpen.update(v=>!v)">
            <span></span><span></span><span></span>
          </button>
        </div>

        @if (mobileOpen()) {
          <div class="mob-menu" (click)="mobileOpen.set(false)">
            <a href="#features"     class="ml">Features</a>
            <a href="#how-it-works" class="ml">How It Works</a>
            <a href="#products"     class="ml">Products</a>
            <a href="#testimonials" class="ml">Reviews</a>
            <a href="#contact"      class="ml">Contact</a>
            <div class="ml-cta">
              <a routerLink="/login"    class="ml-ghost">Sign In</a>
              <a routerLink="/register" class="ml-fill">Open Account</a>
            </div>
          </div>
        }
      </nav>

      <!-- HERO -->
      <section class="hero">
        <div class="hero-wrap">

          <div class="hero-left" [class.show]="heroReady()">

            <div class="hero-pill">
              <span class="pill-dot"></span>
              Trusted by 1M+ users across India
              <span class="pill-star">&#10022;</span>
            </div>

            <h1 class="hero-h1">
              <span class="h-line line-a">The Future of</span>
              <span class="h-line line-b">
                <span class="typed-word grad-text">{{ typedText() }}</span><span class="caret">|</span>
              </span>
              <span class="h-line line-c">Starts Here</span>
            </h1>

            <p class="hero-p">
              Experience seamless banking with AI-powered insights, instant transfers,
              zero-fee transactions, and premium rewards — all in one platform.
            </p>

            <div class="hero-btns">
              <a routerLink="/register" class="btn-primary">
                <span>Open Free Account</span>
                <div class="btn-sheen"></div>
              </a>
              <a href="#how-it-works" class="btn-outline">
                <span class="play-ico">&#9654;</span>
                See How It Works
              </a>
            </div>

            <div class="hero-trust">
              <div class="avatars">
                @for (c of avatarColors; track $index) {
                  <div class="av" [style.background]="c"></div>
                }
              </div>
              <span class="trust-txt"><b>1M+</b> people banking with us</span>
              <div class="divider-v"></div>
              <span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733; <span>4.9 / 5</span></span>
            </div>
          </div>

          <!-- Floating cards -->
          <div class="hero-right" [style.transform]="visualTransform()">

            <!-- Credit card -->
            <div class="card3d card-main">
              <div class="c-shine"></div>
              <div class="c-holo"></div>
              <div class="c-top">
                <div class="c-logo">N</div>
                <div class="c-badge">PREMIUM</div>
              </div>
              <div class="c-chip"><div class="chip-grid"></div></div>
              <div class="c-num">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8246</div>
              <div class="c-bot">
                <div>
                  <div class="c-lbl">Card Holder</div>
                  <div class="c-val">JOHN DOE</div>
                </div>
                <div>
                  <div class="c-lbl">Expires</div>
                  <div class="c-val">12/28</div>
                </div>
                <div class="c-visa">VISA</div>
              </div>
            </div>

            <!-- Growth widget -->
            <div class="card3d card-growth">
              <div class="g-icon">&#128200;</div>
              <div class="g-val">+24.5%</div>
              <div class="g-lbl">Portfolio Growth</div>
              <svg class="g-spark" viewBox="0 0 100 32" fill="none">
                <polyline points="0,28 18,20 35,24 52,10 68,15 82,5 100,2"
                  stroke="#10b981" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              </svg>
            </div>

            <!-- Transaction popup -->
            <div class="card3d card-tx">
              <div class="tx-ping"></div>
              <div class="tx-check">&#10003;</div>
              <div class="tx-body">
                <div class="tx-title">Payment Successful</div>
                <div class="tx-amount">&#8377;12,450.00</div>
                <div class="tx-sub">Just now &middot; Priya Sharma</div>
              </div>
            </div>

            <!-- Balance card -->
            <div class="card3d card-bal">
              <div class="bal-lbl">Available Balance</div>
              <div class="bal-num">&#8377;2,45,890</div>
              <div class="bal-trend">
                <svg width="72" height="24" viewBox="0 0 72 24">
                  <polyline points="0,20 18,14 36,17 54,6 72,3"
                    stroke="#6366f1" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
                <span>&#8593; 12.5% this month</span>
              </div>
            </div>

            <!-- Notification chip -->
            <div class="card3d card-alert">
              <div class="alert-ping"></div>
              <span class="alert-ico">&#128276;</span>
              <span class="alert-txt">EMI due in 3 days</span>
            </div>
          </div>
        </div>

        <div class="scroll-hint">
          <div class="mouse-box"><div class="mouse-wheel"></div></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      <!-- LIVE TICKER -->
      <div class="ticker">
        <div class="ticker-track">
          @for (item of tickerItems; track $index) {
            <div class="t-item">
              <span class="t-val">{{ item.value }}</span>
              <span class="t-lbl">{{ item.label }}</span>
            </div>
            <div class="t-sep">&#10022;</div>
          }
        </div>
      </div>

      <!-- FEATURES -->
      <section class="sect" id="features">
        <div class="inner">
          <div class="s-head reveal">
            <div class="s-badge">FEATURES</div>
            <h2 class="s-title">Everything You Need<br/><span class="grad-text">In One Platform</span></h2>
            <p class="s-desc">Powerful tools crafted for the modern banking experience</p>
          </div>
          <div class="feat-grid">
            @for (f of features; track f.title; let i = $index) {
              <div class="feat-card reveal" [style.transition-delay]="(i*0.08)+'s'">
                <div class="feat-glow" [style.background]="f.glow"></div>
                <div class="feat-ico-wrap" [style.background]="f.grad"><span>{{ f.icon }}</span></div>
                <h3 class="feat-title">{{ f.title }}</h3>
                <p class="feat-desc">{{ f.desc }}</p>
                <div class="feat-tags">
                  @for (tag of f.tags; track tag) { <span class="ftag">{{ tag }}</span> }
                </div>
                <div class="feat-arr">&#8594;</div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="sect sect-alt" id="how-it-works">
        <div class="inner">
          <div class="s-head reveal">
            <div class="s-badge">PROCESS</div>
            <h2 class="s-title">Up &amp; Running in<br/><span class="grad-text">3 Simple Steps</span></h2>
          </div>
          <div class="hiw-grid">
            @for (step of steps; track step.n; let i = $index) {
              <div class="hiw-card reveal" [style.transition-delay]="(i*0.18)+'s'">
                <div class="hiw-num">{{ step.n }}</div>
                <div class="hiw-ring">
                  <span class="hiw-ico">{{ step.icon }}</span>
                  <div class="ring-pulse"></div>
                </div>
                <h3 class="hiw-title">{{ step.title }}</h3>
                <p class="hiw-desc">{{ step.desc }}</p>
                @if (i < steps.length - 1) { <div class="hiw-conn"></div> }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- PRODUCTS -->
      <section class="sect" id="products">
        <div class="inner">
          <div class="s-head reveal">
            <div class="s-badge">PRODUCTS</div>
            <h2 class="s-title">Financial Products<br/><span class="grad-text">For Every Goal</span></h2>
          </div>
          <div class="prod-grid">
            @for (p of products; track p.title; let i = $index) {
              <div class="prod-card reveal" [class.prod-feat]="p.featured" [style.transition-delay]="(i*0.15)+'s'">
                @if (p.featured) { <div class="prod-star">&#9733; Most Popular</div> }
                <div class="prod-ico" [style.background]="p.grad">{{ p.icon }}</div>
                <div class="prod-badge">{{ p.badge }}</div>
                <h3 class="prod-title">{{ p.title }}</h3>
                <p class="prod-desc">{{ p.desc }}</p>
                <ul class="prod-list">
                  @for (feat of p.features; track feat) {
                    <li><span class="chk">&#10003;</span>{{ feat }}</li>
                  }
                </ul>
                <a routerLink="/register" class="prod-btn" [class.prod-btn-fill]="p.featured">Apply Now &#8594;</a>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="sect sect-alt" id="testimonials">
        <div class="inner">
          <div class="s-head reveal">
            <div class="s-badge">REVIEWS</div>
            <h2 class="s-title">Loved by<br/><span class="grad-text">1 Million+ Customers</span></h2>
          </div>
          <div class="testi-grid">
            @for (t of testimonials; track t.name; let i = $index) {
              <div class="testi-card" [class.testi-active]="activeTesti() === i">
                <div class="testi-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <p class="testi-text">"{{ t.text }}"</p>
                <div class="testi-footer">
                  <div class="testi-av" [style.background]="t.color">{{ t.initials }}</div>
                  <div>
                    <div class="testi-name">{{ t.name }}</div>
                    <div class="testi-role">{{ t.role }}</div>
                  </div>
                  <div class="testi-badge">&#10003; Verified</div>
                </div>
              </div>
            }
          </div>
          <div class="testi-dots">
            @for (t of testimonials; track t.name; let i = $index) {
              <button class="tdot" [class.tdot-on]="activeTesti() === i" (click)="activeTesti.set(i)"></button>
            }
          </div>
        </div>
      </section>

      <!-- CONTACT -->
      <section class="sect" id="contact">
        <div class="inner">
          <div class="s-head reveal">
            <div class="s-badge">24 / 7 SUPPORT</div>
            <h2 class="s-title">We Are Always<br/><span class="grad-text">Here for You</span></h2>
          </div>
          <div class="contact-grid">
            @for (c of contacts; track c.title) {
              <div class="contact-card reveal">
                <div class="contact-ring">{{ c.icon }}</div>
                <h3 class="contact-title">{{ c.title }}</h3>
                @for (d of c.details; track d) { <p class="contact-detail">{{ d }}</p> }
                <span class="contact-avail">{{ c.avail }}</span>
              </div>
            }
          </div>
          <div class="bank-row reveal">
            @for (b of bankCodes; track b.label) {
              <div class="bank-item">
                <span class="bank-lbl">{{ b.label }}</span>
                <span class="bank-val">{{ b.value }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="cta-sect">
        <div class="cta-glow-a"></div>
        <div class="cta-glow-b"></div>
        <div class="cta-inner reveal">
          <div class="cta-badge">JOIN 1 MILLION+ USERS</div>
          <h2 class="cta-h2">Start Your Journey to<br/><span class="grad-text">Smarter Banking</span></h2>
          <p class="cta-sub">Open your account in under 5 minutes. No paperwork. No fees.</p>
          <div class="cta-btns">
            <a routerLink="/register" class="btn-primary btn-xl">
              <span>Open Free Account</span>
              <div class="btn-sheen"></div>
            </a>
            <a routerLink="/login" class="btn-ghost-xl">Sign In &#8594;</a>
          </div>
          <div class="cta-trust-row">
            <span>&#10003; No fees ever</span>
            <span>&#10003; 5-min setup</span>
            <span>&#10003; Zero balance</span>
            <span>&#10003; RBI Licensed</span>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo-row">
              <div class="logo-box sm"><span class="logo-n">N</span><div class="logo-shine"></div></div>
              <div>
                <div class="logo-name">NeoBank</div>
                <div class="logo-sub">Premium Digital Banking</div>
              </div>
            </div>
            <p class="footer-tag">India's most trusted digital banking platform. RBI Licensed. Safe &amp; Secure.</p>
            <div class="footer-socials">
              <a href="#" class="soc">&#120143;</a>
              <a href="#" class="soc">in</a>
              <a href="#" class="soc">f</a>
              <a href="#" class="soc">&#9654;</a>
            </div>
          </div>
          @for (col of footerCols; track col.head) {
            <div class="footer-col">
              <h4 class="fcol-head">{{ col.head }}</h4>
              @for (lnk of col.links; track lnk) {
                <a href="#" class="fcol-link">{{ lnk }}</a>
              }
            </div>
          }
        </div>
        <div class="footer-bot">
          <span>&#169; 2026 NeoBank. All rights reserved. RBI Licensed Digital Banking Platform.</span>
          <div class="fbot-links">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  \`,
  styles: [\`
    *{margin:0;padding:0;box-sizing:border-box}
    :host{display:block}

    .landing{min-height:100vh;background:#070b1d;color:#fff;overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}

    /* scroll progress */
    .scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,#6366f1,#a855f7,#06b6d4);transition:width .1s linear;box-shadow:0 0 12px rgba(99,102,241,.7);}

    /* canvas */
    .particle-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;}

    /* aurora */
    .aurora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
    .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.13;}
    .o1{width:650px;height:650px;background:#6366f1;top:-200px;left:-180px;animation:orb1 22s ease-in-out infinite;}
    .o2{width:550px;height:550px;background:#a855f7;top:15%;right:-160px;animation:orb2 28s ease-in-out infinite;}
    .o3{width:420px;height:420px;background:#06b6d4;bottom:18%;left:8%;animation:orb3 19s ease-in-out infinite;}
    .o4{width:340px;height:340px;background:#f59e0b;bottom:8%;right:18%;animation:orb4 24s ease-in-out infinite;}
    @keyframes orb1{0%,100%{transform:translate(0,0)}33%{transform:translate(90px,70px)}66%{transform:translate(40px,-55px)}}
    @keyframes orb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-75px,55px)}66%{transform:translate(-110px,-35px)}}
    @keyframes orb3{0%,100%{transform:translate(0,0)}33%{transform:translate(70px,-45px)}66%{transform:translate(-35px,65px)}}
    @keyframes orb4{0%,100%{transform:translate(0,0)}33%{transform:translate(-55px,-70px)}66%{transform:translate(65px,35px)}}

    /* navbar */
    .navbar{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .4s cubic-bezier(.4,0,.2,1);}
    .navbar.scrolled{background:rgba(7,11,29,.92);backdrop-filter:blur(28px);border-bottom:1px solid rgba(255,255,255,.06);box-shadow:0 8px 50px rgba(0,0,0,.55);}
    .nav-wrap{max-width:1400px;margin:0 auto;padding:0 2rem;height:80px;display:flex;align-items:center;justify-content:space-between;}
    .nav-logo{display:flex;align-items:center;gap:.875rem;text-decoration:none;}
    .logo-box{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;box-shadow:0 8px 28px rgba(99,102,241,.5);}
    .logo-box.sm{width:40px;height:40px;border-radius:11px;}
    .logo-shine{position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.28),transparent);}
    .logo-n{font-size:1.45rem;font-weight:900;color:#fff;position:relative;z-index:1;}
    .logo-name{font-size:1.2rem;font-weight:800;color:#fff;line-height:1.2;}
    .logo-sub{font-size:.62rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.09em;}
    .nav-links{display:flex;gap:.2rem;}
    .nl{padding:.5rem 1rem;border-radius:10px;font-size:.91rem;color:rgba(255,255,255,.62);text-decoration:none;transition:all .25s;position:relative;}
    .nl::after{content:'';position:absolute;bottom:3px;left:50%;right:50%;height:2px;background:linear-gradient(90deg,#6366f1,#a855f7);transition:all .3s;border-radius:1px;}
    .nl:hover{color:#fff;}
    .nl:hover::after{left:18%;right:18%;}
    .nav-cta{display:flex;gap:.75rem;align-items:center;}
    .btn-ghost{padding:.55rem 1.35rem;border-radius:11px;color:rgba(255,255,255,.78);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);text-decoration:none;font-size:.9rem;transition:all .3s;}
    .btn-ghost:hover{background:rgba(255,255,255,.12);color:#fff;}
    .btn-glow{padding:.55rem 1.35rem;border-radius:11px;color:#fff;background:linear-gradient(135deg,#6366f1,#a855f7);text-decoration:none;font-size:.9rem;font-weight:700;box-shadow:0 4px 22px rgba(99,102,241,.48);transition:all .3s;display:flex;align-items:center;gap:.38rem;}
    .btn-glow:hover{transform:translateY(-2px);box-shadow:0 8px 34px rgba(99,102,241,.68);}
    .ga{transition:transform .3s;}.btn-glow:hover .ga{transform:translateX(3px);}

    /* hamburger */
    .burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.4rem;}
    .burger span{display:block;width:24px;height:2px;background:#fff;border-radius:2px;transition:all .35s;transform-origin:center;}
    .burger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .burger.open span:nth-child(2){opacity:0;}
    .burger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
    .mob-menu{padding:1.5rem 2rem;background:rgba(7,11,29,.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.06);animation:slideDown .3s ease;display:flex;flex-direction:column;}
    @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
    .ml{padding:1rem 0;color:rgba(255,255,255,.68);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.05);transition:color .25s;}
    .ml:hover{color:#a5b4fc;}
    .ml-cta{display:flex;gap:1rem;margin-top:1.5rem;}
    .ml-ghost,.ml-fill{flex:1;padding:.85rem;border-radius:12px;text-align:center;text-decoration:none;font-weight:700;}
    .ml-ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.1);}
    .ml-fill{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;}

    /* hero */
    .hero{position:relative;z-index:1;min-height:100vh;padding:80px 2rem 60px;display:flex;flex-direction:column;justify-content:center;}
    .hero-wrap{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;width:100%;}
    .hero-left{opacity:0;transform:translateY(40px);transition:all .95s cubic-bezier(.4,0,.2,1);}
    .hero-left.show{opacity:1;transform:translateY(0);}
    .hero-pill{display:inline-flex;align-items:center;gap:.55rem;padding:.48rem 1.15rem;border-radius:100px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.28);font-size:.83rem;color:#a5b4fc;margin-bottom:1.8rem;animation:fadeUp .6s .3s both;}
    .pill-dot{width:7px;height:7px;border-radius:50%;background:#6366f1;box-shadow:0 0 9px rgba(99,102,241,.9);animation:pdot 2s ease-in-out infinite;}
    @keyframes pdot{0%,100%{transform:scale(1)}50%{transform:scale(1.6);opacity:.6}}
    .pill-star{color:#6366f1;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .hero-h1{font-size:clamp(2.8rem,5.2vw,5rem);font-weight:900;line-height:1.08;letter-spacing:-2.5px;margin-bottom:1.6rem;display:flex;flex-direction:column;gap:.05em;}
    .h-line{display:block;}
    .line-a{animation:fadeUp .6s .42s both;}
    .line-b{display:flex;align-items:baseline;min-height:1.2em;animation:fadeUp .6s .56s both;}
    .line-c{animation:fadeUp .6s .7s both;}
    .grad-text,.typed-word{background:linear-gradient(135deg,#6366f1,#a855f7,#06b6d4);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradMove 4s ease-in-out infinite;}
    @keyframes gradMove{0%,100%{background-position:0%}50%{background-position:100%}}
    .caret{color:#a5b4fc;-webkit-text-fill-color:#a5b4fc;animation:caretBlink .9s step-end infinite;margin-left:2px;}
    @keyframes caretBlink{0%,100%{opacity:1}50%{opacity:0}}
    .hero-p{font-size:1.08rem;line-height:1.88;color:rgba(255,255,255,.56);margin-bottom:2.2rem;max-width:490px;animation:fadeUp .6s .84s both;}
    .hero-btns{display:flex;gap:1.15rem;flex-wrap:wrap;margin-bottom:2.2rem;animation:fadeUp .6s .98s both;}
    .btn-primary{position:relative;padding:.9rem 2.1rem;border-radius:13px;font-size:1rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#6366f1,#a855f7);text-decoration:none;overflow:hidden;box-shadow:0 8px 30px rgba(99,102,241,.45);transition:all .4s;display:inline-flex;align-items:center;gap:.5rem;}
    .btn-primary:hover{transform:translateY(-3px);box-shadow:0 14px 45px rgba(99,102,241,.65);}
    .btn-primary.btn-xl{padding:1.1rem 2.7rem;font-size:1.1rem;border-radius:15px;}
    .btn-sheen{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.26),transparent);animation:sheen 3.5s infinite 1.2s;}
    @keyframes sheen{0%{left:-100%}40%,100%{left:150%}}
    .btn-outline{padding:.9rem 2rem;border-radius:13px;color:rgba(255,255,255,.82);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);text-decoration:none;display:inline-flex;align-items:center;gap:.7rem;font-size:1rem;transition:all .3s;}
    .btn-outline:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22);transform:translateY(-2px);}
    .play-ico{width:34px;height:34px;border-radius:50%;background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.35);display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .3s;}
    .btn-outline:hover .play-ico{background:rgba(99,102,241,.28);transform:scale(1.1);}
    .hero-trust{display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap;animation:fadeUp .6s 1.1s both;}
    .avatars{display:flex;}.av{width:32px;height:32px;border-radius:50%;margin-right:-10px;border:2px solid #070b1d;}
    .trust-txt{font-size:.85rem;color:rgba(255,255,255,.52);margin-left:18px;}.trust-txt b{color:#fff;}
    .divider-v{width:1px;height:22px;background:rgba(255,255,255,.14);}
    .stars{font-size:.85rem;color:#f59e0b;}.stars span{color:rgba(255,255,255,.48);}

    /* hero cards */
    .hero-right{position:relative;height:640px;animation:rightIn .85s .5s both;transition:transform .12s linear;}
    @keyframes rightIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
    .card3d{position:absolute;border-radius:22px;backdrop-filter:blur(22px);border:1px solid rgba(255,255,255,.1);box-shadow:0 22px 65px rgba(0,0,0,.45);}
    .card-main{top:45px;right:0;width:385px;height:245px;background:linear-gradient(135deg,#667eea,#764ba2);padding:1.8rem;overflow:hidden;animation:cf 6s ease-in-out infinite;}
    @keyframes cf{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(.8deg)}}
    .c-shine{position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.1),transparent 60%);animation:spin 14s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .c-holo{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.13),transparent);animation:holo 4s infinite 1.5s;}
    @keyframes holo{0%{left:-100%}50%,100%{left:150%}}
    .c-top{position:relative;z-index:1;display:flex;justify-content:space-between;margin-bottom:1.1rem;}
    .c-logo{width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;}
    .c-badge{font-size:.62rem;font-weight:700;letter-spacing:2.5px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);padding:.25rem .7rem;border-radius:20px;}
    .c-chip{position:relative;z-index:1;width:48px;height:36px;border-radius:8px;background:linear-gradient(135deg,#f7d060,#e5b93a);margin-bottom:1.3rem;overflow:hidden;}
    .chip-grid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,.1) 4px,rgba(0,0,0,.1) 5px);}
    .c-num{position:relative;z-index:1;font-family:monospace;font-size:1.25rem;letter-spacing:4px;margin-bottom:1.3rem;}
    .c-bot{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-end;}
    .c-lbl{font-size:.6rem;text-transform:uppercase;opacity:.65;margin-bottom:.18rem;}
    .c-val{font-size:.95rem;font-weight:700;}
    .c-visa{font-size:1.15rem;font-weight:900;font-style:italic;opacity:.88;}
    .card-growth{top:0;left:-25px;width:185px;background:rgba(14,22,52,.88);padding:1.2rem;animation:cf2 7s ease-in-out infinite 1.5s;}
    @keyframes cf2{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .g-icon{font-size:1.7rem;margin-bottom:.4rem;}.g-val{font-size:1.55rem;font-weight:900;color:#10b981;}
    .g-lbl{font-size:.7rem;color:rgba(255,255,255,.48);margin-bottom:.65rem;}.g-spark{width:100%;height:28px;}
    .card-tx{top:298px;left:-65px;width:288px;background:rgba(10,14,39,.88);padding:1.2rem;display:flex;align-items:center;gap:1rem;animation:cf3 5.5s ease-in-out infinite .5s;}
    @keyframes cf3{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-12px)}}
    .tx-ping{position:absolute;top:11px;right:11px;width:9px;height:9px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;animation:ping 2s ease-in-out infinite;}
    @keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:.55}}
    .tx-check{width:44px;height:44px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 16px rgba(16,185,129,.4);}
    .tx-title{font-size:.84rem;font-weight:700;margin-bottom:.18rem;}.tx-amount{font-size:1.32rem;font-weight:900;color:#10b981;}.tx-sub{font-size:.68rem;color:rgba(255,255,255,.42);margin-top:.18rem;}
    .card-bal{bottom:60px;right:-22px;width:264px;background:linear-gradient(135deg,#0f172a,#1e293b);padding:1.4rem;animation:cf4 7.5s ease-in-out infinite 2s;}
    @keyframes cf4{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    .bal-lbl{font-size:.74rem;color:rgba(255,255,255,.45);margin-bottom:.4rem;}.bal-num{font-size:2.1rem;font-weight:900;margin-bottom:.7rem;}
    .bal-trend{display:flex;align-items:center;gap:.5rem;font-size:.77rem;color:#6366f1;}
    .card-alert{top:205px;right:-48px;width:198px;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);padding:.65rem 1rem;display:flex;align-items:center;gap:.55rem;animation:cf2 6.5s ease-in-out infinite 3s;}
    .alert-ping{position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;background:#ef4444;animation:ping 1.4s infinite;}
    .alert-ico{font-size:1.05rem;}.alert-txt{font-size:.76rem;color:#fcd34d;font-weight:600;}
    .scroll-hint{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.5rem;animation:fadeIn 1.5s 2.2s both,bob 2.2s ease-in-out infinite 3.5s;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes bob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(7px)}}
    .mouse-box{width:24px;height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.22);display:flex;justify-content:center;padding-top:5px;}
    .mouse-wheel{width:4px;height:7px;border-radius:2px;background:rgba(255,255,255,.48);animation:mw 2s ease-in-out infinite 3.5s;}
    @keyframes mw{0%,100%{transform:translateY(0);opacity:1}80%{transform:translateY(14px);opacity:0}}
    .scroll-hint span{font-size:.68rem;color:rgba(255,255,255,.32);text-transform:uppercase;letter-spacing:.1em;}

    /* ticker */
    .ticker{position:relative;z-index:1;background:rgba(99,102,241,.07);border-top:1px solid rgba(99,102,241,.18);border-bottom:1px solid rgba(99,102,241,.18);overflow:hidden;padding:.75rem 0;}
    .ticker-track{display:flex;width:max-content;animation:tickerRun 32s linear infinite;}
    .ticker:hover .ticker-track{animation-play-state:paused;}
    @keyframes tickerRun{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .t-item{display:flex;align-items:center;gap:.55rem;padding:0 2.2rem;white-space:nowrap;}
    .t-val{font-size:1rem;font-weight:800;color:#a5b4fc;}.t-lbl{font-size:.82rem;color:rgba(255,255,255,.42);}.t-sep{color:rgba(99,102,241,.38);font-size:.68rem;}

    /* sections */
    .sect{position:relative;z-index:1;padding:100px 2rem;}.sect-alt{background:rgba(99,102,241,.03);}
    .inner{max-width:1400px;margin:0 auto;}
    .s-head{text-align:center;margin-bottom:4.5rem;}
    .s-badge{display:inline-block;padding:.42rem 1.05rem;border-radius:100px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.22);font-size:.72rem;font-weight:800;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-bottom:1.2rem;}
    .s-title{font-size:clamp(2.2rem,4vw,3.5rem);font-weight:900;line-height:1.1;letter-spacing:-1.5px;margin-bottom:1.2rem;}
    .s-desc{font-size:1.08rem;color:rgba(255,255,255,.46);max-width:550px;margin:0 auto;}

    /* reveal */
    .reveal{opacity:0;transform:translateY(36px);transition:opacity .75s ease,transform .75s ease;}
    .reveal.revealed{opacity:1;transform:translateY(0);}

    /* features */
    .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.65rem;}
    .feat-card{position:relative;padding:2rem 1.75rem;border-radius:20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.065);overflow:hidden;cursor:pointer;transition:all .45s cubic-bezier(.4,0,.2,1);}
    .feat-glow{position:absolute;top:-55%;left:-15%;width:130%;height:55%;opacity:0;transition:opacity .45s;pointer-events:none;}
    .feat-card:hover{transform:translateY(-8px);border-color:rgba(99,102,241,.28);box-shadow:0 26px 65px rgba(0,0,0,.48);}
    .feat-card:hover .feat-glow{opacity:1;}
    .feat-ico-wrap{width:62px;height:62px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:1.35rem;font-size:1.85rem;box-shadow:0 8px 22px rgba(0,0,0,.28);}
    .feat-title{font-size:1.18rem;font-weight:700;margin-bottom:.7rem;}
    .feat-desc{font-size:.92rem;line-height:1.77;color:rgba(255,255,255,.48);margin-bottom:1.2rem;}
    .feat-tags{display:flex;flex-wrap:wrap;gap:.42rem;margin-bottom:1rem;}
    .ftag{padding:.26rem .78rem;border-radius:100px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);font-size:.7rem;color:rgba(255,255,255,.52);}
    .feat-arr{position:absolute;bottom:1.4rem;right:1.7rem;font-size:1.2rem;color:rgba(99,102,241,.28);transition:all .3s;}
    .feat-card:hover .feat-arr{color:#6366f1;transform:translateX(4px);}

    /* how it works */
    .hiw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;position:relative;}
    .hiw-card{text-align:center;padding:2.4rem 1.8rem;border-radius:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);position:relative;transition:all .4s;}
    .hiw-card:hover{transform:translateY(-8px);border-color:rgba(99,102,241,.25);box-shadow:0 22px 55px rgba(0,0,0,.38);}
    .hiw-num{font-size:.72rem;font-weight:900;color:rgba(99,102,241,.42);letter-spacing:.15em;text-transform:uppercase;margin-bottom:1.4rem;}
    .hiw-ring{width:78px;height:78px;border-radius:50%;background:rgba(99,102,241,.1);border:2px solid rgba(99,102,241,.22);display:flex;align-items:center;justify-content:center;margin:0 auto 1.4rem;position:relative;}
    .ring-pulse{position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(99,102,241,.15);animation:rpulse 2.5s ease-in-out infinite;}
    @keyframes rpulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.12);opacity:.3}}
    .hiw-ico{font-size:2rem;position:relative;z-index:1;}.hiw-title{font-size:1.22rem;font-weight:700;margin-bottom:.7rem;}
    .hiw-desc{font-size:.92rem;color:rgba(255,255,255,.48);line-height:1.77;}
    .hiw-conn{position:absolute;top:50%;right:-1rem;width:2rem;height:2px;background:linear-gradient(90deg,rgba(99,102,241,.5),transparent);transform:translateY(-50%);}

    /* products */
    .prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;}
    .prod-card{padding:2.2rem;border-radius:22px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);position:relative;overflow:hidden;transition:all .4s;}
    .prod-card:hover{transform:translateY(-10px);box-shadow:0 32px 72px rgba(0,0,0,.42);}
    .prod-feat{background:rgba(99,102,241,.06);border-color:rgba(99,102,241,.28);}
    .prod-feat:hover{box-shadow:0 32px 72px rgba(99,102,241,.22);}
    .prod-star{position:absolute;top:-1px;right:1.4rem;background:linear-gradient(135deg,#6366f1,#a855f7);padding:.28rem .9rem;border-radius:0 0 10px 10px;font-size:.7rem;font-weight:700;color:#fff;}
    .prod-ico{width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:1.85rem;margin-bottom:1.2rem;box-shadow:0 8px 26px rgba(0,0,0,.28);}
    .prod-badge{display:inline-block;padding:.28rem .78rem;border-radius:100px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.22);font-size:.68rem;font-weight:700;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.95rem;}
    .prod-title{font-size:1.32rem;font-weight:700;margin-bottom:.7rem;}.prod-desc{font-size:.92rem;color:rgba(255,255,255,.48);line-height:1.77;margin-bottom:1.4rem;}
    .prod-list{list-style:none;display:flex;flex-direction:column;gap:.55rem;margin-bottom:1.8rem;}
    .prod-list li{display:flex;align-items:center;gap:.58rem;font-size:.9rem;color:rgba(255,255,255,.58);}
    .chk{width:20px;height:20px;border-radius:50%;flex-shrink:0;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.28);display:flex;align-items:center;justify-content:center;font-size:.62rem;color:#10b981;}
    .prod-btn{display:flex;align-items:center;justify-content:center;padding:.88rem;border-radius:12px;background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.22);color:#a5b4fc;font-weight:700;text-decoration:none;transition:all .3s;font-size:.93rem;}
    .prod-btn:hover{background:rgba(99,102,241,.18);color:#fff;}
    .prod-btn-fill{background:linear-gradient(135deg,#6366f1,#a855f7);border:none;color:#fff;box-shadow:0 6px 22px rgba(99,102,241,.38);}
    .prod-btn-fill:hover{box-shadow:0 10px 34px rgba(99,102,241,.58);transform:translateY(-2px);}

    /* testimonials */
    .testi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.65rem;}
    .testi-card{padding:2rem;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);transition:all .5s;opacity:.48;transform:scale(.97);}
    .testi-card.testi-active{opacity:1;transform:scale(1);border-color:rgba(99,102,241,.25);box-shadow:0 18px 55px rgba(0,0,0,.32);}
    .testi-stars{font-size:.94rem;color:#f59e0b;letter-spacing:2px;margin-bottom:.95rem;}
    .testi-text{font-size:.98rem;line-height:1.82;color:rgba(255,255,255,.68);margin-bottom:1.4rem;font-style:italic;}
    .testi-footer{display:flex;align-items:center;gap:1rem;}
    .testi-av{width:44px;height:44px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:#fff;}
    .testi-name{font-size:.93rem;font-weight:700;margin-bottom:.18rem;}.testi-role{font-size:.75rem;color:rgba(255,255,255,.42);}
    .testi-badge{margin-left:auto;font-size:.7rem;color:#10b981;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.18);padding:.22rem .58rem;border-radius:100px;}
    .testi-dots{display:flex;justify-content:center;gap:.55rem;margin-top:2.4rem;}
    .tdot{width:8px;height:8px;border-radius:100px;background:rgba(255,255,255,.18);border:none;cursor:pointer;padding:0;transition:all .35s;}
    .tdot.tdot-on{width:28px;background:linear-gradient(90deg,#6366f1,#a855f7);}

    /* contact */
    .contact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.65rem;margin-bottom:2.8rem;}
    .contact-card{padding:2rem 1.4rem;border-radius:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);text-align:center;transition:all .4s;}
    .contact-card:hover{transform:translateY(-8px);border-color:rgba(99,102,241,.25);box-shadow:0 22px 55px rgba(0,0,0,.35);}
    .contact-ring{width:66px;height:66px;border-radius:50%;background:rgba(99,102,241,.08);border:2px solid rgba(99,102,241,.18);display:flex;align-items:center;justify-content:center;font-size:1.75rem;margin:0 auto 1.4rem;}
    .contact-title{font-size:1.08rem;font-weight:700;margin-bottom:.7rem;}.contact-detail{font-size:.88rem;color:rgba(255,255,255,.52);margin-bottom:.32rem;}
    .contact-avail{display:inline-block;margin-top:.95rem;padding:.3rem .85rem;border-radius:100px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.18);font-size:.7rem;font-weight:700;color:#6ee7b7;}
    .bank-row{display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;padding:2rem;border-radius:18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);}
    .bank-item{display:flex;flex-direction:column;align-items:center;gap:.38rem;}
    .bank-lbl{font-size:.7rem;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.1em;}
    .bank-val{font-size:.98rem;font-weight:700;font-family:monospace;color:#a5b4fc;}

    /* cta */
    .cta-sect{position:relative;z-index:1;padding:120px 2rem;text-align:center;overflow:hidden;}
    .cta-glow-a,.cta-glow-b{position:absolute;border-radius:50%;pointer-events:none;}
    .cta-glow-a{width:700px;height:700px;background:radial-gradient(circle,rgba(99,102,241,.18),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:gp 4.5s ease-in-out infinite;}
    .cta-glow-b{width:380px;height:380px;background:radial-gradient(circle,rgba(168,85,247,.13),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:gp 4.5s ease-in-out infinite 2.2s;}
    @keyframes gp{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}
    .cta-inner{position:relative;z-index:1;max-width:680px;margin:0 auto;}
    .cta-badge{display:inline-block;padding:.42rem 1.05rem;border-radius:100px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.28);font-size:.7rem;font-weight:800;color:#a5b4fc;letter-spacing:.16em;margin-bottom:1.4rem;}
    .cta-h2{font-size:clamp(2.4rem,4.5vw,4rem);font-weight:900;line-height:1.1;letter-spacing:-2px;margin-bottom:1.4rem;}
    .cta-sub{font-size:1.08rem;color:rgba(255,255,255,.52);margin-bottom:2.4rem;}
    .cta-btns{display:flex;justify-content:center;gap:1.15rem;margin-bottom:1.8rem;flex-wrap:wrap;}
    .btn-ghost-xl{padding:1.1rem 2.4rem;border-radius:15px;color:#fff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);text-decoration:none;font-size:1.08rem;font-weight:700;transition:all .3s;}
    .btn-ghost-xl:hover{background:rgba(255,255,255,.12);transform:translateY(-2px);}
    .cta-trust-row{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;}
    .cta-trust-row span{font-size:.86rem;color:rgba(255,255,255,.42);font-weight:600;}

    /* footer */
    .footer{position:relative;z-index:1;background:rgba(4,7,18,.98);border-top:1px solid rgba(255,255,255,.055);padding:4rem 2rem 2rem;}
    .footer-top{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr 1fr;gap:2.8rem;padding-bottom:2.8rem;border-bottom:1px solid rgba(255,255,255,.055);margin-bottom:1.8rem;}
    .footer-brand{display:flex;flex-direction:column;gap:.9rem;}.footer-logo-row{display:flex;align-items:center;gap:.875rem;}
    .footer-tag{font-size:.86rem;color:rgba(255,255,255,.36);line-height:1.72;max-width:272px;}
    .footer-socials{display:flex;gap:.7rem;margin-top:.3rem;}
    .soc{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:rgba(255,255,255,.55);text-decoration:none;transition:all .3s;}
    .soc:hover{background:rgba(99,102,241,.2);border-color:rgba(99,102,241,.38);color:#a5b4fc;}
    .footer-col{display:flex;flex-direction:column;gap:.7rem;}
    .fcol-head{font-size:.75rem;font-weight:700;color:rgba(255,255,255,.58);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.42rem;}
    .fcol-link{font-size:.86rem;color:rgba(255,255,255,.38);text-decoration:none;transition:color .25s;}
    .fcol-link:hover{color:#a5b4fc;}
    .footer-bot{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;font-size:.8rem;color:rgba(255,255,255,.28);flex-wrap:wrap;gap:1rem;}
    .fbot-links{display:flex;gap:1.8rem;}
    .fbot-links a{color:rgba(255,255,255,.3);text-decoration:none;transition:color .25s;}
    .fbot-links a:hover{color:#a5b4fc;}

    /* responsive */
    @media(max-width:1200px){
      .hero-wrap{grid-template-columns:1fr;gap:3rem;}.hero-right{display:none;}
      .feat-grid,.prod-grid{grid-template-columns:repeat(2,1fr);}
      .contact-grid{grid-template-columns:repeat(2,1fr);}
      .footer-top{grid-template-columns:repeat(3,1fr);}
    }
    @media(max-width:768px){
      .nav-links,.nav-cta{display:none;}.burger{display:flex;}
      .hero{padding:100px 1.5rem 55px;}.sect{padding:70px 1.5rem;}
      .feat-grid,.prod-grid,.hiw-grid,.testi-grid{grid-template-columns:1fr;}
      .contact-grid{grid-template-columns:1fr;}
      .hero-btns{flex-direction:column;}
      .btn-primary,.btn-outline{justify-content:center;}
      .cta-btns{flex-direction:column;align-items:center;}
      .footer-top{grid-template-columns:1fr;}
      .footer-bot{flex-direction:column;text-align:center;}
      .bank-row{flex-direction:column;align-items:center;gap:1.4rem;}
      .hiw-conn{display:none;}
    }
  \`]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private platformId = inject(PLATFORM_ID);

  private _destroyed = false;
  private _animFrame = 0;
  private _observers: IntersectionObserver[] = [];
  private _testiTimer: ReturnType<typeof setInterval>  | null = null;
  private _typeTimer:  ReturnType<typeof setTimeout>   | null = null;
  private _scrollFn = () => this._onScroll();

  isScrolled     = signal(false);
  mobileOpen     = signal(false);
  heroReady      = signal(false);
  scrollProgress = signal(0);
  activeTesti    = signal(0);
  typedText      = signal('Digital Banking');
  tiltX          = signal(0);
  tiltY          = signal(0);

  visualTransform = computed(() =>
    \`perspective(1200px) rotateX(\${this.tiltY()}deg) rotateY(\${this.tiltX()}deg)\`
  );

  avatarColors = ['#6366f1','#a855f7','#3b82f6','#10b981','#f59e0b'];

  liveStats = [
    { value:'1M+',     label:'Active Users' },
    { value:'₹500Cr+', label:'Transactions' },
    { value:'99.9%',   label:'Uptime' },
    { value:'4.9★',    label:'App Rating' },
    { value:'10',      label:'Loan Types' },
    { value:'24/7',    label:'Support' },
    { value:'< 2s',    label:'Transfer Speed' },
    { value:'0%',      label:'Transfer Fees' },
  ];

  tickerItems = [...this.liveStats, ...this.liveStats];

  features = [
    { icon:'⚡', title:'Instant Transfers',     desc:'Send money in seconds via UPI, IMPS and NEFT. Available 24/7 with real-time confirmation.',                    tags:['UPI','IMPS','24/7'],           grad:'linear-gradient(135deg,#6366f1,#a855f7)', glow:'radial-gradient(circle at 50% 0%,rgba(99,102,241,.32),transparent 68%)' },
    { icon:'📊', title:'Smart Analytics',       desc:'AI-powered spending insights with auto-categorisation, budget goals and trend charts.',                         tags:['AI Insights','Budgets'],       grad:'linear-gradient(135deg,#3b82f6,#06b6d4)', glow:'radial-gradient(circle at 50% 0%,rgba(59,130,246,.32),transparent 68%)' },
    { icon:'🔒', title:'Bank-Grade Security',   desc:'BCrypt encryption, JWT auth, OTP verification and full RBI-compliant KYC onboarding.',                         tags:['JWT','BCrypt','KYC'],          grad:'linear-gradient(135deg,#10b981,#059669)', glow:'radial-gradient(circle at 50% 0%,rgba(16,185,129,.32),transparent 68%)' },
    { icon:'🎁', title:'Premium Rewards',       desc:'Earn points on every transaction. Redeem for cashback, travel perks and exclusive vouchers.',                  tags:['Cashback','Points'],          grad:'linear-gradient(135deg,#f59e0b,#ea580c)', glow:'radial-gradient(circle at 50% 0%,rgba(245,158,11,.32),transparent 68%)' },
    { icon:'🧾', title:'One-Tap Bill Pay',       desc:'Pay electricity, water, internet and gas bills in one tap. Never miss a due date again.',                      tags:['Utilities','Auto-pay'],        grad:'linear-gradient(135deg,#ec4899,#be123c)', glow:'radial-gradient(circle at 50% 0%,rgba(236,72,153,.32),transparent 68%)' },
    { icon:'💳', title:'Virtual Cards',         desc:'Instantly generate disposable virtual debit cards for ultra-secure online shopping.',                          tags:['Virtual','Secure'],           grad:'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow:'radial-gradient(circle at 50% 0%,rgba(139,92,246,.32),transparent 68%)' },
  ];

  steps = [
    { n:'01', icon:'📝', title:'Create Account', desc:'Register with Aadhaar & PAN. Complete full KYC in under 5 minutes from anywhere.' },
    { n:'02', icon:'✅', title:'Get Verified',    desc:'Our system verifies your KYC instantly. Your account goes live right away.' },
    { n:'03', icon:'🚀', title:'Start Banking',   desc:'Transfer funds, pay bills, apply for loans and earn rewards — all in one app.' },
  ];

  products = [
    { icon:'💰', title:'Savings Account', badge:'Zero Balance', featured:false, desc:'Digital savings with competitive interest and instant activation.',              grad:'linear-gradient(135deg,#10b981,#059669)', features:['No minimum balance','Up to 7% interest p.a.','Free debit card','Instant activation'] },
    { icon:'💎', title:'Premium Account', badge:'Most Popular',  featured:true,  desc:'All-in-one premium banking with rewards, analytics and priority support.',       grad:'linear-gradient(135deg,#6366f1,#a855f7)', features:['Unlimited transfers','Rewards on every ₹ spent','Dedicated manager','Airport lounge access'] },
    { icon:'🏠', title:'Home Loans',      badge:'From 8.5%',    featured:false, desc:'Affordable home loans with flexible tenure and fully digital approval.',         grad:'linear-gradient(135deg,#f59e0b,#d97706)', features:['Up to ₹1 Crore','Tenure up to 30 years','No prepayment penalty','100% online process'] },
  ];

  testimonials = [
    { name:'Priya Sharma',  role:'Software Engineer, Bangalore',     initials:'PS', color:'#6366f1', text:"NeoBank transformed how I manage money. Instant transfers and reward points are incredible. I've saved over ₹12,000 in bank fees this year alone!" },
    { name:'Rahul Verma',   role:'Business Owner, Mumbai',            initials:'RV', color:'#10b981', text:'Applied for a business loan and got approved within 24 hours — completely online. NeoBank is genuinely the future of banking in India.' },
    { name:'Ananya Patel',  role:'Chartered Accountant, Ahmedabad',  initials:'AP', color:'#f59e0b', text:'The spending analytics are next-level. I can see exactly where my money goes, set budget goals and track savings. Like a personal finance advisor.' },
    { name:'Kiran Raj',     role:'Doctor, Chennai',                   initials:'KR', color:'#ec4899', text:'Security is top-notch. BCrypt passwords, JWT tokens, OTP on every transaction. I feel completely safe. Customer support is also absolutely outstanding.' },
  ];

  contacts = [
    { icon:'📞', title:'Phone Support', details:['1800-123-4567 (Toll Free)','+91 80 4567 8901'], avail:'24/7 Available' },
    { icon:'✉️', title:'Email Support', details:['support@neobank.in','help@neobank.in'],        avail:'< 2 hour response' },
    { icon:'📍', title:'Head Office',   details:['NeoBank Tower, BKC','Mumbai 400051'],          avail:'Mon–Sat 9:30–6:00' },
    { icon:'💬', title:'Live Chat',     details:['Instant resolution','Expert guidance 24/7'],   avail:'Always Online' },
  ];

  bankCodes = [
    { label:'IFSC Code',   value:'NEOB0000001' },
    { label:'SWIFT Code',  value:'NEOBINBB' },
    { label:'RBI Licence', value:'RBI/2020-21/DL-12345' },
  ];

  footerCols = [
    { head:'Products', links:['Savings Account','Current Account','Fixed Deposits','Personal Loans','Home Loans'] },
    { head:'Company',  links:['About Us','Careers','Press Kit','Investors','Blog'] },
    { head:'Support',  links:['Help Center','Documentation','API Docs','Status Page','FAQs'] },
    { head:'Legal',    links:['Privacy Policy','Terms of Service','Cookie Policy','Compliance','Grievance'] },
  ];

  private _words    = ['Digital Banking','Smart Finance','Instant Transfers','Smart Saving'];
  private _wordIdx  = 0;
  private _charIdx  = 0;
  private _deleting = false;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this._scrollFn);
    setTimeout(() => this.heroReady.set(true), 120);
    this._typeStep();
    this._testiTimer = setInterval(
      () => this.activeTesti.update(i => (i + 1) % this.testimonials.length), 4800
    );
    setTimeout(() => this._setupReveal(), 300);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) this._initParticles();
  }

  ngOnDestroy() {
    this._destroyed = true;
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this._scrollFn);
    cancelAnimationFrame(this._animFrame);
    if (this._testiTimer) clearInterval(this._testiTimer);
    if (this._typeTimer)  clearTimeout(this._typeTimer);
    this._observers.forEach(o => o.disconnect());
  }

  private _onScroll() {
    this.isScrolled.set(window.scrollY > 50);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress.set(h > 0 ? (window.scrollY / h) * 100 : 0);
  }

  onMouseMove(e: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
    const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    this.tiltX.set(dx * 6);
    this.tiltY.set(-dy * 4);
  }

  private _typeStep() {
    const word = this._words[this._wordIdx];
    if (this._deleting) {
      this._charIdx--;
      this.typedText.set(word.substring(0, this._charIdx));
      if (this._charIdx === 0) {
        this._deleting = false;
        this._wordIdx  = (this._wordIdx + 1) % this._words.length;
        this._typeTimer = setTimeout(() => this._typeStep(), 520);
        return;
      }
    } else {
      this._charIdx++;
      this.typedText.set(word.substring(0, this._charIdx));
      if (this._charIdx === word.length) {
        this._deleting  = true;
        this._typeTimer = setTimeout(() => this._typeStep(), 2400);
        return;
      }
    }
    this._typeTimer = setTimeout(() => this._typeStep(), this._deleting ? 52 : 92);
  }

  private _setupReveal() {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    this._observers.push(io);
  }

  private _initParticles() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type P = { x:number; y:number; vx:number; vy:number; r:number; op:number };
    const pts: P[] = Array.from({ length: 58 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - .5) * .32,
      vy: (Math.random() - .5) * .32,
      r:  Math.random() * 1.6 + .4,
      op: Math.random() * .42 + .08,
    }));
    const draw = () => {
      if (this._destroyed) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(99,102,241,\${p.op})\`; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 125) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = \`rgba(99,102,241,\${.13 * (1 - d / 125)})\`;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
      this._animFrame = requestAnimationFrame(draw);
    };
    draw();
  }
}
`;

fs.writeFileSync(TARGET, CONTENT, 'utf8');
console.log('✅ landing.component.ts written successfully!');
console.log('📁 Path:', TARGET);
console.log('📏 Size:', fs.statSync(TARGET).size, 'bytes');
