# ⬡ LodgeKonnect v2

> Find your lodge. Find your people. — The lodge & roommate finder for FUTO students.

A full-stack web app connecting Federal University of Technology Owerri (FUTO) students with off-campus lodge listings in Eziobodo and Umuchima, and with compatible roommates.

---

## Features

- 🏠 **Browse lodges** — search and filter by location, price, gender preference, amenities
- 📸 **Photo galleries** — lightbox image previews for each lodge
- 🤝 **Roommate matching** — student opt-in profiles with lifestyle preferences
- 🔔 **Notifications** — real-time alerts for new lodges and matches
- ❤️ **Favourites** — save lodges for later comparison
- 🏢 **Caretaker dashboard** — post, edit, delete lodge listings with photo uploads
- 🔐 **Secure auth** — token-based sessions, bcrypt passwords, MIME-validated uploads

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — glassmorphism design system |
| Backend | PHP 8+ (PDO, prepared statements) |
| Database | MySQL 8+ |

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/lodgekonnect.git
cd lodgekonnect
```

### 2. Create the database
```bash
mysql -u root -p < schema.sql
```

### 3. Configure credentials
```bash
cp api/config.example.php api/config.php
# Edit api/config.php with your DB host, name, user, and password
```

### 4. Set permissions on upload directories
```bash
chmod 755 uploads/lodges uploads/profiles
```

### 5. Serve with PHP or Apache/Nginx
```bash
# Quick local test:
php -S localhost:8000

# Or point your Apache/Nginx virtual host to the project root
```

### 6. Open in browser
```
http://localhost:8000
```

---

## Project Structure

```
lodgekonnect/
├── api/
│   ├── config.php          ← DB config (not in git)
│   ├── config.example.php  ← Template — copy to config.php
│   ├── register.php        ← User registration
│   ├── login.php           ← Auth & token issue
│   ├── logout.php          ← Token invalidation
│   ├── verify.php          ← Token check
│   ├── lodges.php          ← GET list / POST new lodge
│   ├── lodge_update.php    ← Update lodge (caretaker auth)
│   ├── lodge_delete.php    ← Delete lodge (caretaker auth)
│   ├── profile.php         ← GET/POST user profile
│   ├── roommates.php       ← GET student matching profiles
│   └── notifications.php  ← GET/mark notifications
├── assets/
│   ├── css/main.css        ← Design system & components
│   └── js/app.js           ← Shared utilities (API, Auth, toast, etc.)
├── uploads/
│   ├── lodges/             ← Lodge photos (excluded from git)
│   └── profiles/           ← Profile photos (excluded from git)
├── index.html              ← Landing page
├── login.html              ← Login
├── signup.html             ← Registration (3-step wizard)
├── dashboard.html          ← Student dashboard
├── dashboardcaretaker.html ← Caretaker dashboard
└── schema.sql              ← Full DB schema
```

---

## Security highlights (v2 improvements)

- All write endpoints require a valid Bearer token verified against the DB
- File uploads validated by real MIME type (`finfo`), not just extension
- Passwords hashed with `bcrypt` cost 12
- Tokens invalidated in the DB on logout
- CORS restricted to configured origin
- Error details never exposed to the client in production
- No hardcoded credentials — everything via `config.php`

---

## License

MIT — built as a final year project at FUTO, now open for the community.
