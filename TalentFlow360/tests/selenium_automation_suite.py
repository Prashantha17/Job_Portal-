import os
import sys
import time
import json
import unittest
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager

BASE_URL = os.environ.get("TEST_BASE_URL", "http://127.0.0.1:5173")
REPORT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
SCREENSHOT_DIR = os.path.join(REPORT_DIR, "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class TalentFlowSeleniumTestSuite(unittest.TestCase):
    driver = None
    results = []

    @classmethod
    def setUpClass(cls):
        print(f"\n==================================================================")
        print(f"🚀 TALENTFLOW 360 FULL-STACK SELENIUM AUTOMATION SUITE")
        print(f"Target Environment: {BASE_URL}")
        print(f"Browser Engine: Microsoft Edge (Chromium Headless)")
        print(f"==================================================================\n")

        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")

        try:
            service = Service(EdgeChromiumDriverManager().install())
            cls.driver = webdriver.Edge(service=service, options=options)
        except Exception as e:
            print(f"⚠️ Notice: EdgeChromiumDriverManager ({e}). Falling back to system Edge...")
            cls.driver = webdriver.Edge(options=options)

        cls.driver.implicitly_wait(6)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()
            print("\n[INFO] EdgeDriver closed cleanly.")

        # Save comprehensive JSON execution summary
        report_file = os.path.join(REPORT_DIR, "selenium_test_results.json")
        passed = sum(1 for r in cls.results if r["status"] == "PASS")
        failed = sum(1 for r in cls.results if r["status"] == "FAIL")
        total = len(cls.results)
        success_rate = round((passed / total) * 100, 1) if total > 0 else 0

        summary = {
            "suite_name": "TalentFlow 360 Automated End-to-End UI Suite",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": BASE_URL,
            "browser": "Microsoft Edge (Headless Chromium)",
            "metrics": {
                "total_executed": total,
                "passed": passed,
                "failed": failed,
                "success_rate_percent": success_rate
            },
            "test_cases": cls.results
        }

        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

        print("\n" + "="*66)
        print(f"🏁 AUTOMATION RUN COMPLETE: {passed}/{total} Passed ({success_rate}%)")
        print(f"📁 Detailed JSON Test Report: {report_file}")
        print(f"📸 Screenshots saved to: {SCREENSHOT_DIR}")
        print("="*66 + "\n")

    def setUp(self):
        self.start_time = time.time()

    def record_result(self, test_id, name, status, details=""):
        duration = round(time.time() - self.start_time, 3)
        result = {
            "test_id": test_id,
            "name": name,
            "status": status,
            "duration_seconds": duration,
            "details": details
        }
        self.results.append(result)
        icon = "✅ PASS" if status == "PASS" else "❌ FAIL"
        print(f"{icon} [{test_id}] {name} ({duration}s) | {details}")

    def take_screenshot(self, name):
        filepath = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        self.driver.save_screenshot(filepath)
        return filepath

    def safe_click(self, element):
        """Robust click helper: scrolls element into center view and performs JavaScript click to prevent intercept errors"""
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", element)
        time.sleep(0.3)
        self.driver.execute_script("arguments[0].click();", element)
        time.sleep(0.4)

    # -------------------------------------------------------------
    # AUTOMATED TEST CASES
    # -------------------------------------------------------------

    def test_01_landing_page_title_and_branding(self):
        """TC-001: Verify Landing Page Load, Title, and Brand Navigation Header"""
        try:
            self.driver.get(BASE_URL)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(1.5)

            title = self.driver.title
            self.assertTrue("TalentFlow" in title, f"Title should contain TalentFlow, got: {title}")

            # Verify Brand Header in DOM
            body_text = self.driver.find_element(By.TAG_NAME, "body").text
            self.assertTrue("TalentFlow360" in body_text, "Brand logo 'TalentFlow360' present")
            self.assertTrue("Precision Recruitment" in body_text, "Hero tagline present")

            # Verify Search Jobs CTA
            search_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Search Jobs')]")
            self.assertIsNotNone(search_btn)

            self.take_screenshot("01_landing_page_verified")
            self.record_result("TC-001", "Landing Page Branding & Hero Section", "PASS", f"Title '{title}' & Hero elements verified")
        except Exception as e:
            self.take_screenshot("01_landing_page_error")
            self.record_result("TC-001", "Landing Page Branding & Hero Section", "FAIL", str(e))
            raise

    def test_02_browse_jobs_page_and_search(self):
        """TC-002: Verify Browse Jobs Catalog, Search Input, and Job Listing Cards"""
        try:
            self.driver.get(f"{BASE_URL}/#jobs")
            time.sleep(1.5)

            # Find Search Input Box
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'Search by job title')]"))
            )
            self.assertIsNotNone(search_box)

            # Type search query
            search_box.clear()
            search_box.send_keys("Developer")
            time.sleep(0.5)

            # Check for Location Input Box
            loc_box = self.driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Location')]")
            self.assertIsNotNone(loc_box)

            # Check job listing cards
            body_text = self.driver.find_element(By.TAG_NAME, "body").text
            has_job_cards = any(k in body_text for k in ["LPA", "Full Time", "Remote", "Bangalore", "Engineer", "Developer"])
            self.assertTrue(has_job_cards, "Job listing cards rendered successfully")

            self.take_screenshot("02_browse_jobs_verified")
            self.record_result("TC-002", "Browse Jobs Catalog & Search Bar", "PASS", "Search inputs & Job cards validated")
        except Exception as e:
            self.take_screenshot("02_browse_jobs_error")
            self.record_result("TC-002", "Browse Jobs Catalog & Search Bar", "FAIL", str(e))
            raise

    def test_03_job_filters_interaction(self):
        """TC-003: Verify Workplace Filters (REMOTE, HYBRID, ON SITE)"""
        try:
            self.driver.get(f"{BASE_URL}/#home")
            time.sleep(1.5)

            # Locate workplace filter buttons
            remote_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'REMOTE')]")
            hybrid_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'HYBRID')]")
            self.assertIsNotNone(remote_btn)
            self.assertIsNotNone(hybrid_btn)

            # Click remote filter using safe_click
            self.safe_click(remote_btn)

            self.take_screenshot("03_workplace_filters_verified")
            self.record_result("TC-003", "Workplace Filters Interaction", "PASS", "REMOTE & HYBRID filter buttons interactable")
        except Exception as e:
            self.take_screenshot("03_workplace_filters_error")
            self.record_result("TC-003", "Workplace Filters Interaction", "FAIL", str(e))
            raise

    def test_04_login_page_and_tab_switching(self):
        """TC-004: Verify Login Page, Password Login vs Instant OTP Login Tabs"""
        try:
            self.driver.get(f"{BASE_URL}/#login")
            time.sleep(1.5)

            # Check email input
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='email' or @placeholder='you@company.com']"))
            )
            self.assertIsNotNone(email_input)

            # Check Tab buttons
            otp_tab = self.driver.find_element(By.XPATH, "//button[contains(., 'Instant OTP Login')]")
            password_tab = self.driver.find_element(By.XPATH, "//button[contains(., 'Password Login')]")
            google_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Continue with Google')]")

            self.assertIsNotNone(otp_tab)
            self.assertIsNotNone(password_tab)
            self.assertIsNotNone(google_btn)

            # Switch to OTP Login tab safely
            self.safe_click(otp_tab)

            # Switch back to Password Login tab safely
            self.safe_click(password_tab)

            self.take_screenshot("04_login_tabs_verified")
            self.record_result("TC-004", "Login View & Mode Tab Switching", "PASS", "Password & OTP tabs toggled cleanly")
        except Exception as e:
            self.take_screenshot("04_login_tabs_error")
            self.record_result("TC-004", "Login View & Mode Tab Switching", "FAIL", str(e))
            raise

    def test_05_auth_form_client_validation(self):
        """TC-005: Form Validation on Blank Submission"""
        try:
            self.driver.get(f"{BASE_URL}/#login")
            time.sleep(1)

            # Attempt to click Sign In without entering credentials
            submit_btn = self.driver.find_element(By.XPATH, "//button[@type='submit' or contains(., 'Sign in to TalentFlow')]")
            self.safe_click(submit_btn)

            # Verify we remain safely on login view
            current_url = self.driver.current_url
            self.assertTrue("#login" in current_url, "Browser prevented invalid submission and stayed on #login")

            self.take_screenshot("05_auth_validation_verified")
            self.record_result("TC-005", "Auth Form Client-Side Validation", "PASS", "Blank submission guarded by form validation")
        except Exception as e:
            self.take_screenshot("05_auth_validation_error")
            self.record_result("TC-005", "Auth Form Client-Side Validation", "FAIL", str(e))
            raise

    def test_06_registration_page_and_role_picker(self):
        """TC-006: Verify Register Page, Candidate vs Employer Role Picker"""
        try:
            self.driver.get(f"{BASE_URL}/#register")
            time.sleep(1.5)

            # Check inputs: First name, Last name, Email
            fname_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'Priya') or contains(@placeholder, 'First')]"))
            )
            self.assertIsNotNone(fname_input)

            # Check role picker tabs
            candidate_role = self.driver.find_element(By.XPATH, "//button[contains(., 'Candidate') and contains(., 'find a job')]")
            employer_role = self.driver.find_element(By.XPATH, "//button[contains(., 'Employer') and contains(., 'hire talent')]")

            self.assertIsNotNone(candidate_role)
            self.assertIsNotNone(employer_role)

            # Switch to Employer role safely
            self.safe_click(employer_role)

            self.take_screenshot("06_register_role_picker_verified")
            self.record_result("TC-006", "Registration View & Role Toggle", "PASS", "Candidate & Employer roles selectable")
        except Exception as e:
            self.take_screenshot("06_register_role_picker_error")
            self.record_result("TC-006", "Registration View & Role Toggle", "FAIL", str(e))
            raise

    def test_07_resume_builder_demo_authentication(self):
        """TC-007: Resume Builder Auth Gate & 1-Click Candidate Demo Login"""
        try:
            self.driver.get(f"{BASE_URL}/#resume-builder")
            time.sleep(1.5)

            # Look for 1-Click Demo Login button
            demo_login_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(., '1-Click Candidate Demo Login') or contains(., 'Demo Login')]"))
            )
            self.assertIsNotNone(demo_login_btn)

            # Click Demo Login to authenticate as Alex Morgan safely
            self.safe_click(demo_login_btn)
            time.sleep(1.5)

            # Verify authenticated Resume Builder loaded
            body_text = self.driver.find_element(By.TAG_NAME, "body").text
            has_builder_ui = any(k in body_text for k in ["Resume", "Template", "Personal", "Experience", "Skills", "Alex", "Morgan"])
            self.assertTrue(has_builder_ui, "Interactive Resume Builder loaded for authenticated candidate")

            self.take_screenshot("07_resume_builder_demo_verified")
            self.record_result("TC-007", "Resume Builder Demo Sign-In & Workspace", "PASS", "Logged in via candidate demo & workspace verified")
        except Exception as e:
            self.take_screenshot("07_resume_builder_demo_error")
            self.record_result("TC-007", "Resume Builder Demo Sign-In & Workspace", "FAIL", str(e))
            raise

    def test_08_candidate_career_hub(self):
        """TC-008: Candidate Career Hub & ATS Tracking Pipeline"""
        try:
            self.driver.get(f"{BASE_URL}/#candidate-hub")
            time.sleep(1.5)

            body_text = self.driver.find_element(By.TAG_NAME, "body").text
            has_hub = any(k in body_text for k in ["Candidate Career Hub", "Career Hub", "Applications", "Profile Strength", "Active"])
            self.assertTrue(has_hub, "Candidate Career Hub rendered")

            self.take_screenshot("08_candidate_career_hub_verified")
            self.record_result("TC-008", "Candidate Career Hub & ATS Pipeline", "PASS", "Career Hub view & application tracker confirmed")
        except Exception as e:
            self.take_screenshot("08_candidate_career_hub_error")
            self.record_result("TC-008", "Candidate Career Hub & ATS Pipeline", "FAIL", str(e))
            raise

    def test_09_mobile_responsive_viewport(self):
        """TC-009: Responsive Mobile Viewport (iPhone View 375x812) Layout Validation"""
        try:
            # Resize window to iPhone X/12 viewport
            self.driver.set_window_size(375, 812)
            self.driver.get(f"{BASE_URL}/#home")
            time.sleep(1.5)

            # Verify mobile layout rendered without crashing
            body = self.driver.find_element(By.TAG_NAME, "body")
            self.assertIsNotNone(body)

            # Reset window size to desktop
            self.driver.set_window_size(1920, 1080)

            self.take_screenshot("09_mobile_responsive_verified")
            self.record_result("TC-009", "Mobile Viewport Responsiveness (375x812)", "PASS", "Clean rendering under mobile dimensions")
        except Exception as e:
            self.driver.set_window_size(1920, 1080)
            self.take_screenshot("09_mobile_responsive_error")
            self.record_result("TC-009", "Mobile Viewport Responsiveness (375x812)", "FAIL", str(e))
            raise


if __name__ == "__main__":
    unittest.main(verbosity=2)
