## Available Services & Credentials

Check these locations for available API keys and credentials:

```bash
# Primary credential store
cat ~/ghl-automation/.env | grep -E "(TOKEN|KEY|SECRET|ID)" | sed 's/=.*/=***/'
```

**Known available services:**
- Cloudflare (limited permissions - no DNS edit on some zones)
- GitHub (ghp_ token)
- GHL API (private API with m_a cookie auth)
- Gmail OAuth (for OTP fetching)
- Deja API
- Mailgun
- Twilio

---


## Git Commit Guidelines

- All commits must be authored by: Jordan Coeyman <coeyman@gmail.com>
- Do NOT add co-authored-by lines
- Do NOT use default VM user (exedev@workbot.exe.xyz)
- Git config is set globally, but verify before pushing

```bash
git config --global user.name "Jordan Coeyman"
git config --global user.email "coeyman@gmail.com"
```
