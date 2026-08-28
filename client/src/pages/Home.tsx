import { useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Clock3, Facebook, Instagram, MapPin, Menu as MenuIcon, Phone, Scissors, Search, Star, X } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP = "919369722736";
const phoneHref = "tel:+919369722736";
const mapHref = "https://www.google.com/maps/search/?api=1&query=The+Pizza+Lover%27s+Takiya+Rd+Patan+Takiya+Uttar+Pradesh+209867";
const heroImage = "/assets/pizza-cutting-hero.webp";
const detailImage = "/assets/pizza-detail.webp";
const snacksImage = "/assets/snacks-spread.webp";
const markImage = "/assets/pizza-mark.webp";

type MenuItem = { name: string; price: string; category: string; tag?: string; image?: string };
const menu: MenuItem[] = [
  { name: "Cheese Pizza", price: "S ₹75 · M ₹165 · L ₹265", category: "Pizza", tag: "Popular", image: detailImage },
  { name: "Mozzarella Cheese Pizza", price: "S ₹75 · M ₹165 · L ₹265", category: "Pizza", image: heroImage },
  { name: "Tomato & Cheese Pizza", price: "S ₹75 · M ₹165 · L ₹265", category: "Pizza" },
  { name: "Onion & Cheese Pizza", price: "S ₹75 · M ₹165 · L ₹265", category: "Pizza" },
  { name: "Loaded Cheese Pizza", price: "S ₹135 · M ₹265 · L ₹365", category: "Special Pizza", tag: "Best seller", image: heroImage },
  { name: "Pizza Indiana", price: "S ₹135 · M ₹265 · L ₹365", category: "Special Pizza" },
  { name: "Masala Paneer", price: "S ₹135 · M ₹265 · L ₹365", category: "Special Pizza" },
  { name: "Dark Spicy", price: "S ₹175 · M ₹335 · L ₹465", category: "Special Pizza", tag: "Spicy" },
  { name: "Veg. Momos", price: "₹39", category: "Sides", image: snacksImage },
  { name: "Paneer Tikka", price: "₹49", category: "Sides" },
  { name: "Cheese Garlic Bread", price: "₹80", category: "Sides" },
  { name: "French Fries", price: "₹39", category: "Sides", image: snacksImage },
  { name: "Veg. Maggi", price: "₹39", category: "Quick Bites" },
  { name: "Cold Coffee", price: "₹49", category: "Quick Bites" },
  { name: "Veg. Burger", price: "₹29", category: "Quick Bites", image: snacksImage },
  { name: "Cheese Burger", price: "₹49", category: "Quick Bites" },
  { name: "White Pasta", price: "₹79", category: "Quick Bites" },
  { name: "Medium Pizza + 2 Coke", price: "₹209", category: "Combos", tag: "Best deal", image: heroImage },
  { name: "Burger, Fingers, Cold Drink Combo", price: "₹99", category: "Combos", tag: "Best deal", image: snacksImage },
  { name: "Veg Combo Double", price: "₹269", category: "Combos", tag: "Best deal" },
];
const categories = ["All", "Pizza", "Special Pizza", "Combos", "Sides", "Quick Bites"];

function orderLink(item: string) { return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi The Pizza Lover's! I would like to order ${item}.`)}`; }
function scrollToId(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const filtered = useMemo(() => menu.filter((item) => (activeCategory === "All" || item.category === activeCategory) && item.name.toLowerCase().includes(search.toLowerCase())), [activeCategory, search]);

  return <div className="site-shell">
    <header className="site-nav">
      <a className="brand" href="#home" aria-label="The Pizza Lover's home"><img src={markImage} alt="" /><span>THE PIZZA<br /><em>LOVER'S</em></span></a>
      <nav className={mobileOpen ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
        {["Home", "Menu", "Combos", "About", "Reviews", "Location", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{link}</a>)}
        <a className="nav-order" href={orderLink("a delicious meal")} target="_blank" rel="noreferrer">Order Now <ArrowUpRight size={15} /></a>
      </nav>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <MenuIcon />}</button>
    </header>

    <main id="home">
      <section className="hero section-pad">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Fresh from the counter · Patan</p>
          <h1>Cut into<br /><span>something good.</span></h1>
          <p className="hero-intro">Hand-stretched vegetarian pizza, baked hot and sliced fresh for the people you love.</p>
          <div className="hero-actions"><button className="button button-primary" onClick={() => scrollToId("menu")}>Choose your slice <ArrowUpRight size={17} /></button><a className="button button-ink" href={orderLink("a delicious meal")} target="_blank" rel="noreferrer">Order on WhatsApp <ArrowUpRight size={17} /></a></div>
          <div className="hero-badges"><span><Scissors size={15} /> Cut fresh, always</span><span><Check size={15} /> 100% Veg</span><span><span className="rupee">₹</span> Friendly prices</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <img src={heroImage} alt="A hand cutting a fresh vegetarian pizza with a brass pizza cutter" />
          <div className="hero-stamp"><strong>100%</strong><span>VEG<br />& FRESH</span></div>
          <div className="hero-caption"><Scissors size={16} /> The first cut is yours</div>
          <div className="hero-note"><span>01</span><strong>Made to<br />be shared.</strong></div>
        </div>
      </section>

      <section className="intro-band"><div className="section-pad intro-inner"><div className="ticket-label">A little about us</div><p>Welcome to <strong>The Pizza Lover's</strong> — your local destination for delicious, freshly prepared vegetarian pizzas, snacks, drinks and café favourites.</p><div className="intro-mark">✦</div></div></section>

      <section className="menu-section section-pad" id="menu"><div className="section-heading"><div><p className="eyebrow">The good stuff</p><h2>Pick your craving.</h2></div><p className="heading-note">Every order is made fresh, hot and with a little extra love.</p></div>
        <div className="menu-tools"><div className="category-tabs">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the menu" aria-label="Search the menu" /></label></div>
        <div className="menu-grid">{filtered.map((item, index) => <article className={item.image ? "menu-card menu-card-image" : "menu-card"} key={item.name} style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>{item.image && <img src={item.image} alt="" />}{item.tag && <span className="item-tag">{item.tag}</span>}<div className="menu-card-body"><span className="item-category">{item.category}</span><h3>{item.name}</h3><p className="price">{item.price}</p><a className="mini-order" href={orderLink(item.name)} target="_blank" rel="noreferrer">Order this <ArrowUpRight size={14} /></a></div></article>)}</div>
        {!filtered.length && <div className="empty-state">No cravings found for “{search}”. Try another search or category.</div>}
      </section>

      <section className="feature-split" id="combos"><div className="feature-image"><img src={snacksImage} alt="Vegetarian burgers, momos and fries on a café table" /></div><div className="feature-copy"><p className="eyebrow">Good food, better value</p><h2>Make it a<br /><span>combo.</span></h2><p>Bring your people, pick your favourites, and save a little while you’re at it. Our best deals are made for sharing.</p><div className="deal-list"><div><span className="deal-badge">BEST DEAL</span><strong>Medium Pizza + 2 Coke</strong><b>₹209</b></div><div><span className="deal-badge">BEST DEAL</span><strong>Burger, Fingers, Cold Drink</strong><b>₹99</b></div><div><span className="deal-badge">BEST DEAL</span><strong>Veg Combo Double</strong><b>₹269</b></div></div><a className="text-link" href={orderLink("a combo deal")} target="_blank" rel="noreferrer">Order a combo <ArrowUpRight size={16} /></a></div></section>

      <section className="about-section section-pad" id="about"><div className="about-copy"><p className="eyebrow">Why locals come back</p><h2>Made for pizza<br /><span>lovers.</span></h2><p>From the first cheesy bite to the last sip, we keep things fresh, flavourful and easy on the pocket. A friendly vegetarian café in Patan for family dinners, student hangouts and birthday plans.</p><a className="text-link" href={phoneHref}>Call the counter <Phone size={16} /></a></div><div className="perks-grid">{[["100%", "Vegetarian"], ["♥", "Family friendly"], ["✦", "Birthday friendly"], ["₹", "Affordable pricing"], ["↗", "Takeaway available"]].map(([icon, text]) => <div className="perk" key={text}><span>{icon}</span><strong>{text}</strong></div>)}</div></section>

      <section className="reviews-section" id="reviews"><div className="section-pad reviews-inner"><div><p className="eyebrow">Kind words</p><h2>Small words.<br /><span>Big smiles.</span></h2></div><div className="rating-card"><div className="rating-number">4.3<span>/5</span></div><div><div className="stars">★★★★★</div><p>58 Reviews</p></div></div><div className="review-grid">{["Best experience", "Best ♥", "Nice", "Just ok"].map((review) => <blockquote key={review}>“{review}”</blockquote>)}</div></div></section>

      <section className="location-section section-pad" id="location"><div className="location-copy"><p className="eyebrow">Find us in Patan</p><h2>Come hungry.<br /><span>Leave happy.</span></h2><p className="address"><MapPin size={19} /> The Pizza Lover's,<br />Takiya Rd, Patan, Takiya,<br />Uttar Pradesh 209867</p><div className="location-actions"><a className="button button-primary" href={mapHref} target="_blank" rel="noreferrer">Get Directions <ArrowUpRight size={16} /></a><a className="button button-outline" href={phoneHref}>Call Now <Phone size={16} /></a></div><p className="hours"><Clock3 size={17} /> Open daily · 10:00 AM – 10:00 PM</p></div><div className="map-card"><iframe title="Map showing The Pizza Lover's in Takiya, Patan" src="https://www.google.com/maps?q=The+Pizza+Lover%27s,+Takiya+Rd,+Patan,+Uttar+Pradesh+209867&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-pin"><MapPin size={19} fill="currentColor" /></div></div></section>

      <section className="contact-section section-pad" id="contact"><div><p className="eyebrow">Let's make it easy</p><h2>Tell us what<br /><span>you’re craving.</span></h2></div><form className="contact-form" onSubmit={(e) => { e.preventDefault(); toast.success("Thanks! We’ll get back to you soon."); (e.target as HTMLFormElement).reset(); }}><label>Your name<input name="name" placeholder="What should we call you?" required /></label><label>How can we help?<textarea name="message" placeholder="A table, a birthday plan, or a big pizza order?" rows={3} required /></label><button className="button button-ink" type="submit">Send enquiry <ArrowUpRight size={16} /></button></form></section>
    </main>

    <footer className="footer"><div className="footer-brand"><img src={markImage} alt="" /><div><strong>THE PIZZA LOVER'S</strong><span>Eat With Love ♥</span></div></div><p>Vegetarian restaurant<br />Takiya, Patan, Uttar Pradesh</p><div className="footer-links"><a href="#menu">Menu</a><a href="#about">About</a><a href={orderLink("a delicious meal")} target="_blank" rel="noreferrer">WhatsApp</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a></div><small>© 2026 The Pizza Lover's · Made with love in Patan</small></footer>
    <a className="floating-whatsapp" href={orderLink("a delicious meal")} target="_blank" rel="noreferrer" aria-label="Order on WhatsApp">◔<span>Order on WhatsApp</span></a>
    <button className="back-top" onClick={() => scrollToId("home")} aria-label="Back to top"><ChevronDown size={18} /></button>
  </div>;
}
