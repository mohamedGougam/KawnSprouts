# 🧪 Kawn Sprouts — End-to-End Local & Production Integration Testing Guide

Complete use case testing guide for verifying the **Django Backend ↔ KawnSprouts Web Game ↔ Flutter Mobile App** integration.

This guide is structured for both **Local Wi-Fi Testing (1 PC + 1 Physical Phone)** and **Production Environment Verification**.

---

## 🛠️ Section 1: Local Test Setup (1 PC + 1 Physical Phone)

### Network Configuration:
- **PC & Phone Wi-Fi:** Connected to the SAME local Wi-Fi network.
- **PC Wi-Fi IPv4 Address:** `192.168.147.181`

### Step 1: Configure Flutter App ([sprouts_screen.dart](file:///c:/Users/anesb/Desktop/anesdev/kawn/kawn-frontend/lib/widgets/screens/social_groups/games/sprouts_screen.dart))
Update the base URLs to point to your PC's IP address:
```dart
// For local testing:
static const _sproutsBaseUrl = 'http://192.168.147.181:5173/';

// Inside _buildSproutsUrl():
buffer.write('&apiBase=${Uri.encodeComponent("http://192.168.147.181:8000")}');
```

### Step 2: Start Django Backend (bound to 0.0.0.0)
```powershell
cd c:\Users\anesb\Desktop\anesdev\kawn\kawn-backend
python manage.py runserver 0.0.0.0:8000
```

### Step 3: Start KawnSprouts Vite Dev Server (with host flag)
```powershell
cd c:\Users\anesb\Desktop\anesdev\kawn\KawnSprouts
npx vite --host 0.0.0.0
```

### Step 4: Run Flutter App on Physical Phone
```powershell
cd c:\Users\anesb\Desktop\anesdev\kawn\kawn-frontend
flutter run
```

---

## 🌐 Section 2: Production Deployment Setup

When deploying to production, revert `sprouts_screen.dart` settings to:
```dart
static const _sproutsBaseUrl = 'https://kawn-sprouts.vercel.app/';

// Inside _buildSproutsUrl():
buffer.write('&apiBase=${Uri.encodeComponent("http://20.119.99.223")}');
```

---

## 🧪 Section 3: Integration Use Cases Test Suite

Run these test cases sequentially to verify complete feature integration:

---

### USE CASE 1 — Real Identity & Friends Injection ✅
**Goal:** Verify the game loads your real Kawn user profile (display name, age, avatar) and your actual Kawn mutual friends list.

**Steps:**
1. Log into your Kawn account on your phone.
2. Tap **Kawn Sprouts** in the Game Hub.
3. Open the **Profile** screen inside the game.

**Expected Results:**
- Display Name matches your logged-in Kawn account.
- Age matches your Kawn user profile.
- Friends list inside Sprout Hollow displays your mutual Kawn followers.

**Local Backend Verification:**
```powershell
curl -X GET http://192.168.147.181:8000/sprouts/identity/ -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### USE CASE 2 — Game State Server Sync (Backend Persistence) ✅
**Goal:** Verify that game progress saves directly to the Django backend database instead of browser `localStorage`.

**Steps:**
1. Open Sprouts on your phone, water your sprout, buy a shop item, and rename your sprout (e.g. `"SproutLocal1"`).
2. Wait 5 seconds for the debounced auto-save (`PUT /sprouts/state/`) to complete.
3. Clear browser cache/data on the phone or open DevTools and delete `kawn-sprouts-game-state` key from `localStorage`.
4. Re-open Sprouts inside the Flutter app.

**Expected Results:**
- The sprout is still named `"SproutLocal1"`.
- All currency, inventory, and garden progress are restored from the Django backend.

**Django DB Shell Check:**
```python
from sprouts.models import SproutState
from accounts.models import CustomUser

user = CustomUser.objects.first()
print(SproutState.objects.get(user=user).state['sprout']['name'])
# Should print: 'SproutLocal1'
```

---

### USE CASE 3 — Cross-Device Sync ✅
**Goal:** Verify game progress is identical when logging in from a second device or browser.

**Steps:**
1. On **Phone**, change sprout name to `"DeviceSyncTest"` and spend 50 coins.
2. Wait 5 seconds.
3. Log into the same Kawn account on a second device or browser session.

**Expected Results:**
- Second device loads the exact same sprout name (`"DeviceSyncTest"`) and updated coin balance.

---

### USE CASE 4 — Daily Login Reward Integration ✅
**Goal:** Verify logging into Kawn queues a `DAILY_LOGIN` reward event.

**Steps:**
1. Open Sprouts on your phone and note current sprout stats.
2. Log out of Kawn and log back in (or run `enqueue_daily_login_if_new(user)` in Django shell).
3. Open Sprouts and wait up to **30 seconds** (poll interval).

**Expected Results:**
- In-game notification appears: *"Daily login reward!"*
- Sprout happiness and growth stats increase.
- Logging in again on the same calendar day does **not** duplicate the reward (deduplication check).

---

### USE CASE 5 — Real-Time Social Rewards (Post, Like, Comment) ✅

**Goal:** Verify social actions in Kawn feed reward the sprout in real-time.

#### 5A: Creating a Post (`POST_CREATED`)
1. Leave Sprouts open on your phone.
2. Create a new post in the Kawn app feed.
3. **Result within 30s:** Notification appears in Sprouts: *"Kawn activity: Post created"*, boosting sprout growth.

#### 5B: Receiving a Like (`POST_LIKED`)
1. Leave Sprouts open on your phone.
2. From another account (or Django shell), like one of your posts:
   ```python
   from sprouts.activity import enqueue_activity
   enqueue_activity(user, "POST_LIKED")
   ```
3. **Result within 30s:** In-game notification appears and sprout happiness increases.

#### 5C: Leaving & Receiving Comments
1. Leaving a comment triggers `COMMENT_CREATED` (boosts sprout kindness).
2. Receiving a comment on your post triggers `POSITIVE_COMMENT_RECEIVED` (boosts sprout happiness).

---

### USE CASE 6 — Visiting a Friend's Cottage ✅
**Goal:** Verify entering a mutual friend's cottage displays their real saved furniture layout.

**Steps:**
1. Have a mutual Kawn friend purchase a cottage decoration in Sprouts.
2. In your Sprouts village map, walk to your friend's cottage door and enter.

**Expected Results:**
- You see their custom furniture placements rendered in their dollhouse room.
- Attempting to access `GET /sprouts/friends/<id>/cottage/` for a non-friend returns `403 Forbidden`.

---

### USE CASE 7 — Offline Resilience & Reconnection ✅
**Goal:** Verify the game works smoothly offline and syncs automatically when Wi-Fi is restored.

**Steps:**
1. Open Sprouts inside Flutter.
2. Turn on **Airplane Mode** on your phone.
3. Continue playing (water sprout, move decorations).
4. Turn **Airplane Mode OFF**.
5. Wait 10 seconds.

**Expected Results:**
- Game operates without crashing while offline (saving to local storage).
- Upon reconnecting, offline changes are automatically pushed (`PUT /sprouts/state/`) to Django DB without data loss.

---

## 🚦 Sanity Checklist Before Git Push

| # | Use Case | Local Test Pass | Production Test Pass |
|---|---|---|---|
| 1 | Real Identity & Friends | [ ] | [ ] |
| 2 | Backend DB State Sync | [ ] | [ ] |
| 3 | Cross-Device Sync | [ ] | [ ] |
| 4 | Daily Login Reward & Dedup | [ ] | [ ] |
| 5A | Post Created Reward | [ ] | [ ] |
| 5B | Like Received Reward | [ ] | [ ] |
| 5C | Comment Rewards | [ ] | [ ] |
| 6 | Friend Cottage View | [ ] | [ ] |
| 7 | Offline Resilience & Reconnect | [ ] | [ ] |
