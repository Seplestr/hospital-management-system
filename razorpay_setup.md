# 💳 Connecting Razorpay Sandbox Integration for Free

This guide outlines how to register a free developer account on Razorpay and connect actual sandbox API credentials to test real checkouts.

---

## 🛠️ Step-by-Step Configuration

### Step 1: Sign Up on Razorpay (100% Free)
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) and sign up for a new account.
2. You do **not** need a corporate business or any official merchant documentation for developer testing. You can complete signup using your email.
3. No billing details or credit cards are required to access the developer environment.

---

### Step 2: Toggle to "Test Mode"
Once logged in, verify you are in **Test Mode** (Sandbox):
* Check the top-right header area in your Razorpay Dashboard. 
* There is a toggle switch labeled **Live / Test**. Ensure it is switched to **Test Mode**. (Test Mode uses fake play-money and is completely free of charge).

---

### Step 3: Generate Free API Credentials
1. In the left-side navigation sidebar, scroll down to **Account & Settings**.
2. Under the *Website Suite / Developer Settings* section, click on **API Keys**.
3. Click the blue **"Generate Test Key"** button.
4. You will immediately see a popup showing two credentials:
   * **Key ID** (starts with `rzp_test_...`)
   * **Key Secret**
5. Save or download these keys before closing the popup, as you won't be able to view the Key Secret again.

---

### Step 4: Configure your Environment Variables
1. Open your project's environmental configuration file:
   [**`.env`** (click to open)](file:///c:/Users/RAJESH%20PANDEY/Documents/CRT/Hospital%20Management%20System/.env)
2. Locate the Razorpay variables (lines 11-12) and swap out the placeholder values with your real test keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_SECRET=yourKeySecretHere
   ```

---

### Step 5: Restart the System
To reload the environmental variables, restart your docker containers:
1. In your Docker terminal, press **`Ctrl + C`** to stop execution.
2. Boot the microservices back up:
   ```bash
   docker compose up --build
   ```

🎉 **Congratulations!** When you open `http://localhost:5173` and click **"Buy"** in the Stock Directory, the real, secure **Razorpay Checkout Modal** will slide down in sandbox mode, allowing you to test credit card formats, fake UPI, and net banking transactions for free!
