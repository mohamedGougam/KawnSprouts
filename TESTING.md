# 🌱 Kawn Sprouts — Integration Testing

Complete test cases for the Kawn backend ↔ Sprouts game integration. Run in order after the integration sprint is deployed.

---

## Prerequisites

- [ ] Backend running, `sprouts/` migrations applied
- [ ] KawnSprouts deployed on Vercel
- [ ] Flutter app built with `kawnToken` + `apiBase` params injected

---

## TEST 1 — Identity Injection

Player name/age/avatar matches real Kawn profile.

```
Open Kawn → tap Sprouts → check Profile screen
✅ Pass: Shows your real Kawn name and age
❌ Fail: Shows "Player" or age = 0
```

**Debug:**
```js
new URLSearchParams(window.location.search).get('kawnToken') // must not be null
```

---

## TEST 2 — State Saves to Backend

Progress survives clearing localStorage.

```
1. Play: name your sprout "TestSprout999", collect gold
2. DevTools → Application → LocalStorage → DELETE kawn-sprouts-game-state
3. Hard refresh (Ctrl+Shift+R)
✅ Pass: Sprout still named "TestSprout999"
❌ Fail: Game resets to onboarding
```

**Backend check:**
```python
from sprouts.models import SproutState
state = SproutState.objects.get(user=user)
print(state.state['sprout']['name'])  # → "TestSprout999"
```

---

## TEST 3 — Cross-Device Sync

Same game state on two devices.

```
1. Device A: name sprout "CrossDeviceTest", spend 50 gold, wait 10s
2. Device B: log in with same Kawn account, open Sprouts
✅ Pass: Device B shows "CrossDeviceTest" + same balance
❌ Fail: Device B shows fresh default state
```

---

## TEST 4 — Daily Login Reward

Logging into Kawn gives the sprout a reward.

```
1. Open Sprouts, leave running
2. Log out of Kawn and log back in
3. Return to Sprouts, wait 30s
✅ Pass: "Daily login" notification appears, sprout stats up
❌ Fail: No notification after 60s
```

**Backend check:**
```python
from sprouts.models import DailyLoginRewardTracker
from datetime import date
DailyLoginRewardTracker.objects.filter(user=user, date=date.today()).count()
# → 1 (not 0, not 2+)
```

---

## TEST 5 — Post Created Reward

Creating a Kawn post boosts sprout growth.

```
1. Open Sprouts, leave running
2. Create a new post in Kawn
3. Return to Sprouts, wait 30s
✅ Pass: Growth notification appears
❌ Fail: Nothing happens after 60s
```

---

## TEST 6 — Like Received Reward

Getting liked boosts sprout happiness.

```
1. Open Sprouts, note happiness value
2. (Second account) like one of your posts
3. Wait 30s in Sprouts
✅ Pass: Happiness increased, notification shown
❌ Fail: No change
```

---

## TEST 7 — Comment Rewards

### 7A — You Comment (COMMENT_CREATED)
```
Leave a comment on any post → Sprouts kindness increases within 30s
```

### 7B — You Receive a Comment (POSITIVE_COMMENT_RECEIVED)
```
Second account comments on your post → Sprouts happiness increases within 30s
```

---

## TEST 8 — Real Friends in Village

Mutual Kawn follows appear as village residents.

```
1. Ensure 2+ mutual follows on Kawn
2. Open Sprouts → Village view
✅ Pass: Real friends visible with real names
❌ Fail: Empty village or generic placeholders
```

**API check:**
```bash
curl http://20.119.99.223/sprouts/identity/ \
  -H "Authorization: Bearer TOKEN"
# → "friends" array lists mutual follows
```

---

## TEST 9 — Friend Cottage Shows Real Furniture

```
1. Friend buys a cottage item in Sprouts
2. You enter their cottage in the village
✅ Pass: Their purchased item is visible
❌ Fail: Empty/default room
```

**Security check (CRITICAL):**
```bash
curl http://20.119.99.223/sprouts/friends/NON_FRIEND_ID/cottage/ \
  -H "Authorization: Bearer TOKEN"
# → MUST return 403 Forbidden
```

---

## TEST 10 — Daily Login Fires Once Only

Reward doesn't stack on multiple logins.

```
1. Log out and back in 3 times in a row
2. Open Sprouts, wait 30s
✅ Pass: Only ONE notification appears
❌ Fail: 3 notifications stack up
```

---

## TEST 11 — Offline Resilience

Game works without internet, syncs on reconnect.

```
1. Open Sprouts, play normally
2. Enable Airplane Mode
3. Keep playing (water, collect, move)
✅ Pass (offline): Game works, no crashes
4. Disable Airplane Mode, wait 10s
✅ Pass (back online): Offline progress saved to server
❌ Fail: Crash errors offline, or offline progress lost
```

---

## TEST 12 — Version Migration

Old saves load correctly after a version bump.

```python
# Force an old version in Django shell
state = SproutState.objects.get(user=user)
state.state['version'] = 4
state.version = 4
state.save()
```
```
Open Sprouts
✅ Pass: Game loads, data preserved, version upgraded
❌ Fail: Crash or data wipe
```

---

## 🚦 Sanity Checklist

| # | Test | Pass Condition |
|---|---|---|
| 1 | Identity | Real name + age in game |
| 2 | localStorage deleted | Progress loads from server |
| 3 | Cross-device | Same state on 2 devices |
| 4 | Daily login reward | Notification within 30s |
| 5 | Post created | Growth boost within 30s |
| 6 | Like received | Happiness boost within 30s |
| 7A | Comment sent | Kindness boost within 30s |
| 7B | Comment received | Separate notification |
| 8 | Friends list | Real mutual follows shown |
| 9 | Friend cottage | Real furniture visible |
| 9b | Non-friend cottage | Returns `403` |
| 10 | Login dedup | Only 1 reward for 3 logins |
| 11 | Offline | Game works, syncs on reconnect |
| 12 | Version migration | Old save loads cleanly |

---

## 🛠 Backend Debug

```bash
# Django shell quick checks
python manage.py shell

from sprouts.models import SproutState, PendingActivityEvent, DailyLoginRewardTracker
from accounts.models import CustomUser
from datetime import date

user = CustomUser.objects.get(username='YOUR_USERNAME')

SproutState.objects.filter(user=user).values('version', 'updated_at')
PendingActivityEvent.objects.filter(user=user).values('event_type', 'created_at')
DailyLoginRewardTracker.objects.filter(user=user, date=date.today()).exists()
```

```bash
# Run sprouts unit tests
python manage.py test sprouts
```

---

## 📋 Activity Events Reference

| Kawn Action | Event | Sprout Effect |
|---|---|---|
| Login (once/day) | `DAILY_LOGIN` | Streak + growth |
| Create post | `POST_CREATED` | Growth points |
| Leave comment | `COMMENT_CREATED` | Kindness |
| Receive comment | `POSITIVE_COMMENT_RECEIVED` | Happiness |
| Post gets liked | `POST_LIKED` | Happiness |
| Visit friend profile | `FRIEND_VISIT` | ⚠️ Not wired yet |
| Join community | `COMMUNITY_WELCOME` | ⚠️ Not wired yet |

---

*Kawn Sprouts v1 Integration — July 2026*
